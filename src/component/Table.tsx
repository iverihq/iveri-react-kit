import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from 'react';

import { cn } from '../common/index.js';

interface TableProps {
    children: ReactNode;
    /** An accessible description of what the table lists. */
    caption?: string;
    className?: string;
}

/**
 * The data table every panel was hand-rolling, and the single largest reason they looked
 * unlike each other: six apps, six row heights, six header treatments, six divider weights.
 *
 * Deliberately **compositional** rather than a column-config component. These are drop-in
 * replacements for the `<table>`/`<tr>`/`<td>` markup already in the panels, so a page adopts
 * them one table at a time — where a config-driven table would mean rewriting every page that
 * has one before any of it could ship.
 */
export function Table({ children, caption, className }: Readonly<TableProps>): JSX.Element {
    return (
        <div className="-mx-px overflow-x-auto">
            <table className={cn('w-full border-collapse text-left text-small', className)}>
                {caption !== undefined && <caption className="sr-only">{caption}</caption>}
                {children}
            </table>
        </div>
    );
}

/**
 * The header row.
 *
 * Sticky by default, because a table long enough to scroll is a table whose column names are
 * needed while scrolling — and `bg-sunken` is what stops rows showing through it.
 */
export function TableHead({
    children,
    isSticky = true,
}: Readonly<{ children: ReactNode; isSticky?: boolean }>): JSX.Element {
    return (
        <thead
            className={cn(
                'bg-sunken text-caption font-semibold uppercase tracking-wider text-muted',
                isSticky && 'sticky top-0 z-10',
            )}
        >
            {children}
        </thead>
    );
}

export function TableBody({ children }: Readonly<{ children: ReactNode }>): JSX.Element {
    return <tbody className="divide-y divide-line">{children}</tbody>;
}

interface TableRowProps {
    children: ReactNode;
    /** Marks the row the page is showing detail for. */
    isSelected?: boolean;
    onClick?: () => void;
    className?: string;
}

export function TableRow({ children, isSelected = false, onClick, className }: Readonly<TableRowProps>): JSX.Element {
    const isInteractive = onClick !== undefined;

    return (
        <tr
            onClick={onClick}
            aria-selected={isSelected || undefined}
            className={cn(
                'transition-colors duration-instant',
                // The wash is a mixed tint rather than the navy at low alpha, which goes grey
                // and leaves a selected row looking merely hovered.
                isSelected ? 'bg-accent-soft' : 'bg-surface',
                isInteractive && 'cursor-pointer hover:bg-raised',
                className,
            )}
        >
            {children}
        </tr>
    );
}

type HeaderCellProps = Omit<ThHTMLAttributes<HTMLTableCellElement>, 'className'> & {
    children?: ReactNode;
    /** Right-aligns the column, so figures line up under their own heading. */
    isNumeric?: boolean;
    className?: string;
};

export function TableHeaderCell({
    children,
    isNumeric = false,
    className,
    ...rest
}: Readonly<HeaderCellProps>): JSX.Element {
    return (
        <th
            scope="col"
            className={cn(
                'whitespace-nowrap border-b border-line px-4 py-2.5 font-semibold',
                isNumeric && 'text-right',
                className,
            )}
            {...rest}
        >
            {children}
        </th>
    );
}

type CellProps = Omit<TdHTMLAttributes<HTMLTableCellElement>, 'className'> & {
    children?: ReactNode;
    isNumeric?: boolean;
    /** The column that names the row — carries the weight so a row scans left to right. */
    isPrimary?: boolean;
    className?: string;
};

export function TableCell({
    children,
    isNumeric = false,
    isPrimary = false,
    className,
    ...rest
}: Readonly<CellProps>): JSX.Element {
    return (
        <td
            className={cn(
                'px-4 py-3 align-middle',
                isPrimary ? 'font-medium text-ink' : 'text-muted',
                isNumeric && 'text-right tabular',
                className,
            )}
            {...rest}
        >
            {children}
        </td>
    );
}
