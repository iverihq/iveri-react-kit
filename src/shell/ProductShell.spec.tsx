import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { LocaleProvider } from '../i18n/LocaleProvider.js';

import { ProductShell } from './ProductShell.js';

const CATALOG = {
    generatedAt: '2026-11-10T00:00:00.000Z',
    sourceLocale: 'en',
    versions: {},
    locales: [{ code: 'en', englishName: 'English', nativeName: 'English' }],
    messages: { en: {} },
};

const renderShell = (brand?: React.ReactNode): void => {
    render(
        <LocaleProvider catalog={CATALOG} storageKey="product-shell-spec">
            <MemoryRouter>
                <ProductShell
                    productName="Thing"
                    brand={brand}
                    items={[{ to: '/inbox', label: 'Inbox', icon: null, badge: 3 }]}
                    user={{ name: 'Nino' }}
                    onSignOut={() => undefined}
                >
                    <p>Content</p>
                </ProductShell>
            </MemoryRouter>
        </LocaleProvider>,
    );
};

describe('ProductShell', () => {
    it('shows the Iveri mark and the name by default', () => {
        renderShell();

        expect(screen.getByText('Thing')).toBeTruthy();
    });

    it('draws a product’s own mark instead when it has one', () => {
        renderShell(<span>Own mark</span>);

        expect(screen.getByText('Own mark')).toBeTruthy();
        expect(screen.queryByText('Thing')).toBeNull();
    });

    it('shows a count on a destination, in the bar and in the tabs', () => {
        renderShell();

        const links = screen.getAllByRole('link', { name: /Inbox/u });

        expect(links).toHaveLength(2);

        for (const link of links) {
            expect(within(link).getByText('3')).toBeTruthy();
        }
    });
});
