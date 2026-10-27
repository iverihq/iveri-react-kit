import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { Avatar } from './Avatar.js';
import { Badge } from './Badge.js';
import { initialsOf } from './initials.js';
import { SegmentedControl } from './SegmentedControl.js';
import { StatCard } from './StatCard.js';
import { Table, TableBody, TableCell, TableHead, TableHeaderCell, TableRow } from './Table.js';

describe('initialsOf', () => {
    it('takes the first and last word, so a middle name is skipped', () => {
        expect(initialsOf('Ana Beridze')).toBe('AB');
        expect(initialsOf('Ana Maria Beridze')).toBe('AB');
    });

    it('gives a one-word name a single letter, not two from the same word', () => {
        expect(initialsOf('Iveri')).toBe('I');
    });

    it('survives the spacing a real name arrives with', () => {
        expect(initialsOf('  ana   beridze ')).toBe('AB');
        expect(initialsOf('')).toBe('');
    });

    it('upper-cases Georgian into Mtavruli, and the loaded font has to cover it', () => {
        // Mkhedruli upper-cases out of its own block into U+1C90+, so these initials are the
        // only Georgian on a page that is not U+10A0–10FF. Asserted as codepoints because the
        // two scripts are visually similar enough that a literal would not show the difference.
        const initials = initialsOf('ანა ბერიძე');

        expect([...initials].map((glyph) => glyph.codePointAt(0))).toEqual([0x1c90, 0x1c91]);

        const georgianRanges = readFileSync(
            resolve(import.meta.dirname, '../../node_modules/@fontsource/noto-sans-georgian/400.css'),
            'utf8',
        );
        expect(georgianRanges).toContain('U+1C90');
    });
});

describe('Avatar', () => {
    it('names the person for a screen reader whether or not there is a photograph', () => {
        const { rerender } = render(<Avatar name="Ana Beridze" />);
        expect(screen.getByRole('img', { name: 'Ana Beridze' })).toBeDefined();

        rerender(<Avatar name="Ana Beridze" imageUrl="https://example.test/a.png" />);
        expect(screen.getByRole('img', { name: 'Ana Beridze' })).toBeDefined();
    });
});

describe('Badge', () => {
    it('always renders the label, so the dot is never the only signal', () => {
        // The design standard's hardest rule: colour never carries meaning alone. A dot is an
        // accelerator for scanning a status column, so the label has to survive beside it.
        render(
            <Badge tone="critical" hasDot>
                Dead-lettered
            </Badge>,
        );

        expect(screen.getByText('Dead-lettered')).toBeDefined();
    });
});

describe('StatCard', () => {
    it('colours a delta by whether the metric improved, not by which way it points', () => {
        // Rising is not improvement. A failure count going up with a green arrow beside it is
        // worse than no colour at all, which is why the caller says what good looks like.
        const { container: rising } = render(
            <StatCard label="Failures" value="12" delta={{ label: '+8%', trend: 'up', isGoodWhen: 'down' }} />,
        );
        expect(rising.querySelector('.text-critical')).not.toBeNull();
        expect(rising.querySelector('.text-positive')).toBeNull();

        const { container: falling } = render(
            <StatCard label="Failures" value="4" delta={{ label: '−8%', trend: 'down', isGoodWhen: 'down' }} />,
        );
        expect(falling.querySelector('.text-positive')).not.toBeNull();
    });

    it('reads a flat delta as neither', () => {
        const { container } = render(<StatCard label="Orders" value="90" delta={{ label: '0%', trend: 'flat' }} />);

        expect(container.querySelector('.text-positive')).toBeNull();
        expect(container.querySelector('.text-critical')).toBeNull();
    });
});

describe('SegmentedControl', () => {
    it('is a radio group, so arrow keys move through it and the position is announced', () => {
        // Built on radios rather than buttons for exactly this: a row of buttons has none of
        // this behaviour and would have to fake all of it with key handlers and aria.
        render(
            <SegmentedControl
                label="Status"
                value="open"
                onChange={vi.fn()}
                segments={[
                    { value: 'open', label: 'Open', count: 3 },
                    { value: 'closed', label: 'Closed' },
                ]}
            />,
        );

        expect(screen.getByRole('radiogroup', { name: 'Status' })).toBeDefined();
        expect(screen.getByRole('radio', { name: /Open/u })).toHaveProperty('checked', true);
        expect(screen.getByRole('radio', { name: 'Closed' })).toHaveProperty('checked', false);
    });

    it('reports the value chosen rather than the index', async () => {
        const onChange = vi.fn();
        render(
            <SegmentedControl
                label="Status"
                value="open"
                onChange={onChange}
                segments={[
                    { value: 'open', label: 'Open' },
                    { value: 'closed', label: 'Closed' },
                ]}
            />,
        );

        await userEvent.click(screen.getByRole('radio', { name: 'Closed' }));

        expect(onChange).toHaveBeenCalledWith('closed');
    });
});

describe('Table', () => {
    it('keeps a real table structure, so a screen reader reads a grid', () => {
        render(
            <Table caption="Orders">
                <TableHead>
                    <TableRow>
                        <TableHeaderCell>Order</TableHeaderCell>
                        <TableHeaderCell isNumeric>Total</TableHeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow isSelected>
                        <TableCell isPrimary>IV-1</TableCell>
                        <TableCell isNumeric>12.99</TableCell>
                    </TableRow>
                </TableBody>
            </Table>,
        );

        expect(screen.getByRole('table', { name: 'Orders' })).toBeDefined();
        expect(screen.getByRole('columnheader', { name: 'Total' })).toBeDefined();
        expect(screen.getByRole('row', { selected: true })).toBeDefined();
    });

    it('right-aligns a numeric cell and sets its figures tabular', () => {
        // A column of amounts that does not line up reads as a list of strings. The class is
        // asserted because the base layer, not the component, applies the font feature.
        render(
            <Table>
                <TableBody>
                    <TableRow>
                        <TableCell isNumeric>1499</TableCell>
                    </TableRow>
                </TableBody>
            </Table>,
        );

        const cell = screen.getByRole('cell', { name: '1499' });
        expect(cell.className).toContain('text-right');
        expect(cell.className).toContain('tabular');
    });
});
