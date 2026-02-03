import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { 
  LoginInput, 
  LoginResponse, 
  RegisterInput, 
  UpdateProfileInput, 
  ChangePasswordInput, 
  InviteUserInput,
  User
} from './auth.model';
import { Response } from 'express';

@Resolver()
export class AuthResolver {
  constructor(private authService: AuthService) {}

  @Mutation(() => LoginResponse)
  async login(@Args('input') input: LoginInput, @Context() context: { res: Response }) {
    const result = await this.authService.login(input.email, input.password);
    
    // Set HTTP-only cookie
    context.res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    return result;
  }

  @Mutation(() => LoginResponse)
  async register(@Args('input') input: RegisterInput, @Context() context: { res: Response }) {
    const result = await this.authService.register(input.email, input.password, input.name);
    
    // Set HTTP-only cookie
    context.res.cookie('token', result.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    return result;
  }

  @Mutation(() => String)
  async logout(@Context() context: { res: Response }) {
    context.res.clearCookie('token');
    return 'Logged out successfully';
  }

  @Mutation(() => User)
  async updateProfile(@Args('input') input: UpdateProfileInput, @Context() context: { req: any }) {
    return this.authService.updateProfile(context.req.user.id, input);
  }

  @Mutation(() => User)
  async changePassword(@Args('input') input: ChangePasswordInput, @Context() context: { req: any }) {
    return this.authService.changePassword(context.req.user.id, input);
  }

  @Mutation(() => User)
  async inviteUser(@Args('input') input: InviteUserInput) {
    return this.authService.inviteUser(input);
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
