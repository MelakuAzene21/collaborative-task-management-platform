import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { TeamMember } from '../entities/team-member.entity';
import { Team } from '../entities/team.entity';
import { User as UserModel } from '../auth/auth.model';

@Resolver(() => UserModel)
export class UserResolver {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TeamMember)
    private teamMemberRepository: Repository<TeamMember>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
  ) {}

  @Query(() => [UserModel])
  async users(): Promise<UserModel[]> {
    const users = await this.userRepository.find({
      relations: {
        teamMembers: {
          team: true
        },
        assignedTasks: true,
        comments: true
      }
    });
    
    return users.map(user => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any
    }));
  }

  @Query(() => UserModel)
  async user(@Args('id') id: string): Promise<UserModel> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: {
        teamMembers: {
          team: true
        },
        assignedTasks: true,
        comments: true
      }
    });

    if (!user) {
      throw new Error('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any
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

    const teamMember = this.teamMemberRepository.create({
      userId,
      teamId
    });

    await this.teamMemberRepository.save(teamMember);

    // Return updated user
    const updatedUser = await this.userRepository.findOne({
      where: { id: userId },
      relations: {
        teamMembers: {
          team: true
        },
        assignedTasks: true,
        comments: true
      }
    });

    if (!updatedUser) {
      throw new Error('Failed to retrieve updated user');
    }

    return {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role as any
    };
  }
}
