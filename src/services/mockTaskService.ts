import { Task, TaskList } from '@/services/taskService';
import { mockTasks, mockProjects, mockClients } from '@/mocks/tasks';

// Convert mock data to Task type
const convertedTasks: Task[] = mockTasks.map(task => ({
  id: task.id,
  name: task.title,
  description: task.description,
  status: task.status,
  priority: task.priority === 'high' ? 3 : task.priority === 'medium' ? 2 : 1,
  due_date: task.dueDate,
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  assignee_id: task.assignee.id,
  assignee_name: task.assignee.name,
  assignee_avatar: task.assignee.avatar || '',
  project_id: task.project.id,
  project_name: task.project.name,
  project_color: task.project.color,
  client_id: task.client.id,
  client_name: task.client.name,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  created_by: 'admin',
  attachments: [],
  comments: [],
  tags: [],
  estimated_hours: Math.floor(Math.random() * 20) + 1,
  actual_hours: Math.floor(Math.random() * 15),
  is_completed: task.status === 'done',
  category: task.project.name
}));

// Mock task service
const mockTaskService = {
  getTasks: async (page = 1, limit = 10): Promise<TaskList> => {
    console.log('Using mock task service');
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTasks = convertedTasks.slice(startIndex, endIndex);
    
    return {
      data: paginatedTasks,
      total: convertedTasks.length,
      page,
      limit,
      totalPages: Math.ceil(convertedTasks.length / limit)
    };
  },
  
  getTask: async (id: string): Promise<Task> => {
    const task = convertedTasks.find(t => t.id === id);
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  },
  
  createTask: async (taskData: Omit<Task, 'id'>): Promise<Task> => {
    const newTask = {
      ...taskData,
      id: Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Task;
    
    convertedTasks.push(newTask);
    return newTask;
  },
  
  updateTask: async (id: string, taskData: Partial<Task>): Promise<Task> => {
    const index = convertedTasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    const updatedTask = {
      ...convertedTasks[index],
      ...taskData,
      updated_at: new Date().toISOString()
    };
    
    convertedTasks[index] = updatedTask;
    return updatedTask;
  },
  
  deleteTask: async (id: string): Promise<boolean> => {
    const index = convertedTasks.findIndex(t => t.id === id);
    if (index === -1) {
      throw new Error('Task not found');
    }
    
    convertedTasks.splice(index, 1);
    return true;
  },
  
  getTasksByProject: async (projectId: string): Promise<Task[]> => {
    return convertedTasks.filter(task => task.project_id === projectId);
  },
  
  getTasksByAssignee: async (assigneeId: string): Promise<Task[]> => {
    return convertedTasks.filter(task => task.assignee_id === assigneeId);
  }
};

export default mockTaskService;
