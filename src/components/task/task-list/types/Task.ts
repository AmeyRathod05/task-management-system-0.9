export interface Task {
  id: string;
  name: string;
  description?: string;
  isChecked: boolean;
  dueDate: string;
  startDate?: string;
  endDate?: string;
  commentCount: number;
  category?: string;
  userAvatar: string;
  status: string;
  priority: number;
  projectId?: string;
  projectName?: string;
  assignedTo?: string;
  createdBy?: string;
  order: number;
  toggleChecked: () => void;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  clientId?: string;
  createdBy?: string;
}

export interface FilterOptions {
  projectId?: string;
  status?: string;
  priority?: number;
  assignedTo?: string;
  category?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  searchTerm?: string;
}
