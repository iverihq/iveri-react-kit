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

## `/licence`: the one entry point that reads a contract type (2026-11-18)

`@iveri/react-kit/licence` carries `LicenceBadge`, `LicencePanel` and `licenceStanding`, for the ten product
backoffices: each shows a company's licence for its product in the companies list and on the company's page. **Nine
had written it nine times**, under five file names, and had drifted: some showed seats and some did not, none said a
licence was about to end. Billing's `LicenceStatus` decides the words, so this is where the rule above applies:
`@iveri/contracts` is a **peer**, optional, and only this entry point imports it — `verify-package.mjs` proving
`dist/index.js` loads without it is what keeps the root free of it. A consumer that imports `/licence` already depends
on contracts directly, which satisfies the peer; `pnpm ls @iveri/contracts --depth 2` must still show one copy.

- **Strings are `web-shell`'s `shell.licence.*`**, like the password-reset forms: ten backoffices saying the same five
  states in three languages is thirty chances to read differently.
- **"Ending" is the one thing it adds to billing's status**: a live licence within 30 days of its last day, the same
  window `iveri-backoffice-web` marks. Only a live licence is green; ending and ended are amber and told apart by their
  words; cancelled is grey, a decision rather than a failure. Days are UTC calendar days, formatted in UTC.
- **It only shows.** A licence is changed in `iveri-backoffice-web`; `LicencePanel`'s `actions` slot is where an app
  puts the link there.

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

## `RouteMap` is its own entry point (2026-11-10)

`@iveri/react-kit/map`, for the same reason the SDK keeps `/storage` apart: `maplibre-gl` is an optional peer,
so the root barrel must never reach it, and `verify-package.mjs` proving `dist/index.js` loads is what would
catch one that did. The library and its stylesheet are imported when the component mounts, so an app pays for
the map only on the screens that have one.

The style URL is the caller's, and an app with none configured should not render this at all. Which provider
serves a deployment is a decision about cost and terms, not about this component.

## The two shells are their own entry point (2026-11-10)

`@iveri/react-kit/shell` carries `AdminShell` and `ProductShell`, apart from the root for the same reason as
`/map`: `react-router` is an optional peer, and `verify-package.mjs` proving `dist/index.js` loads is what would catch
the root reaching it. **All five admin panels had hand-built a sidebar and they had drifted**, which is the
second-consumer rule met five times over.

**A shell reads its own labels from the `web-shell` namespace**, unlike every root component, which takes translated
props. Eight labels through seven apps is fifty-six lines of plumbing that could only ever be wrong, and every app
using a shell already pulls that namespace. A missing key renders as the key, which is visible.

**Navy reaches an admin screen in exactly one place, the sidebar.** The working surface stays white, as the standard
asks; the frame is what makes a panel recognisable.

**The command palette needs no server.** It lists the panel's destinations and whatever `commands` the panel passes.
Searching a panel's _data_ is that panel's own screen.

## Charts have no library (2026-11-10)

`BarChart`, `Sparkline`, `Meter` and `StackedBar` are flexbox and one small SVG. A dashboard here plots one measure over
some days, and a charting package for that is a bundle, a licence and an upgrade. Each keeps its values reachable
without hovering, through a screen-reader table or a legend in words.

## A phone's bar holds five, and More holds the rest (2026-11-12)

`ProductShell` drew every destination along the bottom, so six of `hr-web`'s cut Georgian labels to stubs at 375 wide.
Past five it keeps four and gathers the rest under **More**, a sheet above the bar that closes on Escape, on a tap
outside it and on going anywhere. Its open state is the page it was opened on rather than a flag an effect resets.
Labels take two lines instead of an ellipsis, and the tabs are top-aligned so a two-line label does not lift its icon.
`?shell` in the gallery draws the frame with the fleet's longest labels.

## A row of tabs that does not fit scrolls quietly (2026-11-12)

`Tabs` hides its scrollbar, fades whichever edge has more beyond it, and scrolls the selected tab into the row. Four
Georgian tabs overflow a phone, and a tab opened from a link was otherwise off the screen with only a grey scrollbar
saying anything was there. The row moves by `scrollLeft`, never `scrollIntoView`, which would scroll the page too.

## A phone's bar says a short word, and the laptop bar starts at `lg` (2026-11-12)

`ShellNavItem.shortLabel` is what the bottom bar shows where the label is longer than a fifth of a phone (67 pixels of
text at 375 wide): `განვითარება` measured 77 and broke into two lines that read as two words. The full label stays
everywhere else, More included. The laptop bar takes over at `lg` rather than `md`, because six Georgian labels at
800 wide pushed the whole page sideways; above `lg` the bar scrolls quietly rather than do that.

`Tabs` scrolls the selected tab into the row again whenever a tab changes size, because a tab grows when its font
arrives, after the first layout, and the row's own box does not change when it does.

## A long label wraps; nothing in a shell is cut with an ellipsis (2026-11-18)

Long Georgian and Russian navigation labels, product names and people's names were cut with `truncate` in
`AdminShell`'s sidebar, its header and the account button. A Georgian word cut short reads as a different word, so they
now wrap between words through `LONG_WORDS` (`component/long-words.ts`): `overflow-wrap: break-word` plus
`hyphens: auto`, so a single word wider than its line is hyphenated where the browser knows the language rather than
spilling out. Where height is fixed (the 64-pixel header, the account button, a phone tab) a label takes two lines and
carries its full text in `title`. The phone tabs used `overflow-wrap: anywhere`, which broke a word that fit; they take
`LONG_WORDS` too, and a label that needs more still wants a `shortLabel`. `?shell=admin` in the gallery draws the admin
frame with the fleet's longest labels, and a spec refuses `truncate` anywhere in the shell.

`PasswordResetRequestForm` says `shell.password-reset.request.intro-email-only` where the app passes `tenantSlug` and the
workspace field is hidden: the plain intro asked for a workspace the page did not show.

## Rows of buttons wrap at phone width (2026-11-18)

`PageHeader`'s and `Panel`'s actions and `SegmentedControl` were `shrink-0` rows that never wrapped: two Russian actions,
or four Russian segments with counts, were wider than a phone and pushed the whole page sideways (HR's people, attendance
and expenses pages at 375 wide). Each now takes `max-w-full` and `flex-wrap`, so it keeps its own line and wraps within
it. A segmented control wraps onto a second row rather than scrolling, so no option is out of sight.

## Money and usage formatting live here (2026-11-20)

`formatMoney`, `fromMinorUnits`, `toMinorUnits` and the usage-figure helpers (`src/format/`) were **copied byte for byte
into six tenant panels** and again into Conduit's two panels and Baasi's console, and `commerce-tenant-admin-web`'s copy
divided by 100 for every currency. They are in the root because they are plain `Intl` and read no contract:
`monthFigures` takes a structural `UsageMonthFigures`, so the root still loads without `@iveri/contracts`. The phone
apps keep their own copies, because this package peers on `react-dom`.

## Every dropdown draws the kit's arrow (2026-11-20)

The browser's own select arrow is a few pixels wide and sits against the right edge whatever padding the control has,
so every dropdown in every app looked wrong, and differently per platform. `styles/theme.css` ends with one
**unlayered** rule for `select:not([multiple], [size])`: `appearance: none`, a 16-pixel chevron in `--color-muted` placed
0.75rem from the edge, and 2.5rem of right padding. Unlayered beats every Tailwind layer, so a hand-written select's
`px-3` cannot put text under the arrow, and it reaches all 34 web apps through the theme rather than through
`SelectField`. Only the background longhands are set, so a control keeps its own background colour. The chevron's colour
is written into the data URI (a URI cannot read a custom property); `design-foundation.spec.ts` keeps it the token's.

## A map's controls speak the page's language (2026-11-21)

MapLibre names its canvas, its zoom buttons and its attribution toggle in English unless it is given a `locale`, so a
Russian or Georgian page announced "Map", "Zoom in" and "Toggle attribution" to a screen reader. `RouteMap` now reads
those names from `web-shell`'s `shell.map.*` (`map-control-labels.ts`), like the shells, so an app gets them by pulling
`web-shell` with no code. That means **`RouteMap` needs a `LocaleProvider` above it**, as the shells do. A key the
catalogue lacks is left out rather than rendered as itself: these are accessible names nobody sees, so a raw key would
only ever reach a screen reader, and MapLibre's English is the better fallback. MapLibre reads its labels only when the
map is created, so changing the language rebuilds the map.

## `StatusSteps` is a row only where it fits (2026-11-26)

Each step's label had an equal share of the row and is never broken inside a word, so at a phone's card width taxi's
"მოსვლა", delivery's "ჩაბარება", the shop's "დადასტურდა" and Russian "Прибытие" were wider than their share and ran
into the next label (measured in taxi-web at 375: up to 28 pixels over). Below a **32rem container** the steps now stand
in a column, mark beside label, with the connector running down; from 32rem they are the row they always were. A
container query, not a screen breakpoint, because one screen holds the steps both full width and in a narrow card.
restaurant-web drew its own vertical `OrderProgress` for the same collision and can come back to this. The gallery's
Progress section draws both forms with the fleet's longest labels.

## The top bar's page name is never broken inside a word (2026-11-27, 0.30.2)

`AdminShell`'s top bar names the page beside the panel's own controls, which at 375 wide leaves about a hundred pixels:
restaurant's "შეტყობინებები" and "შეთავაზებები" were broken across two lines by `LONG_WORDS`, and Georgian has no
hyphenation dictionary, so they read as two words each. The page name now wraps only between words
(`overflow-wrap: normal`) and is **hidden while its longest word does not fit** (`invisible`, so it keeps its box and can
be measured; `aria-hidden` while hidden), reappearing when the bar widens. On a phone every panel page draws its own
heading just below, so nothing is lost. The sidebar and the account button keep `LONG_WORDS`: they have the room to wrap
a long name, and hiding a name there would hide where a person is. A check for this must compare a label's line count
with its word count; a word split across lines does not overflow.

**The section gives way first (0.30.3).** From `sm` the bar also names the page's section before a chevron, and at
1024 with the sidebar open the two shared about 170 pixels, so "შეტყობინებები" was still hidden. The section shrinks
before the page name (`shrink-[100]`), is set between words only too, and is hidden with its chevron once its longest
word no longer fits. The sidebar already marks the section from `lg` up, so the page's name is the one to keep.

## `/theme-check`: a class the theme does not define renders nothing (2026-11-28)

Tailwind 4 compiles a utility only when its value exists, and **drops an unknown one silently**. localization-backoffice-web's
errors rendered black because they were `text-danger` and `text-warning`; a sweep of all 35 web apps found the same in three
more (`text-primary`, `bg-danger/5`, `text-caution-ink`, `text-critical-ink`, `text-brass`, and a type size `text-h4`).
`findUnknownThemeClasses` is the check, in its own entry point because it is test tooling and no component reaches it. Every
app calls it from one spec over `import.meta.glob(…, { query: '?raw' })` (README), passing its `index.css` so its own
`@theme` names count. **The stylesheet is read with `readFileSync`**: Vitest returns any CSS import empty, `?raw` too, which
social-web's spec caught (its `shadow-soft` and `sun-soft` read as unknown). The names come from `src/theme-check/theme-names.ts`, **generated by `pnpm theme`** with
`tokens.css` (colours from `@iveri/tokens`, sizes and shadows read from `styles/theme.css`) and held to it by the same
`--check`, so a token added there is known here with no second edit.

- **It reads string literals, not the whole file**, through a small scanner that skips comments. A string of several
  tokens, or one written straight into `className=`, is a class list and every colour in it is checked. **A lone string
  elsewhere is checked only when it names something colour-like** (`danger`, `primary`, a Tailwind hue, or a theme colour
  with a suffix such as `caution-ink`), because `'to-write'` and `'text-after-quote'` are values in the code, and
  `from-`/`via-`/`to-` are also English.
- **`white`, `black`, `transparent` and `current` are accepted**: they are Tailwind's own and the kit's danger button is
  `bg-critical text-white`. There is no `*-ink` token for a filled status colour; white is that ink.
- **A class built at run time (`` `text-${tone}` ``) cannot be checked.** None exists in the fleet; keep it that way, with a
  table of whole class names, as `Badge` does.
- The spec compiles what it accepts and reports with Tailwind, so the list and Tailwind cannot disagree unnoticed, and
  runs the check over the kit's own components.
