import { cn } from '../common/index.js';

export type StackedBarTone = 'accent' | 'info' | 'positive' | 'caution' | 'critical' | 'neutral';

const SEGMENT_CLASS: Record<StackedBarTone, string> = {
    accent: 'bg-accent',
    info: 'bg-info',
    positive: 'bg-positive',
    caution: 'bg-caution',
    critical: 'bg-critical',
    neutral: 'bg-faint',
};

export interface StackedBarSegment {
    label: string;
    value: number;
    tone: StackedBarTone;
}

interface StackedBarProps {
    /** What the whole bar adds up to, for somebody who cannot see it. */
    caption: string;
    segments: StackedBarSegment[];
    formatValue?: (value: number) => string;
    className?: string;
}

/**
 * How one total divides up, with a legend that says so in words.
 *
 * The legend is always there and names every state with its figure, so the colours speed up reading
 * and never carry the meaning. The gap between segments is what separates two neighbours that are
 * close in tone; a segment with nothing in it stays in the legend and takes no room in the bar.
 */
export function StackedBar({
    caption,
    segments,
    formatValue = String,
    className,
}: Readonly<StackedBarProps>): React.JSX.Element {
    const present = segments.filter((segment) => segment.value > 0);

    return (
        <figure className={cn('flex flex-col gap-3', className)}>
            <figcaption className="sr-only">{caption}</figcaption>
            <div className="flex h-3 gap-0.5" aria-hidden="true">
                {present.length === 0 && <span className="h-full w-full rounded-full bg-raised" />}
                {present.map((segment) => (
                    <span
                        key={segment.label}
                        title={`${segment.label}: ${formatValue(segment.value)}`}
                        className={cn(
                            'h-full min-w-1 first:rounded-l-full last:rounded-r-full',
                            SEGMENT_CLASS[segment.tone],
                        )}
                        style={{ flexGrow: segment.value, flexBasis: 0 }}
                    />
                ))}
            </div>
            <ul className="flex flex-wrap gap-x-5 gap-y-1.5">
                {segments.map((segment) => (
                    <li key={segment.label} className="flex items-center gap-1.5 text-small text-muted">
                        <span
                            className={cn('h-2 w-2 shrink-0 rounded-xs', SEGMENT_CLASS[segment.tone])}
                            aria-hidden="true"
                        />
                        {segment.label}
                        <span className="tabular font-semibold text-ink">{formatValue(segment.value)}</span>
                    </li>
                ))}
            </ul>
        </figure>
    );
}
