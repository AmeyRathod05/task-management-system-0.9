import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Task as TaskType } from '@/services/taskService';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  flexRender,
  Row,
  VisibilityState,
  RowSelectionState,
  CellContext,
  Column,
  Table,
  TableMeta,
} from '@tanstack/react-table';
import { FiEdit, FiTrash2, FiCheck, FiX, FiPlus, FiFilter, FiSettings } from 'react-icons/fi';
import Badge from '@/components/ui/badge/Badge';

// Define custom table meta type
interface TableMetaType<TData> extends TableMeta<TData> {
  updateData: (rowIndex: number, columnId: string, value: any) => Promise<boolean>;
}

// Filter interface
interface FilterState {
  status?: number;
  priority?: number;
  project?: string;
  assignedTo?: string;
  dateRange?: {
    start: string;
    end: string;
  };
}

// Define the props interface
interface EditableTasksTableProps {
  data: TaskType[];
  onUpdate: (id: number, data: Partial<TaskType>) => Promise<boolean>;
  onDelete: (id: number) => Promise<boolean>;
  onEdit?: (task: TaskType) => void;
  onAddSubtask?: (parentId: number) => void;
  isLoading?: boolean;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (key: string) => void;
  showSubtasks?: Record<number, boolean>;
  onToggleSubtasks?: (taskId: number) => void;
}

// Define status and priority options
const statusOptions = [
  { value: 0, label: 'To Do' },
  { value: 1, label: 'In Progress' },
  { value: 2, label: 'In Review' },
  { value: 3, label: 'Completed' },
];

const priorityOptions = [
  { value: 0, label: 'Low' },
  { value: 1, label: 'Medium' },
  { value: 2, label: 'High' },
];

// Editable Cell Component
interface EditableCellProps<TData, TValue> {
  getValue: () => TValue;
  row: Row<TData>;
  column: Column<TData, TValue>;
  table: Table<TData>;
  type?: 'text' | 'select' | 'date' | 'number';
  options?: { value: string | number; label: string }[];
}

function EditableCell<TData, TValue>({
  getValue,
  row,
  column,
  table,
  type = 'text',
  options = [],
}: EditableCellProps<TData, TValue>) {
  const initialValue = getValue();
  const [value, setValue] = useState(initialValue);
  const [isEditing, setIsEditing] = useState(false);

  // When the value changes externally, update our state
  useEffect(() => {
    setValue(getValue());
  }, [getValue]);

  const onBlur = () => {
    (table.options.meta as TableMetaType<TData>)?.updateData(row.index, column.id, value);
    setIsEditing(false);
  };

  const onCancel = () => {
    setValue(initialValue);
    setIsEditing(false);
  };

  const onSave = () => {
    (table.options.meta as TableMetaType<TData>)?.updateData(row.index, column.id, value);
    setIsEditing(false);
  };

  if (!isEditing) {
    return (
      <div 
        className="px-4 py-2 cursor-pointer hover:bg-gray-50 w-full h-full flex items-center min-h-[40px]"
        onClick={() => setIsEditing(true)}
      >
        {type === 'select' && column.id === 'status' && (
          <Badge color={
            value === 3 ? 'success' :
            value === 2 ? 'warning' :
            value === 1 ? 'primary' :
            'light'
          }>
            {statusOptions.find(opt => opt.value === value)?.label || String(value)}
          </Badge>
        )}
        {type === 'select' && column.id === 'priority' && (
          <Badge color={
            value === 2 ? 'error' :
            value === 1 ? 'primary' :
            'light'
          }>
            {priorityOptions.find(opt => opt.value === value)?.label || String(value)}
          </Badge>
        )}
        {type === 'date' && (
          <span>
            {value ? new Date(value as string).toLocaleDateString() : '-'}
          </span>
        )}
        {type === 'number' && (
          <span>{String(value)}</span>
        )}
        {type === 'text' && column.id !== 'status' && column.id !== 'priority' && (
          <span>{String(value)}</span>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 py-2 flex items-center gap-1 min-h-[40px]">
      {type === 'select' && (
        <select
          value={value as string | number}
          onChange={e => setValue((column.id === 'priority' || column.id === 'status' ? Number(e.target.value) : e.target.value) as unknown as TValue)}
          className="border rounded px-2 py-1 text-sm w-full min-w-[100px]"
          autoFocus
          onBlur={onBlur}
        >
          {options.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}
      {type === 'date' && (
        <input
          type="date"
          value={value as string}
          onChange={e => setValue(e.target.value as unknown as TValue)}
          className="border rounded px-2 py-1 text-sm w-full min-w-[120px]"
          autoFocus
          onBlur={onBlur}
        />
      )}
      {type === 'number' && (
        <input
          type="number"
          value={value as number}
          onChange={e => setValue(Number(e.target.value) as unknown as TValue)}
          className="border rounded px-2 py-1 text-sm w-full min-w-[80px]"
          autoFocus
          onBlur={onBlur}
        />
      )}
      {type === 'text' && (
        <input
          type="text"
          value={value as string}
          onChange={e => setValue(e.target.value as unknown as TValue)}
          className="border rounded px-2 py-1 text-sm w-full min-w-[150px]"
          autoFocus
          onBlur={onBlur}
        />
      )}
      <button 
        onClick={onSave}
        className="text-green-600 hover:text-green-800 flex-shrink-0"
        title="Save"
      >
        <FiCheck className="h-4 w-4" />
      </button>
      <button 
        onClick={onCancel}
        className="text-red-600 hover:text-red-800 flex-shrink-0"
        title="Cancel"
      >
        <FiX className="h-4 w-4" />
      </button>
    </div>
  );
}

// Custom Table Components
interface TableCellProps {
  children: React.ReactNode;
  className?: string;
  width?: string | number;
  [key: string]: any;
}

const TableHeadCell = ({ children, className = '', ...props }: TableCellProps) => (
  <th 
    className={`relative px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50 border-b border-r border-gray-200 last:border-r-0 ${className}`}
    {...props}
  >
    {children}
  </th>
);

const TableCell = ({ children, className = '', width, ...props }: TableCellProps) => (
  <td 
    className={`p-0 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 relative border-b border-r border-gray-200 last:border-r-0 ${className}`}
    style={{ width, minWidth: width, maxWidth: width }}
    {...props}
  >
    {children}
  </td>
);

interface TableRowProps {
  children: React.ReactNode;
  [key: string]: any;
}

const TableRow = ({ children, ...props }: TableRowProps) => (
  <tr 
    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
    {...props}
  >
    {children}
  </tr>
);

// Filter Panel Component
interface FilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  data: TaskType[];
}

const FilterPanel: React.FC<FilterPanelProps> = ({ isOpen, onClose, filters, onFiltersChange, data }) => {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleApply = () => {
    onFiltersChange(localFilters);
    onClose();
  };

  const handleClear = () => {
    const emptyFilters: FilterState = {};
    setLocalFilters(emptyFilters);
    onFiltersChange(emptyFilters);
    onClose();
  };

  const uniqueProjects = useMemo(() => {
    const projects = data.map(task => task.project?.name).filter(Boolean);
    return [...new Set(projects)];
  }, [data]);

  const uniqueAssignees = useMemo(() => {
    const assignees = data.map(task => task.assigned_to).filter(Boolean);
    return [...new Set(assignees)];
  }, [data]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/25 z-[999999]"
        onClick={onClose}
      />
      
      {/* Filter Panel */}
      <div className="fixed top-0 right-0 h-full w-80 bg-gray-50 shadow-xl z-[1000000] overflow-y-auto border-l border-gray-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FiX className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={localFilters.status ?? ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  status: e.target.value ? Number(e.target.value) : undefined
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Status</option>
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={localFilters.priority ?? ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  priority: e.target.value ? Number(e.target.value) : undefined
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Priorities</option>
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Project Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
              <select
                value={localFilters.project ?? ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  project: e.target.value || undefined
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Projects</option>
                {uniqueProjects.map(project => (
                  <option key={project} value={project}>
                    {project}
                  </option>
                ))}
              </select>
            </div>

            {/* Assigned To Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assigned To</label>
              <select
                value={localFilters.assignedTo ?? ''}
                onChange={(e) => setLocalFilters({
                  ...localFilters,
                  assignedTo: e.target.value || undefined
                })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
              >
                <option value="">All Assignees</option>
                {uniqueAssignees.map(assignee => (
                  <option key={assignee} value={String(assignee)}>
                    {assignee}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Range Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Due Date Range</label>
              <div className="space-y-2">
                <input
                  type="date"
                  placeholder="Start Date"
                  value={localFilters.dateRange?.start ?? ''}
                  onChange={(e) => setLocalFilters({
                    ...localFilters,
                    dateRange: {
                      ...localFilters.dateRange,
                      start: e.target.value,
                      end: localFilters.dateRange?.end ?? ''
                    }
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={localFilters.dateRange?.end ?? ''}
                  onChange={(e) => setLocalFilters({
                    ...localFilters,
                    dateRange: {
                      start: localFilters.dateRange?.start ?? '',
                      end: e.target.value
                    }
                  })}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleClear}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Clear
            </button>
            <button
              onClick={handleApply}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// Column Visibility Toggle Component
interface ColumnVisibilityToggleProps {
  table: Table<any>;
}

const ColumnVisibilityToggle: React.FC<ColumnVisibilityToggleProps> = ({ table }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded"
        title="Configure Columns"
      >
        <FiSettings className="h-4 w-4" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              {table
                .getAllColumns()
                .filter((column) => typeof column.accessorFn !== 'undefined' && column.getCanHide())
                .map((column) => (
                  <div 
                    key={column.id} 
                    className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => {
                      column.toggleVisibility(!column.getIsVisible());
                    }}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                      checked={column.getIsVisible()}
                      onChange={() => {}}
                    />
                    <span className="capitalize">{column.id.replace(/_/g, ' ')}</span>
                  </div>
                ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Main Component
const EditableTasksTable: React.FC<EditableTasksTableProps> = ({
  data = [],
  onUpdate,
  onDelete,
  onEdit,
  onAddSubtask,
  isLoading = false,
  sortKey,
  sortOrder,
  onSort,
  showSubtasks = {},
  onToggleSubtasks,
}) => {
  // State management
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // Hide some columns by default
    id: false,
    created_at: false,
    updated_at: false,
    created_by: false,
    assigned_to: false,
    task_list_id: false,
    project_id: false,
    parent_task_id: false,
    start_date: false,
    end_date: false,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [filters, setFilters] = useState<FilterState>({});
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);

  // Update data function
  const updateData = useCallback(
    async (rowIndex: number, columnId: string, value: any) => {
      const task = data[rowIndex];
      if (!task || !task.id) return false;

      const updates: Partial<TaskType> = {
        [columnId]: value,
      };

      try {
        const success = await onUpdate(task.id, updates);
        return success;
      } catch (error) {
        console.error('Error updating task:', error);
        return false;
      }
    },
    [data, onUpdate]
  );

  // Filter data based on applied filters
  const filteredData = useMemo(() => {
    return data.filter(task => {
      if (filters.status !== undefined && task.status !== filters.status) return false;
      if (filters.priority !== undefined && task.priority !== filters.priority) return false;
      if (filters.project && task.project?.name !== filters.project) return false;
      if (filters.assignedTo && String(task.assigned_to) !== filters.assignedTo) return false;
      if (filters.dateRange?.start && task.due_date && new Date(task.due_date) < new Date(filters.dateRange.start)) return false;
      if (filters.dateRange?.end && task.due_date && new Date(task.due_date) > new Date(filters.dateRange.end)) return false;
      return true;
    });
  }, [data, filters]);

  // Define columns (removed description column)
  const columns = useMemo<ColumnDef<TaskType>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 80,
        cell: (info: CellContext<TaskType, any>) => (
          <div className="px-4 py-2">
            <span className="text-xs text-gray-500">{String(info.getValue())}</span>
          </div>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Task Name',
        size: 300,
        cell: (info: CellContext<TaskType, any>) => (
          <EditableCell
            getValue={info.getValue}
            row={info.row}
            column={info.column}
            table={info.table}
            type="text"
          />
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        cell: (info: CellContext<TaskType, any>) => (
          <EditableCell
            getValue={info.getValue}
            row={info.row}
            column={info.column}
            table={info.table}
            type="select"
            options={statusOptions}
          />
        ),
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        size: 100,
        cell: (info: CellContext<TaskType, any>) => (
          <EditableCell
            getValue={info.getValue}
            row={info.row}
            column={info.column}
            table={info.table}
            type="select"
            options={priorityOptions}
          />
        ),
      },
      {
        accessorKey: 'project.name',
        header: 'Project',
        size: 150,
        cell: (info: CellContext<TaskType, any>) => (
          <div className="px-4 py-2">
            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
              {String(info.getValue()) || 'No Project'}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'due_date',
        header: 'Due Date',
        size: 120,
        cell: (info: CellContext<TaskType, any>) => (
          <EditableCell
            getValue={info.getValue}
            row={info.row}
            column={info.column}
            table={info.table}
            type="date"
          />
        ),
      },
      {
        accessorKey: 'start_date',
        header: 'Start Date',
        size: 120,
        cell: (info: CellContext<TaskType, any>) => (
          <EditableCell
            getValue={info.getValue}
            row={info.row}
            column={info.column}
            table={info.table}
            type="date"
          />
        ),
      },
      {
        accessorKey: 'end_date',
        header: 'End Date',
        size: 120,
        cell: (info: CellContext<TaskType, any>) => (
          <EditableCell
            getValue={info.getValue}
            row={info.row}
            column={info.column}
            table={info.table}
            type="date"
          />
        ),
      },
      {
        accessorKey: 'assigned_to',
        header: 'Assigned To',
        size: 120,
        cell: (info: CellContext<TaskType, any>) => (
          <div className="px-4 py-2">
            <span>{String(info.getValue()) || 'Unassigned'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        size: 120,
        cell: (info: CellContext<TaskType, any>) => (
          <div className="px-4 py-2">
            <span className="text-xs text-gray-500">
              {info.getValue() ? new Date(info.getValue() as string).toLocaleDateString() : '-'}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'updated_at',
        header: 'Updated',
        size: 120,
        cell: (info: CellContext<TaskType, any>) => (
          <div className="px-4 py-2">
            <span className="text-xs text-gray-500">
              {info.getValue() ? new Date(info.getValue() as string).toLocaleDateString() : '-'}
            </span>
          </div>
        ),
      },
      {
        id: 'actions',
        header: () => (
          <div className="flex items-center justify-between">
            <span>Actions</span>
            <ColumnVisibilityToggle table={table} />
          </div>
        ),
        size: 120,
        cell: ({ row }: { row: Row<TaskType> }) => (
          <div className="flex items-center space-x-1 px-4 py-2">
            <button
              onClick={() => onEdit?.(row.original)}
              className="text-blue-600 hover:text-blue-900 p-1"
              title="Edit"
            >
              <FiEdit className="h-4 w-4" />
            </button>
            <button
              onClick={() => row.original.id && onDelete(row.original.id)}
              className="text-red-600 hover:text-red-900 p-1"
              title="Delete"
              disabled={!row.original.id}
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
            {onAddSubtask && (
              <button
                onClick={() => row.original.id && onAddSubtask(row.original.id)}
                className="text-green-600 hover:text-green-900 p-1"
                title="Add Subtask"
              >
                <FiPlus className="h-4 w-4" />
              </button>
            )}
          </div>
        ),
      },
    ],
    [onDelete, onEdit, onAddSubtask]
  );

  // Initialize table
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
    meta: {
      updateData,
    } as TableMetaType<TaskType>,
  });

  // Get active filter count
  const activeFilterCount = Object.values(filters).filter(value => 
    value !== undefined && value !== '' && 
    !(typeof value === 'object' && (!value.start && !value.end))
  ).length;

  return (
    <div className="space-y-4">
      {/* Filter Panel */}
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        data={data}
      />

      {/* Header with Filter Button */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tasks
          </h2>
          <span className="px-2 py-1 text-sm text-gray-600 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">
            {filteredData.length} tasks
          </span>
        </div>
        <button
          onClick={() => setIsFilterPanelOpen(true)}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md border ${
            activeFilterCount > 0 
              ? 'bg-blue-50 text-blue-700 border-blue-200' 
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
          }`}
        >
          <FiFilter className="h-4 w-4" />
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-blue-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Active Filters Display */}
      {activeFilterCount > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm text-gray-600">Filters:</span>
          {filters.status !== undefined && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              Status: {statusOptions.find(s => s.value === filters.status)?.label}
              <button
                onClick={() => setFilters({ ...filters, status: undefined })}
                className="hover:bg-blue-200 rounded-full p-0.5"
              >
                <FiX className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.priority !== undefined && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
              Priority: {priorityOptions.find(p => p.value === filters.priority)?.label}
              <button
                onClick={() => setFilters({ ...filters, priority: undefined })}
                className="hover:bg-green-200 rounded-full p-0.5"
              >
                <FiX className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.project && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              Project: {filters.project}
              <button
                onClick={() => setFilters({ ...filters, project: undefined })}
                className="hover:bg-purple-200 rounded-full p-0.5"
              >
                <FiX className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.assignedTo && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
              Assigned: {filters.assignedTo}
              <button
                onClick={() => setFilters({ ...filters, assignedTo: undefined })}
                className="hover:bg-yellow-200 rounded-full p-0.5"
              >
                <FiX className="h-3 w-3" />
              </button>
            </span>
          )}
          {filters.dateRange && (filters.dateRange.start || filters.dateRange.end) && (
            <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
              Date: {filters.dateRange.start || 'Start'} - {filters.dateRange.end || 'End'}
              <button
                onClick={() => setFilters({ ...filters, dateRange: undefined })}
                className="hover:bg-red-200 rounded-full p-0.5"
              >
                <FiX className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead>
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => (
                      <TableHeadCell
                        key={header.id}
                        width={header.getSize()}
                        className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center space-x-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span className="text-gray-400">
                              {{
                                asc: ' ↑',
                                desc: ' ↓',
                              }[header.column.getIsSorted() as string] ?? ' ↕'}
                            </span>
                          )}
                        </div>
                      </TableHeadCell>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {table.getRowModel().rows.map(row => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map(cell => (
                      <TableCell
                        key={cell.id}
                        width={cell.column.getSize()}
                      >
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-4 py-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={e => table.setPageSize(Number(e.target.value))}
            className="border border-gray-300 dark:border-gray-600 rounded px-2 py-1 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
          >
            {[10, 20, 30, 40, 50].map(pageSize => (
              <option key={pageSize} value={pageSize}>
                Show {pageSize}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            First
          </button>
          <button
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Previous
          </button>
          <button
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Next
          </button>
          <button
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="px-3 py-1 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Last
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditableTasksTable;
