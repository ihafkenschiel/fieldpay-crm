# ADR-001: Backend For Frontend Pattern

## Status

Accepted

## System Context

Field Pay CRM is a mobile application used by field sales representatives to create invoices and collect payments. The application must integrate with enterprise systems that require authenticated API access:

- **Salesforce CRM**: Source of truth for customer accounts, contacts, and invoice records
- **Stripe**: Payment processing for invoice collection

Mobile clients cannot securely store the credentials required to access these services. This ADR documents the decision to introduce a Backend-for-Frontend (BFF) server to mediate all external API communication.

---

## Context

Field Pay CRM integrates with two external services:
- **Salesforce**: CRM data (accounts, contacts, invoices)
- **Stripe**: Payment processing

Both services require secret credentials:
- Salesforce: OAuth client secret, access tokens
- Stripe: Secret API key, webhook signing secret

Mobile applications present unique security challenges:
1. App bundles can be decompiled and inspected
2. Network traffic can be intercepted (even with TLS, via proxy tools)
3. Secrets embedded in client code are effectively public

Additionally, the client needs to:
- Handle OAuth token exchange
- Transform API responses for UI consumption
- Manage rate limiting and retry logic
- Support offline operation with eventual sync

## Decision

Implement a **Backend For Frontend (BFF)** server that:

1. **Owns all secrets** — Salesforce and Stripe credentials never leave the server
2. **Proxies all external API calls** — Client communicates only with BFF
3. **Handles authentication** — OAuth exchange, token refresh, session management
4. **Provides a unified API** — Single endpoint surface optimized for client needs
5. **Supports offline sync** — Accepts batched actions for replay

### API Surface

```
/auth/login          — Exchange credentials for session tokens
/auth/refresh        — Refresh access token
/auth/logout         — Revoke session

/salesforce/accounts — List/search accounts
/salesforce/accounts/:id — Account detail
/salesforce/accounts/:id/contacts — Contacts for account
/salesforce/invoices — List/create invoices
/salesforce/invoices/:id — Update invoice

/stripe/payment-intent — Create PaymentIntent
/stripe/webhook — Receive Stripe events

/sync/actions — Replay queued offline actions
```

## Alternatives Considered

### 1. Direct Client-to-API Communication

**Approach**: Client calls Salesforce and Stripe APIs directly.

**Rejected because**:
- Requires embedding secrets in client bundle
- Secrets would be extractable from APK/IPA
- No way to rotate secrets without app update
- Violates Stripe and Salesforce security requirements

### 2. Serverless Functions (Lambda/Cloud Functions)

**Approach**: Individual serverless functions for each endpoint.

**Rejected because**:
- Cold start latency impacts UX
- More complex deployment and monitoring
- Harder to share state (e.g., in-memory mock data)
- Overkill for a demo application

### 3. GraphQL Gateway

**Approach**: Single GraphQL endpoint federating multiple services.

**Rejected because**:
- Added complexity for limited benefit in this use case
- REST is simpler for CRUD operations
- Team familiarity with REST patterns
- GraphQL tooling adds bundle size

## Consequences

### Positive

- **Security**: Secrets never exposed to client
- **Flexibility**: Can transform, cache, or rate-limit without client changes
- **Testability**: BFF can run in mock mode without external dependencies
- **Offline support**: Single endpoint for action replay simplifies sync logic

### Negative

- **Additional infrastructure**: Requires hosting and maintaining a server
- **Latency**: Extra network hop (client → BFF → external API)
- **Coupling**: BFF API changes require client updates

### Mitigations

- **Infrastructure**: Use managed platforms (Railway, Render, Fly.io) for simple deployment
- **Latency**: Acceptable for enterprise app; can add caching if needed
- **Coupling**: Version API endpoints; maintain backward compatibility

## Implementation Notes

- **Framework**: Fastify chosen for performance and TypeScript support
- **Mock mode**: `SALESFORCE_MODE=mock` and `STRIPE_MODE=mock` enable full demo without credentials
- **Service layer**: Abstract external API calls behind service interfaces for easy swapping

---

## Future Scalability Considerations

The current BFF implementation is a single Node.js server suitable for demo and initial production use. As the application scales, the following enhancements should be considered:

### Horizontal Scaling

The BFF is stateless by design, enabling horizontal scaling:

1. **Load balancer**: Deploy multiple BFF instances behind AWS ALB, GCP Load Balancer, or similar
2. **Session storage**: If session state is needed, externalize to Redis
3. **Health checks**: `/health` endpoint already implemented for orchestrator health probes

### Caching Layer

For high-traffic deployments, introduce caching to reduce external API calls:

| Data | Cache Strategy | TTL |
|------|----------------|-----|
| Account list | Cache in Redis | 5 minutes |
| Contact list | Cache in Redis | 5 minutes |
| Invoice list | No cache (real-time) | — |
| Auth tokens | Server-side session | Token lifetime |

**Implementation**: Add Redis adapter to service layer; cache reads, invalidate on writes.

### API Gateway

For enterprise deployments, consider placing an API gateway in front of the BFF:

- **Rate limiting**: Protect against abuse and runaway clients
- **Request logging**: Centralized audit trail
- **Authentication**: Offload JWT validation to gateway
- **API versioning**: Route `/v1/*` and `/v2/*` to different BFF versions

**Recommended gateways**: Kong, AWS API Gateway, Cloudflare API Shield

### Multi-Region Deployment

For global field sales teams:

1. Deploy BFF instances in multiple regions (US, EU, APAC)
2. Use geo-routing (Cloudflare, Route 53) to direct clients to nearest region
3. Salesforce and Stripe are global services; no regional configuration needed

### Monitoring and Alerting

Production deployments should include:

- **APM**: Datadog, New Relic, or similar for request tracing
- **Error tracking**: Sentry for exception monitoring
- **Metrics**: Request latency, error rates, Salesforce/Stripe API latency
- **Alerts**: Page on-call for payment failures or sync errors
