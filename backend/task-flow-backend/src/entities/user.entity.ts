import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { TeamMember } from './team-member.entity';
import { Task } from './task.entity';
import { Comment } from './comment.entity';

export enum Role {
  ADMIN = 'ADMIN',
  LEAD = 'LEAD',
  MEMBER = 'MEMBER'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.MEMBER
  })
  role: Role;

  @Column({ nullable: true })
  resetToken: string;

  @Column({ nullable: true })
  resetTokenExpiry: Date;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => TeamMember, teamMember => teamMember.user)
  teamMembers: TeamMember[];

  @OneToMany(() => Task, task => task.assignee)
  assignedTasks: Task[];

  @OneToMany(() => Comment, comment => comment.author)
  comments: Comment[];
}
