import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SignInLayout } from './SignInLayout.js';

const renderLayout = (brand?: React.ReactNode): void => {
    render(
        <SignInLayout productName="Thing" brand={brand} strapline="Who it is for" heading="Sign in">
            <p>Form</p>
        </SignInLayout>,
    );
};

describe('SignInLayout', () => {
    it('shows the Iveri mark and the name by default, on both sides', () => {
        renderLayout();

        expect(screen.getAllByText('Thing')).toHaveLength(2);
        expect(screen.getAllByAltText('Iveri')).toHaveLength(2);
    });

    it('draws a product’s own mark instead when it has one', () => {
        renderLayout(<span>Own mark</span>);

        expect(screen.getAllByText('Own mark')).toHaveLength(2);
        expect(screen.queryByAltText('Iveri')).toBeNull();
        expect(screen.queryByText('Thing')).toBeNull();
    });
});
