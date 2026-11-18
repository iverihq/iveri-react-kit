import { useState, type FormEvent, type ReactNode } from 'react';

import { useTranslation } from '../i18n/use-translation.js';

import { Button } from './Button.js';
import { TextField } from './Field.js';

/** What setting the password came to: done, a link that no longer works, or a request that failed. */
export type PasswordResetOutcome = 'done' | 'invalid-link' | 'failed';

/** Identity's own minimum, repeated so a short password is refused before it is sent. */
export const PASSWORD_MIN_LENGTH = 12;

interface PasswordResetConfirmFormProps {
    /** Sends `POST /auth/password-reset/confirm` with the link's workspace and token, and reports the outcome. */
    onSubmit: (password: string) => Promise<PasswordResetOutcome>;
    /** Shown once the password is set, and beside a link that no longer works. */
    toSignIn: ReactNode;
    /** Shown beside a link that no longer works, to ask for another. */
    toForgotPassword: ReactNode;
    /** False when the page was opened without a workspace and a token: there is nothing to set. */
    hasLink: boolean;
}

/**
 * The page a reset email opens: a new password twice, then a sentence saying every session has ended.
 *
 * Presentational: the app reads `workspace` and `token` from the address and sends them. Strings are the `web-shell`
 * namespace's `shell.password-reset.*`.
 */
export function PasswordResetConfirmForm({
    onSubmit,
    toSignIn,
    toForgotPassword,
    hasLink,
}: Readonly<PasswordResetConfirmFormProps>): React.JSX.Element {
    const { t } = useTranslation();
    const [password, setPassword] = useState('');
    const [repeat, setRepeat] = useState('');
    const [fieldError, setFieldError] = useState<string | undefined>(undefined);
    const [state, setState] = useState<'idle' | 'sending' | PasswordResetOutcome>(hasLink ? 'idle' : 'invalid-link');

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();

        if (password.length < PASSWORD_MIN_LENGTH) {
            setFieldError(t('shell.password-reset.error.too-short', { min: PASSWORD_MIN_LENGTH }));

            return;
        }

        if (password !== repeat) {
            setFieldError(t('shell.password-reset.error.mismatch'));

            return;
        }

        setFieldError(undefined);
        setState('sending');
        onSubmit(password).then(setState, () => setState('failed'));
    };

    if (state === 'done') {
        return (
            <div className="flex flex-col gap-5">
                <p role="status" className="text-body text-ink">
                    {t('shell.password-reset.confirm.done')}
                </p>
                <div>{toSignIn}</div>
            </div>
        );
    }

    if (state === 'invalid-link') {
        return (
            <div className="flex flex-col gap-5">
                <p role="alert" className="text-body text-ink">
                    {t('shell.password-reset.error.invalid-link')}
                </p>
                <div className="flex flex-wrap gap-4">
                    {toForgotPassword}
                    {toSignIn}
                </div>
            </div>
        );
    }

    return (
        <form className="flex flex-col gap-5" onSubmit={submit}>
            <TextField
                label={t('shell.password-reset.confirm.password')}
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
            />
            <TextField
                label={t('shell.password-reset.confirm.repeat')}
                name="repeat"
                type="password"
                autoComplete="new-password"
                required
                value={repeat}
                error={fieldError}
                onChange={(event) => setRepeat(event.target.value)}
            />
            {state === 'failed' && (
                <p role="alert" className="text-small text-critical">
                    {t('shell.password-reset.error.failed')}
                </p>
            )}
            <Button type="submit" variant="primary" isBlock isLoading={state === 'sending'}>
                {t('shell.password-reset.confirm.submit')}
            </Button>
        </form>
    );
}
