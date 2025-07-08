import { FC, useState, useCallback, useEffect } from 'react';
import { 
  MagnifyingGlassIcon, 
  SparklesIcon, 
  AdjustmentsHorizontalIcon,
  ChartBarIcon,
  BookmarkIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { AddonSummary } from '../types/api';
import { useInfiniteAddons } from '../hooks/useInfiniteAddons';
import SemanticSearch from '../components/addons/SemanticSearch';
import SearchAnalytics from '../components/addons/SearchAnalytics';
import RelatedAddons from '../components/addons/RelatedAddons';
import { VirtualizedAddonGrid } from '../components/addons/VirtualizedAddonGrid';
import SearchFilters from '../components/addons/SearchFilters';
import AddonCard from '../components/addons/AddonCard';

interface SearchFilters {
  compatibility: string[];
  categories: string[];
  authors: string[];
  dateRange: {
    from: string;
    to: string;
  };
  fileSize: {
    min: number;
    max: number;
  };
}

const AdvancedSearchPage: FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSemanticSearch, setIsSemanticSearch] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedAddon, setSelectedAddon] = useState<AddonSummary | null>(null);
  const [activeView, setActiveView] = useState<'search' | 'related' | 'analytics'>('search');
  const [savedSearches, setSavedSearches] = useState<string[]>([]);
  const [filters, setFilters] = useState<SearchFilters>({
    compatibility: [],
    categories: [],
    authors: [],
    dateRange: { from: '', to: '' },
    fileSize: { min: 0, max: 0 }
  });

  // Use the existing infinite addons hook
  const {
    data: addonsData,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    error,
    refetch
  } = useInfiniteAddons({
    search: searchQuery,
    compatibility: filters.compatibility[0], // Take first for simplicity
    pageSize: 20
  });

  // Load saved searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('saved-searches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  }, []);

  const handleSearch = useCallback((query: string, semantic: boolean = false) => {
    setSearchQuery(query);
    setIsSemanticSearch(semantic);
    setActiveView('search');
    
    // Trigger refetch with new search parameters
    refetch();
  }, [refetch]);

  const handleAddonSelect = useCallback((addon: AddonSummary) => {
    setSelectedAddon(addon);
    setActiveView('related');
  }, []);

  const saveSearch = useCallback((query: string) => {
    if (query.trim() && !savedSearches.includes(query)) {
      const newSavedSearches = [query, ...savedSearches].slice(0, 10);
      setSavedSearches(newSavedSearches);
      localStorage.setItem('saved-searches', JSON.stringify(newSavedSearches));
    }
  }, [savedSearches]);

  const removeSavedSearch = useCallback((query: string) => {
    const newSavedSearches = savedSearches.filter(s => s !== query);
    setSavedSearches(newSavedSearches);
    localStorage.setItem('saved-searches', JSON.stringify(newSavedSearches));
  }, [savedSearches]);

  const handleFiltersChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
    refetch();
  }, [refetch]);

  const allAddons = addonsData?.pages.flatMap(page => page.addons) || [];
  const totalCount = addonsData?.pages[0]?.pagination.totalItems || 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <SparklesIcon className="h-7 w-7 text-blue-500" />
                Advanced Search & Discovery
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                AI-powered search with analytics and recommendations
              </p>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { key: 'search', label: 'Search', icon: MagnifyingGlassIcon },
                { key: 'analytics', label: 'Analytics', icon: ChartBarIcon },
                { key: 'related', label: 'Related', icon: SparklesIcon }
              ].map(view => (
                <button
                  key={view.key}
                  onClick={() => setActiveView(view.key as any)}
                  className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md transition-colors ${
                    activeView === view.key
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  <view.icon className="h-4 w-4" />
                  {view.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-6">
            <SemanticSearch
              onSearch={handleSearch}
              currentQuery={searchQuery}
              placeholder="Search with AI-powered semantic understanding..."
            />
          </div>

          {/* Action Bar */}
          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${
                showFilters 
                  ? 'bg-blue-50 border-blue-200 text-blue-700' 
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4" />
              Filters
            </button>

            {searchQuery && (
              <button
                onClick={() => saveSearch(searchQuery)}
                disabled={savedSearches.includes(searchQuery)}
                className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BookmarkIcon className="h-4 w-4" />
                {savedSearches.includes(searchQuery) ? 'Saved' : 'Save Search'}
              </button>
            )}

            {isSemanticSearch && (
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
                <SparklesIcon className="h-4 w-4 text-purple-600" />
                <span className="text-sm text-purple-700">AI Search Active</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Saved Searches */}
            {savedSearches.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Saved Searches</h3>
                <div className="space-y-2">
                  {savedSearches.map(search => (
                    <div key={search} className="flex items-center justify-between group">
                      <button
                        onClick={() => handleSearch(search)}
                        className="flex-1 text-left text-sm text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        {search}
                      </button>
                      <button
                        onClick={() => removeSavedSearch(search)}
                        className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all"
                      >
                        <XMarkIcon className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filters Panel */}
            {showFilters && (
              <SearchFilters
                filters={{
                  searchTerm: searchQuery,
                  compatibility: filters.compatibility,
                  categories: filters.categories,
                  authors: filters.authors,
                  dateRange: {
                    start: filters.dateRange.from,
                    end: filters.dateRange.to
                  },
                  fileSizeRange: { min: 0, max: 1000 }
                }}
                onFiltersChange={handleFiltersChange}
                onClearFilters={() => setFilters({
                  compatibility: [],
                  categories: [],
                  authors: [],
                  dateRange: { from: '', to: '' },
                  fileSize: { min: 0, max: 0 }
                })}
                activeFilterCount={
                  filters.compatibility.length +
                  filters.categories.length +
                  filters.authors.length +
                  (filters.dateRange.from || filters.dateRange.to ? 1 : 0)
                }
              />
            )}

            {/* Search Stats */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Search Results</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Total Results:</span>
                  <span className="font-medium">{totalCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Loaded:</span>
                  <span className="font-medium">{allAddons.length}</span>
                </div>
                {isSemanticSearch && (
                  <div className="flex justify-between">
                    <span>AI Enhanced:</span>
                    <span className="font-medium text-purple-600">Yes</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeView === 'search' && (
              <div>
                {searchQuery && (
                  <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-gray-900">
                      Search Results for "{searchQuery}"
                    </h2>
                    {isSemanticSearch && (
                      <div className="flex items-center gap-2 text-sm text-purple-600">
                        <SparklesIcon className="h-4 w-4" />
                        Enhanced with AI
                      </div>
                    )}
                  </div>
                )}

                {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="bg-gray-100 rounded-lg h-64 animate-pulse" />
                    ))}
                  </div>
                ) : error ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">Error loading addons. Please try again.</p>
                  </div>
                ) : allAddons.length > 0 ? (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      {allAddons.map(addon => (
                        <div key={addon.id} onClick={() => handleAddonSelect(addon)} className="cursor-pointer">
                          <AddonCard addon={addon} />
                        </div>
                      ))}
                    </div>
                    
                    {/* Load More Button */}
                    {hasNextPage && (
                      <div className="mt-8 text-center">
                        <button
                          onClick={() => fetchNextPage()}
                          disabled={isFetchingNextPage}
                          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isFetchingNextPage ? 'Loading...' : 'Load More'}
                        </button>
                      </div>
                    )}
                  </div>
                ) : searchQuery ? (
                  <div className="text-center py-12">
                    <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
                    <p className="text-gray-500">Try adjusting your search terms or filters</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <SparklesIcon className="h-12 w-12 text-blue-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Start Searching</h3>
                    <p className="text-gray-500">Use the search bar above to find addons with AI-powered discovery</p>
                  </div>
                )}
              </div>
            )}

            {activeView === 'analytics' && (
              <SearchAnalytics onSearchSelect={handleSearch} />
            )}

            {activeView === 'related' && selectedAddon && (
              <RelatedAddons 
                currentAddon={selectedAddon}
                onAddonSelect={handleAddonSelect}
              />
            )}

            {activeView === 'related' && !selectedAddon && (
              <div className="text-center py-12">
                <SparklesIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Addon</h3>
                <p className="text-gray-500">Choose an addon from the search results to see related recommendations</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedSearchPage;