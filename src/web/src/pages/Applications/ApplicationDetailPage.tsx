/**
 * Human Tasks:
 * 1. Test loading states and error handling scenarios
 * 2. Verify document viewer integration and accessibility
 * 3. Test responsive layout across different screen sizes
 * 4. Validate status update workflow and permissions
 */

// react v18.2.0
import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom'; // v6.11.0
import { useDispatch, useSelector } from 'react-redux'; // v8.0.5

// @mui/material v5.x
import { Box, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

// Internal imports
import DashboardLayout from '../../layouts/DashboardLayout/DashboardLayout';
import ApplicationDetails from '../../components/applications/ApplicationDetails/ApplicationDetails';
import { Application, ApplicationStatus } from '../../interfaces/application.interface';
import {
  fetchApplicationById,
  selectCurrentApplication,
  selectApplicationsLoading
} from '../../redux/slices/applicationSlice';

/**
 * REQ: Application Detail View - Styled container for loading state
 * Location: 5. SYSTEM DESIGN/5.1.3 Application Detail View
 */
const LoadingContainer = styled(Box)({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: 400
});

/**
 * REQ: Application Detail View - Main page component for displaying MCA application details
 * Location: 5. SYSTEM DESIGN/5.1.3 Application Detail View
 * 
 * REQ: Data Management - Display and management of merchant information
 * Location: 3. SCOPE/Core Features and Functionalities
 */
const ApplicationDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useDispatch();
  const application = useSelector(selectCurrentApplication);
  const isLoading = useSelector(selectApplicationsLoading);

  useEffect(() => {
    if (id) {
      dispatch(fetchApplicationById(id));
    }
  }, [dispatch, id]);

  /**
   * REQ: Application Processing - Handles updates to application status
   * Location: 2. SYSTEM OVERVIEW/High-Level Description
   */
  const handleStatusChange = async (newStatus: ApplicationStatus): Promise<void> => {
    if (application) {
      // Note: Status update implementation will be handled by the parent component
      // through the onStatusChange prop of ApplicationDetails
      console.log(`Updating application ${application.id} status to ${newStatus}`);
    }
  };

  return (
    <DashboardLayout>
      {isLoading ? (
        <LoadingContainer>
          <CircularProgress />
        </LoadingContainer>
      ) : application ? (
        <ApplicationDetails
          application={application}
          onStatusChange={handleStatusChange}
        />
      ) : (
        <LoadingContainer>
          <Box>Application not found</Box>
        </LoadingContainer>
      )}
    </DashboardLayout>
  );
};

export default ApplicationDetailPage;