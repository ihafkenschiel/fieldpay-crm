# Field Pay CRM — Architecture Documentation

## Overview

Field Pay CRM is a cross-platform mobile and web application designed for field sales representatives. It demonstrates enterprise-grade architecture patterns including CRM integration, payment processing, offline-first design, and production observability.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│                                                                   │
│   ┌─────────────────┐         ┌─────────────────┐                │
│   │   iOS / Android  │         │      Web        │                │
│   │   (Expo Native)  │         │   (Expo Web)    │                │
│   └────────┬────────┘         └────────┬────────┘                │
│            │                           │                          │
│   ┌────────┴───────────────────────────┴────────┐                │
│   │              Shared Codebase                 │                │
│   │  • React Native Components (@fieldpay/ui)    │                │
│   │  • Business Logic (@fieldpay/core)           │                │
│   │  • API Client (@fieldpay/api-client)         │                │
│   └────────────────────┬────────────────────────┘                │
└────────────────────────┼─────────────────────────────────────────┘
                         │ HTTPS
┌────────────────────────┼─────────────────────────────────────────┐
│                   BFF SERVER (Fastify)                            │
│                        │                                          │
│   ┌────────────────────┼────────────────────────┐                │
│   │                    │                         │                │
│   │  Auth Routes    Salesforce Routes   Stripe Routes            │
│   │  /auth/*        /salesforce/*       /stripe/*                │
│   │                                                               │
│   │  ┌─────────────────────────────────────────┐                 │
│   │  │           Service Layer                  │                 │
│   │  │  AuthService  SalesforceService  StripeService           │
│   │  └─────────────────────────────────────────┘                 │
│   └──────────────────────────────────────────────┘               │
└────────────────────────┬─────────────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼                             ▼
   ┌─────────────┐              ┌─────────────┐
   │  Salesforce  │              │   Stripe    │
   │  REST API    │              │    API      │
   └─────────────┘              └─────────────┘
```

## Monorepo Structure

```
/fieldpay-crm
├── apps/
│   └── mobile/              # Expo app (iOS, Android, Web)
├── packages/
│   ├── core/                # Domain models, utilities, constants
│   ├── ui/                  # Shared React Native components
│   └── api-client/          # Typed HTTP client for BFF
├── server/                  # Fastify BFF server
└── docs/                    # Architecture documentation
```

### Package Responsibilities

| Package | Purpose |
|---------|---------|
| `@fieldpay/core` | Framework-agnostic domain models, business logic, utilities |
| `@fieldpay/ui` | Cross-platform React Native UI components with design tokens |
| `@fieldpay/api-client` | Typed HTTP client with automatic auth header injection |
| `@fieldpay/server` | Backend For Frontend — proxies external APIs, owns secrets |
| `@fieldpay/mobile` | Expo application with screens, navigation, state management |

## Key Architectural Decisions

### 1. Backend For Frontend (BFF) Pattern

All external API communication flows through the BFF server. The client never directly communicates with Salesforce or Stripe.

**Benefits:**
- Secrets remain server-side (never in mobile bundles)
- Unified API surface for the client
- Request/response transformation
- Rate limiting and caching opportunities
- Simplified client logic

### 2. Offline-First Architecture

The application is designed to function without network connectivity.

**Components:**
- **Queue Store**: Zustand store holding pending actions
- **Sync Service**: Replays queued actions when connectivity returns
- **Network Monitor**: NetInfo subscription triggers sync on reconnection

**Flow:**
1. User performs action while offline
2. Action serialized to QueuedAction and stored locally
3. Network connectivity restored
4. Sync engine replays actions via `/sync/actions` endpoint
5. Successful actions removed; failed actions retry up to max attempts

### 3. State Management Strategy

| State Type | Solution | Rationale |
|------------|----------|-----------|
| Server State | React Query | Caching, background refetch, optimistic updates |
| Client State | Zustand | Lightweight, no boilerplate, easy persistence |
| Secure Storage | expo-secure-store | Platform-native secure storage for tokens |

### 4. Cross-Platform Code Sharing

Single Expo codebase serves iOS, Android, and Web:
- **UI Components**: React Native primitives work across platforms
- **Business Logic**: Pure TypeScript in `@fieldpay/core`
- **API Client**: Fetch-based, works everywhere
- **Navigation**: Expo Router with file-based routing

## Data Flow

### Authentication Flow

```
┌────────┐     ┌─────────┐     ┌─────────┐     ┌────────────┐
│ Client │────▶│   BFF   │────▶│  Auth   │────▶│ Salesforce │
│        │◀────│         │◀────│ Service │◀────│   OAuth    │
└────────┘     └─────────┘     └─────────┘     └────────────┘
     │
     ▼
┌────────────┐
│ SecureStore │
└────────────┘
```

### Payment Flow

```
┌────────┐  1. Create Invoice   ┌─────────┐
│ Client │─────────────────────▶│   BFF   │
│        │◀─────────────────────│         │
└────────┘  Invoice Created     └─────────┘
     │
     │ 2. Create PaymentIntent
     ▼
┌────────┐                      ┌─────────┐     ┌────────┐
│ Client │─────────────────────▶│   BFF   │────▶│ Stripe │
│        │◀─────────────────────│         │◀────│        │
└────────┘  clientSecret        └─────────┘     └────────┘
     │
     │ 3. Collect Payment (Stripe SDK)
     │ 4. Confirm via Webhook
     ▼
┌────────┐                      ┌─────────┐
│ Client │◀─────────────────────│   BFF   │
│        │  Invoice Updated     │         │
└────────┘  (status: paid)      └─────────┘
```

## Security Considerations

### Secrets Management

| Secret | Location | Never In |
|--------|----------|----------|
| Salesforce Client Secret | Server `.env` | Client bundle |
| Stripe Secret Key | Server `.env` | Client bundle |
| JWT Secret | Server `.env` | Client bundle |
| Stripe Publishable Key | Client `.env` | ✓ Safe for client |

### Token Lifecycle

- Access tokens: 1-hour lifetime
- Refresh tokens: Used to obtain new access tokens
- Token storage: expo-secure-store (native) / localStorage (web)
- Token validation: Server-side on every authenticated request

## Observability

### Event Logging

All significant actions emit diagnostic events:

```typescript
EventNames = {
  AUTH_SUCCESS, AUTH_FAILURE, AUTH_LOGOUT,
  SF_FETCH_ACCOUNTS, SF_FETCH_CONTACTS,
  INVOICE_CREATED,
  PAYMENT_INTENT_CREATED, PAYMENT_SUCCESS, PAYMENT_FAILURE,
  SYNC_STARTED, SYNC_COMPLETED, SYNC_FAILED,
  QUEUE_ACTION_ADDED
}
```

### Diagnostics Screen

Displays:
- App version and environment
- Network connectivity state
- Last sync timestamp
- Queued action count
- Recent event log

## Environment Configuration

### Server

```env
NODE_ENV=development|staging|production
SALESFORCE_MODE=mock|live
STRIPE_MODE=mock|live
```

### Client

```env
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
EXPO_PUBLIC_ENV=development|staging|production
```

## Mock Mode

The application runs fully functional without external API credentials:

- **Salesforce**: In-memory data store with realistic mock data
- **Stripe**: Simulated PaymentIntent creation and confirmation
- **Auth**: Demo credentials (demo@fieldpay.com / demo123)

Toggle via `SALESFORCE_MODE=mock` and `STRIPE_MODE=mock` environment variables.

## Technology Stack

| Layer | Technology |
|-------|------------|
| Mobile/Web | React Native, Expo SDK 50, Expo Router |
| State | Zustand, React Query |
| UI | Custom components, React Native primitives |
| Backend | Node.js, Fastify, TypeScript |
| External | Salesforce REST API, Stripe API |
