import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, onSnapshot, addDoc, collection, serverTimestamp, increment, setDoc } from 'firebase/firestore';
import { Home, Building2, Sparkle, BookOpen, MessageSquare, IndianRupee, Globe, Bell, LogOut, UserCog, Sparkles, ShieldAlert } from 'lucide-react';

// Bilingual content
const SCAM_VERIFY_TEXT = {
  hindi: {
    // Navigation
    appName: "धनसाथी",
    home: "होम",
    schemes: "योजनाएं",
    community: "समुदाय",
    learn: "सीखें",
    help: "सहायता",
    notifications: "सूचनाएं",
    logout: "लॉग आउट",
    signin: "साइन इन",
    
    // Page content
    title: "स्कैम सत्यापन",
    subtitle: "जांचें कि कोई संदेश योजना वास्तविक है या धोखाधड़ी",
    inputLabel: "नीचे संदेश/लिंक पेस्ट करें:",
    inputPlaceholder: "संदिग्ध संदेश, लिंक, या योजना विवरण यहाँ पेस्ट करें (उदाहरण: 'आपने नकद पुरस्कार जीता! यहाँ क्लिक करें...')",
    verifyButton: "अभी सत्यापित करें ✨",
    analyzing: "विश्लेषण जारी है...",
    
    // Profile dropdown
    profileComplete: "प्रोफाइल पूर्ण",
    profileIncomplete: "प्रोफाइल अधूरी",
    setupNeeded: "सेटअप जरूरी",
    notSignedIn: "साइन इन नहीं किया गया",
    viewProfile: "प्रोफाइल देखें",
    profileSettings: "प्रोफाइल सेटिंग्स",
    goToHome: "होम जाएं",
    
    // Results section
    suspiciousAlert: "⚠️ संदिग्ध सतर्कता",
    safeVerified: "✅ सुरक्षित और सत्यापित",
    neutralMessage: "ℹ️ तटस्थ संदेश",
    potentialScam: "संभावित स्कैम का पता चला",
    officialSource: "आधिकारिक स्रोत सत्यापित",
    generalInfo: "सामान्य जानकारी",
    warningSigns: "⚠️ चेतावनी संकेत:",
    verifiedDetails: "✅ सत्यापित विवरण:",
    details: "विवरण:",
    officialWebsite: "आधिकारिक वेबसाइट:",
    
    // Action tips
    whatToDoSuspicious: "⚠️ क्या करें: अपने परिवार या किसी भरोसेमंद व्यक्ति को बताएं। किसी भी लिंक पर क्लिक न करें को उत्तर न दें।",
    whatToDoSafe: "✅ क्या करें: आप इस संदेश के निर्देशों का सुरक्षित रूप से पालन कर सकते हैं।",
    
    // Placeholder
    resultsPlaceholder: "विश्लेषण परिणाम यहाँ दिखाई देंगे",
    
    // Quick tips
    checkLinks: "🔗 लिंक जांचें",
    checkLinksDesc: "घोटेबाज़ नकली वेबसाइटें इस्तेमाल करते हैं। अज्ञात लिंक पर क्लिक न करें।",
    neverShare: "🔐 विवरण कभी साझा न करें",
    neverShareDesc: "असली बैंक कभी संदेश के माध्यम से OTP, पासवर्ड या कार्ड विवरण नहीं मांगते।",
    suspiciousUrgency: "⏰ संदिग्ध जल्दबाज़ी",
    suspiciousUrgencyDesc: "घोटेबाज़ आपको जल्दी करने के लिए कहते हैं। असली अधिकारी आपको सोचने का समय देते हैं।",
    
    // Misc
    comingSoon: "जल्द ही आ रहा है",
    switchToEnglish: "Switch to English",
    switchToHindi: "हिंदी में बदलें",
    
    // Status descriptions
    suspiciousDesc: "यह संदेश स्कैम के चेतावनी संकेत दिखाता है। बहुत सावधान रहें और इसके निर्देशों का पालन न करें।",
    safeDesc: "यह एक सरकारी कार्यालय से एक वैध संदेश लगता है। आप इस पर विश्वास कर सकते हैं।",
    neutralDesc: "यह केवल एक सामान्य संदेश है जिसमें स्पष्ट स्कैम संकेत नहीं हैं।",
    
    // Algorithm reasons (Hindi versions)
    reasons: {
      allCaps: "बड़े अक्षरों में लिखना: यह अक्सर आपको डराने या जल्दबाज़ी कराने के लिए इस्तेमाल किया जाता है। असली अधिकारी इस तरह नहीं लिखते।",
      punctuation: "बहुत ज्यादा चिह्न (!!!!): बहुत सारे विस्मयादिबोधक चिह्नों का इस्तेमाल संदेश को ज्यादा महत्वपूर्ण दिखाने की चाल है।",
      sensitiveInfo: (detail) => `${detail} मांगना: असली बैंक और सरकारी कार्यालय संदेश में आपके निजी दस्तावेज़ या नंबर कभी नहीं मांगेंगे।`,
      profit: "बहुत ज्यादा मुनाफा: अगर कोई कहता है कि आपका पैसा बहुत जल्दी दोगुना हो जाएगा, तो यह आपकी बचत चुराने के लिए लगभग हमेशा झूठ होता है।",
      urgency: "आपको जल्दबाज़ी कराने की कोशिश: स्कैमर चाहते हैं कि आप तेज़ी से काम करें ताकि आपके पास सोचने या अपने परिवार से सलाह लेने का समय न हो।",
      lottery: "नकली इनाम: आप उस लॉटरी को नहीं जीत सकते जिसमें आपने भाग नहीं लिया। ये संदेश आपसे पैसा लेने के लिए भेजे जाते हैं।",
      unsafeLink: (url) => `असुरक्षित लिंक: वेबसाइट लिंक "${url}" अजीब और असुरक्षित लगता है। इसे क्लिक न करें।`,
      unknownSender: "अज्ञात प्रेषक: हम इस कार्यक्रम को वास्तविक सरकारी योजनाओं की हमारी सूची में नहीं पा सके। कृपया सावधान रहें।",
      generalWarning: "चेतावनी: यह संदेश एक चाल जैसा लगता है। कार्यवाई करने से पहले किसी विश्वसनीय मित्र या परिवार के सदस्य को दिखाएं।",
    }
  },
  english: {
    // Navigation
    appName: "DhanSaathi",
    home: "Home",
    schemes: "Schemes",
    community: "Community",
    learn: "Learn",
    help: "Help",
    notifications: "Notifications",
    logout: "Logout",
    signin: "Sign in",
    
    // Page content
    title: "Scam Verification",
    subtitle: "Check if a message or scheme is real or a trick",
    inputLabel: "Paste Message/Link Below:",
    inputPlaceholder: "Paste the suspicious message, link, or scheme details here (e.g., 'You won a cash prize! Click here...')",
    verifyButton: "Verify Now ✨",
    analyzing: "Analyzing...",
    
    // Profile dropdown
    profileComplete: "Profile Complete",
    profileIncomplete: "Profile Incomplete",
    setupNeeded: "setup needed",
    notSignedIn: "Not signed in",
    viewProfile: "View Profile",
    profileSettings: "Profile Settings",
    goToHome: "Go to Home",
    
    // Results section
    suspiciousAlert: "⚠️ Suspicious Alert",
    safeVerified: "✅ Safe & Verified",
    neutralMessage: "ℹ️ Neutral Message",
    potentialScam: "Potential Scam Detected",
    officialSource: "Official Source Verified",
    generalInfo: "General Information",
    warningSigns: "⚠️ Warning Signs:",
    verifiedDetails: "✅ Verified Details:",
    details: "Details:",
    officialWebsite: "Official Website:",
    
    // Action tips
    whatToDoSuspicious: "⚠️ What to do: Tell your family or a trusted person. Do not reply or click any links.",
    whatToDoSafe: "✅ What to do: You can safely follow the instructions in this message.",
    
    // Placeholder
    resultsPlaceholder: "Analysis results will appear here",
    
    // Quick tips
    checkLinks: "🔗 Check Links",
    checkLinksDesc: "Scammers use fake websites. Don't click unknown links.",
    neverShare: "🔐 Never Share Details",
    neverShareDesc: "Real banks never ask for OTP, passwords, or card details via message.",
    suspiciousUrgency: "⏰ Suspicious Urgency",
    suspiciousUrgencyDesc: "Scammers rush you. Real officials give you time to decide.",
    
    // Misc
    comingSoon: "Coming soon",
    switchToEnglish: "Switch to English",
    switchToHindi: "हिंदी में बदलें",
    
    // Status descriptions
    suspiciousDesc: "This message shows warning signs of a scam. Be very careful and do NOT follow its instructions.",
    safeDesc: "This appears to be a legitimate message from a government office. You can trust this.",
    neutralDesc: "This is just a general message without clear scam signs.",
    
    // Algorithm reasons (English versions)
    reasons: {
      allCaps: "Writing in big letters: This is often used to make you feel scared or rushed. Real officers don't write like this.",
      punctuation: "Too many marks (!!!!): Using too many exclamation marks is a trick to make a message look more important than it is.",
      sensitiveInfo: (detail) => `Asking for ${detail}: Real banks and government offices will NEVER ask for your private documents or numbers in a message.`,
      profit: "Too much profit: If someone says your money will double very quickly, it is almost always a lie to steal your savings.",
      urgency: "Trying to rush you: Scammers want you to act fast so you don't have time to think or ask your family for advice.",
      lottery: "Fake Prizes: You cannot win a lottery you did not enter. These messages are sent to trick you into giving money.",
      unsafeLink: (url) => `Unsafe Link: The website link "${url}" looks strange and unsafe. Do not click it.`,
      unknownSender: "Unknown Sender: We could not find this program in our list of real government schemes. Please be careful.",
      generalWarning: "Warning: This message looks like it could be a trick. Please show it to a trusted friend or family member before acting.",
    }
  }
};

// Advanced Scam Detection Algorithm
export const analyzeScheme = (text, language = 'english') => {
  const lowercaseText = text.toLowerCase();
  const reasons = [];
  let isSuspicious = false;
  let safeUrl = null;

  const t = SCAM_VERIFY_TEXT[language];

  // 0. Harmless/Neutral text detection
  const harmlessWords = ['hello', 'hi', 'how are you', 'good morning', 'good afternoon', 'good evening', 'thanks', 'thank you'];
  const isHarmless = harmlessWords.some(word => lowercaseText.trim() === word || lowercaseText.includes(word) && text.length < 30 && !lowercaseText.includes('http'));

  // 1. Aggressive Formatting (All Caps/Punctuation)
  const isAllCaps = text.length > 20 && text === text.toUpperCase() && /[A-Z]/.test(text);
  const excessivePunctuation = /(!|\?){4,}/.test(text);

  if (isAllCaps || excessivePunctuation) {
    if (!isHarmless) {
      isSuspicious = true;
      if (isAllCaps) reasons.push(t.reasons.allCaps);
      if (excessivePunctuation) reasons.push(t.reasons.punctuation);
    }
  }

  // 2. Personal Information (OTP/PIN/Documents)
  const sensitiveKeywords = [
    'otp', 'pin', 'password', 'cvv', 'card number', 'expiry date',
    'kyc update', 'aadhaar', 'aadhar', 'pan card', 'pan number',
    'bank account', 'a/c number', 'debit card', 'credit card'
  ];
  const matchedSensitive = sensitiveKeywords.find(kw => lowercaseText.includes(kw));

  if (matchedSensitive) {
    isSuspicious = true;
    let detailName = matchedSensitive.toUpperCase();
    if (matchedSensitive === 'aadhaar' || matchedSensitive === 'aadhar') detailName = 'AADHAAR NUMBER';
    if (matchedSensitive === 'pan card' || matchedSensitive === 'pan number') detailName = 'PAN CARD DETAILS';
    if (matchedSensitive === 'bank account' || matchedSensitive === 'a/c number') detailName = 'BANK ACCOUNT NUMBER';

    reasons.push(t.reasons.sensitiveInfo(detailName));
  }

  // 3. Money & Pressure
  const scamKeywords = [
    '200% returns', 'double your money', 'limited time', 'urgent', 'slots left',
    'profit in 15 days', 'whatsapp', 'lottery winner', 'congratulations',
    'click here', 'prizes', 'reward points', 'unclaimed funds', 'gift card',
    'account suspended', 'verify now', 'link expired'
  ];
  const matchedScams = scamKeywords.filter(keyword => lowercaseText.includes(keyword));

  if (matchedScams.length > 0) {
    isSuspicious = true;
    if (lowercaseText.includes('double') || lowercaseText.includes('200%')) {
      reasons.push(t.reasons.profit);
    }
    if (lowercaseText.includes('urgent') || lowercaseText.includes('slots left') || lowercaseText.includes('verify now')) {
      reasons.push(t.reasons.urgency);
    }
    if (lowercaseText.includes('lottery') || lowercaseText.includes('prizes')) {
      reasons.push(t.reasons.lottery);
    }
  }

  // 4. Link Analysis
  const urlPattern = /(https?:\/\/[^\s]+)/g;
  const urls = text.match(urlPattern);

  if (urls) {
    urls.forEach(url => {
      const urlLower = url.toLowerCase();
      if (urlLower.includes('.xyz') || urlLower.includes('.top') || urlLower.includes('.bit.ly') || urlLower.includes('.tk') || urlLower.includes('.site')) {
        isSuspicious = true;
        reasons.push(t.reasons.unsafeLink(url));
      }

      // Check for official government and banking domains
      if (urlLower.includes('.gov.in') || urlLower.includes('.nic.in') || urlLower.includes('rbi.org.in') || urlLower.includes('.bank.in')) {
        if (matchedScams.length < 2 && (!matchedSensitive || matchedSensitive.length === 0)) {
          isSuspicious = false;
          safeUrl = url;
        }
      }
    });
  }

  // 5. Safe Indicators
  const safeKeywords = ['jansuraksha.gov.in', 'india.gov.in', 'rbi.org.in', '.bank.in', 'sbi.bank.in', 'icici.bank.in', 'hdfc.bank.in', 'bank branch', 'official portal', 'pension', 'subsidy'];
  const matchedSafe = safeKeywords.filter(keyword => lowercaseText.includes(keyword));

  if ((matchedSafe.length > 0 || safeUrl) && !isSuspicious) {
    return {
      status: 'safe',
      safeUrl: safeUrl || 'https://www.india.gov.in',
      reasons: [
        language === 'hindi' 
          ? 'आधिकारिक स्रोत: यह एक सरकारी कार्यालय या सत्यापित बैंक से एक वास्तविक संदेश जैसा लगता है।'
          : 'Official Source: This looks like a real message from a government office or verified bank.',
        language === 'hindi'
          ? 'सत्यापित बैंक लिंक: संदेश में एक आधिकारिक बैंक डोमेन (.bank.in जैसे sbi.bank.in, icici.bank.in, hdfc.bank.in) शामिल है।'
          : 'Verified Bank Link: The message contains an official bank domain (.bank.in like sbi.bank.in, icici.bank.in, hdfc.bank.in).',
        language === 'hindi'
          ? 'सुरक्षित विवरण: इस संदेश में कोई चाल या नकली वादे नहीं मिले।'
          : 'Safe Details: No tricks or fake promises were found in this message.'
      ]
    };
  }

  // Final Decisions
  if (isSuspicious) {
    if (reasons.length === 0) reasons.push(t.reasons.unknownSender);
    return {
      status: 'suspicious',
      reasons: reasons.slice(0, 3)
    };
  }

  if (isHarmless || (text.length < 15 && matchedScams.length === 0)) {
    return {
      status: 'neutral',
      reasons: [language === 'hindi' 
        ? 'यह सिर्फ एक सामान्य संदेश है। यह किसी मनी स्कीम या निवेश के बारे में नहीं लगता।'
        : 'This is just a general message. It does not seem to be about a money scheme or investment.'
      ]
    };
  }

  return {
    status: 'suspicious',
    reasons: [t.reasons.generalWarning]
  };
};

const ScamVerify = () => {
  const navigate = useNavigate();
  
  // User state
  const [fbUser, setFbUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [inputText, setInputText] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  
  // User's language preference
  const userLanguage = localStorage.getItem('dhan-saathi-language') || 'english';
  const t = SCAM_VERIFY_TEXT[userLanguage];
  
  // Initialize user auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setFbUser(u || null));
    return () => unsub();
  }, []);

  // Fetch user document from Firestore
  useEffect(() => {
    if (!fbUser) {
      setUserDoc(null);
      return;
    }

    const unsub = onSnapshot(
      doc(db, "users", fbUser.uid),
      (snap) => setUserDoc(snap.exists() ? snap.data() : null),
      (err) => {
        console.error("Firestore users doc error:", err);
        setUserDoc(null);
      }
    );

    return () => unsub();
  }, [fbUser]);

  // Close dropdown on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  // User display info
  const displayName = useMemo(() => {
    if (fbUser?.displayName) return fbUser.displayName;
    if (fbUser?.email) {
      const emailName = fbUser.email.split("@")[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return userLanguage === "hindi" ? "अतिथि" : "Guest";
  }, [fbUser, userLanguage]);

  const email = fbUser?.email || "";

  const initials = useMemo(() => {
    const src = (displayName || email || "U").trim();
    const parts = src.split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (src[0] || "U").toUpperCase();
  }, [displayName, email]);

  // Navigation handlers
  const goHome = () => navigate('/home');
  const goToSchemes = () => navigate('/schemes');
  const goToCommunity = () => navigate('/community');
  const goToLearn = () => navigate('/learn');
  const goToHelp = () => navigate('/help');

  // Toggle language
  const toggleLanguage = () => {
    const newLang = userLanguage === 'hindi' ? 'english' : 'hindi';
    localStorage.setItem('dhan-saathi-language', newLang);
    window.location.reload();
  };

  // Firestore event logger
  const logEvent = async (type, data = {}) => {
    if (!fbUser?.uid) return;
    try {
      await addDoc(collection(db, "users", fbUser.uid, "events"), {
        type,
        data,
        createdAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("logEvent error:", e);
    }
  };

  const handleVerify = async () => {
    if (!inputText.trim()) return;
    
    setLoading(true);
    
    // Log verification event
    await logEvent("scam_verification_started", {
      textLength: inputText.length,
      firstChars: inputText.substring(0, 100)
    });

    setTimeout(() => {
      const analysisResult = analyzeScheme(inputText, userLanguage);
      setResult(analysisResult);
      setLoading(false);
      
      // Log result
      logEvent("scam_verification_completed", {
        status: analysisResult.status,
        reasonsCount: analysisResult.reasons?.length || 0,
        hasSafeUrl: !!analysisResult.safeUrl
      });

      // Increment verification counter in user stats
      if (fbUser?.uid) {
        setDoc(
          doc(db, "users", fbUser.uid),
          {
            "stats.scamChecks": increment(1),
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
      }
    }, 600);
  };

  const getStatusStyles = (status) => {
    if (status === 'suspicious') return {
      borderColor: 'border-red-400',
      bgColor: 'bg-red-50',
      textColor: 'text-red-900',
      labelColor: 'text-red-700',
      icon: '⚠️'
    };
    if (status === 'safe') return {
      borderColor: 'border-green-400',
      bgColor: 'bg-green-50',
      textColor: 'text-green-900',
      labelColor: 'text-green-700',
      icon: '✅'
    };
    return {
      borderColor: 'border-blue-400',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-900',
      labelColor: 'text-blue-700',
      icon: 'ℹ️'
    };
  };

  const statusStyles = result ? getStatusStyles(result.status) : {};

  // Get status description based on language
  const getStatusDescription = () => {
    if (!result) return '';
    
    if (result.status === 'suspicious') return t.suspiciousDesc;
    if (result.status === 'safe') return t.safeDesc;
    return t.neutralDesc;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 flex flex-col">
      {/* Top Navbar - Consistent with Dashboard */}
      <header className="w-full bg-white/95 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Logo + Brand */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={goHome}>
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
              <IndianRupee className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
              {t.appName}
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <button
              type="button"
              onClick={goHome}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition"
            >
              <Home className="h-4 w-4" />
              {t.home}
            </button>

            <button
              type="button"
              onClick={goToSchemes}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition"
            >
              <Building2 className="h-4 w-4" />
              {t.schemes}
            </button>

            <button
              type="button"
              onClick={goToCommunity}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition"
            >
              <Sparkle className="h-4 w-4" />
              {t.community}
            </button>

            <button
              type="button"
              onClick={goToLearn}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition"
            >
              <BookOpen className="h-4 w-4" />
              {t.learn}
            </button>

            <button
              type="button"
              onClick={goToHelp}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition"
            >
              <MessageSquare className="h-4 w-4" />
              {t.help}
            </button>
            
            {/* Active Tab */}
            <span className="relative text-emerald-700 font-semibold flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4" />
              {t.title}
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500" />
            </span>
          </nav>

          {/* Right side: language toggle + bell + profile */}
          <div className="flex items-center gap-3">
            {/* Language Toggle Button */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 transition hover:-translate-y-0.5"
              title={userLanguage === 'hindi' ? 'Switch to English' : 'Switch to Hindi'}
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium">
                {userLanguage === 'hindi' ? 'हिंदी' : 'English'}
              </span>
            </button>

            {/* Notifications */}
            <button
              type="button"
              className="hidden sm:inline-flex h-10 w-10 rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow-sm items-center justify-center text-gray-700 hover:bg-gray-50 transition hover:-translate-y-0.5 relative"
              title={t.notifications}
              onClick={() => alert(t.comingSoon)}
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white" />
            </button>

            {/* Profile dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg flex items-center justify-center text-white font-semibold relative"
              >
                {fbUser?.photoURL ? (
                  <img
                    src={fbUser.photoURL}
                    alt="Profile"
                    className="h-full w-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>{initials}</span>
                )}
              </button>

              <div
                className={`absolute right-0 mt-3 w-72 rounded-2xl bg-white/95 backdrop-blur border border-gray-200 shadow-xl overflow-hidden origin-top-right transition-all duration-200
                  ${menuOpen ? 'opacity-100 scale-100 translate-y-0' : 'pointer-events-none opacity-0 scale-95 -translate-y-2'}
                `}
              >
                <div className="px-4 py-4">
                  <p className="text-sm font-semibold text-gray-900">
                    {displayName}
                  </p>
                  <p className="text-xs text-gray-600 mt-1 break-all">
                    {email || t.notSignedIn}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-sm">
                    <span
                      className={`px-2 py-1 rounded-full ${
                        userDoc?.profileComplete
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {userDoc?.profileComplete
                        ? t.profileComplete
                        : t.profileIncomplete}
                    </span>
                    {!userDoc?.profileComplete && (
                      <span className="text-xs text-gray-500">
                        {t.setupNeeded}
                      </span>
                    )}
                  </div>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="p-2">
                  <button
                    type="button"
                    onClick={toggleLanguage}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4 text-green-600" />
                    {userLanguage === 'hindi' ? t.switchToEnglish : t.switchToHindi}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      navigate("/profile");
                      setMenuOpen(false);
                    }}
                    className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                  >
                    <UserCog className="h-4 w-4 text-green-600" />
                    {t.viewProfile}
                  </button>
                </div>

                <div className="h-px bg-gray-100" />

                <div className="p-2">
                  {fbUser ? (
                    <button
                      type="button"
                      className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate('/signup');
                      }}
                    >
                      <LogOut className="h-4 w-4" />
                      {t.logout}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="w-full px-4 py-3 text-left text-sm text-emerald-700 hover:bg-emerald-50"
                      onClick={() => {
                        setMenuOpen(false);
                        navigate('/signup');
                      }}
                    >
                      {t.signin}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto w-full p-4 sm:p-6">
        <header className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">🛡️ {t.title}</h2>
          <p className="text-gray-600 text-lg mt-2">{t.subtitle}</p>
        </header>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Input Section */}
          <section className="lg:flex-1 bg-white p-6 rounded-3xl border border-gray-200 shadow-xl">
            <label className="block font-semibold text-gray-900 mb-3">
              {t.inputLabel}
            </label>
            <textarea
              className="w-full h-40 p-4 rounded-2xl bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-300 resize-y transition-all"
              placeholder={t.inputPlaceholder}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
            />

            <button
              className={`mt-6 w-full py-3 px-6 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
                loading || !inputText.trim()
                  ? 'bg-gray-400 cursor-not-allowed opacity-60'
                  : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 shadow-lg hover:shadow-xl hover:-translate-y-0.5'
              }`}
              onClick={handleVerify}
              disabled={loading || !inputText.trim()}
            >
              {loading ? (
                <>
                  <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  {t.analyzing}
                </>
              ) : (
                <>{t.verifyButton}</>
              )}
            </button>
          </section>

          {/* Results Section */}
          <aside className="lg:w-96">
            {result ? (
              <div className={`p-6 rounded-3xl border-2 ${statusStyles.borderColor} ${statusStyles.bgColor} shadow-xl`}>
                {/* Status Header */}
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-2xl">{statusStyles.icon}</span>
                  <div>
                    <div className={`text-xs font-bold ${statusStyles.labelColor} uppercase tracking-wide`}>
                      {result.status === 'suspicious' ? t.suspiciousAlert : 
                       result.status === 'safe' ? t.safeVerified : t.neutralMessage}
                    </div>
                    <div className={`text-lg font-bold ${statusStyles.textColor}`}>
                      {result.status === 'suspicious' ? t.potentialScam : 
                       result.status === 'safe' ? t.officialSource : t.generalInfo}
                    </div>
                  </div>
                </div>

                {/* Description */}
                <div className={`text-sm mb-4 ${statusStyles.textColor}`}>
                  {getStatusDescription()}
                </div>

                {/* Reasons */}
                <div className="space-y-2">
                  <div className={`text-xs font-semibold ${statusStyles.labelColor} uppercase`}>
                    {result.status === 'suspicious' ? t.warningSigns : 
                     result.status === 'safe' ? t.verifiedDetails : t.details}
                  </div>
                  {result.reasons && result.reasons.map((reason, i) => (
                    <div key={i} className={`text-sm ${statusStyles.textColor} flex gap-2`}>
                      <span className="flex-shrink-0 mt-0.5">
                        {result.status === 'suspicious' ? '🚫' : result.status === 'safe' ? '✓' : '→'}
                      </span>
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>

                {/* Safe URL (if available) */}
                {result.safeUrl && (
                  <div className="mt-4 p-3 rounded-xl bg-white/50 border border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">{t.officialWebsite}</p>
                    <a
                      href={result.safeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-green-700 font-medium hover:underline break-all"
                    >
                      {result.safeUrl}
                    </a>
                  </div>
                )}

                {/* Action Tips */}
                <div className={`mt-4 p-3 rounded-xl ${result.status === 'suspicious' ? 'bg-red-100 border-red-200' : 'bg-green-100 border-green-200'} border`}>
                  <p className={`text-xs font-semibold ${result.status === 'suspicious' ? 'text-red-900' : 'text-green-900'}`}>
                    {result.status === 'suspicious' ? t.whatToDoSuspicious : t.whatToDoSafe}
                  </p>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-3xl border-2 border-dashed border-gray-300 text-center bg-white shadow-xl">
                <div className="text-4xl mb-3">📊</div>
                <p className="text-gray-500 font-medium">{t.resultsPlaceholder}</p>
              </div>
            )}
          </aside>
        </div>

        {/* Quick Tips */}
        {!result && (
          <div className="mt-10 grid md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-lg">
              <p className="font-semibold text-blue-900 mb-2">{t.checkLinks}</p>
              <p className="text-sm text-blue-800">{t.checkLinksDesc}</p>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-red-50 to-red-100 border border-red-200 shadow-lg">
              <p className="font-semibold text-red-900 mb-2">{t.neverShare}</p>
              <p className="text-sm text-red-800">{t.neverShareDesc}</p>
            </div>
            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 shadow-lg">
              <p className="font-semibold text-amber-900 mb-2">{t.suspiciousUrgency}</p>
              <p className="text-sm text-amber-800">{t.suspiciousUrgencyDesc}</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ScamVerify;