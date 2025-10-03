'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useCreateClient, useUpdateClient } from '@/hooks/use-client';

interface WebsiteFormProps {
  client?: {
    id: string;
    name: string;
    website: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function WebsiteForm({ client, onSuccess, onCancel }: WebsiteFormProps) {
  const [name, setName] = React.useState(client?.name || '');
  const [website, setWebsite] = React.useState(client?.website || '');
  const [errors, setErrors] = React.useState<{
    name?: string;
    website?: string;
  }>({});

  const createClientMutation = useCreateClient();
  const updateClientMutation = useUpdateClient();
  const isEditing = !!client;

  const validateForm = () => {
    const newErrors: { name?: string; website?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Website name is required';
    }

    if (!website.trim()) {
      newErrors.website = 'Website URL is required';
    } else {
      try {
        new URL(website);
      } catch {
        newErrors.website = 'Please enter a valid URL';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing) {
        await updateClientMutation.mutateAsync({
          clientId: client.id,
          name,
          website,
        });
      } else {
        await createClientMutation.mutateAsync({
          name,
          website,
        });
      }

      onSuccess?.();
    } catch (error) {
      // Error handling is done in the mutation
    }
  };

  const isLoading =
    createClientMutation.isPending || updateClientMutation.isPending;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Website Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., My Company Website"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">{errors.name}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Website URL *
        </label>
        <input
          type="url"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          placeholder="https://example.com"
          className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.website ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
        />
        {errors.website && (
          <p className="mt-1 text-sm text-red-600">{errors.website}</p>
        )}
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? isEditing
              ? 'Updating...'
              : 'Creating...'
            : isEditing
            ? 'Update Website'
            : 'Create Website'}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
