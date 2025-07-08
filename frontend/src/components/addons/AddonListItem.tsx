import { FC } from 'react';
import {
  CalendarIcon,
  UserIcon,
  DocumentIcon,
  ArrowDownTrayIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { AddonSummary } from '../../types/api';

interface AddonListItemProps {
  addon: AddonSummary;
  selectMode?: boolean;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
}

const AddonListItem: FC<AddonListItemProps> = ({ addon, selectMode = false, isSelected = false, onSelect }) => {
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

  return (
    <div className={`bg-white border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
      selectMode && isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
    }`}>
      <div className="flex items-start justify-between">
        {/* Selection Checkbox */}
        {selectMode && (
          <div className="flex-none mr-4">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => onSelect?.(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
          </div>
        )}
        
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-4">
            {/* Thumbnail */}
            <div className="flex-none w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
              {addon.thumbnailUrl ? (
                <img 
                  src={addon.thumbnailUrl} 
                  alt={addon.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <DocumentIcon className="h-8 w-8 text-gray-400" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Title and Description */}
              <div className="mb-2">
                <h3 className="text-lg font-semibold text-gray-900 truncate">
                  {addon.name}
                </h3>
                {addon.description && (
                  <p className="text-gray-600 text-sm mt-1 line-clamp-2">
                    {addon.description}
                  </p>
                )}
              </div>

              {/* Metadata Row */}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                {addon.author && (
                  <div className="flex items-center gap-1">
                    <UserIcon className="h-4 w-4" />
                    <span>{addon.author}</span>
                  </div>
                )}
                
                {addon.fileSize && (
                  <div className="flex items-center gap-1">
                    <DocumentIcon className="h-4 w-4" />
                    <span>{formatFileSize(addon.fileSize)}</span>
                  </div>
                )}

                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{formatDate(addon.dateAdded)}</span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-blue-600 font-medium">{addon.compatibility}</span>
                </div>
              </div>

              {/* Categories */}
              {addon.categories && addon.categories.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {addon.categories.slice(0, 4).map((category, index) => (
                    <span
                      key={index}
                      className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full"
                    >
                      {category}
                    </span>
                  ))}
                  {addon.categories.length > 4 && (
                    <span className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                      +{addon.categories.length - 4}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex-none ml-4 flex flex-col gap-2">
          {!selectMode && (
            <>
              <button className="flex items-center justify-center gap-2 bg-blue-600 text-white text-sm font-medium py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap">
                <ArrowDownTrayIcon className="h-4 w-4" />
                Download
              </button>
              <button className="flex items-center justify-center gap-2 bg-gray-100 text-gray-700 text-sm font-medium py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap">
                <EyeIcon className="h-4 w-4" />
                Details
              </button>
            </>
          )}
          {selectMode && (
            <button
              onClick={() => onSelect?.(!isSelected)}
              className={`flex items-center justify-center gap-2 text-sm font-medium py-2 px-4 rounded-lg transition-colors whitespace-nowrap ${
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

export default AddonListItem;