import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['**/dist/**', '**/node_modules/**', '**/.env*', '**/*.html'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  // 1. GLOBAL RULES
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
    files: ['**/*.ts'],
    languageOptions: {
      globals: globals.node,
    },
  },

  // 3. SERVER SEED EXCEPTION
  {
    files: ['prisma/seed.ts'],
    rules: {
      'no-console': 'off', // Allow console.log for database seeding
    },
  },

  // 4. PRETTIER OVERRIDES (Must be last)
  prettierConfig,
);
