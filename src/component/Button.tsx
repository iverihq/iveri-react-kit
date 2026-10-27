import type { ButtonHTMLAttributes, ReactNode } from 'react';

import { cn } from '../common/index.js';

import { Spinner } from './Spinner.js';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-solid' | 'link';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

const VARIANT_CLASS: Record<ButtonVariant, string> = {
    // `shadow-inset` is the hairline along the top edge. Without it a filled navy button is a
    // flat rectangle; with it the surface has a direction, which is what reads as a button.
    primary: cn(
        'bg-accent text-accent-ink shadow-sm shadow-inset',
        'hover:bg-accent-hover hover:shadow-md',
        'disabled:bg-accent/40 disabled:shadow-none',
    ),
    secondary: cn(
        'border border-line bg-surface text-ink shadow-sm',
        'hover:border-line-strong hover:bg-raised hover:shadow-md',
    ),
    ghost: 'text-muted hover:bg-raised hover:text-ink',
    danger: cn(
        'border border-critical/25 bg-critical-soft text-critical',
        'hover:border-critical/40 hover:bg-critical/15',
    ),
    'danger-solid': cn(
        'bg-critical text-white shadow-sm shadow-inset',
        'hover:brightness-95 hover:shadow-md',
        'disabled:bg-critical/40 disabled:shadow-none',
    ),
    // A link that is a button. Underlined on hover rather than always, so a row of them does
    // not read as a paragraph of links.
    link: 'text-link underline-offset-4 hover:underline',
};

/**
 * The shared keyboard focus indicator.
 *
 * A ring rather than a colour change, because the design standard says colour never carries
 * meaning alone and focus is meaning. It is also the one state a keyboard user needs on every
 * control, so it is defined once here rather than per component, where six panels would drift.
 */
export const FOCUS_RING =
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface';

/**
 * Sizes.
 *
 * `md` is 40px and `sm` is 36px, where both used to be 44px — which is why they looked
 * identical and why a button inside a table row crowded it. 44px remains the comfortable
 * target and is what `lg` is for; WCAG 2.2 AA asks for 24px, so every size here clears it
 * with room. Do not take `xs` below this.
 */
const SIZE_CLASS: Record<ButtonSize, string> = {
    xs: 'min-h-7 px-2 text-caption gap-1',
    sm: 'min-h-9 px-3 text-label gap-1.5',
    md: 'min-h-10 px-4 text-label gap-2',
    lg: 'min-h-12 px-5 text-body gap-2',
};

const LINK_SIZE_CLASS: Record<ButtonSize, string> = {
    xs: 'text-caption',
    sm: 'text-label',
    md: 'text-label',
    lg: 'text-body',
};

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    leadingIcon?: ReactNode;
    trailingIcon?: ReactNode;
    /** Stretches to the container, for a form's submit and a dialog's confirm. */
    isBlock?: boolean;
    className?: string;
    children?: ReactNode;
}

export function Button({
    variant = 'secondary',
    size = 'md',
    isLoading = false,
    leadingIcon,
    trailingIcon,
    isBlock = false,
    children,
    disabled,
    type = 'button',
    className,
    ...rest
}: Readonly<ButtonProps>): JSX.Element {
    const isLink = variant === 'link';

    return (
        <button
            type={type}
            disabled={disabled === true || isLoading}
            aria-busy={isLoading || undefined}
            className={cn(
                'inline-flex items-center justify-center font-medium',
                // Colour, shadow and transform together, so the press reads as one movement
                // rather than a colour change that happens to coincide with a nudge.
                'transition-[color,background-color,border-color,box-shadow,transform] duration-fast ease-standard',
                'disabled:cursor-not-allowed disabled:opacity-60',
                // 1px down on press. The cheapest convincing affordance there is, and it costs
                // nothing on a control that is not pressed.
                !isLink && 'rounded-control active:translate-y-px disabled:active:translate-y-0',
                // `focus-visible`, not `focus`: a ring on every mouse click reads as a bug and
                // gets styled away, which is how buttons end up with no focus state at all
                // — which is where this one was.
                FOCUS_RING,
                isLink && 'rounded-sm focus-visible:ring-offset-1',
                VARIANT_CLASS[variant],
                isLink ? LINK_SIZE_CLASS[size] : SIZE_CLASS[size],
                isBlock && 'w-full',
                className,
            )}
            {...rest}
        >
            {isLoading ? <Spinner size={size === 'lg' ? 'md' : 'sm'} /> : leadingIcon}
            {children}
            {!isLoading && trailingIcon}
        </button>
    );
}
