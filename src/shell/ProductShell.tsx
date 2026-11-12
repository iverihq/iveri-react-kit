import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router';

import { cn } from '../common/index.js';
import { FOCUS_RING } from '../component/Button.js';
import { useTranslation } from '../i18n/use-translation.js';

import { findActiveItem, type ShellNavItem, type ShellUser } from './shell-navigation.js';
import { UserMenu, type UserMenuLink } from './UserMenu.js';

interface ProductShellProps {
    productName: string;
    /** A product with a look of its own draws its own mark. Absent, the Iveri mark beside the name. */
    brand?: ReactNode;
    items: ShellNavItem[];
    /** The one thing this product exists for, which stays in reach on every screen. */
    primaryAction?: { to: string; label: string };
    user: ShellUser;
    userLinks?: UserMenuLink[];
    onSignOut: () => void;
    homePath?: string;
    children: ReactNode;
}

function NavBadge({ children, className }: Readonly<{ children: ReactNode; className?: string }>): React.JSX.Element {
    return (
        <span
            className={cn(
                'tabular inline-flex min-w-4 items-center justify-center rounded-full bg-accent px-1 text-2xs font-semibold leading-4 text-white',
                className,
            )}
        >
            {children}
        </span>
    );
}

/**
 * The frame of a product a customer uses: a bar across the top on a laptop, tabs along the bottom
 * on a phone, where the thumb already is.
 *
 * `main` carries no padding, because a booking screen wants the map to reach the edges.
 */
export function ProductShell({
    productName,
    brand,
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
                        {brand ?? (
                            <>
                                <img
                                    src="/iveri-logo-transparent.png"
                                    alt=""
                                    className="h-8 w-8"
                                    width="32"
                                    height="32"
                                />
                                <span className="font-display text-h3 font-bold">{productName}</span>
                            </>
                        )}
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
                                {item.badge !== undefined && <NavBadge>{item.badge}</NavBadge>}
                            </NavLink>
                        ))}
                    </nav>
                    <div className="ml-auto flex items-center gap-2">
                        {primaryAction !== undefined && (
                            <Link
                                to={primaryAction.to}
                                className={cn(
                                    'hidden min-h-10 items-center whitespace-nowrap rounded-control bg-gold px-4 text-label font-semibold text-hero',
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
            <PhoneTabs items={items} />
        </div>
    );
}

/**
 * The most a phone's bar holds. Five labels already sit at 75 points each at 375 wide; a sixth cuts a Georgian label to
 * a stub, so past five the bar keeps four and gathers the rest under More.
 */
const MAX_PHONE_TABS = 5;

const tabClass = (isActive: boolean): string =>
    cn(
        'relative flex min-h-16 flex-col items-center justify-start gap-1 px-1 pb-1.5 pt-2.5 text-2xs font-medium',
        'transition-colors duration-fast',
        FOCUS_RING,
        isActive ? 'text-accent' : 'text-muted',
    );

/** Two lines rather than an ellipsis: a Georgian word cut short is a different word. */
function TabLabel({ children }: Readonly<{ children: ReactNode }>): React.JSX.Element {
    return (
        <span className="line-clamp-2 max-w-full text-center leading-tight [overflow-wrap:anywhere]">{children}</span>
    );
}

function TabIcon({ item }: Readonly<{ item: ShellNavItem }>): React.JSX.Element {
    return (
        <span className="relative">
            {item.icon}
            {item.badge !== undefined && <NavBadge className="absolute -right-3 -top-1.5">{item.badge}</NavBadge>}
        </span>
    );
}

function MoreIcon(): React.JSX.Element {
    return (
        <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden>
            <circle cx="4.5" cy="10" r="1.5" />
            <circle cx="10" cy="10" r="1.5" />
            <circle cx="15.5" cy="10" r="1.5" />
        </svg>
    );
}

/** The tabs along the bottom of a phone, with More holding whatever does not fit. */
function PhoneTabs({ items }: Readonly<{ items: ShellNavItem[] }>): React.JSX.Element {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    // Kept as the page it was opened on, so going somewhere else closes it without an effect: a page opened from the
    // sheet is not covered by it.
    const [openOn, setOpenOn] = useState<string | null>(null);
    const isMoreOpen = openOn === pathname;
    const root = useRef<HTMLElement>(null);
    const hasMore = items.length > MAX_PHONE_TABS;
    const tabs = hasMore ? items.slice(0, MAX_PHONE_TABS - 1) : items;
    const rest = hasMore ? items.slice(MAX_PHONE_TABS - 1) : [];
    const active = findActiveItem([{ items }], pathname);
    // More reads as where you are when the page you are on is one of the places it holds.
    const isInMore = active !== null && rest.some((item) => item.to === active.item.to);

    useEffect(() => {
        if (!isMoreOpen) return undefined;

        const onPointerDown = (event: PointerEvent): void => {
            if (!root.current?.contains(event.target as Node)) setOpenOn(null);
        };
        const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') setOpenOn(null);
        };

        document.addEventListener('pointerdown', onPointerDown);
        document.addEventListener('keydown', onKeyDown);

        return (): void => {
            document.removeEventListener('pointerdown', onPointerDown);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [isMoreOpen]);

    return (
        <nav
            ref={root}
            aria-label={t('shell.section.workspace')}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface md:hidden"
        >
            {isMoreOpen && (
                <ul
                    id="product-shell-more"
                    className="absolute inset-x-3 bottom-full mb-2 overflow-hidden rounded-card border border-line bg-surface py-1 shadow-lg"
                >
                    {rest.map((item) => (
                        <li key={item.to}>
                            <NavLink
                                to={item.to}
                                end={item.end}
                                className={({ isActive }) =>
                                    cn(
                                        'flex min-h-12 items-center gap-3 px-4 text-label font-medium',
                                        FOCUS_RING,
                                        isActive ? 'bg-accent-soft text-accent' : 'text-ink hover:bg-raised',
                                    )
                                }
                            >
                                {item.icon}
                                <span className="min-w-0 flex-1">{item.label}</span>
                                {item.badge !== undefined && <NavBadge>{item.badge}</NavBadge>}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            )}
            <div
                className="grid"
                style={{ gridTemplateColumns: `repeat(${tabs.length + (hasMore ? 1 : 0)}, minmax(0, 1fr))` }}
            >
                {tabs.map((item) => (
                    <NavLink key={item.to} to={item.to} end={item.end} className={({ isActive }) => tabClass(isActive)}>
                        <TabIcon item={item} />
                        <TabLabel>{item.label}</TabLabel>
                    </NavLink>
                ))}
                {hasMore && (
                    <button
                        type="button"
                        aria-expanded={isMoreOpen}
                        aria-controls="product-shell-more"
                        onClick={() => {
                            setOpenOn(isMoreOpen ? null : pathname);
                        }}
                        className={tabClass(isMoreOpen || isInMore)}
                    >
                        <span className="relative">
                            <MoreIcon />
                            {rest.some((item) => item.badge !== undefined) && (
                                <span className="absolute -right-1 -top-0.5 h-2 w-2 rounded-full bg-accent" />
                            )}
                        </span>
                        <TabLabel>{t('shell.more')}</TabLabel>
                    </button>
                )}
            </div>
        </nav>
    );
}
