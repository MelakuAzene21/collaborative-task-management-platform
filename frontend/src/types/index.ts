export enum Role {
  ADMIN = 'ADMIN',
  LEAD = 'LEAD',
  MEMBER = 'MEMBER'
}

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

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export interface Team {
  id: string;
  name: string;
  members: TeamMember[];
  projects: Project[];
}

export interface TeamMember {
  id: string;
  userId: string;
  teamId: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  teamId: string;
  team: Team;
  tasks: Task[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: Priority;
  dueDate?: string;
  assigneeId?: string;
  projectId: string;
  assignee?: User;
  project?: Project;
  comments: Comment[];
}

export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  author: User;
  task: Task;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user?: User;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: Priority;
  dueDate?: string;
  assigneeId?: string;
  projectId: string;
}

export interface CreateProjectInput {
  name: string;
  teamId: string;
}

export interface CreateTeamInput {
  name: string;
}

export interface CreateCommentInput {
  content: string;
  taskId: string;
  authorId: string;
}
