'use client';

import React, { useState, useMemo, useEffect } from 'react';
import ClientsTable from './ClientsTable';
import { clientService } from '../../../services/clientService';
import type { Client } from '../../../types/client';
import { AngleDownIcon } from '../../../icons';
import PaginationWithIcon from '../../../components/tables/DataTables/TableOne/PaginationWithIcon';
import Button from '../../../components/ui/button/Button';
import { Modal } from '../../../components/ui/modal';
import AddClientForm from './AddClientForm';
import { useNotification } from '../../../context/NotificationContext';

const ClientComponent: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState<keyof Client>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | undefined>(undefined);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Use the notification context
  const { showNotification } = useNotification();

  const openModal = () => {
    setIsModalOpen(true);
  };
  
  const handleAddNew = () => {
    setEditingClient(undefined);
    openModal();
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleAddSuccess = () => {
    fetchClients();
  };

  const fetchClients = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching clients...');
      const clients = await clientService.getAll();
      console.log('Clients fetched:', clients);
      
      if (Array.isArray(clients)) {
        setClients(clients);
      } else {
        console.error('Received non-array clients data:', clients);
        setClients([]);
        throw new Error('Invalid client data format received');
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch clients');
      showNotification('error', error instanceof Error ? error.message : 'Failed to fetch clients');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [sortKey, sortOrder, searchTerm]);

  const handleSort = (key: keyof Client) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleEdit = (id: string) => {
    const clientToEdit = clients.find((client) => client.id === id);
    if (clientToEdit) {
      setEditingClient(clientToEdit);
      openModal();
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setIsSaving(true);
      await clientService.delete(id);
      setClients(prev => prev.filter(client => client.id !== id));
      showNotification('success', 'Client deleted successfully');
    } catch (error) {
      console.error('Error deleting client:', error);
      showNotification('error', error instanceof Error ? error.message : 'Failed to delete client');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (clientData: Partial<Client>) => {
    try {
      setIsSaving(true);
      console.log('Saving client data:', clientData);
      
      // Prepare client data with required fields
      const preparedData: Partial<Client> = {
        ...clientData,
        // Add default values for required fields that might be missing
        status: clientData.status || 'active',
      };
      
      // Add is_active property if needed (casting to avoid type errors)
      (preparedData as any).is_active = true;
      
      if (editingClient) {
        // Update existing client
        const updatedClient = await clientService.update(editingClient.id, preparedData);
        console.log('Client updated successfully:', updatedClient);
        // Refresh all clients from API
        await fetchClients();
        showNotification('success', 'Client updated successfully');
      } else {
        // Create new client
        const newClient = await clientService.create(preparedData);
        console.log('Client created successfully:', newClient);
        // Refresh all clients from API
        await fetchClients();
        showNotification('success', 'Client created successfully');
      }
      
      closeModal();
    } catch (error) {
      console.error('Error saving client:', error);
      showNotification('error', error instanceof Error ? error.message : 'Failed to save client');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredAndSortedData = useMemo(() => {
    // Guard against empty or invalid clients array
    if (!clients || !Array.isArray(clients) || clients.length === 0) {
      return [];
    }

    try {
      return clients
        .filter((client) => {
          if (!client) return false;
          
          // Safe filtering that handles null/undefined values
          try {
            return Object.keys(client).some(key => {
              const value = client[key as keyof Client];
              return value !== null && value !== undefined && 
                String(value).toLowerCase().includes(searchTerm.toLowerCase());
            });
          } catch (err) {
            console.error('Error filtering client:', err);
            return false;
          }
        })
        .sort((a, b) => {
          try {
            // Handle missing or undefined values
            const aValue = a[sortKey] || '';
            const bValue = b[sortKey] || '';
            
            return sortOrder === 'asc'
              ? String(aValue).localeCompare(String(bValue))
              : String(bValue).localeCompare(String(aValue));
          } catch (err) {
            console.error('Error sorting clients:', err);
            return 0;
          }
        });
    } catch (err) {
      console.error('Error in filteredAndSortedData:', err);
      return [];
    }
  }, [clients, searchTerm, sortKey, sortOrder]);
  
  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

  return (
    <>
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-gray-900">Clients</h2>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <button className="absolute text-gray-500 -translate-y-1/2 left-4 top-1/2 dark:text-gray-400">
                        <svg
                          className="fill-current"
                          width="20"
                          height="20"
                          viewBox="0 0 20 20"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                            fill="currentColor"
                          />
                        </svg>
                      </button>
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search clients..."
                        className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-11 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
                      />
                    </div>
                    <Button
                      variant="primary"
                      onClick={handleAddNew}
                      disabled={isSaving}
                    >
                      Add Client
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="relative overflow-x-auto mt-6">

                <ClientsTable
                  data={currentData}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  loading={isLoading}
                />

                <div className="mt-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    Showing {startIndex + 1} to {endIndex} of {totalItems} clients
                  </span>
                </div>
                
                <div className="mt-6">
                  <PaginationWithIcon
                    totalPages={totalPages}
                    initialPage={currentPage}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <h4 className="font-semibold text-gray-800 mb-7 text-title-sm dark:text-white/90">
          {editingClient ? 'Edit Client' : 'Add New Client'}
        </h4>
        <AddClientForm
          onClose={closeModal}
          initialData={editingClient}
          onSave={handleSave}
        />
      </Modal>
    </>
  );
};

export default ClientComponent;
