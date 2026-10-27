#!/usr/bin/env node
/**
 * Proves the **published artefact** works, which is the only thing a consumer ever sees.
 *
 * Two separate defects in this fleet had this shape and neither was visible to `tsc`, a linter
 * or a reviewer:
 *
 * 1. This package shipped `export * from './common'` — a directory import, which Node ESM
 *    rejects. It compiles with `moduleResolution: "bundler"`, which permits that and emits it
 *    unchanged, so all six panels worked (Vite resolves it) while `dist/index.js` was
 *    unloadable by Node. The failure surfaced in a spec that imported through Node, long after
 *    it shipped.
 * 2. `@iveri/nest-sdk@0.22.0` was unloadable for ten of twelve services because its root barrel
 *    pulled in an optional peer. Its own tests passed; the first consumer without that peer
 *    found it immediately.
 *
 * The lesson both times: **check the artefact, not the source** — and check every entry point,
 * because an entry point missing from `files` is published as a 404 that nothing here would
 * otherwise notice.
 */
import { createRequire } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const manifest = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));
const failures = [];

/** Every path `exports` promises has to be inside something `files` publishes. */
function publishedPaths(node) {
    if (typeof node === 'string') return [node];
    if (node === null || typeof node !== 'object') return [];

    return Object.values(node).flatMap(publishedPaths);
}

const included = new Set(manifest.files);
for (const path of new Set(publishedPaths(manifest.exports))) {
    const relative = path.replace(/^\.\//u, '');

    if (!existsSync(resolve(relative))) {
        failures.push(`exports "${path}" points at a file that does not exist`);
        continue;
    }

    const root = relative.split('/')[0];
    if (!included.has(root) && !included.has(relative) && relative !== 'package.json') {
        failures.push(`exports "${path}" is not covered by "files" — it would publish as a 404`);
    }
}

/** The JavaScript entry points have to load under Node, not only under a bundler. */
for (const entry of ['dist/index.js', 'tailwind-preset.js']) {
    try {
        const loaded = await import(pathToFileURL(resolve(entry)).href);
        const exported = Object.keys(loaded);

        if (exported.length === 0) throw new Error('loaded but exported nothing');
        console.log(`@iveri/react-kit: ${entry} imports under Node ESM (${exported.length} exports)`);
    } catch (error) {
        failures.push(`${entry} is not loadable by Node ESM: ${error instanceof Error ? error.message : error}`);
    }
}

/**
 * Every font the stylesheet imports has to be a real dependency.
 *
 * A consumer's Vite build resolves these from `node_modules`, so a missing one fails in the
 * *app* with a path nobody recognises — and the reason the whole foundation exists is that the
 * previous theme named a font that nothing installed at all.
 */
const tokens = readFileSync(resolve('styles/tokens.css'), 'utf8');

/**
 * The stylesheet has to be plain CSS.
 *
 * `@tailwind`, `@layer` and `@apply` resolve only inside a consumer's Tailwind entry, and this
 * file is imported as its own module — the first version used `@layer base` and threw on the
 * first render. Stripping the directives fixed it; this stops them coming back, because the
 * failure appears in the *app* rather than here.
 */
const directive = /^\s*@(tailwind|layer|apply)\b/mu.exec(tokens.replaceAll(/\/\*[\s\S]*?\*\//gu, ''));
if (directive !== null) {
    failures.push(`styles/tokens.css uses ${directive[0].trim()} — it must be plain CSS`);
}
const fonts = [...tokens.matchAll(/@import '(@[^/]+\/[^/']+)([^']*)'/gu)];

if (fonts.length === 0) failures.push('styles/tokens.css imports no font — the theme names one');

// Reported per package, not per `@import`: one missing dependency is one problem, and four
// subpaths of it saying so four times buries whatever else is wrong.
for (const packageName of new Set(fonts.map(([, name]) => name))) {
    if (manifest.dependencies?.[packageName] === undefined) {
        failures.push(`styles/tokens.css imports ${packageName}, which is not a dependency`);
    }
}

for (const [, packageName, subpath] of fonts) {
    try {
        require.resolve(`${packageName}${subpath}`);
    } catch {
        failures.push(`styles/tokens.css imports ${packageName}${subpath}, which does not resolve`);
    }
}

if (failures.length > 0) {
    console.error('@iveri/react-kit: the published package would be broken');
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
}

console.log(`@iveri/react-kit: ${fonts.length} font imports resolve; every export is published`);
