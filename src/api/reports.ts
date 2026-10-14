import apiClient from './client';
import { AnimalReport, RescueStatus, UrgencyLevel, CommentUpdate } from '../types';
import { getStoredReports, saveReports } from './mockStore';

export async function fetchReports(filters?: { status?: string; urgency?: string }): Promise<AnimalReport[]> {
  try {
    const res = await apiClient.get<AnimalReport[]>('/reports', { params: filters });
    if (Array.isArray(res.data)) {
      return res.data;
    }
    throw new Error('API did not return an array of reports');
  } catch {
    let reports = getStoredReports();
    if (filters?.status && filters.status !== 'All') {
      reports = reports.filter((r) => r.status === filters.status);
    }
    if (filters?.urgency && filters.urgency !== 'All') {
      reports = reports.filter((r) => r.urgency_level === filters.urgency?.toLowerCase());
    }
    return reports;
  }
}

export async function fetchReportById(id: string): Promise<AnimalReport> {
  try {
    const res = await apiClient.get<AnimalReport>(`/reports/${id}`);
    if (res.data && typeof res.data === 'object' && res.data.id) {
      return res.data;
    }
    throw new Error('Invalid report data returned by API');
  } catch {
    const reports = getStoredReports();
    const found = reports.find((r) => r.id === id);
    if (!found) {
      throw new Error(`Report with id ${id} not found`);
    }
    return found;
  }
}

export async function createReport(data: {
  animal_type: string;
  description: string;
  photo_url: string;
  lat: number;
  lng: number;
  urgency_level?: UrgencyLevel;
  address?: string;
  reporter_name?: string;
  reporter_phone?: string;
}): Promise<AnimalReport> {
  try {
    const res = await apiClient.post<AnimalReport>('/reports', data);
    return res.data;
  } catch {
    // Simulated AI classification if animal_type was unknown or default
    let calculatedType = data.animal_type;
    let calculatedUrgency: UrgencyLevel = data.urgency_level || 'medium';
    let detectedSpecies = 'Domestic Animal';
    let detectedInjuries: string[] = [];

    const descLower = data.description.toLowerCase();
    if (descLower.includes('dog') || descLower.includes('puppy') || descLower.includes('hound')) {
      calculatedType = 'dog';
      detectedSpecies = 'Canine';
    } else if (descLower.includes('cat') || descLower.includes('kitten')) {
      calculatedType = 'cat';
      detectedSpecies = 'Feline';
    } else if (descLower.includes('bird') || descLower.includes('hawk') || descLower.includes('pigeon')) {
      calculatedType = 'bird';
      detectedSpecies = 'Avian species';
    }

    if (descLower.includes('severe') || descLower.includes('bleeding') || descLower.includes('broken') || descLower.includes('hit by car') || descLower.includes('unconscious') || descLower.includes('trapped')) {
      calculatedUrgency = 'high';
      detectedInjuries.push('Acute physical distress detected');
    } else if (descLower.includes('limp') || descLower.includes('hungry') || descLower.includes('wound')) {
      calculatedUrgency = 'medium';
      detectedInjuries.push('Moderate mobility or nutrition issue');
    } else {
      calculatedUrgency = 'low';
      detectedInjuries.push('Stable stray condition');
    }

    const newReport: AnimalReport = {
      id: `rep-${Date.now().toString().slice(-4)}`,
      animal_type: calculatedType as any,
      description: data.description,
      photo_url: data.photo_url || 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=800&q=80',
      lat: data.lat,
      lng: data.lng,
      urgency_level: calculatedUrgency,
      status: 'Reported',
      created_at: new Date().toISOString(),
      address: data.address || `${data.lat.toFixed(4)}, ${data.lng.toFixed(4)}`,
      reporter_name: data.reporter_name || 'Anonymous Citizen',
      reporter_phone: data.reporter_phone || '',
      ai_analysis: {
        detected_species: detectedSpecies,
        confidence: 0.92,
        recommended_urgency: calculatedUrgency,
        detected_injuries: detectedInjuries,
      },
      updates: [
        {
          id: `up-${Date.now()}`,
          author: data.reporter_name || 'Citizen Reporter',
          role: 'citizen',
          text: 'Incident report filed with photos and geotag location.',
          created_at: new Date().toISOString(),
        }
      ]
    };

    const current = getStoredReports();
    const updated = [newReport, ...current];
    saveReports(updated);
    return newReport;
  }
}

export async function updateReportStatus(id: string, status: RescueStatus, volunteerName?: string): Promise<AnimalReport> {
  try {
    const res = await apiClient.patch<AnimalReport>(`/reports/${id}/status`, { status, volunteer_name: volunteerName });
    return res.data;
  } catch {
    const reports = getStoredReports();
    const idx = reports.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Report not found');

    const updated = { ...reports[idx], status };
    if (volunteerName) {
      updated.assigned_volunteer_name = volunteerName;
    }

    // Add status transition update
    const newUpdate: CommentUpdate = {
      id: `up-${Date.now()}`,
      author: volunteerName || 'Rescue Dispatcher',
      role: 'volunteer',
      text: `Status updated to: "${status}".`,
      created_at: new Date().toISOString()
    };
    updated.updates = [...(updated.updates || []), newUpdate];

    reports[idx] = updated;
    saveReports(reports);
    return updated;
  }
}

export async function acceptRescue(id: string, volunteerId: string, volunteerName: string): Promise<AnimalReport> {
  try {
    const res = await apiClient.post<AnimalReport>(`/reports/${id}/accept`, { volunteer_id: volunteerId, volunteer_name: volunteerName });
    return res.data;
  } catch {
    const reports = getStoredReports();
    const idx = reports.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Report not found');

    const updated: AnimalReport = {
      ...reports[idx],
      status: 'Accepted',
      assigned_volunteer_id: volunteerId,
      assigned_volunteer_name: volunteerName,
      updates: [
        ...(reports[idx].updates || []),
        {
          id: `up-${Date.now()}`,
          author: volunteerName,
          role: 'volunteer',
          text: `Rescue accepted by volunteer ${volunteerName}. Dispatching rescue team.`,
          created_at: new Date().toISOString()
        }
      ]
    };

    reports[idx] = updated;
    saveReports(reports);
    return updated;
  }
}

export async function addReportComment(id: string, comment: { author: string; role: 'citizen' | 'volunteer' | 'admin'; text: string }): Promise<CommentUpdate> {
  try {
    const res = await apiClient.post<CommentUpdate>(`/reports/${id}/comments`, comment);
    return res.data;
  } catch {
    const reports = getStoredReports();
    const idx = reports.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Report not found');

    const newComment: CommentUpdate = {
      id: `comm-${Date.now()}`,
      author: comment.author,
      role: comment.role,
      text: comment.text,
      created_at: new Date().toISOString(),
    };

    reports[idx].updates = [...(reports[idx].updates || []), newComment];
    saveReports(reports);
    return newComment;
  }
}

export async function reassignReport(id: string, newVolunteerName: string): Promise<AnimalReport> {
  try {
    const res = await apiClient.post<AnimalReport>(`/reports/${id}/reassign`, { volunteer_name: newVolunteerName });
    return res.data;
  } catch {
    const reports = getStoredReports();
    const idx = reports.findIndex((r) => r.id === id);
    if (idx === -1) throw new Error('Report not found');

    const updated: AnimalReport = {
      ...reports[idx],
      assigned_volunteer_name: newVolunteerName,
      updates: [
        ...(reports[idx].updates || []),
        {
          id: `up-${Date.now()}`,
          author: 'Admin Coordinator',
          role: 'admin',
          text: `Report reassigned to volunteer: ${newVolunteerName}.`,
          created_at: new Date().toISOString(),
        }
      ]
    };
    reports[idx] = updated;
    saveReports(reports);
    return updated;
  }
}
