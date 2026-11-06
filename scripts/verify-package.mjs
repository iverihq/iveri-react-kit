/**
 * Proves the **published artefact** works, which is the only thing a consumer ever sees.
 *
 * Two separate defects in this fleet had this shape and neither was visible to `tsc`, a linter or
 * a reviewer:
 *
 * 1. This package shipped `export * from './common'` — a directory import, which Node ESM rejects.
 *    It compiled under `moduleResolution: "bundler"`, which permits that and emits it unchanged,
 *    so all six panels worked (Vite resolves it) while `dist/index.js` was unloadable by Node.
 * 2. `./tailwind-preset` shipped with only an `import` condition while Tailwind 3 loaded it
 *    through `require`, and every panel failed with a message naming the one thing that was not
 *    wrong.
 *
 * The lesson both times: **check the artefact, not the source** — and check every entry point,
 * because an entry point missing from `files` is published as a 404 that nothing here would
 * otherwise notice.
 */
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const manifest = JSON.parse(readFileSync(resolve('package.json'), 'utf8'));
const failures = [];

/** Every path `exports` promises has to exist and be inside something `files` publishes. */
const included = new Set(manifest.files);
const isPublished = (relative) =>
    relative === 'package.json' || included.has(relative) || included.has(relative.split('/')[0]);

for (const target of Object.values(manifest.exports).flatMap((node) =>
    typeof node === 'string' ? [node] : Object.values(node),
)) {
    const relative = target.replace(/^\.\//u, '');

    if (!existsSync(resolve(relative))) {
        failures.push(`exports "${target}" points at a file that does not exist`);
    } else if (!isPublished(relative)) {
        failures.push(`exports "${target}" is not covered by "files" — it would publish as a 404`);
    }
}

for (const field of ['main', 'module', 'types', 'typesVersions']) {
    if (field in manifest) failures.push(`package.json still declares "${field}"; the exports map is the only entry`);
}

/** The JavaScript entry point has to load under Node, imported and required, not only under a bundler. */
try {
    const loaded = await import(pathToFileURL(resolve('dist/index.js')).href);
    if (Object.keys(loaded).length === 0) throw new Error('loaded but exported nothing');
    require(resolve('dist/index.js'));
    console.log(`@iveri/react-kit: dist/index.js loads under Node (${Object.keys(loaded).length} exports)`);
} catch (error) {
    failures.push(`dist/index.js is not loadable by Node: ${error instanceof Error ? error.message : error}`);
}

/**
 * Everything the theme imports has to reach a consumer: a font package as a real dependency, a
 * sibling stylesheet inside `files`. A Vite build resolves these from `node_modules`, so a missing
 * one fails in the *app* with a path nobody recognises — and the reason the foundation exists is
 * that the previous theme named a font nothing installed at all.
 */
// Comments stripped first: the theme's own header shows an app's `@import` of it, which is not one.
const theme = readFileSync(resolve('styles/theme.css'), 'utf8').replaceAll(/\/\*[\s\S]*?\*\//gu, '');
const imports = [...theme.matchAll(/@import '([^']+)'/gu)].map(([, specifier]) => specifier);
const fonts = imports.filter((specifier) => specifier.startsWith('@'));

if (fonts.length === 0) failures.push('styles/theme.css imports no font — the theme names one');

for (const specifier of fonts) {
    const packageName = specifier.split('/').slice(0, 2).join('/');
    if (manifest.dependencies?.[packageName] === undefined) {
        failures.push(`styles/theme.css imports ${packageName}, which is not a dependency`);
        continue;
    }
    try {
        require.resolve(specifier);
    } catch {
        failures.push(`styles/theme.css imports ${specifier}, which does not resolve`);
    }
}

for (const specifier of imports.filter((candidate) => candidate.startsWith('.'))) {
    const relative = resolve(dirname(resolve('styles/theme.css')), specifier).slice(resolve('.').length + 1);
    if (!existsSync(resolve(relative)) || !isPublished(relative)) {
        failures.push(`styles/theme.css imports ${specifier}, which is not published`);
    }
}

if (failures.length > 0) {
    console.error('@iveri/react-kit: the published package would be broken');
    for (const failure of failures) console.error(`  - ${failure}`);
    process.exit(1);
}

console.log(`@iveri/react-kit: ${fonts.length} font imports resolve; every export and stylesheet is published`);
