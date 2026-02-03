import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../entities/team.entity';
import { TeamMember } from '../entities/team-member.entity';
import { User } from '../entities/user.entity';
import { Project } from '../entities/project.entity';
import { Team as TeamModel, CreateTeamInput } from './teams.model';
import { User as UserModel } from '../auth/auth.model';

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
      description: team.description,
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

  @Query(() => [UserModel])
  async users(): Promise<UserModel[]> {
    const users = await this.userRepository.find();
    
    return users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any
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
      description: team.description,
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
      name: input.name,
      description: input.description
    });

    const savedTeam = await this.teamRepository.save(team);

    return {
      id: savedTeam.id,
      name: savedTeam.name,
      description: savedTeam.description,
      members: [],
      projects: []
    };
  }

  @Mutation(() => UserModel)
  async addToTeam(@Args('userId') userId: string, @Args('teamId') teamId: string): Promise<UserModel> {
    // Verify user exists
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify team exists
    const team = await this.teamRepository.findOne({
      where: { id: teamId }
    });

    if (!team) {
      throw new Error('Team not found');
    }

    // Check if user is already in team
    const existingMember = await this.teamMemberRepository.findOne({
      where: { userId, teamId }
    });

    if (existingMember) {
      throw new Error('User is already a member of this team');
    }

    // Add user to team
    const teamMember = this.teamMemberRepository.create({
      userId,
      teamId
    });

    await this.teamMemberRepository.save(teamMember);

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any
    };
  }
}
