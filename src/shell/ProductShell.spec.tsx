import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import { LocaleProvider } from '../i18n/LocaleProvider.js';

import { ProductShell } from './ProductShell.js';
import type { ShellNavItem } from './shell-navigation.js';

const CATALOG = {
    generatedAt: '2026-11-10T00:00:00.000Z',
    sourceLocale: 'en',
    versions: {},
    locales: [{ code: 'en', englishName: 'English', nativeName: 'English' }],
    messages: { en: {} },
};

const renderShell = (
    brand?: React.ReactNode,
    items: ShellNavItem[] = [{ to: '/inbox', label: 'Inbox', icon: null, badge: 3 }],
    path = '/',
): void => {
    render(
        <LocaleProvider catalog={CATALOG} storageKey="product-shell-spec">
            <MemoryRouter initialEntries={[path]}>
                <ProductShell
                    productName="Thing"
                    brand={brand}
                    items={items}
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

    const six: ShellNavItem[] = ['home', 'hours', 'leave', 'growth', 'team', 'people'].map((name) => ({
        to: `/${name}`,
        label: name,
        icon: null,
    }));

    const phoneBar = (): HTMLElement => {
        const bars = screen.getAllByRole('navigation');

        return bars[bars.length - 1];
    };

    it('keeps every destination in the phone bar while five fit', () => {
        renderShell(undefined, six.slice(0, 5));

        expect(within(phoneBar()).getAllByRole('link')).toHaveLength(5);
        expect(within(phoneBar()).queryByRole('button', { name: 'shell.more' })).toBeNull();
    });

    it('gathers the rest under More once there are more than five', () => {
        renderShell(undefined, six);

        const bar = phoneBar();

        expect(
            within(bar)
                .getAllByRole('link')
                .map((link) => link.textContent),
        ).toEqual(['home', 'hours', 'leave', 'growth']);

        const more = within(bar).getByRole('button', { name: 'shell.more' });

        expect(more.getAttribute('aria-expanded')).toBe('false');
        fireEvent.click(more);
        expect(more.getAttribute('aria-expanded')).toBe('true');
        expect(within(bar).getByRole('link', { name: 'team' })).toBeTruthy();
        expect(within(bar).getByRole('link', { name: 'people' })).toBeTruthy();
    });

    it('closes More on Escape and on a tap outside it', () => {
        renderShell(undefined, six);

        const more = within(phoneBar()).getByRole('button', { name: 'shell.more' });

        fireEvent.click(more);
        fireEvent.keyDown(document, { key: 'Escape' });
        expect(more.getAttribute('aria-expanded')).toBe('false');

        fireEvent.click(more);
        fireEvent.pointerDown(document.body);
        expect(more.getAttribute('aria-expanded')).toBe('false');
    });

    it('closes More once a place in it is opened', () => {
        renderShell(undefined, six);

        const bar = phoneBar();
        const more = within(bar).getByRole('button', { name: 'shell.more' });

        fireEvent.click(more);
        fireEvent.click(within(bar).getByRole('link', { name: 'people' }));
        expect(more.getAttribute('aria-expanded')).toBe('false');
    });

    it('marks More as where you are when the page is one it holds', () => {
        renderShell(undefined, six, '/people');

        expect(within(phoneBar()).getByRole('button', { name: 'shell.more' }).className).toContain('text-accent');
    });
});
