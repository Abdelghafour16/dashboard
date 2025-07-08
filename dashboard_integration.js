// Dashboard Integration Script
// Add this to your dashboard's index.html or main.js to connect with MQTT bridge

class PolychaetaMQTTClient {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    
    this.connect();
  }
  
  connect() {
    try {
      // Connect to WebSocket bridge
      this.ws = new WebSocket('ws://localhost:3002');
      
      this.ws.onopen = () => {
        console.log('Connected to MQTT bridge');
        this.reconnectAttempts = 0;
      };
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('Disconnected from MQTT bridge');
        this.reconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
    } catch (error) {
      console.error('Failed to connect to MQTT bridge:', error);
      this.reconnect();
    }
  }
  
  reconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        this.connect();
      }, this.reconnectDelay * this.reconnectAttempts);
    } else {
      console.error('Max reconnection attempts reached');
    }
  }
  
  handleMessage(message) {
    switch (message.type) {
      case 'sensor_data':
        this.handleSensorData(message.data);
        break;
      case 'device_discovery':
        this.handleDeviceDiscovery(message.data);
        break;
      case 'discovered_devices':
        this.handleDiscoveredDevices(message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }
  
  handleSensorData(data) {
    // Convert timestamp to JavaScript timestamp if needed
    if (data.timestamp && data.timestamp < 1000000000000) {
      data.timestamp = Date.now();
    }
    
    // Call the global function exposed by the dashboard
    if (window.receiveSensorData) {
      window.receiveSensorData(data);
    } else {
      console.warn('receiveSensorData function not available');
    }
  }
  
  handleDeviceDiscovery(data) {
    console.log('New device discovered:', data);
    
    // Call the global function exposed by the dashboard
    if (window.addDiscoveredBox) {
      window.addDiscoveredBox(data.boxId, data.name, data.location);
    } else {
      console.warn('addDiscoveredBox function not available');
    }
  }
  
  handleDiscoveredDevices(devices) {
    console.log('Received discovered devices:', devices);
    
    // Add all discovered devices
    devices.forEach(device => {
      if (window.addDiscoveredBox) {
        window.addDiscoveredBox(device.id, device.name, device.location);
      }
    });
  }
}

// Initialize MQTT client when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit for the dashboard to initialize
  setTimeout(() => {
    window.polychaetaMQTT = new PolychaetaMQTTClient();
  }, 2000);
});

// Export for manual initialization if needed
window.PolychaetaMQTTClient = PolychaetaMQTTClient;