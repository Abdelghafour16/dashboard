import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useSensor } from '../context/SensorContext';
import SensorChart from '../components/SensorChart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const Analytics: React.FC = () => {
  const { getFilteredData, latestData } = useSensor();
  const { user } = useAuth();
  const allFilteredData = getFilteredData();
  
  // Security filter - users can only see their assigned box data
  const sensorData = user?.role === 'owner' 
    ? allFilteredData 
    : allFilteredData.filter(data => user?.assignedBoxes?.includes(data.boxId));

  const analyticsData = sensorData.slice(-24).map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    flow_rate: item.flow_rate,
    co2: item.co2,
    tds: item.tds,
    turbidity: item.turbidity
  }));

  const qualityMetrics = [
    { name: 'Excellent', value: 35, color: '#16a34a' },
    { name: 'Good', value: 45, color: '#ca8a04' },
    { name: 'Fair', value: 15, color: '#ea580c' },
    { name: 'Poor', value: 5, color: '#dc2626' }
  ];

  const insights = [
    {
      title: 'Water Quality Score',
      value: '87/100',
      status: 'Excellent',
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      title: 'System Efficiency',
      value: '94%',
      status: 'Optimal',
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      title: 'Maintenance Due',
      value: '12 days',
      status: 'On Schedule',
      color: 'text-yellow-600',
      bg: 'bg-yellow-50'
    },
    {
      title: 'Energy Usage',
      value: '78 kWh',
      status: 'Normal',
      color: 'text-purple-600',
      bg: 'bg-purple-50'
    }
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Polychaeta Analytics</h1>
        <p className="text-gray-600">Advanced marine insights and system optimization</p>
      </div>

      {/* Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insights.map((insight, index) => (
          <div key={index} className={`${insight.bg} rounded-xl p-6 border border-sky-100`}>
            <h3 className="text-sm font-medium text-gray-600 mb-2">Marine {insight.title}</h3>
            <div className="mb-2">
              <span className="text-2xl font-bold text-gray-900">{insight.value}</span>
            </div>
            <span className={`text-sm font-medium ${insight.color}`}>{insight.status}</span>
          </div>
        ))}
      </div>

      {/* Advanced Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SensorChart
          data={sensorData}
          dataKey="flow_rate"
          title="Flow Rate Analysis"
          color="#ea580c"
          unit="L/min"
        />
        <SensorChart
          data={sensorData}
          dataKey="co2"
          title="CO₂ Level Monitoring"
          color="#ca8a04"
          unit="ppm"
        />
        <SensorChart
          data={sensorData}
          dataKey="tds"
          title="TDS Concentration"
          color="#059669"
          unit="ppm"
        />
        <SensorChart
          data={sensorData}
          dataKey="turbidity"
          title="Turbidity Measurement"
          color="#7c3aed"
          unit="NTU"
        />
      </div>

      {/* Comparative Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg border border-sky-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Marine Sensor Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="flow_rate" fill="#ea580c" name="Flow Rate" />
              <Bar dataKey="co2" fill="#ca8a04" name="CO₂" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-sky-100 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Marine Water Quality Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={qualityMetrics}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {qualityMetrics.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Recommendations */}
      <div className="bg-white rounded-xl shadow-lg border border-sky-100 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Polychaeta System Recommendations</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-medium text-green-800 mb-2">Marine Optimization</h4>
            <p className="text-sm text-green-700">Marine flow rate can be increased by 8% during peak tidal hours for better efficiency.</p>
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-medium text-blue-800 mb-2">Marine Sensor Alert</h4>
            <p className="text-sm text-blue-700">Marine pH sensor calibration recommended within the next 2 weeks.</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
            <h4 className="font-medium text-yellow-800 mb-2">Marine Energy Saving</h4>
            <p className="text-sm text-yellow-700">Reduce marine CO₂ monitoring frequency during low-activity periods.</p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <h4 className="font-medium text-purple-800 mb-2">Marine Quality Improvement</h4>
            <p className="text-sm text-purple-700">Marine turbidity levels show consistent improvement trend in polychaeta habitat.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;