/**
 * How many minor units a currency has. Asked of `Intl` rather than assumed to be 100: the yen has none and the
 * Kuwaiti dinar has three, so a hard-coded 100 is wrong in both directions. The count belongs to the currency, not
 * to the reader's language, so it is read in one fixed locale.
 */
export function minorDigits(currency: string): number {
    return new Intl.NumberFormat('en', { style: 'currency', currency }).resolvedOptions().maximumFractionDigits ?? 2;
}

/** An amount held in minor units, written in its own currency and the reader's language. */
export function formatMoney(amountMinor: number, currency: string, locale: string): string {
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(
        amountMinor / 10 ** minorDigits(currency),
    );
}

/** An amount in minor units as somebody would type it into a price field: `12000` GEL reads `120.00`. */
export function fromMinorUnits(amountMinor: number, currency: string): string {
    const digits = minorDigits(currency);

    return (amountMinor / 10 ** digits).toFixed(digits);
}

/**
 * A typed price in minor units, or `null` when it is not one. Read as text and never through a float, so `19.99`
 * is 1999 rather than 1998.9999. A comma is read as the decimal separator, because that is how half the people who
 * type into these fields write one.
 */
export function toMinorUnits(text: string, currency: string): number | null {
    const digits = minorDigits(currency);
    const trimmed = text.trim().replace(',', '.');
    const pattern = digits === 0 ? /^\d+$/ : new RegExp(`^\\d+(\\.\\d{1,${digits}})?$`);

    if (!pattern.test(trimmed)) {
        return null;
    }

    const [whole = '', fraction = ''] = trimmed.split('.');

    return Number(whole) * 10 ** digits + Number(fraction.padEnd(digits, '0'));
}
