type ClassValue = string | false | null | undefined;

/** Joins class names while keeping the kit free of a styling runtime dependency. */
export function cn(...values: ClassValue[]): string {
    return values.filter(Boolean).join(' ');
}
