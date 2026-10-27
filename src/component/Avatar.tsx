import { cn } from '../common/index.js';

import { initialsOf } from './initials.js';

const SIZE_CLASS = {
    xs: 'h-6 w-6 text-2xs',
    sm: 'h-8 w-8 text-caption',
    md: 'h-10 w-10 text-label',
    lg: 'h-12 w-12 text-body',
} as const;

interface AvatarProps {
    /** The person or team the avatar stands for. Also the accessible name. */
    name: string;
    imageUrl?: string;
    size?: keyof typeof SIZE_CLASS;
    className?: string;
}

/**
 * A person, in one square.
 *
 * **One colour for everybody**, deliberately: tinting avatars by a hash of the name is the
 * common trick and it spends the product's only accent on decoration, which the standard
 * reserves for primary actions and selection. Recognition comes from the initials and from a
 * real photograph where there is one — not from a palette nobody can learn.
 */
export function Avatar({ name, imageUrl, size = 'md', className }: Readonly<AvatarProps>): JSX.Element {
    const shell = cn(
        'inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full',
        'ring-1 ring-inset ring-accent-line',
        SIZE_CLASS[size],
        className,
    );

    if (imageUrl !== undefined && imageUrl.length > 0) {
        return <img src={imageUrl} alt={name} className={cn(shell, 'bg-raised object-cover')} />;
    }

    return (
        <span
            role="img"
            aria-label={name}
            title={name}
            className={cn(shell, 'bg-accent-soft font-semibold text-accent')}
        >
            {initialsOf(name)}
        </span>
    );
}
