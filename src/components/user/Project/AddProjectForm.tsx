'use client';

import React, { useState, useEffect } from 'react';
import { Project } from '@/types/project';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';
import Select from '@/components/form/Select';

interface AddProjectFormProps {
  onClose: () => void;
  initialData?: Project;
  onSave: (dataToSubmit: Project) => Promise<boolean> | void;
  isSaving?: boolean;
}

const AddProjectForm: React.FC<AddProjectFormProps> = ({ 
  onClose, 
  initialData, 
  onSave,
  isSaving = false 
}) => {

  const statusOptions = [
    { value: 'active', label: 'Active' },
    { value: 'completed', label: 'Completed' },
    { value: 'archived', label: 'Archived' },
  ];

  const [formData, setFormData] = useState<Omit<Project, 'id' | 'created_at' | 'updated_at'> & { id?: string }>(() => {
    if (initialData) {
      const { id, created_at, updated_at, ...rest } = initialData;
      return rest;
    }
    return {
      name: '',
      description: '',
      status: 'active',
      start_date: new Date().toISOString().split('T')[0],
      end_date: null,
      client_id: '1' // Default client_id, you can change this to a config value if needed
    };
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;
    
    try {
      // Ensure client_id is set before submission
      const dataToSubmit: Project = {
        ...formData,
        id: initialData?.id,
        status: formData.status as 'active' | 'completed' | 'archived' | 'pending',
        client_id: formData.client_id || '1', // Fallback to default if not set
        created_at: initialData?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      // Call the onSave callback with the form data
      const result = await onSave(dataToSubmit);
      
      // If the save was successful, the parent component will handle the rest
      return result;
    } catch (error) {
      console.error('Error saving project:', error);
      return false;
    }
  };

  // Update form data when initialData changes
  useEffect(() => {
    if (initialData) {
      const { id, created_at, updated_at, ...rest } = initialData;
      setFormData(rest);
    }
  }, [initialData]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Project Name</Label>
        <Input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={isSaving}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ''}
          onChange={handleChange}
          className="w-full p-2 border rounded"
          rows={3}
          disabled={isSaving}
        />
      </div>

      <div>
        <Label htmlFor="status">Status</Label>
        <div className={isSaving ? 'opacity-50' : ''}>
          <Select
            options={statusOptions}
            defaultValue={formData.status}
            onChange={(value) => setFormData(prev => ({ ...prev, status: value as Project['status'] }))}
            placeholder="Select status"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            id="start_date"
            name="start_date"
            type="date"
            value={formData.start_date}
            onChange={handleChange}
            required
            disabled={isSaving}
          />
        </div>
        <div>
          <Label htmlFor="end_date">End Date (Optional)</Label>
          <Input
            id="end_date"
            name="end_date"
            type="date"
            value={formData.end_date || ''}
            onChange={handleChange}
            disabled={isSaving}
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onClose}
          disabled={isSaving}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="primary"
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : (initialData ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
};

export default AddProjectForm;