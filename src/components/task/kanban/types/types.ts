export interface Task {
  id: string;
  title: string;
  dueDate: string;
  comments?: number;
  links?: number;
  assignee: string;
  assigneeName?: string; // Add assigneeName property
  status: string;
  projectDesc?: string;
  projectImg?: string;
  category: {
    name: string;
    color: string;
  };
}

export interface DropResult {
  name: string;
}
