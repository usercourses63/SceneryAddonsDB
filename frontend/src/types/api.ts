// API Response Types
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Addon Types
export interface Addon {
  id: string;
  name: string;
  fileName: string;
  compatibility: 'MSFS 2020' | 'MSFS 2024' | 'MSFS 2020/2024';
  dateAdded: string;
  downloadUrl: string;
  magnetLink?: string;
  size?: number;
  description?: string;
  author?: string;
  version?: string;
  category?: string;
  tags?: string[];
}

export interface AddonStats {
  totalAddons: number;
  recentAddons: number;
  compatibility2020: number;
  compatibility2024: number;
  compatibilityBoth: number;
  dateRange: {
    earliest: string;
    latest: string;
  };
}

// Download Types
export interface DownloadItem {
  id: string;
  addonId: string;
  addonName: string;
  fileName: string;
  status: 'Queued' | 'Downloading' | 'Completed' | 'Failed' | 'Paused';
  progress: number;
  downloadedBytes: number;
  totalBytes: number;
  downloadSpeed: number;
  eta?: number;
  startTime: string;
  endTime?: string;
  errorMessage?: string;
}

export interface DownloadStats {
  totalDownloads: number;
  activeDownloads: number;
  completedDownloads: number;
  failedDownloads: number;
  totalBytesDownloaded: number;
  averageDownloadSpeed: number;
}

export interface DownloadSession {
  id: string;
  name: string;
  status: 'Active' | 'Completed' | 'Failed';
  downloads: DownloadItem[];
  startTime: string;
  endTime?: string;
  totalItems: number;
  completedItems: number;
  failedItems: number;
}

// System Types
export interface SystemHealth {
  status: 'Healthy' | 'Warning' | 'Critical';
  timestamp: string;
  services: {
    database: 'Connected' | 'Disconnected';
    api: 'Running' | 'Stopped';
    scraper: 'Active' | 'Idle' | 'Error';
  };
  performance: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
  };
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'Info' | 'Warning' | 'Error' | 'Debug';
  message: string;
  source: string;
  details?: any;
}

// Search and Filter Types
export interface SearchFilters {
  query?: string;
  compatibility?: string;
  category?: string;
  author?: string;
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'name' | 'dateAdded' | 'size';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchParams extends SearchFilters {
  page?: number;
  pageSize?: number;
}
