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

## `@iveri/tokens` is a **build-time** dependency since 0.9.0 (2026-11-06)

Until 0.8.0 it was a runtime dependency, because `tailwind-preset.cjs` required it when a
consumer's Tailwind config loaded. Tailwind 4 has no preset: the theme is CSS, and its values are
generated into `styles/tokens.css` by `scripts/build-theme.mjs`, committed, and published. Nothing
in the published package loads `@iveri/tokens` any more, so it is a **devDependency** — and no
consumer installs it through the kit.

**`pnpm build` fails when `styles/tokens.css` is not what the package generates**
(`build-theme.mjs --check`), and `design-foundation.spec.ts` runs the same check. A token added to
`@iveri/tokens` therefore reaches this repo only through `pnpm theme` and a commit, never by
somebody retyping a value.

### Generating it reverses a recorded decision, and the reason no longer holds

0.6–0.8 kept the stylesheet hand-written because "that file is mostly reasoning — `color-scheme`,
the font imports, the scrollbar, `::selection`, reduced motion — and a generator would have to
template all of it." True of one file. 0.9.0 splits it in two: `styles/theme.css` holds every
sentence and is hand-written; `styles/tokens.css` holds values only and is generated. There is
nothing left to template.

### Tailwind 4 changed defaults the panels depend on, and the theme puts three back

An uncoloured `border` is `currentColor` in Tailwind 4, which turns every input ink-dark; the
theme's base layer makes it `line`. A button loses the pointer cursor; the base layer restores
it. `rounded-sm` is 4px now; the kit's 2px is `rounded-xs`. **Do not run `@tailwindcss/upgrade`'s
shadow renames here** — `shadow-sm`…`xl` are the kit's own values, not Tailwind's scale.

These were found by diffing every element's computed style in the component gallery under
Tailwind 3 and Tailwind 4: after the three fixes, the only differences left are notation
(`color-mix()` computes to `oklab()`), the default border moving from Tailwind's gray-200 to our
near-identical `line`, and `divide-y` drawing each divider as a bottom border instead of a top one.
