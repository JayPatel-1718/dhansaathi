import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// ────────────────────────────────────────────────
// SVG Icons (refined for consistency & better look)
// ────────────────────────────────────────────────
const LogoIcon = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="36" height="36" rx="10" fill="#16a34a" />
    <path
      d="M18 9C13.8579 9 10.5 12.3579 10.5 16.5V19.5C10.5 23.6421 13.8579 27 18 27C22.1421 27 25.5 23.6421 25.5 19.5V16.5C25.5 12.3579 22.1421 9 18 9Z"
      fill="white"
    />
    <circle cx="18" cy="18" r="4" fill="#16a34a" />
  </svg>
);

const HelpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="#16a34a" strokeWidth="2.2" />
    <path d="M12 16V12" stroke="#16a34a" strokeWidth="2.2" strokeLinecap="round" />
    <circle cx="12" cy="8" r="1.3" fill="#16a34a" />
  </svg>
);

const SpeakerIcon = ({ isSelected = false }) => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M11 5L6 9H2V15H6L11 19V5Z"
      fill={isSelected ? "#16a34a" : "#9ca3af"}
    />
    <path
      d="M15.54 8.46C16.4774 9.39764 17.0039 10.6692 17.0039 11.995C17.0039 13.3208 16.4774 14.5924 15.54 15.53"
      stroke={isSelected ? "#16a34a" : "#9ca3af"}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M18.07 5.93C19.9447 7.80528 20.9979 10.3478 20.9979 13C20.9979 15.6522 19.9447 18.1947 18.07 20.07"
      stroke={isSelected ? "#16a34a" : "#9ca3af"}
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const LockIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="4" y="11" width="16" height="10" rx="3" stroke="#6b7280" strokeWidth="2" />
    <path d="M8 11V8C8 5.23858 10.2386 3 13 3C15.7614 3 18 5.23858 18 8V11" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const HeadsetIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M3 18V12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12V18" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" />
    <path d="M21 19C21 20.1046 20.1046 21 19 21H18C16.8954 21 16 20.1046 16 19V16C16 14.8954 16.8954 14 18 14H21V19Z" stroke="#6b7280" strokeWidth="2" />
    <path d="M3 19C3 20.1046 3.89543 21 5 21H6C7.10457 21 8 20.1046 8 19V16C8 14.8954 7.10457 14 6 14H3V19Z" stroke="#6b7280" strokeWidth="2" />
  </svg>
);

const LanguageSelection = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const stepProgress = 25;

  const languages = [
    { id: 'hindi',   name: 'हिन्दी',   greeting: 'नमस्ते! धनसाथी में आपका स्वागत है', lang: 'hi-IN' },
    { id: 'english', name: 'English',  greeting: 'Hello! Welcome to DhanSaathi',      lang: 'en-IN' },
    { id: 'tamil',   name: 'தமிழ்',    greeting: 'வணக்கம்! தன்சாத்திக்கு வரவேற்கிறோம்', lang: 'ta-IN' },
    { id: 'telugu',  name: 'తెలుగు',   greeting: 'నమస్కారం! ధన్‌సాథీకి స్వాగతం',     lang: 'te-IN' },
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
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-gradient-to-br from-gray-50 via-white to-green-50/30">
      {/* Subtle animated background overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.08)_0%,transparent_50%)] animate-pulse-slow" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 sm:px-8 py-5">
        <div className="flex items-center gap-3">
          <LogoIcon />
          <span className="text-2xl font-extrabold text-gray-900 tracking-tight">DhanSaathi</span>
        </div>
        <button className="flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-gray-200 bg-white/70 backdrop-blur-sm hover:bg-white hover:shadow-md transition-all">
          <HelpIcon />
          <span className="text-sm font-medium text-gray-700">Help / सहायता</span>
        </button>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center px-5 sm:px-8 pt-6 pb-12">
        {/* Progress bar */}
        <div className="w-full max-w-md mb-12">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm font-medium text-gray-600">Step 1 of 4 • भाषा चुनें</span>
            <span className="text-sm font-bold text-green-600">{stepProgress}%</span>
          </div>
          <div className="relative h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <div
              className="absolute h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-700 ease-out shadow-lg shadow-green-400/40"
              style={{ width: `${stepProgress}%` }}
            />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
            Choose Your Language
          </h1>
          <p className="text-xl sm:text-2xl font-medium text-green-600">
            अपनी भाषा चुनें
          </p>
        </div>

        {/* Language selection grid */}
        <div className="w-full max-w-2xl grid grid-cols-1 sm:grid-cols-2 gap-5 mb-12">
          {languages.map((language) => (
            <button
              key={language.id}
              onClick={() => handleLanguageSelect(language)}
              className={`
                group relative flex items-center justify-between px-7 py-8 rounded-3xl border-2
                transition-all duration-300 ease-out bg-white/80 backdrop-blur-sm
                hover:shadow-xl hover:-translate-y-1 hover:border-green-400
                ${selectedLanguage === language.id
                  ? 'border-green-500 shadow-2xl shadow-green-300/50 scale-[1.03] bg-gradient-to-br from-white to-green-50/40'
                  : 'border-gray-200'
                }
              `}
            >
              <span className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                {language.name}
              </span>

              <div className="transform transition-transform duration-300 group-hover:scale-110">
                <SpeakerIcon isSelected={selectedLanguage === language.id} />
              </div>

              {/* Selected ring indicator */}
              {selectedLanguage === language.id && (
                <div className="absolute -inset-1.5 rounded-3xl border-2 border-green-500/40 animate-pulse-slow pointer-events-none" />
              )}
            </button>
          ))}
        </div>

        {/* Continue button */}
        <div className="w-full max-w-md">
          <button
            onClick={handleContinue}
            disabled={!selectedLanguage}
            className={`
              relative w-full py-5 rounded-full font-bold text-xl flex items-center justify-center gap-3
              overflow-hidden transition-all duration-300 shadow-xl
              ${selectedLanguage
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 hover:shadow-2xl hover:scale-[1.02]'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
              }
            `}
          >
            <span>Continue</span>
            <ArrowRightIcon />
            <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition-opacity" />
          </button>

          <p className="text-center text-gray-500 text-sm mt-6 font-medium">
            Trusted by <span className="text-green-600">5 Million+</span> Indians • Fast • Secure
          </p>
        </div>
      </main>

      {/* Footer trust indicators */}
      <footer className="relative z-10 py-8 px-6 border-t border-gray-100 bg-white/60 backdrop-blur-sm">
        <div className="flex flex-wrap justify-center gap-10 sm:gap-16 text-sm text-gray-600">
          <div className="flex items-center gap-3 hover:text-green-600 transition-colors">
            <LockIcon />
            <span>Secure SSL</span>
          </div>
          <div className="flex items-center gap-3 hover:text-green-600 transition-colors">
            <HeadsetIcon />
            <span>24×7 Support</span>
          </div>
        </div>
      </footer>

      {/* Floating voice hint */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md px-5 py-2.5 rounded-full shadow-lg text-sm text-gray-700 flex items-center gap-2 pointer-events-none">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
          <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
        </svg>
        <span>Voice support available</span>
      </div>
    </div>
  );
};

export default LanguageSelection;