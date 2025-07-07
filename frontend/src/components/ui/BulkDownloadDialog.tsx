import React, { useState } from 'react';
import { Modal, ModalBody, ModalFooter } from './Modal';
import { Button } from './Button';
import { formatBytes } from '../../utils/format';
import type { Addon } from '../../types/api';

interface BulkDownloadDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (selectedAddons: Addon[]) => void;
  addons: Addon[];
  isLoading?: boolean;
}

export function BulkDownloadDialog({
  isOpen,
  onClose,
  onConfirm,
  addons,
  isLoading = false,
}: BulkDownloadDialogProps) {
  const [selectedAddons, setSelectedAddons] = useState<Set<string>>(new Set(addons.map(a => a.id)));

  const handleToggleAddon = (addonId: string) => {
    const newSelected = new Set(selectedAddons);
    if (newSelected.has(addonId)) {
      newSelected.delete(addonId);
    } else {
      newSelected.add(addonId);
    }
    setSelectedAddons(newSelected);
  };

  const handleSelectAll = () => {
    setSelectedAddons(new Set(addons.map(a => a.id)));
  };

  const handleSelectNone = () => {
    setSelectedAddons(new Set());
  };

  const handleConfirm = () => {
    const selected = addons.filter(addon => selectedAddons.has(addon.id));
    onConfirm(selected);
  };

  const selectedAddonsList = addons.filter(addon => selectedAddons.has(addon.id));
  const totalSize = selectedAddonsList.reduce((sum, addon) => sum + (addon.size || 0), 0);

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
    <Modal isOpen={isOpen} onClose={onClose} title="Bulk Download" size="lg">
      <ModalBody>
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Addons</p>
                <p className="text-2xl font-bold text-gray-900">{addons.length}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Selected</p>
                <p className="text-2xl font-bold text-primary-600">{selectedAddons.size}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Size</p>
                <p className="text-2xl font-bold text-gray-900">{formatBytes(totalSize)}</p>
              </div>
            </div>
          </div>

          {/* Selection Controls */}
          <div className="flex justify-between items-center">
            <h4 className="text-lg font-medium text-gray-900">Select Addons to Download</h4>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                Select All
              </Button>
              <Button variant="outline" size="sm" onClick={handleSelectNone}>
                Select None
              </Button>
            </div>
          </div>

          {/* Addons List */}
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <div className="space-y-0">
              {addons.map((addon) => (
                <div
                  key={addon.id}
                  className="flex items-center p-4 border-b border-gray-200 last:border-b-0 hover:bg-gray-50"
                >
                  <input
                    type="checkbox"
                    checked={selectedAddons.has(addon.id)}
                    onChange={() => handleToggleAddon(addon.id)}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <div className="ml-3 flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-gray-900 truncate">{addon.name}</h5>
                        <p className="text-xs text-gray-500 truncate">{addon.fileName}</p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCompatibilityBadgeColor(addon.compatibility)}`}>
                          {addon.compatibility}
                        </span>
                        {addon.size && (
                          <span className="text-xs text-gray-500">{formatBytes(addon.size)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning */}
          {selectedAddons.size > 10 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">Large Download Warning</h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>You've selected {selectedAddons.size} addons for download. This may take a significant amount of time and bandwidth.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={onClose} disabled={isLoading}>
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          loading={isLoading}
          disabled={selectedAddons.size === 0}
        >
          Download {selectedAddons.size} Addon{selectedAddons.size !== 1 ? 's' : ''}
        </Button>
      </ModalFooter>
    </Modal>
  );
}
