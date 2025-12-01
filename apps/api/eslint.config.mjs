import { nestJsConfig } from '@repo/eslint-config/nestjs';
import * as importPlugin from 'eslint-plugin-import';

export default [
  // Project-specific ignores (dist/** already in nestJsConfig)
  {
    ignores: ['eslint.config.mjs', 'sync-postman.js', 'node_modules/'],
  },

  // Shared NestJS config (prettier, typescript, turbo, test relaxations)
  ...nestJsConfig,

  // Project-specific: Import plugin with TypeScript resolver
  {
    plugins: {
      import: importPlugin,
    },
    settings: {
      'import/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: true,
      },
      'import/parsers': {
        '@typescript-eslint/parser': ['.ts', '.tsx'],
      },
    },
  },

  // Project-specific: TypeScript parser root dir (required for type-aware linting)
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Project-specific: Import ordering with src/* path pattern
  {
    rules: {
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
            'object',
            'type',
          ],
          'newlines-between': 'always',
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          pathGroups: [
            {
              pattern: 'src/**',
              group: 'internal',
              position: 'after',
            },
          ],
          pathGroupsExcludedImportTypes: ['builtin'],
        },
      ],
      'import/first': 'error',
      'import/newline-after-import': 'error',
      'import/no-duplicates': 'error',
    },
  },
];
