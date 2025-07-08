import React, { useState } from 'react';
import {
  XMarkIcon,
  PaintBrushIcon,
  CogIcon,
  ChartBarIcon,
  UserIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  TrashIcon,
  EyeIcon,
  EyeSlashIcon,
  BoltIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { useTheme } from '@/contexts/ThemeContext';
import { useUserPreferencesStore } from '@/stores/userPreferencesStore';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'appearance' | 'preferences' | 'performance' | 'profile' | 'privacy';

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance');
  const { theme, setTheme } = useTheme();
  const {
    preferences,
    profile,
    updatePreferences,
    resetPreferences,
    toggleLayoutMode,
    setViewDensity,
    toggleAnimations,
    toggleVirtualScrolling,
    toggleAnalytics,
    exportPreferences,
    importPreferences,
  } = useUserPreferencesStore();

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          if (importPreferences(content)) {
            toast.success('Settings imported successfully');
          } else {
            toast.error('Failed to import settings');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExport = () => {
    const data = exportPreferences();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scenery-addons-settings-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Settings exported successfully');
  };

  const handleResetSettings = () => {
    if (confirm('Are you sure you want to reset all settings to default? This cannot be undone.')) {
      resetPreferences();
      toast.success('Settings reset to default');
    }
  };

  const tabs = [
    { id: 'appearance', label: 'Appearance', icon: PaintBrushIcon },
    { id: 'preferences', label: 'Preferences', icon: CogIcon },
    { id: 'performance', label: 'Performance', icon: BoltIcon },
    { id: 'profile', label: 'Profile', icon: UserIcon },
    { id: 'privacy', label: 'Privacy', icon: ShieldCheckIcon },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="inline-block w-full max-w-4xl px-6 py-4 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Settings</h3>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="flex mt-4">
            {/* Sidebar */}
            <div className="w-64 pr-6 border-r border-gray-200">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as SettingsTab)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="h-5 w-5 mr-3" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Content */}
            <div className="flex-1 pl-6">
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Theme</h4>
                    <div className="space-y-3">
                      {[
                        { value: 'light', label: 'Light' },
                        { value: 'dark', label: 'Dark' },
                        { value: 'system', label: 'System' },
                      ].map((themeOption) => (
                        <label key={themeOption.value} className="flex items-center">
                          <input
                            type="radio"
                            name="theme"
                            value={themeOption.value}
                            checked={theme === themeOption.value}
                            onChange={() => setTheme(themeOption.value as any)}
                            className="mr-3"
                          />
                          <span className="text-sm text-gray-700">{themeOption.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Layout</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Layout Mode</span>
                        <button
                          onClick={toggleLayoutMode}
                          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                        >
                          {preferences.layoutMode === 'grid' ? 'Grid' : 'List'}
                        </button>
                      </label>
                      
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">View Density</span>
                        <select
                          value={preferences.viewDensity}
                          onChange={(e) => setViewDensity(e.target.value as any)}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md"
                        >
                          <option value="compact">Compact</option>
                          <option value="comfortable">Comfortable</option>
                          <option value="spacious">Spacious</option>
                        </select>
                      </label>
                      
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Show Thumbnails</span>
                        <button
                          onClick={() => updatePreferences({ showThumbnails: !preferences.showThumbnails })}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          {preferences.showThumbnails ? <EyeIcon className="h-5 w-5" /> : <EyeSlashIcon className="h-5 w-5" />}
                        </button>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Search</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Default Sort</span>
                        <select
                          value={preferences.defaultSort}
                          onChange={(e) => updatePreferences({ defaultSort: e.target.value as any })}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md"
                        >
                          <option value="name">Name</option>
                          <option value="dateAdded">Date Added</option>
                          <option value="compatibility">Compatibility</option>
                          <option value="fileSize">File Size</option>
                        </select>
                      </label>
                      
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Enable Semantic Search</span>
                        <input
                          type="checkbox"
                          checked={preferences.enableSemanticSearch}
                          onChange={(e) => updatePreferences({ enableSemanticSearch: e.target.checked })}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </label>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Downloads</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Default Concurrency</span>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          value={preferences.defaultConcurrency}
                          onChange={(e) => updatePreferences({ defaultConcurrency: parseInt(e.target.value) })}
                          className="w-20 px-3 py-1 text-sm border border-gray-300 rounded-md"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Auto-start Downloads</span>
                        <input
                          type="checkbox"
                          checked={preferences.autoStartDownloads}
                          onChange={(e) => updatePreferences({ autoStartDownloads: e.target.checked })}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Notify on Completion</span>
                        <input
                          type="checkbox"
                          checked={preferences.notifyOnCompletion}
                          onChange={(e) => updatePreferences({ notifyOnCompletion: e.target.checked })}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Performance Options</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Enable Virtual Scrolling</span>
                        <input
                          type="checkbox"
                          checked={preferences.enableVirtualScrolling}
                          onChange={() => toggleVirtualScrolling()}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Lazy Load Images</span>
                        <input
                          type="checkbox"
                          checked={preferences.lazyLoadImages}
                          onChange={(e) => updatePreferences({ lazyLoadImages: e.target.checked })}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Enable Animations</span>
                        <input
                          type="checkbox"
                          checked={preferences.enableAnimations}
                          onChange={() => toggleAnimations()}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Items Per Page</span>
                        <select
                          value={preferences.itemsPerPage}
                          onChange={(e) => updatePreferences({ itemsPerPage: parseInt(e.target.value) })}
                          className="px-3 py-1 text-sm border border-gray-300 rounded-md"
                        >
                          <option value="10">10</option>
                          <option value="20">20</option>
                          <option value="50">50</option>
                          <option value="100">100</option>
                        </select>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Profile Information</h4>
                    {profile ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Username</span>
                          <span className="text-sm font-medium text-gray-900">{profile.username}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Email</span>
                          <span className="text-sm font-medium text-gray-900">{profile.email}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Total Downloads</span>
                          <span className="text-sm font-medium text-gray-900">{profile.totalDownloads}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Join Date</span>
                          <span className="text-sm font-medium text-gray-900">
                            {new Date(profile.joinDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">No profile information available</p>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div className="space-y-6">
                  <div>
                    <h4 className="text-md font-medium text-gray-900 mb-4">Privacy Settings</h4>
                    <div className="space-y-3">
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Collect Analytics</span>
                        <input
                          type="checkbox"
                          checked={preferences.collectAnalytics}
                          onChange={() => toggleAnalytics()}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </label>
                      
                      <label className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">Share Usage Statistics</span>
                        <input
                          type="checkbox"
                          checked={preferences.shareUsageStats}
                          onChange={(e) => updatePreferences({ shareUsageStats: e.target.checked })}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-6 mt-8 border-t border-gray-200">
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleImport}>
                    <ArrowUpTrayIcon className="h-4 w-4 mr-2" />
                    Import
                  </Button>
                  <Button variant="outline" onClick={handleExport}>
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </div>
                
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={handleResetSettings}>
                    <TrashIcon className="h-4 w-4 mr-2" />
                    Reset
                  </Button>
                  <Button onClick={onClose}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;