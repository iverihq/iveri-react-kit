import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

// This package emits its JavaScript with `tsc`, not Vite — the plugin is here only so the specs
// can render JSX. There is no build here to configure.
//
// Named `vite.config.ts` rather than `vitest.config.ts` because the gallery shares it in spirit and
// the fleet's lint config knows both names; either is linted as a tooling file.
export default defineConfig({
    plugins: [react()],
    test: {
        environment: 'jsdom',
        include: ['src/**/*.spec.{ts,tsx}'],
        // Testing Library unmounts between tests only when it finds a global `afterEach`; the specs
        // import the test API explicitly, so the cleanup is registered here instead.
        setupFiles: ['./src/test-setup.ts'],
        // Node 25 began defining its own global `localStorage`, which is undefined without a
        // backing file and shadows jsdom's — so a spec touching storage reads `undefined`. These
        // specs stand in for a browser, so Node's is switched off in the workers.
        execArgv: ['--no-experimental-webstorage'],
    },
});
