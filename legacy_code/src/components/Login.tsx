import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface LoginProps {
  onLogin: () => void;
  onSwitchToSignup: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onSwitchToSignup }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="w-full max-w-md">
      {/* Logo/Brand */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-teal-400 to-blue-500 rounded-2xl mb-4 shadow-xl">
          <MapPin className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-white mb-2">Mumbai Eco-Watch</h1>
        <p className="text-teal-100">Environmental Monitoring Dashboard</p>
      </div>

      {/* Glassmorphic Card */}
      <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20">
        <h2 className="text-white mb-2">Welcome Back</h2>
        <p className="text-teal-100 mb-6">Sign in to access your dashboard</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-300" />
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-11 bg-white/10 border-white/20 text-white placeholder:text-teal-200/50 focus:bg-white/20 focus:border-teal-400 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-300" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-11 pr-11 bg-white/10 border-white/20 text-white placeholder:text-teal-200/50 focus:bg-white/20 focus:border-teal-400 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-300 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-teal-100 cursor-pointer">
              <input type="checkbox" className="mr-2 rounded border-white/20" />
              Remember me
            </label>
            <a href="#" className="text-teal-300 hover:text-white transition-colors">
              Forgot password?
            </a>
          </div>

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-teal-100">Don't have an account? </span>
          <button
            onClick={onSwitchToSignup}
            className="text-teal-300 hover:text-white transition-colors"
          >
            Sign up
          </button>
        </div>
      </div>

      {/* Footer Text */}
      <p className="text-center text-teal-200/60 mt-6 text-sm">
        Powered by AI & Real-time Environmental Data
      </p>
    </div>
  );
};
