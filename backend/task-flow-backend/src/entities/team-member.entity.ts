import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';
import { Team } from './team.entity';

@Entity('team_members')
export class TeamMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @Column()
  teamId: string;

  @ManyToOne(() => User, user => user.teamMembers)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Team, team => team.members)
  @JoinColumn({ name: 'teamId' })
  team: Team;
}
