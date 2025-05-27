import React from 'react';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { AngleDownIcon, AngleUpIcon, PencilIcon, TrashBinIcon } from '@/icons';
import { Project as ProjectType } from '@/types/project';

interface ProjectsTableProps {
  projects: ProjectType[];
  onEdit?: (project: ProjectType) => void;
  onDelete?: (id: string) => Promise<boolean>;
}

const columns: { key: keyof ProjectType; label: string; className?: string }[] = [
  { key: 'id', label: 'ID', className: 'whitespace-nowrap' },
  { key: 'name', label: 'Project Name' },
  { key: 'start_date', label: 'Start Date', className: 'whitespace-nowrap' },
  { key: 'end_date', label: 'End Date', className: 'whitespace-nowrap' },
  { key: 'created_at', label: 'Created At', className: 'whitespace-nowrap' },
];

const ProjectsTable: React.FC<ProjectsTableProps> = ({ projects, onEdit, onDelete }) => {
  return (
    <Table>
      <TableHeader className="border-t border-gray-100 dark:border-white/[0.05]">
        <TableRow>
          {columns.map(({ key, label }) => (
            <TableCell key={key} className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
              <div className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300">
                {label}
              </div>
            </TableCell>
          ))}
          <TableCell className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
            <div className="flex items-center gap-1 text-sm font-medium text-gray-600 dark:text-gray-300">
              Actions
            </div>
          </TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {projects.map((project) => (
          <TableRow key={project.id}>
            {columns.map(({ key }) => (
              <TableCell key={key} className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
                {String(project[key])}
              </TableCell>
            ))}
            <TableCell className="px-4 py-3 border border-gray-100 dark:border-white/[0.05]">
              <div className="flex items-center gap-2">
                {onEdit && (
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 transition-colors"
                    onClick={() => onEdit(project)}
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    className="text-red-600 hover:text-red-800 transition-colors"
                    onClick={() => onDelete(String(project.id))}
                  >
                    <TrashBinIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default ProjectsTable;
