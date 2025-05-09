
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, UserRole } from '@/types';
import { useToast } from '@/components/ui/use-toast';

// Mock users for demonstration
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    roles: ['admin'],
    avatar: 'https://ui-avatars.com/api/?name=Admin+User&background=8b5cf6&color=fff'
  },
  {
    id: '2',
    name: 'Maker User',
    email: 'maker@example.com',
    role: 'maker',
    roles: ['maker', 'checker1'],
    avatar: 'https://ui-avatars.com/api/?name=Maker+User&background=8b5cf6&color=fff'
  },
  {
    id: '3',
    name: 'Checker One',
    email: 'checker1@example.com',
    role: 'checker1',
    roles: ['checker1'],
    avatar: 'https://ui-avatars.com/api/?name=Checker+One&background=8b5cf6&color=fff'
  },
  {
    id: '4',
    name: 'Checker Two',
    email: 'checker2@example.com',
    role: 'checker2',
    roles: ['checker2', 'maker'],
    avatar: 'https://ui-avatars.com/api/?name=Checker+Two&background=8b5cf6&color=fff'
  },
];

interface AuthContextType {
  user: User | null;
  users: User[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  addUser: (newUser: Omit<User, 'id'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  deleteUser: (id: string) => void;
  getUserById: (id: string) => User | undefined;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const foundUser = users.find(u => u.email === email);
    
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

  const addUser = (newUser: Omit<User, 'id'>) => {
    // Only admin can add users
    if (user?.role !== 'admin') {
      toast({
        title: "Permission Denied",
        description: "Only administrators can add new users",
        variant: "destructive"
      });
      return;
    }

    const id = Date.now().toString();
    const createdUser = {
      ...newUser,
      id,
      roles: [newUser.role],
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(newUser.name)}&background=8b5cf6&color=fff`
    };

    setUsers([...users, createdUser]);
    toast({
      title: "User Created",
      description: `User ${newUser.name} has been successfully created`
    });
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    // Only admin can update users
    if (user?.role !== 'admin') {
      toast({
        title: "Permission Denied",
        description: "Only administrators can update users",
        variant: "destructive"
      });
      return;
    }

    setUsers(users.map(u => {
      if (u.id === id) {
        // If updating roles, make sure primary role is included
        let updatedRoles = userData.roles || u.roles;
        if (userData.role && !updatedRoles.includes(userData.role)) {
          updatedRoles = [userData.role, ...updatedRoles];
        }

        return { 
          ...u, 
          ...userData,
          roles: updatedRoles
        };
      }
      return u;
    }));

    toast({
      title: "User Updated",
      description: "User information has been successfully updated"
    });
  };

  const deleteUser = (id: string) => {
    // Only admin can delete users
    if (user?.role !== 'admin') {
      toast({
        title: "Permission Denied",
        description: "Only administrators can delete users",
        variant: "destructive"
      });
      return;
    }

    const userToDelete = users.find(u => u.id === id);
    if (!userToDelete) return;

    setUsers(users.filter(u => u.id !== id));
    toast({
      title: "User Deleted",
      description: `User ${userToDelete.name} has been successfully deleted`
    });
  };

  const getUserById = (id: string) => {
    return users.find(u => u.id === id);
  };

  // Check for saved user on initial load
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Failed to parse saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  // Save users to localStorage
  useEffect(() => {
    localStorage.setItem('users', JSON.stringify(users));
  }, [users]);

  // Load users from localStorage on init
  useEffect(() => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      try {
        setUsers(JSON.parse(savedUsers));
      } catch (error) {
        console.error('Failed to parse saved users:', error);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      users,
      login, 
      logout, 
      isLoading,
      addUser,
      updateUser,
      deleteUser,
      getUserById
    }}>
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
