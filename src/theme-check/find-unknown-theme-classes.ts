import { THEME_COLOURS, THEME_SHADOWS, THEME_TEXT_SIZES } from './theme-names.js';

/** One utility class that names a colour (or a type size) the theme does not define. */
export interface UnknownThemeClass {
    readonly file: string;
    readonly line: number;
    readonly className: string;
}

export interface FindUnknownThemeClassesOptions {
    /**
     * The app's own stylesheets as text, so a colour, type size or shadow it adds in its own `@theme`
     * (`--color-brass`, `--shadow-soft`) counts as defined. Pass `src/index.css`, and any stylesheet
     * it imports that declares names, such as `@iveri/chat-kit/web.css`.
     */
    readonly css?: readonly string[];
}

/** Colours Tailwind itself provides that the kit relies on: the kit's own danger button is `bg-critical text-white`. */
const KEYWORD_COLOURS = ['current', 'transparent', 'inherit', 'white', 'black'];

/** Tailwind's own type sizes, which the theme keeps. */
const TAILWIND_TEXT_SIZES = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl', '7xl', '8xl', '9xl'];

/** Tailwind's own shadows, which the theme keeps beside its four. */
const TAILWIND_SHADOWS = ['2xs', 'xs', '2xl', 'none', 'inner'];

/**
 * The values each prefix takes that are not colours. Anything else after the prefix is read as a
 * colour, and has to be one the theme defines.
 */
const BORDER_VALUES = /^(?:\d+|px|solid|dashed|dotted|double|hidden|none|collapse|separate|spacing(?:-.*)?)$/u;
const NON_COLOUR: Readonly<Partial<Record<string, RegExp>>> = {
    text: /^(?:left|center|right|justify|start|end|wrap|nowrap|balance|pretty|ellipsis|clip)$/u,
    bg: /^(?:fixed|local|scroll|clip-.*|origin-.*|no-repeat|repeat.*|cover|contain|auto|center|top|bottom|left|right|(?:left|right)-(?:top|bottom)|none|gradient-to-.*|linear-.*|radial.*|conic.*|blend-.*|position-.*|size-.*)$/u,
    border: BORDER_VALUES,
    ring: /^(?:\d+|px|inset)$/u,
    'ring-offset': /^(?:\d+|px)$/u,
    'inset-ring': /^(?:\d+|px)$/u,
    outline: /^(?:\d+|px|none|hidden|dashed|dotted|double|solid|offset-.*)$/u,
    fill: /^none$/u,
    stroke: /^(?:\d+|none)$/u,
    divide: /^(?:x|y|x-\d+|y-\d+|x-reverse|y-reverse|solid|dashed|dotted|double|none)$/u,
    from: /^\d+%$/u,
    via: /^(?:\d+%|none)$/u,
    to: /^\d+%$/u,
    decoration: /^(?:solid|double|dotted|dashed|wavy|\d+|auto|from-font|clone|slice)$/u,
    accent: /^auto$/u,
    'inset-shadow': /^(?:2xs|xs|sm|none)$/u,
    'drop-shadow': /^(?:xs|sm|md|lg|[2-9]?xl|none)$/u,
};

const PREFIXES = [
    'text',
    'bg',
    'border',
    ...['x', 'y', 't', 'r', 'b', 'l', 's', 'e'].map((side) => `border-${side}`),
    'ring',
    'ring-offset',
    'inset-ring',
    'outline',
    'fill',
    'stroke',
    'divide',
    'from',
    'via',
    'to',
    'placeholder',
    'decoration',
    'accent',
    'caret',
    'shadow',
    'inset-shadow',
    'drop-shadow',
].sort((left, right) => right.length - left.length);

/**
 * Words that only ever name a colour. A lone string such as `'to-write'` or `'text-after-quote'` is
 * a value in the code, not a class, so a string holding one token is checked only when that token
 * names something colour-like — which is exactly the shape of the defects this exists for
 * (`text-danger`, `bg-primary/10`, `text-caution-ink`).
 */
const COLOUR_WORDS = [
    'primary',
    'secondary',
    'tertiary',
    'danger',
    'warning',
    'success',
    'error',
    'brand',
    'neutral',
    'slate',
    'gray',
    'grey',
    'zinc',
    'stone',
    'red',
    'orange',
    'amber',
    'yellow',
    'lime',
    'green',
    'emerald',
    'teal',
    'cyan',
    'sky',
    'blue',
    'indigo',
    'violet',
    'purple',
    'fuchsia',
    'pink',
    'rose',
];

const namesIn = (css: readonly string[], namespace: string): string[] =>
    css.flatMap((text) =>
        [...text.matchAll(new RegExp(`--${namespace}-([a-z0-9]+(?:-[a-z0-9]+)*)\\s*:`, 'gu'))].map(([, name]) => name),
    );

interface StringLiteral {
    readonly text: string;
    readonly line: number;
    /** Written straight into a `className` or `class` attribute, so whatever it holds is a class. */
    readonly isClassAttribute: boolean;
}

/**
 * Every string literal in a source file, with the line it starts on. A small scanner rather than a
 * regular expression, so a comment's apostrophe is not read as a string and a class written in a
 * comment is not checked.
 */
const stringLiterals = (source: string): StringLiteral[] => {
    const literals: StringLiteral[] = [];
    let line = 1;
    let index = 0;

    while (index < source.length) {
        const char = source[index];
        const next = source[index + 1];

        if (char === '\n') {
            line += 1;
            index += 1;
        } else if (char === '/' && next === '/') {
            while (index < source.length && source[index] !== '\n') index += 1;
        } else if (char === '/' && next === '*') {
            const end = source.indexOf('*/', index + 2);
            const stop = end === -1 ? source.length : end + 2;
            line += source.slice(index, stop).split('\n').length - 1;
            index = stop;
        } else if (char === "'" || char === '"' || char === '`') {
            const startLine = line;
            const isClassAttribute = /\bclass(?:Name)?=\{?\s*$/u.test(source.slice(Math.max(0, index - 16), index));
            let text = '';
            index += 1;
            while (index < source.length && source[index] !== char) {
                if (source[index] === '\\') {
                    text += ' ';
                    index += 2;
                    continue;
                }
                if (source[index] === '\n') {
                    if (char !== '`') break;
                    line += 1;
                }
                text += source[index];
                index += 1;
            }
            index += 1;
            // A template's interpolations are code, not classes.
            literals.push({
                text: char === '`' ? text.replaceAll(/\$\{[^}]*\}/gu, ' ') : text,
                line: startLine,
                isClassAttribute,
            });
        } else {
            index += 1;
        }
    }

    return literals;
};

/** `md:hover:!-bg-danger/40` → `bg-danger`: variants, `!`, `-` and the opacity modifier removed. */
const utilityOf = (token: string): string => {
    let depth = 0;
    let start = 0;
    for (let index = 0; index < token.length; index += 1) {
        if (token[index] === '[') depth += 1;
        else if (token[index] === ']') depth -= 1;
        else if (token[index] === ':' && depth === 0) start = index + 1;
    }

    return token
        .slice(start)
        .replace(/^[!-]+/u, '')
        .replace(/!$/u, '')
        .replace(/\/[^/]*$/u, '');
};

/**
 * Finds utility classes naming a colour — or, for `text-*`, a type size — that neither the kit's
 * theme nor the app's own stylesheets define.
 *
 * **Tailwind drops such a class without a word**: `text-danger` compiles to nothing, so an error
 * line renders in the inherited colour and every file still looks right. Pass every source file of
 * the app, as Vite's `import.meta.glob(…, { query: '?raw', import: 'default', eager: true })` returns
 * them, and expect the result to be empty.
 */
export const findUnknownThemeClasses = (
    sources: Readonly<Record<string, string>>,
    options: FindUnknownThemeClassesOptions = {},
): UnknownThemeClass[] => {
    const css = options.css ?? [];
    const colours = new Set([...THEME_COLOURS, ...KEYWORD_COLOURS, ...namesIn(css, 'color')]);
    const textSizes = new Set([...THEME_TEXT_SIZES, ...TAILWIND_TEXT_SIZES, ...namesIn(css, 'text')]);
    const shadows = new Set([...THEME_SHADOWS, ...TAILWIND_SHADOWS, ...namesIn(css, 'shadow')]);

    const isUnknown = (utility: string, isClassList: boolean): boolean => {
        if (PREFIXES.includes(utility)) return false;
        const prefix = PREFIXES.find((candidate) => utility.startsWith(`${candidate}-`));
        if (prefix === undefined) return false;

        const value = utility.slice(prefix.length + 1);
        if (value === '' || value.startsWith('[') || value.startsWith('(')) return false;
        if (prefix === 'text' && textSizes.has(value)) return false;
        if (prefix === 'shadow' && shadows.has(value)) return false;
        if (NON_COLOUR[prefix.startsWith('border') ? 'border' : prefix]?.test(value) === true) return false;
        if (colours.has(value)) return false;

        // A lone value such as 'to-write' is not a class; only a colour-like word makes it one.
        if (!isClassList) {
            const stem = value.split('-')[0] ?? '';
            return COLOUR_WORDS.includes(stem) || [...colours].some((colour) => value.startsWith(`${colour}-`));
        }
        // `from-`, `via-` and `to-` are also ordinary English, so only a colour-like word counts there too.
        if (prefix === 'from' || prefix === 'via' || prefix === 'to') {
            return COLOUR_WORDS.includes(value.split('-')[0] ?? '');
        }

        return true;
    };

    return Object.entries(sources).flatMap(([file, source]) =>
        stringLiterals(source).flatMap(({ text, line, isClassAttribute }) => {
            const tokens = text.split(/\s+/u).filter((token) => token !== '');
            const isClassList = isClassAttribute || tokens.length > 1;

            return tokens
                .filter((token) => /^[!-]?[\w[\]&>:@/.%!-]+$/u.test(token) && isUnknown(utilityOf(token), isClassList))
                .map((className) => ({ file, line, className }));
        }),
    );
};
