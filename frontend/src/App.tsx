import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client/react';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';

import { client } from './api/apollo';
import { store } from './store';
import Layout from './common/Layout';
import Dashboard from './features/dashboard/Dashboard';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Teams from './features/teams/Teams';
import Profile from './features/profile/Profile';
import Projects from './features/projects/Projects';
import Tasks from './features/tasks/Tasks';
import Calendar from './features/calendar/Calendar';
import { useAuth } from './hooks';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

// Public Route Component (redirect if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return !isAuthenticated ? <>{children}</> : <Navigate to="/" />;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="teams" element={<Teams />} />
        <Route path="profile" element={<Profile />} />
        <Route path="projects" element={<Projects />} />
        <Route path="tasks" element={<Tasks />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="settings" element={<div>Settings Page - Coming Soon</div>} />
      </Route>

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ApolloProvider client={client}>
        <Router>
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#4aed88',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ff6b6b',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Router>
      </ApolloProvider>
    </Provider>
  );
};

export default App;
