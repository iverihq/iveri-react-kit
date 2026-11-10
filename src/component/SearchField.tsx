import { cn } from '../common/index.js';

import { FOCUS_RING } from './Button.js';

interface SearchFieldProps {
    /** The placeholder, and the accessible name: a search box has no room for a stacked label. */
    label: string;
    value: string;
    onChange: (value: string) => void;
    /** Shows a clear control while there is text. Pass a translated string. */
    clearLabel?: string;
    className?: string;
}

/** The search box above a list. Its own control so that every list's looks and clears the same way. */
export function SearchField({
    label,
    value,
    onChange,
    clearLabel,
    className,
}: Readonly<SearchFieldProps>): React.JSX.Element {
    return (
        <div className={cn('relative', className)}>
            <svg
                viewBox="0 0 20 20"
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-faint"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
            >
                <circle cx="9" cy="9" r="5.5" />
                <path d="m13.5 13.5 3.5 3.5" strokeLinecap="round" />
            </svg>
            <input
                type="text"
                value={value}
                aria-label={label}
                placeholder={label}
                onChange={(event) => {
                    onChange(event.target.value);
                }}
                className={cn(
                    'min-h-10 w-full rounded-control border bg-surface py-2 pl-9 pr-9 text-label text-ink placeholder:text-faint',
                    'shadow-[inset_0_1px_2px_rgb(17_23_41_/_0.04)]',
                    'transition-[border-color,box-shadow] duration-fast ease-standard',
                    'hover:border-line-strong focus:border-accent',
                    FOCUS_RING,
                )}
            />
            {clearLabel !== undefined && value.length > 0 && (
                <button
                    type="button"
                    aria-label={clearLabel}
                    onClick={() => {
                        onChange('');
                    }}
                    className={cn(
                        'absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-control',
                        'text-faint transition-colors duration-fast hover:bg-raised hover:text-ink',
                        FOCUS_RING,
                    )}
                >
                    <svg
                        viewBox="0 0 20 20"
                        className="h-3.5 w-3.5"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                    >
                        <path d="m5 5 10 10M15 5 5 15" strokeLinecap="round" />
                    </svg>
                </button>
            )}
        </div>
    );
}
