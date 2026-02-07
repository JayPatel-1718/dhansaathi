// src/components/screens/HelpScreen.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import {
  collection,
  doc,
  addDoc,
  serverTimestamp,
  increment,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";

import {
  Home,
  Building2,
  Sparkle,
  BookOpen,
  MessageSquare,
  Bell,
  IndianRupee,
  Mic,
  PhoneCall,
  ShieldAlert,
  Headset,
  Star,
  Volume2,
  CheckCircle2,
  ArrowRight,
  Crown,
  LogOut,
  Users,
  Globe,
  UserCog,
  Zap,
  Sparkles,
  Shield,
  LifeBuoy,
  Award,
  TrendingUp,
  ExternalLink,
  X,
  HeartHandshake,
  AlertCircle,
  Clock,
  HelpCircle,
  ShieldCheck,
} from "lucide-react";

// Bilingual content
const HELP_TEXT = {
  hindi: {
    // Navbar
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
    title: "सहायता और समर्थन",
    subtitle: "तुरंत उत्तर खोजें या हमारे विशेषज्ञों से बात करें।",
    
    // Ask an Expert
    askExpert: "विशेषज्ञ से पूछें",
    
    // Pricing tiers
    freeTier: "मुफ़्त सहायता",
    premiumExpert: "प्रीमियम विशेषज्ञ",
    freeBadge: "मुफ्त",
    premiumBadge: "प्रीमियम",
    
    // Free tier points
    freePoint1: "चैट सपोर्ट",
    freePoint2: "24 घंटे प्रतिक्रिया समय",
    freePoint3: "सामुदायिक उत्तर",
    freeButton: "मुफ्त चैट शुरू करें",
    
    // Premium tier points
    premiumPoint1: "सीधी वॉयस कॉल",
    premiumPoint2: "15 मिनट प्रतिक्रिया",
    premiumPoint3: "निजी सत्र",
    premiumButton: "अभी कनेक्ट करें",
    
    // Available Experts
    availableExperts: "उपलब्ध विशेषज्ञ",
    reviews: "समीक्षाएं",
    online: "ऑनलाइन",
    offline: "ऑफ़लाइन",
    
    // Emergency Helplines
    emergencyHelplines: "आपातकालीन हेल्पलाइन",
    bankFraudTitle: "बैंक धोखाधड़ी (1930)",
    bankFraudDesc: "संदिग्ध बैंक लेनदेन या UPI धोखाधड़ी की रिपोर्ट।",
    cybercrimeTitle: "साइबर अपराध (1930)",
    cybercrimeDesc: "डिजिटल धोखाधड़ी की रिपोर्टिंग।",
    womensHelplineTitle: "महिला हेल्पलाइन (181)",
    womensHelplineDesc: "24/7 सुरक्षा और आपातकालीन सहायता।",
    callNow: "कॉल करें",
    listen: "सुनें",
    
    // Safety Protocol
    safetyProtocol: "धनसाथी सुरक्षा प्रोटोकॉल",
    safetyMessage: "हमारे विशेषज्ञ कभी भी आपके पासवर्ड, OTP या CVV नहीं मांगेंगे।",
    
    // Premium CTA
    premiumSupport: "प्रीमियम समर्थन",
    premiumDescription: "प्राथमिकता विशेषज्ञ प्रतिक्रियाएं प्राप्त करें।",
    upgradePremium: "प्रीमियम में अपग्रेड करें",
    
    // Voice Assistant
    voiceAssistant: "वॉयस सहायक",
    
    // Not signed in
    notSignedIn: "साइन इन नहीं किया गया",
    
    // Live Chat
    liveChat: "लाइव चैट",
    getHelpNow: "तत्काल सहायता",
    chatWithExpert: "विशेषज्ञ से चैट करें",
    avgResponse: "प्रतिक्रिया: 5 मिनट",
  },
  english: {
    // Navbar
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
    title: "Help & Support",
    subtitle: "Find immediate answers or talk to our experts.",
    
    // Ask an Expert
    askExpert: "Ask an Expert",
    
    // Pricing tiers
    freeTier: "Free Support",
    premiumExpert: "Premium Expert",
    freeBadge: "FREE",
    premiumBadge: "PREMIUM",
    
    // Free tier points
    freePoint1: "Chat support",
    freePoint2: "24hr response time",
    freePoint3: "Community answers",
    freeButton: "Start Free Chat",
    
    // Premium tier points
    premiumPoint1: "Direct voice call",
    premiumPoint2: "15‑min response",
    premiumPoint3: "Private session",
    premiumButton: "Connect Now",
    
    // Available Experts
    availableExperts: "Available Experts",
    reviews: "reviews",
    online: "Online",
    offline: "Offline",
    
    // Emergency Helplines
    emergencyHelplines: "Emergency Helplines",
    bankFraudTitle: "Bank Fraud (1930)",
    bankFraudDesc: "Report suspicious bank transactions or UPI fraud.",
    cybercrimeTitle: "Cybercrime (1930)",
    cybercrimeDesc: "Report digital fraud.",
    womensHelplineTitle: "Women's Helpline (181)",
    womensHelplineDesc: "24/7 safety and emergency assistance.",
    callNow: "Call Now",
    listen: "Listen",
    
    // Safety Protocol
    safetyProtocol: "DhanSaathi Safety Protocol",
    safetyMessage: "Our experts will never ask for passwords, OTPs, or CVV.",
    
    // Premium CTA
    premiumSupport: "Premium Support",
    premiumDescription: "Get priority expert replies.",
    upgradePremium: "Upgrade to Premium",
    
    // Voice Assistant
    voiceAssistant: "Voice assistant",
    
    // Not signed in
    notSignedIn: "Not signed in",
    
    // Live Chat
    liveChat: "Live Chat",
    getHelpNow: "Immediate Help",
    chatWithExpert: "Chat with Expert",
    avgResponse: "Response: 5 mins",
  }
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" }
  }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const scaleIn = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.5, ease: "backOut" }
  }
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    ease: "easeInOut"
  }
};

export default function HelpScreen() {
  const navigate = useNavigate();

  // Firebase user state
  const [fbUser, setFbUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [showLiveChat, setShowLiveChat] = useState(false);
  
  // Get user's language preference
  const userLanguage = localStorage.getItem('dhan-saathi-language') || 'english';
  const t = HELP_TEXT[userLanguage];
  const ttsLang = userLanguage === "hindi" ? "hi-IN" : "en-IN";
  
  // Reactive background
  const [mouse, setMouse] = useState({ x: 320, y: 220 });

  // Profile dropdown
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

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
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // User initials for avatar
  const displayName = fbUser?.displayName || "Guest";
  const email = fbUser?.email || "";
  const initials = useMemo(() => {
    const src = (displayName || email || "U").trim();
    const parts = src.split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (src[0] || "U").toUpperCase();
  }, [displayName, email]);

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

  // Increment help interactions counter
  const incrementHelpInteractions = async () => {
    if (!fbUser?.uid) return;
    try {
      await setDoc(
        doc(db, "users", fbUser.uid),
        {
          "stats.helpInteractions": increment(1),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      console.error("Error incrementing help interactions:", e);
    }
  };

  // Toggle language
  const toggleLanguage = () => {
    const newLang = userLanguage === "hindi" ? "english" : "hindi";
    localStorage.setItem('dhan-saathi-language', newLang);
    window.location.reload();
  };

  // Handle logout
  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await signOut(auth);
      navigate("/signup", { replace: true });
    } catch (e) {
      console.error(e);
      alert(userLanguage === 'hindi' ? "लॉगआउट विफल हुआ" : "Logout failed");
    }
  };

  // Text-to-speech function
  const speak = (text) => {
    try {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = ttsLang;
      msg.rate = 1.0;
      window.speechSynthesis.speak(msg);
      
      logEvent("help_voice_played", { text: text.substring(0, 100) });
      incrementHelpInteractions();
    } catch {
      // ignore
    }
  };

  // Pricing tiers
  const tiers = [
    {
      id: "free",
      badge: t.freeBadge,
      price: "₹0",
      title: t.freeTier,
      points: [t.freePoint1, t.freePoint2, t.freePoint3],
      buttonText: t.freeButton,
      icon: <LifeBuoy className="h-8 w-8 text-emerald-600" />,
      gradient: "from-emerald-50 to-emerald-100",
      border: "border-emerald-200",
      buttonStyle: "bg-white border-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50",
    },
    {
      id: "premium",
      badge: t.premiumBadge,
      price: "₹499",
      title: t.premiumExpert,
      points: [t.premiumPoint1, t.premiumPoint2, t.premiumPoint3],
      buttonText: t.premiumButton,
      icon: <Crown className="h-8 w-8 text-amber-600" />,
      gradient: "from-amber-50 to-amber-100",
      border: "border-amber-200",
      buttonStyle: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:shadow-xl",
      pulse: true,
    },
  ];

  // Expert list
  const experts = [
    {
      name: "Ananya Sharma",
      tags: ["BANKING", "FRAUD PREVENTION"],
      rating: 4.9,
      reviews: 124,
      online: true,
      avatarColor: "from-purple-500 to-pink-500",
      responseTime: "2 mins",
    },
    {
      name: "Rajesh Malhotra",
      tags: ["TAX SPECIALIST", "WEALTH MGMT"],
      rating: 4.8,
      reviews: 89,
      online: true,
      avatarColor: "from-blue-500 to-cyan-500",
      responseTime: "5 mins",
    },
    {
      name: "Priya Verma",
      tags: ["CYBERCRIME", "SECURITY"],
      rating: 5.0,
      reviews: 56,
      online: false,
      avatarColor: "from-emerald-500 to-green-500",
      responseTime: "15 mins",
    },
    {
      name: "Vikram Iyer",
      tags: ["INSURANCE", "CLAIMS"],
      rating: 4.7,
      reviews: 210,
      online: true,
      avatarColor: "from-orange-500 to-red-500",
      responseTime: "3 mins",
    },
  ];

  // Helplines
  const helplines = [
    {
      title: t.bankFraudTitle,
      desc: t.bankFraudDesc,
      number: "1930",
      icon: <ShieldAlert className="h-6 w-6 text-red-600" />,
      gradient: "from-red-50 to-red-100",
      border: "border-red-200",
      button: "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-xl",
    },
    {
      title: t.cybercrimeTitle,
      desc: t.cybercrimeDesc,
      number: "1930",
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      gradient: "from-blue-50 to-blue-100",
      border: "border-blue-200",
      button: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:shadow-xl",
    },
    {
      title: t.womensHelplineTitle,
      desc: t.womensHelplineDesc,
      number: "181",
      icon: <Users className="h-6 w-6 text-emerald-600" />,
      gradient: "from-emerald-50 to-emerald-100",
      border: "border-emerald-200",
      button: "bg-gradient-to-r from-emerald-500 to-green-500 text-white hover:shadow-xl",
    },
  ];

  // Handle button clicks with Firebase logging
  const handleFreeChatClick = async () => {
    await logEvent("help_free_chat_clicked");
    await incrementHelpInteractions();
    setShowLiveChat(true);
  };

  const handlePremiumConnect = async () => {
    await logEvent("help_premium_connect_clicked");
    await incrementHelpInteractions();
    const expertName = experts.find(e => e.online)?.name || "Expert";
    alert(`${userLanguage === "hindi" ? "प्रीमियम विशेषज्ञ से जुड़ा जा रहा है: " : "Connecting to premium expert: "}${expertName}`);
  };

  const handleExpertClick = async (expert) => {
    await logEvent("help_expert_clicked", { expertName: expert.name });
    await incrementHelpInteractions();
    
    if (!expert.online) {
      alert(userLanguage === "hindi" ? "यह विशेषज्ञ वर्तमान में ऑफलाइन है। कृपया किसी अन्य विशेषज्ञ का चयन करें।" : "This expert is currently offline. Please select another expert.");
      return;
    }
    
    setShowLiveChat(true);
  };

  const handleUpgradeClick = async () => {
    await logEvent("help_upgrade_clicked");
    await incrementHelpInteractions();
    navigate("/premium");
  };

  const handleVoiceButtonClick = () => {
    logEvent("help_voice_button_clicked");
    navigate("/ask-ai");
  };

  const handleEmergencyCall = async (helpline) => {
    await logEvent("help_emergency_call_clicked", { 
      helpline: helpline.title,
      number: helpline.number 
    });
    await incrementHelpInteractions();
    
    if (window.confirm(userLanguage === "hindi" 
      ? `क्या आप ${helpline.number} पर कॉल करना चाहते हैं?\n\n${helpline.title}`
      : `Call ${helpline.number}?\n\n${helpline.title}`
    )) {
      window.location.href = `tel:${helpline.number}`;
    }
  };

  const handleViewProfile = () => {
    navigate("/profile");
    logEvent("help_view_profile_clicked");
  };

  const handleLiveChatClose = () => {
    setShowLiveChat(false);
    logEvent("help_live_chat_closed");
  };

  const handleSendMessage = async () => {
    const messageInput = document.getElementById('chat-message');
    if (messageInput && messageInput.value.trim()) {
      await logEvent("help_chat_message_sent", {
        message: messageInput.value.substring(0, 50)
      });
      await incrementHelpInteractions();
      
      setTimeout(() => {
        const chatMessages = document.getElementById('chat-messages');
        if (chatMessages) {
          const responseDiv = document.createElement('div');
          responseDiv.className = 'flex items-start gap-3 mb-4';
          responseDiv.innerHTML = `
            <div class="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
              <span class="text-xs font-bold text-white">A</span>
            </div>
            <div class="flex-1">
              <div class="bg-gray-100 rounded-2xl rounded-tl-none p-3 max-w-xs">
                <p class="text-sm text-gray-800">${userLanguage === "hindi" 
                  ? "नमस्ते! मैं आपकी कैसे सहायता कर सकता/सकती हूं? कृपया अपनी समस्या बताएं।" 
                  : "Hello! How can I help you today? Please describe your issue."}</p>
              </div>
              <p class="text-xs text-gray-500 mt-1 ml-2">${userLanguage === "hindi" ? "अभी" : "Just now"}</p>
            </div>
          `;
          chatMessages.appendChild(responseDiv);
          chatMessages.scrollTop = chatMessages.scrollHeight;
        }
      }, 1000);
      
      messageInput.value = '';
    }
  };

  // Live Chat Modal Component
  const LiveChatModal = () => (
    <AnimatePresence>
      {showLiveChat && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleLiveChatClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-emerald-600 to-green-500 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                    <MessageSquare className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{t.liveChat}</h3>
                    <p className="text-sm text-white/90 flex items-center gap-1">
                      <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                      {t.chatWithExpert}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLiveChatClose}
                  className="h-8 w-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition"
                >
                  <X className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            <div id="chat-messages" className="h-64 p-4 overflow-y-auto space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">D</span>
                </div>
                <div className="flex-1">
                  <div className="bg-emerald-50 rounded-2xl rounded-tl-none p-3 max-w-xs">
                    <p className="text-sm text-emerald-900">
                      {userLanguage === "hindi" 
                        ? "नमस्ते! मैं धनसाथी सहायता टीम से हूं। आपकी कैसे मदद कर सकता हूं?" 
                        : "Hello! I'm from DhanSaathi support team. How can I help you?"}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-2">
                    {userLanguage === "hindi" ? "धनसाथी सहायता" : "DhanSaathi Support"}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-gray-200">
              <div className="flex gap-2">
                <input
                  id="chat-message"
                  type="text"
                  placeholder={userLanguage === "hindi" ? "अपना संदेश टाइप करें..." : "Type your message..."}
                  className="flex-1 px-4 py-3 bg-gray-100 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  className="px-6 py-3 bg-gradient-to-r from-emerald-600 to-green-500 text-white font-semibold rounded-xl hover:shadow-lg transition"
                >
                  {userLanguage === "hindi" ? "भेजें" : "Send"}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {t.avgResponse}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <style>{`
        @keyframes blobA {
          0% { transform: translate(0,0) scale(1); }
          35% { transform: translate(30px,-20px) scale(1.12); }
          70% { transform: translate(-25px,20px) scale(0.96); }
          100% { transform: translate(0,0) scale(1); }
        }
        @keyframes blobB {
          0% { transform: translate(0,0) scale(1); }
          40% { transform: translate(-25px,-18px) scale(1.10); }
          75% { transform: translate(22px,18px) scale(0.98); }
          100% { transform: translate(0,0) scale(1); }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(245, 158, 11, 0.3); }
          50% { box-shadow: 0 0 40px rgba(245, 158, 11, 0.6); }
        }
      `}</style>

      <div
        className="min-h-screen relative overflow-hidden bg-gradient-to-br from-emerald-50/30 via-white to-blue-50/30"
        onMouseMove={(e) => setMouse({ x: e.clientX, y: e.clientY })}
        style={{
          backgroundImage: `
            radial-gradient(1000px circle at ${mouse.x}px ${mouse.y}px, rgba(16,185,129,0.15), transparent 45%),
            radial-gradient(circle at top left, rgba(187,247,208,0.6) 0, transparent 65%),
            radial-gradient(circle at bottom right, rgba(191,219,254,0.5) 0, transparent 65%)
          `,
        }}
      >
        <div className="pointer-events-none absolute -top-52 -left-52 h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(34,197,94,0.45)_0%,rgba(16,185,129,0.18)_38%,transparent_70%)] blur-3xl opacity-90 mix-blend-multiply animate-[blobA_18s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute top-[25%] -right-60 h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(16,185,129,0.38)_0%,rgba(59,130,246,0.15)_42%,transparent_72%)] blur-3xl opacity-80 mix-blend-multiply animate-[blobB_22s_ease-in-out_infinite]" />

        {/* Premium NAVBAR */}
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className="w-full bg-white/95 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-40"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <motion.button 
              onClick={() => navigate("/home")}
              className="flex items-center gap-2.5 group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-green-600 to-emerald-600 flex items-center justify-center shadow-lg">
                <IndianRupee className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                {t.appName}
              </span>
            </motion.button>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
              {[
                { icon: <Home className="h-4 w-4" />, label: t.home, path: "/home" },
                { icon: <Building2 className="h-4 w-4" />, label: t.schemes, path: "/schemes" },
                { icon: <Sparkle className="h-4 w-4" />, label: t.community, path: "/community" },
                { icon: <BookOpen className="h-4 w-4" />, label: t.learn, path: "/learn" },
              ].map((item) => (
                <motion.button
                  key={item.label}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => navigate(item.path)}
                  className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 transition"
                >
                  {item.icon}
                  {item.label}
                </motion.button>
              ))}
              
              <motion.button
                type="button"
                className="relative text-emerald-700 font-semibold flex items-center gap-1.5"
                whileHover={{ scale: 1.05 }}
              >
                <MessageSquare className="h-4 w-4" />
                {t.help}
                <motion.span 
                  layoutId="activeTab"
                  className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-emerald-500 to-green-500"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              </motion.button>
            </nav>

            <div className="flex items-center gap-3">
              <motion.button
                type="button"
                onClick={toggleLanguage}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 transition hover:-translate-y-0.5"
                title={userLanguage === 'hindi' ? "Switch to English" : "Switch to Hindi"}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Globe className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {userLanguage === 'hindi' ? 'हिंदी' : 'English'}
                </span>
              </motion.button>

              <motion.button
                type="button"
                className="hidden sm:inline-flex h-10 w-10 rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow-sm items-center justify-center text-gray-700 hover:bg-gray-50 transition hover:-translate-y-0.5 relative"
                title={t.notifications}
                onClick={() => alert(t.comingSoon)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Bell className="h-5 w-5" />
                <motion.span
                  className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full border-2 border-white"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.button>

              <div className="relative" ref={menuRef}>
                <motion.button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg flex items-center justify-center text-white font-semibold relative"
                  aria-label="Account menu"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
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
                </motion.button>

                <AnimatePresence>
                  {menuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-3 w-72 rounded-2xl bg-white/95 backdrop-blur-xl border border-gray-200 shadow-2xl overflow-hidden z-50"
                    >
                      <div className="p-4 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                        <p className="text-xs text-gray-600 mt-1 break-all">{email || t.notSignedIn}</p>
                      </div>

                      <div className="p-2">
                        <button
                          type="button"
                          onClick={() => {
                            toggleLanguage();
                            setMenuOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-xl transition"
                        >
                          <Globe className="h-4 w-4 text-emerald-600" />
                          {userLanguage === 'hindi' ? 'Switch to English' : 'हिंदी में बदलें'}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            navigate("/profile");
                            setMenuOpen(false);
                          }}
                          className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 rounded-xl transition"
                        >
                          <UserCog className="h-4 w-4 text-emerald-600" />
                          {userLanguage === 'hindi' ? 'प्रोफाइल सेटिंग्स' : 'Profile Settings'}
                        </button>
                      </div>

                      <div className="p-2 border-t border-gray-100">
                        {fbUser ? (
                          <button
                            type="button"
                            className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 rounded-xl transition"
                            onClick={() => {
                              handleLogout();
                              setMenuOpen(false);
                            }}
                          >
                            <LogOut className="h-4 w-4" />
                            {t.logout}
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="w-full px-4 py-3 text-left text-sm text-emerald-700 hover:bg-emerald-50 rounded-xl transition"
                            onClick={() => {
                              navigate("/signup");
                              setMenuOpen(false);
                            }}
                          >
                            {t.signin}
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-10">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            className="mb-10"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 mb-4"
              variants={scaleIn}
            >
              <Sparkles className="h-4 w-4 text-emerald-600" />
              <span className="text-sm font-semibold text-emerald-700">
                24/7 Support Available
              </span>
            </motion.div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-4">
              {t.title}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl">
              {t.subtitle}
            </p>
          </motion.div>

          <div className="grid gap-8 lg:grid-cols-[2.1fr,1fr]">
            {/* LEFT COLUMN */}
            <section className="space-y-8">
              <motion.div
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-100 to-green-100 flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-emerald-700" />
                    </div>
                    {t.askExpert}
                  </h2>
                </div>

                {/* Pricing cards */}
                <div className="grid sm:grid-cols-2 gap-6">
                  {tiers.map((tier) => (
                    <motion.div
                      key={tier.id}
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                      className={`relative overflow-hidden rounded-3xl bg-gradient-to-br ${tier.gradient} border ${tier.border} p-1 shadow-lg`}
                    >
                      <div className="relative bg-white/95 backdrop-blur rounded-[22px] p-6 h-full">
                        {/* Badge */}
                        <div className="flex items-center justify-between mb-4">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                            tier.id === "premium" 
                              ? "bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-800 border border-amber-200"
                              : "bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 border border-emerald-200"
                          }`}>
                            {tier.badge}
                          </span>
                          <motion.div
                            animate={tier.pulse ? pulseAnimation : {}}
                          >
                            {tier.icon}
                          </motion.div>
                        </div>

                        {/* Price */}
                        <div className="mb-4">
                          <p className="text-3xl font-extrabold text-gray-900">
                            {tier.price}
                            {tier.id === "premium" && (
                              <span className="text-sm text-gray-500 font-normal ml-2">/month</span>
                            )}
                          </p>
                          <p className="text-sm text-gray-600 mt-1">
                            {tier.title}
                          </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-3 mb-6">
                          {tier.points.map((point, index) => (
                            <motion.div
                              key={point}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className="flex items-center gap-3"
                            >
                              <div className="h-6 w-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                                <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                              </div>
                              <p className="text-sm text-gray-700">{point}</p>
                            </motion.div>
                          ))}
                        </div>

                        {/* Action Button */}
                        <motion.button
                          type="button"
                          onClick={tier.id === "premium" ? handlePremiumConnect : handleFreeChatClick}
                          className={`w-full px-4 py-3 rounded-xl font-semibold transition-all hover:-translate-y-0.5 ${tier.buttonStyle}`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          {tier.buttonText}
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Quick Help CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6"
                >
                  <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/60 border border-blue-200 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">{t.getHelpNow}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {userLanguage === "hindi" 
                            ? "तुरंत सहायता प्राप्त करें" 
                            : "Get immediate help"}
                        </p>
                      </div>
                      <motion.button
                        onClick={handleFreeChatClick}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-500 text-white font-semibold rounded-xl hover:shadow-lg transition"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {t.liveChat}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Available Experts */}
              <motion.div
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                      <Headset className="h-5 w-5 text-purple-700" />
                    </div>
                    {t.availableExperts}
                  </h2>
                  <span className="text-sm text-gray-500">
                    {experts.filter(e => e.online).length} {t.online.toLowerCase()}
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  {experts.map((expert, index) => (
                    <motion.div
                      key={expert.name}
                      variants={fadeInUp}
                      custom={index}
                    >
                      <motion.div
                        whileHover={{ y: -3, transition: { duration: 0.2 } }}
                        className={`rounded-2xl border ${expert.online ? 'border-emerald-200' : 'border-gray-200'} bg-white/95 backdrop-blur p-5 hover:shadow-lg transition-all cursor-pointer`}
                        onClick={() => handleExpertClick(expert)}
                      >
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="relative">
                            <div className={`h-12 w-12 rounded-xl bg-gradient-to-br ${expert.avatarColor} flex items-center justify-center`}>
                              <span className="text-sm font-bold text-white">
                                {expert.name.charAt(0)}
                              </span>
                            </div>
                            {expert.online && (
                              <motion.div
                                animate={{ scale: [1, 1.2, 1] }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white"
                              />
                            )}
                          </div>

                          {/* Expert Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-semibold text-gray-900 truncate">
                                  {expert.name}
                                </p>
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {expert.tags.map((tag) => (
                                    <span
                                      key={tag}
                                      className="text-[11px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-700"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              </div>
                              <motion.div
                                whileHover={{ x: 5 }}
                                className={`h-6 w-6 rounded-full flex items-center justify-center ${expert.online ? 'text-emerald-600' : 'text-gray-400'}`}
                              >
                                <ArrowRight className="h-4 w-4" />
                              </motion.div>
                            </div>

                            {/* Stats */}
                            <div className="flex items-center justify-between mt-4">
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Star className="h-4 w-4 text-amber-500" />
                                  <span className="text-sm font-semibold text-gray-900">
                                    {expert.rating.toFixed(1)}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  ({expert.reviews} {t.reviews})
                                </span>
                              </div>
                              
                              <div className="text-right">
                                <span className={`text-xs font-semibold ${expert.online ? 'text-emerald-700' : 'text-gray-500'}`}>
                                  {expert.online ? t.online : t.offline}
                                </span>
                                {expert.online && (
                                  <p className="text-xs text-gray-500 mt-1">
                                    {expert.responseTime} {userLanguage === "hindi" ? "प्रतिक्रिया" : "response"}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </section>

            {/* RIGHT COLUMN */}
            <aside className="space-y-6">
              {/* Emergency Helplines */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: 0.2 }}
              >
                <div className="rounded-3xl bg-gradient-to-br from-white/95 via-white to-white/95 backdrop-blur-xl border border-gray-200 shadow-xl overflow-hidden">
                  <div className="p-5 bg-gradient-to-r from-red-500 to-pink-500">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
                        <ShieldAlert className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-extrabold text-white">
                          {t.emergencyHelplines}
                        </h3>
                        <p className="text-sm text-white/90">
                          {userLanguage === "hindi" ? "24/7 आपातकालीन सहायता" : "24/7 Emergency Support"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 space-y-4">
                    {helplines.map((helpline, index) => (
                      <motion.div
                        key={helpline.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`rounded-2xl bg-gradient-to-br ${helpline.gradient} border ${helpline.border} p-4`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center">
                              {helpline.icon}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-gray-900">
                                {helpline.title}
                              </p>
                              <p className="text-xs text-gray-600 mt-1 max-w-xs">
                                {helpline.desc}
                              </p>
                              
                              <div className="flex items-center gap-3 mt-3">
                                <button
                                  type="button"
                                  onClick={() => speak(`${helpline.title}. ${helpline.desc}`)}
                                  className="inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                                >
                                  <Volume2 className="h-3 w-3" />
                                  {t.listen}
                                </button>
                                
                                <span className="text-xs font-mono font-bold text-gray-700 bg-white/50 px-2 py-1 rounded">
                                  {helpline.number}
                                </span>
                              </div>
                            </div>
                          </div>

                          <motion.button
                            type="button"
                            onClick={() => handleEmergencyCall(helpline)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center gap-2 ${helpline.button} flex-shrink-0`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <PhoneCall className="h-4 w-4" />
                            {t.callNow}
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}

                    {/* Safety Protocol */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="rounded-2xl bg-gradient-to-br from-emerald-50/90 to-green-50/70 border border-emerald-200 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                          <ShieldCheck className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-emerald-900">
                            {t.safetyProtocol}
                          </p>
                          <p className="text-xs text-emerald-900/80 mt-1">
                            {t.safetyMessage}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Premium CTA */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: 0.3 }}
              >
                <motion.div
                  animate={pulseAnimation}
                  className="rounded-3xl bg-gradient-to-br from-amber-50/80 to-yellow-50/60 border border-amber-200 p-5 shadow-lg"
                >
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 flex items-center justify-center">
                        <Crown className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                          <Zap className="h-4 w-4 text-amber-500" />
                          {t.premiumSupport}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {t.premiumDescription}
                        </p>
                      </div>
                    </div>
                    
                    <motion.button
                      type="button"
                      onClick={handleUpgradeClick}
                      className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Crown className="h-4 w-4" />
                      {t.upgradePremium}
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>

              {/* Language Info */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: 0.5 }}
              >
                <div className="rounded-3xl bg-gradient-to-br from-emerald-50/80 to-green-50/60 border border-emerald-200 p-5 shadow-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Globe className="h-5 w-5 text-emerald-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {userLanguage === 'hindi' ? 'भाषा: हिंदी' : 'Language: English'}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {userLanguage === 'hindi' ? 'पूरा ऐप हिंदी में' : 'Full app in English'}
                      </p>
                    </div>
                  </div>
                  <motion.button
                    type="button"
                    onClick={toggleLanguage}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition hover:-translate-y-0.5 flex items-center justify-center gap-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Globe className="h-4 w-4" />
                    {userLanguage === 'hindi' ? 'Switch to English' : 'हिंदी में बदलें'}
                  </motion.button>
                </div>
              </motion.div>

              {/* Support Info */}
              <motion.div
                initial="hidden"
                animate="visible"
                variants={fadeInUp}
                transition={{ delay: 0.6 }}
              >
                <div className="rounded-3xl bg-gradient-to-br from-blue-50/80 to-indigo-50/60 border border-blue-200 p-5 shadow-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                      <HelpCircle className="h-5 w-5 text-blue-700" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">
                        {userLanguage === 'hindi' ? 'तत्काल सहायता' : 'Immediate Help'}
                      </h3>
                      <p className="text-xs text-gray-600">
                        {userLanguage === 'hindi' ? '24/7 चैट सहायता उपलब्ध' : '24/7 chat support available'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleFreeChatClick}
                    className="w-full px-4 py-3 rounded-xl bg-white border border-blue-200 text-blue-700 text-sm font-semibold hover:bg-blue-50 transition hover:-translate-y-0.5"
                  >
                    {t.freeButton}
                  </button>
                </div>
              </motion.div>
            </aside>
          </div>
        </main>

        {/* Live Chat Modal */}
        <LiveChatModal />

        {/* Floating Voice Assistant Button */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.8, type: "spring" }}
          className="fixed bottom-6 right-6 z-40"
        >
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400/30 to-green-400/30"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
          <motion.button
            className="relative h-16 w-16 rounded-full bg-gradient-to-r from-emerald-600 to-green-500 shadow-2xl flex items-center justify-center text-white hover:shadow-3xl transition"
            aria-label={t.voiceAssistant}
            type="button"
            onClick={handleVoiceButtonClick}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Mic className="h-7 w-7" />
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}