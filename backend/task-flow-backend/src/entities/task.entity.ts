import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Project } from './project.entity';
import { Comment } from './comment.entity';

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE'
}

export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

@Entity('tasks')
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.TODO
  })
  status: TaskStatus;

  @Column({
    type: 'enum',
    enum: Priority,
    default: Priority.MEDIUM
  })
  priority: Priority;

  @Column({ nullable: true })
  dueDate: Date;

  @Column({ nullable: true })
  assigneeId: string;

  @Column()
  projectId: string;

  @ManyToOne(() => User, user => user.assignedTasks, { nullable: true })
  @JoinColumn({ name: 'assigneeId' })
  assignee: User;

  @ManyToOne(() => Project, project => project.tasks)
  @JoinColumn({ name: 'projectId' })
  project: Project;

  @OneToMany(() => Comment, comment => comment.task)
  comments: Comment[];
}
