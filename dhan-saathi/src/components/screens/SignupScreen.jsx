import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";
import { upsertUser } from "../../services/userService";

// ────────────────────────────────────────────────
// SVG Icons (your code as-is)
// ────────────────────────────────────────────────
const GrowthIcon = () => (
  <svg width="140" height="140" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-xl">
    <path d="M12 20V10M18 20V4M6 20V14" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="20" r="2" fill="#16a34a"/>
    <circle cx="18" cy="20" r="2" fill="#16a34a"/>
    <circle cx="6" cy="20" r="2" fill="#16a34a"/>
    <circle cx="12" cy="10" r="2" fill="#16a34a"/>
    <circle cx="18" cy="4" r="2" fill="#16a34a"/>
    <circle cx="6" cy="14" r="2" fill="#16a34a"/>
  </svg>
);

const SecureIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3L4 7V11C4 15.4183 7.58172 20 12 21C16.4183 20 20 15.4183 20 11V7L12 3Z" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12L11 14L15 10" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const EasyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7 10L12 15L17 10" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="12" cy="12" r="10" stroke="#16a34a" strokeWidth="2"/>
  </svg>
);

const TrustIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#16a34a" strokeWidth="2"/>
    <path d="M8 12L11 15L16 9" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const VoiceIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C10.3431 2 9 3.34315 9 5V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V5C15 3.34315 13.6569 2 12 2Z" stroke="#4b5563" strokeWidth="2"/>
    <path d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10" stroke="#4b5563" strokeWidth="2"/>
    <path d="M12 19V22" stroke="#4b5563" strokeWidth="2"/>
  </svg>
);

const PhoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 17H12.01M8 2H16C17.1046 2 18 2.89543 18 4V20C18 21.1046 17.1046 22 16 22H8C6.89543 22 6 21.1046 6 20V4C6 2.89543 6.89543 2 8 2Z" stroke="#4b5563" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Simple Google icon
const GoogleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.1-.1-2.2-.4-3.5z"/>
    <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.2 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
    <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.4 35.5 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.7 16.1 44 24 44z"/>
    <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3-3.3 5.3-6.1 6.7l6.3 5.3C39.8 36.2 44 30.7 44 24c0-1.1-.1-2.2-.4-3.5z"/>
  </svg>
);

const SignupScreen = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [stepProgress] = useState(50);
  const [selectedLanguage, setSelectedLanguage] = useState('english');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const lang = localStorage.getItem('dhan-saathi-language') || 'hindi';
    setSelectedLanguage(lang);
  }, []);

  const speak = (text) => {
    try {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      if (selectedLanguage === 'hindi') msg.lang = 'hi-IN';
      else if (selectedLanguage === 'tamil') msg.lang = 'ta-IN';
      else if (selectedLanguage === 'telugu') msg.lang = 'te-IN';
      else msg.lang = 'en-IN';
      window.speechSynthesis.speak(msg);
    } catch {}
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhoneNumber(value);
  };

  const handleSendOTP = () => {
    if (phoneNumber.length !== 10) {
      speak(
        selectedLanguage === 'hindi'
          ? 'कृपया 10 अंकों का सही मोबाइल नंबर डालें'
          : 'Please enter a valid 10 digit mobile number'
      );
      return;
    }
    setIsLoading(true);
    localStorage.setItem('dhan-saathi-phone', phoneNumber);
    localStorage.setItem('dhan-saathi-user-type', 'registered');
    localStorage.setItem('dhan-saathi-logged-in', 'true');
    speak(`OTP sent to ${phoneNumber}`);
    setTimeout(() => {
      setIsLoading(false);
      navigate('/otp');
    }, 1200);
  };

  // ✅ NEW: Google login + save user to Firestore
  const handleContinueWithGoogle = async () => {
    try {
      setIsLoading(true);

      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;

      // Save user info in Firestore
      await upsertUser(user.uid, {
        uid: user.uid,
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        provider: "google",
        language: localStorage.getItem("dhan-saathi-language") || "hindi",

        // app fields you can grow later:
        level: 1,
        points: 0,
        tutorialCompleted: localStorage.getItem("dhan-saathi-tutorial-completed") === "true",
        lastLoginAt: new Date().toISOString(),
      });

      // Set local session flags
      localStorage.setItem("dhan-saathi-logged-in", "true");
      localStorage.setItem("dhan-saathi-user-type", "google");
      localStorage.setItem("dhan-saathi-uid", user.uid);

      const tutorialDone = localStorage.getItem("dhan-saathi-tutorial-completed") === "true";
      navigate(tutorialDone ? "/home" : "/tutorial", { replace: true });
    } catch (err) {
      console.error(err);
      speak(selectedLanguage === "hindi" ? "Google लॉगिन असफल हुआ" : "Google login failed");
      alert(err?.message || "Google Sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueWithoutAccount = () => {
    setIsLoading(true);
    localStorage.setItem('dhan-saathi-user-type', 'guest');
    localStorage.setItem('dhan-saathi-logged-in', 'true');
    localStorage.setItem('dhan-saathi-phone', 'guest-user');
    localStorage.setItem('dhan-saathi-tutorial-completed', 'false');
    speak(selectedLanguage === 'hindi' ? 'आप मेहमान के रूप में जारी रख रहे हैं।' : 'Continuing as guest user.');
    setTimeout(() => {
      setIsLoading(false);
      navigate('/tutorial', { replace: true });
    }, 400);
  };

  const handleVoiceInput = () => {
    speak(selectedLanguage === 'hindi' ? 'कृपया अपना मोबाइल नंबर बोलें' : 'Please speak your mobile number');
    setTimeout(() => {
      const simulatedNumber = '9876543210';
      setPhoneNumber(simulatedNumber);
      speak(selectedLanguage === 'hindi' ? `नंबर पहचाना गया: ${simulatedNumber}` : `Number recognized: ${simulatedNumber}`);
    }, 1200);
  };

  const getText = () => {
    if (selectedLanguage === 'hindi') {
      return {
        welcome: "आपके विकास में स्वागत है",
        subtitle: "आपकी रोजमर्रा की जिंदगी के लिए सुरक्षित, आसान और विश्वसनीय वित्तीय उपकरण।",
        mobileLogin: "मोबाइल से जुड़ें",
        enterPhone: "अपना मोबाइल नंबर डालें",
        sendOTP: "OTP भेजें",
        or: "या",
        continueWithGoogle: "Google से जारी रखें",
        continueWithoutAccount: "बिना नंबर के जारी रखें",
        guestDesc1: "बिना अकाउंट बनाए ऐप इस्तेमाल करें",
        guestDesc2: "आवाज़ से भी नियंत्रित कर सकते हैं",
        features: [
          { icon: <SecureIcon />, text: "सुरक्षित" },
          { icon: <EasyIcon />, text: "आसान" },
          { icon: <TrustIcon />, text: "विश्वसनीय" }
        ],
        backButton: "← वापस",
        footerText: "जारी रखने पर आप हमारी शर्तों और गोपनीयता नीति से सहमत होते हैं",
        loginText: "पहले से खाता है?",
        loginLink: "लॉगिन करें"
      };
    }
    return {
      welcome: "Welcome to Your Growth",
      subtitle: "Secure, easy, and trusted financial tools for everyday life.",
      mobileLogin: "Login with Mobile",
      enterPhone: "Enter your mobile number",
      sendOTP: "Send OTP",
      or: "OR",
      continueWithGoogle: "Continue with Google",
      continueWithoutAccount: "Continue without number",
      guestDesc1: "Use the app without creating an account",
      guestDesc2: "Voice control is also available",
      features: [
        { icon: <SecureIcon />, text: "Secure" },
        { icon: <EasyIcon />, text: "Easy" },
        { icon: <TrustIcon />, text: "Trusted" }
      ],
      backButton: "← Back",
      footerText: "By continuing, you agree to our Terms & Privacy Policy",
      loginText: "Already have an account?",
      loginLink: "Login here"
    };
  };

  const text = getText();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 via-white to-green-50/30 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_20%_30%,rgba(22,163,74,0.07)_0%,transparent_60%)]" />

      {/* Header + Progress */}
      <header className="px-5 sm:px-8 pt-8 pb-6 relative z-10">
        <div className="flex justify-between items-start max-w-md mx-auto">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">DhanSaathi</h1>
            <p className="text-sm text-gray-600 mt-1">Onboarding • Step 2 of 4</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">{stepProgress}%</div>
            <div className="w-28 h-2.5 bg-gray-200 rounded-full mt-2 overflow-hidden shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-700 shadow-lg shadow-green-400/30"
                style={{ width: `${stepProgress}%` }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-5 sm:px-8 pb-10 relative z-10">
        <div className="mb-8 transform transition-all duration-700 hover:scale-105">
          <GrowthIcon />
        </div>

        <div className="text-center mb-10 max-w-md">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3 tracking-tight">
            {text.welcome}
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed">
            {text.subtitle}
          </p>
        </div>

        <div className="flex justify-center gap-8 sm:gap-12 mb-10">
          {text.features.map((feature, i) => (
            <div key={i} className="flex flex-col items-center group">
              <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-2 group-hover:bg-green-100 transition-colors shadow-sm">
                {feature.icon}
              </div>
              <span className="text-sm font-medium text-gray-700">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Main Card */}
        <div className="w-full max-w-md bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-gray-100/80 p-7 mb-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-5">
            {text.mobileLogin}
          </h3>

          <label className="block text-gray-700 font-medium mb-2.5">
            {text.enterPhone}
          </label>

          <div className="relative mb-6">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
              <PhoneIcon />
            </div>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="98765 43210"
              className="w-full pl-14 pr-14 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              maxLength={10}
              inputMode="numeric"
            />
            <button
              onClick={handleVoiceInput}
              disabled={isLoading}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-green-600 transition-colors p-1 rounded-full hover:bg-green-50"
              type="button"
            >
              <VoiceIcon />
            </button>
          </div>

          <button
            onClick={handleSendOTP}
            disabled={phoneNumber.length !== 10 || isLoading}
            className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-md ${
              phoneNumber.length === 10 && !isLoading
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 hover:shadow-xl hover:scale-[1.02]'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            type="button"
          >
            {isLoading ? 'Sending OTP...' : text.sendOTP}
          </button>

          {/* ✅ NEW: Google button */}
          <button
            onClick={handleContinueWithGoogle}
            disabled={isLoading}
            className="mt-4 w-full py-4 rounded-2xl font-bold text-lg transition-all duration-300 shadow-sm border border-gray-200 bg-white hover:bg-gray-50 text-gray-900 flex items-center justify-center gap-3"
            type="button"
          >
            <GoogleIcon />
            {text.continueWithGoogle}
          </button>
        </div>

        {/* OR Divider */}
        <div className="flex items-center w-full max-w-md mb-6">
          <div className="flex-1 h-px bg-gray-300"></div>
          <span className="px-5 text-sm font-medium text-gray-500">{text.or}</span>
          <div className="flex-1 h-px bg-gray-300"></div>
        </div>

        {/* Guest Card */}
        <div className="w-full max-w-md bg-gradient-to-br from-green-50/70 to-white rounded-3xl p-7 shadow-lg border border-green-100 mb-8">
          <button
            onClick={handleContinueWithoutAccount}
            disabled={isLoading}
            className="w-full text-left group"
            type="button"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-green-700 group-hover:text-green-800 transition-colors">
                {text.continueWithoutAccount}
              </h3>
            </div>
            <div className="space-y-2.5 text-gray-600 text-sm">
              <p className="flex items-start gap-2">
                <span className="text-green-500 text-lg">✓</span>
                {text.guestDesc1}
              </p>
              <p className="flex items-start gap-2">
                <span className="text-green-500 text-lg">✓</span>
                {text.guestDesc2}
              </p>
            </div>
          </button>
        </div>

        <button
          onClick={() => navigate(-1)}
          disabled={isLoading}
          className="w-full max-w-md py-4 bg-gray-100 text-gray-700 rounded-2xl font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50"
          type="button"
        >
          {text.backButton}
        </button>
      </main>

      <footer className="px-5 sm:px-8 pb-8 text-center text-sm text-gray-500 relative z-10">
        <p>{text.footerText}</p>
        <p className="mt-2">
          {text.loginText}{' '}
          <button
            onClick={() => navigate('/login')}
            disabled={isLoading}
            className="text-green-600 font-medium hover:text-green-700 underline"
            type="button"
          >
            {text.loginLink}
          </button>
        </p>
      </footer>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center">
            <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-green-600 animate-spin mb-5" />
            <p className="text-lg font-medium text-gray-800">
              {selectedLanguage === 'hindi' ? 'प्रसंस्करण...' : 'Processing...'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignupScreen;