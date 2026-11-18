import { IveriProduct, LicenceKind, LicenceStatus, type ProductLicence } from '@iveri/contracts/platform';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { LocaleProvider } from '../i18n/LocaleProvider.js';

import { LICENCE_ENDING_SOON_DAYS, daysBetween, licenceStanding } from './licence-standing.js';
import { LicenceBadge } from './LicenceBadge.js';
import { LicencePanel } from './LicencePanel.js';

// An empty catalogue renders every key as itself, which is what these assertions read.
const CATALOG = {
    generatedAt: '2026-11-18T00:00:00.000Z',
    sourceLocale: 'en',
    versions: {},
    locales: [{ code: 'en', englishName: 'English', nativeName: 'English' }],
    messages: { en: {} },
};

const TODAY = '2026-11-18';

const licence = (overrides: Partial<ProductLicence> = {}): ProductLicence => ({
    id: '7d0c9f1e-0000-4000-8000-000000000001',
    tenantId: '7d0c9f1e-0000-4000-8000-000000000002',
    product: IveriProduct.TAXI,
    kind: LicenceKind.PAID,
    seats: null,
    startsOn: '2026-11-01',
    endsOn: null,
    status: LicenceStatus.ACTIVE,
    note: null,
    cancelledAt: null,
    createdAt: '2026-11-01T00:00:00.000Z',
    updatedAt: '2026-11-01T00:00:00.000Z',
    ...overrides,
});

const withLocale = (node: React.ReactNode): void => {
    render(
        <LocaleProvider catalog={CATALOG} storageKey="licence-spec">
            {node}
        </LocaleProvider>,
    );
};

describe('licenceStanding', () => {
    it('reads a live licence with no last day, or one far off, as active and green', () => {
        expect(licenceStanding(licence(), TODAY)).toEqual({
            labelKey: 'shell.licence.status.active',
            tone: 'positive',
        });
        expect(licenceStanding(licence({ endsOn: '2027-06-01' }), TODAY).labelKey).toBe('shell.licence.status.active');
    });

    it('reads a live licence within the window as ending, with the days left, through its last day', () => {
        expect(licenceStanding(licence({ endsOn: '2026-11-30' }), TODAY)).toEqual({
            labelKey: 'shell.licence.status.ending',
            values: { count: 12 },
            tone: 'caution',
        });
        expect(licenceStanding(licence({ endsOn: TODAY }), TODAY).values).toEqual({ count: 0 });
        const edge = new Date(Date.parse(`${TODAY}T00:00:00Z`) + LICENCE_ENDING_SOON_DAYS * 86_400_000)
            .toISOString()
            .slice(0, 10);
        expect(licenceStanding(licence({ endsOn: edge }), TODAY).labelKey).toBe('shell.licence.status.ending');
    });

    it('gives every other status its own words, and only a live licence is green', () => {
        expect(licenceStanding(licence({ status: LicenceStatus.SCHEDULED }), TODAY).tone).toBe('info');
        expect(licenceStanding(licence({ status: LicenceStatus.EXPIRED, endsOn: '2026-11-01' }), TODAY)).toEqual({
            labelKey: 'shell.licence.status.expired',
            tone: 'caution',
        });
        expect(licenceStanding(licence({ status: LicenceStatus.CANCELLED }), TODAY)).toEqual({
            labelKey: 'shell.licence.status.cancelled',
            tone: 'neutral',
        });
    });

    it('counts calendar days in UTC', () => {
        expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
        expect(daysBetween('2026-11-18', '2026-11-17')).toBe(-1);
    });
});

describe('LicenceBadge', () => {
    it('says in words that a company never held one, and shows a dash while it loads', () => {
        withLocale(
            <>
                <LicenceBadge licence={null} />
                <LicenceBadge licence={undefined} />
            </>,
        );

        expect(screen.getByText('shell.licence.none')).toBeTruthy();
        expect(screen.getByText('—')).toBeTruthy();
    });

    it('marks a trial beside its standing', () => {
        withLocale(<LicenceBadge licence={licence({ kind: LicenceKind.TRIAL })} today={TODAY} />);

        expect(screen.getByText('shell.licence.status.active')).toBeTruthy();
        expect(screen.getByText('shell.licence.kind.trial')).toBeTruthy();
    });
});

describe('LicencePanel', () => {
    it('shows the standing, kind, days in UTC and seats', () => {
        withLocale(<LicencePanel licence={licence({ endsOn: '2027-03-31', seats: 1200 })} today={TODAY} />);

        expect(screen.getByText('shell.licence.title')).toBeTruthy();
        expect(screen.getByText('shell.licence.kind.paid')).toBeTruthy();
        expect(screen.getByText('Nov 1, 2026')).toBeTruthy();
        expect(screen.getByText('Mar 31, 2027')).toBeTruthy();
        expect(screen.getByText('1,200')).toBeTruthy();
    });

    it('says when there is no limit and no last day', () => {
        withLocale(<LicencePanel licence={licence()} today={TODAY} />);

        expect(screen.getByText('shell.licence.ends.open')).toBeTruthy();
        expect(screen.getByText('shell.licence.seats.unlimited')).toBeTruthy();
    });

    it('says when there is none, and when billing could not be asked', () => {
        withLocale(
            <>
                <LicencePanel licence={null} />
                <LicencePanel licence={undefined} isUnavailable />
            </>,
        );

        expect(screen.getByText('shell.licence.none-description')).toBeTruthy();
        expect(screen.getByText('shell.licence.unavailable')).toBeTruthy();
    });
});
