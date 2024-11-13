// react v18.2.0
import React from 'react';
// @mui/material v5.14.x
import { Box, Container } from '@mui/material';
// react-router-dom v6.11.0
import { useNavigate } from 'react-router-dom';

// Internal imports
import { useAuth } from '../../hooks/useAuth';
import Loading from '../../components/common/Loading/Loading';
import { getThemeOptions } from '../../config/theme.config';

/*
Human Tasks:
1. Verify Auth0 redirect URIs are properly configured for authentication flow
2. Test layout responsiveness across different viewport sizes
3. Validate WCAG 2.1 Level AA compliance using accessibility testing tools
4. Review loading state behavior during authentication checks
*/

/**
 * Props interface for the AuthLayout component
 * @implements Authentication & Authorization requirement from 7.1.1 Authentication Methods
 */
interface AuthLayoutProps {
  /** Child components to render within the layout */
  children: React.ReactNode;
  /** Whether the route requires authentication */
  requireAuth?: boolean;
}

/**
 * Authentication layout component that provides a consistent wrapper for auth-related pages
 * with loading states and protected route functionality.
 * 
 * @implements Authentication & Authorization requirement from 7.1.1 Authentication Methods
 * @implements Visual Hierarchy requirement from Design Specifications
 * @implements Accessibility requirement from Design Specifications
 */
const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  requireAuth = false
}) => {
  const navigate = useNavigate();
  const { isAuthenticated, loading } = useAuth();

  // Handle protected route logic
  React.useEffect(() => {
    if (requireAuth && !loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [requireAuth, isAuthenticated, loading, navigate]);

  // Show loading state while checking authentication
  if (loading) {
    return <Loading size="large" fullScreen />;
  }

  // Get theme options for WCAG compliance
  const theme = getThemeOptions('light', false);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: theme.palette?.background?.default,
        // Implement 8px grid system for consistent spacing
        padding: theme.spacing?.(3)
      }}
      // Accessibility attributes
      role="main"
      aria-live="polite"
    >
      <Container
        maxWidth="md"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          // Maintain consistent spacing
          py: theme.spacing?.(4)
        }}
      >
        {children}
      </Container>
    </Box>
  );
};

export default AuthLayout;