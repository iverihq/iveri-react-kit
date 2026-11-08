# @iveri/react-kit

The Iveri design foundation and the shared React primitives every panel is built from.

## Entry points

```text
@iveri/react-kit            the components and the i18n runtime, as native ES modules
@iveri/react-kit/theme.css  the Tailwind 4 theme: typefaces, tokens, type scale, elevation,
                            motion and the base layer
```

It depends on `@iveri/contracts` **never** — see `CLAUDE.md` for why that is a rule rather than
a coincidence — and on `@iveri/nest-sdk` never. Its only runtime dependencies are the three
self-hosted font packages the theme imports and `intl-messageformat`. React 19 is the peer.

## Adopting it in an app

Tailwind 4 through its Vite plugin, and two lines of CSS:

```css
/* src/index.css */
@import 'tailwindcss';
@import '@iveri/react-kit/theme.css';
```

```ts
// vite.config.ts
plugins: [react(), tailwindcss()],
```

No `tailwind.config`, no PostCSS config, no `content` list. The theme declares
`@source '../dist'` relative to itself, so Tailwind scans the kit's components wherever the
package is installed — without that every shared button would arrive unstyled, which is how
`delivery-web` once shipped visibly broken controls.

### What changed from 0.8 (Tailwind 3)

- `./styles.css` and `./tailwind-preset` are gone; `./theme.css` replaces both.
- Colours are hex. An opacity modifier (`bg-accent/10`) is built with `color-mix()`, so
  hand-written CSS reads `var(--color-accent)`, never `rgb(var(--color-accent))`.
- Tailwind 4 changed three defaults the kit puts back for every app: an uncoloured `border` is
  `line` (not `currentColor`), a button has the pointer cursor, and `rounded-sm` is now
  `rounded-xs` (2px). Tailwind 4's `outline-none` no longer hides an outline only visually; the
  kit uses `outline-hidden`.
- `shadow-sm`…`xl` are the kit's own, as before, so **do not accept `@tailwindcss/upgrade`'s
  rename of `shadow-sm` to `shadow-xs`** — that rename is for Tailwind's default scale.

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

`src/theme/design-foundation.spec.ts` pins all of it: every colour the package holds is declared;
the text levels are four different colours; `info` is not the accent; every imported font package
is installed; and Georgian is covered. `src/theme/theme-compile.spec.ts` then **compiles the theme
with Tailwind 4** and asks for every utility the kit promises — a background, text and border class
for every colour, the radii, durations, easings, type scale, shadows and animations — because a
variable that is declared is not evidence of a class that is generated: Tailwind 4 reads
durations from `--transition-duration-*`, and a theme spelling them the Tailwind 3 way declares a
value and generates nothing.

**The values come from `@iveri/tokens`**, which is also what the Expo apps read. Those apps used to
hold a hand-maintained copy of this palette — three copies in all, each with a spec, and each spec
saying in its own comment that it could not see drift against the others.

**`styles/tokens.css` is generated** by `scripts/build-theme.mjs` (`pnpm theme`), and `pnpm build`
fails when the committed file is not what the package generates. 0.8.0 declined to generate the
stylesheet because it was mostly reasoning; the reasoning now lives in the hand-written
`styles/theme.css`, so the generated half holds values only and there is nothing to template.

### The product voice is eight more tokens

`hero`, `hero-ink`, `hero-critical`, `gold`, `gold-hover`, `gold-line`, `gold-soft`, `gold-ink`.
Taxi, Delivery and the shop open on a navy card with a gold rule; an admin console does not, which
is why they are a separate export in `@iveri/tokens` and why no panel should reach for them.

`taxi-web` and `delivery-web` wrote all eight as inline hex — twenty-five occurrences between
them, including a hero navy **three parts in 255** from the deep navy the palette already had and
a **one-part** near-miss of `accent-soft` used for the selected navigation item, while all four
admin panels had moved onto the real token.

### Beauty here is craft, not decoration

`design.md` forbids gradient backgrounds, glass cards, hero type in product screens and heavy
animation, and this foundation honours all of it. What it spends instead: real loaded type with
optical tracking at display sizes, a two-layer ink-tinted elevation scale, a genuine four-level
text hierarchy, tabular figures in every data column, and one motion scale so a 150ms hover never
sits beside a 300ms one.

**The radii, the elevation names and the motion scale are the standard's own**, by its own names
— `design-system/tokens.json`. The first version of this preset invented 10px, 14px, 180ms and
260ms where the standard already said 12px, 16px, 200ms and 320ms, which is a declaration
disagreeing with the thing it describes: the exact defect the rest of this foundation exists to
fix. A spec pins them, and says it cannot read that file, so a change has to be made in both
places deliberately.

The one gradient in the system is `Skeleton`'s sweep, which is a loading affordance rather than
decoration — and a sweep is used rather than a pulse because a pulsing block and a disabled block
look alike.

**There is no dark theme.** The token contract would carry one, but shipping `prefers-color-scheme`
across six panels nobody has reviewed in dark is how a product ships broken. It wants a pass of its
own.

⚠ **Which is why `:root` declares `color-scheme: light`.** A browser paints every control the page
does not draw itself — a checkbox, a radio, a `<select>`'s dropdown list, a date picker, the caret,
the autofill wash — in the **operating system's** palette unless told otherwise. On a machine in
dark mode that is a dark control on an entirely light page, and a bare checkbox renders as a filled
black square. All six panels had it, in three of them on a visible control; it is invisible to
anyone working in light mode, which is why it shipped. The gallery carries a deliberately unstyled
checkbox so the base layer is proved rather than assumed.

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

## Session refresh

`createSessionRefresh` builds the one function an app refreshes its session through, and
`withTabLock` keeps two tabs from doing it at once. **Every API client in an app must share the
one function.** Identity treats a rotated refresh token presented again as a leak and revokes every
token the person holds, so a guard kept per client signs an operator out when a page calls two
services at the same moment.

```ts
const refreshSession = createSessionRefresh<AuthTokens>({
    withLock: withTabLock,
    readTokens: () => tokenStore.reload()?.tokens ?? null,
    exchange: (refreshToken) => identityClient.post('/auth/refresh', { refreshToken }, { anonymous: true }),
    saveTokens: (tokens) => tokenStore.setTokens(tokens),
});
```

`readTokens` must return what shared storage holds now rather than a copy from before the lock.

## Verifying a release

`pnpm build` checks `styles/tokens.css` against `@iveri/tokens`, then `scripts/verify-package.mjs`
loads `dist/index.js` under **Node**, imported and required, rather than under a bundler; checks
each path in `exports` exists and is covered by `files`; resolves every font the theme imports;
and confirms the stylesheet the theme imports is published.

Two shipped defects had that shape and neither was visible to `tsc`: a directory import this
package could not load outside Vite, and a Tailwind 3 preset published with only an `import`
condition while Tailwind loaded it through `require`. The package now compiles under `nodenext`,
so the first is a compile error, and the second cannot recur because there is no preset.

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
