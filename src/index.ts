/**
 * `@iveri/react-kit` — intentionally empty.
 *
 * It gets filled at build-order step 7, from the components `conduit-admin-web` actually
 * needed, rather than from a component library designed up front. A shared kit built before
 * its first consumer ends up being a set of guesses that the first real app has to work
 * around.
 *
 * The package exists now so the npm name is claimed and every app can depend on it from its
 * first commit without a later rename.
 *
 * A component moves in here on its **second** consumer, not its first.
 */
export {};
