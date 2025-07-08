// API Response Types based on the .NET API analysis

export interface Addon {
  id: string;
  fileName: string;
  name: string;
  compatibility: string;
  dateAdded: string;
  lastUpdated: string;
  description?: string;
  author?: string;
  fileSize?: number;
  categories?: string[];
  thumbnailUrl?: string;
  downloadUrl?: string;
  version?: string;
  rating?: number;
  downloadCount?: number;
}

export interface AddonSummary {
  id: string;
  fileName: string;
  name: string;
  compatibility: string;
  dateAdded: string;
  lastUpdated: string;
  daysSinceAdded: number;
  isRecent: boolean;
  description?: string;
  author?: string;
  fileSize?: number;
  categories?: string[];
  thumbnailUrl?: string;
  downloadUrl?: string;
  version?: string;
  rating?: number;
  downloadCount?: number;
}

export interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface AddonsSummaryStats {
  totalAddons: number;
  filteredAddons: number;
  recentAddons: number;
  compatibilityBreakdown: Record<string, number>;
  latestAddedDate?: string;
  oldestAddedDate?: string;
}

export interface AddonsListResponse {
  addons: AddonSummary[];
  pagination: PaginationInfo;
  summary: AddonsSummaryStats;
}

export interface AddonsListRequest {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  compatibility?: string;
  search?: string;
  searchTerm?: string;
  addedAfter?: string;
  addedBefore?: string;
  format?: string;
  categories?: string[];
  authors?: string[];
  dateStart?: string;
  dateEnd?: string;
  minSize?: number;
  maxSize?: number;
}

export interface CompatibilityResponse {
  fileName: string;
  compatibility: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
}

// Download Types
export interface DownloadRequest {
  count: number;
  maxConcurrency: number;
  compatibility?: string;
  forceRedownload?: boolean;
  addonIds?: string[];
}

export interface DownloadItem {
  id: string;
  fileName: string;
  name: string;
  compatibility: string;
  downloadUrl: string;
  status: DownloadStatus;
  progress: number;
  speedBytesPerSecond: number;
  totalBytes: number;
  downloadedBytes: number;
  estimatedTimeRemainingSeconds: number;
  errorMessage?: string;
  startedAt?: string;
  completedAt?: string;
  localPath?: string;
}

export enum DownloadStatus {
  Queued = 'Queued',
  Downloading = 'Downloading',
  Completed = 'Completed',
  Failed = 'Failed',
  Cancelled = 'Cancelled',
  Skipped = 'Skipped'
}

export interface DownloadResponse {
  sessionId: string;
  queuedCount: number;
  items: DownloadItem[];
  startedAt: string;
}

export interface DownloadStatusResponse {
  sessionId: string;
  status: SessionStatus;
  totalItems: number;
  completedItems: number;
  failedItems: number;
  activeDownloads: number;
  overallProgress: number;
  totalSpeedBytesPerSecond: number;
  estimatedTimeRemainingSeconds: number;
  items: DownloadItem[];
  startedAt: string;
  completedAt?: string;
}

export enum SessionStatus {
  Active = 'Active',
  Completed = 'Completed',
  CompletedWithErrors = 'CompletedWithErrors',
  Cancelled = 'Cancelled'
}

export interface DownloadStats {
  activeSessions: number;
  totalSessions: number;
  totalDownloads: number;
  completedDownloads: number;
  failedDownloads: number;
  activeDownloads: number;
  totalSpeedBytesPerSecond: number;
}

export interface DownloadFolder {
  name: string;
  path: string;
  fileCount: number;
  totalSize: number;
  files: DownloadedFile[];
}

export interface DownloadedFile {
  fileName: string;
  filePath: string;
  fileSize: number;
  createdAt: string;
}

// System Status Types
export interface ApplicationStatusReport {
  status: string;
  timestamp: string;
  systemHealth: string;
  databaseStatus: string;
  totalAddons: number;
  recentAddons: number;
  lastScrapeTime?: string;
  uptime: string;
}

// Filter and Search Types
export interface SearchFilters {
  query: string;
  compatibility: string;
  dateRange: {
    start?: Date;
    end?: Date;
  };
  sortBy: 'dateAdded' | 'name' | 'compatibility';
  sortOrder: 'asc' | 'desc';
  page: number;
  pageSize: number;
}

// API Error Types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: any;
}

// SignalR Event Types
export interface SignalREvents {
  ProgressUpdate: (progress: DownloadStatusResponse) => void;
  SessionCompleted: (sessionId: string) => void;
  SessionCancelled: (sessionId: string) => void;
  SessionFailed: (sessionId: string, errorMessage: string) => void;
  GlobalNotification: (notification: any) => void;
  StatsUpdate: (stats: any) => void;
}