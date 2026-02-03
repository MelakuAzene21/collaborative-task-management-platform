import { useDispatch, useSelector } from 'react-redux';
import { useState, useEffect, type RefObject } from 'react';
import { type AppDispatch, type RootState } from '../store';
import { useMutation } from '@apollo/client/react';
import { LOGOUT_MUTATION, GET_CURRENT_USER } from '../api/queries';

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T => {
  return useSelector(selector);
};

// Cookie helper functions
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date();
  expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`;
};

const setUserCookie = (user: any) => {
  const userString = JSON.stringify(user);
  const expires = new Date();
  expires.setTime(expires.getTime() + 7 * 24 * 60 * 60 * 1000);
  document.cookie = `user=${encodeURIComponent(userString)};expires=${expires.toUTCString()};path=/`;
};

export const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(';').shift() || null;
  }
  return null;
};

export const getUserCookie = (): any | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; user=`);
  if (parts.length === 2) {
    const userString = parts.pop()?.split(';').shift();
    if (userString) {
      try {
        return JSON.parse(decodeURIComponent(userString));
      } catch {
        return null;
      }
    }
  }
  return null;
};

const deleteCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:01 UTC;path=/`;
};

const deleteUserCookie = () => {
  document.cookie = `user=;expires=Thu, 01 Jan 1970 00:00:01 UTC;path=/`;
};

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth);
  const [logoutMutation] = useMutation(LOGOUT_MUTATION);

  // Initialize auth state from cookies on component mount
  useEffect(() => {
    const token = getCookie('token');
    const user = getUserCookie();
    if (token && user && !auth.isAuthenticated) {
      // Token and user exist but not authenticated in Redux
      // This happens on page refresh - restore from cookies
      dispatch({
        type: 'auth/loginSuccess',
        payload: { token, user },
      });
    }
  }, [dispatch, auth.isAuthenticated]);

  const login = (token: string, user: any) => {
    setCookie('token', token);
    setUserCookie(user);
    dispatch({
      type: 'auth/loginSuccess',
      payload: { token, user },
    });
  };

  const logout = async () => {
    try {
      await logoutMutation();
    } catch (error) {
      console.error('Logout mutation failed:', error);
    } finally {
      deleteCookie('token');
      deleteUserCookie();
      dispatch({ type: 'auth/logout' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'auth/clearError' });
  };

  return {
    ...auth,
    login,
    logout,
    clearError,
  };
};

export const useNotifications = () => {
  const dispatch = useAppDispatch();
  const notifications = useAppSelector((state) => state.ui.notifications);

  const addNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    const id = Date.now().toString();
    dispatch({
      type: 'ui/addNotification',
      payload: { id, message, type, timestamp: Date.now() },
    });

    setTimeout(() => {
      dispatch({ type: 'ui/removeNotification', payload: id });
    }, 5000);
  };

  const removeNotification = (id: string) => {
    dispatch({ type: 'ui/removeNotification', payload: id });
  };

  return {
    notifications,
    addNotification,
    removeNotification,
  };
};

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
};

export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

export const useOnClickOutside = <T extends HTMLElement>(
  ref: RefObject<T>,
  handler: (event: MouseEvent | TouchEvent) => void
) => {
  useEffect(() => {
    const listener = (event: MouseEvent | TouchEvent) => {
      if (!ref.current || ref.current.contains(event.target as Node)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
};
