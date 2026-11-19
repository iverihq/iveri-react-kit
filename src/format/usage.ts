import type { MeterTone } from '../chart/index.js';

/** One closed month of metered usage, as billing answers it. Structural, so the root never imports a contract. */
export interface UsageMonthFigures {
    readonly metrics: readonly { readonly metric: string; readonly quantity: number }[];
}

export interface UsageMeterToneOptions {
    /**
     * Whether the product refuses work once the limit is reached. Baasi does, so reaching it is critical; Conduit
     * refuses nothing, so going over is something to act on and stays a warning.
     */
    readonly refusesOverLimit?: boolean;
}

/** Calm until four fifths of the limit, a warning from there, and critical at the limit only where it refuses. */
export function usageMeterTone(quantity: number, limit: number, options: UsageMeterToneOptions = {}): MeterTone {
    if (options.refusesOverLimit === true && quantity >= limit) return 'critical';
    if (quantity >= limit * 0.8) return 'caution';

    return 'accent';
}

/**
 * A month's figure for every metric a page shows, in the page's order. A metric billing has no row for that month
 * was not used, so it reads 0 rather than being left out; a metric billing has and the page does not know is
 * skipped, so one added in billing first is never shown as a raw name.
 */
export function monthFigures<TMetric extends string>(
    month: UsageMonthFigures,
    metrics: readonly TMetric[],
): { metric: TMetric; quantity: number }[] {
    const used = new Map(month.metrics.map((row) => [row.metric, row.quantity]));

    return metrics.map((metric) => ({ metric, quantity: used.get(metric) ?? 0 }));
}

export function formatCount(value: number, locale: string): string {
    return new Intl.NumberFormat(locale).format(value);
}

/** The month a billing period covers, as `November 2026`, read in UTC as the period was cut. */
export function formatUsageMonth(value: string, locale: string): string {
    return new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(value));
}

const BYTE_UNITS = ['byte', 'kilobyte', 'megabyte', 'gigabyte', 'terabyte'] as const;

/** Bytes in the largest unit that keeps the figure at one or more, in the reader's language. */
export function formatBytes(bytes: number, locale: string): string {
    let value = bytes;
    let unit = 0;

    while (value >= 1024 && unit < BYTE_UNITS.length - 1) {
        value /= 1024;
        unit += 1;
    }

    return new Intl.NumberFormat(locale, {
        style: 'unit',
        unit: BYTE_UNITS[unit],
        // Whole bytes read as a word ("0 bytes"), larger units as their short sign ("1 GB").
        unitDisplay: unit === 0 ? 'long' : 'short',
        maximumFractionDigits: unit === 0 ? 0 : 1,
    }).format(value);
}
