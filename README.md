# @iveri/react-kit

**Placeholder. Deliberately empty.**

Shared React primitives for Iveri admin apps — theme tokens, components, layout shell, form
and query wiring, auth provider, typed API client.

## Why there is nothing in it

It gets filled at **build-order step 7**, from the components `conduit-admin-web` actually
needed. A component library designed before its first real consumer is a set of guesses that
the first app then has to work around; one extracted from working code is not.

A component moves in here on its **second** consumer, never its first.

The package exists now so the npm name is claimed and apps can depend on it from their first
commit without a later rename.

## When it is filled

Planned shape, from the workspace guide:

```
theme/       design tokens, tailwind preset, dark mode
component/   Button, Input, Select, DataTable, Modal, Drawer, Toast, Badge, Tabs, EmptyState, Skeleton
layout/      AdminShell, Sidebar, TopBar, PageHeader
form/        react-hook-form + zod wiring, FormField
query/       QueryClient factory, error handling, auth-refresh interceptor
auth/        AuthProvider, useAuth, useTenant, <RequirePermission>
api/         typed fetch client built on @iveri/contracts, sends correlation id
hook/        useDebounce, usePagination, useCursorPagination
```

Depends on `@iveri/contracts`. **Never** on `@iveri/nest-sdk`.
