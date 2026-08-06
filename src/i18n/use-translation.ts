import { useContext } from 'react';

import { LocaleContext, type LocaleContextValue } from './locale.context';

/**
 * The active locale and a `t` bound to it.
 *
 * Throws outside a `LocaleProvider` rather than degrading, because the degraded behaviour — every
 * label rendering as its own key — looks like a translation problem and is a wiring problem.
 */
export function useTranslation(): LocaleContextValue {
    const context = useContext(LocaleContext);

    if (!context) {
        throw new Error('useTranslation was called outside a LocaleProvider.');
    }

    return context;
}
