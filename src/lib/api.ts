const API_BASE_URL = "http://127.0.0.1:8000";

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE" | "PATCH";
  body?: unknown;
  headers?: Record<string, string>;
  requiresAuth?: boolean;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

function getAuthToken(): string | null {
  return localStorage.getItem("token");
}

export async function api<T>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { method = "GET", body, headers = {}, requiresAuth = true } = options;

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (requiresAuth) {
    const token = getAuthToken();
    if (token) {
      requestHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });

    let data: T | null = null;
    
    // Try to parse JSON response
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        data = await response.json();
      } catch {
        // Response body might be empty
      }
    }

    if (!response.ok) {
      const errorMessage = 
        (data as { message?: string; detail?: string })?.message ||
        (data as { message?: string; detail?: string })?.detail ||
        `Request failed with status ${response.status}`;
      
      return {
        data: null,
        error: errorMessage,
        status: response.status,
      };
    }

    return {
      data,
      error: null,
      status: response.status,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Network error occurred",
      status: 0,
    };
  }
}

// Auth API calls
export const authApi = {
  login: (email: string, password: string) =>
    api<{ access_token: string }>("/auth/login", {
      method: "POST",
      body: { email, password },
      requiresAuth: false,
    }),

  signup: (email: string, password: string) =>
    api<{ message: string }>("/auth/signup", {
      method: "POST",
      body: { email, password },
      requiresAuth: false,
    }),

  requestPasswordReset: (email: string) =>
    api<{ message: string }>("/auth/request-password-reset", {
      method: "POST",
      body: { email },
      requiresAuth: false,
    }),

  confirmPasswordReset: (token: string, newPassword: string) =>
    api<{ message: string }>("/auth/confirm-password-reset", {
      method: "POST",
      body: { token, newPassword },
      requiresAuth: false,
    }),
};

// Dashboard API calls
export const dashboardApi = {
  getStats: () =>
    api<{ totalLeads: number; approvedLeads: number; invitesSent: number }>(
      "/dashboard/stats"
    ),
};

// Pipeline API calls
export const pipelineApi = {
  start: () =>
    api<{ message: string }>("/pipeline/start", {
      method: "POST",
    }),

  getStatus: () =>
    api<{
      jobType: "acquisition" | "evaluation" | "message_generation" | null;
      status: "pending" | "running" | "completed" | "failed" | null;
    }>("/pipeline/status"),
};

// Leads API calls
export const leadsApi = {
  getAll: () =>
    api<Array<Record<string, unknown>>>("/leads/all"),

  getApproved: () =>
    api<Array<Record<string, unknown>>>("/leads/approved"),

  getReady: () =>
    api<Array<Record<string, unknown>>>("/leads/ready"),
};

// Schedule API calls
export interface Schedule {
  _id: string;
  type: "one_time" | "recurring";
  cron?: string;
  runAt?: string;
}

export const scheduleApi = {
  create: (data: { type: "one_time"; runAt: string } | { type: "recurring"; cron: string }) =>
    api<{ message: string; schedule_id: string }>("/pipeline/schedule", {
      method: "POST",
      body: data,
    }),

  list: () =>
    api<Schedule[]>("/pipeline/schedules"),

  delete: (scheduleId: string) =>
    api<{ message: string }>(`/pipeline/schedule/${scheduleId}`, {
      method: "DELETE",
    }),
};

// Invite API calls
export const inviteApi = {
  send: (leadId: string, editedMessage: string) =>
    api<{ message: string }>("/invite/send", {
      method: "POST",
      body: { leadId, editedMessage },
    }),
};

// User API calls
export const userApi = {
  getProfile: () =>
    api<{ fullName: string; email: string; company: string }>("/auth/me"),

  updateProfile: (data: { fullName: string; company: string }) =>
    api<{ message: string }>("/auth/update-profile", {
      method: "PUT",
      body: data,
    }),

  sendResetLink: () =>
    api<{ message: string }>("/user/send-reset-link", {
      method: "POST",
    }),
};
