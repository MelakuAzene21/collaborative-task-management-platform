import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor() {
    super({
      // Prisma 7.x requires explicit configuration
      log: ['query', 'info', 'warn', 'error'],
    });
  }

  async onModuleInit() {
    if (!process.env.DATABASE_URL) {
      console.warn('⚠️  DATABASE_URL not set in environment variables.');
      console.warn('Please create a .env file with: DATABASE_URL="postgresql://username:password@localhost:5432/task_management"');
    }
    
    try {
      await this.$connect();
      console.log('✅ Database connected successfully');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      console.log('🔧 Please ensure:');
      console.log('   1. PostgreSQL server is running');
      console.log('   2. Database "task_management" exists');
      console.log('   3. DATABASE_URL is correctly set in .env file');
      console.log('🔧 The app will continue running, but database operations will fail');
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
