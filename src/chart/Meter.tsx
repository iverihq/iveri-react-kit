import type { ReactNode } from 'react';

import { cn } from '../common/index.js';

export type MeterTone = 'accent' | 'positive' | 'caution' | 'critical';

const FILL_CLASS: Record<MeterTone, string> = {
    accent: 'bg-accent',
    positive: 'bg-positive',
    caution: 'bg-caution',
    critical: 'bg-critical',
};

interface MeterProps {
    label: ReactNode;
    /** The figure at the end of the row, in the caller's own words. */
    detail?: ReactNode;
    value: number;
    max: number;
    tone?: MeterTone;
    className?: string;
}

/** How much of something is done, with its name and its figure on the same row. */
export function Meter({
    label,
    detail,
    value,
    max,
    tone = 'accent',
    className,
}: Readonly<MeterProps>): React.JSX.Element {
    const ratio = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0;

    return (
        <div className={cn('flex flex-col gap-1.5', className)}>
            {/* Wraps rather than truncating, because a Georgian label cut short reads as a different word. */}
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                <span className="min-w-0 text-label font-medium text-ink-soft [overflow-wrap:anywhere]">{label}</span>
                {detail !== undefined && <span className="tabular text-small text-muted">{detail}</span>}
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-raised" role="presentation">
                <div
                    className={cn(
                        'h-full rounded-full transition-[width] duration-normal ease-standard',
                        FILL_CLASS[tone],
                    )}
                    style={{ width: `${ratio * 100}%` }}
                />
            </div>
        </div>
    );
}
