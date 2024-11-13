/**
 * Human Tasks:
 * 1. Verify Node.js version compatibility (Node.js >= 14.x required for Jest 29.x)
 * 2. Ensure all required testing dependencies are installed:
 *    - jest-environment-jsdom@^29.0.0
 *    - ts-jest@^29.0.0
 *    - identity-obj-proxy@^3.0.0
 *    - @testing-library/jest-dom@^5.16.5
 *    - @testing-library/react@^14.0.0
 * 3. Configure environment variables in .env.test if needed for testing
 */

/** 
 * REQ: Testing Infrastructure (4. SYSTEM ARCHITECTURE/4.2 Component Details/4.2.1 Core Components)
 * Jest configuration for React components with TypeScript support
 */
const jestConfig = {
  // Use JSDOM environment for React component testing
  testEnvironment: 'jsdom',

  // Setup file that configures test environment with global mocks and utilities
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],

  // Define test file locations
  roots: ['<rootDir>/src', '<rootDir>/tests'],

  // Enable verbose output for detailed test results
  verbose: true,

  // Enable code coverage collection
  collectCoverage: true,

  // Configure coverage collection settings
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/vite-env.d.ts',
    '!src/index.tsx',
    '!src/App.tsx'
  ],

  // Set coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },

  /**
   * REQ: User Interface Testing (5. SYSTEM DESIGN/5.1 USER INTERFACE DESIGN)
   * Module name mapping for handling non-JavaScript assets in tests
   */
  moduleNameMapper: {
    // Handle CSS/SCSS imports
    '^.+\\.(css|less|scss)$': 'identity-obj-proxy',
    // Handle image imports
    '^.+\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/src/utils/test.utils.ts'
  },

  // TypeScript file transformation configuration
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },

  // Test file patterns and configurations
  testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.[jt]sx?$',
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  
  // Supported file extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json']
};

module.exports = jestConfig;