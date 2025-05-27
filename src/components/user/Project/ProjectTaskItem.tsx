import React, { useRef } from "react";
import { useDrag, useDrop } from "react-dnd";
import Image from "next/image";
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

interface ProjectTaskItemProps {
  task: KanbanTask;
  index: number;
  moveTask: (dragIndex: number, hoverIndex: number) => void;
  changeTaskStatus: (taskId: string, newStatus: string) => void;
}

const ProjectTaskItem: React.FC<ProjectTaskItemProps> = ({
  task,
  index,
  moveTask,
  changeTaskStatus,
}) => {
  const ref = useRef<HTMLDivElement>(null);

  const [{ isDragging }, drag] = useDrag({
    type: PROJECT_TASK_TYPE,
    item: { ...task, index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ handlerId }, drop] = useDrop({
    accept: PROJECT_TASK_TYPE,
    collect: (monitor) => ({
      handlerId: monitor.getHandlerId(),
    }),
    hover(item: KanbanTask & { index: number }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();
      
      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      
      // Determine mouse position
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset) return;
      
      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveTask(dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for performance reasons
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const opacity = isDragging ? 0.4 : 1;
  
  // Connect drag and drop refs to the component
  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{ opacity }}
      className="group relative p-5 bg-white border border-gray-200 task rounded-xl shadow-theme-sm dark:border-gray-800 dark:bg-white/5"
      data-handler-id={handlerId}
      role="card"
      aria-roledescription="Draggable item"
      aria-label={`${task.title}, Status: ${task.status}, Priority: ${task.category.name}`}
      tabIndex={0}
      aria-grabbed={isDragging}
      onKeyDown={(e) => {
        // Handle keyboard navigation for accessibility
        if (e.key === 'Enter' || e.key === ' ') {
          // Trigger drag start on Enter or Space
          e.preventDefault();
          // Visual feedback that the item is selected
          e.currentTarget.classList.add('ring-2', 'ring-brand-500');
        } else if (e.key === 'Escape') {
          // Cancel drag on Escape
          e.currentTarget.classList.remove('ring-2', 'ring-brand-500');
        } else if (e.key === 'ArrowRight') {
          // Move to next column
          e.preventDefault();
          const nextStatus = 
            task.status === 'active' ? 'completed' : 
            task.status === 'completed' ? 'archived' : task.status;
          if (nextStatus !== task.status) {
            changeTaskStatus(task.id, nextStatus);
          }
        } else if (e.key === 'ArrowLeft') {
          // Move to previous column
          e.preventDefault();
          const prevStatus = 
            task.status === 'archived' ? 'completed' : 
            task.status === 'completed' ? 'active' : task.status;
          if (prevStatus !== task.status) {
            changeTaskStatus(task.id, prevStatus);
          }
        }
      }}
    >
      <div className="space-y-4">
        <div>
          <h4 className="mb-5 mr-10 text-base text-gray-800 dark:text-white/90">
            {task.title}
          </h4>
          {task.projectDesc && (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {task.projectDesc}
            </p>
          )}
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-sm text-gray-500 cursor-pointer dark:text-gray-400">
              <svg
                className="fill-current"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M5.33329 1.0835C5.74751 1.0835 6.08329 1.41928 6.08329 1.8335V2.25016L9.91663 2.25016V1.8335C9.91663 1.41928 10.2524 1.0835 10.6666 1.0835C11.0808 1.0835 11.4166 1.41928 11.4166 1.8335V2.25016L12.3333 2.25016C13.2998 2.25016 14.0833 3.03366 14.0833 4.00016V6.00016L14.0833 12.6668C14.0833 13.6333 13.2998 14.4168 12.3333 14.4168L3.66663 14.4168C2.70013 14.4168 1.91663 13.6333 1.91663 12.6668L1.91663 6.00016L1.91663 4.00016C1.91663 3.03366 2.70013 2.25016 3.66663 2.25016L4.58329 2.25016V1.8335C4.58329 1.41928 4.91908 1.0835 5.33329 1.0835ZM5.33329 3.75016L3.66663 3.75016C3.52855 3.75016 3.41663 3.86209 3.41663 4.00016V5.25016L12.5833 5.25016V4.00016C12.5833 3.86209 12.4714 3.75016 12.3333 3.75016L10.6666 3.75016L5.33329 3.75016ZM12.5833 6.75016L3.41663 6.75016L3.41663 12.6668C3.41663 12.8049 3.52855 12.9168 3.66663 12.9168L12.3333 12.9168C12.4714 12.9168 12.5833 12.8049 12.5833 12.6668L12.5833 6.75016Z"
                  fill=""
                />
              </svg>
              {task.dueDate}
            </span>
            <span className="flex items-center gap-1 text-sm text-gray-500 cursor-pointer dark:text-gray-400">
              <svg
                className="stroke-current"
                width="18"
                height="18"
                viewBox="0 0 18 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9 15.6343C12.6244 15.6343 15.5625 12.6961 15.5625 9.07178C15.5625 5.44741 12.6244 2.50928 9 2.50928C5.37563 2.50928 2.4375 5.44741 2.4375 9.07178C2.4375 10.884 3.17203 12.5246 4.35961 13.7122L2.4375 15.6343H9Z"
                  stroke=""
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
              </svg>
              {task.comments}
            </span>
          </div>
          <span
            className={`mt-3 inline-flex rounded-full px-2 py-0.5 text-theme-xs font-medium ${getCategoryStyles(
              task.category.color
            )}`}
          >
            {task.category.name}
          </span>
        </div>
      </div>
      <div className="absolute top-5 right-5 flex items-center gap-2">
        {task.assignee && (
          <div className="h-6 w-6 overflow-hidden rounded-full border-[0.5px] border-gray-200 dark:border-gray-800">
            <Image 
              width={24} 
              height={24} 
              src={task.assignee} 
              alt="user avatar" 
              onError={(e) => {
                // Fallback to a default image if the provided URL is invalid
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.src = '/images/user/default-avatar.jpg';
              }}
            />
          </div>
        )}
        {task.assigneeName && (
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {task.assigneeName}
          </span>
        )}
      </div>
    </div>
  );
};

const getCategoryStyles = (color: string) => {
  switch (color) {
    case "error":
      return "bg-error-50 text-error-700 dark:bg-error-500/15 dark:text-error-400";
    case "success":
      return "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400";
    case "brand":
      return "bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-400";
    case "orange":
      return "bg-orange-50 text-orange-700 dark:bg-orange-500/15 dark:text-orange-400";
    case "purple":
      return "bg-purple-50 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-500/15 dark:text-gray-400";
  }
};

export default ProjectTaskItem;
