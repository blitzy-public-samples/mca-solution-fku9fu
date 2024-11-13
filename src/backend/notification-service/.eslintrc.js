/**
 * Human Tasks:
 * 1. Ensure tsconfig.json exists in the notification service directory
 * 2. Install required dev dependencies:
 *    - @typescript-eslint/parser@^5.59.0
 *    - @typescript-eslint/eslint-plugin@^5.59.0
 *    - eslint@^8.38.0
 *    - eslint-config-prettier@^8.8.0
 *    - eslint-plugin-import@^2.27.5
 */

// @typescript-eslint/parser@^5.59.0
// @typescript-eslint/eslint-plugin@^5.59.0
// eslint@^8.38.0
// eslint-config-prettier@^8.8.0
// eslint-plugin-import@^2.27.5

/**
 * ESLint configuration for the notification service
 * Addresses requirements:
 * - Code Quality Standards (6.1): TypeScript 5.0 with strict linting rules
 * - Development Tools (6.5.1): Static analysis for code standards
 * - Notification Service Standards (4.2.1): Code quality for webhook handling
 */
module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'import'
  ],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'prettier'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    project: './tsconfig.json'
  },
  env: {
    node: true,
    jest: true,
    es2022: true
  },
  rules: {
    // Enforce explicit return types for better type safety
    '@typescript-eslint/explicit-function-return-type': 'error',
    
    // Prevent usage of any type to maintain strict typing
    '@typescript-eslint/no-explicit-any': 'error',
    
    // Handle unused variables while allowing underscore prefix for intentionally unused params
    '@typescript-eslint/no-unused-vars': ['error', {
      'argsIgnorePattern': '^_'
    }],
    
    // Enforce consistent import ordering and grouping
    'import/order': ['error', {
      'newlines-between': 'always',
      'alphabetize': {
        'order': 'asc'
      }
    }],
    
    // Warn on console statements to prevent debug code in production
    'no-console': 'warn',
    
    // Prevent redundant await on return statements
    'no-return-await': 'error',
    
    // Enforce strict equality comparisons
    'eqeqeq': ['error', 'always']
  }
};