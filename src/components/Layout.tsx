import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSensor } from '../context/SensorContext';
import { 
  Home, 
  Activity, 
  BarChart3, 
  Users, 
  LogOut,
  Wifi,
  WifiOff,
  Fish
} from 'lucide-react';

const AnimatedFish: React.FC<{ delay: number; direction: 'left' | 'right' }> = ({ delay, direction }) => {
  const animationClass = direction === 'left' 
    ? 'animate-swim-left' 
    : 'animate-swim-right';
  
  return (
    <div 
      className={`fixed ${animationClass} text-sky-400 opacity-30 pointer-events-none z-0`}
      style={{ 
        animationDelay: `${delay}s`,
        top: `${Math.random() * 60 + 20}%`,
        left: direction === 'right' ? '-50px' : 'calc(100% + 50px)'
      }}
    >
      <Fish className="h-8 w-8" />
    </div>
  );
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const { isConnected, isWaitingForData } = useSensor();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/', label: 'Dashboard', icon: Home },
    { path: '/sensors', label: 'Sensor Data', icon: Activity },
    { path: '/analytics', label: 'Analytics', icon: BarChart3 },
    { path: '/users', label: 'Users', icon: Users }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100">
      {/* Animated Fish */}
      {[...Array(6)].map((_, i) => (
        <AnimatedFish 
          key={i} 
          delay={i * 3} 
          direction={i % 2 === 0 ? 'left' : 'right'} 
        />
      ))}
      
      {/* Header */}
      <header className="bg-white shadow-lg border-b-4 border-sky-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <img src="/image copy copy.png" alt="Polychaeta Logo" className="h-10 w-auto" />
              </div>
              <div className="flex items-center space-x-2">
                {isConnected && !isWaitingForData ? (
                  <>
                    <Wifi className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600 font-medium">Receiving Data</span>
                  </>
                ) : isConnected && isWaitingForData ? (
                  <>
                    <Wifi className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm text-yellow-600 font-medium">Connected - Waiting for ESP32</span>
                  </>
                ) : (
                  <>
                    <WifiOff className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600 font-medium">Connecting to MQTT</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Welcome, {user?.username}</span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-sky-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-4 py-4 text-sm font-medium transition-colors border-b-2 ${
                    isActive
                      ? 'text-sky-600 border-sky-600'
                      : 'text-gray-500 border-transparent hover:text-sky-600 hover:border-sky-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};

export default Layout;