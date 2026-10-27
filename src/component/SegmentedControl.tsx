import { cn } from '../common/index.js';

import { FOCUS_RING } from './Button.js';

interface Segment<TValue extends string> {
    value: TValue;
    label: string;
    /** A count beside the label, for a filter that says how much it would show. */
    count?: number;
}

interface SegmentedControlProps<TValue extends string> {
    /** Names the group for a screen reader; the control has no visible heading. */
    label: string;
    segments: Segment<TValue>[];
    value: TValue;
    onChange: (value: TValue) => void;
    size?: 'sm' | 'md';
    className?: string;
}

/**
 * A small, closed set of mutually exclusive filters.
 *
 * Use it where a `<select>` would hide the options a user is choosing between — a status filter
 * with four values reads faster as four visible segments than as a closed dropdown. Above about
 * six, or where the set is open, use a select instead: this control wraps badly and stops being
 * scannable, which is the thing it exists for.
 *
 * Built on radio inputs rather than buttons, so arrow keys move between segments and a screen
 * reader announces "2 of 4" — behaviour a row of buttons does not have and would have to fake.
 */
export function SegmentedControl<TValue extends string>({
    label,
    segments,
    value,
    onChange,
    size = 'md',
    className,
}: Readonly<SegmentedControlProps<TValue>>): JSX.Element {
    return (
        <div
            role="radiogroup"
            aria-label={label}
            className={cn('inline-flex items-center gap-1 rounded-control border border-line bg-sunken p-1', className)}
        >
            {segments.map((segment) => {
                const isSelected = segment.value === value;

                return (
                    <label
                        key={segment.value}
                        className={cn(
                            'inline-flex cursor-pointer items-center gap-1.5 rounded-[0.3125rem] font-medium',
                            'transition-[color,background-color,box-shadow] duration-fast ease-standard',
                            size === 'sm' ? 'min-h-7 px-2.5 text-caption' : 'min-h-8 px-3 text-label',
                            // The selected segment lifts onto the surface. Marking it with colour
                            // alone would be the one thing the standard forbids, and on a track
                            // this small a tint is easy to miss.
                            isSelected
                                ? 'bg-surface text-ink shadow-sm'
                                : 'text-muted hover:bg-raised hover:text-ink-soft',
                            'focus-within:outline-none',
                            FOCUS_RING.replaceAll('focus-visible:', 'has-[:focus-visible]:'),
                        )}
                    >
                        <input
                            type="radio"
                            name={label}
                            value={segment.value}
                            checked={isSelected}
                            onChange={() => {
                                onChange(segment.value);
                            }}
                            className="sr-only"
                        />
                        {segment.label}
                        {segment.count !== undefined && (
                            <span
                                className={cn(
                                    'tabular rounded-full px-1.5 text-2xs',
                                    isSelected ? 'bg-accent-soft text-accent' : 'bg-line text-muted',
                                )}
                            >
                                {segment.count}
                            </span>
                        )}
                    </label>
                );
            })}
        </div>
    );
}
