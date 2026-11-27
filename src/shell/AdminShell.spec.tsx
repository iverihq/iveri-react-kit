import { act, fireEvent, render, screen } from '@testing-library/react';
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

    it('wraps a long label rather than cutting it off with an ellipsis', () => {
        // jsdom measures nothing, so this pins the rule rather than the pixels: a Georgian word cut short is a
        // different word, and the sidebar, the header and the account button are where long names land.
        renderShell();
        fireEvent.click(screen.getByRole('button', { name: 'shell.account' }));

        expect(document.querySelector('.truncate')).toBeNull();
        expect(document.querySelector('[class*="text-ellipsis"]')).toBeNull();
        expect(screen.getAllByTitle('Nino Beridze').length).toBeGreaterThan(0);
        expect(screen.getByTitle('Commerce')).toBeTruthy();
    });

    it("hides the page's name in the top bar, rather than break a word, while its longest word does not fit", () => {
        const sizes = { scroll: 120, client: 96 };
        const scrollWidth = vi
            .spyOn(HTMLElement.prototype, 'scrollWidth', 'get')
            .mockImplementation(() => sizes.scroll);
        const clientWidth = vi
            .spyOn(HTMLElement.prototype, 'clientWidth', 'get')
            .mockImplementation(() => sizes.client);
        const resizes: (() => void)[] = [];

        vi.stubGlobal(
            'ResizeObserver',
            class {
                constructor(callback: () => void) {
                    resizes.push(callback);
                }

                observe = vi.fn();

                disconnect = vi.fn();
            },
        );

        try {
            renderShell();

            const title = document.querySelector('header [title="Orders"]');
            expect(title?.className).toContain('[overflow-wrap:normal]');
            expect(title?.className).toContain('invisible');
            expect(title?.getAttribute('aria-hidden')).toBe('true');

            // The bar widens (a phone turned on its side), and the name comes back.
            sizes.client = 160;
            act(() => {
                for (const resize of resizes) resize();
            });
            expect(title?.className).not.toContain('invisible');
            expect(title?.hasAttribute('aria-hidden')).toBe(false);
        } finally {
            scrollWidth.mockRestore();
            clientWidth.mockRestore();
            vi.unstubAllGlobals();
        }
    });

    it('drops the section before the page name when both do not fit', () => {
        // The section ("Sales") has lost its room; the page's name still fits.
        const tight = (element: HTMLElement): boolean => element.getAttribute('title') === 'Sales';
        const scrollWidth = vi.spyOn(HTMLElement.prototype, 'scrollWidth', 'get').mockImplementation(function (
            this: HTMLElement,
        ) {
            return tight(this) ? 90 : 60;
        });
        const clientWidth = vi.spyOn(HTMLElement.prototype, 'clientWidth', 'get').mockImplementation(function (
            this: HTMLElement,
        ) {
            return tight(this) ? 20 : 60;
        });

        try {
            renderShell();

            const section = document.querySelector('header [title="Sales"]');
            const page = document.querySelector('header [title="Orders"]');
            expect(section?.className).toContain('invisible');
            expect(section?.className).toContain('shrink-[100]');
            expect(section?.nextElementSibling?.getAttribute('class')).not.toContain('sm:block');
            expect(page?.className).not.toContain('invisible');
        } finally {
            scrollWidth.mockRestore();
            clientWidth.mockRestore();
        }
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
