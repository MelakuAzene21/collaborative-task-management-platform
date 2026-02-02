import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../entities/task.entity';
import { Project } from '../entities/project.entity';
import { User } from '../entities/user.entity';
import { TaskResolver } from './tasks.resolver';

@Module({
  imports: [TypeOrmModule.forFeature([Task, Project, User])],
  providers: [TaskResolver],
})
export class TasksModule {}
