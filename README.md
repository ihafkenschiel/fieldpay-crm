# Field Pay CRM

A production-quality reference application demonstrating **enterprise mobile architecture** patterns for React Native applications with Salesforce CRM integration and Stripe payment processing.

---

## Consulting Scenario

This project simulates a consulting engagement to build a mobile application for a field sales organization. The client requirements are:

> "Our field sales representatives need a mobile app to create invoices and collect payments while visiting customer sites. They often work in warehouses and rural areas with poor connectivity. The app must integrate with our Salesforce CRM and process payments through Stripe."

The architecture addresses these requirements with:

- **Offline-first design** for unreliable connectivity
- **Backend-for-Frontend** pattern for secure API integration
- **Cross-platform codebase** for iOS, Android, and Web deployment
- **Enterprise observability** for production support

---

## Architecture Highlights

| Pattern | Implementation | Rationale |
|---------|----------------|-----------|
| **Backend-for-Frontend** | Fastify server proxies Salesforce and Stripe | Secrets never leave server; unified API surface |
| **Offline-First Sync** | Local action queue with automatic replay | Field reps work without connectivity |
| **Cross-Platform** | Single Expo codebase for iOS, Android, Web | 95%+ code sharing; single team maintains all platforms |
| **Secure Authentication** | OAuth tokens in platform secure storage | expo-secure-store on native; no secrets in bundle |
| **State Management** | Zustand (client) + React Query (server) | Clean separation; minimal boilerplate |
| **Observability** | Structured event logging with diagnostics UI | Production debugging without device access |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CLIENT LAYER                                  │
│                                                                          │
│   ┌───────────────┐    ┌───────────────┐    ┌───────────────┐           │
│   │      iOS      │    │    Android    │    │      Web      │           │
│   └───────┬───────┘    └───────┬───────┘    └───────┬───────┘           │
│           └────────────────────┼────────────────────┘                    │
│                                │                                         │
│                    ┌───────────┴───────────┐                            │
│                    │   Shared Codebase     │                            │
│                    │   (React Native)      │                            │
│                    └───────────┬───────────┘                            │
└────────────────────────────────┼────────────────────────────────────────┘
                                 │ HTTPS
                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     BACKEND-FOR-FRONTEND                                │
│                                                                         │
│                    ┌───────────────────────┐                           │
│                    │   Fastify Server      │                           │
│                    │   /auth  /salesforce  │                           │
│                    │   /stripe  /sync      │                           │
│                    └───────────┬───────────┘                           │
└────────────────────────────────┼───────────────────────────────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 ▼                               ▼
        ┌─────────────────┐             ┌─────────────────┐
        │   Salesforce    │             │     Stripe      │
        │   REST API      │             │      API        │
        └─────────────────┘             └─────────────────┘
```

---

## Demo Workflow

The following workflow demonstrates the end-to-end system operation:

### 1. Authentication
User logs in with Salesforce credentials. The BFF validates credentials and returns JWT tokens stored securely on device.

### 2. Browse CRM Data
User browses accounts and contacts fetched from Salesforce via the BFF. Data is cached locally via React Query.

### 3. Create Invoice
User creates an invoice against a customer account. If offline, the action is queued locally.

### 4. Accept Payment
User initiates payment collection. The BFF creates a Stripe PaymentIntent and returns the client secret. User completes payment via Stripe payment sheet.

### 5. Payment Confirmation
Stripe sends webhook to BFF confirming payment. BFF updates invoice status in Salesforce to "paid".

### 6. Offline Sync
If actions were queued while offline, they automatically replay when connectivity returns. Failed actions are logged for manual review.

---

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
- Salesforce CRM integration via REST API
- Stripe payment processing with PaymentIntent flow
- OAuth 2.0 authentication with token refresh
- Webhook handling for asynchronous events

### Mobile Architecture
- Cross-platform React Native with Expo
- File-based routing with Expo Router
- Secure credential storage (expo-secure-store)
- Network state monitoring and offline detection

### Offline-First Design
- Local action queue for write operations
- Automatic sync on network reconnection
- Retry logic with max attempt limits
- Conflict resolution strategy

### Production Practices
- Monorepo structure with npm workspaces
- Typed API client with automatic auth headers
- Environment-based configuration (dev/staging/prod)
- Structured diagnostic event logging
- Mock mode for development without credentials

---

## License

MIT