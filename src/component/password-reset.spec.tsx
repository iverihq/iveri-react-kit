import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { LocaleProvider } from '../i18n/LocaleProvider.js';

import { PasswordResetConfirmForm } from './PasswordResetConfirmForm.js';
import { PasswordResetRequestForm } from './PasswordResetRequestForm.js';
import { SignInLayout } from './SignInLayout.js';

// An empty catalogue renders every key as itself, which is what these assertions read.
const CATALOG = {
    generatedAt: '2026-11-18T00:00:00.000Z',
    sourceLocale: 'en',
    versions: {},
    locales: [{ code: 'en', englishName: 'English', nativeName: 'English' }],
    messages: { en: {} },
};

const withLocale = (node: React.ReactNode): void => {
    render(
        <LocaleProvider catalog={CATALOG} storageKey="password-reset-spec">
            {node}
        </LocaleProvider>,
    );
};

describe('SignInLayout’s forgot-password link', () => {
    it('is absent unless the app has somewhere to send it', () => {
        withLocale(
            <SignInLayout productName="Thing" strapline="s" heading="Sign in">
                <p>Form</p>
            </SignInLayout>,
        );

        expect(screen.queryByText('shell.password-reset.link')).toBeNull();
    });

    it('follows the app’s own navigation when it gives one', () => {
        const onForgotPassword = vi.fn();

        withLocale(
            <SignInLayout
                productName="Thing"
                strapline="s"
                heading="Sign in"
                forgotPasswordHref="/forgot-password"
                onForgotPassword={onForgotPassword}
            >
                <p>Form</p>
            </SignInLayout>,
        );

        const link = screen.getByRole('link', { name: 'shell.password-reset.link' });

        expect(link.getAttribute('href')).toBe('/forgot-password');
        fireEvent.click(link);
        expect(onForgotPassword).toHaveBeenCalledOnce();
    });
});

describe('PasswordResetRequestForm', () => {
    const fill = (): void => {
        fireEvent.change(screen.getByLabelText('shell.password-reset.workspace'), { target: { value: ' Acme ' } });
        fireEvent.change(screen.getByLabelText('shell.password-reset.email'), { target: { value: 'nino@acme.test' } });
        fireEvent.click(screen.getByRole('button', { name: 'shell.password-reset.request.submit' }));
    };

    it('says the same thing whatever the account, once the request went through', async () => {
        const onSubmit = vi.fn().mockResolvedValue(undefined);

        withLocale(<PasswordResetRequestForm onSubmit={onSubmit} backToSignIn={<a href="/login">back</a>} />);
        fill();

        expect((await screen.findByRole('status')).textContent).toContain('shell.password-reset.request.sent');
        expect(onSubmit).toHaveBeenCalledWith({ tenantSlug: 'acme', email: 'nino@acme.test' });
    });

    it('says so when the request itself failed', async () => {
        withLocale(
            <PasswordResetRequestForm
                onSubmit={vi.fn().mockRejectedValue(new Error('offline'))}
                backToSignIn={<a href="/login">back</a>}
            />,
        );
        fill();

        expect((await screen.findByRole('alert')).textContent).toContain('shell.password-reset.error.failed');
    });

    it('does not ask for a workspace the app already knows', () => {
        withLocale(
            <PasswordResetRequestForm tenantSlug="acme" onSubmit={vi.fn()} backToSignIn={<a href="/login">back</a>} />,
        );

        expect(screen.queryByLabelText('shell.password-reset.workspace')).toBeNull();
    });
});

describe('PasswordResetConfirmForm', () => {
    const renderForm = (onSubmit = vi.fn().mockResolvedValue('done'), hasLink = true): void => {
        withLocale(
            <PasswordResetConfirmForm
                onSubmit={onSubmit}
                hasLink={hasLink}
                toSignIn={<a href="/login">sign in</a>}
                toForgotPassword={<a href="/forgot-password">again</a>}
            />,
        );
    };

    const type = (password: string, repeat: string): void => {
        fireEvent.change(screen.getByLabelText('shell.password-reset.confirm.password'), {
            target: { value: password },
        });
        fireEvent.change(screen.getByLabelText('shell.password-reset.confirm.repeat'), { target: { value: repeat } });
        fireEvent.click(screen.getByRole('button', { name: 'shell.password-reset.confirm.submit' }));
    };

    it('refuses two passwords that differ, and a short one, before sending anything', () => {
        const onSubmit = vi.fn();

        renderForm(onSubmit);
        type('long-enough-password', 'long-enough-passw0rd');
        expect(screen.getByRole('alert').textContent).toContain('shell.password-reset.error.mismatch');

        type('short', 'short');
        expect(screen.getByRole('alert').textContent).toContain('shell.password-reset.error.too-short');
        expect(onSubmit).not.toHaveBeenCalled();
    });

    it('says every session has ended once the password is set', async () => {
        const onSubmit = vi.fn().mockResolvedValue('done');

        renderForm(onSubmit);
        type('long-enough-password', 'long-enough-password');

        await waitFor(() =>
            expect(screen.getByRole('status').textContent).toContain('shell.password-reset.confirm.done'),
        );
        expect(onSubmit).toHaveBeenCalledWith('long-enough-password');
    });

    it('offers a new link when this one no longer works', async () => {
        renderForm(vi.fn().mockResolvedValue('invalid-link'));
        type('long-enough-password', 'long-enough-password');

        expect((await screen.findByRole('alert')).textContent).toContain('shell.password-reset.error.invalid-link');
        expect(screen.getByRole('link', { name: 'again' }).getAttribute('href')).toBe('/forgot-password');
    });

    it('opens on that answer when the address carries no link at all', () => {
        renderForm(vi.fn(), false);

        expect(screen.getByRole('alert').textContent).toContain('shell.password-reset.error.invalid-link');
    });
});
