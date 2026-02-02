import { Module } from '@nestjs/common';
import { ProjectResolver } from './projects.resolver';

@Module({
  providers: [ProjectResolver],
})
export class ProjectsModule {}
