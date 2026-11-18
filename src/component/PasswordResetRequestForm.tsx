import { useState, type FormEvent, type ReactNode } from 'react';

import { useTranslation } from '../i18n/use-translation.js';

import { Button } from './Button.js';
import { TextField } from './Field.js';

export interface PasswordResetRequestValues {
    tenantSlug: string;
    email: string;
}

interface PasswordResetRequestFormProps {
    /**
     * Sends `POST /auth/password-reset`. It answers 202 whether or not the account exists, so the form says the same
     * thing either way; reject only when the request itself failed, and the form says so.
     */
    onSubmit: (values: PasswordResetRequestValues) => Promise<void>;
    /** The workspace, when the app already knows it. Absent, the form asks, as sign-in does. */
    tenantSlug?: string;
    /** Back to sign-in: a link or a button the app renders, so it can use its router. */
    backToSignIn: ReactNode;
}

/**
 * "Forgot password": a workspace and an email, then one sentence that is true whether or not they match an account.
 * Where the app already knows the workspace the field is not shown, and the intro asks for the email alone.
 *
 * Presentational, like `SignInLayout`: each app sends the request with its own client. Strings are the `web-shell`
 * namespace's `shell.password-reset.*`.
 */
export function PasswordResetRequestForm({
    onSubmit,
    tenantSlug,
    backToSignIn,
}: Readonly<PasswordResetRequestFormProps>): React.JSX.Element {
    const { t } = useTranslation();
    const [workspace, setWorkspace] = useState(tenantSlug ?? '');
    const [email, setEmail] = useState('');
    const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');

    const submit = (event: FormEvent<HTMLFormElement>): void => {
        event.preventDefault();
        setState('sending');
        onSubmit({ tenantSlug: workspace.trim().toLowerCase(), email: email.trim() }).then(
            () => setState('sent'),
            () => setState('failed'),
        );
    };

    if (state === 'sent') {
        return (
            <div className="flex flex-col gap-5">
                <p role="status" className="text-body text-ink">
                    {t('shell.password-reset.request.sent')}
                </p>
                <div>{backToSignIn}</div>
            </div>
        );
    }

    return (
        <form className="flex flex-col gap-5" onSubmit={submit} noValidate={false}>
            <p className="text-body text-muted">
                {tenantSlug === undefined
                    ? t('shell.password-reset.request.intro')
                    : t('shell.password-reset.request.intro-email-only')}
            </p>
            {tenantSlug === undefined && (
                <TextField
                    label={t('shell.password-reset.workspace')}
                    name="tenantSlug"
                    autoComplete="organization"
                    required
                    value={workspace}
                    onChange={(event) => setWorkspace(event.target.value)}
                />
            )}
            <TextField
                label={t('shell.password-reset.email')}
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
            />
            {state === 'failed' && (
                <p role="alert" className="text-small text-critical">
                    {t('shell.password-reset.error.failed')}
                </p>
            )}
            <Button type="submit" variant="primary" isBlock isLoading={state === 'sending'}>
                {t('shell.password-reset.request.submit')}
            </Button>
            <div className="text-center">{backToSignIn}</div>
        </form>
    );
}
