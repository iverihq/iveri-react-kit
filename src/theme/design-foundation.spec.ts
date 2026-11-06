// @vitest-environment node
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

import { color, productColor } from '@iveri/tokens';
import { describe, expect, it } from 'vitest';

/**
 * The foundation's halves have to agree, and nothing else checks that they do.
 *
 * Both defects these pin shipped and sat in all six panels for months, and both are the shape the
 * fleet keeps meeting: **a declaration is not evidence that the thing it names exists.** The theme
 * named `Inter` while nothing anywhere loaded it, so every panel rendered in whatever UI font the
 * operating system supplies; and `--color-faint` was declared as a third text level while carrying
 * the same value as `--color-muted`.
 */
const STYLES = resolve(import.meta.dirname, '../../styles');
const themeCss = readFileSync(resolve(STYLES, 'theme.css'), 'utf8');
const tokensCss = readFileSync(resolve(STYLES, 'tokens.css'), 'utf8');

const kebab = (name: string): string => name.replace(/[A-Z]/gu, (letter) => `-${letter.toLowerCase()}`);
const declared = (css: string, property: string): string | undefined =>
    new RegExp(`${property}:\\s*([^;]+);`, 'u').exec(css)?.[1]?.trim();

describe('design foundation', () => {
    it('ships exactly the tokens @iveri/tokens holds', () => {
        // The generator's own check: it exits non-zero when the committed file differs from what
        // it would write. Asserted here as well as in `build`, so a spec run catches it first.
        expect(() =>
            execFileSync(process.execPath, [resolve(import.meta.dirname, '../../scripts/build-theme.mjs'), '--check'], {
                stdio: 'pipe',
            }),
        ).not.toThrow();
    });

    it('declares every colour the package holds', () => {
        const missing = Object.keys({ ...color, ...productColor })
            .map((name) => `--color-${kebab(name)}`)
            .filter((property) => declared(tokensCss, property) === undefined);

        expect(missing).toEqual([]);
    });

    it('keeps the four text levels four different colours', () => {
        // `faint` existed as a name and not as a level: every app set it to `muted`'s value, so
        // metadata and supporting copy were the same grey and the distinction was decorative.
        const levels = ['--color-ink', '--color-ink-soft', '--color-muted', '--color-faint'].map((name) =>
            declared(tokensCss, name),
        );

        expect(levels.every((value) => value !== undefined)).toBe(true);
        expect(new Set(levels).size).toBe(levels.length);
    });

    it('keeps info distinct from the accent', () => {
        // They were the same navy in four of the six apps, which made an info badge and an accent
        // badge the same badge — two meanings, one appearance.
        expect(declared(tokensCss, '--color-info')).not.toBe(declared(tokensCss, '--color-accent'));
    });

    it('installs every font package the theme imports', () => {
        // An `@import` of a package that is not a dependency fails at build time in a consumer
        // rather than here, so the check belongs where the import is written.
        const require = createRequire(import.meta.url);
        const imported = [...themeCss.matchAll(/@import '(@[^/]+\/[^/']+)[^']*'/gu)].map((match) => match[1]);

        expect(imported.length).toBeGreaterThan(0);
        for (const packageName of new Set(imported)) {
            expect(() => require.resolve(`${packageName}/package.json`), packageName).not.toThrow();
        }
    });

    it('covers Georgian, which Inter does not', () => {
        // Inter ships latin, latin-ext, cyrillic, greek and vietnamese — and no Georgian block.
        // English and Russian render in it; Georgian silently falls through, and the fleet ships
        // all three languages. An "upgrade" that drops Noto breaks one language in three.
        for (const family of ['--font-sans', '--font-display']) {
            expect(declared(themeCss, family), family).toContain("'Noto Sans Georgian'");
        }
    });

    it('tells a browser the products are light-only', () => {
        // Without this a native control is painted in the *operating system's* palette, so a
        // machine in dark mode renders dark controls on an entirely light page.
        expect(themeCss).toMatch(/^\s*color-scheme:\s*light;/mu);
        expect(themeCss).not.toContain('color-scheme: light dark');
    });

    it('asks every panel for the same type scale, including the display cut', () => {
        expect(declared(themeCss, '--font-display')?.startsWith("'Inter Tight Variable'")).toBe(true);
        for (const step of ['caption', 'small', 'label', 'body', 'h3', 'h2', 'h1', 'display']) {
            expect(declared(themeCss, `--text-${step}`), step).toBeDefined();
        }
    });

    it('carries the product voice, so the two product apps stop writing hex inline', () => {
        // Twenty-five inline hex literals across `taxi-web` and `delivery-web`, eight distinct
        // values, including a near-miss of `accent-soft` one part in 255 out.
        for (const name of ['hero', 'gold', 'gold-line', 'gold-hover']) {
            expect(declared(tokensCss, `--color-${name}`), name).toBeDefined();
        }
    });
});
