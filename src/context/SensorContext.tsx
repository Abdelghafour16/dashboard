import React, { createContext, useContext, useState, useEffect } from 'react';
import { SensorData, SensorStatus, SensorBox } from '../types';
import { useAuth } from './AuthContext';

// Constants for performance optimization
const MAX_DATA_POINTS = 1000;
const DATA_RETENTION_MONTHS = 6;

interface SensorContextType {
  sensorData: SensorData[];
  latestData: SensorData | null;
  userBoxes: SensorBox[];
  selectedBox: string | null;
  selectedDateRange: { start: string; end: string };
  isConnected: boolean;
  discoveredBoxes: SensorBox[];
  isWaitingForData: boolean;
  setSelectedBox: (boxId: string | null) => void;
  setSelectedDateRange: (range: { start: string; end: string }) => void;
  getSensorStatus: (sensor: keyof SensorData) => SensorStatus;
  exportToExcel: () => void;
  getFilteredData: () => SensorData[];
  addDiscoveredBox: (boxId: string, name: string, location: string) => void;
}

const SensorContext = createContext<SensorContextType | null>(null);

// Initial demo boxes for testing
const initialSensorBoxes: SensorBox[] = [
  { id: 'demo-box-1', name: 'Demo Marine Sensor', location: 'Test Location', assignedUser: 'all', isActive: true, lastUpdate: Date.now() }
];

export const SensorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [sensorBoxes, setSensorBoxes] = useState<SensorBox[]>(() => {
    // Load discovered boxes from localStorage
    const saved = localStorage.getItem('discoveredBoxes');
    return saved ? JSON.parse(saved) : initialSensorBoxes;
  });
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [selectedBox, setSelectedBox] = useState<string | null>(null);
  const [selectedDateRange, setSelectedDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [isConnected, setIsConnected] = useState(false);
  const [discoveredBoxes, setDiscoveredBoxes] = useState<SensorBox[]>(sensorBoxes);
  const [isWaitingForData, setIsWaitingForData] = useState(true);

  const userBoxes = user?.role === 'owner' 
    ? sensorBoxes 
    : sensorBoxes.filter(box => 
        user?.assignedBoxes?.includes(box.id)
      );

  // Function to add a newly discovered box via MQTT
  const addDiscoveredBox = (boxId: string, name: string, location: string) => {
    const existingBox = sensorBoxes.find(box => box.id === boxId);
    if (existingBox) {
      console.log('Box already exists:', boxId);
      return;
    }

    const newBox: SensorBox = {
      id: boxId,
      name: name || `Marine Box ${boxId}`,
      location: location || 'Unknown Location',
      assignedUser: 'all',
      isActive: true,
      lastUpdate: Date.now()
    };
    
    const updatedBoxes = [...sensorBoxes, newBox];
    setSensorBoxes(updatedBoxes);
    setDiscoveredBoxes(updatedBoxes);
    localStorage.setItem('discoveredBoxes', JSON.stringify(updatedBoxes));
    console.log('Added new box:', newBox);
  };

  // Function to receive real sensor data (called when MQTT message arrives)
  const receiveSensorData = (data: SensorData) => {
    console.log('Received sensor data:', data);
    setIsWaitingForData(false);
    setSensorData(prev => {
      const updatedData = [...prev, data];
      return updatedData.slice(-MAX_DATA_POINTS);
    });
    setLatestData(data);
    
    // Update box last update time
    setSensorBoxes(prev => prev.map(box => 
      box.id === data.boxId 
        ? { ...box, lastUpdate: Date.now(), isActive: true }
        : box
    ));
  };

  useEffect(() => {
    // Set default selected box when user boxes are available
    if (user && userBoxes.length > 0 && !selectedBox) {
      setSelectedBox(userBoxes[0].id);
    }
  }, [user, userBoxes, selectedBox]);

  useEffect(() => {
    // MQTT Connection Simulation
    const connectToMQTT = () => {
      console.log('Attempting to connect to MQTT broker...');
      setIsConnected(false);
      setIsWaitingForData(true);
      
      // Simulate MQTT connection attempt
      setTimeout(() => {
        console.log('MQTT connection established, waiting for ESP32 data...');
        setIsConnected(true);
      }, 2000);
    };

    if (user) {
      connectToMQTT();
    }

    // Cleanup old data periodically
    const cleanupInterval = setInterval(() => {
      const sixMonthsAgo = Date.now() - (DATA_RETENTION_MONTHS * 30 * 24 * 60 * 60 * 1000);
      setSensorData(prev => prev.filter(data => data.timestamp > sixMonthsAgo));
    }, 60 * 60 * 1000); // Check hourly

    return () => {
      clearInterval(cleanupInterval);
    };
  }, [user]);

  // Expose functions globally for MQTT integration
  useEffect(() => {
    (window as any).receiveSensorData = receiveSensorData;
    (window as any).addDiscoveredBox = addDiscoveredBox;
    
    // For testing - add some demo data after 5 seconds
    const demoTimeout = setTimeout(() => {
      if (sensorData.length === 0) {
        console.log('Adding demo data for testing...');
        const demoData: SensorData = {
          timestamp: Date.now(),
          boxId: 'demo-box-1',
          temperature: 25.5,
          pH: 7.2,
          dissolved_oxygen: 8.5,
          turbidity: 1.2,
          flow_rate: 18.3,
          co2: 380,
          tds: 165,
          salinity: 0.25,
          blue_green_algae: 2.1
        };
        receiveSensorData(demoData);
      }
    }, 5000);

    return () => {
      clearTimeout(demoTimeout);
    };
  }, [sensorData.length]);

  const getFilteredData = () => {
    const startDate = new Date(selectedDateRange.start).getTime();
    const endDate = new Date(selectedDateRange.end).getTime() + 24 * 60 * 60 * 1000; // End of day
    
    let filteredByUser = sensorData;
    
    // Filter by user permissions first
    if (user?.role !== 'owner') {
      filteredByUser = sensorData.filter(data => 
        user?.assignedBoxes?.includes(data.boxId)
      );
    }
    
    return filteredByUser.filter(data => {
      const matchesBox = selectedBox ? data.boxId === selectedBox : true;
      const matchesDate = data.timestamp >= startDate && data.timestamp <= endDate;
      return matchesBox && matchesDate;
    });
  };

  const getSensorStatus = (sensor: keyof SensorData): SensorStatus => {
    // Check if user has access to the latest data
    const hasAccess = user?.role === 'owner' || 
                     (latestData && user?.assignedBoxes?.includes(latestData.boxId));
    
    if (isWaitingForData || !latestData || !hasAccess || (selectedBox && latestData.boxId !== selectedBox)) {
      return { status: 'critical', message: 'No data available' };
    }
    
    const value = latestData[sensor] as number;
    
    switch (sensor) {
      case 'temperature':
        if (value < 20 || value > 30) return { status: 'critical', message: 'Temperature out of range' };
        if (value < 22 || value > 28) return { status: 'warning', message: 'Temperature suboptimal' };
        return { status: 'normal', message: 'Temperature optimal' };
      
      case 'pH':
        if (value < 6.0 || value > 8.5) return { status: 'critical', message: 'pH critically imbalanced' };
        if (value < 6.5 || value > 8.0) return { status: 'warning', message: 'pH needs attention' };
        return { status: 'normal', message: 'pH levels normal' };
      
      case 'dissolved_oxygen':
        if (value < 5) return { status: 'critical', message: 'Oxygen critically low' };
        if (value < 7) return { status: 'warning', message: 'Oxygen levels low' };
        return { status: 'normal', message: 'Oxygen levels optimal' };
      
      default:
        return { status: 'normal', message: 'Normal operation' };
    }
  };

  const exportToExcel = () => {
    const filteredData = getFilteredData();
    const headers = ['Timestamp', 'Box ID', 'Temperature', 'pH', 'Dissolved Oxygen', 'Turbidity', 'Flow Rate', 'CO2', 'TDS', 'Salinity', 'Blue Green Algae'];
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => [
        new Date(row.timestamp).toISOString(),
        row.boxId,
        row.temperature.toFixed(2),
        row.pH.toFixed(2),
        row.dissolved_oxygen.toFixed(2),
        row.turbidity.toFixed(2),
        row.flow_rate.toFixed(2),
        row.co2.toFixed(2),
        row.tds.toFixed(2),
        row.salinity.toFixed(3),
        row.blue_green_algae.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      const boxName = selectedBox ? `_${selectedBox}` : '';
      const dateRange = `_${selectedDateRange.start}_to_${selectedDateRange.end}`;
      link.setAttribute('download', `polychaeta_data${boxName}${dateRange}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <SensorContext.Provider value={{
      sensorData,
      latestData,
      userBoxes,
      selectedBox,
      selectedDateRange,
      isConnected,
      discoveredBoxes,
      isWaitingForData,
      addDiscoveredBox,
      setSelectedBox,
      setSelectedDateRange,
      getSensorStatus,
      exportToExcel,
      getFilteredData
    }}>
      {children}
    </SensorContext.Provider>
  );
};

export const useSensor = () => {
  const context = useContext(SensorContext);
  if (!context) {
    throw new Error('useSensor must be used within a SensorProvider');
  }
  return context;
};