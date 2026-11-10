const PROPS = {
    viewBox: '0 0 20 20',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.7,
    'aria-hidden': true,
} as const;

export function MenuIcon(): React.JSX.Element {
    return (
        <svg {...PROPS} className="h-5 w-5">
            <path d="M3 5.5h14M3 10h14M3 14.5h14" strokeLinecap="round" />
        </svg>
    );
}

export function SearchIcon(): React.JSX.Element {
    return (
        <svg {...PROPS} className="h-4 w-4">
            <circle cx="9" cy="9" r="5.5" />
            <path d="m13.5 13.5 3.5 3.5" strokeLinecap="round" />
        </svg>
    );
}

export function ChevronIcon({ className }: Readonly<{ className?: string }>): React.JSX.Element {
    return (
        <svg {...PROPS} className={className ?? 'h-4 w-4'}>
            <path d="m7.5 4.5 5.5 5.5-5.5 5.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function SignOutIcon(): React.JSX.Element {
    return (
        <svg {...PROPS} className="h-4 w-4">
            <path d="M8 3.5H5a1.5 1.5 0 0 0-1.5 1.5v10A1.5 1.5 0 0 0 5 16.5h3" strokeLinecap="round" />
            <path d="M12.5 6.5 16 10l-3.5 3.5M16 10H8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

export function CollapseIcon({ isCollapsed }: Readonly<{ isCollapsed: boolean }>): React.JSX.Element {
    return (
        <svg {...PROPS} className="h-4 w-4">
            <rect x="3" y="4" width="14" height="12" rx="2" />
            <path d="M8 4v12" />
            <path
                d={isCollapsed ? 'm11.5 8 2 2-2 2' : 'm13.5 8-2 2 2 2'}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
