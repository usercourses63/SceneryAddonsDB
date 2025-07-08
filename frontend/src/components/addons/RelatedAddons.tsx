import { FC, useState, useEffect } from 'react';
import { SparklesIcon, ArrowRightIcon, HeartIcon } from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { AddonSummary } from '../../types/api';
import AddonCard from './AddonCard';

interface RelatedAddonsProps {
  currentAddon: AddonSummary;
  onAddonSelect?: (addon: AddonSummary) => void;
  maxResults?: number;
}

interface RelationshipType {
  type: 'author' | 'category' | 'compatibility' | 'semantic' | 'collaborative';
  score: number;
  reason: string;
}

interface RelatedAddon {
  addon: AddonSummary;
  relationship: RelationshipType;
}

const RelatedAddons: FC<RelatedAddonsProps> = ({ 
  currentAddon, 
  onAddonSelect, 
  maxResults = 6 
}) => {
  const [relatedAddons, setRelatedAddons] = useState<RelatedAddon[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'author' | 'category' | 'ai'>('all');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  useEffect(() => {
    const favs = localStorage.getItem('addon-favorites');
    if (favs) {
      setFavorites(new Set(JSON.parse(favs)));
    }
  }, []);

  useEffect(() => {
    if (currentAddon) {
      findRelatedAddons(currentAddon);
    }
  }, [currentAddon]);

  const findRelatedAddons = async (addon: AddonSummary) => {
    setLoading(true);
    
    try {
      // Simulate API call for related addons
      const mockRelatedAddons = await generateMockRelatedAddons(addon);
      setRelatedAddons(mockRelatedAddons);
    } catch (error) {
      console.error('Error finding related addons:', error);
      setRelatedAddons([]);
    } finally {
      setLoading(false);
    }
  };

  // Mock function to generate related addons based on various algorithms
  const generateMockRelatedAddons = async (addon: AddonSummary): Promise<RelatedAddon[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const related: RelatedAddon[] = [];
    
    // Same author addons
    if (addon.author) {
      const authorAddons = generateMockAddonsByAuthor(addon.author, addon.id);
      related.push(...authorAddons.map(a => ({
        addon: a,
        relationship: {
          type: 'author' as const,
          score: 0.9,
          reason: `Same author: ${addon.author}`
        }
      })));
    }

    // Same category addons
    if (addon.categories && addon.categories.length > 0) {
      const categoryAddons = generateMockAddonsByCategory(addon.categories[0], addon.id);
      related.push(...categoryAddons.map(a => ({
        addon: a,
        relationship: {
          type: 'category' as const,
          score: 0.7,
          reason: `Similar category: ${addon.categories![0]}`
        }
      })));
    }

    // Same compatibility addons
    const compatibilityAddons = generateMockAddonsByCompatibility(addon.compatibility, addon.id);
    related.push(...compatibilityAddons.map(a => ({
      addon: a,
      relationship: {
        type: 'compatibility' as const,
        score: 0.6,
        reason: `Compatible with: ${addon.compatibility}`
      }
    })));

    // Semantic similarity (AI-powered)
    const semanticAddons = generateMockSemanticSimilarAddons(addon);
    related.push(...semanticAddons.map(a => ({
      addon: a,
      relationship: {
        type: 'semantic' as const,
        score: 0.8,
        reason: 'AI-detected similarity'
      }
    })));

    // Collaborative filtering (users who downloaded this also downloaded...)
    const collaborativeAddons = generateMockCollaborativeAddons(addon.id);
    related.push(...collaborativeAddons.map(a => ({
      addon: a,
      relationship: {
        type: 'collaborative' as const,
        score: 0.75,
        reason: 'Users also downloaded'
      }
    })));

    // Sort by score and return top results
    return related
      .sort((a, b) => b.relationship.score - a.relationship.score)
      .slice(0, maxResults * 2); // Get more than needed for filtering
  };

  const generateMockAddonsByAuthor = (author: string, excludeId: string): AddonSummary[] => {
    return [
      {
        id: 'mock-author-1',
        fileName: `${author.toLowerCase().replace(/\s/g, '-')}-addon-2.rar`,
        name: `${author} – Enhanced Airport Pack v2.0`,
        compatibility: 'MSFS 2020/2024',
        dateAdded: '2025-06-15T00:00:00Z',
        lastUpdated: '2025-06-15T00:00:00Z',
        daysSinceAdded: 23,
        isRecent: false,
        author: author,
        categories: ['Airports'],
        fileSize: 450 * 1024 * 1024,
        description: `Another quality release from ${author} featuring enhanced airport details.`,
        version: '2.0',
        downloadUrl: null,
        thumbnailUrl: null,
        downloadCount: 1250,
        rating: 4.7
      }
    ].filter(a => a.id !== excludeId);
  };

  const generateMockAddonsByCategory = (category: string, excludeId: string): AddonSummary[] => {
    const categoryAddons: AddonSummary[] = [
      {
        id: 'mock-category-1',
        fileName: `premium-${category.toLowerCase()}-pack.rar`,
        name: `Premium ${category} Collection – High Quality Pack`,
        compatibility: 'MSFS 2024',
        dateAdded: '2025-06-20T00:00:00Z',
        lastUpdated: '2025-06-20T00:00:00Z',
        daysSinceAdded: 18,
        isRecent: false,
        author: 'QualityDesigns Studio',
        categories: [category],
        fileSize: 320 * 1024 * 1024,
        description: `Professional ${category.toLowerCase()} enhancement pack with high-quality assets.`,
        version: '1.5',
        downloadUrl: undefined,
        thumbnailUrl: undefined,
        downloadCount: 890,
        rating: 4.5
      }
    ];
    return categoryAddons.filter(a => a.id !== excludeId);
  };

  const generateMockAddonsByCompatibility = (compatibility: string, excludeId: string): AddonSummary[] => {
    return [
      {
        id: 'mock-compat-1',
        fileName: `${compatibility.toLowerCase().replace(/\s/g, '-')}-optimized.rar`,
        name: `Optimized Graphics Pack for ${compatibility}`,
        compatibility: compatibility,
        dateAdded: '2025-06-25T00:00:00Z',
        lastUpdated: '2025-06-25T00:00:00Z',
        daysSinceAdded: 13,
        isRecent: true,
        author: 'PerformanceMods',
        categories: ['Utilities'],
        fileSize: 150 * 1024 * 1024,
        description: `Performance-optimized graphics enhancement specifically for ${compatibility}.`,
        version: '3.1',
        downloadUrl: undefined,
        thumbnailUrl: undefined,
        downloadCount: 2100,
        rating: 4.8
      }
    ].filter(a => a.id !== excludeId);
  };

  const generateMockSemanticSimilarAddons = (addon: AddonSummary): AddonSummary[] => {
    // AI-powered semantic similarity based on addon name and description
    const semanticKeywords = extractSemanticKeywords(addon.name);
    
    return [
      {
        id: 'mock-semantic-1',
        fileName: 'ai-recommended-addon.rar',
        name: `AI Recommended – ${semanticKeywords.join(' ')} Enhancement`,
        compatibility: addon.compatibility,
        dateAdded: '2025-06-10T00:00:00Z',
        lastUpdated: '2025-06-10T00:00:00Z',
        daysSinceAdded: 28,
        isRecent: false,
        author: 'AI Studios',
        categories: addon.categories || ['Scenery'],
        fileSize: 275 * 1024 * 1024,
        description: `AI-detected similarity based on content analysis and user behavior patterns.`,
        version: '1.8',
        downloadUrl: undefined,
        thumbnailUrl: undefined,
        downloadCount: 650,
        rating: 4.4
      }
    ];
  };

  const generateMockCollaborativeAddons = (addonId: string): AddonSummary[] => {
    return [
      {
        id: 'mock-collab-1',
        fileName: 'popular-companion-addon.rar',
        name: 'Popular Companion Pack – Frequently Downloaded Together',
        compatibility: 'MSFS 2020/2024',
        dateAdded: '2025-05-30T00:00:00Z',
        lastUpdated: '2025-05-30T00:00:00Z',
        daysSinceAdded: 39,
        isRecent: false,
        author: 'Community Picks',
        categories: ['Scenery', 'Utilities'],
        fileSize: 180 * 1024 * 1024,
        description: 'Frequently downloaded together with similar addons. Community favorite.',
        version: '2.3',
        downloadUrl: undefined,
        thumbnailUrl: undefined,
        downloadCount: 1800,
        rating: 4.6
      }
    ];
  };

  const extractSemanticKeywords = (name: string): string[] => {
    const keywords = name.toLowerCase()
      .split(/[\s\-–]+/)
      .filter(word => word.length > 3)
      .filter(word => !['addon', 'pack', 'collection', 'enhanced', 'premium'].includes(word))
      .slice(0, 3);
    return keywords;
  };

  const getFilteredAddons = () => {
    let filtered = relatedAddons;
    
    switch (activeTab) {
      case 'author':
        filtered = relatedAddons.filter(r => r.relationship.type === 'author');
        break;
      case 'category':
        filtered = relatedAddons.filter(r => r.relationship.type === 'category');
        break;
      case 'ai':
        filtered = relatedAddons.filter(r => 
          r.relationship.type === 'semantic' || r.relationship.type === 'collaborative'
        );
        break;
    }
    
    return filtered.slice(0, maxResults);
  };

  const toggleFavorite = (addonId: string) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(addonId)) {
      newFavorites.delete(addonId);
    } else {
      newFavorites.add(addonId);
    }
    setFavorites(newFavorites);
    localStorage.setItem('addon-favorites', JSON.stringify([...newFavorites]));
  };

  const getRelationshipBadgeColor = (type: string) => {
    switch (type) {
      case 'author':
        return 'bg-blue-100 text-blue-800';
      case 'category':
        return 'bg-green-100 text-green-800';
      case 'compatibility':
        return 'bg-yellow-100 text-yellow-800';
      case 'semantic':
        return 'bg-purple-100 text-purple-800';
      case 'collaborative':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <SparklesIcon className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Finding Related Addons</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-lg h-48 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const filteredAddons = getFilteredAddons();

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SparklesIcon className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900">Related Addons</h3>
        </div>
        
        {/* Filter tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {[
            { key: 'all', label: 'All' },
            { key: 'author', label: 'Same Author' },
            { key: 'category', label: 'Category' },
            { key: 'ai', label: 'AI Picks' }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {filteredAddons.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAddons.map(({ addon, relationship }) => (
            <div key={addon.id} className="relative">
              {/* Relationship badge */}
              <div className="absolute top-2 left-2 z-10">
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getRelationshipBadgeColor(relationship.type)}`}>
                  {relationship.type === 'semantic' ? 'AI' : relationship.type}
                </span>
              </div>

              {/* Favorite button */}
              <button
                onClick={() => toggleFavorite(addon.id)}
                className="absolute top-2 right-2 z-10 p-1 rounded-full bg-white shadow-sm hover:shadow-md transition-shadow"
              >
                {favorites.has(addon.id) ? (
                  <HeartIconSolid className="h-4 w-4 text-red-500" />
                ) : (
                  <HeartIcon className="h-4 w-4 text-gray-400" />
                )}
              </button>

              <div className="transform transition-transform hover:scale-105">
                <AddonCard 
                  addon={addon}
                  selectMode={false}
                />
              </div>

              {/* Relationship reason */}
              <div className="mt-2 text-xs text-gray-500 text-center">
                {relationship.reason}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <SparklesIcon className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p>No related addons found</p>
        </div>
      )}

      {filteredAddons.length > 0 && (
        <div className="mt-6 text-center">
          <button className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
            View more related addons
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default RelatedAddons;