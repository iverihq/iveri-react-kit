import type { ReactNode } from 'react';

export interface ShellNavItem {
    to: string;
    label: string;
    /** Decoration beside the label, never instead of it. */
    icon: ReactNode;
    /** A count beside the label — an open queue, an unread inbox. */
    badge?: ReactNode;
    /** Matches only the exact path, for a destination with other destinations beneath it. */
    end?: boolean;
}

export interface ShellNavSection {
    /** Absent for a group that is one destination, where a heading would repeat its only item. */
    label?: string;
    items: ShellNavItem[];
}

export interface ShellUser {
    name: string;
    /** The second line — a workspace, an address. */
    detail?: string;
    imageUrl?: string;
}

/** Something the command palette can jump to that is not in the navigation. */
export interface ShellCommand {
    to: string;
    label: string;
    icon?: ReactNode;
    /** What the command belongs to, on the right of its row. */
    group?: string;
}

function matches(item: ShellNavItem, pathname: string): boolean {
    if (pathname === item.to) return true;

    return item.end !== true && pathname.startsWith(`${item.to.replace(/\/$/u, '')}/`);
}

/**
 * The destination a path belongs to: the longest match, so that `/rides/new` is the booking screen
 * rather than the list above it.
 */
export function findActiveItem(
    sections: ShellNavSection[],
    pathname: string,
): { section: ShellNavSection; item: ShellNavItem } | null {
    let found: { section: ShellNavSection; item: ShellNavItem } | null = null;

    for (const section of sections) {
        for (const item of section.items) {
            if (matches(item, pathname) && (found === null || item.to.length > found.item.to.length)) {
                found = { section, item };
            }
        }
    }

    return found;
}

/** Every destination and command, narrowed to what the query names. */
export function filterCommands(sections: ShellNavSection[], commands: ShellCommand[], query: string): ShellCommand[] {
    const needle = query.trim().toLocaleLowerCase();
    const destinations = sections.flatMap((section) =>
        section.items.map((item) => ({ to: item.to, label: item.label, icon: item.icon, group: section.label })),
    );
    const everything: ShellCommand[] = [...commands, ...destinations];

    if (needle.length === 0) return everything;

    return everything.filter(
        (command) =>
            command.label.toLocaleLowerCase().includes(needle) ||
            (command.group?.toLocaleLowerCase().includes(needle) ?? false),
    );
}
