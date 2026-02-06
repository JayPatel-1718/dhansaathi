import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// SVG Icons
const LogoIcon = () => (
  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#22C55E"/>
    <path d="M16 8C12.6863 8 10 10.6863 10 14V18C10 21.3137 12.6863 24 16 24C19.3137 24 22 21.3137 22 18V14C22 10.6863 19.3137 8 16 8Z" fill="white"/>
    <circle cx="16" cy="16" r="3" fill="#22C55E"/>
  </svg>
);

const HelpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#22C55E" strokeWidth="2"/>
    <path d="M12 16V12" stroke="#22C55E" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="8" r="1" fill="#22C55E"/>
  </svg>
);

const SpeakerIcon = ({ isSelected = false }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 5L6 9H2V15H6L11 19V5Z" fill={isSelected ? "#22C55E" : "#22C55E"}/>
    <path d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53" stroke={isSelected ? "#22C55E" : "#22C55E"} strokeWidth="2" strokeLinecap="round"/>
    <path d="M18.07 5.93C19.9447 7.80528 20.9979 10.3478 20.9979 13C20.9979 15.6522 19.9447 18.1947 18.07 20.07" stroke={isSelected ? "#22C55E" : "#22C55E"} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="11" width="18" height="11" rx="2" stroke="#6B7280" strokeWidth="2"/>
    <path d="M7 11V7C7 4.23858 9.23858 2 12 2C14.7614 2 17 4.23858 17 7V11" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const HeadsetIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 18V12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12V18" stroke="#6B7280" strokeWidth="2" strokeLinecap="round"/>
    <path d="M21 19C21 20.1046 20.1046 21 19 21H18C16.8954 21 16 20.1046 16 19V16C16 14.8954 16.8954 14 18 14H21V19Z" stroke="#6B7280" strokeWidth="2"/>
    <path d="M3 19C3 20.1046 3.89543 21 5 21H6C7.10457 21 8 20.1046 8 19V16C8 14.8954 7.10457 14 6 14H3V19Z" stroke="#6B7280" strokeWidth="2"/>
  </svg>
);

const LanguageSelection = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const stepProgress = 25;

  const languages = [
    { 
      id: 'hindi', 
      name: 'हिन्दी', 
      greeting: 'नमस्ते! धनसाथी में आपका स्वागत है',
      lang: 'hi-IN'
    },
    { 
      id: 'english', 
      name: 'English', 
      greeting: 'Hello! Welcome to DhanSaathi',
      lang: 'en-IN'
    },
    { 
      id: 'tamil', 
      name: 'தமிழ்', 
      greeting: 'வணக்கம்! தன்சாத்திக்கு வரவேற்கிறோம்',
      lang: 'ta-IN'
    },
    { 
      id: 'telugu', 
      name: 'తెలుగు', 
      greeting: 'నమస్కారం! ధన్‌సాథీకి స్వాగతం',
      lang: 'te-IN'
    },
  ];

  const handleLanguageSelect = (language) => {
    setSelectedLanguage(language.id);
    
    // Speak greeting in selected language
    window.speechSynthesis.cancel();
    const msg = new SpeechSynthesisUtterance(language.greeting);
    msg.lang = language.lang;
    window.speechSynthesis.speak(msg);
  };

  const handleContinue = () => {
    if (!selectedLanguage) {
      const msg = new SpeechSynthesisUtterance('Please select a language to continue');
      msg.lang = 'en-IN';
      window.speechSynthesis.speak(msg);
      return;
    }
    localStorage.setItem('dhan-saathi-language', selectedLanguage);
    navigate('/signup');
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-white">
      
      {/* Gradient Background */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(187, 247, 208, 0.5) 0%, rgba(255, 255, 255, 0) 50%)',
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <LogoIcon />
          <span className="text-xl font-bold text-gray-900">DhanSaathi</span>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
          <HelpIcon />
          <span className="text-sm text-gray-700">Sahayata / Help</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-6 pt-8">
        
        {/* Progress Section */}
        <div className="w-full max-w-md mb-10">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Onboarding: Step 1 of 4</span>
            <span className="text-sm font-bold text-green-500">{stepProgress}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-green-500 rounded-full transition-all duration-300"
              style={{ width: `${stepProgress}%` }}
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Apni bhasha chunein
          </h1>
          <p className="text-xl text-green-500 font-medium">
            अपनी भाषा चुनें
          </p>
        </div>

        {/* Language Grid - 2x2 */}
        <div className="w-full max-w-md mb-8">
          <div className="grid grid-cols-2 gap-4">
            {languages.map((language) => (
              <button
                key={language.id}
                onClick={() => handleLanguageSelect(language)}
                className={`
                  flex items-center justify-between px-5 py-5 rounded-2xl border-2 
                  transition-all duration-200 bg-white
                  ${selectedLanguage === language.id
                    ? 'border-green-500 shadow-lg shadow-green-100'
                    : 'border-gray-200 hover:border-green-300 hover:shadow-md'
                  }
                `}
              >
                <span className="text-xl font-semibold text-gray-900">
                  {language.name}
                </span>
                <SpeakerIcon isSelected={selectedLanguage === language.id} />
              </button>
            ))}
          </div>
        </div>

        {/* Continue Button */}
        <div className="w-full max-w-md">
          <button
            onClick={handleContinue}
            disabled={!selectedLanguage}
            className={`
              w-full py-4 rounded-full font-semibold text-lg 
              flex items-center justify-center gap-3 transition-all duration-200
              ${selectedLanguage
                ? 'bg-green-400 text-gray-900 hover:bg-green-500 shadow-lg'
                : 'bg-green-300 text-gray-600 cursor-not-allowed'
              }
            `}
          >
            Continue
            <ArrowRightIcon />
          </button>

          {/* Trust Text */}
          <p className="text-center text-gray-500 text-sm mt-4">
            Trust of <span className="text-green-600 font-medium">5M+ users</span> • Fast & Secure • Made for India
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 px-6">
        <div className="flex items-center justify-center gap-8">
          <div className="flex items-center gap-2">
            <LockIcon />
            <span className="text-gray-600 text-sm">Secure SSL</span>
          </div>
          <div className="flex items-center gap-2">
            <HeadsetIcon />
            <span className="text-gray-600 text-sm">24/7 Support</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LanguageSelection;