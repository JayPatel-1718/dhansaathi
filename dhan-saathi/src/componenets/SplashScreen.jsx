import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SplashScreen = () => {
  const navigate = useNavigate();
  const [progress, setProgress] = useState(0);
  const [greeting, setGreeting] = useState('Hello DhanSaathi');

  useEffect(() => {
    // Simulate loading progress
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gradient-bg p-4">
      {/* Floating Rupee Symbols */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute text-white/20 text-4xl animate-float"
            style={{
              left: `${5 + i * 8}%`,
              top: `${20 + (i * 7) % 60}%`,
              animationDelay: `${i * 0.3}s`,
            }}
          >
            ₹
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 text-center mb-8">
        <h1 className="text-6xl md:text-7xl font-bold text-white mb-4 tracking-tight">
          DhanSaathi
        </h1>
        <p className="text-2xl md:text-3xl text-white/90">
          आपका पैसा, आपका साथी
        </p>
        <p className="text-lg text-white/80 mt-2">
          Your money, your companion
        </p>
      </div>
      
      {/* Loading Card */}
      <div className="relative z-10 glass-card p-8 rounded-3xl max-w-md w-full">
        <div className="text-white text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-2xl animate-pulse">👋</span>
            <p className="text-xl font-semibold">{greeting}</p>
          </div>
          
          <p className="text-lg mb-2">
            {progress < 100 ? 'Preparing your journey...' : 'Ready!'}
          </p>
          <p className="text-3xl font-bold mt-2">{progress}%</p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-3 bg-white/20 rounded-full overflow-hidden mb-6">
          <div 
            className="h-full bg-gradient-to-r from-primary to-mint rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Voice Status */}
        <div className="flex items-center justify-center gap-2 text-white/80 text-sm">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <span>Voice navigation ready</span>
        </div>
      </div>

      {/* Voice Test Button */}
      <button 
        className="relative z-10 mt-8 glass p-4 rounded-full hover:scale-110 transition-transform"
        onClick={() => {
          const msg = new SpeechSynthesisUtterance('Welcome to DhanSaathi. Your financial companion.');
          msg.lang = 'en-IN';
          window.speechSynthesis.speak(msg);
        }}
        title="Test Voice"
      >
        <div className="text-2xl">🔊</div>
      </button>
    </div>
  );
};

export default SplashScreen;