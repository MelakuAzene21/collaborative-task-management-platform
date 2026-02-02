import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Comment } from '../entities/comment.entity';
import { Task } from '../entities/task.entity';
import { User } from '../entities/user.entity';
import { CommentResolver } from './comments.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Comment, Task, User])],
  providers: [CommentResolver],
})
export class CommentsModule {}
