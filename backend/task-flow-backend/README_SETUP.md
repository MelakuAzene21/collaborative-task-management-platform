# TaskFlow Pro - Backend Setup

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your database credentials:
   ```
   DATABASE_URL="postgresql://username:password@localhost:5432/taskflow_pro"
   JWT_SECRET="your-super-secret-jwt-key"
   ```

3. **Start the development server**
   ```bash
   npm run start:dev
   ```

The server will start on `http://localhost:4000` with GraphQL Playground at `http://localhost:4000/graphql`

## Current Status

✅ **Working Features:**
- Authentication system (login, register, password reset)
- Basic task management (create, list tasks by project)
- GraphQL API with proper type safety
- JWT authentication
- Password hashing with bcrypt

🔄 **Placeholder Implementation:**
- Database operations (using mock data until database is set up)
- Email service (password reset emails not sent)
- File uploads
- Real-time subscriptions

## Next Steps

1. **Set up PostgreSQL database**
2. **Run database migrations:**
   ```bash
   npx prisma migrate dev
   ```
3. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```
4. **Replace placeholder PrismaService with real implementation**

## GraphQL Schema

The API provides the following mutations and queries:

### Authentication
```graphql
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
```

### Tasks
```graphql
query Tasks($projectId: String!) {
  tasks(projectId: $projectId) {
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
```
