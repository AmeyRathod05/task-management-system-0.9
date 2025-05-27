import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Task as TaskType, TaskList } from '@/services/taskService';
import { ExtendedTaskList } from './types';
import { useMockTasks } from './MockDataAdapter';
import Input from '@/components/form/input/InputField';
import Button from '@/components/ui/button/Button';
import Notification from '@/components/ui/notification/Notification';
import TasksTable from './TasksTable';
import EditableTasksTable from './EditableTasksTable';
import AddTaskForm from './AddTaskForm';
import PaginationWithIcon from '@/components/ui/pagination/PaginationWitIcon';
import TaskKanbanBoard from './TaskKanbanBoard';
import TaskGanttChart from './TaskGanttChart';
import Select from '@/components/form/Select';
import { CloseIcon } from '@/icons';

type ViewType = 'list' | 'kanban' | 'gantt' | 'editable';

// SlideInPanel component for the add/edit task form
interface SlideInPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

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
        className={`mb-0 fixed inset-0 bg-black/75 z-[100000] transition-opacity duration-300 ${
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
              className="text-gray-400 hover:text-gray-500"
              aria-label="Close panel"
            >
              <CloseIcon className="text-gray-400" />
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

const Task: React.FC = () => {
  const [isAddPanelOpen, setIsAddPanelOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortKey, setSortKey] = useState<string>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [taskLists, setTaskLists] = useState<TaskList[]>([]);
  const [selectedTaskList, setSelectedTaskList] = useState<number | 'all'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingTask, setEditingTask] = useState<Partial<TaskType> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationType, setNotificationType] = useState<'success' | 'error'>('success');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [activeView, setActiveView] = useState<ViewType>('editable');
  const [showSubtasks, setShowSubtasks] = useState<Record<number, boolean>>({});
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Use the MockDataAdapter to get tasks
  const { 
    tasks: mockTasks, 
    loading: mockLoading, 
    error: mockError,
    getTaskList,
    addTask,
    updateTask,
    deleteTask
  } = useMockTasks();
  
  // Fetch tasks and task lists with pagination
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get paginated tasks from mock data
      const taskListResponse = await getTaskList(currentPage, itemsPerPage);
      
      // Set the tasks and pagination info
      setTasks(taskListResponse.data);
      setTotalItems(taskListResponse.total);
      setTotalPages(taskListResponse.last_page);
      
      // Set a default task list
      setTaskLists([{
        id: 0,
        name: 'All Tasks',
        description: 'All available tasks',
        user_id: 1,
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        tasks_count: mockTasks.length
      }]);
      
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, itemsPerPage, getTaskList, mockTasks.length]);

  // Update local state when mock data changes
  useEffect(() => {
    setLoading(mockLoading);
    if (mockError) setError(mockError);
    
    // If we have mock tasks but no local tasks, fetch the data
    if (mockTasks.length > 0 && tasks.length === 0) {
      fetchData();
    }
  }, [mockTasks, mockLoading, mockError, tasks.length, fetchData]);
  
  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handlers
  const handleSort = useCallback((key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
    // Reset to first page when sorting changes
    setCurrentPage(1);
  }, [sortKey, sortOrder]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle search with debounce
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when search changes
  }, []);

  // Handle task list filter change
  const handleTaskListChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedTaskList(value === 'all' ? 'all' : Number(value));
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  const handleAddTask = useCallback(() => {
    setEditingTask({
      name: '',
      description: '',
      status: 0, // To Do
      priority: 1, // Medium
      task_list_id: selectedTaskList !== 'all' ? selectedTaskList : undefined
    });
    setIsAddPanelOpen(true);
  }, [selectedTaskList]);

  const handleEdit = useCallback((task: TaskType) => {
    setEditingTask({ ...task });
    setIsAddPanelOpen(true);
  }, []);

  const handleClosePanel = useCallback(() => {
    setIsAddPanelOpen(false);
    setEditingTask(null);
  }, []);

  const handleDelete = useCallback(async (id: number | string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return false;

    try {
      const numericId = typeof id === 'string' ? parseInt(id) : id;
      const result = await deleteTask(numericId);

      setTasks((prev) => prev.filter((task) => task.id !== numericId));

      setNotificationType('success');
      setNotificationMessage('Task deleted successfully!');
      setShowNotification(true);

      fetchData();
      return result;
    } catch (err) {
      console.error('Error deleting task:', err);
      setNotificationType('error');
      setNotificationMessage('Failed to delete task. Please try again.');
      setShowNotification(true);
      return false;
    }
  }, [deleteTask, fetchData]);

  const handleUpdate = useCallback(
    async (id: number, updates: Partial<TaskType>): Promise<boolean> => {
      try {
        await updateTask(id, updates);
        fetchData();
        setNotificationMessage('Task updated successfully');
        setNotificationType('success');
        setShowNotification(true);
        return true;
      } catch (err) {
        console.error('Error updating task:', err);
        setNotificationMessage('Failed to update task');
        setNotificationType('error');
        setShowNotification(true);
        return false;
      }
    },
    [updateTask, fetchData]
  );

  const handleSaveTask = useCallback(
    async (taskData: Partial<TaskType>) => {
      try {
        setIsSaving(true);

        if (editingTask?.id) {
          await updateTask(editingTask.id as number, taskData);
          setNotificationMessage('Task updated successfully');
        } else {
          const createData = {
            ...taskData,
            status: taskData.status || 0,
            priority: taskData.priority || 1,
          };
          await addTask(createData as Omit<TaskType, 'id'>);
          setNotificationMessage('Task created successfully');
        }

        setNotificationType('success');
        setShowNotification(true);
        setIsAddPanelOpen(false);
        setEditingTask(null);

        fetchData();
      } catch (err) {
        console.error('Error saving task:', err);
        setNotificationType('error');
        setNotificationMessage('Failed to save task');
        setShowNotification(true);
      } finally {
        setIsSaving(false);
      }
    },
    [editingTask, fetchData, updateTask, addTask]
  );

  const toggleSubtasks = useCallback((taskId: number) => {
    setShowSubtasks((prev) => ({ ...prev, [taskId]: !prev[taskId] }));
  }, []);

  const handleViewChange = useCallback((view: ViewType) => {
    setActiveView(view);
    setCurrentPage(1);
  }, []);

  const renderView = useCallback(() => {
    switch (activeView) {
      case 'editable':
        return (
          <EditableTasksTable
            data={tasks}
            onUpdate={handleUpdate}
            onDelete={(id) => handleDelete(Number(id))}
            onEdit={handleEdit}
            onAddSubtask={(parentId) => {
              const parentTask = tasks.find((t) => t.id === parentId);
              if (parentTask) {
                setEditingTask({
                  name: `Subtask of ${parentTask.name}`,
                  description: '',
                  status: 0,
                  priority: parentTask.priority || 1,
                  parent_task_id: parentId,
                  project_id: parentTask.project_id,
                  task_list_id: parentTask.task_list_id,
                });
                setIsAddPanelOpen(true);
              }
            }}
            isLoading={loading}
            sortKey={sortKey}
            sortOrder={sortOrder}
            onSort={handleSort}
            showSubtasks={showSubtasks}
            onToggleSubtasks={toggleSubtasks}
          />
        );
      case 'kanban':
        return (
          <TaskKanbanBoard
            tasks={tasks}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onStatusChange={async (taskId, status) => {
              try {
                await updateTask(taskId, { status });
                fetchData();
                setNotificationMessage('Task status updated successfully');
                setNotificationType('success');
                setShowNotification(true);
              } catch (err) {
                console.error('Error updating task status:', err);
                setNotificationMessage('Failed to update task status');
                setNotificationType('error');
                setShowNotification(true);
              }
            }}
          />
        );
      case 'gantt':
        return (
          <TaskGanttChart
            tasks={tasks}
            onEdit={handleEdit}
            onDelete={(id) => handleDelete(id)}
          />
        );
      case 'list':
      default:
        return (
          <TasksTable
            data={tasks}
            sortKey={sortKey}
            sortOrder={sortOrder}
            onSort={handleSort}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleSubtasks={toggleSubtasks}
            showSubtasks={showSubtasks}
            onAddSubtask={(parentId) => {
              const parentTask = tasks.find(t => t.id === parentId);
              if (parentTask) {
                setEditingTask({
                  name: `Subtask of ${parentTask.name}`,
                  description: '',
                  status: 0, // To Do
                  priority: parentTask.priority || 1,
                  parent_task_id: parentId,
                  project_id: parentTask.project_id,
                  task_list_id: parentTask.task_list_id
                });
                setIsAddPanelOpen(true);
              }
            }}
          />
        );
    }
  }, [activeView, tasks, handleEdit, handleDelete, handleSort, sortKey, sortOrder, fetchData, toggleSubtasks, showSubtasks, handleUpdate, loading]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Manage your tasks and track progress efficiently
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          {/* Task List Filter */}
          <div className="w-full md:w-48">
            <Select
              defaultValue={String(selectedTaskList)}
              onChange={(value) => {
                const newValue = value === 'all' ? 'all' : Number(value);
                setSelectedTaskList(newValue);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'All Task Lists' },
                ...taskLists.map(list => ({
                  value: String(list.id),
                  label: list.name
                }))
              ]}
              className="w-full"
            />
          </div>
          
          
          {/* View Toggle */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleViewChange('editable')}
              className={`p-2 rounded-md ${activeView === 'editable' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              title="Editable Table View"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 6V18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={() => handleViewChange('list')}
              className={`p-2 rounded-md ${activeView === 'list' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              title="List View"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 12H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M8 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 6H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 12H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3 18H3.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={() => handleViewChange('kanban')}
              className={`p-2 rounded-md ${activeView === 'kanban' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              title="Kanban View"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 7V17M8 7H18M8 7H4M16 17V7M16 17H4M16 17H20M4 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button
              onClick={() => handleViewChange('gantt')}
              className={`p-2 rounded-md ${activeView === 'gantt' ? 'bg-gray-100 dark:bg-gray-700' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
              title="Gantt View"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8 7V17M8 7H4M8 7H16M16 17V7M16 17H20M16 17H12M12 17V12M12 12V7M12 12H8M20 17V7M4 7V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          
          {/* Add Task Button */}
          <Button 
            onClick={handleAddTask}
            className="bg-primary text-white hover:bg-primary-dark flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
            </svg>
            Add Task
          </Button>
        </div>
      </div>

      {/* Notification Container - Fixed position with z-index to overlap header */}
      {(isSaving || showNotification) && (
        <div className="fixed top-4 right-4 z-50">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-white dark:bg-gray-800 shadow-lg rounded-lg px-4 py-2 border border-gray-200 dark:border-gray-700">
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-brand-500 border-t-transparent"></div>
                <span>Saving changes...</span>
              </div>
            ) : (
              <Notification
                variant={notificationType}
                title={notificationMessage}
                hideDuration={3000}
              />
            )}
          </div>
        </div>
      )}

      {/* Loading and Error States */}
      {loading ? (
        <div className="text-center py-8">Loading tasks...</div>
      ) : error ? (
        <div className="text-red-500 text-center py-4">{error}</div>
      ) : (
        <>
          {renderView()}
          
          {/* Pagination */}
          {(activeView === 'list' || activeView === 'editable') && totalItems > itemsPerPage && (
            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-500">
                Showing {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} tasks
              </div>
              <PaginationWithIcon
                totalPages={totalPages}
                initialPage={currentPage}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </>
      )}

      {/* Add/Edit Task Slide-in Panel */}
      <SlideInPanel 
        isOpen={isAddPanelOpen} 
        onClose={handleClosePanel}
        title={editingTask?.id ? 'Edit Task' : 'Create New Task'}
        subtitle={editingTask?.id ? 'Update the task details below' : 'Fill in the details below to create a new task'}
      >
        <AddTaskForm
          onClose={handleClosePanel}
          onSave={handleSaveTask}
          initialData={editingTask as any}
          isLoading={isSaving}
        />
      </SlideInPanel>
    </div>
  );
};

export default Task;
