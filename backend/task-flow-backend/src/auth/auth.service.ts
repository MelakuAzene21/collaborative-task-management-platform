import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/prisma.service';
import { Role } from '../common/types';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });
    
    if (!user || !(await bcrypt.compare(password, user.password)))
      throw new UnauthorizedException('Invalid credentials');

    return {
      token: this.jwt.sign({ sub: user.id, role: user.role }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Role
      }
    };
  }

  async register(email: string, password: string, name: string) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: Role.MEMBER
      }
    });

    return {
      token: this.jwt.sign({ sub: user.id, role: user.role }),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as Role
      }
    };
  }

  async resetPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate reset token (simplified - in production, use crypto.randomBytes)
    const resetToken = Math.random().toString(36).substring(2, 15);
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    });

    // TODO: Send email with reset token
    return { message: 'Password reset email sent' };
  }

  async confirmPasswordReset(token: string, newPassword: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date()
        }
      }
    });

    if (!user) {
      throw new UnauthorizedException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: undefined,
        resetTokenExpiry: undefined
      }
    });

    return { message: 'Password reset successful' };
  }
}
