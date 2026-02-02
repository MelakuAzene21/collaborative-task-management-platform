import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TeamMember } from './team-member.entity';
import { Project } from './project.entity';

@Entity('teams')
export class Team {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @OneToMany(() => TeamMember, teamMember => teamMember.team)
  members: TeamMember[];

  @OneToMany(() => Project, project => project.team)
  projects: Project[];
}
