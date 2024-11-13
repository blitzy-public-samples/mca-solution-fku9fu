// react v18.x
// @mui/material v5.14.x
// @mui/material/styles v5.14.x

import React from 'react';
import { Chip } from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  APPLICATION_STATUS_LABELS, 
  APPLICATION_STATUS_COLORS 
} from '../../../constants/application.constants';
import { ApplicationStatus as ApplicationStatusEnum } from '../../../interfaces/application.interface';
import { Card } from '../../common/Card/Card';

/*
Human Tasks:
1. Verify color contrast ratios meet WCAG 2.1 Level AA standards (4.5:1 for normal text)
2. Test with screen readers to ensure proper status announcements
3. Validate color choices with design system team
*/

// REQ: Visual Hierarchy - Status-driven color coding using consistent design system colors
const StatusChip = styled(Chip)(({ theme }) => ({
  margin: theme.spacing(1),
  fontWeight: 500,
  textTransform: 'uppercase',
  minWidth: 80,
  justifyContent: 'center',
  // Ensure proper contrast for accessibility
  '& .MuiChip-label': {
    fontWeight: 600,
  },
  // Add focus visible outline for keyboard navigation
  '&.Mui-focusVisible': {
    outline: `2px solid ${theme.palette.primary.main}`,
    outlineOffset: 2,
  }
}));

// Props interface for the ApplicationStatus component
export interface ApplicationStatusProps {
  status: ApplicationStatusEnum;
  className?: string;
  size?: 'small' | 'medium';
}

// REQ: Application Processing - Visual representation of application processing status
// REQ: Accessibility - WCAG 2.1 Level AA compliance with screen reader support
const ApplicationStatus: React.FC<ApplicationStatusProps> = ({
  status,
  className,
  size = 'medium'
}) => {
  // Get the human-readable label for the status
  const statusLabel = APPLICATION_STATUS_LABELS[status];
  // Get the appropriate color for the status
  const statusColor = APPLICATION_STATUS_COLORS[status];

  return (
    <StatusChip
      label={statusLabel}
      color={statusColor}
      size={size}
      className={className}
      // Add proper ARIA attributes for accessibility
      role="status"
      aria-label={`Application status: ${statusLabel}`}
      // Add tabIndex for keyboard navigation
      tabIndex={0}
      // Add proper semantic color contrast
      sx={{
        backgroundColor: `${statusColor}`,
        color: theme => theme.palette.getContrastText(statusColor),
        '&:hover': {
          backgroundColor: `${statusColor}`,
          opacity: 0.9,
        },
      }}
    />
  );
};

export default ApplicationStatus;