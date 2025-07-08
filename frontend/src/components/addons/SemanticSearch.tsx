import { FC, useState, useCallback, useEffect } from 'react';
import { MagnifyingGlassIcon, SparklesIcon, ClockIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useDebounce } from '../../hooks/useDebounce';

interface SearchSuggestion {
  query: string;
  type: 'recent' | 'popular' | 'semantic';
  count?: number;
}

interface SemanticSearchProps {
  onSearch: (query: string, semantic?: boolean) => void;
  currentQuery: string;
  placeholder?: string;
}

const SemanticSearch: FC<SemanticSearchProps> = ({ 
  onSearch, 
  currentQuery, 
  placeholder = "Search addons with AI-powered semantic search..." 
}) => {
  const [query, setQuery] = useState(currentQuery);
  const [isSemanticMode, setIsSemanticMode] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  const debouncedQuery = useDebounce(query, 300);

  // Load search history from localStorage
  useEffect(() => {
    const history = localStorage.getItem('addon-search-history');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
  }, []);

  // Generate suggestions based on query
  useEffect(() => {
    if (debouncedQuery.length > 0) {
      generateSuggestions(debouncedQuery);
    } else {
      setSuggestions(getDefaultSuggestions());
    }
  }, [debouncedQuery, searchHistory]);

  const generateSuggestions = useCallback((searchQuery: string) => {
    const newSuggestions: SearchSuggestion[] = [];

    // Recent searches that match
    const recentMatches = searchHistory
      .filter(h => h.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 3)
      .map(h => ({ query: h, type: 'recent' as const }));
    newSuggestions.push(...recentMatches);

    // Popular searches (simulated)
    const popularQueries = [
      'airport scenery', 'aircraft liveries', 'landscape enhancement', 
      'weather effects', 'sound packs', 'navigation tools'
    ];
    const popularMatches = popularQueries
      .filter(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, 2)
      .map(p => ({ query: p, type: 'popular' as const, count: Math.floor(Math.random() * 500) + 100 }));
    newSuggestions.push(...popularMatches);

    // Semantic suggestions
    if (isSemanticMode) {
      const semanticSuggestions = generateSemanticSuggestions(searchQuery);
      newSuggestions.push(...semanticSuggestions);
    }

    setSuggestions(newSuggestions.slice(0, 6));
  }, [searchHistory, isSemanticMode]);

  const generateSemanticSuggestions = (searchQuery: string): SearchSuggestion[] => {
    // Simulate semantic understanding
    const semanticMappings: Record<string, string[]> = {
      'airport': ['runway layouts', 'terminal buildings', 'ground textures', 'lighting systems'],
      'aircraft': ['cockpit details', 'engine sounds', 'flight dynamics', 'exterior modeling'],
      'scenery': ['photorealistic landscapes', 'city skylines', 'natural landmarks', 'seasonal variations'],
      'weather': ['cloud formations', 'precipitation effects', 'atmospheric lighting', 'wind patterns'],
      'night': ['airport lighting', 'city illumination', 'navigation beacons', 'approach systems'],
      'realistic': ['high-resolution textures', 'accurate modeling', 'authentic details', 'true-to-life'],
    };

    const suggestions: SearchSuggestion[] = [];
    for (const [key, values] of Object.entries(semanticMappings)) {
      if (searchQuery.toLowerCase().includes(key)) {
        values.slice(0, 2).forEach(value => {
          suggestions.push({ query: value, type: 'semantic' });
        });
      }
    }

    return suggestions;
  };

  const getDefaultSuggestions = (): SearchSuggestion[] => {
    const defaultSuggestions: SearchSuggestion[] = [];

    // Recent searches
    searchHistory.slice(0, 3).forEach(h => {
      defaultSuggestions.push({ query: h, type: 'recent' });
    });

    // Popular searches
    const popular = [
      { query: 'MSFS 2024 airports', count: 1250 },
      { query: 'realistic scenery', count: 890 },
      { query: 'aircraft liveries', count: 720 },
    ];
    defaultSuggestions.push(...popular.map(p => ({ ...p, type: 'popular' as const })));

    return defaultSuggestions;
  };

  const handleSearch = useCallback((searchQuery: string, semantic: boolean = isSemanticMode) => {
    if (searchQuery.trim()) {
      // Add to search history
      const newHistory = [searchQuery, ...searchHistory.filter(h => h !== searchQuery)].slice(0, 10);
      setSearchHistory(newHistory);
      localStorage.setItem('addon-search-history', JSON.stringify(newHistory));
      
      onSearch(searchQuery, semantic);
      setShowSuggestions(false);
    }
  }, [onSearch, isSemanticMode, searchHistory]);

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(value.length > 0 || suggestions.length > 0);
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('addon-search-history');
    setSuggestions(getDefaultSuggestions());
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'recent':
        return <ClockIcon className="h-4 w-4 text-gray-400" />;
      case 'popular':
        return <SparklesIcon className="h-4 w-4 text-yellow-500" />;
      case 'semantic':
        return <SparklesIcon className="h-4 w-4 text-purple-500" />;
      default:
        return <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="flex items-center">
          <div className="relative flex-1">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setShowSuggestions(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSearch(query);
                } else if (e.key === 'Escape') {
                  setShowSuggestions(false);
                }
              }}
              placeholder={placeholder}
              className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:border-transparent transition-all ${
                isSemanticMode 
                  ? 'border-purple-300 focus:ring-purple-500 bg-purple-50' 
                  : 'border-gray-300 focus:ring-blue-500'
              }`}
            />
            {query && (
              <button
                onClick={() => {
                  setQuery('');
                  setShowSuggestions(false);
                  onSearch('');
                }}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            )}
          </div>
          
          <button
            onClick={() => setIsSemanticMode(!isSemanticMode)}
            className={`ml-3 px-4 py-3 rounded-lg border transition-all ${
              isSemanticMode
                ? 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
            title={isSemanticMode ? 'Disable AI Search' : 'Enable AI Search'}
          >
            <SparklesIcon className="h-5 w-5" />
          </button>
        </div>

        {isSemanticMode && (
          <div className="mt-2 text-sm text-purple-600 flex items-center gap-1">
            <SparklesIcon className="h-4 w-4" />
            AI-powered semantic search enabled
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {showSuggestions && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
          {suggestions.length > 0 ? (
            <>
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Search Suggestions
                  </span>
                  {searchHistory.length > 0 && (
                    <button
                      onClick={clearHistory}
                      className="text-xs text-gray-400 hover:text-gray-600"
                    >
                      Clear history
                    </button>
                  )}
                </div>
              </div>
              
              <div className="py-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(suggestion.query)}
                    className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-3 group"
                  >
                    {getSuggestionIcon(suggestion.type)}
                    <span className="flex-1 text-sm text-gray-900">{suggestion.query}</span>
                    {suggestion.count && (
                      <span className="text-xs text-gray-400">{suggestion.count} results</span>
                    )}
                    {suggestion.type === 'semantic' && (
                      <span className="text-xs text-purple-500 bg-purple-100 px-2 py-1 rounded">AI</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              No suggestions available
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SemanticSearch;