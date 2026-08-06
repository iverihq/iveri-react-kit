/**
 * The flag shown beside a language in the picker.
 *
 * **A language is not a country**, and the mapping below is an editorial choice rather than a
 * derivation: Russian is spoken in a dozen countries, English in more, and Georgian's flag happens
 * to be unambiguous only because one country speaks it. The alternative — no flag at all — is
 * defensible and duller; the alternative of *deriving* a country from a language subtag is neither,
 * because there is no correct answer for `en` and picking one silently is worse than picking one
 * on purpose.
 *
 * A locale carrying an explicit region (`pt-BR`) is honoured over the table, because that locale
 * has already said which country it means.
 */
const FLAG_BY_LANGUAGE = new Map<string, string>(
    Object.entries({
        en: '🇬🇧',
        ka: '🇬🇪',
        ru: '🇷🇺',
    }),
);

/** `GB` → 🇬🇧. Regional indicators sit 127397 above their ASCII letters. */
const flagFromRegion = (region: string): string =>
    String.fromCodePoint(...[...region.toUpperCase()].map((letter) => letter.charCodeAt(0) + 127_397));

/**
 * Returns the flag for a locale, or an empty string when there is no honest answer.
 *
 * Empty rather than a placeholder glyph: the native name is always rendered beside this, so a
 * missing flag costs alignment and nothing else. The same is true where the platform has no flag
 * glyphs at all — Windows renders these as the two region letters — which is why the flag is never
 * the only thing identifying an option.
 */
export const localeFlag = (code: string): string => {
    const [language, ...rest] = code.toLowerCase().split('-');
    const region = rest.find((part) => part.length === 2 && /^[a-z]{2}$/.test(part));

    if (region) return flagFromRegion(region);

    // `split` always yields at least one element, so the language subtag is always a string here.
    return FLAG_BY_LANGUAGE.get(language) ?? '';
};
