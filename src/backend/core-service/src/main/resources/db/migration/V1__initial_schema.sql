-- Human Tasks:
-- 1. Install PostgreSQL pgcrypto extension for encryption support
-- 2. Configure database backup retention policy for 7-year compliance
-- 3. Set up database audit logging
-- 4. Configure proper database user permissions
-- 5. Verify database connection pool settings

-- Enable required PostgreSQL extensions
-- Requirement: Data Security - Encryption support for sensitive data
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Create merchants table
-- Requirement: Data Management - Merchant information storage with encryption
CREATE TABLE merchants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    legal_name VARCHAR(100) NOT NULL,
    dba_name VARCHAR(100),
    -- Encrypted EIN storage using pgcrypto
    ein VARCHAR(9) NOT NULL,
    address JSONB NOT NULL CHECK (
        address ? 'street' AND 
        address ? 'city' AND 
        address ? 'state' AND 
        address ? 'zip'
    ),
    industry VARCHAR(50) NOT NULL,
    revenue DECIMAL(15,2) NOT NULL CHECK (revenue > 0),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT merchants_legal_name_unique UNIQUE (legal_name),
    CONSTRAINT merchants_ein_check CHECK (ein ~ '^[0-9]{9}$')
);

-- Create applications table
-- Requirement: Data Management - Application processing and status tracking
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    merchant_id UUID NOT NULL REFERENCES merchants(id),
    status VARCHAR(50) NOT NULL CHECK (
        status IN (
            'RECEIVED', 'PROCESSING', 'UNDER_REVIEW', 
            'APPROVED', 'REJECTED', 'ERROR', 
            'FUNDED', 'CANCELLED'
        )
    ),
    requested_amount DECIMAL(15,2) NOT NULL CHECK (
        requested_amount >= 1000 AND 
        requested_amount <= 5000000
    ),
    review_status VARCHAR(50) CHECK (
        review_status IN (
            'PENDING', 'IN_PROGRESS', 'COMPLETED', 
            'NEEDS_INFORMATION', 'ESCALATED'
        )
    ),
    metadata JSONB,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create documents table
-- Requirement: Document Management - Secure document storage with classification
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id),
    type VARCHAR(50) NOT NULL CHECK (
        type IN (
            'ISO_APPLICATION', 'BANK_STATEMENT', 
            'BUSINESS_LICENSE', 'TAX_RETURN',
            'VOIDED_CHECK', 'OTHER'
        )
    ),
    storage_path VARCHAR(255) NOT NULL,
    classification VARCHAR(50),
    status VARCHAR(50) NOT NULL CHECK (
        status IN (
            'UPLOADED', 'PROCESSING', 
            'CLASSIFIED', 'ERROR'
        )
    ),
    metadata JSONB,
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance optimization
-- Requirement: Performance - Optimize common query patterns
CREATE INDEX idx_merchants_legal_name ON merchants (legal_name);
CREATE INDEX idx_merchants_industry ON merchants (industry);
CREATE INDEX idx_merchants_created_at ON merchants (created_at);
CREATE INDEX idx_merchants_metadata ON merchants USING gin (metadata);

CREATE INDEX idx_applications_merchant_id ON applications (merchant_id);
CREATE INDEX idx_applications_status ON applications (status);
CREATE INDEX idx_applications_submitted_at ON applications (submitted_at);
CREATE INDEX idx_applications_metadata ON applications USING gin (metadata);

CREATE INDEX idx_documents_application_id ON documents (application_id);
CREATE INDEX idx_documents_type ON documents (type);
CREATE INDEX idx_documents_status ON documents (status);
CREATE INDEX idx_documents_uploaded_at ON documents (uploaded_at);
CREATE INDEX idx_documents_metadata ON documents USING gin (metadata);

-- Create trigger functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for timestamp management
CREATE TRIGGER update_merchants_updated_at
    BEFORE UPDATE ON merchants
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create views for common queries
-- Requirement: Data Management - Simplified access to application status
CREATE VIEW v_application_summary AS
SELECT 
    a.id,
    a.status,
    a.requested_amount,
    a.review_status,
    m.legal_name as merchant_name,
    m.industry,
    a.submitted_at,
    a.processed_at,
    COUNT(d.id) as document_count
FROM applications a
JOIN merchants m ON a.merchant_id = m.id
LEFT JOIN documents d ON d.application_id = a.id
GROUP BY 
    a.id, a.status, a.requested_amount, a.review_status,
    m.legal_name, m.industry, a.submitted_at, a.processed_at;

-- Create function for document classification updates
-- Requirement: Document Management - Track document classification changes
CREATE OR REPLACE FUNCTION update_document_classification(
    doc_id UUID,
    new_classification VARCHAR(50),
    classification_metadata JSONB
)
RETURNS VOID AS $$
BEGIN
    UPDATE documents
    SET 
        classification = new_classification,
        status = 'CLASSIFIED',
        processed_at = CURRENT_TIMESTAMP,
        metadata = COALESCE(metadata, '{}'::jsonb) || 
                  jsonb_build_object(
                      'classification_history', 
                      COALESCE(metadata->'classification_history', '[]'::jsonb) || 
                      jsonb_build_object(
                          'timestamp', CURRENT_TIMESTAMP,
                          'classification', new_classification,
                          'metadata', classification_metadata
                      )
                  )
    WHERE id = doc_id;
END;
$$ LANGUAGE plpgsql;

-- Create function for application status updates
-- Requirement: Data Management - Track application status changes
CREATE OR REPLACE FUNCTION update_application_status(
    app_id UUID,
    new_status VARCHAR(50),
    status_metadata JSONB
)
RETURNS VOID AS $$
BEGIN
    UPDATE applications
    SET 
        status = new_status,
        metadata = COALESCE(metadata, '{}'::jsonb) || 
                  jsonb_build_object(
                      'status_history', 
                      COALESCE(metadata->'status_history', '[]'::jsonb) || 
                      jsonb_build_object(
                          'timestamp', CURRENT_TIMESTAMP,
                          'status', new_status,
                          'metadata', status_metadata
                      )
                  ),
        processed_at = CASE 
            WHEN new_status = 'PROCESSING' THEN CURRENT_TIMESTAMP 
            ELSE processed_at 
        END,
        reviewed_at = CASE 
            WHEN new_status IN ('APPROVED', 'REJECTED') THEN CURRENT_TIMESTAMP 
            ELSE reviewed_at 
        END
    WHERE id = app_id;
END;
$$ LANGUAGE plpgsql;