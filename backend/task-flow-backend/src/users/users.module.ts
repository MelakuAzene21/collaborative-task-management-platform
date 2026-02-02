import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { TeamMember } from '../entities/team-member.entity';
import { Team } from '../entities/team.entity';
import { UserResolver } from './users.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([User, TeamMember, Team])],
  providers: [UserResolver],
})
export class UsersModule {}
