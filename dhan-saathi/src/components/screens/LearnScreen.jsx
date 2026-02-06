import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import {
  Home,
  Building2,
  Sparkle,
  BookOpen,
  MessageSquare,
  Bell,
  IndianRupee,
  Search,
  Play,
  Volume2,
  Bookmark,
  CheckCircle2,
  X,
  ShieldAlert,
  SlidersHorizontal,
  Eye,
  Clock,
  Share2,
  LogOut,
  User,
} from "lucide-react";

// Firebase storage keys
const FB_KEYS = {
  SAVED: "savedLessons",
  COMPLETED: "completedLessons",
  LEARNING_STATS: "learningStats",
  TTS_SPEED: "ttsSpeed",
  LEARN_LANG: "learnSummaryLang",
};

const LS = {
  saved: "dhan-saathi-saved-lessons",
  completed: "dhan-saathi-completed-lessons",
  ttsSpeed: "dhan-saathi-tts-speed",
  learnLang: "dhan-saathi-learn-summary-lang",
};

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

const LESSONS = [
  {
    id: "otp-safety",
    title: "Never share your OTP with anyone calling from 'Bank'.",
    category: "Scam Safety",
    duration: "2:10",
    difficulty: "Beginner",
    views: "12.4k",
    langTag: "Hindi",
    urgent: true,
    summaryEn: [
      "OTP is the final key to your money. Sharing it is like giving away your bank vault keys.",
      "Scammers pretend to be bank officials or KYC agents to trick you into revealing OTP.",
      "Genuine banks never ask for OTP on calls/SMS/WhatsApp.",
    ],
    summaryHi: [
      "OTP आपके पैसे की सबसे आख़िरी चाबी है। इसे साझा करना खतरनाक है।",
      "ठग खुद को बैंक/केवाईसी एजेंट बताकर OTP मांगते हैं।",
      "असली बैंक कभी कॉल/मैसेज पर OTP नहीं मांगते।",
    ],
    warningEn: "Bank officials will NEVER ask for OTP over a call or SMS. If someone asks, they are a scammer.",
    warningHi: "बैंक कभी भी कॉल/मैसेज पर OTP नहीं मांगता। अगर कोई मांगे, तो वह ठग है।",
    stepsEn: ["Hang up immediately if anyone asks for OTP or PIN.", "Do not click unknown KYC links.", "Call your bank using the official number."],
    stepsHi: ["OTP/PIN मांगने पर तुरंत कॉल काट दें।", "अनजान KYC लिंक पर क्लिक न करें।", "बैंक के official नंबर पर कॉल करें।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.25)_0%,transparent_55%),linear-gradient(135deg,#E9FFE1_0%,#FFFFFF_60%,#E0FBFF_100%)]",
  },
  {
    id: "50-30-20",
    title: "The 50/30/20 Rule Explained",
    category: "Budgeting",
    duration: "2:40",
    difficulty: "Beginner",
    views: "9.1k",
    langTag: "English",
    summaryEn: ["50% for needs (rent, food).", "30% for wants (shopping).", "20% for savings/investments."],
    summaryHi: ["50% ज़रूरतें (खाना, किराया)।", "30% इच्छाएँ (मनपसंद खर्च)।", "20% बचत/निवेश।"],
    stepsEn: ["List needs/wants/savings.", "Set monthly limits.", "Track weekly."],
    stepsHi: ["जरूरत/इच्छा/बचत लिखें।", "मासिक limit तय करें।", "हर हफ्ते ट्रैक करें।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.18)_0%,transparent_55%),linear-gradient(135deg,#EEF2FF_0%,#FFFFFF_70%,#ECFDF5_100%)]",
  },
  {
    id: "savings-account",
    title: "Why your savings account matters",
    category: "Savings",
    duration: "5:45",
    difficulty: "Beginner",
    views: "8.9k",
    langTag: "English",
    summaryEn: ["A savings account helps you keep money safe and accessible.", "Interest is small but safety is high in regulated banks.", "Use it for emergency funds before risky investments."],
    summaryHi: ["सेविंग अकाउंट पैसा सुरक्षित रखने में मदद करता है।", "बैंकों में सुरक्षा ज्यादा होती है।", "पहले आपातकालीन फंड बनाएं।"],
    stepsEn: ["Keep SMS alerts.", "Set a monthly auto transfer.", "Avoid unnecessary withdrawals."],
    stepsHi: ["SMS alerts रखें।", "मासिक auto transfer सेट करें।", "बार‑बार निकालने से बचें।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.18)_0%,transparent_55%),linear-gradient(135deg,#FEF3C7_0%,#FFFFFF_70%,#E0FBFF_100%)]",
  },
  {
    id: "upi-fake-collect",
    title: "Identify fake UPI payment requests",
    category: "UPI & Digital Payments",
    duration: "4:20",
    difficulty: "Advanced",
    views: "15.2k",
    langTag: "Marathi",
    summaryEn: ["To receive money you don't need UPI PIN.", "Unknown 'collect' requests can be scams.", "Only pay when YOU enter amount and confirm."],
    summaryHi: ["पैसा पाने के लिए UPI PIN की जरूरत नहीं होती।", "अनजान 'collect' requests धोखा हो सकते हैं।", "भुगतान तभी करें जब आप amount डालें।"],
    warningEn: "If someone asks you to approve a request to 'receive money', it's likely fraud.",
    warningHi: "अगर कोई बोले 'पैसा लेने के लिए approve करो', तो धोखा हो सकता है।",
    stepsEn: ["Decline unknown collect.", "Never share UPI PIN.", "Use QR scan for payments."],
    stepsHi: ["अनजान collect decline करें।", "UPI PIN न शेयर करें।", "QR scan से pay करें।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.18)_0%,transparent_55%),linear-gradient(135deg,#ECFDF5_0%,#FFFFFF_70%,#EEF2FF_100%)]",
  },
  {
    id: "mutual-funds-basics",
    title: "Mutual Funds - Start with ₹500",
    category: "Mutual Funds",
    duration: "6:15",
    difficulty: "Intermediate",
    views: "7.8k",
    langTag: "English",
    summaryEn: ["Mutual funds pool money from many investors.", "Professional managers invest in stocks/bonds.", "Start small with Systematic Investment Plans (SIP)."],
    summaryHi: ["म्यूचुअल फंड में कई निवेशकों के पैसे जुड़ते हैं।", "प्रोफेशनल मैनेजर स्टॉक/बॉन्ड में निवेश करते हैं।", "SIP के जरिए छोटी रकम से शुरुआत करें।"],
    stepsEn: ["Research fund house reputation.", "Choose SIP amount and date.", "Monitor quarterly statements."],
    stepsHi: ["फंड हाउस की प्रतिष्ठा जाँचें।", "SIP amount और date चुनें।", "त्रैमासिक statements देखें।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.18)_0%,transparent_55%),linear-gradient(135deg,#F5F3FF_0%,#FFFFFF_70%,#F0F9FF_100%)]",
  },
  {
    id: "gold-investing",
    title: "Smart Gold Investing for Beginners",
    category: "Gold Investing",
    duration: "3:50",
    difficulty: "Beginner",
    views: "6.3k",
    langTag: "Hindi",
    summaryEn: ["Digital gold is safer than physical.", "Sovereign Gold Bonds offer interest + gold appreciation.", "Avoid buying during high festival seasons."],
    summaryHi: ["डिजिटल गोल्ड, फिजिकल से सुरक्षित है।", "सॉवरेन गोल्ड बॉन्ड से ब्याज + सोने की कीमत दोनों मिलते हैं।", "त्योहारों के समय खरीदने से बचें।"],
    stepsEn: ["Open demat account for digital gold.", "Compare making charges for physical.", "Keep investment below 10% of portfolio."],
    stepsHi: ["डिजिटल गोल्ड के लिए डीमैट अकाउंट खोलें।", "फिजिकल गोल्ड के making charges compare करें।", "निवेश पोर्टफोलियो के 10% से कम रखें।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.25)_0%,transparent_55%),linear-gradient(135deg,#FEF3C7_0%,#FFFFFF_70%,#FFFBEB_100%)]",
  },
];

const DEFAULT_SAFETY_TIP = "Enable Two-Factor Authentication (2FA) on your UPI apps and email. It's the strongest shield against account takeovers.";

export default function LearnScreen() {
  const navigate = useNavigate();
  const [mouse, setMouse] = useState({ x: 300, y: 200 });
  const [fbUser, setFbUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [profile, setProfile] = useState({});
  const [menuOpen, setMenuOpen] = useState(false);

  // User learning data
  const [saved, setSaved] = useState(() => readJSON(LS.saved, []));
  const [completed, setCompleted] = useState(() => new Set(readJSON(LS.completed, [])));
  const [learningStats, setLearningStats] = useState({
    totalCompleted: 0,
    totalTimeSpent: 0,
    lastActive: null,
    streak: 0,
  });

  // UI states
  const [summaryLang, setSummaryLang] = useState(() => {
    return localStorage.getItem(LS.learnLang) || "en";
  });
  const [ttsSpeed, setTtsSpeed] = useState(() => {
    const v = Number(localStorage.getItem(LS.ttsSpeed));
    return v && v > 0 ? v : 1.0;
  });
  const [activeCat, setActiveCat] = useState("All Topics");
  const [query, setQuery] = useState("");
  const [openLesson, setOpenLesson] = useState(null);

  // Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFbUser(u || null);
    });
    return () => unsub();
  }, []);

  // Load user data from Firebase
  useEffect(() => {
    if (!fbUser) {
      // Use localStorage for guest users
      setProfile({});
      return;
    }

    const loadUserData = async () => {
      try {
        // Load user document
        const userDocRef = doc(db, "users", fbUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setUserDoc(data);
          setProfile(data.profile || {});
          
          // Load learning data from user subcollection
          const learningRef = doc(collection(userDocRef, "learning"), "progress");
          const learningSnap = await getDoc(learningRef);
          
          if (learningSnap.exists()) {
            const learningData = learningSnap.data();
            
            // Load saved lessons
            if (learningData.savedLessons) {
              setSaved(learningData.savedLessons);
              localStorage.setItem(LS.saved, JSON.stringify(learningData.savedLessons));
            }
            
            // Load completed lessons
            if (learningData.completedLessons) {
              const completedSet = new Set(learningData.completedLessons);
              setCompleted(completedSet);
              localStorage.setItem(LS.completed, JSON.stringify(Array.from(completedSet)));
            }
            
            // Load learning stats
            if (learningData.stats) {
              setLearningStats(learningData.stats);
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, [fbUser]);

  // Persist data to Firebase
  const saveToFirebase = async (key, data) => {
    if (!fbUser) return;

    try {
      const userDocRef = doc(db, "users", fbUser.uid);
      const learningRef = doc(collection(userDocRef, "learning"), "progress");
      
      await setDoc(learningRef, {
        [key]: data,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      console.error("Error saving to Firebase:", error);
    }
  };

  // Save updated learning data
  useEffect(() => {
    if (fbUser && saved.length > 0) {
      saveToFirebase(FB_KEYS.SAVED, saved);
    }
  }, [saved, fbUser]);

  useEffect(() => {
    if (fbUser && completed.size > 0) {
      saveToFirebase(FB_KEYS.COMPLETED, Array.from(completed));
      
      // Update learning stats
      const updatedStats = {
        totalCompleted: completed.size,
        totalTimeSpent: learningStats.totalTimeSpent + 5, // Add 5 minutes for each completed lesson
        lastActive: new Date().toISOString(),
        streak: learningStats.streak + 1, // Simple streak logic
      };
      
      setLearningStats(updatedStats);
      saveToFirebase(FB_KEYS.LEARNING_STATS, updatedStats);
    }
  }, [completed, fbUser]);

  // Persist local storage
  useEffect(() => {
    localStorage.setItem(LS.saved, JSON.stringify(saved));
  }, [saved]);

  useEffect(() => {
    localStorage.setItem(LS.completed, JSON.stringify(Array.from(completed)));
  }, [completed]);

  useEffect(() => {
    localStorage.setItem(LS.ttsSpeed, String(ttsSpeed));
  }, [ttsSpeed]);

  useEffect(() => {
    localStorage.setItem(LS.learnLang, summaryLang);
  }, [summaryLang]);

  const appLang = localStorage.getItem("dhan-saathi-language") || "english";
  const ttsLang = appLang === "hindi" ? "hi-IN" : "en-IN";

  const displayName = fbUser?.displayName || profile?.name || "Guest";
  const email = fbUser?.email || "";
  const initials = useMemo(() => {
    const src = (displayName || email || "U").trim();
    const parts = src.split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (src[0] || "U").toUpperCase();
  }, [displayName, email]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(LESSONS.map((l) => l.category)));
    return ["All Topics", "Scam Safety", "Budgeting", "Savings", "Mutual Funds", "Gold Investing", "UPI & Digital Payments"];
  }, []);

  const lessons = useMemo(() => {
    const q = query.trim().toLowerCase();
    return LESSONS.filter((l) => {
      const matchCat = activeCat === "All Topics" ? true : l.category === activeCat;
      const matchQ =
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        (l.summaryEn || []).join(" ").toLowerCase().includes(q) ||
        (l.summaryHi || []).join(" ").toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [activeCat, query]);

  const featured = useMemo(() => {
    const urgent = lessons.find((l) => l.urgent);
    return urgent || lessons[0] || LESSONS[0];
  }, [lessons]);

  const totalCount = LESSONS.length;
  const doneCount = completed.size;
  const pct = Math.min(100, Math.round((doneCount / Math.max(1, totalCount)) * 100));

  const savedLessons = saved
    .map((id) => LESSONS.find((l) => l.id === id))
    .filter(Boolean);

  const speak = (text) => {
    try {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = ttsLang;
      msg.rate = ttsSpeed;
      window.speechSynthesis.speak(msg);
    } catch {
      // ignore
    }
  };

  const speakLesson = (lesson) => {
    const summary = summaryLang === "hi" ? lesson.summaryHi : lesson.summaryEn;
    const warning = summaryLang === "hi" ? lesson.warningHi : lesson.warningEn;
    const steps = summaryLang === "hi" ? lesson.stepsHi : lesson.stepsEn;

    const parts = [
      lesson.title,
      "Summary:",
      ...(summary || []),
      warning ? `Key warning: ${warning}` : "",
      steps?.length ? `Steps: ${steps.join(". ")}` : "",
    ].filter(Boolean);

    speak(parts.join(". "));
  };

  const toggleSave = async (id) => {
    const newSaved = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id];
    setSaved(newSaved);
    
    if (fbUser) {
      await saveToFirebase(FB_KEYS.SAVED, newSaved);
    }
  };

  const markCompleted = async (id) => {
    const newCompleted = new Set(completed);
    newCompleted.add(id);
    setCompleted(newCompleted);
    
    if (fbUser) {
      await saveToFirebase(FB_KEYS.COMPLETED, Array.from(newCompleted));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/signup", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed");
    }
  };

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
        @keyframes sheen {
          0% { transform: translateX(-50%); opacity: 0; }
          20% { opacity: 0.22; }
          60% { opacity: 0.22; }
          100% { transform: translateX(150%); opacity: 0; }
        }
        @keyframes floaty {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
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
      `}</style>

      <div
        className="min-h-screen relative overflow-hidden bg-[#F4FAF3]"
        onMouseMove={(e) => setMouse({ x: e.clientX, y: e.clientY })}
        style={{
          backgroundImage: `
            radial-gradient(900px circle at ${mouse.x}px ${mouse.y}px, rgba(16,185,129,0.14), transparent 42%),
            radial-gradient(circle at top left, rgba(187,247,208,0.55) 0, transparent 60%),
            radial-gradient(circle at bottom right, rgba(191,219,254,0.45) 0, transparent 60%)
          `,
        }}
      >
        {/* Background blobs */}
        <div className="pointer-events-none absolute -top-48 -left-48 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(34,197,94,0.40)_0%,rgba(16,185,129,0.16)_38%,transparent_70%)] blur-3xl opacity-90 mix-blend-multiply animate-[blobA_18s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute top-[25%] -right-56 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(16,185,129,0.36)_0%,rgba(59,130,246,0.14)_42%,transparent_72%)] blur-3xl opacity-80 mix-blend-multiply animate-[blobB_22s_ease-in-out_infinite]" />

        {/* NAVBAR */}
        <header className="w-full bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-green-600 flex items-center justify-center shadow-md">
                <IndianRupee className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                DhanSaathi
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="flex items-center gap-1.5 hover:text-emerald-700 transition group"
              >
                <Home className="h-4 w-4 group-hover:scale-110 transition-transform" />
                Home
              </button>

              <button
                type="button"
                onClick={() => navigate("/schemes")}
                className="flex items-center gap-1.5 hover:text-emerald-700 transition group"
              >
                <Building2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
                Schemes
              </button>

              <button
                type="button"
                onClick={() => navigate("/community")}
                className="flex items-center gap-1.5 hover:text-emerald-700 transition group"
              >
                <Sparkle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                Community
              </button>

              <button
                type="button"
                className="relative text-emerald-700 font-semibold flex items-center gap-1.5 group"
              >
                <BookOpen className="h-4 w-4 group-hover:scale-110 transition-transform" />
                Learn
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-emerald-600" />
              </button>

              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-emerald-700 transition group"
                onClick={() => navigate("/ask-ai")}
              >
                <MessageSquare className="h-4 w-4 group-hover:scale-110 transition-transform" />
                Help
              </button>
            </nav>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="hidden sm:inline-flex h-10 w-10 rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow-sm items-center justify-center text-gray-700 hover:bg-gray-50 transition hover:-translate-y-0.5"
                title="Notifications"
                onClick={() => alert("Notifications coming soon")}
              >
                <Bell className="h-5 w-5" />
              </button>

              {/* Profile dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-emerald-400 to-green-500 shadow flex items-center justify-center text-white font-semibold hover:shadow-lg transition-shadow"
                >
                  {fbUser?.photoURL ? (
                    <img
                      src={fbUser.photoURL}
                      alt="Profile"
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <span className="text-sm">{initials}</span>
                  )}
                </button>

                {menuOpen && (
                  <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-white/90 backdrop-blur border border-gray-200 shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-4">
                      <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-600 mt-1 break-all">{email || "Guest mode"}</p>
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                          {doneCount} lessons
                        </span>
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {learningStats.streak} day streak
                        </span>
                      </div>
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
                        className="w-full px-4 py-3 text-left text-sm text-emerald-700 hover:bg-emerald-50"
                        onClick={() => navigate("/signup")}
                      >
                        Sign in to save progress
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          {/* Header */}
          <div className="relative overflow-hidden rounded-3xl bg-white/85 backdrop-blur-xl border border-emerald-200 shadow-[0_28px_80px_rgba(15,23,42,0.12)] p-6 sm:p-8 mb-8">
            {/* Sheen overlay */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -inset-y-10 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-xl animate-[sheen_8s_ease-in-out_infinite]" />
            </div>

            <div className="relative flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                  Learn Financial Basics
                </h1>
                <p className="text-gray-600 mt-2 max-w-2xl">
                  Master money management with curated lessons. {fbUser ? "Your progress syncs across devices." : "Sign in to save your progress."}
                </p>
                
                <div className="mt-4 flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <User className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">{displayName}</span>
                  </div>
                  <div className="h-4 w-px bg-gray-300" />
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700">{doneCount}/{totalCount} completed</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    <span className="font-semibold text-gray-900">{doneCount}/{totalCount}</span> completed
                  </span>
                  <div className="h-2 w-36 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-emerald-600 to-green-500 rounded-full transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                
                {fbUser && (
                  <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    🔄 Synced to cloud
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Categories + Search */}
          <div className="mt-6 flex flex-col lg:flex-row lg:items-center gap-3">
            <div className="flex flex-wrap gap-2">
              {categories.slice(0, 6).map((c) => {
                const active = activeCat === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setActiveCat(c)}
                    className={
                      active
                        ? "px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-500 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-shadow"
                        : "px-4 py-2 rounded-full bg-white/75 backdrop-blur border border-gray-200 text-sm text-gray-700 hover:border-emerald-300 hover:text-emerald-700 transition-all hover:-translate-y-0.5"
                    }
                  >
                    {c}
                  </button>
                );
              })}
            </div>

            <div className="flex-1" />

            <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/85 backdrop-blur border border-gray-200 shadow-sm w-full lg:w-[360px] hover:shadow-md transition-shadow">
              <Search className="h-4 w-4 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search lessons..."
                className="bg-transparent outline-none text-sm text-gray-700 flex-1"
              />
            </div>
          </div>

          {/* Main grid */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[2.1fr,1fr]">
            {/* LEFT */}
            <section className="space-y-6">
              {/* FEATURED */}
              <div className="relative overflow-hidden rounded-3xl bg-white/85 backdrop-blur border border-emerald-200 shadow-[0_28px_80px_rgba(15,23,42,0.12)] p-6 sm:p-7 [perspective:1200px]">
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -inset-y-10 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-xl animate-[sheen_8s_ease-in-out_infinite]" />
                </div>

                <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6 transition-transform duration-500 hover:[transform:rotateX(1.2deg)_rotateY(-1.6deg)_translateY(-6px)]">
                  <div className="max-w-2xl">
                    {featured.urgent && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold mb-3">
                        URGENT SAFETY ALERT
                      </span>
                    )}

                    <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 leading-tight">
                      {featured.title}
                    </h2>

                    <p className="text-gray-600 mt-2">
                      {featured.urgent 
                        ? "Scammers are using fake numbers to steal your savings. Learn how to identify them."
                        : "Master this essential financial concept to improve your money management skills."}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setOpenLesson(featured)}
                        className="px-5 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-green-500 text-white font-semibold shadow hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Watch Now
                      </button>

                      <button
                        type="button"
                        onClick={() => speakLesson(featured)}
                        className="px-5 py-3 rounded-full bg-white/70 backdrop-blur border border-gray-200 text-gray-900 font-semibold hover:shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2"
                      >
                        <Volume2 className="h-4 w-4 text-emerald-700" />
                        Listen Summary
                      </button>
                    </div>
                  </div>

                  {/* Shield illustration */}
                  <div className="hidden md:block shrink-0 w-40 h-40 rounded-3xl bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.18)_0%,transparent_55%),linear-gradient(135deg,#E9FFE1_0%,#FFFFFF_55%,#E0FBFF_100%)] border border-gray-200 shadow-sm grid place-items-center animate-[floaty_8s_ease-in-out_infinite]">
                    <ShieldAlert className="h-16 w-16 text-emerald-600" />
                  </div>
                </div>
              </div>

              {/* CARDS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {lessons.slice(0, 6).map((l, index) => {
                  const isSaved = saved.includes(l.id);
                  const isDone = completed.has(l.id);

                  return (
                    <div
                      key={l.id}
                      className="group rounded-3xl bg-white/85 backdrop-blur border border-gray-200 shadow-[0_16px_45px_rgba(15,23,42,0.08)] hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)] transition-all p-4 hover:-translate-y-1 [perspective:900px]"
                      style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both` }}
                    >
                      <div
                        className={`relative h-32 rounded-2xl border border-gray-200 overflow-hidden ${l.thumbStyle}`}
                      >
                        <button
                          type="button"
                          onClick={() => setOpenLesson(l)}
                          className="absolute inset-0 grid place-items-center"
                          aria-label="Watch"
                        >
                          <div className="h-12 w-12 rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow grid place-items-center group-hover:scale-105 transition">
                            <Play className="h-6 w-6 text-emerald-700" />
                          </div>
                        </button>

                        <span className="absolute bottom-2 right-2 text-[11px] font-semibold px-2 py-1 rounded-full bg-black/60 text-white">
                          {l.duration}
                        </span>

                        {isDone && (
                          <span className="absolute top-2 left-2 text-[11px] font-semibold px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Done
                          </span>
                        )}
                      </div>

                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                            {l.category}
                          </span>
                          <span className="text-[11px] font-semibold text-gray-500">
                            {l.difficulty}
                          </span>
                        </div>

                        <h3 className="mt-2 text-sm font-extrabold text-gray-900 leading-snug">
                          {l.title}
                        </h3>

                        <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                          <span className="inline-flex items-center gap-1">
                            <Eye className="h-3.5 w-3.5" /> {l.views}
                          </span>
                          <span className="inline-flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" /> {l.langTag}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setOpenLesson(l)}
                            className="flex-1 px-3 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all hover:-translate-y-0.5"
                          >
                            Watch Now
                          </button>
                          <button
                            type="button"
                            onClick={() => setOpenLesson(l)}
                            className="flex-1 px-3 py-2 rounded-full bg-white/75 backdrop-blur border border-gray-200 text-xs font-semibold text-gray-900 hover:shadow-md transition-all hover:-translate-y-0.5"
                          >
                            AI Summary
                          </button>
                        </div>

                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => speakLesson(l)}
                            className="h-10 w-10 rounded-full bg-white/75 backdrop-blur border border-gray-200 grid place-items-center hover:shadow-md hover:-translate-y-0.5 transition-all"
                            title="Listen"
                          >
                            <Volume2 className="h-4 w-4 text-emerald-700" />
                          </button>

                          <button
                            type="button"
                            onClick={() => toggleSave(l.id)}
                            className="h-10 w-10 rounded-full bg-white/75 backdrop-blur border border-gray-200 grid place-items-center hover:shadow-md hover:-translate-y-0.5 transition-all"
                            title="Save"
                          >
                            <Bookmark
                              className={`h-4 w-4 ${isSaved ? "text-emerald-700" : "text-gray-500"}`}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => markCompleted(l.id)}
                            className="flex-1 px-3 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-all hover:-translate-y-0.5"
                          >
                            Mark completed
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* RIGHT SIDEBAR */}
            <aside className="space-y-5">
              {/* Overall progress ring */}
              <div className="relative overflow-hidden rounded-3xl bg-white/85 backdrop-blur border border-gray-200 shadow-lg p-5">
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -inset-y-10 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent blur-xl animate-[sheen_10s_ease-in-out_infinite]" />
                </div>

                <div className="relative flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Overall Progress</p>
                  <p className="text-sm font-bold text-emerald-700">{pct}%</p>
                </div>

                <div className="relative mt-4 flex items-center justify-center">
                  <div className="relative h-36 w-36">
                    <svg viewBox="0 0 120 120" className="h-full w-full">
                      <circle cx="60" cy="60" r="46" stroke="#E5E7EB" strokeWidth="10" fill="none" />
                      <circle
                        cx="60"
                        cy="60"
                        r="46"
                        stroke="#22C55E"
                        strokeWidth="10"
                        fill="none"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 46}
                        strokeDashoffset={2 * Math.PI * 46 * (1 - pct / 100)}
                        style={{ transition: "stroke-dashoffset 600ms ease" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <p className="text-2xl font-extrabold text-gray-900">
                        {doneCount}/{totalCount}
                      </p>
                      <p className="text-xs text-gray-500 font-semibold">UNITS DONE</p>
                    </div>
                  </div>
                </div>

                <div className="relative mt-4 rounded-2xl bg-emerald-50/80 backdrop-blur border border-emerald-200 p-4">
                  <p className="text-xs font-semibold text-emerald-900">
                    Complete {Math.max(0, 2 - doneCount)} more lessons to unlock:
                  </p>
                  <p className="text-sm font-bold text-emerald-800 mt-1">
                    {doneCount < 2 ? "Gold Saver badge" : "🎉 Next badge unlocked!"}
                  </p>
                </div>
              </div>

              {/* Saved for later */}
              <div className="relative overflow-hidden rounded-3xl bg-white/85 backdrop-blur border border-gray-200 shadow-lg p-5">
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -inset-y-10 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent blur-xl animate-[sheen_12s_ease-in-out_infinite]" />
                </div>

                <div className="relative flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-gray-900">Saved for later</p>
                  <button
                    type="button"
                    className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                    onClick={() => setActiveCat("All Topics")}
                  >
                    View All
                  </button>
                </div>

                {savedLessons.length === 0 ? (
                  <p className="text-sm text-gray-600">
                    Save lessons to watch later.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {savedLessons.slice(0, 3).map((l, index) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setOpenLesson(l)}
                        className="w-full text-left flex items-center gap-3 p-3 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-gray-50 transition-all hover:-translate-y-0.5"
                        style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both` }}
                      >
                        <div className={`h-12 w-14 rounded-xl border border-gray-200 ${l.thumbStyle}`} />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {l.title}
                          </p>
                          <p className="text-xs text-gray-500">
                            {l.duration} • {l.difficulty}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Safety Tip */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50/80 to-amber-100/50 backdrop-blur border border-amber-200 p-5">
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -inset-y-10 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-amber-100/30 to-transparent blur-xl animate-[sheen_14s_ease-in-out_infinite]" />
                </div>

                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wide">
                      Safety Tip of the Day
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mt-2">
                      {DEFAULT_SAFETY_TIP}
                    </p>
                  </div>
                  <div className="h-10 w-10 rounded-2xl bg-amber-100 border border-amber-300 grid place-items-center">
                    <ShieldAlert className="h-5 w-5 text-amber-600" />
                  </div>
                </div>

                <div className="relative mt-4 flex items-center gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full bg-white/70 backdrop-blur border border-gray-200 text-xs font-semibold text-gray-800 hover:shadow-md transition-all hover:-translate-y-0.5"
                    onClick={() => speak(DEFAULT_SAFETY_TIP)}
                  >
                    <Volume2 className="h-4 w-4 inline mr-2 text-emerald-700" />
                    Listen
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded-full bg-amber-100 border border-amber-300 text-xs font-semibold text-amber-800 hover:bg-amber-200 transition-all hover:-translate-y-0.5"
                    onClick={() => alert("Thanks! (demo)")}
                  >
                    Helpful
                  </button>
                </div>
              </div>
            </aside>
          </div>
        </main>

        {/* AI SUMMARY RIGHT DRAWER */}
        {openLesson && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm">
            <button
              type="button"
              className="absolute inset-0 w-full h-full cursor-default"
              onClick={() => setOpenLesson(null)}
              aria-label="Close"
            />

            <div className="absolute right-0 top-0 h-full w-full sm:w-[520px] bg-white/90 backdrop-blur-2xl border-l border-gray-200 shadow-2xl overflow-y-auto">
              <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-emerald-700">
                    AI SUMMARY TOOL
                  </p>
                  <h3 className="text-2xl font-extrabold text-gray-900 mt-2">
                    {openLesson.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setOpenLesson(null)}
                  className="h-10 w-10 rounded-full bg-white border border-gray-200 grid place-items-center hover:bg-gray-50 transition-all hover:-translate-y-0.5"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Top controls */}
              <div className="px-5 sm:px-6 pb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 bg-white/70 border border-gray-200 rounded-full p-1">
                  <button
                    type="button"
                    onClick={() => setSummaryLang("en")}
                    className={
                      summaryLang === "en"
                        ? "px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-green-500 text-white text-xs font-semibold"
                        : "px-3 py-1 rounded-full text-xs font-semibold text-gray-700 hover:text-emerald-700"
                    }
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setSummaryLang("hi")}
                    className={
                      summaryLang === "hi"
                        ? "px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-green-500 text-white text-xs font-semibold"
                        : "px-3 py-1 rounded-full text-xs font-semibold text-gray-700 hover:text-emerald-700"
                    }
                  >
                    Hindi
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Speed</span>
                  <select
                    value={ttsSpeed}
                    onChange={(e) => setTtsSpeed(Number(e.target.value))}
                    className="text-xs bg-white border border-gray-200 rounded-xl px-2 py-1 outline-none"
                  >
                    <option value={0.85}>Slow</option>
                    <option value={1.0}>Normal</option>
                    <option value={1.15}>Fast</option>
                  </select>
                </div>
              </div>

              <div className="px-5 sm:px-6 pb-6 space-y-5">
                <button
                  type="button"
                  onClick={() => speakLesson(openLesson)}
                  className="w-full px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold flex items-center justify-between hover:bg-emerald-100 transition-all hover:-translate-y-0.5"
                >
                  <span className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-emerald-700" />
                    Listen to Summary
                  </span>
                  <span className="text-xs text-emerald-700">
                    {openLesson.duration} audio
                  </span>
                </button>

                <div className="rounded-2xl bg-white/70 border border-gray-200 p-4">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                    Summary in simple words
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-gray-800">
                    {(summaryLang === "hi" ? openLesson.summaryHi : openLesson.summaryEn)?.map(
                      (x, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
                          <span>{x}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {(summaryLang === "hi" ? openLesson.warningHi : openLesson.warningEn) && (
                  <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-4">
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                      Key Warning
                    </p>
                    <p className="mt-2 text-sm text-amber-900/90">
                      {summaryLang === "hi" ? openLesson.warningHi : openLesson.warningEn}
                    </p>
                  </div>
                )}

                <div className="rounded-2xl bg-white/70 border border-gray-200 p-4">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Steps to follow
                  </p>
                  <ol className="mt-3 space-y-2 text-sm text-gray-800">
                    {(summaryLang === "hi" ? openLesson.stepsHi : openLesson.stepsEn)?.map(
                      (s, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="h-6 w-6 rounded-full bg-gray-100 border border-gray-200 grid place-items-center text-xs font-bold text-gray-700">
                            {i + 1}
                          </span>
                          <span className="mt-0.5">{s}</span>
                        </li>
                      )
                    )}
                  </ol>
                </div>

                <button
                  type="button"
                  onClick={() => markCompleted(openLesson.id)}
                  className="w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 text-white font-extrabold shadow hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  ✓ Mark Completed
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => toggleSave(openLesson.id)}
                    className="px-4 py-3 rounded-2xl bg-white/70 backdrop-blur border border-gray-200 text-gray-900 font-semibold hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Bookmark className="h-4 w-4 text-emerald-700" />
                    Save for later
                  </button>

                  <button
                    type="button"
                    onClick={() => alert("Share (demo)")}
                    className="px-4 py-3 rounded-2xl bg-white/70 backdrop-blur border border-gray-200 text-gray-900 font-semibold hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Share2 className="h-4 w-4 text-emerald-700" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}