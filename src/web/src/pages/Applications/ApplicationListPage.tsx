/**
 * Human Tasks:
 * 1. Verify table responsiveness across all supported breakpoints
 * 2. Test keyboard navigation and screen reader compatibility
 * 3. Validate sorting and filtering functionality with large datasets
 * 4. Review status indicator colors for accessibility contrast
 */

// react v18.2.0
import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux'; // v8.0.5
import { useNavigate } from 'react-router-dom'; // v6.11.0

// @mui/material v5.14.x
import { Box, Typography } from '@mui/material';

// Internal imports
import { Application, ApplicationStatus } from '../../interfaces/application.interface';
import { DataTable } from '../../components/common/DataTable/DataTable';
import { DashboardLayout } from '../../layouts/DashboardLayout/DashboardLayout';
import { 
  fetchApplications,
  selectApplications,
  selectApplicationsLoading
} from '../../redux/slices/applicationSlice';

/**
 * REQ: Application Processing - Main component for displaying applications list
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 */
const ApplicationListPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Redux state
  const applications = useSelector(selectApplications);
  const loading = useSelector(selectApplicationsLoading);

  // Local state for pagination, sorting, and filtering
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [sortField, setSortField] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filters, setFilters] = useState<Record<string, string>>({});

  /**
   * REQ: Data Management - Table columns configuration
   * Location: 3. SCOPE/Core Features and Functionalities/Data Management
   */
  const columns = [
    {
      id: 'id',
      label: 'Application ID',
      accessor: 'id',
      width: '120px',
    },
    {
      id: 'merchant.businessName',
      label: 'Business Name',
      accessor: 'merchant.businessName',
      sortable: true,
    },
    {
      id: 'funding.requestedAmount',
      label: 'Requested Amount',
      accessor: 'funding.requestedAmount',
      sortable: true,
      align: 'right' as const,
      render: (value: number) => `$${(value / 100).toLocaleString()}`,
    },
    {
      id: 'status',
      label: 'Status',
      accessor: 'status',
      sortable: true,
      render: (value: ApplicationStatus) => (
        <Box
          sx={{
            px: 2,
            py: 0.5,
            borderRadius: 1,
            display: 'inline-block',
            bgcolor: {
              [ApplicationStatus.DRAFT]: 'grey.200',
              [ApplicationStatus.SUBMITTED]: 'info.light',
              [ApplicationStatus.IN_REVIEW]: 'warning.light',
              [ApplicationStatus.APPROVED]: 'success.light',
              [ApplicationStatus.REJECTED]: 'error.light',
            }[value],
            color: {
              [ApplicationStatus.DRAFT]: 'text.primary',
              [ApplicationStatus.SUBMITTED]: 'info.dark',
              [ApplicationStatus.IN_REVIEW]: 'warning.dark',
              [ApplicationStatus.APPROVED]: 'success.dark',
              [ApplicationStatus.REJECTED]: 'error.dark',
            }[value],
          }}
        >
          {value}
        </Box>
      ),
    },
    {
      id: 'createdAt',
      label: 'Created Date',
      accessor: 'createdAt',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
    {
      id: 'updatedAt',
      label: 'Last Updated',
      accessor: 'updatedAt',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString(),
    },
  ];

  // Fetch applications on mount and when dependencies change
  useEffect(() => {
    dispatch(fetchApplications({
      page,
      limit: pageSize,
      sortField,
      sortDirection,
      ...filters
    }) as any);
  }, [dispatch, page, pageSize, sortField, sortDirection, filters]);

  /**
   * REQ: User Interface - Handle row click navigation
   * Location: 5. SYSTEM DESIGN/5.1 USER INTERFACE DESIGN/Main Dashboard
   */
  const handleRowClick = useCallback((application: Application) => {
    navigate(`/applications/${application.id}`);
  }, [navigate]);

  /**
   * REQ: User Interface - Handle sorting changes
   * Location: 5. SYSTEM DESIGN/5.1 USER INTERFACE DESIGN/Main Dashboard
   */
  const handleSort = useCallback((columnId: string, direction: 'asc' | 'desc' | undefined) => {
    if (direction) {
      setSortField(columnId);
      setSortDirection(direction);
    }
  }, []);

  /**
   * REQ: User Interface - Handle filter changes
   * Location: 5. SYSTEM DESIGN/5.1 USER INTERFACE DESIGN/Main Dashboard
   */
  const handleFilter = useCallback((columnId: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnId]: value || undefined
    }));
    setPage(1); // Reset to first page when filtering
  }, []);

  /**
   * REQ: User Interface - Handle pagination changes
   * Location: 5. SYSTEM DESIGN/5.1 USER INTERFACE DESIGN/Main Dashboard
   */
  const handlePageChange = useCallback((newPage: number, newPageSize: number) => {
    setPage(newPage);
  }, []);

  return (
    <DashboardLayout>
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Applications
        </Typography>
        
        <DataTable
          data={applications}
          columns={columns}
          loading={loading}
          sortable
          filterable
          paginated
          pageSize={pageSize}
          onSort={handleSort}
          onFilter={handleFilter}
          onPageChange={handlePageChange}
          onRowClick={handleRowClick}
        />
      </Box>
    </DashboardLayout>
  );
};

export default ApplicationListPage;