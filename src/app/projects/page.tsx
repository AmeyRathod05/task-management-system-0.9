"use client";
import { useState } from 'react';
import { FiFolder, FiUsers, FiCalendar, FiBarChart2 } from 'react-icons/fi';

interface Project {
  id: string;
  name: string;
  clientId: string;
  color: string;
}

interface Client {
  id: string;
  name: string;
}

interface Task {
  id: string;
  projectId: string;
  status: string;
  assignee: {
    id: string;
  };
}

export default function ProjectsPage() {
  // Mock data
  const projects: Project[] = [
    { id: "1", name: 'Project 1', clientId: "1", color: '#ff0000' },
    { id: "2", name: 'Project 2', clientId: "2", color: '#00ff00' },
    { id: "3", name: 'Project 3', clientId: "3", color: '#0000ff' },
  ];

  const clients: Client[] = [
    { id: "1", name: 'Client 1' },
    { id: "2", name: 'Client 2' },
    { id: "3", name: 'Client 3' },
  ];

  const tasks: Task[] = [
    { id: "1", projectId: "1", status: 'done', assignee: { id: "1" } },
    { id: "2", projectId: "1", status: 'in-progress', assignee: { id: "2" } },
    { id: "3", projectId: "1", status: 'todo', assignee: { id: "3" } },
    { id: "4", projectId: "2", status: 'done', assignee: { id: "1" } },
    { id: "5", projectId: "2", status: 'in-progress', assignee: { id: "2" } },
    { id: "6", projectId: "2", status: 'todo', assignee: { id: "3" } },
    { id: "7", projectId: "3", status: 'done', assignee: { id: "1" } },
    { id: "8", projectId: "3", status: 'in-progress', assignee: { id: "2" } },
    { id: "9", projectId: "3", status: 'todo', assignee: { id: "3" } },
  ];

  const [searchTerm, setSearchTerm] = useState('');

  // Filter projects based on search term
  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate project stats
  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    const completedTasks = projectTasks.filter(task => task.status === 'done').length;
    const totalTasks = projectTasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    const inProgress = projectTasks.filter(task => task.status === 'in-progress').length;
    const todo = projectTasks.filter(task => task.status === 'todo').length;
    const review = projectTasks.filter(task => task.status === 'review')?.length || 0;

    return {
      totalTasks,
      completedTasks,
      progress,
      inProgress,
      todo,
      review
    };
  };

  // Get unique assignees for a project
  const getUniqueAssignees = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    const assigneeIds = new Set(projectTasks.map(task => task.assignee.id));
    return assigneeIds.size;
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Project Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Overview of all projects with progress tracking and team assignments
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full p-3 pl-4 pr-10 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => {
            const client = clients.find(c => c.id === project.clientId);
            const stats = getProjectStats(project.id);
            const assigneeCount = getUniqueAssignees(project.id);

            return (
              <div
                key={project.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                {/* Project Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {client?.name}
                      </p>
                    </div>
                  </div>
                  <FiFolder className="h-5 w-5 text-gray-400" />
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Progress
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {stats.progress}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="h-2 rounded-full transition-all duration-300"
                      style={{
                        backgroundColor: project.color,
                        width: `${stats.progress}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {stats.totalTasks}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Total Tasks
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {assigneeCount}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Team Members
                    </div>
                  </div>
                </div>

                {/* Task Status Breakdown */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      Completed
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {stats.completedTasks}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      In Progress
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {stats.inProgress}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                      In Review
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {stats.review}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      To Do
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {stats.todo}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">
                      View Details
                    </button>
                    <div className="flex items-center gap-2">
                      <FiUsers className="h-4 w-4 text-gray-400" />
                      <FiBarChart2 className="h-4 w-4 text-gray-400" />
                      <FiCalendar className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                <FiFolder className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {projects.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total Projects
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                <FiBarChart2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tasks.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Total Tasks
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                <FiUsers className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {clients.length}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Active Clients
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                <FiCalendar className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {tasks.length > 0 ? Math.round(
                    tasks.filter(task => task.status === 'done').length / tasks.length * 100
                  ) : 0}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  Overall Completion
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
