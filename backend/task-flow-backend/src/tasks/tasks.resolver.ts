import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Task, CreateTaskInput } from './tasks.model';
import { PrismaService } from '../common/prisma.service';

@Resolver(() => Task)
export class TaskResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [Task])
  tasks(@Args('projectId') projectId: string) {
    return this.prisma.task.findMany({ where: { projectId } });
  }

  @Mutation(() => Task)
  createTask(@Args('input') input: CreateTaskInput) {
    return this.prisma.task.create({ data: input });
  }
}
