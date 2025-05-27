import React, { useState } from 'react';
import { Task as TaskType } from '@/services/taskService';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  useDroppable,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CheckCircle, Clock, AlertCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface TaskKanbanBoardProps {
  tasks: TaskType[];
  onEdit: (task: TaskType) => void;
  onDelete: (id: number) => void;
  onStatusChange: (taskId: number, status: number) => void;
}

const statusColumns = [
  { 
    id: 0, 
    title: 'To Do', 
    icon: <Clock className="w-4 h-4" />, 
    color: 'bg-yellow-100 text-yellow-800' 
  },
  { 
    id: 1, 
    title: 'In Progress', 
    icon: <AlertCircle className="w-4 h-4" />, 
    color: 'bg-blue-100 text-blue-800' 
  },
  { 
    id: 2, 
    title: 'Done', 
    icon: <CheckCircle className="w-4 h-4" />, 
    color: 'bg-green-100 text-green-800' 
  },
];

interface TaskCardProps {
  task: TaskType;
  onEdit: (task: TaskType) => void;
  onDelete: (id: number) => void;
  isDragging?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete, isDragging = false }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: task.id.toString(),
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const getPriorityColor = (priority: number) => {
    switch (priority) {
      case 0: return 'bg-gray-100 text-gray-800';
      case 1: return 'bg-blue-100 text-blue-800';
      case 2: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: number) => {
    switch (priority) {
      case 0: return 'Low';
      case 1: return 'Medium';
      case 2: return 'High';
      default: return 'Low';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white rounded-lg shadow-sm p-4 mb-3 border border-gray-200 cursor-grab active:cursor-grabbing group hover:shadow-md transition-shadow ${
        isSortableDragging || isDragging ? 'opacity-50 shadow-lg' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-sm">{task.name}</h4>
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
          {task.description}
        </p>
      )}
      
      <div className="mt-2 flex items-center justify-between">
        <span className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(task.priority)}`}>
          {getPriorityLabel(task.priority)}
        </span>
        
        {task.due_date && (
          <span className="text-xs text-gray-500">
            {format(new Date(task.due_date), 'MMM d')}
          </span>
        )}
      </div>
      
      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
        <span>{task.project?.name || 'No project'}</span>
        {task.assigned_to && (
          <span className="flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-1"></span>
            User #{task.assigned_to}
          </span>
        )}
      </div>
    </div>
  );
};

interface DroppableColumnProps {
  column: typeof statusColumns[0];
  tasks: TaskType[];
  onEdit: (task: TaskType) => void;
  onDelete: (id: number) => void;
}

const DroppableColumn: React.FC<DroppableColumnProps> = ({ column, tasks, onEdit, onDelete }) => {
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: {
      type: 'column',
      status: column.id,
    },
  });

  return (
    <div 
      ref={setNodeRef}
      className={`bg-gray-50 rounded-lg p-4 transition-colors ${
        isOver ? 'bg-gray-100 ring-2 ring-blue-300' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <span className={`${column.color} p-1 rounded-full mr-2`}>
            {column.icon}
          </span>
          <h3 className="font-medium">{column.title}</h3>
          <span className="ml-2 bg-white rounded-full px-2 py-0.5 text-xs font-medium">
            {tasks.length}
          </span>
        </div>
      </div>
      
      <SortableContext items={tasks.map(task => task.id.toString())} strategy={verticalListSortingStrategy}>
        <div className="min-h-[100px] space-y-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      </SortableContext>
    </div>
  );
};

const TaskKanbanBoard: React.FC<TaskKanbanBoardProps> = ({
  tasks,
  onEdit,
  onDelete,
  onStatusChange,
}) => {
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const getTasksByStatus = (status: number) => {
    return tasks.filter(task => task.status === status);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find(t => t.id.toString() === active.id);
    setActiveTask(task || null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = parseInt(active.id as string, 10);
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;

    // Check if we're dropping over a column
    let newStatus: number | null = null;
    
    if (over.data?.current?.type === 'column') {
      // Dropped directly on a column
      newStatus = over.data.current.status;
    } else if (over.id.toString().startsWith('column-')) {
      // Dropped on a column droppable area
      newStatus = parseInt(over.id.toString().replace('column-', ''), 10);
    } else {
      // Dropped on another task, get the column from the task's status
      const overTask = tasks.find(t => t.id.toString() === over.id);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    // If we have a new status and it's different from current, update it
    if (newStatus !== null && newStatus !== task.status) {
      onStatusChange(taskId, newStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        {statusColumns.map((column) => {
          const columnTasks = getTasksByStatus(column.id);
          
          return (
            <SortableContext
              key={column.id}
              id={column.id.toString()}
              items={columnTasks.map(task => task.id.toString())}
              strategy={verticalListSortingStrategy}
            >
              <DroppableColumn
                column={column}
                tasks={columnTasks}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </SortableContext>
          );
        })}
      </div>

      <DragOverlay>
        {activeTask ? (
          <TaskCard
            task={activeTask}
            onEdit={onEdit}
            onDelete={onDelete}
            isDragging={true}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default TaskKanbanBoard;
