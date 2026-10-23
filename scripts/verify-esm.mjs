#!/usr/bin/env node
/**
 * Proves the published output is loadable by Node, not only by a bundler.
 *
 * This package is `"type": "module"`, and TypeScript compiles with `moduleResolution: "bundler"`,
 * which permits extensionless and directory specifiers and emits them unchanged. Vite resolves
 * those, so all six panels worked while `dist/index.js` was unloadable by Node — the failure only
 * surfaced in a spec that imported the package through Node ESM, long after it shipped.
 *
 * `tsc` cannot catch it, because under `bundler` resolution the source is correct. Only importing
 * the built artefact does.
 */
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const entry = pathToFileURL(resolve('dist/index.js')).href;

try {
    const module = await import(entry);
    const exported = Object.keys(module);
    if (exported.length === 0) {
        throw new Error('dist/index.js loaded but exported nothing');
    }
    console.log(`@iveri/react-kit: dist/index.js imports under Node ESM (${exported.length} exports)`);
} catch (error) {
    console.error('@iveri/react-kit: dist/index.js is not loadable by Node ESM');
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
}
