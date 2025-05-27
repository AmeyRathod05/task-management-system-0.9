"use client";
import React, { useState } from "react";
import { Task, Project } from "./types/Task";
import EditableTaskItem from "./EditableTaskItem";

interface ProjectGroupProps {
  project: Project | null;
  tasks: Task[];
  onDragStart: (e: React.DragEvent<HTMLDivElement>, taskId: string) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>, projectId?: string) => void;
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
  projects: Array<{ id: string; name: string }>;
}

const ProjectGroup: React.FC<ProjectGroupProps> = ({
  project,
  tasks,
  onDragStart,
  onDragOver,
  onDrop,
  onTaskUpdate,
  projects,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const getTaskCountByStatus = () => {
    const counts = {
      todo: tasks.filter(task => task.status === "todo").length,
      "in-progress": tasks.filter(task => task.status === "in-progress").length,
      completed: tasks.filter(task => task.status === "completed").length,
    };
    return counts;
  };

  const statusCounts = getTaskCountByStatus();
  const totalTasks = tasks.length;

  return (
    <div className="mb-8">
      {/* Project Header */}
      <div className="flex items-center justify-between p-4 mb-4 bg-gray-50 border border-gray-200 rounded-lg dark:bg-gray-800/50 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transform transition-transform ${isCollapsed ? "-rotate-90" : ""}`}
            >
              <path
                d="M4 6L8 10L12 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {project?.name || "Unassigned Tasks"}
            </h3>
            <span className="px-2 py-1 text-xs font-medium text-gray-600 bg-gray-200 rounded-full dark:bg-gray-700 dark:text-gray-300">
              {totalTasks} tasks
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Status Summary */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                To Do: {statusCounts.todo}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                In Progress: {statusCounts["in-progress"]}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-600 dark:text-gray-400">
                Completed: {statusCounts.completed}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-24 h-2 bg-gray-200 rounded-full dark:bg-gray-700">
            <div
              className="h-2 bg-green-500 rounded-full transition-all duration-300"
              style={{
                width: totalTasks > 0 ? `${(statusCounts.completed / totalTasks) * 100}%` : "0%",
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Tasks */}
      {!isCollapsed && (
        <div
          onDragOver={onDragOver}
          onDrop={(e) => onDrop(e, project?.id)}
          className="space-y-4"
        >
          {tasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500 border-2 border-gray-200 border-dashed rounded-lg dark:border-gray-700 dark:text-gray-400">
              <svg
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mx-auto mb-4 text-gray-300 dark:text-gray-600"
              >
                <path
                  d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p>No tasks in this project</p>
              <p className="text-sm">Drag tasks here to assign them to this project</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {/* Group tasks by status */}
              {["todo", "in-progress", "completed"].map((status) => {
                const statusTasks = tasks.filter((task) => task.status === status);
                if (statusTasks.length === 0) return null;

                return (
                  <div key={status} className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                      {status === "todo" && "To Do"}
                      {status === "in-progress" && "In Progress"}
                      {status === "completed" && "Completed"}
                      <span className="ml-2 text-gray-500">({statusTasks.length})</span>
                    </h4>
                    <div className="space-y-2">
                      {statusTasks.map((task) => (
                        <EditableTaskItem
                          key={task.id}
                          {...task}
                          onDragStart={(e) => onDragStart(e, task.id)}
                          onTaskUpdate={onTaskUpdate}
                          projects={projects}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProjectGroup;
