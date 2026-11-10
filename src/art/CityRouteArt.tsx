import { cn } from '../common/index.js';

const STREETS = [
    'M-20 96 L840 40',
    'M-20 216 L840 176',
    'M-20 344 L840 316',
    'M-20 470 L840 452',
    'M-20 590 L840 584',
    'M92 -20 L150 640',
    'M238 -20 L284 640',
    'M392 -20 L420 640',
    'M552 -20 L566 640',
    'M702 -20 L700 640',
];

const BLOCKS = [
    [172, 110, 62, 48],
    [302, 96, 76, 66],
    [440, 228, 96, 60],
    [590, 202, 86, 88],
    [116, 372, 90, 62],
    [300, 360, 94, 72],
    [584, 480, 88, 76],
    [442, 492, 96, 66],
];

/**
 * An abstract street map with one route across it, for the hero of a product about getting around.
 *
 * Drawn rather than fetched: it costs no request on a page a visitor has not asked anything of yet,
 * it works offline, and it cannot be mistaken for somewhere real. It is decoration, so a screen
 * reader skips it.
 */
export function CityRouteArt({ className }: Readonly<{ className?: string }>): React.JSX.Element {
    return (
        <svg
            viewBox="0 0 800 600"
            preserveAspectRatio="xMidYMid slice"
            className={cn('h-full w-full', className)}
            aria-hidden="true"
        >
            <path
                d="M-20 300 C 140 250 210 420 372 400 S 610 250 840 300 L 840 348 C 620 300 560 452 372 448 S 130 300 -20 348 Z"
                fill="#ffffff"
                opacity="0.05"
            />
            {BLOCKS.map(([x, y, width, height]) => (
                <rect
                    key={`${x}-${y}`}
                    x={x}
                    y={y}
                    width={width}
                    height={height}
                    rx="8"
                    fill="#ffffff"
                    opacity="0.05"
                />
            ))}
            {STREETS.map((street) => (
                <path key={street} d={street} stroke="#ffffff" strokeOpacity="0.14" strokeWidth="2" fill="none" />
            ))}
            <path
                d="M150 500 C 240 470 262 372 300 330 S 420 300 470 258 S 560 240 640 226"
                stroke="#f6c76d"
                strokeOpacity="0.25"
                strokeWidth="16"
                strokeLinecap="round"
                fill="none"
            />
            <path
                d="M150 500 C 240 470 262 372 300 330 S 420 300 470 258 S 560 240 640 226"
                stroke="#f6c76d"
                strokeWidth="5"
                strokeLinecap="round"
                fill="none"
            />
            <circle cx="150" cy="500" r="16" fill="#ffffff" />
            <circle cx="150" cy="500" r="8" fill="#14235c" />
            <path d="M640 142c-18 0-32 14-32 32 0 24 32 56 32 56s32-32 32-56c0-18-14-32-32-32Z" fill="#f6c76d" />
            <circle cx="640" cy="174" r="12" fill="#14235c" />
        </svg>
    );
}
