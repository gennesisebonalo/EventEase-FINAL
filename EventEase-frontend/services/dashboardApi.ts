import axios from 'axios';

function resolveApiBaseUrl(): string {
  // Web (browser)
  if (typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.host}/api`;
  }
  // Native (Expo / Node)
  const envUrl = process.env.EXPO_PUBLIC_API_URL || process.env.API_URL;
  if (envUrl) {
    const trimmed = envUrl.replace(/\/$/, '');
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }
  // Fallback: update to your LAN IP if needed
  return 'http://192.168.1.17:8000/api';
}

const API_BASE_URL = resolveApiBaseUrl();

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('[API] Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('[API] Response error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Types
export interface DashboardOverview {
  ongoing_events: number;
  upcoming_events: number;
  completed_events: number;
  total_registrations: number;
  last_updated: string;
}

export interface Event {
  id: number;
  title: string;
  description: string;
  location: string;
  start_time: string;
  end_time: string;
  date: string;
  time: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  attendees_count: number;
  created_at: string;
  updated_at: string;
}

export interface PaginationInfo {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
}

export interface EventsResponse {
  events: Event[];
  pagination: PaginationInfo;
}

export interface Attendee {
  id: number;
  name: string | null;
  education_level: string | null;
  year_level: string | null;
  block: string | null;
  status: string;
  checked_in_at: string | null;
}

export interface EventAttendeesResponse {
  event: { id: number; title: string };
  attendees: Attendee[];
}

export interface CreateEventData {
  title: string;
  description?: string;
  category_id: number;
  venue_id: number;
  start_time: string;
  end_time: string;
  status?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Venue {
  id: number;
  name: string;
  capacity?: number;
  location?: string;
}

// API functions
export const dashboardApi = {
  // Get dashboard overview data
  getDashboardOverview: async (): Promise<DashboardOverview> => {
    const response = await apiClient.get('/dashboard/overview');
    return response.data.data;
  },

  // Get events list with pagination and filtering
  getEventsList: async (params?: {
    search?: string;
    status?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
  }): Promise<EventsResponse> => {
    const response = await apiClient.get('/events/list', { params });
    return response.data.data;
  },

  // Create a new event
  createEvent: async (eventData: CreateEventData): Promise<Event> => {
    const response = await apiClient.post('/events/create', eventData);
    return response.data.data;
  },

  // Mark event as completed
  markEventCompleted: async (eventId: number): Promise<Event> => {
    const response = await apiClient.patch(`/events/${eventId}/complete`);
    return response.data.data;
  },

  // Get attendees for a specific event
  getEventAttendees: async (eventId: number): Promise<EventAttendeesResponse> => {
    const response = await apiClient.get(`/events/${eventId}/attendees`);
    return response.data.data;
  },

  // Delete event (if needed)
  deleteEvent: async (eventId: number): Promise<void> => {
    await apiClient.delete(`/events/${eventId}`);
  },

  // Get categories list
  getCategories: async (): Promise<Category[]> => {
    try {
      const response = await apiClient.get('/categories');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      // Return fallback data if API fails
      return [
        { id: 1, name: 'Academic' },
        { id: 2, name: 'Sports' },
        { id: 3, name: 'Cultural' },
        { id: 4, name: 'Social' }
      ];
    }
  },

  // Get venues list
  getVenues: async (): Promise<Venue[]> => {
    try {
      const response = await apiClient.get('/venues');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error fetching venues:', error);
      // Return fallback data if API fails
      return [
        { id: 1, name: 'Main Auditorium', capacity: 500 },
        { id: 2, name: 'Conference Room A', capacity: 50 },
        { id: 3, name: 'Gymnasium', capacity: 200 },
        { id: 4, name: 'Library Hall', capacity: 100 }
      ];
    }
  },
};

export default dashboardApi;
