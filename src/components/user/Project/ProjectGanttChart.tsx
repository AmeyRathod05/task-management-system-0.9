import React, { useEffect, useState, useRef } from 'react';
import { Project, GanttTask } from '@/types/project';
import Button from '@/components/ui/button/Button';

interface ProjectGanttChartProps {
  projects: Project[];
}

type TimeView = 'day' | 'month' | 'year';

const ProjectGanttChart: React.FC<ProjectGanttChartProps> = ({ projects = [] }) => {
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [timelineStart, setTimelineStart] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  });
  const [timelineEnd, setTimelineEnd] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 6);
    return date;
  });
  const [timeView, setTimeView] = useState<TimeView>('month');
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [excludeWeekends, setExcludeWeekends] = useState(false);
  const [holidays, setHolidays] = useState<Date[]>([]);
  const popupRef = useRef<HTMLDivElement>(null);
  const [viewStartDate, setViewStartDate] = useState<Date>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 1);
    return date;
  });

  // Convert project data to Gantt tasks
  useEffect(() => {
    if (!projects || projects.length === 0) {
      setTasks([]);
      return;
    }

    const ganttTasks = projects.map(project => {
      try {
        // Parse dates or use current date as fallback
        const startDate = project.start_date ? new Date(project.start_date) : new Date();
        let endDate = project.end_date ? new Date(project.end_date) : new Date();
        
        // Ensure end date is not before start date
        if (endDate < startDate) {
          endDate = new Date(startDate);
          endDate.setDate(startDate.getDate() + 1);
        }
        
        // Calculate progress based on status
        const getProgressByStatus = (status: string): number => {
          switch (status) {
            case 'completed': return 100;
            case 'in_progress': return 50;
            case 'active': return 30;
            case 'pending': 
            default: return 0;
          }
        };
        
        return {
          id: project.id || `project-${Math.random().toString(36).substr(2, 9)}`,
          name: project.name || 'Unnamed Project',
          start: startDate,
          end: endDate,
          progress: getProgressByStatus(project.status || 'pending'),
          assignee: project.assignedTo || 'Unassigned',
          priority: project.priority || 'medium',
          status: project.status || 'pending',
          dependencies: []
        };
      } catch (error) {
        console.error('Error processing project:', project.id, error);
        // Return a default task in case of error
        const now = new Date();
        return {
          id: project.id || `project-${Math.random().toString(36).substr(2, 9)}`,
          name: project.name || 'Unnamed Project',
          start: now,
          end: new Date(now.getTime() + 24 * 60 * 60 * 1000), // 1 day later
          progress: 0,
          assignee: 'Unassigned',
          priority: 'medium',
          status: 'pending',
          dependencies: []
        };
      }
    });

    setTasks(ganttTasks);
    
    // Update timeline range based on tasks
    updateTimelineRange(ganttTasks);
  }, [projects]);

  // Update timeline range based on tasks
  const updateTimelineRange = (tasks: GanttTask[]) => {
    if (tasks.length === 0) {
      const start = new Date();
      start.setMonth(start.getMonth() - 1);
      const end = new Date();
      end.setMonth(end.getMonth() + 6);
      
      setTimelineStart(start);
      setTimelineEnd(end);
      setViewStartDate(new Date(start));
      return;
    }
    
    let earliest = new Date(tasks[0].start);
    let latest = new Date(tasks[0].end);
    
    tasks.forEach(task => {
      if (task.start < earliest) earliest = new Date(task.start);
      if (task.end > latest) latest = new Date(task.end);
    });
    
    // Add some padding to the timeline
    earliest.setMonth(earliest.getMonth() - 1);
    latest.setMonth(latest.getMonth() + 1);
    
    setTimelineStart(earliest);
    setTimelineEnd(latest);
    setViewStartDate(new Date(earliest));
  };

  // Helper function to determine progress based on status
  const getProgressByStatus = (status: string): number => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 100;
      case 'active':
        return 50;
      case 'pending':
        return 0;
      default:
        return 0;
    }
  };

  // Calculate the total duration of the timeline in days
  const timelineDurationDays = Math.ceil(
    (timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24)
  );

  // Handle task click to show popup
  const handleTaskClick = (task: GanttTask, e: React.MouseEvent) => {
    setSelectedTask(task);
    // Get the position of the clicked element for better popup positioning
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    // Position popup below the middle of the task bar
    setPopupPosition({ 
      x: rect.left + (rect.width / 2), 
      y: rect.bottom 
    });
  };

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setSelectedTask(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popupRef]);

  // Synchronize scrolling between header and task bars
  useEffect(() => {
    const headerContainer = document.getElementById('gantt-scroll-container');
    const taskContainers = document.querySelectorAll('.task-scroll-container');
    
    if (!headerContainer || taskContainers.length === 0) return;
    
    const syncScroll = () => {
      const scrollLeft = headerContainer.scrollLeft;
      taskContainers.forEach(container => {
        (container as HTMLElement).scrollLeft = scrollLeft;
      });
    };
    
    headerContainer.addEventListener('scroll', syncScroll);
    return () => {
      headerContainer.removeEventListener('scroll', syncScroll);
    };
  }, [tasks, timeView]);

  // Handle adding a holiday
  const handleAddHoliday = (date: string) => {
    if (date) {
      setHolidays([...holidays, new Date(date)]);
    }
  };

  // Generate time labels based on the current view (day, month, year)
  const generateTimeLabels = () => {
    const labels = [];
    const today = new Date();
    
    // Determine the number of labels and format based on the view
    let numLabels = 30; // Default for day view
    let dateFormat: Intl.DateTimeFormatOptions = { day: 'numeric' };
    
    switch (timeView) {
      case 'day':
        numLabels = 30;
        dateFormat = { day: 'numeric', month: 'short' };
        break;
      case 'month':
        numLabels = 12;
        dateFormat = { month: 'short' };
        break;
      case 'year':
        numLabels = 5;
        dateFormat = { year: 'numeric' };
        break;
    }
    
    // Generate labels starting from the view start date
    const currentDate = new Date(viewStartDate);
    
    // Adjust the start date to the beginning of the period based on view
    if (timeView === 'month') {
      currentDate.setDate(1); // Start from the 1st of the month
    } else if (timeView === 'year') {
      currentDate.setMonth(0); // Start from January
      currentDate.setDate(1); // Start from the 1st
    }
    
    for (let i = 0; i < numLabels; i++) {
      const date = new Date(currentDate);
      const isToday = date.toDateString() === today.toDateString();
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const isHoliday = holidays.some(h => h.toDateString() === date.toDateString());
      
      labels.push({
        date: date.toISOString(),
        label: date.toLocaleDateString(undefined, dateFormat),
        isToday,
        isWeekend,
        isHoliday
      });
      
      // Increment the date based on the view
      if (timeView === 'day') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (timeView === 'month') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (timeView === 'year') {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      }
    }
    
    return labels;
  };

  // Calculate the position and width of a task bar
  const calculateTaskPosition = (task: GanttTask) => {
    // Get visible time range based on current view
    let visibleStartDate = new Date(viewStartDate);
    let visibleEndDate = new Date(viewStartDate);
    
    switch (timeView) {
      case 'day':
        visibleEndDate.setDate(visibleStartDate.getDate() + 30); // Show 30 days
        break;
      case 'month':
        visibleEndDate.setMonth(visibleStartDate.getMonth() + 6); // Show 6 months
        break;
      case 'year':
        visibleEndDate.setFullYear(visibleStartDate.getFullYear() + 5); // Show 5 years
        break;
    }
    
    // Calculate total visible time span in milliseconds
    const visibleTimeSpan = visibleEndDate.getTime() - visibleStartDate.getTime();
    
    // For day view, always show the task regardless of visible range
    // This ensures all tasks are visible when in day view
    let taskStartTime, taskEndTime;
    if (timeView === 'day') {
      taskStartTime = task.start.getTime();
      taskEndTime = task.end.getTime();
    } else {
      // For other views, clip to visible range
      taskStartTime = Math.max(task.start.getTime(), visibleStartDate.getTime());
      taskEndTime = Math.min(task.end.getTime(), visibleEndDate.getTime());
    }
    
    // Calculate position as percentage of visible time span
    const startOffset = taskStartTime - visibleStartDate.getTime();
    const taskDuration = taskEndTime - taskStartTime;
    
    const left = (startOffset / visibleTimeSpan) * 100;
    const width = (taskDuration / visibleTimeSpan) * 100;
    
    // Ensure minimum width for very short tasks
    const minWidth = 3;
    
    return { 
      left: `${left}%`, // Don't clip left position in day view to allow scrolling
      width: `${Math.max(minWidth, width)}%`,
      taskStartTime,
      taskEndTime
    };
  };

  // Get color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-500';
      case 'medium':
        return 'bg-blue-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get color based on status
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 border-green-500';
      case 'active':
        return 'bg-blue-100 border-blue-500';
      case 'pending':
        return 'bg-yellow-100 border-yellow-500';
      default:
        return 'bg-gray-100 border-gray-500';
    }
  };

  // Navigate timeline
  const navigateTimeline = (direction: 'prev' | 'next') => {
    const newDate = new Date(viewStartDate);
    
    switch (timeView) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 30 : -30));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 6 : -6));
        break;
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 5 : -5));
        break;
    }
    
    setViewStartDate(newDate);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900">Project Timeline</h3>
          
          <div className="flex items-center space-x-4">
            {/* View Type Selector */}
            <div className="flex border rounded-md overflow-hidden">
              <button 
                className={`px-3 py-1 text-sm ${timeView === 'day' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setTimeView('day')}
              >
                Day
              </button>
              <button 
                className={`px-3 py-1 text-sm ${timeView === 'month' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setTimeView('month')}
              >
                Month
              </button>
              <button 
                className={`px-3 py-1 text-sm ${timeView === 'year' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setTimeView('year')}
              >
                Year
              </button>
            </div>
            
            {/* Navigation Controls */}
            <div className="flex items-center space-x-2">
              <button 
                className="p-1 rounded-full hover:bg-gray-100"
                onClick={() => navigateTimeline('prev')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button 
                className="text-sm font-medium px-2 py-1 bg-blue-50 text-blue-600 rounded"
                onClick={() => {
                  const today = new Date();
                  setViewStartDate(today);
                }}
              >
                Today
              </button>
              <button 
                className="p-1 rounded-full hover:bg-gray-100"
                onClick={() => navigateTimeline('next')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {tasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No projects to display. Add a project to see the timeline.
          </div>
        ) : (
          <div className="flex flex-col">
            {/* Timeline Header */}
            <div className="flex">
              <div className="w-1/4 pr-4 flex-shrink-0">
                <div className="font-medium text-gray-700 pb-2 border-b border-gray-200">Project</div>
              </div>
              
              <div className="w-3/4 overflow-x-auto" style={{ scrollbarWidth: 'thin' }} id="gantt-scroll-container">
                <div className={`flex border-b border-gray-200 pb-2 ${timeView === 'day' ? 'min-w-[1200px]' : ''}`}>
                  {generateTimeLabels().map((label, index) => (
                    <div 
                      key={index} 
                      className={`text-sm flex-grow text-center ${label.isToday ? 'bg-blue-50 font-bold text-blue-600' : ''} 
                        ${label.isWeekend ? 'bg-gray-50' : ''} ${label.isHoliday ? 'bg-red-50' : ''}`}
                      style={{ 
                        flexBasis: `${100 / Math.max(1, generateTimeLabels().length)}%` 
                      }}
                    >
                      {label.label}
                      {timeView === 'month' && index === 0 && (
                        <span className="text-xs block text-gray-500">{new Date(label.date).getFullYear()}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Gantt chart body */}
            <div className="mt-4 flex flex-col">
              {tasks.map(task => {
                const { left, width } = calculateTaskPosition(task);
                return (
                  <div key={task.id} className="flex items-center mb-4">
                    <div className="w-1/4 pr-4 flex-shrink-0">
                      <div className="font-medium text-gray-800">{task.name}</div>
                      <div className="text-xs text-gray-500">
                        {task.assignee} • {task.priority} Priority
                      </div>
                    </div>
                    
                    <div className="w-3/4 overflow-x-auto task-scroll-container" style={{ scrollbarWidth: 'none' }}>
                      <div className={`relative h-10 ${timeView === 'day' ? 'min-w-[1200px]' : 'w-full'}`}>
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex">
                          {generateTimeLabels().map((_, index) => (
                            <div 
                              key={index}
                              className={`border-r border-gray-200 h-full ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                              style={{ 
                                flexBasis: `${100 / Math.max(1, generateTimeLabels().length)}%` 
                              }}
                            />
                          ))}
                        </div>
                        
                        {/* Task bar */}
                        <div 
                          className={`absolute h-8 rounded-md border-2 ${getStatusColor(task.status)} flex items-center justify-center text-xs font-medium cursor-pointer hover:shadow-md transition-shadow duration-200`}
                          style={{ 
                            left: `${Math.max(0, parseFloat(left))}%`, 
                            width: `${Math.max(5, parseFloat(width))}%`,
                            top: '4px'
                          }}
                          onClick={(e) => handleTaskClick(task, e)}
                        >
                          <div className="truncate px-2 text-gray-700">
                            {task.name}
                          </div>
                          <div 
                            className={`absolute left-0 top-0 bottom-0 ${getPriorityColor(task.priority)} opacity-70 rounded-l-sm`}
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* Task popup */}
      {selectedTask && (
        <div 
          ref={popupRef}
          className="absolute bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50 w-80"
          style={{ 
            left: popupPosition.x, 
            top: popupPosition.y,
            transform: 'translate(-50%, 0)',
            marginTop: '10px',
            maxWidth: '300px',
            zIndex: 50
          }}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-medium text-gray-900">{selectedTask.name}</h4>
            <button 
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setSelectedTask(null)}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Assigned to:</span>
              <span className="font-medium">{selectedTask.assignee}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Start date:</span>
              <span className="font-medium">{selectedTask.start.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">End date:</span>
              <span className="font-medium">{selectedTask.end.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Duration:</span>
              <span className="font-medium">
                {Math.ceil((selectedTask.end.getTime() - selectedTask.start.getTime()) / (1000 * 60 * 60 * 24))} days
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Status:</span>
              <span className={`font-medium ${selectedTask.status === 'Completed' ? 'text-green-600' : selectedTask.status === 'Active' ? 'text-blue-600' : 'text-yellow-600'}`}>
                {selectedTask.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Priority:</span>
              <span className={`font-medium ${selectedTask.priority === 'High' ? 'text-red-600' : selectedTask.priority === 'Medium' ? 'text-blue-600' : 'text-green-600'}`}>
                {selectedTask.priority}
              </span>
            </div>
            <div className="pt-2">
              <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${selectedTask.progress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs mt-1">
                <span>Progress</span>
                <span>{selectedTask.progress}%</span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Controls and Legend */}
      <div className="border-t border-gray-200 pt-4 mt-4">
        <div className="flex flex-wrap justify-between items-center text-sm text-gray-500">
          <div className="flex items-center space-x-4 mb-2 sm:mb-0">
            <div>
              <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span> High Priority
              <span className="inline-block w-3 h-3 bg-blue-500 rounded-full mx-1 ml-3"></span> Medium
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full mx-1 ml-3"></span> Low
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="inline-block px-2 py-1 bg-green-100 border border-green-500 rounded mr-1 text-xs">Completed</span>
            <span className="inline-block px-2 py-1 bg-blue-100 border border-blue-500 rounded mx-1 text-xs">Active</span>
            <span className="inline-block px-2 py-1 bg-yellow-100 border border-yellow-500 rounded mx-1 text-xs">Pending</span>
          </div>
        </div>
      </div>
      
      {/* Additional Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <div className="flex items-center">
            <span className="text-sm text-gray-700 mr-2">Mark a holiday:</span>
            <input 
              type="date" 
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              onChange={(e) => handleAddHoliday(e.target.value)}
            />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-end">
            <span className="text-sm text-gray-700 mr-2">Exclude weekends:</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer"
                checked={excludeWeekends}
                onChange={() => setExcludeWeekends(!excludeWeekends)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectGanttChart;
