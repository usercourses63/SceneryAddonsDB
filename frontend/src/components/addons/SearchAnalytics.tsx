import { FC, useState, useEffect } from 'react';
import { 
  ChartBarIcon, 
  ArrowTrendingUpIcon,
  EyeIcon, 
  MagnifyingGlassIcon,
  ClockIcon,
  FireIcon
} from '@heroicons/react/24/outline';

interface SearchTrend {
  query: string;
  count: number;
  change: number; // percentage change
  category: string;
}

interface SearchAnalyticsData {
  popularSearches: SearchTrend[];
  trendingSearches: SearchTrend[];
  recentSearches: Array<{ query: string; timestamp: string; resultCount: number }>;
  searchVolume: Array<{ date: string; searches: number }>;
  topCategories: Array<{ category: string; searches: number; percentage: number }>;
}

interface SearchAnalyticsProps {
  onSearchSelect?: (query: string) => void;
}

const SearchAnalytics: FC<SearchAnalyticsProps> = ({ onSearchSelect }) => {
  const [analyticsData, setAnalyticsData] = useState<SearchAnalyticsData | null>(null);
  const [activeTab, setActiveTab] = useState<'popular' | 'trending' | 'recent'>('popular');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const mockData: SearchAnalyticsData = {
        popularSearches: [
          { query: 'MSFS 2024 airports', count: 1250, change: 15.2, category: 'Airports' },
          { query: 'realistic scenery', count: 980, change: -3.1, category: 'Scenery' },
          { query: 'aircraft liveries', count: 875, change: 8.7, category: 'Aircraft' },
          { query: 'weather effects', count: 720, change: 22.4, category: 'Weather' },
          { query: 'sound packs', count: 650, change: 5.3, category: 'Sounds' },
          { query: 'navigation tools', count: 580, change: -1.8, category: 'Navigation' },
          { query: 'airport lighting', count: 420, change: 35.6, category: 'Airports' },
          { query: 'photorealistic', count: 380, change: 12.1, category: 'Scenery' }
        ],
        trendingSearches: [
          { query: 'MSFS 2024 compatibility', count: 320, change: 145.2, category: 'General' },
          { query: 'ray tracing effects', count: 180, change: 89.4, category: 'Graphics' },
          { query: 'AI traffic', count: 150, change: 67.8, category: 'Traffic' },
          { query: 'cockpit enhancements', count: 140, change: 55.3, category: 'Aircraft' },
          { query: 'ground textures', count: 120, change: 48.9, category: 'Scenery' }
        ],
        recentSearches: [
          { query: 'KiwiFlightSim airports', timestamp: '2025-07-08T17:20:00Z', resultCount: 25 },
          { query: 'Sierrasim scenery', timestamp: '2025-07-08T17:15:00Z', resultCount: 18 },
          { query: 'FlyTampa MSFS 2024', timestamp: '2025-07-08T17:10:00Z', resultCount: 42 },
          { query: 'realistic water effects', timestamp: '2025-07-08T17:05:00Z', resultCount: 8 },
          { query: 'Orbx landscapes', timestamp: '2025-07-08T17:00:00Z', resultCount: 67 }
        ],
        searchVolume: [
          { date: '2025-07-01', searches: 1420 },
          { date: '2025-07-02', searches: 1650 },
          { date: '2025-07-03', searches: 1890 },
          { date: '2025-07-04', searches: 2100 },
          { date: '2025-07-05', searches: 1780 },
          { date: '2025-07-06', searches: 2350 },
          { date: '2025-07-07', searches: 2420 },
          { date: '2025-07-08', searches: 1680 }
        ],
        topCategories: [
          { category: 'Airports', searches: 3200, percentage: 28.5 },
          { category: 'Scenery', searches: 2800, percentage: 24.9 },
          { category: 'Aircraft', searches: 2100, percentage: 18.7 },
          { category: 'Weather', searches: 1400, percentage: 12.4 },
          { category: 'Sounds', searches: 900, percentage: 8.0 },
          { category: 'Navigation', searches: 600, percentage: 5.3 },
          { category: 'Utilities', searches: 250, percentage: 2.2 }
        ]
      };
      
      setAnalyticsData(mockData);
      setLoading(false);
    }, 800);
  };

  const formatTimeAgo = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getTrendIcon = (change: number) => {
    if (change > 20) return <FireIcon className="h-4 w-4 text-red-500" />;
    if (change > 0) return <ArrowTrendingUpIcon className="h-4 w-4 text-green-500" />;
    return <ArrowTrendingUpIcon className="h-4 w-4 text-gray-400 transform rotate-180" />;
  };

  const getTrendColor = (change: number) => {
    if (change > 0) return 'text-green-600';
    return 'text-red-600';
  };

  if (loading || !analyticsData) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const renderSearchList = (searches: SearchTrend[], showTrend: boolean = true) => (
    <div className="space-y-3">
      {searches.map((search, index) => (
        <div
          key={search.query}
          className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          onClick={() => onSearchSelect?.(search.query)}
        >
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-400 w-6">
              #{index + 1}
            </span>
            <div>
              <div className="font-medium text-gray-900">{search.query}</div>
              <div className="text-xs text-gray-500">
                {search.count.toLocaleString()} searches • {search.category}
              </div>
            </div>
          </div>
          {showTrend && (
            <div className="flex items-center gap-2">
              {getTrendIcon(search.change)}
              <span className={`text-sm font-medium ${getTrendColor(search.change)}`}>
                {search.change > 0 ? '+' : ''}{search.change.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Search Analytics</h3>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { key: 'popular', label: 'Popular', icon: MagnifyingGlassIcon },
            { key: 'trending', label: 'Trending', icon: ArrowTrendingUpIcon },
            { key: 'recent', label: 'Recent', icon: ClockIcon }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'popular' && (
        <div>
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Most Popular Searches</h4>
            <p className="text-xs text-gray-500">Top search queries by volume over the last 30 days</p>
          </div>
          {renderSearchList(analyticsData.popularSearches)}
        </div>
      )}

      {activeTab === 'trending' && (
        <div>
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Trending Searches</h4>
            <p className="text-xs text-gray-500">Fastest growing search queries this week</p>
          </div>
          {renderSearchList(analyticsData.trendingSearches)}
        </div>
      )}

      {activeTab === 'recent' && (
        <div>
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Activity</h4>
            <p className="text-xs text-gray-500">Latest searches from the community</p>
          </div>
          <div className="space-y-3">
            {analyticsData.recentSearches.map((search, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onSearchSelect?.(search.query)}
              >
                <div className="flex items-center gap-3">
                  <EyeIcon className="h-4 w-4 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900">{search.query}</div>
                    <div className="text-xs text-gray-500">
                      {search.resultCount} results found
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {formatTimeAgo(search.timestamp)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Category breakdown */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Search by Category</h4>
        <div className="grid grid-cols-2 gap-3">
          {analyticsData.topCategories.slice(0, 6).map(category => (
            <div
              key={category.category}
              className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
              onClick={() => onSearchSelect?.(category.category.toLowerCase())}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-900">
                  {category.category}
                </span>
                <span className="text-xs text-gray-500">
                  {category.percentage}%
                </span>
              </div>
              <div className="mt-1 bg-gray-200 rounded-full h-1">
                <div
                  className="bg-blue-500 h-1 rounded-full"
                  style={{ width: `${category.percentage}%` }}
                />
              </div>
              <div className="mt-1 text-xs text-gray-500">
                {category.searches.toLocaleString()} searches
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SearchAnalytics;