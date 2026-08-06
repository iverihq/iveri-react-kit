import type { ReactNode } from 'react';

import { cn } from '../common';

export type BadgeTone = 'neutral' | 'positive' | 'caution' | 'critical' | 'info' | 'accent';

const TONE_CLASS: Record<BadgeTone, string> = {
    neutral: 'border-line bg-raised text-muted',
    positive: 'bg-positive/10 text-positive border-positive/25',
    caution: 'bg-caution/10 text-caution border-caution/25',
    critical: 'bg-critical/10 text-critical border-critical/25',
    info: 'bg-info/10 text-info border-info/25',
    accent: 'bg-accent/10 text-accent border-accent/25',
};

interface BadgeProps {
    tone?: BadgeTone;
    children: ReactNode;
    title?: string;
    className?: string;
}

export function Badge({ tone = 'neutral', children, title, className }: Readonly<BadgeProps>): JSX.Element {
    return (
        <span
            title={title}
            className={cn(
                'inline-flex items-center gap-1 whitespace-nowrap rounded border px-2 py-0.5 font-medium',
                'text-2xs tracking-wide',
                TONE_CLASS[tone],
                className,
            )}
        >
            {children}
        </span>
    );
}
