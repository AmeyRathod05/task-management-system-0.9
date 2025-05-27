import React, { useState } from 'react';
import Button from '../../../components/ui/button/Button';
import { Modal } from '../../../components/ui/modal';
import { Input } from '../../../components/ui/input/Input';
import { Label } from '../../../components/ui/label/Label';
import { useForm } from 'react-hook-form';
import { Client } from '../../../types/client';

interface ClientFormValues {
  name: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
  logo: string;
}

interface AddClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (client: Client) => void;
  editingClient?: Client;
}

const defaultValues: ClientFormValues = {
  name: '',
  email: '',
  phone: '',
  address: '',
  status: 'active',
  logo: '',
};

export const AddClientModal: React.FC<AddClientModalProps> = ({ isOpen, onClose, onSave, editingClient }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [notificationMessage, setNotificationMessage] = useState('');

  const form = useForm<ClientFormValues>({
    defaultValues: {
      name: editingClient?.name || '',
      email: editingClient?.email || '',
      phone: editingClient?.phone || '',
      address: editingClient?.address || '',
      status: editingClient?.status || 'active',
      logo: editingClient?.logo || '',
    },
  });

  const onSubmit = async (values: ClientFormValues) => {
    try {
      setIsSaving(true);
      setError(null);

      const clientData: Partial<Client> = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        address: values.address,
        status: values.status,
        logo: values.logo,
      };

      onSave(clientData as Client);
      setShowNotification(true);
      setNotificationType('success');
      setNotificationMessage(editingClient ? 'Client updated successfully!' : 'Client added successfully!');
      form.reset();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save client');
      setShowNotification(true);
      setNotificationType('error');
      setNotificationMessage(err instanceof Error ? err.message : 'Failed to save client');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="max-w-[425px] p-6">
        <h3 className="text-lg font-medium mb-4">{editingClient ? 'Edit Client' : 'Add New Client'}</h3>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Client Name *</Label>
            <Input
              id="name"
              {...form.register('name', {
                required: 'Client name is required',
                minLength: {
                  value: 2,
                  message: 'Client name must be at least 2 characters',
                },
              })}
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              {...form.register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: 'Invalid email address',
                },
              })}
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              {...form.register('phone', {
                required: 'Phone number is required',
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: 'Phone number must be 10 digits',
                },
              })}
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-500">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              {...form.register('address', {
                required: 'Address is required',
              })}
            />
            {form.formState.errors.address && (
              <p className="text-sm text-red-500">{form.formState.errors.address.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <select
              id="status"
              {...form.register('status', {
                required: 'Status is required',
              })}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            {form.formState.errors.status && (
              <p className="text-sm text-red-500">{form.formState.errors.status.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              type="url"
              {...form.register('logo')}
            />
            {form.formState.errors.logo && (
              <p className="text-sm text-red-500">{form.formState.errors.logo.message}</p>
            )}
          </div>

          {error && (
            <div className="text-sm text-red-500">{error}</div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              onClick={() => form.handleSubmit(onSubmit)()}
              disabled={isSaving || !form.formState.isValid}
              variant="primary"
              className="w-full sm:w-auto"
            >
              {isSaving ? 'Saving...' : editingClient ? 'Update' : 'Add Client'}
            </Button>
          </div>
          
          {showNotification && (
            <div className={`mt-4 p-4 rounded-md ${
              notificationType === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}>
              {notificationMessage}
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};
