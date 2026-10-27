import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

/**
 * The component gallery. Not published and not part of the build — it exists so a design change
 * can be looked at rather than inferred, which this fleet has repeatedly found is the only way
 * some defects surface at all.
 */
export default defineConfig({
    root: 'preview',
    plugins: [react()],
    server: { port: 5190, strictPort: true },
});
