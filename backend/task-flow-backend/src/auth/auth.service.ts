import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, Role } from '../entities/user.entity';
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
}
