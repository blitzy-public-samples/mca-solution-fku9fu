/*
Human Tasks:
1. Verify the root element with id 'root' exists in the HTML template
2. Test React 18 concurrent rendering behavior in development mode
3. Validate error handling for missing root element
*/

// react v18.x
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Internal imports
import App from './App';

/**
 * Bootstrap and render the React application using React 18's concurrent rendering
 * @implements Browser Support requirement through React 18's modern rendering engine
 * @implements User Interface Design requirement via App component integration
 * @implements State Management requirement through Redux provider in App
 */
const renderApp = (): void => {
  // Validate root element existence
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    throw new Error(
      'Failed to find root element. Ensure there is a <div id="root"></div> in your HTML template.'
    );
  }

  try {
    // Create React 18 root for concurrent rendering features
    const root = createRoot(rootElement);

    // Render application with StrictMode for development checks
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
  } catch (error) {
    console.error('Failed to render application:', error);
    throw error;
  }
};

// Initialize application rendering
renderApp();

// Enable Hot Module Replacement (HMR) in development
if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./App', () => {
    renderApp();
  });
}