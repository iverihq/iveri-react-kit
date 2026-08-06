/**
 * A catalogue is what an app **commits**, not what it fetches.
 *
 * `iveri-localization-api` serves one bundle per namespace per locale, and a build-time script
 * merges those into a single file in the repo. Nothing here reaches the network: a panel that
 * fetched its own labels would put a request in front of first paint, make the localization
 * service a hard dependency of apps that are otherwise happy while it is down, and render empty
 * strings when it is not. The strings were known when the app compiled.
 *
 * The versions are carried so a build can say which release it was compiled from — which is the
 * whole point of pinning one.
 */
export interface TranslationCatalog {
    /** When the bundles were pulled. Informational; a stale catalogue is still a working one. */
    generatedAt: string;

    /** The locale whose text is the specification every other locale was checked against. */
    sourceLocale: string;

    /** Every locale in the catalogue, in the order a picker should list them. */
    locales: CatalogLocale[];

    /** Locale code to a flat map of message key to ICU value. */
    messages: Record<string, Record<string, string>>;

    /** Namespace key to the release version its half of the catalogue came from. */
    versions: Record<string, number>;
}

export interface CatalogLocale {
    /** BCP-47, lowercase. */
    code: string;

    /** The language's name in English, for an interface that is not in that language. */
    englishName: string;

    /** The language's name in itself — what a picker shows, so a reader recognises their own. */
    nativeName: string;
}

/** Values substituted into an ICU message. */
export type TranslationValues = Record<string, string | number | Date | boolean>;

/** Looks up a key in the active locale and formats it. Returns the key itself if it is unknown. */
export type TranslateFunction = (key: string, values?: TranslationValues) => string;
