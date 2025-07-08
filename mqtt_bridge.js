// MQTT Bridge for Polychaeta Dashboard
// This Node.js script connects to MQTT broker and forwards data to the web dashboard

const mqtt = require('mqtt');
const WebSocket = require('ws');
const express = require('express');
const cors = require('cors');

// Configuration
const MQTT_BROKER = 'mqtt://localhost:1883'; // Change to your MQTT broker
const WEB_PORT = 3001;
const WS_PORT = 3002;

// MQTT Topics
const TOPICS = {
  DATA: 'polychaeta/sensor/data',
  DISCOVERY: 'polychaeta/discovery',
  STATUS: 'polychaeta/status'
};

// Create Express app for HTTP API
const app = express();
app.use(cors());
app.use(express.json());

// Store latest data
let latestData = {};
let discoveredDevices = new Map();

// Connect to MQTT broker
const mqttClient = mqtt.connect(MQTT_BROKER);

mqttClient.on('connect', () => {
  console.log('Connected to MQTT broker');
  
  // Subscribe to all topics
  Object.values(TOPICS).forEach(topic => {
    mqttClient.subscribe(topic, (err) => {
      if (err) {
        console.error(`Failed to subscribe to ${topic}:`, err);
      } else {
        console.log(`Subscribed to ${topic}`);
      }
    });
  });
});

mqttClient.on('message', (topic, message) => {
  try {
    const data = JSON.parse(message.toString());
    console.log(`Received message on ${topic}:`, data);
    
    switch (topic) {
      case TOPICS.DATA:
        handleSensorData(data);
        break;
      case TOPICS.DISCOVERY:
        handleDeviceDiscovery(data);
        break;
      case TOPICS.STATUS:
        handleStatusUpdate(data);
        break;
    }
  } catch (error) {
    console.error('Error parsing MQTT message:', error);
  }
});

function handleSensorData(data) {
  // Store latest data
  latestData[data.boxId] = data;
  
  // Forward to web dashboard via WebSocket
  broadcastToWebClients('sensor_data', data);
  
  console.log(`Sensor data from ${data.boxId}:`, {
    temperature: data.temperature,
    pH: data.pH,
    dissolved_oxygen: data.dissolved_oxygen
  });
}

function handleDeviceDiscovery(data) {
  if (!discoveredDevices.has(data.device_id)) {
    discoveredDevices.set(data.device_id, {
      id: data.device_id,
      name: data.device_name,
      location: data.device_location,
      ip_address: data.ip_address,
      discovered_at: new Date(),
      last_seen: new Date()
    });
    
    // Notify web dashboard of new device
    broadcastToWebClients('device_discovery', {
      boxId: data.device_id,
      name: data.device_name,
      location: data.device_location
    });
    
    console.log(`New device discovered: ${data.device_name} (${data.device_id})`);
  }
}

function handleStatusUpdate(data) {
  if (discoveredDevices.has(data.device_id)) {
    const device = discoveredDevices.get(data.device_id);
    device.last_seen = new Date();
    device.status = data.status;
    discoveredDevices.set(data.device_id, device);
  }
}

// WebSocket server for real-time communication with dashboard
const wss = new WebSocket.Server({ port: WS_PORT });

wss.on('connection', (ws) => {
  console.log('Dashboard connected via WebSocket');
  
  // Send current discovered devices
  ws.send(JSON.stringify({
    type: 'discovered_devices',
    data: Array.from(discoveredDevices.values())
  }));
  
  // Send latest sensor data
  Object.values(latestData).forEach(data => {
    ws.send(JSON.stringify({
      type: 'sensor_data',
      data: data
    }));
  });
  
  ws.on('close', () => {
    console.log('Dashboard disconnected');
  });
});

function broadcastToWebClients(type, data) {
  const message = JSON.stringify({ type, data });
  
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

// HTTP API endpoints
app.get('/api/devices', (req, res) => {
  res.json(Array.from(discoveredDevices.values()));
});

app.get('/api/data/:deviceId', (req, res) => {
  const deviceId = req.params.deviceId;
  const data = latestData[deviceId];
  
  if (data) {
    res.json(data);
  } else {
    res.status(404).json({ error: 'Device not found' });
  }
});

app.get('/api/data', (req, res) => {
  res.json(Object.values(latestData));
});

// Start HTTP server
app.listen(WEB_PORT, () => {
  console.log(`HTTP API server running on port ${WEB_PORT}`);
  console.log(`WebSocket server running on port ${WS_PORT}`);
  console.log('Waiting for MQTT messages...');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('Shutting down...');
  mqttClient.end();
  process.exit(0);
});