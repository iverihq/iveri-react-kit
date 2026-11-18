import type { Maybe } from '@iveri/contracts';
import { LicenceKind, type ProductLicence } from '@iveri/contracts/platform';

import { Badge } from '../component/Badge.js';
import { useTranslation } from '../i18n/use-translation.js';

import { licenceStanding } from './licence-standing.js';

interface LicenceBadgeProps {
    /** `undefined` while it loads or when it cannot be read, `null` when the company never held one. */
    licence: Maybe<ProductLicence> | undefined;
    /** Today as a UTC `YYYY-MM-DD`; only a spec passes it. */
    today?: string;
}

/**
 * A company's licence for one product, in a table cell or beside a heading: where it stands in words with a dot of its
 * tone, and "Trial" beside it when it is one. The words carry the meaning; the colour only speeds up a scan.
 *
 * Strings are the `web-shell` namespace's `shell.licence.*`.
 */
export function LicenceBadge({ licence, today }: Readonly<LicenceBadgeProps>): React.JSX.Element {
    const { t } = useTranslation();

    if (licence === undefined) return <span className="text-muted">—</span>;
    if (licence === null) return <span className="text-muted">{t('shell.licence.none')}</span>;

    const standing = licenceStanding(licence, today);

    return (
        <span className="inline-flex flex-wrap items-center gap-1.5">
            <Badge tone={standing.tone} hasDot>
                {t(standing.labelKey, standing.values)}
            </Badge>
            {licence.kind === LicenceKind.TRIAL && <Badge>{t('shell.licence.kind.trial')}</Badge>}
        </span>
    );
}
