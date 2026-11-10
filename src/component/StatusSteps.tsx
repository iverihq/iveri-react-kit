import { cn } from '../common/index.js';

export type StepState = 'done' | 'current' | 'upcoming' | 'stopped';

export interface StatusStep {
    key: string;
    label: string;
    state: StepState;
}

const MARK_CLASS: Record<StepState, string> = {
    done: 'bg-accent text-accent-ink',
    current: 'bg-accent-soft text-accent ring-2 ring-accent',
    upcoming: 'bg-raised text-faint ring-1 ring-inset ring-line',
    stopped: 'bg-critical-soft text-critical ring-2 ring-critical',
};

function Mark({ state, position }: Readonly<{ state: StepState; position: number }>): React.JSX.Element {
    if (state === 'done') {
        return (
            <svg
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden="true"
            >
                <path d="m3.5 8.5 3 3 6-7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        );
    }

    if (state === 'stopped') {
        return (
            <svg
                viewBox="0 0 16 16"
                className="h-3.5 w-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                aria-hidden="true"
            >
                <path d="m4.5 4.5 7 7m0-7-7 7" strokeLinecap="round" />
            </svg>
        );
    }

    return <span className="tabular text-caption font-semibold">{position}</span>;
}

/**
 * How far something has got, as a row of named steps.
 *
 * An ordered list rather than a progress bar, because every step has a name and the name is what
 * somebody waiting for a car or a parcel wants to read. A state carries a glyph as well as a
 * colour, so nothing depends on telling navy from grey.
 */
export function StatusSteps({
    steps,
    className,
}: Readonly<{ steps: StatusStep[]; className?: string }>): React.JSX.Element {
    return (
        <ol className={cn('flex items-start', className)}>
            {steps.map((step, index) => (
                <li
                    key={step.key}
                    aria-current={step.state === 'current' ? 'step' : undefined}
                    className="relative flex min-w-0 flex-1 flex-col items-center gap-2 text-center"
                >
                    {index > 0 && (
                        <span
                            className={cn(
                                'absolute right-1/2 top-3.5 h-0.5 w-full -translate-y-1/2',
                                step.state === 'upcoming' ? 'bg-line' : 'bg-accent',
                            )}
                            aria-hidden="true"
                        />
                    )}
                    <span
                        className={cn(
                            'relative flex h-7 w-7 items-center justify-center rounded-full',
                            MARK_CLASS[step.state],
                        )}
                    >
                        <Mark state={step.state} position={index + 1} />
                    </span>
                    <span
                        className={cn(
                            'px-1 text-caption',
                            step.state === 'upcoming' ? 'text-muted' : 'font-semibold text-ink',
                        )}
                    >
                        {step.label}
                    </span>
                </li>
            ))}
        </ol>
    );
}
