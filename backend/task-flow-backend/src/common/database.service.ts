import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User, Team, TeamMember, Project, Task, Comment } from '../entities';

@Injectable()
export class DatabaseService extends DataSource implements OnModuleInit, OnModuleDestroy {
  private _customInitialized = false;

  constructor() {
    super({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: '123',
      database: 'task_management',
      entities: [User, Team, TeamMember, Project, Task, Comment],
      synchronize: true, // Set to false in production
      logging: true,
    });
  }

  get customInitialized(): boolean {
    return this._customInitialized;
  }

  async onModuleInit() {
    if (!this._customInitialized) {
      try {
        await this.initialize();
        this._customInitialized = true;
        console.log('✅ Database connected successfully');
      } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.log('🔧 Please ensure:');
        console.log('   1. PostgreSQL server is running');
        console.log('   2. Database "task_management" exists');
        console.log('   3. Connection credentials are correct');
        console.log('🔧 The app will continue running, but database operations will fail');
      }
    }
  }

  async onModuleDestroy() {
    if (this._customInitialized) {
      await this.destroy();
      this._customInitialized = false;
    }
  }
}
