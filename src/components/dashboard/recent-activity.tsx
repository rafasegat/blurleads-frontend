'use client';

import { useQuery } from '@tanstack/react-query';
import { formatDate } from '@/lib/utils';
import {
  UserPlus,
  Mail,
  Zap,
  AlertCircle,
  CheckCircle,
  Clock,
} from 'lucide-react';

const activityIcons = {
  NEW_LEAD: UserPlus,
  ENRICHMENT_COMPLETE: CheckCircle,
  INTEGRATION_ERROR: AlertCircle,
  SYSTEM_ALERT: AlertCircle,
};

const activityColors = {
  NEW_LEAD: 'text-green-600 bg-green-100',
  ENRICHMENT_COMPLETE: 'text-blue-600 bg-blue-100',
  INTEGRATION_ERROR: 'text-red-600 bg-red-100',
  SYSTEM_ALERT: 'text-yellow-600 bg-yellow-100',
};

export function RecentActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['recent-activities'],
    queryFn: async () => {
      const response = await fetch('/api/notifications?limit=5');
      if (!response.ok) throw new Error('Failed to fetch activities');
      return response.json();
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="text-center py-6">
        <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity: any) => {
        const Icon =
          activityIcons[activity.type as keyof typeof activityIcons] || Clock;
        const colorClass =
          activityColors[activity.type as keyof typeof activityColors] ||
          'text-gray-600 bg-gray-100';

        return (
          <div key={activity.id} className="flex items-start space-x-3">
            <div
              className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${colorClass}`}
            >
              <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900">
                {activity.title}
              </p>
              <p className="text-sm text-gray-500">{activity.message}</p>
              <p className="text-xs text-gray-400 mt-1">
                {formatDate(activity.createdAt)}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
