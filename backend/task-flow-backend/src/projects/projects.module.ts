import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../entities/project.entity';
import { Team } from '../entities/team.entity';
import { Task } from '../entities/task.entity';
import { ProjectResolver } from './projects.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Project, Team, Task])],
  providers: [ProjectResolver],
})
export class ProjectsModule {}
