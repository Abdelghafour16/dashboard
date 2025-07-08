import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SensorProvider } from './context/SensorContext';
import PrivateRoute from './components/PrivateRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SensorData from './pages/SensorData';
import Analytics from './pages/Analytics';
import Users from './pages/Users';

function App() {
  return (
    <AuthProvider>
      <SensorProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <PrivateRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/sensors" element={
              <PrivateRoute>
                <Layout>
                  <SensorData />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/analytics" element={
              <PrivateRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </PrivateRoute>
            } />
            <Route path="/users" element={
              <PrivateRoute>
                <Layout>
                  <Users />
                </Layout>
              </PrivateRoute>
            } />
          </Routes>
        </Router>
      </SensorProvider>
    </AuthProvider>
  );
}

export default App;