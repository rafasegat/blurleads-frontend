/**
 * Type-safe API hooks using openapi-ts generated types
 *
 * These hooks provide a type-safe way to interact with the backend API.
 * All types are automatically generated from the OpenAPI schema.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

/**
 * Example: Fetch leads with full type safety
 * Uncomment and use once backend endpoints are fully connected
 */

// export function useLeads() {
//   return useQuery({
//     queryKey: ['leads'],
//     queryFn: async () => {
//       const { data, error, response } = await apiClient.GET('/leads', {
//         params: {
//           query: {
//             clientId: 'your-client-id', // Replace with actual client ID
//           },
//         },
//       });

//       if (error) {
//         throw new Error(`Failed to fetch leads: ${response.status}`);
//       }

//       return data;
//     },
//   });
// }

/**
 * Example: Update lead status
 */

// export function useUpdateLeadStatus() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async ({ id, status }: { id: string; status: string }) => {
//       const { data, error, response } = await apiClient.PATCH(
//         '/leads/{id}/status',
//         {
//           params: {
//             path: { id },
//             query: { status },
//           },
//         }
//       );

//       if (error) {
//         throw new Error(`Failed to update status: ${response.status}`);
//       }

//       return data;
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['leads'] });
//       toast.success('Status updated');
//     },
//   });
// }

/**
 * Example: Delete lead
 */

// export function useDeleteLead() {
//   const queryClient = useQueryClient();

//   return useMutation({
//     mutationFn: async (id: string) => {
//       const { error, response } = await apiClient.DELETE('/integrations/{id}', {
//         params: {
//           path: { id },
//         },
//       });

//       if (error) {
//         throw new Error(`Failed to delete: ${response.status}`);
//       }
//     },
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ['leads'] });
//       toast.success('Deleted successfully');
//     },
//   });
// }

// For now, export a placeholder until backend is fully connected
export const useApiPlaceholder = () => null;
