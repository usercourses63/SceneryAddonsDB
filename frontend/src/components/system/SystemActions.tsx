import React, { useState } from 'react';
import { RefreshCw, FileText, Play, Settings, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useSystemActions, useSystemMetrics } from '@/hooks/useSystemMonitoring';
import toast from 'react-hot-toast';

export const SystemActions: React.FC = () => {
  const { triggerConsoleReport, triggerManualScrape } = useSystemActions();
  const { refetch } = useSystemMetrics();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [scrapeToken, setScrapeToken] = useState('');
  const [showTokenInput, setShowTokenInput] = useState(false);

  const handleConsoleReport = async () => {
    setIsLoading('console');
    try {
      const result = await triggerConsoleReport();
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to trigger console report');
    } finally {
      setIsLoading(null);
    }
  };

  const handleManualScrape = async () => {
    if (!scrapeToken.trim()) {
      toast.error('Please enter a valid token');
      return;
    }

    setIsLoading('scrape');
    try {
      const result = await triggerManualScrape(scrapeToken);
      if (result.success) {
        toast.success(result.message);
        setScrapeToken('');
        setShowTokenInput(false);
        // Refresh metrics after successful scrape
        setTimeout(() => refetch(), 2000);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error('Failed to trigger manual scrape');
    } finally {
      setIsLoading(null);
    }
  };

  const handleRefreshMetrics = async () => {
    setIsLoading('refresh');
    try {
      await refetch();
      toast.success('System metrics refreshed');
    } catch (error) {
      toast.error('Failed to refresh metrics');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-900">System Actions</h3>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-yellow-500" />
          <span className="text-sm text-gray-600">Admin functions</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Refresh Metrics */}
        <div className="space-y-3">
          <Button
            onClick={handleRefreshMetrics}
            disabled={isLoading === 'refresh'}
            className="w-full"
            variant="outline"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading === 'refresh' ? 'animate-spin' : ''}`} />
            {isLoading === 'refresh' ? 'Refreshing...' : 'Refresh Metrics'}
          </Button>
          <p className="text-xs text-gray-500">
            Refresh all system metrics and statistics
          </p>
        </div>

        {/* Console Report */}
        <div className="space-y-3">
          <Button
            onClick={handleConsoleReport}
            disabled={isLoading === 'console'}
            className="w-full"
            variant="outline"
          >
            <FileText className="h-4 w-4 mr-2" />
            {isLoading === 'console' ? 'Generating...' : 'Console Report'}
          </Button>
          <p className="text-xs text-gray-500">
            Generate comprehensive system status report
          </p>
        </div>

        {/* Manual Scrape */}
        <div className="space-y-3">
          <Button
            onClick={() => setShowTokenInput(!showTokenInput)}
            className="w-full"
            variant="outline"
          >
            <Play className="h-4 w-4 mr-2" />
            Manual Scrape
          </Button>
          <p className="text-xs text-gray-500">
            Trigger manual addon data scraping
          </p>
        </div>
      </div>

      {/* Token Input for Manual Scrape */}
      {showTokenInput && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center space-x-2 mb-3">
            <Settings className="h-4 w-4 text-gray-500" />
            <h4 className="text-sm font-medium text-gray-900">Manual Scrape Configuration</h4>
          </div>
          
          <div className="space-y-3">
            <div>
              <label htmlFor="scrapeToken" className="block text-sm font-medium text-gray-700 mb-1">
                Refresh Token
              </label>
              <input
                type="password"
                id="scrapeToken"
                value={scrapeToken}
                onChange={(e) => setScrapeToken(e.target.value)}
                placeholder="Enter refresh token..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleManualScrape}
                disabled={isLoading === 'scrape' || !scrapeToken.trim()}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading === 'scrape' ? 'Starting...' : 'Start Scrape'}
              </Button>
              <Button
                onClick={() => {
                  setShowTokenInput(false);
                  setScrapeToken('');
                }}
                size="sm"
                variant="outline"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Action Status */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <span className="text-sm text-blue-800 font-medium">Important</span>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          These actions may impact system performance. Use with caution in production environments.
        </p>
      </div>
    </div>
  );
};