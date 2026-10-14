import apiClient from './client';
import { User, AnimalReport } from '../types';
import { getStoredUsers, saveUsers, getStoredReports } from './mockStore';

export async function toggleVolunteerAvailability(userId: string, isAvailable: boolean): Promise<User> {
  try {
    const res = await apiClient.post<User>(`/volunteers/${userId}/availability`, { is_available: isAvailable });
    return res.data;
  } catch {
    const users = getStoredUsers();
    const idx = users.findIndex((u) => u.id === userId);
    if (idx === -1) throw new Error('Volunteer not found');

    const updated = { ...users[idx], is_available: isAvailable };
    users[idx] = updated;
    saveUsers(users);
    return updated;
  }
}

export async function getVolunteerAssignments(volunteerId: string): Promise<{ active: AnimalReport[]; history: AnimalReport[] }> {
  try {
    const res = await apiClient.get(`/volunteers/${volunteerId}/assignments`);
    if (res.data && Array.isArray(res.data.active) && Array.isArray(res.data.history)) {
      return res.data;
    }
    throw new Error('Invalid assignments payload');
  } catch {
    const reports = getStoredReports();
    const assigned = reports.filter((r) => r.assigned_volunteer_id === volunteerId || r.assigned_volunteer_name === 'Marcus Chen');
    const active = assigned.filter((r) => r.status === 'Accepted' || r.status === 'In Progress');
    const history = assigned.filter((r) => r.status === 'Rescued' || r.status === 'Closed');
    return { active, history };
  }
}

export async function getNearbyAvailableRescues(): Promise<AnimalReport[]> {
  try {
    const res = await apiClient.get<AnimalReport[]>('/volunteers/nearby-unassigned');
    if (Array.isArray(res.data)) return res.data;
    throw new Error('Invalid nearby rescues payload');
  } catch {
    const reports = getStoredReports();
    return reports.filter((r) => r.status === 'Reported');
  }
}

export async function getVolunteersList(): Promise<User[]> {
  try {
    const res = await apiClient.get<User[]>('/volunteers');
    if (Array.isArray(res.data)) return res.data;
    throw new Error('Invalid volunteers list payload');
  } catch {
    const users = getStoredUsers();
    return users.filter((u) => u.role === 'volunteer' || u.role === 'admin');
  }
}
