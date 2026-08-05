import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { useId } from 'react';

import { cn } from '../common';

const CONTROL_CLASS =
    'w-full rounded-md border bg-canvas px-3 py-2 text-sm text-ink placeholder:text-faint ' +
    'transition-colors focus:border-accent disabled:cursor-not-allowed disabled:opacity-60';

interface FieldShellProps {
    label: string;
    hint?: ReactNode;
    error?: string;
    children: (controlId: string, hasError: boolean) => ReactNode;
}

export function Field({ label, hint, error, children }: Readonly<FieldShellProps>): JSX.Element {
    const controlId = useId();
    const hasError = error !== undefined && error.length > 0;

    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={controlId} className="text-xs font-medium text-muted">
                {label}
            </label>
            {children(controlId, hasError)}
            {hasError ? (
                <p className="text-xs text-critical" role="alert">
                    {error}
                </p>
            ) : (
                hint !== undefined && <p className="text-xs leading-relaxed text-faint">{hint}</p>
            )}
        </div>
    );
}

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id'> & {
    label: string;
    hint?: ReactNode;
    error?: string;
};

export function TextField({ label, hint, error, ...rest }: Readonly<InputProps>): JSX.Element {
    return (
        <Field label={label} hint={hint} error={error}>
            {(controlId, hasError) => (
                <input
                    id={controlId}
                    aria-invalid={hasError}
                    className={cn(CONTROL_CLASS, hasError ? 'border-critical' : 'border-line')}
                    {...rest}
                />
            )}
        </Field>
    );
}

type TextAreaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className' | 'id'> & {
    label: string;
    hint?: ReactNode;
    error?: string;
};

export function TextAreaField({ label, hint, error, rows = 4, ...rest }: Readonly<TextAreaProps>): JSX.Element {
    return (
        <Field label={label} hint={hint} error={error}>
            {(controlId, hasError) => (
                <textarea
                    id={controlId}
                    rows={rows}
                    aria-invalid={hasError}
                    className={cn(CONTROL_CLASS, 'font-mono', hasError ? 'border-critical' : 'border-line')}
                    {...rest}
                />
            )}
        </Field>
    );
}

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

export function SelectField({ label, hint, error, options, placeholder, ...rest }: Readonly<SelectProps>): JSX.Element {
    return (
        <Field label={label} hint={hint} error={error}>
            {(controlId, hasError) => (
                <select
                    id={controlId}
                    aria-invalid={hasError}
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
}

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
        <div className="flex items-start gap-2.5">
            <input
                id={controlId}
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={(event) => {
                    onChange(event.target.checked);
                }}
                className="mt-0.5 h-4 w-4 rounded border-line bg-canvas text-accent focus:ring-accent"
            />
            <div className="flex flex-col gap-0.5">
                <label htmlFor={controlId} className="text-sm text-ink">
                    {label}
                </label>
                {hint !== undefined && <p className="text-xs leading-relaxed text-faint">{hint}</p>}
            </div>
        </div>
    );
}
