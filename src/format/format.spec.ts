import { describe, expect, it } from 'vitest';

import {
    formatBytes,
    formatCount,
    formatMoney,
    formatUsageMonth,
    fromMinorUnits,
    minorDigits,
    monthFigures,
    toMinorUnits,
    usageMeterTone,
} from './index.js';

describe('money', () => {
    it('asks the currency how many minor units it has', () => {
        expect(minorDigits('GEL')).toBe(2);
        expect(minorDigits('JPY')).toBe(0);
        expect(minorDigits('KWD')).toBe(3);
    });

    it('divides by the minor unit the currency has, never by a fixed 100', () => {
        expect(formatMoney(12_000, 'USD', 'en')).toBe('$120.00');
        expect(formatMoney(500, 'JPY', 'en')).toBe('¥500');
        expect(formatMoney(1500, 'KWD', 'en')).toMatch(/^KWD\s1\.500$/);
    });

    it('reads a typed price without a floating-point error', () => {
        expect(toMinorUnits('19.99', 'GEL')).toBe(1999);
        expect(toMinorUnits('120', 'GEL')).toBe(12_000);
        expect(toMinorUnits('12,5', 'GEL')).toBe(1250);
        expect(toMinorUnits('500', 'JPY')).toBe(500);
    });

    it('refuses what is not a price', () => {
        for (const text of ['', 'free', '-5', '1.999', '500.5x']) {
            expect(toMinorUnits(text, 'GEL')).toBeNull();
        }
        expect(toMinorUnits('500.5', 'JPY')).toBeNull();
    });

    it('writes a price the way it would be typed', () => {
        expect(fromMinorUnits(12_000, 'GEL')).toBe('120.00');
        expect(fromMinorUnits(500, 'JPY')).toBe('500');
    });
});

describe('usage', () => {
    it('warns from four fifths of a limit and stays a warning where nothing is refused', () => {
        expect(usageMeterTone(79, 100)).toBe('accent');
        expect(usageMeterTone(80, 100)).toBe('caution');
        expect(usageMeterTone(250, 100)).toBe('caution');
    });

    it('is critical at the limit only for a product that refuses over it', () => {
        expect(usageMeterTone(99, 100, { refusesOverLimit: true })).toBe('caution');
        expect(usageMeterTone(100, 100, { refusesOverLimit: true })).toBe('critical');
    });

    it('gives every shown metric a figure in the page order, zero when unused, and skips unknown ones', () => {
        const month = {
            metrics: [
                { metric: 'b', quantity: 7 },
                { metric: 'unknown', quantity: 99 },
            ],
        };

        expect(monthFigures(month, ['a', 'b'] as const)).toEqual([
            { metric: 'a', quantity: 0 },
            { metric: 'b', quantity: 7 },
        ]);
    });

    it('writes counts, months and bytes in the reader’s language', () => {
        expect(formatCount(12_345, 'en')).toBe('12,345');
        expect(formatUsageMonth('2026-10-01T00:00:00.000Z', 'en')).toBe('October 2026');
        expect(formatBytes(0, 'en')).toBe('0 bytes');
        expect(formatBytes(512, 'en')).toBe('512 bytes');
        expect(formatBytes(1_073_741_824, 'en')).toBe('1 GB');
    });
});
