import { useEffect, useRef, useState } from 'react';

import { cn } from '../common/index.js';

import { FOCUS_RING } from './Button.js';

interface Tab<TValue extends string> {
    value: TValue;
    label: string;
    /** A count beside the label, for a tab that says how much is behind it. */
    count?: number;
}

interface TabsProps<TValue extends string> {
    /** Names the group for a screen reader; the row has no visible heading. */
    label: string;
    tabs: Tab<TValue>[];
    value: TValue;
    onChange: (value: TValue) => void;
    className?: string;
}

/** Which edges of a sideways-scrolling row have more beyond them. */
interface Overflow {
    hasBefore: boolean;
    hasAfter: boolean;
}

/** The fade on each edge that has more beyond it, standing in for the scrollbar the row hides. */
const FADE: Readonly<Record<'none' | 'before' | 'after' | 'both', string>> = {
    none: '',
    before: '[mask-image:linear-gradient(to_right,transparent,black_2rem)]',
    after: '[mask-image:linear-gradient(to_left,transparent,black_2rem)]',
    both: '[mask-image:linear-gradient(to_right,transparent,black_2rem,black_calc(100%-2rem),transparent)]',
};

/** How far a row is from either end before it counts as there, so a fraction of a pixel draws no fade. */
const EDGE_SLACK = 1;

function measure(row: HTMLElement): Overflow {
    return {
        hasBefore: row.scrollLeft > EDGE_SLACK,
        hasAfter: row.scrollLeft + row.clientWidth < row.scrollWidth - EDGE_SLACK,
    };
}

/** Moves the row only, never the page: `scrollIntoView` would also scroll every ancestor. */
function revealSelected(row: HTMLElement): void {
    const selected = row.querySelector<HTMLElement>('[aria-selected="true"]');
    if (selected === null) return;

    const start = selected.offsetLeft - row.offsetLeft;
    const end = start + selected.offsetWidth;

    if (start < row.scrollLeft) {
        row.scrollLeft = start;
    } else if (end > row.scrollLeft + row.clientWidth) {
        row.scrollLeft = end - row.clientWidth;
    }
}

/**
 * Sections of one page, on an underline.
 *
 * `SegmentedControl` narrows what a list shows; this moves between different content, and the two
 * looking alike would blur that. The row scrolls sideways rather than wrapping, because a second
 * line of tabs reads as a second set of tabs. On a phone that is the usual case, so the scrollbar
 * is hidden and an edge with more beyond it fades instead, and the selected tab is always scrolled
 * into the row: one opened from a link is otherwise off the screen with nothing saying it is there.
 */
export function Tabs<TValue extends string>({
    label,
    tabs,
    value,
    onChange,
    className,
}: Readonly<TabsProps<TValue>>): React.JSX.Element {
    const row = useRef<HTMLDivElement>(null);
    const [overflow, setOverflow] = useState<Overflow>({ hasBefore: false, hasAfter: false });

    // Watches the tabs as well as the row: a tab grows when its font arrives, after the first layout, and the row's own
    // box does not change when it does. A new set of tabs is watched afresh.
    const tabKey = tabs.map((tab) => tab.value).join('\n');

    useEffect(() => {
        const element = row.current;
        if (element === null) return undefined;

        const update = (): void => {
            const next = measure(element);

            setOverflow((current) =>
                current.hasBefore === next.hasBefore && current.hasAfter === next.hasAfter ? current : next,
            );
        };
        const onResize = (): void => {
            revealSelected(element);
            update();
        };
        // Absent only outside a browser, where nothing is laid out to overflow.
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(onResize);

        observer?.observe(element);
        for (const tab of Array.from(element.children)) observer?.observe(tab);
        element.addEventListener('scroll', update, { passive: true });
        update();

        return (): void => {
            observer?.disconnect();
            element.removeEventListener('scroll', update);
        };
    }, [tabKey]);

    useEffect(() => {
        if (row.current !== null) revealSelected(row.current);
    }, [value]);

    const fade =
        overflow.hasBefore && overflow.hasAfter
            ? 'both'
            : overflow.hasBefore
              ? 'before'
              : overflow.hasAfter
                ? 'after'
                : 'none';

    return (
        <div
            ref={row}
            role="tablist"
            aria-label={label}
            className={cn(
                'flex gap-6 overflow-x-auto overflow-y-hidden border-b border-line',
                '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
                FADE[fade],
                className,
            )}
        >
            {tabs.map((tab) => {
                const isSelected = tab.value === value;

                return (
                    <button
                        key={tab.value}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        onClick={() => {
                            onChange(tab.value);
                        }}
                        className={cn(
                            '-mb-px inline-flex min-h-11 shrink-0 items-center gap-2 border-b-2 text-label font-medium',
                            'transition-colors duration-fast ease-standard',
                            FOCUS_RING,
                            isSelected
                                ? 'border-accent text-ink'
                                : 'border-transparent text-muted hover:border-line-strong hover:text-ink-soft',
                        )}
                    >
                        {tab.label}
                        {tab.count !== undefined && (
                            <span
                                className={cn(
                                    'tabular rounded-full px-1.5 text-2xs',
                                    isSelected ? 'bg-accent-soft text-accent' : 'bg-raised text-muted',
                                )}
                            >
                                {tab.count}
                            </span>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
