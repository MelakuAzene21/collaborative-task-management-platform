import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from '../entities/user.entity';
import { UpdateProfileInput, ChangePasswordInput, InviteUserInput } from './auth.model';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ 
      where: { email },
      relations: ['teamMembers', 'assignedTasks', 'comments']
    });
    
    if (!user || !(await bcrypt.compare(password, user.password)))
      throw new UnauthorizedException('Invalid credentials');

    return {
      token: this.jwt.sign({ sub: user.id, role: user.role }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }

  async register(email: string, password: string, name: string) {
    const existingUser = await this.userRepository.findOne({ where: { email } });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      role: Role.MEMBER
    });

    const savedUser = await this.userRepository.save(user);

    return {
      token: this.jwt.sign({ sub: savedUser.id, role: savedUser.role }),
      user: {
        id: savedUser.id,
        email: savedUser.email,
        name: savedUser.name,
        role: savedUser.role
      }
    };
  }

  async resetPassword(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate reset token (simplified - in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await this.userRepository.update(user.id, {
      resetToken,
      resetTokenExpiry
    });

    // TODO: Send email with reset token
    return { message: 'Password reset email sent' };
  }

  async confirmPasswordReset(token: string, newPassword: string) {
    const user = await this.userRepository.findOne({
      where: {
        resetToken: token,
        resetTokenExpiry: { $gt: new Date() } as any
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userRepository.update(user.id, {
      password: hashedPassword,
      resetToken: undefined,
      resetTokenExpiry: undefined
    });

    return { message: 'Password reset successful' };
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if email is being changed and if it's already taken
    if (input.email !== user.email) {
      const existingUser = await this.userRepository.findOne({ where: { email: input.email } });
      if (existingUser) {
        throw new ConflictException('Email already exists');
      }
    }

    await this.userRepository.update(userId, {
      name: input.name,
      email: input.email,
    });

    return {
      id: user.id,
      email: input.email,
      name: input.name,
      role: user.role
    };
  }

  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!(await bcrypt.compare(input.currentPassword, user.password))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(input.newPassword, 10);
    
    await this.userRepository.update(userId, {
      password: hashedPassword,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
  }

  async inviteUser(input: InviteUserInput) {
    // Check if user already exists
    let user = await this.userRepository.findOne({ where: { email: input.email } });

    if (!user) {
      // Create new user with temporary password
      const tempPassword = Math.random().toString(36).substring(2, 15);
      const hashedPassword = await bcrypt.hash(tempPassword, 10);
      
      user = this.userRepository.create({
        email: input.email,
        password: hashedPassword,
        name: input.email.split('@')[0], // Default name from email
        role: input.role || Role.MEMBER,
      });

      user = await this.userRepository.save(user);
      
      // TODO: Send invitation email with temporary password
    }

    // TODO: Add user to team if teamId is provided
    if (input.teamId) {
      // Implementation would depend on your team membership structure
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };
  }
}
