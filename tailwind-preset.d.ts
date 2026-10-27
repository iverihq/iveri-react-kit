import type { Config } from 'tailwindcss';

/**
 * Typed so a consumer's `tailwind.config.ts` can spread it under `presets` without an
 * implicit-any error. The preset itself stays plain JavaScript, because Tailwind loads it
 * through its own resolver at build time and a compiled artefact would have to be built before
 * any app could read its config.
 */
declare const preset: Config;

export default preset;
