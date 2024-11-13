/**
 * Human Tasks:
 * 1. Verify proper navigation flow when document viewer is closed
 * 2. Test responsive behavior on different screen sizes
 * 3. Validate URL parameter handling for invalid document IDs
 */

// react v18.x
import React from 'react';
// react-router-dom v6.x
import { useParams, useNavigate } from 'react-router-dom';
// @mui/material v5.x
import { Box, Container } from '@mui/material';

// Internal imports
import { Document } from '../../interfaces/document.interface';
import DocumentViewer from '../../components/documents/DocumentViewer/DocumentViewer';
import MainLayout from '../../layouts/MainLayout/MainLayout';

/**
 * Props interface for DocumentViewerPage component
 */
interface DocumentViewerPageProps {}

/**
 * DocumentViewerPage component that provides a full-page document viewer interface
 * 
 * Requirement: Document Management
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 * Implementation: Provides secure document viewing interface integrated with document viewer
 * 
 * Requirement: Document Processing
 * Location: 3. SCOPE/Core Features and Functionalities
 * Implementation: Implements document viewing capabilities with proper navigation
 */
const DocumentViewerPage: React.FC<DocumentViewerPageProps> = () => {
  // Extract document ID from URL parameters
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();

  /**
   * Handle close action for document viewer
   * Navigates back to previous page
   */
  const handleClose = () => {
    navigate(-1);
  };

  // Ensure documentId is available
  if (!documentId) {
    navigate('/documents');
    return null;
  }

  return (
    <MainLayout>
      <Container 
        maxWidth={false}
        sx={{
          height: 'calc(100vh - 64px)', // Adjust for navbar height
          p: { xs: 1, sm: 2 }, // Responsive padding
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            borderRadius: 1,
            bgcolor: 'background.paper'
          }}
        >
          <DocumentViewer
            documentId={documentId}
            onClose={handleClose}
          />
        </Box>
      </Container>
    </MainLayout>
  );
};

export default DocumentViewerPage;