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

export function Panel({ title, actions, description, children, isFlush = false, className }: PanelProps): JSX.Element {
    const hasHeader = title !== undefined || actions !== undefined;

    return (
        <section className={cn('rounded-card border border-line bg-surface', className)}>
            {hasHeader && (
                <header className="flex items-start justify-between gap-4 border-b border-line px-4 py-3">
                    <div className="flex flex-col gap-0.5">
                        {title !== undefined && <h2 className="text-sm font-semibold text-ink">{title}</h2>}
                        {description !== undefined && <p className="text-xs text-faint">{description}</p>}
                    </div>
                    {actions !== undefined && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
                </header>
            )}
            <div className={isFlush ? '' : 'p-4'}>{children}</div>
        </section>
    );
}
