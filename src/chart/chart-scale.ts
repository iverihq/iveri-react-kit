const CLEAN_STEPS = [1, 2, 2.5, 5, 10];

/** The smallest clean number at or above `value`, so an axis ends on 2,500 rather than on 2,317. */
export function niceMax(value: number): number {
    if (!Number.isFinite(value) || value <= 0) return 1;

    const magnitude = 10 ** Math.floor(Math.log10(value));
    const step = CLEAN_STEPS.find((candidate) => candidate * magnitude >= value) ?? 10;

    // Rounds away the float dust that `0.1 * 3` style multiplication leaves behind.
    return Number((step * magnitude).toPrecision(12));
}

/** Which labels fit: every one when there is room, then every second, third and so on, ending on the last. */
export function labelledIndexes(count: number, maximum: number): Set<number> {
    const interval = Math.max(1, Math.ceil(count / maximum));
    const indexes = new Set<number>();

    for (let index = count - 1; index >= 0; index -= interval) indexes.add(index);

    return indexes;
}
