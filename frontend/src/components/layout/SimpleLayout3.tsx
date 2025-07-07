import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { SimpleHeader } from './SimpleHeader';
import { SimpleSidebar } from './SimpleSidebar';

export function SimpleLayout3() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <SimpleSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:pl-64">
        <SimpleHeader onMenuClick={() => setSidebarOpen(true)} />
        
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
