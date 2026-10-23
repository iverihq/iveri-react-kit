import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LocaleProvider } from '../i18n/LocaleProvider';
import { LocaleSelect } from '../i18n/LocaleSelect';
import type { TranslationCatalog } from '../i18n/translation-catalog.type';

import { Button, FOCUS_RING } from './Button';
import { TextField } from './Field';

/**
 * Focus has to be visible without colour.
 *
 * The design standard says colour never carries meaning alone, and focus is meaning. Before this,
 * `Button` had no focus style at all and the fields indicated it with a border colour change —
 * which is the forbidden case, and invisible to anyone who cannot distinguish the two borders.
 *
 * Pinned on the shared constant rather than on exact class names, so the ring can be restyled
 * without the test fighting it, while removing it stays a failure.
 */
const catalog: TranslationCatalog = {
    generatedAt: '2026-10-24T00:00:00.000Z',
    sourceLocale: 'en',
    locales: [{ code: 'en', englishName: 'English', nativeName: 'English' }],
    versions: {},
    messages: { en: {} },
};

describe('visible focus', () => {
    const ringClasses = FOCUS_RING.split(' ');

    it('rings a button, on keyboard focus rather than every click', () => {
        render(<Button>Confirm</Button>);

        const className = screen.getByRole('button', { name: 'Confirm' }).className;
        expect(ringClasses.every((ring) => className.includes(ring))).toBe(true);
        // `focus-visible`, never bare `focus`: a ring on every mouse click reads as a bug and
        // gets styled away, which is how a control ends up with no focus state at all.
        expect(className).toContain('focus-visible:ring-2');
    });

    it('rings a text field as well as changing its border', () => {
        render(<TextField label="Recipient" />);

        const className = screen.getByLabelText('Recipient').className;
        expect(ringClasses.every((ring) => className.includes(ring))).toBe(true);
    });

    it('rings the language picker every panel renders', () => {
        render(
            <LocaleProvider catalog={catalog}>
                <LocaleSelect label="Language" />
            </LocaleProvider>,
        );

        expect(ringClasses.every((ring) => screen.getByLabelText('Language').className.includes(ring))).toBe(true);
    });

    it('offsets the ring from the control, so it is visible against a filled background', () => {
        expect(FOCUS_RING).toContain('ring-offset-2');
    });
});
