import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`;

export const REGISTER_MUTATION = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        id
        email
        name
        role
      }
    }
  }
`;

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`;

export const UPDATE_PROFILE_MUTATION = gql`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      email
      name
      role
    }
  }
`;

export const CHANGE_PASSWORD_MUTATION = gql`
  mutation ChangePassword($input: ChangePasswordInput!) {
    changePassword(input: $input) {
      id
      email
    }
  }
`;

export const INVITE_USER_MUTATION = gql`
  mutation InviteUser($input: InviteUserInput!) {
    inviteUser(input: $input) {
      id
      email
      name
      role
    }
  }
`;

export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      id
      email
      name
      role
    }
  }
`;

export const GET_USERS = gql`
  query GetUsers {
    users {
      id
      email
      name
      role
    }
  }
`;

export const GET_TEAMS = gql`
  query GetTeams {
    teams {
      id
      name
      description
      members {
        id
        userId
        teamId
        user {
          id
          email
          name
          role
        }
      }
      projects {
        id
        name
        teamId
      }
    }
  }
`;

export const GET_TEAM = gql`
  query GetTeam($id: String!) {
    team(id: $id) {
      id
      name
      members {
        id
        userId
        teamId
        user {
          id
          email
          name
          role
        }
      }
      projects {
        id
        name
        teamId
      }
    }
  }
`;

export const CREATE_TEAM = gql`
  mutation CreateTeam($input: CreateTeamInput!) {
    createTeam(input: $input) {
      id
      name
      description
      members {
        id
        userId
        teamId
        user {
          id
          email
          name
          role
        }
      }
      projects {
        id
        name
        teamId
      }
    }
  }
`;

export const ADD_TO_TEAM = gql`
  mutation AddToTeam($userId: String!, $teamId: String!) {
    addToTeam(userId: $userId, teamId: $teamId) {
      id
      email
      name
      role
    }
  }
`;

export const GET_PROJECTS = gql`
  query GetProjects {
    projects {
      id
      name
      teamId
      team {
        id
        name
      }
      tasks {
        id
        title
        description
        status
        priority
        dueDate
        assigneeId
        projectId
      }
    }
  }
`;

export const GET_PROJECT = gql`
  query GetProject($id: String!) {
    project(id: $id) {
      id
      name
      teamId
      team {
        id
        name
      }
      tasks {
        id
        title
        description
        status
        priority
        dueDate
        assigneeId
        projectId
      }
    }
  }
`;

export const CREATE_PROJECT = gql`
  mutation CreateProject($input: CreateProjectInput!) {
    createProject(input: $input) {
      id
      name
      description
      dueDate
      teamId
      team {
        id
        name
      }
      tasks {
        id
        title
        description
        status
        priority
        dueDate
        assigneeId
        projectId
      }
    }
  }
`;

export const UPDATE_PROJECT = gql`
  mutation UpdateProject($id: String!, $input: UpdateProjectInput!) {
    updateProject(id: $id, input: $input) {
      id
      name
      description
      dueDate
      teamId
      team {
        id
        name
      }
      tasks {
        id
        title
        description
        status
        priority
        dueDate
        assigneeId
        projectId
      }
    }
  }
`;

export const DELETE_PROJECT = gql`
  mutation DeleteProject($id: String!) {
    deleteProject(id: $id) {
      id
      name
    }
  }
`;

export const GET_TASKS = gql`
  query GetTasks($projectId: String!) {
    tasks(projectId: $projectId) {
      id
      title
      description
      status
      priority
      dueDate
      assigneeId
      projectId
      assignee {
        id
        name
        email
        role
      }
      project {
        id
        name
      }
    }
  }
`;

export const CREATE_TASK = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      id
      title
      description
      status
      priority
      dueDate
      assigneeId
      projectId
    }
  }
`;

export const UPDATE_TASK = gql`
  mutation UpdateTask($id: String!, $input: UpdateTaskInput!) {
    updateTask(id: $id, input: $input) {
      id
      title
      description
      status
      priority
      dueDate
      assigneeId
      projectId
      project {
        id
        name
      }
      assignee {
        id
        name
        email
      }
    }
  }
`;

export const GET_COMMENTS = gql`
  query GetComments($taskId: String!) {
    comments(taskId: $taskId) {
      id
      content
      taskId
      authorId
      author {
        id
        email
        name
        role
      }
      task {
        id
        title
        description
        status
        priority
        dueDate
        assigneeId
        projectId
      }
      createdAt
    }
  }
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      id
      content
      taskId
      authorId
      author {
        id
        email
        name
        role
      }
      task {
        id
        title
        description
        status
        priority
        dueDate
        assigneeId
        projectId
      }
      createdAt
    }
  }
`;

export const DELETE_TASK = gql`
  mutation DeleteTask($id: String!) {
    deleteTask(id: $id) {
      id
      title
    }
  }
`;
