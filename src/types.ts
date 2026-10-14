export type AnimalType = 'dog' | 'cat' | 'bird' | 'other' | 'unknown';

export type UrgencyLevel = 'low' | 'medium' | 'high';

export type RescueStatus = 'Reported' | 'Accepted' | 'In Progress' | 'Rescued' | 'Closed';

export type UserRole = 'citizen' | 'volunteer' | 'admin';

export interface CommentUpdate {
  id: string;
  author: string;
  role: UserRole;
  text: string;
  created_at: string;
}

export interface AnimalReport {
  id: string;
  animal_type: AnimalType;
  description: string;
  photo_url: string;
  lat: number;
  lng: number;
  urgency_level: UrgencyLevel;
  status: RescueStatus;
  created_at: string;
  // Extended fields for rich experience & detail views
  address?: string;
  reporter_name?: string;
  reporter_phone?: string;
  assigned_volunteer_id?: string;
  assigned_volunteer_name?: string;
  ai_analysis?: {
    detected_species?: string;
    confidence?: number;
    recommended_urgency?: UrgencyLevel;
    detected_injuries?: string[];
  };
  updates?: CommentUpdate[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  is_available?: boolean;
  rescues_completed?: number;
  token?: string;
}

export interface StatsData {
  rescued_this_month: number;
  active_volunteers: number;
  total_reports: number;
  avg_response_time_min: number;
}
