import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { PrismaModule } from './common/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TasksModule } from './tasks/tasks.module';
import { UsersModule } from './users/users.module';
import { TeamsModule } from './teams/teams.module';
import { ProjectsModule } from './projects/projects.module';
import { CommentsModule } from './comments/comments.module';
import { FilesModule } from './files/files.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      installSubscriptionHandlers: true,
      context: ({ req }) => ({ req }),
    }),
    PrismaModule,
    AuthModule,
    TasksModule,
    UsersModule,
    TeamsModule,
    ProjectsModule,
    CommentsModule,
    FilesModule,
    NotificationsModule,
  ],
})
export class AppModule {}
