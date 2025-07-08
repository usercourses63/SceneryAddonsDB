import React from 'react';
import { CheckCircle, AlertCircle, XCircle, Clock, Minus } from 'lucide-react';

export type HealthStatus = 'healthy' | 'warning' | 'error' | 'unknown' | 'loading';

interface StatusIndicatorProps {
  status: HealthStatus;
  label: string;
  description?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const statusConfig = {
  healthy: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
    label: 'Healthy',
  },
  warning: {
    icon: AlertCircle,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
    borderColor: 'border-yellow-200',
    label: 'Warning',
  },
  error: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
    label: 'Error',
  },
  loading: {
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    borderColor: 'border-blue-200',
    label: 'Loading',
  },
  unknown: {
    icon: Minus,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-200',
    label: 'Unknown',
  },
};

const sizeConfig = {
  sm: {
    icon: 'h-4 w-4',
    padding: 'px-2 py-1',
    text: 'text-xs',
  },
  md: {
    icon: 'h-5 w-5',
    padding: 'px-3 py-2',
    text: 'text-sm',
  },
  lg: {
    icon: 'h-6 w-6',
    padding: 'px-4 py-3',
    text: 'text-base',
  },
};

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  label,
  description,
  showIcon = true,
  size = 'md',
}) => {
  const config = statusConfig[status];
  const sizeClass = sizeConfig[size];
  const Icon = config.icon;

  return (
    <div className="flex items-center space-x-2">
      {showIcon && (
        <div className={`rounded-full ${config.bgColor} ${config.borderColor} border p-1`}>
          <Icon className={`${sizeClass.icon} ${config.color} ${status === 'loading' ? 'animate-spin' : ''}`} />
        </div>
      )}
      <div>
        <div className={`font-medium ${config.color} ${sizeClass.text}`}>
          {label}
        </div>
        {description && (
          <div className="text-gray-500 text-xs mt-1">
            {description}
          </div>
        )}
      </div>
    </div>
  );
};

interface StatusBadgeProps {
  status: HealthStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = statusConfig[status];
  const sizeClass = sizeConfig[size];
  const Icon = config.icon;

  return (
    <span className={`
      inline-flex items-center space-x-1 rounded-full 
      ${config.bgColor} ${config.borderColor} ${config.color} 
      border ${sizeClass.padding} ${sizeClass.text} font-medium
    `}>
      <Icon className={`${sizeClass.icon} ${status === 'loading' ? 'animate-spin' : ''}`} />
      <span>{config.label}</span>
    </span>
  );
};