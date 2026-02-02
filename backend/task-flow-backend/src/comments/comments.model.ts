import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { User } from '../auth/auth.model';
import { Task } from '../tasks/tasks.model';

@ObjectType()
export class Comment {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  content: string;

  @Field(() => ID)
  taskId: string;

  @Field(() => ID)
  authorId: string;

  @Field(() => User, { nullable: true })
  author?: User;

  @Field(() => Task, { nullable: true })
  task?: Task;

  @Field(() => String)
  createdAt: string;
}

@InputType()
export class CreateCommentInput {
  @Field(() => String)
  content: string;

  @Field(() => ID)
  taskId: string;

  @Field(() => ID)
  authorId: string;
}
