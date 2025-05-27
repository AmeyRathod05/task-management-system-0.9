import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Project } from '@/types/project';
import { ColumnVisibilityToggle } from './ColumnVisibilityToggle';
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
interface EditableProjectsTableProps {
  initialData: Project[];
  onUpdate: (id: string, data: Partial<Project>) => Promise<boolean>;
  onDelete: (id: string) => Promise<boolean>;
  onEdit?: (project: Project) => void;
  isLoading?: boolean;
}

// Define status and priority options
const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
  { value: 'archived', label: 'Archived' },
  { value: 'pending', label: 'Pending' },
];

const priorityOptions = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

// Editable Cell Component
interface EditableCellProps<TData, TValue> {
  getValue: () => TValue;
  row: Row<TData>;
  column: Column<TData, TValue>;
  table: Table<TData>;
  type?: 'text' | 'select' | 'date';
  options?: { value: string; label: string }[];
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
        {type === 'select' && (
          <span className={`px-2 py-1 text-xs rounded-full ${
            value === 'active' ? 'bg-green-100 text-green-800' :
            value === 'completed' ? 'bg-blue-100 text-blue-800' :
            value === 'high' ? 'bg-red-100 text-red-800' :
            value === 'medium' ? 'bg-yellow-100 text-yellow-800' :
            value === 'low' ? 'bg-green-100 text-green-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {String(value)}
          </span>
        )}
        {type === 'date' && (
          <span>
            {value ? new Date(value as string).toLocaleDateString() : '-'}
          </span>
        )}
        {type === 'text' && (
          <span>{String(value)}</span>
        )}
      </div>
    );
  }

  return (
    <div className="px-4 py-2 flex items-center gap-1">
      {type === 'select' && (
        <select
          value={value as string}
          onChange={e => setValue(e.target.value as unknown as TValue)}
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
const EditableProjectsTable: React.FC<EditableProjectsTableProps> = ({
  initialData = [],
  onUpdate,
  onDelete,
  onEdit,
  isLoading = false,
}) => {
  // State management
  const [data, setData] = useState<Project[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    // Hide some columns by default
    client_id: false,
    created_by: false,
    updated_at: false,
    created_at: false,
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
      const project = data[rowIndex];
      if (!project || !project.id) return false;

      const updates: Partial<Project> = {
        [columnId]: value,
        updated_at: new Date().toISOString(),
      };

      try {
        const success = await onUpdate(project.id, updates);
        if (success) {
          // Force re-render by updating the data reference
          const newData = [...data];
          newData[rowIndex] = { ...newData[rowIndex], ...updates };
          setData(newData);
        }
        return success;
      } catch (error) {
        console.error('Error updating project:', error);
        return false;
      }
    },
    [data, onUpdate]
  );

  // Define columns
  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Project Name',
        size: 250,
        cell: (info: CellContext<Project, any>) => (
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
        size: 150,
        cell: (info: CellContext<Project, any>) => (
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
        size: 120,
        cell: (info: CellContext<Project, any>) => (
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
        accessorKey: 'start_date',
        header: 'Start Date',
        size: 120,
        cell: (info: CellContext<Project, any>) => (
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
        cell: (info: CellContext<Project, any>) => (
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
        id: 'actions',
        header: 'Actions',
        size: 100,
        cell: ({ row }: { row: Row<Project> }) => (
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
    [onDelete, onEdit]
  );

  // Ensure data is properly typed and has required fields
  const tableData = useMemo(() => data.map(project => ({
    ...project,
    name: project.name || '',
    status: (project.status as 'active' | 'completed' | 'archived' | 'pending') || 'active',
    start_date: project.start_date || new Date().toISOString().split('T')[0],
    end_date: project.end_date || null,
    is_active: project.is_active ?? true,
    created_at: project.created_at || new Date().toISOString(),
    updated_at: project.updated_at || new Date().toISOString()
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
    enableRowSelection: true,
    meta: {
      updateData,
    } as TableMetaType<Project>,
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end mb-4">
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
                    {isLoading ? 'Loading...' : 'No projects found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex-1 text-sm text-gray-700 mb-2">
        Showing <span className="font-medium">{table.getRowModel().rows.length}</span> of{' '}
        <span className="font-medium">{data.length}</span> projects
      </div>
    </div>
  );
};

export default EditableProjectsTable;
