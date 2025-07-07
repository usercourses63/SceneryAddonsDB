import React from 'react';
import { Modal, ModalBody, ModalFooter } from './Modal';
import { Button } from './Button';
import { formatBytes, formatRelativeTime } from '../../utils/format';
import type { Addon } from '../../types/api';

interface AddonDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: (addon: Addon) => void;
  addon: Addon | null;
  isDownloading?: boolean;
}

export function AddonDetailsModal({
  isOpen,
  onClose,
  onDownload,
  addon,
  isDownloading = false,
}: AddonDetailsModalProps) {
  if (!addon) return null;

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

  const handleCopyMagnetLink = () => {
    if (addon.magnetLink) {
      navigator.clipboard.writeText(addon.magnetLink);
      // You could add a toast notification here
      alert('Magnet link copied to clipboard!');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={addon.name} size="lg">
      <ModalBody>
        <div className="space-y-6">
          {/* Basic Info */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium text-gray-900">Basic Information</h4>
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getCompatibilityBadgeColor(addon.compatibility)}`}>
                {addon.compatibility}
              </span>
            </div>
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">File Name</dt>
                <dd className="mt-1 text-sm text-gray-900">{addon.fileName}</dd>
              </div>
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
            </dl>
          </div>

          {/* Description */}
          {addon.description && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Description</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{addon.description}</p>
            </div>
          )}

          {/* Tags */}
          {addon.tags && addon.tags.length > 0 && (
            <div>
              <h4 className="text-lg font-medium text-gray-900 mb-2">Tags</h4>
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

          {/* Download Options */}
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-4">Download Options</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  <svg className="h-5 w-5 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Direct Download</p>
                    <p className="text-xs text-gray-500">Download directly through our servers</p>
                  </div>
                </div>
                <Button size="sm" onClick={() => onDownload(addon)} loading={isDownloading}>
                  Download
                </Button>
              </div>

              {addon.magnetLink && (
                <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Magnet Link</p>
                      <p className="text-xs text-gray-500">Use with your torrent client for faster downloads</p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleCopyMagnetLink}>
                    Copy Link
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Compatibility Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Compatibility Information</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>This addon is compatible with <strong>{addon.compatibility}</strong>.</p>
                  <p className="mt-1">Make sure you have the correct version of Microsoft Flight Simulator installed.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button onClick={() => onDownload(addon)} loading={isDownloading}>
          <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
          Download Now
        </Button>
      </ModalFooter>
    </Modal>
  );
}
