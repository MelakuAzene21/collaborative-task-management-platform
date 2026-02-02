import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { Comment, CreateCommentInput } from './comments.model';
import { PrismaService } from '../common/prisma.service';

@Resolver(() => Comment)
export class CommentResolver {
  constructor(private prisma: PrismaService) {}

  @Query(() => [Comment])
  async comments(@Args('taskId') taskId: string): Promise<Comment[]> {
    const comments = await this.prisma.comment.findMany({
      where: { taskId },
      include: {
        author: true,
        task: true
      }
    });
    
    return comments.map(comment => ({
      id: comment.id,
      content: comment.content,
      taskId: comment.taskId,
      authorId: comment.authorId,
      author: {
        ...comment.author,
        role: comment.author.role as any // Cast enum
      },
      task: {
        ...comment.task,
        description: comment.task.description || undefined, // Handle null
        status: comment.task.status as any, // Cast enum
        priority: comment.task.priority as any, // Cast enum
        dueDate: comment.task.dueDate?.toISOString() || undefined, // Handle Date to string
        assigneeId: comment.task.assigneeId || undefined // Handle null to undefined
      },
      createdAt: new Date().toISOString() // Use current date since createdAt doesn't exist in schema
    }));
  }

  @Mutation(() => Comment)
  async createComment(@Args('input') input: CreateCommentInput): Promise<Comment> {
    // Verify task exists
    const task = await this.prisma.task.findUnique({
      where: { id: input.taskId }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // Verify author exists
    const author = await this.prisma.user.findUnique({
      where: { id: input.authorId }
    });

    if (!author) {
      throw new Error('Author not found');
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: input.content,
        taskId: input.taskId,
        authorId: input.authorId
      },
      include: {
        author: true,
        task: true
      }
    });

    return {
      id: comment.id,
      content: comment.content,
      taskId: comment.taskId,
      authorId: comment.authorId,
      author: {
        ...comment.author,
        role: comment.author.role as any // Cast enum
      },
      task: {
        ...comment.task,
        description: comment.task.description || undefined, // Handle null
        status: comment.task.status as any, // Cast enum
        priority: comment.task.priority as any, // Cast enum
        dueDate: comment.task.dueDate?.toISOString() || undefined, // Handle Date to string
        assigneeId: comment.task.assigneeId || undefined // Handle null to undefined
      },
      createdAt: new Date().toISOString() // Use current date since createdAt doesn't exist in schema
    };
  }
}
