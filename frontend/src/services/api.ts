import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';
import {
  AddonsListRequest,
  AddonsListResponse,
  AddonSummary,
  CompatibilityResponse,
  HealthResponse,
  DownloadRequest,
  DownloadResponse,
  DownloadStatusResponse,
  DownloadStats,
  DownloadFolder,
  ApplicationStatusReport,
  ApiError,
} from '@/types/api';

class ApiClient {
  private client: AxiosInstance;

  constructor(baseURL: string = '/api') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor
    this.client.interceptors.request.use(
      (config) => {
        // Add any auth tokens or logging here
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('Request interceptor error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error: AxiosError) => {
        const apiError = this.handleApiError(error);
        
        // Show toast for errors (except for certain cases)
        if (apiError.status >= 500) {
          toast.error('Server error occurred. Please try again.');
        } else if (apiError.status === 404) {
          // Don't show toast for 404s as they might be expected
        } else if (apiError.status >= 400) {
          toast.error(apiError.message || 'Request failed');
        }

        return Promise.reject(apiError);
      }
    );
  }

  private handleApiError(error: AxiosError): ApiError {
    const status = error.response?.status || 0;
    const responseData = error.response?.data as any;
    const message = responseData?.error ||
                   responseData?.message ||
                   error.message ||
                   'An unexpected error occurred';

    return {
      message,
      status,
      code: error.code,
      details: error.response?.data,
    };
  }

  // Addon API methods
  async getAddons(params: AddonsListRequest = {}): Promise<AddonsListResponse> {
    const response = await this.client.get('/addons', { params });
    return response.data;
  }

  async getLatestAddons(count: number = 10): Promise<AddonSummary[]> {
    const response = await this.client.get('/addons/latest', {
      params: { count },
    });
    return response.data;
  }

  async getAddonCompatibility(fileName: string): Promise<CompatibilityResponse> {
    const response = await this.client.get('/addons/compatibility', {
      params: { fileName },
    });
    return response.data;
  }

  async getAddonStats(): Promise<{ totalAddons: number; lastUpdated: string }> {
    const response = await this.client.get('/addons/stats');
    return response.data;
  }

  async getAuthors(): Promise<string[]> {
    const response = await this.client.get('/addons/authors');
    return response.data;
  }

  async getCategories(): Promise<string[]> {
    const response = await this.client.get('/addons/categories');
    return response.data;
  }

  // Download API methods
  async startDownloadSession(request: DownloadRequest): Promise<DownloadResponse> {
    const response = await this.client.post('/downloads/start', request);
    return response.data;
  }

  async downloadAddon(addonId: string): Promise<DownloadResponse> {
    const response = await this.client.post(`/downloads/addon/${addonId}`);
    return response.data;
  }

  async getDownloadSessions(): Promise<DownloadStatusResponse[]> {
    const response = await this.client.get('/downloads/sessions');
    return response.data;
  }

  async getDownloadSessionStatus(sessionId: string): Promise<DownloadStatusResponse> {
    const response = await this.client.get(`/downloads/sessions/${sessionId}/status`);
    return response.data;
  }

  async pauseDownloadSession(sessionId: string): Promise<void> {
    await this.client.post(`/downloads/sessions/${sessionId}/pause`);
  }

  async cancelDownloadSession(sessionId: string): Promise<void> {
    await this.client.post(`/downloads/sessions/${sessionId}/cancel`);
  }

  async resumeDownloadSession(sessionId: string): Promise<void> {
    await this.client.post(`/downloads/sessions/${sessionId}/resume`);
  }

  async pauseDownloadItem(sessionId: string, itemId: string): Promise<void> {
    await this.client.post(`/downloads/sessions/${sessionId}/items/${itemId}/pause`);
  }

  async resumeDownloadItem(sessionId: string, itemId: string): Promise<void> {
    await this.client.post(`/downloads/sessions/${sessionId}/items/${itemId}/resume`);
  }

  async cancelDownloadItem(sessionId: string, itemId: string): Promise<void> {
    await this.client.post(`/downloads/sessions/${sessionId}/items/${itemId}/cancel`);
  }

  async clearSessionsHistory(): Promise<void> {
    await this.client.delete('/downloads/sessions');
  }

  async getDownloadStats(): Promise<DownloadStats> {
    const response = await this.client.get('/downloads/stats');
    return response.data;
  }

  async getDownloadFolders(): Promise<DownloadFolder[]> {
    const response = await this.client.get('/downloads/folders');
    return response.data;
  }

  // System API methods
  async getHealth(): Promise<HealthResponse> {
    const response = await this.client.get('/health');
    return response.data;
  }

  async getStatusReport(): Promise<ApplicationStatusReport> {
    const response = await this.client.get('/reports/status');
    return response.data;
  }

  async triggerConsoleReport(): Promise<void> {
    await this.client.post('/reports/status/console');
  }

  async triggerManualScrape(token: string): Promise<void> {
    await this.client.post('/scraper/refresh', {}, {
      headers: {
        'X-Refresh-Token': token,
      },
    });
  }
}

// Create singleton instance
export const apiClient = new ApiClient();

// Export individual API modules for better organization
export const addonApi = {
  getAddons: (params?: AddonsListRequest) => apiClient.getAddons(params),
  getLatestAddons: (count?: number) => apiClient.getLatestAddons(count),
  getCompatibility: (fileName: string) => apiClient.getAddonCompatibility(fileName),
  getStats: () => apiClient.getAddonStats(),
  getAuthors: () => apiClient.getAuthors(),
  getCategories: () => apiClient.getCategories(),
};

export const downloadApi = {
  startSession: (request: DownloadRequest) => apiClient.startDownloadSession(request),
  downloadAddon: (addonId: string) => apiClient.downloadAddon(addonId),
  getSessions: () => apiClient.getDownloadSessions(),
  getSessionStatus: (sessionId: string) => apiClient.getDownloadSessionStatus(sessionId),
  pauseSession: (sessionId: string) => apiClient.pauseDownloadSession(sessionId),
  resumeSession: (sessionId: string) => apiClient.resumeDownloadSession(sessionId),
  cancelSession: (sessionId: string) => apiClient.cancelDownloadSession(sessionId),
  pauseItem: (sessionId: string, itemId: string) => apiClient.pauseDownloadItem(sessionId, itemId),
  resumeItem: (sessionId: string, itemId: string) => apiClient.resumeDownloadItem(sessionId, itemId),
  cancelItem: (sessionId: string, itemId: string) => apiClient.cancelDownloadItem(sessionId, itemId),
  clearHistory: () => apiClient.clearSessionsHistory(),
  getStats: () => apiClient.getDownloadStats(),
  getFolders: () => apiClient.getDownloadFolders(),
};

export const systemApi = {
  getHealth: () => apiClient.getHealth(),
  getStatusReport: () => apiClient.getStatusReport(),
  triggerConsoleReport: () => apiClient.triggerConsoleReport(),
  triggerScrape: (token: string) => apiClient.triggerManualScrape(token),
};