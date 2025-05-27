export interface Project {
  id?: string;
  name: string;
  description?: string;
  status: 'active' | 'completed' | 'archived' | 'pending';
  start_date: string;
  end_date: string | null;
  client_id: string; // Required field for database
  created_by?: string | null;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  assignedTo?: string; // For Gantt chart
  priority?: 'low' | 'medium' | 'high'; // For Gantt chart
}

export interface GanttTask {
  id: string;
  name: string;
  start: Date;
  end: Date;
  progress: number;
  assignee: string;
  priority: string;
  status: string;
  dependencies?: string[];
}

