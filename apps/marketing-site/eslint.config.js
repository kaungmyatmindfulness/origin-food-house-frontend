import { nextJsConfig } from '@repo/eslint-config/next-js';

/** @type {import("eslint").Linter.Config} */
export default [
  ...nextJsConfig,
  {
    rules: {
      'react/no-unknown-property': ['error', { ignore: ['jsx', 'global'] }],
      '@next/next/no-img-element': 'off',
    },
  },
];
