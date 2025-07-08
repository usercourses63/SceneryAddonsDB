import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LayoutMode = 'grid' | 'list';
export type ViewDensity = 'compact' | 'comfortable' | 'spacious';
export type SortOption = 'name' | 'dateAdded' | 'compatibility' | 'fileSize';
export type SortDirection = 'asc' | 'desc';

export interface UserPreferences {
  // Display preferences
  layoutMode: LayoutMode;
  viewDensity: ViewDensity;
  showThumbnails: boolean;
  itemsPerPage: number;
  
  // Search preferences
  defaultSort: SortOption;
  defaultSortDirection: SortDirection;
  enableSemanticSearch: boolean;
  maxSearchHistory: number;
  
  // Download preferences
  defaultConcurrency: number;
  autoStartDownloads: boolean;
  notifyOnCompletion: boolean;
  downloadPath: string;
  
  // Performance preferences
  enableVirtualScrolling: boolean;
  lazyLoadImages: boolean;
  enableAnimations: boolean;
  
  // Privacy preferences
  collectAnalytics: boolean;
  shareUsageStats: boolean;
  
  // Advanced preferences
  enableBetaFeatures: boolean;
  debugMode: boolean;
  
  // UI preferences
  compactNavigation: boolean;
  hideCompletedDownloads: boolean;
  showAdvancedFilters: boolean;
}

export interface UserProfile {
  userId: string;
  username: string;
  email: string;
  avatar?: string;
  joinDate: string;
  lastLogin: string;
  preferences: UserPreferences;
  
  // Statistics
  totalDownloads: number;
  favoriteAddons: string[];
  downloadHistory: string[];
  
  // Achievements
  achievements: string[];
  level: number;
  experience: number;
}

const defaultPreferences: UserPreferences = {
  layoutMode: 'grid',
  viewDensity: 'comfortable',
  showThumbnails: true,
  itemsPerPage: 20,
  
  defaultSort: 'dateAdded',
  defaultSortDirection: 'desc',
  enableSemanticSearch: true,
  maxSearchHistory: 10,
  
  defaultConcurrency: 3,
  autoStartDownloads: false,
  notifyOnCompletion: true,
  downloadPath: '',
  
  enableVirtualScrolling: true,
  lazyLoadImages: true,
  enableAnimations: true,
  
  collectAnalytics: true,
  shareUsageStats: false,
  
  enableBetaFeatures: false,
  debugMode: false,
  
  compactNavigation: false,
  hideCompletedDownloads: false,
  showAdvancedFilters: false,
};

interface UserPreferencesStore {
  preferences: UserPreferences;
  profile: UserProfile | null;
  isLoading: boolean;
  
  // Preference actions
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  
  // Profile actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  clearProfile: () => void;
  
  // Convenience methods
  toggleLayoutMode: () => void;
  setViewDensity: (density: ViewDensity) => void;
  toggleAnimations: () => void;
  toggleVirtualScrolling: () => void;
  
  // Analytics preferences
  toggleAnalytics: () => void;
  canCollectAnalytics: () => boolean;
  
  // Import/Export
  exportPreferences: () => string;
  importPreferences: (data: string) => boolean;
}

export const useUserPreferencesStore = create<UserPreferencesStore>()(
  persist(
    (set, get) => ({
      preferences: defaultPreferences,
      profile: null,
      isLoading: false,
      
      updatePreferences: (updates) => {
        set((state) => ({
          preferences: { ...state.preferences, ...updates },
          profile: state.profile ? {
            ...state.profile,
            preferences: { ...state.profile.preferences, ...updates }
          } : null
        }));
      },
      
      resetPreferences: () => {
        set((state) => ({
          preferences: defaultPreferences,
          profile: state.profile ? {
            ...state.profile,
            preferences: defaultPreferences
          } : null
        }));
      },
      
      setProfile: (profile) => {
        set({ profile, preferences: profile.preferences });
      },
      
      updateProfile: (updates) => {
        set((state) => ({
          profile: state.profile ? { ...state.profile, ...updates } : null
        }));
      },
      
      clearProfile: () => {
        set({ profile: null, preferences: defaultPreferences });
      },
      
      toggleLayoutMode: () => {
        const currentMode = get().preferences.layoutMode;
        get().updatePreferences({
          layoutMode: currentMode === 'grid' ? 'list' : 'grid'
        });
      },
      
      setViewDensity: (density) => {
        get().updatePreferences({ viewDensity: density });
      },
      
      toggleAnimations: () => {
        const current = get().preferences.enableAnimations;
        get().updatePreferences({ enableAnimations: !current });
      },
      
      toggleVirtualScrolling: () => {
        const current = get().preferences.enableVirtualScrolling;
        get().updatePreferences({ enableVirtualScrolling: !current });
      },
      
      toggleAnalytics: () => {
        const current = get().preferences.collectAnalytics;
        get().updatePreferences({ collectAnalytics: !current });
      },
      
      canCollectAnalytics: () => {
        return get().preferences.collectAnalytics;
      },
      
      exportPreferences: () => {
        const { preferences, profile } = get();
        return JSON.stringify({
          preferences,
          profile: profile ? { 
            ...profile, 
            exportedAt: new Date().toISOString() 
          } : null,
          exportedAt: new Date().toISOString(),
          version: '1.0.0'
        }, null, 2);
      },
      
      importPreferences: (data) => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.preferences) {
            get().updatePreferences(parsed.preferences);
          }
          if (parsed.profile) {
            get().setProfile(parsed.profile);
          }
          return true;
        } catch (error) {
          console.error('Failed to import preferences:', error);
          return false;
        }
      },
    }),
    {
      name: 'user-preferences-store',
      partialize: (state) => ({
        preferences: state.preferences,
        profile: state.profile,
      }),
    }
  )
);