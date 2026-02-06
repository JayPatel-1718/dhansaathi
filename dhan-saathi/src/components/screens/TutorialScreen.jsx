import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TutorialScreen = () => {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  useEffect(() => {
    const lang = localStorage.getItem('dhan-saathi-language') || 'hindi';
    setSelectedLanguage(lang);

    const done = localStorage.getItem('dhan-saathi-tutorial-completed');
    if (done === 'true') {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  const langCode = useMemo(() => {
    if (selectedLanguage === 'hindi') return 'hi-IN';
    if (selectedLanguage === 'tamil') return 'ta-IN';
    if (selectedLanguage === 'telugu') return 'te-IN';
    return 'en-IN';
  }, [selectedLanguage]);

  const speak = (text) => {
    try {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = langCode;
      window.speechSynthesis.speak(msg);
    } catch {
      // silent fail
    }
  };

  const isHindi = selectedLanguage === 'hindi';

  const tutorialSteps = useMemo(
    () => [
      {
        id: 1,
        icon: '🎤',
        title: isHindi ? 'माइक दबाकर बोलें' : 'Press mic to speak',
        description: isHindi
          ? 'Talk to DhanSaathi in your preferred language for any financial query or help.'
          : 'Talk to DhanSaathi in your preferred language for any financial query or help.',
        listenText: isHindi ? 'सुनें निर्देश' : 'Listen to Instruction',
      },
      {
        id: 2,
        icon: '🏦',
        title: isHindi ? 'योजनाएं और फायदे देखें' : 'See schemes & benefits',
        description: isHindi
          ? 'Discover government schemes tailored specifically to your profile and eligibility.'
          : 'Discover government schemes tailored specifically to your profile and eligibility.',
        listenText: isHindi ? 'सुनें निर्देश' : 'Listen to Instruction',
      },
      {
        id: 3,
        icon: '❓',
        title: isHindi ? 'कभी भी मदद पाएं' : 'Get help anytime',
        description: isHindi
          ? 'Ask questions about banking, savings, or insurance easily with instant answers.'
          : 'Ask questions about banking, savings, or insurance easily with instant answers.',
        listenText: isHindi ? 'सुनें निर्देश' : 'Listen to Instruction',
      },
    ],
    [isHindi]
  );

  const handleGetStarted = () => {
    localStorage.setItem('dhan-saathi-tutorial-completed', 'true');
    navigate('/home', { replace: true });
  };

  const handleSkip = () => {
    localStorage.setItem('dhan-saathi-tutorial-completed', 'true');
    navigate('/home', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-blue-50 flex flex-col items-center px-5 sm:px-6 pt-8 pb-10">
      {/* Header / Title area */}
      <div className="w-full max-w-5xl text-center mb-10">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-3">
          {isHindi ? 'DhanSaathi कैसे इस्तेमाल करें' : 'How to use DhanSaathi'}
        </h1>
        <p className="text-gray-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
          {isHindi
            ? 'आपका voice-first financial साथी। सरल वॉइस कमांड्स से अपनी फाइनेंस को आसानी से मैनेज करें।'
            : 'Your voice-first financial companion. Learn how to navigate your finances using simple voice commands and personalized insights.'}
        </p>
      </div>

      {/* Horizontal Cards */}
      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
        {tutorialSteps.map((step) => (
          <div
            key={step.id}
            className="bg-white rounded-3xl shadow-lg p-6 md:p-8 border border-gray-100 text-center flex flex-col items-center transition-transform hover:scale-105"
          >
            <div className="w-20 h-20 mb-6 rounded-full bg-green-100 flex items-center justify-center text-5xl shadow-sm">
              {step.icon}
            </div>

            <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-4">{step.title}</h2>

            <p className="text-gray-600 mb-6 text-sm md:text-base leading-relaxed flex-grow">
              {step.description}
            </p>

            <button
              onClick={() => speak(`${step.title}. ${step.description}`)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 font-semibold rounded-full hover:bg-green-100 transition mt-auto"
            >
              <span className="text-xl">🔊</span>
              {step.listenText}
            </button>
          </div>
        ))}
      </div>

      {/* Carousel dots indicator (optional – centered) */}
      <div className="flex gap-3 mb-10">
        <div className="w-3 h-3 rounded-full bg-green-600" />
        <div className="w-3 h-3 rounded-full bg-gray-300" />
        <div className="w-3 h-3 rounded-full bg-gray-300" />
      </div>

      {/* Action buttons */}
      <div className="w-full max-w-md flex flex-col items-center gap-5 mb-12">
        <button
          onClick={handleGetStarted}
          className="w-full max-w-xs py-4 bg-green-600 text-white text-lg sm:text-xl font-bold rounded-full shadow-lg hover:bg-green-700 transition active:scale-95"
        >
          {isHindi ? 'DhanSaathi इस्तेमाल शुरू करें' : 'Start using DhanSaathi'}
        </button>

        <button
          onClick={handleSkip}
          className="text-gray-500 font-medium hover:text-gray-700 underline text-base"
        >
          {isHindi ? 'Skip for now' : 'Skip for now'}
        </button>
      </div>

      {/* Footer */}
      <div className="text-center text-sm text-gray-500 mt-auto">
        <p className="mb-3">© 2024 DhanSaathi. Empowering your financial future.</p>
        <div className="flex justify-center gap-6 flex-wrap">
          <a href="#" className="hover:text-green-700">Terms of Service</a>
          <a href="#" className="hover:text-green-700">Privacy Policy</a>
          <a href="#" className="hover:text-green-700">Support</a>
        </div>
      </div>
    </div>
  );
};

export default TutorialScreen;