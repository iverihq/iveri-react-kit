import { MemoryRouter } from 'react-router';

import { LocaleProvider } from '../src/i18n/index.js';
import { ProductShell } from '../src/shell/index.js';

const CATALOG = {
    generatedAt: '2026-11-12T00:00:00.000Z',
    sourceLocale: 'ka',
    versions: {},
    locales: [{ code: 'ka', englishName: 'Georgian', nativeName: 'ქართული' }],
    messages: { ka: { 'shell.more': 'მეტი', 'shell.section.workspace': 'სამუშაო სივრცე' } },
};

const icon = (
    <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M3 5h14M3 10h14M3 15h9" strokeLinecap="round" />
    </svg>
);

const ITEMS = ['მთავარი', 'დასწრება', 'შვებულება', 'განვითარება', 'ჩემი გუნდი', 'თანამშრომლები'].map(
    (label, index) => ({
        to: `/${index}`,
        label,
        icon,
        badge: index === 4 ? 2 : undefined,
    }),
);

/** The product frame with Georgian labels, the longest the fleet ships, at `?shell`. */
export function ShellPreview(): React.JSX.Element {
    return (
        <LocaleProvider catalog={CATALOG} storageKey="shell-preview">
            <MemoryRouter initialEntries={['/0']}>
                <ProductShell
                    productName="HR"
                    items={ITEMS}
                    primaryAction={{ to: '/new', label: 'შვებულების მოთხოვნა' }}
                    user={{ name: 'Nino Beridze' }}
                    onSignOut={() => undefined}
                >
                    <p className="p-4 text-body text-ink">Content</p>
                </ProductShell>
            </MemoryRouter>
        </LocaleProvider>
    );
}
