// `__dirname`, because Vite runs from the repository root while this config lives in `preview/`.
const { join } = require('node:path');

module.exports = {
    plugins: { tailwindcss: { config: join(__dirname, 'tailwind.config.ts') }, autoprefixer: {} },
};
