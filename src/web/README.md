# Dollar Funding MCA Application Processing System - Web Frontend

## Overview

The Dollar Funding MCA Application Processing System web frontend is a modern, responsive web application built with React 18, TypeScript, and Material-UI 5. This application provides a user-friendly interface for processing Merchant Cash Advance (MCA) applications with features for document management, data extraction, and application processing.

## Prerequisites

- Node.js >= 18.0.0
- NPM >= 8.0.0
- Modern web browser (Chrome, Firefox, Safari, or Edge - last 2 versions)

## Installation

1. Clone the repository
2. Navigate to the web directory:
```bash
cd src/web
```
3. Install dependencies:
```bash
npm install
```

## Development

Start the development server with hot module replacement (HMR):
```bash
npm run dev
```

### Development Tools

- Vite dev server with HMR
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type checking

### Code Quality Commands

```bash
# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Code formatting
npm run format
```

## Building

Create a production build:
```bash
npm run build
```

Preview the production build:
```bash
npm run preview
```

## Testing

The application uses a comprehensive testing suite:

```bash
# Run unit tests
npm run test

# Run tests in watch mode
npm run test:watch

# Generate test coverage report
npm run test:coverage

# Run end-to-end tests
npm run test:e2e
```

## Architecture

### Technology Stack

- **React 18.2.0**: Frontend framework for building user interfaces
- **TypeScript 5.0.2**: Static typing and enhanced developer experience
- **Material-UI 5.14.0**: Component library implementing Material Design
- **Redux Toolkit 1.9.5**: State management with simplified Redux setup
- **React Router**: Client-side routing
- **Axios**: HTTP client for API communication
- **Auth0**: Authentication and authorization
- **Day.js**: Date manipulation and formatting

### Project Structure

```
src/
├── assets/         # Static assets (images, fonts)
├── components/     # Reusable UI components
├── features/       # Feature-based modules
├── hooks/         # Custom React hooks
├── layouts/       # Page layouts and templates
├── pages/         # Route components
├── services/      # API and external service integrations
├── store/         # Redux store configuration
├── styles/        # Global styles and theme
├── types/         # TypeScript type definitions
└── utils/         # Utility functions
```

### State Management

- Redux Toolkit for global state management
- React Query for server state management
- Local component state for UI-specific state
- Redux Persist for state persistence

### Routing

- React Router v6 for client-side routing
- Protected routes with Auth0 integration
- Role-based access control

## Contributing

### Code Style

- Follow the ESLint configuration
- Use Prettier for code formatting
- Follow TypeScript strict mode guidelines
- Maintain 100% test coverage for critical paths

### Pull Request Process

1. Create feature branch from development
2. Implement changes with tests
3. Ensure all tests pass
4. Update documentation
5. Submit PR for review

### Testing Requirements

- Unit tests for all components
- Integration tests for features
- E2E tests for critical paths
- Accessibility testing
- Cross-browser testing

## Browser Support

### Production

- \>0.2%
- not dead
- not op_mini all

### Development

- last 1 chrome version
- last 1 firefox version
- last 1 safari version

## Human Tasks

1. Configure Auth0 application credentials
2. Set up environment variables
3. Configure API endpoints
4. Set up SSL certificates for local development
5. Configure build pipeline
6. Set up monitoring and error tracking
7. Configure CDN for static assets
8. Set up automated testing pipeline