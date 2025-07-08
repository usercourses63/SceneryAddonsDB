import { useEffect, useRef, useState } from 'react';
import { useUserPreferencesStore } from '@/stores/userPreferencesStore';

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: number;
  userId?: string;
  sessionId: string;
}

export interface PerformanceMetrics {
  pageLoadTime: number;
  apiResponseTime: number;
  searchTime: number;
  downloadTime: number;
  renderTime: number;
  memoryUsage: number;
  networkSpeed: number;
}

export interface UsageStatistics {
  totalSessions: number;
  averageSessionTime: number;
  totalSearches: number;
  totalDownloads: number;
  popularSearchTerms: Record<string, number>;
  mostDownloadedAddons: Record<string, number>;
  userActions: Record<string, number>;
  errorRate: number;
  bounceRate: number;
}

class AnalyticsManager {
  private events: AnalyticsEvent[] = [];
  private sessionId: string;
  private startTime: number;
  private performanceMetrics: PerformanceMetrics;
  private enabled: boolean = true;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.performanceMetrics = {
      pageLoadTime: 0,
      apiResponseTime: 0,
      searchTime: 0,
      downloadTime: 0,
      renderTime: 0,
      memoryUsage: 0,
      networkSpeed: 0,
    };
    this.initializePerformanceMonitoring();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private initializePerformanceMonitoring() {
    // Monitor navigation timing
    if (typeof window !== 'undefined' && window.performance) {
      const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (perfData) {
        this.performanceMetrics.pageLoadTime = perfData.loadEventEnd - perfData.loadEventStart;
      }
    }

    // Monitor memory usage
    if ('memory' in window.performance) {
      const memInfo = (window.performance as any).memory;
      this.performanceMetrics.memoryUsage = memInfo.usedJSHeapSize / (1024 * 1024); // MB
    }

    // Monitor network speed
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.performanceMetrics.networkSpeed = connection.downlink || 0;
    }
  }

  setEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  track(event: string, properties?: Record<string, any>) {
    if (!this.enabled) return;

    const analyticsEvent: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
      sessionId: this.sessionId,
    };

    this.events.push(analyticsEvent);
    
    // Store in localStorage for persistence
    this.persistEvents();
    
    // Send to analytics service (placeholder)
    this.sendToAnalytics(analyticsEvent);
  }

  trackPerformance(metric: keyof PerformanceMetrics, value: number) {
    if (!this.enabled) return;
    
    this.performanceMetrics[metric] = value;
    this.track('performance_metric', {
      metric,
      value,
      sessionId: this.sessionId,
    });
  }

  trackError(error: Error, context?: string) {
    if (!this.enabled) return;
    
    this.track('error', {
      message: error.message,
      stack: error.stack,
      context,
      url: window.location.href,
    });
  }

  trackPageView(page: string) {
    if (!this.enabled) return;
    
    this.track('page_view', {
      page,
      url: window.location.href,
      timestamp: Date.now(),
    });
  }

  trackUserAction(action: string, target?: string, value?: any) {
    if (!this.enabled) return;
    
    this.track('user_action', {
      action,
      target,
      value,
    });
  }

  trackSearch(query: string, resultsCount: number, responseTime: number) {
    if (!this.enabled) return;
    
    this.track('search', {
      query,
      resultsCount,
      responseTime,
    });
    
    this.trackPerformance('searchTime', responseTime);
  }

  trackDownload(addonId: string, downloadTime: number, success: boolean) {
    if (!this.enabled) return;
    
    this.track('download', {
      addonId,
      downloadTime,
      success,
    });
    
    if (success) {
      this.trackPerformance('downloadTime', downloadTime);
    }
  }

  private persistEvents() {
    try {
      const stored = localStorage.getItem('analytics_events') || '[]';
      const storedEvents = JSON.parse(stored);
      const allEvents = [...storedEvents, ...this.events.slice(-100)]; // Keep last 100 events
      localStorage.setItem('analytics_events', JSON.stringify(allEvents));
    } catch (error) {
      console.error('Failed to persist analytics events:', error);
    }
  }

  private sendToAnalytics(event: AnalyticsEvent) {
    // Placeholder for sending to analytics service
    console.log('Analytics Event:', event);
  }

  getSessionMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }

  getUsageStatistics(): UsageStatistics {
    try {
      const stored = localStorage.getItem('analytics_events') || '[]';
      const events: AnalyticsEvent[] = JSON.parse(stored);
      
      const stats: UsageStatistics = {
        totalSessions: new Set(events.map(e => e.sessionId)).size,
        averageSessionTime: 0,
        totalSearches: events.filter(e => e.event === 'search').length,
        totalDownloads: events.filter(e => e.event === 'download').length,
        popularSearchTerms: {},
        mostDownloadedAddons: {},
        userActions: {},
        errorRate: 0,
        bounceRate: 0,
      };

      // Calculate popular search terms
      events.filter(e => e.event === 'search').forEach(event => {
        const query = event.properties?.query;
        if (query) {
          stats.popularSearchTerms[query] = (stats.popularSearchTerms[query] || 0) + 1;
        }
      });

      // Calculate most downloaded addons
      events.filter(e => e.event === 'download').forEach(event => {
        const addonId = event.properties?.addonId;
        if (addonId) {
          stats.mostDownloadedAddons[addonId] = (stats.mostDownloadedAddons[addonId] || 0) + 1;
        }
      });

      // Calculate user actions
      events.filter(e => e.event === 'user_action').forEach(event => {
        const action = event.properties?.action;
        if (action) {
          stats.userActions[action] = (stats.userActions[action] || 0) + 1;
        }
      });

      // Calculate error rate
      const totalEvents = events.length;
      const errorEvents = events.filter(e => e.event === 'error').length;
      stats.errorRate = totalEvents > 0 ? (errorEvents / totalEvents) * 100 : 0;

      return stats;
    } catch (error) {
      console.error('Failed to calculate usage statistics:', error);
      return {
        totalSessions: 0,
        averageSessionTime: 0,
        totalSearches: 0,
        totalDownloads: 0,
        popularSearchTerms: {},
        mostDownloadedAddons: {},
        userActions: {},
        errorRate: 0,
        bounceRate: 0,
      };
    }
  }

  clearData() {
    this.events = [];
    localStorage.removeItem('analytics_events');
  }
}

// Global analytics manager
const analyticsManager = new AnalyticsManager();

export const useAnalytics = () => {
  const { canCollectAnalytics } = useUserPreferencesStore();
  const [isEnabled, setIsEnabled] = useState(canCollectAnalytics());

  useEffect(() => {
    const enabled = canCollectAnalytics();
    setIsEnabled(enabled);
    analyticsManager.setEnabled(enabled);
  }, [canCollectAnalytics]);

  const track = (event: string, properties?: Record<string, any>) => {
    if (isEnabled) {
      analyticsManager.track(event, properties);
    }
  };

  const trackPerformance = (metric: keyof PerformanceMetrics, value: number) => {
    if (isEnabled) {
      analyticsManager.trackPerformance(metric, value);
    }
  };

  const trackError = (error: Error, context?: string) => {
    if (isEnabled) {
      analyticsManager.trackError(error, context);
    }
  };

  const trackPageView = (page: string) => {
    if (isEnabled) {
      analyticsManager.trackPageView(page);
    }
  };

  const trackUserAction = (action: string, target?: string, value?: any) => {
    if (isEnabled) {
      analyticsManager.trackUserAction(action, target, value);
    }
  };

  const trackSearch = (query: string, resultsCount: number, responseTime: number) => {
    if (isEnabled) {
      analyticsManager.trackSearch(query, resultsCount, responseTime);
    }
  };

  const trackDownload = (addonId: string, downloadTime: number, success: boolean) => {
    if (isEnabled) {
      analyticsManager.trackDownload(addonId, downloadTime, success);
    }
  };

  return {
    isEnabled,
    track,
    trackPerformance,
    trackError,
    trackPageView,
    trackUserAction,
    trackSearch,
    trackDownload,
    getSessionMetrics: () => analyticsManager.getSessionMetrics(),
    getUsageStatistics: () => analyticsManager.getUsageStatistics(),
    clearData: () => analyticsManager.clearData(),
  };
};

export const usePerformanceMonitor = () => {
  const { trackPerformance } = useAnalytics();
  const renderStartTime = useRef<number>(Date.now());

  useEffect(() => {
    const renderTime = Date.now() - renderStartTime.current;
    trackPerformance('renderTime', renderTime);
  }, [trackPerformance]);

  const measureApiCall = async <T>(
    apiCall: () => Promise<T>,
    endpoint: string
  ): Promise<T> => {
    const startTime = Date.now();
    try {
      const result = await apiCall();
      const responseTime = Date.now() - startTime;
      trackPerformance('apiResponseTime', responseTime);
      return result;
    } catch (error) {
      const responseTime = Date.now() - startTime;
      trackPerformance('apiResponseTime', responseTime);
      throw error;
    }
  };

  return {
    measureApiCall,
    measureRenderTime: () => {
      renderStartTime.current = Date.now();
    },
  };
};

export default analyticsManager;