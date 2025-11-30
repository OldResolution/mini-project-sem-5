import React, { useState } from 'react';
import { AuthLayout } from './components/AuthLayout';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { Dashboard } from './components/Dashboard';

type AppState = 'login' | 'signup' | 'dashboard';

export default function App() {
  const [appState, setAppState] = useState<AppState>('login');

  const handleLogin = () => {
    setAppState('dashboard');
  };

  const handleSignup = () => {
    setAppState('dashboard');
  };

  const handleLogout = () => {
    setAppState('login');
  };

  const handleSwitchToSignup = () => {
    setAppState('signup');
  };

  const handleSwitchToLogin = () => {
    setAppState('login');
  };

  if (appState === 'dashboard') {
    return <Dashboard onLogout={handleLogout} />;
  }

  return (
    <AuthLayout>
      {appState === 'login' ? (
        <Login onLogin={handleLogin} onSwitchToSignup={handleSwitchToSignup} />
      ) : (
        <Signup onSignup={handleSignup} onSwitchToLogin={handleSwitchToLogin} />
      )}
    </AuthLayout>
  );
}
