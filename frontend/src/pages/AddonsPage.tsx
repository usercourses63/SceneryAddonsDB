import { useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
  AdjustmentsHorizontalIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../services/api';
import { Addon } from '../types/api';
import AddonCard from '../components/addons/AddonCard';
import AddonListItem from '../components/addons/AddonListItem';
// import SearchFiltersComponent, { SearchFilters, SortOptions } from '../components/addons/SearchFilters';
import { useDebounce } from '../hooks/useDebounce';
import { useStartDownloadSession } from '../hooks/useDownloads';
import toast from 'react-hot-toast';

export type ViewMode = 'grid' | 'list';
export type SortField = 'name' | 'dateAdded' | 'fileSize' | 'author';
export type SortDirection = 'asc' | 'desc';

export interface SearchFilters {
  searchTerm: string;
  categories: string[];
  authors: string[];
  compatibility: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  fileSizeRange: {
    min?: number;
    max?: number;
  };
}

export interface SortOptions {
  field: SortField;
  direction: SortDirection;
}

const INITIAL_FILTERS: SearchFilters = {
  searchTerm: '',
  categories: [],
  authors: [],
  compatibility: [],
  dateRange: {},
  fileSizeRange: {}
};

const INITIAL_SORT: SortOptions = {
  field: 'dateAdded',
  direction: 'desc'
};

const PAGE_SIZE_OPTIONS = [12, 24, 48, 96];

const AddonsPage: React.FC = () => {
  // Navigation
  const navigate = useNavigate();
  
  // State management
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filters, setFilters] = useState<SearchFilters>(INITIAL_FILTERS);
  const [sortOptions, setSortOptions] = useState<SortOptions>(INITIAL_SORT);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(24);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(filters.searchTerm, 300);
  
  // Download session hook
  const startDownloadSession = useStartDownloadSession();

  // Fetch addons with query parameters
  const { data: addonsResponse, isLoading, error } = useQuery({
    queryKey: ['addons', {
      page: currentPage,
      pageSize,
      sortBy: sortOptions.field,
      sortDirection: sortOptions.direction,
      searchTerm: debouncedSearchTerm,
      categories: filters.categories,
      authors: filters.authors,
      compatibility: filters.compatibility,
      dateStart: filters.dateRange.start,
      dateEnd: filters.dateRange.end,
      minSize: filters.fileSizeRange.min,
      maxSize: filters.fileSizeRange.max
    }],
    queryFn: () => apiClient.getAddons({
      page: currentPage,
      pageSize,
      sortBy: sortOptions.field,
      sortDirection: sortOptions.direction,
      searchTerm: debouncedSearchTerm.trim() || undefined,
      categories: filters.categories.length > 0 ? filters.categories : undefined,
      authors: filters.authors.length > 0 ? filters.authors : undefined,
      compatibility: filters.compatibility.length > 0 ? filters.compatibility.join(',') : undefined,
      dateStart: filters.dateRange.start,
      dateEnd: filters.dateRange.end,
      minSize: filters.fileSizeRange.min,
      maxSize: filters.fileSizeRange.max
    }),
    placeholderData: (previousData) => previousData,
    staleTime: 30000
  });

  // Extract data from response
  const addons = addonsResponse?.addons || [];
  const totalCount = addonsResponse?.pagination?.totalItems || 0;
  const totalPages = addonsResponse?.pagination?.totalPages || Math.ceil(totalCount / pageSize);

  // Handle filter changes
  const handleFiltersChange = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters((prev: SearchFilters) => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  }, []);

  // Handle sort changes
  const handleSortChange = useCallback((field: SortField) => {
    setSortOptions((prev: SortOptions) => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
    setCurrentPage(1);
  }, []);

  // Handle pagination
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  }, []);

  // Clear all filters
  const handleClearFilters = useCallback(() => {
    setFilters(INITIAL_FILTERS);
    setSortOptions(INITIAL_SORT);
    setCurrentPage(1);
  }, []);

  // Get active filter count
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.searchTerm.trim()) count++;
    if (filters.categories.length > 0) count++;
    if (filters.authors.length > 0) count++;
    if (filters.compatibility.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.fileSizeRange.min !== undefined || filters.fileSizeRange.max !== undefined) count++;
    return count;
  }, [filters]);

  // Handle addon selection
  const handleAddonSelect = useCallback((addonId: string, selected: boolean) => {
    setSelectedAddons(prev => {
      const newSet = new Set(prev);
      if (selected) {
        newSet.add(addonId);
      } else {
        newSet.delete(addonId);
      }
      return newSet;
    });
  }, []);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    setSelectedAddons(new Set(addons.map(addon => addon.id)));
  }, [addons]);

  // Handle clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedAddons(new Set());
  }, []);

  // Handle bulk download
  const handleBulkDownload = useCallback(() => {
    if (selectedAddons.size === 0) {
      toast.error('Please select at least one addon to download');
      return;
    }

    const selectedAddonsList = Array.from(selectedAddons);
    startDownloadSession.mutate({
      count: selectedAddonsList.length,
      maxConcurrency: 3,
      addonIds: selectedAddonsList
    } as any, {
      onSuccess: () => {
        setSelectedAddons(new Set());
        setSelectMode(false);
        toast.success(`Started download session for ${selectedAddonsList.length} addons`);
        // Navigate to downloads page to monitor progress
        navigate('/downloads');
      }
    });
  }, [selectedAddons, startDownloadSession, navigate]);

  // Toggle select mode
  const toggleSelectMode = useCallback(() => {
    setSelectMode(!selectMode);
    setSelectedAddons(new Set());
  }, [selectMode]);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-none bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Addon Browser</h1>
            <p className="text-sm text-gray-600 mt-1">
              {totalCount.toLocaleString()} addons available
            </p>
          </div>
          
          {/* View and Filter Controls */}
          <div className="flex items-center gap-3">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-64">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search addons..."
                value={filters.searchTerm}
                onChange={(e) => handleFiltersChange({ searchTerm: e.target.value })}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Select Mode Toggle */}
            <button
              onClick={toggleSelectMode}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                selectMode
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              {selectMode ? 'Cancel' : 'Select'}
            </button>

            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
                showFilters || activeFilterCount > 0
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <FunnelIcon className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-blue-100 text-blue-800 text-xs px-1.5 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* View Mode Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${
                  viewMode === 'grid'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Grid view"
              >
                <Squares2X2Icon className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 border-l border-gray-300 ${
                  viewMode === 'list'
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="List view"
              >
                <ListBulletIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500">Advanced filters coming soon...</p>
          </div>
        )}

        {/* Selection Controls */}
        {selectMode && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700">
                  {selectedAddons.size} addon{selectedAddons.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleSelectAll}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Select all on page
                  </button>
                  <span className="text-gray-300">|</span>
                  <button
                    onClick={handleClearSelection}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear selection
                  </button>
                </div>
              </div>
              <button
                onClick={handleBulkDownload}
                disabled={selectedAddons.size === 0 || startDownloadSession.isPending}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  selectedAddons.size === 0 || startDownloadSession.isPending
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {startDownloadSession.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Starting...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Download Selected ({selectedAddons.size})
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading addons...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-2">Failed to load addons</p>
              <p className="text-gray-600 text-sm">Please try refreshing the page</p>
            </div>
          </div>
        ) : addons.length === 0 ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-gray-600 mb-2">No addons found</p>
              <p className="text-gray-500 text-sm">Try adjusting your search or filters</p>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="mt-3 text-blue-600 hover:text-blue-800 text-sm"
                >
                  Clear all filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="p-6">
            {/* Sort and Results Info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-600">
                Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, totalCount)} of {totalCount.toLocaleString()} results
              </p>
              
              <div className="flex items-center gap-4">
                {/* Page Size Selector */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Show:</label>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    {PAGE_SIZE_OPTIONS.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>

                {/* Quick Sort */}
                <div className="flex items-center gap-2">
                  <label className="text-sm text-gray-600">Sort by:</label>
                  <select
                    value={`${sortOptions.field}-${sortOptions.direction}`}
                    onChange={(e) => {
                      const [field, direction] = e.target.value.split('-') as [SortField, SortDirection];
                      setSortOptions({ field, direction });
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value="dateAdded-desc">Newest first</option>
                    <option value="dateAdded-asc">Oldest first</option>
                    <option value="name-asc">Name A-Z</option>
                    <option value="name-desc">Name Z-A</option>
                    <option value="fileSize-desc">Largest first</option>
                    <option value="fileSize-asc">Smallest first</option>
                    <option value="author-asc">Author A-Z</option>
                    <option value="author-desc">Author Z-A</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Addon Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {addons.map((addon) => (
                  <AddonCard
                    key={addon.id}
                    addon={addon}
                    selectMode={selectMode}
                    isSelected={selectedAddons.has(addon.id)}
                    onSelect={(selected: boolean) => handleAddonSelect(addon.id, selected)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {addons.map((addon) => (
                  <AddonListItem
                    key={addon.id}
                    addon={addon}
                    selectMode={selectMode}
                    isSelected={selectedAddons.has(addon.id)}
                    onSelect={(selected: boolean) => handleAddonSelect(addon.id, selected)}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeftIcon className="h-4 w-4" />
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 7) {
                      pageNum = i + 1;
                    } else if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white'
                            : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRightIcon className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddonsPage;