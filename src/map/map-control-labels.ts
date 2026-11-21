import type { TranslateFunction } from '../i18n/translation-catalog.type.js';

/**
 * MapLibre's own words for its controls, mapped to `web-shell` keys.
 *
 * MapLibre names its buttons and its canvas in English unless it is given a `locale`, so a Russian
 * or Georgian page announced "Zoom in" and "Toggle attribution" to a screen reader. The keys are in
 * `web-shell` because every app that draws a map already pulls it, so the map is translated with no
 * code in the app, like the shells.
 *
 * Only the controls this component can show are listed. The compass is hidden, and the others
 * (fullscreen, geolocation, scale, globe, terrain) are never added.
 */
export const MAP_CONTROL_LABEL_KEYS = {
    'Map.Title': 'shell.map.title',
    'Marker.Title': 'shell.map.marker',
    'NavigationControl.ZoomIn': 'shell.map.zoom-in',
    'NavigationControl.ZoomOut': 'shell.map.zoom-out',
    'NavigationControl.ResetBearing': 'shell.map.reset-bearing',
    'AttributionControl.ToggleAttribution': 'shell.map.toggle-attribution',
    'AttributionControl.MapFeedback': 'shell.map.feedback',
} as const;

/**
 * The `locale` option for a MapLibre map, in the reader's language.
 *
 * A key the app's catalogue does not hold is left out, so MapLibre keeps its English for it. Every
 * other missing key in the kit renders as itself because that is visible on the page; these are
 * accessible names nobody sees, so "shell.map.zoom-in" would only ever reach a screen reader.
 */
export function mapControlLabels(t: TranslateFunction): Record<string, string> {
    const labels: Record<string, string> = {};

    for (const [mapKey, messageKey] of Object.entries(MAP_CONTROL_LABEL_KEYS)) {
        const label = t(messageKey);

        if (label !== messageKey) labels[mapKey] = label;
    }

    return labels;
}
