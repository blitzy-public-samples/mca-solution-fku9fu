# Dollar Funding MCA Notification Service

A robust webhook delivery and notification management service for the MCA application processing system, implementing event-driven architecture with RabbitMQ integration and secure REST endpoints.

## Overview

The Notification Service is a critical component of the Dollar Funding MCA application processing system, responsible for reliable webhook delivery and notification management. Built with Express.js and RabbitMQ, it ensures reliable event-driven communication with external systems.

**Key Features:**
- Event-driven webhook delivery with retry mechanisms
- Secure REST endpoints for webhook management
- RabbitMQ integration for reliable message processing
- Horizontal scaling support for high availability
- Comprehensive monitoring and logging

## Prerequisites

- Node.js >= 18.0.0
- RabbitMQ 3.9+
- TypeScript 5.0+
- Docker (for containerized deployment)
- Kubernetes cluster (for production deployment)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd notification-service
```

2. Install dependencies:
```bash
npm install
```

3. Build the TypeScript code:
```bash
npm run build
```

4. Start the service:
```bash
npm start
```

For development:
```bash
npm run dev
```

## Configuration

### Environment Variables

```env
# Server Configuration
PORT=3003
NODE_ENV=development

# RabbitMQ Configuration
RABBITMQ_URL=amqp://localhost:5672
RABBITMQ_QUEUE=webhook-delivery
RABBITMQ_EXCHANGE=notifications

# Webhook Configuration
WEBHOOK_RETRY_ATTEMPTS=3
WEBHOOK_RETRY_DELAY=5000
WEBHOOK_TIMEOUT=10000

# Security
JWT_SECRET=your-secret-key
ALLOWED_ORIGINS=https://app.dollarfunding.com,https://api.dollarfunding.com
```

### RabbitMQ Queue Configuration

The service uses the following queue settings:
- Main queue: `webhook-delivery`
- Dead letter exchange: `webhook-dlx`
- Dead letter queue: `webhook-dlq`
- Message TTL: 72 hours
- Queue durability: enabled

## API Documentation

### Webhook Management Endpoints

#### Register Webhook
```http
POST /webhooks
Content-Type: application/json

{
  "url": "https://api.example.com/webhook",
  "events": ["application.created", "application.updated"],
  "secret": "webhook-secret",
  "description": "Application status notifications"
}
```

#### Get Webhook Details
```http
GET /webhooks/:id
Authorization: Bearer <token>
```

#### Delete Webhook
```http
DELETE /webhooks/:id
Authorization: Bearer <token>
```

### Webhook Payload Format

```json
{
  "id": "evt_123abc",
  "type": "application.updated",
  "timestamp": "2023-08-15T14:30:00Z",
  "data": {
    "applicationId": "app_456def",
    "status": "approved",
    "updatedAt": "2023-08-15T14:30:00Z"
  }
}
```

## Development

### Project Structure
```
notification-service/
├── src/
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── models/          # Data models
│   ├── config/         # Configuration
│   ├── utils/          # Utilities
│   └── app.ts          # Application entry
├── tests/
│   ├── unit/           # Unit tests
│   └── integration/    # Integration tests
├── dist/               # Compiled code
└── kubernetes/         # K8s manifests
```

### Testing

Run unit tests:
```bash
npm test
```

Run integration tests:
```bash
npm run test:integration
```

Generate coverage report:
```bash
npm run test:coverage
```

## Deployment

### Docker

Build the container:
```bash
docker build -t notification-service:latest .
```

Run the container:
```bash
docker run -p 3003:3003 notification-service:latest
```

### Kubernetes

Deploy to Kubernetes:
```bash
kubectl apply -f kubernetes/
```

The service includes the following K8s resources:
- Deployment with HPA
- Service
- ConfigMap
- Secrets
- Network Policies

## Monitoring

### Logging
The service uses Winston for structured logging with the following levels:
- ERROR: Service errors requiring attention
- WARN: Potential issues or retry attempts
- INFO: Standard operational events
- DEBUG: Detailed debugging information

### Metrics
Key metrics collected:
- Webhook delivery success rate
- Message processing time
- Queue depth
- Retry attempts
- HTTP response times

### Health Checks
Endpoint: `/health`
Checks:
- RabbitMQ connection
- Database connectivity
- Memory usage
- System uptime

## Contributing

1. Follow TypeScript coding standards
2. Ensure tests pass
3. Update documentation
4. Submit pull request

## License

Proprietary - Dollar Funding © 2023