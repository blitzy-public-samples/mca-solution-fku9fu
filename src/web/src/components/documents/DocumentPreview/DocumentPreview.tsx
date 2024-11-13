// @mui/material v5.14.x
// @mui/icons-material v5.14.x
import React from 'react';
import { Typography, IconButton, Tooltip } from '@mui/material';
import { DownloadIcon, VisibilityIcon } from '@mui/icons-material';
import { Document } from '../../../interfaces/document.interface';
import { Card } from '../../common/Card/Card';
import { DocumentService } from '../../../services/document.service';

/*
Human Tasks:
1. Verify document thumbnail image loading and error handling in your environment
2. Test screen reader compatibility with document type announcements
3. Validate color contrast for document classification status indicators
*/

/**
 * Props interface for DocumentPreview component with accessibility support
 * Requirement: Document Viewer - Interactive document viewer with preview capabilities
 */
export interface DocumentPreviewProps {
  document: Document;
  onView?: (document: Document) => void;
  onDownload?: (document: Document) => void;
  className?: string;
  ariaLabel?: string;
}

/**
 * Handles document download action using DocumentService
 * Requirement: Document Management - Secure storage of application documents
 */
const handleDownload = async (document: Document): Promise<void> => {
  try {
    const blob = await new DocumentService().downloadDocument(document.id);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = document.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error downloading document:', error);
    // Error handling should be implemented based on application requirements
  }
};

/**
 * DocumentPreview component that renders an accessible preview of MCA application documents
 * Requirement: Document Viewer - Interactive document viewer with preview capabilities
 * Requirement: Accessibility - WCAG 2.1 Level AA compliance
 */
export const DocumentPreview: React.FC<DocumentPreviewProps> = ({
  document,
  onView,
  onDownload,
  className,
  ariaLabel,
}) => {
  // Get classification status color based on document state
  const getClassificationColor = (classification: string): string => {
    switch (classification) {
      case 'CLASSIFIED':
        return 'success.main';
      case 'PROCESSING':
        return 'info.main';
      case 'FAILED':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  // Handle document view action
  const handleView = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onView) {
      onView(document);
    }
  };

  // Handle document download action
  const handleDownloadClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDownload) {
      onDownload(document);
    } else {
      await handleDownload(document);
    }
  };

  return (
    <Card
      className={className}
      ariaLabel={ariaLabel || `Document preview for ${document.fileName}`}
      elevation={2}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}
      >
        {/* Document thumbnail */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingBottom: '56.25%', // 16:9 aspect ratio
            backgroundColor: '#f5f5f5',
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <img
            src={document.thumbnailUrl}
            alt={`Preview of ${document.fileName}`}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>

        {/* Document metadata */}
        <div>
          <Typography
            variant="subtitle1"
            component="h3"
            gutterBottom
            sx={{ fontWeight: 'medium' }}
          >
            {document.fileName}
          </Typography>
          <Typography
            variant="body2"
            color="text.secondary"
            gutterBottom
            role="status"
            aria-live="polite"
          >
            Type: {document.type.replace(/_/g, ' ')}
          </Typography>
          <Typography
            variant="body2"
            sx={{ color: getClassificationColor(document.classification) }}
            role="status"
            aria-live="polite"
          >
            Status: {document.classification.replace(/_/g, ' ')}
          </Typography>
        </div>

        {/* Document actions */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '0.5rem',
          }}
        >
          {onView && (
            <Tooltip title="View document">
              <IconButton
                onClick={handleView}
                aria-label={`View ${document.fileName}`}
                size="medium"
              >
                <VisibilityIcon />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title="Download document">
            <IconButton
              onClick={handleDownloadClick}
              aria-label={`Download ${document.fileName}`}
              size="medium"
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>
    </Card>
  );
};