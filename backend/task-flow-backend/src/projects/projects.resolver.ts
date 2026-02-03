import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../entities/project.entity';
import { Team } from '../entities/team.entity';
import { Task } from '../entities/task.entity';
import { Project as ProjectModel, CreateProjectInput, UpdateProjectInput } from './projects.model';

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
      description: project.description,
      dueDate: project.dueDate ? new Date(project.dueDate).toISOString() : undefined,
      teamId: project.teamId,
      team: project.team,
      tasks: project.tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || undefined,
        status: task.status as any,
        priority: task.priority as any,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
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
      description: project.description,
      dueDate: project.dueDate ? new Date(project.dueDate).toISOString() : undefined,
      teamId: project.teamId,
      team: project.team,
      tasks: project.tasks.map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || undefined,
        status: task.status as any,
        priority: task.priority as any,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString() : undefined,
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
      description: input.description,
      teamId: input.teamId,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined
    });

    const savedProject = await this.projectRepository.save(project);

    return {
      id: savedProject.id,
      name: savedProject.name,
      description: savedProject.description,
      dueDate: savedProject.dueDate ? savedProject.dueDate.toISOString() : undefined,
      teamId: savedProject.teamId,
      team: {
        id: team.id,
        name: team.name
      },
      tasks: []
    };
  }

  @Mutation(() => ProjectModel)
  async updateProject(@Args('id') id: string, @Args('input') input: UpdateProjectInput): Promise<ProjectModel> {
    const project = await this.projectRepository.findOne({
      where: { id },
      relations: ['team']
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Update fields
    if (input.name) project.name = input.name;
    if (input.description !== undefined) project.description = input.description;
    if (input.dueDate) project.dueDate = new Date(input.dueDate);

    const savedProject = await this.projectRepository.save(project);

    return {
      id: savedProject.id,
      name: savedProject.name,
      description: savedProject.description,
      dueDate: savedProject.dueDate ? savedProject.dueDate.toISOString() : undefined,
      teamId: savedProject.teamId,
      team: savedProject.team ? {
        id: savedProject.team.id,
        name: savedProject.team.name
      } : undefined,
      tasks: []
    };
  }

  @Mutation(() => ProjectModel)
  async deleteProject(@Args('id') id: string): Promise<ProjectModel> {
    const project = await this.projectRepository.findOne({
      where: { id }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Delete associated tasks first
    await this.taskRepository.delete({ projectId: id });

    // Delete the project
    await this.projectRepository.remove(project);

    return {
      id: project.id,
      name: project.name,
      description: project.description,
      dueDate: project.dueDate ? project.dueDate.toISOString() : undefined,
      teamId: project.teamId,
      tasks: []
    };
  }
}
