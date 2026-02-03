import { configureStore } from '@reduxjs/toolkit';

export interface RootState {
  auth: {
    user: any | null;
    token: string | null;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
  };
  ui: {
    sidebarOpen: boolean;
    theme: 'light' | 'dark';
    notifications: Array<{
      id: string;
      message: string;
      type: 'success' | 'error' | 'warning' | 'info';
      timestamp: number;
    }>;
  };
}

const initialState: RootState = {
  auth: {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
    error: null,
  },
  ui: {
    sidebarOpen: true,
    theme: 'light',
    notifications: [],
  },
};

export const store = configureStore({
  reducer: {
    auth: (state = initialState.auth, action: any) => {
      switch (action.type) {
        case 'auth/loginStart':
          return { ...state, loading: true, error: null };
        case 'auth/loginSuccess':
          return {
            ...state,
            loading: false,
            user: action.payload.user,
            token: action.payload.token,
            isAuthenticated: true,
            error: null,
          };
        case 'auth/loginFailure':
          return {
            ...state,
            loading: false,
            user: null,
            token: null,
            isAuthenticated: false,
            error: action.payload,
          };
        case 'auth/logout':
          return {
            ...state,
            user: null,
            token: null,
            isAuthenticated: false,
            error: null,
          };
        case 'auth/clearError':
          return { ...state, error: null };
        default:
          return state;
      }
    },
    ui: (state = initialState.ui, action: any) => {
      switch (action.type) {
        case 'ui/toggleSidebar':
          return { ...state, sidebarOpen: !state.sidebarOpen };
        case 'ui/addNotification':
          return {
            ...state,
            notifications: [...state.notifications, action.payload],
          };
        case 'ui/removeNotification':
          return {
            ...state,
            notifications: state.notifications.filter(
              (n) => n.id !== action.payload
            ),
          };
        case 'ui/setTheme':
          return { ...state, theme: action.payload };
        default:
          return state;
      }
    },
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['ui/addNotification'],
      },
    }),
});

export type AppDispatch = typeof store.dispatch;
