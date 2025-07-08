import React from 'react';

export const AddonBrowser: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Browse Addons</h1>
        <p className="text-gray-600 mt-1">Search and explore Microsoft Flight Simulator scenery addons</p>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Addon Browser</h3>
        <p className="text-gray-600">This page will feature advanced search, filtering, and addon browsing capabilities.</p>
      </div>
    </div>
  );
};