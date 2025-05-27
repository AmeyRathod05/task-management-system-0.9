import api from './api';
import axios from 'axios';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  logo: string;
  slug: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ClientFilters {
  page?: number;
  per_page?: number;
  sortKey?: keyof Client;
  sortOrder?: 'asc' | 'desc';
  searchTerm?: string;
}

export const clientService = {
  /**
   * Get all clients
   * @returns Promise with client data
   */
  getAll: async (): Promise<Client[]> => {
    try {
      console.log('Fetching clients from API...');
      // Try with the correct API endpoint path
      // The API URL is: http://192.168.0.134:8000/api
      // So we need to make sure we're using the right endpoint path
      const response = await api.get('/admin/clients');
      console.log('API Response:', response);
      
      // Check if the response has the expected structure
      let clientsData: Client[] = [];
      
      if (response.data && Array.isArray(response.data.data)) {
        clientsData = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Handle case where API might return array directly
        clientsData = response.data;
      } else if (response.data && typeof response.data === 'object') {
        // Handle case where API might return object with clients
        clientsData = response.data.clients || response.data.data || [];
      } else {
        console.error('Unexpected API response format:', response.data);
        return [];
      }
      
      // Ensure all client objects have the required fields with proper defaults
      return clientsData.map(client => ({
        id: client.id || '',
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
        status: client.status || 'inactive',
        logo: client.logo || '',
        slug: client.slug || '',
        is_active: client.is_active ?? true,
        created_at: client.created_at || new Date().toISOString(),
        updated_at: client.updated_at || new Date().toISOString()
      }));
    } catch (error) {
      console.error('Error fetching clients:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
        throw new Error(error.response?.data?.message || `Failed to fetch clients: ${error.message}`);
      }
      throw new Error(`Failed to fetch clients: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Get a single client by ID
   * @param id Client ID
   * @returns Promise with client data
   */
  getById: async (id: string): Promise<Client> => {
    try {
      const response = await api.get(`/admin/clients/${id}`);
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Client not found');
      }
      throw new Error('Failed to fetch client');
    }
  },

  /**
   * Create a new client
   * @param clientData Client data to create
   * @returns Promise with created client data
   */
  create: async (clientData: Partial<Client>): Promise<Client> => {
    try {
      console.log('Creating client with data:', clientData);
      
      // Ensure all required fields are present
      const requiredFields = ['name', 'email', 'status'];
      for (const field of requiredFields) {
        if (!clientData[field as keyof Partial<Client>]) {
          throw new Error(`Missing required field: ${field}`);
        }
      }
      
      const response = await api.post('/admin/clients', clientData);
      console.log('Client creation response:', response);
      
      // Handle different response formats
      let clientResponse: Client;
      
      if (response.data?.data) {
        clientResponse = response.data.data;
      } else if (response.data && typeof response.data === 'object') {
        clientResponse = response.data;
      } else {
        throw new Error('Invalid response format from server');
      }
      
      // Ensure the returned client has all required fields
      return {
        id: clientResponse.id || '',
        name: clientResponse.name || clientData.name || '',
        email: clientResponse.email || clientData.email || '',
        phone: clientResponse.phone || clientData.phone || '',
        address: clientResponse.address || clientData.address || '',
        status: clientResponse.status || clientData.status || 'active',
        logo: clientResponse.logo || clientData.logo || '',
        slug: clientResponse.slug || '',
        is_active: clientResponse.is_active !== undefined ? clientResponse.is_active : true,
        created_at: clientResponse.created_at || new Date().toISOString(),
        updated_at: clientResponse.updated_at || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error creating client:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
        
        // Handle validation errors (422 status code)
        if (error.response?.status === 422) {
          const responseData = error.response.data;
          
          // Check for validation errors in different formats
          if (responseData.errors) {
            // Laravel validation error format
            const errorMessages = [];
            for (const field in responseData.errors) {
              errorMessages.push(responseData.errors[field].join(', '));
            }
            throw new Error(errorMessages.join('\n'));
          } else if (responseData.message) {
            // Simple message format
            throw new Error(responseData.message);
          } else if (typeof responseData === 'string') {
            throw new Error(responseData);
          }
        }
        
        // For other errors
        throw new Error(error.response?.data?.message || `Failed to create client: ${error.message}`);
      }
      throw new Error(`Failed to create client: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Update an existing client
   * @param id Client ID
   * @param clientData Client data to update
   * @returns Promise with updated client data
   */
  update: async (id: string, clientData: Partial<Client>): Promise<Client> => {
    try {
      console.log('Updating client with data:', clientData);
      const response = await api.put(`/admin/clients/${id}`, clientData);
      console.log('Client update response:', response);
      return response.data.data;
    } catch (error) {
      console.error('Error updating client:', error);
      if (axios.isAxiosError(error)) {
        console.error('API Error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          url: error.config?.url
        });
        
        // Handle validation errors (422 status code)
        if (error.response?.status === 422) {
          const responseData = error.response.data;
          
          // Check for validation errors in different formats
          if (responseData.errors) {
            // Laravel validation error format
            const errorMessages = [];
            for (const field in responseData.errors) {
              errorMessages.push(responseData.errors[field].join(', '));
            }
            throw new Error(errorMessages.join('\n'));
          } else if (responseData.message) {
            // Simple message format
            throw new Error(responseData.message);
          } else if (typeof responseData === 'string') {
            throw new Error(responseData);
          }
        }
        
        throw new Error(error.response?.data?.message || `Failed to update client: ${error.message}`);
      }
      throw new Error(`Failed to update client: ${error instanceof Error ? error.message : String(error)}`);
    }
  },

  /**
   * Delete a client
   * @param id Client ID
   * @returns Promise with deleted client data
   */
  delete: async (id: string): Promise<void> => {
    try {
      await api.delete(`/admin/clients/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete client');
      }
      throw new Error('Failed to delete client');
    }
  },

  /**
   * Update client status
   * @param id Client ID
   * @param status New status
   * @returns Promise with updated client data
   */
  updateStatus: async (id: string, status: string): Promise<Client> => {
    try {
      const response = await api.patch(`/admin/clients/${id}/status`, { status });
      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update client status');
      }
      throw new Error('Failed to update client status');
    }
  },
};

export default clientService;