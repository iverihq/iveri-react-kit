const { react } = require('@iveri/eslint-config');

module.exports = [
    ...react,
    {
        languageOptions: {
            parserOptions: { tsconfigRootDir: __dirname },
        },
    },
];
