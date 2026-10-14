import apiClient from './client';
import { User, UserRole } from '../types';
import { getStoredUsers, saveUsers } from './mockStore';

export async function loginUser(email: string, _password: string): Promise<User> {
  try {
    const res = await apiClient.post<User>('/auth/login', { email, password: _password });
    if (res.data.token) {
      localStorage.setItem('rescue_jwt_token', res.data.token);
    }
    return res.data;
  } catch {
    const users = getStoredUsers();
    const found = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (found) {
      const token = found.token || `jwt-${found.role}-${Date.now()}`;
      localStorage.setItem('rescue_jwt_token', token);
      return { ...found, token };
    }
    // Default fallback if user typed any demo login
    const newUser: User = {
      id: `usr-${Date.now()}`,
      name: email.split('@')[0],
      email,
      role: email.includes('vol') ? 'volunteer' : email.includes('admin') ? 'admin' : 'citizen',
      token: `jwt-token-${Date.now()}`,
      is_available: true,
      rescues_completed: 0
    };
    saveUsers([...users, newUser]);
    localStorage.setItem('rescue_jwt_token', newUser.token!);
    return newUser;
  }
}

export async function signupUser(data: {
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
}): Promise<User> {
  try {
    const res = await apiClient.post<User>('/auth/signup', data);
    if (res.data.token) {
      localStorage.setItem('rescue_jwt_token', res.data.token);
    }
    return res.data;
  } catch {
    const users = getStoredUsers();
    const token = `jwt-${data.role}-${Date.now()}`;
    const newUser: User = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone || '',
      token,
      is_available: data.role === 'volunteer',
      rescues_completed: 0,
    };
    saveUsers([...users, newUser]);
    localStorage.setItem('rescue_jwt_token', token);
    return newUser;
  }
}

export function logoutUser(): void {
  localStorage.removeItem('rescue_jwt_token');
  localStorage.removeItem('rescue_current_user');
}
