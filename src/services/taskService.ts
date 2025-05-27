import api from './api';
import axios from 'axios';

export interface Task {
  id: number;
  name: string;
  description: string;
  status: number; // 0: To Do, 1: In Progress, 2: Done
  priority: number; // 0: Low, 1: Medium, 2: High
  due_date: string | null;
  start_date: string | null;
  end_date: string | null;
  project_id: number | null;
  parent_task_id: number | null;
  task_list_id: number | null;
  client_id: number | null;
  assigned_to: number | null;
  created_by: number;
  order: number;
  created_at: string;
  updated_at: string;
  project?: {
    id: number;
    name: string;
  } | null;
  parent?: {
    id: number;
    name: string;
  } | null;
  taskList?: {
    id: number;
    name: string;
  } | null;
  // Frontend only properties
  isSubtask?: boolean;
  subtasks?: Task[];
}

export interface SubTask extends Task {
  parent_task_id: number;
}

export interface TaskList {
  id: number;
  name: string;
  description?: string;
  user_id: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  tasks_count?: number;
}

const taskService = {
  /**
   * Get all tasks with server-side pagination, sorting, and filtering
   */
  getTasks: async (params?: {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    search?: string;
    task_list_id?: number;
    status?: number;
    priority?: number;
  }): Promise<{ data: Task[]; total: number; current_page: number; per_page: number; last_page: number }> => {
    const response = await api.get('/tasks', { params });
    
    // Ensure response.data exists and has the expected structure
    if (!response || !response.data) {
      console.error('Invalid API response:', response);
      return { data: [], total: 0, current_page: 1, per_page: 10, last_page: 1 };
    }
    
    // Transform the response to include isSubtask property
    const tasksData = Array.isArray(response.data.data) ? response.data.data : [];
    const transformedData = tasksData.map((task: any) => ({
      ...task,
      isSubtask: !!task.parent_task_id
    }));
    
    return {
      data: transformedData,
      total: response.data.total || 0,
      current_page: response.data.current_page || 1,
      per_page: response.data.per_page || 10,
      last_page: response.data.last_page || 1
    };
  },

  /**
   * Get all tasks (without pagination for client-side operations)
   */
  getAllTasks: async (): Promise<Task[]> => {
    try {
      const response = await api.get('/tasks', { params: { limit: 1000 } });
      
      // Ensure response.data and response.data.data exist
      if (!response || !response.data) {
        console.error('Invalid API response:', response);
        return [];
      }
      
      // Handle different response formats
      const tasksData = response.data.data || response.data || [];
      
      // Ensure tasksData is an array
      if (!Array.isArray(tasksData)) {
        console.error('API response is not an array:', tasksData);
        return [];
      }
      
      return tasksData.map((task: any) => ({
        ...task,
        isSubtask: !!task.parent_task_id
      }));
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      return [];
    }
  },

  /**
   * Get a single task by ID
   */
  getTask: async (id: number | string): Promise<Task> => {
    const response = await api.get(`/tasks/${id}`);
    return {
      ...response.data,
      isSubtask: !!response.data.parent_task_id
    };
  },

  /**
   * Create a new task
   */
  createTask: async (taskData: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task> => {
    const response = await api.post('/tasks', taskData);
    return {
      ...response.data,
      isSubtask: !!response.data.parent_task_id
    };
  },

  /**
   * Update an existing task
   */
  updateTask: async (id: number | string, taskData: Partial<Task>): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, taskData);
    return {
      ...response.data,
      isSubtask: !!response.data.parent_task_id
    };
  },

  /**
   * Update task status
   */
  updateTaskStatus: async (id: number | string, status: number): Promise<Task> => {
    const response = await api.put(`/tasks/${id}`, { status });
    return {
      ...response.data,
      isSubtask: !!response.data.parent_task_id
    };
  },

  /**
   * Delete a task
   */
  deleteTask: async (id: number | string): Promise<void> => {
    await api.delete(`/tasks/${id}`);
  },

  /**
   * Get all task lists
   */
  getTaskLists: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ data: TaskList[]; total: number; current_page: number; per_page: number; last_page: number }> => {
    const response = await api.get('/task-lists', { params });
    return response.data;
  },
  
  /**
   * Get all task lists (without pagination)
   */
  getAllTaskLists: async (): Promise<TaskList[]> => {
    const response = await api.get('/task-lists', { params: { limit: 100 } });
    return response.data.data || response.data;
  },

  /**
   * Get a single task list by ID
   */
  getTaskList: async (id: number | string): Promise<TaskList> => {
    const response = await api.get(`/task-lists/${id}`);
    return response.data;
  },

  /**
   * Create a new task list
   */
  createTaskList: async (data: Omit<TaskList, 'id' | 'created_at' | 'updated_at'>): Promise<TaskList> => {
    const response = await api.post('/task-lists', data);
    return response.data;
  },

  /**
   * Update an existing task list
   */
  updateTaskList: async (id: number | string, data: Partial<TaskList>): Promise<TaskList> => {
    const response = await api.put(`/task-lists/${id}`, data);
    return response.data;
  },

  /**
   * Delete a task list
   */
  deleteTaskList: async (id: number | string): Promise<void> => {
    await api.delete(`/task-lists/${id}`);
  },
  
  /**
   * Get tasks by task list ID
   */
  getTasksByTaskList: async (taskListId: number | string, params?: {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
  }): Promise<{ data: Task[]; total: number; current_page: number; per_page: number; last_page: number }> => {
    const response = await api.get(`/task-lists/${taskListId}/tasks`, { params });
    
    // Transform the response to include isSubtask property
    const transformedData = response.data.data.map((task: any) => ({
      ...task,
      isSubtask: !!task.parent_task_id
    }));
    
    return {
      ...response.data,
      data: transformedData
    };
  }
};

export default taskService;
