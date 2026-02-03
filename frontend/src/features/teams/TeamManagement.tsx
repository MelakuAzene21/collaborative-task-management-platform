import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client/react';
import { GET_TEAMS, CREATE_TEAM, ADD_TO_TEAM, GET_USERS } from '../../api/queries';
import { useAuth, useNotifications } from '../../hooks';
import { 
  UsersIcon,
  PlusIcon,
  UserPlusIcon,
  ShieldCheckIcon,
  UserIcon,
  StarIcon
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

const TeamManagement: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [showCreateTeam, setShowCreateTeam] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  
  const [teamForm, setTeamForm] = useState<TeamFormData>({
    name: '',
    description: '',
  });
  
  const [addMemberForm, setAddMemberForm] = useState<AddMemberFormData>({
    userId: '',
    teamId: '',
    role: 'MEMBER',
  });

  const { data: teamsData, loading, refetch } = useQuery(GET_TEAMS);
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

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'LEAD':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600">Manage your teams and team members</p>
        </div>
        
        {(isAdmin || isLead) && (
          <button
            onClick={() => setShowCreateTeam(true)}
            className="btn btn-primary"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Create Team
          </button>
        )}
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map((team: any) => (
          <div key={team.id} className="card">
            <div className="card-header">
              <div className="flex items-center justify-between">
                <h3 className="card-title">{team.name}</h3>
                <div className="flex items-center space-x-2">
                  {getRoleIcon(user?.role || 'MEMBER')}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user?.role || 'MEMBER')}`}>
                    {user?.role}
                  </span>
                </div>
              </div>
              <p className="card-description">{team.members?.length || 0} members</p>
            </div>
            
            <div className="card-content">
              <div className="space-y-3">
                {/* Team Members */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-900">Team Members</p>
                  <div className="space-y-2">
                    {team.members?.slice(0, 3).map((member: any) => (
                      <div key={member.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="h-6 w-6 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-medium">
                            {member.user.name.charAt(0).toUpperCase()}
                          </div>
                          <span className="text-sm text-gray-900">{member.user.name}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getRoleIcon(member.user.role)}
                          <span className="text-xs text-gray-500">{member.user.role}</span>
                        </div>
                      </div>
                    ))}
                    {(team.members?.length || 0) > 3 && (
                      <p className="text-xs text-gray-500">
                        +{(team.members?.length || 0) - 3} more members
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                {(isAdmin || isLead) && (
                  <div className="flex space-x-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setSelectedTeam(team.id);
                        setShowAddMemberModal(true);
                        setAddMemberForm(prev => ({ ...prev, teamId: team.id }));
                      }}
                      className="flex-1 btn btn-secondary btn-sm"
                    >
                      <UserPlusIcon className="h-4 w-4 mr-1" />
                      Add Members
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {teams.length === 0 && (
          <div className="col-span-full text-center py-12">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No teams</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new team.</p>
            {(isAdmin || isLead) && (
              <div className="mt-6">
                <button
                  onClick={() => setShowCreateTeam(true)}
                  className="btn btn-primary"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Team
                </button>
              </div>
            )}
          </div>
        )}
      </div>

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
                    <p className="mt-1 text-sm text-gray-500">Create a new team to collaborate with others.</p>
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
                        Description (optional)
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

export default TeamManagement;
