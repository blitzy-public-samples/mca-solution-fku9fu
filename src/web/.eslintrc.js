/*
Human Tasks:
1. Ensure @typescript-eslint/parser@^5.0.0 is installed
2. Ensure @typescript-eslint/eslint-plugin@^5.0.0 is installed
3. Ensure eslint-plugin-react@^7.32.0 is installed
4. Ensure eslint-plugin-react-hooks@^4.6.0 is installed
5. Ensure eslint-config-prettier@^8.8.0 is installed
6. Ensure eslint-plugin-import@^2.27.0 is installed
*/

// @typescript-eslint/parser@^5.0.0
// @typescript-eslint/eslint-plugin@^5.0.0
// eslint-plugin-react@^7.32.0
// eslint-plugin-react-hooks@^4.6.0
// eslint-config-prettier@^8.8.0
// eslint-plugin-import@^2.27.0

/** 
 * ESLint configuration for MCA application web frontend
 * Addresses requirements:
 * - Code Quality Standards (6.1 PROGRAMMING LANGUAGES)
 * - Frontend Development Standards (4.2.1 Core Components)
 */

module.exports = {
  // Prevents ESLint from looking for configuration files in parent directories
  root: true,

  // Specifies the TypeScript parser for ESLint
  parser: '@typescript-eslint/parser',

  // Parser options configuration
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true,
    },
    // Points to local tsconfig.json for type-aware rules
    project: './tsconfig.json',
  },

  // Configuration extends from recommended configs
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:react/recommended',
    'plugin:react-hooks/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    // Prettier must be last to override other formatting rules
    'prettier',
  ],

  // Required plugins for TypeScript, React, and import validation
  plugins: [
    '@typescript-eslint',
    'react',
    'react-hooks',
    'import',
  ],

  // Custom rule configurations
  rules: {
    // TypeScript-specific rules
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'error',

    // React-specific rules
    'react/react-in-jsx-scope': 'off', // Not needed with React 17+
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',

    // Import organization rules
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'parent',
          'sibling',
          'index',
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
        },
      },
    ],
  },

  // Additional settings for plugins
  settings: {
    // Automatically detect React version
    react: {
      version: 'detect',
    },
    // TypeScript import resolution settings
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
    },
  },
};