'use client';

import React, { useState } from 'react';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';
import { Client } from '../../../types/client';
import { clientService } from '../../../services/clientService';

interface AddClientFormProps {
  onClose: () => void;
  initialData?: Client;
  onSave: (formData: Partial<Client>) => void;
}

const AddClientForm: React.FC<AddClientFormProps> = ({ onClose, initialData, onSave }) => {
  const [formData, setFormData] = useState<Partial<Client>>(() => {
    if (initialData) {
      console.log('Initializing with client data:', initialData);
      return { ...initialData };
    }
    return {
      id: '',
      name: '',
      email: '',
      phone: '',
      address: '',
      status: 'active',
      logo: '',
      is_active: true,
      slug: '',
      created_at: '',
      updated_at: ''
    };
  });
  
  const handleSubmit = () => {
    onSave(formData);
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Client Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          defaultValue={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          type="email"
          id="email"
          name="email"
          defaultValue={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          type="tel"
          id="phone"
          name="phone"
          defaultValue={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="address">Address</Label>
        <Input
          type="text"
          id="address"
          name="address"
          defaultValue={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' }
          ]}
          onChange={(value) => setFormData({ ...formData, status: value as 'active' | 'inactive' })}
          placeholder="Select status"
          defaultValue={formData.status}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Logo URL</Label>
        <Input
          type="url"
          id="logo"
          name="logo"
          defaultValue={formData.logo}
          onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
        />
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          variant="outline"
          onClick={onClose}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
        >
          {initialData ? 'Update Client' : 'Create Client'}
        </Button>
      </div>
    </form>
  );
};

export default AddClientForm;
