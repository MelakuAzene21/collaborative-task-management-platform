import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { User } from './user.entity';
import { Task } from './task.entity';

@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  content: string;

  @Column()
  taskId: string;

  @Column()
  authorId: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, user => user.comments)
  @JoinColumn({ name: 'authorId' })
  author: User;

  @ManyToOne(() => Task, task => task.comments)
  @JoinColumn({ name: 'taskId' })
  task: Task;
}
