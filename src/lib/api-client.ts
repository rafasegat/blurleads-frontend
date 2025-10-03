import createClient from 'openapi-fetch';
import type { paths } from './api-types';

const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = createClient<paths>({
  baseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Create an authenticated API client instance
 */
export function createAuthenticatedClient(token: string) {
  return createClient<paths>({
    baseUrl,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Add auth token to all requests
 */
export function setAuthToken(token: string): void {
  apiClient.use({
    async onRequest({ request }) {
      request.headers.set('Authorization', `Bearer ${token}`);
      return request;
    },
  });
}

/**
 * Remove auth token
 */
export function clearAuthToken(): void {
  apiClient.eject({
    async onRequest({ request }) {
      request.headers.delete('Authorization');
      return request;
    },
  });
}

/**
 * Global error handler middleware
 */
apiClient.use({
  async onResponse({ response }) {
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('API Error:', {
        status: response.status,
        url: response.url,
        error,
      });
    }
    return response;
  },
});
