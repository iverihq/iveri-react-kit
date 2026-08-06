import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// This package emits its JavaScript with `tsc`, not Vite — the plugin is here only so the specs
// can render JSX. There is no build here to configure.
//
// Named `vite.config.ts` rather than `vitest.config.ts` because that is the filename the fleet's
// shared tsconfig and ESLint config know about; a differently named tooling config lands outside
// the type-aware project and fails lint for reasons that have nothing to do with what it does.
export default defineConfig({
    plugins: [react()],
    test: {
        globals: true,
        environment: 'jsdom',
        include: ['src/**/*.spec.{ts,tsx}'],
    },
});
