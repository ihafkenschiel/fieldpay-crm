# Field Pay CRM

A production-quality demo application showcasing **enterprise mobile architecture** with React Native, Salesforce CRM integration, and Stripe payment processing.

## Overview

Field Pay CRM simulates a real enterprise scenario where field sales representatives can:

- 🔐 Authenticate with Salesforce (OAuth simulation)
- 📋 Browse Accounts and Contacts
- 📄 Create Invoices
- 💳 Accept payments via Stripe
- 🔄 Work offline and sync later
- 📊 View diagnostics and observability data

## Architecture Highlights

| Pattern | Implementation |
|---------|----------------|
| **Cross-Platform** | Single Expo codebase for iOS, Android, and Web |
| **BFF Pattern** | Fastify server proxies all external APIs |
| **Offline-First** | Action queue with automatic sync on reconnection |
| **State Management** | Zustand (client) + React Query (server) |
| **Type Safety** | TypeScript throughout, shared domain models |

## Quick Start

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Install all dependencies
npm install

# Copy environment files
cp server/.env.example server/.env
```

### Running the Application

**Terminal 1 — Start the BFF server:**
```bash
npm run dev:server
```

**Terminal 2 — Start the mobile app:**
```bash
npm run dev:mobile
```

The app runs in **mock mode** by default — no Salesforce or Stripe credentials required.

### Demo Credentials

```
Email: demo@fieldpay.com
Password: demo123
```

## Project Structure

```
/fieldpay-crm
├── apps/mobile/          # Expo app (iOS, Android, Web)
├── packages/
│   ├── core/             # Domain models, utilities
│   ├── ui/               # Shared React Native components
│   └── api-client/       # Typed HTTP client
├── server/               # Fastify BFF server
└── docs/                 # Architecture documentation
```

## Technology Stack

### Frontend
- React Native + Expo SDK 50
- Expo Router (file-based navigation)
- TypeScript
- Zustand (state management)
- React Query (server state)

### Backend
- Node.js + Fastify
- TypeScript
- Mock Salesforce/Stripe services

## Documentation

- [Architecture Overview](./docs/architecture.md)
- [ADR-001: Backend For Frontend Pattern](./docs/adr/001-backend-for-frontend.md)
- [ADR-002: Offline Queue Synchronization](./docs/adr/002-offline-queue-sync.md)

## Key Features Demonstrated

### Enterprise Integration Patterns
- OAuth authentication flow
- CRM data synchronization
- Payment processing with Stripe PaymentIntent

### Mobile Architecture
- Cross-platform code sharing (95%+)
- Secure token storage
- Offline action queue
- Network state monitoring

### Production Practices
- Monorepo with npm workspaces
- Typed API client
- Environment-based configuration
- Diagnostic event logging

## License

MIT