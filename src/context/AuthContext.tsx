'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
  isCeoOrAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check existing session
  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          // Check localStorage backup
          const stored = localStorage.getItem('executive_user_session');
          if (stored) {
            setUser(JSON.parse(stored));
          }
        }
      } catch (err) {
        const stored = localStorage.getItem('executive_user_session');
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('executive_user_session', JSON.stringify(data.user));
        return { success: true };
      }

      return { success: false, error: data.error || 'Authentication failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during login' };
    }
  };

  const signup = async (name: string, email: string, password: string, role: UserRole) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await res.json();

      if (data.success && data.user) {
        setUser(data.user);
        localStorage.setItem('executive_user_session', JSON.stringify(data.user));
        return { success: true };
      }

      return { success: false, error: data.error || 'Account creation failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error during signup' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    setUser(null);
    localStorage.removeItem('executive_user_session');
  };

  const continueAsGuest = () => {
    const guestUser: User = {
      id: 'guest-usr',
      name: 'Guest Stakeholder',
      email: 'guest@chakramsar.com',
      role: 'Contractor / Viewer',
      avatar: '👁️',
    };
    setUser(guestUser);
    localStorage.setItem('executive_user_session', JSON.stringify(guestUser));
  };

  const isCeoOrAdmin = user?.role === 'CEO / Executive' || user?.role === 'Project Manager';

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, continueAsGuest, isCeoOrAdmin }}>
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
