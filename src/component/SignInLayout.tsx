import { useId, type ReactNode } from 'react';

interface SignInLayoutProps {
    productName: string;
    /**
     * A product with a look of its own draws its own mark, as `ProductShell` lets it. Absent, the
     * Iveri mark beside the name. Drawn on the dark side on a laptop and above the form on a phone,
     * so it should read on both.
     */
    brand?: ReactNode;
    /** One line about the product, large on the navy side. */
    strapline: string;
    /** The page's heading, above the form. */
    heading: string;
    children: ReactNode;
}

function Brand({ productName }: Readonly<{ productName: string }>): React.JSX.Element {
    return (
        <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-control bg-white shadow-sm">
                <img src="/iveri-logo-transparent.png" alt="Iveri" className="h-8 w-8" width="32" height="32" />
            </span>
            <span className="font-display text-h3 font-bold">{productName}</span>
        </div>
    );
}

/**
 * The sign-in screen of every admin panel: who this is for on one side, the form on the other.
 *
 * Presentational, because each panel's form is wired to its own session. The navy side goes on a
 * narrow screen, where it would push the form below the fold of the one thing somebody came to do.
 * `div`s rather than `section`s, because the theme lets a wide table scroll inside a `section`'s
 * child and that would clip the form card's shadow.
 */
export function SignInLayout({
    productName,
    brand,
    strapline,
    heading,
    children,
}: Readonly<SignInLayoutProps>): React.JSX.Element {
    const patternId = useId();

    return (
        <main className="grid min-h-full bg-canvas lg:grid-cols-[minmax(0,1.05fr)_minmax(26rem,0.95fr)]">
            <div className="relative hidden flex-col justify-between overflow-hidden bg-hero p-12 text-hero-ink lg:flex xl:p-16">
                <svg className="absolute inset-0 h-full w-full" aria-hidden="true">
                    <defs>
                        <pattern id={patternId} width="28" height="28" patternUnits="userSpaceOnUse">
                            <circle cx="2" cy="2" r="1.2" fill="#ffffff" opacity="0.16" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill={`url(#${patternId})`} />
                </svg>
                <div className="relative">{brand ?? <Brand productName={productName} />}</div>
                <div className="relative max-w-xl">
                    <span className="mb-5 block h-1 w-12 rounded-full bg-gold" aria-hidden="true" />
                    <p className="font-display text-[2.75rem] font-bold leading-[1.1] tracking-tight">{strapline}</p>
                </div>
            </div>
            <div className="flex items-center justify-center px-4 py-10 sm:px-8">
                <div className="w-full max-w-md">
                    <div className="mb-8 text-ink lg:hidden">{brand ?? <Brand productName={productName} />}</div>
                    <h1 className="font-display text-h1 font-bold text-ink">{heading}</h1>
                    <div className="mt-6 rounded-panel border border-line bg-surface p-6 shadow-md sm:p-8">
                        {children}
                    </div>
                </div>
            </div>
        </main>
    );
}
