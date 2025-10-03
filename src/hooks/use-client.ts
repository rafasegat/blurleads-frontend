/**
 * Client management hooks - Get user's client and API key
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
  website: string;
  apiKey: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
}

/**
 * Get current user's clients
 * This provides all clients for the user
 */
export function useClients() {
  const { user, session } = useAuth();

  return useQuery({
    queryKey: ['clients', user?.id],
    queryFn: async () => {
      console.log('[useClients] Fetching clients for user:', user?.id);

      if (!user?.id || !session?.access_token) {
        console.warn('[useClients] No user ID or session token');
        return [];
      }

      try {
        // Fetch from backend API with proper auth token
        const response = await fetch(
          `${
            process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
          }/clients`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        );

        if (!response.ok) {
          console.error(
            '[useClients] Error fetching clients:',
            response.status,
            response.statusText
          );
          throw new Error('Failed to fetch clients');
        }

        const data = await response.json();
        console.log('[useClients] Clients found:', data.length);
        return data as Client[];
      } catch (error) {
        console.error('[useClients] Error:', error);
        throw error;
      }
    },
    enabled: !!user?.id && !!session?.access_token,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });
}

/**
 * Get current user's first client (legacy compatibility)
 * This provides the first clientId and API key needed for tracking
 */
export function useClient() {
  const { data: clients, isLoading, error } = useClients();

  return {
    data: clients?.[0] || null,
    isLoading,
    error,
  };
}

/**
 * Create a new client for the current user
 */
export function useCreateClient() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name?: string; website?: string }) => {
      console.log('[useCreateClient] Creating client:', data);

      if (!session?.access_token) {
        throw new Error('No session token available');
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/clients`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        console.error(
          '[useCreateClient] Error:',
          response.status,
          response.statusText
        );
        throw new Error('Failed to create client');
      }

      const responseData = await response.json();
      console.log('[useCreateClient] Client created:', responseData.id);
      return responseData as Client;
    },
    onSuccess: () => {
      // Invalidate and refetch clients data
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client'] });
    },
  });
}

/**
 * Update client information
 */
export function useUpdateClient() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      clientId: string;
      name?: string;
      website?: string;
    }) => {
      console.log('[useUpdateClient] Updating client:', data);

      if (!session?.access_token) {
        throw new Error('No session token available');
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        }/clients/${data.clientId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            name: data.name,
            website: data.website,
          }),
        }
      );

      if (!response.ok) {
        console.error(
          '[useUpdateClient] Error:',
          response.status,
          response.statusText
        );
        throw new Error('Failed to update client');
      }

      const responseData = await response.json();
      console.log('[useUpdateClient] Client updated:', responseData.id);
      return responseData as Client;
    },
    onSuccess: () => {
      // Invalidate and refetch clients data
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client'] });
    },
  });
}

/**
 * Regenerate API key for the current user's client
 */
export function useRegenerateApiKey() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      console.log('[useRegenerateApiKey] Regenerating API key');

      if (!session?.access_token) {
        throw new Error('No session token available');
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        }/clients/regenerate-api-key`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        console.error(
          '[useRegenerateApiKey] Error:',
          response.status,
          response.statusText
        );
        throw new Error('Failed to regenerate API key');
      }

      const responseData = await response.json();
      console.log(
        '[useRegenerateApiKey] API key regenerated:',
        responseData.id
      );
      return responseData as Client;
    },
    onSuccess: () => {
      // Invalidate and refetch client data
      queryClient.invalidateQueries({ queryKey: ['client'] });
    },
  });
}

/**
 * Get user's API key directly
 */
export function useApiKey() {
  const { data: client, isLoading } = useClient();

  return {
    apiKey: client?.apiKey || null,
    isLoading,
  };
}

/**
 * Get user's client ID directly
 */
export function useClientId() {
  const { data: client, isLoading } = useClient();

  return {
    clientId: client?.id || null,
    isLoading,
  };
}

/**
 * Delete a client
 */
export function useDeleteClient() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      console.log('[useDeleteClient] Deleting client:', clientId);

      if (!session?.access_token) {
        throw new Error('No session token available');
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        }/clients/${clientId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        console.error(
          '[useDeleteClient] Error:',
          response.status,
          response.statusText
        );
        throw new Error('Failed to delete client');
      }

      const responseData = await response.json();
      console.log('[useDeleteClient] Client deleted:', responseData.id);
      return responseData;
    },
    onSuccess: () => {
      // Invalidate and refetch clients data
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete client');
    },
  });
}

/**
 * Check if tracking script is installed on website
 */
export function useCheckScriptInstallation() {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      console.log(
        '[useCheckScriptInstallation] Checking script for client:',
        clientId
      );

      if (!session?.access_token) {
        throw new Error('No session token available');
      }

      const response = await fetch(
        `${
          process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
        }/clients/${clientId}/check-script`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!response.ok) {
        console.error(
          '[useCheckScriptInstallation] Error:',
          response.status,
          response.statusText
        );
        throw new Error('Failed to check script installation');
      }

      const responseData = await response.json();
      console.log(
        '[useCheckScriptInstallation] Script check result:',
        responseData
      );
      return responseData;
    },
    onSuccess: (data) => {
      // Invalidate and refetch clients data
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client'] });

      if (data.isActive) {
        toast.success('Tracking script is active and working!');
      } else {
        toast.warning('No tracking data found - script may not be installed');
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to check script installation');
    },
  });
}
