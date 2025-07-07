import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAddon, useStartDownload } from '../services/queries';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingOverlay } from '../components/ui/LoadingSpinner';
import { formatBytes, formatRelativeTime } from '../utils/format';

export function AddonDetails() {
  const { id } = useParams<{ id: string }>();
  const { data: addon, isLoading, error } = useAddon(id!);
  const startDownload = useStartDownload();

  const handleDownload = () => {
    if (addon) {
      startDownload.mutate(addon.id, {
        onSuccess: () => {
          alert('Download started successfully!');
        },
        onError: (error) => {
          alert(`Failed to start download: ${error.message}`);
        },
      });
    }
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
    return <LoadingOverlay>Loading addon details...</LoadingOverlay>;
  }

  if (error || !addon) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">Addon not found</h3>
        <p className="mt-1 text-sm text-gray-500">The addon you're looking for doesn't exist.</p>
        <div className="mt-6">
          <Link to="/addons">
            <Button>Back to Addons</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          <li>
            <Link to="/addons" className="text-gray-400 hover:text-gray-500">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
              <span className="sr-only">Addons</span>
            </Link>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <Link to="/addons" className="ml-4 text-sm font-medium text-gray-500 hover:text-gray-700">
                Browse Addons
              </Link>
            </div>
          </li>
          <li>
            <div className="flex items-center">
              <svg className="h-5 w-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="ml-4 text-sm font-medium text-gray-500 truncate">
                {addon.name}
              </span>
            </div>
          </li>
        </ol>
      </nav>

      {/* Main Content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Addon Info */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl">{addon.name}</CardTitle>
                  <p className="mt-1 text-sm text-gray-600">{addon.fileName}</p>
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCompatibilityBadgeColor(addon.compatibility)}`}>
                  {addon.compatibility}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Description */}
                {addon.description && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700">{addon.description}</p>
                  </div>
                )}

                {/* Details Grid */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Details</h3>
                  <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {addon.author && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Author</dt>
                        <dd className="mt-1 text-sm text-gray-900">{addon.author}</dd>
                      </div>
                    )}
                    {addon.version && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Version</dt>
                        <dd className="mt-1 text-sm text-gray-900">{addon.version}</dd>
                      </div>
                    )}
                    {addon.category && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">Category</dt>
                        <dd className="mt-1 text-sm text-gray-900">{addon.category}</dd>
                      </div>
                    )}
                    {addon.size && (
                      <div>
                        <dt className="text-sm font-medium text-gray-500">File Size</dt>
                        <dd className="mt-1 text-sm text-gray-900">{formatBytes(addon.size)}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Date Added</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatRelativeTime(addon.dateAdded)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">Compatibility</dt>
                      <dd className="mt-1 text-sm text-gray-900">{addon.compatibility}</dd>
                    </div>
                  </dl>
                </div>

                {/* Tags */}
                {addon.tags && addon.tags.length > 0 && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {addon.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Download Panel */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Download</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button
                  onClick={handleDownload}
                  loading={startDownload.isPending}
                  className="w-full"
                  size="lg"
                >
                  <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Download Addon
                </Button>

                {addon.magnetLink && (
                  <Button variant="outline" className="w-full">
                    <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    Copy Magnet Link
                  </Button>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Download Info</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    {addon.size && (
                      <div className="flex justify-between">
                        <span>File Size:</span>
                        <span>{formatBytes(addon.size)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Format:</span>
                      <span>RAR Archive</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Compatibility:</span>
                      <span>{addon.compatibility}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
