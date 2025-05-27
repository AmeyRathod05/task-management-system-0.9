import { Project } from '@/types/project';
import { mockProjects, mockClients } from '@/mocks/tasks';

// Convert mock data to Project type
const convertedProjects: Project[] = mockProjects.map(project => ({
  id: project.id,
  name: project.name,
  description: `Project for ${mockClients.find(c => c.id === project.clientId)?.name || 'Unknown Client'}`,
  status: 'active',
  start_date: new Date().toISOString().split('T')[0],
  end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  client_id: project.clientId,
  created_by: 'admin',
  budget: Math.floor(Math.random() * 10000) + 5000,
  progress: Math.floor(Math.random() * 100),
  team_members: [
    { id: '1', name: 'John Doe', role: 'Developer', avatar: '/images/user/user-01.jpg' },
    { id: '2', name: 'Jane Smith', role: 'Designer', avatar: '/images/user/user-02.jpg' }
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  color: project.color || '#3b82f6'
}));

// Mock project service
const mockProjectService = {
  getProjects: async (page = 1, limit = 10) => {
    console.log('Using mock project service');
    
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedProjects = convertedProjects.slice(startIndex, endIndex);
    
    return {
      projects: paginatedProjects,
      total: convertedProjects.length,
      page,
      limit,
      totalPages: Math.ceil(convertedProjects.length / limit)
    };
  },
  
  getProject: async (id: string) => {
    const project = convertedProjects.find(p => p.id === id);
    if (!project) {
      throw new Error('Project not found');
    }
    return project;
  },
  
  createProject: async (projectData: Omit<Project, 'id'>) => {
    const newProject = {
      ...projectData,
      id: Math.random().toString(36).substring(2, 9),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Project;
    
    convertedProjects.push(newProject);
    return newProject;
  },
  
  updateProject: async (id: string, projectData: Partial<Project>) => {
    const index = convertedProjects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Project not found');
    }
    
    const updatedProject = {
      ...convertedProjects[index],
      ...projectData,
      updated_at: new Date().toISOString()
    };
    
    convertedProjects[index] = updatedProject;
    return updatedProject;
  },
  
  deleteProject: async (id: string) => {
    const index = convertedProjects.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error('Project not found');
    }
    
    convertedProjects.splice(index, 1);
    return true;
  }
};

export default mockProjectService;
