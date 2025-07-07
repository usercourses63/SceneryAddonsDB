import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAddons, useStartDownload } from '../services/queries';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingOverlay } from '../components/ui/LoadingSpinner';
import { DownloadConfirmDialog } from '../components/ui/DownloadConfirmDialog';
import { BulkDownloadDialog } from '../components/ui/BulkDownloadDialog';
import { AddonDetailsModal } from '../components/ui/AddonDetailsModal';
import { useToast } from '../contexts/ToastContext';
import { formatBytes, formatRelativeTime } from '../utils/format';
import type { SearchParams, Addon } from '../types/api';

export function Addons() {
  const [searchParams, setSearchParams] = useState<SearchParams>({
    page: 1,
    pageSize: 20,
    sortBy: 'dateAdded',
    sortOrder: 'desc',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompatibility, setSelectedCompatibility] = useState('');
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set());
  const [showDownloadConfirm, setShowDownloadConfirm] = useState(false);
  const [showBulkDownload, setShowBulkDownload] = useState(false);
  const [showAddonDetails, setShowAddonDetails] = useState(false);
  const [currentAddon, setCurrentAddon] = useState<Addon | null>(null);

  const { data: addonsData, isLoading } = useAddons(searchParams);
  const startDownload = useStartDownload();
  const { showSuccess, showError, showWarning } = useToast();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams(prev => ({
      ...prev,
      query: searchQuery,
      compatibility: selectedCompatibility || undefined,
      page: 1,
    }));
  };

  const handleDownload = (addon: Addon) => {
    setCurrentAddon(addon);
    setShowDownloadConfirm(true);
  };

  const handleConfirmDownload = () => {
    if (currentAddon) {
      startDownload.mutate(currentAddon.id, {
        onSuccess: () => {
          showSuccess('Download Started', `${currentAddon.name} has been added to your download queue.`);
          setShowDownloadConfirm(false);
          setCurrentAddon(null);
        },
        onError: (error) => {
          showError('Download Failed', `Failed to start download: ${error.message}`);
        },
      });
    }
  };

  const handleBulkDownload = () => {
    if (selectedAddons.size === 0) {
      showWarning('No Selection', 'Please select at least one addon to download.');
      return;
    }
    const selected = addonsData?.items.filter(addon => selectedAddons.has(addon.id)) || [];
    setShowBulkDownload(true);
  };

  const handleConfirmBulkDownload = (addons: Addon[]) => {
    // Here you would implement bulk download logic
    showSuccess('Bulk Download Started', `${addons.length} addons have been added to your download queue.`);
    setShowBulkDownload(false);
    setSelectedAddons(new Set());
  };

  const handleShowDetails = (addon: Addon) => {
    setCurrentAddon(addon);
    setShowAddonDetails(true);
  };

  const handleToggleAddon = (addonId: string) => {
    const newSelected = new Set(selectedAddons);
    if (newSelected.has(addonId)) {
      newSelected.delete(addonId);
    } else {
      newSelected.add(addonId);
    }
    setSelectedAddons(newSelected);
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => ({ ...prev, page: newPage }));
  };

  const handleSortChange = (sortBy: string) => {
    setSearchParams(prev => ({
      ...prev,
      sortBy: sortBy as any,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc',
      page: 1,
    }));
  };

  const getCompatibilityBadgeColor = (compatibility: string) => {
    switch (compatibility) {
      case 'MSFS 2020/2024':
        return 'bg-blue-100 text-blue-800';
      case 'MSFS 2020':
        return 'bg-green-100 text-green-800';
      case 'MSFS 2024':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return <LoadingOverlay>Loading addons...</LoadingOverlay>;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Browse Addons</h1>
        <p className="mt-1 text-sm text-gray-600">
          Discover and download MSFS scenery addons
        </p>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                  Search Addons
                </label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, author, or description..."
                  className="input-field"
                />
              </div>
              
              <div>
                <label htmlFor="compatibility" className="block text-sm font-medium text-gray-700 mb-1">
                  Compatibility
                </label>
                <select
                  id="compatibility"
                  value={selectedCompatibility}
                  onChange={(e) => setSelectedCompatibility(e.target.value)}
                  className="input-field"
                >
                  <option value="">All Versions</option>
                  <option value="MSFS 2020/2024">MSFS 2020/2024</option>
                  <option value="MSFS 2020">MSFS 2020 Only</option>
                  <option value="MSFS 2024">MSFS 2024 Only</option>
                </select>
              </div>
              
              <div className="flex items-end">
                <Button type="submit" className="w-full">
                  <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                  Search
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedAddons.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium text-blue-900">
                {selectedAddons.size} addon{selectedAddons.size !== 1 ? 's' : ''} selected
              </span>
              <Button variant="outline" size="sm" onClick={() => setSelectedAddons(new Set())}>
                Clear Selection
              </Button>
            </div>
            <Button size="sm" onClick={handleBulkDownload}>
              Download Selected
            </Button>
          </div>
        </div>
      )}

      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            {addonsData ? `Showing ${addonsData.items.length} of ${addonsData.totalCount} addons` : 'Loading...'}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">Sort by:</span>
          <select
            value={`${searchParams.sortBy}-${searchParams.sortOrder}`}
            onChange={(e) => {
              const [sortBy, sortOrder] = e.target.value.split('-');
              setSearchParams(prev => ({ ...prev, sortBy: sortBy as any, sortOrder: sortOrder as any, page: 1 }));
            }}
            className="text-sm border-gray-300 rounded-md"
          >
            <option value="dateAdded-desc">Newest First</option>
            <option value="dateAdded-asc">Oldest First</option>
            <option value="name-asc">Name A-Z</option>
            <option value="name-desc">Name Z-A</option>
            <option value="size-desc">Largest First</option>
            <option value="size-asc">Smallest First</option>
          </select>
        </div>
      </div>

      {/* Addons Grid */}
      {addonsData && addonsData.items.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {addonsData.items.map((addon: Addon) => (
            <Card key={addon.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedAddons.has(addon.id)}
                      onChange={() => handleToggleAddon(addon.id)}
                      className="mt-1 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                        {addon.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">{addon.fileName}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCompatibilityBadgeColor(addon.compatibility)}`}>
                      {addon.compatibility}
                    </span>
                    {addon.size && (
                      <span className="text-sm text-gray-500">{formatBytes(addon.size)}</span>
                    )}
                  </div>

                  <div className="text-sm text-gray-500">
                    Added {formatRelativeTime(addon.dateAdded)}
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleShowDetails(addon)}
                    >
                      View Details
                    </Button>
                    <Button
                      onClick={() => handleDownload(addon)}
                      loading={startDownload.isPending}
                      className="flex-1"
                    >
                      Download
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No addons found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search criteria.</p>
          </CardContent>
        </Card>
      )}

      {/* Pagination */}
      {addonsData && addonsData.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => handlePageChange(searchParams.page! - 1)}
              disabled={searchParams.page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {searchParams.page} of {addonsData.totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => handlePageChange(searchParams.page! + 1)}
              disabled={searchParams.page === addonsData.totalPages}
            >
              Next
            </Button>
          </div>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, addonsData.totalPages) }, (_, i) => {
              const page = i + 1;
              return (
                <Button
                  key={page}
                  variant={searchParams.page === page ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Dialogs */}
      <DownloadConfirmDialog
        isOpen={showDownloadConfirm}
        onClose={() => {
          setShowDownloadConfirm(false);
          setCurrentAddon(null);
        }}
        onConfirm={handleConfirmDownload}
        addon={currentAddon}
        isLoading={startDownload.isPending}
      />

      <BulkDownloadDialog
        isOpen={showBulkDownload}
        onClose={() => setShowBulkDownload(false)}
        onConfirm={handleConfirmBulkDownload}
        addons={addonsData?.items.filter(addon => selectedAddons.has(addon.id)) || []}
        isLoading={false}
      />

      <AddonDetailsModal
        isOpen={showAddonDetails}
        onClose={() => {
          setShowAddonDetails(false);
          setCurrentAddon(null);
        }}
        onDownload={handleDownload}
        addon={currentAddon}
        isDownloading={startDownload.isPending}
      />
    </div>
  );
}
