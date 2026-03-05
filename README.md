# FIELD PAY CRM — Architecture Plan (Phase 1)



------

## 1. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                        │
│                                                          │
│   ┌──────────────┐    ┌──────────────┐                  │
│   │  Mobile App   │    │   Web App    │                  │
│   │  (Expo RN)    │    │  (Expo Web)  │                  │
│   └──────┬───────┘    └──────┬───────┘                  │
│          │                    │                           │
│   ┌──────┴────────────────────┴───────┐                  │
│   │         Shared Packages           │                  │
│   │  @fieldpay/core  @fieldpay/ui     │                  │
│   │  @fieldpay/api-client             │                  │
│   └──────────────┬───────────────────┘                  │
└──────────────────┼───────────────────────────────────────┘
                   │  HTTPS
┌──────────────────┼───────────────────────────────────────┐
│              BFF SERVER (Fastify + TS)                    │
│                  │                                        │
│   ┌──────────────┼──────────────────────┐                │
│   │   /auth/*    │  /salesforce/*       │                │
│   │   /stripe/*  │  /sync/*            │                │
│   └──────────────┼──────────────────────┘                │
└──────────────────┼───────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        ▼                     ▼
  ┌───────────┐        ┌───────────┐
  │ Salesforce │        │  Stripe   │
  │  REST API  │        │    API    │
  └───────────┘        └───────────┘
```

**Key principle:** The BFF server is the only component that holds secrets. Clients never talk directly to Salesforce or Stripe.



------

## 2. Repo Structure



```
/fieldpay-crm
├── package.json              # Workspace root (npm workspaces)
├── tsconfig.base.json        # Shared TS config
├── .env.example
├── apps/
│   └── mobile/               # Expo app (iOS, Android, Web)
│       ├── app/              # Expo Router file-based routing
│       ├── package.json
│       └── tsconfig.json
├── packages/
│   ├── core/                 # Domain models, business logic, constants
│   │   ├── src/
│   │   │   ├── models/       # Account, Contact, Invoice, QueuedAction
│   │   │   ├── constants/    # Env config, event names
│   │   │   └── utils/        # Formatters, validators
│   │   └── package.json
│   ├── ui/                   # Shared UI components (RN + Web)
│   │   ├── src/
│   │   └── package.json
│   └── api-client/           # Typed HTTP client for BFF
│       ├── src/
│       └── package.json
├── server/                   # Fastify BFF
│   ├── src/
│   │   ├── routes/           # auth, salesforce, stripe, sync
│   │   ├── services/         # SalesforceService, StripeService
│   │   ├── middleware/       # auth guard, error handler
│   │   └── config/          # env loading
│   ├── package.json
│   └── tsconfig.json
└── docs/
    ├── architecture.md
    └── adr/
        ├── 001-bff-pattern.md
        └── 002-offline-queue.md
```

**Decision:** Single Expo app with Expo Router serves mobile AND web (code sharing maximized). No separate Next.js app — Expo Web is sufficient and avoids duplication.



------

## 3. Data Models

```typescript
// === CRM Domain ===
 
interface Account {
  id: string;
  name: string;
  industry: string;
  phone: string;
  website: string;
}
 
interface Contact {
  id: string;
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  title: string;
}
 
interface Invoice {
  id: string;
  accountId: string;
  contactId?: string;
  amount: number;
  currency: string;            // "usd"
  status: 'draft' | 'pending' | 'paid' | 'failed';
  stripePaymentIntentId?: string;
  stripeChargeId?: string;
  description?: string;
  createdAt: string;           // ISO 8601
  updatedAt: string;
}
 
// === Offline Queue ===
 
interface QueuedAction {
  id: string;
  type: 'create_invoice' | 'update_invoice' | 'sync_payment';
  payload: Record<string, unknown>;
  status: 'pending' | 'processing' | 'failed';
  attempts: number;
  maxAttempts: number;         // default 3
  lastError?: string;
  createdAt: string;
}
 
// === Auth ===
 
interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  instanceUrl: string;
  expiresAt: number;           // Unix ms
}
 
// === Diagnostics ===
 
interface DiagnosticEvent {
  id: string;
  name: string;                // e.g. "auth_success"
  metadata?: Record<string, unknown>;
  timestamp: string;
}
```



------

## 4. API Endpoints (BFF)

### Auth

| Method | Path            | Description                                         |
| :----- | :-------------- | :-------------------------------------------------- |
| POST   | `/auth/login`   | Exchange OAuth code for tokens (or simulated login) |
| POST   | `/auth/refresh` | Refresh access token                                |
| POST   | `/auth/logout`  | Revoke tokens                                       |

### Salesforce (proxied)

| Method | Path                                | Description                            |
| :----- | :---------------------------------- | :------------------------------------- |
| GET    | `/salesforce/accounts`              | List accounts (supports `?search=`)    |
| GET    | `/salesforce/accounts/:id`          | Account detail                         |
| GET    | `/salesforce/accounts/:id/contacts` | Contacts for account                   |
| GET    | `/salesforce/invoices`              | List invoices (supports `?accountId=`) |
| POST   | `/salesforce/invoices`              | Create invoice                         |
| PATCH  | `/salesforce/invoices/:id`          | Update invoice                         |

### Stripe

| Method | Path                     | Description             |
| :----- | :----------------------- | :---------------------- |
| POST   | `/stripe/payment-intent` | Create PaymentIntent    |
| POST   | `/stripe/webhook`        | Stripe webhook receiver |

### Sync

| Method | Path            | Description                   |
| :----- | :-------------- | :---------------------------- |
| POST   | `/sync/actions` | Replay queued offline actions |

------

## 5. Integration Strategy

### Salesforce Integration

- **Real mode:** Standard OAuth 2.0 Web Server flow. BFF exchanges auth code, stores refresh token server-side, proxies all API calls.
- **Demo mode (default):** BFF serves realistic mock data from an in-memory store. This allows the app to run without Salesforce credentials. A `SALESFORCE_MODE=mock|live` env var toggles behavior. The mock service implements the same interface as the live service.

### Stripe Integration

- **Real mode:** BFF creates PaymentIntents via Stripe SDK. Client uses 

  `stripe/stripe-react-native` (mobile) or `stripe/react-stripe-js` (web) to collect payment.

- **Demo mode:** BFF returns mock PaymentIntent responses. Client renders a simulated payment sheet. `STRIPE_MODE=mock|live` env var toggles.

### Offline Strategy

- Client detects network state via 

  `react-native-community/netinfo`

- When offline, write operations (create invoice, etc.) are serialized into `QueuedAction` records in local SQLite (via `expo-sqlite`).

- A sync engine runs on reconnection: dequeues actions in FIFO order, calls BFF, retries up to `maxAttempts`, marks failed after exhaustion.

- Zustand store tracks queue length for UI display.

### Auth Flow

1. User taps "Login" → opens OAuth URL (or simulated login form in demo mode)
2. BFF validates credentials, returns `{ accessToken, refreshToken, expiresAt }`
3. Client stores tokens in `expo-secure-store`
4. API client attaches `Authorization: Bearer <token>` to all requests
5. On 401, client attempts refresh; on failure, redirects to login

### Security

- All secrets (`STRIPE_SECRET_KEY`, `SALESFORCE_CLIENT_SECRET`) live only in `server/.env`
- Client `.env` contains only `API_BASE_URL` and `STRIPE_PUBLISHABLE_KEY`
- BFF validates auth on every request via middleware
- CORS restricted to known origins



------

## 6. State Management (Client)

- **Zustand** for global state: auth, offline queue, diagnostics
- **React Query (TanStack Query)** for server state: accounts, contacts, invoices
- Clean separation: Zustand = client state, React Query = server cache



------

## 7. Environment Configuration

```shell
# server/.env
NODE_ENV=development
PORT=3001
SALESFORCE_MODE=mock           # mock | live
SALESFORCE_CLIENT_ID=
SALESFORCE_CLIENT_SECRET=
SALESFORCE_REDIRECT_URI=
STRIPE_MODE=mock               # mock | live
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
 
# apps/mobile/.env
EXPO_PUBLIC_API_URL=http://localhost:3001
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
```



------

## Summary of Key Decisions

| Decision                     | Rationale                                                    |
| :--------------------------- | :----------------------------------------------------------- |
| **Expo Router (single app)** | Maximizes code sharing; serves mobile + web from one codebase |
| **Fastify BFF**              | Fast, schema-validated, plugin-based; better DX than Express |
| **Mock/Live toggle**         | Demo runs without any external credentials; flip env to go live |
| **Zustand + React Query**    | Clean separation of client vs server state; lightweight      |
| **expo-sqlite for offline**  | Built into Expo, no native module linking needed             |
| **npm workspaces**           | Simple monorepo without Turborepo complexity for a demo      |