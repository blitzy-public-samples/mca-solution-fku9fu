// react v18.x
// @mui/material v5.14.x
// @mui/material/styles v5.14.x

import React from 'react';
import { Typography, Box, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Card } from '../../common/Card/Card';
import { ApplicationStatus } from '../ApplicationStatus/ApplicationStatus';
import { formatCurrency } from '../../../utils/format.utils';
import type { Application } from '../../../interfaces/application.interface';

/*
Human Tasks:
1. Verify color contrast ratios meet WCAG 2.1 Level AA standards
2. Test keyboard navigation and screen reader compatibility
3. Validate touch target sizes for mobile devices
*/

// REQ: Component Library - Material Design components with reusable form elements
export interface ApplicationCardProps {
  application: Application;
  onClick?: () => void;
  className?: string;
}

// REQ: Visual Hierarchy - Card-based layout with status-driven color coding
const StyledCard = styled(Card)(({ theme }) => ({
  width: '100%',
  maxWidth: 400,
  margin: theme.spacing(1),
  transition: theme.transitions.create(['transform', 'box-shadow']),
  '&:hover': {
    transform: 'translateY(-2px)',
  },
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
}));

// REQ: Data Management - Displays merchant information and funding details
const ApplicationCard: React.FC<ApplicationCardProps> = ({
  application,
  onClick,
  className
}) => {
  const {
    id,
    status,
    merchant,
    funding,
    createdAt
  } = application;

  // Format the creation date for display
  const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  return (
    <StyledCard
      onClick={onClick}
      className={className}
      ariaLabel={`Application for ${merchant.legalName}`}
      elevation={1}
    >
      <Stack spacing={2} sx={{ p: 2 }}>
        {/* Business Information Section */}
        <Box>
          <Typography
            variant="h6"
            component="h2"
            gutterBottom
            sx={{ fontWeight: 'medium' }}
          >
            {merchant.legalName}
          </Typography>
          {merchant.dbaName && (
            <Typography
              variant="body2"
              color="text.secondary"
              gutterBottom
            >
              DBA: {merchant.dbaName}
            </Typography>
          )}
        </Box>

        {/* Status Section */}
        <Box>
          <ApplicationStatus 
            status={status}
            size="small"
          />
        </Box>

        {/* Funding Details Section */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="body1" fontWeight="medium">
            {formatCurrency(funding.requestedAmount)}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
          >
            {formattedDate}
          </Typography>
        </Stack>

        {/* Application ID for reference */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1 }}
        >
          ID: {id}
        </Typography>
      </Stack>
    </StyledCard>
  );
};

export default ApplicationCard;