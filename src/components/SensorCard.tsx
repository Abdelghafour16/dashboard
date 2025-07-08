import React from 'react';
import { SensorData, SensorStatus } from '../types';
import { TrendingUp, TrendingDown, AlertTriangle } from 'lucide-react';

interface SensorCardProps {
  title: string;
  value: number;
  unit: string;
  status: SensorStatus;
  trend?: 'up' | 'down' | 'stable';
  icon?: React.ReactNode;
}

const SensorCard: React.FC<SensorCardProps> = ({ 
  title, 
  value, 
  unit, 
  status, 
  trend = 'stable',
  icon 
}) => {
  const getStatusColor = () => {
    switch (status.status) {
      case 'normal': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status.status) {
      case 'warning':
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-sky-100 p-6 hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {icon && <div className="text-sky-600">{icon}</div>}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {getTrendIcon()}
      </div>
      
      <div className="mb-4">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-gray-900">
            {value.toFixed(2)}
          </span>
          <span className="text-sm font-medium text-gray-500">{unit}</span>
        </div>
      </div>
      
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${getStatusColor()}`}>
        {getStatusIcon()}
        <span className="text-sm font-medium">{status.message}</span>
      </div>
    </div>
  );
};

export default SensorCard;