/**
 * Human Tasks:
 * 1. Configure Redux DevTools browser extension in development environment
 * 2. Set up error tracking service integration for Redux state changes
 * 3. Review and adjust persistence configuration based on storage quotas
 * 4. Ensure proper cleanup of persisted state on logout
 */

// @reduxjs/toolkit v1.9.5
import { configureStore } from '@reduxjs/toolkit';
// redux-persist v6.0.0
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';

// Import reducers
import applicationReducer from './slices/applicationSlice';
import documentReducer from './slices/documentSlice';
import webhookReducer from './slices/webhookSlice';
import uiReducer from './slices/uiSlice';
import authReducer from './slices/authSlice';

// Import middleware
import { apiMiddleware } from './middleware/api.middleware';
import { authMiddleware } from './middleware/auth.middleware';

/**
 * REQ: State Management (5. SYSTEM DESIGN/5.1 USER INTERFACE DESIGN)
 * Configure Redux persistence settings
 */
const PERSIST_CONFIG = {
  key: 'mca-root',
  storage,
  whitelist: ['auth', 'ui'], // Only persist authentication and UI state
  blacklist: ['application', 'document', 'webhook'] // Don't persist these states
};

/**
 * REQ: State Management (5. SYSTEM DESIGN/5.1 USER INTERFACE DESIGN)
 * Combine all reducers into root reducer
 */
const rootReducer = {
  application: applicationReducer,
  document: documentReducer,
  webhook: webhookReducer,
  ui: uiReducer,
  auth: authReducer
};

/**
 * REQ: State Management (5. SYSTEM DESIGN/5.1 USER INTERFACE DESIGN)
 * Configure and create Redux store with middleware and persistence
 */
const configureAppStore = () => {
  // Create persisted reducer
  const persistedReducer = persistReducer(PERSIST_CONFIG, rootReducer);

  // Configure middleware array
  const middleware = [
    apiMiddleware,
    authMiddleware
  ];

  // Create store with middleware and DevTools configuration
  const store = configureStore({
    reducer: persistedReducer,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore persist actions in serializable check
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE']
        }
      }).concat(middleware),
    devTools: process.env.NODE_ENV !== 'production'
  });

  // Create persistor
  const persistor = persistStore(store);

  return { store, persistor };
};

/**
 * REQ: Authentication Integration (7. SECURITY CONSIDERATIONS/7.1 AUTHENTICATION AND AUTHORIZATION)
 * Export configured store and persistor for application integration
 */
const { store, persistor } = configureAppStore();

export { store, persistor };

// Type exports for TypeScript support
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;