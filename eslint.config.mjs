// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import globals from 'globals';

import importPlugin from 'eslint-plugin-import';
import prettierPlugin from 'eslint-plugin-prettier/recommended';
import prettierConfig from 'eslint-config-prettier';

import simpleImportSortPlugin from 'eslint-plugin-simple-import-sort';
import sortClassMembers from 'eslint-plugin-sort-class-members';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'dist', 'node_modules'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  prettierPlugin,
  prettierConfig,
  {
    plugins: {
      import: importPlugin,
      'simple-import-sort': simpleImportSortPlugin,
      'sort-class-members': sortClassMembers,
    },
    languageOptions: {
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',

      'import/no-unresolved': ['error', { caseSensitive: true }],
      'import/no-duplicates': 'warn',

      'simple-import-sort/imports': 'warn',
      'simple-import-sort/exports': 'warn',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      'sort-class-members/sort-class-members': [
        'warn',
        {
          order: [
            // 공개
            '[public-static-properties]',
            '[public-static-methods]',
            'constructor',
            '[public-properties]',
            '[public-methods]',

            // 보호
            '[protected-properties]',
            '[protected-methods]',

            // 비공개
            '[private-properties]',
            '[private-methods]',

            // 접근자
            '[getters]',
            '[setters]',
          ],
          accessorPairPositioning: 'getThenSet',
          stopAfterFirstProblem: false,
          groups: {
            'public-methods': [{ name: '^[a-zA-Z_]+$', type: 'method', accessibility: 'public' }],
            'public-properties': [{ name: '^[a-zA-Z_]+$', type: 'property', accessibility: 'public' }],
            'private-methods': [{ name: '^[a-zA-Z_]+$', type: 'method', accessibility: 'private' }],
            'private-properties': [{ name: '^[a-zA-Z_]+$', type: 'property', accessibility: 'private' }],
          },
        },
      ],
    },
  },
  {
    settings: {
      'import/resolver': {
        typescript: {
          project: './tsconfig.json', // 경로 명확히
        },
      },
    },
  },
);
