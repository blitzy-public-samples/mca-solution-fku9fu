// @mui/material v5.14.x
// @mui/material/styles v5.14.x
// react v18.x

import React from 'react';
import { Pagination as MuiPagination, Select, useMediaQuery } from '@mui/material';
import { styled } from '@mui/material/styles';
import { getThemeOptions } from '../../../config/theme.config';

/*
Human Tasks:
1. Test keyboard navigation flow with screen readers
2. Verify ARIA labels are properly announced by assistive technologies
3. Test page size selector behavior with different data set sizes
4. Validate responsive layout on various screen sizes and orientations
*/

// Requirement: Component Library - Material Design components implementation with consistent theming
const PaginationContainer = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(2),
  padding: theme.spacing(1),
  marginTop: theme.spacing(2),
  flexWrap: 'wrap',
  '@media (max-width: 600px)': {
    flexDirection: 'column',
    gap: theme.spacing(1),
  }
}));

// Requirement: Component Library - Material Design components implementation with consistent theming
const PageSizeSelect = styled(Select)(({ theme }) => ({
  minWidth: '100px',
  marginLeft: theme.spacing(2),
  height: '32px',
  '@media (max-width: 600px)': {
    marginLeft: 0,
    marginTop: theme.spacing(1),
  }
}));

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  showPageSize?: boolean;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

// Available page size options
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// Requirement: Accessibility - WCAG 2.1 Level AA compliance with keyboard navigation support
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  pageSize,
  showPageSize = true,
  onPageChange,
  onPageSizeChange
}) => {
  // Requirement: Responsive Design - Mobile-first approach with responsive behavior
  const theme = getThemeOptions('light', false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handlePageChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const handlePageSizeChange = (event: any) => {
    const newSize = parseInt(event.target.value, 10);
    onPageSizeChange(newSize);
  };

  return (
    <PaginationContainer
      role="navigation"
      aria-label="Pagination navigation"
    >
      <MuiPagination
        page={currentPage}
        count={totalPages}
        onChange={handlePageChange}
        size={isMobile ? 'small' : 'medium'}
        shape="rounded"
        showFirstButton
        showLastButton
        // Requirement: Accessibility - WCAG 2.1 Level AA compliance
        getItemAriaLabel={(type, page) => {
          switch (type) {
            case 'page':
              return `Go to page ${page}`;
            case 'first':
              return 'Go to first page';
            case 'last':
              return 'Go to last page';
            case 'next':
              return 'Go to next page';
            case 'previous':
              return 'Go to previous page';
            default:
              return '';
          }
        }}
      />
      
      {showPageSize && (
        <div
          role="group"
          aria-label="Items per page selector"
        >
          <PageSizeSelect
            value={pageSize}
            onChange={handlePageSizeChange}
            variant="outlined"
            size="small"
            aria-label="Select number of items per page"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} per page
              </option>
            ))}
          </PageSizeSelect>
        </div>
      )}
    </PaginationContainer>
  );
};