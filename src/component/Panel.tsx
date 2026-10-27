import type { ReactNode } from 'react';

import { cn } from '../common/index.js';

interface PanelProps {
    title?: ReactNode;
    actions?: ReactNode;
    description?: ReactNode;
    /** A footer rail for pagination or a secondary action, on the sunken surface. */
    footer?: ReactNode;
    children: ReactNode;
    isFlush?: boolean;
    className?: string;
}

/**
 * The card every panel's content sits in.
 *
 * `shadow-e1` and a `line` border together, which looks redundant and is not: the border holds
 * the edge where the surface and the canvas are both nearly white, and the shadow is what
 * separates the layers. Dropping either leaves a card that floats without an edge, or an edge
 * that does not lift.
 */
export function Panel({
    title,
    actions,
    description,
    footer,
    children,
    isFlush = false,
    className,
}: Readonly<PanelProps>): JSX.Element {
    const hasHeader = title !== undefined || actions !== undefined;

    return (
        <section className={cn('overflow-hidden rounded-panel border border-line bg-surface shadow-e1', className)}>
            {hasHeader && (
                <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4">
                    <div className="flex min-w-0 flex-col gap-1">
                        {title !== undefined && (
                            <h2 className="font-display text-h3 font-semibold text-ink">{title}</h2>
                        )}
                        {description !== undefined && <p className="text-small text-muted">{description}</p>}
                    </div>
                    {actions !== undefined && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
                </header>
            )}
            <div className={isFlush ? '' : 'p-5'}>{children}</div>
            {footer !== undefined && (
                <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line bg-sunken px-5 py-3">
                    {footer}
                </footer>
            )}
        </section>
    );
}
