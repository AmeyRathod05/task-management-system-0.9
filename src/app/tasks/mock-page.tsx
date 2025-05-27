'use client';

import { useState } from 'react';
import { useTasks } from '@/context/TaskContext';
import { FiGrid, FiList, FiCalendar } from 'react-icons/fi';

export default function MockTasksPage() {
  const { tasks, view, setView } = useTasks();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter tasks based on search term
  const filteredTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    task.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group tasks by status for Kanban view
  const tasksByStatus = {
    todo: filteredTasks.filter(task => task.status === 'todo'),
    'in-progress': filteredTasks.filter(task => task.status === 'in-progress'),
    review: filteredTasks.filter(task => task.status === 'review'),
    done: filteredTasks.filter(task => task.status === 'done'),
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Task Management System
          </h1>
          <p className="text-gray-600">
            Manage your tasks with table, kanban, and gantt chart views
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Header with search and view toggle */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:w-96">
              <input
                type="text"
                placeholder="Search tasks..."
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
            
            <div className="flex space-x-2">
              <button
                onClick={() => setView('table')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  view === 'table' ? 'bg-blue-500 text-white' : 'bg-white border text-gray-700'
                }`}
              >
                <FiList className="h-4 w-4" />
                <span>Table</span>
              </button>
              <button
                onClick={() => setView('kanban')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  view === 'kanban' ? 'bg-blue-500 text-white' : 'bg-white border text-gray-700'
                }`}
              >
                <FiGrid className="h-4 w-4" />
                <span>Kanban</span>
              </button>
              <button
                onClick={() => setView('gantt')}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                  view === 'gantt' ? 'bg-blue-500 text-white' : 'bg-white border text-gray-700'
                }`}
              >
                <FiCalendar className="h-4 w-4" />
                <span>Gantt</span>
              </button>
            </div>
          </div>

          {/* Task Views */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {view === 'table' && (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assignee</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {task.assignee.avatar ? (
                                <img className="h-10 w-10 rounded-full" src={task.assignee.avatar} alt="" />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  {task.title.charAt(0)}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{task.title}</div>
                              <div className="text-sm text-gray-500">{task.description}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{task.project.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{task.assignee.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {new Date(task.dueDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            task.status === 'done' ? 'bg-green-100 text-green-800' :
                            task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {task.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            task.priority === 'high' ? 'bg-red-100 text-red-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {task.priority}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {view === 'kanban' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
                {Object.entries(tasksByStatus).map(([status, tasks]) => (
                  <div key={status} className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">
                      {status.charAt(0).toUpperCase() + status.slice(1)} ({tasks.length})
                    </h3>
                    <div className="space-y-3">
                      {tasks.map((task) => (
                        <div key={task.id} className="bg-white p-3 rounded-lg shadow border border-gray-200">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-gray-900">{task.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              task.priority === 'high' ? 'bg-red-100 text-red-800' :
                              task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                          <div className="mt-3 flex items-center justify-between">
                            <span className="text-xs text-gray-500">
                              Due {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                            <div className="flex -space-x-1">
                              {task.assignee.avatar ? (
                                <img
                                  className="h-6 w-6 rounded-full border-2 border-white"
                                  src={task.assignee.avatar}
                                  alt={task.assignee.name}
                                />
                              ) : (
                                <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs">
                                  {task.assignee.name.charAt(0)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {view === 'gantt' && (
              <div className="p-6">
                <div className="text-center text-gray-500">
                  <p>Gantt chart view coming soon</p>
                  <p className="text-sm mt-2">This would show a timeline view of tasks with dependencies and durations.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
