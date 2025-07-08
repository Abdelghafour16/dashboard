import React from 'react';
import { useSensor } from '../context/SensorContext';
import SensorChart from '../components/SensorChart';
import DataTable from '../components/DataTable';
import { Package, Calendar, Download, Thermometer, Droplets, Wind, Waves, Zap, Cloud, Beaker, Salad, Filter } from 'lucide-react';

const MetricFilter: React.FC<{ 
  metric: string; 
  icon: React.ReactNode; 
  isActive: boolean; 
  onClick: () => void;
  count: number;
}> = ({ metric, icon, isActive, onClick, count }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-4 py-3 rounded-lg border transition-all ${
      isActive 
        ? 'bg-sky-600 text-white border-sky-600 shadow-lg' 
        : 'bg-white text-gray-700 border-sky-200 hover:bg-sky-50 hover:border-sky-300'
    }`}
  >
    <div className={`${isActive ? 'text-white' : 'text-sky-600'}`}>
      {icon}
    </div>
    <div className="text-left">
      <div className="font-medium text-sm">{metric}</div>
      <div className={`text-xs ${isActive ? 'text-sky-100' : 'text-gray-500'}`}>
        {count} records
      </div>
    </div>
  </button>
);

const SensorData: React.FC = () => {
  const { 
    getFilteredData, 
    userBoxes, 
    selectedBox, 
    selectedDateRange, 
    setSelectedBox, 
    setSelectedDateRange, 
    exportToExcel 
  } = useSensor();
  
  const [selectedMetric, setSelectedMetric] = React.useState<string | null>(null);
  
  const filteredData = getFilteredData();

  // Additional security check - ensure user can only see their assigned boxes
  const secureFilteredData = user?.role === 'owner' 
    ? filteredData 
    : filteredData.filter(data => user?.assignedBoxes?.includes(data.boxId));

  const metricConfigs = [
    { key: 'temperature', title: 'Temperature', color: '#0284c7', unit: '°C', icon: <Thermometer className="h-5 w-5" /> },
    { key: 'pH', title: 'pH Level', color: '#dc2626', unit: '', icon: <Droplets className="h-5 w-5" /> },
    { key: 'dissolved_oxygen', title: 'Dissolved Oxygen', color: '#16a34a', unit: 'mg/L', icon: <Wind className="h-5 w-5" /> },
    { key: 'turbidity', title: 'Turbidity', color: '#7c3aed', unit: 'NTU', icon: <Waves className="h-5 w-5" /> },
    { key: 'flow_rate', title: 'Flow Rate', color: '#ea580c', unit: 'L/min', icon: <Zap className="h-5 w-5" /> },
    { key: 'co2', title: 'CO₂ Level', color: '#ca8a04', unit: 'ppm', icon: <Cloud className="h-5 w-5" /> },
    { key: 'tds', title: 'TDS', color: '#059669', unit: 'ppm', icon: <Beaker className="h-5 w-5" /> },
    { key: 'salinity', title: 'Salinity', color: '#0891b2', unit: 'ppt', icon: <Salad className="h-5 w-5" /> },
    { key: 'blue_green_algae', title: 'Blue-Green Algae', color: '#be123c', unit: 'µg/L', icon: <Filter className="h-5 w-5" /> }
  ];
  
  const displayedData = selectedMetric ? secureFilteredData : secureFilteredData;

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marine Sensor Data</h1>
        <p className="text-gray-600">Complete marine sensor readings and data visualization</p>
      </div>

      {/* Sensor Selection and Filters */}
      <div className="bg-white rounded-xl shadow-lg border border-sky-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Filters & Export</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Package className="inline h-4 w-4 mr-1" />
              Select Sensor Box
            </label>
            <select
              value={selectedBox || ''}
              onChange={(e) => setSelectedBox(e.target.value || null)}
              className="w-full px-3 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            >
              <option value="">All Boxes</option>
              {userBoxes.map(box => (
                <option key={box.id} value={box.id}>
                  {box.name} ({box.location})
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
        
        {selectedBox && (
          <div className="mt-4 p-4 bg-sky-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Selected Box:</span>
                <span className="ml-2 text-gray-600">{selectedBox}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Location:</span>
                <span className="ml-2 text-gray-600">
                  {userBoxes.find(box => box.id === selectedBox)?.location}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Data Points:</span>
                <span className="ml-2 text-gray-600">{filteredData.length} records</span>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* All Sensor Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {metricConfigs.map((config) => (
          <SensorChart
            key={config.key}
            data={secureFilteredData}
            dataKey={config.key as keyof SensorData}
            title={config.title}
            color={config.color}
            unit={config.unit}
          />
        ))}
      </div>

      {/* Data Table */}
      <DataTable data={displayedData} selectedMetric={selectedMetric} />
    </div>
  );
};

export default SensorData;