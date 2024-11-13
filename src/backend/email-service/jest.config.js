// @ts-check

/*
 * Human Tasks:
 * 1. Ensure ts-jest (^29.1.0) is installed in package.json
 * 2. Ensure jest (^29.5.0) is installed in package.json
 * 3. Verify that the coverage directory is added to .gitignore
 */

// External dependencies versions:
// ts-jest: ^29.1.0
// jest: ^29.5.0

/** @type {import('jest').Config} */
const config = {
  // Addresses requirement: Backend Framework (6. TECHNOLOGY STACK/6.2.1)
  // Configure Jest to handle TypeScript files for NestJS 10.x testing
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.test\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest'
  },

  // Addresses requirement: Development Tools (6. TECHNOLOGY STACK/6.5.1)
  // Configure comprehensive code coverage reporting
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/main.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.module.ts'
  ],
  coverageDirectory: 'coverage',

  // Configure Node.js environment for server-side testing
  testEnvironment: 'node',

  // Set up module path aliases to match TypeScript configuration
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },

  // Additional Jest configuration aligned with TypeScript settings
  globals: {
    'ts-jest': {
      tsconfig: '<rootDir>/tsconfig.json',
      diagnostics: true,
      isolatedModules: true
    }
  },

  // Verbose output for detailed test results
  verbose: true,

  // Configure test timeout
  testTimeout: 10000,

  // Enable parallel test execution for faster results
  maxWorkers: '50%',

  // Clear mocks between tests for isolation
  clearMocks: true,

  // Fail tests on any error or warning
  errorOnDeprecated: true,

  // Display individual test results
  displayName: 'email-service',

  // Prevent tests from producing false positives
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/'
  ],

  // Force exit after all tests complete
  forceExit: true,

  // Detect memory leaks
  detectLeaks: true,

  // Detect open handles
  detectOpenHandles: true
};

module.exports = config;