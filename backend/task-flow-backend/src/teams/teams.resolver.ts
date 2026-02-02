import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../entities/team.entity';
import { TeamMember } from '../entities/team-member.entity';
import { User } from '../entities/user.entity';
import { Project } from '../entities/project.entity';
import { Team as TeamModel, CreateTeamInput } from './teams.model';

@Resolver(() => TeamModel)
export class TeamResolver {
  constructor(
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(TeamMember)
    private teamMemberRepository: Repository<TeamMember>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Query(() => [TeamModel])
  async teams(): Promise<TeamModel[]> {
    const teams = await this.teamRepository.find({
      relations: {
        members: {
          user: true
        },
        projects: true
      }
    });
    
    return teams.map(team => ({
      id: team.id,
      name: team.name,
      members: team.members.map(member => ({
        id: member.id,
        userId: member.userId,
        teamId: member.teamId,
        user: {
          ...member.user,
          role: member.user.role as any // Cast enum
        }
      })),
      projects: team.projects.map(project => ({
        id: project.id,
        name: project.name,
        teamId: project.teamId
      }))
    }));
  }

  @Query(() => TeamModel)
  async team(@Args('id') id: string): Promise<TeamModel> {
    const team = await this.teamRepository.findOne({
      where: { id },
      relations: {
        members: {
          user: true
        },
        projects: true
      }
    });

    if (!team) {
      throw new Error('Team not found');
    }

    return {
      id: team.id,
      name: team.name,
      members: team.members.map(member => ({
        id: member.id,
        userId: member.userId,
        teamId: member.teamId,
        user: {
          ...member.user,
          role: member.user.role as any // Cast enum
        }
      })),
      projects: team.projects.map(project => ({
        id: project.id,
        name: project.name,
        teamId: project.teamId
      }))
    };
  }

  @Mutation(() => TeamModel)
  async createTeam(@Args('input') input: CreateTeamInput): Promise<TeamModel> {
    const team = this.teamRepository.create({
      name: input.name
    });

    const savedTeam = await this.teamRepository.save(team);

    return {
      id: team.id,
      name: team.name,
      members: [],
      projects: []
    };
  }
}
