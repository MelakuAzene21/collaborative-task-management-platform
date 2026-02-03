import React, { useState } from 'react';
import { useQuery } from '@apollo/client/react';
import { 
  ChevronLeftIcon, 
  ChevronRightIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../hooks';
import { GET_TASKS } from '../../api/queries';
import { formatDate, getStatusColor, getPriorityColor } from '../../utils/helpers';

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'TODO' | 'IN_PROGRESS' | 'COMPLETED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  projectId: string;
  assigneeId?: string;
  project?: {
    id: string;
    name: string;
  };
  assignee?: {
    id: string;
    name: string;
    email: string;
  };
}

const Calendar: React.FC = () => {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Fetch tasks based on user role
  const { data: tasksData, loading } = useQuery(GET_TASKS, {
    variables: { 
      projectId: user?.role === 'MEMBER' ? 'all' : 'all' // We'll filter on frontend for now
    },
  });

  // Filter tasks based on user role
  const getFilteredTasks = () => {
    if (!tasksData?.tasks) return [];
    
    const tasks = tasksData.tasks;
    
    // Members can only see tasks assigned to them
    if (user?.role === 'MEMBER') {
      return tasks.filter((task: Task) => task.assigneeId === user.id);
    }
    
    // Admin and Lead can see all tasks
    return tasks;
  };

  const tasks = getFilteredTasks();

  // Convert tasks to calendar events
  const getTasksForDate = (date: Date) => {
    return tasks.filter((task: Task) => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return taskDate.toDateString() === date.toDateString();
    });
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getTaskIcon = (status: string) => {
    switch (status) {
      case 'TODO':
        return <ClockIcon className="h-3 w-3" />;
      case 'IN_PROGRESS':
        return <ExclamationTriangleIcon className="h-3 w-3" />;
      case 'COMPLETED':
        return <CheckCircleIcon className="h-3 w-3" />;
      default:
        return <ClockIcon className="h-3 w-3" />;
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const days = getDaysInMonth(currentDate);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Task Calendar</h1>
            <p className="text-gray-600">
              {user?.role === 'MEMBER' 
                ? 'View your assigned tasks and deadlines' 
                : 'View all tasks and deadlines'
              }
              {loading && ' (Loading...)'}
            </p>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4" />
            <span>{tasks.length} tasks</span>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between bg-white p-4 rounded-lg shadow">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          
          <h2 className="text-xl font-semibold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-lg shadow">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {weekDays.map(day => (
            <div key={day} className="p-3 text-center text-sm font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((date, index) => {
            const dayTasks = date ? getTasksForDate(date) : [];
            const isCurrentDay = date ? isToday(date) : false;

            return (
              <div
                key={index}
                className={`
                  min-h-[100px] p-2 border-r border-b border-gray-200 last:border-r-0 cursor-pointer
                  hover:bg-gray-50 transition-colors
                  ${isCurrentDay ? 'bg-blue-50' : ''}
                  ${!date ? 'bg-gray-50' : ''}
                `}
                onClick={() => date && setSelectedDate(date)}
              >
                {date && (
                  <>
                    <div className={`
                      text-sm font-medium mb-1
                      ${isCurrentDay ? 'text-blue-600' : 'text-gray-900'}
                    `}>
                      {date.getDate()}
                    </div>
                    
                    {/* Tasks for this day */}
                    <div className="space-y-1">
                      {dayTasks.slice(0, 3).map(task => (
                        <div
                          key={task.id}
                          className={`
                            text-xs p-1 rounded flex items-center gap-1
                            ${getPriorityColor(task.priority)}
                          `}
                          title={task.title}
                        >
                          {getTaskIcon(task.status)}
                          <span className="truncate">{task.title}</span>
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {selectedDate.toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </h3>
          
          <div className="space-y-3">
            {getTasksForDate(selectedDate).length > 0 ? (
              getTasksForDate(selectedDate).map(task => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-md"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-md ${getPriorityColor(task.priority)}`}>
                      {getTaskIcon(task.status)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{task.title}</p>
                      <p className="text-sm text-gray-500">
                        {task.project?.name && `Project: ${task.project.name}`}
                        {task.assignee && ` • Assigned to: ${task.assignee.name}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(task.status)}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-8">
                No tasks due on this day
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;
