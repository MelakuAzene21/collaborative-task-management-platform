import { Field, InputType, ObjectType } from '@nestjs/graphql';
import { Role } from '../common/types';

@ObjectType()
export class LoginResponse {
  @Field(() => String)
  token: string;

  @Field(() => User)
  user: User;
}

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
