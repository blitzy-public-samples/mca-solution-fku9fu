/**
 * Human Tasks:
 * 1. Ensure Jest configuration file (jest.config.js) includes this setup file
 * 2. Configure environment variables in .env.test if needed
 * 3. Verify Node version compatibility with Jest 29.x
 */

// @testing-library/jest-dom v5.16.5
import '@testing-library/jest-dom';
// @testing-library/react v14.0.0
import { cleanup } from '@testing-library/react';
// jest-environment-jsdom v29.0.0
import 'jest-environment-jsdom';

import { mockApiResponse } from '../src/utils/test.utils';

/**
 * REQ: Testing Infrastructure (4. SYSTEM ARCHITECTURE/4.2 Component Details/4.2.1 Core Components)
 * Mock browser APIs and objects that are not available in JSDOM
 */

// Mock ResizeObserver which is not implemented in JSDOM
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock matchMedia which is not implemented in JSDOM
global.matchMedia = jest.fn().mockImplementation(query => ({
  matches: false,
  addListener: () => {},
  removeListener: () => {}
}));

// Mock fetch API
global.fetch = jest.fn();

/**
 * REQ: Testing Infrastructure (4. SYSTEM ARCHITECTURE/4.2 Component Details/4.2.1 Core Components)
 * Configure global fetch mock with default implementation
 */
function setupFetchMock(): void {
  jest.clearAllMocks();
  (global.fetch as jest.Mock).mockImplementation(async (url: string, options?: RequestInit) => {
    return mockApiResponse({ success: true });
  });
}

/**
 * REQ: User Interface Testing (5. SYSTEM DESIGN/5.1 USER INTERFACE DESIGN)
 * Cleanup function to reset global state after each test
 */
function cleanupAfterEach(): void {
  // Clear all mock calls and implementations
  jest.clearAllMocks();
  
  // Clean up any mounted React components
  cleanup();
  
  // Reset document body
  document.body.innerHTML = '';
  
  // Clear any pending timers
  jest.clearAllTimers();
}

/**
 * Global setup that runs before all tests
 * REQ: Testing Infrastructure (4. SYSTEM ARCHITECTURE/4.2 Component Details/4.2.1 Core Components)
 */
beforeAll(() => {
  // Set up global fetch mock
  setupFetchMock();
  
  // Extend Jest matchers with DOM-specific matchers
  expect.extend(jest.expect);
  
  // Initialize ResizeObserver mock
  window.ResizeObserver = global.ResizeObserver;
});

/**
 * Global cleanup that runs after each test
 * REQ: User Interface Testing (5. SYSTEM DESIGN/5.1 USER INTERFACE DESIGN)
 */
afterEach(() => {
  // Run cleanup function
  cleanupAfterEach();
  
  // Clear all mock implementations
  jest.clearAllMocks();
  
  // Reset all mocks
  jest.restoreAllMocks();
});