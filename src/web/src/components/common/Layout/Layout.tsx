/*
Human Tasks:
1. Verify responsive behavior across all specified breakpoints (320px, 768px, 1024px, 1440px)
2. Test theme switching functionality in both light and dark modes
3. Validate accessibility compliance with screen readers and keyboard navigation
4. Ensure proper spacing and visual hierarchy across all viewport sizes
*/

// react v18.x
import React, { useState } from 'react';

// @mui/material v5.x
import { Box, Container, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';

// Internal imports
import { Navbar } from '../Navbar/Navbar';
import Sidebar from '../Sidebar/Sidebar';

// Styled components implementing 8px grid system for visual hierarchy
const MainContent = styled(Box)(({ theme }) => ({
  // Implements Visual Hierarchy requirement with consistent spacing
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: 64, // Fixed navbar height
  minHeight: 'calc(100vh - 64px)',
  backgroundColor: theme.palette.background.default,
  // Implements Theme Support requirement with smooth transitions
  transition: theme.transitions.create(['margin', 'width'], {
    duration: theme.transitions.duration.leavingScreen,
  }),
}));

const ContentWrapper = styled(Container)(({ theme }) => ({
  // Implements Visual Hierarchy requirement with consistent spacing
  maxWidth: 1200,
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  // Implements Responsive Design requirement with proper spacing
  [theme.breakpoints.down('sm')]: {
    padding: theme.spacing(1),
  },
}));

// Interface for component props
interface LayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout component that provides consistent structure for all pages
 * @implements Visual Hierarchy requirement with Material Design components
 * @implements Responsive Design requirement with mobile-first approach
 * @implements Theme Support requirement with theme-aware styling
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  // State for sidebar visibility
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  
  // Implements Responsive Design requirement with breakpoint detection
  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('md'));

  /**
   * Handles opening and closing the sidebar
   * @implements Responsive Design requirement with mobile-specific behavior
   */
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  /**
   * Handles closing the sidebar
   * Particularly useful for mobile views after navigation
   */
  const handleSidebarClose = () => {
    setSidebarOpen(false);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Top navigation bar */}
      <Navbar onMenuClick={handleSidebarToggle} />

      {/* Side navigation panel */}
      <Sidebar 
        open={sidebarOpen} 
        onClose={handleSidebarClose}
      />

      {/* Main content area */}
      <MainContent
        sx={{
          // Implements Responsive Design requirement with dynamic margins
          marginLeft: {
            md: sidebarOpen ? '240px' : 0, // Sidebar width on desktop
          },
          width: {
            md: sidebarOpen ? 'calc(100% - 240px)' : '100%',
          },
        }}
      >
        {/* Content container with responsive width */}
        <ContentWrapper>
          {children}
        </ContentWrapper>
      </MainContent>
    </Box>
  );
};

export default Layout;