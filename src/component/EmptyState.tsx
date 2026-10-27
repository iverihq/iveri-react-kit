import type { ReactNode } from 'react';

import { cn } from '../common/index.js';

interface EmptyStateProps {
    title: string;
    description?: ReactNode;
    action?: ReactNode;
    icon?: ReactNode;
    /** `compact` fits inside a card beside other content; `full` owns the page area. */
    size?: 'compact' | 'full';
    className?: string;
}

/**
 * Nothing here, said deliberately.
 *
 * The icon sits in a ringed well rather than floating, which gives the block a centre of mass —
 * a bare glyph above two lines of text reads as a rendering failure rather than a designed
 * state, which is the whole thing an empty state exists to avoid.
 */
export function EmptyState({
    title,
    description,
    action,
    icon,
    size = 'full',
    className,
}: Readonly<EmptyStateProps>): JSX.Element {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-4 text-center',
                size === 'full' ? 'px-6 py-16' : 'px-4 py-10',
                className,
            )}
        >
            {icon !== undefined && (
                <div
                    className={cn(
                        'flex items-center justify-center rounded-full bg-raised text-faint',
                        'ring-1 ring-inset ring-line',
                        size === 'full' ? 'h-14 w-14' : 'h-11 w-11',
                    )}
                >
                    {icon}
                </div>
            )}
            <div className="flex max-w-md flex-col gap-1.5">
                <p className={cn('font-display font-semibold text-ink', size === 'full' ? 'text-h3' : 'text-body')}>
                    {title}
                </p>
                {description !== undefined && <p className="text-small text-muted">{description}</p>}
            </div>
            {action !== undefined && <div className="pt-1">{action}</div>}
        </div>
    );
}
