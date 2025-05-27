import api from './api';
import axios from 'axios';
import type { Project } from '@/types/project';

const projectService = {
  /**
   * Get all projects
   * @returns Promise with project data
   */
  getProjects: async (): Promise<Project[]> => {
    try {
      const response = await api.get('/projects');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching projects:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to fetch projects');
      }
      throw error;
      throw new Error('Failed to fetch projects');
    }
  },

  /**
   * Get a single project by ID
   * @param id Project ID
   * @returns Promise with project data
   */
  getProject: async (id: string | number): Promise<Project> => {
    try {
      const response = await api.get(`/projects/${id}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching project:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Project not found');
      }
      throw new Error('Failed to fetch project');
    }
  },

  /**
   * Create a new project
   * @param projectData Project data to create
   * @returns Promise with created project data
   */
  createProject: async (projectData: Omit<Project, 'id' | 'created_at' | 'updated_at'>): Promise<Project> => {
    try {
      const response = await api.post('/projects', projectData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error creating project:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to create project');
      }
      throw error;
    }
  },

  /**
   * Update an existing project
   * @param id Project ID
   * @param projectData Project data to update
   * @returns Promise with updated project data
   */
  updateProject: async (id: string | number, projectData: Partial<Omit<Project, 'id' | 'created_at' | 'updated_at'>>): Promise<Project> => {
    try {
      const response = await api.put(`/projects/${id}`, projectData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating project:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to update project');
      }
      throw error;
    }
  },

  /**
   * Delete a project
   * @param id Project ID
   * @returns Promise with void
   */
  deleteProject: async (id: string | number): Promise<void> => {
    try {
      await api.delete(`/projects/${id}`);
    } catch (error) {
      console.error('Error deleting project:', error);
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Failed to delete project');
      }
      throw new Error('Failed to delete project');
    }
  }
};

export default projectService;
