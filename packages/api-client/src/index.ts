import { HttpClient, type TokenProvider } from './http';
import { AuthApi } from './services/auth';
import { SalesforceApi } from './services/salesforce';
import { StripeApi } from './services/stripe';
import { SyncApi } from './services/sync';

export { ApiError } from './http';
export type { TokenProvider } from './http';
export type { PaymentIntentResponse, CreatePaymentIntentRequest } from './services/stripe';
export type { SyncResult } from './services/sync';

/**
 * Unified API client that provides typed access to all BFF endpoints.
 * Architecture: single entry point, composed of domain-specific sub-clients.
 */
export class FieldPayClient {
  private http: HttpClient;

  public auth: AuthApi;
  public salesforce: SalesforceApi;
  public stripe: StripeApi;
  public sync: SyncApi;

  constructor(baseUrl: string) {
    this.http = new HttpClient(baseUrl);
    this.auth = new AuthApi(this.http);
    this.salesforce = new SalesforceApi(this.http);
    this.stripe = new StripeApi(this.http);
    this.sync = new SyncApi(this.http);
  }

  /** Set a function that provides the current access token for authenticated requests. */
  setTokenProvider(provider: TokenProvider) {
    this.http.setTokenProvider(provider);
  }
}
