/**
 * The shared Tailwind theme every Iveri panel extends.
 *
 * ⚠ **CommonJS, deliberately.** Tailwind loads a consumer's `tailwind.config.ts` through `jiti`,
 * which resolves imports with the **CJS** loader — and that loader honours only the `node` and
 * `require` export conditions. Published as ESM, this subpath failed in every panel with
 * `Package subpath './tailwind-preset' is not defined by "exports"`, which names the one thing
 * that was not wrong: the subpath is defined, just not for the loader asking. A `.cjs` file is
 * consumable by `require` and by `import` alike, so it is one file rather than a dual build that
 * could drift.
 *
 * Each app used to declare the same forty lines of colour mapping itself, so a token added to
 * the kit reached a panel only when somebody remembered to edit that panel too — and the four
 * variants this replaced are the evidence that nobody did.
 *
 * Colours resolve through the custom properties in `styles/tokens.css` rather than being
 * literals, which is what keeps `bg-surface/50` and `text-accent/70` working: Tailwind needs
 * the channel triplet to substitute `<alpha-value>` into.
 *
 * @type {import('tailwindcss').Config}
 */
const preset = {
    theme: {
        extend: {
            colors: {
                canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
                surface: 'rgb(var(--color-surface) / <alpha-value>)',
                raised: 'rgb(var(--color-raised) / <alpha-value>)',
                sunken: 'rgb(var(--color-sunken) / <alpha-value>)',
                line: 'rgb(var(--color-line) / <alpha-value>)',
                'line-strong': 'rgb(var(--color-line-strong) / <alpha-value>)',
                ink: 'rgb(var(--color-ink) / <alpha-value>)',
                'ink-soft': 'rgb(var(--color-ink-soft) / <alpha-value>)',
                muted: 'rgb(var(--color-muted) / <alpha-value>)',
                faint: 'rgb(var(--color-faint) / <alpha-value>)',
                accent: 'rgb(var(--color-accent) / <alpha-value>)',
                'accent-hover': 'rgb(var(--color-accent-hover) / <alpha-value>)',
                'accent-ink': 'rgb(var(--color-accent-ink) / <alpha-value>)',
                'accent-soft': 'rgb(var(--color-accent-soft) / <alpha-value>)',
                'accent-line': 'rgb(var(--color-accent-line) / <alpha-value>)',
                link: 'rgb(var(--color-link) / <alpha-value>)',
                positive: 'rgb(var(--color-positive) / <alpha-value>)',
                'positive-soft': 'rgb(var(--color-positive-soft) / <alpha-value>)',
                caution: 'rgb(var(--color-caution) / <alpha-value>)',
                'caution-soft': 'rgb(var(--color-caution-soft) / <alpha-value>)',
                critical: 'rgb(var(--color-critical) / <alpha-value>)',
                'critical-soft': 'rgb(var(--color-critical-soft) / <alpha-value>)',
                info: 'rgb(var(--color-info) / <alpha-value>)',
                'info-soft': 'rgb(var(--color-info-soft) / <alpha-value>)',
            },
            fontFamily: {
                // A browser substitutes per glyph, so Latin renders in Inter and Georgian falls
                // through to Noto — which is the whole reason that second family is here. Inter
                // carries no Georgian, and all three panels ship Georgian.
                sans: [
                    'Inter Variable',
                    'Inter',
                    'Noto Sans Georgian',
                    'system-ui',
                    '-apple-system',
                    'Segoe UI',
                    'sans-serif',
                ],
                // The same family, cut tighter. Used for headings only, where Inter's UI
                // spacing reads loose — and it is a tighter cut rather than a second voice,
                // which is what keeps a display face out of an ordinary product screen.
                display: [
                    'Inter Tight Variable',
                    'Inter Tight',
                    'Inter Variable',
                    'Noto Sans Georgian',
                    'system-ui',
                    'sans-serif',
                ],
                mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
            },
            fontSize: {
                // The standard's scale, with the optical tracking it does not specify. Negative
                // tracking at display sizes is the single clearest difference between type that
                // was set and type that was merely made bigger.
                '2xs': ['0.6875rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
                caption: ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.01em' }],
                small: ['0.875rem', { lineHeight: '1.25rem' }],
                label: ['0.875rem', { lineHeight: '1.25rem' }],
                body: ['1rem', { lineHeight: '1.5rem' }],
                h3: ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
                h2: ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.015em' }],
                h1: ['2rem', { lineHeight: '2.5rem', letterSpacing: '-0.022em' }],
                display: ['2.5rem', { lineHeight: '3rem', letterSpacing: '-0.028em' }],
            },
            // The standard's scale: 8px for inputs and compact elements, 12px for cards, 16px
            // for large dialogs and sheets. Named for the thing rather than the size, so a
            // component does not have to know which step it is on.
            borderRadius: {
                control: '0.5rem',
                card: '0.75rem',
                panel: '1rem',
            },
            boxShadow: {
                sm: 'var(--shadow-sm)',
                md: 'var(--shadow-md)',
                lg: 'var(--shadow-lg)',
                xl: 'var(--shadow-xl)',
                // The hairline that stops a filled navy button looking like a flat rectangle.
                inset: 'inset 0 1px 0 rgb(255 255 255 / 0.1)',
            },
            transitionTimingFunction: {
                standard: 'var(--ease-standard)',
                'out-quint': 'var(--ease-out-quint)',
            },
            // The standard's three steps, by its own names: 120ms for a small state change,
            // 200ms for a standard transition, 320ms only for a panel or an overlay.
            transitionDuration: {
                fast: 'var(--duration-fast)',
                normal: 'var(--duration-normal)',
                slow: 'var(--duration-slow)',
            },
            keyframes: {
                'fade-in': { from: { opacity: '0' }, to: { opacity: '1' } },
                'rise-in': {
                    from: { opacity: '0', transform: 'translateY(6px)' },
                    to: { opacity: '1', transform: 'translateY(0)' },
                },
                'scale-in': {
                    from: { opacity: '0', transform: 'scale(0.97)' },
                    to: { opacity: '1', transform: 'scale(1)' },
                },
                shimmer: { from: { backgroundPosition: '-200% 0' }, to: { backgroundPosition: '200% 0' } },
            },
            animation: {
                'fade-in': 'fade-in var(--duration-fast) var(--ease-standard) both',
                'rise-in': 'rise-in var(--duration-normal) var(--ease-out-quint) both',
                'scale-in': 'scale-in var(--duration-fast) var(--ease-out-quint) both',
                shimmer: 'shimmer 1.6s linear infinite',
            },
        },
    },
};

module.exports = preset;
