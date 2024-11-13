/**
 * Human Tasks:
 * 1. Verify PDF.js worker is properly configured in the application build process
 * 2. Ensure proper CORS headers are set for document URLs in the S3 bucket
 * 3. Test document viewer accessibility with screen readers
 * 4. Validate zoom controls work correctly with high-DPI displays
 */

// react v18.x
import React, { useState, useEffect, useCallback } from 'react';
// @mui/material v5.x
import { Box, IconButton, Typography, Paper } from '@mui/material';
// @mui/icons-material v5.x
import { 
  ZoomIn, 
  ZoomOut, 
  NavigateNext, 
  NavigateBefore,
  Download 
} from '@mui/icons-material';
// react-pdf v6.0.0
import { Document as PDFDocument, Page, pdfjs } from 'react-pdf';

// Internal imports
import { Document } from '../../../interfaces/document.interface';
import { DocumentService } from '../../../services/document.service';
import Loading from '../../common/Loading/Loading';

// Constants for zoom control
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 3.0;
const ZOOM_STEP = 0.2;

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface DocumentViewerProps {
  documentId: string;
  onClose?: () => void;
}

/**
 * DocumentViewer component that provides document viewing capabilities with zoom controls,
 * page navigation, and document metadata display.
 * 
 * Requirement: Document Management
 * Location: 2. SYSTEM OVERVIEW/High-Level Description
 * Implementation: Secure document viewing with zoom and navigation controls
 */
const DocumentViewer: React.FC<DocumentViewerProps> = ({ documentId, onClose }) => {
  // Document state
  const [document, setDocument] = useState<Document | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Viewer state
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [numPages, setNumPages] = useState<number>(0);
  const [downloading, setDownloading] = useState<boolean>(false);

  // Initialize document service
  const documentService = new DocumentService();

  /**
   * Fetch document data on component mount
   * Requirement: Document Processing
   * Location: 3. SCOPE/Core Features and Functionalities
   */
  useEffect(() => {
    const fetchDocument = async () => {
      try {
        const doc = await documentService.getDocumentById(documentId);
        setDocument(doc);
      } catch (err) {
        setError('Failed to load document');
        console.error('Error loading document:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDocument();
  }, [documentId]);

  /**
   * Handle successful PDF document load
   */
  const handleDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  /**
   * Handle zoom in action within maximum limit
   */
  const handleZoomIn = useCallback(() => {
    setZoomLevel(prevZoom => 
      prevZoom < MAX_ZOOM ? Math.min(prevZoom + ZOOM_STEP, MAX_ZOOM) : prevZoom
    );
  }, []);

  /**
   * Handle zoom out action within minimum limit
   */
  const handleZoomOut = useCallback(() => {
    setZoomLevel(prevZoom => 
      prevZoom > MIN_ZOOM ? Math.max(prevZoom - ZOOM_STEP, MIN_ZOOM) : prevZoom
    );
  }, []);

  /**
   * Handle page navigation
   */
  const handlePageChange = useCallback((delta: number) => {
    setCurrentPage(prevPage => {
      const newPage = prevPage + delta;
      return newPage >= 1 && newPage <= numPages ? newPage : prevPage;
    });
  }, [numPages]);

  /**
   * Handle document download
   * Requirement: Document Management
   * Location: 2. SYSTEM OVERVIEW/High-Level Description
   */
  const handleDownload = async () => {
    if (!document) return;

    setDownloading(true);
    try {
      const blob = await documentService.downloadDocument(document.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError('Failed to download document');
      console.error('Error downloading document:', err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading || !document) {
    return <Loading size="large" fullScreen />;
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Paper 
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}
    >
      {/* Toolbar */}
      <Box
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Typography variant="subtitle1" sx={{ flex: 1 }}>
          {document.fileName}
        </Typography>
        <IconButton
          onClick={handleZoomOut}
          disabled={zoomLevel <= MIN_ZOOM}
          aria-label="Zoom out"
        >
          <ZoomOut />
        </IconButton>
        <Typography sx={{ mx: 1 }}>
          {Math.round(zoomLevel * 100)}%
        </Typography>
        <IconButton
          onClick={handleZoomIn}
          disabled={zoomLevel >= MAX_ZOOM}
          aria-label="Zoom in"
        >
          <ZoomIn />
        </IconButton>
        <IconButton
          onClick={() => handleDownload()}
          disabled={downloading}
          aria-label="Download document"
        >
          <Download />
        </IconButton>
      </Box>

      {/* Document Viewer */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          bgcolor: 'grey.100'
        }}
      >
        <PDFDocument
          file={document.url}
          onLoadSuccess={handleDocumentLoadSuccess}
          loading={<Loading size="medium" />}
          error={
            <Typography color="error" sx={{ p: 3 }}>
              Failed to load PDF document
            </Typography>
          }
        >
          <Page
            pageNumber={currentPage}
            scale={zoomLevel}
            loading={<Loading size="medium" />}
            renderTextLayer={true}
            renderAnnotationLayer={true}
          />
        </PDFDocument>
      </Box>

      {/* Page Navigation */}
      <Box
        sx={{
          p: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderTop: 1,
          borderColor: 'divider'
        }}
      >
        <IconButton
          onClick={() => handlePageChange(-1)}
          disabled={currentPage <= 1}
          aria-label="Previous page"
        >
          <NavigateBefore />
        </IconButton>
        <Typography sx={{ mx: 2 }}>
          Page {currentPage} of {numPages}
        </Typography>
        <IconButton
          onClick={() => handlePageChange(1)}
          disabled={currentPage >= numPages}
          aria-label="Next page"
        >
          <NavigateNext />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default DocumentViewer;