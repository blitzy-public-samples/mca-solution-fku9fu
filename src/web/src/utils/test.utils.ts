/**
 * Human Tasks:
 * 1. Configure test environment variables in Jest setup files
 * 2. Set up mock service worker (MSW) for API mocking if needed
 * 3. Review and update test wrapper configuration when adding new global providers
 */

// @testing-library/react v14.0.0
import { render, RenderResult } from '@testing-library/react';
// @testing-library/user-event v14.0.0
import userEvent from '@testing-library/user-event';
// @reduxjs/toolkit v1.9.5
import { configureStore } from '@reduxjs/toolkit';
// react-redux v8.1.1
import { Provider } from 'react-redux';
import { ReactNode } from 'react';

// Import store types
import type { RootState, AppStore } from '../redux/store';

/**
 * REQ: Testing Infrastructure (4. SYSTEM ARCHITECTURE/4.2 Component Details/4.2.1 Core Components)
 * Creates a Redux store instance specifically for testing purposes with optional preloaded state
 */
export function createTestStore(preloadedState?: Partial<RootState>): AppStore {
  return configureStore({
    reducer: {
      application: (state = {}) => state,
      document: (state = {}) => state,
      webhook: (state = {}) => state,
      ui: (state = {}) => state,
      auth: (state = {}) => state,
      ...preloadedState
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Disable for testing
        immutableCheck: false // Disable for testing
      })
  }) as AppStore;
}

interface RenderOptions {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

/**
 * REQ: User Interface Testing (5. SYSTEM DESIGN/5.1 USER INTERFACE DESIGN)
 * Renders a React component wrapped with necessary providers for testing
 */
export function renderWithProviders(
  ui: ReactNode,
  {
    preloadedState = {},
    store = createTestStore(preloadedState),
    ...renderOptions
  }: RenderOptions = {}
): RenderResult & { store: AppStore } {
  function Wrapper({ children }: { children: ReactNode }) {
    return <Provider store={store}>{children}</Provider>;
  }

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions })
  };
}

/**
 * REQ: Testing Infrastructure (4. SYSTEM ARCHITECTURE/4.2 Component Details/4.2.1 Core Components)
 * Creates a mock API response for testing API interactions
 */
export async function mockApiResponse(
  data: object,
  status: number = 200
): Promise<Response> {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

// Additional test utility types
export type UserEvent = ReturnType<typeof userEvent.setup>;

// Re-export commonly used testing utilities for convenience
export { userEvent };