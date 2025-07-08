import React, { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  XMarkIcon, 
  CalendarIcon,
  DocumentIcon,
  UserIcon,
  TagIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline';
import { apiClient } from '../../services/api';

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
  field: 'name' | 'dateAdded' | 'fileSize' | 'author';
  direction: 'asc' | 'desc';
}

interface SearchFiltersProps {
  filters: SearchFilters;
  onFiltersChange: (filters: Partial<SearchFilters>) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  summary?: any; // Summary stats containing compatibility breakdown
}

const SearchFiltersComponent: React.FC<SearchFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
  activeFilterCount,
  summary
}) => {
  // Fetch authors from API
  const { data: authors = [] } = useQuery({
    queryKey: ['authors'],
    queryFn: () => apiClient.getAuthors(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Fetch categories from API
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => apiClient.getCategories(),
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Extract real compatibility options from scraped data
  const compatibilityOptions = useMemo(() => {
    if (summary?.compatibilityBreakdown) {
      return Object.keys(summary.compatibilityBreakdown).sort();
    }
    // Fallback to common options if no data available
    return ['FS2020', 'FS2024', 'MSFS', 'X-Plane 11', 'X-Plane 12', 'P3D'];
  }, [summary]);

  // Local state for file size inputs
  const [minSizeInput, setMinSizeInput] = useState<string>(
    filters.fileSizeRange.min?.toString() || ''
  );
  const [maxSizeInput, setMaxSizeInput] = useState<string>(
    filters.fileSizeRange.max?.toString() || ''
  );

  // Update local inputs when filters change externally
  useEffect(() => {
    setMinSizeInput(filters.fileSizeRange.min?.toString() || '');
    setMaxSizeInput(filters.fileSizeRange.max?.toString() || '');
  }, [filters.fileSizeRange]);

  const handleCategoryToggle = (category: string) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ categories: newCategories });
  };

  const handleAuthorToggle = (author: string) => {
    const newAuthors = filters.authors.includes(author)
      ? filters.authors.filter(a => a !== author)
      : [...filters.authors, author];
    onFiltersChange({ authors: newAuthors });
  };

  const handleCompatibilityToggle = (compatibility: string) => {
    const newCompatibility = filters.compatibility.includes(compatibility)
      ? filters.compatibility.filter(c => c !== compatibility)
      : [...filters.compatibility, compatibility];
    onFiltersChange({ compatibility: newCompatibility });
  };

  const handleDateRangeChange = (field: 'start' | 'end', value: string) => {
    onFiltersChange({
      dateRange: {
        ...filters.dateRange,
        [field]: value || undefined
      }
    });
  };

  const handleFileSizeChange = (field: 'min' | 'max', value: string) => {
    if (field === 'min') {
      setMinSizeInput(value);
    } else {
      setMaxSizeInput(value);
    }

    const numValue = value ? parseFloat(value) : undefined;
    onFiltersChange({
      fileSizeRange: {
        ...filters.fileSizeRange,
        [field]: numValue
      }
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes >= 1024 * 1024 * 1024) {
      return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    } else if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    } else if (bytes >= 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${bytes} bytes`;
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        {activeFilterCount > 0 && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800"
          >
            <XMarkIcon className="h-3 w-3" />
            Clear all ({activeFilterCount})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Categories */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
            <TagIcon className="h-3 w-3" />
            Categories
          </label>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {categories.length > 0 ? (
              categories.map((category: string) => (
                <label key={category} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(category)}
                    onChange={() => handleCategoryToggle(category)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">{category}</span>
                </label>
              ))
            ) : (
              <p className="text-xs text-gray-500">No categories available</p>
            )}
          </div>
        </div>

        {/* Authors */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
            <UserIcon className="h-3 w-3" />
            Authors
          </label>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {authors.length > 0 ? (
              authors.slice(0, 10).map((author: string) => (
                <label key={author} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={filters.authors.includes(author)}
                    onChange={() => handleAuthorToggle(author)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700 truncate">{author}</span>
                </label>
              ))
            ) : (
              <p className="text-xs text-gray-500">No authors available</p>
            )}
            {authors.length > 10 && (
              <p className="text-xs text-gray-500 italic">+{authors.length - 10} more available</p>
            )}
          </div>
        </div>

        {/* Compatibility */}
        <div>
          <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
            <CpuChipIcon className="h-3 w-3" />
            Compatibility
          </label>
          <div className="space-y-1">
            {compatibilityOptions.map((option: string) => (
              <label key={option} className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={filters.compatibility.includes(option)}
                  onChange={() => handleCompatibilityToggle(option)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div>
        <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
          <CalendarIcon className="h-3 w-3" />
          Date Range
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">From</label>
            <input
              type="date"
              value={filters.dateRange.start || ''}
              onChange={(e) => handleDateRangeChange('start', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">To</label>
            <input
              type="date"
              value={filters.dateRange.end || ''}
              onChange={(e) => handleDateRangeChange('end', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* File Size Range */}
      <div>
        <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
          <DocumentIcon className="h-3 w-3" />
          File Size (MB)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Min</label>
            <input
              type="number"
              placeholder="0"
              value={minSizeInput}
              onChange={(e) => handleFileSizeChange('min', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Max</label>
            <input
              type="number"
              placeholder="No limit"
              value={maxSizeInput}
              onChange={(e) => handleFileSizeChange('max', e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
        {(filters.fileSizeRange.min || filters.fileSizeRange.max) && (
          <p className="text-xs text-gray-500 mt-1">
            Range: {filters.fileSizeRange.min ? formatFileSize(filters.fileSizeRange.min * 1024 * 1024) : 'No min'} - {filters.fileSizeRange.max ? formatFileSize(filters.fileSizeRange.max * 1024 * 1024) : 'No max'}
          </p>
        )}
      </div>
    </div>
  );
};

export default SearchFiltersComponent;