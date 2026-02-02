import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { LoginInput, LoginResponse, RegisterInput } from './auth.model';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginResponse)
  async login(@Args('input') input: LoginInput) {
    return this.authService.login(input.email, input.password);
  }

  @Mutation(() => LoginResponse)
  async register(@Args('input') input: RegisterInput) {
    return this.authService.register(input.email, input.password, input.name);
  }

  @Mutation(() => String)
  async resetPassword(@Args('email') email: string) {
    const result = await this.authService.resetPassword(email);
    return result.message;
  }

  @Mutation(() => String)
  async confirmPasswordReset(
    @Args('token') token: string,
    @Args('newPassword') newPassword: string
  ) {
    const result = await this.authService.confirmPasswordReset(token, newPassword);
    return result.message;
  }
}
