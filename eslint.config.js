const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const globals = require('globals');
const prettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = tseslint.config(
  { ignores: ['dist/', 'docs/', 'coverage/'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  prettierRecommended,
  {
    languageOptions: {
      ecmaVersion: 2021,
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
    rules: {
      'prettier/prettier': 'error',
      // TODO: remove this override
      '@typescript-eslint/no-explicit-any': 'off',
    },
  }
);
