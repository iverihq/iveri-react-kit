/** The two credentials a session holds. Each app's own token type satisfies this. */
export interface SessionTokens {
    accessToken: string;
    refreshToken: string;
}

export interface SessionRefreshDependencies<TTokens extends SessionTokens> {
    /** Serializes rotation across everything holding this credential; see {@link withTabLock}. */
    withLock<T>(action: () => Promise<T>): Promise<T>;
    /** The session as shared storage has it now, never a copy read before the lock was taken. */
    readTokens(): TTokens | null;
    exchange(refreshToken: string): Promise<TTokens>;
    saveTokens(tokens: TTokens): void;
}

/**
 * Builds the one function an app refreshes its session through.
 *
 * **Every API client in the app must share the result.** Identity rotates a refresh token on use
 * and treats presenting a rotated one as a leak, revoking every token the person holds. A guard
 * kept per client lets a page that calls identity and a product API at once send the same token
 * twice, which signs an honest operator out on a plain reload.
 *
 * The returned function takes the access token the caller was refused with and resolves `true`
 * when a retry is worth making. Comparing that token is what spares a second exchange: a response
 * that arrives after a refresh finished, or a tab that lost the race for the lock, finds a newer
 * token already stored and uses it.
 */
export function createSessionRefresh<TTokens extends SessionTokens>(
    dependencies: SessionRefreshDependencies<TTokens>,
): (rejectedAccessToken: string | null) => Promise<boolean> {
    let inFlight: Promise<boolean> | null = null;

    const rotate = async (rejectedAccessToken: string | null): Promise<boolean> => {
        const tokens = dependencies.readTokens();

        if (!tokens) {
            return false;
        }

        if (tokens.accessToken !== rejectedAccessToken) {
            return true;
        }

        try {
            dependencies.saveTokens(await dependencies.exchange(tokens.refreshToken));

            return true;
        } catch {
            // The token was rotated, revoked or expired, which is a signed-out session rather
            // than an error to surface. The caller reports the 401 it already holds.
            return false;
        }
    };

    return (rejectedAccessToken) => {
        inFlight ??= dependencies
            .withLock(() => rotate(rejectedAccessToken))
            .finally(() => {
                inFlight = null;
            });

        return inFlight;
    };
}
