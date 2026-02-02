import { Field, InputType, Int, ObjectType } from '@nestjs/graphql';
import { TaskStatus, Priority } from '../common/types';
import '../common/enums.graphql'; // Register enums with GraphQL

@ObjectType()
export class Task {
  @Field(() => String)
  id: string;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => TaskStatus)
  status: TaskStatus;

  @Field(() => Priority)
  priority: Priority;

  @Field(() => String, { nullable: true })
  dueDate?: string;

  @Field(() => String, { nullable: true })
  assigneeId?: string;

  @Field(() => String)
  projectId: string;
}

@InputType()
export class CreateTaskInput {
  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => TaskStatus, { nullable: true })
  status?: TaskStatus;

  @Field(() => Priority)
  priority: Priority;

  @Field(() => String, { nullable: true })
  dueDate?: string;

  @Field(() => String, { nullable: true })
  assigneeId?: string;

  @Field(() => String)
  projectId: string;
}
