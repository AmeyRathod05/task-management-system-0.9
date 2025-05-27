'use client';

import React, { useState, useEffect } from 'react';
import { Task as TaskType } from '@/services/taskService';
import Button from '@/components/ui/button/Button';
import Input from '@/components/form/input/InputField';
import Label from '@/components/form/Label';

interface AddTaskFormProps {
  onClose: () => void;
  onSave: (data: any) => void;
  initialData?: TaskType;
  isLoading?: boolean;
}

const AddTaskForm: React.FC<AddTaskFormProps> = ({
  onClose,
  onSave,
  initialData,
  isLoading = false
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 0, // 0: To Do, 1: In Progress, 2: Done
    priority: 1, // 0: Low, 1: Medium, 2: High
    start_date: new Date().toISOString().split('T')[0],
    due_date: '',
    end_date: '',
    project_id: null,
    parent_task_id: null,
    task_list_id: null,
    client_id: null,
    assigned_to: null,
    created_by: 1
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        status: initialData.status || 0,
        priority: initialData.priority || 1,
        start_date: initialData.start_date || new Date().toISOString().split('T')[0],
        due_date: initialData.due_date || '',
        end_date: initialData.end_date || '',
        project_id: initialData.project_id || null,
        parent_task_id: initialData.parent_task_id || null,
        task_list_id: initialData.task_list_id || null,
        client_id: initialData.client_id || null,
        assigned_to: initialData.assigned_to || null,
        created_by: initialData.created_by || 1
      });
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, type, value } = target;
    
    // Handle different input types
    let newValue: string | number | null;
    
    if (type === 'date') {
      newValue = value || null;
    } else if (type === 'number' || name === 'status' || name === 'priority') {
      newValue = value ? parseInt(value, 10) : 0;
    } else {
      newValue = value;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name?.trim()) {
      setErrors(prev => ({ ...prev, name: 'Task name is required' }));
      return;
    }
    
    // Prepare task data matching backend schema
    const taskData = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      status: formData.status,
      priority: formData.priority,
      start_date: formData.start_date || null,
      due_date: formData.due_date || null,
      end_date: formData.end_date || null,
      project_id: formData.project_id,
      parent_task_id: formData.parent_task_id,
      task_list_id: formData.task_list_id,
      client_id: formData.client_id,
      assigned_to: formData.assigned_to,
      created_by: formData.created_by
    };
    
    onSave(taskData);
  };

  const handleButtonClick = () => {
    // Validate required fields
    if (!formData.name?.trim()) {
      setErrors(prev => ({ ...prev, name: 'Task name is required' }));
      return;
    }
    
    // If we get here, form is valid
    handleSubmit(new Event('submit') as unknown as React.FormEvent);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" key={initialData ? initialData.id : 'new-task'}>
      <div className="space-y-2">
        <Label htmlFor="name">Task Name *</Label>
        <Input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={!!errors.name}
          required
          className="w-full"
        />
        {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value={0}>To Do</option>
            <option value={1}>In Progress</option>
            <option value={2}>Done</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority">Priority</Label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full rounded-lg border border-gray-300 bg-transparent px-3 py-2 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:focus:border-brand-800"
          >
            <option value={0}>Low</option>
            <option value={1}>Medium</option>
            <option value={2}>High</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Input
            type="date"
            id="start_date"
            name="start_date"
            value={formData.start_date}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="due_date">Due Date</Label>
          <Input
            type="date"
            id="due_date"
            name="due_date"
            value={formData.due_date}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="end_date">End Date</Label>
        <Input
          type="date"
          id="end_date"
          name="end_date"
          value={formData.end_date}
          onChange={handleChange}
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
          variant="primary"
          disabled={isLoading}
          onClick={handleButtonClick}
        >
          {isLoading ? 'Saving...' : (initialData ? 'Update Task' : 'Create Task')}
        </Button>
      </div>
    </form>
  );
};

export default AddTaskForm;
