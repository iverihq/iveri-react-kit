import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link } from 'react-router';

import { cn } from '../common/index.js';
import { Avatar } from '../component/Avatar.js';
import { FOCUS_RING } from '../component/Button.js';
import { LocaleSelect } from '../i18n/LocaleSelect.js';
import { useTranslation } from '../i18n/use-translation.js';

import { ChevronIcon, SignOutIcon } from './shell-icons.js';
import type { ShellUser } from './shell-navigation.js';

export interface UserMenuLink {
    to: string;
    label: string;
    icon?: ReactNode;
}

interface UserMenuProps {
    user: ShellUser;
    links?: UserMenuLink[];
    onSignOut: () => void;
}

/** Who is signed in, their language and the way out. */
export function UserMenu({ user, links = [], onSignOut }: Readonly<UserMenuProps>): React.JSX.Element {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const root = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return undefined;

        const onPointerDown = (event: PointerEvent): void => {
            if (!root.current?.contains(event.target as Node)) setIsOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') setIsOpen(false);
        };

        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);

        return (): void => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isOpen]);

    return (
        <div ref={root} className="relative">
            <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-label={t('shell.account')}
                onClick={() => {
                    setIsOpen((current) => !current);
                }}
                className={cn(
                    'flex min-h-10 items-center gap-2 rounded-full p-1 transition-colors duration-fast hover:bg-raised lg:pr-2',
                    FOCUS_RING,
                )}
            >
                <Avatar name={user.name} imageUrl={user.imageUrl} size="sm" />
                <span className="hidden max-w-36 truncate text-label font-medium text-ink-soft lg:block">
                    {user.name}
                </span>
                <ChevronIcon
                    className={cn('hidden h-3.5 w-3.5 text-faint lg:block', isOpen ? '-rotate-90' : 'rotate-90')}
                />
            </button>
            {isOpen && (
                <div className="absolute right-0 z-40 mt-2 w-72 animate-scale-in overflow-hidden rounded-card border border-line bg-surface shadow-xl">
                    <div className="flex items-center gap-3 border-b border-line p-4">
                        <Avatar name={user.name} imageUrl={user.imageUrl} />
                        <div className="min-w-0">
                            <p className="truncate text-label font-semibold text-ink">{user.name}</p>
                            {user.detail !== undefined && (
                                <p className="truncate text-small text-muted">{user.detail}</p>
                            )}
                        </div>
                    </div>
                    {links.length > 0 && (
                        <div className="border-b border-line p-1.5">
                            {links.map((link) => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    onClick={() => {
                                        setIsOpen(false);
                                    }}
                                    className="flex min-h-10 items-center gap-3 rounded-control px-3 text-label text-ink-soft transition-colors duration-fast hover:bg-raised"
                                >
                                    {link.icon}
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                    )}
                    <div className="border-b border-line p-3">
                        <LocaleSelect label={t('shell.language')} />
                    </div>
                    <div className="p-1.5">
                        <button
                            type="button"
                            onClick={onSignOut}
                            className="flex min-h-10 w-full items-center gap-3 rounded-control px-3 text-label text-ink-soft transition-colors duration-fast hover:bg-raised"
                        >
                            <SignOutIcon />
                            {t('shell.sign-out')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
