import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Team } from './team.entity';
import { Task } from './task.entity';

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ type: 'date', nullable: true })
  dueDate?: Date;

  @Column()
  teamId: string;

  @ManyToOne(() => Team, team => team.projects)
  @JoinColumn({ name: 'teamId' })
  team: Team;

  @OneToMany(() => Task, task => task.project)
  tasks: Task[];
}
