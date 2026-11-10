import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { RouteMap } from './RouteMap.js';

const library = vi.hoisted(() => {
    const handlers = new Map<string, (event: unknown) => void>();
    const marker = { setLngLat: vi.fn(), addTo: vi.fn(), remove: vi.fn(), getElement: vi.fn() };

    marker.setLngLat.mockReturnValue(marker);
    marker.addTo.mockReturnValue(marker);
    marker.getElement.mockReturnValue(document.createElement('div'));

    const map = {
        addControl: vi.fn(),
        addSource: vi.fn(),
        addLayer: vi.fn(),
        getSource: vi.fn(() => ({ type: 'geojson', setData: vi.fn() })),
        setPadding: vi.fn(),
        getZoom: vi.fn(() => 12),
        getBounds: vi.fn(() => ({ contains: vi.fn(() => true) })),
        easeTo: vi.fn(),
        fitBounds: vi.fn(),
        remove: vi.fn(),
        isStyleLoaded: vi.fn(() => true),
        on: vi.fn((event: string, handler: (event: unknown) => void) => handlers.set(event, handler)),
    };

    // `function`, because the component calls these with `new` and an arrow cannot be constructed.
    return {
        handlers,
        setWorkerUrl: vi.fn(),
        map,
        marker,
        Map: vi.fn(function createMap() {
            return map;
        }),
        Marker: vi.fn(function createMarker() {
            return marker;
        }),
        NavigationControl: vi.fn(function createControl() {
            return {};
        }),
    };
});

vi.mock('maplibre-gl', () => ({
    setWorkerUrl: library.setWorkerUrl,
    Map: library.Map,
    Marker: library.Marker,
    NavigationControl: library.NavigationControl,
}));
vi.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}));
vi.mock('maplibre-gl/dist/maplibre-gl-worker.mjs?url', () => ({ default: '/assets/worker.mjs' }));

const STYLE = 'https://tiles.example.test/style.json';
const CENTER = { latitude: 41.7, longitude: 44.8 };
const STOP = { id: 'pickup', latitude: 41.71, longitude: 44.82, color: '#000' };

describe('a route map', () => {
    beforeEach(() => vi.clearAllMocks());

    it('opens the style it was given, longitude first', async () => {
        render(<RouteMap styleUrl={STYLE} stops={[]} center={CENTER} ariaLabel="Map" />);

        await waitFor(() => expect(library.Map).toHaveBeenCalled());
        expect(library.Map.mock.calls[0]).toEqual([expect.objectContaining({ style: STYLE, center: [44.8, 41.7] })]);
    });

    it('keeps the camera clear of a panel on a wide screen', async () => {
        vi.stubGlobal(
            'matchMedia',
            vi.fn(() => ({ matches: true })),
        );
        render(<RouteMap styleUrl={STYLE} stops={[]} center={CENTER} insetLeft={456} ariaLabel="Map" />);

        await waitFor(() => expect(library.map.setPadding).toHaveBeenCalledWith({ left: 456 }));
        vi.unstubAllGlobals();
    });

    it('leaves the camera alone on a narrow screen, where the panel sits below the map', async () => {
        vi.stubGlobal(
            'matchMedia',
            vi.fn(() => ({ matches: false })),
        );
        render(<RouteMap styleUrl={STYLE} stops={[]} center={CENTER} insetLeft={456} ariaLabel="Map" />);

        await waitFor(() => expect(library.Map).toHaveBeenCalled());
        expect(library.map.setPadding).not.toHaveBeenCalled();
        vi.unstubAllGlobals();
    });

    it('tells MapLibre where a bundler put its worker', async () => {
        render(<RouteMap styleUrl={STYLE} stops={[]} center={CENTER} ariaLabel="Map" />);

        await waitFor(() => expect(library.setWorkerUrl).toHaveBeenCalledWith('/assets/worker.mjs'));
    });

    it('puts a marker on each stop once the map has loaded', async () => {
        render(<RouteMap styleUrl={STYLE} stops={[STOP]} center={CENTER} ariaLabel="Map" />);

        await waitFor(() => expect(library.handlers.has('load')).toBe(true));
        library.handlers.get('load')?.({});

        expect(library.Marker).toHaveBeenCalledWith({ color: '#000' });
        expect(library.marker.setLngLat).toHaveBeenCalledWith([44.82, 41.71]);
    });

    it('zooms in on a lone stop when there is nothing to place', async () => {
        render(<RouteMap styleUrl={STYLE} stops={[STOP]} center={CENTER} ariaLabel="Map" />);

        await waitFor(() => expect(library.handlers.has('load')).toBe(true));
        library.handlers.get('load')?.({});

        expect(library.map.easeTo).toHaveBeenCalledWith({ center: [44.82, 41.71], zoom: 15 });
    });

    it('keeps the view while somebody is placing stops they can already see', async () => {
        render(<RouteMap styleUrl={STYLE} stops={[STOP]} center={CENTER} onPick={vi.fn()} ariaLabel="Map" />);

        await waitFor(() => expect(library.handlers.has('load')).toBe(true));
        library.handlers.get('load')?.({});

        expect(library.map.easeTo).not.toHaveBeenCalled();
    });

    it('reports where somebody tapped', async () => {
        const onPick = vi.fn();

        render(<RouteMap styleUrl={STYLE} stops={[]} center={CENTER} onPick={onPick} ariaLabel="Map" />);

        await waitFor(() => expect(library.handlers.has('click')).toBe(true));
        library.handlers.get('click')?.({ lngLat: { lat: 41.5, lng: 44.5 } });

        expect(onPick).toHaveBeenCalledWith({ latitude: 41.5, longitude: 44.5 });
    });

    it('takes the map down with it', async () => {
        const { unmount } = render(<RouteMap styleUrl={STYLE} stops={[]} center={CENTER} ariaLabel="Map" />);

        await waitFor(() => expect(library.Map).toHaveBeenCalled());
        unmount();

        expect(library.map.remove).toHaveBeenCalledOnce();
    });

    it('says so when the browser cannot draw it', async () => {
        const onUnavailable = vi.fn();

        library.Map.mockImplementationOnce(function failToCreateMap(): never {
            throw new Error('WebGL is off');
        });
        render(<RouteMap styleUrl={STYLE} stops={[]} center={CENTER} onUnavailable={onUnavailable} ariaLabel="Map" />);

        await waitFor(() => expect(onUnavailable).toHaveBeenCalledOnce());
    });
});
