import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { forwardRef, useId } from 'react';

import { cn } from '../common/index.js';

import { FOCUS_RING } from './Button.js';

const CONTROL_CLASS = cn(
    'min-h-10 w-full rounded-control border bg-surface px-3 py-2 text-body text-ink placeholder:text-faint',
    'shadow-[inset_0_1px_2px_rgb(17_23_41_/_0.04)]',
    'transition-[border-color,box-shadow] duration-fast ease-standard',
    // A hover that darkens the border is what tells somebody the field is editable before they
    // click it. Without it an input and a read-only value box look the same.
    'hover:border-line-strong',
    'focus:border-accent',
    'disabled:cursor-not-allowed disabled:border-line disabled:bg-raised disabled:opacity-70 disabled:shadow-none',
    // The border colour alone was the whole focus indication, which is the one thing the design
    // standard forbids: colour carrying meaning by itself.
    FOCUS_RING,
);

interface FieldShellProps {
    label: string;
    hint?: ReactNode;
    error?: string;
    children: (controlId: string, hasError: boolean, descriptionId: string | undefined) => ReactNode;
}

export function Field({ label, hint, error, children }: Readonly<FieldShellProps>): JSX.Element {
    const controlId = useId();
    const descriptionId = useId();
    const hasError = error !== undefined && error.length > 0;
    const hasDescription = hasError || hint !== undefined;

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={controlId} className="text-label font-medium text-ink-soft">
                {label}
            </label>
            {children(controlId, hasError, hasDescription ? descriptionId : undefined)}
            {hasError ? (
                <p id={descriptionId} className="flex items-start gap-1.5 text-small text-critical" role="alert">
                    <svg
                        viewBox="0 0 16 16"
                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1Zm0 3.25a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0V5a.75.75 0 0 1 .75-.75ZM8 10.5a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8Z" />
                    </svg>
                    <span>{error}</span>
                </p>
            ) : (
                hint !== undefined && (
                    <p id={descriptionId} className="text-small text-muted">
                        {hint}
                    </p>
                )
            )}
        </div>
    );
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id'> & {
    label: string;
    hint?: ReactNode;
    error?: string;
};

export const TextField = forwardRef<HTMLInputElement, InputProps>(function TextField(
    { label, hint, error, ...rest },
    ref,
) {
    return (
        <Field label={label} hint={hint} error={error}>
            {(controlId, hasError, descriptionId) => (
                <input
                    ref={ref}
                    id={controlId}
                    aria-invalid={hasError}
                    aria-describedby={descriptionId}
                    className={cn(CONTROL_CLASS, hasError ? 'border-critical' : 'border-line')}
                    {...rest}
                />
            )}
        </Field>
    );
});

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'id'> & {
    label: string;
    hint?: ReactNode;
    error?: string;
};

export const TextAreaField = forwardRef<HTMLTextAreaElement, TextAreaProps>(function TextAreaField(
    { label, hint, error, rows = 4, ...rest },
    ref,
) {
    return (
        <Field label={label} hint={hint} error={error}>
            {(controlId, hasError, descriptionId) => (
                <textarea
                    ref={ref}
                    id={controlId}
                    rows={rows}
                    aria-invalid={hasError}
                    aria-describedby={descriptionId}
                    className={cn(CONTROL_CLASS, 'font-mono', hasError ? 'border-critical' : 'border-line')}
                    {...rest}
                />
            )}
        </Field>
    );
});

interface SelectOption {
    value: string;
    label: string;
}

type SelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'id' | 'children'> & {
    label: string;
    hint?: ReactNode;
    error?: string;
    options: SelectOption[];
    placeholder?: string;
};

export const SelectField = forwardRef<HTMLSelectElement, SelectProps>(function SelectField(
    { label, hint, error, options, placeholder, ...rest },
    ref,
) {
    return (
        <Field label={label} hint={hint} error={error}>
            {(controlId, hasError, descriptionId) => (
                <select
                    ref={ref}
                    id={controlId}
                    aria-invalid={hasError}
                    aria-describedby={descriptionId}
                    className={cn(CONTROL_CLASS, 'pr-8', hasError ? 'border-critical' : 'border-line')}
                    {...rest}
                >
                    {placeholder !== undefined && <option value="">{placeholder}</option>}
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            )}
        </Field>
    );
});

interface CheckboxProps {
    label: string;
    hint?: ReactNode;
    checked: boolean;
    onChange: (checked: boolean) => void;
    disabled?: boolean;
}

export function CheckboxField({ label, hint, checked, onChange, disabled }: Readonly<CheckboxProps>): JSX.Element {
    const controlId = useId();

    return (
        <div className="flex items-start gap-3">
            <input
                id={controlId}
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(event) => {
                    onChange(event.target.checked);
                }}
                className={cn(
                    'mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer rounded border-line bg-surface text-accent',
                    'transition-colors duration-fast disabled:cursor-not-allowed disabled:opacity-60',
                    FOCUS_RING,
                )}
            />
            <div className="flex flex-col gap-1">
                <label htmlFor={controlId} className="cursor-pointer text-label font-medium text-ink">
                    {label}
                </label>
                {hint !== undefined && <p className="text-small text-muted">{hint}</p>}
            </div>
        </div>
    );
}
