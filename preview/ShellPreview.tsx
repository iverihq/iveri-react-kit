import { MemoryRouter } from 'react-router';

import { LocaleProvider } from '../src/i18n/index.js';
import { AdminShell, ProductShell } from '../src/shell/index.js';

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

/** Growth is the label too long for a fifth of a phone, so it carries the short word the bar shows instead. */
const ITEMS = [
    { label: 'მთავარი' },
    { label: 'დასწრება' },
    { label: 'შვებულებები', shortLabel: 'შვებულება' },
    { label: 'განვითარება', shortLabel: 'ზრდა' },
    { label: 'ჩემი გუნდი' },
    { label: 'თანამშრომლები' },
].map((names, index) => ({
    to: `/${index}`,
    ...names,
    icon,
    badge: index === 4 ? 2 : undefined,
}));

/** Admin labels and names as long as the fleet ships, in Georgian and Russian, which the sidebar must wrap, not cut. */
const ADMIN_SECTIONS = [
    {
        label: 'სამუშაო დღეები და დასწრება',
        items: [
            { to: '/0', label: 'მიმოხილვა', icon },
            { to: '/1', label: 'შვებულების წესები და გამონაკლისები', icon, badge: 3 },
            { to: '/2', label: 'Правила отсутствий и исключения', icon },
            { to: '/3', label: 'Испытательный срок', icon },
        ],
    },
];

function AdminShellPreview(): React.JSX.Element {
    return (
        <AdminShell
            productName="კლინიკის მართვის პანელი"
            sections={ADMIN_SECTIONS}
            user={{ name: 'ალექსანდრე ჯავახიშვილი-ორბელიანი', detail: 'ჯანმრთელობის ცენტრი „მედიკლინიკა"' }}
            onSignOut={() => undefined}
        >
            <p className="p-4 text-body text-ink">Content</p>
        </AdminShell>
    );
}

/** The product frame with Georgian labels, the longest the fleet ships, at `?shell`; the admin frame at `?shell=admin`. */
export function ShellPreview(): React.JSX.Element {
    if (new URLSearchParams(window.location.search).get('shell') === 'admin') {
        return (
            <LocaleProvider catalog={CATALOG} storageKey="shell-preview">
                <MemoryRouter initialEntries={['/1']}>
                    <AdminShellPreview />
                </MemoryRouter>
            </LocaleProvider>
        );
    }

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
