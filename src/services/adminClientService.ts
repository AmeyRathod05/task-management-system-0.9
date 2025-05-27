import api from './api';
import { Client } from './clientService';

interface CreateClient {
  name: string;
  email: string;
  phone: string;
  address: string;
  status?: 'active' | 'inactive';
  logo?: string;
}

interface UpdateClient extends Partial<CreateClient> {}

export class AdminClientService {
  // Get all clients
  async getAll(): Promise<Client[]> {
    const response = await api.get('/admin/clients');
    return response.data;
  }

  // Get a single client by ID
  async getById(id: string): Promise<Client> {
    const response = await api.get(`/admin/clients/${id}`);
    return response.data;
  }

  // Create a new client
  async create(client: CreateClient): Promise<Client> {
    const response = await api.post('/admin/clients', client);
    return response.data;
  }

  // Update an existing client
  async update(id: string, client: UpdateClient): Promise<Client> {
    const response = await api.put(`/admin/clients/${id}`, client);
    return response.data;
  }

  // Delete a client
  async delete(id: string): Promise<void> {
    await api.delete(`/admin/clients/${id}`);
  }
}

export const adminClientService = new AdminClientService();
