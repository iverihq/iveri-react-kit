import type { Config } from 'tailwindcss';

/**
 * Typed so a consumer's `tailwind.config.ts` can list this under `presets` without an
 * implicit-any error.
 *
 * `export =`, not a default export, because the preset is CommonJS and assigns
 * `module.exports` — declaring a default would describe `module.exports.default`, which does not
 * exist. `esModuleInterop` is what lets a consumer still write `import preset from '…'`.
 *
 * Named `.d.cts` rather than `.d.ts`: TypeScript looks for the declaration beside the
 * implementation and matches the extension, so a `.d.ts` next to a `.cjs` is never found.
 */
declare const preset: Config;

export = preset;
