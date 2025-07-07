import React from 'react';
import { Modal, ModalBody, ModalFooter } from './Modal';
import { Button } from './Button';
import { formatBytes } from '../../utils/format';
import type { Addon } from '../../types/api';

interface DownloadConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  addon: Addon | null;
  isLoading?: boolean;
}

export function DownloadConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  addon,
  isLoading = false,
}: DownloadConfirmDialogProps) {
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

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Download" size="md">
      <ModalBody>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <svg className="h-12 w-12 text-primary-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-lg font-medium text-gray-900">{addon.name}</h4>
              <p className="text-sm text-gray-600">{addon.fileName}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-900 mb-3">Download Details</h5>
            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Compatibility</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCompatibilityBadgeColor(addon.compatibility)}`}>
                    {addon.compatibility}
                  </span>
                </dd>
              </div>
              {addon.size && (
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">File Size</dt>
                  <dd className="mt-1 text-sm text-gray-900">{formatBytes(addon.size)}</dd>
                </div>
              )}
              {addon.author && (
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Author</dt>
                  <dd className="mt-1 text-sm text-gray-900">{addon.author}</dd>
                </div>
              )}
              {addon.version && (
                <div>
                  <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">Version</dt>
                  <dd className="mt-1 text-sm text-gray-900">{addon.version}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">Download Information</h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>The download will be added to your download queue</li>
                    <li>You can monitor progress in the Downloads section</li>
                    <li>Files will be saved to your configured download directory</li>
                    {addon.magnetLink && <li>This download uses torrent technology for faster speeds</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button onClick={onConfirm} loading={isLoading}>
          Start Download
        </Button>
      </ModalFooter>
    </Modal>
  );
}
