const SESSION_LOCK_NAME = 'iveri.session-refresh';

/**
 * Runs `action` while no other tab of this origin is inside it.
 *
 * Two tabs of one panel share a refresh token through `localStorage`, so a rotation in one spends
 * the token the other still holds. The browser releases a Web Lock when its tab closes, so a tab
 * that dies mid-refresh cannot leave the others waiting.
 *
 * The API exists only in a secure context. Without it the action simply runs, which leaves a tab
 * protected against itself and no worse off against another.
 */
export function withTabLock<T>(action: () => Promise<T>): Promise<T> {
    if (!('locks' in navigator)) {
        return action();
    }

    return navigator.locks.request(SESSION_LOCK_NAME, action);
}
