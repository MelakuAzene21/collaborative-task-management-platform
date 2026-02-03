import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Role } from '../common/types';
import '../common/enums.graphql'; // Register enums with GraphQL

@ObjectType()
export class User {
  @Field(() => String)
  id: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  name: string;

  @Field(() => Role)
  role: Role;
}

@ObjectType()
export class LoginResponse {
  @Field(() => String)
  token: string;

  @Field(() => User)
  user: User;
}

@InputType()
export class LoginInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;
}

@InputType()
export class RegisterInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  password: string;

  @Field(() => String)
  name: string;
}

@InputType()
export class UpdateProfileInput {
  @Field(() => String)
  name: string;

  @Field(() => String)
  email: string;
}

@InputType()
export class ChangePasswordInput {
  @Field(() => String)
  currentPassword: string;

  @Field(() => String)
  newPassword: string;
}

@InputType()
export class InviteUserInput {
  @Field(() => String)
  email: string;

  @Field(() => String)
  teamId: string;

  @Field(() => Role, { nullable: true })
  role?: Role;
}
