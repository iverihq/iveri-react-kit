import { describe, expect, it } from 'vitest';

import { localeFlag } from './locale-flag';

describe('localeFlag', () => {
    it('maps the languages the platform ships', () => {
        expect(localeFlag('en')).toBe('🇬🇧');
        expect(localeFlag('ka')).toBe('🇬🇪');
        expect(localeFlag('ru')).toBe('🇷🇺');
    });

    it('prefers an explicit region over the language table', () => {
        // `pt-BR` has already said which country it means; `en-US` disagrees with the table on
        // purpose and must win.
        expect(localeFlag('pt-BR')).toBe('🇧🇷');
        expect(localeFlag('en-US')).toBe('🇺🇸');
    });

    it('returns nothing for a language it cannot honestly place', () => {
        // Not a placeholder glyph: the native name renders beside it, so an empty flag costs
        // alignment and nothing else — where a guessed flag costs a reader being told their
        // language belongs to a country it does not.
        expect(localeFlag('eo')).toBe('');
    });

    it('ignores a script subtag, which is not a region', () => {
        expect(localeFlag('sr-Latn')).toBe('');
    });
});
