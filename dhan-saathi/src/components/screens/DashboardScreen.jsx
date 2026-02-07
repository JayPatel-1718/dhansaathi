// src/components/screens/DashboardScreen.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  addDoc,
  setDoc,
  serverTimestamp,
  increment,
  getDoc,
} from "firebase/firestore";

import {
  Home,
  Building2,
  Sparkle,
  BookOpen,
  MessageSquare,
  IndianRupee,
  LogOut,
  Bell,
  BarChart3,
  ShieldCheck,
  UserCog,
  Lightbulb,
  Volume2,
  Users,
  Calendar,
  Globe,
  CheckCircle2,
  Award,
  Clock,
  Play,
  Star,
  ChevronRight,
  Menu,
  X,
  ChevronLeft,
  HelpCircle,
  Settings,
} from "lucide-react";

// Bilingual content
const DASHBOARD_TEXT = {
  hindi: {
    appName: "धनसाथी",
    home: "होम",
    schemes: "सरकारी योजनाएं",
    community: "समुदाय",
    learn: "सीखें",
    help: "सहायता",
    notifications: "सूचनाएं",
    logout: "लॉग आउट",
    signin: "साइन इन",
    namaste: "नमस्ते",
    welcome: "आपके डैशबोर्ड में स्वागत है",
    firstTime:
      "नए उपयोगकर्ता 0 से शुरू करते हैं। आपके डैशबोर्ड में गतिविधि बढ़ने के साथ विकसित होता है।",
    features: [
      { title: "योजनाएं", subtitle: "सरकारी लाभ और सब्सिडी", icon: Building2 },
      {
        title: "स्कैम जांचें",
        subtitle: "संदिग्ध संदेशों की जाँच करें",
        icon: ShieldCheck,
      },
      { title: "ट्रैकर", subtitle: "दैनिक खर्च मॉनिटर", icon: BarChart3 },
      {
        title: "AI से पूछें",
        subtitle: "वित्तीय वॉयस सहायक",
        icon: MessageSquare,
      },
      {
        title: "सीखें",
        subtitle: "वित्तीय साक्षरता पाठ्यक्रम",
        icon: BookOpen,
      },
      {
        title: "दस्तावेज़ सहायता",
        subtitle: "फॉर्म भरने में मदद",
        icon: Lightbulb,
      },
      {
        title: "सुरक्षा",
        subtitle: "सुरक्षित दस्तावेज़ वॉल्ट",
        icon: ShieldCheck,
      },
      {
        title: "प्रोफाइल",
        subtitle: "खाता सेटिंग्स प्रबंधित करें",
        icon: UserCog,
      },
    ],
    recentSchemes: "हाल की योजनाएं",
    explore: "अन्वेषण करें →",
    noSchemes: "अभी तक कोई योजना नहीं देखी गई। शुरू करने के लिए",
    schemesLink: "योजनाएं",
    open: "खोलें",
    communityInsights: "समुदाय जानकारी",
    communityDesc:
      "अपनी गतिविधि के आधार पर जानकारी देखने के लिए योजनाओं का अन्वेषण शुरू करें।",
    goToCommunity: "समुदाय पर जाएं →",
    todaysTip: "आज का टिप",
    tipText:
      "प्रतिदिन सिर्फ ₹50 बचाने से समय के साथ आपातकालीन कोष बनाने में मदद मिल सकती है।",
    listenTip: "टिप सुनें",
    reminders: "रिमाइंडर्स",
    noReminders: "अभी तक कोई रिमाइंडर नहीं है।",
    addReminder: "रिमाइंडर जोड़ें →",
    learningProgress: "आपकी सीखने की प्रगति",
    lessonsCompleted: "सबक पूर्ण",
    pointsEarned: "पॉइंट अर्जित",
    continueLearning: "सीखना जारी रखें →",
    startLearning: "सीखना शुरू करें →",
    voiceAssistant: "वॉयस सहायक",
    profile: "प्रोफाइल",
    settings: "सेटिंग्स",
    collapseSidebar: "साइडबार छोटा करें",
  },
  english: {
    appName: "DhanSaathi",
    home: "Home",
    schemes: "Schemes",
    community: "Community",
    learn: "Learn",
    help: "Help",
    notifications: "Notifications",
    logout: "Logout",
    signin: "Sign in",
    namaste: "Namaste",
    welcome: "Welcome to your dashboard",
    firstTime:
      "First-time users start at 0. Your dashboard grows as you explore.",
    features: [
      { title: "Schemes", subtitle: "Govt Benefits & Subsidies", icon: Building2 },
      {
        title: "Verify Scam",
        subtitle: "Check suspicious messages",
        icon: ShieldCheck,
      },
      { title: "Tracker", subtitle: "Daily Expense Monitor", icon: BarChart3 },
      {
        title: "Ask AI",
        subtitle: "Financial Voice Assistant",
        icon: MessageSquare,
      },
      {
        title: "Learn",
        subtitle: "Financial Literacy Courses",
        icon: BookOpen,
      },
      {
        title: "Document Help",
        subtitle: "Form guidance & walkthrough",
        icon: Lightbulb,
      },
      {
        title: "Profile",
        subtitle: "Manage Account Settings",
        icon: UserCog,
      },
    ],
    recentSchemes: "Recent Schemes",
    explore: "Explore →",
    noSchemes: "No schemes viewed yet. Open",
    schemesLink: "Schemes",
    open: "to start.",
    communityInsights: "Community Insights",
    communityDesc:
      "Start exploring schemes to see insights based on your activity.",
    goToCommunity: "Go to Community →",
    todaysTip: "Today's Tip",
    tipText:
      "Saving just ₹50 a day can help you build an emergency fund over time.",
    listenTip: "Listen to Tip",
    reminders: "Reminders",
    noReminders: "No reminders yet.",
    addReminder: "Add a reminder →",
    learningProgress: "Your Learning Progress",
    lessonsCompleted: "Lessons Completed",
    pointsEarned: "Points Earned",
    continueLearning: "Continue Learning →",
    startLearning: "Start Learning →",
    voiceAssistant: "Voice assistant",
    profile: "Profile",
    settings: "Settings",
    collapseSidebar: "Collapse sidebar",
  },
};

const DashboardScreen = () => {
  const navigate = useNavigate();

  const userLanguage =
    localStorage.getItem("dhan-saathi-language") || "english";
  const [language, setLanguage] = useState(userLanguage);
  const t = DASHBOARD_TEXT[language];

  // navigation helpers (unchanged)
  const goHome = () => navigate("/home");
  const goToSchemes = () => navigate("/schemes");
  const goToCommunity = () => navigate("/community");
  const goToVerify = () => navigate("/verify-scheme");
  const goToDocumentHelp = () => navigate("/document-help");
  const goToLearn = () => navigate("/learn");

  // ── state (all unchanged) ──
  const [fbUser, setFbUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [recentSchemes, setRecentSchemes] = useState([]);
  const [reminders, setReminders] = useState([]);
  const [learningStats, setLearningStats] = useState({
    completedLessons: 0,
    totalLessons: 6,
    points: 0,
    badges: [],
    moduleProgress: {},
  });

  // sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // profile dropdown
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // reactive bg
  const [mouse, setMouse] = useState({ x: 280, y: 180 });

  // ── 1) auth state (unchanged) ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setFbUser(u || null));
    return () => unsub();
  }, []);

  // ── 2) user doc (unchanged) ──
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

  // ── 3) recent schemes (unchanged) ──
  useEffect(() => {
    if (!fbUser) {
      setRecentSchemes([]);
      return;
    }
    const qy = query(
      collection(db, "users", fbUser.uid, "recentSchemes"),
      orderBy("lastViewedAt", "desc"),
      limit(3)
    );
    const unsub = onSnapshot(
      qy,
      (snap) => setRecentSchemes(snap.docs.map((d) => d.data())),
      (err) => {
        console.error("Firestore recentSchemes error:", err);
        setRecentSchemes([]);
      }
    );
    return () => unsub();
  }, [fbUser]);

  // ── 4) reminders (unchanged) ──
  useEffect(() => {
    if (!fbUser) {
      setReminders([]);
      return;
    }
    const qy = query(
      collection(db, "users", fbUser.uid, "reminders"),
      orderBy("createdAt", "desc"),
      limit(3)
    );
    const unsub = onSnapshot(
      qy,
      (snap) =>
        setReminders(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => {
        console.error("Firestore reminders error:", err);
        setReminders([]);
      }
    );
    return () => unsub();
  }, [fbUser]);

  // ── 5) learning data (unchanged) ──
  useEffect(() => {
    const loadLearningData = async () => {
      if (!fbUser) {
        const completed =
          localStorage.getItem("dhan-saathi-completed-lessons") || "[]";
        const badges = localStorage.getItem("dhan-saathi-badges") || "[]";
        const points = localStorage.getItem("dhan-saathi-points") || "0";
        try {
          const completedArray = JSON.parse(completed);
          setLearningStats({
            completedLessons: completedArray.length,
            totalLessons: 6,
            points: parseInt(points) || 0,
            badges: JSON.parse(badges) || [],
            moduleProgress: JSON.parse(
              localStorage.getItem("dhan-saathi-module-progress") || "{}"
            ),
          });
        } catch (error) {
          console.error("Error parsing localStorage data:", error);
        }
        return;
      }
      try {
        const userDocRef = doc(db, "users", fbUser.uid);
        const learningRef = doc(collection(userDocRef, "learning"), "progress");
        const learningSnap = await getDoc(learningRef);
        if (learningSnap.exists()) {
          const d = learningSnap.data();
          setLearningStats({
            completedLessons: (d.completedLessons || []).length,
            totalLessons: 6,
            points: d.points || 0,
            badges: d.badges || [],
            moduleProgress: d.moduleProgress || {},
          });
        }
      } catch (error) {
        console.error("Error loading learning data:", error);
      }
    };
    loadLearningData();
  }, [fbUser]);

  // ── close dropdown on outside click (unchanged) ──
  useEffect(() => {
    const onDown = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // ── close mobile sidebar on resize ──
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ── displayName (unchanged) ──
  const displayName = useMemo(() => {
    if (fbUser?.displayName) return fbUser.displayName;
    if (fbUser?.email) {
      const emailName = fbUser.email.split("@")[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return language === "hindi" ? "अतिथि" : "Guest";
  }, [fbUser, language]);

  const email = fbUser?.email || "";

  const initials = useMemo(() => {
    const src = (displayName || email || "U").trim();
    const parts = src.split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (src[0] || "U").toUpperCase();
  }, [displayName, email]);

  const stats = userDoc?.stats || { schemesViewed: 0, schemesListened: 0 };

  // ── speakTip (unchanged) ──
  const speakTip = () => {
    try {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(
        language === "hindi"
          ? "प्रतिदिन सिर्फ पचास रुपये बचाने से समय के साथ मजबूत आपातकालीन कोष बनाने में मदद मिल सकती है।"
          : "Saving just fifty rupees daily can help build a strong emergency fund over time."
      );
      msg.lang = language === "hindi" ? "hi-IN" : "en-IN";
      window.speechSynthesis.speak(msg);
    } catch {}
  };

  // ── handleLogout (unchanged) ──
  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await signOut(auth);
      navigate("/signup", { replace: true });
    } catch (e) {
      console.error(e);
      alert(language === "hindi" ? "लॉगआउट विफल हुआ" : "Logout failed");
    }
  };

  // ── toggleLanguage (unchanged) ──
  const toggleLanguage = () => {
    const newLang = language === "hindi" ? "english" : "hindi";
    setLanguage(newLang);
    localStorage.setItem("dhan-saathi-language", newLang);
  };

  // ── logEvent (unchanged) ──
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

  // ── trackOpenRecentScheme (unchanged) ──
  const trackOpenRecentScheme = async (scheme) => {
    if (!fbUser?.uid || !scheme?.schemeId) return;
    try {
      await setDoc(
        doc(db, "users", fbUser.uid),
        {
          "stats.schemesViewed": increment(1),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      await setDoc(
        doc(db, "users", fbUser.uid, "recentSchemes", scheme.schemeId),
        {
          schemeId: scheme.schemeId,
          title: scheme.title,
          tag: scheme.tag,
          type: scheme.type,
          lastViewedAt: serverTimestamp(),
        },
        { merge: true }
      );
      await logEvent("scheme_view_from_dashboard", {
        schemeId: scheme.schemeId,
        title: scheme.title,
      });
    } catch (e) {
      console.error("trackOpenRecentScheme error:", e);
    }
  };

  const openSchemeFromDashboard = async (scheme) => {
    await trackOpenRecentScheme(scheme);
    navigate(`/schemes/${scheme.schemeId}`);
  };

  // ── features (unchanged) ──
  const features = t.features.map((f, index) => {
    const onClickMap = [
      goToSchemes,
      goToVerify,
      () => navigate("/tracker"),
      () => navigate("/ask-ai"),
      goToLearn,
      goToDocumentHelp,
      () => navigate("/profile"),
    ];
    return { ...f, icon: f.icon, onClick: onClickMap[index] };
  });

  const learningProgressPercentage = Math.min(
    100,
    Math.round(
      (learningStats.completedLessons /
        Math.max(1, learningStats.totalLessons)) *
        100
    )
  );
  const remainingLessons =
    learningStats.totalLessons - learningStats.completedLessons;

  // ── Sidebar nav items ──
  const sidebarNavItems = [
    { label: t.home, icon: Home, onClick: goHome, active: true },
    { label: t.schemes, icon: Building2, onClick: goToSchemes },
    { label: t.community, icon: Sparkle, onClick: goToCommunity },
    { label: t.learn, icon: BookOpen, onClick: goToLearn },
    { label: t.help, icon: HelpCircle, onClick: () => navigate("/help") },
  ];

  const sidebarBottomItems = [
    {
      label: t.profile || "Profile",
      icon: UserCog,
      onClick: () => navigate("/profile"),
    },
    {
      label: language === "hindi" ? "भाषा बदलें" : "Language",
      icon: Globe,
      onClick: toggleLanguage,
    },
  ];

  // ── Sidebar component ──
  const SidebarContent = ({ collapsed = false, onClose = null }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={`flex items-center ${
          collapsed ? "justify-center" : "justify-between"
        } px-4 py-5 border-b border-gray-100`}
      >
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={goHome}
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-green-200/50 flex-shrink-0">
            <IndianRupee className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold tracking-tight text-gray-900">
              {t.appName}
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* User card */}
      <div
        className={`mx-3 mt-4 mb-2 ${
          collapsed ? "px-1" : "px-3"
        } py-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100`}
      >
        <div
          className={`flex ${
            collapsed ? "justify-center" : "items-center gap-3"
          }`}
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow flex-shrink-0">
            {fbUser?.photoURL ? (
              <img
                src={fbUser.photoURL}
                alt=""
                className="h-full w-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              initials
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-gray-500 truncate">{email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <p
          className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest ${
            collapsed ? "text-center" : "px-3"
          } mb-2`}
        >
          {collapsed ? "—" : language === "hindi" ? "मुख्य मेनू" : "Main Menu"}
        </p>

        {sidebarNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => {
                item.onClick();
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center ${
                collapsed ? "justify-center" : ""
              } gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                item.active
                  ? "bg-emerald-100 text-emerald-800 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`h-5 w-5 flex-shrink-0 ${
                  item.active
                    ? "text-emerald-600"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.active && (
                <div className="ml-auto h-2 w-2 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}

        <div className="my-4 border-t border-gray-100" />

        <p
          className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest ${
            collapsed ? "text-center" : "px-3"
          } mb-2`}
        >
          {collapsed
            ? "—"
            : language === "hindi"
            ? "अन्य"
            : "Others"}
        </p>

        {sidebarBottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => {
                item.onClick();
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center ${
                collapsed ? "justify-center" : ""
              } gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all group`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-600" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-2 border-t border-gray-100 pt-3">
        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className={`hidden lg:flex w-full items-center ${
            collapsed ? "justify-center" : ""
          } gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all`}
          title={t.collapseSidebar}
        >
          <ChevronLeft
            className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
          {!collapsed && (
            <span>
              {language === "hindi" ? "छोटा करें" : "Collapse"}
            </span>
          )}
        </button>

        {/* Logout */}
        {fbUser ? (
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              collapsed ? "justify-center" : ""
            } gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all`}
            title={collapsed ? t.logout : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{t.logout}</span>}
          </button>
        ) : (
          <button
            onClick={() => navigate("/signup")}
            className={`w-full flex items-center ${
              collapsed ? "justify-center" : ""
            } gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-green-700 hover:bg-green-50 transition-all`}
            title={collapsed ? t.signin : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0 rotate-180" />
            {!collapsed && <span>{t.signin}</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <style>{`
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
        /* micPulse removed */
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }
      `}</style>

      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* ═══ MOBILE SIDEBAR OVERLAY ═══ */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ═══ MOBILE SIDEBAR ═══ */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent onClose={() => setMobileSidebarOpen(false)} />
        </aside>

        {/* ═══ DESKTOP SIDEBAR ═══ */}
        <aside
          className={`hidden lg:flex flex-col flex-shrink-0 bg-white border-r border-gray-100 transition-all duration-300 ease-in-out ${
            sidebarOpen ? "w-64" : "w-20"
          }`}
        >
          <SidebarContent collapsed={!sidebarOpen} />
        </aside>

        {/* ═══ MAIN AREA ═══ */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* ═══ TOP BAR ═══ */}
          <header className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-20">
            <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
              {/* Left: hamburger + page title */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden h-10 w-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                    {t.home}
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {language === "hindi"
                      ? "आपका वित्तीय डैशबोर्ड"
                      : "Your financial dashboard"}
                  </p>
                </div>
              </div>

              {/* Right: lang + notification + profile */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 transition hover:-translate-y-0.5"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {language === "hindi" ? "हिंदी" : "English"}
                  </span>
                  <span className="text-xs text-gray-500">⇄</span>
                </button>

                <button
                  type="button"
                  className="h-10 w-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition relative"
                  onClick={() =>
                    alert(
                      language === "hindi"
                        ? "जल्द ही आ रहा है"
                        : "Notifications coming soon"
                    )
                  }
                >
                  <Bell className="h-5 w-5" />
                  <div className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
                </button>

                {/* Profile mini-dropdown */}
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-emerald-500 shadow flex items-center justify-center text-white font-semibold"
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
                    className={`absolute right-0 mt-3 w-72 rounded-2xl bg-white/95 backdrop-blur border border-gray-200 shadow-xl overflow-hidden origin-top-right transition-all duration-200 ${
                      menuOpen
                        ? "opacity-100 scale-100 translate-y-0"
                        : "pointer-events-none opacity-0 scale-95 -translate-y-2"
                    }`}
                  >
                    <div className="px-4 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 break-all">
                        {email ||
                          (language === "hindi"
                            ? "साइन इन नहीं"
                            : "Not signed in")}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            userDoc?.profileComplete
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {userDoc?.profileComplete
                            ? language === "hindi"
                              ? "प्रोफाइल पूर्ण"
                              : "Profile Complete"
                            : language === "hindi"
                            ? "प्रोफाइल अधूरी"
                            : "Profile Incomplete"}
                        </span>
                      </div>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <UserCog className="h-4 w-4 text-gray-400" />
                      {language === "hindi" ? "प्रोफाइल देखें" : "View Profile"}
                    </button>
                    <div className="h-px bg-gray-100" />
                    {fbUser ? (
                      <button
                        className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        {t.logout}
                      </button>
                    ) : (
                      <button
                        className="w-full px-4 py-3 text-left text-sm text-green-700 hover:bg-green-50"
                        onClick={() => navigate("/signup")}
                      >
                        {t.signin}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* ═══ SCROLLABLE CONTENT ═══ */}
          <main
            className="flex-1 overflow-y-auto"
            onMouseMove={(e) => setMouse({ x: e.clientX, y: e.clientY })}
          >
            <div
              className="min-h-full relative"
              style={{
                backgroundImage: `
                  radial-gradient(800px circle at ${mouse.x}px ${mouse.y}px, rgba(16,185,129,0.08), transparent 42%),
                  radial-gradient(circle at top left, rgba(187,247,208,0.35) 0, transparent 55%),
                  radial-gradient(circle at bottom right, rgba(191,219,254,0.3) 0, transparent 55%)
                `,
              }}
            >
              {/* Blobs */}
              <div className="pointer-events-none absolute -top-48 -left-48 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(34,197,94,0.25)_0%,rgba(16,185,129,0.08)_38%,transparent_70%)] blur-3xl opacity-90 mix-blend-multiply animate-[blobA_18s_ease-in-out_infinite]" />
              <div className="pointer-events-none absolute top-[25%] -right-56 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(16,185,129,0.20)_0%,rgba(59,130,246,0.08)_42%,transparent_72%)] blur-3xl opacity-80 mix-blend-multiply animate-[blobB_22s_ease-in-out_infinite]" />

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
                <div className="grid gap-6 lg:grid-cols-[2.1fr,1fr]">
                  {/* ═══ LEFT COLUMN (all content unchanged) ═══ */}
                  <section className="space-y-6 lg:space-y-8">
                    {/* Greeting */}
                    <div className="relative overflow-hidden rounded-3xl bg-white/85 backdrop-blur-xl border border-gray-200 shadow-[0_28px_80px_rgba(15,23,42,0.12)] p-6 sm:p-8">
                      <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -inset-y-10 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-xl animate-[sheen_8s_ease-in-out_infinite]" />
                      </div>
                      <div className="relative space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                            <span className="text-lg font-bold text-green-700">
                              {displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-600">
                              {t.namaste}
                            </p>
                            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-700 to-emerald-600 bg-clip-text text-transparent">
                              {displayName}
                            </h1>
                          </div>
                        </div>
                        <div>
                          <h2 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight">
                            {t.welcome}
                          </h2>
                          <p className="text-lg text-gray-600 mt-3 max-w-2xl">
                            {t.firstTime}
                          </p>
                        </div>
                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {t.learningProgress}
                            </span>
                            <span className="text-sm font-bold text-green-700">
                              {learningProgressPercentage}%
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                              style={{
                                width: `${learningProgressPercentage}%`,
                              }}
                            />
                          </div>
                          <div className="mt-2 flex items-center justify-between text-xs text-gray-600">
                            <span>
                              {t.lessonsCompleted}:{" "}
                              {learningStats.completedLessons}/
                              {learningStats.totalLessons}
                            </span>
                            <span>
                              {t.pointsEarned}: {learningStats.points}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 [perspective:1100px]">
                      {features.map((f) => {
                        const Icon = f.icon;
                        return (
                          <button
                            key={f.title}
                            type="button"
                            onClick={f.onClick}
                            className="group text-left rounded-2xl bg-white/85 backdrop-blur border border-gray-200 shadow-[0_16px_45px_rgba(15,23,42,0.08)] hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)] transition-all p-6 hover:-translate-y-1 hover:[transform:rotateX(1.1deg)_rotateY(-1.2deg)_translateY(-6px)]"
                          >
                            <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                              <Icon className="h-6 w-6 text-green-600" />
                            </div>
                            <h3 className="text-base font-semibold text-gray-900">
                              {f.title}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              {f.subtitle}
                            </p>
                          </button>
                        );
                      })}
                    </div>

                    {/* Recent Schemes */}
                    <div className="rounded-3xl bg-white/85 backdrop-blur border border-gray-200 shadow-lg p-6 hover:shadow-xl transition-all">
                      <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {t.recentSchemes}
                        </h2>
                        <button
                          type="button"
                          onClick={goToSchemes}
                          className="text-sm font-medium text-green-700 hover:text-green-800"
                        >
                          {t.explore}
                        </button>
                      </div>
                      {recentSchemes.length === 0 ? (
                        <p className="text-gray-600">
                          {t.noSchemes}{" "}
                          <span className="font-semibold">
                            {t.schemesLink}
                          </span>{" "}
                          {t.open}
                        </p>
                      ) : (
                        <div className="space-y-3 mt-4">
                          {recentSchemes.map((s) => (
                            <button
                              key={s.schemeId}
                              type="button"
                              onClick={() => openSchemeFromDashboard(s)}
                              className="w-full flex items-center justify-between p-4 bg-gray-50/90 rounded-2xl border border-gray-100 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md text-left"
                            >
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {s.title}
                                </p>
                                <p className="text-xs text-gray-600 mt-1">
                                  {s.tag} • {s.type}
                                </p>
                              </div>
                              <span className="text-gray-400 text-lg leading-none">
                                ›
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Community Insights */}
                    <div className="rounded-3xl bg-white/85 backdrop-blur border border-gray-200 shadow-lg p-6 hover:shadow-xl transition-all">
                      <h2 className="text-lg font-semibold text-gray-900 mb-3">
                        {t.communityInsights}
                      </h2>
                      <div className="flex items-start gap-4">
                        <div
                          className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center"
                          style={{ animation: "float 3s ease-in-out infinite" }}
                        >
                          <Users className="h-6 w-6 text-green-700" />
                        </div>
                        <div>
                          <p className="text-gray-800">{t.communityDesc}</p>
                          <button
                            type="button"
                            onClick={goToCommunity}
                            className="mt-2 text-sm font-medium text-green-700 hover:text-green-800"
                          >
                            {t.goToCommunity}
                          </button>
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* ═══ RIGHT COLUMN (all content unchanged) ═══ */}
                  <section className="space-y-6 lg:space-y-8">
                    {/* Today's Tip */}
                    <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-gray-200 shadow-xl p-6 hover:shadow-2xl transition-all">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">
                          {t.todaysTip}
                        </h2>
                        <Lightbulb className="h-7 w-7 text-amber-500" />
                      </div>
                      <p className="text-gray-700">{t.tipText}</p>
                      <button
                        type="button"
                        onClick={speakTip}
                        className="mt-4 text-sm font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 hover:-translate-y-0.5 transition"
                      >
                        <Volume2 className="h-4 w-4" /> {t.listenTip}
                      </button>
                    </div>

                    {/* Reminders */}
                    <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-gray-200 shadow-xl p-6 hover:shadow-2xl transition-all">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        {t.reminders}
                      </h2>
                      {reminders.length === 0 ? (
                        <div className="text-gray-600">
                          <p>{t.noReminders}</p>
                          <button
                            type="button"
                            onClick={() =>
                              alert(
                                language === "hindi"
                                  ? "जल्द ही आ रहा है"
                                  : "Add Reminder coming soon"
                              )
                            }
                            className="mt-3 text-sm font-medium text-green-700 hover:text-green-800"
                          >
                            {t.addReminder}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {reminders.map((r) => (
                            <div
                              key={r.id}
                              className="flex items-center justify-between p-4 bg-blue-50/80 rounded-2xl border border-blue-100 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md"
                            >
                              <div className="flex items-center gap-3">
                                <Calendar className="h-6 w-6 text-blue-600" />
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {r.title || t.reminders}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {r.note || "—"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Learning Progress */}
                    <div className="rounded-3xl bg-gradient-to-br from-emerald-50/80 to-green-50/50 backdrop-blur-xl border border-emerald-200 shadow-xl p-6 hover:shadow-2xl transition-all">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">
                        {t.learningProgress}
                      </h2>
                      <div className="flex items-center gap-4">
                        <div className="relative h-20 w-20">
                          <div className="absolute inset-0 rounded-full border-[6px] border-emerald-100" />
                          <div
                            className="absolute inset-0 rounded-full border-[6px] border-transparent"
                            style={{
                              borderTopColor: "#10B981",
                              borderRightColor: "#10B981",
                              transform: `rotate(${Math.min(
                                360,
                                (learningProgressPercentage / 100) * 360
                              )}deg)`,
                              borderRadius: "9999px",
                              transition: "transform 500ms ease",
                            }}
                          />
                          <div className="absolute inset-[10px] rounded-full bg-white flex items-center justify-center shadow-inner">
                            <span className="text-sm font-semibold text-emerald-700">
                              {learningProgressPercentage}%
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                {t.lessonsCompleted}
                              </span>
                              <span className="text-sm font-bold text-emerald-700">
                                {learningStats.completedLessons}/
                                {learningStats.totalLessons}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                {t.pointsEarned}
                              </span>
                              <span className="text-sm font-bold text-amber-600 flex items-center gap-1">
                                <Star className="h-4 w-4" />
                                {learningStats.points}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">
                                {language === "hindi"
                                  ? "शेष सबक"
                                  : "Remaining Lessons"}
                              </span>
                              <span className="text-sm font-bold text-gray-900">
                                {remainingLessons}
                              </span>
                            </div>
                          </div>
                          {remainingLessons > 0 ? (
                            <button
                              type="button"
                              onClick={goToLearn}
                              className="mt-4 w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white text-sm font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                            >
                              <Play className="h-4 w-4" />
                              {learningStats.completedLessons > 0
                                ? t.continueLearning
                                : t.startLearning}
                            </button>
                          ) : (
                            <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 flex items-center gap-3">
                              <Award className="h-6 w-6 text-amber-600" />
                              <div>
                                <p className="text-sm font-bold text-amber-800">
                                  {language === "hindi"
                                    ? "बधाई! सभी सबक पूरे!"
                                    : "Congratulations! All done!"}
                                </p>
                                <p className="text-xs text-amber-700">
                                  {language === "hindi"
                                    ? "बैज देखने के लिए सीखें पर जाएं।"
                                    : "Go to Learn to view badges."}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      {learningStats.badges.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-emerald-200">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">
                              {language === "hindi"
                                ? "अर्जित बैज"
                                : "Badges Earned"}
                            </span>
                            <span className="text-xs text-emerald-700 font-bold">
                              {learningStats.badges.length}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {learningStats.badges.slice(0, 3).map((badge, i) => (
                              <div
                                key={badge}
                                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200"
                              >
                                <Award className="h-3 w-3 text-yellow-600" />
                                <span className="text-xs font-medium text-yellow-800 truncate max-w-[80px]">
                                  {badge}
                                </span>
                              </div>
                            ))}
                            {learningStats.badges.length > 3 && (
                              <div className="px-3 py-1.5 rounded-full bg-gray-100">
                                <span className="text-xs font-medium text-gray-700">
                                  +{learningStats.badges.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Language Card */}
                    <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 shadow-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                          <Globe className="h-5 w-5 text-emerald-700" />
                        </div>
                        <div>
                          <h3 className="text-sm font-semibold text-gray-900">
                            {language === "hindi"
                              ? "भाषा: हिंदी"
                              : "Language: English"}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {language === "hindi"
                              ? "पूरा ऐप हिंदी में"
                              : "Full app in English"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={toggleLanguage}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-emerald-200 text-emerald-700 text-sm font-semibold hover:bg-emerald-50 transition hover:-translate-y-0.5"
                      >
                        {language === "hindi"
                          ? "Switch to English"
                          : "हिंदी में बदलें"}
                      </button>
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Floating voice button removed */}
      </div>
    </>
  );
};

export default DashboardScreen;