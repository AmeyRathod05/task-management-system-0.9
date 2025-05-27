import { Task, TaskList } from '@/services/taskService';

// Extend the TaskList type to include pagination properties
export interface ExtendedTaskList extends TaskList {
  data: Task[];
  total: number;
  current_page: number;
  per_page: number;
  last_page: number;
}
