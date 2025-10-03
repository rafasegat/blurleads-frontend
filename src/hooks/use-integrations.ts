/**
 * Integration management hooks - Integrated with backend API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

/**
 * Fetch all integrations for a client
 */
export function useIntegrations(clientId?: string) {
  return useQuery({
    queryKey: ['integrations', clientId],
    queryFn: async () => {
      console.log('[useIntegrations] Fetching integrations');

      if (!clientId) {
        console.warn('[useIntegrations] No clientId provided');
        return [];
      }

      const { data, error, response } = await apiClient.GET('/integrations', {
        params: {
          path: {
            clientId,
          },
        },
      });

      if (error) {
        console.error('[useIntegrations] Error:', error, response);
        throw new Error('Failed to fetch integrations');
      }

      console.log('[useIntegrations] Successfully fetched integrations');
      return data;
    },
    enabled: !!clientId,
  });
}

/**
 * Update integration (uses PUT method per OpenAPI schema)
 */
export function useUpdateIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      ...updates
    }: {
      id: string;
      isEnabled?: boolean;
      config?: Record<string, any>;
    }) => {
      console.log('[useUpdateIntegration] Updating integration:', id);

      const { data, error, response } = await apiClient.PUT(
        '/integrations/{id}',
        {
          params: {
            path: { id },
          },
          body: updates as any,
        }
      );

      if (error) {
        console.error('[useUpdateIntegration] Error:', error, response);
        throw new Error('Failed to update integration');
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update integration');
    },
  });
}

/**
 * Delete integration
 */
export function useDeleteIntegration() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('[useDeleteIntegration] Deleting integration:', id);

      const { error, response } = await apiClient.DELETE('/integrations/{id}', {
        params: {
          path: { id },
        },
      });

      if (error) {
        console.error('[useDeleteIntegration] Error:', error, response);
        throw new Error('Failed to delete integration');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['integrations'] });
      toast.success('Integration deleted');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete integration');
    },
  });
}

/**
 * Test integration
 */
export function useTestIntegration() {
  return useMutation({
    mutationFn: async (id: string) => {
      console.log('[useTestIntegration] Testing integration:', id);

      const { data, error, response } = await apiClient.POST(
        '/integrations/{id}/test',
        {
          params: {
            path: { id },
          },
          body: {} as any,
        }
      );

      if (error) {
        console.error('[useTestIntegration] Error:', error, response);
        throw new Error('Failed to test integration');
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Integration test successful');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Integration test failed');
    },
  });
}

/**
 * Sync lead with integration
 */
export function useSyncLead() {
  return useMutation({
    mutationFn: async ({
      integrationId,
      leadId,
    }: {
      integrationId: string;
      leadId: string;
    }) => {
      console.log('[useSyncLead] Syncing lead:', integrationId, leadId);

      const { data, error, response } = await apiClient.POST(
        '/integrations/{id}/sync/{leadId}',
        {
          params: {
            path: {
              id: integrationId,
              leadId,
            },
          },
          body: {} as any,
        }
      );

      if (error) {
        console.error('[useSyncLead] Error:', error, response);
        throw new Error('Failed to sync lead');
      }

      return data;
    },
    onSuccess: () => {
      toast.success('Lead synced successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to sync lead');
    },
  });
}
