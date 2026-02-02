import { Module } from '@nestjs/common';
import { TaskResolver } from './tasks.resolver';

@Module({
  providers: [TaskResolver],
})
export class TasksModule {}
