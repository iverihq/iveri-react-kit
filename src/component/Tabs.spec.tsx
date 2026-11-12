import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Tabs } from './Tabs.js';

const TABS = ['goals', 'reviews', 'one-to-ones', 'learning'].map((value) => ({ value, label: value }));

/** Lays the row out as a browser would: each tab 100 wide with 24 between, in a row 200 wide. */
function layOut(row: HTMLElement): void {
    Object.defineProperty(row, 'clientWidth', { configurable: true, value: 200 });
    Object.defineProperty(row, 'scrollWidth', { configurable: true, value: TABS.length * 124 - 24 });
    Object.defineProperty(row, 'offsetLeft', { configurable: true, value: 0 });

    row.querySelectorAll<HTMLElement>('[role="tab"]').forEach((tab, index) => {
        Object.defineProperty(tab, 'offsetLeft', { configurable: true, value: index * 124 });
        Object.defineProperty(tab, 'offsetWidth', { configurable: true, value: 100 });
    });
}

/** Stands in for the browser's observer, so a spec can say when the tabs changed size. */
function captureResizes(): { fire: () => void } {
    const callbacks: (() => void)[] = [];

    vi.stubGlobal(
        'ResizeObserver',
        class {
            constructor(callback: () => void) {
                callbacks.push(callback);
            }

            observe = vi.fn();

            disconnect = vi.fn();
        },
    );

    return {
        fire: () => {
            for (const callback of callbacks) callback();
        },
    };
}

describe('Tabs', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('marks the selected tab and reports a choice', () => {
        let chosen = '';

        render(<Tabs label="Growth" tabs={TABS} value="goals" onChange={(next) => (chosen = next)} />);
        fireEvent.click(screen.getByRole('tab', { name: 'reviews' }));

        expect(screen.getByRole('tab', { name: 'goals' }).getAttribute('aria-selected')).toBe('true');
        expect(chosen).toBe('reviews');
    });

    it('scrolls the row, and only the row, to a selected tab past its edge', () => {
        const { rerender } = render(<Tabs label="Growth" tabs={TABS} value="goals" onChange={() => undefined} />);
        const row = screen.getByRole('tablist');

        layOut(row);
        rerender(<Tabs label="Growth" tabs={TABS} value="learning" onChange={() => undefined} />);

        // The last tab ends at 3 × 124 + 100 = 472, so the row stops where that end meets its right edge.
        expect(row.scrollLeft).toBe(272);

        rerender(<Tabs label="Growth" tabs={TABS} value="goals" onChange={() => undefined} />);

        expect(row.scrollLeft).toBe(0);
    });

    it('fades an edge with more beyond it once the row is scrolled', () => {
        render(<Tabs label="Growth" tabs={TABS} value="goals" onChange={() => undefined} />);
        const row = screen.getByRole('tablist');

        layOut(row);
        row.scrollLeft = 100;
        fireEvent.scroll(row);

        expect(row.className).toContain('black_calc(100%-2rem)');
    });

    it('keeps the selected tab in the row when the tabs grow after they were first laid out', () => {
        const resizes = captureResizes();

        render(<Tabs label="Growth" tabs={TABS} value="learning" onChange={() => undefined} />);
        const row = screen.getByRole('tablist');

        // Laid out before its font arrived, everything fitted and nothing needed scrolling.
        expect(row.scrollLeft).toBe(0);

        layOut(row);
        resizes.fire();

        expect(row.scrollLeft).toBe(272);
    });
});
