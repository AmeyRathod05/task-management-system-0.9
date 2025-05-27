import React from 'react';
// Format date helper function
const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
};
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight, Edit, Trash2, Plus, ArrowUpDown } from 'lucide-react';
import { Task as TaskType, SubTask } from '@/services/taskService';
import Badge from '@/components/ui/badge/Badge';

// Helper functions to map numeric values to display text
const getStatusBadge = (status: number) => {
  const statusMap: Record<number, { label: string; color: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark' }> = {
    0: { label: 'To Do', color: 'light' },
    1: { label: 'In Progress', color: 'primary' },
    2: { label: 'In Review', color: 'warning' },
    3: { label: 'Completed', color: 'success' },
  };
  const { label, color } = statusMap[status] || { label: 'Unknown', color: 'light' };
  return <Badge color={color}>{label}</Badge>;
};

const getPriorityBadge = (priority: number) => {
  const priorityMap: Record<number, { label: string; color: 'primary' | 'success' | 'error' | 'warning' | 'info' | 'light' | 'dark' }> = {
    0: { label: 'Low', color: 'light' },
    1: { label: 'Medium', color: 'primary' },
    2: { label: 'High', color: 'error' },
  };
  const { label, color } = priorityMap[priority] || { label: 'Unknown', color: 'light' };
  return <Badge color={color}>{label}</Badge>;
};

const getNestedValue = (obj: any, path: string) => {
  if (!path) return '-';
  return path.split('.').reduce((acc, part) => acc && acc[part], obj) || '-';
};

interface TasksTableProps {
  data: (TaskType | SubTask)[];
  sortKey: string;
  sortOrder: 'asc' | 'desc';
  onSort: (key: string) => void;
  onEdit: (task: TaskType | SubTask) => void;
  onDelete: (id: number | string) => void;
  onToggleSubtasks?: (id: number) => void;
  showSubtasks?: Record<number, boolean>;
  onAddSubtask?: (id: number) => void;
  groupBy?: string | null;
}

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Task Name' },
  { key: 'project.name', label: 'Project' },
  { key: 'status', label: 'Status' },
  { key: 'priority', label: 'Priority' },
  { key: 'due_date', label: 'Due Date' },
];

const TasksTable: React.FC<TasksTableProps> = ({ 
  data, 
  sortKey, 
  sortOrder, 
  onSort, 
  onEdit, 
  onDelete, 
  onToggleSubtasks,
  showSubtasks = {},
  onAddSubtask,
  groupBy
}) => {
  // Handler for editing a task
  const handleEdit = (task: TaskType | SubTask) => {
    onEdit(task);
  };

  // Handler for deleting a task
  const handleDelete = (id: number | string) => {
    onDelete(id);
  };
  
  // Handler for toggling subtasks
  const handleToggleSubtasks = (id: number) => {
    onToggleSubtasks?.(id);
  };
  
  // Handler for adding a subtask
  const handleAddSubtask = (id: number) => {
    onAddSubtask?.(id);
  };
  
  // Group the data if groupBy is specified
  const groupedData = React.useMemo(() => {
    if (!groupBy) return null;
    
    const groups: Record<string, (TaskType | SubTask)[]> = {};
    
    data.forEach(task => {
      let groupValue: any;
      
      // Safe check for groupBy being a string
      const groupByStr = typeof groupBy === 'string' ? groupBy : '';
      
      if (groupByStr.includes('.')) {
        groupValue = getNestedValue(task, groupByStr);
      } else if (groupByStr) {
        groupValue = task[groupByStr as keyof (TaskType | SubTask)];
      } else {
        groupValue = 'Unknown';
      }
      
      const groupKey = String(groupValue || 'Unknown');
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(task);
    });
    
    return groups;
  }, [data, groupBy]);

  // Render a single task row
  const renderTaskRow = (task: TaskType | SubTask, depth = 0) => {
    const taskId = Number(task.id);
    const hasSubtasks = 'parent_task_id' in task && task.parent_task_id !== null; // Check if this is a subtask
    const isExpanded = showSubtasks?.[taskId];
    
    return (
      <React.Fragment key={task.id}>
        <TableRow className={`${depth > 0 ? 'bg-gray-50 dark:bg-gray-800' : ''}`}>
          {columns.map(({ key }) => (
            <TableCell key={key} className="px-4 py-3 border border-gray-100 dark:border-white/[0.05] whitespace-nowrap">
              {key === 'status' ? (
                getStatusBadge(task.status)
              ) : key === 'priority' ? (
                getPriorityBadge(task.priority)
              ) : key === 'due_date' ? (
                formatDate(task.due_date)
              ) : (
                getNestedValue(task, key)
              )}
            </TableCell>
          ))}
          <TableCell className="px-2 py-3 border border-gray-100 dark:border-white/[0.05] whitespace-nowrap">
            <div className="flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(task);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(getTaskId(task));
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {onAddSubtask && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={(e) => {
                  e.stopPropagation();
                  handleAddSubtask(getTaskId(task));
                }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  };

  // Render group header row
  const renderGroupHeader = (groupName: string) => (
    <TableRow key={`group-${groupName}`} className="bg-gray-100 dark:bg-gray-800">
      <TableCell className="px-4 py-2 font-medium text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 col-span-8">
        {groupName}
      </TableCell>
    </TableRow>
  );
  
  // Helper to check if a task has subtasks
  const hasSubtasks = (task: TaskType | SubTask): boolean => {
    return data.some(t => 'parent_task_id' in t && t.parent_task_id === task.id);
  };
  
  // Helper to safely get task ID as number
  const getTaskId = (task: TaskType | SubTask): number => {
    return Number(task.id);
  };

  return (
    <Table>
      <TableHeader className="border-t border-gray-100 dark:border-white/[0.05]">
        <TableRow>
          {columns.map(({ key, label }) => (
            <TableCell key={key} className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
              <button
                type="button"
                className="flex items-center gap-1 cursor-pointer bg-transparent border-0 p-0 m-0 font-medium text-gray-700 text-theme-xs dark:text-gray-400"
                onClick={() => onSort(key)}
              >
                {label}
                {sortKey === key && (
                  <ArrowUpDown className="h-3 w-3 ml-1" />
                )}
              </button>
            </TableCell>
          ))}
          <TableCell className="px-2 py-3 border border-gray-100 dark:border-white/[0.05]">
            <span className="font-medium text-gray-700 text-theme-xs dark:text-gray-400">Actions</span>
          </TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {groupedData ? (
          // Render grouped data
          Object.entries(groupedData).map(([groupName, tasks]) => (
            <React.Fragment key={`group-container-${groupName}`}>
              {renderGroupHeader(groupName)}
              {tasks.map(task => {
                // Skip subtasks in the main list
                if ('parent_task_id' in task && task.parent_task_id !== null) return null;
                
                const result = [renderTaskRow(task)];
                
                // Add subtasks if this task is expanded
                if (showSubtasks?.[task.id]) {
                  const subtasks = data.filter(t => 'parent_task_id' in t && t.parent_task_id === task.id);
                  subtasks.forEach(subtask => {
                    result.push(renderTaskRow(subtask, 1));
                  });
                }
                
                return result;
              })}
            </React.Fragment>
          ))
        ) : (
          // Render ungrouped data
          data.map(task => {
            // Skip subtasks in the main list or when grouping
            if (('parent_task_id' in task && task.parent_task_id !== null) || (groupBy && 'parent_task_id' in task && task.parent_task_id !== null)) {
              return null;
            }
            
            const result = [renderTaskRow(task)];
            
            // Add subtasks if this task is expanded
            if (showSubtasks?.[task.id]) {
              const subtasks = data.filter(t => 'parent_task_id' in t && t.parent_task_id === task.id);
              subtasks.forEach(subtask => {
                result.push(renderTaskRow(subtask, 1));
              });
            }
            
            return result;
          })
        )}
      </TableBody>
    </Table>
  );
};

export default TasksTable;
