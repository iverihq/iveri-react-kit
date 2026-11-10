import { cn } from '../common/index.js';

interface SparklineProps {
    /** Oldest first. */
    values: number[];
    /** What the line is of, for somebody who cannot see it. */
    label: string;
    className?: string;
}

const WIDTH = 100;
const HEIGHT = 32;
const INSET = 2;

/**
 * A trend small enough to sit in a stat card.
 *
 * The shape is the message, so it carries no axis. It stretches to its box with a scale-free stroke,
 * which is why the end marker is an element of its own: drawn inside the stretched SVG it would come
 * out as an oval.
 */
export function Sparkline({ values, label, className }: Readonly<SparklineProps>): React.JSX.Element | null {
    if (values.length < 2) return null;

    const lowest = Math.min(...values);
    const range = Math.max(...values) - lowest || 1;
    const x = (index: number): number => (index / (values.length - 1)) * WIDTH;
    const y = (value: number): number => HEIGHT - INSET - ((value - lowest) / range) * (HEIGHT - INSET * 2);
    const line = values.map((value, index) => `${index === 0 ? 'M' : 'L'}${x(index)} ${y(value)}`).join(' ');
    const last = values[values.length - 1] ?? 0;

    return (
        <div role="img" aria-label={label} className={cn('relative h-8 w-full', className)}>
            <svg
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
                preserveAspectRatio="none"
                className="h-full w-full text-accent"
                aria-hidden="true"
            >
                <path d={`${line} L${WIDTH} ${HEIGHT} L0 ${HEIGHT} Z`} fill="currentColor" opacity="0.1" />
                <path
                    d={line}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
            <span
                className="absolute right-0 h-2 w-2 -translate-y-1/2 translate-x-1/2 rounded-full bg-accent ring-2 ring-surface"
                style={{ top: `${(y(last) / HEIGHT) * 100}%` }}
                aria-hidden="true"
            />
        </div>
    );
}
