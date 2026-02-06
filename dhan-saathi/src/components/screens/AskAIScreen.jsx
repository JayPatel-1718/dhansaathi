import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../firebase";

import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";

import { ensureChatSession, addChatMessage } from "../../services/aiChatService";

import {
  Home,
  Building2,
  Sparkle,
  BookOpen,
  ShieldCheck,
  Bell,
  LogOut,
  IndianRupee,
  Send,
  Sparkles as SparklesIcon,
  Mic,
  Users,
  Volume2,
  Globe,
  HelpCircle,
  X,
  AlertCircle,
  CheckCircle,
  VolumeX,
} from "lucide-react";

/* ----------------------- Styles ----------------------- */
const styles = `
  @keyframes blobA {
    0% { transform: translate(0,0) scale(1); }
    35% { transform: translate(32px,-18px) scale(1.12); }
    70% { transform: translate(-22px,22px) scale(0.96); }
    100% { transform: translate(0,0) scale(1); }
  }
  @keyframes blobB {
    0% { transform: translate(0,0) scale(1); }
    40% { transform: translate(-22px,-18px) scale(1.10); }
    75% { transform: translate(18px,18px) scale(0.98); }
    100% { transform: translate(0,0) scale(1); }
  }
  @keyframes sheen {
    0% { transform: translateX(-50%); opacity: 0; }
    20% { opacity: 0.22; }
    60% { opacity: 0.22; }
    100% { transform: translateX(150%); opacity: 0; }
  }
  @keyframes micPulse {
    0% { transform: scale(0.90); opacity: 0.45; }
    70% { transform: scale(1.25); opacity: 0; }
    100% { transform: scale(1.25); opacity: 0; }
  }
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  @keyframes listeningPulse {
    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7); }
    70% { transform: scale(1.1); box-shadow: 0 0 0 20px rgba(239, 68, 68, 0); }
    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
  }
  @keyframes wave {
    0% { transform: scaleY(1); }
    50% { transform: scaleY(1.5); }
    100% { transform: scaleY(1); }
  }
`;

/* ----------------------- Custom Voice Hook ----------------------- */
const useVoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState('en-IN');
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState('prompt');
  const [isRequestingPermission, setIsRequestingPermission] = useState(false);
  
  const recognitionRef = useRef(null);

  // Check browser support
  useEffect(() => {
    const checkSupport = () => {
      const hasSpeechRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
      const hasSpeechSynthesis = !!window.speechSynthesis;
      const hasMediaDevices = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
      
      const supported = hasSpeechRecognition && hasSpeechSynthesis && hasMediaDevices;
      setIsSupported(supported);
      
      if (!supported) {
        let errorMessage = 'Voice features require Chrome or Edge browser. ';
        if (!hasSpeechRecognition) errorMessage += 'Speech recognition not available. ';
        if (!hasSpeechSynthesis) errorMessage += 'Text-to-speech not available. ';
        setError(errorMessage);
      }
      
      return supported;
    };
    
    checkSupport();
    
    // Check permission status
    const checkPermission = async () => {
      try {
        if (navigator.permissions && navigator.permissions.query) {
          const permission = await navigator.permissions.query({ name: 'microphone' });
          setPermissionStatus(permission.state);
          permission.onchange = () => {
            setPermissionStatus(permission.state);
            if (permission.state === 'granted') setError('');
          };
        }
      } catch (err) {
        console.log('Permissions API not available');
      }
    };
    
    checkPermission();
    
    // Load voices
    if (window.speechSynthesis) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  // Request microphone permission
  const requestMicrophonePermission = async () => {
    if (isRequestingPermission) return false;
    
    setIsRequestingPermission(true);
    setError('');
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      stream.getTracks().forEach(track => track.stop());
      setPermissionStatus('granted');
      return true;
      
    } catch (error) {
      console.error('Permission error:', error);
      
      let errorMessage = '';
      switch (error.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          errorMessage = 'Microphone permission was denied. Please allow access.';
          setPermissionStatus('denied');
          break;
        case 'NotFoundError':
          errorMessage = 'No microphone found. Please connect a microphone.';
          break;
        case 'NotReadableError':
          errorMessage = 'Microphone is in use by another application.';
          break;
        case 'SecurityError':
          errorMessage = 'Microphone access blocked for security. Use HTTPS.';
          break;
        default:
          errorMessage = `Microphone error: ${error.message}`;
      }
      
      setError(errorMessage);
      return false;
      
    } finally {
      setIsRequestingPermission(false);
    }
  };

  // Start voice input
  const startVoiceInput = async (onTranscriptReceived) => {
    setError('');
    setTranscript('');
    
    // Check permission first
    if (permissionStatus !== 'granted') {
      const granted = await requestMicrophonePermission();
      if (!granted) return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported');
      return;
    }
    
    // Clean up previous recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event) => {
      const result = event.results[0][0].transcript;
      const isFinal = event.results[0].isFinal;
      
      if (isFinal) {
        setTranscript(result);
        if (onTranscriptReceived) onTranscriptReceived(result);
      } else {
        setTranscript(result);
      }
    };
    
    recognition.onerror = (event) => {
      if (event.error === 'not-allowed') {
        setPermissionStatus('denied');
        setError('Microphone permission denied. Click "Fix Permission" below.');
      } else if (event.error === 'no-speech') {
        setError('No speech detected. Please speak clearly.');
      } else {
        setError(`Voice error: ${event.error}`);
      }
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    recognitionRef.current = recognition;
    
    try {
      recognition.start();
    } catch (err) {
      setError(`Failed to start: ${err.message}`);
      setIsListening(false);
    }
  };

  const stopVoiceInput = () => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  };

  const speak = (text) => {
    if (!window.speechSynthesis) {
      setError('Text-to-speech not supported');
      return;
    }
    
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to get a good voice
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const preferredVoice = voices.find(v => v.lang.startsWith(language)) || voices[0];
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en-IN' ? 'hi-IN' : 'en-IN');
  };

  const showPermissionGuide = () => {
    const userAgent = navigator.userAgent.toLowerCase();
    let guide = '';
    
    if (userAgent.includes('chrome')) {
      guide = `Chrome Fix:
1. Click 🔒 in address bar
2. Click "Site settings"
3. Find "Microphone"
4. Change to "Allow"
5. Refresh page`;
    } else if (userAgent.includes('firefox')) {
      guide = `Firefox Fix:
1. Click 🎤🚫 in address bar
2. Select "Allow"
3. Refresh page`;
    } else if (userAgent.includes('safari')) {
      guide = `Safari Fix:
1. Safari → Preferences → Websites
2. Find this site under Microphone
3. Change to "Allow"
4. Refresh page`;
    } else {
      guide = `General Fix:
1. Allow microphone in browser settings
2. Refresh page
3. Try again`;
    }
    
    alert(guide);
  };

  return {
    isListening,
    isSpeaking,
    transcript,
    language,
    error,
    isSupported,
    permissionStatus,
    isRequestingPermission,
    startVoiceInput,
    stopVoiceInput,
    speak,
    stopSpeaking,
    toggleLanguage,
    requestMicrophonePermission,
    showPermissionGuide,
  };
};

/* ----------------------- Permission Guide Modal ----------------------- */
const PermissionGuideModal = ({ isOpen, onClose, onRetry }) => {
  if (!isOpen) return null;
  
  const userAgent = navigator.userAgent.toLowerCase();
  const isChrome = userAgent.includes('chrome');
  const isFirefox = userAgent.includes('firefox');
  const isSafari = userAgent.includes('safari') && !userAgent.includes('chrome');
  
  const getSteps = () => {
    if (isChrome) {
      return [
        'Click the lock icon (🔒) in the address bar',
        'Click "Site settings"',
        'Find "Microphone" in the list',
        'Change from "Block" to "Allow"',
        'Close this and refresh the page'
      ];
    } else if (isFirefox) {
      return [
        'Click the microphone icon with red line (🎤🚫)',
        'Select "Allow" from dropdown',
        'Refresh the page after allowing'
      ];
    } else if (isSafari) {
      return [
        'Go to Safari → Preferences → Websites',
        'Select "Microphone" in sidebar',
        'Find this website and change to "Allow"',
        'Refresh the page'
      ];
    } else {
      return [
        'Look for microphone settings in your browser',
        'Allow this website to use microphone',
        'Refresh the page and try again'
      ];
    }
  };
  
  const steps = getSteps();
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <Mic className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Enable Microphone</h3>
                <p className="text-sm text-gray-600">Required for voice assistant</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-8 w-8 rounded-full hover:bg-gray-100 flex items-center justify-center"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
          
          <div className="mb-6 p-4 rounded-xl bg-blue-50 border border-blue-200">
            <h4 className="font-semibold text-gray-900 mb-3">Follow these steps:</h4>
            <ol className="space-y-2">
              {steps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <div className="h-5 w-5 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-700">{index + 1}</span>
                  </div>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          
          <div className="space-y-3">
            <button
              onClick={onRetry}
              className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-5 w-5" />
              I've Enabled Microphone - Retry
            </button>
            
            <button
              onClick={onClose}
              className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ----------------------- Schemes dataset ----------------------- */
const SCHEMES = [
  {
    id: "pm-kisan",
    type: "govt",
    tag: "FARMER",
    title: "PM Kisan Samman Nidhi",
    desc: "Annual income support of ₹6,000 in three installments for eligible farmer families.",
  },
  {
    id: "mudra",
    type: "govt",
    tag: "SMALL BUSINESS",
    title: "Pradhan Mantri Mudra Yojana (PMMY)",
    desc: "Loans up to ₹10 Lakh for micro and small businesses.",
  },
  {
    id: "pm-svanidhi",
    type: "govt",
    tag: "STREET VENDOR",
    title: "PM SVANidhi",
    desc: "Working capital loans for eligible street vendors (rules apply).",
  },
  {
    id: "pmjdy",
    type: "govt",
    tag: "BANK ACCOUNT",
    title: "PM Jan Dhan Yojana (PMJDY)",
    desc: "Basic bank account, RuPay card, DBT support (as applicable).",
  },
  {
    id: "apy",
    type: "govt",
    tag: "PENSION",
    title: "Atal Pension Yojana (APY)",
    desc: "Pension scheme for eligible subscribers (typically 18–40) (rules apply).",
  },
  {
    id: "pmjjby",
    type: "govt",
    tag: "LIFE INSURANCE",
    title: "PM Jeevan Jyoti Bima Yojana (PMJJBY)",
    desc: "Affordable life insurance (rules apply).",
  },
  {
    id: "pmsby",
    type: "govt",
    tag: "ACCIDENT INSURANCE",
    title: "PM Suraksha Bima Yojana (PMSBY)",
    desc: "Low-cost accident insurance (rules apply).",
  },
  {
    id: "ab-pmjay",
    type: "govt",
    tag: "HEALTH",
    title: "Ayushman Bharat – PM-JAY",
    desc: "Health assurance for eligible families (rules apply).",
  },
  {
    id: "stand-up-india",
    type: "govt",
    tag: "WOMEN / SC-ST",
    title: "Stand-Up India",
    desc: "Loans for eligible women and SC/ST entrepreneurs (rules apply).",
  },
  {
    id: "ssy",
    type: "bank",
    tag: "GIRL CHILD",
    title: "Sukanya Samriddhi Account (SSY)",
    desc: "Small savings scheme for a girl child (rules apply).",
  },
  {
    id: "ppf",
    type: "bank",
    tag: "TAX SAVING",
    title: "Public Provident Fund (PPF)",
    desc: "Long-term safe savings with tax benefits (rules apply).",
  },
  {
    id: "nsc",
    type: "bank",
    tag: "FIXED INCOME",
    title: "National Savings Certificate (NSC)",
    desc: "Government-backed fixed-income savings bond (rules apply).",
  },
  {
    id: "kvp",
    type: "bank",
    tag: "LONG TERM",
    title: "Kisan Vikas Patra (KVP)",
    desc: "Post Office certificate that grows over fixed tenure (rules apply).",
  },
  {
    id: "scss",
    type: "bank",
    tag: "SENIOR CITIZEN",
    title: "Senior Citizen Savings Scheme (SCSS)",
    desc: "Savings scheme for senior citizens (eligibility rules apply).",
  },
  {
    id: "po-rd",
    type: "bank",
    tag: "MONTHLY SAVING",
    title: "Post Office Recurring Deposit (RD)",
    desc: "Safe monthly saving habit (rules apply).",
  },
  {
    id: "po-td",
    type: "bank",
    tag: "FIXED DEPOSIT",
    title: "Post Office Time Deposit (TD)",
    desc: "Fixed deposit-like option via post office (rules apply).",
  },
  {
    id: "mahila-savings",
    type: "bank",
    tag: "WOMEN",
    title: "Mahila Samman Savings Certificate",
    desc: "Small savings option for women (rules apply).",
  },
];

const QUICK_QUESTIONS = [
  "Which scheme is best for me?",
  "I am a farmer. What should I apply for?",
  "I run a small shop. Any support schemes?",
  "Suggest safe saving options",
  "Suggest pension and insurance options",
  "Suggest health-related schemes",
];

function normalize(str = "") {
  return String(str || "").toLowerCase().trim();
}

function genderLabel(g) {
  if (g === "male") return "Male";
  if (g === "female") return "Female";
  if (g === "other") return "Other";
  if (g === "prefer_not_say") return "Prefer not to say";
  return "—";
}

/* ----------------------- Recommendation Engine ----------------------- */
function getRecommendations(profile, question) {
  const q = normalize(question);
  const occ = normalize(profile?.occupation || "");
  const income = Number(profile?.monthlyIncome || 0);
  const gender = normalize(profile?.gender || "");
  const age = Number(profile?.age || 0);

  const recIds = [];

  const wantsSafe =
    q.includes("safe") ||
    q.includes("saving") ||
    q.includes("save") ||
    q.includes("rd") ||
    q.includes("fd") ||
    q.includes("post office") ||
    q.includes("fixed");

  const wantsPension = q.includes("pension") || q.includes("retire") || q.includes("retirement");
  const wantsInsurance =
    q.includes("insurance") ||
    q.includes("bima") ||
    q.includes("suraksha") ||
    q.includes("jeevan");

  const wantsHealth = q.includes("health") || q.includes("hospital") || q.includes("ayushman");

  const looksFarmer =
    q.includes("farmer") || q.includes("kisan") || q.includes("agri") ||
    occ.includes("farmer") || occ.includes("kisan") || occ.includes("agri");

  const looksBusiness =
    q.includes("business") || q.includes("shop") || q.includes("vendor") || q.includes("trader") ||
    occ.includes("business") || occ.includes("shop") || occ.includes("vendor") || occ.includes("trader");

  const looksVendor = q.includes("street vendor") || q.includes("vendor") || occ.includes("vendor");

  const looksStudent =
    q.includes("student") || q.includes("study") || q.includes("education") || occ.includes("student");

  const looksWomen =
    q.includes("women") || q.includes("woman") || q.includes("mahila") || gender === "female";

  const isSenior = age >= 60;

  if (looksFarmer) recIds.push("pm-kisan");
  if (looksBusiness) recIds.push("mudra");
  if (looksVendor) recIds.push("pm-svanidhi");
  if (looksWomen) recIds.push("mahila-savings", "stand-up-india");

  if (wantsPension) recIds.push("apy");
  if (wantsInsurance) recIds.push("pmjjby", "pmsby");
  if (wantsHealth) recIds.push("ab-pmjay");

  if (wantsSafe) recIds.push("po-rd", "po-td", "ppf", "nsc");

  if (isSenior) recIds.push("scss");

  if (looksStudent) recIds.push("pmjdy", "po-rd", "ppf");

  if (recIds.length === 0) {
    if (income > 0 && income <= 15000) recIds.push("pmjdy", "pmsby", "po-rd");
    else if (income > 15000) recIds.push("ppf", "nsc", "apy");
    else recIds.push("pmjdy", "po-rd", "ppf", "pmsby");
  }

  const uniq = [...new Set(recIds)];
  return uniq.map((id) => SCHEMES.find((s) => s.id === id)).filter(Boolean);
}

/* ----------------------- UI Component ----------------------- */
export default function AskAIScreen() {
  const navigate = useNavigate();

  const [fbUser, setFbUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [userDoc, setUserDoc] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [mouse, setMouse] = useState({ x: 280, y: 180 });
  const [showPermissionModal, setShowPermissionModal] = useState(false);

  // Voice Assistant Hook
  const {
    isListening,
    isSpeaking,
    transcript,
    language,
    error: voiceError,
    isSupported: voiceSupported,
    permissionStatus,
    isRequestingPermission,
    startVoiceInput,
    stopVoiceInput,
    speak,
    stopSpeaking,
    toggleLanguage,
    requestMicrophonePermission,
    showPermissionGuide,
  } = useVoiceAssistant();

  const goHome = () => navigate("/home");
  const goSchemes = () => navigate("/schemes");
  const goCommunity = () => navigate("/community");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFbUser(u || null);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!fbUser) {
      setUserDoc(null);
      return;
    }
    const unsub = onSnapshot(doc(db, "users", fbUser.uid), (snap) => {
      setUserDoc(snap.exists() ? snap.data() : null);
    });
    return () => unsub();
  }, [fbUser]);

  useEffect(() => {
    const onDown = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  useEffect(() => {
    if (!fbUser) {
      setSessionId(null);
      setMessages([]);
      return;
    }

    let unsubMessages = null;

    (async () => {
      const sid = await ensureChatSession(fbUser.uid, null);
      setSessionId(sid);

      const qy = query(
        collection(db, "users", fbUser.uid, "aiChats", sid, "messages"),
        orderBy("createdAt", "asc")
      );

      unsubMessages = onSnapshot(qy, (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMessages(rows);
      });
    })();

    return () => {
      if (unsubMessages) unsubMessages();
    };
  }, [fbUser]);

  // Handle voice transcript
  useEffect(() => {
    if (transcript) {
      setInput(transcript);
      // Auto-send after 1 second pause
      const timeoutId = setTimeout(() => {
        send(transcript);
      }, 1000);
      
      return () => clearTimeout(timeoutId);
    }
  }, [transcript]);

  // Auto-speak AI responses
  useEffect(() => {
    if (messages.length > 0 && !isSpeaking) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === "assistant") {
        // Speak the AI response
        const textToSpeak = lastMessage.text.length > 300 
          ? lastMessage.text.substring(0, 300) + "... For more details, please read the full response."
          : lastMessage.text;
        
        // Add a greeting based on language
        const greeting = language === 'hi-IN' 
          ? "नमस्ते! मैं आपकी मदद कर सकता हूं। " 
          : "Hello! Here are my suggestions. ";
        
        speak(greeting + textToSpeak);
      }
    }
  }, [messages, isSpeaking, language]);

  const displayName = fbUser?.displayName || "Guest";
  const email = fbUser?.email || "";

  const initials = useMemo(() => {
    const src = (displayName || email || "U").trim();
    const parts = src.split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (src[0] || "U").toUpperCase();
  }, [displayName, email]);

  const profile = userDoc?.profile || {};
  const profileComplete = !!userDoc?.profileComplete;

  const handleLogout = async () => {
    setMenuOpen(false);
    await signOut(auth);
    navigate("/signup", { replace: true });
  };

  const buildAssistantResponse = (question) => {
    const recs = getRecommendations(profile, question);

    const intro = fbUser
      ? profileComplete
        ? `Based on your profile (occupation: ${profile.occupation || "—"}, income: ₹${profile.monthlyIncome || 0}/month, gender: ${genderLabel(profile.gender)}, age: ${profile.age || "—"}), here are suggestions:`
        : `Your profile is incomplete. For better results, complete voice setup. For now, here are general suggestions:`
      : `You are using Guest mode. Sign in to save chat and get better personalization. For now:`;

    const list =
      recs.length === 0
        ? "No matching schemes found. Try asking about savings, pension, insurance, farmers, street vendors, or small business."
        : recs.map((s, i) => `${i + 1}) ${s.title} — ${s.desc}`).join("\n");

    const extraAgeNote =
      Number(profile?.age || 0) >= 60
        ? "\n\nTip: Since you are 60+, explore Senior Citizen Savings Scheme (SCSS) if eligible."
        : "";

    return {
      text: `${intro}\n\n${list}\n\nOpen Schemes to view details.${extraAgeNote}`,
      recommendedSchemeIds: recs.map((r) => r.id),
    };
  };

  const send = async (text) => {
    const q = (text || "").trim();
    if (!q) return;

    setInput("");
    stopVoiceInput();

    if (!fbUser) {
      const assistant = buildAssistantResponse(q);
      setMessages((prev) => [
        ...prev,
        { id: `u_${Date.now()}`, role: "user", text: q },
        { id: `a_${Date.now()}`, role: "assistant", text: assistant.text, meta: assistant },
      ]);
      return;
    }

    if (!sessionId) return;

    await addChatMessage(fbUser.uid, sessionId, "user", q);

    const assistant = buildAssistantResponse(q);
    await addChatMessage(fbUser.uid, sessionId, "assistant", assistant.text, {
      recommendedSchemeIds: assistant.recommendedSchemeIds,
    });
  };

  const handleVoiceClick = async () => {
    if (isListening) {
      stopVoiceInput();
      return;
    }

    if (!voiceSupported) {
      alert('Voice features require Chrome or Edge browser. Please switch browsers.');
      return;
    }

    if (permissionStatus === 'denied') {
      setShowPermissionModal(true);
      return;
    }

    try {
      await startVoiceInput((text) => {
        setInput(text);
        setTimeout(() => send(text), 800);
      });
    } catch (error) {
      console.error('Voice error:', error);
    }
  };

  const handlePermissionRetry = async () => {
    setShowPermissionModal(false);
    const granted = await requestMicrophonePermission();
    if (granted) {
      // Small delay before retrying
      setTimeout(() => {
        handleVoiceClick();
      }, 500);
    }
  };

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-12 w-12 border-4 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading AI Assistant...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>
      
      {/* Permission Guide Modal */}
      <PermissionGuideModal
        isOpen={showPermissionModal}
        onClose={() => setShowPermissionModal(false)}
        onRetry={handlePermissionRetry}
      />

      <div
        className="min-h-screen relative overflow-hidden bg-gradient-to-b from-green-50 via-white to-blue-50 flex flex-col"
        onMouseMove={(e) => setMouse({ x: e.clientX, y: e.clientY })}
        style={{
          backgroundImage: `
            radial-gradient(800px circle at ${mouse.x}px ${mouse.y}px, rgba(16,185,129,0.14), transparent 42%),
            radial-gradient(circle at top left, rgba(187,247,208,0.55) 0, transparent 55%),
            radial-gradient(circle at bottom right, rgba(191,219,254,0.45) 0, transparent 55%)
          `,
        }}
      >
        {/* Animated liquid blobs */}
        <div className="pointer-events-none absolute -top-48 -left-48 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(34,197,94,0.45)_0%,rgba(16,185,129,0.16)_38%,transparent_70%)] blur-3xl opacity-90 mix-blend-multiply animate-[blobA_18s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute top-[25%] -right-56 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(16,185,129,0.40)_0%,rgba(59,130,246,0.14)_42%,transparent_72%)] blur-3xl opacity-80 mix-blend-multiply animate-[blobB_22s_ease-in-out_infinite]" />

        {/* Navbar */}
        <header className="w-full bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <button type="button" onClick={goHome} className="flex items-center gap-2.5 hover:scale-105 transition-transform">
              <div className="h-9 w-9 rounded-xl bg-green-600 flex items-center justify-center shadow-md">
                <IndianRupee className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                DhanSaathi
              </span>
            </button>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
              <button type="button" onClick={goHome} className="flex items-center gap-1.5 hover:text-emerald-700 transition group">
                <Home className="h-4 w-4 group-hover:scale-110 transition-transform" /> Home
              </button>
              <button type="button" onClick={goSchemes} className="flex items-center gap-1.5 hover:text-emerald-700 transition group">
                <Building2 className="h-4 w-4 group-hover:scale-110 transition-transform" /> Schemes
              </button>
              <button type="button" onClick={goCommunity} className="flex items-center gap-1.5 hover:text-emerald-700 transition group">
                <Sparkle className="h-4 w-4 group-hover:scale-110 transition-transform" /> Community
              </button>
              <button type="button" className="flex items-center gap-1.5 hover:text-emerald-700 transition group" onClick={() => navigate("/learn")}>
                <BookOpen className="h-4 w-4 group-hover:scale-110 transition-transform" /> Learn
              </button>
              <button type="button" className="flex items-center gap-1.5 hover:text-emerald-700 transition group" onClick={() => alert("Help coming soon")}>
                <ShieldCheck className="h-4 w-4 group-hover:scale-110 transition-transform" /> Help
              </button>
            </nav>

            <div className="flex items-center gap-3">
              {/* Language Toggle */}
              <button
                type="button"
                onClick={toggleLanguage}
                className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                  language === 'hi-IN'
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                }`}
                title={language === 'hi-IN' ? 'Switch to English' : 'हिंदी में बोलें'}
              >
                <Globe className="h-3.5 w-3.5" />
                {language === 'hi-IN' ? 'हिंदी' : 'English'}
              </button>

              <button
                type="button"
                className="hidden sm:inline-flex h-10 w-10 rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow-sm items-center justify-center text-gray-700 hover:bg-gray-50 transition hover:-translate-y-0.5"
                title="Notifications"
                onClick={() => alert("Notifications coming soon")}
              >
                <Bell className="h-5 w-5" />
              </button>

              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-emerald-500 shadow flex items-center justify-center text-white font-semibold hover:shadow-lg transition-shadow"
                >
                  {fbUser?.photoURL ? (
                    <img src={fbUser.photoURL} alt="Profile" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                  ) : (
                    <span>{initials}</span>
                  )}
                </button>

                <div
                  className={`absolute right-0 mt-3 w-72 rounded-2xl bg-white/90 backdrop-blur border border-gray-200 shadow-xl overflow-hidden origin-top-right transition-all duration-200
                    ${menuOpen ? "opacity-100 scale-100 translate-y-0" : "pointer-events-none opacity-0 scale-95 -translate-y-2"}
                  `}
                >
                  <div className="px-4 py-4">
                    <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                    <p className="text-xs text-gray-600 mt-1 break-all">{email || "Guest mode"}</p>
                  </div>

                  <div className="h-px bg-gray-100" />

                  {fbUser ? (
                    <button
                      type="button"
                      className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" /> Logout
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="w-full px-4 py-3 text-left text-sm text-green-700 hover:bg-green-50"
                      onClick={() => navigate("/signup")}
                    >
                      Sign in to save chat
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            {/* Chat Section */}
            <section className="relative overflow-hidden rounded-3xl bg-white/85 backdrop-blur-xl border border-gray-200 shadow-[0_28px_80px_rgba(15,23,42,0.12)] p-6">
              {/* Sheen overlay */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute -inset-y-10 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-xl animate-[sheen_8s_ease-in-out_infinite]" />
              </div>

              <div className="relative">
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <SparklesIcon className="h-6 w-6 text-emerald-600" />
                      Ask AI (Voice Assistant)
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      {language === 'hi-IN' 
                        ? 'हिंदी या अंग्रेजी में बोलें। माइक बटन दबाएं।'
                        : 'Speak in Hindi or English. Click mic button.'}
                    </p>
                  </div>

                  {fbUser && !profileComplete && (
                    <button
                      type="button"
                      onClick={() => navigate("/voice-setup")}
                      className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-sm font-semibold hover:bg-emerald-100 hover:-translate-y-0.5 transition-all"
                    >
                      Complete profile →
                    </button>
                  )}
                </div>

                {/* Voice Status Indicators */}
                {isListening && (
                  <div className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="h-3 w-3 rounded-full bg-red-500 animate-ping" />
                          <div className="h-3 w-3 rounded-full bg-red-500 absolute top-0" />
                        </div>
                        <div>
                          <span className="font-medium text-red-700">
                            {language === 'hi-IN' ? 'सुन रहा हूं... बोलिए' : 'Listening... Speak now'}
                          </span>
                          <div className="flex items-center gap-1 mt-1">
                            {[1, 2, 3, 4, 5].map(i => (
                              <div
                                key={i}
                                className="h-2 w-1 bg-red-400 rounded-full"
                                style={{ animation: `wave 1s ease-in-out infinite`, animationDelay: `${i * 0.1}s` }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <span className="text-sm text-red-600 font-medium">
                        {transcript || (language === 'hi-IN' ? 'बोलना शुरू करें' : 'Start speaking...')}
                      </span>
                    </div>
                  </div>
                )}

                {isSpeaking && (
                  <div className="mb-4 p-4 rounded-2xl bg-blue-50 border border-blue-200">
                    <div className="flex items-center gap-3">
                      <div className="h-3 w-3 rounded-full bg-blue-500 animate-pulse" />
                      <span className="font-medium text-blue-700">
                        {language === 'hi-IN' ? 'आवाज में बोल रहा हूं...' : 'Speaking response...'}
                      </span>
                      <button
                        onClick={stopSpeaking}
                        className="ml-auto px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm hover:bg-blue-200 transition"
                      >
                        Stop
                      </button>
                    </div>
                  </div>
                )}

                {voiceError && (
                  <div className="mb-4 p-4 rounded-2xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertCircle className="h-4 w-4 text-amber-600" />
                        <span className="text-sm text-amber-700">{voiceError}</span>
                      </div>
                      {voiceError.includes('permission') && (
                        <button
                          onClick={() => setShowPermissionModal(true)}
                          className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-sm font-medium hover:bg-amber-200 transition"
                        >
                          Fix Permission
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {!voiceSupported && (
                  <div className="mb-4 p-4 rounded-2xl bg-gray-100 border border-gray-200">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-4 w-4 text-gray-600" />
                      <span className="text-sm text-gray-700">
                        Voice assistant works best in Chrome or Edge browser. Some features may be limited.
                      </span>
                    </div>
                  </div>
                )}

                {/* Quick questions */}
                <div className="relative mt-5 flex flex-wrap gap-2">
                  {QUICK_QUESTIONS.map((q, index) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => {
                        setInput(q);
                        send(q);
                      }}
                      className="px-3 py-2 rounded-full bg-gray-50/90 border border-gray-200 text-sm text-gray-700 hover:bg-white hover:-translate-y-0.5 transition-all hover:shadow-md"
                      style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both` }}
                    >
                      {q}
                    </button>
                  ))}
                </div>

                {/* Messages */}
                <div className="relative mt-6 h-[420px] overflow-auto rounded-2xl border border-gray-200 bg-white/90 backdrop-blur p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                        <SparklesIcon className="h-8 w-8 text-emerald-600" />
                      </div>
                      <p className="text-gray-600">
                        {language === 'hi-IN' 
                          ? 'व्यक्तिगत योजना सिफारिशों के लिए प्रश्न पूछें'
                          : 'Ask a question to get personalized scheme recommendations'}
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        {language === 'hi-IN'
                          ? 'या माइक बटन दबाकर बोलें'
                          : 'Or click mic button to speak'}
                      </p>
                    </div>
                  ) : (
                    messages.map((m, idx) => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-2xl border backdrop-blur-sm group ${
                          m.role === "user"
                            ? "bg-emerald-50/90 border-emerald-100 ml-auto max-w-[85%] hover:-translate-y-0.5 transition-all"
                            : "bg-gray-50/90 border-gray-200 mr-auto max-w-[85%] hover:-translate-y-0.5 transition-all"
                        }`}
                        style={{ animation: `fadeInUp 0.4s ease-out ${idx * 0.05}s both` }}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-xs font-semibold text-gray-600 flex items-center gap-2">
                            {m.role === "user" ? "You" : "DhanSaathi AI"}
                            {m.role === "assistant" && (
                              <button
                                onClick={() => speak(m.text)}
                                className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded"
                                title="Speak this response"
                              >
                                <Volume2 className="h-3 w-3 text-gray-500" />
                              </button>
                            )}
                          </div>
                          {m.role === "assistant" && isSpeaking && (
                            <div className="flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                              <span className="text-xs text-gray-500">Speaking</span>
                            </div>
                          )}
                        </div>
                        <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                          {m.text}
                        </pre>
                      </div>
                    ))
                  )}
                </div>

                {/* Input with Voice Button */}
                <div className="relative mt-4 flex gap-2">
                  <div className="flex-1 relative">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={
                        language === 'hi-IN' 
                          ? 'योजनाओं के बारे में पूछें या माइक बटन दबाएं...'
                          : 'Ask about schemes or click mic button...'
                      }
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-200 bg-white/90 backdrop-blur focus:bg-white transition-all pr-12"
                      onKeyDown={(e) => {
                        if (e.key === "Enter") send(input);
                      }}
                    />
                    {input && (
                      <button
                        type="button"
                        onClick={() => setInput("")}
                        className="absolute right-14 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                      >
                        ×
                      </button>
                    )}
                  </div>
                  
                  {/* Voice Button */}
                  <button
                    type="button"
                    onClick={handleVoiceClick}
                    disabled={isRequestingPermission || !voiceSupported}
                    className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-md hover:shadow-lg relative ${
                      isListening 
                        ? 'bg-red-500 hover:bg-red-600 animate-[listeningPulse_1.5s_infinite]' 
                        : permissionStatus === 'granted'
                        ? 'bg-emerald-500 hover:bg-emerald-600'
                        : 'bg-amber-500 hover:bg-amber-600'
                    } ${(isRequestingPermission || !voiceSupported) && 'opacity-50 cursor-not-allowed'}`}
                    title={
                      isRequestingPermission ? 'Requesting permission...' :
                      !voiceSupported ? 'Voice not supported' :
                      isListening ? 'Stop listening' : 'Start voice input'
                    }
                  >
                    {isRequestingPermission ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Mic className="h-5 w-5 text-white" />
                    )}
                  </button>
                  
                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={() => send(input)}
                    className="h-12 w-12 rounded-2xl bg-emerald-600 text-white grid place-items-center hover:bg-emerald-700 hover:scale-105 transition-all shadow-md hover:shadow-lg"
                    title="Send"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>

                {/* Voice Help Text */}
                <div className="mt-3 text-xs text-gray-500">
                  {language === 'hi-IN'
                    ? 'टिप: माइक बटन दबाएं, हिंदी/अंग्रेजी में बोलें, प्रश्न पूरा होने पर स्वचालित भेजा जाएगा।'
                    : 'Tip: Press mic, speak in Hindi/English, will auto-send when question ends.'}
                </div>

                <div className="relative mt-4 flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => navigate("/schemes")}
                    className="px-4 py-2 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 hover:-translate-y-0.5 transition-all shadow-md hover:shadow-lg"
                  >
                    Open Schemes
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate("/community")}
                    className="px-4 py-2 rounded-full bg-white/90 backdrop-blur border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-white hover:-translate-y-0.5 transition-all"
                  >
                    Ask Community
                  </button>

                  {isSpeaking && (
                    <button
                      type="button"
                      onClick={stopSpeaking}
                      className="px-4 py-2 rounded-full bg-red-50 border border-red-200 text-sm font-semibold text-red-700 hover:bg-red-100 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                      <VolumeX className="h-4 w-4" />
                      Stop Voice
                    </button>
                  )}

                  {permissionStatus === 'denied' && (
                    <button
                      type="button"
                      onClick={() => setShowPermissionModal(true)}
                      className="px-4 py-2 rounded-full bg-amber-50 border border-amber-200 text-sm font-semibold text-amber-700 hover:bg-amber-100 hover:-translate-y-0.5 transition-all flex items-center gap-2"
                    >
                      <HelpCircle className="h-4 w-4" />
                      Fix Microphone
                    </button>
                  )}
                </div>

                <p className="text-xs text-gray-500 mt-4">
                  Note: This is educational guidance. Always verify eligibility and official rules.
                </p>
              </div>
            </section>

            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Profile card */}
              <div className="relative overflow-hidden rounded-3xl bg-white/85 backdrop-blur-xl border border-gray-200 shadow-[0_20px_60px_rgba(15,23,42,0.12)] p-6 hover:shadow-xl transition-all">
                {/* Sheen overlay */}
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -inset-y-10 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent blur-xl animate-[sheen_10s_ease-in-out_infinite]" />
                </div>

                <div className="relative">
                  <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Users className="h-5 w-5 text-emerald-600" />
                    Your Profile
                  </h2>

                  <div className="mt-4 text-sm text-gray-700 space-y-3">
                    <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-50/50">
                      <span className="text-gray-500">Name:</span>
                      <span className="font-semibold">{profile?.name || displayName}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50/50">
                      <span className="text-gray-500">Gender:</span>
                      <span className="font-semibold">{genderLabel(profile?.gender)}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-purple-50/50">
                      <span className="text-gray-500">Age:</span>
                      <span className="font-semibold">{profile?.age || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-amber-50/50">
                      <span className="text-gray-500">Occupation:</span>
                      <span className="font-semibold">{profile?.occupation || "—"}</span>
                    </div>
                    <div className="flex justify-between items-center p-2 rounded-lg bg-rose-50/50">
                      <span className="text-gray-500">Monthly Income:</span>
                      <span className="font-semibold">
                        {profile?.monthlyIncome ? `₹${profile.monthlyIncome}` : "—"}
                      </span>
                    </div>
                  </div>

                  {/* Voice Status */}
                  <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">Voice Assistant</span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        permissionStatus === 'granted' ? 'bg-green-100 text-green-800' :
                        permissionStatus === 'denied' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {permissionStatus === 'granted' ? 'Ready' :
                         permissionStatus === 'denied' ? 'Permission Needed' :
                         'Setup Required'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">
                      {language === 'hi-IN'
                        ? 'भाषा: हिंदी | माइक: ' + (permissionStatus === 'granted' ? 'सक्रिय' : 'अनुमति चाहिए')
                        : `Language: ${language === 'hi-IN' ? 'Hindi' : 'English'} | Mic: ${permissionStatus === 'granted' ? 'Active' : 'Permission needed'}`}
                    </p>
                  </div>

                  {fbUser ? (
                    <button
                      type="button"
                      onClick={() => navigate("/voice-setup")}
                      className="mt-6 w-full px-4 py-3 rounded-2xl bg-gray-50/90 border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-white hover:-translate-y-0.5 transition-all hover:shadow-md"
                    >
                      Edit profile via voice →
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => navigate("/signup")}
                      className="mt-6 w-full px-4 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 hover:-translate-y-0.5 transition-all shadow-md hover:shadow-lg"
                    >
                      Sign in for personalization →
                    </button>
                  )}
                </div>
              </div>

              {/* Voice Tips Card */}
              <div className="rounded-3xl bg-gradient-to-br from-blue-50 to-indigo-100/50 backdrop-blur-xl border border-blue-200 p-6 hover:shadow-xl transition-all">
                <h3 className="text-sm font-bold text-blue-900 flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  Voice Tips
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                    <span>Speak clearly in normal tone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                    <span>Ask: "Which scheme is best for farmers?"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                    <span>AI responds in selected language</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5" />
                    <span>Use Stop button to cancel voice</span>
                  </li>
                </ul>
                <div className="mt-4 p-2 rounded-lg bg-blue-100/30 border border-blue-200/30">
                  <p className="text-xs text-blue-800">
                    <strong>Try saying:</strong> "{language === 'hi-IN' ? 'मेरे लिए कौन सी योजना अच्छी है?' : 'What scheme is good for me?'}"
                  </p>
                </div>
              </div>

              {/* Safety Reminder */}
              <div className="rounded-3xl bg-gradient-to-br from-amber-50 to-amber-100/50 backdrop-blur-xl border border-amber-200 p-6 hover:shadow-xl transition-all">
                <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Safety Reminder
                </h3>
                <p className="text-sm text-amber-900/80 mt-2">
                  DhanSaathi will never ask for OTP, PIN, or passwords.
                </p>
                <div className="mt-3 p-2 rounded-lg bg-amber-200/20 border border-amber-300/30">
                  <p className="text-xs text-amber-900/70">
                    Always verify schemes through official government websites.
                  </p>
                </div>
              </div>

              {/* Stats Card */}
              <div className="rounded-3xl bg-gradient-to-br from-emerald-50/80 to-green-100/50 backdrop-blur-xl border border-emerald-200 p-6 hover:shadow-xl transition-all">
                <h3 className="text-sm font-bold text-emerald-900">AI Insights</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-emerald-700">Schemes analyzed</span>
                    <span className="text-sm font-bold text-emerald-900">{SCHEMES.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-emerald-700">Recommendations</span>
                    <span className="text-sm font-bold text-emerald-900">
                      {messages.filter(m => m.role === "assistant").length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-emerald-700">Profile accuracy</span>
                    <span className="text-sm font-bold text-emerald-900">
                      {profileComplete ? "High" : "Medium"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-emerald-700">Voice Language</span>
                    <span className="text-sm font-bold text-emerald-900">
                      {language === 'hi-IN' ? 'Hindi' : 'English'}
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>

        {/* Floating Voice Button with Pulse */}
        <div className="fixed bottom-6 right-6 z-20">
          <div
            className="absolute inset-0 rounded-full bg-emerald-400/30"
            style={{ animation: "micPulse 1.8s ease-out infinite" }}
          />
          <button
            className={`relative h-16 w-16 rounded-full shadow-2xl flex items-center justify-center text-white transition transform hover:scale-105 focus:outline-none focus:ring-4 ${
              isListening 
                ? 'bg-red-500 focus:ring-red-300 animate-[listeningPulse_1.5s_infinite]' 
                : permissionStatus === 'granted'
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-300'
                : 'bg-amber-500 hover:bg-amber-600 focus:ring-amber-300'
            }`}
            onClick={handleVoiceClick}
            disabled={isRequestingPermission}
            title={
              isRequestingPermission ? 'Requesting permission...' :
              isListening ? 'Stop listening' :
              permissionStatus === 'denied' ? 'Microphone permission needed' :
              'Start voice assistant'
            }
          >
            {isRequestingPermission ? (
              <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : isListening ? (
              <div className="relative">
                <div className="h-6 w-6 rounded-full bg-white" />
                <div className="absolute inset-0 rounded-full bg-white animate-ping" />
              </div>
            ) : (
              <Mic className="h-7 w-7" />
            )}
          </button>
          
          {/* Language Badge */}
          <button
            onClick={toggleLanguage}
            className="absolute -top-2 -right-2 bg-white rounded-full px-2 py-1 shadow-md border hover:bg-gray-50 transition flex items-center gap-1"
            title={`Switch to ${language === 'hi-IN' ? 'English' : 'Hindi'}`}
          >
            <Globe className="h-3 w-3 text-gray-600" />
            <span className="text-xs font-medium">
              {language === 'hi-IN' ? 'HI' : 'EN'}
            </span>
          </button>
        </div>
      </div>
    </>
  );
}