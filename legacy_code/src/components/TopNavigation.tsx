import React from 'react';
import { MapPin, User, Bell, Settings, LogOut } from 'lucide-react';
import { Button } from './ui/button';

interface TopNavigationProps {
  onLogout: () => void;
  userName: string;
}

export const TopNavigation: React.FC<TopNavigationProps> = ({ onLogout, userName }) => {
  return (
    <div className="absolute top-0 left-0 right-0 z-30 p-6">
      <div className="flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-2xl px-5 py-3 border border-white/20 shadow-lg">
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-teal-400 to-blue-500 rounded-xl">
            <MapPin className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white leading-tight">Mumbai Eco-Watch</h1>
            <p className="text-xs text-teal-100">Environmental Monitor</p>
          </div>
        </div>

        {/* Right Section - User Info and Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 text-white hover:bg-white/20 relative"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </Button>

          {/* Settings */}
          <Button
            variant="ghost"
            size="icon"
            className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 text-white hover:bg-white/20"
          >
            <Settings className="w-5 h-5" />
          </Button>

          {/* User Menu */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xl rounded-2xl px-4 py-2 border border-white/20">
            <div className="flex items-center justify-center w-9 h-9 bg-gradient-to-br from-teal-400 to-blue-500 rounded-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm text-white leading-tight">{userName}</p>
              <p className="text-xs text-teal-100">Administrator</p>
            </div>
          </div>

          {/* Logout */}
          <Button
            onClick={onLogout}
            variant="ghost"
            size="icon"
            className="bg-red-500/20 backdrop-blur-xl rounded-xl border border-red-400/30 text-red-300 hover:bg-red-500/30 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};
