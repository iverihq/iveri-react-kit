import type { ReactNode } from 'react';

interface EmptyStateProps {
    title: string;
    description?: ReactNode;
    action?: ReactNode;
    icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps): JSX.Element {
    return (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
            {icon !== undefined && <div className="text-faint">{icon}</div>}
            <div className="flex flex-col gap-1.5">
                <p className="text-sm font-medium text-ink">{title}</p>
                {description !== undefined && (
                    <p className="max-w-md text-xs leading-relaxed text-faint">{description}</p>
                )}
            </div>
            {action}
        </div>
    );
}
