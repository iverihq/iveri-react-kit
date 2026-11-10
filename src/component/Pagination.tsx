import type { ReactNode } from 'react';

import { cn } from '../common/index.js';

import { Button } from './Button.js';

interface PaginationProps {
    /** What is on screen, in the caller's own words — "21–40 of 134". */
    summary: ReactNode;
    previousLabel: string;
    nextLabel: string;
    hasPrevious: boolean;
    hasNext: boolean;
    onPrevious: () => void;
    onNext: () => void;
    className?: string;
}

/** Previous and next under a list, with what is showing between them and the edge. */
export function Pagination({
    summary,
    previousLabel,
    nextLabel,
    hasPrevious,
    hasNext,
    onPrevious,
    onNext,
    className,
}: Readonly<PaginationProps>): React.JSX.Element {
    return (
        <nav className={cn('flex flex-wrap items-center justify-between gap-3', className)}>
            <p className="tabular text-small text-muted">{summary}</p>
            <div className="flex items-center gap-2">
                <Button size="sm" disabled={!hasPrevious} onClick={onPrevious}>
                    {previousLabel}
                </Button>
                <Button size="sm" disabled={!hasNext} onClick={onNext}>
                    {nextLabel}
                </Button>
            </div>
        </nav>
    );
}
