# Email Service

A secure, high-performance NestJS-based service for automated monitoring and processing of MCA (Merchant Cash Advance) applications received via email.

## Overview

The Email Service is a critical component of the DollarFunding platform that automatically monitors and processes MCA applications submitted to submissions@dollarfunding.com. Built with NestJS and Node.js, it provides enterprise-grade email processing capabilities with robust security features and scalable architecture.

## Prerequisites

- Node.js >= 18.0.0 (LTS)
- NPM >= 8.0.0
- IMAP-compatible email server
- RabbitMQ server for message queuing
- MongoDB for data persistence
- SSL/TLS certificates for secure communication

## Installation

1. Clone the repository and navigate to the email-service directory:
```bash
cd src/backend/email-service
```

2. Install dependencies:
```bash
npm install
```

3. Build the application:
```bash
npm run build
```

## Configuration

### Environment Variables

Create a `.env` file in the root directory with the following configurations:

```env
# Email Server Settings
EMAIL_HOST=imap.example.com
EMAIL_PORT=993
EMAIL_USER=submissions@dollarfunding.com
EMAIL_PASSWORD=secret
EMAIL_TLS=true

# Processing Configuration
EMAIL_POLL_INTERVAL=60000
EMAIL_MAX_ATTACHMENT_SIZE=10485760
EMAIL_PROCESSING_TIMEOUT=300000
EMAIL_ALLOWED_SENDERS=verified@domain.com
EMAIL_RETRY_ATTEMPTS=3
EMAIL_RETRY_DELAY=5000

# Server Configuration
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://app.dollarfunding.com
```

### Security Configuration

The service implements multiple security layers:
- TLS/SSL encryption for email communication
- Allowed sender verification
- Attachment size and type validation
- Rate limiting for API endpoints
- CORS protection
- Security headers via Helmet

## Usage

### Development Mode

Start the service with hot-reload enabled:
```bash
npm run dev
```

### Production Mode

Start the production server:
```bash
npm start
```

## API Documentation

### Health Check
- `GET /health`
  - Returns service health status and environment information

### Email Processing Endpoints
- `GET /api/v1/emails/status`
  - Returns email processing statistics
  - Rate limited to 100 requests per 15 minutes

- `POST /api/v1/emails/reprocess`
  - Triggers reprocessing of failed emails
  - Requires authentication
  - Request body: `{ messageId: string }`

## Development

### Code Style

The project uses TypeScript with strict type checking. Follow the established patterns:
- Use dependency injection
- Implement interface-first design
- Write comprehensive unit tests
- Document public APIs

### Testing

Run the test suite:
```bash
# Unit tests
npm test

# Watch mode
npm run test:watch

# Coverage report
npm run test:cov
```

## Deployment

### Docker Deployment

1. Build the Docker image:
```bash
docker build -t email-service:latest .
```

2. Run the container:
```bash
docker run -d \
  --name email-service \
  --env-file .env \
  -p 3000:3000 \
  email-service:latest
```

### Kubernetes Deployment

Apply the Kubernetes manifests:
```bash
kubectl apply -f k8s/
```

## Monitoring

### Application Metrics

The service exposes the following monitoring endpoints:
- `/health` - Service health status
- `/metrics` - Prometheus-compatible metrics

### Logging

Logs are structured in JSON format and include:
- Request tracing with unique IDs
- Email processing events
- Error tracking
- Performance metrics

### Audit Trail

All email processing activities are logged with:
- Timestamp
- Message ID
- Processing status
- Security events

## Performance

The service is optimized for:
- Processing time < 5 minutes per application
- Concurrent email processing
- Graceful shutdown handling
- Memory-efficient attachment processing

## Security Considerations

1. Email Security:
   - TLS/SSL encryption
   - Sender verification
   - Attachment scanning
   - Content validation

2. API Security:
   - Rate limiting
   - CORS protection
   - Security headers
   - Request validation

3. Data Security:
   - Encrypted storage
   - Access control
   - Audit logging
   - Secure configurations

## Troubleshooting

Common issues and solutions:

1. Connection Issues:
   - Verify IMAP server credentials
   - Check network connectivity
   - Validate SSL/TLS certificates

2. Processing Errors:
   - Check attachment size limits
   - Verify allowed sender configurations
   - Monitor queue status

3. Performance Issues:
   - Adjust polling interval
   - Monitor resource usage
   - Check concurrent connection limits

## Support

For technical support:
- Review logs at `/var/log/email-service/`
- Check monitoring dashboard
- Contact the development team

## License

Proprietary - All rights reserved