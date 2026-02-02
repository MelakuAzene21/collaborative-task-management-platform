import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { Task } from '../tasks/tasks.model';

@ObjectType()
export class TeamBasic {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;
}

@ObjectType()
export class Project {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => ID)
  teamId: string;

  @Field(() => TeamBasic, { nullable: true })
  team?: TeamBasic;

  @Field(() => [Task])
  tasks: Task[];
}

@InputType()
export class CreateProjectInput {
  @Field(() => String)
  name: string;

  @Field(() => ID)
  teamId: string;
}
