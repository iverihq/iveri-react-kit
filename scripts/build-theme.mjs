/**
 * Writes `styles/tokens.css` from `@iveri/tokens`. With `--check` it writes nothing and fails when
 * the committed file differs from what it would write, which is how `pnpm build` and CI keep the
 * two from drifting.
 *
 * Only values are generated: every colour, radius, easing and duration, as Tailwind theme
 * variables. Everything that needs a sentence lives in the hand-written `styles/theme.css`, which
 * is what makes generating this half free — 0.8.0 declined to generate the stylesheet because it
 * was mostly reasoning, and the reasoning is no longer in the file being generated.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { color, duration, easing, productColor, radius } from '@iveri/tokens';

const TARGET = resolve(import.meta.dirname, '../styles/tokens.css');

/** `lineStrong` → `line-strong`, the spelling both a custom property and a utility class want. */
const kebab = (name) => name.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`);

const block = (entries) => entries.map(([name, value]) => `    ${name}: ${value};`).join('\n');

const css = `/* Generated from @iveri/tokens by scripts/build-theme.mjs. Do not edit: run \`pnpm theme\`. */

/* \`static\`, so every token is a custom property in every app — hand-written CSS reads them by
 * name, and Tailwind would otherwise emit only the ones some utility happens to use. */
@theme static {
${block(Object.entries({ ...color, ...productColor }).map(([name, hex]) => [`--color-${kebab(name)}`, hex.toLowerCase()]))}

${block(Object.entries(radius).map(([name, pixels]) => [`--radius-${kebab(name)}`, `${pixels / 16}rem`]))}

${block(Object.entries(easing).map(([name, curve]) => [`--ease-${kebab(name)}`, curve]))}

${block(Object.entries(duration).map(([name, milliseconds]) => [`--duration-${kebab(name)}`, `${milliseconds}ms`]))}

    /* Tailwind's \`duration-*\` utilities read this namespace; \`--duration-*\` is the public name. */
${block(Object.keys(duration).map((name) => [`--transition-duration-${kebab(name)}`, `var(--duration-${kebab(name)})`]))}
}
`;

if (process.argv.includes('--check')) {
    if (readFileSync(TARGET, 'utf8') !== css) {
        console.error('styles/tokens.css is not what @iveri/tokens generates — run `pnpm theme` and commit it.');
        process.exit(1);
    }
    console.log('@iveri/react-kit: styles/tokens.css matches @iveri/tokens');
} else {
    writeFileSync(TARGET, css);
    console.log('@iveri/react-kit: wrote styles/tokens.css from @iveri/tokens');
}
