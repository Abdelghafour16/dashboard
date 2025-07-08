#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// MQTT Broker settings
const char* mqtt_server = "YOUR_MQTT_BROKER_IP";  // e.g., "192.168.1.100"
const int mqtt_port = 1883;
const char* mqtt_user = "YOUR_MQTT_USERNAME";     // Optional
const char* mqtt_password = "YOUR_MQTT_PASSWORD"; // Optional

// Device identification
const char* device_id = "esp32-marine-001";
const char* device_name = "Marine Sensor Box 001";
const char* device_location = "Coastal Area A";

// MQTT Topics
const char* data_topic = "polychaeta/sensor/data";
const char* discovery_topic = "polychaeta/discovery";
const char* status_topic = "polychaeta/status";

// Sensor pins
#define TEMP_SENSOR_PIN 4
#define PH_SENSOR_PIN A0
#define DO_SENSOR_PIN A1
#define TURBIDITY_SENSOR_PIN A2
#define FLOW_SENSOR_PIN 2
#define CO2_SENSOR_PIN A3
#define TDS_SENSOR_PIN A4
#define SALINITY_SENSOR_PIN A5
#define ALGAE_SENSOR_PIN A6

// Temperature sensor setup
OneWire oneWire(TEMP_SENSOR_PIN);
DallasTemperature temperatureSensor(&oneWire);

// Flow sensor variables
volatile int flow_frequency;
float flow_rate;
unsigned long currentTime;
unsigned long cloopTime;

WiFiClient espClient;
PubSubClient client(espClient);

// Sensor data structure
struct SensorData {
  float temperature;
  float pH;
  float dissolved_oxygen;
  float turbidity;
  float flow_rate;
  float co2;
  float tds;
  float salinity;
  float blue_green_algae;
};

void setup() {
  Serial.begin(115200);
  
  // Initialize sensors
  temperatureSensor.begin();
  pinMode(FLOW_SENSOR_PIN, INPUT);
  digitalWrite(FLOW_SENSOR_PIN, HIGH);
  attachInterrupt(digitalPinToInterrupt(FLOW_SENSOR_PIN), flow, RISING);
  
  // Initialize timing
  currentTime = millis();
  cloopTime = currentTime;
  
  // Connect to WiFi
  setup_wifi();
  
  // Setup MQTT
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  
  // Send discovery message
  send_discovery_message();
}

void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();
}

void reconnect() {
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    
    if (client.connect(device_id, mqtt_user, mqtt_password)) {
      Serial.println("connected");
      
      // Send discovery message on reconnect
      send_discovery_message();
      
      // Send status message
      send_status_message("online");
      
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
}

void send_discovery_message() {
  DynamicJsonDocument doc(1024);
  
  doc["device_id"] = device_id;
  doc["device_name"] = device_name;
  doc["device_location"] = device_location;
  doc["timestamp"] = millis();
  doc["ip_address"] = WiFi.localIP().toString();
  
  String message;
  serializeJson(doc, message);
  
  client.publish(discovery_topic, message.c_str());
  Serial.println("Discovery message sent");
}

void send_status_message(const char* status) {
  DynamicJsonDocument doc(512);
  
  doc["device_id"] = device_id;
  doc["status"] = status;
  doc["timestamp"] = millis();
  doc["uptime"] = millis();
  doc["free_heap"] = ESP.getFreeHeap();
  doc["wifi_rssi"] = WiFi.RSSI();
  
  String message;
  serializeJson(doc, message);
  
  client.publish(status_topic, message.c_str());
}

// Flow sensor interrupt function
void flow() {
  flow_frequency++;
}

SensorData read_sensors() {
  SensorData data;
  
  // Read temperature
  temperatureSensor.requestTemperatures();
  data.temperature = temperatureSensor.getTempCByIndex(0);
  if (data.temperature == DEVICE_DISCONNECTED_C) {
    data.temperature = 25.0; // Default value
  }
  
  // Read pH (calibration needed)
  int ph_raw = analogRead(PH_SENSOR_PIN);
  data.pH = map(ph_raw, 0, 4095, 0, 14) / 100.0 + 6.5; // Simple mapping, needs calibration
  
  // Read dissolved oxygen (calibration needed)
  int do_raw = analogRead(DO_SENSOR_PIN);
  data.dissolved_oxygen = map(do_raw, 0, 4095, 0, 20) / 100.0 + 5.0; // Simple mapping
  
  // Read turbidity (calibration needed)
  int turbidity_raw = analogRead(TURBIDITY_SENSOR_PIN);
  data.turbidity = map(turbidity_raw, 0, 4095, 0, 1000) / 100.0; // NTU
  
  // Calculate flow rate
  currentTime = millis();
  if (currentTime >= (cloopTime + 1000)) {
    cloopTime = currentTime;
    data.flow_rate = (flow_frequency / 7.5); // Pulse frequency (Hz) / 7.5Q = flow rate in L/min
    flow_frequency = 0;
  } else {
    data.flow_rate = flow_rate; // Use previous value
  }
  
  // Read CO2 (calibration needed)
  int co2_raw = analogRead(CO2_SENSOR_PIN);
  data.co2 = map(co2_raw, 0, 4095, 300, 1000); // ppm
  
  // Read TDS (calibration needed)
  int tds_raw = analogRead(TDS_SENSOR_PIN);
  data.tds = map(tds_raw, 0, 4095, 0, 500); // ppm
  
  // Read salinity (calibration needed)
  int salinity_raw = analogRead(SALINITY_SENSOR_PIN);
  data.salinity = map(salinity_raw, 0, 4095, 0, 50) / 100.0; // ppt
  
  // Read blue-green algae (calibration needed)
  int algae_raw = analogRead(ALGAE_SENSOR_PIN);
  data.blue_green_algae = map(algae_raw, 0, 4095, 0, 10) / 100.0; // µg/L
  
  return data;
}

void send_sensor_data(SensorData data) {
  DynamicJsonDocument doc(1024);
  
  doc["timestamp"] = millis();
  doc["boxId"] = device_id;
  doc["temperature"] = data.temperature;
  doc["pH"] = data.pH;
  doc["dissolved_oxygen"] = data.dissolved_oxygen;
  doc["turbidity"] = data.turbidity;
  doc["flow_rate"] = data.flow_rate;
  doc["co2"] = data.co2;
  doc["tds"] = data.tds;
  doc["salinity"] = data.salinity;
  doc["blue_green_algae"] = data.blue_green_algae;
  
  String message;
  serializeJson(doc, message);
  
  if (client.publish(data_topic, message.c_str())) {
    Serial.println("Sensor data sent successfully");
    Serial.println(message);
  } else {
    Serial.println("Failed to send sensor data");
  }
}

void loop() {
  if (!client.connected()) {
    reconnect();
  }
  client.loop();
  
  // Read sensors and send data every 10 seconds
  static unsigned long lastSensorRead = 0;
  if (millis() - lastSensorRead > 10000) {
    lastSensorRead = millis();
    
    SensorData data = read_sensors();
    send_sensor_data(data);
  }
  
  // Send status update every 60 seconds
  static unsigned long lastStatusUpdate = 0;
  if (millis() - lastStatusUpdate > 60000) {
    lastStatusUpdate = millis();
    send_status_message("online");
  }
  
  delay(100);
}