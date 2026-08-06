import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '../common';

import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
    primary: 'bg-accent text-accent-ink hover:brightness-95 active:brightness-90 disabled:bg-accent/40',
    secondary: 'border border-line bg-surface text-ink hover:border-muted hover:bg-raised active:bg-raised',
    ghost: 'text-muted hover:bg-raised hover:text-ink active:bg-line/70',
    danger: 'border border-critical/30 bg-critical/10 text-critical hover:bg-critical/20 active:bg-critical/25',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
    sm: 'min-h-11 px-3 text-sm gap-1.5',
    md: 'min-h-11 px-4 text-sm gap-2',
};

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    leadingIcon?: ReactNode;
    className?: string;
    children?: ReactNode;
}

export function Button({
    variant = 'secondary',
    size = 'md',
    isLoading = false,
    leadingIcon,
    children,
    disabled,
    type = 'button',
    className,
    ...rest
}: Readonly<ButtonProps>): JSX.Element {
    return (
        <button
            type={type}
            disabled={disabled === true || isLoading}
            aria-busy={isLoading || undefined}
            className={cn(
                'inline-flex items-center justify-center rounded-md font-medium transition-colors duration-150',
                'disabled:cursor-not-allowed disabled:opacity-60',
                VARIANT_CLASS[variant],
                SIZE_CLASS[size],
                className,
            )}
            {...rest}
        >
            {isLoading ? <Spinner size="sm" /> : leadingIcon}
            {children}
        </button>
    );
}
