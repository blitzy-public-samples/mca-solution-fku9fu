/*
Human Tasks:
1. Verify WCAG 2.1 Level AA compliance with automated accessibility testing tools
2. Test responsive behavior across all specified breakpoints (320px, 768px, 1024px, 1440px)
3. Validate color contrast ratios in both light and dark themes
4. Test keyboard navigation and screen reader compatibility
*/

// react v18.x
import React, { useState } from 'react';

// @mui/material v5.x
import { Box, Container, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';

// Internal components
import { Navbar } from '../../components/common/Navbar/Navbar';
import Sidebar from '../../components/common/Sidebar/Sidebar';

// Styled components implementing Material Design 8px grid system
const MainContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  backgroundColor: theme.palette.background.default,
  // Implements Visual Hierarchy requirement with consistent spacing
  padding: 0,
  margin: 0,
}));

const ContentWrapper = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  // Implements Visual Hierarchy requirement with consistent spacing
  paddingTop: theme.spacing(8),
  // Implements Responsive Design requirement with proper sidebar spacing
  [theme.breakpoints.up('sm')]: {
    paddingLeft: ({ open }: { open: boolean }) => open ? '240px' : 0,
    transition: theme.transitions.create('padding', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
}));

// Interface for component props
interface MainLayoutProps {
  children: React.ReactNode;
}

/**
 * Main layout component that provides the core application structure
 * @implements Visual Hierarchy requirement with Material Design spacing system
 * @implements Responsive Design requirement with mobile-first approach
 * @implements Theme Support requirement with consistent theme application
 */
const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  // State for sidebar open/close
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  
  // Responsive behavior implementation
  // Implements Responsive Design requirement with proper breakpoints
  const isMobile = useMediaQuery((theme: any) => theme.breakpoints.down('sm'));
  
  // Automatically close sidebar on mobile
  React.useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    } else {
      setSidebarOpen(true);
    }
  }, [isMobile]);

  // Handle sidebar toggle
  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <MainContainer>
      {/* Navbar implementation with menu click handler */}
      <Navbar onMenuClick={handleSidebarToggle} />
      
      {/* Sidebar implementation with open state and close handler */}
      <Sidebar 
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      
      {/* Main content area with responsive padding */}
      <ContentWrapper open={sidebarOpen}>
        <Container maxWidth="xl" sx={{ py: 3 }}>
          {children}
        </Container>
      </ContentWrapper>
    </MainContainer>
  );
};

export default MainLayout;