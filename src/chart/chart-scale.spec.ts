import { describe, expect, it } from 'vitest';

import { labelledIndexes, niceMax } from './chart-scale.js';

describe('niceMax', () => {
    it.each([
        [0, 1],
        [1, 1],
        [3, 5],
        [17, 20],
        [2317, 2500],
        [9500, 10000],
    ])('rounds %d up to %d', (value, expected) => {
        expect(niceMax(value)).toBe(expected);
    });

    it('survives a fractional maximum without float dust', () => {
        expect(niceMax(0.3)).toBe(0.5);
    });
});

describe('labelledIndexes', () => {
    it('labels everything when there is room', () => {
        expect([...labelledIndexes(4, 8)].sort()).toEqual([0, 1, 2, 3]);
    });

    it('thins the labels out while always keeping the last', () => {
        const indexes = labelledIndexes(30, 8);

        expect(indexes.has(29)).toBe(true);
        expect(indexes.size).toBeLessThanOrEqual(8);
    });
});
