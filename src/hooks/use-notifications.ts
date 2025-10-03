/**
 * Notification hooks - Integrated with backend API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

/**
 * Fetch all notifications for a user
 */
export function useNotifications(userId?: string) {
  return useQuery({
    queryKey: ['notifications', userId],
    queryFn: async () => {
      console.log('[useNotifications] Fetching notifications');

      if (!userId) {
        console.warn('[useNotifications] No userId provided');
        return [];
      }

      const { data, error, response } = await apiClient.GET('/notifications', {
        params: {
          path: {
            userId,
          },
        },
      });

      if (error) {
        console.error('[useNotifications] Error:', error, response);
        throw new Error('Failed to fetch notifications');
      }

      console.log('[useNotifications] Successfully fetched notifications');
      return data;
    },
    enabled: !!userId,
  });
}

/**
 * Mark notification as read
 */
export function useMarkNotificationRead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }: { id: string; userId: string }) => {
      console.log(
        '[useMarkNotificationRead] Marking notification as read:',
        id
      );

      const { data, error, response } = await apiClient.PATCH(
        '/notifications/{id}/read',
        {
          params: {
            path: {
              id,
              userId,
            },
          },
        } as any
      );

      if (error) {
        console.error('[useMarkNotificationRead] Error:', error, response);
        throw new Error('Failed to mark as read');
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark notification as read');
    },
  });
}
