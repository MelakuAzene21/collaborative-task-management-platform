import React from 'react';
import { useQuery } from '@apollo/client/react';
import { GET_TEAMS } from '../../api/queries';
import { Loading, ErrorDisplay, EmptyState } from '../../common/Loading';
import { PlusIcon, UsersIcon } from '@heroicons/react/24/outline';

const Teams: React.FC = () => {
  const { data, loading, error, refetch } = useQuery(GET_TEAMS);

  if (loading) return <Loading message="Loading teams..." />;
  if (error) return <ErrorDisplay message={error.message} onRetry={() => refetch()} />;

  const teams = data?.teams || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teams</h1>
          <p className="text-gray-600">Manage your teams and team members</p>
        </div>
        <button className="btn btn-primary">
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Team
        </button>
      </div>

      {/* Teams List */}
      {teams.length === 0 ? (
        <EmptyState
          title="No teams yet"
          description="Create your first team to start collaborating with your team members."
          icon={<UsersIcon className="h-12 w-12 text-gray-400" />}
          action={{
            label: 'Create Team',
            onClick: () => console.log('Create team'),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {teams.map((team: any) => (
            <div key={team.id} className="card">
              <div className="card-header">
                <h3 className="card-title">{team.name}</h3>
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
                <button className="btn btn-outline w-full">
                  View Team Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Teams;
