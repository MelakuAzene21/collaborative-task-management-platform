import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { Team } from '../entities/team.entity';
import { Task } from '../entities/task.entity';
import { Project as ProjectModel, CreateProjectInput } from './projects.model';

@Resolver(() => ProjectModel)
export class ProjectResolver {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(Team)
    private teamRepository: Repository<Team>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
  ) {}

  @Query(() => [ProjectModel])
  async projects(): Promise<ProjectModel[]> {
    const projects = await this.projectRepository.find({
      relations: {
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

  @Query(() => ProjectModel)
  async project(@Args('id') id: string): Promise<ProjectModel> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: {
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

  @Mutation(() => ProjectModel)
  async createProject(@Args('input') input: CreateProjectInput): Promise<ProjectModel> {
    // Verify team exists
    const team = await this.teamRepository.findOne({
      where: { id: input.teamId }
    });

    if (!team) {
      throw new Error('Team not found');
    }

    const project = this.projectRepository.create({
      name: input.name,
      teamId: input.teamId
    });

    const savedProject = await this.projectRepository.save(project);

    return {
      id: savedProject.id,
      name: savedProject.name,
      teamId: savedProject.teamId,
      team: {
        id: team.id,
        name: team.name
      },
      tasks: []
    };
  }
}
