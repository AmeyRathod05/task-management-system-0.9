'use client';

import { useState } from 'react';
import { useTasks } from '@/context/TaskContext';
import { FiFolder, FiUsers, FiCalendar, FiBarChart2 } from 'react-icons/fi';

export default function MockProjectsPage() {
  const { projects, clients, tasks } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter projects based on search term
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate project stats
  const getProjectStats = (projectId: string) => {
    const projectTasks = tasks.filter(task => task.project.id === projectId);
    const completedTasks = projectTasks.filter(task => task.status === 'done').length;
    const totalTasks = projectTasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
    
    return {
      totalTasks,
      completedTasks,
      progress
    };
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Project Management
          </h1>
          <p className="text-gray-600">
            Manage your projects and track progress
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Header with search */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search projects..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg flex items-center space-x-2"
            >
              <FiFolder className="h-4 w-4" />
              <span>New Project</span>
            </button>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => {
              const stats = getProjectStats(project.id);
              return (
                <div key={project.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-5 border-b border-gray-200">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Client: {clients.find(c => c.id === project.clientId)?.name || 'Unknown'}
                        </p>
                      </div>
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: project.color }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        <FiCalendar className="text-gray-400" />
                        <span className="text-sm text-gray-600">Tasks: {stats.totalTasks}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FiUsers className="text-gray-400" />
                        <span className="text-sm text-gray-600">Team: {Math.floor(Math.random() * 5) + 1}</span>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-medium text-gray-700">{stats.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className="bg-blue-500 h-2.5 rounded-full" 
                          style={{ width: `${stats.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map((i) => (
                          <div 
                            key={i}
                            className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 flex items-center justify-center text-xs font-medium"
                          >
                            {String.fromCharCode(64 + i)}
                          </div>
                        ))}
                      </div>
                      <button className="text-sm text-blue-500 hover:text-blue-700">
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
