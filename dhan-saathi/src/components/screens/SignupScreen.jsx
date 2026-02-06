import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../../firebase";

// ✅ IMPORTANT: use these exports from your updated userService
import {
  upsertUser,
  ensureUserDoc,
  getUserDoc,
} from "../../services/userService";

// ───────────────────── Animated Growth Chart (Premium) ─────────────────────
const AnimatedGrowthChart = () => (
  <div className="relative w-[150px] h-[150px]">
    {/* Soft glow behind */}
    <div className="absolute inset-0 rounded-[28px] bg-gradient-to-br from-emerald-400/20 via-green-300/10 to-sky-300/10 blur-2xl" />

    {/* Glass tile */}
    <div className="relative w-full h-full rounded-[28px] border border-white/60 bg-white/55 backdrop-blur-xl shadow-[0_25px_60px_rgba(16,185,129,0.18)] flex items-center justify-center">
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-[0_18px_45px_rgba(16,185,129,0.35)]"
      >
        {/* faint grid */}
        <g opacity="0.35">
          {[...Array(6)].map((_, i) => (
            <line
              key={`h-${i}`}
              x1="10"
              y1={18 + i * 16}
              x2="110"
              y2={18 + i * 16}
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}
          {[...Array(6)].map((_, i) => (
            <line
              key={`v-${i}`}
              x1={10 + i * 20}
              y1="12"
              x2={10 + i * 20}
              y2="108"
              stroke="#E5E7EB"
              strokeWidth="1"
            />
          ))}
        </g>

        {/* animated bars */}
        <rect x="24" y="62" width="12" height="40" rx="6" fill="#16a34a">
          <animate
            attributeName="height"
            values="24;52;30;44;24"
            dur="2.6s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="y"
            values="78;50;72;58;78"
            dur="2.6s"
            repeatCount="indefinite"
          />
        </rect>

        <rect x="48" y="52" width="12" height="50" rx="6" fill="#10b981">
          <animate
            attributeName="height"
            values="34;58;40;52;34"
            dur="2.2s"
            repeatCount="indefinite"
            begin="0.15s"
          />
          <animate
            attributeName="y"
            values="68;44;62;50;68"
            dur="2.2s"
            repeatCount="indefinite"
            begin="0.15s"
          />
        </rect>

        <rect x="72" y="42" width="12" height="60" rx="6" fill="#22c55e">
          <animate
            attributeName="height"
            values="42;66;48;60;42"
            dur="2.8s"
            repeatCount="indefinite"
            begin="0.25s"
          />
          <animate
            attributeName="y"
            values="58;34;52;40;58"
            dur="2.8s"
            repeatCount="indefinite"
            begin="0.25s"
          />
        </rect>

        {/* subtle growth curve */}
        <path
          d="M20 82 C 38 74, 48 66, 58 70 C 72 76, 82 56, 102 44"
          stroke="rgba(34,197,94,0.85)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <circle cx="102" cy="44" r="4" fill="#16a34a" />
      </svg>
    </div>
  </div>
);

// ───────────────────── Icons ─────────────────────
const SecureIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 3L4 7V11C4 15.4183 7.58172 20 12 21C16.4183 20 20 15.4183 20 11V7L12 3Z"
      stroke="#16a34a"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M9 12L11 14L15 10"
      stroke="#16a34a"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const EasyIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M7 10L12 15L17 10"
      stroke="#16a34a"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="10" stroke="#16a34a" strokeWidth="2" />
  </svg>
);

const TrustIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
      stroke="#16a34a"
      strokeWidth="2"
    />
    <path
      d="M8 12L11 15L16 9"
      stroke="#16a34a"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const VoiceIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 2C10.3431 2 9 3.34315 9 5V12C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12V5C15 3.34315 13.6569 2 12 2Z"
      stroke="#4b5563"
      strokeWidth="2"
    />
    <path
      d="M19 10V12C19 15.866 15.866 19 12 19C8.13401 19 5 15.866 5 12V10"
      stroke="#4b5563"
      strokeWidth="2"
    />
    <path d="M12 19V22" stroke="#4b5563" strokeWidth="2" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M12 17H12.01M8 2H16C17.1046 2 18 2.89543 18 4V20C18 21.1046 17.1046 22 16 22H8C6.89543 22 6 21.1046 6 20V4C6 2.89543 6.89543 2 8 2Z"
      stroke="#4b5563"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GoogleIcon = () => (
  <svg width="22" height="22" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.1-.1-2.2-.4-3.5z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.7l6.6 4.8C14.6 15.2 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"
    />
    <path
      fill="#4CAF50"
      d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.4 35.5 26.9 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.7 16.1 44 24 44z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20H24v8h11.3c-1.1 3-3.3 5.3-6.1 6.7l6.3 5.3C39.8 36.2 44 30.7 44 24c0-1.1-.1-2.2-.4-3.5z"
    />
  </svg>
);

// ───────────────────── Component ─────────────────────

const SignupScreen = () => {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [stepProgress] = useState(50);
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const lang = localStorage.getItem("dhan-saathi-language") || "hindi";
    setSelectedLanguage(lang);
  }, []);

  const speak = (text) => {
    try {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      if (selectedLanguage === "hindi") msg.lang = "hi-IN";
      else if (selectedLanguage === "tamil") msg.lang = "ta-IN";
      else if (selectedLanguage === "telugu") msg.lang = "te-IN";
      else msg.lang = "en-IN";
      window.speechSynthesis.speak(msg);
    } catch {}
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);
    setPhoneNumber(value);
  };

  const handleSendOTP = () => {
    if (phoneNumber.length !== 10) {
      speak(
        selectedLanguage === "hindi"
          ? "कृपया 10 अंकों का सही मोबाइल नंबर डालें"
          : "Please enter a valid 10 digit mobile number"
      );
      return;
    }
    setIsLoading(true);
    localStorage.setItem("dhan-saathi-phone", phoneNumber);
    localStorage.setItem("dhan-saathi-user-type", "registered");
    localStorage.setItem("dhan-saathi-logged-in", "true");
    speak(`OTP sent to ${phoneNumber}`);
    setTimeout(() => {
      setIsLoading(false);
      navigate("/otp");
    }, 1200);
  };

  // ✅ Google login -> ensure user doc -> redirect to voice assistant
  const handleContinueWithGoogle = async () => {
    try {
      setIsLoading(true);

      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;

      await ensureUserDoc(user);
      await upsertUser(user.uid, {
        uid: user.uid,
        displayName: user.displayName || "",
        email: user.email || "",
        photoURL: user.photoURL || "",
        provider: "google",
        language: localStorage.getItem("dhan-saathi-language") || "hindi",
        lastLoginAt: new Date().toISOString(),
      });

      localStorage.setItem("dhan-saathi-logged-in", "true");
      localStorage.setItem("dhan-saathi-user-type", "google");
      localStorage.setItem("dhan-saathi-uid", user.uid);

      const docData = await getUserDoc(user.uid);

      if (docData?.profileComplete) {
        navigate("/home", { replace: true });
      } else {
        navigate("/voice-setup", { replace: true });
      }
    } catch (err) {
      console.error(err);
      speak(
        selectedLanguage === "hindi"
          ? "Google लॉगिन असफल हुआ"
          : "Google login failed"
      );
      alert(err?.message || "Google Sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleContinueWithoutAccount = () => {
    setIsLoading(true);
    localStorage.setItem("dhan-saathi-user-type", "guest");
    localStorage.setItem("dhan-saathi-logged-in", "true");
    localStorage.setItem("dhan-saathi-phone", "guest-user");
    localStorage.setItem("dhan-saathi-tutorial-completed", "false");
    speak(
      selectedLanguage === "hindi"
        ? "आप मेहमान के रूप में जारी रख रहे हैं।"
        : "Continuing as guest user."
    );
    setTimeout(() => {
      setIsLoading(false);
      navigate("/tutorial", { replace: true });
    }, 400);
  };

  const handleVoiceInput = () => {
    speak(
      selectedLanguage === "hindi"
        ? "कृपया अपना मोबाइल नंबर बोलें"
        : "Please speak your mobile number"
    );
    setTimeout(() => {
      const simulatedNumber = "9876543210";
      setPhoneNumber(simulatedNumber);
      speak(
        selectedLanguage === "hindi"
          ? `नंबर पहचाना गया: ${simulatedNumber}`
          : `Number recognized: ${simulatedNumber}`
      );
    }, 1200);
  };

  const getText = () => {
    if (selectedLanguage === "hindi") {
      return {
        welcome: "आपके विकास में स्वागत है",
        subtitle:
          "आपकी रोजमर्रा की जिंदगी के लिए सुरक्षित, आसान और विश्वसनीय वित्तीय उपकरण।",
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
          { icon: <TrustIcon />, text: "विश्वसनीय" },
        ],
        backButton: "← वापस",
        footerText:
          "जारी रखने पर आप हमारी शर्तों और गोपनीयता नीति से सहमत होते हैं",
        loginText: "पहले से खाता है?",
        loginLink: "लॉगिन करें",
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
        { icon: <TrustIcon />, text: "Trusted" },
      ],
      backButton: "← Back",
      footerText: "By continuing, you agree to our Terms & Privacy Policy",
      loginText: "Already have an account?",
      loginLink: "Login here",
    };
  };

  const text = getText();

  return (
    <>
      {/* Random-ish liquid flow: multiple layers + different keyframes */}
      <style>{`
        @keyframes liquidA {
          0%   { transform: translate(0px, 0px) scale(1); }
          25%  { transform: translate(28px, -18px) scale(1.15); }
          50%  { transform: translate(-22px, 20px) scale(0.98); }
          75%  { transform: translate(18px, 28px) scale(1.08); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes liquidB {
          0%   { transform: translate(0px, 0px) scale(1); }
          20%  { transform: translate(-18px, -22px) scale(1.12); }
          55%  { transform: translate(26px, 12px) scale(0.96); }
          80%  { transform: translate(-10px, 26px) scale(1.06); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes liquidC {
          0%   { transform: translate(0px, 0px) scale(1); }
          30%  { transform: translate(22px, 14px) scale(1.14); }
          60%  { transform: translate(-26px, -10px) scale(0.97); }
          85%  { transform: translate(12px, -24px) scale(1.07); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-30%); opacity: 0.0; }
          40% { opacity: 0.35; }
          100% { transform: translateX(130%); opacity: 0.0; }
        }
      `}</style>

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 via-white to-green-50/40 relative overflow-hidden">
        {/* Liquid blobs (more visible) */}
        <div className="pointer-events-none absolute -top-40 -left-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(34,197,94,0.55)_0%,rgba(16,185,129,0.22)_35%,transparent_70%)] blur-3xl opacity-90 mix-blend-multiply animate-[liquidA_18s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute top-[12%] -right-44 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(16,185,129,0.55)_0%,rgba(34,197,94,0.22)_35%,transparent_70%)] blur-3xl opacity-90 mix-blend-multiply animate-[liquidB_22s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute bottom-[-220px] left-[30%] h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle_at_45%_45%,rgba(34,197,94,0.42)_0%,rgba(59,130,246,0.16)_40%,transparent_72%)] blur-3xl opacity-80 mix-blend-multiply animate-[liquidC_26s_ease-in-out_infinite]" />

        {/* subtle sheen layer */}
        <div className="pointer-events-none absolute inset-0 opacity-40">
          <div className="absolute top-0 left-0 h-full w-1/2 bg-gradient-to-r from-transparent via-white/60 to-transparent blur-xl animate-[shimmer_7s_ease-in-out_infinite]" />
        </div>

        {/* Header */}
        <header className="px-5 sm:px-8 pt-6 pb-4 relative z-10">
          <div className="max-w-5xl mx-auto flex items-start justify-between">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
                DhanSaathi
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Onboarding • Step 2 of 4
              </p>
            </div>

            <div className="text-right">
              <div className="text-3xl font-bold text-green-600">
                {stepProgress}%
              </div>
              <div className="w-28 h-2.5 bg-gray-200 rounded-full mt-2 overflow-hidden shadow-inner">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full transition-all duration-700 shadow-lg shadow-green-400/30"
                  style={{ width: `${stepProgress}%` }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main premium glass card */}
        <main className="flex-1 flex items-center justify-center px-5 sm:px-8 pb-10 relative z-10">
          {/* 3D perspective wrapper */}
          <div className="w-full max-w-5xl [perspective:1200px]">
            {/* Gradient border ring */}
            <div className="bg-gradient-to-br from-emerald-300/50 via-white to-slate-100/70 p-[1.5px] rounded-[34px] shadow-[0_32px_100px_rgba(15,23,42,0.22)]">
              {/* Glass body */}
              <div className="relative bg-white/78 backdrop-blur-2xl rounded-[32px] px-6 py-8 sm:px-10 sm:py-10 flex flex-col md:flex-row gap-10 border border-white/60 shadow-inner transition-transform duration-500 hover:[transform:rotateX(1deg)_rotateY(-1.5deg)_translateY(-6px)]">
                {/* inner highlight */}
                <div className="pointer-events-none absolute inset-0 rounded-[32px] bg-[radial-gradient(circle_at_20%_10%,rgba(255,255,255,0.8)_0%,transparent_40%)] opacity-40" />

                {/* LEFT */}
                <div className="md:w-1/2 flex flex-col justify-between gap-10 relative">
                  <div className="flex items-start justify-between gap-6">
                    <div>
                      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 tracking-tight">
                        {text.welcome}
                      </h2>
                      <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
                        {text.subtitle}
                      </p>
                    </div>

                    {/* Animated chart */}
                    <div className="hidden sm:block shrink-0">
                      <AnimatedGrowthChart />
                    </div>
                  </div>

                  <div className="flex justify-start gap-6 sm:gap-10">
                    {text.features.map((feature, i) => (
                      <div key={i} className="flex flex-col items-center group">
                        <div className="w-14 h-14 rounded-full bg-white/70 backdrop-blur border border-white/60 shadow-sm flex items-center justify-center mb-2 transition-all group-hover:shadow-md group-hover:-translate-y-0.5">
                          {feature.icon}
                        </div>
                        <span className="text-sm font-medium text-gray-700">
                          {feature.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT */}
                <div className="md:w-1/2 flex flex-col gap-5">
                  {/* Phone login card */}
                  <div className="bg-white/82 backdrop-blur-xl border border-white/60 rounded-2xl shadow-[0_18px_45px_rgba(15,23,42,0.14)] p-6 transition-all hover:shadow-[0_26px_70px_rgba(15,23,42,0.16)] hover:-translate-y-0.5">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                      {text.mobileLogin}
                    </h3>

                    <label className="block text-gray-700 font-medium mb-2.5">
                      {text.enterPhone}
                    </label>

                    <div className="relative mb-5">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                        <PhoneIcon />
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={handlePhoneChange}
                        placeholder="98765 43210"
                        className="w-full pl-14 pr-14 py-3.5 bg-white/70 border border-gray-200 rounded-2xl text-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                      className={`w-full py-3.5 rounded-2xl font-bold text-lg transition-all duration-300 ${
                        phoneNumber.length === 10 && !isLoading
                          ? "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-2xl hover:scale-[1.02]"
                          : "bg-gray-200 text-gray-500 cursor-not-allowed"
                      }`}
                      type="button"
                    >
                      {isLoading ? "Sending OTP..." : text.sendOTP}
                    </button>
                  </div>

                  {/* Google button */}
                  <button
                    onClick={handleContinueWithGoogle}
                    disabled={isLoading}
                    className="w-full py-3.5 rounded-2xl font-semibold text-sm sm:text-base border border-white/70 bg-white/70 backdrop-blur hover:bg-white text-gray-900 flex items-center justify-center gap-3 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5"
                    type="button"
                  >
                    <GoogleIcon />
                    {text.continueWithGoogle}
                  </button>

                  {/* Divider */}
                  <div className="flex items-center w-full">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="px-4 text-xs font-medium text-gray-500">
                      {text.or}
                    </span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* Guest card */}
                  <div className="bg-gradient-to-br from-green-50/80 to-white rounded-2xl border border-green-100 shadow-md p-5 transition-all hover:shadow-lg hover:-translate-y-0.5">
                    <button
                      onClick={handleContinueWithoutAccount}
                      disabled={isLoading}
                      className="w-full text-left group"
                      type="button"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-lg font-semibold text-green-700 group-hover:text-green-800 transition-colors">
                          {text.continueWithoutAccount}
                        </h3>
                      </div>
                      <div className="space-y-2.5 text-gray-600 text-sm">
                        <p className="flex items-start gap-2">
                          <span className="text-green-500 text-lg">•</span>
                          {text.guestDesc1}
                        </p>
                        <p className="flex items-start gap-2">
                          <span className="text-green-500 text-lg">•</span>
                          {text.guestDesc2}
                        </p>
                      </div>
                    </button>
                  </div>

                  {/* Back */}
                  <button
                    onClick={() => navigate(-1)}
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gray-50 text-gray-700 rounded-2xl font-medium hover:bg-gray-100 transition-colors disabled:opacity-50"
                    type="button"
                  >
                    {text.backButton}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-5 sm:px-8 pb-8 text-center text-sm text-gray-500 relative z-10">
          <p>{text.footerText}</p>
          <p className="mt-2">
            {text.loginText}{" "}
            <button
              onClick={() => navigate("/login")}
              disabled={isLoading}
              className="text-green-600 font-medium hover:text-green-700 underline"
              type="button"
            >
              {text.loginLink}
            </button>
          </p>
        </footer>

        {/* Loading overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-8 shadow-2xl flex flex-col items-center">
              <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-green-600 animate-spin mb-5" />
              <p className="text-lg font-medium text-gray-800">
                {selectedLanguage === "hindi" ? "प्रसंस्करण..." : "Processing..."}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default SignupScreen;