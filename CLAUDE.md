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
