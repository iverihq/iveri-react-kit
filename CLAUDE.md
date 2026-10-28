# @iveri/react-kit — repo rules

## ⚠ It must not depend on `@iveri/contracts` (2026-10-24)

It did, at `^0.9.0`, as a plain **dependency** — and **never imported it anywhere**. The only
reference in the whole repository was its own `package.json`.

Two problems, and the second is the one that bit:

1. An unused dependency, which is its own small cost.
2. **Every consumer installed a second, stale copy of the fleet's contract catalogue underneath
   it.** `pnpm ls @iveri/contracts --depth 2` in `conduit-admin-web` showed `0.31.0` at the top
   level and `0.9.0` under the kit — twenty-two minors behind, in all six panels.

That is exactly the trap the workspace guide records for `@iveri/nest-sdk`, which fixed it at
0.14.0 by making contracts a **peer**. Here the right fix is narrower: remove it, because nothing
needs it. Should this package ever use a contract type, it goes in `peerDependencies` and the
consumer's own direct dependency satisfies it — never as a plain dependency.

**Check `pnpm ls @iveri/contracts --depth 2` in a consumer after any release here.** One copy at
the top level and nothing nested is correct.

## ⚠ It **does** depend on `@iveri/tokens`, and that is not a contradiction (2026-10-28)

The rule above is about a dependency the package **never imports**, which is what made every
consumer install a second stale copy underneath it for nothing. `@iveri/tokens` is different in
exactly the way that matters: `tailwind-preset.cjs` requires it at config-load time, so it has to
resolve from here, and no panel imports it — there is no direct copy for a nested one to drift
against.

It is a plain **dependency**, not a peer, for that reason. The day a panel imports it directly,
check `pnpm ls @iveri/tokens --depth 2` in that panel and move it to `peerDependencies` if a
nested copy appears.

**The preset derives its colour names from the package**, so a token added there becomes a
utility here with no edit at all — and `design-foundation.spec.ts` then fails until
`styles/tokens.css` declares its value. The two halves of a token can no longer be added one at a
time, which is how `--color-faint` came to be declared as a third text level while carrying the
second's value.

**`styles/tokens.css` is still hand-written**, and the spec asserts every value matches the
package. Generating it was considered and declined: that file is mostly reasoning —
`color-scheme`, the font imports, the scrollbar, `::selection`, reduced motion — and a generator
would have to template all of it to keep eight comments. The spec is what the three
hand-maintained copies of this palette never had.
