import React from 'react';
import { useSensor } from '../context/SensorContext';
import SensorCard from '../components/SensorCard';
import SensorChart from '../components/SensorChart';
import { Thermometer, Droplets, Wind, Package } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { 
    sensorData, 
    latestData, 
    getSensorStatus, 
    userBoxes, 
    selectedBox, 
    setSelectedBox,
    getFilteredData,
    isWaitingForData,
    isConnected
  } = useSensor();

  const filteredData = getFilteredData();
  const currentBoxData = filteredData.filter(data => 
    selectedBox ? data.boxId === selectedBox : userBoxes.some(box => box.id === data.boxId)
  ).slice(-50); // Limit to last 50 data points for better chart performance

  // Show waiting state when waiting for ESP32 data
  if (isWaitingForData && sensorData.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marine Sensor Dashboard</h1>
          <p className="text-gray-600">Real-time marine water quality monitoring</p>
        </div>
        
        <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-pulse rounded-full h-16 w-16 bg-sky-200 mx-auto mb-6"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {isConnected ? 'Waiting for ESP32 Data' : 'Connecting to MQTT'}
          </h3>
          <p className="text-gray-600 mb-4">
            {isConnected 
              ? 'Connected to MQTT broker. Waiting for sensor data from ESP32 devices...' 
              : 'Establishing connection to MQTT broker...'}
          </p>
          <div className="bg-white rounded-xl shadow-lg border border-sky-100 p-6 max-w-md mx-auto">
            <h4 className="font-medium text-gray-900 mb-3">MQTT Integration Status</h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'}`}></div>
                <span>MQTT Broker: {isConnected ? 'Connected' : 'Connecting...'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span>ESP32 Devices: Waiting for data</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span>Sensor Boxes: Auto-discovery enabled</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    );
  }

  // Use the most recent data from the selected box or any box if no specific selection
  const displayData = (latestData && (user?.role === 'owner' || user?.assignedBoxes?.includes(latestData.boxId))) 
    ? latestData 
    : (currentBoxData.length > 0 ? currentBoxData[currentBoxData.length - 1] : null);
  
  if (!displayData && sensorData.length === 0) {
    return (
      <div className="space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Marine Sensor Dashboard</h1>
          <p className="text-gray-600">Real-time marine water quality monitoring</p>
        </div>
        
        <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-600">No sensor data available. Waiting for ESP32...</p>
        </div>
      </div>
      </div>
    );
  }

  // If we have data but no display data for selected box, use latest available data
  const finalDisplayData = displayData || latestData || {
    timestamp: Date.now(),
    boxId: selectedBox || 'unknown',
    temperature: 0,
    pH: 0,
    dissolved_oxygen: 0,
    turbidity: 0,
    flow_rate: 0,
    co2: 0,
    tds: 0,
    salinity: 0,
    blue_green_algae: 0
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Marine Sensor Dashboard</h1>
        <p className="text-gray-600">Real-time marine water quality monitoring</p>
      </div>

      {/* Box Selection */}
      <div className="bg-white rounded-xl shadow-lg border border-sky-100 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-sky-600" />
            <h3 className="text-lg font-semibold text-gray-900">Select Monitoring Box</h3>
          </div>
          <select
            value={selectedBox || ''}
            onChange={(e) => setSelectedBox(e.target.value || null)}
            className="px-4 py-2 border border-sky-200 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            {userBoxes.map(box => (
              <option key={box.id} value={box.id}>
                {box.name} - {box.location}
              </option>
            ))}
          </select>
        </div>
        {selectedBox && (
          <div className="mt-4 p-4 bg-sky-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Box ID:</span>
                <span className="ml-2 text-gray-600">{selectedBox}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Location:</span>
                <span className="ml-2 text-gray-600">
                  {userBoxes.find(box => box.id === selectedBox)?.location}
                </span>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <span className={`ml-2 font-medium ${
                  userBoxes.find(box => box.id === selectedBox)?.isActive 
                    ? 'text-green-600' 
                    : 'text-red-600'
                }`}>
                  {userBoxes.find(box => box.id === selectedBox)?.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Sensor Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SensorCard
          title="Temperature"
          value={finalDisplayData.temperature}
          unit="°C"
          status={getSensorStatus('temperature')}
          trend="stable"
          icon={<Thermometer className="h-6 w-6" />}
        />
        <SensorCard
          title="pH Level"
          value={finalDisplayData.pH}
          unit=""
          status={getSensorStatus('pH')}
          trend="stable"
          icon={<Droplets className="h-6 w-6" />}
        />
        <SensorCard
          title="Dissolved Oxygen"
          value={finalDisplayData.dissolved_oxygen}
          unit="mg/L"
          status={getSensorStatus('dissolved_oxygen')}
          trend="up"
          icon={<Wind className="h-6 w-6" />}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <SensorChart
          data={currentBoxData}
          dataKey="temperature"
          title="Temperature Trend"
          color="#0284c7"
          unit="°C"
        />
        <SensorChart
          data={currentBoxData}
          dataKey="pH"
          title="pH Level Trend"
          color="#dc2626"
          unit=""
        />
        <SensorChart
          data={currentBoxData}
          dataKey="dissolved_oxygen"
          title="Dissolved Oxygen Trend"
          color="#16a34a"
          unit="mg/L"
        />
      </div>

      {/* System Status */}
      <div className="bg-white rounded-xl shadow-lg border border-sky-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">ESP32 Connected</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Data Streaming</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-700">Marine Sensors Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;