import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Table } from './Table.js';

describe('Table', () => {
    it('scrolls inside a wrapper no wider than its container', () => {
        render(
            <Table caption="People">
                <tbody>
                    <tr>
                        <td>Nino</td>
                    </tr>
                </tbody>
            </Table>,
        );

        const wrapper = screen.getByRole('table').parentElement;

        // A negative margin makes the panel body around it overflow and draw a second scrollbar.
        expect(wrapper?.className).toContain('overflow-x-auto');
        expect(wrapper?.className).not.toMatch(/(^|\s)-m[xlr]?-/);
    });
});
