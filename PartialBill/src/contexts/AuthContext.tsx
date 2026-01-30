import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string | number;
  name: string;
  email: string;
  role: string;
  patient_id?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ user: User | null; message: string }>;
  register: (data: { firstName: string; lastName: string; email: string; phone: string; patientId: string; password: string }) => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in (from localStorage)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ user: User | null; message: string }> => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { user: data.user, message: '' };
      } else {
        return { user: null, message: data.message || 'Login failed' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { user: null, message: 'Network error' };
    }
  };

  const register = async (data: { firstName: string; lastName: string; email: string; phone: string; patientId: string; password: string }): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        return { success: true, message: result.message };
      }
      return { success: false, message: result.message || 'Registration failed' };
    } catch (error) {
      console.error('Register error:', error);
      return { success: false, message: 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
