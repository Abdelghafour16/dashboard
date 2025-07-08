export interface SensorData {
  timestamp: number;
  boxId: string;
  temperature: number;
  pH: number;
  dissolved_oxygen: number;
  turbidity: number;
  flow_rate: number;
  co2: number;
  tds: number;
  salinity: number;
  blue_green_algae: number;
}

export interface User {
  id: string;
  username: string;
  password: string;
  role: 'owner' | 'user';
  assignedBoxes: string[];
  createdAt: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

export interface SensorStatus {
  status: 'normal' | 'warning' | 'critical';
  message: string;
}

export interface SensorBox {
  id: string;
  name: string;
  location: string;
  assignedUser: string;
  isActive: boolean;
  lastUpdate: number;
}