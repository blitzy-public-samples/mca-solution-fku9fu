package com.dollarfunding.core.services;

// JUnit Jupiter API v5.9.2
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

// Mockito v5.3.1
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.any;

// Spring Framework v3.1.0
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

// JUnit Assertions
import static org.junit.jupiter.api.Assertions.*;

// Project imports
import com.dollarfunding.core.entities.Document;
import com.dollarfunding.core.repositories.DocumentRepository;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * Human Tasks:
 * 1. Configure test database with appropriate test data
 * 2. Set up test environment variables for document storage paths
 * 3. Ensure test coverage reports are integrated into CI/CD pipeline
 * 4. Configure test logging levels appropriately
 */
@ExtendWith(MockitoExtension.class)
public class DocumentServiceTest {

    @Mock
    private DocumentRepository documentRepository;

    private DocumentService documentService;

    @BeforeEach
    void setUp() {
        documentService = new DocumentService(documentRepository);
    }

    @Test
    void testCreateDocument() {
        // Addresses requirement: Document Management - Secure storage of application documents
        
        // Arrange
        UUID applicationId = UUID.randomUUID();
        String type = "ISO_APPLICATION";
        String storagePath = "s3://documents/test/application.pdf";
        
        Document expectedDocument = Document.builder()
                .applicationId(applicationId)
                .type(type)
                .storagePath(storagePath)
                .status("UPLOADED")
                .metadata(new HashMap<>())
                .build();
        
        when(documentRepository.save(any(Document.class))).thenReturn(expectedDocument);

        // Act
        Document result = documentService.createDocument(applicationId, type, storagePath);

        // Assert
        assertNotNull(result);
        assertEquals(applicationId, result.getApplicationId());
        assertEquals(type, result.getType());
        assertEquals(storagePath, result.getStoragePath());
        assertEquals("UPLOADED", result.getStatus());
        assertNotNull(result.getMetadata());
        assertTrue(result.getMetadata().containsKey("originalFileName"));
        assertTrue(result.getMetadata().containsKey("uploadTimestamp"));
        assertTrue(result.getMetadata().containsKey("processingStatus"));
        
        verify(documentRepository, times(1)).save(any(Document.class));
    }

    @Test
    void testGetApplicationDocuments() {
        // Addresses requirement: Document Management - AI-powered classification and secure storage
        
        // Arrange
        UUID applicationId = UUID.randomUUID();
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by("uploadedAt").descending());
        
        Document doc1 = Document.builder()
                .id(UUID.randomUUID())
                .applicationId(applicationId)
                .type("BANK_STATEMENT")
                .status("PROCESSED")
                .build();
        
        Document doc2 = Document.builder()
                .id(UUID.randomUUID())
                .applicationId(applicationId)
                .type("TAX_RETURN")
                .status("UPLOADED")
                .build();
        
        Page<Document> expectedPage = new PageImpl<>(Arrays.asList(doc1, doc2));
        when(documentRepository.findByApplicationId(applicationId, pageRequest)).thenReturn(expectedPage);

        // Act
        Page<Document> result = documentService.getApplicationDocuments(applicationId, pageRequest);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.getContent().size());
        assertEquals(doc1.getId(), result.getContent().get(0).getId());
        assertEquals(doc2.getId(), result.getContent().get(1).getId());
        
        verify(documentRepository, times(1)).findByApplicationId(applicationId, pageRequest);
    }

    @Test
    void testUpdateDocumentClassification() {
        // Addresses requirement: Document Processing - Document classification, OCR processing
        
        // Arrange
        UUID documentId = UUID.randomUUID();
        String classification = "BANK_STATEMENT";
        Map<String, Object> extractedData = new HashMap<>();
        extractedData.put("bankName", "Test Bank");
        extractedData.put("accountNumber", "XXXX1234");
        
        Document existingDocument = Document.builder()
                .id(documentId)
                .type("UNKNOWN")
                .status("UPLOADED")
                .metadata(new HashMap<>())
                .build();
        
        Document updatedDocument = Document.builder()
                .id(documentId)
                .type("UNKNOWN")
                .status("CLASSIFIED")
                .classification(classification)
                .metadata(extractedData)
                .build();
        
        when(documentRepository.findById(documentId)).thenReturn(Optional.of(existingDocument));
        when(documentRepository.save(any(Document.class))).thenReturn(updatedDocument);

        // Act
        Document result = documentService.updateDocumentClassification(documentId, classification, extractedData);

        // Assert
        assertNotNull(result);
        assertEquals(documentId, result.getId());
        assertEquals(classification, result.getClassification());
        assertEquals("CLASSIFIED", result.getStatus());
        assertTrue(result.getMetadata().containsKey("bankName"));
        assertEquals("Test Bank", result.getMetadata().get("bankName"));
        
        verify(documentRepository, times(1)).findById(documentId);
        verify(documentRepository, times(1)).save(any(Document.class));
    }

    @Test
    void testGetDocumentsByType() {
        // Addresses requirement: Document Processing - Document classification
        
        // Arrange
        String documentType = "BANK_STATEMENT";
        PageRequest pageRequest = PageRequest.of(0, 10, Sort.by("uploadedAt").descending());
        
        Document doc1 = Document.builder()
                .id(UUID.randomUUID())
                .type(documentType)
                .status("PROCESSED")
                .uploadedAt(LocalDateTime.now().minusDays(1))
                .build();
        
        Document doc2 = Document.builder()
                .id(UUID.randomUUID())
                .type(documentType)
                .status("UPLOADED")
                .uploadedAt(LocalDateTime.now())
                .build();
        
        Page<Document> expectedPage = new PageImpl<>(Arrays.asList(doc1, doc2));
        when(documentRepository.findByType(documentType, pageRequest)).thenReturn(expectedPage);

        // Act
        Page<Document> result = documentService.getDocumentsByType(documentType, pageRequest);

        // Assert
        assertNotNull(result);
        assertEquals(2, result.getContent().size());
        assertEquals(documentType, result.getContent().get(0).getType());
        assertEquals(documentType, result.getContent().get(1).getType());
        
        verify(documentRepository, times(1)).findByType(documentType, pageRequest);
    }

    @Test
    void testCreateDocument_WithNullParameters() {
        // Arrange
        UUID applicationId = null;
        String type = null;
        String storagePath = null;

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> 
            documentService.createDocument(applicationId, type, storagePath)
        );
        
        verify(documentRepository, never()).save(any(Document.class));
    }

    @Test
    void testUpdateDocumentClassification_DocumentNotFound() {
        // Arrange
        UUID documentId = UUID.randomUUID();
        String classification = "BANK_STATEMENT";
        Map<String, Object> extractedData = new HashMap<>();
        
        when(documentRepository.findById(documentId)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () ->
            documentService.updateDocumentClassification(documentId, classification, extractedData)
        );
        
        verify(documentRepository, times(1)).findById(documentId);
        verify(documentRepository, never()).save(any(Document.class));
    }
}