// react v18.x
import React, { useState, useCallback, useMemo } from 'react';
// @mui/material v5.14.x
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Paper,
  TextField,
  Box,
  useMediaQuery,
  TableContainer as MuiTableContainer
} from '@mui/material';
// @mui/material/styles v5.14.x
import { styled } from '@mui/material/styles';

// Internal imports
import { PaginationProps } from '../Pagination/Pagination';
import Loading from '../Loading/Loading';
import createAppTheme from '../../../assets/styles/theme';

/*
Human Tasks:
1. Verify table responsiveness across all supported breakpoints
2. Test keyboard navigation with screen readers
3. Validate sort and filter functionality with large datasets
4. Confirm ARIA labels are properly announced
*/

// Requirement: Component Library - Material Design components with consistent theming
const TableContainer = styled(MuiTableContainer)(({ theme }) => ({
  margin: theme.spacing(2),
  borderRadius: theme.shape.borderRadius,
  boxShadow: theme.shadows[2],
  overflowX: 'auto',
  '& .MuiTable-root': {
    minWidth: 650,
  },
  // Requirement: Responsive Design - Mobile-first approach
  [theme.breakpoints.down('sm')]: {
    margin: theme.spacing(1),
    '& .MuiTable-root': {
      minWidth: 300,
    },
  },
}));

// Requirement: Component Library - Standardized data tables
const StyledTable = styled(Table)(({ theme }) => ({
  borderCollapse: 'separate',
  borderSpacing: 0,
  '& .MuiTableCell-root': {
    padding: theme.spacing(1.5),
  },
}));

// Requirement: Component Library - Material Design components with WCAG compliance
const TableHeaderCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 600,
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  borderBottom: `2px solid ${theme.palette.divider}`,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  // Requirement: Accessibility - WCAG 2.1 Level AA compliance
  '& .MuiTableSortLabel-root': {
    color: theme.palette.text.primary,
  },
  '& .MuiTableSortLabel-active': {
    color: theme.palette.primary.main,
  },
}));

type SortDirection = 'asc' | 'desc' | undefined;

export interface Column {
  id: string;
  label: string;
  accessor: string;
  sortable?: boolean;
  render?: (value: any) => React.ReactNode;
  width?: string;
  align?: 'left' | 'right' | 'center';
}

export interface DataTableProps {
  data: Array<any>;
  columns: Array<Column>;
  loading?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  paginated?: boolean;
  pageSize?: number;
  onSort?: (columnId: string, direction: SortDirection) => void;
  onFilter?: (columnId: string, value: string) => void;
  onPageChange?: (page: number, pageSize: number) => void;
  onRowClick?: (row: any) => void;
}

const DataTable: React.FC<DataTableProps> = ({
  data,
  columns,
  loading = false,
  sortable = true,
  filterable = true,
  paginated = true,
  pageSize = 10,
  onSort,
  onFilter,
  onPageChange,
  onRowClick,
}) => {
  // State management for sorting and filtering
  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortDirection, setSortDirection] = useState<SortDirection>(undefined);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  // Theme and responsive design hooks
  const theme = createAppTheme('light', false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Requirement: Component Library - Standardized data tables with sorting
  const handleSort = useCallback((columnId: string) => {
    const isAsc = sortColumn === columnId && sortDirection === 'asc';
    const newDirection: SortDirection = !sortDirection ? 'asc' : isAsc ? 'desc' : undefined;
    
    setSortColumn(columnId);
    setSortDirection(newDirection);
    
    if (onSort) {
      onSort(columnId, newDirection);
    }
  }, [sortColumn, sortDirection, onSort]);

  // Requirement: Component Library - Standardized data tables with filtering
  const handleFilter = useCallback((columnId: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [columnId]: value,
    }));
    
    if (onFilter) {
      onFilter(columnId, value);
    }
  }, [onFilter]);

  // Requirement: Component Library - Standardized data tables with pagination
  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    
    if (onPageChange) {
      onPageChange(newPage, pageSize);
    }
  }, [pageSize, onPageChange]);

  // Calculate pagination details
  const totalPages = useMemo(() => Math.ceil(data.length / pageSize), [data.length, pageSize]);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  }, [data, page, pageSize]);

  // Render loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <Loading size="large" />
      </Box>
    );
  }

  return (
    <>
      <TableContainer component={Paper}>
        <StyledTable
          aria-label="Data table"
          size={isMobile ? 'small' : 'medium'}
        >
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableHeaderCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ width: column.width }}
                  // Requirement: Accessibility - WCAG 2.1 Level AA compliance
                  aria-sort={sortColumn === column.id ? sortDirection : undefined}
                >
                  {sortable && column.sortable !== false ? (
                    <TableSortLabel
                      active={sortColumn === column.id}
                      direction={sortColumn === column.id ? sortDirection : undefined}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                  {filterable && (
                    <TextField
                      size="small"
                      placeholder={`Filter ${column.label}`}
                      value={filters[column.id] || ''}
                      onChange={(e) => handleFilter(column.id, e.target.value)}
                      aria-label={`Filter by ${column.label}`}
                      sx={{ mt: 1 }}
                    />
                  )}
                </TableHeaderCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row, index) => (
              <TableRow
                key={index}
                hover={!!onRowClick}
                onClick={() => onRowClick?.(row)}
                sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                // Requirement: Accessibility - WCAG 2.1 Level AA compliance
                role="row"
                aria-rowindex={index + 1}
              >
                {columns.map((column) => (
                  <TableCell
                    key={column.id}
                    align={column.align || 'left'}
                  >
                    {column.render
                      ? column.render(row[column.accessor])
                      : row[column.accessor]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </StyledTable>
      </TableContainer>

      {paginated && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            mt: 2,
          }}
        >
          {/* Requirement: Component Library - Standardized data tables with pagination */}
          <PaginationProps
            currentPage={page}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={(newSize) => {
              if (onPageChange) {
                onPageChange(1, newSize);
              }
            }}
          />
        </Box>
      )}
    </>
  );
};

export default DataTable;