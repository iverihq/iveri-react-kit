import { LicenceStatus, type ProductLicence } from '@iveri/contracts/platform';

import type { BadgeTone } from '../component/Badge.js';

/** A live licence this close to its last day reads as ending, the one somebody should renew. */
export const LICENCE_ENDING_SOON_DAYS = 30;

const DAY_MS = 86_400_000;

/** How a licence reads where it stands: a `web-shell` key, its values, and the tone of its badge. */
export interface LicenceStanding {
    labelKey: string;
    values?: Readonly<Record<string, number>>;
    tone: BadgeTone;
}

/** Today as billing counts days: a `YYYY-MM-DD` calendar day in UTC. */
export function utcDay(now: Date = new Date()): string {
    return now.toISOString().slice(0, 10);
}

/** Whole days from `today` to `day`, both `YYYY-MM-DD`; negative once `day` has passed. */
export function daysBetween(today: string, day: string): number {
    return Math.round((Date.parse(`${day}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY_MS);
}

/**
 * Where a licence stands, from billing's status and its last day. Billing works the status out in UTC on every read;
 * the one thing this adds is "ending": a live licence within {@link LICENCE_ENDING_SOON_DAYS} of its last day.
 *
 * Only a live licence is green. An ended one and one about to end are amber, told apart by their words; a cancelled one
 * is grey, because calling a licence off is a decision rather than a failure.
 */
export function licenceStanding(licence: ProductLicence, today: string = utcDay()): LicenceStanding {
    switch (licence.status) {
        case LicenceStatus.SCHEDULED:
            return { labelKey: 'shell.licence.status.scheduled', tone: 'info' };
        case LicenceStatus.EXPIRED:
            return { labelKey: 'shell.licence.status.expired', tone: 'caution' };
        case LicenceStatus.CANCELLED:
            return { labelKey: 'shell.licence.status.cancelled', tone: 'neutral' };
        case LicenceStatus.ACTIVE: {
            const left = licence.endsOn === null ? null : daysBetween(today, licence.endsOn);
            if (left !== null && left >= 0 && left <= LICENCE_ENDING_SOON_DAYS) {
                return { labelKey: 'shell.licence.status.ending', values: { count: left }, tone: 'caution' };
            }
            return { labelKey: 'shell.licence.status.active', tone: 'positive' };
        }
    }
}
