import { config as baseConfig } from '@repo/eslint-config/base';

/** @type {import("eslint").Linter.Config} */
export default [
  ...baseConfig,
  {
    files: ['scripts/**/*.js'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
      },
    },
  },
  {
    ignores: ['src/generated/**'],
  },
];
