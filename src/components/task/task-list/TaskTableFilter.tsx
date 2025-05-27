import React, { useState } from 'react';
import { Task, Project, FilterOptions } from './types/Task';
import { FiSearch, FiFilter, FiX } from 'react-icons/fi';

interface TaskTableFilterProps {
  projects: Project[];
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  onGlobalFilter: (value: string) => void;
  globalFilter: string;
}

const statusOptions = [
  { value: '', label: 'All Status' },
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' },
];

const priorityOptions = [
  { value: '', label: 'All Priorities' },
  { value: '0', label: 'Low' },
  { value: '1', label: 'Medium' },
  { value: '2', label: 'High' },
  { value: '3', label: 'Critical' },
];

const categoryOptions = [
  { value: '', label: 'All Categories' },
  { value: 'Development', label: 'Development' },
  { value: 'Design', label: 'Design' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Backend', label: 'Backend' },
  { value: 'Frontend', label: 'Frontend' },
  { value: 'Documentation', label: 'Documentation' },
  { value: 'Testing', label: 'Testing' },
];

const TaskTableFilter: React.FC<TaskTableFilterProps> = ({
  projects,
  filters,
  onFilterChange,
  onClearFilters,
  onGlobalFilter,
  globalFilter,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterUpdate = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters };
    
    if (value === '' || value === undefined) {
      delete newFilters[key];
    } else {
      if (key === 'priority') {
        newFilters[key] = value === '' ? undefined : Number(value);
      } else {
        newFilters[key] = value;
      }
    }
    
    onFilterChange(newFilters);
  };

  const handleDateRangeUpdate = (type: 'start' | 'end', value: string) => {
    const newFilters = { ...filters };
    
    if (!newFilters.dateRange) {
      newFilters.dateRange = { start: '', end: '' };
    }
    
    newFilters.dateRange[type] = value;
    
    // Remove dateRange if both start and end are empty
    if (!newFilters.dateRange.start && !newFilters.dateRange.end) {
      delete newFilters.dateRange;
    }
    
    onFilterChange(newFilters);
  };

  const hasActiveFilters = Object.keys(filters).length > 0 || globalFilter;

  return (
    <div className="space-y-4">
      {/* Search and Filter Toggle */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={globalFilter}
            onChange={(e) => onGlobalFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${
            hasActiveFilters 
              ? 'border-blue-500 bg-blue-50 text-blue-700' 
              : 'border-gray-300 hover:bg-gray-50'
          }`}
        >
          <FiFilter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {Object.keys(filters).length + (globalFilter ? 1 : 0)}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={() => {
              onClearFilters();
              onGlobalFilter('');
            }}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 border border-red-300 rounded-lg transition-colors"
          >
            <FiX className="h-4 w-4" />
            Clear All
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border">
          {/* Project Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Project
            </label>
            <select
              value={filters.projectId || ''}
              onChange={(e) => handleFilterUpdate('projectId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
              <option value="unassigned">Unassigned</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterUpdate('status', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Priority
            </label>
            <select
              value={filters.priority !== undefined ? String(filters.priority) : ''}
              onChange={(e) => handleFilterUpdate('priority', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterUpdate('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categoryOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Assigned To Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Assigned To
            </label>
            <input
              type="text"
              placeholder="Enter user ID..."
              value={filters.assignedTo || ''}
              onChange={(e) => handleFilterUpdate('assignedTo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Date Range Filters */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date From
            </label>
            <input
              type="date"
              value={filters.dateRange?.start || ''}
              onChange={(e) => handleDateRangeUpdate('start', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Due Date To
            </label>
            <input
              type="date"
              value={filters.dateRange?.end || ''}
              onChange={(e) => handleDateRangeUpdate('end', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-end">
            <button
              onClick={() => {
                onClearFilters();
                setIsExpanded(false);
              }}
              className="w-full px-4 py-2 text-gray-600 hover:bg-gray-200 border border-gray-300 rounded-md transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {globalFilter && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
              Search: "{globalFilter}"
              <button
                onClick={() => onGlobalFilter('')}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <FiX className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {filters.projectId && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
              Project: {projects.find(p => p.id === filters.projectId)?.name || filters.projectId}
              <button
                onClick={() => handleFilterUpdate('projectId', '')}
                className="hover:bg-green-200 rounded-full p-0.5"
              >
                <FiX className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {filters.status && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
              Status: {statusOptions.find(s => s.value === filters.status)?.label}
              <button
                onClick={() => handleFilterUpdate('status', '')}
                className="hover:bg-purple-200 rounded-full p-0.5"
              >
                <FiX className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {filters.priority !== undefined && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 text-sm rounded-full">
              Priority: {priorityOptions.find(p => p.value === String(filters.priority))?.label}
              <button
                onClick={() => handleFilterUpdate('priority', '')}
                className="hover:bg-orange-200 rounded-full p-0.5"
              >
                <FiX className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default TaskTableFilter;
