import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types';

const AuthContext = createContext<AuthState | null>(null);

const defaultUsers: User[] = [
  {
    id: '1',
    username: 'abdelghafour',
    password: 'ayachi',
    role: 'owner',
    assignedBoxes: ['box-1', 'box-2', 'box-3'],
    createdAt: new Date()
  },
  {
    id: '2',
    username: 'oussema',
    password: 'oussema123',
    role: 'user',
    assignedBoxes: ['box-1', 'box-2'],
    createdAt: new Date()
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(defaultUsers);

  useEffect(() => {
    const savedAuth = localStorage.getItem('auth');
    const savedUsers = localStorage.getItem('users');
    
    if (savedAuth) {
      const authData = JSON.parse(savedAuth);
      setIsAuthenticated(authData.isAuthenticated);
      setUser(authData.user);
    }
    
    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      // Ensure default user is always present
      const hasDefaultUser = parsedUsers.some((u: User) => u.username === 'abdelghafour');
      if (!hasDefaultUser) {
        setUsers([...defaultUsers, ...parsedUsers]);
      } else {
        setUsers(parsedUsers);
      }
    } else {
      // Save default users to localStorage
      localStorage.setItem('users', JSON.stringify(defaultUsers));
    }
  }, []);

  const login = (username: string, password: string): boolean => {
    console.log('Login attempt:', { username, password });
    console.log('Available users:', users);
    
    const foundUser = users.find(u => u.username === username && u.password === password);
    console.log('Found user:', foundUser);
    
    if (foundUser) {
      setIsAuthenticated(true);
      setUser(foundUser);
      localStorage.setItem('auth', JSON.stringify({
        isAuthenticated: true,
        user: foundUser
      }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('auth');
  };

  // Expose user management functions globally
  const userManagement = {
    addUser: (username: string, password: string, assignedBoxes: string[] = [], role: 'owner' | 'user' = 'user') => {
      const newUser: User = {
        id: Date.now().toString(),
        username,
        password,
        role,
        assignedBoxes,
        createdAt: new Date()
      };
      const updatedUsers = [...users, newUser];
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      return newUser;
    },
    updateUserBoxes: (userId: string, assignedBoxes: string[]) => {
      const updatedUsers = users.map(u => 
        u.id === userId ? { ...u, assignedBoxes } : u
      );
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      return true;
    },
    deleteUser: (userId: string) => {
      // Only delete if user exists and is not an owner
      const userToDelete = users.find(u => u.id === userId);
      if (!userToDelete || userToDelete.role === 'owner') {
        console.warn('Cannot delete owner user or user not found');
        return false;
      }
      
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('users', JSON.stringify(updatedUsers));
      return true;
    },
    getUsers: () => users
  };

  // Expose user management functions globally with better error handling
  React.useEffect(() => {
    (window as any).userManagement = userManagement;
  }, [users]);

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};