import { FC, useState } from 'react';
import {
  CalendarIcon,
  UserIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { AddonSummary } from '../../types/api';
import { useDownloadAddon } from '../../hooks/useDownloads';

interface AddonCardProps {
  addon: AddonSummary;
  selectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
}

const AddonCard: FC<AddonCardProps> = ({ addon, selectMode = false, isSelected = false, onSelect }) => {
  const [isDownloaded, setIsDownloaded] = useState(false);
  const downloadAddon = useDownloadAddon();

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: string): string => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleDownload = () => {
    downloadAddon.mutate(addon.id, {
      onSuccess: () => {
        setIsDownloaded(true);
      }
    });
  };

  const getCompatibilityBadgeColor = (compatibility: string) => {
    switch (compatibility) {
      case 'MSFS 2024':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'MSFS 2020':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MSFS 2020/2024':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className={`bg-white rounded-lg border shadow-sm hover:shadow-md transition-all duration-200 ${
      selectMode && isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
    }`}>
      {/* Thumbnail or Icon */}
      <div className="aspect-video bg-gradient-to-br from-blue-50 to-indigo-100 rounded-t-lg flex items-center justify-center relative overflow-hidden">
        {/* Selection Checkbox */}
        {selectMode && (
          <div className="absolute top-2 left-2 z-10">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect?.(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
          </div>
        )}
        {addon.thumbnailUrl ? (
          <img
            src={addon.thumbnailUrl}
            alt={addon.name}
            className="w-full h-full object-cover rounded-t-lg"
            onError={(e) => {
              // If image fails to load, hide it and show fallback
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = 'flex';
            }}
          />
        ) : null}
        {/* Fallback content */}
        <div className={`w-full h-full flex flex-col items-center justify-center ${addon.thumbnailUrl ? 'hidden' : 'flex'}`}>
          <DocumentIcon className="h-12 w-12 text-blue-400 mb-2" />
          <div className="text-center px-3">
            <div className="text-xs font-medium text-blue-600 mb-1">
              {addon.categories?.[0] || 'Addon'}
            </div>
            <div className="text-xs text-blue-500 line-clamp-2">
              {addon.name.split(' ').slice(0, 4).join(' ')}
            </div>
          </div>
        </div>
        
        {/* Compatibility Badge */}
        <div className="absolute top-2 right-2">
          <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-md border ${getCompatibilityBadgeColor(addon.compatibility)}`}>
            {addon.compatibility}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
          {addon.name}
        </h3>

        {/* Description */}
        {addon.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {addon.description}
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-2 text-xs text-gray-500">
          {/* Author */}
          {addon.author && (
            <div className="flex items-center gap-1">
              <UserIcon className="h-3 w-3" />
              <span>{addon.author}</span>
            </div>
          )}

          {/* File Size */}
          {addon.fileSize && (
            <div className="flex items-center gap-1">
              <DocumentIcon className="h-3 w-3" />
              <span>{formatFileSize(addon.fileSize)}</span>
            </div>
          )}

          {/* Date Added */}
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            <span>{formatDate(addon.dateAdded)}</span>
          </div>
        </div>

        {/* Categories */}
        {addon.categories && addon.categories.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1">
            {addon.categories.slice(0, 3).map((category, index) => (
              <span
                key={index}
                className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
              >
                {category}
              </span>
            ))}
            {addon.categories.length > 3 && (
              <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                +{addon.categories.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          {!selectMode && (
            <>
              <button
                onClick={handleDownload}
                disabled={downloadAddon.isPending || isDownloaded}
                className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                  isDownloaded
                    ? 'bg-green-600 text-white'
                    : downloadAddon.isPending
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {downloadAddon.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Downloading...
                  </>
                ) : isDownloaded ? (
                  <>
                    <CheckIcon className="h-4 w-4" />
                    Downloaded
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="h-4 w-4" />
                    Download
                  </>
                )}
              </button>
              <button className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors">
                <EyeIcon className="h-4 w-4" />
                Details
              </button>
            </>
          )}
          {selectMode && (
            <button
              onClick={() => onSelect?.(!isSelected)}
              className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium py-2 px-3 rounded-lg transition-colors ${
                isSelected
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isSelected ? 'Selected' : 'Select'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddonCard;