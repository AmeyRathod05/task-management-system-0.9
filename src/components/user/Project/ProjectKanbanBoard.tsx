import React, { useState, useCallback, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Project as ProjectType } from '@/types/project';
import ProjectColumn from "./ProjectColumn";

// Define the KanbanTask interface for our board
interface KanbanTask {
  id: string;
  title: string;
  dueDate: string;
  status: 'active' | 'completed' | 'archived';
  assignee: string;
  assigneeName?: string;
  projectDesc?: string;
  category: {
    name: string;
    color: string;
  };
  comments: number;
  index: number;
}

// Map Project data to the format expected by the Kanban board
const mapProjectToKanbanTask = (project: ProjectType, index: number): KanbanTask => {
  // Safely handle undefined/null status and ensure it's one of the valid values
  const status = (project.status && ['active', 'completed', 'archived'].includes(project.status.toLowerCase()) 
    ? project.status.toLowerCase() 
    : 'active') as 'active' | 'completed' | 'archived';
  
  // Extract project properties we need
  const { id, name, description, end_date, priority } = project;
  
  // Create a KanbanTask with all required properties
  return {
    id: id?.toString() || `project-${index}`,
    title: name || 'Untitled Project',
    dueDate: end_date || 'No due date',
    status,
    assignee: "/images/user/user-01.jpg",
    projectDesc: description,
    category: { 
      name: priority || 'Medium',
      color: getColorForPriority(priority || 'Medium')
    },
    comments: 0,
    index
  };
};

// Helper function to get color based on priority
const getColorForPriority = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high':
      return 'bg-red-500';
    case 'medium':
      return 'bg-blue-500';
    case 'low':
      return 'bg-green-500';
    default:
      return 'bg-gray-500';
  }
};

interface ProjectKanbanBoardProps {
  projects: ProjectType[];
  onStatusChange: (projectId: string, newStatus: ProjectType['status']) => Promise<boolean | void>;
  onNotification: (type: 'success' | 'error', message: string) => void;
}

const ProjectKanbanBoard: React.FC<ProjectKanbanBoardProps> = ({ 
  projects, 
  onStatusChange, 
  onNotification 
}) => {
  const [localTasks, setLocalTasks] = useState<KanbanTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize local tasks when projects change
  useEffect(() => {
    setLocalTasks(projects.map((p, i) => mapProjectToKanbanTask(p, i)));
  }, [projects]);

  // Handle task movement within the same column
  const moveTask = useCallback((dragIndex: number, hoverIndex: number) => {
    setLocalTasks((prevTasks) => {
      const newTasks = [...prevTasks];
      const [movedTask] = newTasks.splice(dragIndex, 1);
      newTasks.splice(hoverIndex, 0, movedTask);
      return newTasks;
    });
  }, []);

  // Handle status change when a task is dropped on a different column
  const changeTaskStatus = useCallback(async (taskId: string, newStatus: string) => {
    // Validate the new status and convert to proper case (first letter capitalized)
    const validStatus = ['active', 'completed', 'archived'].includes(newStatus.toLowerCase()) 
      ? newStatus.charAt(0).toUpperCase() + newStatus.slice(1)
      : 'Active';

    // Set loading state
    setIsLoading(true);
    
    try {
      // Call the parent's status change handler with the properly cased status
      const result = await onStatusChange(taskId, validStatus as ProjectType['status']);
      
      // Handle both Promise<void> and Promise<boolean> return types
      const success = result === undefined || result === true;
      
      if (success) {
        // Update local state on success (use lowercase for internal state)
        const normalizedStatus = validStatus.toLowerCase() as 'active' | 'completed' | 'archived';
        setLocalTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === taskId ? { ...task, status: normalizedStatus } : task
          )
        );
        onNotification('success', `Project status updated to ${validStatus}`);
      } else {
        onNotification('error', 'Failed to update project status');
      }
      
      return success;
    } catch (error) {
      console.error('Error updating task status:', error);
      onNotification('error', 'An error occurred while updating the project status');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [onStatusChange, onNotification]);

  // Group tasks by status and maintain their original indices
  const tasksByStatus = {
    active: localTasks
      .filter(task => task.status === 'active')
      .sort((a, b) => a.index - b.index),
    completed: localTasks
      .filter(task => task.status === 'completed')
      .sort((a, b) => a.index - b.index),
    archived: localTasks
      .filter(task => task.status === 'archived')
      .sort((a, b) => a.index - b.index)
  };

  return (
    <div className="h-full flex flex-col">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/10">
          <div className="rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-brand-500 border-t-transparent"></div>
              <span>Updating project status...</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="mb-4 text-sm text-gray-500 dark:text-gray-400">
        <p>Drag and drop projects between columns to update their status.</p>
      </div>
      
      <DndProvider backend={HTML5Backend}>
        <div 
          className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-3"
          role="region"
          aria-label="Project kanban board"
        >
          <ProjectColumn
            title="Active"
            tasks={tasksByStatus.active}
            status="active"
            moveTask={moveTask}
            changeTaskStatus={changeTaskStatus}
          />
          <ProjectColumn
            title="Completed"
            tasks={tasksByStatus.completed}
            status="completed"
            moveTask={moveTask}
            changeTaskStatus={changeTaskStatus}
          />
          <ProjectColumn
            title="Archived"
            tasks={tasksByStatus.archived}
            status="archived"
            moveTask={moveTask}
            changeTaskStatus={changeTaskStatus}
          />
        </div>
      </DndProvider>
    </div>
  );
};

export default ProjectKanbanBoard;
