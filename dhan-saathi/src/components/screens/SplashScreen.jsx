import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// SVG Icons as components
const WalletIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 12V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V8" stroke="black" strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 12C18 13.1046 17.1046 14 16 14C14.8954 14 14 13.1046 14 12C14 10.8954 14.8954 10 16 10C17.1046 10 18 10.8954 18 12Z" fill="black"/>
  </svg>
);

const RupeeIcon = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 4H17M7 8H17M7 8C7 8 9 8 11 8C14.3137 8 17 10.6863 17 14C17 17.3137 14.3137 20 11 20L17 20M7 12H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="100" height="100" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L4 7V11C4 15.4183 7.58172 20 12 21C16.4183 20 20 15.4183 20 11V7L12 3Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// FIXED: Removed TypeScript syntax
const MicIcon = ({ className = "" }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C10.3431 2 9 3.34315 9 5V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V5C15 3.34315 13.6569 2 12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 19V22M12 22H8M12 22H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LeafIcon = () => (
  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21C12 21 4 15 4 9C4 5 7 3 12 3C17 3 20 5 20 9C20 15 12 21 12 21Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M12 21V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M9 12L12 9L15 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const HeartIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="#22C55E" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="#22C55E"/>
  </svg>
);

const SplashScreen = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            navigate('/language-select');
          }, 500);
          return 100;
        }
        return prev + 3;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [navigate]);

  const handleVoiceTest = () => {
    const msg = new SpeechSynthesisUtterance('Namaste! Welcome to DhanSaathi. Your financial companion.');
    msg.lang = 'en-IN';
    window.speechSynthesis.speak(msg);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
         style={{ backgroundColor: '#E8F5E9' }}>
      
      {/* Floating Background Icons */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Rupee Symbol - Left */}
        <div className="absolute left-[10%] top-[25%] text-gray-300/50">
          <RupeeIcon />
        </div>
        
        {/* Shield with Check - Right */}
        <div className="absolute right-[8%] top-[30%] text-gray-300/40">
          <ShieldCheckIcon />
        </div>
        
        {/* Microphone - Bottom Left */}
        <div className="absolute left-[25%] bottom-[20%] text-gray-300/40">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C10.3431 2 9 3.34315 9 5V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V5C15 3.34315 13.6569 2 12 2Z" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 19V22" stroke="currentColor" strokeWidth="1.5"/>
          </svg>
        </div>
        
        {/* Leaf - Bottom Right */}
        <div className="absolute right-[15%] bottom-[18%] text-gray-300/40">
          <LeafIcon />
        </div>
      </div>

      {/* Main Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="rounded-3xl p-8 shadow-lg"
             style={{ backgroundColor: '#C8F7C5' }}>
          
          {/* App Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md"
                 style={{ backgroundColor: '#4ADE80' }}>
              <WalletIcon />
            </div>
          </div>

          {/* App Name */}
          <h1 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-2">
            DhanSaathi
          </h1>

          {/* Tagline */}
          <p className="text-center text-gray-600 text-lg mb-8">
            Aapka paisa, aapka saathi
          </p>

          {/* Progress Section */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-700 font-medium">
                {progress < 100 ? 'Preparing your journey' : 'Ready!'}
              </span>
              <span className="font-bold" style={{ color: '#22C55E' }}>
                {progress}%
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 rounded-full overflow-hidden"
                 style={{ backgroundColor: '#E9D5FF' }}>
              <div 
                className="h-full rounded-full transition-all duration-300 ease-out"
                style={{ 
                  width: `${progress}%`,
                  backgroundColor: '#22C55E'
                }}
              />
            </div>
          </div>

          {/* Voice Button */}
          <button 
            onClick={handleVoiceTest}
            className="w-full py-4 px-6 rounded-full flex items-center justify-center gap-3 
                       font-semibold text-gray-900 transition-all duration-200 
                       hover:scale-[1.02] active:scale-[0.98] shadow-md"
            style={{ backgroundColor: '#4ADE80' }}
          >
            <MicIcon className="w-5 h-5" />
            <span>"Namaste DhanSaathi"</span>
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-gray-500 flex items-center justify-center gap-1">
          Made with <HeartIcon /> for Bharat
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;