'use client';

import React, { useState } from 'react';
import { AngleDownIcon, AngleUpIcon } from '@/icons';

import { Client } from '../../../types/client';

interface ClientsTableProps {
  data: Client[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => Promise<void>;
  loading: boolean;
}

const columns = [
  { key: 'name', label: 'Client Name' },
  { key: 'email', label: 'Email' },
  { key: 'phone', label: 'Phone' },
  { key: 'address', label: 'Address' },
  { key: 'status', label: 'Status' },
  { key: 'created_at', label: 'Created At' },
  { key: 'actions', label: 'Actions' },
] as const;

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const StatusBadge: React.FC<{ status?: 'active' | 'inactive' }> = ({ status }) => {
  // Handle undefined or null status
  const displayStatus = status || 'inactive';
  
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
      displayStatus === 'active' 
        ? 'bg-green-100 text-green-800' 
        : 'bg-gray-100 text-gray-800'
    }`}>
      {displayStatus.charAt(0).toUpperCase() + displayStatus.slice(1)}
    </span>
  );
};

const ClientsTable: React.FC<ClientsTableProps> = ({ 
  data: clients, 
  onEdit, 
  onDelete,
  loading 
}) => {
  const [sortKey, setSortKey] = useState<keyof Client>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: keyof Client) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Safely sort clients with error handling
  const sortedClients = React.useMemo(() => {
    if (!clients || !Array.isArray(clients) || clients.length === 0) {
      return [];
    }
    
    try {
      return [...clients].sort((a, b) => {
        // Handle missing or undefined values
        const aValue = a[sortKey] || '';
        const bValue = b[sortKey] || '';
        
        if (aValue === bValue) return 0;
        
        const modifier = sortOrder === 'asc' ? 1 : -1;
        
        // Use safe string comparison
        return String(aValue).localeCompare(String(bValue)) * modifier;
      });
    } catch (error) {
      console.error('Error sorting clients:', error);
      return [...clients]; // Return unsorted if sorting fails
    }
  }, [clients, sortKey, sortOrder]);

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (clients.length === 0) {
    return (
      <div className="p-4 text-gray-600 text-center">
        No clients found
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white shadow">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.key !== 'actions' ? (
                    <button
                      onClick={() => handleSort(column.key as keyof Client)}
                      className="flex items-center font-medium text-gray-700 hover:text-gray-900"
                    >
                      {column.label}
                      {sortKey === column.key && (
                        <span className="ml-1">
                          {sortOrder === 'asc' ? (
                            <AngleUpIcon className="w-4 h-4" />
                          ) : (
                            <AngleDownIcon className="w-4 h-4" />
                          )}
                        </span>
                      )}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedClients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {client.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.email}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {client.phone || '-'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                  {client.address || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={client.status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(client.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-3">
                    <button
                      onClick={() => onEdit(client.id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={async () => {
                        if (window.confirm('Are you sure you want to delete this client?')) {
                          try {
                            await onDelete(client.id);
                          } catch (err) {
                            console.error('Error deleting client:', err);
                          }
                        }
                      }}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ClientsTable;
