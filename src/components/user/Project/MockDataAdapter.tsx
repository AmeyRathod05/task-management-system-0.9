'use client';

import { useTasks } from '@/context/TaskContext';
import { Project as ProjectType } from '@/types/project';
import { useEffect, useState } from 'react';

/**
 * This adapter connects our mock data from TaskContext to the Project component
 */
export const useMockProjects = (): {
  projects: ProjectType[];
  loading: boolean;
  error: string | null;
  addProject: (project: Omit<ProjectType, 'id'>) => Promise<ProjectType>;
  updateProject: (id: string, project: Partial<ProjectType>) => Promise<ProjectType>;
  deleteProject: (id: string) => Promise<boolean>;
} => {
  const { projects: mockProjects, clients: mockClients } = useTasks();
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Convert mock projects to ProjectType format
  useEffect(() => {
    try {
      const convertedProjects: ProjectType[] = mockProjects.map(project => ({
        id: project.id,
        name: project.name,
        description: `Project for ${mockClients.find(c => c.id === project.clientId)?.name || 'Unknown Client'}`,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'active',
        clientId: project.clientId,
        client: mockClients.find(c => c.id === project.clientId)?.name || 'Unknown Client',
        budget: Math.floor(Math.random() * 10000) + 5000,
        progress: Math.floor(Math.random() * 100),
        teamMembers: [
          { id: '1', name: 'John Doe', role: 'Developer', avatar: '/images/user/user-01.jpg' },
          { id: '2', name: 'Jane Smith', role: 'Designer', avatar: '/images/user/user-02.jpg' }
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin',
        color: project.color || '#3b82f6'
      }));
      
      setProjects(convertedProjects);
      setLoading(false);
    } catch (err) {
      setError('Error loading project data');
      setLoading(false);
    }
  }, [mockProjects, mockClients]);

  // Mock API functions
  const addProject = async (project: Omit<ProjectType, 'id'>): Promise<ProjectType> => {
    const newProject = {
      ...project,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as ProjectType;
    
    setProjects(prev => [...prev, newProject]);
    return newProject;
  };

  const updateProject = async (id: string, projectUpdates: Partial<ProjectType>): Promise<ProjectType> => {
    const updatedProjects = projects.map(project => 
      project.id === id 
        ? { ...project, ...projectUpdates, updatedAt: new Date().toISOString() } 
        : project
    );
    
    setProjects(updatedProjects);
    const updatedProject = updatedProjects.find(p => p.id === id);
    
    if (!updatedProject) {
      throw new Error('Project not found');
    }
    
    return updatedProject;
  };

  const deleteProject = async (id: string): Promise<boolean> => {
    setProjects(prev => prev.filter(project => project.id !== id));
    return true;
  };

  return { projects, loading, error, addProject, updateProject, deleteProject };
};
