import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SensorData } from '../types';

interface SensorChartProps {
  data: SensorData[];
  dataKey: keyof SensorData;
  title: string;
  color: string;
  unit: string;
}

const SensorChart: React.FC<SensorChartProps> = ({ data, dataKey, title, color, unit }) => {
  // Optimize chart data - limit to last 100 points for better performance
  const chartData = data.slice(-100).map(item => ({
    time: new Date(item.timestamp).toLocaleTimeString(),
    value: item[dataKey]
  }));

  return (
    <div className="bg-white rounded-xl shadow-lg border border-sky-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
          <XAxis 
            dataKey="time" 
            stroke="#64748b"
            fontSize={12}
            tickFormatter={(value) => value.split(':').slice(0, 2).join(':')}
          />
          <YAxis 
            stroke="#64748b"
            fontSize={12}
            tickFormatter={(value) => `${value.toFixed(1)}${unit}`}
          />
          <Tooltip 
            formatter={(value: number) => [`${value.toFixed(2)}${unit}`, title]}
            labelFormatter={(label) => `Time: ${label}`}
            contentStyle={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '8px'
            }}
          />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke={color}
            strokeWidth={2}
            dot={{ fill: color, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: color, strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SensorChart;