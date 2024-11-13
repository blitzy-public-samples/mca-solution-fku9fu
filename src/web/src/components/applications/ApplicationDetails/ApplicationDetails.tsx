/**
 * Human Tasks:
 * 1. Verify currency formatting matches accounting standards
 * 2. Test document viewer accessibility with screen readers
 * 3. Validate responsive layout on various screen sizes
 */

// react v18.x
import React, { useState } from 'react';
// @mui/material v5.x
import { Grid, Paper, Typography, Divider } from '@mui/material';
// @mui/material/styles v5.x
import { styled } from '@mui/material/styles';

// Internal imports
import { Application } from '../../../interfaces/application.interface';
import DocumentViewer from '../../documents/DocumentViewer/DocumentViewer';
import { ApplicationStatus as StatusComponent } from '../ApplicationStatus/ApplicationStatus';

/**
 * REQ: Application Detail View - Styled container for application details
 * Location: 5. SYSTEM DESIGN/5.1.3 Application Detail View
 */
const DetailsContainer = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(2),
  '& .MuiDivider-root': {
    margin: `${theme.spacing(2)} 0`,
  }
}));

/**
 * REQ: Visual Hierarchy - Styled typography for section titles
 * Location: 5. SYSTEM DESIGN/5.1.1 Design Specifications
 */
const SectionTitle = styled(Typography)(({ theme }) => ({
  fontWeight: 600,
  marginBottom: theme.spacing(2),
  color: theme.palette.text.primary
}));

interface ApplicationDetailsProps {
  application: Application;
  onStatusChange?: (status: ApplicationStatus) => void;
  className?: string;
}

/**
 * Formats currency values for display according to accounting standards
 */
const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * REQ: Application Detail View - Main component for displaying detailed MCA application information
 * Location: 5. SYSTEM DESIGN/5.1.3 Application Detail View
 * REQ: Data Management - Display of merchant information and funding details
 * Location: 3. SCOPE/Core Features and Functionalities
 */
const ApplicationDetails: React.FC<ApplicationDetailsProps> = ({
  application,
  onStatusChange,
  className
}) => {
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);

  const handleDocumentClose = () => {
    setSelectedDocumentId(null);
  };

  return (
    <div className={className}>
      {/* Status Section */}
      <DetailsContainer>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <SectionTitle variant="h6">Application Status</SectionTitle>
          </Grid>
          <Grid item xs={12} sm={6}>
            <StatusComponent 
              status={application.status}
              size="medium"
            />
          </Grid>
        </Grid>
      </DetailsContainer>

      {/* Merchant Details Section */}
      <DetailsContainer>
        <SectionTitle variant="h6">Merchant Information</SectionTitle>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Business Name</Typography>
            <Typography>{application.merchant.legalName}</Typography>
            {application.merchant.dbaName && (
              <>
                <Typography variant="subtitle2" sx={{ mt: 1 }}>DBA Name</Typography>
                <Typography>{application.merchant.dbaName}</Typography>
              </>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">EIN</Typography>
            <Typography>{application.merchant.ein}</Typography>
            <Typography variant="subtitle2" sx={{ mt: 1 }}>Industry</Typography>
            <Typography>{application.merchant.industry}</Typography>
          </Grid>
        </Grid>
        <Divider />
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Business Address</Typography>
            <Typography>
              {application.merchant.address.street}<br />
              {application.merchant.address.city}, {application.merchant.address.state} {application.merchant.address.zip}
            </Typography>
          </Grid>
        </Grid>
      </DetailsContainer>

      {/* Funding Details Section */}
      <DetailsContainer>
        <SectionTitle variant="h6">Funding Information</SectionTitle>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Requested Amount</Typography>
            <Typography variant="h6" color="primary">
              {formatCurrency(application.funding.requestedAmount)}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2">Term Length</Typography>
            <Typography>{application.funding.term} months</Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2">Use of Funds</Typography>
            <Typography>{application.funding.useOfFunds}</Typography>
          </Grid>
        </Grid>
      </DetailsContainer>

      {/* Documents Section */}
      <DetailsContainer>
        <SectionTitle variant="h6">Application Documents</SectionTitle>
        <Grid container spacing={2}>
          {application.documents.map((document) => (
            <Grid item xs={12} sm={6} md={4} key={document.id}>
              <Typography
                variant="subtitle2"
                sx={{
                  cursor: 'pointer',
                  '&:hover': {
                    color: 'primary.main'
                  }
                }}
                onClick={() => setSelectedDocumentId(document.id)}
              >
                {document.fileName}
              </Typography>
              <Typography variant="caption" color="textSecondary">
                Uploaded: {new Date(document.uploadedAt).toLocaleDateString()}
              </Typography>
            </Grid>
          ))}
        </Grid>
      </DetailsContainer>

      {/* Document Viewer Modal */}
      {selectedDocumentId && (
        <DocumentViewer
          documentId={selectedDocumentId}
          onClose={handleDocumentClose}
        />
      )}
    </div>
  );
};

export default ApplicationDetails;