export interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  assignee: {
    id: string;
    name: string;
    avatar?: string;
  };
  project: {
    id: string;
    name: string;
    color: string;
  };
  client: {
    id: string;
    name: string;
  };
}

export const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Implement authentication',
    description: 'Set up JWT authentication with secure token handling and refresh mechanisms',
    status: 'done',
    priority: 'high',
    dueDate: '2025-05-28',
    assignee: { id: '1', name: 'John Doe', avatar: '/images/user/user-01.jpg' },
    project: { id: '1', name: 'TaskMS', color: '#3b82f6' },
    client: { id: '1', name: 'Acme Corp' },
  },
  {
    id: '2',
    title: 'Design dashboard',
    description: 'Create UI mockups for dashboard with responsive design and dark mode support',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2025-05-30',
    assignee: { id: '2', name: 'Jane Smith', avatar: '/images/user/user-02.jpg' },
    project: { id: '1', name: 'TaskMS', color: '#3b82f6' },
    client: { id: '1', name: 'Acme Corp' },
  },
  {
    id: '3',
    title: 'API documentation',
    description: 'Document all API endpoints with examples and error handling',
    status: 'todo',
    priority: 'medium',
    dueDate: '2025-06-02',
    assignee: { id: '3', name: 'Bob Johnson', avatar: '/images/user/user-03.jpg' },
    project: { id: '2', name: 'Project X', color: '#10b981' },
    client: { id: '2', name: 'Globex' },
  },
  {
    id: '4',
    title: 'Database optimization',
    description: 'Optimize database queries and implement proper indexing',
    status: 'review',
    priority: 'high',
    dueDate: '2025-05-29',
    assignee: { id: '1', name: 'John Doe', avatar: '/images/user/user-01.jpg' },
    project: { id: '1', name: 'TaskMS', color: '#3b82f6' },
    client: { id: '1', name: 'Acme Corp' },
  },
  {
    id: '5',
    title: 'Mobile app development',
    description: 'Develop React Native mobile application for task management',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2025-06-15',
    assignee: { id: '4', name: 'Alice Wilson', avatar: '/images/user/user-04.jpg' },
    project: { id: '3', name: 'Mobile App', color: '#f59e0b' },
    client: { id: '1', name: 'Acme Corp' },
  },
  {
    id: '6',
    title: 'Security audit',
    description: 'Conduct comprehensive security audit and penetration testing',
    status: 'todo',
    priority: 'high',
    dueDate: '2025-06-10',
    assignee: { id: '5', name: 'Charlie Brown', avatar: '/images/user/user-05.jpg' },
    project: { id: '2', name: 'Project X', color: '#10b981' },
    client: { id: '2', name: 'Globex' },
  },
  {
    id: '7',
    title: 'Performance testing',
    description: 'Load testing and performance optimization for high traffic scenarios',
    status: 'todo',
    priority: 'medium',
    dueDate: '2025-06-08',
    assignee: { id: '3', name: 'Bob Johnson', avatar: '/images/user/user-03.jpg' },
    project: { id: '1', name: 'TaskMS', color: '#3b82f6' },
    client: { id: '1', name: 'Acme Corp' },
  },
  {
    id: '8',
    title: 'User onboarding flow',
    description: 'Design and implement intuitive user onboarding experience',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2025-06-05',
    assignee: { id: '2', name: 'Jane Smith', avatar: '/images/user/user-02.jpg' },
    project: { id: '3', name: 'Mobile App', color: '#f59e0b' },
    client: { id: '1', name: 'Acme Corp' },
  },
  {
    id: '9',
    title: 'E-commerce integration',
    description: 'Integrate payment gateways and shopping cart functionality',
    status: 'todo',
    priority: 'high',
    dueDate: '2025-06-20',
    assignee: { id: '1', name: 'John Doe', avatar: '/images/user/user-01.jpg' },
    project: { id: '4', name: 'E-commerce Platform', color: '#ef4444' },
    client: { id: '3', name: 'Initech' },
  },
  {
    id: '10',
    title: 'Research data analysis',
    description: 'Analyze clinical trial data and prepare visualization reports',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2025-06-25',
    assignee: { id: '4', name: 'Alice Wilson', avatar: '/images/user/user-04.jpg' },
    project: { id: '5', name: 'Biotech Research', color: '#8b5cf6' },
    client: { id: '4', name: 'Umbrella Corp' },
  },
  {
    id: '11',
    title: 'AI model training',
    description: 'Train and optimize machine learning models for natural language processing',
    status: 'in-progress',
    priority: 'high',
    dueDate: '2025-07-10',
    assignee: { id: '3', name: 'Bob Johnson', avatar: '/images/user/user-03.jpg' },
    project: { id: '6', name: 'AI Assistant', color: '#14b8a6' },
    client: { id: '5', name: 'Stark Industries' },
  },
  {
    id: '12',
    title: 'Cloud infrastructure setup',
    description: 'Set up scalable cloud infrastructure with auto-scaling capabilities',
    status: 'todo',
    priority: 'medium',
    dueDate: '2025-06-18',
    assignee: { id: '5', name: 'Charlie Brown', avatar: '/images/user/user-05.jpg' },
    project: { id: '7', name: 'Cloud Migration', color: '#6366f1' },
    client: { id: '2', name: 'Globex' },
  },
  {
    id: '13',
    title: 'Penetration testing',
    description: 'Conduct thorough penetration testing to identify security vulnerabilities',
    status: 'todo',
    priority: 'high',
    dueDate: '2025-06-30',
    assignee: { id: '1', name: 'John Doe', avatar: '/images/user/user-01.jpg' },
    project: { id: '8', name: 'Security Audit', color: '#f43f5e' },
    client: { id: '1', name: 'Acme Corp' },
  },
  {
    id: '14',
    title: 'Data warehouse implementation',
    description: 'Design and implement data warehouse for business intelligence',
    status: 'in-progress',
    priority: 'medium',
    dueDate: '2025-07-15',
    assignee: { id: '4', name: 'Alice Wilson', avatar: '/images/user/user-04.jpg' },
    project: { id: '9', name: 'Data Analytics', color: '#0ea5e9' },
    client: { id: '3', name: 'Initech' },
  },
  {
    id: '15',
    title: 'VR environment design',
    description: 'Create immersive virtual reality environments for training simulations',
    status: 'todo',
    priority: 'medium',
    dueDate: '2025-07-20',
    assignee: { id: '2', name: 'Jane Smith', avatar: '/images/user/user-02.jpg' },
    project: { id: '10', name: 'VR Training', color: '#84cc16' },
    client: { id: '5', name: 'Stark Industries' },
  },
  {
    id: '16',
    title: 'Mobile UI optimization',
    description: 'Optimize mobile UI for better performance and user experience',
    status: 'review',
    priority: 'low',
    dueDate: '2025-06-12',
    assignee: { id: '2', name: 'Jane Smith', avatar: '/images/user/user-02.jpg' },
    project: { id: '3', name: 'Mobile App', color: '#f59e0b' },
    client: { id: '1', name: 'Acme Corp' },
  },
  {
    id: '17',
    title: 'Payment gateway integration',
    description: 'Integrate multiple payment gateways with fraud detection',
    status: 'review',
    priority: 'high',
    dueDate: '2025-06-22',
    assignee: { id: '3', name: 'Bob Johnson', avatar: '/images/user/user-03.jpg' },
    project: { id: '4', name: 'E-commerce Platform', color: '#ef4444' },
    client: { id: '3', name: 'Initech' },
  },
  {
    id: '18',
    title: 'Automated testing framework',
    description: 'Develop comprehensive automated testing framework with CI/CD integration',
    status: 'done',
    priority: 'medium',
    dueDate: '2025-05-25',
    assignee: { id: '5', name: 'Charlie Brown', avatar: '/images/user/user-05.jpg' },
    project: { id: '1', name: 'TaskMS', color: '#3b82f6' },
    client: { id: '1', name: 'Acme Corp' },
  },
  {
    id: '19',
    title: 'User feedback collection',
    description: 'Implement user feedback collection and analysis system',
    status: 'in-progress',
    priority: 'low',
    dueDate: '2025-06-28',
    assignee: { id: '4', name: 'Alice Wilson', avatar: '/images/user/user-04.jpg' },
    project: { id: '6', name: 'AI Assistant', color: '#14b8a6' },
    client: { id: '5', name: 'Stark Industries' },
  },
  {
    id: '20',
    title: 'Database migration',
    description: 'Migrate legacy database to new cloud-based solution with zero downtime',
    status: 'todo',
    priority: 'high',
    dueDate: '2025-07-05',
    assignee: { id: '1', name: 'John Doe', avatar: '/images/user/user-01.jpg' },
    project: { id: '7', name: 'Cloud Migration', color: '#6366f1' },
    client: { id: '2', name: 'Globex' },
  }
];

export const mockProjects = [
  { id: '1', name: 'TaskMS', color: '#3b82f6', clientId: '1' },
  { id: '2', name: 'Project X', color: '#10b981', clientId: '2' },
  { id: '3', name: 'Mobile App', color: '#f59e0b', clientId: '1' },
  { id: '4', name: 'E-commerce Platform', color: '#ef4444', clientId: '3' },
  { id: '5', name: 'Biotech Research', color: '#8b5cf6', clientId: '4' },
  { id: '6', name: 'AI Assistant', color: '#14b8a6', clientId: '5' },
  { id: '7', name: 'Cloud Migration', color: '#6366f1', clientId: '2' },
  { id: '8', name: 'Security Audit', color: '#f43f5e', clientId: '1' },
  { id: '9', name: 'Data Analytics', color: '#0ea5e9', clientId: '3' },
  { id: '10', name: 'VR Training', color: '#84cc16', clientId: '5' },
];

export const mockClients = [
  { id: '1', name: 'Acme Corp', email: 'contact@acme.com', phone: '+1234567890' },
  { id: '2', name: 'Globex', email: 'info@globex.com', phone: '+1987654321' },
  { id: '3', name: 'Initech', email: 'support@initech.com', phone: '+1122334455' },
  { id: '4', name: 'Umbrella Corp', email: 'info@umbrella.com', phone: '+1555666777' },
  { id: '5', name: 'Stark Industries', email: 'projects@stark.com', phone: '+1999888777' },
];

export const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'admin' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
  { id: '3', name: 'Bob Johnson', email: 'bob@example.com', role: 'user' },
  { id: '4', name: 'Alice Wilson', email: 'alice@example.com', role: 'user' },
  { id: '5', name: 'Charlie Brown', email: 'charlie@example.com', role: 'user' },
];
