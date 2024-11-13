// @mui/material v5.x
// @mui/icons-material v5.x
// react-router-dom v6.11.0

/**
 * Human Tasks:
 * 1. Verify that all navigation routes are properly configured in the router
 * 2. Test responsive behavior across different screen sizes
 * 3. Validate theme switching functionality
 * 4. Ensure proper role-based access control testing
 */

import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  useTheme,
  useMediaQuery,
  styled,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DescriptionIcon,
  Webhook as WebhookIcon,
  Settings as SettingsIcon,
  ChevronLeft as ChevronLeftIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

import { ROUTES, DASHBOARD, APPLICATIONS, DOCUMENTS, WEBHOOKS, SETTINGS } from '../../constants/routes.constants';
import { useAuth } from '../../hooks/useAuth';

// Interface definitions
interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

// Styled components
const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

/**
 * Returns navigation items based on user role
 * @implements Role-Based Access Control requirement (7.1.3 Role-Based Access Control)
 */
const getNavigationItems = (user: UserProfile | null): NavigationItem[] => {
  const baseItems: NavigationItem[] = [
    {
      label: 'Dashboard',
      path: DASHBOARD.HOME,
      icon: <DashboardIcon />,
      roles: ['user', 'admin'],
    },
    {
      label: 'Applications',
      path: APPLICATIONS.LIST,
      icon: <DashboardIcon />,
      roles: ['user', 'admin'],
    },
    {
      label: 'Documents',
      path: DOCUMENTS.VIEWER,
      icon: <DescriptionIcon />,
      roles: ['user', 'admin'],
    },
    {
      label: 'Webhooks',
      path: WEBHOOKS.LIST,
      icon: <WebhookIcon />,
      roles: ['admin'],
    },
    {
      label: 'Settings',
      path: SETTINGS.INDEX,
      icon: <SettingsIcon />,
      roles: ['user', 'admin'],
    },
  ];

  if (!user) return [];

  return baseItems.filter(item => item.roles.includes(user.role));
};

/**
 * Sidebar component that renders navigation menu based on user role
 * @implements Navigation Structure requirement (SYSTEM DESIGN/USER INTERFACE DESIGN/5.1.7 Navigation Structure)
 * @implements Theme Support requirement (SYSTEM DESIGN/USER INTERFACE DESIGN/Design Specifications)
 * @implements Role-Based Access requirement (7. SECURITY CONSIDERATIONS/7.1.3 Role-Based Access Control)
 */
const Sidebar: React.FC<SidebarProps> = ({ open, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigationItems = getNavigationItems(user);

  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      onClose();
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'persistent'}
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.paper,
          color: theme.palette.text.primary,
        },
      }}
    >
      <DrawerHeader>
        <IconButton onClick={onClose}>
          <ChevronLeftIcon />
        </IconButton>
      </DrawerHeader>

      <List>
        {navigationItems.map((item) => (
          <ListItem
            button
            key={item.path}
            onClick={() => handleNavigate(item.path)}
            selected={location.pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.action.selected,
              },
              '&:hover': {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ListItemIcon sx={{ color: 'inherit' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItem>
        ))}
      </List>
    </Drawer>
  );
};

export default Sidebar;