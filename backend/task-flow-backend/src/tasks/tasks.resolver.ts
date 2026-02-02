import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Task, CreateTaskInput } from './tasks.model';
import { PrismaService } from '../common/prisma.service';

@Resolver(() => Task)
export class TaskResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [Task])
  async tasks(@Args('projectId') projectId: string): Promise<Task[]> {
    const tasks = await this.prisma.task.findMany({ where: { projectId } });
    
    // Convert database Task to GraphQL Task type
    return tasks.map(task => ({
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      status: task.status as any, // Cast to our enum type
      priority: task.priority as any, // Cast to our enum type
      dueDate: task.dueDate?.toISOString(),
      assigneeId: task.assigneeId || undefined,
      projectId: task.projectId
    }));
  }

  @Mutation(() => Task)
  async createTask(@Args('input') input: CreateTaskInput): Promise<Task> {
    const task = await this.prisma.task.create({
      data: {
        title: input.title,
        description: input.description || null,
        status: input.status || 'TODO',
        priority: input.priority,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        assigneeId: input.assigneeId || null,
        projectId: input.projectId
      }
    });
    
    // Convert database Task to GraphQL Task type
    return {
      id: task.id,
      title: task.title,
      description: task.description || undefined,
      status: task.status as any, // Cast to our enum type
      priority: task.priority as any, // Cast to our enum type
      dueDate: task.dueDate?.toISOString(),
      assigneeId: task.assigneeId || undefined,
      projectId: task.projectId
    };
  }
}
