/**
 * Lead management hooks - Integrated with backend API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

/**
 * Fetch all leads from backend
 */
export function useLeads(clientId?: string) {
  return useQuery({
    queryKey: ['leads', clientId],
    queryFn: async () => {
      console.log('[useLeads] Fetching leads from backend');

      if (!clientId) {
        console.warn('[useLeads] No clientId provided');
        return { leads: [], total: 0 };
      }

      const { data, error, response } = await apiClient.GET('/leads', {
        params: {
          query: {
            clientId,
          },
        },
      });

      if (error) {
        console.error('[useLeads] Error:', error, response);
        throw new Error('Failed to fetch leads');
      }

      console.log('[useLeads] Successfully fetched leads:', data);
      return data;
    },
    enabled: !!clientId,
  });
}

/**
 * Fetch single lead by ID
 */
export function useLead(id: string) {
  return useQuery({
    queryKey: ['leads', id],
    queryFn: async () => {
      console.log('[useLead] Fetching lead:', id);

      const { data, error, response } = await apiClient.GET('/leads/{id}', {
        params: {
          path: { id },
        },
      });

      if (error) {
        console.error('[useLead] Error:', error, response);
        throw new Error('Failed to fetch lead');
      }

      console.log('[useLead] Successfully fetched lead');
      return data;
    },
    enabled: !!id,
  });
}

/**
 * Search leads
 */
export function useSearchLeads(q: string, clientId?: string) {
  return useQuery({
    queryKey: ['leads', 'search', q, clientId],
    queryFn: async () => {
      console.log('[useSearchLeads] Searching leads:', q);

      if (!clientId) {
        console.warn('[useSearchLeads] No clientId provided');
        return [];
      }

      const { data, error, response } = await apiClient.GET('/leads/search', {
        params: {
          query: {
            q,
            clientId,
          },
        },
      });

      if (error) {
        console.error('[useSearchLeads] Error:', error, response);
        throw new Error('Failed to search leads');
      }

      return data;
    },
    enabled: !!q && !!clientId,
  });
}

/**
 * Update lead status
 */
export function useUpdateLeadStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      console.log('[useUpdateLeadStatus] Updating lead status:', id, status);

      const { data, error, response } = await apiClient.PATCH(
        '/leads/{id}/status',
        {
          params: {
            path: { id },
            query: { status },
          },
        } as any
      );

      if (error) {
        console.error('[useUpdateLeadStatus] Error:', error, response);
        throw new Error('Failed to update lead status');
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      queryClient.invalidateQueries({ queryKey: ['leads', variables.id] });
      toast.success('Lead status updated');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update lead status');
    },
  });
}

/**
 * Delete lead
 */
export function useDeleteLead() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      console.log('[useDeleteLead] Deleting lead:', id);

      const { error, response } = await apiClient.DELETE('/integrations/{id}', {
        params: {
          path: { id },
        },
      } as any);

      if (error) {
        console.error('[useDeleteLead] Error:', error, response);
        throw new Error('Failed to delete lead');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast.success('Lead deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete lead');
    },
  });
}

/**
 * Fetch lead stats
 */
export function useLeadStats(clientId?: string) {
  return useQuery({
    queryKey: ['leads', 'stats', clientId],
    queryFn: async () => {
      console.log('[useLeadStats] Fetching lead statistics');

      if (!clientId) {
        console.warn('[useLeadStats] No clientId provided');
        return null;
      }

      const { data, error, response } = await apiClient.GET('/leads/stats', {
        params: {
          query: {
            clientId,
          },
        },
      });

      if (error) {
        console.error('[useLeadStats] Error:', error, response);
        throw new Error('Failed to fetch stats');
      }

      return data;
    },
    enabled: !!clientId,
  });
}
