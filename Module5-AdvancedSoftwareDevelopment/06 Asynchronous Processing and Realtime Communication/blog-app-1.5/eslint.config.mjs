import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.env*', '**/*.html'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // 1. GLOBAL RULES (Applies to server, client, and shared folders)
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },

  // 2. SERVER SPECIFIC
  {
    files: ['server/**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },

  // 3. SERVER SEED EXCEPTION
  {
    files: ['server/prisma/seed.ts'],
    rules: {
      'no-console': 'off', // Allow console.log for database seeding
    },
  },

  // 4. CLIENT SPECIFIC (React)
  {
    files: ['client/src/**/*.{ts,tsx}', 'client/index.html'],
    languageOptions: {
      globals: globals.browser,
    },
    settings: {
      react: {
        version: 'detect', // Automatically detects React version to prevent warnings
      },
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'react-refresh': reactRefreshPlugin,
    },
    rules: {
      ...reactPlugin.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules, // Disables needing 'import React from "react"'
      ...reactHooksPlugin.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },

  // 5. PRETTIER OVERRIDES (Must be last)
  prettierConfig,
);
