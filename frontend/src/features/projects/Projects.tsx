import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_PROJECTS, CREATE_PROJECT, UPDATE_PROJECT, DELETE_PROJECT, GET_TEAMS } from '../../api/queries';
import { useAuth, useNotifications } from '../../hooks';
import { 
  FolderIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CalendarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { formatDate, getStatusColor, getPriorityColor } from '../../utils/helpers';

interface ProjectFormData {
  name: string;
  description: string;
  teamId: string;
  dueDate: string;
}

const Projects: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const [deletingProject, setDeletingProject] = useState<any>(null);
  const [managingProject, setManagingProject] = useState<any>(null);
  
  const [projectForm, setProjectForm] = useState<ProjectFormData>({
    name: '',
    description: '',
    teamId: '',
    dueDate: '',
  });

  const { data: projectsData, loading, refetch } = useQuery(GET_PROJECTS);
  const { data: teamsData } = useQuery(GET_TEAMS);
  const [createProjectMutation] = useMutation(CREATE_PROJECT);
  const [updateProjectMutation] = useMutation(UPDATE_PROJECT);
  const [deleteProjectMutation] = useMutation(DELETE_PROJECT);

  const projects = projectsData?.projects || [];
  const teams = teamsData?.teams || [];

  // Role-based permissions
  const isAdmin = user?.role === 'ADMIN';
  const isLead = user?.role === 'LEAD';
  const canManageProjects = isAdmin || isLead;

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createProjectMutation({
        variables: {
          input: projectForm,
        },
      });
      
      addNotification('Project created successfully!', 'success');
      setShowCreateProject(false);
      setProjectForm({ name: '', description: '', teamId: '', dueDate: '' });
      refetch();
    } catch (error) {
      addNotification('Failed to create project', 'error');
    }
  };

  const handleEditProject = (project: any) => {
    setEditingProject(project);
    setProjectForm({
      name: project.name,
      description: project.description || '',
      teamId: project.teamId,
      dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
    });
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateProjectMutation({
        variables: {
          id: editingProject.id,
          input: projectForm,
        },
      });
      
      addNotification('Project updated successfully!', 'success');
      setEditingProject(null);
      setProjectForm({ name: '', description: '', teamId: '', dueDate: '' });
      refetch();
    } catch (error) {
      addNotification('Failed to update project', 'error');
    }
  };

  const handleDeleteProject = async () => {
    try {
      await deleteProjectMutation({
        variables: { id: deletingProject.id },
      });
      
      addNotification('Project deleted successfully!', 'success');
      setDeletingProject(null);
      refetch();
    } catch (error) {
      addNotification('Failed to delete project', 'error');
    }
  };

  const handleManageTasks = (project: any) => {
    setManagingProject(project);
    // Navigate to tasks page with project filter
    window.location.href = `/tasks?projectId=${project.id}`;
  };

  const canManageProject = (project: any) => {
    if (isAdmin) return true;
    if (isLead) {
      // Check if user is lead of the project's team
      return project.team?.members?.some((member: any) => 
        member.userId === user?.id && member.user.role === 'LEAD'
      );
    }
    return false;
  };

  const getProjectStats = (project: any) => {
    const tasks = project.tasks || [];
    const total = tasks.length;
    const completed = tasks.filter((task: any) => task.status === 'DONE').length;
    const inProgress = tasks.filter((task: any) => task.status === 'IN_PROGRESS').length;
    const overdue = tasks.filter((task: any) => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate) < new Date() && task.status !== 'DONE';
    }).length;
    const highPriority = tasks.filter((task: any) => task.priority === 'HIGH' && task.status !== 'DONE').length;

    return { total, completed, inProgress, overdue, highPriority };
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-gray-600">
            {canManageProjects ? 'Manage your projects and tasks' : 'View your assigned projects'}
          </p>
        </div>
        
        {canManageProjects && (
          <button
            onClick={() => setShowCreateProject(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Project
          </button>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project: any) => {
          const stats = getProjectStats(project);
          const canEdit = canManageProject(project);
          
          return (
            <div key={project.id} className="card">
              <div className="card-header">
                <div className="flex items-center justify-between">
                  <h3 className="card-title truncate">{project.name}</h3>
                  {canEdit && (
                    <div className="flex space-x-1">
                      <button className="p-1 text-gray-400 hover:text-gray-600">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button className="p-1 text-gray-400 hover:text-red-600">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
                <p className="card-description">{project.team?.name || 'No team'}</p>
              </div>
              
              <div className="card-content">
                {/* Project Stats */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-lg font-semibold text-gray-900">{stats.total}</p>
                    <p className="text-xs text-gray-500">Total Tasks</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-semibold text-green-600">{stats.completed}</p>
                    <p className="text-xs text-gray-500">Completed</p>
                  </div>
                </div>

                {/* Priority Indicators */}
                <div className="space-y-2">
                  {stats.highPriority > 0 && (
                    <div className="flex items-center text-sm text-red-600">
                      <ExclamationTriangleIcon className="h-4 w-4 mr-1" />
                      {stats.highPriority} high priority
                    </div>
                  )}
                  
                  {stats.overdue > 0 && (
                    <div className="flex items-center text-sm text-orange-600">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {stats.overdue} overdue
                    </div>
                  )}
                  
                  {project.dueDate && (
                    <div className="flex items-center text-sm text-gray-500">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      Due: {formatDate(project.dueDate)}
                    </div>
                  )}
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 space-y-2">
                  {canEdit && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditProject(project)}
                        className="flex-1 btn btn-secondary btn-sm"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => setDeletingProject(project)}
                        className="flex-1 btn btn-danger btn-sm"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        Delete
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => handleManageTasks(project)}
                    className="w-full btn btn-primary btn-sm"
                  >
                    {canEdit ? 'Manage Tasks' : 'View Details'}
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        {projects.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FolderIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects</h3>
            <p className="mt-1 text-sm text-gray-500">
              {canManageProjects ? 'Get started by creating a new project.' : 'No projects assigned to you yet.'}
            </p>
            {canManageProjects && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateProject(true)}
                  className="btn btn-primary"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Project
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowCreateProject(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateProject}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Project</h3>
                    <p className="mt-1 text-sm text-gray-500">Create a new project to organize your tasks.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
                        Project Name
                      </label>
                      <input
                        id="projectName"
                        type="text"
                        className="mt-1 input"
                        value={projectForm.name}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="projectDescription"
                        rows={3}
                        className="mt-1 input"
                        value={projectForm.description}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label htmlFor="projectTeam" className="block text-sm font-medium text-gray-700">
                        Team
                      </label>
                      <select
                        id="projectTeam"
                        className="mt-1 input"
                        value={projectForm.teamId}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, teamId: e.target.value }))}
                        required
                      >
                        <option value="">Select a team</option>
                        {teams.map((team: any) => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="projectDueDate" className="block text-sm font-medium text-gray-700">
                        Due Date (optional)
                      </label>
                      <input
                        id="projectDueDate"
                        type="date"
                        className="mt-1 input"
                        value={projectForm.dueDate}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create Project
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowCreateProject(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setEditingProject(null)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleUpdateProject}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Edit Project</h3>
                    <p className="mt-1 text-sm text-gray-500">Update the project details.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="editProjectName" className="block text-sm font-medium text-gray-700">
                        Project Name
                      </label>
                      <input
                        id="editProjectName"
                        type="text"
                        className="mt-1 input"
                        value={projectForm.name}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="editProjectDescription" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="editProjectDescription"
                        rows={3}
                        className="mt-1 input"
                        value={projectForm.description}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    <div>
                      <label htmlFor="editProjectDueDate" className="block text-sm font-medium text-gray-700">
                        Due Date (optional)
                      </label>
                      <input
                        id="editProjectDueDate"
                        type="date"
                        className="mt-1 input"
                        value={projectForm.dueDate}
                        onChange={(e) => setProjectForm(prev => ({ ...prev, dueDate: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Update Project
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setEditingProject(null)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingProject && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setDeletingProject(null)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <TrashIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Project
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete "{deletingProject.name}"? This action cannot be undone and will also delete all tasks associated with this project.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteProject}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setDeletingProject(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
