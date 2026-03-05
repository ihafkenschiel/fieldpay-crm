import type { HttpClient } from '../http';

export interface CreatePaymentIntentRequest {
  invoiceId: string;
  amount: number;
  currency: string;
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

export class StripeApi {
  constructor(private http: HttpClient) {}

  createPaymentIntent(input: CreatePaymentIntentRequest): Promise<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>('/stripe/payment-intent', input);
  }
}
