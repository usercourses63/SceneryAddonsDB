import React, { useState, useEffect, useMemo } from 'react';
import {
  ChevronRightIcon,
  ChevronLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowDownTrayIcon,
  DocumentCheckIcon,
  ClockIcon,
  XCircleIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
} from '@heroicons/react/24/outline';
import { AddonSummary } from '@/types/api';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface DownloadWizardProps {
  selectedAddons: AddonSummary[];
  onClose: () => void;
  onStartDownload: (config: DownloadConfig) => void;
  isVisible: boolean;
}

interface DownloadConfig {
  addonIds: string[];
  batchSize: number;
  maxConcurrency: number;
  retryAttempts: number;
  pauseBetweenBatches: number;
  skipExisting: boolean;
  createBackup: boolean;
  organizeByCategory: boolean;
}

interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  estimatedTime: number;
  totalSize: number;
  diskSpaceRequired: number;
}

const WIZARD_STEPS = [
  { id: 'review', title: 'Review Selection', icon: DocumentCheckIcon },
  { id: 'configure', title: 'Configure Download', icon: ArrowDownTrayIcon },
  { id: 'validate', title: 'Validate & Confirm', icon: CheckCircleIcon },
  { id: 'download', title: 'Download Progress', icon: ClockIcon },
];

export const DownloadWizard: React.FC<DownloadWizardProps> = ({
  selectedAddons,
  onClose,
  onStartDownload,
  isVisible,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [downloadConfig, setDownloadConfig] = useState<DownloadConfig>({
    addonIds: selectedAddons.map(addon => addon.id),
    batchSize: 10,
    maxConcurrency: 3,
    retryAttempts: 3,
    pauseBetweenBatches: 1000,
    skipExisting: true,
    createBackup: false,
    organizeByCategory: true,
  });
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Statistics for selected addons
  const selectionStats = useMemo(() => {
    const totalSize = selectedAddons.reduce((sum, addon) => sum + (addon.fileSize || 0), 0);
    const categories = selectedAddons.reduce((acc, addon) => {
      if (addon.categories) {
        addon.categories.forEach(cat => {
          acc[cat] = (acc[cat] || 0) + 1;
        });
      }
      return acc;
    }, {} as Record<string, number>);

    const compatibility = selectedAddons.reduce((acc, addon) => {
      if (addon.compatibility) {
        acc[addon.compatibility] = (acc[addon.compatibility] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      count: selectedAddons.length,
      totalSize,
      categories: Object.entries(categories).map(([name, count]) => ({ name, count })),
      compatibility: Object.entries(compatibility).map(([name, count]) => ({ name, count })),
    };
  }, [selectedAddons]);

  // Validate download configuration
  const validateConfiguration = useMemo(() => {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check download size
    if (selectionStats.totalSize > 5 * 1024 * 1024 * 1024) { // 5GB
      warnings.push('Large download size detected (>5GB). Consider downloading in smaller batches.');
    }

    if (selectionStats.totalSize > 10 * 1024 * 1024 * 1024) { // 10GB
      errors.push('Download size exceeds 10GB limit. Please reduce selection.');
    }

    // Check addon count
    if (selectionStats.count > 50) {
      warnings.push('Large number of addons selected. This may take a while.');
    }

    if (selectionStats.count > 100) {
      errors.push('Maximum 100 addons can be downloaded at once.');
    }

    // Check concurrency settings
    if (downloadConfig.maxConcurrency > 5) {
      warnings.push('High concurrency may impact performance. Consider reducing to 3-5.');
    }

    // Estimate download time (assuming 5MB/s average)
    const estimatedTime = Math.ceil(selectionStats.totalSize / (5 * 1024 * 1024)); // seconds
    const diskSpaceRequired = selectionStats.totalSize * 1.2; // 20% buffer

    return {
      isValid: errors.length === 0,
      warnings,
      errors,
      estimatedTime,
      totalSize: selectionStats.totalSize,
      diskSpaceRequired,
    };
  }, [selectionStats, downloadConfig]);

  useEffect(() => {
    setValidationResult(validateConfiguration);
  }, [validateConfiguration]);

  // Format file size
  const formatSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  // Format time
  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };

  // Handle next step
  const handleNext = () => {
    if (currentStep < WIZARD_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  // Handle previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle download start
  const handleStartDownload = () => {
    if (!validationResult?.isValid) {
      toast.error('Please fix validation errors before proceeding');
      return;
    }

    setIsDownloading(true);
    setCurrentStep(3); // Go to download progress step
    onStartDownload(downloadConfig);
  };

  // Handle download pause/resume
  const handleTogglePause = () => {
    setIsPaused(!isPaused);
    // TODO: Implement actual pause/resume logic
  };

  // Handle download stop
  const handleStopDownload = () => {
    setIsDownloading(false);
    setDownloadProgress(0);
    toast.success('Download stopped');
    onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Download Wizard</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XCircleIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-between p-6 bg-gray-50 border-b border-gray-200">
          {WIZARD_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={`flex items-center ${index < WIZARD_STEPS.length - 1 ? 'flex-1' : ''}`}
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                index <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}>
                {index < currentStep ? (
                  <CheckCircleIcon className="h-5 w-5" />
                ) : (
                  <step.icon className="h-5 w-5" />
                )}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                index <= currentStep ? 'text-blue-600' : 'text-gray-500'
              }`}>
                {step.title}
              </span>
              {index < WIZARD_STEPS.length - 1 && (
                <ChevronRightIcon className="h-5 w-5 text-gray-400 ml-4 flex-1" />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Step 1: Review Selection */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Total Addons</h3>
                  <p className="text-2xl font-bold text-blue-900">{selectionStats.count}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Total Size</h3>
                  <p className="text-2xl font-bold text-green-900">{formatSize(selectionStats.totalSize)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900 mb-2">Est. Time</h3>
                  <p className="text-2xl font-bold text-purple-900">{formatTime(Math.ceil(selectionStats.totalSize / (5 * 1024 * 1024)))}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
                  <div className="space-y-2">
                    {selectionStats.categories.map(category => (
                      <div key={category.name} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{category.name}</span>
                        <span className="text-sm font-medium text-gray-900">{category.count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-3">Compatibility</h3>
                  <div className="space-y-2">
                    {selectionStats.compatibility.map(compat => (
                      <div key={compat.name} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{compat.name}</span>
                        <span className="text-sm font-medium text-gray-900">{compat.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="max-h-64 overflow-y-auto">
                <h3 className="font-medium text-gray-900 mb-3">Selected Addons</h3>
                <div className="space-y-2">
                  {selectedAddons.map(addon => (
                    <div key={addon.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{addon.name}</p>
                        <p className="text-sm text-gray-600">{addon.author} • {addon.compatibility}</p>
                      </div>
                      <span className="text-sm text-gray-500">{formatSize(addon.fileSize || 0)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Configure Download */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Batch Size
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={downloadConfig.batchSize}
                    onChange={(e) => setDownloadConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Number of addons to download simultaneously</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Concurrency
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={downloadConfig.maxConcurrency}
                    onChange={(e) => setDownloadConfig(prev => ({ ...prev, maxConcurrency: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Maximum parallel downloads</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retry Attempts
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={downloadConfig.retryAttempts}
                    onChange={(e) => setDownloadConfig(prev => ({ ...prev, retryAttempts: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Number of retry attempts for failed downloads</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pause Between Batches (ms)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10000"
                    value={downloadConfig.pauseBetweenBatches}
                    onChange={(e) => setDownloadConfig(prev => ({ ...prev, pauseBetweenBatches: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">Delay between batches to prevent server overload</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="skipExisting"
                    checked={downloadConfig.skipExisting}
                    onChange={(e) => setDownloadConfig(prev => ({ ...prev, skipExisting: e.target.checked }))}
                    className="mr-3"
                  />
                  <label htmlFor="skipExisting" className="text-sm font-medium text-gray-700">
                    Skip existing files
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="createBackup"
                    checked={downloadConfig.createBackup}
                    onChange={(e) => setDownloadConfig(prev => ({ ...prev, createBackup: e.target.checked }))}
                    className="mr-3"
                  />
                  <label htmlFor="createBackup" className="text-sm font-medium text-gray-700">
                    Create backup of existing files
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="organizeByCategory"
                    checked={downloadConfig.organizeByCategory}
                    onChange={(e) => setDownloadConfig(prev => ({ ...prev, organizeByCategory: e.target.checked }))}
                    className="mr-3"
                  />
                  <label htmlFor="organizeByCategory" className="text-sm font-medium text-gray-700">
                    Organize downloads by category
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Validate & Confirm */}
          {currentStep === 2 && validationResult && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">Download Size</h3>
                  <p className="text-2xl font-bold text-blue-900">{formatSize(validationResult.totalSize)}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Estimated Time</h3>
                  <p className="text-2xl font-bold text-green-900">{formatTime(validationResult.estimatedTime)}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-900 mb-2">Disk Space</h3>
                  <p className="text-2xl font-bold text-purple-900">{formatSize(validationResult.diskSpaceRequired)}</p>
                </div>
              </div>

              {validationResult.errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600 mr-2" />
                    <h3 className="font-medium text-red-900">Errors</h3>
                  </div>
                  <ul className="space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <li key={index} className="text-sm text-red-700">• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validationResult.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mr-2" />
                    <h3 className="font-medium text-yellow-900">Warnings</h3>
                  </div>
                  <ul className="space-y-1">
                    {validationResult.warnings.map((warning, index) => (
                      <li key={index} className="text-sm text-yellow-700">• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-3">Download Configuration</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Batch Size:</span>
                    <span className="ml-2 font-medium">{downloadConfig.batchSize}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Max Concurrency:</span>
                    <span className="ml-2 font-medium">{downloadConfig.maxConcurrency}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Retry Attempts:</span>
                    <span className="ml-2 font-medium">{downloadConfig.retryAttempts}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Pause Between Batches:</span>
                    <span className="ml-2 font-medium">{downloadConfig.pauseBetweenBatches}ms</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Options:</span>
                    <span className="ml-2 font-medium">
                      {downloadConfig.skipExisting && "Skip existing, "}
                      {downloadConfig.createBackup && "Create backup, "}
                      {downloadConfig.organizeByCategory && "Organize by category"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Download Progress */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-blue-900">Download Progress</h3>
                  <span className="text-sm text-blue-700">{Math.round(downloadProgress)}%</span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-900 mb-2">Completed</h3>
                  <p className="text-2xl font-bold text-green-900">
                    {Math.floor(downloadProgress / 100 * selectionStats.count)}
                  </p>
                  <p className="text-sm text-green-700">of {selectionStats.count} addons</p>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-900 mb-2">In Progress</h3>
                  <p className="text-2xl font-bold text-blue-900">{downloadConfig.maxConcurrency}</p>
                  <p className="text-sm text-blue-700">active downloads</p>
                </div>
                <div className="bg-orange-50 p-4 rounded-lg">
                  <h3 className="font-medium text-orange-900 mb-2">Remaining</h3>
                  <p className="text-2xl font-bold text-orange-900">
                    {selectionStats.count - Math.floor(downloadProgress / 100 * selectionStats.count)}
                  </p>
                  <p className="text-sm text-orange-700">addons queued</p>
                </div>
              </div>

              <div className="flex justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={handleTogglePause}
                  disabled={!isDownloading}
                >
                  {isPaused ? (
                    <>
                      <PlayIcon className="h-4 w-4 mr-2" />
                      Resume
                    </>
                  ) : (
                    <>
                      <PauseIcon className="h-4 w-4 mr-2" />
                      Pause
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleStopDownload}
                  className="text-red-600 hover:text-red-700"
                >
                  <StopIcon className="h-4 w-4 mr-2" />
                  Stop
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0 || isDownloading}
          >
            <ChevronLeftIcon className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-3">
            {currentStep < 2 && (
              <Button onClick={handleNext}>
                Next
                <ChevronRightIcon className="h-4 w-4 ml-2" />
              </Button>
            )}

            {currentStep === 2 && (
              <Button
                onClick={handleStartDownload}
                disabled={!validationResult?.isValid}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                Start Download
              </Button>
            )}

            {currentStep === 3 && downloadProgress >= 100 && (
              <Button onClick={onClose} className="bg-green-600 hover:bg-green-700">
                <CheckCircleIcon className="h-4 w-4 mr-2" />
                Complete
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DownloadWizard;