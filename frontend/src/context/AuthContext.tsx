import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, role: 'admin' | 'user', redirectTo?: string) => Promise<void>;
  logout: () => void;
  updateUser: (user: User) => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userRole = localStorage.getItem('userRole') as 'admin' | 'user' | null;

      if (token && userRole) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await api.get<User>('/users/me');
          setUser({ ...response.data, role: userRole });
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Failed to initialize auth:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('userRole');
          setIsAuthenticated(false);
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const login = async (token: string, role: 'admin' | 'user', redirectTo?: string) => {
    localStorage.setItem('token', token);
    localStorage.setItem('userRole', role);
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      const response = await api.get<User>('/users/me');
      setUser({ ...response.data, role });
      setIsAuthenticated(true);

      if (redirectTo) {
        navigate(redirectTo);
      } else if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (error) {
      console.error('Login failed:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      setUser(null);
      setIsAuthenticated(false);
      throw new Error('Login failed');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    delete api.defaults.headers.common['Authorization'];
    setUser(null);
    setIsAuthenticated(false);
    navigate('/login?logout=success');
  };

  const updateUser = (updatedUser: User) => {
    setUser(prevUser => (prevUser ? { ...prevUser, ...updatedUser } : null));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAuthenticated, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;