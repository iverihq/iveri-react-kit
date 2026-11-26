import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { type StatusStep, StatusSteps } from './StatusSteps.js';

const STEPS: StatusStep[] = [
    { key: 'quoted', label: 'ფასი', state: 'done' },
    { key: 'search', label: 'ძებნა', state: 'current' },
    { key: 'coming', label: 'მოსვლა', state: 'upcoming' },
];

describe('StatusSteps', () => {
    it('marks the current step for assistive technology', () => {
        render(<StatusSteps steps={STEPS} />);

        expect(screen.getByText('ძებნა').closest('li')?.getAttribute('aria-current')).toBe('step');
        expect(screen.getByText('ფასი').closest('li')?.hasAttribute('aria-current')).toBe(false);
    });

    it('decides between a row and a column by its own width, not the screen', () => {
        const { container } = render(<StatusSteps steps={STEPS} className="mt-5" />);

        expect([...(container.firstElementChild?.classList ?? [])]).toEqual(
            expect.arrayContaining(['@container', 'mt-5']),
        );
        expect([...(container.querySelector('ol')?.classList ?? [])]).toEqual(
            expect.arrayContaining(['flex-col', '@lg:flex-row']),
        );
    });

    it('draws one connector of each kind between every pair of steps', () => {
        const { container } = render(<StatusSteps steps={STEPS} />);
        const connectors = [...container.querySelectorAll('span[aria-hidden="true"].absolute')];

        expect(connectors.filter((line) => line.classList.contains('@lg:hidden'))).toHaveLength(STEPS.length - 1);
        expect(connectors.filter((line) => line.classList.contains('@lg:block'))).toHaveLength(STEPS.length - 1);
    });

    it('colours a column connector by the step it leads to', () => {
        const { container } = render(<StatusSteps steps={STEPS} />);
        const [toCurrent, toUpcoming] = [...container.querySelectorAll('span.\\@lg\\:hidden')];

        expect(toCurrent?.classList.contains('bg-accent')).toBe(true);
        expect(toUpcoming?.classList.contains('bg-line')).toBe(true);
    });

    it('never breaks a label inside a word', () => {
        const { container } = render(<StatusSteps steps={STEPS} />);

        expect(container.innerHTML).not.toMatch(/break-all|wrap-anywhere|break-words/);
    });
});
