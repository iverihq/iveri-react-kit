export interface MapPoint {
    latitude: number;
    longitude: number;
}

export interface RouteMapStop extends MapPoint {
    id: string;
    color: string;
    /** Announced, and shown as the marker's tooltip. */
    label?: string;
}

type LngLat = [longitude: number, latitude: number];

export const toLngLat = (point: MapPoint): LngLat => [point.longitude, point.latitude];

/** The corners of the box holding every stop, as `[south-west, north-east]`. */
export function boundsOf(stops: readonly MapPoint[]): [LngLat, LngLat] {
    const longitudes = stops.map((stop) => stop.longitude);
    const latitudes = stops.map((stop) => stop.latitude);

    return [
        [Math.min(...longitudes), Math.min(...latitudes)],
        [Math.max(...longitudes), Math.max(...latitudes)],
    ];
}

/**
 * The stops joined in order.
 *
 * A straight line, and it is drawn dashed to say so: nothing in the fleet computes a road route, and
 * a solid line would promise a way of getting there that no service has worked out.
 */
export function routeLine(stops: readonly MapPoint[]): { type: 'LineString'; coordinates: LngLat[] } {
    return { type: 'LineString', coordinates: stops.map(toLngLat) };
}
