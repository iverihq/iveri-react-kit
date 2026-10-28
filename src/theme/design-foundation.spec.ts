import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

import { color, duration, easing, productColor, radius, toRgbChannels } from '@iveri/tokens';
import { describe, expect, it } from 'vitest';

import preset from '../../tailwind-preset.cjs';

/**
 * The foundation's two halves have to agree, and nothing else checks that they do.
 *
 * Both defects these pin shipped and sat in all six panels for months, and both are the same
 * shape the fleet keeps meeting: **a declaration is not evidence that the thing it names
 * exists.** `tailwind.config.ts` named `Inter` while nothing anywhere loaded it, so every panel
 * rendered in whatever UI font the operating system supplies; and `--color-faint` was declared
 * as a third text level while carrying the same value as `--color-muted`, so the hierarchy the
 * standard describes was two levels wearing three names.
 *
 * Neither is visible to `tsc`, to the linter, or in review: a utility class for a colour with no
 * custom property compiles to `rgb(var(--color-nothing))`, which the browser drops, leaving the
 * inherited colour — and inherited is usually close enough to look deliberate.
 */
const tokensCss = readFileSync(resolve(import.meta.dirname, '../../styles/tokens.css'), 'utf8');
const declared = new Set([...tokensCss.matchAll(/^\s*(--[a-z0-9-]+):/gmu)].map((match) => match[1]));

function colourVariablesUsedBy(theme: Record<string, string>): string[] {
    return Object.values(theme).flatMap((value) => [...value.matchAll(/var\((--[a-z0-9-]+)\)/gu)].map((m) => m[1]));
}

describe('design foundation', () => {
    const colors = preset.theme!.extend!.colors as Record<string, string>;

    it('declares a value for every colour the preset maps', () => {
        const missing = colourVariablesUsedBy(colors).filter((name) => !declared.has(name));

        expect(missing).toEqual([]);
    });

    it('declares a value for every shadow, easing and duration the preset maps', () => {
        const mapped = {
            ...(preset.theme!.extend!.boxShadow as Record<string, string>),
            ...(preset.theme!.extend!.transitionTimingFunction as Record<string, string>),
            ...(preset.theme!.extend!.transitionDuration as Record<string, string>),
        };

        expect(colourVariablesUsedBy(mapped).filter((name) => !declared.has(name))).toEqual([]);
    });

    it('keeps the three text levels three different colours', () => {
        // `faint` existed as a name and not as a level: every app set it to `muted`'s value, so
        // metadata and supporting copy were the same grey and the distinction was decorative.
        const levels = ['--color-ink', '--color-ink-soft', '--color-muted', '--color-faint'].map((name) => {
            const match = new RegExp(`${name}:\\s*([^;]+);`, 'u').exec(tokensCss);
            return match?.[1]?.trim();
        });

        expect(levels.every((value) => value !== undefined)).toBe(true);
        expect(new Set(levels).size).toBe(levels.length);
    });

    it('keeps info distinct from the accent', () => {
        // They were the same navy in four of the six apps, which made an info badge and an
        // accent badge the same badge — two meanings, one appearance.
        const read = (name: string) => new RegExp(`${name}:\\s*([^;]+);`, 'u').exec(tokensCss)?.[1]?.trim();

        expect(read('--color-info')).not.toBe(read('--color-accent'));
    });

    it('installs every font package the stylesheet imports', () => {
        // The defect this exists for: a font named in the theme and loaded by nothing. An
        // `@import` of a package that is not a dependency fails at build time in a consumer
        // rather than here, so the check belongs where the import is written.
        const require = createRequire(import.meta.url);
        const imported = [...tokensCss.matchAll(/@import '(@[^/]+\/[^/']+)[^']*'/gu)].map((match) => match[1]);

        expect(imported.length).toBeGreaterThan(0);
        for (const packageName of new Set(imported)) {
            expect(() => require.resolve(`${packageName}/package.json`), packageName).not.toThrow();
        }
    });

    it('covers Georgian, which Inter does not', () => {
        // Inter ships latin, latin-ext, cyrillic, greek and vietnamese — and no Georgian block.
        // English and Russian render in it; Georgian silently falls through, and the fleet ships
        // all three languages. So a Georgian-capable family in the stack is a requirement, not a
        // nicety, and an "upgrade" that drops it breaks one language in three.
        const fonts = preset.theme!.extend!.fontFamily as Record<string, string[]>;

        for (const key of ['sans', 'display']) {
            expect(fonts[key], key).toContain('Noto Sans Georgian');
        }
    });

    it('tells a browser the products are light-only', () => {
        // Without this a native control — a checkbox, a radio, a select's dropdown list, a date
        // picker, the caret — is painted in the *operating system's* palette, so a machine in
        // dark mode renders dark controls on an entirely light page. A bare checkbox came out as
        // a filled black square in three panels. It is invisible to anyone working in light
        // mode, which is why it shipped.
        expect(tokensCss).toMatch(/^\s*color-scheme:\s*light;/mu);
        // `light dark` would leave the controls dark and the page light, since there is no dark
        // theme to switch to.
        expect(tokensCss).not.toContain('color-scheme: light dark');
    });

    it('asks every panel for the same type scale, including the display cut', () => {
        const fonts = preset.theme!.extend!.fontFamily as Record<string, string[]>;
        const sizes = preset.theme!.extend!.fontSize as Record<string, unknown>;

        expect(fonts.display?.[0]).toBe('Inter Tight Variable');
        for (const step of ['caption', 'small', 'label', 'body', 'h3', 'h2', 'h1', 'display']) {
            expect(sizes, step).toHaveProperty(step);
        }
    });
    it('declares exactly the value @iveri/tokens holds, for every colour', () => {
        // ⚠ **This is the check three repositories could not perform.** The palette lived in
        // this stylesheet, in `storefront-app/src/lib/theme.ts` and in `taxi-mobile`'s — each
        // with a spec, and each spec saying in its own comment that it could not see drift
        // against the others. With one package there is something to compare against.
        const kebab = (name: string): string => name.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`);
        const declaredValue = (name: string): string | undefined =>
            new RegExp(`--color-${name}:\\s*([^;]+);`, 'u').exec(tokensCss)?.[1]?.trim();

        const wrong: string[] = [];
        for (const [name, hex] of Object.entries({ ...color, ...productColor })) {
            const expected = toRgbChannels(hex);
            const actual = declaredValue(kebab(name));
            if (actual !== expected) wrong.push(`--color-${kebab(name)}: ${actual ?? 'missing'} (want ${expected})`);
        }

        expect(wrong).toEqual([]);
    });

    it('carries the product voice, so the two product apps stop writing hex inline', () => {
        // Twenty-five inline hex literals across `taxi-web` and `delivery-web`, eight distinct
        // values, including a near-miss of `accent-soft` one part in 255 out.
        const colors = preset.theme!.extend!.colors as Record<string, string>;

        for (const name of ['hero', 'gold', 'gold-line', 'gold-hover']) {
            expect(colors, name).toHaveProperty(name);
        }
    });

    it('takes its radii and durations from the package rather than restating them', () => {
        const radii = preset.theme!.extend!.borderRadius as Record<string, string>;

        expect(radii).toEqual({
            control: `${radius.control / 16}rem`,
            card: `${radius.card / 16}rem`,
            panel: `${radius.panel / 16}rem`,
        });
        expect(tokensCss).toContain(`--duration-fast: ${duration.fast}ms`);
        expect(tokensCss).toContain(`--duration-normal: ${duration.normal}ms`);
        expect(tokensCss).toContain(`--duration-slow: ${duration.slow}ms`);
        expect(tokensCss).toContain(`--ease-standard: ${easing.standard}`);
    });
});
