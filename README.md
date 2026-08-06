# @iveri/react-kit

Shared React primitives for Iveri admin apps, extracted from the working Conduit panel and
used by the Unibox frontend.

## Current exports

```text
common/      cn
component/   Button, Badge, TextField, TextAreaField, SelectField, CheckboxField, Panel, EmptyState, Spinner
i18n/        LocaleProvider, useTranslation, LocaleSelect, formatMessage, TranslationCatalog
```

The kit depends on `@iveri/contracts` and never on `@iveri/nest-sdk`.

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
