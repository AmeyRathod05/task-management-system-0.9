import TaskList from "@/components/task/task-list/TaskList";

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Enhanced Task Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage tasks with editable cells, project grouping, and advanced filtering
          </p>
        </div>
        
        <TaskList />
      </div>
    </div>
  );
}
