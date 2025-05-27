'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Task as MockTask } from '@/mocks/tasks';
import taskService, { Task } from '@/services/taskService';
import projectService from '@/services/projectService';
import clientService from '@/services/clientService';

type TaskContextType = {
  tasks: Task[];
  projects: any[];
  clients: any[];
  view: 'table' | 'kanban' | 'gantt';
  setView: (view: 'table' | 'kanban' | 'gantt') => void;
  addTask: (task: Omit<Task, 'id'>) => Promise<Task>;
  updateTask: (id: number | string, updates: Partial<Task>) => Promise<Task | undefined>;
  deleteTask: (id: number | string) => Promise<void>;
  filterTasks: (filters: Record<string, any>) => Task[];
  loading: boolean;
  error: string | null;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export function TaskProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'table' | 'kanban' | 'gantt'>('table');
  
  // Use mock data instead of API calls
  useEffect(() => {
    const loadMockData = async () => {
      try {
        setLoading(true);
        
        // Load mock data
        const { mockTasks, mockProjects, mockClients } = require('@/mocks/tasks');
        
        // Convert mock tasks to API format
        const convertedTasks = mockTasks.map((task: MockTask) => {
          // Convert mock task format to API format
          let statusNum = 0;
          switch(task.status) {
            case 'todo': statusNum = 0; break;
            case 'in-progress': statusNum = 1; break;
            case 'review': statusNum = 2; break;
            case 'done': statusNum = 3; break;
          }
          
          let priorityNum = 0;
          switch(task.priority) {
            case 'low': priorityNum = 0; break;
            case 'medium': priorityNum = 1; break;
            case 'high': priorityNum = 2; break;
          }
          
          return {
            id: parseInt(task.id),
            name: task.title,
            description: task.description,
            status: statusNum,
            priority: priorityNum,
            due_date: task.dueDate,
            start_date: null,
            end_date: null,
            project_id: parseInt(task.project.id),
            parent_task_id: null,
            task_list_id: null,
            client_id: parseInt(task.client.id),
            assigned_to: parseInt(task.assignee.id),
            created_by: 1,
            order: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            // Add project data for UI display
            project: {
              id: parseInt(task.project.id),
              name: task.project.name,
              color: task.project.color
            },
            // UI-specific properties
            statusText: task.status,
            priorityText: task.priority,
            isCompleted: task.status === 'done'
          } as Task;
        });
        
        setTasks(convertedTasks);
        setProjects(mockProjects);
        setClients(mockClients);
        setLoading(false);
      } catch (err) {
        console.error('Error loading mock data:', err);
        setError('Failed to load data. Please try again later.');
        setLoading(false);
      }
    };

    loadMockData();
  }, []);
  
  // Helper functions for status and priority text
  const getStatusText = (status: number): string => {
    switch(status) {
      case 0: return 'todo';
      case 1: return 'in-progress';
      case 2: return 'review';
      case 3: return 'done';
      default: return 'todo';
    }
  };
  
  const getPriorityText = (priority: number): string => {
    switch(priority) {
      case 0: return 'low';
      case 1: return 'medium';
      case 2: return 'high';
      default: return 'medium';
    }
  };

  const addTask = async (task: Omit<Task, 'id'>) => {
    try {
      // Call the API to create a new task
      const response = await taskService.createTask(task);
      
      // Add UI-specific properties
      const newTask = {
        ...response,
        statusText: getStatusText(response.status),
        priorityText: getPriorityText(response.priority),
        isCompleted: response.status === 3
      };
      
      setTasks([...tasks, newTask]);
      return newTask;
    } catch (err) {
      console.error('Error adding task:', err);
      throw new Error('Failed to add task');
    }
  };

  const updateTask = async (id: number | string, updates: Partial<Task>) => {
    try {
      // Convert id to number if it's a string
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      
      // Call the API to update the task
      const response = await taskService.updateTask(numericId, updates);
      
      // Add UI-specific properties
      const updatedTask = {
        ...response,
        statusText: getStatusText(response.status),
        priorityText: getPriorityText(response.priority),
        isCompleted: response.status === 3
      };
      
      // Update the tasks array
      const updatedTasks = tasks.map((task) =>
        task.id === numericId ? updatedTask : task
      );
      
      setTasks(updatedTasks);
      return updatedTask;
    } catch (err) {
      console.error('Error updating task:', err);
      throw new Error('Failed to update task');
    }
  };

  const deleteTask = async (id: number | string) => {
    try {
      // Convert id to number if it's a string
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      
      // Call the API to delete the task
      await taskService.deleteTask(numericId);
      
      // Update the tasks array
      setTasks(tasks.filter((task) => task.id !== numericId));
    } catch (err) {
      console.error('Error deleting task:', err);
      throw new Error('Failed to delete task');
    }
  };

  const filterTasks = (filters: Record<string, any>) => {
    return tasks.filter((task) => {
      return Object.entries(filters).every(([key, value]) => {
        if (!value) return true;
        return task[key as keyof Task] === value;
      });
    });
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        projects,
        clients,
        view,
        setView,
        addTask,
        updateTask,
        deleteTask,
        filterTasks,
        loading,
        error,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
