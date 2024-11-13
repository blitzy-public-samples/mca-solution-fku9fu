/*
Human Tasks:
1. Test responsive behavior across all specified breakpoints (320px, 768px, 1024px, 1440px)
2. Verify theme switching functionality in both light and dark modes
3. Test keyboard navigation and screen reader compatibility
4. Validate authentication flow and protected route behavior
*/

// react v18.2.0
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom'; // v6.11.0

// @mui/material v5.x
import { Box, Container, CircularProgress, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';

// Internal imports
import Navbar from '../../components/common/Navbar/Navbar';
import Sidebar from '../../components/common/Sidebar/Sidebar';
import { useAuth } from '../../hooks/useAuth';

// Styled components implementing Visual Hierarchy requirement with 8px grid system
const MainContent = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: 64, // Fixed navbar height
  minHeight: 'calc(100vh - 64px)',
  backgroundColor: theme.palette.background.default,
  // Implements Visual Hierarchy requirement with consistent spacing
  [theme.breakpoints.up('sm')]: {
    marginLeft: 0,
  },
  [theme.breakpoints.up('md')]: {
    marginLeft: 240, // Sidebar width when open
  },
}));

const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  height: '100vh',
});

// Interface for component props
interface DashboardLayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout component for authenticated dashboard pages
 * @implements Visual Hierarchy requirement with card-based layout and consistent spacing
 * @implements Responsive Design requirement with mobile-first approach
 * @implements Theme Support requirement with theme integration
 */
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  // Authentication state
  const { isAuthenticated, loading } = useAuth();
  
  // Responsive design breakpoint detection
  // Implements Responsive Design requirement
  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('md'));
  
  // Sidebar state management
  const [open, setOpen] = useState(!isMobile);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setOpen(!open);
  };

  // Handle sidebar close (mobile only)
  const handleSidebarClose = () => {
    if (isMobile) {
      setOpen(false);
    }
  };

  // Show loading state while checking authentication
  if (loading) {
    return (
      <LoadingContainer>
        <CircularProgress />
      </LoadingContainer>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Box sx={{ display: 'flex' }}>
      {/* Top navigation bar */}
      <Navbar onMenuClick={handleSidebarToggle} />

      {/* Sidebar navigation */}
      <Sidebar 
        open={open}
        onClose={handleSidebarClose}
      />

      {/* Main content area */}
      <MainContent component="main">
        <Container maxWidth="xl">
          {children}
        </Container>
      </MainContent>
    </Box>
  );
};

export default DashboardLayout;