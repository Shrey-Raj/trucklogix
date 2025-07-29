const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface RouteOptimizationRequest {
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_hours_used: number;
}

export interface RouteOptimizationResponse {
  id: number;
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  current_cycle_hours_used: number;
  optimized_route: string;
  estimated_travel_time: string;
  estimated_fuel_consumption: string;
  fuel_stops: Array<{ location: string; order: number }>;
  rest_break_stops: Array<{ location: string; order: number }>;
  created_at: string;
  updated_at: string;
  coordinates: {
    current: [number, number];
    pickup: [number, number];
    dropoff: [number, number];
  };
  directions: string[];
}

export interface DutyStatusChange {
  time: string;
  location: string;
  status: 'Off Duty' | 'Sleeper Berth' | 'Driving' | 'On Duty (Not Driving)';
  order?: number;
}

export interface EldLogRequest {
  driver_name: string;
  date: string;
  truck_number: string;
  trailer_number: string;
  carrier_name: string;
  home_terminal_timezone: string;
  shipping_document_numbers: string;
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  cycle_hours_used: number;
  duty_status_changes: DutyStatusChange[];
}

export interface EldLogResponse {
  id: number;
  driver_name: string;
  date: string;
  truck_number: string;
  trailer_number: string;
  carrier_name: string;
  home_terminal_timezone: string;
  shipping_document_numbers: string;
  current_location: string;
  pickup_location: string;
  dropoff_location: string;
  cycle_hours_used: number;
  log_sheet: string;
  remaining_hours: {
    driving_hours: number;
    on_duty_hours: number;
  };
  duty_status_changes: DutyStatusChange[];
  created_at: string;
  updated_at: string;
}

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new ApiError(response.status, errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

export const routeApi = {
  optimize: async (data: RouteOptimizationRequest): Promise<RouteOptimizationResponse> => {
    return apiRequest('/routes/optimize/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getHistory: async (): Promise<RouteOptimizationResponse[]> => {
    return apiRequest('/routes/history/');
  },

  getDetail: async (id: number): Promise<RouteOptimizationResponse> => {
    return apiRequest(`/routes/${id}/`);
  },
};

export const eldLogApi = {
  generate: async (data: EldLogRequest): Promise<EldLogResponse> => {
    return apiRequest('/eld-logs/generate/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getHistory: async (): Promise<EldLogResponse[]> => {
    return apiRequest('/eld-logs/history/');
  },

  getDetail: async (id: number): Promise<EldLogResponse> => {
    return apiRequest(`/eld-logs/${id}/`);
  },

  delete: async (id: number): Promise<void> => {
    return apiRequest(`/eld-logs/${id}/delete/`, {
      method: 'DELETE',
    });
  },
};