import Project from '@/components/user/Project';
import projectService from '@/services/projectService';

export const dynamic = 'force-dynamic';

export default async function ProjectPage() {
  try {
    // Fetch projects on the server
    const initialProjects = await projectService.getProjects();
    
    return (
      <div className="min-h-screen">
        <Project initialProjects={initialProjects} />
      </div>
    );
  } catch (error) {
    console.error('Error in ProjectPage:', error);
    return (
      <div className="p-6">
        <div className="text-red-600">Error loading projects. Please try again later.</div>
      </div>
    );
  }
}
