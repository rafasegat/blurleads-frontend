'use client';

import { useState } from 'react';
import { formatDate, truncateText } from '@/lib/utils';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Building,
} from 'lucide-react';

interface Lead {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  company?: string;
  title?: string;
  phone?: string;
  location?: string;
  score: number;
  status: string;
  createdAt: string;
  linkedinUrl?: string;
  website?: string;
}

interface LeadsTableProps {
  leads: Lead[];
  compact?: boolean;
}

export function LeadsTable({ leads, compact = false }: LeadsTableProps) {
  const [sortField, setSortField] = useState<keyof Lead>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-100 text-blue-800';
      case 'CONTACTED':
        return 'bg-yellow-100 text-yellow-800';
      case 'QUALIFIED':
        return 'bg-green-100 text-green-800';
      case 'CONVERTED':
        return 'bg-purple-100 text-purple-800';
      case 'LOST':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (leads.length === 0) {
    return (
      <div className="text-center py-8">
        <Building className="h-8 w-8 text-gray-400 mx-auto mb-2" />
        <p className="text-gray-500">No leads found</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('firstName')}
            >
              <div className="flex items-center space-x-1">
                <span>Name</span>
                {sortField === 'firstName' &&
                  (sortDirection === 'asc' ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  ))}
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('company')}
            >
              <div className="flex items-center space-x-1">
                <span>Company</span>
                {sortField === 'company' &&
                  (sortDirection === 'asc' ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  ))}
              </div>
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Contact
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('score')}
            >
              <div className="flex items-center space-x-1">
                <span>Score</span>
                {sortField === 'score' &&
                  (sortDirection === 'asc' ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  ))}
              </div>
            </th>
            <th
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center space-x-1">
                <span>Status</span>
                {sortField === 'status' &&
                  (sortDirection === 'asc' ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  ))}
              </div>
            </th>
            {!compact && (
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('createdAt')}
              >
                <div className="flex items-center space-x-1">
                  <span>Created</span>
                  {sortField === 'createdAt' &&
                    (sortDirection === 'asc' ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    ))}
                </div>
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {leads.map((lead) => (
            <tr key={lead.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700">
                      {lead.firstName?.[0] || '?'}
                    </span>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {lead.firstName && lead.lastName
                        ? `${lead.firstName} ${lead.lastName}`
                        : lead.firstName || lead.lastName || 'Unknown'}
                    </div>
                    {lead.title && (
                      <div className="text-sm text-gray-500">{lead.title}</div>
                    )}
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {lead.company || 'Unknown'}
                </div>
                {lead.location && (
                  <div className="text-sm text-gray-500 flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {lead.location}
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="space-y-1">
                  {lead.email && (
                    <div className="flex items-center text-sm text-gray-900">
                      <Mail className="h-3 w-3 mr-2" />
                      <a
                        href={`mailto:${lead.email}`}
                        className="hover:text-primary-600"
                      >
                        {truncateText(lead.email, 20)}
                      </a>
                    </div>
                  )}
                  {lead.phone && (
                    <div className="flex items-center text-sm text-gray-500">
                      <Phone className="h-3 w-3 mr-2" />
                      <a
                        href={`tel:${lead.phone}`}
                        className="hover:text-primary-600"
                      >
                        {lead.phone}
                      </a>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`text-sm font-medium ${getScoreColor(lead.score)}`}
                >
                  {lead.score}/100
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                    lead.status
                  )}`}
                >
                  {lead.status}
                </span>
              </td>
              {!compact && (
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(lead.createdAt)}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
