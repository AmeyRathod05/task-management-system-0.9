import React, { useState, useRef } from "react";
import { HorizontaLDots } from "@/icons";
import { Dropdown } from "@/components/ui/dropdown/Dropdown";
import { DropdownItem } from "@/components/ui/dropdown/DropdownItem";
import ProjectTaskItem from "./ProjectTaskItem";
import { useDrop } from "react-dnd";
import { PROJECT_TASK_TYPE } from "./constants";

// Define the KanbanTask interface to match what we're using in ProjectKanbanBoard
interface KanbanTask {
  id: string;
  title: string;
  dueDate: string;
  status: 'active' | 'completed' | 'archived';
  assignee: string;
  assigneeName?: string;
  projectDesc?: string;
  category: {
    name: string;
    color: string;
  };
  comments: number;
  index: number;
}

interface DropResult {
  name: string;
}

interface ProjectColumnProps {
  title: string;
  tasks: KanbanTask[];
  status: string;
  moveTask: (dragIndex: number, hoverIndex: number) => void;
  changeTaskStatus: (taskId: string, newStatus: string) => void;
}

const ProjectColumn: React.FC<ProjectColumnProps> = ({
  title,
  tasks,
  status,
  moveTask,
  changeTaskStatus,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const columnRef = useRef<HTMLDivElement>(null);

  // Handle drop on the column
  const [{ isOver }, drop] = useDrop({
    accept: PROJECT_TASK_TYPE,
    drop: (item: KanbanTask & { index: number }, monitor) => {
      if (!monitor.didDrop()) {
        // Only process if the drop was not handled by a child
        changeTaskStatus(item.id, status);
      }
      return { name: status };
    },
    collect: (monitor) => ({
      isOver: monitor.isOver({ shallow: true }),
    }),
  });

  // Attach the drop ref to the column
  drop(columnRef);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div
      ref={columnRef}
      className={`flex flex-col gap-5 p-4 swim-lane xl:p-6 transition-colors duration-200 ${
        isOver ? 'bg-gray-50 dark:bg-gray-800/50' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-1">
        <h3 className="flex items-center gap-3 text-base font-medium text-gray-800 dark:text-white/90">
          {title}
          <span
            className={`
              inline-flex rounded-full px-2 py-0.5 text-theme-xs font-medium 
              ${
                status === "active"
                  ? "bg-gray-100 text-gray-700 dark:bg-white/[0.03] dark:text-white/80 "
                  : status === "completed"
                  ? "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-500"
                  : status === "archived"
                  ? "text-warning-700 bg-warning-50 dark:bg-warning-500/15 dark:text-orange-400"
                  : ""
              }
            `}
          >
            {tasks.length}
          </span>
        </h3>
        <div className="relative">
          <button onClick={toggleDropdown} className="dropdown-toggle">
            <HorizontaLDots className="text-gray-800 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
          <Dropdown
            isOpen={isOpen}
            onClose={closeDropdown}
            className="absolute right-0 top-full z-40 w-[140px] space-y-1 rounded-2xl border border-gray-200 bg-white p-2 shadow-theme-md dark:border-gray-800 dark:bg-gray-dark"
          >
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Edit
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Delete
            </DropdownItem>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            >
              Clear All
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
      {tasks.map((task, index) => (
        <ProjectTaskItem
          key={task.id}
          task={task}
          index={index}
          moveTask={moveTask}
          changeTaskStatus={changeTaskStatus}
        />
      ))}
      {/* Empty state when there are no tasks */}
      {tasks.length === 0 && (
        <div className="flex items-center justify-center h-24 border border-dashed border-gray-200 rounded-lg dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Drop projects here
          </p>
        </div>
      )}
    </div>
  );
};

export default ProjectColumn;
