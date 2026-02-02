import { ObjectType, Field, ID, InputType } from '@nestjs/graphql';
import { User } from '../auth/auth.model';

@ObjectType()
export class ProjectBasic {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => ID)
  teamId: string;
}

@ObjectType()
export class TeamMember {
  @Field(() => ID)
  id: string;

  @Field(() => ID)
  userId: string;

  @Field(() => ID)
  teamId: string;

  @Field(() => User, { nullable: true })
  user?: User;
}

@ObjectType()
export class Team {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => [TeamMember])
  members: TeamMember[];

  @Field(() => [ProjectBasic])
  projects: ProjectBasic[];
}

@InputType()
export class CreateTeamInput {
  @Field(() => String)
  name: string;
}
