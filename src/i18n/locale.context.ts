import { createContext } from 'react';

import type { CatalogLocale, TranslateFunction } from './translation-catalog.type';

export interface LocaleContextValue {
    /** The locale being rendered. */
    locale: string;

    /** The locale a missing translation falls back to. */
    sourceLocale: string;

    /** Every locale the committed catalogue holds, in the order a picker should list them. */
    locales: CatalogLocale[];

    /** Switches locale. Persisted when the provider was given a storage key. */
    setLocale: (locale: string) => void;

    t: TranslateFunction;
}

/**
 * Deliberately `null` rather than a working default.
 *
 * A default context would let a component render translated text outside the provider and quietly
 * get the key back, which looks like a missing translation and is a missing provider.
 */
export const LocaleContext = createContext<LocaleContextValue | null>(null);
