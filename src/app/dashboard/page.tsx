'use client';

import React, { useState } from 'react';
import {
  Users,
  TrendingUp,
  Target,
  Zap,
  Code,
  Copy,
  X,
  Globe,
  Plus,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { LeadsTable } from '@/components/leads/leads-table';
import { StatsCard } from '@/components/dashboard/stats-card';
import { RecentActivity } from '@/components/dashboard/recent-activity';
import { useLeads, useLeadStats } from '@/hooks/use-leads';
import { useTrackingStats } from '@/hooks/use-tracking';
import {
  useClient,
  useApiKey,
  useCreateClient,
  useClients,
} from '@/hooks/use-client';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

export default function DashboardPage() {
  const {
    data: clients,
    isLoading: clientsLoading,
    error: clientsError,
  } = useClients();

  // Get the first client for stats (legacy compatibility)
  const firstClient = clients?.[0];
  const clientId = firstClient?.id || '';
  const apiKey = firstClient?.apiKey || '';

  const { data: stats, isLoading: statsLoading } = useLeadStats(clientId);
  const { data: leadsData, isLoading: leadsLoading } = useLeads(clientId);
  const { data: trackingStats } = useTrackingStats(clientId);

  // Show loading state while clients are being fetched
  if (clientsLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-96 mt-2" />
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <div className="p-6">
                <Skeleton className="h-16 w-full" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          Welcome back! Manage your websites and track leads across multiple
          sites.
        </p>
      </div>

      {/* Websites Overview */}
      {clients && clients.length > 0 ? (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-medium text-gray-900">
                Your Websites
              </h2>
              <p className="text-sm text-gray-600">
                Manage your tracking scripts and view website analytics
              </p>
            </div>
            <Link href="/dashboard/websites">
              <Button variant="outline" className="flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Manage Websites
              </Button>
            </Link>
          </div>

          <div className="grid gap-3">
            {clients.slice(0, 3).map((client: any) => (
              <div
                key={client.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
              >
                <div className="flex items-center gap-3">
                  <Globe className="h-4 w-4 text-blue-600" />
                  <div>
                    <div className="font-medium text-gray-900">
                      {client.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {client.website}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={client.isActive ? 'default' : 'secondary'}>
                    {client.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                  {client._count && (
                    <span className="text-sm text-gray-500">
                      {client._count.leads} leads
                    </span>
                  )}
                </div>
              </div>
            ))}
            {clients.length > 3 && (
              <div className="text-center text-sm text-gray-500 pt-2">
                And {clients.length - 3} more websites...
              </div>
            )}
          </div>
        </Card>
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
          <Link href="/dashboard/websites">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Website
            </Button>
          </Link>
        </Card>
      )}

      {/* Stats Grid - Only show if we have clients */}
      {clients && clients.length > 0 && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Leads"
            value={(stats as any)?.total || 0}
            icon={Users}
            trend={(stats as any)?.growth || 0}
            loading={statsLoading}
          />
          <StatsCard
            title="Conversion Rate"
            value={`${(stats as any)?.conversionRate || 0}%`}
            icon={Target}
            trend={(stats as any)?.conversionTrend || 0}
            loading={statsLoading}
          />
          <StatsCard
            title="Avg. Lead Score"
            value={(stats as any)?.avgScore || 0}
            icon={TrendingUp}
            trend={(stats as any)?.scoreTrend || 0}
            loading={statsLoading}
          />
          <StatsCard
            title="Active Integrations"
            value={(stats as any)?.activeIntegrations || 0}
            icon={Zap}
            loading={statsLoading}
          />
        </div>
      )}

      {/* Recent Leads and Activity - Only show if we have clients */}
      {clients && clients.length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Leads */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Leads
              </h3>
              {leadsLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <LeadsTable
                  leads={leadsData?.leads?.slice(0, 5) || []}
                  compact
                />
              )}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Recent Activity
              </h3>
              <RecentActivity />
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
