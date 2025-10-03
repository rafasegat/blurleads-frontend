'use client';

import {
  Check,
  ExternalLink,
  Settings,
  Zap,
  Mail,
  Slack,
  Chrome,
  Webhook,
} from 'lucide-react';
import {
  useIntegrations,
  useUpdateIntegration,
  useTestIntegration,
} from '@/hooks/use-integrations';
import { useClient } from '@/hooks/use-client';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

interface IntegrationDisplay {
  id: string;
  name: string;
  description: string;
  icon: JSX.Element;
  provider: string;
  category: 'crm' | 'email' | 'communication' | 'webhook';
  isConnected?: boolean;
  isEnabled?: boolean;
}

const INTEGRATION_METADATA: Record<
  string,
  Omit<IntegrationDisplay, 'id' | 'isConnected' | 'isEnabled'>
> = {
  salesforce: {
    name: 'Salesforce',
    description:
      'Automatically sync leads to Salesforce CRM and update contact records',
    icon: <Zap className="h-6 w-6 text-blue-600" />,
    provider: 'salesforce',
    category: 'crm',
  },
  hubspot: {
    name: 'HubSpot',
    description:
      'Send enriched leads to HubSpot and trigger automated workflows',
    icon: <Chrome className="h-6 w-6 text-orange-600" />,
    provider: 'hubspot',
    category: 'crm',
  },
  sendgrid: {
    name: 'SendGrid',
    description:
      'Send automated email notifications when new leads are identified',
    icon: <Mail className="h-6 w-6 text-blue-500" />,
    provider: 'sendgrid',
    category: 'email',
  },
  mailchimp: {
    name: 'Mailchimp',
    description: 'Add leads to Mailchimp lists and trigger email campaigns',
    icon: <Mail className="h-6 w-6 text-yellow-500" />,
    provider: 'mailchimp',
    category: 'email',
  },
  slack: {
    name: 'Slack',
    description:
      'Get real-time notifications in Slack when high-value leads appear',
    icon: <Slack className="h-6 w-6 text-purple-600" />,
    provider: 'slack',
    category: 'communication',
  },
  webhook: {
    name: 'Webhooks',
    description: 'Send lead data to custom endpoints via HTTP webhooks',
    icon: <Webhook className="h-6 w-6 text-gray-600" />,
    provider: 'webhook',
    category: 'webhook',
  },
};

export default function IntegrationsPage(): JSX.Element {
  console.log('[Integrations] Rendering integrations page');

  const { data: client } = useClient();
  const clientId = client?.id || '';

  const { data: backendData, isLoading, error } = useIntegrations(clientId);
  const updateIntegration = useUpdateIntegration();
  const testIntegration = useTestIntegration();

  const handleToggleIntegration = (
    integrationId: string,
    enabled: boolean
  ): void => {
    console.log('[Integrations] Toggling integration:', integrationId, enabled);
    updateIntegration.mutate({
      id: integrationId,
      isEnabled: enabled,
    });
  };

  const handleConnect = (integrationId: string): void => {
    console.log('[Integrations] Connecting integration:', integrationId);
    toast.info('Opening connection dialog...', {
      description: 'This will open the OAuth flow for the integration',
    });
  };

  const handleDisconnect = (integrationId: string): void => {
    console.log('[Integrations] Disconnecting integration:', integrationId);
    updateIntegration.mutate({
      id: integrationId,
      isEnabled: false,
    });
  };

  const handleTest = (integrationId: string): void => {
    console.log('[Integrations] Testing integration:', integrationId);
    testIntegration.mutate(integrationId);
  };

  const getIcon = (provider: string): JSX.Element => {
    const metadata = INTEGRATION_METADATA[provider.toLowerCase()];
    return metadata?.icon || <Zap className="h-6 w-6 text-blue-600" />;
  };

  const getCategoryLabel = (category: string): string => {
    const labels: Record<string, string> = {
      crm: 'CRM',
      email: 'Email Marketing',
      communication: 'Communication',
      webhook: 'Developer',
    };
    return labels[category] || category;
  };

  // Merge backend data with mockup metadata for display
  const integrations: IntegrationDisplay[] = Object.keys(
    INTEGRATION_METADATA
  ).map((key) => {
    const metadata = INTEGRATION_METADATA[key];
    const backendIntegration = Array.isArray(backendData)
      ? (backendData as any[]).find(
          (i: any) => i.provider?.toLowerCase() === key
        )
      : null;

    return {
      id: (backendIntegration as any)?.id || `mock-${key}`,
      ...metadata,
      isConnected: (backendIntegration as any)?.isConnected || false,
      isEnabled: (backendIntegration as any)?.isEnabled || false,
    };
  });

  // Group by category
  const groupedIntegrations = integrations.reduce((acc, integration) => {
    if (!acc[integration.category]) {
      acc[integration.category] = [];
    }
    acc[integration.category].push(integration);
    return acc;
  }, {} as Record<string, IntegrationDisplay[]>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Integrations</h1>
        <p className="text-muted-foreground">
          Connect BlurLeads with your favorite tools and services
        </p>
      </div>

      <Alert>
        <Zap className="h-4 w-4" />
        <AlertTitle>Pro Tip</AlertTitle>
        <AlertDescription>
          Connect multiple integrations to automatically distribute leads across
          your sales and marketing stack.
        </AlertDescription>
      </Alert>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-8 w-8 rounded" />
                <Skeleton className="h-4 w-32 mt-4" />
                <Skeleton className="h-3 w-full mt-2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-destructive font-medium">
            Failed to load integrations
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            {error instanceof Error ? error.message : 'Please try again'}
          </p>
          <p className="text-xs text-muted-foreground mt-4">
            Showing available integrations with mock data
          </p>
        </div>
      ) : null}

      <div className="space-y-8">
        {Object.entries(groupedIntegrations).map(
          ([category, categoryIntegrations]) => (
            <div key={category}>
              <h2 className="text-xl font-semibold mb-4">
                {getCategoryLabel(category)}
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categoryIntegrations.map((integration) => (
                  <Card key={integration.id} className="relative">
                    {integration.isConnected && (
                      <div className="absolute right-4 top-4">
                        <Badge variant="default" className="gap-1">
                          <Check className="h-3 w-3" />
                          Connected
                        </Badge>
                      </div>
                    )}
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        {integration.icon}
                        <div>
                          <CardTitle className="text-lg">
                            {integration.name}
                          </CardTitle>
                        </div>
                      </div>
                      <CardDescription>
                        {integration.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {integration.isConnected ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={integration.isEnabled}
                              onCheckedChange={(checked) =>
                                handleToggleIntegration(integration.id, checked)
                              }
                              disabled={integration.id.startsWith('mock-')}
                            />
                            <span className="text-sm font-medium">
                              {integration.isEnabled ? 'Enabled' : 'Disabled'}
                            </span>
                          </div>
                        </div>
                      ) : null}
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      {integration.isConnected ? (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleDisconnect(integration.id)}
                            disabled={integration.id.startsWith('mock-')}
                          >
                            Disconnect
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleTest(integration.id)}
                            disabled={integration.id.startsWith('mock-')}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          className="w-full"
                          onClick={() => handleConnect(integration.id)}
                        >
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Connect
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
