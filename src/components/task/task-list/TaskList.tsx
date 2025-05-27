"use client";
import { Task, Project, FilterOptions } from "@/components/task/task-list/types/Task";
import TaskHeader from "@/components/task/TaskHeader";
import TaskFilter from "@/components/task/task-list/TaskFilter";
import TaskTableFilter from "@/components/task/task-list/TaskTableFilter";
import ProjectGroup from "@/components/task/task-list/ProjectGroup";
import EditableTasksTable from "@/components/task/task-list/EditableTasksTable";
import React, { useState, useMemo } from "react";
import { FiGrid, FiList } from "react-icons/fi";
import { useTasks } from "@/context/TaskContext";

export default function TaskList() {
  const { tasks: contextTasks, projects: contextProjects, updateTask, deleteTask } = useTasks();
  const [filters, setFilters] = useState<FilterOptions>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table');
  const [globalFilter, setGlobalFilter] = useState('');

  // Convert context tasks to the expected Task format
  const tasks: Task[] = useMemo(() => {
    return contextTasks.map((task) => ({
      id: task.id,
      name: task.title,
      description: task.description,
      isChecked: task.status === 'done',
      dueDate: task.dueDate,
      commentCount: 0,
      status: task.status,
      priority: task.priority === 'high' ? 3 : task.priority === 'medium' ? 2 : 1,
      projectId: task.project.id,
      projectName: task.project.name,
      assignedTo: task.assignee.id,
      userAvatar: task.assignee.avatar || '',
      createdBy: 'system',
      order: 0,
      toggleChecked: () => handleToggleChecked(task.id),
    }));
  }, [contextTasks]);

  // Convert context projects to the expected Project format
  const projects: Project[] = useMemo(() => {
    return contextProjects.map((project) => ({
      id: project.id,
      name: project.name,
      description: `Project: ${project.name}`,
      startDate: "2025-05-01",
      endDate: "2025-06-30",
      clientId: project.clientId,
      createdBy: "admin",
    }));
  }, [contextProjects]);

  // Filter tasks based on current filters and global search
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Global search filter (for table view)
      if (globalFilter) {
        const searchLower = globalFilter.toLowerCase();
        if (
          !task.name.toLowerCase().includes(searchLower) &&
          !task.description?.toLowerCase().includes(searchLower) &&
          !task.projectName?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Search filter (for card view)
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        if (
          !task.name.toLowerCase().includes(searchLower) &&
          !task.description?.toLowerCase().includes(searchLower)
        ) {
          return false;
        }
      }

      // Project filter
      if (filters.projectId) {
        if (filters.projectId === 'unassigned' && task.projectId) {
          return false;
        } else if (filters.projectId !== 'unassigned' && task.projectId !== filters.projectId) {
          return false;
        }
      }

      // Status filter
      if (filters.status && task.status !== filters.status) {
        return false;
      }

      // Priority filter
      if (filters.priority !== undefined && task.priority !== filters.priority) {
        return false;
      }

      // Assigned To filter
      if (filters.assignedTo && task.assignedTo !== filters.assignedTo) {
        return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const taskDate = new Date(task.dueDate);
        if (filters.dateRange.start) {
          const startDate = new Date(filters.dateRange.start);
          if (taskDate < startDate) return false;
        }
        if (filters.dateRange.end) {
          const endDate = new Date(filters.dateRange.end);
          if (taskDate > endDate) return false;
        }
      }

      return true;
    });
  }, [tasks, filters, globalFilter]);

  // Group tasks by project (for card view)
  const tasksByProject = useMemo(() => {
    const grouped = new Map<string | null, Task[]>();
    
    filteredTasks.forEach((task) => {
      const projectId = task.projectId || null;
      if (!grouped.has(projectId)) {
        grouped.set(projectId, []);
      }
      grouped.get(projectId)!.push(task);
    });

    return grouped;
  }, [filteredTasks]);

  const handleDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    taskId: string
  ) => {
    setDragging(taskId);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, projectId?: string) => {
    e.preventDefault();
    if (dragging === null) return;

    // Find the original task from context
    const originalTask = contextTasks.find(t => t.id === dragging);
    if (originalTask && projectId !== undefined && originalTask.project.id !== projectId) {
      const targetProject = contextProjects.find(p => p.id === projectId);
      if (targetProject) {
        updateTask(dragging, {
          ...originalTask,
          project: targetProject
        });
      }
    }

    setDragging(null);
  };

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>): Promise<boolean> => {
    try {
      const originalTask = contextTasks.find(t => t.id === taskId);
      if (originalTask) {
        const updatedTask = {
          ...originalTask,
          title: updates.name || originalTask.title,
          description: updates.description || originalTask.description,
          status: (updates.status as 'todo' | 'in-progress' | 'review' | 'done') || originalTask.status,
          priority: (updates.priority === 3 ? 'high' : updates.priority === 2 ? 'medium' : 'low') as 'low' | 'medium' | 'high',
          dueDate: updates.dueDate || originalTask.dueDate,
        };
        updateTask(taskId, updatedTask);
      }
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      return false;
    }
  };

  const handleTaskDelete = async (taskId: string): Promise<boolean> => {
    try {
      deleteTask(taskId);
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  };

  const handleTaskEdit = (task: Task) => {
    console.log('Edit task:', task);
    // Implement edit functionality
  };

  const handleToggleChecked = (taskId: string) => {
    const originalTask = contextTasks.find(t => t.id === taskId);
    if (originalTask) {
      const newStatus = originalTask.status === 'done' ? 'todo' : 'done';
      updateTask(taskId, {
        ...originalTask,
        status: newStatus
      });
    }
  };

  const handleFilterChange = (newFilters: FilterOptions) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({});
  };

  const handleGlobalFilter = (value: string) => {
    setGlobalFilter(value);
  };

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Task Management
          </h1>
          <span className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">
            {filteredTasks.length} tasks
          </span>
        </div>
        
        <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg dark:bg-gray-800">
          <button
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'cards'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <FiGrid className="h-4 w-4" />
            Cards
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'table'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
            }`}
          >
            <FiList className="h-4 w-4" />
            Table
          </button>
        </div>
      </div>

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="space-y-4">
          <TaskTableFilter
            projects={projects}
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            onGlobalFilter={handleGlobalFilter}
            globalFilter={globalFilter}
          />
          
          <EditableTasksTable
            initialData={filteredTasks}
            onUpdate={handleTaskUpdate}
            onDelete={handleTaskDelete}
            onEdit={handleTaskEdit}
            isLoading={false}
          />
        </div>
      )}

      {/* Card View */}
      {viewMode === 'cards' && (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
          <TaskHeader />

          {/* Filter Section */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 xl:px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Tasks by Project
                </h2>
                <span className="px-2 py-1 text-sm text-gray-600 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">
                  {filteredTasks.length} tasks
                </span>
              </div>
              <TaskFilter
                projects={projects}
                filters={filters}
                onFilterChange={handleFilterChange}
                onClearFilters={handleClearFilters}
              />
            </div>
          </div>

          <div className="p-4 space-y-6 xl:p-6">
            {Array.from(tasksByProject.entries()).map(([projectId, projectTasks]) => {
              const project = projectId ? projects.find(p => p.id === projectId) : null;
              
              return (
                <ProjectGroup
                  key={projectId || "unassigned"}
                  project={project || null}
                  tasks={projectTasks}
                  onDragStart={handleDragStart}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onTaskUpdate={handleTaskUpdate}
                  projects={projects.map(p => ({ id: p.id, name: p.name }))}
                />
              );
            })}

            {filteredTasks.length === 0 && (
              <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mx-auto mb-4 text-gray-300 dark:text-gray-600"
                >
                  <path
                    d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No tasks found
                </h3>
                <p>Try adjusting your filters or create a new task.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
