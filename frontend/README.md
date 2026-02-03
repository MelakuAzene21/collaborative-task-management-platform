# TaskFlow Pro - Frontend

A modern React TypeScript frontend for the TaskFlow Pro collaborative task management platform.

## Features Implemented

### 🔐 Authentication
- User registration and login
- JWT token management
- Protected routes
- Role-based access control

### 📊 Dashboard
- Project overview statistics
- Task status distribution
- High priority tasks
- Recent activity

### 👥 Team Management
- View all teams
- Team member management
- Project overview per team

### 🎨 UI/UX
- Modern Tailwind CSS design
- Responsive layout
- Dark/light theme support
- Toast notifications
- Loading states
- Error handling

### 🔧 Technical Stack
- **React 18** with TypeScript
- **Apollo Client** for GraphQL
- **Redux Toolkit** for state management
- **Tailwind CSS** for styling
- **React Router** for navigation
- **React Hook Form** for forms
- **Cloudinary** for file uploads
- **React Beautiful DND** for drag & drop

## Project Structure

```
src/
├── api/              # GraphQL queries and Apollo client
├── common/           # Shared components
├── components/       # Reusable UI components
├── features/         # Feature-specific components
│   ├── auth/         # Authentication pages
│   ├── dashboard/    # Dashboard
│   └── teams/        # Team management
├── hooks/            # Custom React hooks
├── store/            # Redux store configuration
├── types/            # TypeScript type definitions
└── utils/            # Utility functions
```

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your Cloudinary credentials.

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Build for production:**
   ```bash
   npm run build
   ```

## Environment Variables

```env
# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_API_KEY=your_api_key
VITE_CLOUDINARY_API_SECRET=your_api_secret

# API Configuration
VITE_API_URL=http://localhost:4000/graphql
VITE_WS_URL=ws://localhost:4000/graphql
```

## Key Features

### Authentication Flow
- JWT-based authentication
- Automatic token refresh
- Protected routes with role-based access
- Persistent login state

### State Management
- Redux Toolkit for global state
- Apollo Client cache for GraphQL data
- Local storage for persistence

### UI Components
- Reusable component library
- Consistent design system
- Accessibility support
- Mobile-responsive design

### Performance Optimizations
- Code splitting with React.lazy
- Apollo Client caching
- Optimistic updates
- Debounced search

## Integration with Backend

The frontend integrates seamlessly with the TypeORM backend through:

- **GraphQL API** for data operations
- **WebSocket subscriptions** for real-time updates
- **JWT authentication** for secure communication
- **File uploads** via Cloudinary integration

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint configuration for code quality
- Prettier for consistent formatting
- Conventional commits for version control

### Component Architecture
- Functional components with hooks
- Custom hooks for reusable logic
- Props interfaces for type safety
- Storybook for component documentation

### Testing
- Jest for unit testing
- React Testing Library for component testing
- Cypress for end-to-end testing
- GraphQL testing with Apollo Mock Provider

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository
2. Configure environment variables
3. Automatic deployment on push

### Docker
```bash
docker build -t taskflow-frontend .
docker run -p 3000:3000 taskflow-frontend
```

### Static Hosting
```bash
npm run build
# Deploy the dist/ folder to any static hosting service
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.
