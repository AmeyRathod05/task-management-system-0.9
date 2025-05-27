'use client';

import { useTasks } from '@/context/TaskContext';
import { Task as TaskType, TaskList } from '@/services/taskService';
import { useEffect, useState } from 'react';

/**
 * This adapter connects our mock data from TaskContext to the Task component
 */
export const useMockTasks = (): {
  tasks: TaskType[];
  loading: boolean;
  error: string | null;
  addTask: (task: Omit<TaskType, 'id'>) => Promise<TaskType>;
  updateTask: (id: string, task: Partial<TaskType>) => Promise<TaskType>;
  deleteTask: (id: string) => Promise<boolean>;
  getTaskList: (page: number, limit: number) => Promise<TaskList>;
} => {
  const { tasks: mockTasks, projects: mockProjects, updateTask: updateContextTask, deleteTask: deleteContextTask } = useTasks();
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert mock tasks to TaskType format expected by the component
  useEffect(() => {
    try {
      const convertedTasks: TaskType[] = mockTasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate,
        assigneeId: task.assignee.id,
        assigneeName: task.assignee.name,
        assigneeAvatar: task.assignee.avatar || '',
        projectId: task.project.id,
        projectName: task.project.name,
        projectColor: task.project.color,
        clientId: task.client.id,
        clientName: task.client.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin',
        attachments: [],
        comments: [],
        tags: [],
        estimatedHours: Math.floor(Math.random() * 20) + 1,
        actualHours: Math.floor(Math.random() * 15),
        isCompleted: task.status === 'done'
      }));
      
      setTasks(convertedTasks);
      setLoading(false);
    } catch (err) {
      setError('Error loading task data');
      setLoading(false);
    }
  }, [mockTasks]);

  // Mock API functions
  const addTask = async (task: Omit<TaskType, 'id'>): Promise<TaskType> => {
    const newTask = {
      ...task,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as TaskType;
    
    setTasks(prev => [...prev, newTask]);
    return newTask;
  };

  const updateTask = async (id: string, taskUpdates: Partial<TaskType>): Promise<TaskType> => {
    const updatedTasks = tasks.map(task => 
      task.id === id 
        ? { ...task, ...taskUpdates, updatedAt: new Date().toISOString() } 
        : task
    );
    
    setTasks(updatedTasks);
    
    // Also update the task in the context
    const originalTask = mockTasks.find(t => t.id === id);
    if (originalTask) {
      const updates: any = {};
      
      if (taskUpdates.title) updates.title = taskUpdates.title;
      if (taskUpdates.description) updates.description = taskUpdates.description;
      if (taskUpdates.status) updates.status = taskUpdates.status;
      if (taskUpdates.priority) updates.priority = taskUpdates.priority;
      if (taskUpdates.dueDate) updates.dueDate = taskUpdates.dueDate;
      
      updateContextTask(id, { ...originalTask, ...updates });
    }
    
    const updatedTask = updatedTasks.find(t => t.id === id);
    if (!updatedTask) {
      throw new Error('Task not found');
    }
    
    return updatedTask;
  };

  const deleteTask = async (id: string): Promise<boolean> => {
    setTasks(prev => prev.filter(task => task.id !== id));
    deleteContextTask(id);
    return true;
  };

  const getTaskList = async (page: number, limit: number): Promise<TaskList> => {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTasks = tasks.slice(startIndex, endIndex);
    
    return {
      tasks: paginatedTasks,
      total: tasks.length,
      page,
      limit,
      totalPages: Math.ceil(tasks.length / limit)
    };
  };

  return { 
    tasks, 
    loading, 
    error, 
    addTask, 
    updateTask, 
    deleteTask,
    getTaskList
  };
};
