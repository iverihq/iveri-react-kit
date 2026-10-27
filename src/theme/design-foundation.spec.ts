import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { resolve } from 'node:path';

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

    it('asks every panel for the same type scale, including the display cut', () => {
        const fonts = preset.theme!.extend!.fontFamily as Record<string, string[]>;
        const sizes = preset.theme!.extend!.fontSize as Record<string, unknown>;

        expect(fonts.display?.[0]).toBe('Inter Tight Variable');
        for (const step of ['caption', 'small', 'label', 'body', 'h3', 'h2', 'h1', 'display']) {
            expect(sizes, step).toHaveProperty(step);
        }
    });
});
