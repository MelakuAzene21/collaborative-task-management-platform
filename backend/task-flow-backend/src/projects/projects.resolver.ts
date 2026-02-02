import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Project, CreateProjectInput } from './projects.model';
import { PrismaService } from '../common/prisma.service';

@Resolver(() => Project)
export class ProjectResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [Project])
  async projects(): Promise<Project[]> {
    const projects = await this.prisma.project.findMany({
      include: {
        team: true,
        tasks: true
      }
    });
    
    return projects.map(project => ({
      id: project.id,
      name: project.name,
      teamId: project.teamId,
      team: project.team,
      tasks: project.tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || undefined,
        status: task.status as any,
        priority: task.priority as any,
        dueDate: task.dueDate?.toISOString(),
        assigneeId: task.assigneeId || undefined,
        projectId: task.projectId
      }))
    }));
  }

  @Query(() => Project)
  async project(@Args('id') id: string): Promise<Project> {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        team: true,
        tasks: true
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return {
      id: project.id,
      name: project.name,
      teamId: project.teamId,
      team: project.team,
      tasks: project.tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || undefined,
        status: task.status as any,
        priority: task.priority as any,
        dueDate: task.dueDate?.toISOString(),
        assigneeId: task.assigneeId || undefined,
        projectId: task.projectId
      }))
    };
  }

  @Mutation(() => Project)
  async createProject(@Args('input') input: CreateProjectInput): Promise<Project> {
    // Verify team exists
    const team = await this.prisma.team.findUnique({
      where: { id: input.teamId }
    });

    if (!team) {
      throw new Error('Team not found');
    }

    const project = await this.prisma.project.create({
      data: {
        name: input.name,
        teamId: input.teamId
      },
      include: {
        team: true,
        tasks: true
      }
    });

    return {
      id: project.id,
      name: project.name,
      teamId: project.teamId,
      team: project.team,
      tasks: []
    };
  }
}
