import React from 'react';

export const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1710582999228-bf5a133c4573?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtdW1iYWklMjBza3lsaW5lJTIwYWVyaWFsfGVufDF8fHx8MTc2NDM0MzA4Mnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral')`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900/70 via-blue-900/70 to-emerald-900/70 backdrop-blur-sm" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        {children}
      </div>
      
      {/* Floating Decorative Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-teal-400/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-400/20 rounded-full blur-3xl" />
    </div>
  );
};

export default AuthLayout;
