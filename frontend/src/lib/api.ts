import { supabase } from './supabase';

// API base URL - should match your backend URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000';

// Standard API response type
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp?: string;
}

// API error class
export class ApiError extends Error {
  constructor(
    public status: number,
    public message: string,
    public error?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Get authentication token
const getAuthToken = async (): Promise<string | null> => {
  const { data: { session } } = await supabase.auth.getSession();
  return session?.access_token || null;
};

// Base API client
class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = await getAuthToken();
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
      const data: ApiResponse<T> = await response.json();

      if (!response.ok) {
        throw new ApiError(
          response.status,
          data.message || `HTTP ${response.status}`,
          data.error
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      // Network or parsing error
      throw new ApiError(
        0,
        'Network error or invalid response',
        'network_error'
      );
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

// Create API client instance
export const apiClient = new ApiClient();

// API endpoints
export const API_ENDPOINTS = {
  // Health check
  health: '/health',
  
  // Journal entries
  dumps: '/api/dumps',
  dump: (id: string) => `/api/dumps/${id}`,
  
  // User management
  userProfile: '/api/users/profile',
  userExport: '/api/users/export-data',
  userDelete: '/api/users/delete-account',
  userToggleNotifications: '/api/users/toggle-notifications',
  userUpdateQuestions: '/api/users/update-questions',
  userToggleFavorite: '/api/users/toggle-favorite',
  userRequestPasswordReset: '/api/users/request-password-reset',
  
  // AI features
  aiAnalyze: '/api/ai/analyze',
  aiAnalyzeDump: '/api/ai/analyze-dump',
  aiInsights: '/api/ai/insights',
  aiWeeklySummary: '/api/ai/summary/weekly',
  aiReprocess: '/api/ai/reprocess',
  aiMoodTrends: '/api/ai/trends/mood',
  aiAnalyzeEntry: '/api/ai/analyze-entry',
  
  // Statistics
  statsStartTrial: '/api/stats/start-trial',
  statsMoodHistory: '/api/stats/mood-history',
  statsKeywords: '/api/stats/keywords',
  statsWeekly: '/api/stats/weekly',
  
  // Stripe payments
  stripeCreateCheckout: '/api/stripe/create-checkout-session',
  stripeSubscriptionStatus: '/api/stripe/subscription-status',
  stripeCancelSubscription: '/api/stripe/cancel-subscription',
  stripeResumeSubscription: '/api/stripe/resume-subscription',
  stripeCustomerPortal: '/api/stripe/create-customer-portal-session',
  
  // Notifications
  notificationsDailyCheck: '/api/notifications/daily-check',
  notificationsToken: '/api/notifications/token',
  notificationsTest: '/api/notifications/test',
  
  // Weekly stats
  weeklyStats: '/api/weekly-stats/weekly-stats',
} as const;

// Type-safe API functions
export const api = {
  // Health check
  health: () => apiClient.get(API_ENDPOINTS.health),
  
  // Journal entries
  getDumps: () => apiClient.get(API_ENDPOINTS.dumps),
  getDump: (id: string) => apiClient.get(API_ENDPOINTS.dump(id)),
  createDump: (data: { content: string; mood?: string; tags?: string[] }) =>
    apiClient.post(API_ENDPOINTS.dumps, data),
  updateDump: (id: string, data: { content: string; mood?: string; tags?: string[] }) =>
    apiClient.put(API_ENDPOINTS.dump(id), data),
  deleteDump: (id: string) => apiClient.delete(API_ENDPOINTS.dump(id)),
  
  // User management
  getUserProfile: () => apiClient.get(API_ENDPOINTS.userProfile),
  updateUserProfile: (data: { name?: string; email?: string }) =>
    apiClient.put(API_ENDPOINTS.userProfile, data),
  exportUserData: () => apiClient.get(API_ENDPOINTS.userExport),
  deleteUserAccount: () => apiClient.post(API_ENDPOINTS.userDelete),
  toggleNotifications: (enabled: boolean) =>
    apiClient.post(API_ENDPOINTS.userToggleNotifications, { enabled }),
  updateQuestions: (entryId: string, questions: string[]) =>
    apiClient.post(API_ENDPOINTS.userUpdateQuestions, { entryId, questions }),
  toggleFavorite: (entryId: string, question: string) =>
    apiClient.post(API_ENDPOINTS.userToggleFavorite, { entryId, question }),
  requestPasswordReset: (email: string) =>
    apiClient.post(API_ENDPOINTS.userRequestPasswordReset, { email }),
  
  // AI features
  analyzeText: (text: string) => apiClient.post(API_ENDPOINTS.aiAnalyze, { text }),
  analyzeDump: (content: string) => apiClient.post(API_ENDPOINTS.aiAnalyzeDump, { content }),
  generateInsights: (entries: any[]) => apiClient.post(API_ENDPOINTS.aiInsights, { entries }),
  getWeeklySummary: () => apiClient.get(API_ENDPOINTS.aiWeeklySummary),
  reprocessDumps: (dumpIds: string[]) => apiClient.post(API_ENDPOINTS.aiReprocess, { dumpIds }),
  getMoodTrends: (period?: string) => apiClient.get(`${API_ENDPOINTS.aiMoodTrends}?period=${period || 'week'}`),
  analyzeEntry: (content: string) => apiClient.post(API_ENDPOINTS.aiAnalyzeEntry, { content }),
  
  // Statistics
  startTrial: () => apiClient.post(API_ENDPOINTS.statsStartTrial),
  getMoodHistory: () => apiClient.get(API_ENDPOINTS.statsMoodHistory),
  getKeywords: () => apiClient.get(API_ENDPOINTS.statsKeywords),
  getWeeklyStats: () => apiClient.get(API_ENDPOINTS.statsWeekly),
  
  // Stripe payments
  createCheckoutSession: () => apiClient.post(API_ENDPOINTS.stripeCreateCheckout),
  getSubscriptionStatus: () => apiClient.get(API_ENDPOINTS.stripeSubscriptionStatus),
  cancelSubscription: () => apiClient.post(API_ENDPOINTS.stripeCancelSubscription),
  resumeSubscription: () => apiClient.post(API_ENDPOINTS.stripeResumeSubscription),
  createCustomerPortalSession: () => apiClient.post(API_ENDPOINTS.stripeCustomerPortal),
  
  // Notifications
  checkDailyNotifications: () => apiClient.get(API_ENDPOINTS.notificationsDailyCheck),
  saveNotificationToken: (token: string) => apiClient.post(API_ENDPOINTS.notificationsToken, { token }),
  testNotification: (userId?: string, token?: string) => 
    apiClient.post(API_ENDPOINTS.notificationsTest, { userId, token }),
  
  // Weekly stats
  getWeeklyStatsData: () => apiClient.get(API_ENDPOINTS.weeklyStats),
};

export default api; 