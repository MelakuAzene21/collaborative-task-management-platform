# 🧪 TaskFlow Pro - Complete API Testing Guide

## 📋 Prerequisites
1. **Server Running**: `npm run start:dev`
2. **GraphQL Playground**: `http://localhost:4000/graphql`
3. **Database Connected**: PostgreSQL with `task_management` database

## 🔄 Testing Order (Important!)
Follow this order to respect foreign key relationships:

### 1️⃣ **Register User** (First)
```graphql
mutation {
  register(input: {
    email: "john.doe@example.com"
    password: "password123"
    name: "John Doe"
  }) {
    token
    user {
      id
      email
      name
      role
    }
  }
}
```
**Save the user ID for later steps**

### 2️⃣ **Create Team**
```graphql
mutation {
  createTeam(input: {
    name: "Development Team"
  }) {
    id
    name
    members {
      id
      userId
      teamId
    }
    projects {
      id
      name
      teamId
    }
  }
}
```
**Save the team ID for later steps**

### 3️⃣ **Add User to Team**
```graphql
mutation {
  addToTeam(userId: "USER_ID_FROM_STEP_1", teamId: "TEAM_ID_FROM_STEP_2") {
    id
    email
    name
    role
    teams {
      id
      userId
      teamId
      team {
        id
        name
      }
    }
  }
}
```

### 4️⃣ **Create Project** (Requires valid teamId)
```graphql
mutation {
  createProject(input: {
    name: "TaskFlow Pro Project"
    teamId: "TEAM_ID_FROM_STEP_2"
  }) {
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
      status
    }
  }
}
```
**Save the project ID for later steps**

### 5️⃣ **Create Task** (Requires valid projectId)
```graphql
mutation {
  createTask(input: {
    title: "Setup Database Schema"
    description: "Create and configure the database schema for the project"
    priority: HIGH
    projectId: "PROJECT_ID_FROM_STEP_4"
    assigneeId: "USER_ID_FROM_STEP_1"
  }) {
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
```
**Save the task ID for later steps**

### 6️⃣ **Create Comment** (Requires valid taskId and authorId)
```graphql
mutation {
  createComment(input: {
    content: "This task is critical for the project setup. Please prioritize it."
    taskId: "TASK_ID_FROM_STEP_5"
    authorId: "USER_ID_FROM_STEP_1"
  }) {
    id
    content
    taskId
    authorId
    author {
      id
      name
      email
    }
    task {
      id
      title
    }
    createdAt
  }
}
```

## 🔍 **Query Examples**

### **Get All Users**
```graphql
query {
  users {
    id
    email
    name
    role
    teams {
      id
      teamId
      team {
        id
        name
      }
    }
    tasks {
      id
      title
      status
    }
    comments {
      id
      content
      taskId
    }
  }
}
```

### **Get All Teams**
```graphql
query {
  teams {
    id
    name
    members {
      id
      userId
      teamId
      user {
        id
        name
        email
      }
    }
    projects {
      id
      name
      teamId
    }
  }
}
```

### **Get All Projects**
```graphql
query {
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
      status
      priority
    }
  }
}
```

### **Get Tasks by Project**
```graphql
query {
  tasks(projectId: "PROJECT_ID_FROM_STEP_4") {
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
```

### **Get Comments by Task**
```graphql
query {
  comments(taskId: "TASK_ID_FROM_STEP_5") {
    id
    content
    taskId
    authorId
    author {
      id
      name
      email
    }
    task {
      id
      title
    }
    createdAt
  }
}
```

## 🎯 **Test Scenarios**

### **Complete Workflow Test**
1. Register multiple users
2. Create teams
3. Add users to teams
4. Create projects under teams
5. Create tasks under projects
6. Assign tasks to team members
7. Add comments to tasks

### **Error Handling Tests**
- Try creating task with invalid projectId
- Try adding user to non-existent team
- Try creating comment with invalid taskId
- Try registering with duplicate email

## 📝 **Important Notes**

1. **Replace IDs**: Always replace placeholder IDs with actual IDs from previous steps
2. **Foreign Keys**: All relationships must exist before creating dependent records
3. **Authentication**: Include JWT token in headers for protected operations
4. **Data Persistence**: With proper database setup, all data will persist between sessions

## 🚀 **Advanced Testing**

### **Update Task Status**
```graphql
mutation {
  updateTask(id: "TASK_ID", input: {
    status: IN_PROGRESS
  }) {
    id
    title
    status
  }
}
```

### **Filter and Sort**
```graphql
query {
  tasks(projectId: "PROJECT_ID") {
    id
    title
    status
    priority
    assignee {
      name
    }
  }
}
```

This guide ensures all foreign key constraints are respected and provides a complete testing workflow for the entire TaskFlow Pro API!
