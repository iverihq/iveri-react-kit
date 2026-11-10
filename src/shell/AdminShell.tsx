import { useEffect, useState, type ReactNode } from 'react';
import { Link, NavLink, useLocation } from 'react-router';

import { cn } from '../common/index.js';
import { useTranslation } from '../i18n/use-translation.js';

import { CommandPalette } from './CommandPalette.js';
import { ChevronIcon, CollapseIcon, MenuIcon, SearchIcon } from './shell-icons.js';
import {
    findActiveItem,
    type ShellCommand,
    type ShellNavItem,
    type ShellNavSection,
    type ShellUser,
} from './shell-navigation.js';
import { UserMenu, type UserMenuLink } from './UserMenu.js';

const COLLAPSED_KEY = 'iveri.shell.collapsed';

interface AdminShellProps {
    productName: string;
    sections: ShellNavSection[];
    /** Actions the search box can jump to that are not destinations — "New appointment". */
    commands?: ShellCommand[];
    user: ShellUser;
    userLinks?: UserMenuLink[];
    onSignOut: () => void;
    /** Anything a panel keeps in its top bar, before the search box. */
    headerActions?: ReactNode;
    /** Where the mark links to. */
    homePath?: string;
    children: ReactNode;
}

function readCollapsed(): boolean {
    try {
        return window.localStorage.getItem(COLLAPSED_KEY) === 'true';
    } catch {
        return false;
    }
}

function writeCollapsed(isCollapsed: boolean): void {
    try {
        window.localStorage.setItem(COLLAPSED_KEY, String(isCollapsed));
    } catch {
        // A private window can refuse storage; the sidebar then simply opens wide next time.
    }
}

const isMac = (): boolean => /mac|iphone|ipad/iu.test(navigator.platform);

/**
 * The frame of every admin panel: navy navigation down the side, the page's place and a search box
 * across the top.
 *
 * It lives here because all five panels had hand-built their own, and they had drifted. The labels
 * read the `web-shell` namespace directly, so a panel using this pulls that namespace, as each
 * already does. Navy is what gives the panels a recognisable frame while the working surface stays
 * white, which is why this is the one place the hero colour reaches into an admin screen.
 *
 * The search box lists the panel's own destinations and commands, and needs no server.
 */
export function AdminShell({
    productName,
    sections,
    commands = [],
    user,
    userLinks,
    onSignOut,
    headerActions,
    homePath = '/',
    children,
}: Readonly<AdminShellProps>): React.JSX.Element {
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(readCollapsed);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const active = findActiveItem(sections, pathname);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent): void => {
            if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                setIsSearching((current) => !current);
            }
        };

        window.addEventListener('keydown', onKeyDown);

        return (): void => {
            window.removeEventListener('keydown', onKeyDown);
        };
    }, []);

    function toggleCollapsed(): void {
        setIsCollapsed((current) => {
            writeCollapsed(!current);

            return !current;
        });
    }

    return (
        <div className="min-h-full bg-canvas text-ink">
            {isDrawerOpen && (
                <button
                    type="button"
                    aria-label={t('shell.close')}
                    onClick={() => {
                        setIsDrawerOpen(false);
                    }}
                    className="fixed inset-0 z-30 animate-fade-in bg-ink/40 lg:hidden"
                />
            )}
            <aside
                className={cn(
                    'fixed inset-y-0 left-0 z-40 flex w-72 flex-col bg-hero text-hero-ink',
                    'transition-[width,transform] duration-normal ease-standard',
                    isCollapsed ? 'lg:w-[4.5rem]' : 'lg:w-64',
                    isDrawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
                )}
            >
                <Link
                    to={homePath}
                    className={cn(
                        'flex h-16 shrink-0 items-center gap-3 border-b border-white/10 px-4',
                        isCollapsed && 'lg:justify-center lg:px-0',
                    )}
                >
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-white">
                        <img src="/iveri-logo-transparent.png" alt="Iveri" className="h-7 w-7" width="28" height="28" />
                    </span>
                    <span className={cn('min-w-0', isCollapsed && 'lg:hidden')}>
                        <span className="block text-2xs font-medium uppercase tracking-wider text-white/55">Iveri</span>
                        <span className="block truncate font-display text-body font-semibold leading-5">
                            {productName}
                        </span>
                    </span>
                </Link>
                <nav
                    aria-label={t('shell.section.workspace')}
                    className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-3 py-4"
                >
                    {sections.map((section, index) => (
                        <div key={section.label ?? index} className="flex flex-col gap-0.5">
                            {section.label !== undefined && (
                                <span
                                    className={cn(
                                        'px-3 pb-1.5 text-2xs font-semibold uppercase tracking-wider text-white/45',
                                        isCollapsed && 'lg:hidden',
                                    )}
                                >
                                    {section.label}
                                </span>
                            )}
                            {section.items.map((item) => (
                                <ShellLink
                                    key={item.to}
                                    item={item}
                                    isCollapsed={isCollapsed}
                                    onNavigate={() => {
                                        setIsDrawerOpen(false);
                                    }}
                                />
                            ))}
                        </div>
                    ))}
                </nav>
                <button
                    type="button"
                    onClick={toggleCollapsed}
                    aria-pressed={isCollapsed}
                    aria-label={t('shell.collapse')}
                    className={cn(
                        'hidden h-12 shrink-0 items-center gap-3 border-t border-white/10 px-6 text-small text-white/60',
                        'transition-colors duration-fast hover:text-white lg:flex',
                        isCollapsed && 'lg:justify-center lg:px-0',
                    )}
                >
                    <CollapseIcon isCollapsed={isCollapsed} />
                    {!isCollapsed && t('shell.collapse')}
                </button>
            </aside>
            <div
                className={cn(
                    'flex min-h-screen min-w-0 flex-col transition-[padding] duration-normal ease-standard',
                    isCollapsed ? 'lg:pl-[4.5rem]' : 'lg:pl-64',
                )}
            >
                <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-3 border-b border-line bg-surface/90 px-4 backdrop-blur lg:px-8">
                    <button
                        type="button"
                        aria-label={t('shell.menu')}
                        aria-expanded={isDrawerOpen}
                        onClick={() => {
                            setIsDrawerOpen(true);
                        }}
                        className="-ml-1.5 flex h-10 w-10 items-center justify-center rounded-control text-muted transition-colors duration-fast hover:bg-raised hover:text-ink lg:hidden"
                    >
                        <MenuIcon />
                    </button>
                    <div className="flex min-w-0 items-center gap-1.5 text-label">
                        {active?.section.label !== undefined && (
                            <>
                                <span className="hidden truncate text-muted sm:block">{active.section.label}</span>
                                <ChevronIcon className="hidden h-3.5 w-3.5 shrink-0 text-faint sm:block" />
                            </>
                        )}
                        {active !== null && (
                            <span className="truncate font-semibold text-ink">{active.item.label}</span>
                        )}
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        {headerActions}
                        <button
                            type="button"
                            onClick={() => {
                                setIsSearching(true);
                            }}
                            aria-label={t('shell.search')}
                            className="flex h-10 items-center gap-2 rounded-control border border-line bg-canvas px-3 text-small text-muted transition-colors duration-fast hover:border-line-strong hover:text-ink md:w-60"
                        >
                            <SearchIcon />
                            <span className="hidden flex-1 text-left md:block">{t('shell.search')}</span>
                            <kbd className="hidden rounded-xs border border-line bg-surface px-1.5 text-2xs text-faint md:block">
                                {isMac() ? '⌘K' : 'Ctrl K'}
                            </kbd>
                        </button>
                        <UserMenu user={user} links={userLinks} onSignOut={onSignOut} />
                    </div>
                </header>
                <main className="min-w-0 flex-1">{children}</main>
            </div>
            {isSearching && (
                <CommandPalette
                    sections={sections}
                    commands={commands}
                    onClose={() => {
                        setIsSearching(false);
                    }}
                />
            )}
        </div>
    );
}

function ShellLink({
    item,
    isCollapsed,
    onNavigate,
}: Readonly<{ item: ShellNavItem; isCollapsed: boolean; onNavigate: () => void }>): React.JSX.Element {
    return (
        <NavLink
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            title={isCollapsed ? item.label : undefined}
            className={({ isActive }) =>
                cn(
                    'relative flex min-h-10 items-center gap-3 rounded-control px-3 text-label',
                    'transition-colors duration-fast ease-standard',
                    'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-gold',
                    isCollapsed && 'lg:justify-center lg:px-0',
                    isActive
                        ? 'bg-white/12 font-semibold text-white before:absolute before:inset-y-2 before:-left-3 before:w-[3px] before:rounded-r-full before:bg-gold'
                        : 'text-white/70 hover:bg-white/8 hover:text-white',
                )
            }
        >
            <span className="shrink-0">{item.icon}</span>
            <span className={cn('min-w-0 flex-1 truncate', isCollapsed && 'lg:hidden')}>{item.label}</span>
            {item.badge !== undefined && (
                <span
                    className={cn(
                        'tabular shrink-0 rounded-full bg-gold px-1.5 text-2xs font-semibold text-hero',
                        isCollapsed && 'lg:hidden',
                    )}
                >
                    {item.badge}
                </span>
            )}
        </NavLink>
    );
}
