import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from '../entities/comment.entity';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { Comment as CommentModel, CreateCommentInput } from './comments.model';

@Resolver(() => CommentModel)
export class CommentResolver {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @InjectRepository(Task)
    private taskRepository: Repository<Task>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  @Query(() => [CommentModel])
  async comments(@Args('taskId') taskId: string): Promise<CommentModel[]> {
    const comments = await this.commentRepository.find({
      where: { taskId },
      relations: {
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

  @Mutation(() => CommentModel)
  async createComment(@Args('input') input: CreateCommentInput): Promise<CommentModel> {
    // Verify task exists
    const task = await this.taskRepository.findOne({
      where: { id: input.taskId }
    });

    if (!task) {
      throw new Error('Task not found');
    }

    // Verify author exists
    const author = await this.userRepository.findOne({
      where: { id: input.authorId }
    });

    if (!author) {
      throw new Error('Author not found');
    }

    const comment = this.commentRepository.create({
      content: input.content,
      taskId: input.taskId,
      authorId: input.authorId
    });

    const savedComment = await this.commentRepository.save(comment);

    // Get the saved comment with relations
    const fullComment = await this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: {
        author: true,
        task: true
      }
    });

    if (!fullComment) {
      throw new Error('Failed to retrieve saved comment');
    }

    return {
      id: fullComment.id,
      content: fullComment.content,
      taskId: fullComment.taskId,
      authorId: fullComment.authorId,
      author: {
        ...fullComment.author,
        role: fullComment.author.role as any // Cast enum
      },
      task: {
        ...fullComment.task,
        description: fullComment.task.description || undefined, // Handle null
        status: fullComment.task.status as any, // Cast enum
        priority: fullComment.task.priority as any, // Cast enum
        dueDate: fullComment.task.dueDate?.toISOString() || undefined, // Handle Date to string
        assigneeId: fullComment.task.assigneeId || undefined // Handle null to undefined
      },
      createdAt: fullComment.createdAt.toISOString() // Use actual createdAt from database
    };
  }
}
