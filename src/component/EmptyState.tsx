import type { ReactNode } from 'react';

interface EmptyStateProps {
    title: string;
    description?: ReactNode;
    action?: ReactNode;
    icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: Readonly<EmptyStateProps>): JSX.Element {
    return (
        <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
            {icon !== undefined && <div className="text-muted">{icon}</div>}
            <div className="flex max-w-md flex-col gap-2">
                <p className="text-lg font-semibold text-ink">{title}</p>
                {description !== undefined && <p className="text-sm leading-6 text-muted">{description}</p>}
            </div>
            {action}
        </div>
    );
}
