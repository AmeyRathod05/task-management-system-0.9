import React from "react";

interface Task {
  id: string;
  title: string;
  project: string;
  dueDate?: string;
}

interface TaskListProps {
  tasks: Task[];
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[100px] text-gray-500">
        No tasks available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
        >
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">
              {task.title}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {task.project}
            </p>
          </div>
          {task.dueDate && (
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Due: {task.dueDate}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskList;
