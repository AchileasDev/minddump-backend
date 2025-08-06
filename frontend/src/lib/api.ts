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

// NOTE: All API calls now require the access token to be passed in from useAuth()

// Base API client
class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    accessToken?: string
  ): Promise<ApiResponse<T>> {
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
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
  async get<T>(endpoint: string, accessToken?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, accessToken);
  }

  // POST request
  async post<T>(endpoint: string, body?: any, accessToken?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }, accessToken);
  }

  // PUT request
  async put<T>(endpoint: string, body?: any, accessToken?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }, accessToken);
  }

  // DELETE request
  async delete<T>(endpoint: string, accessToken?: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' }, accessToken);
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

export interface ReflectionQuestion {
  id: string;
  text: string;
}

export interface ReflectionAnswer {
  questionId: string;
  userId: string;
  answer: string;
  timestamp: string;
}

// Type-safe API functions
// NOTE: All functions now require accessToken as a parameter
export const api = {
  // Health check
  health: (accessToken?: string) => apiClient.get(API_ENDPOINTS.health, accessToken),
  
  // Journal entries
  getDumps: (accessToken?: string) => apiClient.get(API_ENDPOINTS.dumps, accessToken),
  getDump: (id: string, accessToken?: string) => apiClient.get(API_ENDPOINTS.dump(id), accessToken),
  createDump: (data: { content: string; mood?: string; tags?: string[] }, accessToken?: string) =>
    apiClient.post(API_ENDPOINTS.dumps, data, accessToken),
  updateDump: (id: string, data: { content: string; mood?: string; tags?: string[] }, accessToken?: string) =>
    apiClient.put(API_ENDPOINTS.dump(id), data, accessToken),
  deleteDump: (id: string, accessToken?: string) => apiClient.delete(API_ENDPOINTS.dump(id), accessToken),
  
  // User management
  getUserProfile: (accessToken?: string) => apiClient.get(API_ENDPOINTS.userProfile, accessToken),
  updateUserProfile: (data: { name?: string; email?: string }, accessToken?: string) =>
    apiClient.put(API_ENDPOINTS.userProfile, data, accessToken),
  exportUserData: (accessToken?: string) => apiClient.get(API_ENDPOINTS.userExport, accessToken),
  deleteUserAccount: (accessToken?: string) => apiClient.post(API_ENDPOINTS.userDelete, undefined, accessToken),
  toggleNotifications: (enabled: boolean, accessToken?: string) =>
    apiClient.post(API_ENDPOINTS.userToggleNotifications, { enabled }, accessToken),
  updateQuestions: (entryId: string, questions: string[], accessToken?: string) =>
    apiClient.post(API_ENDPOINTS.userUpdateQuestions, { entryId, questions }, accessToken),
  toggleFavorite: (entryId: string, question: string, accessToken?: string) =>
    apiClient.post(API_ENDPOINTS.userToggleFavorite, { entryId, question }, accessToken),
  requestPasswordReset: (email: string, accessToken?: string) =>
    apiClient.post(API_ENDPOINTS.userRequestPasswordReset, { email }, accessToken),
  
  // AI features
  analyzeText: (text: string, accessToken?: string) => apiClient.post(API_ENDPOINTS.aiAnalyze, { text }, accessToken),
  analyzeDump: (content: string, accessToken?: string) => apiClient.post(API_ENDPOINTS.aiAnalyzeDump, { content }, accessToken),
  generateInsights: (entries: any[], accessToken?: string) => apiClient.post(API_ENDPOINTS.aiInsights, { entries }, accessToken),
  getWeeklySummary: (accessToken?: string) => apiClient.get(API_ENDPOINTS.aiWeeklySummary, accessToken),
  reprocessDumps: (dumpIds: string[], accessToken?: string) => apiClient.post(API_ENDPOINTS.aiReprocess, { dumpIds }, accessToken),
  getMoodTrends: (period?: string, accessToken?: string) => apiClient.get(`${API_ENDPOINTS.aiMoodTrends}?period=${period || 'week'}`, accessToken),
  analyzeEntry: (content: string, accessToken?: string) => apiClient.post(API_ENDPOINTS.aiAnalyzeEntry, { content }, accessToken),
  
  // Statistics
  startTrial: (accessToken?: string) => apiClient.post(API_ENDPOINTS.statsStartTrial, undefined, accessToken),
  getMoodHistory: (accessToken?: string) => apiClient.get(API_ENDPOINTS.statsMoodHistory, accessToken),
  getKeywords: (accessToken?: string) => apiClient.get(API_ENDPOINTS.statsKeywords, accessToken),
  getWeeklyStats: (accessToken?: string) => apiClient.get(API_ENDPOINTS.statsWeekly, accessToken),
  
  // Stripe payments
  createCheckoutSession: async (accessToken: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/api/stripe/checkout-session`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to create checkout session');
    const data = await response.json();
    return data.url;
  },
  createCustomerPortal: async (accessToken: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/api/stripe/customer-portal`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to create customer portal');
    const data = await response.json();
    return data.url;
  },
  getSubscriptionStatus: async (accessToken: string): Promise<'active' | 'inactive'> => {
    const response = await fetch(`${API_BASE_URL}/api/stripe/status`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to get subscription status');
    const data = await response.json();
    return data.status;
  },
  cancelSubscription: (accessToken?: string) => apiClient.post(API_ENDPOINTS.stripeCancelSubscription, undefined, accessToken),
  resumeSubscription: (accessToken?: string) => apiClient.post(API_ENDPOINTS.stripeResumeSubscription, undefined, accessToken),
  createCustomerPortalSession: (accessToken?: string) => apiClient.post(API_ENDPOINTS.stripeCustomerPortal, undefined, accessToken),
  
  // Notifications
  checkDailyNotifications: (accessToken?: string) => apiClient.get(API_ENDPOINTS.notificationsDailyCheck, accessToken),
  saveNotificationToken: (token: string, accessToken?: string) => apiClient.post(API_ENDPOINTS.notificationsToken, { token }, accessToken),
  testNotification: (userId?: string, token?: string, accessToken?: string) => 
    apiClient.post(API_ENDPOINTS.notificationsTest, { userId, token }, accessToken),
  
  // Weekly stats
  getWeeklyStatsData: (accessToken?: string) => apiClient.get(API_ENDPOINTS.weeklyStats, accessToken),
  getWeeklyMoodStats: async (accessToken: string): Promise<MoodStat[]> => {
    const response = await fetch(`${API_BASE_URL}/api/users/mood-history`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch weekly mood stats');
    const data = await response.json();
    return data.stats || [];
  },
  getGeminiInsights: async (text: string, accessToken: string): Promise<GeminiInsights> => {
    const response = await fetch(`${API_BASE_URL}/api/insights/analyze-dump`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error('Failed to fetch Gemini insights');
    return await response.json();
  },
  getFavorites: async (accessToken: string): Promise<string[]> => {
    const response = await fetch(`${API_BASE_URL}/api/favorites`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch favorites');
    const data = await response.json();
    return data.favorites || [];
  },
  addFavorite: async (questionId: string, accessToken: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/favorites`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ questionId }),
    });
    if (!response.ok) throw new Error('Failed to add favorite');
  },
  removeFavorite: async (questionId: string, accessToken: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/favorites/${questionId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to remove favorite');
  },
  getRecentInsights: async (accessToken: string): Promise<GeminiInsightsWithDate[]> => {
    const response = await fetch(`${API_BASE_URL}/api/users/recent-insights`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch recent insights');
    const data = await response.json();
    return data.insights || [];
  },
  getReflectionQuestions: async (accessToken: string): Promise<ReflectionQuestion[]> => {
    const response = await fetch(`${API_BASE_URL}/api/reflections`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch reflection questions');
    const data = await response.json();
    return data.questions || [];
  },
  saveReflectionAnswer: async (questionId: string, answer: string, accessToken: string): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/reflections/answer`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ questionId, answer }),
    });
    if (!response.ok) throw new Error('Failed to save reflection answer');
  },
  getReflectionAnswers: async (accessToken: string): Promise<ReflectionAnswer[]> => {
    const response = await fetch(`${API_BASE_URL}/api/reflections/answers`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) throw new Error('Failed to fetch reflection answers');
    const data = await response.json();
    return data.answers || [];
  },
};

export default api; 