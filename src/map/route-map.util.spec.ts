import { describe, expect, it } from 'vitest';

import { boundsOf, routeLine, toLngLat } from './route-map.util.js';

const TBILISI = { latitude: 41.7151, longitude: 44.8271 };
const RUSTAVI = { latitude: 41.5495, longitude: 44.9946 };

describe('the route on a map', () => {
    it('writes a point the way a map reads it, longitude first', () => {
        expect(toLngLat(TBILISI)).toEqual([44.8271, 41.7151]);
    });

    it('boxes every stop whichever way round they were given', () => {
        expect(boundsOf([TBILISI, RUSTAVI])).toEqual([
            [44.8271, 41.5495],
            [44.9946, 41.7151],
        ]);
    });

    it('joins the stops in the order they are visited', () => {
        expect(routeLine([RUSTAVI, TBILISI]).coordinates).toEqual([
            [44.9946, 41.5495],
            [44.8271, 41.7151],
        ]);
    });
});
