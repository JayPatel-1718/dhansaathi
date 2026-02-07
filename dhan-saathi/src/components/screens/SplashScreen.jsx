import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Your Logo (green logo on white background - bigger size)
const YourLogo = () => (
  <div className="w-40 h-40 rounded-3xl bg-white flex items-center justify-center shadow-2xl border border-gray-100 overflow-hidden">
    <img 
      src="Dhaansaathi.jpeg" 
      alt="DhanSaathi" 
      className="w-36 h-36 object-contain" // Slightly smaller than container for padding
    />
  </div>
);

const MicIcon = ({ className = "" }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C10.3431 2 9 3.34315 9 5V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V5C15 3.34315 13.6569 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 19V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SplashScreen = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    // Fade in animation
    setTimeout(() => setFadeIn(true), 400);

    // Progress bar animation (smooth & fast)
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          setTimeout(() => {
            navigate('/language-select');
          }, 800);
          return 100;
        }
        return prev + 4; // Slightly faster for premium quick feel
      });
    }, 60);

    return () => clearInterval(progressTimer);
  }, [navigate]);

  const handleVoiceTest = () => {
    const msg = new SpeechSynthesisUtterance('Namaste! Welcome to DhanSaathi. Your financial companion.');
    msg.lang = 'en-IN';
    window.speechSynthesis.speak(msg);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden"
    >
      {/* Very subtle background accent (almost invisible white-to-soft-green) */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-white via-white to-emerald-50/10" />
      </div>

      {/* Main Card - Pure white, glass-like subtle border, premium minimal */}
      <div 
        className={`relative w-full max-w-lg mx-6 p-12 sm:p-16 rounded-3xl border border-gray-100 shadow-2xl transition-all duration-1000 ${
          fadeIn ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        style={{
          background: 'rgba(255, 255, 255, 0.98)',
          boxShadow: '0 30px 80px rgba(0, 0, 0, 0.08), 0 10px 40px rgba(16, 185, 129, 0.05) inset',
        }}
      >
        {/* Logo - Bigger & centered */}
        <div className="flex justify-center mb-12">
          <div className="transform transition-all duration-1000 hover:scale-105">
            <YourLogo />
          </div>
        </div>

        {/* App Name - Elegant gradient */}
        <h1 className="text-6xl sm:text-7xl font-extrabold text-center mb-5 tracking-tight bg-gradient-to-r from-emerald-700 via-teal-600 to-emerald-600 bg-clip-text text-transparent">
          DhanSaathi
        </h1>

        {/* Refined Tagline */}
        <p className="text-center text-gray-600 text-xl font-medium mb-16">
          Your trusted companion for financial confidence
        </p>

        {/* Progress Bar - Ultra-sleek */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-4">
            <span className="text-base font-medium text-gray-700">
              Preparing your secure journey...
            </span>
            <span className="text-2xl font-bold text-emerald-700">
              {Math.round(progress)}%
            </span>
          </div>

          <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{ 
                width: `${progress}%`,
                background: 'linear-gradient(90deg, #10B981 0%, #34D399 60%, #10B981 100%)',
                backgroundSize: '200% 100%',
                animation: 'shimmer 4s infinite linear',
              }}
            />
          </div>
        </div>

        {/* Voice Test Button - Clean & premium */}
        <button
          onClick={handleVoiceTest}
          className="w-full py-5 px-8 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-xl flex items-center justify-center gap-4 shadow-lg hover:shadow-2xl hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:scale-[1.02] active:scale-100"
        >
          <MicIcon className="w-7 h-7" />
          Try Voice Assistant
        </button>

        {/* Minimal Footer */}
        <p className="text-center text-gray-500 text-sm mt-12 font-medium">
          Empowering Financial Freedom for Bharat
        </p>
      </div>

      {/* Shimmer Animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;