# Dollar Funding MCA Application Processing System

<!-- REQ: System Documentation - Documents the cloud-based solution designed to automate 93% of MCA application processing operations -->

A comprehensive cloud-based platform for automating Merchant Cash Advance (MCA) application processing, designed to streamline operations and improve efficiency through advanced OCR, document classification, and automated data extraction.

## Project Overview

### System Purpose

The Dollar Funding MCA Application Processing System automates the processing of Merchant Cash Advance applications, reducing manual data entry requirements by 93% while improving accuracy and processing speed. The system handles email submissions, document classification, data extraction, and application workflow management.

### Key Features

- Automated email monitoring and processing
- AI-powered document classification and OCR
- Secure document storage with field-level encryption
- RESTful API integration with webhook support
- Web-based user interface for application management
- Real-time status tracking and notifications
- Comprehensive audit logging and compliance reporting

### Technology Stack

- **Frontend**: React 18.x with TypeScript and Material-UI 5.x
- **Backend Services**:
  - Java 17 (Spring Boot 3.1.x) for core services
  - Node.js 18.x (NestJS) for email processing
  - Python 3.11 (FastAPI) for document processing
- **Infrastructure**:
  - AWS Cloud Platform
  - Kubernetes 1.27.x for orchestration
  - Docker 24.x for containerization
- **Data Storage**:
  - PostgreSQL 14.x (AWS Aurora)
  - Redis 7.0 for caching
  - AWS S3 for document storage

### Architecture Overview

<!-- REQ: Technical Architecture - Outlines the microservices-based architecture implementing OCR, document classification, and automated data extraction -->

The system implements a microservices architecture with the following key components:

- API Gateway (Kong) for request routing and security
- Email Service for processing submissions
- Document Service for classification and OCR
- Core Service for business logic
- Notification Service for webhooks and alerts
- Web UI for user interaction

## Getting Started

### Prerequisites

1. Development Tools:
   - Docker 24.x
   - Kubernetes 1.27.x
   - Node.js 18.x LTS
   - Python 3.11
   - Java 17 LTS
   - Git 2.40+

2. Cloud Access:
   - AWS account with appropriate permissions
   - Auth0 account for authentication
   - SendGrid account for email notifications

### Installation

1. Clone the repository:
```bash
git clone https://github.com/dollarfunding/mca-processing.git
cd mca-processing
```

2. Install dependencies:
```bash
# Core service
cd core-service
./mvnw install

# Document service
cd ../document-service
pip install -r requirements.txt

# Email service
cd ../email-service
npm install

# Web UI
cd ../web
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

### Configuration

1. Infrastructure Setup:
   - Configure AWS credentials
   - Set up Auth0 application
   - Configure SendGrid API keys

2. Application Configuration:
   - Database connection strings
   - API endpoints and keys
   - Storage bucket configuration
   - Email processing settings

### Local Development Setup

1. Start local services:
```bash
docker-compose up -d
```

2. Run database migrations:
```bash
./scripts/run-migrations.sh
```

3. Start development servers:
```bash
# Core service
./mvnw spring-boot:run

# Document service
uvicorn app.main:app --reload

# Email service
npm run start:dev

# Web UI
npm start
```

## System Components

### API Gateway

- Request routing and load balancing
- Authentication and authorization
- Rate limiting and throttling
- API documentation (OpenAPI 3.0)

### Core Service

- Business logic implementation
- Data persistence and validation
- Transaction management
- Security and compliance enforcement

### Document Service

- Document classification
- OCR processing
- Data extraction
- Document storage management

### Email Service

- Email monitoring and processing
- Attachment handling
- Initial data extraction
- Queue management

### Notification Service

- Webhook delivery
- Email notifications
- Status updates
- Event broadcasting

### Web UI

- Application management interface
- Document viewer
- Status tracking
- Configuration management

## Deployment

<!-- REQ: Deployment Guidelines - Details deployment configurations across development, staging, and production environments -->

### Environment Setup

1. Development:
   - Single region deployment
   - Reduced redundancy
   - Development tools enabled

2. Staging:
   - Multi-AZ deployment
   - Production-like configuration
   - Test data only

3. Production:
   - Multi-region active-active setup
   - Full redundancy
   - High availability configuration

### Infrastructure Provisioning

1. Create required AWS resources:
```bash
cd terraform
terraform init
terraform plan
terraform apply
```

2. Configure DNS and SSL:
```bash
./scripts/setup-dns.sh
./scripts/setup-ssl.sh
```

### Service Deployment

1. Build and push containers:
```bash
./scripts/build-containers.sh
./scripts/push-containers.sh
```

2. Deploy services:
```bash
kubectl apply -f k8s/
```

### Monitoring Setup

1. Configure monitoring tools:
   - Prometheus for metrics
   - Grafana for visualization
   - Datadog for APM
   - CloudWatch for logs

2. Set up alerts:
   - System health
   - Performance metrics
   - Security events
   - Business KPIs

## Development

### Code Structure

```
mca-processing/
├── core-service/      # Java Spring Boot service
├── document-service/  # Python document processing
├── email-service/     # Node.js email handling
├── notification-service/ # Node.js notifications
├── web/              # React frontend
├── k8s/              # Kubernetes configs
├── terraform/        # Infrastructure as code
└── scripts/          # Utility scripts
```

### Development Workflow

1. Create feature branch
2. Implement changes
3. Write tests
4. Submit pull request
5. Code review
6. Merge to main

### Testing Guidelines

1. Unit Tests:
   - 80% minimum coverage
   - Mock external dependencies
   - Test business logic

2. Integration Tests:
   - API contract testing
   - Service interaction testing
   - Database operation testing

3. End-to-End Tests:
   - Critical user flows
   - Performance testing
   - Security testing

### Security Requirements

1. Authentication:
   - JWT with OAuth 2.0
   - Role-based access control
   - Multi-factor authentication

2. Data Protection:
   - Field-level encryption
   - Data masking
   - Audit logging

3. Compliance:
   - SOC 2 Type II
   - PCI DSS
   - GDPR
   - State Privacy Laws

## License

This software is proprietary and confidential. Unauthorized copying, transfer, or reproduction of the contents of this system is strictly prohibited. See the [LICENSE](LICENSE) file for details.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

---
Last Updated: 2024-01-01
Version: 1.0.0
Maintainers: System Architects, Lead Developers, DevOps Engineers