import React, { useState } from 'react';
import { SensorData } from '../types';
import { Download, Search, Filter, Calendar, Package } from 'lucide-react';
import { useSensor } from '../context/SensorContext';
import { useAuth } from '../context/AuthContext';

interface DataTableProps {
  data: SensorData[];
  selectedMetric?: string | null;
}

const DataTable: React.FC<DataTableProps> = ({ data, selectedMetric }) => {
  const { 
    userBoxes, 
    selectedBox, 
    selectedDateRange, 
    setSelectedBox, 
    setSelectedDateRange, 
    exportToExcel,
    getFilteredData
  } = useSensor();
  const { user } = useAuth();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof SensorData>('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Apply user-specific filtering
  const userFilteredData = user?.role === 'owner' 
    ? data 
    : data.filter(item => user?.assignedBoxes?.includes(item.boxId));

  const filteredData = userFilteredData.filter(item => 
    Object.values(item).some(value => 
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const sortedData = [...filteredData].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const handleSort = (field: keyof SensorData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const columns = [
    { key: 'timestamp', label: 'Timestamp', format: (value: number) => new Date(value).toLocaleString() },
    { key: 'boxId', label: 'Box ID', format: (value: string) => value },
    ...(selectedMetric ? [
      { key: selectedMetric, label: getMetricLabel(selectedMetric), format: (value: number) => value.toFixed(2) }
    ] : [
      { key: 'temperature', label: 'Temperature (°C)', format: (value: number) => value.toFixed(2) },
      { key: 'pH', label: 'pH', format: (value: number) => value.toFixed(2) },
      { key: 'dissolved_oxygen', label: 'Dissolved O₂ (mg/L)', format: (value: number) => value.toFixed(2) },
      { key: 'turbidity', label: 'Turbidity (NTU)', format: (value: number) => value.toFixed(2) },
      { key: 'flow_rate', label: 'Flow Rate (L/min)', format: (value: number) => value.toFixed(2) },
      { key: 'co2', label: 'CO₂ (ppm)', format: (value: number) => value.toFixed(2) },
      { key: 'tds', label: 'TDS (ppm)', format: (value: number) => value.toFixed(2) },
      { key: 'salinity', label: 'Salinity (ppt)', format: (value: number) => value.toFixed(3) },
      { key: 'blue_green_algae', label: 'Blue-Green Algae (µg/L)', format: (value: number) => value.toFixed(2) }
    ])
  ];

  function getMetricLabel(metric: string): string {
    const labels: { [key: string]: string } = {
      'temperature': 'Temperature (°C)',
      'pH': 'pH',
      'dissolved_oxygen': 'Dissolved O₂ (mg/L)',
      'turbidity': 'Turbidity (NTU)',
      'flow_rate': 'Flow Rate (L/min)',
      'co2': 'CO₂ (ppm)',
      'tds': 'TDS (ppm)',
      'salinity': 'Salinity (ppt)',
      'blue_green_algae': 'Blue-Green Algae (µg/L)'
    };
    return labels[metric] || metric;
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-sky-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Marine Sensor Data</h3>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 p-4 bg-sky-50 rounded-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Package className="inline h-4 w-4 mr-1" />
            Select Box
          </label>
          <select
            value={selectedBox || ''}
            onChange={(e) => setSelectedBox(e.target.value || null)}
            className="w-full px-3 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="">All Boxes</option>
            {userBoxes.map(box => (
              <option key={box.id} value={box.id}>
                {box.name} ({box.id})
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            Start Date
          </label>
          <input
            type="date"
            value={selectedDateRange.start}
            onChange={(e) => setSelectedDateRange({ ...selectedDateRange, start: e.target.value })}
            className="w-full px-3 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="inline h-4 w-4 mr-1" />
            End Date
          </label>
          <input
            type="date"
            value={selectedDateRange.end}
            onChange={(e) => setSelectedDateRange({ ...selectedDateRange, end: e.target.value })}
            className="w-full px-3 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex items-end">
          <button
            onClick={exportToExcel}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search data..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            />
          </div>
        </div>
        <span className="text-sm text-gray-600">Showing {Math.min(20, sortedData.length)} of {sortedData.length} records</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-sky-100">
              {columns.map((column) => (
                <th
                  onClick={() => handleSort(column.key as keyof SensorData)}
                  className="px-4 py-3 text-left text-sm font-medium text-gray-900 cursor-pointer hover:bg-sky-50 transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.label}</span>
                    {sortField === column.key && (
                      <span className="text-sky-600">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-50">
            {sortedData.slice(0, 20).map((row, index) => (
              <tr key={index} className="hover:bg-sky-25 transition-colors">
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm text-gray-700">
                    {column.format(row[column.key as keyof SensorData] as number)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-4 text-sm text-gray-500 text-center">
        Showing {Math.min(20, sortedData.length)} of {sortedData.length} records
      </div>
    </div>
  );
};

export default DataTable;