/*
Human Tasks:
1. Verify Auth0 configuration in environment variables
2. Test theme persistence across page reloads
3. Validate Redux state persistence behavior
4. Test accessibility with screen readers and keyboard navigation
*/

// react v18.x
import React from 'react';

// react-redux v8.x
import { Provider } from 'react-redux';

// redux-persist/integration/react v6.x
import { PersistGate } from 'redux-persist/integration/react';

// @mui/material v5.x
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// react-router-dom v6.x
import { BrowserRouter } from 'react-router-dom';

// Internal imports
import MainLayout from './layouts/MainLayout/MainLayout';
import { store, persistor } from './redux/store';
import { getThemeOptions } from './config/theme.config';

/**
 * Root application component that sets up core application structure
 * @implements User Interface Design requirement with Material Design and WCAG 2.1 compliance
 * @implements Authentication Integration requirement with Auth0 integration
 * @implements State Management requirement with Redux store configuration
 */
const App: React.FC = () => {
  // Initialize theme with default light mode and standard contrast
  const theme = createTheme(getThemeOptions('light', false));

  return (
    <Provider store={store}>
      {/* Handle Redux state persistence loading */}
      <PersistGate loading={null} persistor={persistor}>
        {/* Configure Material-UI theme provider */}
        <ThemeProvider theme={theme}>
          {/* Apply Material-UI CSS baseline for consistent styling */}
          <CssBaseline />
          
          {/* Set up client-side routing */}
          <BrowserRouter>
            {/* Main application layout wrapper */}
            <MainLayout>
              {/* Router outlet will be rendered as children */}
            </MainLayout>
          </BrowserRouter>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
};

export default App;