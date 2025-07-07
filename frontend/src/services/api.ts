import type {
  Addon,
  AddonStats,
  DownloadItem,
  DownloadStats,
  DownloadSession,
  SystemHealth,
  LogEntry,
  PaginatedResponse,
  SearchParams,
} from '../types/api';

const API_BASE_URL = 'http://localhost:5269/api';

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  // Health endpoint
  async getHealth(): Promise<SystemHealth> {
    return this.request<SystemHealth>('/health');
  }

  // Addon endpoints
  async getAddons(params: SearchParams = {}): Promise<PaginatedResponse<Addon>> {
    const searchParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/addons?${queryString}` : '/addons';
    
    return this.request<PaginatedResponse<Addon>>(endpoint);
  }

  async getAddon(id: string): Promise<Addon> {
    return this.request<Addon>(`/addons/${id}`);
  }

  async getAddonStats(): Promise<AddonStats> {
    return this.request<AddonStats>('/addons/stats');
  }

  async getLatestAddons(count = 10): Promise<Addon[]> {
    return this.request<Addon[]>(`/addons/latest?count=${count}`);
  }

  // Download endpoints
  async startDownload(addonId: string): Promise<{ success: boolean; message: string }> {
    return this.request<{ success: boolean; message: string }>(`/downloads/addon/${addonId}`, {
      method: 'POST',
    });
  }

  async getDownloads(): Promise<DownloadItem[]> {
    return this.request<DownloadItem[]>('/downloads');
  }

  async getDownloadStats(): Promise<DownloadStats> {
    return this.request<DownloadStats>('/downloads/stats');
  }

  async getDownloadSessions(): Promise<DownloadSession[]> {
    return this.request<DownloadSession[]>('/downloads/sessions');
  }

  async pauseDownload(downloadId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/downloads/${downloadId}/pause`, {
      method: 'POST',
    });
  }

  async resumeDownload(downloadId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/downloads/${downloadId}/resume`, {
      method: 'POST',
    });
  }

  async cancelDownload(downloadId: string): Promise<{ success: boolean }> {
    return this.request<{ success: boolean }>(`/downloads/${downloadId}/cancel`, {
      method: 'DELETE',
    });
  }

  // Download session management (matching actual API endpoints)
  async pauseDownloadSession(sessionId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/downloads/sessions/${sessionId}/pause`, {
      method: 'POST',
    });
  }

  async cancelDownloadSession(sessionId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/downloads/sessions/${sessionId}/cancel`, {
      method: 'POST',
    });
  }

  async getDownloadSessionStatus(sessionId: string): Promise<DownloadSession> {
    return this.request<DownloadSession>(`/downloads/sessions/${sessionId}/status`);
  }

  async getDownloadFolders(): Promise<{ folders: string[] }> {
    return this.request<{ folders: string[] }>('/downloads/folders');
  }

  // Reports endpoints
  async getStatusReport(): Promise<any> {
    return this.request<any>('/reports/status');
  }

  async displayStatusToConsole(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/reports/status/console', {
      method: 'POST',
    });
  }

  // Scraper endpoints
  async triggerScrapeRefresh(token: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/scraper/refresh', {
      method: 'POST',
      headers: {
        'X-Refresh-Token': token,
      },
    });
  }

  // System endpoints
  async getSystemLogs(params: { level?: string; limit?: number } = {}): Promise<LogEntry[]> {
    const searchParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        searchParams.append(key, value.toString());
      }
    });

    const queryString = searchParams.toString();
    const endpoint = queryString ? `/system/logs?${queryString}` : '/system/logs';

    return this.request<LogEntry[]>(endpoint);
  }
}

export const apiClient = new ApiClient();
