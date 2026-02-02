import { Module } from '@nestjs/common';
import { TeamResolver } from './teams.resolver';

@Module({
  providers: [TeamResolver],
})
export class TeamsModule {}
