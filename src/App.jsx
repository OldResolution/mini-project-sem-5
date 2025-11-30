import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import Login from './components/Login';
import Signup from './components/Signup';
import MapComponent from './components/MapComponent';
import AuthLayout from './components/AuthLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={
          <AuthLayout>
            <Login />
          </AuthLayout>
        } />
        <Route path="/signup" element={
          <AuthLayout>
            <Signup />
          </AuthLayout>
        } />
        <Route path="/map" element={<MapComponent />} />
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
