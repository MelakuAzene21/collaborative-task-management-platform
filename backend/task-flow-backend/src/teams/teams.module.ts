import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../entities/team.entity';
import { TeamMember } from '../entities/team-member.entity';
import { User } from '../entities/user.entity';
import { Project } from '../entities/project.entity';
import { TeamResolver } from './teams.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Team, TeamMember, User, Project])],
  providers: [TeamResolver],
})
export class TeamsModule {}
