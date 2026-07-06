import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import prettierPlugin from "eslint-plugin-prettier/recommended";

export default tseslint.config(
  {
    ignores: ["**/dist", "**/build", "**/node_modules", "backend/test-*.js"],
  },
  {
    // Frontend configuration
    files: ["frontend/**/*.{ts,tsx}"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettierPlugin],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },
  {
    // Backend configuration
    files: ["backend/**/*.ts", "backend/**/*.js"],
    extends: [js.configs.recommended, ...tseslint.configs.recommended, prettierPlugin],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.node,
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
  {
    // Root files
    files: ["*.{js,mjs,ts}"],
    extends: [js.configs.recommended, prettierPlugin],
    languageOptions: {
      globals: globals.node,
    },
  }
);
