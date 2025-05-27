'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Project } from '@/types/project';
import EditableProjectsTable from '@/components/user/Project/EditableProjectsTable';
import projectService from '@/services/projectService';

// Debug SSR
console.log('ProjectClientView - Executing on:', typeof window === 'undefined' ? 'server' : 'client');

interface ProjectClientViewProps {
  initialData: Project[];
  onUpdate?: (updatedProject: Project) => void;
  onDelete?: (deletedId: string) => void;
  onCreate?: (newProject: Project) => void;
  onEdit?: (project: Project) => void;
  onOpenAddModal?: () => void; // New prop to handle opening the add modal
}

export function ProjectClientView({ 
  initialData = [], 
  onUpdate, 
  onDelete, 
  onCreate,
  onEdit,
  onOpenAddModal 
}: ProjectClientViewProps): React.ReactElement {
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>(initialData || []);
  
  // Debug mount and hydration
  useEffect(() => {
    console.log('ProjectClientView - Component mounted on client');
    setIsMounted(true);
    return () => {
      console.log('ProjectClientView - Component unmounting');
      setIsMounted(false);
    };
  }, []);
  
  // Sync projects with initialData
  useEffect(() => {
    console.log('ProjectClientView - initialData updated', { 
      initialCount: initialData.length,
      isMounted,
      time: new Date().toISOString() 
    });
    
    if (isMounted && initialData) {
      setProjects(initialData);
    }
  }, [initialData, isMounted]);

  const handleUpdateProject = useCallback(async (id: string, data: Partial<Project>) => {
    try {
      setIsLoading(true);
      
      const updatedProject = await projectService.updateProject(id, data);
      if (updatedProject) {
        setProjects(prev => 
          prev.map(project => project.id === id ? updatedProject : project)
        );
        onUpdate?.(updatedProject);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error updating project:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [onUpdate]);
  
  
  const handleDeleteProject = useCallback(async (id: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      await projectService.deleteProject(id);
      setProjects(prev => prev.filter(project => project.id !== id));
      onDelete?.(id);
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [onDelete]);

  return (
    <div className="w-full">
      <div className="bg-white w-full">
        <EditableProjectsTable 
          initialData={projects} 
          onUpdate={handleUpdateProject}
          onDelete={handleDeleteProject}
          onEdit={onEdit}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
