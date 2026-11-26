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

function connectorClass(state: StepState): string {
    return state === 'upcoming' ? 'bg-line' : 'bg-accent';
}

/**
 * How far something has got, as a row of named steps.
 *
 * An ordered list rather than a progress bar, because every step has a name and the name is what
 * somebody waiting for a car or a parcel wants to read. A state carries a glyph as well as a
 * colour, so nothing depends on telling navy from grey.
 *
 * **A row only where there is room for it, a column below that.** In a row each step gets an equal
 * share of the width, and a label is never broken inside a word (a cut Georgian word reads as a
 * different word), so on a phone's card a label wider than its share ran into its neighbour: taxi's
 * "მოსვლა", the shop's "დადასტურდა", Russian "Прибытие". The switch is a container query rather
 * than a screen breakpoint because the same steps sit in a full-width page and in a narrow card on
 * one screen. 32rem gives five steps about 100px each, which every label shipped today fits.
 */
export function StatusSteps({
    steps,
    className,
}: Readonly<{ steps: StatusStep[]; className?: string }>): React.JSX.Element {
    return (
        <div className={cn('@container', className)}>
            <ol className="flex flex-col @lg:flex-row @lg:items-start">
                {steps.map((step, index) => {
                    const next = index < steps.length - 1 ? steps[index + 1] : null;

                    return (
                        <li
                            key={step.key}
                            aria-current={step.state === 'current' ? 'step' : undefined}
                            className="relative flex min-w-0 items-start gap-3 pb-4 last:pb-0 @lg:flex-1 @lg:flex-col @lg:items-center @lg:gap-2 @lg:pb-0 @lg:text-center"
                        >
                            {next !== null && (
                                <span
                                    className={cn(
                                        'absolute bottom-0 left-3.5 top-7 w-0.5 -translate-x-1/2 @lg:hidden',
                                        connectorClass(next.state),
                                    )}
                                    aria-hidden="true"
                                />
                            )}
                            {index > 0 && (
                                <span
                                    className={cn(
                                        'absolute right-1/2 top-3.5 hidden h-0.5 w-full -translate-y-1/2 @lg:block',
                                        connectorClass(step.state),
                                    )}
                                    aria-hidden="true"
                                />
                            )}
                            <span
                                className={cn(
                                    'relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full',
                                    MARK_CLASS[step.state],
                                )}
                            >
                                <Mark state={step.state} position={index + 1} />
                            </span>
                            <span
                                className={cn(
                                    'min-w-0 pt-1 text-caption @lg:px-1 @lg:pt-0',
                                    step.state === 'upcoming' ? 'text-muted' : 'font-semibold text-ink',
                                )}
                            >
                                {step.label}
                            </span>
                        </li>
                    );
                })}
            </ol>
        </div>
    );
}
