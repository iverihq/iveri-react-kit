import type { ReactNode } from 'react';

import { cn } from '../common/index.js';

export type StatTrend = 'up' | 'down' | 'flat';

interface StatCardProps {
    label: ReactNode;
    value: ReactNode;
    /** A short qualifier under the value — the period, or what the figure counts. */
    hint?: ReactNode;
    icon?: ReactNode;
    /**
     * A change against the previous period, with its own wording.
     *
     * `trend` is the direction and nothing more: whether up is good is a question about the
     * metric, which is why the caller passes `isGoodWhen` rather than the card assuming that
     * rising is improvement. An up arrow on a failure count coloured green is worse than no
     * colour at all.
     */
    delta?: { label: ReactNode; trend: StatTrend; isGoodWhen?: 'up' | 'down' };
    className?: string;
}

const ARROW: Record<StatTrend, string> = {
    up: 'M8 3.5 12.5 8H9.5v4.5h-3V8H3.5L8 3.5Z',
    down: 'M8 12.5 3.5 8h3V3.5h3V8h3L8 12.5Z',
    flat: 'M3.5 7h9v2h-9V7Z',
};

function deltaTone(trend: StatTrend, isGoodWhen: 'up' | 'down'): string {
    if (trend === 'flat') return 'text-muted';

    return trend === isGoodWhen ? 'text-positive' : 'text-critical';
}

/**
 * One figure, said clearly.
 *
 * The value is set in the display cut at `text-h2`, because a number a dashboard exists to show
 * should be the largest thing in its card — and the label above it is the caption, not the
 * heading. Figures are tabular so a row of cards does not jitter as they update.
 */
export function StatCard({ label, value, hint, icon, delta, className }: Readonly<StatCardProps>): JSX.Element {
    return (
        <div
            className={cn(
                'flex flex-col gap-3 rounded-card border border-line bg-surface p-4 shadow-sm',
                'transition-shadow duration-fast ease-standard hover:shadow-md',
                className,
            )}
        >
            <div className="flex items-start justify-between gap-3">
                <p className="text-caption font-semibold uppercase tracking-wider text-faint">{label}</p>
                {icon !== undefined && <span className="shrink-0 text-faint">{icon}</span>}
            </div>
            <div className="flex flex-col gap-1">
                <p className="tabular font-display text-h2 font-bold leading-none text-ink">{value}</p>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    {delta !== undefined && (
                        <span
                            className={cn(
                                'inline-flex items-center gap-1 text-caption font-medium',
                                deltaTone(delta.trend, delta.isGoodWhen ?? 'up'),
                            )}
                        >
                            <svg viewBox="0 0 16 16" className="h-3 w-3" fill="currentColor" aria-hidden="true">
                                <path d={ARROW[delta.trend]} />
                            </svg>
                            {delta.label}
                        </span>
                    )}
                    {hint !== undefined && <span className="text-caption text-muted">{hint}</span>}
                </div>
            </div>
        </div>
    );
}
