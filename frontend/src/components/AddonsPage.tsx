import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import type { Addon, SearchParams } from '../types/api';

// Enhanced Addons Page with full search, filtering, and download functionality
export function AddonsPage() {
  const { showSuccess, showError, showInfo } = useToast();
  const queryClient = useQueryClient();
  
  // State for search and filtering
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [compatibility, setCompatibility] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchInput, setSearchInput] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);

  // Fetch addons with proper parameters
  const { data: addonsResponse, isLoading, error, refetch } = useQuery({
    queryKey: ['addons', page, search, compatibility, sortBy, sortOrder],
    queryFn: () => apiClient.getAddons({
      page,
      pageSize: 20,
      search,
      compatibility,
      sortBy,
      sortOrder,
    }),
    keepPreviousData: true,
  });

  // Download mutations
  const downloadAddonMutation = useMutation({
    mutationFn: (addonId: string) => apiClient.downloadAddon(addonId),
    onSuccess: (data, addonId) => {
      showSuccess('Download Started', `Download has been queued successfully`);
      queryClient.invalidateQueries({ queryKey: ['downloadSessions'] });
    },
    onError: (error: any, addonId) => {
      showError('Download Failed', error.message || 'Failed to start download');
    },
  });

  const bulkDownloadMutation = useMutation({
    mutationFn: (addonIds: string[]) => apiClient.startDownloadSession(addonIds),
    onSuccess: (data) => {
      showSuccess('Bulk Download Started', `${selectedAddons.length} addons queued for download`);
      setSelectedAddons([]);
      queryClient.invalidateQueries({ queryKey: ['downloadSessions'] });
    },
    onError: (error: any) => {
      showError('Bulk Download Failed', error.message || 'Failed to start bulk download');
    },
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleDownload = (addon: Addon) => {
    downloadAddonMutation.mutate(addon.id);
  };

  const handleBulkDownload = () => {
    if (selectedAddons.length === 0) {
      showInfo('No Selection', 'Please select addons to download');
      return;
    }
    bulkDownloadMutation.mutate(selectedAddons);
  };

  const handleSelectAddon = (addonId: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonId) 
        ? prev.filter(id => id !== addonId)
        : [...prev, addonId]
    );
  };

  const handleSelectAll = () => {
    if (addonsResponse?.items) {
      const allIds = addonsResponse.items.map(addon => addon.id);
      setSelectedAddons(prev => 
        prev.length === allIds.length ? [] : allIds
      );
    }
  };

  const getCompatibilityColor = (compatibility: string) => {
    switch (compatibility) {
      case 'MSFS 2020/2024':
        return 'bg-green-100 text-green-800';
      case 'MSFS 2020':
        return 'bg-blue-100 text-blue-800';
      case 'MSFS 2024':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Addons</h1>
          <p className="mt-1 text-sm text-gray-600">
            Browse and search through available MSFS scenery addons
          </p>
        </div>
        {selectedAddons.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">
              {selectedAddons.length} selected
            </span>
            <button
              onClick={handleBulkDownload}
              disabled={bulkDownloadMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
            >
              <span className="mr-2">⬇️</span>
              Download Selected
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Search and Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-6">
          <div className="md:col-span-3">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Addons
            </label>
            <div className="flex">
              <input
                type="text"
                id="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name, description, or filename..."
                className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
              <button
                onClick={handleSearch}
                className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100"
              >
                🔍
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="compatibility" className="block text-sm font-medium text-gray-700 mb-2">
              Compatibility
            </label>
            <select
              id="compatibility"
              value={compatibility}
              onChange={(e) => {
                setCompatibility(e.target.value);
                setPage(1);
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">All Versions</option>
              <option value="MSFS 2020/2024">MSFS 2020/2024</option>
              <option value="MSFS 2020">MSFS 2020</option>
              <option value="MSFS 2024">MSFS 2024</option>
            </select>
          </div>

          <div>
            <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
              Sort By
            </label>
            <select
              id="sortBy"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="dateAdded">Date Added</option>
              <option value="name">Name</option>
              <option value="compatibility">Compatibility</option>
              <option value="fileSize">File Size</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch('');
                setSearchInput('');
                setCompatibility('');
                setSortBy('dateAdded');
                setSortOrder('desc');
                setPage(1);
              }}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-medium text-gray-900">
                {addonsResponse ? `${addonsResponse.totalCount?.toLocaleString() || 0} Addons Found` : 'Addon Browser'}
              </h2>
              {addonsResponse?.items && addonsResponse.items.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  {selectedAddons.length === addonsResponse.items.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
            
            {addonsResponse && addonsResponse.totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {page} of {addonsResponse.totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(addonsResponse.totalPages, page + 1))}
                  disabled={page === addonsResponse.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                    </div>
                    <div className="h-8 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-red-600 text-2xl">❌</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load addons</h3>
              <p className="text-gray-600 mb-4">{error.message}</p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </button>
            </div>
          ) : addonsResponse && addonsResponse.items && addonsResponse.items.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {addonsResponse.items.map((addon: Addon) => (
                <div key={addon.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3 flex-1">
                      <input
                        type="checkbox"
                        checked={selectedAddons.includes(addon.id)}
                        onChange={() => handleSelectAddon(addon.id)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <h3 className="font-medium text-gray-900 line-clamp-2 flex-1">{addon.name}</h3>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ml-2 ${getCompatibilityColor(addon.compatibility)}`}>
                      {addon.compatibility || 'Unknown'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                    {addon.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <span className="truncate">{addon.fileName}</span>
                    <span className="whitespace-nowrap ml-2">
                      {addon.dateAdded ? new Date(addon.dateAdded).toLocaleDateString() : 'Unknown date'}
                    </span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownload(addon)}
                      disabled={downloadAddonMutation.isPending}
                      className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      <span className="mr-1">⬇️</span>
                      Download
                    </button>
                    <button 
                      className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                      title="View Details"
                    >
                      ℹ️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">📦</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No addons found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
              <button
                onClick={() => {
                  setSearch('');
                  setSearchInput('');
                  setCompatibility('');
                  setPage(1);
                }}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
