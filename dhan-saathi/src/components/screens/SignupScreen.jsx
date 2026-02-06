import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// SVG Icons
const GrowthIcon = () => (
  <svg width="120" height="120" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20V10M18 20V4M6 20V14" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="20" r="1.5" fill="#22C55E"/>
    <circle cx="18" cy="20" r="1.5" fill="#22C55E"/>
    <circle cx="6" cy="20" r="1.5" fill="#22C55E"/>
    <circle cx="12" cy="10" r="1.5" fill="#22C55E"/>
    <circle cx="18" cy="4" r="1.5" fill="#22C55E"/>
    <circle cx="6" cy="14" r="1.5" fill="#22C55E"/>
  </svg>
);

const SecureIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L4 7V11C4 15.4183 7.58172 20 12 21C16.4183 20 20 15.4183 20 11V7L12 3Z" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12L11 14L15 10" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EasyIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 10L12 15L17 10" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="9" stroke="#22C55E" strokeWidth="1.5"/>
  </svg>
);

const TrustIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#22C55E" strokeWidth="1.5"/>
    <path d="M8 12L11 15L16 9" stroke="#22C55E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const VoiceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C10.3431 2 9 3.34315 9 5V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V5C15 3.34315 13.6569 2 12 2Z" stroke="#6B7280" strokeWidth="1.5"/>
    <path d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10" stroke="#6B7280" strokeWidth="1.5"/>
    <path d="M12 19V22" stroke="#6B7280" strokeWidth="1.5"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 17H12.01M8 2H16C17.1046 2 18 2.89543 18 4V20C18 21.1046 17.1046 22 16 22H8C6.89543 22 6 21.1046 6 20V4C6 2.89543 6.89543 2 8 2Z" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SignupScreen = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [stepProgress] = useState(50); // Step 2 of 4 = 50%
  const [selectedLanguage, setSelectedLanguage] = useState('english');

  useEffect(() => {
    // Load selected language from localStorage
    const lang = localStorage.getItem('dhan-saathi-language') || 'hindi';
    setSelectedLanguage(lang);
  }, []);

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(value);
  };

  const handleSendOTP = () => {
    if (phoneNumber.length !== 10) {
      const msg = new SpeechSynthesisUtterance('Please enter a valid 10 digit mobile number');
      msg.lang = selectedLanguage === 'hindi' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(msg);
      return;
    }

    // Save to localStorage
    localStorage.setItem('dhan-saathi-phone', phoneNumber);
    
    // Speak confirmation
    const msg = new SpeechSynthesisUtterance(`OTP sent to ${phoneNumber}`);
    msg.lang = selectedLanguage === 'hindi' ? 'hi-IN' : 'en-IN';
    window.speechSynthesis.speak(msg);
    
    // Navigate to OTP verification (simulated for now)
    setTimeout(() => {
      navigate('/tutorial');
    }, 1500);
  };

  const handleContinueWithoutAccount = () => {
    const msg = new SpeechSynthesisUtterance('Continuing as guest. You can always login later.');
    msg.lang = selectedLanguage === 'hindi' ? 'hi-IN' : 'en-IN';
    window.speechSynthesis.speak(msg);
    
    localStorage.setItem('dhan-saathi-user-type', 'guest');
    navigate('/tutorial');
  };

  const handleVoiceInput = () => {
    const msg = new SpeechSynthesisUtterance(
      selectedLanguage === 'hindi' 
        ? 'कृपया अपना मोबाइल नंबर बोलें' 
        : 'Please speak your mobile number'
    );
    msg.lang = selectedLanguage === 'hindi' ? 'hi-IN' : 'en-IN';
    window.speechSynthesis.speak(msg);
    
    // Simulate voice input (in real app, use speech recognition)
    setTimeout(() => {
      const simulatedNumber = '9876543210';
      setPhoneNumber(simulatedNumber);
      const confirmMsg = new SpeechSynthesisUtterance(`Number recognized: ${simulatedNumber}`);
      confirmMsg.lang = selectedLanguage === 'hindi' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(confirmMsg);
    }, 2000);
  };

  const getText = () => {
    if (selectedLanguage === 'hindi') {
      return {
        welcome: "आपके विकास में स्वागत है",
        subtitle: "आपकी रोजमर्रा की जिंदगी के लिए सुरक्षित, आसान और विश्वसनीय वित्तीय उपकरण।",
        mobileLogin: "मोबाइल लॉगिन",
        enterPhone: "अपना मोबाइल नंबर डालें",
        sendOTP: "OTP भेजें",
        or: "या",
        continueWithoutAccount: "बिना अकाउंट के जारी रखें",
        guestDesc1: "आप बिना अकाउंट बनाए ऐप इस्तेमाल कर सकते हैं।",
        guestDesc2: "आप आवाज का भी इस्तेमाल कर सकते हैं",
        features: [
          { icon: <SecureIcon />, text: "सुरक्षित" },
          { icon: <EasyIcon />, text: "आसान" },
          { icon: <TrustIcon />, text: "विश्वसनीय" }
        ]
      };
    }
    
    return {
      welcome: "Welcome to Your Growth",
      subtitle: "Secure, easy, and trusted financial tools for your everyday life.",
      mobileLogin: "Mobile Login",
      enterPhone: "Enter your mobile number",
      sendOTP: "Send OTP",
      or: "OR",
      continueWithoutAccount: "Continue without an account",
      guestDesc1: "You can use the app without creating an account.",
      guestDesc2: "You can also use voice",
      features: [
        { icon: <SecureIcon />, text: "Secure" },
        { icon: <EasyIcon />, text: "Easy" },
        { icon: <TrustIcon />, text: "Trusted" }
      ]
    };
  };

  const text = getText();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white">
      
      {/* Header with Progress */}
      <div className="px-6 pt-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dhansaathi</h1>
            <p className="text-gray-600 mt-1">Onboarding: Step 2 of 4</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">{stepProgress}%</div>
            <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
              <div 
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${stepProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center px-6 pb-8">
        
        {/* Growth Illustration */}
        <div className="mb-6">
          <GrowthIcon />
        </div>

        {/* Welcome Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            {text.welcome}
          </h2>
          <p className="text-gray-600 max-w-md">
            {text.subtitle}
          </p>
        </div>

        {/* Features */}
        <div className="flex justify-center gap-6 mb-8">
          {text.features.map((feature, index) => (
            <div key={index} className="flex flex-col items-center">
              <div className="mb-1">{feature.icon}</div>
              <span className="text-sm text-gray-700">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Login Card */}
        <div className="w-full max-w-md">
          {/* Mobile Login Section */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              {text.mobileLogin}
            </h3>
            
            {/* Phone Input */}
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-medium mb-2">
                {text.enterPhone}
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <PhoneIcon />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={handlePhoneChange}
                  placeholder="98765 43210"
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  maxLength={10}
                />
                <button
                  onClick={handleVoiceInput}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <VoiceIcon />
                </button>
              </div>
            </div>

            {/* Send OTP Button */}
            <button
              onClick={handleSendOTP}
              disabled={phoneNumber.length !== 10}
              className={`w-full py-3 rounded-xl font-bold text-lg transition-all duration-200 ${
                phoneNumber.length === 10
                  ? 'bg-green-600 text-white hover:bg-green-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
            >
              {text.sendOTP}
            </button>
          </div>

          {/* OR Divider */}
          <div className="flex items-center justify-center mb-6">
            <div className="flex-1 h-px bg-gray-300"></div>
            <div className="px-4 text-gray-500 font-medium">{text.or}</div>
            <div className="flex-1 h-px bg-gray-300"></div>
          </div>

          {/* Guest Access Card */}
          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6 border border-green-200">
            <button
              onClick={handleContinueWithoutAccount}
              className="w-full text-left"
            >
              <h3 className="text-lg font-semibold text-green-700 mb-2">
                {text.continueWithoutAccount}
              </h3>
              <div className="space-y-2 text-gray-600 text-sm">
                <p className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  {text.guestDesc1}
                </p>
                <p className="flex items-start">
                  <span className="text-green-500 mr-2">•</span>
                  {text.guestDesc2}
                </p>
              </div>
            </button>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            ← Go Back
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pb-6">
        <div className="text-center text-gray-500 text-sm">
          <p>By continuing, you agree to our Terms & Privacy Policy</p>
          <p className="mt-1">Already have an account? <button className="text-green-600 font-medium">Login here</button></p>
        </div>
      </div>
    </div>
  );
};

export default SignupScreen;