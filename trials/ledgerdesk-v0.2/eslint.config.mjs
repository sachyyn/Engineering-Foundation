import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';

export default [
  {
    ignores: [
      '**/node_modules/**',
      '**/vendor/**',
      '.git/**',
      '.agents/**',
      '.codex/**',
      '.cache/**',
      '.verification/**',
      'tooling/bin/**',
      'frontend/dist/**',
      'frontend/src/api/schema.d.ts',
      'backend/var/**',
      'playwright-report/**',
      'test-results/**',
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.mjs', '**/*.ts', '**/*.vue'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        URL: 'readonly',
        Buffer: 'readonly',
        setTimeout: 'readonly',
        AbortController: 'readonly',
        fetch: 'readonly',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-non-null-assertion': 'error',
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: { parser: tseslint.parser, extraFileExtensions: ['.vue'] },
    },
    rules: { 'vue/no-v-html': 'error' },
  },
  {
    files: ['frontend/src/**/*.ts', 'frontend/src/**/*.vue'],
    ignores: ['frontend/src/api/**'],
    rules: {
      'no-restricted-globals': [
        'error',
        { name: 'fetch', message: 'UI-01: use the shared api transport.' },
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@/features/*/*', '**/features/*/*'],
              message:
                'UI-01: do not import another feature internals; compose at the router or extract a shared control.',
            },
          ],
        },
      ],
    },
  },
];
