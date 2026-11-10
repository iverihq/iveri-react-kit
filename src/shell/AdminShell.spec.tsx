import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { beforeAll, describe, expect, it, vi } from 'vitest';

import { LocaleProvider } from '../i18n/LocaleProvider.js';

import { AdminShell } from './AdminShell.js';

const CATALOG = {
    generatedAt: '2026-11-10T00:00:00.000Z',
    sourceLocale: 'en',
    versions: {},
    locales: [{ code: 'en', englishName: 'English', nativeName: 'English' }],
    messages: { en: {} },
};

beforeAll(() => {
    // jsdom lays nothing out, so it has no scrolling to offer.
    Element.prototype.scrollIntoView = vi.fn();
});

function renderShell(path = '/orders'): void {
    render(
        <LocaleProvider catalog={CATALOG} storageKey="shell-spec">
            <MemoryRouter initialEntries={[path]}>
                <AdminShell
                    productName="Commerce"
                    user={{ name: 'Nino Beridze', detail: 'demo' }}
                    onSignOut={() => undefined}
                    commands={[{ to: '/products/new', label: 'New product' }]}
                    sections={[
                        {
                            label: 'Sales',
                            items: [
                                { to: '/orders', label: 'Orders', icon: null, badge: 3 },
                                { to: '/customers', label: 'Customers', icon: null },
                            ],
                        },
                    ]}
                >
                    <p>Page body</p>
                </AdminShell>
            </MemoryRouter>
        </LocaleProvider>,
    );
}

describe('AdminShell', () => {
    it('renders the page and says where it is', () => {
        renderShell();

        expect(screen.getByText('Page body')).toBeTruthy();
        expect(screen.getAllByText('Orders').length).toBeGreaterThan(1);
        expect(screen.getByText('3')).toBeTruthy();
    });

    it('opens the search box with the keyboard and narrows it to what is typed', () => {
        renderShell();

        fireEvent.keyDown(window, { key: 'k', metaKey: true });
        fireEvent.change(screen.getByRole('textbox', { name: 'shell.search' }), { target: { value: 'new' } });

        expect(screen.getByRole('button', { name: /New product/u })).toBeTruthy();
        expect(screen.queryByRole('button', { name: /Customers/u })).toBeNull();
    });

    it('closes the search box on Escape', () => {
        renderShell();

        fireEvent.keyDown(window, { key: 'k', ctrlKey: true });
        fireEvent.keyDown(screen.getByRole('textbox', { name: 'shell.search' }), { key: 'Escape' });

        expect(screen.queryByRole('dialog')).toBeNull();
    });
});
