/*
Human Tasks:
1. Verify WCAG 2.1 Level AA compliance with automated accessibility testing tools
2. Test responsive behavior across all specified breakpoints (320px, 768px, 1024px, 1440px)
3. Validate color contrast ratios in both light and dark themes
4. Test keyboard navigation and screen reader compatibility
*/

// react v18.x
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// @mui/material v5.x
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Menu,
  MenuItem,
  useMediaQuery
} from '@mui/material';
import { styled } from '@mui/material/styles';

// @mui/icons-material v5.x
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

// Internal imports
import { useAuth } from '../../../hooks/useAuth';
import { useTheme } from '../../../hooks/useTheme';
import { ROUTES } from '../../../constants/routes.constants';

// Styled components with Material Design 8px grid system
const StyledAppBar = styled(AppBar)(({ theme }) => ({
  zIndex: theme.zIndex.drawer + 1,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  // Implements Visual Hierarchy requirement with consistent spacing
  padding: theme.spacing(1),
}));

const LogoWrapper = styled(Typography)(({ theme }) => ({
  flexGrow: 1,
  cursor: 'pointer',
  fontWeight: 'bold',
  // Implements Visual Hierarchy requirement with consistent spacing
  marginLeft: theme.spacing(2),
}));

// Interface for component props
interface NavbarProps {
  onMenuClick: () => void;
}

/**
 * Main navigation bar component that provides access to core application features
 * and user controls with WCAG 2.1 Level AA compliance
 */
export const Navbar: React.FC<NavbarProps> = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuth();
  const { theme, toggleMode } = useTheme();
  
  // Responsive design breakpoint check
  // Implements Responsive Design requirement
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // User menu state
  const [userAnchorEl, setUserAnchorEl] = useState<null | HTMLElement>(null);

  const handleUserMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setUserAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setUserAnchorEl(null);
  };

  const handleDashboardClick = () => {
    navigate(ROUTES.DASHBOARD.HOME);
  };

  const handleLogout = async () => {
    handleUserMenuClose();
    await logout();
  };

  return (
    <StyledAppBar position="fixed">
      <Toolbar>
        {/* Mobile menu button - implements Responsive Design requirement */}
        {isMobile && (
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={onMenuClick}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Application logo/title - implements Visual Hierarchy requirement */}
        <LogoWrapper
          variant="h6"
          onClick={handleDashboardClick}
          role="button"
          tabIndex={0}
          aria-label="Go to dashboard"
        >
          Dollar Funding MCA
        </LogoWrapper>

        {/* Theme toggle - implements Theme Support requirement */}
        <IconButton
          color="inherit"
          onClick={toggleMode}
          aria-label={`Switch to ${theme.palette.mode === 'dark' ? 'light' : 'dark'} mode`}
          sx={{ mr: 1 }}
        >
          {theme.palette.mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
        </IconButton>

        {/* User menu - implements Visual Hierarchy requirement */}
        {isAuthenticated && (
          <>
            <IconButton
              color="inherit"
              onClick={handleUserMenuOpen}
              aria-label="user account menu"
              aria-controls="user-menu"
              aria-haspopup="true"
              aria-expanded={Boolean(userAnchorEl)}
            >
              <AccountCircleIcon />
            </IconButton>
            <Menu
              id="user-menu"
              anchorEl={userAnchorEl}
              open={Boolean(userAnchorEl)}
              onClose={handleUserMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
            >
              <MenuItem
                onClick={() => {
                  handleUserMenuClose();
                  navigate(ROUTES.SETTINGS.PROFILE);
                }}
              >
                {user?.name || 'Profile'}
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleUserMenuClose();
                  navigate(ROUTES.SETTINGS.PREFERENCES);
                }}
              >
                Preferences
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </StyledAppBar>
  );
};