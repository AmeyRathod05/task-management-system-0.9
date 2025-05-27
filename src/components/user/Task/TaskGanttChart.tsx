'use client';

import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Task as TaskType } from '@/services/taskService';
import { format, parseISO, addDays, isValid, differenceInDays, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, eachWeekOfInterval, eachMonthOfInterval, addWeeks, addMonths } from 'date-fns';
import { Button } from '@/components/ui/button';

interface TaskGanttChartProps {
  tasks: TaskType[];
  onEdit: (task: TaskType) => void;
  onDelete: (id: number) => void;
}

type ViewMode = 'Day' | 'Week' | 'Month';

interface ProcessedTask {
  id: number;
  name: string;
  startDate: Date;
  endDate: Date;
  progress: number;
  status: number;
  priority: number;
  duration: number;
  originalTask: TaskType;
  dependencies: number[];
}

const TaskGanttChart: React.FC<TaskGanttChartProps> = ({
  tasks,
  onEdit,
  onDelete,
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('Day');
  const [draggedTask, setDraggedTask] = useState<number | null>(null);
  const [dragType, setDragType] = useState<'move' | 'resize-left' | 'resize-right' | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const timelineRef = useRef<HTMLDivElement>(null);

  // Process tasks for Gantt display
  const processedTasks = useMemo((): ProcessedTask[] => {
    if (!tasks || tasks.length === 0) return [];

    return tasks
      .filter(task => task.start_date || task.due_date || task.end_date)
      .map(task => {
        let startDate: Date;
        let endDate: Date;
        const today = new Date();

        // Determine start date
        if (task.start_date) {
          startDate = parseISO(task.start_date);
        } else if (task.created_at) {
          startDate = parseISO(task.created_at);
        } else {
          startDate = today;
        }

        // Determine end date
        if (task.end_date) {
          endDate = parseISO(task.end_date);
        } else if (task.due_date) {
          endDate = parseISO(task.due_date);
        } else {
          endDate = addDays(startDate, 7);
        }

        // Validate dates
        if (!isValid(startDate)) startDate = today;
        if (!isValid(endDate)) endDate = addDays(startDate, 7);
        if (endDate <= startDate) endDate = addDays(startDate, 1);

        const duration = differenceInDays(endDate, startDate) + 1;

        return {
          id: task.id,
          name: task.name || `Task ${task.id}`,
          startDate,
          endDate,
          progress: task.status === 2 ? 100 : task.status === 1 ? 50 : 0,
          status: task.status,
          priority: task.priority,
          duration,
          originalTask: task,
          dependencies: task.parent_task_id ? [task.parent_task_id] : []
        };
      })
      .sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }, [tasks]);

  // Calculate timeline range based on view mode
  const timelineRange = useMemo(() => {
    if (processedTasks.length === 0) {
      const today = new Date();
      const start = startOfWeek(today);
      const end = endOfWeek(addDays(today, 30));
      return {
        start,
        end,
        periods: eachDayOfInterval({ start, end })
      };
    }

    const earliestStart = new Date(Math.min(...processedTasks.map(t => t.startDate.getTime())));
    const latestEnd = new Date(Math.max(...processedTasks.map(t => t.endDate.getTime())));
    
    let start: Date, end: Date, periods: Date[];

    switch (viewMode) {
      case 'Day':
        start = addDays(earliestStart, -7);
        end = addDays(latestEnd, 7);
        periods = eachDayOfInterval({ start, end });
        break;
      case 'Week':
        start = startOfWeek(addDays(earliestStart, -14));
        end = endOfWeek(addDays(latestEnd, 14));
        periods = eachWeekOfInterval({ start, end });
        break;
      case 'Month':
        start = startOfMonth(addMonths(earliestStart, -1));
        end = endOfMonth(addMonths(latestEnd, 1));
        periods = eachMonthOfInterval({ start, end });
        break;
      default:
        start = addDays(earliestStart, -7);
        end = addDays(latestEnd, 7);
        periods = eachDayOfInterval({ start, end });
    }

    return { start, end, periods };
  }, [processedTasks, viewMode]);

  // Get task bar style and position
  const getTaskBarStyle = (task: ProcessedTask) => {
    const totalPeriods = timelineRange.periods.length;
    let startIndex = -1;
    let endIndex = -1;

    if (viewMode === 'Day') {
      startIndex = timelineRange.periods.findIndex(day => 
        day.toDateString() === task.startDate.toDateString()
      );
      endIndex = timelineRange.periods.findIndex(day => 
        day.toDateString() === task.endDate.toDateString()
      );
    } else if (viewMode === 'Week') {
      startIndex = timelineRange.periods.findIndex(week => 
        task.startDate >= week && task.startDate <= endOfWeek(week)
      );
      endIndex = timelineRange.periods.findIndex(week => 
        task.endDate >= week && task.endDate <= endOfWeek(week)
      );
    } else if (viewMode === 'Month') {
      startIndex = timelineRange.periods.findIndex(month => 
        task.startDate >= month && task.startDate <= endOfMonth(month)
      );
      endIndex = timelineRange.periods.findIndex(month => 
        task.endDate >= month && task.endDate <= endOfMonth(month)
      );
    }

    if (startIndex === -1 || endIndex === -1) return null;

    const left = (startIndex / totalPeriods) * 100;
    const width = ((endIndex - startIndex + 1) / totalPeriods) * 100;

    let backgroundColor = '#3b82f6'; // Default blue
    if (task.status === 2) backgroundColor = '#10b981'; // Green for completed
    else if (task.priority === 2) backgroundColor = '#ef4444'; // Red for high priority
    else if (task.priority === 1) backgroundColor = '#f59e0b'; // Orange for medium priority
    else backgroundColor = '#6b7280'; // Gray for low priority

    return {
      left: `${left}%`,
      width: `${width}%`,
      backgroundColor,
      position: 'absolute' as const,
      height: '24px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      color: 'white',
      fontSize: '11px',
      fontWeight: '500',
      cursor: 'pointer',
      zIndex: 2,
      border: '1px solid rgba(255,255,255,0.3)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      top: '50%',
      transform: 'translateY(-50%)'
    };
  };

  // Handle resize/drag start
  const handleMouseDown = useCallback((e: React.MouseEvent, taskId: number, type: 'move' | 'resize-left' | 'resize-right') => {
    e.preventDefault();
    e.stopPropagation();
    setDraggedTask(taskId);
    setDragType(type);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  }, []);

  // Format period label based on view mode
  const formatPeriodLabel = (period: Date, index: number) => {
    switch (viewMode) {
      case 'Day':
        return (
          <div className="text-center px-1">
            <div className="text-xs font-medium text-gray-700">{format(period, 'MMM')}</div>
            <div className="text-sm font-semibold text-gray-900">{format(period, 'd')}</div>
            <div className="text-xs text-gray-500">{format(period, 'EEE')}</div>
          </div>
        );
      case 'Week':
        const weekEnd = endOfWeek(period);
        return (
          <div className="text-center px-1">
            <div className="text-xs font-medium text-gray-700">{format(period, 'MMM')}</div>
            <div className="text-sm font-semibold text-gray-900">{format(period, 'd')}-{format(weekEnd, 'd')}</div>
          </div>
        );
      case 'Month':
        return (
          <div className="text-center px-1">
            <div className="text-sm font-semibold text-gray-900">{format(period, 'MMM')}</div>
            <div className="text-xs text-gray-500">{format(period, 'yyyy')}</div>
          </div>
        );
      default:
        return format(period, 'MMM d');
    }
  };

  // Get column width based on view mode
  const getColumnWidth = () => {
    switch (viewMode) {
      case 'Day': return 'w-16'; // 64px
      case 'Week': return 'w-20'; // 80px
      case 'Month': return 'w-24'; // 96px
      default: return 'w-16';
    }
  };

  if (processedTasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow border">
        <div className="text-center">
          <p className="text-gray-500 mb-2">No tasks with dates found</p>
          <p className="text-sm text-gray-400">
            Tasks need start dates, due dates, or end dates to appear in the Gantt chart
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold text-gray-900">Tasks Gantt</h2>
          <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {processedTasks.length} task{processedTasks.length !== 1 ? 's' : ''}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">View:</label>
            <select
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value as ViewMode)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Day">Day</option>
              <option value="Week">Week</option>
              <option value="Month">Month</option>
            </select>
          </div>

          <div className="flex items-center space-x-1 border-l border-gray-300 pl-3">
            <Button
              variant={viewMode === 'Day' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('Day')}
              className="text-xs"
            >
              Day
            </Button>
            <Button
              variant={viewMode === 'Week' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('Week')}
              className="text-xs"
            >
              Week
            </Button>
            <Button
              variant={viewMode === 'Month' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('Month')}
              className="text-xs"
            >
              Month
            </Button>
          </div>
        </div>
      </div>

      {/* Gantt Chart Container */}
      <div className="flex">
        {/* Fixed Task Names Column */}
        <div className="w-64 bg-gray-50 border-r border-gray-200 flex-shrink-0">
          {/* Header for task names */}
          <div className="h-16 flex items-center px-4 border-b border-gray-200 bg-gray-100">
            <span className="font-medium text-sm text-gray-700">Task Name</span>
          </div>
          
          {/* Task name rows */}
          <div className="divide-y divide-gray-200">
            {processedTasks.map((task) => (
              <div key={task.id} className="h-12 flex items-center px-4 bg-white hover:bg-gray-50">
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-900 truncate">
                    {task.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {task.status === 2 ? 'Done' : task.status === 1 ? 'In Progress' : 'To Do'}
                    {' • '}
                    {task.priority === 2 ? 'High' : task.priority === 1 ? 'Medium' : 'Low'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scrollable Timeline Section */}
        <div className="flex-1 overflow-x-auto" ref={timelineRef}>
          <div className="min-w-max">
            {/* Timeline Header */}
            <div className="h-16 bg-gray-100 border-b border-gray-200 sticky top-0 z-10">
              <div className="flex h-full">
                {timelineRange.periods.map((period, index) => (
                  <div
                    key={index}
                    className={`${getColumnWidth()} flex-shrink-0 border-r border-gray-200 flex items-center justify-center`}
                  >
                    {formatPeriodLabel(period, index)}
                  </div>
                ))}
              </div>
            </div>

            {/* Task Timeline Rows */}
            <div className="divide-y divide-gray-200">
              {processedTasks.map((task) => {
                const barStyle = getTaskBarStyle(task);
                
                return (
                  <div key={task.id} className="h-12 relative bg-white hover:bg-gray-50">
                    {/* Grid background */}
                    <div className="absolute inset-0 flex">
                      {timelineRange.periods.map((_, periodIndex) => (
                        <div
                          key={periodIndex}
                          className={`${getColumnWidth()} flex-shrink-0 border-r border-gray-100`}
                        />
                      ))}
                    </div>
                    
                    {/* Task Bar */}
                    {barStyle && (
                      <div
                        style={barStyle}
                        className="group relative"
                        title={`${task.name} (${format(task.startDate, 'MMM d')} - ${format(task.endDate, 'MMM d')})`}
                      >
                        {/* Left resize handle */}
                        <div
                          className="absolute left-0 top-0 w-2 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white bg-opacity-50 rounded-l"
                          onMouseDown={(e) => handleMouseDown(e, task.id, 'resize-left')}
                        />
                        
                        {/* Task content */}
                        <div
                          className="flex-1 h-full flex items-center px-2 cursor-move"
                          onMouseDown={(e) => handleMouseDown(e, task.id, 'move')}
                        >
                          <span className="truncate text-white text-xs font-medium">
                            {task.name}
                          </span>
                        </div>
                        
                        {/* Right resize handle */}
                        <div
                          className="absolute right-0 top-0 w-2 h-full cursor-ew-resize opacity-0 group-hover:opacity-100 bg-white bg-opacity-50 rounded-r"
                          onMouseDown={(e) => handleMouseDown(e, task.id, 'resize-right')}
                        />
                        
                        {/* Progress indicator */}
                        {task.progress > 0 && (
                          <div
                            className="absolute top-0 left-0 h-full rounded-l"
                            style={{ 
                              width: `${task.progress}%`,
                              backgroundColor: 'rgba(0,0,0,0.2)',
                              borderRight: task.progress < 100 ? '2px solid rgba(255,255,255,0.8)' : 'none'
                            }}
                          />
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-50 border-t">
        <div className="flex items-center space-x-6 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Completed</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>High Priority</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded"></div>
            <span>Medium Priority</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span>Low Priority</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-black bg-opacity-20 rounded"></div>
            <span>Progress</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskGanttChart;
