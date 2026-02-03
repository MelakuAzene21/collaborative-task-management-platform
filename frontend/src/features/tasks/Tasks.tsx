import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_TASKS, CREATE_TASK, GET_PROJECTS, GET_USERS, UPDATE_TASK } from '../../api/queries';
import { useAuth, useNotifications } from '../../hooks';
import { 
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { formatDate, getStatusColor, getPriorityColor } from '../../utils/helpers';

interface TaskFormData {
  title: string;
  description: string;
  projectId: string;
  assigneeId: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string;
}

const Tasks: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  
  // Read projectId from URL parameters on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const projectId = urlParams.get('projectId');
    if (projectId) {
      setSelectedProject(projectId);
      setTaskForm(prev => ({ ...prev, projectId }));
    }
  }, []);

  const [taskForm, setTaskForm] = useState<TaskFormData>({
    title: '',
    description: '',
    projectId: '',
    assigneeId: '',
    priority: 'MEDIUM',
    dueDate: '',
  });

  const { data: tasksData, loading, refetch } = useQuery(GET_TASKS, {
    variables: { projectId: selectedProject || 'all' },
  });
  const { data: projectsData } = useQuery(GET_PROJECTS);
  const { data: usersData } = useQuery(GET_USERS);
  const [createTaskMutation] = useMutation(CREATE_TASK);
  const [updateTaskMutation] = useMutation(UPDATE_TASK);

  const tasks = tasksData?.tasks || [];
  const projects = projectsData?.projects || [];
  const users = usersData?.users || [];

  // Role-based permissions
  const isAdmin = user?.role === 'ADMIN';
  const isLead = user?.role === 'LEAD';
  const canManageTasks = isAdmin || isLead;

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createTaskMutation({
        variables: {
          input: taskForm,
        },
      });
      
      addNotification('Task created successfully!', 'success');
      setShowCreateTask(false);
      setTaskForm({ 
        title: '', 
        description: '', 
        projectId: '', 
        assigneeId: '',
        priority: 'MEDIUM', 
        dueDate: '' 
      });
      refetch();
    } catch (error) {
      addNotification('Failed to create task', 'error');
    }
  };

  const handleAssignTask = async (taskId: string, assigneeId: string) => {
    try {
      await updateTaskMutation({
        variables: { 
          id: taskId, 
          input: { assigneeId: assigneeId || null } 
        },
      });
      
      addNotification(
        assigneeId ? 'Task assigned successfully!' : 'Task unassigned successfully!',
        'success'
      );
      refetch();
    } catch (error) {
      addNotification('Failed to update task assignment', 'error');
    }
  };

  const canManageTask = (task: any) => {
    if (isAdmin) return true;
    if (isLead) {
      // Check if user is lead of the task's project team
      const project = projects.find((p: any) => p.id === task.projectId);
      return project?.team?.members?.some((member: any) => 
        member.userId === user?.id && member.user.role === 'LEAD'
      );
    }
    return false;
  };

  const isAssignedToMe = (task: any) => {
    return task.assigneeId === user?.id;
  };

  const filteredTasks = tasks.filter((task: any) => {
    // For members, only show tasks assigned to them
    if (!canManageTasks && !isAssignedToMe(task)) return false;
    
    // Apply filters
    if (filterStatus !== 'ALL' && task.status !== filterStatus) return false;
    if (filterPriority !== 'ALL' && task.priority !== filterPriority) return false;
    
    return true;
  });

  const getTaskStats = () => {
    const total = filteredTasks.length;
    const completed = filteredTasks.filter((task: any) => task.status === 'DONE').length;
    const inProgress = filteredTasks.filter((task: any) => task.status === 'IN_PROGRESS').length;
    const todo = filteredTasks.filter((task: any) => task.status === 'TODO').length;
    const overdue = filteredTasks.filter((task: any) => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < new Date() && task.status !== 'DONE';
    }).length;
    const highPriority = filteredTasks.filter((task: any) => task.priority === 'HIGH' && task.status !== 'DONE').length;

    return { total, completed, inProgress, todo, overdue, highPriority };
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>;
  }

  const stats = getTaskStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-gray-600">
            {canManageTasks ? 'Manage and track project tasks' : 'View your assigned tasks'}
          </p>
        </div>
        
        {canManageTasks && (
          <button
            onClick={() => setShowCreateTask(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Task
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
            <select
              className="input"
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
            >
              <option value="">All Projects</option>
              {projects.map((project: any) => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="input"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Completed</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              className="input"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
            >
              <option value="ALL">All Priority</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
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
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overdue}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <UserIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">{stats.highPriority}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Tasks ({filteredTasks.length})</h3>
        </div>
        
        <div className="card-content">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-8">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <CheckCircleIcon />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {canManageTasks ? 'Create a new task to get started.' : 'No tasks assigned to you match the current filters.'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTasks.map((task: any) => {
                const canEdit = canManageTask(task);
                const isMine = isAssignedToMe(task);
                
                return (
                  <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900 mb-2">{task.title}</h4>
                        <div className="flex flex-wrap gap-2 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                            {task.status}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          {task.assigneeId ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <UserIcon className="h-3 w-3 mr-1" />
                              Assigned to {task.assignee?.name || 'Unknown'}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              <UserIcon className="h-3 w-3 mr-1" />
                              Unassigned
                            </span>
                          )}
                          {isMine && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Assigned to you
                            </span>
                          )}
                        </div>
                        
                        {task.description && (
                          <p className="mt-2 text-sm text-gray-600">{task.description}</p>
                        )}
                        
                        <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                          {task.assigneeId && (
                            <div className="flex items-center">
                              <UserIcon className="h-4 w-4 mr-1" />
                              {task.assignee?.name || 'Unassigned'}
                            </div>
                          )}
                          
                          {task.dueDate && (
                            <div className="flex items-center">
                              <CalendarIcon className="h-4 w-4 mr-1" />
                              {formatDate(task.dueDate)}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {canEdit && (
                        <div className="flex space-x-2 ml-4">
                          <button className="p-2 text-gray-400 hover:text-gray-600">
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button className="p-2 text-gray-400 hover:text-red-600">
                            <TrashIcon className="h-4 w-4" />
                          </button>
                          <div className="relative">
                            <select
                              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500"
                              value={task.assigneeId || ''}
                              onChange={(e) => handleAssignTask(task.id, e.target.value)}
                            >
                              <option value="">Assign...</option>
                              <option value="">Unassigned</option>
                              {users
                                .filter((user: any) => user.role === 'MEMBER' || user.role === 'LEAD')
                                .map((user: any) => (
                                  <option key={user.id} value={user.id}>
                                    {user.name}
                                  </option>
                                ))}
                            </select>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Create Task Modal */}
      {showCreateTask && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowCreateTask(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateTask}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Task</h3>
                    <p className="mt-1 text-sm text-gray-500">Create a new task and assign it to team members.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="taskTitle" className="block text-sm font-medium text-gray-700">
                        Task Title
                      </label>
                      <input
                        id="taskTitle"
                        type="text"
                        className="mt-1 input"
                        value={taskForm.title}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="taskDescription" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="taskDescription"
                        rows={3}
                        className="mt-1 input"
                        value={taskForm.description}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label htmlFor="taskProject" className="block text-sm font-medium text-gray-700">
                        Project
                      </label>
                      <select
                        id="taskProject"
                        className="mt-1 input"
                        value={taskForm.projectId}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, projectId: e.target.value }))}
                        required
                      >
                        <option value="">Select a project</option>
                        {projects.map((project: any) => (
                          <option key={project.id} value={project.id}>{project.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="taskAssignee" className="block text-sm font-medium text-gray-700">
                        Assign to (optional)
                      </label>
                      <select
                        id="taskAssignee"
                        className="mt-1 input"
                        value={taskForm.assigneeId}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, assigneeId: e.target.value }))}
                      >
                        <option value="">Unassigned</option>
                        {users
                          .filter((user: any) => user.role === 'MEMBER' || user.role === 'LEAD')
                          .map((user: any) => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.role})
                            </option>
                          ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="taskPriority" className="block text-sm font-medium text-gray-700">
                        Priority
                      </label>
                      <select
                        id="taskPriority"
                        className="mt-1 input"
                        value={taskForm.priority}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, priority: e.target.value as any }))}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="taskDueDate" className="block text-sm font-medium text-gray-700">
                        Due Date
                      </label>
                      <input
                        id="taskDueDate"
                        type="date"
                        className="mt-1 input"
                        value={taskForm.dueDate}
                        onChange={(e) => setTaskForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create Task
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowCreateTask(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
