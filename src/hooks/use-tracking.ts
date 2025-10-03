/**
 * Tracking hooks - Integrated with backend API
 */

import { useQuery, useMutation } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

/**
 * Track visitor event
 */
export function useTrackEvent() {
  return useMutation({
    mutationFn: async (event: {
      pageUrl: string;
      referrer?: string;
      userAgent?: string;
      ipAddress?: string;
      sessionId: string;
      clientApiKey: string;
    }) => {
      console.log('[useTrackEvent] Tracking event');

      const { data, error, response } = await apiClient.POST(
        '/tracking/event',
        {
          body: event,
        } as any
      );

      if (error) {
        console.error('[useTrackEvent] Error:', error, response);
        throw new Error('Failed to track event');
      }

      return data;
    },
    onError: (error: Error) => {
      console.error('[useTrackEvent] Error:', error.message);
      // Don't show toast for tracking errors to avoid annoying users
    },
  });
}

/**
 * Fetch tracking stats
 */
export function useTrackingStats(clientId?: string) {
  return useQuery({
    queryKey: ['tracking', 'stats', clientId],
    queryFn: async () => {
      console.log('[useTrackingStats] Fetching tracking statistics');

      if (!clientId) {
        console.warn('[useTrackingStats] No clientId provided');
        return null;
      }

      const { data, error, response } = await apiClient.GET('/tracking/stats', {
        params: {
          query: {
            clientId,
          },
        },
      });

      if (error) {
        console.error('[useTrackingStats] Error:', error, response);
        throw new Error('Failed to fetch stats');
      }

      return data;
    },
    enabled: !!clientId,
  });
}
