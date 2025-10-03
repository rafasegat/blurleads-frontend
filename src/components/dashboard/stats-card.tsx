'use client';

import { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  loading?: boolean;
  className?: string;
}

export function StatsCard({
  title,
  value,
  icon: Icon,
  trend,
  loading = false,
  className,
}: StatsCardProps) {
  if (loading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-1/4"></div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && (
            <p
              className={cn(
                'text-sm',
                trend > 0
                  ? 'text-green-600'
                  : trend < 0
                  ? 'text-red-600'
                  : 'text-gray-500'
              )}
            >
              {trend > 0 ? '+' : ''}
              {trend}% from last month
            </p>
          )}
        </div>
        <div className="h-12 w-12 rounded-lg bg-primary-100 flex items-center justify-center">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>
      </div>
    </Card>
  );
}
