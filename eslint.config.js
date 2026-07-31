// This package is `"type": "module"`, so the config file is ESM. `@iveri/eslint-config` is
// CommonJS, which Node exposes to an ESM importer as the default export.
import iveriEslintConfig from '@iveri/eslint-config';

export default [
    ...iveriEslintConfig.react,
    {
        languageOptions: {
            parserOptions: { tsconfigRootDir: import.meta.dirname },
        },
    },
];
