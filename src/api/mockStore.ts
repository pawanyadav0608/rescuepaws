import { AnimalReport, StatsData, User } from '../types';
import { INITIAL_REPORTS, INITIAL_STATS, DEMO_USERS } from './mockData';

const STORAGE_REPORTS_KEY = 'rescue_reports_data';
const STORAGE_STATS_KEY = 'rescue_stats_data';
const STORAGE_USERS_KEY = 'rescue_users_data';

// In-memory fallback in case localStorage is restricted (e.g., cross-origin iframes)
let memoryReports: AnimalReport[] = [...INITIAL_REPORTS];
let memoryStats: StatsData = { ...INITIAL_STATS };
let memoryUsers: User[] = [...DEMO_USERS];

export function getStoredReports(): AnimalReport[] {
  try {
    const raw = localStorage.getItem(STORAGE_REPORTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryReports = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('LocalStorage unavailable or restricted:', e);
  }

  try {
    localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(memoryReports));
  } catch {
    // Ignore storage quota or security errors in sandboxes
  }

  return memoryReports;
}

export function saveReports(reports: AnimalReport[]): void {
  memoryReports = reports;
  try {
    localStorage.setItem(STORAGE_REPORTS_KEY, JSON.stringify(reports));
  } catch (e) {
    console.warn('Error saving reports to localStorage:', e);
  }
}

export function getStoredStats(): StatsData {
  try {
    const raw = localStorage.getItem(STORAGE_STATS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.total_reports === 'number') {
        memoryStats = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading stats:', e);
  }
  return memoryStats;
}

export function saveStats(stats: StatsData): void {
  memoryStats = stats;
  try {
    localStorage.setItem(STORAGE_STATS_KEY, JSON.stringify(stats));
  } catch (e) {
    console.warn('Error saving stats:', e);
  }
}

export function getStoredUsers(): User[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        memoryUsers = parsed;
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Error reading users:', e);
  }
  return memoryUsers;
}

export function saveUsers(users: User[]): void {
  memoryUsers = users;
  try {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn('Error saving users:', e);
  }
}
