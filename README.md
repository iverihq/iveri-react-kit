# @iveri/react-kit

The Iveri design foundation and the shared React primitives every panel is built from.

## Entry points

```text
@iveri/react-kit                  the components and the i18n runtime
@iveri/react-kit/styles.css       the typefaces, the semantic tokens and the base layer
@iveri/react-kit/tailwind-preset  the Tailwind theme: colours, type scale, radii, shadows, motion
```

It depends on `@iveri/contracts` **never** — see `CLAUDE.md` for why that is a rule rather than
a coincidence — and on `@iveri/nest-sdk` never. Its only runtime dependencies are the three
self-hosted font packages the stylesheet imports and `intl-messageformat`.

## Adopting it in an app

Two lines of config and one import. The stylesheet has to come before the app's own CSS, because
it declares the custom properties the Tailwind theme resolves against.

```ts
// tailwind.config.ts
import preset from '@iveri/react-kit/tailwind-preset';

export default {
    presets: [preset],
    content: ['./index.html', './src/**/*.{ts,tsx}', './node_modules/@iveri/react-kit/dist/**/*.js'],
} satisfies Config;
```

```ts
// src/main.tsx
import '@iveri/react-kit/styles.css';
import './index.css';
```

Scanning `@iveri/react-kit/dist/**/*.js` is not optional: these primitives are styled with
utility classes, so without it Tailwind emits none of them and every shared button arrives
unstyled — which is how `delivery-web` once shipped visibly broken controls.

## The foundation

### Typefaces are loaded, which they were not

Every panel's theme named `Inter` and **nothing anywhere loaded it** — no `@font-face`, no
Google Fonts link, no `@fontsource` package — so each one rendered in whatever UI font the
operating system supplies, differently on every machine, and the whole type scale in
`design-system/design.md` described a face the product had never once displayed.

They are **self-hosted** rather than fetched from a CDN: a font request to a third party happens
on every page load, fails with the laptop offline, and is a question we would rather not have to
answer for an EU customer.

⚠ **`Inter` carries no Georgian.** It ships latin, latin-ext, cyrillic, greek and vietnamese, so
English and Russian render in it and Georgian silently falls through — and the fleet ships all
three languages. `Noto Sans Georgian` is in both font stacks for that reason, and a spec asserts
it, because an "upgrade" that tidies the stack would break one language in three.

`font-display` is a tighter cut of the same family, for headings only. A tighter cut rather than
a second voice, which is what keeps a display face out of an ordinary product screen.

### Tokens are declared once

Each app used to carry its own copy of the token block, which had already drifted into **four
variants** — two with a different accent, and all six with `--color-faint` set to `--color-muted`'s
value, so the three text levels the standard describes were two wearing three names. `--color-info`
equalled `--color-accent` in four of them, which made an info badge and an accent badge the same
badge.

`src/theme/design-foundation.spec.ts` pins all of it: every colour, shadow, easing and duration the
preset maps has a declared value; the text levels are four different colours; `info` is not the
accent; every imported font package is installed; and Georgian is covered. None of that is visible
to `tsc` — a utility class for an undeclared colour compiles to `rgb(var(--color-nothing))`, which
the browser drops, leaving the inherited colour, and inherited is usually close enough to look
deliberate.

### Beauty here is craft, not decoration

`design.md` forbids gradient backgrounds, glass cards, hero type in product screens and heavy
animation, and this foundation honours all of it. What it spends instead: real loaded type with
optical tracking at display sizes, a two-layer ink-tinted elevation scale, a genuine three-level
text hierarchy, tabular figures in every data column, and one motion scale so a 150ms hover never
sits beside a 300ms one.

The one gradient in the system is `Skeleton`'s sweep, which is a loading affordance rather than
decoration — and a sweep is used rather than a pulse because a pulsing block and a disabled block
look alike.

**There is no dark theme.** The token contract would carry one, but shipping `prefers-color-scheme`
across six panels nobody has reviewed in dark is how a product ships broken. It wants a pass of its
own.

## Components

```text
Avatar  Badge  Button  CheckboxField  EmptyState  Field  PageHeader  Panel  SegmentedControl
SelectField  Skeleton  SkeletonText  Spinner  StatCard  Table  TextAreaField  TextField
initialsOf  cn  FOCUS_RING
```

`Table` is deliberately **compositional** — `Table`, `TableHead`, `TableBody`, `TableRow`,
`TableHeaderCell`, `TableCell` — rather than a column-config component, so a page adopts it one
table at a time. A config-driven table would mean rewriting every page that has one before any of
it could ship.

Three rules the components encode, each with a spec:

- **A status badge always renders its label**, so the dot is an accelerator for scanning a column
  and never the signal itself.
- **`StatCard` colours a delta by whether the metric improved**, not by which way it points. The
  caller passes `isGoodWhen`, because an up arrow on a failure count coloured green is worse than
  no colour at all.
- **`SegmentedControl` is a radio group**, so arrow keys move through it and a screen reader
  announces the position — behaviour a row of buttons does not have and would have to fake.

## Verifying a release

`pnpm build` runs `scripts/verify-package.mjs`, which loads every JavaScript entry point under
**Node** rather than a bundler, checks each path in `exports` exists and is covered by `files`,
and resolves every font the stylesheet imports. Two shipped defects had that shape — a directory
import this package could not load outside Vite, and `@iveri/nest-sdk@0.22.0` being unloadable for
ten of twelve services — and neither was visible to `tsc`.

## i18n

The runtime half of Iveri localization. The strings come from `iveri-localization-api`, but **not
at runtime**: a build-time script pulls one bundle per namespace per locale from a published
release and writes a catalogue into the repo, and this reads that. An app that fetched its own
labels would put a network call in front of first paint, make the localization service a hard
dependency of a panel that is otherwise happy while it is down, and render empty strings when it is
not.

```tsx
import { LocaleProvider, LocaleSelect, useTranslation } from '@iveri/react-kit';

import catalog from './i18n/catalog.json';

<LocaleProvider catalog={catalog} storageKey="unibox-web.locale">
    <App />
</LocaleProvider>;

const { t } = useTranslation();
t('nav.inbox');
t('inbox.unread', { count: 3 });
```

Three behaviours worth knowing:

- **A missing key falls back to the source locale and is formatted _as_ the source locale.** The
  two differ exactly there, and formatting English text under Georgian plural rules takes branches
  the author never wrote — the same bug `iveri-localization-api` shipped once on its own side.
- **An undefined key renders as the key itself**, so a gap is visible on screen and greppable in
  the repo. An empty string renders a blank button that reads as a layout bug.
- **`useTranslation` throws outside a `LocaleProvider`** rather than degrading, because the
  degraded behaviour — every label rendering as its key — looks like a translation problem and is a
  wiring problem.
