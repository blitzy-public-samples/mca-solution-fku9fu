// react v18.2.0
import React, { useState, useCallback } from 'react';
// @mui/material v5.14.x
import { Box, Typography, Tabs, Tab, Divider } from '@mui/material';

// Internal imports
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import WebhookConfig from '../../components/webhooks/WebhookConfig/WebhookConfig';
import { useAuth } from '../../hooks/useAuth';

/*
Human Tasks:
1. Verify WCAG 2.1 Level AA compliance with automated testing tools
2. Test responsive layout across all breakpoints (320px, 768px, 1024px, 1440px)
3. Validate role-based access restrictions for different user types
4. Review keyboard navigation and screen reader compatibility
*/

interface SettingsTabPanelProps {
  children: React.ReactNode;
  index: number;
  value: number;
}

/**
 * Settings tab panel component with accessibility support
 * @implements WCAG 2.1 Level AA compliance requirement
 */
const SettingsTabPanel: React.FC<SettingsTabPanelProps> = ({
  children,
  value,
  index,
}) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      style={{ padding: '24px 0' }}
    >
      {value === index && children}
    </div>
  );
};

/**
 * Settings page component for managing system configurations
 * @implements Integration Layer requirement - Provides UI for webhook configuration
 * @implements User Interface requirement - Web-based interface for application management
 * @implements Role-Based Access requirement - Role-based access control for settings
 */
const SettingsPage: React.FC = React.memo(() => {
  // Tab state management
  const [selectedTab, setSelectedTab] = useState(0);
  
  // Get user profile and loading state
  const { user, loading } = useAuth();

  /**
   * Handle tab change with accessibility support
   */
  const handleTabChange = useCallback(
    (_event: React.SyntheticEvent, newValue: number) => {
      setSelectedTab(newValue);
    },
    []
  );

  // Render loading state if user data is not yet available
  if (loading) {
    return (
      <DashboardLayout>
        <Box sx={{ p: 3 }}>
          <Typography>Loading settings...</Typography>
        </Box>
      </DashboardLayout>
    );
  }

  // Check if user has admin or operations manager role
  const canAccessWebhooks = user?.role === 'admin' || user?.role === 'operations_manager';

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Settings
        </Typography>
        
        <Divider sx={{ mb: 3 }} />

        <Tabs
          value={selectedTab}
          onChange={handleTabChange}
          aria-label="Settings navigation tabs"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          {canAccessWebhooks && (
            <Tab
              label="Webhooks"
              id="settings-tab-0"
              aria-controls="settings-tabpanel-0"
            />
          )}
          <Tab
            label="User Preferences"
            id="settings-tab-1"
            aria-controls="settings-tabpanel-1"
          />
          {user?.role === 'admin' && (
            <Tab
              label="System Settings"
              id="settings-tab-2"
              aria-controls="settings-tabpanel-2"
            />
          )}
        </Tabs>

        {canAccessWebhooks && (
          <SettingsTabPanel value={selectedTab} index={0}>
            <WebhookConfig
              isLoading={loading}
              onRefresh={() => {
                // Webhook refresh logic will be handled by the WebhookConfig component
              }}
            />
          </SettingsTabPanel>
        )}

        <SettingsTabPanel value={selectedTab} index={1}>
          <Typography variant="body1">
            User preference settings will be implemented in a future update.
          </Typography>
        </SettingsTabPanel>

        {user?.role === 'admin' && (
          <SettingsTabPanel value={selectedTab} index={2}>
            <Typography variant="body1">
              System settings will be implemented in a future update.
            </Typography>
          </SettingsTabPanel>
        )}
      </Box>
    </DashboardLayout>
  );
});

SettingsPage.displayName = 'SettingsPage';

export default SettingsPage;