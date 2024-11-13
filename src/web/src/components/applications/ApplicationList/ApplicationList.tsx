// react v18.x
// @mui/material v5.14.x
// @mui/icons-material v5.14.x
// react-redux v8.x

import React, { useEffect, useState, useCallback } from 'react';
import { Grid, Box, useMediaQuery, IconButton } from '@mui/material';
import { ViewList, ViewModule } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';

import { Application } from '../../../interfaces/application.interface';
import { ApplicationCard } from '../ApplicationCard/ApplicationCard';
import { DataTable } from '../../common/DataTable/DataTable';
import {
  fetchApplications,
  selectApplications,
  selectApplicationsLoading
} from '../../../redux/slices/applicationSlice';

/*
Human Tasks:
1. Verify WCAG 2.1 Level AA compliance with automated testing tools
2. Test keyboard navigation flow across view modes
3. Validate responsive behavior at all breakpoints (320px, 768px, 1024px, 1440px)
*/

// REQ: Visual Hierarchy - Card-based layout with status-driven color coding
export interface ApplicationListProps {
  status?: string;
  onApplicationClick: (id: string) => void;
  className?: string;
}

const ApplicationList: React.FC<ApplicationListProps> = ({
  status,
  onApplicationClick,
  className
}) => {
  const dispatch = useDispatch();
  const applications = useSelector(selectApplications);
  const loading = useSelector(selectApplicationsLoading);

  // REQ: Responsive Design - Mobile-first approach with breakpoints
  const isMobile = useMediaQuery('(max-width:768px)');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>(
    () => localStorage.getItem('applicationViewMode') as 'table' | 'grid' || 'table'
  );
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Fetch applications on mount and when filters change
  useEffect(() => {
    dispatch(fetchApplications({ page, limit: pageSize, status }) as any);
  }, [dispatch, page, pageSize, status]);

  const handleViewModeToggle = useCallback(() => {
    const newMode = viewMode === 'table' ? 'grid' : 'table';
    setViewMode(newMode);
    localStorage.setItem('applicationViewMode', newMode);
  }, [viewMode]);

  const handlePageChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
    dispatch(fetchApplications({ page: newPage, limit: newPageSize, status }) as any);
  }, [dispatch, status]);

  // REQ: Data Management - Configure table columns for application data
  const columns = [
    {
      id: 'merchant',
      label: 'Business Name',
      accessor: 'merchant.legalName',
      sortable: true,
      render: (value: string) => value
    },
    {
      id: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      width: '150px'
    },
    {
      id: 'funding',
      label: 'Amount',
      accessor: 'funding.requestedAmount',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value)
    },
    {
      id: 'createdAt',
      label: 'Date',
      accessor: 'createdAt',
      sortable: true,
      width: '150px',
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  return (
    <Box className={className}>
      {/* View mode toggle */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
        <IconButton
          onClick={handleViewModeToggle}
          aria-label={`Switch to ${viewMode === 'table' ? 'grid' : 'table'} view`}
          size="large"
        >
          {viewMode === 'table' ? <ViewModule /> : <ViewList />}
        </IconButton>
      </Box>

      {/* Table view */}
      {viewMode === 'table' && (
        <DataTable
          data={applications}
          columns={columns}
          loading={loading}
          sortable
          paginated
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onRowClick={(row: Application) => onApplicationClick(row.id)}
        />
      )}

      {/* Grid view */}
      {viewMode === 'grid' && (
        <Grid
          container
          spacing={2}
          sx={{ px: { xs: 1, sm: 2 } }}
          role="list"
          aria-label="Applications grid"
        >
          {applications.map((application: Application) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              lg={3}
              key={application.id}
              role="listitem"
            >
              <ApplicationCard
                application={application}
                onClick={() => onApplicationClick(application.id)}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default ApplicationList;