import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Team, CreateTeamInput } from './teams.model';
import { PrismaService } from '../common/prisma.service';

@Resolver(() => Team)
export class TeamResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [Team])
  async teams(): Promise<Team[]> {
    const teams = await this.prisma.team.findMany({
      include: {
        members: {
          include: {
            user: true
          }
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
      projects: team.projects
    }));
  }

  @Query(() => Team)
  async team(@Args('id') id: string): Promise<Team> {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true
          }
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
      projects: team.projects
    };
  }

  @Mutation(() => Team)
  async createTeam(@Args('input') input: CreateTeamInput): Promise<Team> {
    const team = await this.prisma.team.create({
      data: {
        name: input.name
      },
      include: {
        members: true,
        projects: true
      }
    });

    return {
      id: team.id,
      name: team.name,
      members: [],
      projects: []
    };
  }
}
