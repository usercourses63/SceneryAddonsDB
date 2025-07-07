import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

export class SignalRService {
  private connection: HubConnection | null = null;
  private listeners: Map<string, Set<(...args: any[]) => void>> = new Map();

  async connect(): Promise<void> {
    if (this.connection?.state === 'Connected') {
      return;
    }

    this.connection = new HubConnectionBuilder()
      .withUrl('http://localhost:5269/hubs/downloadProgress')
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Information)
      .build();

    try {
      await this.connection.start();
      console.log('SignalR connected successfully');
      
      // Set up event listeners
      this.setupEventListeners();
    } catch (error) {
      console.error('SignalR connection failed:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
      this.listeners.clear();
    }
  }

  private setupEventListeners(): void {
    if (!this.connection) return;

    // Download progress events
    this.connection.on('DownloadProgress', (downloadId: string, progress: number, speed: number) => {
      this.emit('downloadProgress', { downloadId, progress, speed });
    });

    this.connection.on('DownloadCompleted', (downloadId: string) => {
      this.emit('downloadCompleted', { downloadId });
    });

    this.connection.on('DownloadFailed', (downloadId: string, error: string) => {
      this.emit('downloadFailed', { downloadId, error });
    });

    this.connection.on('DownloadStarted', (downloadId: string, addonName: string) => {
      this.emit('downloadStarted', { downloadId, addonName });
    });

    // System events
    this.connection.on('SystemStatusUpdate', (status: any) => {
      this.emit('systemStatusUpdate', status);
    });
  }

  on(event: string, callback: (...args: any[]) => void): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
  }

  off(event: string, callback: (...args: any[]) => void): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.delete(callback);
      if (eventListeners.size === 0) {
        this.listeners.delete(event);
      }
    }
  }

  private emit(event: string, ...args: any[]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach(callback => callback(...args));
    }
  }

  get isConnected(): boolean {
    return this.connection?.state === 'Connected';
  }
}

export const signalRService = new SignalRService();
