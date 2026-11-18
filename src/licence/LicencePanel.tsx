import type { Maybe } from '@iveri/contracts';
import { LicenceKind, type ProductLicence } from '@iveri/contracts/platform';
import type { ReactNode } from 'react';

import { Panel } from '../component/Panel.js';
import { Skeleton } from '../component/Skeleton.js';
import { useTranslation } from '../i18n/use-translation.js';

import { LicenceBadge } from './LicenceBadge.js';

interface LicencePanelProps {
    /** `undefined` while it loads, `null` when the company never held one. */
    licence: Maybe<ProductLicence> | undefined;
    /** Billing could not be asked; says so instead of loading for ever. */
    isUnavailable?: boolean;
    /** Beside the heading: in a product backoffice, the link to the company in Iveri's backoffice. */
    actions?: ReactNode;
    /** Today as a UTC `YYYY-MM-DD`; only a spec passes it. */
    today?: string;
}

/** A licence's days are UTC calendar days, so they are shown in UTC: in Tbilisi the last day must not move. */
function formatDay(day: string, locale: string): string {
    return new Intl.DateTimeFormat(locale, { dateStyle: 'medium', timeZone: 'UTC' }).format(
        new Date(`${day}T00:00:00Z`),
    );
}

/**
 * A company's licence for one product on its page in a product backoffice: where it stands, its kind, first and last
 * day and seats. It only shows; a licence is changed in Iveri's backoffice, which `actions` links to.
 *
 * Strings are the `web-shell` namespace's `shell.licence.*`.
 */
export function LicencePanel({
    licence,
    isUnavailable = false,
    actions,
    today,
}: Readonly<LicencePanelProps>): React.JSX.Element {
    const { t, locale } = useTranslation();

    return (
        <Panel title={t('shell.licence.title')} actions={actions}>
            {isUnavailable ? (
                <p className="text-body text-muted">{t('shell.licence.unavailable')}</p>
            ) : licence === undefined ? (
                <Skeleton className="h-20 w-full" />
            ) : licence === null ? (
                <p className="text-body text-muted">{t('shell.licence.none-description')}</p>
            ) : (
                <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2 lg:grid-cols-5">
                    <Detail label={t('shell.licence.field.status')}>
                        <LicenceBadge licence={licence} today={today} />
                    </Detail>
                    <Detail label={t('shell.licence.field.kind')}>
                        {t(licence.kind === LicenceKind.TRIAL ? 'shell.licence.kind.trial' : 'shell.licence.kind.paid')}
                    </Detail>
                    <Detail label={t('shell.licence.field.starts')}>{formatDay(licence.startsOn, locale)}</Detail>
                    <Detail label={t('shell.licence.field.ends')}>
                        {licence.endsOn === null ? t('shell.licence.ends.open') : formatDay(licence.endsOn, locale)}
                    </Detail>
                    <Detail label={t('shell.licence.field.seats')}>
                        {licence.seats === null
                            ? t('shell.licence.seats.unlimited')
                            : new Intl.NumberFormat(locale).format(licence.seats)}
                    </Detail>
                </dl>
            )}
        </Panel>
    );
}

function Detail({ label, children }: Readonly<{ label: string; children: ReactNode }>): React.JSX.Element {
    return (
        <div className="flex min-w-0 flex-col gap-1">
            <dt className="text-caption font-medium text-muted">{label}</dt>
            <dd className="text-body text-ink">{children}</dd>
        </div>
    );
}
