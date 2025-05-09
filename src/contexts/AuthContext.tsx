
import { createContext, useContext, useState, ReactNode } from 'react';
import { User, UserRole } from '@/types';

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=8b5cf6&color=fff'
  },
  {
    id: '2',
    name: 'Maker User',
    email: 'maker@example.com',
    role: 'maker',
    avatar: 'https://ui-avatars.com/api/?name=Maker+User&background=8b5cf6&color=fff'
  },
  {
    id: '3',
    name: 'Checker One',
    email: 'checker1@example.com',
    role: 'checker1',
    avatar: 'https://ui-avatars.com/api/?name=Checker+One&background=8b5cf6&color=fff'
  },
  {
    id: '4',
    name: 'Checker Two',
    email: 'checker2@example.com',
    role: 'checker2',
    avatar: 'https://ui-avatars.com/api/?name=Checker+Two&background=8b5cf6&color=fff'
  },
];

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = mockUsers.find(u => u.email === email);
    
    // Simple mock authentication - in a real app would validate password too
    if (foundUser && password === 'password') {
      setUser(foundUser);
      localStorage.setItem('currentUser', JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    
    setIsLoading(false);
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  // Check for saved user on initial load
  useState(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  });

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
