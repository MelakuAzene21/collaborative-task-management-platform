import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_TEAMS, CREATE_TEAM, ADD_TO_TEAM, GET_USERS } from '../../api/queries';
import { useAuth, useNotifications } from '../../hooks';
import { Loading, ErrorDisplay, EmptyState } from '../../common/Loading';
import { 
  UsersIcon,
  PlusIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  UserIcon,
  StarIcon,
  FolderIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface TeamFormData {
  name: string;
  description: string;
}

interface AddMemberFormData {
  userId: string;
  teamId: string;
  role: 'LEAD' | 'MEMBER';
}

const Teams: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [viewingTeamDetails, setViewingTeamDetails] = useState<any>(null);
  
  const [teamForm, setTeamForm] = useState<TeamFormData>({
    name: '',
    description: '',
  });
  
  const [addMemberForm, setAddMemberForm] = useState<AddMemberFormData>({
    userId: '',
    teamId: '',
    role: 'MEMBER',
  });

  const { data: teamsData, loading, error, refetch } = useQuery(GET_TEAMS);
  const { data: usersData } = useQuery(GET_USERS);
  const [createTeamMutation] = useMutation(CREATE_TEAM);
  const [addToTeamMutation] = useMutation(ADD_TO_TEAM);

  const teams = teamsData?.teams || [];
  const users = usersData?.users || [];

  const isAdmin = user?.role === 'ADMIN';
  const isLead = user?.role === 'LEAD' || teams.some((team: any) => 
    team.members.some((member: any) => 
      member.userId === user?.id && member.user.role === 'LEAD'
    )
  );

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await createTeamMutation({
        variables: {
          input: teamForm,
        },
      });
      
      addNotification('Team created successfully!', 'success');
      setShowCreateTeam(false);
      setTeamForm({ name: '', description: '' });
      refetch();
    } catch (error) {
      addNotification('Failed to create team', 'error');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await addToTeamMutation({
        variables: {
          userId: addMemberForm.userId,
          teamId: addMemberForm.teamId,
        },
      });
      
      addNotification('Member added successfully!', 'success');
      setShowAddMemberModal(false);
      setAddMemberForm({ userId: '', teamId: '', role: 'MEMBER' });
      refetch();
    } catch (error) {
      addNotification('Failed to add member', 'error');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return <StarIcon className="h-4 w-4 text-purple-600" />;
      case 'LEAD':
        return <ShieldCheckIcon className="h-4 w-4 text-blue-600" />;
      default:
        return <UserIcon className="h-4 w-4 text-gray-600" />;
    }
  };

  const canManageTeam = (team: any) => {
    if (isAdmin) return true;
    if (isLead) {
      return team.members.some((member: any) => 
        member.userId === user?.id && member.user.role === 'LEAD'
      );
    }
    return false;
  };

  if (loading) return <Loading message="Loading teams..." />;
  if (error) return <ErrorDisplay message={error.message} onRetry={() => refetch()} />;

  // Team Details View
  if (viewingTeamDetails) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewingTeamDetails(null)}
              className="btn btn-outline"
            >
              <XMarkIcon className="h-4 w-4 mr-2" />
              Back to Teams
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{viewingTeamDetails.name}</h1>
              <p className="text-gray-600">Team details and management</p>
            </div>
          </div>
          
          {canManageTeam(viewingTeamDetails) && (
            <button
              onClick={() => {
                setSelectedTeam(viewingTeamDetails.id);
                setShowAddMemberModal(true);
                setAddMemberForm(prev => ({ ...prev, teamId: viewingTeamDetails.id }));
              }}
              className="btn btn-secondary"
            >
              <UserPlusIcon className="h-4 w-4 mr-2" />
              Add Members
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Team Members */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Team Members</h3>
              <p className="card-description">{viewingTeamDetails.members.length} members</p>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                {viewingTeamDetails.members.map((member: any) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{member.user.name}</p>
                        <p className="text-sm text-gray-500">{member.user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getRoleIcon(member.user.role)}
                      <span className="text-sm font-medium text-gray-900">{member.user.role}</span>
                    </div>
                  </div>
                ))}
                
                {viewingTeamDetails.members.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <UsersIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No members in this team yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Team Projects */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Team Projects</h3>
              <p className="card-description">{viewingTeamDetails.projects.length} projects</p>
            </div>
            <div className="card-content">
              <div className="space-y-3">
                {viewingTeamDetails.projects.map((project: any) => (
                  <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <FolderIcon className="h-8 w-8 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">{project.name}</p>
                        <p className="text-sm text-gray-500">{project.description || 'No description'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{project.tasks?.length || 0} tasks</p>
                      {project.dueDate && (
                        <p className="text-xs text-gray-400">Due: {new Date(project.dueDate).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                ))}
                
                {viewingTeamDetails.projects.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <FolderIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No projects in this team yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Main Teams View
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600">Manage your teams and team members</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowCreateTeam(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Create Team
          </button>
        )}
      </div>

      {/* Teams List */}
      {teams.length === 0 ? (
        <EmptyState
          title="No teams yet"
          description="Create your first team to start collaborating with your team members."
          icon={<UsersIcon className="h-12 w-12 text-gray-400" />}
          action={
            isAdmin ? {
              label: 'Create Team',
              onClick: () => setShowCreateTeam(true),
            } : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team: any) => {
            const canManage = canManageTeam(team);
            
            return (
              <div key={team.id} className="card">
                <div className="card-header">
                  <div className="flex items-center justify-between">
                    <h3 className="card-title truncate">{team.name}</h3>
                    {canManage && (
                      <button
                        onClick={() => {
                          setSelectedTeam(team.id);
                          setShowAddMemberModal(true);
                          setAddMemberForm(prev => ({ ...prev, teamId: team.id }));
                        }}
                        className="p-1 text-gray-400 hover:text-gray-600"
                        title="Add Members"
                      >
                        <UserPlusIcon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <p className="card-description">
                    {team.members.length} members • {team.projects.length} projects
                  </p>
                </div>
                
                <div className="card-content">
                  <div className="space-y-4">
                    {/* Members */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Members</h4>
                      <div className="flex -space-x-2">
                        {team.members.slice(0, 4).map((member: any, index: number) => (
                          <div
                            key={member.id}
                            className="h-8 w-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-medium border-2 border-white"
                            title={member.user.name}
                          >
                            {member.user.name.charAt(0).toUpperCase()}
                          </div>
                        ))}
                        {team.members.length > 4 && (
                          <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-medium border-2 border-white">
                            +{team.members.length - 4}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Recent Projects */}
                    {team.projects.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Projects</h4>
                        <div className="space-y-1">
                          {team.projects.slice(0, 3).map((project: any) => (
                            <div key={project.id} className="text-sm text-gray-600">
                              • {project.name}
                            </div>
                          ))}
                          {team.projects.length > 3 && (
                            <div className="text-sm text-gray-400">
                              +{team.projects.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="card-footer">
                  <button 
                    onClick={() => setViewingTeamDetails(team)}
                    className="btn btn-outline w-full"
                  >
                    View Team Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Team Modal */}
      {showCreateTeam && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowCreateTeam(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleCreateTeam}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Create New Team</h3>
                    <p className="mt-1 text-sm text-gray-500">Create a new team to organize your members and projects.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                        Team Name
                      </label>
                      <input
                        id="teamName"
                        type="text"
                        className="mt-1 input"
                        value={teamForm.name}
                        onChange={(e) => setTeamForm(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="teamDescription" className="block text-sm font-medium text-gray-700">
                        Description
                      </label>
                      <textarea
                        id="teamDescription"
                        rows={3}
                        className="mt-1 input"
                        value={teamForm.description}
                        onChange={(e) => setTeamForm(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Create Team
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowCreateTeam(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add Member Modal */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setShowAddMemberModal(false)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleAddMember}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Add Team Member</h3>
                    <p className="mt-1 text-sm text-gray-500">Add an existing user to this team.</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="userSelect" className="block text-sm font-medium text-gray-700">
                        Select User
                      </label>
                      <select
                        id="userSelect"
                        className="mt-1 input"
                        value={addMemberForm.userId}
                        onChange={(e) => setAddMemberForm(prev => ({ ...prev, userId: e.target.value }))}
                        required
                      >
                        <option value="">Choose a user to add</option>
                        {users
                          .filter((user: any) => {
                            // Filter out users who are already in this team
                            const team = teams.find((t: any) => t.id === addMemberForm.teamId);
                            return !team?.members?.some((member: any) => member.userId === user.id);
                          })
                          .map((user: any) => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.email}) - {user.role}
                            </option>
                          ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="teamSelect" className="block text-sm font-medium text-gray-700">
                        Team
                      </label>
                      <select
                        id="teamSelect"
                        className="mt-1 input"
                        value={addMemberForm.teamId}
                        onChange={(e) => setAddMemberForm(prev => ({ ...prev, teamId: e.target.value }))}
                        required
                      >
                        <option value="">Select a team</option>
                        {teams.map((team: any) => (
                          <option key={team.id} value={team.id}>{team.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label htmlFor="roleSelect" className="block text-sm font-medium text-gray-700">
                        Role
                      </label>
                      <select
                        id="roleSelect"
                        className="mt-1 input"
                        value={addMemberForm.role}
                        onChange={(e) => setAddMemberForm(prev => ({ ...prev, role: e.target.role as 'LEAD' | 'MEMBER' }))}
                      >
                        <option value="MEMBER">Member</option>
                        {isAdmin && <option value="LEAD">Team Lead</option>}
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Add Member
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowAddMemberModal(false)}
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

export default Teams;
