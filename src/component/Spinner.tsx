import { cn } from '../common/index.js';

const SIZE_CLASS = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-8 w-8' } as const;

interface SpinnerProps {
    size?: keyof typeof SIZE_CLASS;
    className?: string;
}

export function Spinner({ size = 'md', className }: Readonly<SpinnerProps>): JSX.Element {
    return (
        <svg
            className={cn('animate-spin', SIZE_CLASS[size], className)}
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
        >
            <circle className="opacity-20" cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" />
            <path
                className="opacity-90"
                d="M21 12a9 9 0 0 0-9-9"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
            />
        </svg>
    );
}
