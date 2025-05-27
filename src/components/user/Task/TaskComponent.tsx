'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Task as TaskType, taskService } from '@/services/taskService';
import { Project as ProjectType, projectService } from '@/services/projectService';
import TasksTable from './TasksTable';
import AddTaskForm from './AddTaskForm';
import TaskKanbanBoard from './TaskKanbanBoard';
import TaskList from '@/components/task/task-list/TaskList';
import { AngleDownIcon } from '@/icons';
import PaginationWithIcon from '@/components/ui/pagination/PaginationWitIcon';
import { Modal } from '@/components/ui/modal';
import { useModal } from '@/hooks/useModal';
import Button from '@/components/ui/button/Button';
import { Input } from '@/components/ui/input/Input';
import Notification from '@/components/ui/notification/Notification';

type ViewType = 'list' | 'kanban' | 'task-list' | 'gantt';

const TaskComponent: React.FC = () => {
  const { isOpen, openModal, closeModal } = useModal(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState<keyof TaskType>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<TaskType | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [activeView, setActiveView] = useState<ViewType>('list');
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [showSubtasks, setShowSubtasks] = useState<Record<string, boolean>>({});
  const [groupBy, setGroupBy] = useState<string | null>(null);

  useEffect(() => {
    // Use mock data for tasks
    const mockTasks: TaskType[] = [
      {
        id: 'PRX-T01',
        title: 'Dashboard UI Implementation',
        description: 'Implement the new dashboard UI based on the approved designs',
        projectId: '1',
        projectName: 'Project X',
        status: 'In Progress',
        priority: 'High',
        startDate: '2025-05-01',
        dueDate: '2025-05-15',
        assignee: 'Alex Morgan',
        assigneeId: 'user1',
        isSubtask: false
      },
      {
        id: 'PRX-T02',
        title: 'API Integration',
        description: 'Connect the frontend with the backend API endpoints',
        projectId: '1',
        projectName: 'Project X',
        status: 'To Do',
        priority: 'High',
        startDate: '2025-05-10',
        dueDate: '2025-05-25',
        assignee: 'Alex Morgan',
        assigneeId: 'user1',
        isSubtask: false
      },
      {
        id: 'PRX-T03',
        title: 'User Authentication Flow',
        description: 'Implement secure user authentication and authorization',
        projectId: '1',
        projectName: 'Project X',
        status: 'Completed',
        priority: 'Critical',
        startDate: '2025-04-20',
        dueDate: '2025-05-05',
        assignee: 'Taylor Swift',
        assigneeId: 'user2',
        isSubtask: false
      },
      {
        id: 'AUX-T01',
        title: 'Bidding System Development',
        description: 'Create the real-time bidding system for auctions',
        projectId: '2',
        projectName: 'AuctionX',
        status: 'In Progress',
        priority: 'High',
        startDate: '2025-05-01',
        dueDate: '2025-05-20',
        assignee: 'Jamie Rodriguez',
        assigneeId: 'user3',
        isSubtask: false
      },
      {
        id: 'AUX-T02',
        title: 'Payment Gateway Integration',
        description: 'Integrate multiple payment gateways for auction settlements',
        projectId: '2',
        projectName: 'AuctionX',
        status: 'To Do',
        priority: 'Medium',
        startDate: '2025-05-15',
        dueDate: '2025-05-30',
        assignee: 'Chris Johnson',
        assigneeId: 'user4',
        isSubtask: false
      },
      {
        id: 'MOB-T01',
        title: 'Mobile App UI Design',
        description: 'Create UI/UX designs for the mobile application',
        projectId: '3',
        projectName: 'Mobile App',
        status: 'In Progress',
        priority: 'Medium',
        startDate: '2025-05-05',
        dueDate: '2025-05-25',
        assignee: 'Sam Wilson',
        assigneeId: 'user5',
        isSubtask: false
      },
      {
        id: 'MOB-T02',
        title: 'Push Notification System',
        description: 'Implement push notifications for mobile users',
        projectId: '3',
        projectName: 'Mobile App',
        status: 'To Do',
        priority: 'Low',
        startDate: '2025-05-20',
        dueDate: '2025-06-05',
        assignee: 'Jamie Rodriguez',
        assigneeId: 'user3',
        isSubtask: false
      },
      // Subtasks
      {
        id: 'PRX-T01-1',
        title: 'Chart Components',
        description: 'Implement interactive chart components for the dashboard',
        projectId: '1',
        projectName: 'Project X',
        status: 'In Progress',
        priority: 'Medium',
        startDate: '2025-05-02',
        dueDate: '2025-05-10',
        assignee: 'Alex Morgan',
        assigneeId: 'user1',
        isSubtask: true,
        parentTaskId: 'PRX-T01'
      },
      {
        id: 'PRX-T01-2',
        title: 'Responsive Layout',
        description: 'Ensure dashboard is fully responsive on all devices',
        projectId: '1',
        projectName: 'Project X',
        status: 'To Do',
        priority: 'Medium',
        startDate: '2025-05-05',
        dueDate: '2025-05-12',
        assignee: 'Taylor Swift',
        assigneeId: 'user2',
        isSubtask: true,
        parentTaskId: 'PRX-T01'
      },
      {
        id: 'AUX-T01-1',
        title: 'Real-time Updates',
        description: 'Implement WebSocket connection for real-time bid updates',
        projectId: '2',
        projectName: 'AuctionX',
        status: 'In Progress',
        priority: 'High',
        startDate: '2025-05-02',
        dueDate: '2025-05-12',
        assignee: 'Jamie Rodriguez',
        assigneeId: 'user3',
        isSubtask: true,
        parentTaskId: 'AUX-T01'
      }
    ];

    // Use mock data for projects
    const mockProjects: ProjectType[] = [
      {
        id: '1',
        name: 'Project X',
        project: 'ProjectX',
        status: 'Active',
        priority: 'High',
        end_date: '2025-06-30',
        assignedTo: 'Alex Morgan',
      },
      {
        id: '2',
        name: 'AuctionX',
        project: 'AuctionX',
        status: 'Active',
        priority: 'High',
        end_date: '2025-07-15',
        assignedTo: 'Jamie Rodriguez',
      },
      {
        id: '3',
        name: 'Mobile App',
        project: 'Mobile',
        status: 'Active',
        priority: 'Medium',
        end_date: '2025-08-30',
        assignedTo: 'Sam Wilson',
      }
    ];

    setTasks(mockTasks);
    setProjects(mockProjects);
    setLoading(false);
  }, []);

  const filteredAndSortedData = useMemo(() => {
    // Filter data based on search term
    const filteredData = tasks.filter(task => {
      const searchLower = searchTerm.toLowerCase();
      return (
        task.title.toLowerCase().includes(searchLower) ||
        task.projectName.toLowerCase().includes(searchLower) ||
        task.status.toLowerCase().includes(searchLower) ||
        task.priority.toLowerCase().includes(searchLower) ||
        (task.assignee && task.assignee.toLowerCase().includes(searchLower))
      );
    });

    // Filter by selected project
    const projectFilteredData = selectedProject === 'all'
      ? filteredData
      : filteredData.filter(task => task.projectId === selectedProject);

    // Sort data
    return [...projectFilteredData].sort((a, b) => {
      const aValue = a[sortKey];
      const bValue = b[sortKey];
      
      if (aValue === undefined || bValue === undefined) return 0;
      
      const comparison = String(aValue).localeCompare(String(bValue));
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [tasks, searchTerm, sortKey, sortOrder, selectedProject]);

  // Pagination
  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = filteredAndSortedData.slice(startIndex, endIndex);

  const handleFilterChange = (value: string) => {
    setSelectedProject(value === 'all' ? 'all' : value);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (key: keyof TaskType) => {
    if (key === sortKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const handleAddTask = () => {
    setEditingTask(undefined);
    openModal();
  };

  const handleEdit = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (task) {
      setEditingTask(task);
      openModal();
    }
  };

  const handleDelete = (id: string) => {
    // Confirm before deleting
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        // Check if it has subtasks
        const hasSubtasks = tasks.some(task => task.parentTaskId === id);
        
        if (hasSubtasks && !window.confirm('This task has subtasks. Deleting it will also delete all its subtasks. Continue?')) {
          return;
        }
        
        // Remove the task and its subtasks from the state
        const updatedTasks = tasks.filter(task => 
          task.id !== id && task.parentTaskId !== id
        );
        setTasks(updatedTasks);
        setNotificationType('success');
        setNotificationMessage('Task deleted successfully!');
        setShowNotification(true);
      } catch (error) {
        console.error('Error deleting task:', error);
        setNotificationType('error');
        setNotificationMessage('Failed to delete task. Please try again.');
        setShowNotification(true);
      }
    }
  };

  const handleSave = (formData: TaskType) => {
    setIsSaving(true);
    
    // Simulate API call with setTimeout
    setTimeout(() => {
      try {
        if (editingTask) {
          // Update existing task
          const updatedTasks = tasks.map(task => 
            task.id === editingTask.id ? { ...formData, id: editingTask.id } : task
          );
          setTasks(updatedTasks);
          setNotificationType('success');
          setNotificationMessage('Task updated successfully!');
        } else {
          // Create new task
          // Generate a new ID based on project and count
          const projectPrefix = formData.projectName.substring(0, 3).toUpperCase();
          const taskCount = tasks.filter(t => t.projectId === formData.projectId && !t.isSubtask).length + 1;
          const newId = formData.isSubtask && formData.parentTaskId
            ? `${formData.parentTaskId}-${tasks.filter(t => t.parentTaskId === formData.parentTaskId).length + 1}`
            : `${projectPrefix}-T${taskCount}`;
          
          const newTask = {
            ...formData,
            id: newId
          };
          
          setTasks([...tasks, newTask]);
          setNotificationType('success');
          setNotificationMessage('Task created successfully!');
        }
        
        setShowNotification(true);
        closeModal();
        setEditingTask(undefined);
      } catch (error) {
        console.error('Error saving task:', error);
        setNotificationType('error');
        setNotificationMessage('Failed to save task. Please try again.');
        setShowNotification(true);
      } finally {
        setIsSaving(false);
      }
    }, 1000); // Simulate network delay
  };

  const handleStatusChange = (taskId: string, newStatus: string) => {
    // Simulate API call with setTimeout
    setTimeout(() => {
      try {
        // Find the task to update
        const taskToUpdate = tasks.find(task => task.id === taskId);
        
        if (!taskToUpdate) {
          throw new Error('Task not found');
        }
        
        // Update task status in state
        const updatedTasks = tasks.map(task => {
          if (task.id === taskId) {
            return { ...task, status: newStatus };
          }
          return task;
        });
        
        setTasks(updatedTasks);
        setNotificationType('success');
        setNotificationMessage(`Task status updated to ${newStatus}!`);
        setShowNotification(true);
      } catch (error) {
        console.error('Error updating task status:', error);
        setNotificationType('error');
        setNotificationMessage('Failed to update task status. Please try again.');
        setShowNotification(true);
      }
    }, 500); // Simulate network delay
  };

  const toggleSubtasks = (taskId: string) => {
    setShowSubtasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleAddSubtask = (parentTaskId: string) => {
    // Find the parent task
    const parentTask = tasks.find(task => task.id === parentTaskId);
    
    if (!parentTask) return;
    
    // Pre-fill the form with parent task data
    const subtaskTemplate: Partial<TaskType> = {
      projectId: parentTask.projectId,
      projectName: parentTask.projectName,
      status: 'To Do',
      priority: parentTask.priority,
      startDate: new Date().toISOString().split('T')[0],
      isSubtask: true,
      parentTaskId: parentTaskId
    };
    
    setEditingTask(subtaskTemplate as TaskType);
    openModal();
  };

  const handleGroupByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setGroupBy(value === 'none' ? null : value);
  };

  return (
    <div className="space-y-6">
      {/* Task Header */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Tasks</h2>
          <div className="flex items-center gap-4">
            <div className="relative">
              <button className="absolute text-gray-500 -translate-y-1/2 left-4 top-1/2 dark:text-gray-400">
                <svg
                  className="fill-current"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M3.04199 9.37363C3.04199 5.87693 5.87735 3.04199 9.37533 3.04199C12.8733 3.04199 15.7087 5.87693 15.7087 9.37363C15.7087 12.8703 12.8733 15.7053 9.37533 15.7053C5.87735 15.7053 3.04199 12.8703 3.04199 9.37363ZM9.37533 1.54199C5.04926 1.54199 1.54199 5.04817 1.54199 9.37363C1.54199 13.6991 5.04926 17.2053 9.37533 17.2053C11.2676 17.2053 13.0032 16.5344 14.3572 15.4176L17.1773 18.238C17.4702 18.5309 17.945 18.5309 18.2379 18.238C18.5308 17.9451 18.5309 17.4703 18.238 17.1773L15.4182 14.3573C16.5367 13.0033 17.2087 11.2669 17.2087 9.37363C17.2087 5.04817 13.7014 1.54199 9.37533 1.54199Z"
                    fill="currentColor"
                  />
                </svg>
              </button>
              <input
                type="text"
                value={searchTerm}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                placeholder="Search tasks..."
                className="dark:bg-dark-900 h-11 w-full rounded-lg border border-gray-300 bg-transparent py-2.5 pl-11 pr-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800 xl:w-[300px]"
              />
            </div>
            <Button
              variant="primary"
              onClick={handleAddTask}
              disabled={isSaving}
            >
              Add Task
            </Button>
          </div>
        </div>
        
        {/* View Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            className={`py-2 px-4 font-medium text-sm ${activeView === 'list' ? 'border-b-2 border-brand-500 text-brand-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => setActiveView('list')}
          >
            List View
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${activeView === 'kanban' ? 'border-b-2 border-brand-500 text-brand-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => setActiveView('kanban')}
          >
            Kanban Board
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${activeView === 'task-list' ? 'border-b-2 border-brand-500 text-brand-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => setActiveView('task-list')}
          >
            Task List
          </button>
          <button
            className={`py-2 px-4 font-medium text-sm ${activeView === 'gantt' ? 'border-b-2 border-brand-500 text-brand-500' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
            onClick={() => setActiveView('gantt')}
          >
            Gantt Chart
          </button>
        </div>

        {(isSaving || showNotification) && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {isSaving ? (
              <div>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-brand-500"></div>
                Saving...
              </div>
            ) : (
              <Notification
                variant={notificationType}
                title={notificationMessage}
                hideDuration={3000}
              />
            )}
          </div>
        )}
      </div>

      {/* List View Controls */}
      {activeView === 'list' && (
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Group by:</span>
            <select
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              value={groupBy || 'none'}
              onChange={handleGroupByChange}
            >
              <option value="none">None</option>
              <option value="status">Status</option>
              <option value="priority">Priority</option>
              <option value="assignee">Assignee</option>
              <option value="projectName">Project</option>
            </select>
          </div>
        </div>
      )}

      {/* View Content */}
      {activeView === 'list' && (
        <>
          <TasksTable
            data={currentData}
            sortKey={sortKey}
            sortOrder={sortOrder}
            onSort={handleSort}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleSubtasks={toggleSubtasks}
            showSubtasks={showSubtasks}
            onAddSubtask={handleAddSubtask}
            groupBy={groupBy}
          />

          <PaginationWithIcon
            totalPages={totalPages}
            initialPage={currentPage}
            onPageChange={handlePageChange}
          />
        </>
      )}
      
      {activeView === 'kanban' && (
        <div className="bg-white rounded-lg shadow p-4">
          <TaskKanbanBoard 
            tasks={tasks} 
            onStatusChange={handleStatusChange}
            projects={projects}
            selectedProject={selectedProject}
          />
        </div>
      )}
      
      {activeView === 'task-list' && (
        <div className="bg-white rounded-lg shadow">
          <TaskList />
        </div>
      )}
      
      {activeView === 'gantt' && (
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-center text-gray-500 py-8">Gantt Chart View Coming Soon</p>
        </div>
      )}

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[600px] p-5 lg:p-10"
      >
        <h4 className="font-semibold text-gray-800 mb-7 text-title-sm dark:text-white/90">
          {editingTask ? (editingTask.isSubtask ? 'Add Subtask' : 'Edit Task') : 'Add New Task'}
        </h4>
        <AddTaskForm
          onClose={closeModal}
          initialData={editingTask}
          onSave={handleSave}
          projects={projects}
          tasks={tasks.filter(task => !task.isSubtask)} // Only parent tasks can be selected for subtasks
        />
      </Modal>
    </div>
  );
};

export default TaskComponent;
