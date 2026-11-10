import type { GeoJSONSource, Map as MapLibreMap, Marker } from 'maplibre-gl';
import type * as MapLibreModule from 'maplibre-gl';
import { useEffect, useRef } from 'react';

import { cn } from '../common/index.js';

import { boundsOf, routeLine, toLngLat, type MapPoint, type RouteMapStop } from './route-map.util.js';

const ROUTE_SOURCE = 'iveri-route';
const ROUTE_COLOR = '#1b2d72';
const FIT_PADDING = 64;
const STOP_ZOOM = 15;

type MapLibre = typeof MapLibreModule;

/**
 * A map with a route's stops on it, and optionally a way to place one by tapping.
 *
 * MapLibre is loaded when the component mounts, because it is most of a megabyte and most screens
 * of most apps have no map. It is an optional peer of this package for the same reason, and this
 * component lives behind its own entry point, so importing the kit's root never reaches it.
 *
 * **The style URL is the caller's**, since which tile provider serves a deployment is a decision
 * about cost and terms rather than about this component. An app with no URL configured should not
 * render this at all and keeps whatever it offered before.
 *
 * `onUnavailable` is called when a browser cannot draw it, which is a real case rather than a
 * theoretical one: WebGL is off on some managed machines and in some remote desktops.
 */
export function RouteMap({
    styleUrl,
    stops,
    center,
    zoom = 12,
    onPick,
    onUnavailable,
    ariaLabel,
    className,
}: {
    styleUrl: string;
    stops: readonly RouteMapStop[];
    /** Where to look while there are no stops to fit. */
    center: MapPoint;
    zoom?: number;
    onPick?: (point: MapPoint) => void;
    onUnavailable?: () => void;
    ariaLabel: string;
    className?: string;
}): React.JSX.Element {
    const container = useRef<HTMLDivElement>(null);
    const libraryRef = useRef<MapLibre | null>(null);
    const mapRef = useRef<MapLibreMap | null>(null);
    const markersRef = useRef<Marker[]>([]);
    const stopsRef = useRef(stops);
    const onPickRef = useRef(onPick);
    const onUnavailableRef = useRef(onUnavailable);
    const initialView = useRef({ center, zoom });

    useEffect(() => {
        onPickRef.current = onPick;
        onUnavailableRef.current = onUnavailable;
    });

    useEffect(() => {
        // An object rather than a `let`, so the check after each `await` reads as a real question.
        const mount = { isAbandoned: false };

        const open = async (): Promise<void> => {
            try {
                const [library, worker] = await Promise.all([
                    import('maplibre-gl'),
                    import('maplibre-gl/dist/maplibre-gl-worker.mjs?url'),
                    import('maplibre-gl/dist/maplibre-gl.css'),
                ]);

                if (mount.isAbandoned || !container.current) return;

                // MapLibre finds its worker relative to its own file, and a bundler moves that file.
                library.setWorkerUrl(worker.default);

                const map = new library.Map({
                    container: container.current,
                    style: styleUrl,
                    center: toLngLat(initialView.current.center),
                    zoom: initialView.current.zoom,
                    attributionControl: { compact: true },
                });

                libraryRef.current = library;
                mapRef.current = map;
                map.addControl(new library.NavigationControl({ showCompass: false }), 'top-right');
                map.on('click', (event) => {
                    onPickRef.current?.({ latitude: event.lngLat.lat, longitude: event.lngLat.lng });
                });
                map.on('load', () => {
                    map.addSource(ROUTE_SOURCE, {
                        type: 'geojson',
                        data: { type: 'Feature', properties: {}, geometry: routeLine([]) },
                    });
                    map.addLayer({
                        id: ROUTE_SOURCE,
                        type: 'line',
                        source: ROUTE_SOURCE,
                        layout: { 'line-cap': 'round', 'line-join': 'round' },
                        paint: { 'line-color': ROUTE_COLOR, 'line-width': 3, 'line-dasharray': [1, 2] },
                    });
                    draw(map, library, stopsRef.current, markersRef);
                });
                map.on('error', (event) => {
                    // A tile that fails is a gap in the picture; only a style that cannot load
                    // leaves nothing to show.
                    if (!map.isStyleLoaded() && event.error.message.includes('style')) onUnavailableRef.current?.();
                });
            } catch {
                if (!mount.isAbandoned) onUnavailableRef.current?.();
            }
        };

        void open();

        return (): void => {
            mount.isAbandoned = true;
            mapRef.current?.remove();
            mapRef.current = null;
            markersRef.current = [];
        };
    }, [styleUrl]);

    useEffect(() => {
        stopsRef.current = stops;

        if (mapRef.current && libraryRef.current && mapRef.current.getSource(ROUTE_SOURCE)) {
            draw(mapRef.current, libraryRef.current, stops, markersRef);
        }
    }, [stops]);

    return <div ref={container} role="application" aria-label={ariaLabel} className={cn('h-full w-full', className)} />;
}

function draw(
    map: MapLibreMap,
    library: MapLibre,
    stops: readonly RouteMapStop[],
    markers: React.RefObject<Marker[]>,
): void {
    for (const marker of markers.current) marker.remove();

    markers.current = stops.map((stop) => {
        const marker = new library.Marker({ color: stop.color }).setLngLat(toLngLat(stop)).addTo(map);

        if (stop.label) marker.getElement().setAttribute('title', stop.label);

        return marker;
    });

    const source = map.getSource(ROUTE_SOURCE);

    if (source?.type === 'geojson') {
        void (source as GeoJSONSource).setData({
            type: 'Feature',
            properties: {},
            geometry: routeLine(stops),
        });
    }

    if (stops.length === 1) map.easeTo({ center: toLngLat(stops[0]), zoom: Math.max(map.getZoom(), STOP_ZOOM) });
    if (stops.length > 1) map.fitBounds(boundsOf(stops), { padding: FIT_PADDING, maxZoom: STOP_ZOOM, duration: 400 });
}
