'use client';

import React, { useState } from 'react';
import {
  Plus,
  Globe,
  Copy,
  ExternalLink,
  Settings,
  Trash2,
  Edit,
  Eye,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  useClients,
  useDeleteClient,
  useCheckScriptInstallation,
} from '@/hooks/use-client';
import { WebsiteForm } from '@/components/clients/website-form';
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

export default function WebsitesPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);

  const { data: clients, isLoading, error } = useClients();
  const deleteClientMutation = useDeleteClient();
  const checkScriptMutation = useCheckScriptInstallation();

  const handleDeleteClient = async (client: Client) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${client.name}"? This action cannot be undone.`
      )
    ) {
      try {
        await deleteClientMutation.mutateAsync(client.id);
        setDeletingClient(null);
      } catch (error) {
        // Error handling is done in the mutation
      }
    }
  };

  const handleCopyScript = (apiKey: string) => {
    const trackingScript = `<!-- BlurLeads Tracking Script -->
      <script src="https://blurleads.com/tracker.js?id=${apiKey}" async></script>`;

    navigator.clipboard.writeText(trackingScript);
    toast.success('Tracking script copied to clipboard');
  };

  const generateTrackingScript = (apiKey: string) => {
    return `<!-- BlurLeads Tracking Script -->
      <script src="https://blurleads.com/tracker.js?id=${apiKey}" async></script>`;
  };

  const handleFormSuccess = () => {
    setShowCreateForm(false);
    setEditingClient(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="grid gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Websites</h1>
          <p className="text-gray-600">
            Manage your tracking scripts for multiple websites
          </p>
        </div>
        <Card className="p-6">
          <div className="text-center text-red-600">
            Failed to load websites. Please try again.
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Websites</h1>
          <p className="text-gray-600">
            Manage your tracking scripts for multiple websites
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

      {/* Create/Edit Form */}
      {(showCreateForm || editingClient) && (
        <Card className="p-6">
          <div className="mb-4">
            <h2 className="text-lg font-medium text-gray-900">
              {editingClient ? 'Edit Website' : 'Add New Website'}
            </h2>
            <p className="text-sm text-gray-600">
              {editingClient
                ? 'Update your website information'
                : 'Add a new website to start tracking visitors'}
            </p>
          </div>
          <WebsiteForm
            client={editingClient || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowCreateForm(false);
              setEditingClient(null);
            }}
          />
        </Card>
      )}

      {/* Websites List */}
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

                  {/* Tracking Script */}
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="mb-2">
                      <div className="text-xs text-gray-500 mb-1">
                        Tracking Script
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        Add this script to your website&apos;s &lt;head&gt;
                        section
                      </div>
                    </div>
                    <div className="bg-gray-900 text-gray-100 p-2 rounded text-xs font-mono overflow-x-auto">
                      <pre className="whitespace-pre-wrap">
                        {generateTrackingScript(client.apiKey)}
                      </pre>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              client.isActive ? 'bg-green-500' : 'bg-gray-400'
                            }`}
                          ></div>
                          <span className="text-xs text-gray-600">
                            {client.isActive
                              ? 'Script Active'
                              : 'Script Not Detected'}
                          </span>
                        </div>
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
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => checkScriptMutation.mutate(client.id)}
                    disabled={checkScriptMutation.isPending}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setEditingClient(client)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setDeletingClient(client)}
                    className="text-red-600 hover:text-red-800"
                  >
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

      {/* Delete Confirmation Modal */}
      {deletingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Delete Website
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete &quot;{deletingClient.name}&quot;?
              This will permanently remove all tracking data and cannot be
              undone.
            </p>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => handleDeleteClient(deletingClient)}
                disabled={deleteClientMutation.isPending}
              >
                {deleteClientMutation.isPending ? 'Deleting...' : 'Delete'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setDeletingClient(null)}
                disabled={deleteClientMutation.isPending}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
