import type { ReactNode } from 'react';
import { useState } from 'react';

import {
    Avatar,
    Badge,
    Button,
    CheckboxField,
    EmptyState,
    PageHeader,
    Panel,
    SegmentedControl,
    SelectField,
    Skeleton,
    SkeletonText,
    Spinner,
    StatCard,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeaderCell,
    TableRow,
    TextAreaField,
    TextField,
} from '../src/index.js';

function Section({
    title,
    note,
    children,
}: Readonly<{ title: string; note?: string; children: ReactNode }>): JSX.Element {
    return (
        <section className="flex flex-col gap-4">
            <div className="flex flex-col gap-1 border-b border-line pb-2">
                <h2 className="font-display text-h2 font-bold text-ink">{title}</h2>
                {note !== undefined && <p className="max-w-3xl text-small text-muted">{note}</p>}
            </div>
            {children}
        </section>
    );
}

const TOKENS = [
    ['canvas', 'bg-canvas'],
    ['surface', 'bg-surface'],
    ['raised', 'bg-raised'],
    ['sunken', 'bg-sunken'],
    ['line', 'bg-line'],
    ['line-strong', 'bg-line-strong'],
    ['faint', 'bg-faint'],
    ['muted', 'bg-muted'],
    ['ink-soft', 'bg-ink-soft'],
    ['ink', 'bg-ink'],
    ['accent-soft', 'bg-accent-soft'],
    ['accent-line', 'bg-accent-line'],
    ['link', 'bg-link'],
    ['accent', 'bg-accent'],
    ['positive', 'bg-positive'],
    ['caution', 'bg-caution'],
    ['critical', 'bg-critical'],
    ['info', 'bg-info'],
] as const;

const ORDERS = [
    { id: 'IV-10294', buyer: 'Ana Beridze', status: 'Fulfilled', tone: 'positive', total: '142.50', lines: 3 },
    { id: 'IV-10293', buyer: 'Nikoloz Kapanadze', status: 'On its way', tone: 'info', total: '38.00', lines: 1 },
    {
        id: 'IV-10292',
        buyer: 'Mariam Tsiklauri',
        status: 'Awaiting payment',
        tone: 'caution',
        total: '1,204.99',
        lines: 12,
    },
    { id: 'IV-10291', buyer: 'Giorgi Abashidze', status: 'Undeliverable', tone: 'critical', total: '76.20', lines: 2 },
] as const;

export function Gallery(): JSX.Element {
    const [filter, setFilter] = useState<'all' | 'open' | 'done'>('open');
    const [selected, setSelected] = useState('IV-10293');
    const [isSubscribed, setIsSubscribed] = useState(true);

    return (
        <div className="mx-auto flex max-w-[1200px] flex-col gap-14 px-4 py-10 sm:px-8">
            <PageHeader
                eyebrow="Design foundation"
                title="Iveri component gallery"
                description="Every primitive in @iveri/react-kit, rendered through the published Tailwind preset and the shared token stylesheet. If a token cannot resolve here, it cannot resolve in a panel."
                actions={
                    <>
                        <Button variant="secondary">View tokens</Button>
                        <Button variant="primary">Primary action</Button>
                    </>
                }
            />

            <Section
                title="Typography"
                note="Inter Variable for UI, Inter Tight Variable for headings, Noto Sans Georgian for a script Inter does not carry. Negative tracking at display sizes is the clearest difference between type that was set and type merely made bigger."
            >
                <Panel>
                    <div className="flex flex-col gap-4">
                        <p className="font-display text-display font-bold text-ink">Display 40/48</p>
                        <p className="font-display text-h1 font-bold text-ink">Heading 1 — 32/40</p>
                        <p className="font-display text-h2 font-bold text-ink">Heading 2 — 24/32</p>
                        <p className="font-display text-h3 font-semibold text-ink">Heading 3 — 18/28</p>
                        <p className="text-body text-ink">
                            Body 16/24 — the default reading size, never shrunk to fit more on a screen.
                        </p>
                        <p className="text-label font-medium text-ink-soft">
                            Label 14/20 — form labels, controls, navigation.
                        </p>
                        <p className="text-small text-muted">
                            Small 14/20 — supporting copy, never critical instructions.
                        </p>
                        <p className="text-caption font-medium uppercase tracking-wider text-faint">
                            Caption 12/16 — dense metadata only
                        </p>
                        <div className="mt-2 flex flex-col gap-2 border-t border-line pt-4">
                            <p className="text-body text-ink">The quick brown fox — 0123456789 Il1 O0</p>
                            <p className="text-body text-ink">Быстрая бурая лиса перепрыгнула — 0123456789</p>
                            <p className="text-body text-ink">სწრაფი ყავისფერი მელა — ᲐᲑᲒ 0123456789</p>
                            <p className="text-caption text-muted">
                                Three scripts, one line height. The Georgian line is the one Inter could not render at
                                all.
                            </p>
                        </div>
                    </div>
                </Panel>
            </Section>

            <Section
                title="Colour"
                note="Cool neutrals, deliberately not Tailwind slate. Three real text levels; info is its own blue rather than a second copy of the accent."
            >
                <Panel>
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                        {TOKENS.map(([name, background]) => (
                            <div key={name} className="flex flex-col gap-1.5">
                                <div className={`h-14 rounded-card border border-line ${background}`} />
                                <code className="text-2xs text-muted">{name}</code>
                            </div>
                        ))}
                    </div>
                </Panel>
            </Section>

            <Section
                title="Elevation"
                note="Two layers each — a tight contact shadow plus a wide soft one — tinted with the ink rather than pure black."
            >
                <div className="grid gap-4 sm:grid-cols-4">
                    {/* Written out rather than built from a variable: Tailwind scans source text,
                        so `shadow-${'{'}level{'}'}` generates nothing and every card renders flat. */}
                    {(
                        [
                            ['sm', 'shadow-sm', 'resting card'],
                            ['md', 'shadow-md', 'hover, raised'],
                            ['lg', 'shadow-lg', 'popover, menu'],
                            ['xl', 'shadow-xl', 'dialog'],
                        ] as const
                    ).map(([level, shadow, use]) => (
                        <div key={level} className={`rounded-panel border border-line bg-surface p-5 ${shadow}`}>
                            <p className="font-display text-h3 font-semibold text-ink">{level}</p>
                            <p className="text-caption text-muted">{use}</p>
                        </div>
                    ))}
                </div>
            </Section>

            <Section
                title="Buttons"
                note="One press affordance for every variant: 1px down, shadow lift, focus ring on keyboard only."
            >
                <Panel>
                    <div className="flex flex-col gap-5">
                        <div className="flex flex-wrap items-center gap-3">
                            <Button variant="primary">Place order</Button>
                            <Button variant="secondary">Cancel</Button>
                            <Button variant="ghost">Dismiss</Button>
                            <Button variant="danger">Remove</Button>
                            <Button variant="danger-solid">Delete for ever</Button>
                            <Button variant="link">A link that is a button</Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button variant="primary" size="xs">
                                Extra small
                            </Button>
                            <Button variant="primary" size="sm">
                                Small
                            </Button>
                            <Button variant="primary" size="md">
                                Medium
                            </Button>
                            <Button variant="primary" size="lg">
                                Large
                            </Button>
                        </div>
                        <div className="flex flex-wrap items-center gap-3">
                            <Button variant="primary" isLoading>
                                Saving
                            </Button>
                            <Button variant="primary" disabled>
                                Disabled
                            </Button>
                            <Button
                                variant="secondary"
                                leadingIcon={
                                    <svg
                                        viewBox="0 0 20 20"
                                        className="h-4 w-4"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="1.7"
                                    >
                                        <path d="M10 4v12M4 10h12" strokeLinecap="round" />
                                    </svg>
                                }
                            >
                                With an icon
                            </Button>
                            <Spinner />
                        </div>
                    </div>
                </Panel>
            </Section>

            <Section
                title="Fields"
                note="A hover that darkens the border is what tells somebody a field is editable before they click it. The error carries an icon as well as colour."
            >
                <Panel>
                    <div className="grid gap-5 sm:grid-cols-2">
                        <TextField
                            label="Shop name"
                            placeholder="Beridze Textiles"
                            hint="Shown to shoppers at checkout."
                        />
                        <TextField
                            label="Contact email"
                            defaultValue="not-an-email"
                            error="Enter an email address this shop can be reached at."
                        />
                        <SelectField
                            label="Currency"
                            options={[
                                { value: 'gel', label: 'Georgian lari' },
                                { value: 'usd', label: 'US dollar' },
                            ]}
                        />
                        <TextField label="Postcode" placeholder="Optional" disabled />
                        <div className="sm:col-span-2">
                            <TextAreaField
                                label="Delivery note for the courier"
                                rows={3}
                                placeholder="Second gate, ring twice"
                            />
                        </div>
                        <CheckboxField
                            label="Email me when a courier cannot be found"
                            hint="Otherwise the only sign is the shipment reading undeliverable."
                            checked={isSubscribed}
                            onChange={setIsSubscribed}
                        />
                    </div>
                </Panel>
            </Section>

            <Section
                title="Status"
                note="The label always carries the meaning; the dot only accelerates scanning a column."
            >
                <Panel>
                    <div className="flex flex-wrap items-center gap-2">
                        <Badge hasDot tone="positive">
                            Delivered
                        </Badge>
                        <Badge hasDot tone="info">
                            On its way
                        </Badge>
                        <Badge hasDot tone="caution">
                            Awaiting payment
                        </Badge>
                        <Badge hasDot tone="critical">
                            Undeliverable
                        </Badge>
                        <Badge hasDot tone="accent">
                            Packed
                        </Badge>
                        <Badge tone="neutral">Draft</Badge>
                    </div>
                </Panel>
            </Section>

            <Section
                title="Figures"
                note="A delta is coloured by whether the metric improved, never by which way it points."
            >
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <StatCard
                        label="Orders today"
                        value="128"
                        delta={{ label: '12%', trend: 'up' }}
                        hint="vs yesterday"
                    />
                    <StatCard
                        label="Revenue"
                        value="₾14,204"
                        delta={{ label: '4%', trend: 'up' }}
                        hint="vs yesterday"
                    />
                    <StatCard
                        label="Undeliverable"
                        value="3"
                        delta={{ label: '2', trend: 'up', isGoodWhen: 'down' }}
                        hint="needs a van"
                    />
                    <StatCard label="Out of stock" value="0" delta={{ label: 'no change', trend: 'flat' }} />
                </div>
            </Section>

            <Section
                title="Data"
                note="One row height, one header treatment, one divider weight — the single largest reason six panels looked unlike each other."
            >
                <Panel
                    title="Orders"
                    description="Figures are tabular, so a column of totals lines up."
                    actions={
                        <SegmentedControl
                            label="Order filter"
                            size="sm"
                            value={filter}
                            onChange={setFilter}
                            segments={[
                                { value: 'all', label: 'All', count: 4 },
                                { value: 'open', label: 'Open', count: 3 },
                                { value: 'done', label: 'Fulfilled', count: 1 },
                            ]}
                        />
                    }
                    isFlush
                    footer={
                        <>
                            <p className="text-caption text-muted">4 of 1,208 orders</p>
                            <Button size="sm" variant="secondary">
                                Load more
                            </Button>
                        </>
                    }
                >
                    <Table caption="Recent orders">
                        <TableHead>
                            <TableRow>
                                <TableHeaderCell>Order</TableHeaderCell>
                                <TableHeaderCell>Buyer</TableHeaderCell>
                                <TableHeaderCell>Status</TableHeaderCell>
                                <TableHeaderCell isNumeric>Lines</TableHeaderCell>
                                <TableHeaderCell isNumeric>Total</TableHeaderCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {ORDERS.map((order) => (
                                <TableRow
                                    key={order.id}
                                    isSelected={order.id === selected}
                                    onClick={() => {
                                        setSelected(order.id);
                                    }}
                                >
                                    <TableCell isPrimary>
                                        <code className="text-small">{order.id}</code>
                                    </TableCell>
                                    <TableCell>
                                        <span className="flex items-center gap-2">
                                            <Avatar size="xs" name={order.buyer} />
                                            <span className="text-ink">{order.buyer}</span>
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <Badge hasDot tone={order.tone}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell isNumeric>{order.lines}</TableCell>
                                    <TableCell isNumeric>{order.total}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Panel>
            </Section>

            <Section
                title="Waiting and nothing"
                note="A sweep rather than a pulse, because a pulsing block and a disabled block look alike."
            >
                <div className="grid gap-4 lg:grid-cols-2">
                    <Panel title="Loading">
                        <div className="flex flex-col gap-5">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-10 w-10 rounded-full" />
                                <div className="flex-1">
                                    <SkeletonText lines={2} />
                                </div>
                            </div>
                            <SkeletonText lines={3} />
                        </div>
                    </Panel>
                    <Panel title="Empty" isFlush>
                        <EmptyState
                            title="No orders yet"
                            description="When a shopper checks out, their order appears here with the variant they chose and where it is going."
                            icon={
                                <svg
                                    viewBox="0 0 24 24"
                                    className="h-6 w-6"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.6"
                                >
                                    <path
                                        d="M4 7h16l-1.5 12.5A2 2 0 0 1 16.5 21h-9a2 2 0 0 1-2-1.5L4 7Z"
                                        strokeLinejoin="round"
                                    />
                                    <path d="M9 7V5a3 3 0 0 1 6 0v2" strokeLinecap="round" />
                                </svg>
                            }
                            action={
                                <Button variant="primary" size="sm">
                                    Open the shop
                                </Button>
                            }
                        />
                    </Panel>
                </div>
            </Section>

            <Section title="People">
                <Panel>
                    <div className="flex flex-wrap items-end gap-6">
                        {(['xs', 'sm', 'md', 'lg'] as const).map((size) => (
                            <div key={size} className="flex flex-col items-center gap-2">
                                <Avatar size={size} name="Ana Beridze" />
                                <code className="text-2xs text-muted">{size}</code>
                            </div>
                        ))}
                        <div className="flex flex-col items-center gap-2">
                            <Avatar name="ანა ბერიძე" />
                            <code className="text-2xs text-muted">Mtavruli</code>
                        </div>
                        <div className="flex flex-col items-center gap-2">
                            <Avatar name="Iveri" />
                            <code className="text-2xs text-muted">one word</code>
                        </div>
                    </div>
                </Panel>
            </Section>
        </div>
    );
}
