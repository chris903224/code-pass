import React, { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, LoginCredentials, RegisterData, AuthContextType } from '../types';

// ============================================================
// CONTEXT
// ============================================================
export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ============================================================
// PROVIDER
// ============================================================
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // ============================================================
  // CHECK SESSION ON MOUNT
  // ============================================================
  useEffect(() => {
    const checkSession = () => {
      try {
        const storedUser = sessionStorage.getItem('user');
        const isLoggedIn = sessionStorage.getItem('isLoggedIn');

        if (storedUser && isLoggedIn === 'true') {
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Session check failed:', error);
        sessionStorage.clear();
      }
    };

    checkSession();
  }, []);

  // ============================================================
  // LOGIN
  // ============================================================
  const login = async (credentials: LoginCredentials): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const userData: User = {
        username: credentials.username,
        fullName: credentials.userType === 'admin' 
          ? 'Administrator' 
          : credentials.userType === 'department'
          ? 'Department Head'
          : credentials.username,
        userType: credentials.userType,
        studentId: credentials.userType === 'student' ? credentials.username : undefined,
      };

      setUser(userData);
      setIsAuthenticated(true);

      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('userType', credentials.userType);
      sessionStorage.setItem('username', credentials.username);
      sessionStorage.setItem('fullName', userData.fullName);
      
      if (userData.studentId) {
        sessionStorage.setItem('studentId', userData.studentId);
      }
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // REGISTER
  // ============================================================
  const register = async (data: RegisterData): Promise<void> => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      const userData: User = {
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        userType: data.userType,
        studentId: data.userType === 'student' ? data.username : undefined,
      };

      setUser(userData);
      setIsAuthenticated(true);

      sessionStorage.setItem('user', JSON.stringify(userData));
      sessionStorage.setItem('isLoggedIn', 'true');
      sessionStorage.setItem('userType', data.userType);
      sessionStorage.setItem('username', data.username);
      sessionStorage.setItem('fullName', data.fullName);
      
      if (userData.studentId) {
        sessionStorage.setItem('studentId', userData.studentId);
      }
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // LOGOUT
  // ============================================================
  const logout = (): void => {
    setUser(null);
    setIsAuthenticated(false);
    sessionStorage.clear();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;