import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { loginUser, signupUser, logoutUser } from '../api/auth';
import { DEMO_USERS } from '../api/mockData';
import { toggleVolunteerAvailability } from '../api/volunteers';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  isVolunteer: boolean;
  isAdmin: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (data: { name: string; email: string; password?: string; role: UserRole; phone?: string }) => Promise<void>;
  logout: () => void;
  switchDemoUser: (role: UserRole) => void;
  toggleAvailability: (available: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const CURRENT_USER_KEY = 'rescue_current_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let initialUser = DEMO_USERS[0];
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id) {
          initialUser = parsed;
        }
      }
    } catch (e) {
      console.warn('Storage unavailable in iframe:', e);
    }

    setUser(initialUser);

    try {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(initialUser));
      if (initialUser.token) {
        localStorage.setItem('rescue_jwt_token', initialUser.token);
      }
    } catch {
      // Storage restricted
    } finally {
      setLoading(false);
    }
  }, []);

  const saveUserToStateAndStorage = (u: User | null) => {
    setUser(u);
    try {
      if (u) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(u));
        if (u.token) localStorage.setItem('rescue_jwt_token', u.token);
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
        localStorage.removeItem('rescue_jwt_token');
      }
    } catch {
      // Ignore storage restrictions
    }
  };

  const login = async (email: string, pass: string) => {
    const logged = await loginUser(email, pass);
    saveUserToStateAndStorage(logged);
  };

  const signup = async (data: { name: string; email: string; password?: string; role: UserRole; phone?: string }) => {
    const registered = await signupUser(data);
    saveUserToStateAndStorage(registered);
  };

  const logout = () => {
    logoutUser();
    saveUserToStateAndStorage(null);
  };

  const switchDemoUser = (role: UserRole) => {
    const matched = DEMO_USERS.find((u) => u.role === role) || DEMO_USERS[0];
    saveUserToStateAndStorage(matched);
  };

  const toggleAvailability = async (available: boolean) => {
    if (!user) return;
    try {
      const updated = await toggleVolunteerAvailability(user.id, available);
      saveUserToStateAndStorage({ ...user, is_available: updated.is_available });
    } catch (err) {
      console.warn('Could not toggle availability online:', err);
      saveUserToStateAndStorage({ ...user, is_available: available });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        isVolunteer: user?.role === 'volunteer' || user?.role === 'admin',
        isAdmin: user?.role === 'admin',
        login,
        signup,
        logout,
        switchDemoUser,
        toggleAvailability,
      }}
    >
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
