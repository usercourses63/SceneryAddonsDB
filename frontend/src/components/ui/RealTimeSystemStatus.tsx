import React, { useEffect, useState } from 'react';
import { useHealth } from '../../services/queries';
import { signalRService } from '../../services/signalr';
import { cn } from '../../utils/cn';
import type { SystemHealth } from '../../types/api';

export function RealTimeSystemStatus() {
  const { data: initialHealth } = useHealth();
  const [health, setHealth] = useState<SystemHealth | undefined>(initialHealth);

  useEffect(() => {
    if (initialHealth) {
      setHealth(initialHealth);
    }
  }, [initialHealth]);

  useEffect(() => {
    const handleSystemStatusUpdate = (status: SystemHealth) => {
      setHealth(status);
    };

    signalRService.on('systemStatusUpdate', handleSystemStatusUpdate);

    return () => {
      signalRService.off('systemStatusUpdate', handleSystemStatusUpdate);
    };
  }, []);

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Healthy':
        return 'bg-green-500';
      case 'Warning':
        return 'bg-yellow-500';
      case 'Critical':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'Healthy':
        return 'All systems operational';
      case 'Warning':
        return 'Some issues detected';
      case 'Critical':
        return 'Critical issues detected';
      default:
        return 'Status unknown';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <div
        className={cn(
          'h-2 w-2 rounded-full transition-colors duration-200',
          getStatusColor(health?.status)
        )}
      />
      <span className="text-sm text-gray-600 hidden sm:inline">
        {getStatusText(health?.status)}
      </span>
      <span className="text-sm text-gray-600 sm:hidden">
        {health?.status || 'Unknown'}
      </span>
    </div>
  );
}
