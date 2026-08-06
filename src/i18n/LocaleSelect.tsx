import { cn } from '../common';

import { localeFlag } from './locale-flag';
import { useTranslation } from './use-translation';

interface LocaleSelectProps {
    /** Accessible name for the control. Pass a translated string. */
    label: string;

    className?: string;
}

/**
 * The language picker, in the sidebar of every panel.
 *
 * Each option is labelled in **its own** language, never in the active one: someone who has landed
 * on a language they cannot read is exactly the person using this control, and "Georgian" is no
 * help to them where "ქართული" is.
 *
 * A bare `select` with a visually hidden label rather than the kit's `SelectField`, because this
 * sits in navigation chrome rather than a form, and a stacked label there is a row of wasted space.
 */
export function LocaleSelect({ label, className }: Readonly<LocaleSelectProps>): JSX.Element {
    const { locale, locales, setLocale } = useTranslation();

    return (
        <select
            aria-label={label}
            value={locale}
            onChange={(event) => {
                setLocale(event.target.value);
            }}
            className={cn(
                'min-h-11 w-full rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink',
                'transition-colors duration-150 focus:border-accent',
                className,
            )}
        >
            {locales.map((option) => {
                const flag = localeFlag(option.code);

                // The flag is decoration in front of the name, never instead of it: a platform
                // without flag glyphs renders two letters, and a language is not a country anyway.
                return (
                    <option key={option.code} value={option.code}>
                        {flag ? `${flag} ${option.nativeName}` : option.nativeName}
                    </option>
                );
            })}
        </select>
    );
}
