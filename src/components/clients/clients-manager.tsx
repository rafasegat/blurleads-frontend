'use client';

import React, { useState } from 'react';
import {
  Plus,
  Globe,
  Copy,
  ExternalLink,
  Settings,
  Trash2,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useClients, useCreateClient } from '@/hooks/use-client';
import { toast } from 'sonner';

interface Client {
  id: string;
  name: string;
  website: string;
  apiKey: string;
  isActive: boolean;
  createdAt: string;
  _count?: {
    leads: number;
    visitors: number;
    integrations: number;
  };
}

export function ClientsManager() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newClientWebsite, setNewClientWebsite] = useState('');

  const { data: clients, isLoading, error } = useClients();
  const createClientMutation = useCreateClient();

  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName.trim() || !newClientWebsite.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await createClientMutation.mutateAsync({
        name: newClientName,
        website: newClientWebsite,
      });
      setNewClientName('');
      setNewClientWebsite('');
      setShowCreateForm(false);
      toast.success('Client created successfully');
    } catch (error) {
      toast.error('Failed to create client');
    }
  };

  const handleCopyScript = (apiKey: string) => {
    const trackingScript = `<!-- BlurLeads Tracking Script -->
<script>
  (function() {
    var script = document.createElement('script');
    script.src = 'https://blurleads.com/tracker.js';
    script.setAttribute('data-api-key', '${apiKey}');
    script.setAttribute('data-api-url', 'https://api.blurleads.com');
    script.async = true;
    document.head.appendChild(script);
  })();
</script>`;

    navigator.clipboard.writeText(trackingScript);
    toast.success('Tracking script copied to clipboard');
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(2)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center text-red-600">
          Failed to load clients. Please try again.
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Your Websites</h2>
          <p className="text-gray-600">
            Manage tracking scripts for multiple websites
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Website
        </Button>
      </div>

      {/* Create Client Form */}
      {showCreateForm && (
        <Card className="p-6">
          <form onSubmit={handleCreateClient} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website Name
              </label>
              <input
                type="text"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
                placeholder="e.g., My Company Website"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={newClientWebsite}
                onChange={(e) => setNewClientWebsite(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={createClientMutation.isPending}>
                {createClientMutation.isPending
                  ? 'Creating...'
                  : 'Create Website'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCreateForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Clients List */}
      {clients && clients.length > 0 ? (
        <div className="grid gap-4">
          {clients.map((client: Client) => (
            <Card key={client.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Globe className="h-5 w-5 text-blue-600" />
                    <h3 className="text-lg font-medium text-gray-900">
                      {client.name}
                    </h3>
                    <Badge variant={client.isActive ? 'default' : 'secondary'}>
                      {client.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                    <a
                      href={client.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      {client.website}
                    </a>
                  </div>

                  {/* Stats */}
                  {client._count && (
                    <div className="flex gap-4 text-sm text-gray-600 mb-4">
                      <span>{client._count.leads} leads</span>
                      <span>{client._count.visitors} visitors</span>
                      <span>{client._count.integrations} integrations</span>
                    </div>
                  )}

                  {/* API Key */}
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">
                          API Key
                        </div>
                        <code className="text-sm font-mono text-gray-800">
                          {client.apiKey}
                        </code>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleCopyScript(client.apiKey)}
                        className="flex items-center gap-1"
                      >
                        <Copy className="h-3 w-3" />
                        Copy Script
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="p-8 text-center">
          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No websites yet
          </h3>
          <p className="text-gray-600 mb-4">
            Add your first website to start tracking visitors and generating
            leads.
          </p>
          <Button onClick={() => setShowCreateForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Website
          </Button>
        </Card>
      )}
    </div>
  );
}
