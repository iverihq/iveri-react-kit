import type { ReactNode } from 'react';

import { cn } from '../common/index.js';

export type BadgeTone = 'neutral' | 'positive' | 'caution' | 'critical' | 'info' | 'accent';

const TONE_CLASS: Record<BadgeTone, string> = {
    neutral: 'border-line bg-raised text-muted',
    positive: 'border-positive/20 bg-positive-soft text-positive',
    caution: 'border-caution/20 bg-caution-soft text-caution',
    critical: 'border-critical/20 bg-critical-soft text-critical',
    info: 'border-info/20 bg-info-soft text-info',
    accent: 'border-accent-line bg-accent-soft text-accent',
};

const DOT_CLASS: Record<BadgeTone, string> = {
    neutral: 'bg-faint',
    positive: 'bg-positive',
    caution: 'bg-caution',
    critical: 'bg-critical',
    info: 'bg-info',
    accent: 'bg-accent',
};

interface BadgeProps {
    tone?: BadgeTone;
    children: ReactNode;
    title?: string;
    /**
     * Shows a filled dot before the label.
     *
     * The label is what carries the meaning — the design standard is explicit that colour never
     * carries it alone — so the dot is an accelerator for scanning a status column, never the
     * status itself. A dot with no label is not a supported state.
     */
    hasDot?: boolean;
    className?: string;
}

export function Badge({
    tone = 'neutral',
    children,
    title,
    hasDot = false,
    className,
}: Readonly<BadgeProps>): JSX.Element {
    return (
        <span
            title={title}
            className={cn(
                'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5',
                'text-caption font-medium',
                TONE_CLASS[tone],
                className,
            )}
        >
            {hasDot && <span aria-hidden="true" className={cn('h-1.5 w-1.5 shrink-0 rounded-full', DOT_CLASS[tone])} />}
            {children}
        </span>
    );
}
