'use client';

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { getProjectService } from '@/services/serviceProvider';
import { useMockProjects } from './MockDataAdapter';
import { Project as ProjectType } from '@/types/project';
import ProjectsTable from './ProjectsTable';
import AddProjectForm from './AddProjectForm';
import ProjectKanbanBoard from './ProjectKanbanBoard';
import ProjectGanttChart from './ProjectGanttChart';
import { AngleDownIcon, CloseIcon } from '@/icons';
import PaginationWithIcon from '@/components/tables/DataTables/TableOne/PaginationWithIcon';
import Button from '@/components/ui/button/Button';
import Notification from '@/components/ui/notification/Notification';
import EditableProjectsTable from './EditableProjectsTable';
import { ProjectClientView } from './views/client/project/ProjectClientView';
import { useClientOnly, isServer } from '@/hooks/useSSR';
// Using CSS transitions for the slide-in panel

interface SlideInPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

// SlideInPanel component for the add/edit project form
const SlideInPanel = ({ isOpen, onClose, title, subtitle, children }: SlideInPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Handle mount/unmount and animation states
  useEffect(() => {
    if (isOpen) {
      setIsMounted(true);
      // Small delay to allow for CSS transition
      const timer = setTimeout(() => setIsVisible(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      // Wait for the animation to complete before unmounting
      const timer = setTimeout(() => setIsMounted(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle click outside to close and body scroll
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      // Disable body scroll when panel is open
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '15px'; // Prevent content shift when scrollbar disappears
      document.addEventListener('mousedown', handleClickOutside);
      setIsVisible(true);
    } else {
      // Re-enable body scroll when panel is closed
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      setIsVisible(false);
    }

    // Cleanup function
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  // Use a portal to render the overlay and panel at the root level
  return (
    <>
      {/* Full-screen overlay that covers everything including sidebar */}
      <div 
        className={` mb-0 fixed inset-0 bg-black/75 z-[100000] transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Panel - positioned at the root level */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 h-screen w-full max-w-2xl bg-white shadow-2xl z-[100001] overflow-y-auto transition-transform duration-300 ease-in-out transform ${
          isVisible ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-8 h-full overflow-y-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
              {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 "
              aria-label="Close panel"
            >
              <CloseIcon className="text-gray-400 " />
            </button>
          </div>
          
          {/* Form Content */}
          <div className="space-y-6">
            {children}
          </div>
        </div>
      </div>
    </>
  );
};

// Debug SSR
console.log('Project component - Running on:', isServer ? 'server' : 'client');

type ViewType = 'list' | 'kanban' | 'gantt';

interface ProjectProps {
  initialProjects?: ProjectType[];
}

const Project: React.FC<ProjectProps> = ({ initialProjects = [] }) => {
  const isClient = useClientOnly();
  const { 
    projects, 
    loading, 
    error, 
    addProject: mockAddProject, 
    updateProject: mockUpdateProject, 
    deleteProject: mockDeleteProject 
  } = useMockProjects();
  
  const [viewMode, setViewMode] = useState<ViewType>('list');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isAddProjectOpen, setIsAddProjectOpen] = useState(false);
  const [isEditProjectOpen, setIsEditProjectOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<{ status: string; client: string }>({ status: '', client: '' });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  // Update total items when projects change
  useEffect(() => {
    if (projects) {
      setTotalItems(projects.length);
    }
  }, [projects, setTotalItems]);

  // Set initial data and handle client-side mounting
  useEffect(() => {
    console.log('Project component - Client-side mounted');
    
    // We're using mock data, so no need to fetch from API
    console.log('Using mock projects data');
    
    return () => {
      console.log('Project component - Client-side unmounting');
    };
  }, []);

  const filteredAndSortedData = useMemo(() => {
    if (!projects) return [];
    
    // First filter by search term
    let filtered = projects.filter((item) =>
      Object.values(item).some(
        (value) =>
          typeof value === 'string' &&
          value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
    
    // Then sort if sort config is present
    if (sortConfig && sortConfig.key) {
      filtered = [...filtered].sort((a, b) => {
        const aValue = a[sortConfig.key as keyof ProjectType];
        const bValue = b[sortConfig.key as keyof ProjectType];
        return sortConfig.direction === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }
    
    return filtered;
  }, [sortConfig, searchTerm, projects]);

  const handleSort = (key: keyof ProjectType) => {
    if (sortConfig && sortConfig.key === key) {
      setSortConfig({
        key,
        direction: sortConfig.direction === 'asc' ? 'desc' : 'asc'
      });
    } else {
      setSortConfig({ key, direction: 'asc' });
    }
  };

  // Handle updating a project
  const handleUpdateProject = async (id: string, projectData: Partial<ProjectType>) => {
    try {
      const updatedProject = await mockUpdateProject(id, projectData);
      setIsEditProjectOpen(false);
      setSelectedProject(null);
      setNotification({ type: 'success', message: 'Project updated successfully!' });
      return true;
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to update project' });
      return false;
    }
  };

  // Handle adding a new project
  const handleAddProject = async (projectData: Omit<ProjectType, 'id'>) => {
    try {
      const newProject = await mockAddProject(projectData);
      setIsAddProjectOpen(false);
      setNotification({ type: 'success', message: 'Project added successfully!' });
      return true;
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to add project' });
      return false;
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Projects</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your projects and tasks efficiently
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center space-x-1">
              <Button
                variant={viewMode === 'list' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="p-1.5"
                data-tooltip="List View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              </Button>
              <Button
                variant={viewMode === 'kanban' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('kanban')}
                className="p-1.5"
                data-tooltip="Kanban View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                </svg>
              </Button>
              <Button
                variant={viewMode === 'gantt' ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setViewMode('gantt')}
                className="p-1.5"
                data-tooltip="Gantt Chart View"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAddProjectOpen(true)}
                className="p-1.5"
                data-tooltip="Add Project"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </Button>
            </div>
          </div>
        </div>

        {/* Notification Container - Fixed position with z-index to overlap header */}
        {notification && (
          <div className="fixed top-4 right-4 z-50">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white dark:bg-gray-800 shadow-lg rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
              <Notification
                variant={notification.type}
                title={notification.message}
                hideDuration={3000}
              />
            </div>
          </div>
        )}
      </div>

      {/* View Content */}
      {viewMode === 'list' && (
        <>
          <div className="mb-6">
            <EditableProjectsTable 
              initialData={filteredAndSortedData}
              onUpdate={async (id, projectData) => {
                try {
                  await handleUpdateProject(id, projectData);
                  return true;
                } catch (error) {
                  return false;
                }
              }}
              onDelete={async (id) => {
                try {
                  await mockDeleteProject(id);
                  setNotification({ type: 'success', message: 'Project deleted successfully!' });
                  return true;
                } catch (error) {
                  setNotification({ type: 'error', message: 'Failed to delete project' });
                  return false;
                }
              }}
              onEdit={(project) => {
                setSelectedProject(project);
                setIsEditProjectOpen(true);
              }}
              isLoading={loading}
            />
          </div>

          <PaginationWithIcon
            totalPages={Math.ceil(totalItems / itemsPerPage)}
            initialPage={currentPage}
            onPageChange={(page) => setCurrentPage(page)}
          />

          {/* Add Project Slide-in Panel */}
          <SlideInPanel 
            isOpen={isAddProjectOpen} 
            onClose={() => setIsAddProjectOpen(false)}
            title={'Create New Project'}
            subtitle={'Fill in the details below to create a new project'}
          >
            <AddProjectForm 
              initialData={undefined}
              onSave={handleAddProject}
              onClose={() => setIsAddProjectOpen(false)}
              isSaving={false}
            />
          </SlideInPanel>

          {/* Edit Project Slide-in Panel */}
          <SlideInPanel 
            isOpen={isEditProjectOpen} 
            onClose={() => setIsEditProjectOpen(false)}
            title={'Edit Project'}
            subtitle={'Update the project details below'}
          >
            <AddProjectForm 
              initialData={selectedProject || undefined}
              onSave={(projectData) => handleUpdateProject(selectedProject?.id || '', projectData)}
              onClose={() => setIsEditProjectOpen(false)}
              isSaving={false}
            />
          </SlideInPanel>
        </>
      )}
      
      {viewMode === 'kanban' && (
        <div className="bg-white rounded-lg shadow p-4">
          <ProjectKanbanBoard 
            projects={filteredAndSortedData} 
            onStatusChange={async (projectId, newStatus) => {
              // Handle status change with mock update
              if (selectedProject) {
                return await handleUpdateProject(projectId, { status: newStatus });
              }
              return Promise.resolve();
            }}
            onNotification={(type, message) => {
              setNotification({ type, message });
            }}
          />
        </div>
      )}
      
      {viewMode === 'gantt' && (
        <div className="bg-white rounded-lg shadow p-4">
          <ProjectGanttChart 
            projects={filteredAndSortedData}
          />
        </div>
      )}

    </div>
  );
};


export default Project;
