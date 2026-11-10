import { describe, expect, it } from 'vitest';

import { filterCommands, findActiveItem, type ShellNavSection } from './shell-navigation.js';

const SECTIONS: ShellNavSection[] = [
    {
        label: 'Trips',
        items: [
            { to: '/rides', label: 'My rides', icon: null },
            { to: '/rides/new', label: 'Book', icon: null },
        ],
    },
    { items: [{ to: '/driver', label: 'Driver', icon: null, end: true }] },
];

describe('findActiveItem', () => {
    it('prefers the longest match, so a child screen is not filed under its parent', () => {
        expect(findActiveItem(SECTIONS, '/rides/new')?.item.label).toBe('Book');
    });

    it('files a detail screen under the list it belongs to', () => {
        expect(findActiveItem(SECTIONS, '/rides/42')?.item.label).toBe('My rides');
    });

    it('does not match a path that only begins with the same letters', () => {
        expect(findActiveItem(SECTIONS, '/rides-archive')).toBeNull();
    });

    it('leaves an exact destination alone on the screens below it', () => {
        expect(findActiveItem(SECTIONS, '/driver/work')).toBeNull();
    });
});

describe('filterCommands', () => {
    const commands = [{ to: '/rides/new', label: 'Request a ride', group: 'Actions' }];

    it('offers every destination and command with nothing typed', () => {
        expect(filterCommands(SECTIONS, commands, '  ')).toHaveLength(4);
    });

    it('matches a label regardless of case', () => {
        expect(filterCommands(SECTIONS, commands, 'REQUEST').map((command) => command.label)).toEqual([
            'Request a ride',
        ]);
    });

    it('matches the section a destination sits in', () => {
        expect(filterCommands(SECTIONS, [], 'trips').map((command) => command.label)).toEqual(['My rides', 'Book']);
    });
});
