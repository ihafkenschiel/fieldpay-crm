/**
 * Lightweight HTTP client wrapper.
 * Centralizes auth header injection and error handling.
 */

type RequestOptions = {
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
};

export type TokenProvider = () => Promise<string | null>;

export class HttpClient {
  private baseUrl: string;
  private tokenProvider: TokenProvider | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
  }

  setTokenProvider(provider: TokenProvider) {
    this.tokenProvider = provider;
  }

  async request<T>(options: RequestOptions): Promise<T> {
    const { method, path, body, headers = {} } = options;

    if (this.tokenProvider) {
      const token = await this.tokenProvider();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const url = `${this.baseUrl}${path}`;
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    if (body) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      throw new ApiError(response.status, errorBody || response.statusText, url);
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }

  get<T>(path: string) {
    return this.request<T>({ method: 'GET', path });
  }

  post<T>(path: string, body?: unknown) {
    return this.request<T>({ method: 'POST', path, body });
  }

  patch<T>(path: string, body?: unknown) {
    return this.request<T>({ method: 'PATCH', path, body });
  }

  delete<T>(path: string) {
    return this.request<T>({ method: 'DELETE', path });
  }
}

export class ApiError extends Error {
  constructor(
    public status: number,
    public body: string,
    public url: string,
  ) {
    super(`API Error ${status}: ${body} (${url})`);
    this.name = 'ApiError';
  }
}
