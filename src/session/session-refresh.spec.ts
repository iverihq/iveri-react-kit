import { describe, expect, it, vi } from 'vitest';

import { createSessionRefresh, type SessionTokens } from './session-refresh.js';

const original: SessionTokens = { accessToken: 'access-1', refreshToken: 'refresh-1' };
const rotated: SessionTokens = { accessToken: 'access-2', refreshToken: 'refresh-2' };

const withoutLock = <T>(action: () => Promise<T>): Promise<T> => action();

/** A lock that really queues, standing in for what Web Locks does across tabs. */
function queueingLock(): <T>(action: () => Promise<T>) => Promise<T> {
    let tail: Promise<unknown> = Promise.resolve();

    return <T>(action: () => Promise<T>): Promise<T> => {
        const next = tail.then(action);
        tail = next.catch(() => undefined);

        return next;
    };
}

function setup(initial: SessionTokens | null = original) {
    const store = { tokens: initial };
    const exchange = vi.fn((refreshToken: string) =>
        Promise.resolve({ accessToken: `new-for-${refreshToken}`, refreshToken: `next-${refreshToken}` }),
    );
    const refresh = createSessionRefresh({
        withLock: withoutLock,
        readTokens: () => store.tokens,
        exchange,
        saveTokens: (tokens) => {
            store.tokens = tokens;
        },
    });

    return { store, exchange, refresh };
}

describe('createSessionRefresh', () => {
    it('exchanges the stored token once however many callers ask at the same moment', async () => {
        const { exchange, refresh } = setup();

        await expect(Promise.all([refresh('access-1'), refresh('access-1'), refresh('access-1')])).resolves.toEqual([
            true,
            true,
            true,
        ]);

        expect(exchange).toHaveBeenCalledTimes(1);
        expect(exchange).toHaveBeenCalledWith('refresh-1');
    });

    it('does not exchange again for a refusal that arrives after the refresh finished', async () => {
        const { exchange, refresh } = setup();

        await refresh('access-1');

        await expect(refresh('access-1')).resolves.toBe(true);
        expect(exchange).toHaveBeenCalledTimes(1);
    });

    it('uses a token another tab already stored instead of spending the one it holds', async () => {
        const { exchange, refresh } = setup(rotated);

        await expect(refresh('access-1')).resolves.toBe(true);

        expect(exchange).not.toHaveBeenCalled();
    });

    it('rotates exactly once when two tabs queue on the same lock', async () => {
        const store = { tokens: original as SessionTokens | null };
        const exchange = vi.fn(() => Promise.resolve(rotated));
        const withLock = queueingLock();
        const tab = () =>
            createSessionRefresh({
                withLock,
                readTokens: () => store.tokens,
                exchange,
                saveTokens: (tokens) => {
                    store.tokens = tokens;
                },
            });

        await expect(Promise.all([tab()('access-1'), tab()('access-1')])).resolves.toEqual([true, true]);

        expect(exchange).toHaveBeenCalledTimes(1);
    });

    it('refreshes a token that really was refused, even after an earlier refresh', async () => {
        const { exchange, refresh, store } = setup();

        await refresh('access-1');
        await refresh(store.tokens?.accessToken ?? null);

        expect(exchange).toHaveBeenCalledTimes(2);
        expect(exchange).toHaveBeenLastCalledWith('next-refresh-1');
    });

    it('reports a signed-out session without calling identity', async () => {
        const { exchange, refresh } = setup(null);

        await expect(refresh('access-1')).resolves.toBe(false);

        expect(exchange).not.toHaveBeenCalled();
    });

    it('reports a refused exchange and tries afresh on the next call', async () => {
        const { exchange, refresh } = setup();
        exchange.mockRejectedValueOnce(new Error('refused'));

        await expect(refresh('access-1')).resolves.toBe(false);
        await expect(refresh('access-1')).resolves.toBe(true);

        expect(exchange).toHaveBeenCalledTimes(2);
    });
});
