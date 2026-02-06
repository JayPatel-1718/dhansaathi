import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

// SVG Icons as components
const WalletIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 12V18C21 19.1046 20.1046 20 19 20H5C3.89543 20 3 19.1046 3 18V6C3 4.89543 3.89543 4 5 4H19C20.1046 4 21 4.89543 21 6V8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <path d="M18 12C18 13.1046 17.1046 14 16 14C14.8954 14 14 13.1046 14 12C14 10.8954 14.8954 10 16 10C17.1046 10 18 10.8954 18 12Z" fill="currentColor"/>
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
  const [logoScale, setLogoScale] = useState(1);

  useEffect(() => {
    // Animate logo scale
    const logoInterval = setInterval(() => {
      setLogoScale(prev => prev === 1 ? 1.05 : 1);
    }, 2000);

    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          setTimeout(() => {
            navigate('/language-select');
          }, 500);
          return 100;
        }
        return prev + 2.5;
      });
    }, 80);

    return () => {
      clearInterval(logoInterval);
      clearInterval(progressInterval);
    };
  }, [navigate]);

  const handleVoiceTest = () => {
    const msg = new SpeechSynthesisUtterance('Namaste! Welcome to DhanSaathi. Your financial companion.');
    msg.lang = 'en-IN';
    window.speechSynthesis.speak(msg);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden"
         style={{
           background: 'linear-gradient(135deg, #E8F5E9 0%, #F0F9FF 50%, #EFF6FF 100%)',
         }}>
      
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-emerald-200/30 to-teal-200/20 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-gradient-to-r from-blue-200/20 to-cyan-200/30 blur-3xl" />
        
        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full bg-emerald-300/20"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                width: `${Math.random() * 20 + 5}px`,
                height: `${Math.random() * 20 + 5}px`,
                animation: `float ${Math.random() * 20 + 10}s linear infinite`,
                animationDelay: `${Math.random() * 5}s`,
              }}
            />
          ))}
        </div>

        {/* Floating Icons with enhanced styling */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Rupee Symbol - Top Left */}
          <div className="absolute left-[10%] top-[20%] text-emerald-400/20 animate-pulse">
            <RupeeIcon />
          </div>
          
          {/* Shield with Check - Top Right */}
          <div className="absolute right-[10%] top-[25%] text-blue-400/20 animate-pulse" style={{ animationDelay: '1s' }}>
            <ShieldCheckIcon />
          </div>
          
          {/* Microphone - Bottom Left */}
          <div className="absolute left-[15%] bottom-[25%] text-teal-400/20 animate-pulse" style={{ animationDelay: '2s' }}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C10.3431 2 9 3.34315 9 5V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V5C15 3.34315 13.6569 2 12 2Z" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 19V22" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          
          {/* Leaf - Bottom Right */}
          <div className="absolute right-[20%] bottom-[20%] text-emerald-400/20 animate-pulse" style={{ animationDelay: '3s' }}>
            <LeafIcon />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="rounded-[40px] p-8 shadow-2xl backdrop-blur-lg border border-white/20"
             style={{
               background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 253, 244, 0.98) 100%)',
               boxShadow: '0 20px 60px rgba(34, 197, 94, 0.15)',
             }}>
          
          {/* LOGO AREA - This is where you should add your logo */}
          {/* Replace the current WalletIcon with your actual logo */}
          <div className="flex justify-center mb-8">
            <div 
              className="w-32 h-32 rounded-3xl flex items-center justify-center shadow-2xl transition-all duration-300"
              style={{
                transform: `scale(${logoScale})`,
                background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
                boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3)',
              }}
            >
              {/* 
                ===============================
                REPLACE THIS WITH YOUR ACTUAL LOGO
                ===============================
                Option 1: Use an <img> tag for your logo
                <img 
                  src="/path/to/your/logo.png" 
                  alt="DhanSaathi Logo" 
                  className="w-20 h-20"
                />
                
                Option 2: Use your custom SVG component
                <YourLogoComponent className="w-20 h-20 text-white" />
                
                Option 3: Keep the existing wallet icon (temporary)
              */}
              <div className="text-white">
                <WalletIcon />
              </div>
            </div>
          </div>

          {/* App Name with gradient text */}
          <div className="text-center mb-4">
            <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-700 bg-clip-text text-transparent mb-2">
              DhanSaathi
            </h1>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="text-emerald-800 font-semibold text-sm">
                Aapka paisa, aapka saathi
              </span>
              <span className="text-emerald-600">💫</span>
            </div>
          </div>

          {/* Tagline */}
          <p className="text-center text-gray-600 text-lg mb-10">
            Your trusted companion for financial growth and security
          </p>

          {/* Progress Section */}
          <div className="mb-10">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-gray-700 font-medium">
                  {progress < 100 ? 'Loading your financial journey...' : 'Ready to explore!'}
                </span>
              </div>
              <span className="font-bold text-2xl" style={{ color: '#10B981' }}>
                {progress}%
              </span>
            </div>
            
            {/* Enhanced Progress Bar */}
            <div className="relative w-full h-4 rounded-full overflow-hidden"
                 style={{ backgroundColor: '#E5E7EB' }}>
              <div 
                className="h-full rounded-full transition-all duration-300 ease-out relative"
                style={{ 
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #10B981 0%, #34D399 50%, #10B981 100%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite linear',
                }}
              >
                {/* Progress bar glow effect */}
                <div className="absolute inset-0 rounded-full bg-white/30 blur-sm" />
              </div>
              
              {/* Progress bar steps */}
              <div className="absolute inset-0 flex justify-between items-center px-2">
                {[0, 25, 50, 75, 100].map((step) => (
                  <div 
                    key={step}
                    className={`w-2 h-2 rounded-full ${progress >= step ? 'bg-white' : 'bg-gray-300'}`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Enhanced Voice Button */}
          <button 
            onClick={handleVoiceTest}
            className="group w-full py-5 px-6 rounded-2xl flex items-center justify-center gap-4 
                       font-bold text-gray-900 transition-all duration-300 
                       hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl relative overflow-hidden"
            style={{ 
              background: 'linear-gradient(135deg, #34D399 0%, #10B981 100%)',
              boxShadow: '0 10px 30px rgba(16, 185, 129, 0.3)',
            }}
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <MicIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <div className="text-white text-lg font-bold">Try Voice Assistant</div>
                <div className="text-white/90 text-sm">"Namaste DhanSaathi"</div>
              </div>
            </div>
            
            <div className="relative z-10 ml-auto">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </button>

          {/* Features Grid */}
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { icon: '🛡️', text: 'Safe' },
              { icon: '💬', text: 'Voice-First' },
              { icon: '🌱', text: 'Beginner Friendly' },
            ].map((feature, index) => (
              <div 
                key={index}
                className="p-4 rounded-2xl text-center backdrop-blur-sm border border-white/20"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(240, 253, 244, 0.9) 100%)',
                }}
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <div className="text-sm font-medium text-gray-700">{feature.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center z-10">
        <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full backdrop-blur-sm border border-white/20"
             style={{
               background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 253, 244, 0.95) 100%)',
               boxShadow: '0 8px 32px rgba(34, 197, 94, 0.1)',
             }}>
          <p className="text-gray-600 flex items-center justify-center gap-2 text-sm">
            Made with 
            <span className="relative">
              <HeartIcon />
              <span className="absolute inset-0 animate-ping bg-emerald-400/20 rounded-full" />
            </span>
            for Bharat
          </p>
          <div className="w-1 h-1 rounded-full bg-emerald-400" />
          <span className="text-emerald-600 text-sm font-medium">
            Empowering Financial Freedom
          </span>
        </div>
      </div>

      {/* Add CSS animations */}
      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(180deg);
          }
        }
        
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        
        @keyframes pulse {
          0%, 100% {
            opacity: 0.2;
          }
          50% {
            opacity: 0.4;
          }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;