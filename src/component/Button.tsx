import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '../common';

import { Spinner } from './Spinner';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
    primary: 'bg-accent text-accent-ink hover:bg-accent/90 disabled:bg-accent/40',
    secondary: 'bg-raised text-ink border border-line hover:border-faint hover:bg-raised/70',
    ghost: 'text-muted hover:text-ink hover:bg-raised',
    danger: 'bg-critical/10 text-critical border border-critical/30 hover:bg-critical/20',
};

const SIZE_CLASS: Record<ButtonSize, string> = {
    sm: 'h-8 px-3 text-xs gap-1.5',
    md: 'h-9 px-4 text-sm gap-2',
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
            className={cn(
                'inline-flex items-center justify-center rounded-md font-medium transition-colors',
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
