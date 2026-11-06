// @vitest-environment node
import { resolve } from 'node:path';

import { color, duration, productColor, radius } from '@iveri/tokens';
import { compile } from '@tailwindcss/node';
import { beforeAll, describe, expect, it } from 'vitest';

/**
 * Compiles the theme exactly as an app's Tailwind entry does, and asks for the utilities the kit
 * promises.
 *
 * Reading the CSS proves a variable is declared; only compiling proves Tailwind turns it into the
 * class a component writes. A namespace spelled the way Tailwind 3 spelled it — durations were
 * `--duration-*` there and are `--transition-duration-*` here — declares a value and generates
 * nothing, and the component then renders with no transition while every file looks right.
 */
const kebab = (name: string): string => name.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`);

/** The rules Tailwind generates for `candidates`, keyed by the class each one is for. */
let build: (candidates: string[]) => string;

beforeAll(async () => {
    const compiler = await compile(`@import 'tailwindcss';\n@import './styles/theme.css';\n`, {
        base: resolve(import.meta.dirname, '../..'),
        onDependency: () => undefined,
    });
    build = (candidates) => compiler.build(candidates);
});

/** The declaration block Tailwind emitted for one utility class, or `undefined` for none. */
const ruleFor = (css: string, className: string): string | undefined => {
    const selector = `.${className.replaceAll('/', '\\/')} {`;
    const start = css.indexOf(selector);

    return start === -1 ? undefined : css.slice(start, css.indexOf('}', start) + 1);
};

describe('the theme, compiled by Tailwind 4', () => {
    it('generates a background, text and border utility for every colour token', () => {
        const names = Object.keys({ ...color, ...productColor }).map(kebab);
        const candidates = names.flatMap((name) => [`bg-${name}`, `text-${name}`, `border-${name}`]);
        const css = build(candidates);

        expect(candidates.filter((candidate) => ruleFor(css, candidate) === undefined)).toEqual([]);
        expect(ruleFor(css, 'bg-accent')).toContain('background-color: var(--color-accent)');
    });

    it('builds an opacity modifier from a hex token', () => {
        expect(ruleFor(build(['bg-accent/10']), 'bg-accent/10')).toContain('color-mix(');
    });

    it('generates the radius, duration and easing utilities by their token names', () => {
        const candidates = [
            ...Object.keys(radius).map((name) => `rounded-${kebab(name)}`),
            ...Object.keys(duration).map((name) => `duration-${kebab(name)}`),
            'ease-standard',
            'ease-out-quint',
        ];
        const css = build(candidates);

        expect(candidates.filter((candidate) => ruleFor(css, candidate) === undefined)).toEqual([]);
        expect(ruleFor(css, 'duration-fast')).toContain('var(--transition-duration-fast)');
    });

    it('generates the type scale with its line heights, and both families', () => {
        const css = build(['text-caption', 'text-h1', 'font-display', 'font-sans']);

        expect(ruleFor(css, 'text-h1')).toContain('var(--text-h1--letter-spacing)');
        expect(ruleFor(css, 'font-display')).toContain('var(--font-display)');
    });

    it("uses the kit's elevation rather than Tailwind's", () => {
        const css = build(['shadow-md', 'shadow-inset']);

        // Tailwind inlines a shadow into the rule, so the value itself is what to look for: the
        // kit's two-layer ink-tinted one, not Tailwind's own `shadow-md`.
        expect(ruleFor(css, 'shadow-md')).toContain('0 4px 12px -2px');
        expect(ruleFor(css, 'shadow-inset')).toBeDefined();
    });

    it('generates the entrance animations', () => {
        const css = build(['animate-rise-in', 'animate-shimmer']);

        expect(ruleFor(css, 'animate-rise-in')).toContain('var(--animate-rise-in)');
        expect(css).toContain('@keyframes rise-in');
    });

    it('emits every token as a custom property even when no utility uses it', () => {
        // `@theme static`: hand-written CSS in an app reads `var(--color-gold-soft)` directly.
        expect(build([])).toContain('--color-gold-soft: #fff2d6');
    });

    it('draws an uncoloured border in `line`, not in the text colour', () => {
        expect(build([])).toMatch(/border-color:\s*var\(--color-line\)/u);
    });
});
