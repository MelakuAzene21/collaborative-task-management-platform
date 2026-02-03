import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_PROJECTS, GET_TASKS } from '../../api/queries';
import { Loading, ErrorDisplay } from '../../common/Loading';
import { useAuth } from '../../hooks';
import { 
  FolderIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { formatDate, getStatusColor, getPriorityColor } from '../../utils/helpers';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { data: projectsData, loading: projectsLoading, error: projectsError } = useQuery(GET_PROJECTS);
  const { data: tasksData, loading: tasksLoading, error: tasksError } = useQuery(GET_TASKS, {
    variables: { projectId: 'all' }, // This would need to be adjusted based on your API
    skip: !projectsData?.projects?.[0]?.id,
  });

  if (projectsLoading || tasksLoading) return <Loading message="Loading dashboard..." />;
  if (projectsError || tasksError) return <ErrorDisplay message={projectsError?.message || tasksError?.message || 'Failed to load dashboard'} />;

  const projects = projectsData?.projects || [];
  const tasks = tasksData?.tasks || [];

  // Calculate statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task: any) => task.status === 'DONE').length;
  const inProgressTasks = tasks.filter((task: any) => task.status === 'IN_PROGRESS').length;
  const todoTasks = tasks.filter((task: any) => task.status === 'TODO').length;
  const overdueTasks = tasks.filter((task: any) => {
    if (!task.dueDate) return false;
    return new Date(task.dueDate) < new Date() && task.status !== 'DONE';
  }).length;

  const recentProjects = projects.slice(0, 5);
  const highPriorityTasks = tasks.filter((task: any) => task.priority === 'HIGH' && task.status !== 'DONE').slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Welcome back, {user?.name}! Here's what's happening with your projects.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FolderIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{completedTasks}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{inProgressTasks}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Overdue Tasks</p>
                <p className="text-2xl font-bold text-gray-900">{overdueTasks}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Recent Projects</h3>
            <p className="card-description">Your latest projects</p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {recentProjects.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No projects yet</p>
              ) : (
                recentProjects.map((project: any) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FolderIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">{project.name}</p>
                        <p className="text-sm text-gray-500">{project.team?.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">
                        {project.tasks?.length || 0} tasks
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* High Priority Tasks */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">High Priority Tasks</h3>
            <p className="card-description">Tasks that need your attention</p>
          </div>
          <div className="card-content">
            <div className="space-y-4">
              {highPriorityTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No high priority tasks</p>
              ) : (
                highPriorityTasks.map((task: any) => (
                  <div key={task.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{task.title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        {task.dueDate && (
                          <p className="text-sm text-gray-500 mt-1">
                            Due: {formatDate(task.dueDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Task Status Overview */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Task Status Overview</h3>
          <p className="card-description">Distribution of tasks by status</p>
        </div>
        <div className="card-content">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <p className="text-2xl font-bold text-green-600">{completedTasks}</p>
              <p className="text-sm text-green-800">Completed</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{inProgressTasks}</p>
              <p className="text-sm text-blue-800">In Progress</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className="text-2xl font-bold text-gray-600">{todoTasks}</p>
              <p className="text-sm text-gray-800">To Do</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
