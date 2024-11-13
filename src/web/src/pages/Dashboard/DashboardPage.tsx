/*
Human Tasks:
1. Verify WCAG 2.1 Level AA compliance for color contrast and keyboard navigation
2. Test responsive layout at all breakpoints (320px, 768px, 1024px, 1440px)
3. Validate screen reader compatibility and ARIA labels
4. Test application statistics data refresh behavior
*/

// react v18.2.0
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // v6.11.0
import { useDispatch, useSelector } from 'react-redux'; // v8.1.0

// @mui/material v5.14.0
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  Box
} from '@mui/material';

// @mui/icons-material v5.14.0
import { Upload, Assessment } from '@mui/icons-material';

// Internal imports
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import { ApplicationList } from '../../components/applications/ApplicationList/ApplicationList';
import { ApplicationStatus } from '../../components/applications/ApplicationStatus/ApplicationStatus';
import { useAuth } from '../../hooks/useAuth';

// Redux actions and selectors
import {
  fetchApplicationStats,
  selectApplicationStats,
  selectApplicationStatsLoading
} from '../../redux/slices/applicationSlice';

// Interface for application statistics
interface ApplicationStats {
  pending: number;
  inProcess: number;
  completed: number;
}

/**
 * Main dashboard page component showing application overview and recent applications
 * @implements Dashboard Overview requirement from 5.1.2 Main Dashboard
 * @implements Recent Applications requirement from 5.1.2 Main Dashboard
 * @implements Quick Actions requirement from 5.1.2 Main Dashboard
 */
const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();

  // Get application statistics from Redux store
  const stats = useSelector(selectApplicationStats);
  const statsLoading = useSelector(selectApplicationStatsLoading);

  // Fetch application statistics on component mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchApplicationStats() as any);
    }
  }, [dispatch, isAuthenticated]);

  // Navigation handlers
  const handleApplicationClick = (applicationId: string): void => {
    navigate(`/applications/${applicationId}`);
  };

  const handleUploadClick = (): void => {
    navigate('/applications/upload');
  };

  return (
    <DashboardLayout>
      {/* Applications Overview Section */}
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Applications Overview
        </Typography>
        <Grid container spacing={3}>
          {/* Pending Applications Card */}
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Review
                </Typography>
                <Typography variant="h3" component="div">
                  {statsLoading ? '...' : stats?.pending || 0}
                </Typography>
                <ApplicationStatus status="PENDING_REVIEW" size="small" />
              </CardContent>
            </Card>
          </Grid>

          {/* In Process Applications Card */}
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  In Process
                </Typography>
                <Typography variant="h3" component="div">
                  {statsLoading ? '...' : stats?.inProcess || 0}
                </Typography>
                <ApplicationStatus status="IN_PROCESS" size="small" />
              </CardContent>
            </Card>
          </Grid>

          {/* Completed Applications Card */}
          <Grid item xs={12} sm={4}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Completed
                </Typography>
                <Typography variant="h3" component="div">
                  {statsLoading ? '...' : stats?.completed || 0}
                </Typography>
                <ApplicationStatus status="COMPLETED" size="small" />
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Quick Actions Section */}
      <Box mb={4}>
        <Grid container spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Upload />}
              onClick={handleUploadClick}
              aria-label="Upload new application"
            >
              Upload Application
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Assessment />}
              onClick={() => navigate('/applications/review')}
              aria-label="Review pending applications"
            >
              Review Applications
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Recent Applications Section */}
      <Box>
        <Typography variant="h5" component="h2" gutterBottom>
          Recent Applications
        </Typography>
        <ApplicationList
          onApplicationClick={handleApplicationClick}
          status={undefined}
        />
      </Box>
    </DashboardLayout>
  );
};

export default DashboardPage;