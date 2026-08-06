import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, beforeEach } from 'vitest';

import { LocaleProvider } from './LocaleProvider';
import { LocaleSelect } from './LocaleSelect';
import type { TranslationCatalog } from './translation-catalog.type';
import { useTranslation } from './use-translation';

const catalog: TranslationCatalog = {
    generatedAt: '2026-08-06T00:00:00.000Z',
    sourceLocale: 'en',
    locales: [
        { code: 'en', englishName: 'English', nativeName: 'English' },
        { code: 'ru', englishName: 'Russian', nativeName: 'Русский' },
        { code: 'ka', englishName: 'Georgian', nativeName: 'ქართული' },
    ],
    messages: {
        en: {
            'nav.inbox': 'Inbox',
            'shell.greeting': 'Hello {name}',
            'inbox.unread': '{count, plural, one {# unread} other {# unread}}',
        },
        ru: {
            'nav.inbox': 'Входящие',
            'inbox.unread': '{count, plural, one {# непрочитанное} few {# непрочитанных} other {# непрочитанных}}',
        },
        ka: { 'nav.inbox': 'შემოსული' },
    },
    versions: { 'web-shell': 1 },
};

function Probe({ messageKey, values }: { messageKey: string; values?: Record<string, string | number> }): JSX.Element {
    const { t, locale } = useTranslation();

    return (
        <>
            <span data-testid="locale">{locale}</span>
            <span data-testid="value">{t(messageKey, values)}</span>
        </>
    );
}

describe('LocaleProvider', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('renders the active locale', () => {
        render(
            <LocaleProvider catalog={catalog} initialLocale="ka">
                <Probe messageKey="nav.inbox" />
            </LocaleProvider>,
        );

        expect(screen.getByTestId('value').textContent).toBe('შემოსული');
    });

    it('falls back to the source locale for a key the active locale lacks', () => {
        render(
            <LocaleProvider catalog={catalog} initialLocale="ka">
                <Probe messageKey="shell.greeting" values={{ name: 'Dana' }} />
            </LocaleProvider>,
        );

        expect(screen.getByTestId('value').textContent).toBe('Hello Dana');
    });

    it('formats a fallback with the plural rules of the locale that supplied the text', () => {
        // The bug this pins: formatting English under `ka` would take whichever branch Georgian's
        // single plural category selects, which is not the branch the English author wrote.
        // `ka` has no `inbox.unread`, so the English pattern must be formatted as English.
        render(
            <LocaleProvider catalog={catalog} initialLocale="ka">
                <Probe messageKey="inbox.unread" values={{ count: 1 }} />
            </LocaleProvider>,
        );

        expect(screen.getByTestId('value').textContent).toBe('1 unread');
    });

    it('uses the active locale’s own plural categories', () => {
        render(
            <LocaleProvider catalog={catalog} initialLocale="ru">
                <Probe messageKey="inbox.unread" values={{ count: 3 }} />
            </LocaleProvider>,
        );

        expect(screen.getByTestId('value').textContent).toBe('3 непрочитанных');
    });

    it('returns the key when nothing in the catalogue defines it', () => {
        render(
            <LocaleProvider catalog={catalog} initialLocale="en">
                <Probe messageKey="nav.nowhere" />
            </LocaleProvider>,
        );

        expect(screen.getByTestId('value').textContent).toBe('nav.nowhere');
    });

    it('remembers a chosen locale under the given storage key', async () => {
        const user = userEvent.setup();
        render(
            <LocaleProvider catalog={catalog} initialLocale="en" storageKey="test.locale">
                <LocaleSelect label="Language" />
                <Probe messageKey="nav.inbox" />
            </LocaleProvider>,
        );

        await user.selectOptions(screen.getByLabelText('Language'), 'ru');

        expect(screen.getByTestId('value').textContent).toBe('Входящие');
        expect(window.localStorage.getItem('test.locale')).toBe('ru');
    });

    it('discards a stored locale the catalogue no longer holds', () => {
        window.localStorage.setItem('test.locale', 'de');

        render(
            <LocaleProvider catalog={catalog} initialLocale="ru" storageKey="test.locale">
                <Probe messageKey="nav.inbox" />
            </LocaleProvider>,
        );

        expect(screen.getByTestId('locale').textContent).toBe('ru');
    });

    it('labels every option with its flag and its own language', () => {
        render(
            <LocaleProvider catalog={catalog} initialLocale="en">
                <LocaleSelect label="Language" />
            </LocaleProvider>,
        );

        // The name is never dropped in favour of the flag: on a platform with no flag glyphs the
        // option would otherwise read as two letters, and a language is not a country regardless.
        expect(
            [...screen.getByLabelText<HTMLSelectElement>('Language').options].map((option) => option.textContent),
        ).toEqual(['🇬🇧 English', '🇷🇺 Русский', '🇬🇪 ქართული']);
    });

    it('throws when useTranslation is called outside a provider', () => {
        expect(() => render(<Probe messageKey="nav.inbox" />)).toThrow(/outside a LocaleProvider/);
    });
});
