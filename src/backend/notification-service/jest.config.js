// @ts-check

/*
Human Tasks:
1. Ensure tests/setup.ts exists and contains necessary test setup configuration
2. Verify node_modules/@types/jest is installed for TypeScript type definitions
3. Configure CI/CD pipeline to use the coverage reports generated in the coverage directory
*/

/** @type {import('@jest/types').Config.InitialOptions} */
const config = {
  // Requirement: Integration Layer - Configure TypeScript preset for testing REST APIs and webhooks
  // Using ts-jest v29.1.0
  preset: 'ts-jest',
  
  // Requirement: Integration Layer - Set Node.js environment for API testing
  testEnvironment: 'node',
  
  // Define root directories for source and test files
  roots: [
    '<rootDir>/src',
    '<rootDir>/tests'
  ],
  
  // Specify test file patterns
  testMatch: [
    '**/__tests__/**/*.+(ts|tsx|js)',
    '**/?(*.)+(spec|test).+(ts|tsx|js)'
  ],
  
  // Configure TypeScript transformation
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  
  // Requirement: System Availability - Enable coverage reporting for monitoring test quality
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.{js,ts}',
    '!src/**/*.d.ts',
    '!src/server.ts',
    '!src/app.ts'
  ],
  
  // Configure module path aliases to match tsconfig.json paths
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Load test setup file for global test configuration
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  
  // Requirement: System Availability - Set appropriate timeout for API and webhook tests
  testTimeout: 10000,
  
  // Reset mocks automatically between tests
  clearMocks: true,
  
  // Enable verbose test output for better debugging
  verbose: true,
  
  // Additional configurations for robust testing
  errorOnDeprecated: true,
  detectOpenHandles: true,
  forceExit: true,
  
  // Configure coverage thresholds to ensure high test quality
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  
  // Report test coverage in multiple formats
  coverageReporters: [
    'text',
    'html',
    'lcov',
    'json'
  ],
  
  // Ignore coverage for specific patterns
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/',
    '/__tests__/',
    '/interfaces/',
    '/types/'
  ],
  
  // Configure global settings for tests
  globals: {
    'ts-jest': {
      tsconfig: 'tsconfig.json',
      diagnostics: true,
      isolatedModules: true
    }
  }
};

module.exports = config;