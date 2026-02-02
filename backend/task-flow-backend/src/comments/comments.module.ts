import { Module } from '@nestjs/common';
import { CommentResolver } from './comments.resolver';

@Module({
  providers: [CommentResolver],
})
export class CommentsModule {}
