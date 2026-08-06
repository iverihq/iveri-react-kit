import type { ReactNode } from 'react';

import { cn } from '../common';

interface PanelProps {
    title?: ReactNode;
    actions?: ReactNode;
    description?: ReactNode;
    children: ReactNode;
    isFlush?: boolean;
    className?: string;
}

export function Panel({
    title,
    actions,
    description,
    children,
    isFlush = false,
    className,
}: Readonly<PanelProps>): JSX.Element {
    const hasHeader = title !== undefined || actions !== undefined;

    return (
        <section className={cn('rounded-lg border border-line bg-surface shadow-sm', className)}>
            {hasHeader && (
                <header className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-4 py-4 sm:px-5">
                    <div className="flex flex-col gap-1">
                        {title !== undefined && <h2 className="text-lg font-semibold text-ink">{title}</h2>}
                        {description !== undefined && <p className="text-sm leading-6 text-muted">{description}</p>}
                    </div>
                    {actions !== undefined && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
                </header>
            )}
            <div className={isFlush ? '' : 'p-4 sm:p-5'}>{children}</div>
        </section>
    );
}
