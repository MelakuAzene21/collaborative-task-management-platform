import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { User } from '../auth/auth.model';
import { PrismaService } from '../common/prisma.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [User])
  async users(): Promise<User[]> {
    const users = await this.prisma.user.findMany({
      include: {
        teams: {
          include: {
            team: true
          }
        },
        tasks: true,
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

  @Query(() => User)
  async user(@Args('id') id: string): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        teams: {
          include: {
            team: true
          }
        },
        tasks: true,
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

  @Mutation(() => User)
  async addToTeam(@Args('userId') userId: string, @Args('teamId') teamId: string): Promise<User> {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Verify team exists
    const team = await this.prisma.team.findUnique({
      where: { id: teamId }
    });

    if (!team) {
      throw new Error('Team not found');
    }

    // Check if user is already in team
    const existingMember = await this.prisma.teamMember.findFirst({
      where: { userId, teamId }
    });

    if (existingMember) {
      throw new Error('User is already a member of this team');
    }

    await this.prisma.teamMember.create({
      data: {
        userId,
        teamId
      }
    });

    // Return updated user
    const updatedUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        teams: {
          include: {
            team: true
          }
        },
        tasks: true,
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
