import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import n8nPlugin from '@n8n/eslint-plugin-community-nodes';

export default [
  {
    files: ['nodes/**/*.ts', 'credentials/**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: './tsconfig.json',
        sourceType: 'module',
      },
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      '@n8n/community-nodes': n8nPlugin,
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
      '@n8n/community-nodes/no-deprecated-workflow-functions': 'error',
      '@n8n/community-nodes/no-http-request-with-manual-auth': 'error',
    },
  },
  {
    files: ['nodes/**/*.js', 'credentials/**/*.js'],
    rules: {},
  },
];
