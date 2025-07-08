import React from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigation = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'Browse Addons', href: '/addons-enhanced', icon: '📦' },
    { name: 'Advanced Search', href: '/advanced-search', icon: '✨' },
    { name: 'Analytics', href: '/analytics', icon: '📊' },
    { name: 'Downloads', href: '/downloads', icon: '⬇️' },
    { name: 'System Status', href: '/system-status', icon: '💻' },
  ];

  return (
    <div className={`sidebar sidebar-mobile ${isOpen ? 'sidebar-mobile-open' : 'sidebar-mobile-closed'} lg:translate-x-0`}>
      <div className="flex flex-col h-full">
        {/* Logo */}
        <div className="flex items-center h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">SceneryAddons</h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navigation.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="nav-item nav-item-inactive"
              onClick={onClose}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
};