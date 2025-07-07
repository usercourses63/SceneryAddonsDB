import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';
import { 
  Search, 
  Filter, 
  Download, 
  Info, 
  CheckSquare, 
  Square, 
  Package,
  Calendar,
  FileText,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal
} from 'lucide-react';

export function ModernAddons() {
  const queryClient = useQueryClient();
  
  // State for search and filtering
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [compatibility, setCompatibility] = useState('');
  const [sortBy, setSortBy] = useState('dateAdded');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchInput, setSearchInput] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

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
    mutationFn: (addonId: string) => apiClient.startDownload(addonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['downloadSessions'] });
    },
  });

  const bulkDownloadMutation = useMutation({
    mutationFn: (addonIds: string[]) => apiClient.startDownloadSession(addonIds),
    onSuccess: () => {
      setSelectedAddons([]);
      queryClient.invalidateQueries({ queryKey: ['downloadSessions'] });
    },
  });

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleDownload = (addon: any) => {
    downloadAddonMutation.mutate(addon.id);
  };

  const handleBulkDownload = () => {
    if (selectedAddons.length === 0) return;
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
      const allIds = addonsResponse.items.map((addon: any) => addon.id);
      setSelectedAddons(prev => 
        prev.length === allIds.length ? [] : allIds
      );
    }
  };

  const getCompatibilityColor = (compatibility: string) => {
    switch (compatibility) {
      case 'MSFS 2020/2024':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'MSFS 2020':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MSFS 2024':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Addons</h1>
          <p className="text-gray-600 mt-1">
            Browse and search through available MSFS scenery addons
          </p>
        </div>
        {selectedAddons.length > 0 && (
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600 bg-blue-50 px-3 py-1 rounded-full">
              {selectedAddons.length} selected
            </span>
            <button
              onClick={handleBulkDownload}
              disabled={bulkDownloadMutation.isPending}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Selected
            </button>
          </div>
        )}
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search by name, description, or filename..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Search
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Compatibility
              </label>
              <select
                value={compatibility}
                onChange={(e) => {
                  setCompatibility(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Versions</option>
                <option value="MSFS 2020/2024">MSFS 2020/2024</option>
                <option value="MSFS 2020">MSFS 2020</option>
                <option value="MSFS 2024">MSFS 2024</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="dateAdded">Date Added</option>
                <option value="name">Name</option>
                <option value="compatibility">Compatibility</option>
                <option value="fileSize">File Size</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {addonsResponse ? `${addonsResponse.totalCount?.toLocaleString() || 0} Addons Found` : 'Addon Browser'}
              </h2>
              {addonsResponse?.items && addonsResponse.items.length > 0 && (
                <button
                  onClick={handleSelectAll}
                  className="flex items-center text-sm text-blue-600 hover:text-blue-700"
                >
                  {selectedAddons.length === addonsResponse.items.length ? (
                    <CheckSquare className="w-4 h-4 mr-1" />
                  ) : (
                    <Square className="w-4 h-4 mr-1" />
                  )}
                  {selectedAddons.length === addonsResponse.items.length ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </div>
            
            {addonsResponse && addonsResponse.totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-gray-600 px-3">
                  Page {page} of {addonsResponse.totalPages}
                </span>
                <button
                  onClick={() => setPage(Math.min(addonsResponse.totalPages, page + 1))}
                  disabled={page === addonsResponse.totalPages}
                  className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  <ChevronRight className="w-4 h-4" />
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
                  <div className="border border-gray-200 rounded-xl p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="space-y-2 mb-4">
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    <div className="h-10 bg-gray-200 rounded w-full"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Failed to load addons</h3>
              <p className="text-gray-600 mb-6">{error.message}</p>
              <button
                onClick={() => refetch()}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </button>
            </div>
          ) : addonsResponse && addonsResponse.items && addonsResponse.items.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {addonsResponse.items.map((addon: any) => (
                <div key={addon.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-all duration-200">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-3 flex-1">
                      <button
                        onClick={() => handleSelectAddon(addon.id)}
                        className="mt-1 text-gray-400 hover:text-blue-600"
                      >
                        {selectedAddons.includes(addon.id) ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">{addon.name}</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCompatibilityColor(addon.compatibility)}`}>
                          {addon.compatibility || 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                    {addon.description || 'No description available'}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                    <div className="flex items-center">
                      <FileText className="w-4 h-4 mr-1" />
                      <span className="truncate">{addon.fileName}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      <span className="whitespace-nowrap">
                        {addon.dateAdded ? new Date(addon.dateAdded).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleDownload(addon)}
                      disabled={downloadAddonMutation.isPending}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </button>
                    <button className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                      <Info className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No addons found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search criteria</p>
              <button
                onClick={() => {
                  setSearch('');
                  setSearchInput('');
                  setCompatibility('');
                  setPage(1);
                }}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
