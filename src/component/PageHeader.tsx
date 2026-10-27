import type { ReactNode } from 'react';

import { cn } from '../common/index.js';

interface PageHeaderProps {
    title: ReactNode;
    /** A short label above the title — the section a page belongs to. */
    eyebrow?: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    /** Filters or a search box, on their own row below the title. */
    toolbar?: ReactNode;
    className?: string;
}

/**
 * The block at the top of a page.
 *
 * Every panel had hand-rolled this, which is why no two pages in the fleet put their title,
 * description and primary action in the same place or at the same size. The primary action sits
 * top-right and the toolbar gets its own row, so a page with six filters does not push its own
 * title off the line.
 */
export function PageHeader({
    title,
    eyebrow,
    description,
    actions,
    toolbar,
    className,
}: Readonly<PageHeaderProps>): JSX.Element {
    return (
        <header className={cn('flex flex-col gap-4', className)}>
            <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                <div className="flex min-w-0 flex-col gap-1.5">
                    {eyebrow !== undefined && (
                        <p className="text-caption font-semibold uppercase tracking-wider text-faint">{eyebrow}</p>
                    )}
                    <h1 className="font-display text-h1 font-bold text-ink">{title}</h1>
                    {description !== undefined && <p className="max-w-2xl text-body text-muted">{description}</p>}
                </div>
                {actions !== undefined && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
            </div>
            {toolbar !== undefined && <div className="flex flex-wrap items-end gap-3">{toolbar}</div>}
        </header>
    );
}
