import { afterEach, describe, expect, it, vi } from 'vitest';

import { withTabLock } from './tab-lock.js';

describe('withTabLock', () => {
    afterEach(() => {
        Reflect.deleteProperty(navigator, 'locks');
    });

    it('runs the action under one lock name shared by every tab of the origin', async () => {
        const request = vi.fn((_name: string, callback: () => Promise<string>) => callback());
        Object.defineProperty(navigator, 'locks', { configurable: true, value: { request } });

        await expect(withTabLock(() => Promise.resolve('done'))).resolves.toBe('done');

        expect(request).toHaveBeenCalledWith('iveri.session-refresh', expect.any(Function));
    });

    it('still runs the action where the browser offers no locks', async () => {
        await expect(withTabLock(() => Promise.resolve('done'))).resolves.toBe('done');
    });
});
