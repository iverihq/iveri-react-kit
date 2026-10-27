import { cn } from '../common/index.js';

interface SkeletonProps {
    /**
     * The size and shape of the thing being stood in for — `h-10 w-10 rounded-full` for an
     * avatar, `h-4 w-2/3` for a line.
     *
     * ⚠ **Required, and there is no default**, because `cn` joins classes without merging them:
     * a built-in `h-4 w-full` would still be in the class list beside a caller's `h-10 w-10`,
     * and which one wins is decided by the order Tailwind happens to emit its CSS rather than by
     * the caller. A skeleton avatar came out as a full-width bar exactly that way.
     *
     * The same trap applies to every component here: **ship no default utility a caller is
     * expected to override.** Adding `tailwind-merge` would fix it generally and costs the kit
     * a styling runtime it deliberately does not have.
     */
    className: string;
}

/**
 * A placeholder shaped like the thing that is loading.
 *
 * It sweeps rather than pulses, because a pulsing block and a disabled block look alike and a
 * sweep plainly means *in progress*. The gradient is a loading affordance rather than
 * decoration, which is why it is the one place in the system that uses one.
 */
export function Skeleton({ className }: Readonly<SkeletonProps>): JSX.Element {
    return (
        <div
            aria-hidden="true"
            className={cn(
                'animate-shimmer rounded bg-[length:200%_100%]',
                'bg-[linear-gradient(90deg,rgb(var(--color-raised)),rgb(var(--color-sunken)),rgb(var(--color-raised)))]',
                className,
            )}
        />
    );
}

/**
 * Several lines of it, for a block of text.
 *
 * The last line is short, because a loading paragraph whose every line is full width reads as a
 * table rather than prose.
 */
export function SkeletonText({ lines = 3 }: Readonly<{ lines?: number }>): JSX.Element {
    return (
        <div className="flex flex-col gap-2" role="status" aria-busy="true">
            {Array.from({ length: lines }, (_, index) => (
                <Skeleton key={index} className={index === lines - 1 ? 'h-4 w-2/3' : 'h-4 w-full'} />
            ))}
        </div>
    );
}
