/**
 * HUMAN TASKS:
 * 1. Ensure @typescript-eslint/parser@^6.0.0 is installed
 * 2. Ensure @typescript-eslint/eslint-plugin@^6.0.0 is installed
 * 3. Ensure eslint-plugin-import@^2.27.0 is installed
 * 4. Ensure eslint-config-prettier@^8.8.0 is installed
 * 5. Verify tsconfig.json is in the same directory as .eslintrc.js
 */

// @typescript-eslint/parser@^6.0.0
// @typescript-eslint/eslint-plugin@^6.0.0
// eslint-plugin-import@^2.27.0
// eslint-config-prettier@^8.8.0

/**
 * ESLint configuration for the email service microservice
 * Addresses requirements:
 * - Programming Language (6.1): Enforces TypeScript 5.0 best practices
 * - Code Quality (6.5.1): Implements static code analysis and strict linting rules
 * - System Availability (2.0): Prevents runtime errors through strict type checking
 */
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
    ecmaVersion: 2022
  },
  plugins: [
    '@typescript-eslint/eslint-plugin',
    'import'
  ],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'prettier'
  ],
  root: true,
  env: {
    node: true,
    jest: true
  },
  ignorePatterns: [
    '.eslintrc.js',
    'dist/',
    'node_modules/'
  ],
  rules: {
    // Enforce strict TypeScript patterns for enhanced reliability
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'error',
    '@typescript-eslint/explicit-module-boundary-types': 'error',
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-unused-vars': 'error',

    // Import/export rules for consistent module usage
    'import/prefer-default-export': 'off',
    'import/no-unresolved': 'error',
    'import/order': [
      'error',
      {
        'newlines-between': 'always'
      }
    ]
  }
};