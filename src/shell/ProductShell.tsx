import type { ReactNode } from 'react';
import { Link, NavLink } from 'react-router';

import { cn } from '../common/index.js';
import { FOCUS_RING } from '../component/Button.js';
import { useTranslation } from '../i18n/use-translation.js';

import type { ShellNavItem, ShellUser } from './shell-navigation.js';
import { UserMenu, type UserMenuLink } from './UserMenu.js';

interface ProductShellProps {
    productName: string;
    items: ShellNavItem[];
    /** The one thing this product exists for, which stays in reach on every screen. */
    primaryAction?: { to: string; label: string };
    user: ShellUser;
    userLinks?: UserMenuLink[];
    onSignOut: () => void;
    homePath?: string;
    children: ReactNode;
}

/**
 * The frame of a product a customer uses: a bar across the top on a laptop, tabs along the bottom
 * on a phone, where the thumb already is.
 *
 * `main` carries no padding, because a booking screen wants the map to reach the edges.
 */
export function ProductShell({
    productName,
    items,
    primaryAction,
    user,
    userLinks,
    onSignOut,
    homePath = '/',
    children,
}: Readonly<ProductShellProps>): React.JSX.Element {
    const { t } = useTranslation();
    // The button in the bar already goes there, and a link beside it would say the same thing twice.
    // The phone has no room for that button, so its tabs keep the destination.
    const barItems = items.filter((item) => item.to !== primaryAction?.to);

    return (
        <div className="flex min-h-full flex-col bg-canvas text-ink">
            <header className="sticky top-0 z-30 border-b border-line bg-surface/90 backdrop-blur">
                <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-4 sm:px-6">
                    <Link to={homePath} className="flex shrink-0 items-center gap-2.5">
                        <img src="/iveri-logo-transparent.png" alt="" className="h-8 w-8" width="32" height="32" />
                        <span className="font-display text-h3 font-bold">{productName}</span>
                    </Link>
                    <nav aria-label={t('shell.section.workspace')} className="hidden items-center gap-1 md:flex">
                        {barItems.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    cn(
                                        'flex min-h-10 items-center gap-2 rounded-control px-3 text-label font-medium',
                                        'transition-colors duration-fast ease-standard',
                                        FOCUS_RING,
                                        isActive
                                            ? 'bg-accent-soft text-accent'
                                            : 'text-muted hover:bg-raised hover:text-ink',
                                    )
                                }
                            >
                                {item.icon}
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="ml-auto flex items-center gap-2">
                        {primaryAction !== undefined && (
                            <Link
                                to={primaryAction.to}
                                className={cn(
                                    'hidden min-h-10 items-center rounded-control bg-gold px-4 text-label font-semibold text-hero',
                                    'shadow-sm transition-colors duration-fast hover:bg-gold-hover sm:flex',
                                    FOCUS_RING,
                                )}
                            >
                                {primaryAction.label}
                            </Link>
                        )}
                        <UserMenu user={user} links={userLinks} onSignOut={onSignOut} />
                    </div>
                </div>
            </header>
            <main className="min-w-0 flex-1 pb-20 md:pb-0">{children}</main>
            <nav
                aria-label={t('shell.section.workspace')}
                className="fixed inset-x-0 bottom-0 z-30 grid border-t border-line bg-surface md:hidden"
                style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
            >
                {items.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        end={item.end}
                        className={({ isActive }) =>
                            cn(
                                'flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-2xs font-medium',
                                'transition-colors duration-fast',
                                isActive ? 'text-accent' : 'text-muted',
                            )
                        }
                    >
                        {item.icon}
                        <span className="max-w-full truncate">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
        </div>
    );
}
