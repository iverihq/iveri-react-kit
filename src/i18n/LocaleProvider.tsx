import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';

import { formatMessage } from './format-message';
import { LocaleContext, type LocaleContextValue } from './locale.context';
import type { TranslationCatalog, TranslationValues } from './translation-catalog.type';

interface LocaleProviderProps {
    /** The committed catalogue, pulled from published releases at build time. */
    catalog: TranslationCatalog;

    /** Used when nothing is stored and the browser asks for a language we do not have. */
    initialLocale?: string;

    /**
     * `localStorage` key the chosen locale is remembered under. Omit to keep the choice for the
     * lifetime of the page — which is the right default for an embedded surface, and the wrong one
     * for a panel someone works in all day.
     */
    storageKey?: string;

    children: ReactNode;
}

const readStoredLocale = (storageKey: string | undefined, known: Set<string>): string | null => {
    if (!storageKey || typeof window === 'undefined') return null;

    try {
        const stored = window.localStorage.getItem(storageKey);

        // A stored locale that is no longer in the catalogue is discarded rather than honoured:
        // a language removed from the product must not survive in one person's browser.
        return stored && known.has(stored) ? stored : null;
    } catch {
        // Storage can be unavailable (private mode, a blocked origin). Not remembering a language
        // is a small loss; failing to render the app over it is not.
        return null;
    }
};

const readPreferredLocale = (known: Set<string>): string | null => {
    if (typeof navigator === 'undefined') return null;

    for (const candidate of navigator.languages) {
        const code = candidate.toLowerCase();
        if (known.has(code)) return code;

        // `ru-RU` should find `ru`. The reverse is not attempted: a catalogue holding only `pt-BR`
        // has not said anything about `pt`.
        const language = code.split('-')[0];
        if (language && known.has(language)) return language;
    }

    return null;
};

/**
 * Makes a committed catalogue available to `useTranslation`.
 *
 * The whole of the runtime is here: a lookup, a fallback, and an ICU format. There is no loading
 * state and nothing to await, because the strings shipped with the bundle.
 */
export function LocaleProvider({
    catalog,
    initialLocale,
    storageKey,
    children,
}: Readonly<LocaleProviderProps>): JSX.Element {
    const known = useMemo(() => new Set(catalog.locales.map((locale) => locale.code)), [catalog]);

    const [locale, setLocaleState] = useState<string>(
        () =>
            readStoredLocale(storageKey, known) ??
            (initialLocale && known.has(initialLocale) ? initialLocale : null) ??
            readPreferredLocale(known) ??
            catalog.sourceLocale,
    );

    const setLocale = useCallback(
        (next: string) => {
            if (!known.has(next)) return;

            setLocaleState(next);

            if (!storageKey || typeof window === 'undefined') return;
            try {
                window.localStorage.setItem(storageKey, next);
            } catch {
                // See readStoredLocale: an unavailable store costs the preference, not the render.
            }
        },
        [known, storageKey],
    );

    // Screen readers, hyphenation and `:lang()` all key off this, and a panel that switches
    // language without it is announcing Georgian text as English.
    useEffect(() => {
        if (typeof document === 'undefined') return;
        document.documentElement.lang = locale;
    }, [locale]);

    // Maps rather than the plain objects they came from, because `Record<string, T>` types a lookup
    // as always finding something and every miss here is real: an unknown locale, a key the
    // catalogue does not define. The lint that flagged the optional chaining was right.
    const dictionaries = useMemo(
        () =>
            new Map(
                Object.entries(catalog.messages).map(([code, messages]) => [code, new Map(Object.entries(messages))]),
            ),
        [catalog],
    );

    const t = useCallback(
        (key: string, values?: TranslationValues): string => {
            const active = dictionaries.get(locale)?.get(key);
            if (active !== undefined) return formatMessage(locale, active, values);

            // Formatted under the **source** locale, not the requested one. The two differ exactly
            // here, and formatting English text under Georgian rules takes plural branches the
            // author never wrote — a bug this shape already shipped once, on the server side.
            const source = dictionaries.get(catalog.sourceLocale)?.get(key);
            if (source !== undefined) return formatMessage(catalog.sourceLocale, source, values);

            // The key itself, so a gap is visible on screen and greppable in the repo. Returning an
            // empty string would render a blank button that looks like a layout bug.
            return key;
        },
        [catalog.sourceLocale, dictionaries, locale],
    );

    const value = useMemo<LocaleContextValue>(
        () => ({ locale, sourceLocale: catalog.sourceLocale, locales: catalog.locales, setLocale, t }),
        [catalog, locale, setLocale, t],
    );

    return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
