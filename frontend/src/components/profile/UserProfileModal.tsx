import React, { useState } from 'react';
import {
  XMarkIcon,
  UserIcon,
  TrophyIcon,
  ChartBarIcon,
  HeartIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  CogIcon,
  PencilIcon,
  CameraIcon,
  StarIcon,
} from '@heroicons/react/24/outline';
import { useUserPreferencesStore, UserProfile } from '@/stores/userPreferencesStore';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Button } from '@/components/ui/Button';
import { MetricCard } from '@/components/ui/MetricCard';
import toast from 'react-hot-toast';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ProfileTab = 'overview' | 'statistics' | 'achievements' | 'preferences' | 'activity';

export const UserProfileModal: React.FC<UserProfileModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    username: '',
    email: '',
    avatar: '',
  });

  const { profile, updateProfile } = useUserPreferencesStore();
  const { getUsageStatistics } = useAnalytics();

  const statistics = getUsageStatistics();

  const handleEdit = () => {
    if (profile) {
      setEditForm({
        username: profile.username,
        email: profile.email,
        avatar: profile.avatar || '',
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    if (profile) {
      updateProfile(editForm);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      username: '',
      email: '',
      avatar: '',
    });
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setEditForm(prev => ({ ...prev, avatar: e.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateLevel = (experience: number): number => {
    return Math.floor(experience / 100) + 1;
  };

  const getExperienceProgress = (experience: number): number => {
    return experience % 100;
  };

  const getAchievementBadge = (achievement: string): { icon: React.ComponentType<any>; color: string } => {
    switch (achievement) {
      case 'first_download':
        return { icon: ArrowDownTrayIcon, color: 'blue' };
      case 'power_user':
        return { icon: TrophyIcon, color: 'gold' };
      case 'explorer':
        return { icon: StarIcon, color: 'purple' };
      case 'contributor':
        return { icon: HeartIcon, color: 'red' };
      default:
        return { icon: TrophyIcon, color: 'gray' };
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: UserIcon },
    { id: 'statistics', label: 'Statistics', icon: ChartBarIcon },
    { id: 'achievements', label: 'Achievements', icon: TrophyIcon },
    { id: 'preferences', label: 'Preferences', icon: CogIcon },
    { id: 'activity', label: 'Activity', icon: ClockIcon },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="inline-block w-full max-w-4xl px-6 py-4 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <div className="flex items-center justify-between pb-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">User Profile</h3>
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
                    onClick={() => setActiveTab(tab.id as ProfileTab)}
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
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Profile Header */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                        {(isEditing ? editForm.avatar : profile?.avatar) ? (
                          <img
                            src={isEditing ? editForm.avatar : profile?.avatar}
                            alt="Profile"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <UserIcon className="h-10 w-10 text-gray-400" />
                        )}
                      </div>
                      {isEditing && (
                        <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1 rounded-full cursor-pointer hover:bg-blue-700">
                          <CameraIcon className="h-3 w-3" />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleAvatarChange}
                          />
                        </label>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editForm.username}
                            onChange={(e) => setEditForm(prev => ({ ...prev, username: e.target.value }))}
                            className="text-xl font-bold text-gray-900 border-b-2 border-blue-500 bg-transparent focus:outline-none"
                            placeholder="Username"
                          />
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                            className="text-gray-600 border-b border-gray-300 bg-transparent focus:outline-none focus:border-blue-500"
                            placeholder="Email"
                          />
                        </div>
                      ) : (
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{profile?.username || 'User'}</h2>
                          <p className="text-gray-600">{profile?.email || 'No email provided'}</p>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex space-x-2">
                      {isEditing ? (
                        <>
                          <Button size="sm" onClick={handleSave}>Save</Button>
                          <Button size="sm" variant="outline" onClick={handleCancel}>Cancel</Button>
                        </>
                      ) : (
                        <Button size="sm" variant="outline" onClick={handleEdit}>
                          <PencilIcon className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Level and Experience */}
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Level {profile ? calculateLevel(profile.experience) : 1}</span>
                      <span className="text-sm text-gray-500">{profile ? profile.experience : 0} XP</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                        style={{ width: `${profile ? getExperienceProgress(profile.experience) : 0}%` }}
                      />
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <ArrowDownTrayIcon className="h-5 w-5 text-blue-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Total Downloads</p>
                          <p className="text-xl font-bold text-gray-900">{profile?.totalDownloads || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <HeartIcon className="h-5 w-5 text-red-600 mr-2" />
                        <div>
                          <p className="text-sm text-gray-600">Favorites</p>
                          <p className="text-xl font-bold text-gray-900">{profile?.favoriteAddons.length || 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Member Since */}
                  <div className="text-sm text-gray-500">
                    Member since {profile ? new Date(profile.joinDate).toLocaleDateString() : 'Unknown'}
                  </div>
                </div>
              )}

              {activeTab === 'statistics' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900">Usage Statistics</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <MetricCard
                      title="Total Sessions"
                      value={statistics.totalSessions}
                      icon={ClockIcon}
                      color="blue"
                      subtitle="App sessions"
                    />
                    
                    <MetricCard
                      title="Total Searches"
                      value={statistics.totalSearches}
                      icon={ChartBarIcon}
                      color="green"
                      subtitle="Search queries"
                    />
                    
                    <MetricCard
                      title="Downloads"
                      value={statistics.totalDownloads}
                      icon={ArrowDownTrayIcon}
                      color="purple"
                      subtitle="Addon downloads"
                    />
                    
                    <MetricCard
                      title="Average Session"
                      value={`${statistics.averageSessionTime.toFixed(1)}m`}
                      icon={ClockIcon}
                      color="gray"
                      subtitle="Session duration"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'achievements' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900">Achievements</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile?.achievements.map((achievement, index) => {
                      const { icon: Icon, color } = getAchievementBadge(achievement);
                      return (
                        <div key={index} className="flex items-center p-4 bg-white rounded-lg border border-gray-200">
                          <div className={`p-2 rounded-full mr-4 ${color === 'gold' ? 'bg-yellow-100' : `bg-${color}-100`}`}>
                            <Icon className={`h-6 w-6 ${color === 'gold' ? 'text-yellow-600' : `text-${color}-600`}`} />
                          </div>
                          <div>
                            <h5 className="font-medium text-gray-900 capitalize">{achievement.replace('_', ' ')}</h5>
                            <p className="text-sm text-gray-600">Achievement unlocked</p>
                          </div>
                        </div>
                      );
                    }) || <p className="text-gray-500">No achievements yet</p>}
                  </div>
                </div>
              )}

              {activeTab === 'preferences' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900">User Preferences</h4>
                  <p className="text-gray-600">
                    Manage your preferences in the main settings panel. 
                    <Button variant="outline" size="sm" className="ml-2">
                      Open Settings
                    </Button>
                  </p>
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="space-y-6">
                  <h4 className="text-lg font-semibold text-gray-900">Recent Activity</h4>
                  
                  <div className="space-y-3">
                    {profile?.downloadHistory.slice(0, 10).map((download, index) => (
                      <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <ArrowDownTrayIcon className="h-5 w-5 text-blue-600 mr-3" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">Downloaded addon</p>
                          <p className="text-xs text-gray-500">ID: {download}</p>
                        </div>
                      </div>
                    )) || <p className="text-gray-500">No recent activity</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileModal;