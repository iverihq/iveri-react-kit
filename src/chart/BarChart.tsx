import { cn } from '../common/index.js';

import { labelledIndexes, niceMax } from './chart-scale.js';

export interface BarChartDatum {
    /** The short mark on the axis — a weekday, a date. */
    label: string;
    value: number;
    /** The whole name, for the tooltip. Falls back to the label. */
    title?: string;
}

interface BarChartProps {
    /** What the chart plots, for somebody who cannot see it. */
    caption: string;
    data: BarChartDatum[];
    formatValue?: (value: number) => string;
    /** The most axis labels the width can take; the rest stay in the tooltip. */
    maxLabels?: number;
    className?: string;
}

const PLOT_HEIGHT_CLASS = 'h-44';

/**
 * One measure over a run of days.
 *
 * Laid out with flexbox rather than drawn in SVG, because a bar here is a percentage of its slot
 * and needs no measuring: it stays correct at every width with no resize observer. Every bar is the
 * same navy, since its length already says how big it is and a second encoding would say it twice.
 *
 * The plot leaves headroom above the tallest bar so that a tooltip stays inside it: a `Panel`'s body
 * clips, and a tooltip it cut off would be worse than none.
 */
export function BarChart({
    caption,
    data,
    formatValue = String,
    maxLabels = 8,
    className,
}: Readonly<BarChartProps>): React.JSX.Element {
    const top = niceMax(Math.max(0, ...data.map((datum) => datum.value)));
    const labelled = labelledIndexes(data.length, maxLabels);

    return (
        <figure className={cn('flex flex-col gap-2', className)}>
            <div className="flex gap-3 pt-8">
                <div
                    className={cn(
                        'tabular flex shrink-0 flex-col justify-between text-right text-2xs text-faint',
                        PLOT_HEIGHT_CLASS,
                    )}
                    aria-hidden="true"
                >
                    <span className="-translate-y-1/2">{formatValue(top)}</span>
                    <span>{formatValue(top / 2)}</span>
                    <span className="translate-y-1/2">{formatValue(0)}</span>
                </div>
                <div className={cn('relative min-w-0 flex-1', PLOT_HEIGHT_CLASS)}>
                    <div
                        className="pointer-events-none absolute inset-0 flex flex-col justify-between"
                        aria-hidden="true"
                    >
                        <span className="h-px bg-line" />
                        <span className="h-px bg-line" />
                        <span className="h-px bg-line-strong" />
                    </div>
                    <div className="absolute inset-0 flex items-end gap-0.5">
                        {data.map((datum) => (
                            <div
                                key={datum.title ?? datum.label}
                                tabIndex={0}
                                className="group relative flex h-full min-w-0 flex-1 items-end justify-center focus-visible:outline-hidden"
                            >
                                <div
                                    className="w-full max-w-6 rounded-t bg-accent transition-colors duration-fast group-hover:bg-accent-hover group-focus-visible:bg-accent-hover"
                                    style={{
                                        height: `${Math.max(datum.value > 0 ? 1.5 : 0, (datum.value / top) * 100)}%`,
                                    }}
                                />
                                <div
                                    className="pointer-events-none absolute z-10 mb-1 hidden whitespace-nowrap rounded-control bg-ink px-2 py-1 text-center text-caption text-white shadow-lg group-hover:block group-focus-visible:block"
                                    style={{ bottom: `${Math.min(100, (datum.value / top) * 100)}%` }}
                                >
                                    <span className="tabular block font-semibold">{formatValue(datum.value)}</span>
                                    <span className="block text-2xs text-white/70">{datum.title ?? datum.label}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="flex gap-3" aria-hidden="true">
                <span className="invisible tabular shrink-0 text-2xs">{formatValue(top)}</span>
                <div className="flex min-w-0 flex-1 gap-0.5">
                    {data.map((datum, index) => (
                        <span
                            key={datum.title ?? datum.label}
                            className="tabular min-w-0 flex-1 text-center text-2xs text-faint"
                        >
                            {labelled.has(index) ? datum.label : ''}
                        </span>
                    ))}
                </div>
            </div>
            <table className="sr-only">
                <caption>{caption}</caption>
                <tbody>
                    {data.map((datum) => (
                        <tr key={datum.title ?? datum.label}>
                            <th scope="row">{datum.title ?? datum.label}</th>
                            <td>{formatValue(datum.value)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </figure>
    );
}
