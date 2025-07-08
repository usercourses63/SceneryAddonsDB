import React, { useState, useCallback, useMemo } from 'react';
import {
  ArrowDownTrayIcon,
  TagIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { AddonSummary } from '@/types/api';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface BulkOperationsPanel {
  addons: AddonSummary[];
  selectedAddons: Set<string>;
  onAddonSelect: (addonId: string, selected: boolean) => void;
  onSelectionChange: (selection: Set<string>) => void;
  onStartBulkDownload: (addonIds: string[]) => void;
  isDownloading: boolean;
}

interface SelectionCriteria {
  categories: string[];
  compatibility: string[];
  authors: string[];
  dateRange: {
    start?: string;
    end?: string;
  };
  fileSizeRange: {
    min?: number;
    max?: number;
  };
}

interface BulkOperationStats {
  totalSelected: number;
  totalSize: number;
  averageSize: number;
  categories: Record<string, number>;
  compatibility: Record<string, number>;
}

export const BulkOperationsPanel: React.FC<BulkOperationsPanel> = ({
  addons,
  selectedAddons,
  onAddonSelect,
  onSelectionChange,
  onStartBulkDownload,
  isDownloading,
}) => {
  const [showAdvancedSelection, setShowAdvancedSelection] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [selectionCriteria, setSelectionCriteria] = useState<SelectionCriteria>({
    categories: [],
    compatibility: [],
    authors: [],
    dateRange: {},
    fileSizeRange: {},
  });

  // Calculate statistics for selected addons
  const bulkStats: BulkOperationStats = useMemo(() => {
    const selectedAddonsList = addons.filter(addon => selectedAddons.has(addon.id));
    
    const stats: BulkOperationStats = {
      totalSelected: selectedAddonsList.length,
      totalSize: selectedAddonsList.reduce((sum, addon) => sum + (addon.fileSize || 0), 0),
      averageSize: 0,
      categories: {},
      compatibility: {},
    };

    stats.averageSize = stats.totalSelected > 0 ? stats.totalSize / stats.totalSelected : 0;

    // Count categories and compatibility
    selectedAddonsList.forEach(addon => {
      if (addon.categories && addon.categories.length > 0) {
        addon.categories.forEach(category => {
          stats.categories[category] = (stats.categories[category] || 0) + 1;
        });
      }
      if (addon.compatibility) {
        stats.compatibility[addon.compatibility] = (stats.compatibility[addon.compatibility] || 0) + 1;
      }
    });

    return stats;
  }, [addons, selectedAddons]);

  // Get unique values for selection criteria
  const uniqueValues = useMemo(() => {
    const categories = new Set<string>();
    const compatibility = new Set<string>();
    const authors = new Set<string>();

    addons.forEach(addon => {
      // Handle categories - fallback to extracting from addon name or using compatibility as category
      if (addon.categories && addon.categories.length > 0) {
        addon.categories.forEach(category => categories.add(category));
      } else {
        // Fallback: use compatibility as a category
        if (addon.compatibility) {
          categories.add(addon.compatibility);
        }
      }
      
      if (addon.compatibility) compatibility.add(addon.compatibility);
      if (addon.author) authors.add(addon.author);
    });

    return {
      categories: Array.from(categories).sort(),
      compatibility: Array.from(compatibility).sort(),
      authors: Array.from(authors).sort(),
    };
  }, [addons]);

  // Smart selection based on criteria
  const handleSmartSelection = useCallback(() => {
    const matchingAddons = addons.filter(addon => {
      // Category filter
      if (selectionCriteria.categories.length > 0) {
        if (!addon.categories || !addon.categories.some(cat => selectionCriteria.categories.includes(cat))) {
          return false;
        }
      }

      // Compatibility filter
      if (selectionCriteria.compatibility.length > 0) {
        if (!addon.compatibility || !selectionCriteria.compatibility.includes(addon.compatibility)) {
          return false;
        }
      }

      // Author filter
      if (selectionCriteria.authors.length > 0) {
        if (!addon.author || !selectionCriteria.authors.includes(addon.author)) {
          return false;
        }
      }

      // Date range filter
      if (selectionCriteria.dateRange.start || selectionCriteria.dateRange.end) {
        const addonDate = new Date(addon.dateAdded);
        if (selectionCriteria.dateRange.start && addonDate < new Date(selectionCriteria.dateRange.start)) {
          return false;
        }
        if (selectionCriteria.dateRange.end && addonDate > new Date(selectionCriteria.dateRange.end)) {
          return false;
        }
      }

      // File size filter
      if (selectionCriteria.fileSizeRange.min || selectionCriteria.fileSizeRange.max) {
        const fileSize = addon.fileSize || 0;
        if (selectionCriteria.fileSizeRange.min && fileSize < selectionCriteria.fileSizeRange.min) {
          return false;
        }
        if (selectionCriteria.fileSizeRange.max && fileSize > selectionCriteria.fileSizeRange.max) {
          return false;
        }
      }

      return true;
    });

    const newSelection = new Set(matchingAddons.map(addon => addon.id));
    onSelectionChange(newSelection);
    toast.success(`Selected ${matchingAddons.length} addons matching criteria`);
  }, [addons, selectionCriteria, onSelectionChange]);

  // Handle bulk download with validation
  const handleBulkDownload = useCallback(() => {
    if (selectedAddons.size === 0) {
      toast.error('Please select at least one addon to download');
      return;
    }

    // Validate selection
    const totalSize = bulkStats.totalSize;
    const totalCount = bulkStats.totalSelected;

    if (totalSize > 10 * 1024 * 1024 * 1024) { // 10GB limit
      toast.error('Total download size exceeds 10GB limit. Please reduce selection.');
      return;
    }

    if (totalCount > 100) {
      toast.error('Maximum 100 addons can be downloaded at once. Please reduce selection.');
      return;
    }

    onStartBulkDownload(Array.from(selectedAddons));
  }, [selectedAddons, bulkStats, onStartBulkDownload]);

  // Export selection to JSON
  const handleExportSelection = useCallback(() => {
    const selectedAddonsList = addons.filter(addon => selectedAddons.has(addon.id));
    const exportData = {
      exported: new Date().toISOString(),
      count: selectedAddonsList.length,
      addons: selectedAddonsList.map(addon => ({
        id: addon.id,
        name: addon.name,
        author: addon.author,
        categories: addon.categories,
        compatibility: addon.compatibility,
        dateAdded: addon.dateAdded,
        fileSize: addon.fileSize,
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `addon-selection-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Selection exported successfully');
  }, [addons, selectedAddons]);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white border-t border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Bulk Operations</h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvancedSelection(!showAdvancedSelection)}
          >
            <AdjustmentsHorizontalIcon className="h-4 w-4" />
            Advanced Selection
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowExportOptions(!showExportOptions)}
          >
            <DocumentArrowDownIcon className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Selection Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Selected</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 mt-1">{bulkStats.totalSelected}</p>
          <p className="text-sm text-blue-700">of {addons.length} addons</p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <ArrowDownTrayIcon className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-900">Total Size</span>
          </div>
          <p className="text-2xl font-bold text-green-900 mt-1">{formatFileSize(bulkStats.totalSize)}</p>
          <p className="text-sm text-green-700">Avg: {formatFileSize(bulkStats.averageSize)}</p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <TagIcon className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-900">Categories</span>
          </div>
          <p className="text-2xl font-bold text-purple-900 mt-1">{Object.keys(bulkStats.categories).length}</p>
          <p className="text-sm text-purple-700">Different types</p>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-orange-600" />
            <span className="text-sm font-medium text-orange-900">Est. Time</span>
          </div>
          <p className="text-2xl font-bold text-orange-900 mt-1">
            {Math.ceil(bulkStats.totalSelected / 5)}m
          </p>
          <p className="text-sm text-orange-700">At 5 addons/min</p>
        </div>
      </div>

      {/* Advanced Selection Panel */}
      {showAdvancedSelection && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-gray-900 mb-4">Advanced Selection Criteria</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Categories */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Categories</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {uniqueValues.categories.map(category => (
                  <label key={category} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectionCriteria.categories.includes(category)}
                      onChange={(e) => {
                        const newCategories = e.target.checked
                          ? [...selectionCriteria.categories, category]
                          : selectionCriteria.categories.filter(c => c !== category);
                        setSelectionCriteria(prev => ({ ...prev, categories: newCategories }));
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Compatibility */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Compatibility</label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {uniqueValues.compatibility.map(compat => (
                  <label key={compat} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectionCriteria.compatibility.includes(compat)}
                      onChange={(e) => {
                        const newCompatibility = e.target.checked
                          ? [...selectionCriteria.compatibility, compat]
                          : selectionCriteria.compatibility.filter(c => c !== compat);
                        setSelectionCriteria(prev => ({ ...prev, compatibility: newCompatibility }));
                      }}
                      className="mr-2"
                    />
                    <span className="text-sm text-gray-700">{compat}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  placeholder="Start date"
                  value={selectionCriteria.dateRange.start || ''}
                  onChange={(e) => setSelectionCriteria(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, start: e.target.value }
                  }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="date"
                  placeholder="End date"
                  value={selectionCriteria.dateRange.end || ''}
                  onChange={(e) => setSelectionCriteria(prev => ({
                    ...prev,
                    dateRange: { ...prev.dateRange, end: e.target.value }
                  }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            {/* File Size Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">File Size (MB)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min size"
                  value={selectionCriteria.fileSizeRange.min || ''}
                  onChange={(e) => setSelectionCriteria(prev => ({
                    ...prev,
                    fileSizeRange: { ...prev.fileSizeRange, min: Number(e.target.value) || undefined }
                  }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="number"
                  placeholder="Max size"
                  value={selectionCriteria.fileSizeRange.max || ''}
                  onChange={(e) => setSelectionCriteria(prev => ({
                    ...prev,
                    fileSizeRange: { ...prev.fileSizeRange, max: Number(e.target.value) || undefined }
                  }))}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleSmartSelection}>
              <FunnelIcon className="h-4 w-4 mr-2" />
              Apply Selection
            </Button>
          </div>
        </div>
      )}

      {/* Export Options */}
      {showExportOptions && (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h3 className="font-medium text-gray-900 mb-4">Export Options</h3>
          
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={handleExportSelection}
              disabled={selectedAddons.size === 0}
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export as JSON
            </Button>
            <Button
              variant="outline"
              disabled={selectedAddons.size === 0}
            >
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export as CSV
            </Button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => onSelectionChange(new Set())}
            disabled={selectedAddons.size === 0}
          >
            <XCircleIcon className="h-4 w-4 mr-2" />
            Clear Selection
          </Button>
          <Button
            variant="outline"
            onClick={() => onSelectionChange(new Set(addons.map(addon => addon.id)))}
          >
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            Select All
          </Button>
        </div>

        <Button
          onClick={handleBulkDownload}
          disabled={selectedAddons.size === 0 || isDownloading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isDownloading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
              Starting Download...
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Download Selected ({selectedAddons.size})
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BulkOperationsPanel;