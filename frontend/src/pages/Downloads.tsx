import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Settings, BarChart3, History, Download, RefreshCw } from 'lucide-react';
import { DownloadSessionCard } from '@/components/downloads/DownloadSessionCard';
import { DownloadSettingsModal, DownloadSettings } from '@/components/downloads/DownloadSettingsModal';
import { DownloadHistoryPanel } from '@/components/downloads/DownloadHistoryPanel';
import { downloadApi } from '@/services/api';
import { DownloadStatusResponse, DownloadStats } from '@/types/api';
import toast from 'react-hot-toast';

type TabType = 'active' | 'history' | 'statistics';

export default function Downloads() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [sessions, setSessions] = useState<DownloadStatusResponse[]>([]);
  const [stats, setStats] = useState<DownloadStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Refresh every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [sessionsData, statsData] = await Promise.all([
        downloadApi.getSessions(),
        downloadApi.getStats()
      ]);
      setSessions(sessionsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching download data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const handleStartDownload = async (settings: DownloadSettings) => {
    try {
      const request = {
        count: settings.count,
        maxConcurrency: settings.maxConcurrency,
        compatibility: settings.compatibility || undefined,
        forceRedownload: settings.forceRedownload
      };

      await downloadApi.startSession(request);
      toast.success(`Started download session for ${settings.count} addons`);
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error starting download:', error);
      toast.error('Failed to start download session');
    }
  };

  const handlePauseSession = async (sessionId: string) => {
    try {
      await downloadApi.pauseSession(sessionId);
      toast.success('Session paused');
      await fetchData();
    } catch (error) {
      console.error('Error pausing session:', error);
      toast.error('Failed to pause session');
    }
  };

  const handleCancelSession = async (sessionId: string) => {
    try {
      await downloadApi.cancelSession(sessionId);
      toast.success('Session cancelled');
      await fetchData();
    } catch (error) {
      console.error('Error cancelling session:', error);
      toast.error('Failed to cancel session');
    }
  };

  const handleResumeSession = async (sessionId: string) => {
    try {
      await downloadApi.resumeSession(sessionId);
      toast.success('Session resumed');
      await fetchData();
    } catch (error) {
      console.error('Error resuming session:', error);
      toast.error('Failed to resume session');
    }
  };

  const handlePauseItem = async (sessionId: string, itemId: string) => {
    try {
      await downloadApi.pauseItem(sessionId, itemId);
      toast.success('Item paused');
      await fetchData();
    } catch (error) {
      console.error('Error pausing item:', error);
      toast.error('Failed to pause item');
    }
  };

  const handleResumeItem = async (sessionId: string, itemId: string) => {
    try {
      await downloadApi.resumeItem(sessionId, itemId);
      toast.success('Item resumed');
      await fetchData();
    } catch (error) {
      console.error('Error resuming item:', error);
      toast.error('Failed to resume item');
    }
  };

  const handleCancelItem = async (sessionId: string, itemId: string) => {
    try {
      await downloadApi.cancelItem(sessionId, itemId);
      toast.success('Item cancelled');
      await fetchData();
    } catch (error) {
      console.error('Error cancelling item:', error);
      toast.error('Failed to cancel item');
    }
  };

  const handleClearHistory = async () => {
    try {
      await downloadApi.clearHistory();
      toast.success('Download history cleared');
      await fetchData();
    } catch (error) {
      console.error('Error clearing history:', error);
      toast.error('Failed to clear history');
    }
  };

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    return `${formatBytes(bytesPerSecond)}/s`;
  };

  const activeSessions = sessions.filter(s => s.status === 'Active');
  const completedSessions = sessions.filter(s => s.status !== 'Active');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Downloads</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and monitor your addon download sessions
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Settings className="h-4 w-4 mr-2" />
            Download Settings
          </button>
          <button
            onClick={() => setIsSettingsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Play className="h-4 w-4 mr-2" />
            Start New Session
          </button>
          <button
            onClick={() => navigate('/addons')}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Browse Addons
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Download className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Active Downloads</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.activeDownloads}</dd>
                    {stats.totalSpeedBytesPerSecond > 0 && (
                      <dd className="text-sm text-blue-600">{formatSpeed(stats.totalSpeedBytesPerSecond)}</dd>
                    )}
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-semibold text-sm">✓</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.completedDownloads}</dd>
                    <dd className="text-sm text-gray-500">Total downloads</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-semibold text-sm">✗</span>
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Failed</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.failedDownloads}</dd>
                    <dd className="text-sm text-gray-500">Need retry</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BarChart3 className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Sessions</dt>
                    <dd className="text-lg font-medium text-gray-900">{stats.totalSessions}</dd>
                    <dd className="text-sm text-gray-500">All time</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('active')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'active'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Download className="h-4 w-4 inline mr-2" />
            Active Sessions
            {activeSessions.length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                {activeSessions.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <History className="h-4 w-4 inline mr-2" />
            Download History
          </button>
          <button
            onClick={() => setActiveTab('statistics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'statistics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <BarChart3 className="h-4 w-4 inline mr-2" />
            Statistics
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === 'active' && (
          <div className="space-y-4">
            {sessions.length === 0 ? (
              <div className="text-center py-8">
                <Download className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No Download Sessions</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start a new download session to begin downloading addons
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => setIsSettingsModalOpen(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Start New Session
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Active Sessions */}
                {activeSessions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                      Active Sessions ({activeSessions.length})
                    </h3>
                    {activeSessions.map((session) => (
                      <DownloadSessionCard
                        key={session.sessionId}
                        session={session}
                        onPauseSession={handlePauseSession}
                        onResumeSession={handleResumeSession}
                        onCancelSession={handleCancelSession}
                        onPauseItem={handlePauseItem}
                        onResumeItem={handleResumeItem}
                        onCancelItem={handleCancelItem}
                      />
                    ))}
                  </div>
                )}

                {/* Completed Sessions */}
                {completedSessions.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                      Recent Sessions ({completedSessions.length})
                    </h3>
                    {completedSessions.map((session) => (
                      <DownloadSessionCard
                        key={session.sessionId}
                        session={session}
                        showControls={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* Downloaded Files Only */}
            <DownloadHistoryPanel onClearHistory={handleClearHistory} />
          </div>
        )}

        {activeTab === 'statistics' && stats && (
          <div className="space-y-6">
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Download Overview</h3>
                <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Success Rate</dt>
                    <dd className="mt-1 text-3xl font-semibold text-green-600">
                      {stats.totalDownloads > 0 
                        ? ((stats.completedDownloads / stats.totalDownloads) * 100).toFixed(1)
                        : 0}%
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Total Downloads</dt>
                    <dd className="mt-1 text-3xl font-semibold text-blue-600">{stats.totalDownloads}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Active Sessions</dt>
                    <dd className="mt-1 text-3xl font-semibold text-purple-600">{stats.activeSessions}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Current Speed</dt>
                    <dd className="mt-1 text-3xl font-semibold text-orange-600">
                      {formatSpeed(stats.totalSpeedBytesPerSecond)}
                    </dd>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <DownloadSettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onStartDownload={handleStartDownload}
      />
    </div>
  );
}