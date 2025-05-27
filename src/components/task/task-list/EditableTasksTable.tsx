import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Task } from './types/Task';
import { ColumnVisibilityToggle } from '../../user/Project/ColumnVisibilityToggle';
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
import { FiEdit, FiTrash2, FiCheck, FiX } from 'react-icons/fi';

// Define custom table meta type
interface TableMetaType<TData> extends TableMeta<TData> {
  updateData: (rowIndex: number, columnId: string, value: any) => Promise<boolean>;
}

// Define the props interface
interface EditableTasksTableProps {
  initialData: Task[];
  onUpdate: (id: string, data: Partial<Task>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onEdit?: (task: Task) => void;
  isLoading?: boolean;
}

// Define status and priority options
const statusOptions = [
  { value: 'todo', label: 'To Do' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'blocked', label: 'Blocked' },
];

const priorityOptions = [
  { value: 0, label: 'Low' },
  { value: 1, label: 'Medium' },
  { value: 2, label: 'High' },
  { value: 3, label: 'Critical' },
];

const categoryOptions = [
  { value: 'Development', label: 'Development' },
  { value: 'Design', label: 'Design' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Backend', label: 'Backend' },
  { value: 'Frontend', label: 'Frontend' },
  { value: 'Documentation', label: 'Documentation' },
  { value: 'Testing', label: 'Testing' },
];

// Editable Cell Component
interface EditableCellProps<TData, TValue> {
  getValue: () => TValue;
  row: Row<TData>;
  column: Column<TData, TValue>;
  table: Table<TData>;
  type?: 'text' | 'select' | 'date' | 'number' | 'textarea';
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
        className="px-4 py-2 cursor-pointer hover:bg-gray-50 w-full h-full flex items-center"
        onClick={() => setIsEditing(true)}
      >
        {type === 'select' && column.id === 'status' && (
          <span className={`px-2 py-1 text-xs rounded-full ${
            value === 'todo' ? 'bg-gray-100 text-gray-800' :
            value === 'in-progress' ? 'bg-blue-100 text-blue-800' :
            value === 'completed' ? 'bg-green-100 text-green-800' :
            value === 'blocked' ? 'bg-red-100 text-red-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {statusOptions.find(opt => opt.value === value)?.label || String(value)}
          </span>
        )}
        {type === 'select' && column.id === 'priority' && (
          <span className={`px-2 py-1 text-xs rounded-full ${
            value === 3 ? 'bg-red-100 text-red-800' :
            value === 2 ? 'bg-orange-100 text-orange-800' :
            value === 1 ? 'bg-yellow-100 text-yellow-800' :
            'bg-green-100 text-green-800'
          }`}>
            {priorityOptions.find(opt => opt.value === value)?.label || String(value)}
          </span>
        )}
        {type === 'select' && column.id === 'category' && (
          <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-800">
            {String(value)}
          </span>
        )}
        {type === 'date' && (
          <span>
            {value ? new Date(value as string).toLocaleDateString() : '-'}
          </span>
        )}
        {type === 'number' && (
          <span>{String(value)}</span>
        )}
        {(type === 'text' || type === 'textarea') && column.id !== 'status' && column.id !== 'priority' && column.id !== 'category' && (
          <span className={type === 'textarea' ? 'line-clamp-2' : ''}>{String(value)}</span>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 py-2 flex items-center gap-1">
      {type === 'select' && (
        <select
          value={value as string | number}
          onChange={e => setValue((column.id === 'priority' ? Number(e.target.value) : e.target.value) as unknown as TValue)}
          className="border rounded px-2 py-1 text-sm w-full"
          autoFocus
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
          className="border rounded px-2 py-1 text-sm w-full"
          autoFocus
        />
      )}
      {type === 'number' && (
        <input
          type="number"
          value={value as number}
          onChange={e => setValue(Number(e.target.value) as unknown as TValue)}
          className="border rounded px-2 py-1 text-sm w-full"
          autoFocus
        />
      )}
      {type === 'textarea' && (
        <textarea
          value={value as string}
          onChange={e => setValue(e.target.value as unknown as TValue)}
          className="border rounded px-2 py-1 text-sm w-full resize-none"
          rows={2}
          autoFocus
        />
      )}
      {type === 'text' && (
        <input
          type="text"
          value={value as string}
          onChange={e => setValue(e.target.value as unknown as TValue)}
          className="border rounded px-2 py-1 text-sm w-full"
          autoFocus
        />
      )}
      <button 
        onClick={onSave}
        className="text-green-600 hover:text-green-800"
        title="Save"
      >
        <FiCheck className="h-4 w-4" />
      </button>
      <button 
        onClick={onCancel}
        className="text-red-600 hover:text-red-800"
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

// Main Component
const EditableTasksTable: React.FC<EditableTasksTableProps> = ({
  initialData = [],
  onUpdate,
  onDelete,
  onEdit,
  isLoading = false,
}) => {
  // State management
  const [data, setData] = useState<Task[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // Hide some columns by default
    id: false,
    assignedTo: false,
    createdBy: false,
    order: false,
    commentCount: false,
    userAvatar: false,
    isChecked: false,
    startDate: false,
    endDate: false,
  });
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  // Update data when initialData changes
  useEffect(() => {
    if (initialData) {
      setData(initialData);
    }
  }, [initialData]);

  // Update data function
  const updateData = useCallback(
    async (rowIndex: number, columnId: string, value: any) => {
      const task = data[rowIndex];
      if (!task || !task.id) return false;

      const updates: Partial<Task> = {
        [columnId]: value,
      };

      try {
        const success = await onUpdate(task.id, updates);
        if (success) {
          // Force re-render by updating the data reference
          const newData = [...data];
          newData[rowIndex] = { ...newData[rowIndex], ...updates };
          setData(newData);
        }
        return success;
      } catch (error) {
        console.error('Error updating task:', error);
        return false;
      }
    },
    [data, onUpdate]
  );

  // Define columns
  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        accessorKey: 'id',
        header: 'ID',
        size: 80,
        cell: (info: CellContext<Task, any>) => (
          <div className="px-4 py-2">
            <span className="text-xs text-gray-500">{String(info.getValue())}</span>
          </div>
        ),
      },
      {
        accessorKey: 'name',
        header: 'Task Name',
        size: 300,
        cell: (info: CellContext<Task, any>) => (
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
        accessorKey: 'description',
        header: 'Description',
        size: 250,
        cell: (info: CellContext<Task, any>) => (
          <EditableCell
            getValue={info.getValue}
            row={info.row}
            column={info.column}
            table={info.table}
            type="textarea"
          />
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        size: 120,
        cell: (info: CellContext<Task, any>) => (
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
        cell: (info: CellContext<Task, any>) => (
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
        accessorKey: 'category',
        header: 'Category',
        size: 120,
        cell: (info: CellContext<Task, any>) => (
          <EditableCell
            getValue={info.getValue}
            row={info.row}
            column={info.column}
            table={info.table}
            type="select"
            options={categoryOptions}
          />
        ),
      },
      {
        accessorKey: 'projectName',
        header: 'Project',
        size: 150,
        cell: (info: CellContext<Task, any>) => (
          <div className="px-4 py-2">
            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
              {String(info.getValue()) || 'Unassigned'}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'dueDate',
        header: 'Due Date',
        size: 120,
        cell: (info: CellContext<Task, any>) => (
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
        accessorKey: 'startDate',
        header: 'Start Date',
        size: 120,
        cell: (info: CellContext<Task, any>) => (
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
        accessorKey: 'endDate',
        header: 'End Date',
        size: 120,
        cell: (info: CellContext<Task, any>) => (
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
        accessorKey: 'assignedTo',
        header: 'Assigned To',
        size: 120,
        cell: (info: CellContext<Task, any>) => (
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
        accessorKey: 'commentCount',
        header: 'Comments',
        size: 80,
        cell: (info: CellContext<Task, any>) => (
          <div className="px-4 py-2 text-center">
            <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
              {String(info.getValue())}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'order',
        header: 'Order',
        size: 80,
        cell: (info: CellContext<Task, any>) => (
          <EditableCell
            getValue={info.getValue}
            row={info.row}
            column={info.column}
            table={info.table}
            type="number"
          />
        ),
      },
      {
        accessorKey: 'isChecked',
        header: 'Completed',
        size: 80,
        cell: (info: CellContext<Task, any>) => (
          <div className="px-4 py-2 text-center">
            <input
              type="checkbox"
              checked={info.getValue() as boolean}
              onChange={(e) => {
                const task = info.row.original;
                onUpdate(task.id, { isChecked: e.target.checked });
              }}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        size: 100,
        cell: ({ row }: { row: Row<Task> }) => (
          <div className="flex items-center space-x-2 px-4 py-2">
            <button
              onClick={() => onEdit?.(row.original)}
              className="text-blue-600 hover:text-blue-900"
              title="Edit"
            >
              <FiEdit className="h-4 w-4" />
            </button>
            <button
              onClick={() => row.original.id && onDelete(row.original.id)}
              className="text-red-600 hover:text-red-900"
              title="Delete"
              disabled={!row.original.id}
            >
              <FiTrash2 className="h-4 w-4" />
            </button>
          </div>
        ),
      },
    ],
    [onDelete, onEdit, onUpdate]
  );

  // Ensure data is properly typed and has required fields
  const tableData = useMemo(() => data.map(task => ({
    ...task,
    name: task.name || '',
    description: task.description || '',
    status: task.status || 'todo',
    priority: task.priority ?? 0,
    category: task.category || '',
    dueDate: task.dueDate || new Date().toISOString().split('T')[0],
    startDate: task.startDate || '',
    endDate: task.endDate || '',
    assignedTo: task.assignedTo || '',
    commentCount: task.commentCount || 0,
    order: task.order || 0,
    isChecked: task.isChecked ?? false,
  })), [data]);

  // Initialize table
  const table = useReactTable({
    data: tableData,
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
    } as TableMetaType<Task>,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Tasks
          </h2>
          <span className="px-2 py-1 text-sm text-gray-600 bg-gray-100 rounded-full dark:bg-gray-700 dark:text-gray-300">
            {data.length} tasks
          </span>
        </div>
        <ColumnVisibilityToggle
          table={table}
          className="hidden md:flex"
        />
      </div>

      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHeadCell key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <div
                          {...{
                            className: header.column.getCanSort()
                              ? 'cursor-pointer select-none flex items-center'
                              : '',
                            onClick: header.column.getToggleSortingHandler(),
                          }}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: ' 🔼',
                            desc: ' 🔽',
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      )}
                    </TableHeadCell>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan={table.getAllColumns().length} 
                    className="px-6 py-4 text-center text-sm text-gray-500"
                  >
                    {isLoading ? 'Loading...' : 'No tasks found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="flex-1 text-sm text-gray-700 mb-2">
          Showing <span className="font-medium">{table.getRowModel().rows.length}</span> of{' '}
          <span className="font-medium">{data.length}</span> tasks
        </div>
        <div className="flex items-center space-x-2">
          <button
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </button>
          <span className="text-sm">
            Page {table.getState().pagination.pageIndex + 1} of{' '}
            {table.getPageCount()}
          </span>
          <button
            className="px-3 py-1 text-sm border rounded disabled:opacity-50"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditableTasksTable;
