import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task, TaskStatus, Priority } from '../entities/task.entity';
import { Project } from '../entities/project.entity';
import { User } from '../entities/user.entity';
import { Task as TaskModel, CreateTaskInput } from './tasks.model';

@Resolver(() => TaskModel)
export class TaskResolver {
  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Query(() => [TaskModel])
  async tasks(@Args('projectId') projectId: string): Promise<TaskModel[]> {
    const tasks = await this.taskRepository.find({
      where: { projectId },
      relations: ['assignee', 'project']
    });
    
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      status: task.status as any,
      priority: task.priority as any,
      dueDate: task.dueDate?.toISOString() || undefined,
      assigneeId: task.assigneeId || undefined,
      projectId: task.projectId
    }));
  }

  @Mutation(() => TaskModel)
  async createTask(@Args('input') input: CreateTaskInput): Promise<TaskModel> {
    // Verify project exists
    const project = await this.projectRepository.findOne({
      where: { id: input.projectId }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // If assigneeId is provided, verify user exists
    if (input.assigneeId) {
      const user = await this.userRepository.findOne({
        where: { id: input.assigneeId }
      });

      if (!user) {
        throw new Error('Assignee not found');
      }
    }

    const task = new Task();
    task.title = input.title;
    if (input.description) {
      task.description = input.description;
    }
    task.status = input.status || TaskStatus.TODO;
    task.priority = input.priority || Priority.MEDIUM;
    if (input.dueDate) {
      task.dueDate = new Date(input.dueDate);
    }
    if (input.assigneeId) {
      task.assigneeId = input.assigneeId;
    }
    task.projectId = input.projectId;

    const savedTask = await this.taskRepository.save(task);

    return {
      id: savedTask.id,
      title: savedTask.title,
      description: savedTask.description || undefined,
      status: savedTask.status as any,
      priority: savedTask.priority as any,
      dueDate: savedTask.dueDate?.toISOString() || undefined,
      assigneeId: savedTask.assigneeId || undefined,
      projectId: savedTask.projectId
    };
  }
}
