// @vitest-environment node
import { resolve } from 'node:path';

import { compile } from '@tailwindcss/node';
import { beforeAll, describe, expect, it } from 'vitest';

import { findUnknownThemeClasses } from './find-unknown-theme-classes.js';
import { THEME_COLOURS } from './theme-names.js';

const found = (source: string, css?: string[]): string[] =>
    findUnknownThemeClasses({ 'src/App.tsx': source }, { css }).map(({ className }) => className);

describe('findUnknownThemeClasses', () => {
    it('reports the colours that rendered localization-backoffice-web errors black', () => {
        expect(
            found(`<p className="mt-2 text-sm text-danger">{e}</p>; <div className="bg-surface-muted p-3" />`),
        ).toEqual(['text-danger', 'bg-surface-muted']);
    });

    it('accepts every colour the theme defines, with variants, opacity and important', () => {
        const classes = THEME_COLOURS.map((name) => `md:hover:!bg-${name}/40 text-${name} border-l-${name}`).join(' ');
        expect(found(`const c = '${classes} ring-offset-surface divide-line fill-current';`)).toEqual([]);
    });

    it('keeps the values each prefix takes that are not colours', () => {
        expect(
            found(
                `'text-sm text-h1 text-center text-balance bg-cover bg-no-repeat border-2 border-t border-dashed ring-2 ` +
                    `ring-inset outline-none outline-offset-2 stroke-2 divide-y from-10% shadow-md shadow-lg drop-shadow-sm ` +
                    `bg-[url(x)] text-[13px] bg-(--x) text-white bg-black/50 bg-transparent'`,
            ),
        ).toEqual([]);
    });

    it('reports a type size the theme does not have', () => {
        expect(found(`'font-display text-h4 font-bold'`)).toEqual(['text-h4']);
    });

    it("counts the app's own @theme names as defined", () => {
        const css = '@theme { --color-brass: #a9834f; --shadow-soft: 0 1px 2px; --text-hero: 3rem; }';
        expect(found(`'text-brass shadow-soft text-hero bg-blush'`, [css])).toEqual(['bg-blush']);
    });

    it('reads a lone value as a class only when it names something colour-like', () => {
        expect(found(`type S = 'to-write' | 'text-after-quote'; const key = ['to-collect'];`)).toEqual([]);
        expect(found(`const error = 'text-danger'; const badge = 'bg-primary/10';`)).toEqual([
            'text-danger',
            'bg-primary/10',
        ]);
        expect(found(`const tone = 'text-caution-ink';`)).toEqual(['text-caution-ink']);
    });

    it('reads anything written straight into a className as a class', () => {
        expect(
            found(`<span className="text-brass">★</span>; <b className={'text-sun'} /> <i class="bg-vine" />`),
        ).toEqual(['text-brass', 'text-sun', 'bg-vine']);
    });

    it('ignores comments and template interpolations', () => {
        expect(found(`// text-danger\n/* bg-primary */\nconst c = \`p-2 \${'bg-'+tone} text-ink\`;`)).toEqual([]);
    });

    it('says where each one is', () => {
        expect(findUnknownThemeClasses({ 'a.tsx': "const a = 1;\n\nconst b = 'p-2 text-danger';" })).toEqual([
            { file: 'a.tsx', line: 3, className: 'text-danger' },
        ]);
    });
});

describe('what the check accepts, compiled by Tailwind 4', () => {
    let build: (candidates: string[]) => string;

    beforeAll(async () => {
        const compiler = await compile(`@import 'tailwindcss';\n@import './styles/theme.css';\n`, {
            base: resolve(import.meta.dirname, '../..'),
            onDependency: () => undefined,
        });
        build = (candidates) => compiler.build(candidates);
    });

    it('generates a rule for every class it accepts and none for one it reports', () => {
        const accepted = ['text-caution', 'bg-critical/5', 'text-gold-line', 'text-h3', 'shadow-inset', 'text-white'];
        const reported = ['text-danger', 'bg-primary', 'text-caution-ink', 'text-h4'];
        const css = build([...accepted, ...reported]);
        const emitted = (name: string): boolean => css.includes(`.${name.replaceAll('/', '\\/')} {`);

        expect(found(`'${accepted.join(' ')}'`)).toEqual([]);
        expect(accepted.filter((name) => !emitted(name))).toEqual([]);
        expect(found(`'${reported.join(' ')}'`)).toEqual(reported);
        expect(reported.filter(emitted)).toEqual([]);
    });
});

describe("the kit's own components", () => {
    it('use only what the theme defines', () => {
        const sources = import.meta.glob<string>(['../**/*.{ts,tsx}', '!../**/*.spec.{ts,tsx}'], {
            query: '?raw',
            import: 'default',
            eager: true,
        });

        expect(Object.keys(sources).length).toBeGreaterThan(50);
        expect(findUnknownThemeClasses(sources)).toEqual([]);
    });
});
