import type { Config } from 'tailwindcss';

import preset from '../tailwind-preset.cjs';

/**
 * The gallery consumes the preset exactly as an app does, so a token this file cannot resolve is
 * a token no panel could resolve either.
 */
export default {
    presets: [preset],
    content: ['./preview/index.html', './preview/**/*.tsx', './src/**/*.tsx'],
} satisfies Config;
