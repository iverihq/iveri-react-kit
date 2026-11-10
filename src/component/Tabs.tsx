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

/**
 * Sections of one page, on an underline.
 *
 * `SegmentedControl` narrows what a list shows; this moves between different content, and the two
 * looking alike would blur that. The row scrolls sideways rather than wrapping, because a second
 * line of tabs reads as a second set of tabs.
 */
export function Tabs<TValue extends string>({
    label,
    tabs,
    value,
    onChange,
    className,
}: Readonly<TabsProps<TValue>>): React.JSX.Element {
    return (
        <div
            role="tablist"
            aria-label={label}
            className={cn('flex gap-6 overflow-x-auto overflow-y-hidden border-b border-line', className)}
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
