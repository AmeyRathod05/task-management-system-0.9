'use client';

import { Project } from '@/types/project';
import { ProjectClientView } from './ProjectClientView';

interface ProjectServerViewProps {
  initialData: Project[];
}

export function ProjectServerView({ initialData }: ProjectServerViewProps) {
  // Just render the client view with the server-fetched data
  return (
    <div>
      <div className="text-xs text-gray-500 mb-2">
        Rendered at: {new Date().toISOString()}
      </div>
      <ProjectClientView initialData={initialData} />
    </div>
  );
}