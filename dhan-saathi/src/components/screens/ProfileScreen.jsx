import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  increment,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import {
  IndianRupee,
  Home,
  Building2,
  MessageCircle,
  BookOpen,
  ShieldCheck,
  Bell,
  UserCircle2,
  Edit3,
  MapPin,
  Award,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  LogOut,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  Zap,
  Star,
  Target,
  Lock,
  Sparkles,
  Globe,
  Volume2,
  Play,
  Calendar,
  Users,
  Sparkle,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════════
   BILINGUAL CONTENT
   ═══════════════════════════════════════════════════════════════════ */
const PROFILE_TEXT = {
  hindi: {
    appName: "धनसाथी",
    home: "होम",
    schemes: "योजनाएं",
    community: "समुदाय",
    learn: "सीखें",
    help: "सहायता",
    notifications: "सूचनाएं",
    logout: "लॉग आउट",
    signin: "साइन इन",
    voiceAssistant: "वॉयस सहायक",

    // Page
    pageTitle: "खाता सेटिंग्स",
    pageSubtitle:
      "अपनी प्रोफ़ाइल, प्राथमिकताएं और सुरक्षा एक ही जगह प्रबंधित करें।",
    securityHigh: "सुरक्षा: उच्च",

    // Tabs
    tabProfile: "प्रोफ़ाइल",
    tabPreferences: "प्राथमिकताएं",
    tabSecurity: "सुरक्षा",

    // Profile header
    newUser: "नया उपयोगकर्ता",
    india: "भारत",
    impact: "प्रभाव",
    weekly: "साप्ताहिक",
    pointsToLevelUp: "अंक लेवल अप के लिए",
    maxLevel: "अधिकतम स्तर पहुंच गया!",

    // Basic Info
    basicInfo: "बुनियादी जानकारी",
    editing: "संपादन",
    edit: "संपादित करें",
    fullName: "पूरा नाम",
    email: "ईमेल पता",
    phone: "फोन नंबर",
    profession: "पेशा",
    location: "स्थान",
    aboutMe: "मेरे बारे में",
    aboutPlaceholder: "किसान, दुकानदार, स्वरोज़गार…",

    // Financial
    financialProfile: "वित्तीय प्रोफ़ाइल",
    private: "निजी",
    annualIncome: "वार्षिक आय",
    primaryGoal: "प्राथमिक लक्ष्य",
    riskAppetite: "जोखिम भूख",
    financialDisclaimer:
      "यह डेटा सार्वजनिक रूप से कभी साझा नहीं किया जाता और केवल आपके अनुभव को व्यक्तिगत बनाता है।",
    cancel: "रद्द करें",
    saveChanges: "परिवर्तन सहेजें",
    saving: "सहेज रहा है…",

    // Preferences
    systemPreferences: "सिस्टम प्राथमिकताएं",
    emailNotifications: "ईमेल सूचनाएं",
    emailNotificationsDesc: "साप्ताहिक पोर्टफोलियो प्रदर्शन रिपोर्ट",
    productUpdates: "उत्पाद अपडेट",
    productUpdatesDesc: "नई सुविधाएं और निवेश अंतर्दृष्टि",
    darkMode: "डार्क मोड",
    darkModeDesc: "विज़ुअल इंटरफ़ेस दिखावट टॉगल करें",
    savePreferences: "प्राथमिकताएं सहेजें",

    // Security
    securityCenter: "सुरक्षा केंद्र",
    loginMethod: "लॉगिन विधि",
    emailPassword: "ईमेल / पासवर्ड",
    notSet: "सेट नहीं",
    changePassword: "पासवर्ड बदलें",
    lastUpdated: "3 महीने पहले अपडेट किया गया",
    update: "अपडेट",
    activeSessions: "सक्रिय सत्र",
    activeSessionsDesc: "इस डिवाइस पर वर्तमान में लॉग इन",
    signOutAll: "सभी से साइन आउट",
    dangerZone: "खतरनाक क्षेत्र",
    dangerDesc:
      "अपना सामुदायिक इतिहास और लिंक्ड डेटा स्थानीय रूप से हटाएं। यह क्रिया पूर्ववत नहीं की जा सकती।",
    downloadFirst: "पहले अपना डेटा डाउनलोड करने पर विचार करें।",
    deleteAccount: "मेरा खाता हटाएं",
    deleteConfirm: "अपना खाता हटाएं? यह पूर्ववत नहीं किया जा सकता।",
    deleteSoon: "खाता हटाने की सुविधा जल्द आ रही है",

    // Right column - Simplified
    questions: "प्रश्न",
    answers: "उत्तर",
    quickActions: "त्वरित कार्य",
    communityGuidelines: "सामुदायिक दिशानिर्देश",

    // Toast
    profileUpdated: "प्रोफ़ाइल सफलतापूर्वक अपडेट!",
    errorSaving: "परिवर्तन सहेजने में त्रुटि",
    signInToSave: "सहेजने के लिए साइन इन करें",

    // Footer
    footerCopy: "© 2024 धनसाथी वित्तीय सेवाएं। सभी डेटा एन्क्रिप्टेड है।",
    privacyPolicy: "गोपनीयता नीति",
    termsOfService: "सेवा की शर्तें",
    helpCenter: "सहायता केंद्र",

    // Profile dropdown
    profileComplete: "प्रोफाइल पूर्ण",
    profileIncomplete: "प्रोफाइल अधूरी",
    setupNeeded: "सेटअप जरूरी",
    notSignedIn: "साइन इन नहीं किया गया",
    switchLang: "Switch to English",

    // Select options - Simplified for rural users
    selectRange: "आय सीमा चुनें",
    selectGoal: "लक्ष्य चुनें",
    selectRisk: "जोखिम चुनें",
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
    voiceAssistant: "Voice assistant",

    pageTitle: "Account Settings",
    pageSubtitle:
      "Manage your profile, preferences & security in one place.",
    securityHigh: "Security: High",

    tabProfile: "Profile",
    tabPreferences: "Preferences",
    tabSecurity: "Security",

    newUser: "New User",
    india: "India",
    impact: "Impact",
    weekly: "Weekly",
    pointsToLevelUp: "points to level up",
    maxLevel: "Max level reached!",

    basicInfo: "Basic Information",
    editing: "Editing",
    edit: "Edit",
    fullName: "Full Name",
    email: "Email Address",
    phone: "Phone Number",
    profession: "Profession",
    location: "Location",
    aboutMe: "About Me",
    aboutPlaceholder: "Farmer, shopkeeper, self-employed…",

    financialProfile: "Financial Profile",
    private: "Private",
    annualIncome: "Annual Income",
    primaryGoal: "Primary Goal",
    riskAppetite: "Risk Appetite",
    financialDisclaimer:
      "This data is never shared publicly and only personalises your experience.",
    cancel: "Cancel",
    saveChanges: "Save Changes",
    saving: "Saving…",

    systemPreferences: "System Preferences",
    emailNotifications: "Email Notifications",
    emailNotificationsDesc: "Weekly portfolio performance reports",
    productUpdates: "Product Updates",
    productUpdatesDesc: "New features and investment insights",
    darkMode: "Dark Mode",
    darkModeDesc: "Toggle visual interface appearance",
    savePreferences: "Save Preferences",

    securityCenter: "Security Center",
    loginMethod: "Login Method",
    emailPassword: "Email / Password",
    notSet: "Not set",
    changePassword: "Change Password",
    lastUpdated: "Last updated 3 months ago",
    update: "Update",
    activeSessions: "Active Sessions",
    activeSessionsDesc: "Currently logged in on this device",
    signOutAll: "Sign out all",
    dangerZone: "Danger Zone",
    dangerDesc:
      "Permanently remove your community history and linked data locally. This action cannot be undone.",
    downloadFirst: "Consider downloading your data first.",
    deleteAccount: "Delete my account",
    deleteConfirm: "Delete your account? This cannot be undone.",
    deleteSoon: "Account deletion coming soon",

    questions: "Questions",
    answers: "Answers",
    quickActions: "Quick Actions",
    communityGuidelines: "Community Guidelines",

    profileUpdated: "Profile updated successfully!",
    errorSaving: "Error saving changes",
    signInToSave: "Please sign in to save",

    footerCopy:
      "© 2024 DhanSaathi Financial Services. All data is encrypted.",
    privacyPolicy: "Privacy Policy",
    termsOfService: "Terms of Service",
    helpCenter: "Help Center",

    profileComplete: "Profile Complete",
    profileIncomplete: "Profile Incomplete",
    setupNeeded: "setup needed",
    notSignedIn: "Not signed in",
    switchLang: "हिंदी में बदलें",

    selectRange: "Select Income Range",
    selectGoal: "Select Goal",
    selectRisk: "Select Risk",
  },
};

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════════ */
const defaultBasicInfo = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  profession: "",
  about: "",
};

const defaultFinancialProfile = {
  incomeRange: "Select Range",
  goal: "Select Goal",
  risk: "Select Risk",
};

const defaultPreferences = {
  emailNotifications: true,
  productUpdates: true,
  darkMode: false,
  language: "english",
  currency: "INR",
};

const defaultContributorStats = {
  level: 1,
  points: 0,
  targetPoints: 100,
  questionsCount: 0,
  answersCount: 0,
  joinedDate: new Date().toLocaleDateString("en-US", {
    month: "short",
    year: "numeric",
  }),
  weeklyDelta: "+0 pts this week",
};

/* ═══════════════════════════════════════════════════════════════════
   ANIMATION VARIANTS
   ═══════════════════════════════════════════════════════════════════ */
const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.12 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 260, damping: 20 },
  },
};

const cardHover3D = {
  rest: {
    scale: 1,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
  },
  hover: {
    scale: 1.018,
    y: -8,
    rotateX: 1.5,
    rotateY: -1,
    boxShadow: "0 24px 48px rgba(0,0,0,0.12)",
    transition: { type: "spring", stiffness: 350, damping: 22 },
  },
};

const floatAnim = {
  animate: {
    y: [0, -8, 0],
    transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
  },
};

const glowPulse = {
  animate: {
    opacity: [0.35, 0.65, 0.35],
    scale: [1, 1.08, 1],
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
  },
};

const tabContentVariants = {
  initial: { opacity: 0, x: 30, scale: 0.98 },
  animate: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 280, damping: 24 },
  },
  exit: {
    opacity: 0,
    x: -30,
    scale: 0.98,
    transition: { duration: 0.18 },
  },
};

/* ═══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════ */
export default function ProfileScreen() {
  const navigate = useNavigate();

  // ── language ──
  const [language, setLanguage] = useState(
    () => localStorage.getItem("dhan-saathi-language") || "english"
  );
  const t = PROFILE_TEXT[language];

  const TABS = [t.tabProfile, t.tabPreferences, t.tabSecurity];
  const TAB_KEYS = ["Profile", "Preferences", "Security"];

  // ── state ──
  const [activeTabKey, setActiveTabKey] = useState("Profile");
  const [basicInfo, setBasicInfo] = useState(defaultBasicInfo);
  const [financialProfile, setFinancialProfile] = useState(
    defaultFinancialProfile
  );
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [fbUser, setFbUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [contributorStats, setContributorStats] = useState(
    defaultContributorStats
  );

  // profile dropdown (same pattern as dashboard)
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // reactive background (same as dashboard)
  const [mouse, setMouse] = useState({ x: 280, y: 180 });

  // ── 1) Auth state listener (same as dashboard) ──
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFbUser(u || null);
      if (!u) setLoading(false);
    });
    return () => unsub();
  }, []);

  // ── 2) Real-time user doc listener (same pattern as dashboard) ──
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

  // ── 3) Real-time profile subcollection listeners ──
  useEffect(() => {
    if (!fbUser) return;

    const uid = fbUser.uid;

    // Basic profile listener
    const unsubBasic = onSnapshot(
      doc(db, "users", uid, "profile", "basic"),
      async (snap) => {
        if (snap.exists()) {
          setBasicInfo(snap.data());
        } else {
          const init = {
            ...defaultBasicInfo,
            email: fbUser.email || "",
            fullName: fbUser.displayName || "",
          };
          setBasicInfo(init);
          await setDoc(
            doc(db, "users", uid, "profile", "basic"),
            init
          );
        }
      },
      (err) => console.error("Profile basic error:", err)
    );

    // Financial profile listener
    const unsubFinancial = onSnapshot(
      doc(db, "users", uid, "profile", "financial"),
      async (snap) => {
        if (snap.exists()) {
          setFinancialProfile(snap.data());
        } else {
          await setDoc(
            doc(db, "users", uid, "profile", "financial"),
            defaultFinancialProfile
          );
        }
      },
      (err) => console.error("Profile financial error:", err)
    );

    // Preferences listener
    const unsubPrefs = onSnapshot(
      doc(db, "users", uid, "profile", "preferences"),
      async (snap) => {
        if (snap.exists()) {
          setPreferences(snap.data());
        } else {
          await setDoc(
            doc(db, "users", uid, "profile", "preferences"),
            defaultPreferences
          );
        }
      },
      (err) => console.error("Profile preferences error:", err)
    );

    // Community stats listener
    const unsubCommunity = onSnapshot(
      doc(db, "users", uid, "stats", "community"),
      (snap) => {
        const d = snap.exists() ? snap.data() : {};
        const qC = d.questionsCount || 0;
        const aC = d.answersCount || 0;
        // We'll combine with userDoc score in a separate effect
        setContributorStats((prev) => ({
          ...prev,
          questionsCount: qC,
          answersCount: aC,
        }));
      },
      (err) => console.error("Community stats error:", err)
    );

    setLoading(false);

    return () => {
      unsubBasic();
      unsubFinancial();
      unsubPrefs();
      unsubCommunity();
    };
  }, [fbUser]);

  // ── 4) Derive contributor level from userDoc (real-time) ──
  useEffect(() => {
    if (!userDoc) return;

    const pts = userDoc.score || 0;
    let lvl = 1;
    if (pts >= 300) lvl = 4;
    else if (pts >= 200) lvl = 3;
    else if (pts >= 100) lvl = 2;
    const tgt =
      lvl === 4 ? 500 : lvl === 3 ? 300 : lvl === 2 ? 200 : 100;

    const joined = userDoc.createdAt?.toDate
      ? userDoc.createdAt
          .toDate()
          .toLocaleDateString("en-US", {
            month: "short",
            year: "numeric",
          })
      : new Date().toLocaleDateString("en-US", {
          month: "short",
          year: "numeric",
        });

    const delta = (Math.floor(Math.random() * 5) + 1) * 5;

    setContributorStats((prev) => ({
      ...prev,
      level: lvl,
      points: pts,
      targetPoints: tgt,
      joinedDate: joined,
      weeklyDelta: `+${delta} pts this week`,
    }));
  }, [userDoc]);

  // ── 5) Close dropdown on outside click (same as dashboard) ──
  useEffect(() => {
    const onDown = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // ── Firestore event logger (same as dashboard) ──
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

  // ── derived values ──
  const displayName = useMemo(
    () =>
      basicInfo.fullName ||
      fbUser?.displayName ||
      (language === "hindi" ? "अतिथि" : "Guest"),
    [basicInfo.fullName, fbUser, language]
  );

  const email = fbUser?.email || "";

  const initials = useMemo(() => {
    const s = (displayName || email || "U").trim();
    const p = s.split(" ").filter(Boolean);
    return p.length >= 2
      ? (p[0][0] + p[1][0]).toUpperCase()
      : (s[0] || "U").toUpperCase();
  }, [displayName, email]);

  const progressPct = Math.min(
    100,
    Math.round(
      (contributorStats.points / contributorStats.targetPoints) * 100
    )
  );
  const remaining = Math.max(
    0,
    contributorStats.targetPoints - contributorStats.points
  );

  const nextTier = useMemo(() => {
    const l = contributorStats.level;
    const p = contributorStats.points;
    if (l >= 4) return { name: "Platinum", req: p + 100 };
    if (l >= 3) return { name: "Gold", req: 300 };
    if (l >= 2) return { name: "Silver", req: 200 };
    return { name: "Bronze", req: 100 };
  }, [contributorStats.level, contributorStats.points]);

  const levelLabel = useMemo(() => {
    const l = contributorStats.level;
    return l >= 4 ? "Gold" : l >= 3 ? "Silver" : l >= 2 ? "Bronze" : "Starter";
  }, [contributorStats.level]);

  // ── handlers ──
  const markDirty = () => {
    if (!isEditing) setIsEditing(true);
    setHasChanges(true);
  };

  const handleBasicChange = (f, v) => {
    setBasicInfo((prev) => ({ ...prev, [f]: v }));
    markDirty();
  };

  const handleFinancialChange = (f, v) => {
    setFinancialProfile((prev) => ({ ...prev, [f]: v }));
    markDirty();
  };

  const handlePreferenceToggle = (f) => {
    setPreferences((prev) => ({ ...prev, [f]: !prev[f] }));
    markDirty();
  };

  const toast = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2500);
  };

  const handleSave = async () => {
    if (!fbUser?.uid) {
      toast(t.signInToSave);
      return;
    }
    try {
      setLoading(true);

      await setDoc(
        doc(db, "users", fbUser.uid, "profile", "basic"),
        { ...basicInfo, updatedAt: serverTimestamp() },
        { merge: true }
      );
      await setDoc(
        doc(db, "users", fbUser.uid, "profile", "financial"),
        financialProfile,
        { merge: true }
      );
      await setDoc(
        doc(db, "users", fbUser.uid, "profile", "preferences"),
        preferences,
        { merge: true }
      );
      await updateDoc(doc(db, "users", fbUser.uid), {
        updatedAt: serverTimestamp(),
        displayName: basicInfo.fullName || fbUser.displayName,
      });

      // Log event (dashboard pattern)
      await logEvent("profile_updated", {
        fields: Object.keys(basicInfo),
      });

      // Increment profile update counter
      await setDoc(
        doc(db, "users", fbUser.uid),
        { "stats.profileUpdates": increment(1) },
        { merge: true }
      );

      setIsEditing(false);
      setHasChanges(false);
      toast(t.profileUpdated);
    } catch (e) {
      console.error(e);
      toast(t.errorSaving);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Real-time listeners will restore the data automatically
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await logEvent("logout", {});
      await signOut(auth);
      navigate("/signup", { replace: true });
    } catch (e) {
      console.error(e);
      alert(language === "hindi" ? "लॉगआउट विफल" : "Logout failed");
    }
  };

  const toggleLanguage = () => {
    const newLang = language === "hindi" ? "english" : "hindi";
    setLanguage(newLang);
    localStorage.setItem("dhan-saathi-language", newLang);
  };

  const goTo = (path) => navigate(path);

  // Active tab label
  const activeTabLabel =
    activeTabKey === "Profile"
      ? t.tabProfile
      : activeTabKey === "Preferences"
      ? t.tabPreferences
      : t.tabSecurity;

  // ── Loading ──
  if (loading)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="h-12 w-12 rounded-full border-4 border-emerald-200 border-t-emerald-600"
        />
      </div>
    );

  /* ═══════════════════════════════════════════════════════════════
     RENDER
     ═══════════════════════════════════════════════════════════════ */
  return (
    <>
      {/* Animations (same as dashboard) */}
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
        /* micPulse removed */
      `}</style>

      <div
        className="min-h-screen relative overflow-hidden bg-gradient-to-b from-green-50 via-white to-blue-50 flex flex-col selection:bg-emerald-100"
        onMouseMove={(e) => setMouse({ x: e.clientX, y: e.clientY })}
        style={{
          backgroundImage: `
            radial-gradient(800px circle at ${mouse.x}px ${mouse.y}px, rgba(16,185,129,0.14), transparent 42%),
            radial-gradient(circle at top left, rgba(187,247,208,0.55) 0, transparent 55%),
            radial-gradient(circle at bottom right, rgba(191,219,254,0.45) 0, transparent 55%)
          `,
        }}
      >
        {/* Animated blobs (same as dashboard) */}
        <div className="pointer-events-none absolute -top-48 -left-48 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(34,197,94,0.45)_0%,rgba(16,185,129,0.16)_38%,transparent_70%)] blur-3xl opacity-90 mix-blend-multiply animate-[blobA_18s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute top-[25%] -right-56 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(16,185,129,0.40)_0%,rgba(59,130,246,0.14)_42%,transparent_72%)] blur-3xl opacity-80 mix-blend-multiply animate-[blobB_22s_ease-in-out_infinite]" />

        <div className="relative z-10 flex flex-col min-h-screen">
          {/* ════════════ NAVBAR (same as dashboard) ════════════ */}
          <header className="w-full bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
              {/* Logo */}
              <div
                className="flex items-center gap-2.5 cursor-pointer"
                onClick={() => goTo("/home")}
              >
                <div className="h-9 w-9 rounded-xl bg-green-600 flex items-center justify-center shadow-md">
                  <IndianRupee className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-gray-900">
                  {t.appName}
                </span>
              </div>

              {/* Nav links */}
              <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
                <button
                  type="button"
                  onClick={() => goTo("/home")}
                  className="flex items-center gap-1.5 hover:text-gray-900 transition"
                >
                  <Home className="h-4 w-4" />
                  {t.home}
                </button>
                <button
                  type="button"
                  onClick={() => goTo("/schemes")}
                  className="flex items-center gap-1.5 hover:text-gray-900 transition"
                >
                  <Building2 className="h-4 w-4" />
                  {t.schemes}
                </button>
                <button
                  type="button"
                  onClick={() => goTo("/community")}
                  className="flex items-center gap-1.5 hover:text-gray-900 transition"
                >
                  <Sparkle className="h-4 w-4" />
                  {t.community}
                </button>
                <button
                  type="button"
                  onClick={() => goTo("/learn")}
                  className="flex items-center gap-1.5 hover:text-gray-900 transition"
                >
                  <BookOpen className="h-4 w-4" />
                  {t.learn}
                </button>
                <span className="relative text-green-700 font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  {t.tabProfile}
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-green-600" />
                </span>
              </nav>

              {/* Right: lang + bell + profile dropdown */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 transition hover:-translate-y-0.5"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {language === "hindi" ? "हिंदी" : "English"}
                  </span>
                  <span className="text-xs text-gray-500">⇄</span>
                </button>

                <button
                  type="button"
                  className="hidden sm:inline-flex h-10 w-10 rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow-sm items-center justify-center text-gray-700 hover:bg-gray-50 transition hover:-translate-y-0.5"
                  title={t.notifications}
                >
                  <Bell className="h-5 w-5" />
                </button>

                {/* Profile dropdown (same as dashboard) */}
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
                    className={`absolute right-0 mt-3 w-72 rounded-2xl bg-white/90 backdrop-blur border border-gray-200 shadow-xl overflow-hidden origin-top-right transition-all duration-200 ${
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
                        {t.switchLang}
                      </button>
                    </div>
                    <div className="h-px bg-gray-100" />
                    {fbUser ? (
                      <button
                        type="button"
                        className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        {t.logout}
                      </button>
                    ) : (
                      <button
                        type="button"
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

          {/* ════════════ MAIN CONTENT ════════════ */}
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="space-y-6"
            >
              {/* Page Title */}
              <motion.div
                variants={fadeUp}
                className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
              >
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
                    {t.pageTitle}
                  </h1>
                  <p className="text-sm text-gray-500 mt-1">
                    {t.pageSubtitle}
                  </p>
                </div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="flex items-center gap-2 text-xs bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full text-emerald-700 font-semibold shadow-sm"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t.securityHigh}
                </motion.div>
              </motion.div>

              {/* Pill Tabs */}
              <motion.div variants={fadeUp}>
                <div className="inline-flex p-1 bg-white rounded-2xl border border-gray-100 shadow-sm">
                  {TAB_KEYS.map((key, idx) => {
                    const icons = {
                      Profile: UserCircle2,
                      Preferences: Bell,
                      Security: Lock,
                    };
                    const Icon = icons[key];
                    const label = TABS[idx];
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveTabKey(key)}
                        className={`relative flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                          activeTabKey === key
                            ? "text-emerald-700"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {activeTabKey === key && (
                          <motion.div
                            layoutId="tabPill"
                            className="absolute inset-0 bg-emerald-50 border border-emerald-100 rounded-xl shadow-sm"
                            transition={{
                              type: "spring",
                              bounce: 0.2,
                              duration: 0.5,
                            }}
                          />
                        )}
                        <span className="relative z-10 flex items-center gap-1.5">
                          <Icon className="h-3.5 w-3.5" />
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </motion.div>

              {/* ═══ GRID ═══ */}
              <div className="grid grid-cols-1 lg:grid-cols-[2.2fr_1fr] gap-6 items-start">
                {/* LEFT COLUMN */}
                <div className="space-y-6">
                  {/* Profile Header Card */}
                  <motion.div
                    variants={fadeUp}
                    initial="rest"
                    whileHover="hover"
                    animate="rest"
                    style={{ perspective: 800 }}
                  >
                    <motion.div
                      variants={cardHover3D}
                      className="relative overflow-hidden rounded-3xl bg-white border border-gray-100 p-5 sm:p-6"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/40 via-white to-white pointer-events-none" />
                      <motion.div
                        {...floatAnim}
                        className="absolute top-4 right-6 text-emerald-200 pointer-events-none"
                      >
                        <Sparkles className="h-6 w-6" />
                      </motion.div>

                      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center gap-5">
                        {/* Avatar */}
                        <motion.div
                          whileHover={{ scale: 1.08, rotate: -2 }}
                          className="relative flex-shrink-0"
                        >
                          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-emerald-200/60">
                            {initials}
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.2 }}
                            whileTap={{ scale: 0.9 }}
                            className="absolute -bottom-1.5 -right-1.5 h-7 w-7 rounded-full bg-white shadow-md border border-gray-100 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 transition"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                          </motion.button>
                        </motion.div>

                        {/* Info + progress */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">
                              {basicInfo.fullName || t.newUser}
                            </h2>
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-emerald-100 to-green-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider border border-emerald-200/60">
                              <Award className="h-3 w-3" />
                              {levelLabel}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-emerald-500" />
                              {basicInfo.location || t.india}
                            </span>
                            <span className="h-1 w-1 rounded-full bg-gray-300" />
                            <span className="truncate">
                              {basicInfo.email || fbUser?.email || "—"}
                            </span>
                          </div>

                          {/* Progress bar */}
                          <div className="mt-3 max-w-xs">
                            <div className="flex justify-between text-[11px] font-semibold text-gray-500 mb-1">
                              <span>{contributorStats.points} pts</span>
                              <span className="text-emerald-600">
                                {nextTier.name} ({nextTier.req})
                              </span>
                            </div>
                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${progressPct}%`,
                                }}
                                transition={{
                                  duration: 1.2,
                                  delay: 0.4,
                                  ease: "easeOut",
                                }}
                                className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
                              />
                            </div>
                            <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                              <TrendingUp className="h-3 w-3 text-emerald-500" />
                              {remaining > 0
                                ? `${remaining} ${t.pointsToLevelUp}`
                                : t.maxLevel}
                            </p>
                          </div>
                        </div>

                        {/* Mini stats */}
                        <div className="flex sm:flex-col gap-4 sm:gap-3 text-center sm:text-right flex-shrink-0">
                          <div className="bg-emerald-50/60 rounded-2xl px-4 py-2.5 border border-emerald-100/50">
                            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                              {t.impact}
                            </p>
                            <p className="text-base font-bold text-emerald-700 flex items-center justify-center sm:justify-end gap-1 mt-0.5">
                              <Star className="h-3.5 w-3.5" />
                              Top 20%
                            </p>
                          </div>
                          <div className="bg-emerald-50/60 rounded-2xl px-4 py-2.5 border border-emerald-100/50">
                            <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">
                              {t.weekly}
                            </p>
                            <p className="text-base font-bold text-emerald-700 flex items-center justify-center sm:justify-end gap-1 mt-0.5">
                              <Zap className="h-3.5 w-3.5" />
                              {contributorStats.weeklyDelta.replace(
                                " pts this week",
                                ""
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Tab Content */}
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTabKey}
                      variants={tabContentVariants}
                      initial="initial"
                      animate="animate"
                      exit="exit"
                      className="space-y-6"
                    >
                      {/* ═══ PROFILE TAB ═══ */}
                      {activeTabKey === "Profile" && (
                        <>
                          {/* Basic Info */}
                          <motion.div
                            initial="rest"
                            whileHover="hover"
                            animate="rest"
                            style={{ perspective: 800 }}
                          >
                            <motion.div
                              variants={cardHover3D}
                              className="rounded-3xl bg-white border border-gray-100 p-5 sm:p-7"
                            >
                              <div className="flex items-center justify-between mb-5">
                                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                  <span className="h-7 w-7 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <UserCircle2 className="h-4 w-4" />
                                  </span>
                                  {t.basicInfo}
                                </h3>
                                <motion.button
                                  whileHover={{ scale: 1.06 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    setIsEditing((v) => !v)
                                  }
                                  className={`text-xs font-semibold px-4 py-2 rounded-xl transition-all ${
                                    isEditing
                                      ? "bg-emerald-100 text-emerald-700 shadow-sm"
                                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                  }`}
                                >
                                  <span className="flex items-center gap-1.5">
                                    <Edit3 className="h-3 w-3" />
                                    {isEditing
                                      ? t.editing
                                      : t.edit}
                                  </span>
                                </motion.button>
                              </div>

                              <div className="grid sm:grid-cols-2 gap-5">
                                <FloatingInput
                                  label={t.fullName}
                                  value={basicInfo.fullName}
                                  disabled={!isEditing}
                                  onChange={(v) =>
                                    handleBasicChange("fullName", v)
                                  }
                                />
                                <FloatingInput
                                  label={t.email}
                                  value={
                                    basicInfo.email ||
                                    fbUser?.email ||
                                    ""
                                  }
                                  disabled
                                />
                                <FloatingInput
                                  label={t.phone}
                                  type="tel"
                                  value={basicInfo.phone}
                                  disabled={!isEditing}
                                  onChange={(v) =>
                                    handleBasicChange("phone", v)
                                  }
                                />
                                <FloatingInput
                                  label={t.profession}
                                  value={basicInfo.profession}
                                  disabled={!isEditing}
                                  onChange={(v) =>
                                    handleBasicChange(
                                      "profession",
                                      v
                                    )
                                  }
                                />
                                <div className="sm:col-span-2">
                                  <FloatingInput
                                    label={t.location}
                                    value={basicInfo.location}
                                    disabled={!isEditing}
                                    onChange={(v) =>
                                      handleBasicChange(
                                        "location",
                                        v
                                      )
                                    }
                                  />
                                </div>
                                <div className="sm:col-span-2 space-y-1.5">
                                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    {t.aboutMe}
                                  </label>
                                  <textarea
                                    rows={3}
                                    disabled={!isEditing}
                                    value={basicInfo.about}
                                    onChange={(e) =>
                                      handleBasicChange(
                                        "about",
                                        e.target.value
                                      )
                                    }
                                    placeholder={
                                      t.aboutPlaceholder
                                    }
                                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all disabled:bg-gray-50/80 disabled:text-gray-400 resize-none"
                                  />
                                </div>
                              </div>
                            </motion.div>
                          </motion.div>

                          {/* Financial Profile */}
                          <motion.div
                            initial="rest"
                            whileHover="hover"
                            animate="rest"
                            style={{ perspective: 800 }}
                          >
                            <motion.div
                              variants={cardHover3D}
                              className="rounded-3xl bg-white border border-gray-100 p-5 sm:p-7"
                            >
                              <div className="flex items-center justify-between mb-5">
                                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                  <span className="h-7 w-7 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <Target className="h-4 w-4" />
                                  </span>
                                  {t.financialProfile}
                                </h3>
                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                                  {t.private}
                                </span>
                              </div>

                              <div className="grid sm:grid-cols-3 gap-5">
                                <SelectBox
                                  label={t.annualIncome}
                                  value={
                                    financialProfile.incomeRange
                                  }
                                  disabled={!isEditing}
                                  onChange={(v) =>
                                    handleFinancialChange(
                                      "incomeRange",
                                      v
                                    )
                                  }
                                  options={[
                                    t.selectRange,
                                    "₹0 – ₹1 Lakh",
                                    "₹1 – ₹2.5 Lakh",
                                    "₹2.5 – ₹5 Lakh",
                                    "₹5 – ₹10 Lakh",
                                    "₹10 Lakh+",
                                  ]}
                                />
                                <SelectBox
                                  label={t.primaryGoal}
                                  value={financialProfile.goal}
                                  disabled={!isEditing}
                                  onChange={(v) =>
                                    handleFinancialChange(
                                      "goal",
                                      v
                                    )
                                  }
                                  options={[
                                    t.selectGoal,
                                    "Savings for Family",
                                    "Children's Education",
                                    "House Construction",
                                    "Farm Equipment",
                                    "Medical Expenses",
                                    "Small Business",
                                  ]}
                                />
                                <SelectBox
                                  label={t.riskAppetite}
                                  value={financialProfile.risk}
                                  disabled={!isEditing}
                                  onChange={(v) =>
                                    handleFinancialChange(
                                      "risk",
                                      v
                                    )
                                  }
                                  options={[
                                    t.selectRisk,
                                    "Low (Safe)",
                                    "Medium (Balanced)",
                                    "High (Growth)",
                                  ]}
                                />
                              </div>

                              <p className="text-[11px] text-gray-400 mt-4">
                                {t.financialDisclaimer}
                              </p>

                              <AnimatePresence>
                                {hasChanges && (
                                  <motion.div
                                    initial={{
                                      opacity: 0,
                                      y: 10,
                                    }}
                                    animate={{
                                      opacity: 1,
                                      y: 0,
                                    }}
                                    exit={{
                                      opacity: 0,
                                      y: 10,
                                    }}
                                    className="mt-5 flex items-center justify-end gap-3"
                                  >
                                    <motion.button
                                      whileHover={{
                                        scale: 1.04,
                                      }}
                                      whileTap={{
                                        scale: 0.96,
                                      }}
                                      onClick={handleCancel}
                                      className="px-5 py-2.5 rounded-xl bg-gray-50 text-xs font-semibold text-gray-600 hover:bg-gray-100 transition"
                                    >
                                      {t.cancel}
                                    </motion.button>
                                    <motion.button
                                      whileHover={{
                                        scale: 1.04,
                                      }}
                                      whileTap={{
                                        scale: 0.96,
                                      }}
                                      onClick={handleSave}
                                      disabled={loading}
                                      className="px-6 py-2.5 rounded-xl bg-emerald-600 text-xs sm:text-sm font-semibold text-white shadow-lg shadow-emerald-200/50 hover:bg-emerald-700 transition disabled:opacity-50"
                                    >
                                      {loading
                                        ? t.saving
                                        : t.saveChanges}
                                    </motion.button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          </motion.div>
                        </>
                      )}

                      {/* ═══ PREFERENCES TAB ═══ */}
                      {activeTabKey === "Preferences" && (
                        <>
                          <motion.div
                            initial="rest"
                            whileHover="hover"
                            animate="rest"
                            style={{ perspective: 800 }}
                          >
                            <motion.div
                              variants={cardHover3D}
                              className="rounded-3xl bg-white border border-gray-100 p-5 sm:p-7"
                            >
                              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-5">
                                <span className="h-7 w-7 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                  <Bell className="h-4 w-4" />
                                </span>
                                {t.systemPreferences}
                              </h3>
                              <div className="space-y-1">
                                <ToggleRow
                                  label={t.emailNotifications}
                                  desc={
                                    t.emailNotificationsDesc
                                  }
                                  checked={
                                    preferences.emailNotifications
                                  }
                                  onChange={() =>
                                    handlePreferenceToggle(
                                      "emailNotifications"
                                    )
                                  }
                                />
                                <ToggleRow
                                  label={t.productUpdates}
                                  desc={t.productUpdatesDesc}
                                  checked={
                                    preferences.productUpdates
                                  }
                                  onChange={() =>
                                    handlePreferenceToggle(
                                      "productUpdates"
                                    )
                                  }
                                />
                                <ToggleRow
                                  label={t.darkMode}
                                  desc={t.darkModeDesc}
                                  checked={preferences.darkMode}
                                  onChange={() =>
                                    handlePreferenceToggle(
                                      "darkMode"
                                    )
                                  }
                                />
                              </div>
                            </motion.div>
                          </motion.div>

                          {/* Security summary */}
                          <motion.div
                            initial="rest"
                            whileHover="hover"
                            animate="rest"
                            style={{ perspective: 800 }}
                          >
                            <motion.div
                              variants={cardHover3D}
                              className="rounded-3xl bg-white border border-gray-100 p-5 sm:p-7"
                            >
                              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-5">
                                <span className="h-7 w-7 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                  <ShieldCheck className="h-4 w-4" />
                                </span>
                                {t.securityCenter}
                              </h3>
                              <div className="space-y-4 text-sm">
                                <SecurityRow
                                  title={t.loginMethod}
                                  subtitle={
                                    fbUser?.providerData?.[0]
                                      ?.providerId ===
                                    "password"
                                      ? t.emailPassword
                                      : fbUser
                                          ?.providerData?.[0]
                                          ?.providerId ||
                                        t.notSet
                                  }
                                  action={
                                    <ExternalLink className="h-4 w-4 text-gray-300" />
                                  }
                                />
                                <SecurityRow
                                  title={t.changePassword}
                                  subtitle={t.lastUpdated}
                                  action={
                                    <motion.button
                                      whileHover={{
                                        scale: 1.06,
                                      }}
                                      whileTap={{
                                        scale: 0.95,
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm transition"
                                    >
                                      {t.update}
                                    </motion.button>
                                  }
                                />
                                <SecurityRow
                                  title={t.activeSessions}
                                  subtitle={
                                    t.activeSessionsDesc
                                  }
                                  action={
                                    <button
                                      onClick={handleLogout}
                                      className="text-xs font-semibold text-red-500 hover:text-red-600"
                                    >
                                      {t.signOutAll}
                                    </button>
                                  }
                                />
                              </div>
                            </motion.div>
                          </motion.div>

                          <AnimatePresence>
                            {hasChanges && (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="flex justify-end"
                              >
                                <motion.button
                                  whileHover={{ scale: 1.04 }}
                                  whileTap={{ scale: 0.96 }}
                                  onClick={handleSave}
                                  disabled={loading}
                                  className="px-6 py-2.5 rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-lg shadow-emerald-200/50 hover:bg-emerald-700 transition disabled:opacity-50"
                                >
                                  {loading
                                    ? t.saving
                                    : t.savePreferences}
                                </motion.button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </>
                      )}

                      {/* ═══ SECURITY TAB ═══ */}
                      {activeTabKey === "Security" && (
                        <>
                          <motion.div
                            initial="rest"
                            whileHover="hover"
                            animate="rest"
                            style={{ perspective: 800 }}
                          >
                            <motion.div
                              variants={cardHover3D}
                              className="rounded-3xl bg-white border border-gray-100 p-5 sm:p-7"
                            >
                              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-5">
                                <span className="h-7 w-7 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                                  <ShieldCheck className="h-4 w-4" />
                                </span>
                                {t.securityCenter}
                              </h3>
                              <div className="space-y-4 text-sm">
                                <SecurityRow
                                  title={t.loginMethod}
                                  subtitle={
                                    fbUser?.providerData?.[0]
                                      ?.providerId ===
                                    "password"
                                      ? t.emailPassword
                                      : fbUser
                                          ?.providerData?.[0]
                                          ?.providerId ||
                                        t.notSet
                                  }
                                  action={
                                    <ExternalLink className="h-4 w-4 text-gray-300" />
                                  }
                                />
                                <SecurityRow
                                  title={t.changePassword}
                                  subtitle={t.lastUpdated}
                                  action={
                                    <motion.button
                                      whileHover={{
                                        scale: 1.06,
                                      }}
                                      whileTap={{
                                        scale: 0.95,
                                      }}
                                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm"
                                    >
                                      {t.update}
                                    </motion.button>
                                  }
                                />
                                <SecurityRow
                                  title={t.activeSessions}
                                  subtitle={
                                    t.activeSessionsDesc
                                  }
                                  action={
                                    <button
                                      onClick={handleLogout}
                                      className="text-xs font-semibold text-red-500 hover:text-red-600"
                                    >
                                      {t.signOutAll}
                                    </button>
                                  }
                                />
                              </div>
                            </motion.div>
                          </motion.div>

                          {/* Danger Zone */}
                          <motion.div
                            initial="rest"
                            whileHover="hover"
                            animate="rest"
                            style={{ perspective: 800 }}
                          >
                            <motion.div
                              variants={cardHover3D}
                              className="rounded-3xl bg-white border border-red-100 p-5 sm:p-7"
                            >
                              <div className="flex items-center gap-2 mb-3 text-red-500">
                                <AlertTriangle className="h-4 w-4" />
                                <h3 className="text-sm font-bold">
                                  {t.dangerZone}
                                </h3>
                              </div>
                              <p className="text-xs text-gray-500 mb-4">
                                {t.dangerDesc}
                              </p>
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                <p className="text-[11px] text-gray-400">
                                  {t.downloadFirst}
                                </p>
                                <motion.button
                                  whileHover={{ scale: 1.04 }}
                                  whileTap={{ scale: 0.96 }}
                                  onClick={() => {
                                    if (
                                      window.confirm(
                                        t.deleteConfirm
                                      )
                                    )
                                      toast(t.deleteSoon);
                                  }}
                                  className="px-5 py-2.5 rounded-xl border border-red-200 text-xs font-semibold text-red-500 hover:bg-red-50 transition"
                                >
                                  {t.deleteAccount}
                                </motion.button>
                              </div>
                            </motion.div>
                          </motion.div>
                        </>
                      )}
                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* RIGHT COLUMN - SIMPLIFIED */}
                <motion.aside
                  variants={stagger}
                  initial="hidden"
                  animate="visible"
                  className="space-y-5"
                >
                  {/* Community Stat Tiles */}
                  <motion.div
                    variants={fadeUp}
                    className="grid grid-cols-2 gap-3"
                  >
                    <StatTile
                      icon={HelpCircle}
                      iconBg="bg-emerald-100"
                      iconColor="text-emerald-600"
                      value={contributorStats.questionsCount}
                      label={t.questions}
                      onClick={() => goTo("/community")}
                    />
                    <StatTile
                      icon={MessageSquare}
                      iconBg="bg-blue-100"
                      iconColor="text-blue-600"
                      value={contributorStats.answersCount}
                      label={t.answers}
                      onClick={() => goTo("/community")}
                    />
                  </motion.div>

                  {/* Quick Actions - Simplified */}
                  <motion.div
                    variants={fadeUp}
                    style={{ perspective: 800 }}
                  >
                    <motion.div
                      initial="rest"
                      whileHover="hover"
                      animate="rest"
                      variants={cardHover3D}
                      className="rounded-3xl bg-white border border-gray-100 p-5"
                    >
                      <h4 className="text-sm font-bold text-gray-900 mb-3">
                        {t.quickActions}
                      </h4>
                      <div className="space-y-1">
                        <motion.button
                          whileHover={{ x: 4 }}
                          onClick={() => goTo("/community")}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm text-gray-600 hover:text-emerald-700 hover:bg-emerald-50/50 transition group"
                        >
                          {t.communityGuidelines}
                          <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-emerald-500" />
                        </motion.button>
                        <div className="border-t border-gray-100 mt-2 pt-2">
                          <motion.button
                            whileHover={{ x: 4 }}
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition font-medium"
                          >
                            <LogOut className="h-3.5 w-3.5" />
                            {t.logout}
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>

                  {/* Language Card */}
                  <motion.div variants={fadeUp}>
                    <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 shadow-xl p-5">
                      <div className="flex items-center gap-3 mb-3">
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
                        {t.switchLang}
                      </button>
                    </div>
                  </motion.div>
                </motion.aside>
              </div>

              {/* Footer */}
              <motion.footer
                variants={fadeUp}
                className="border-t border-gray-100 pt-4 pb-6 text-[11px] text-gray-400 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
              >
                <p>{t.footerCopy}</p>
                <div className="flex items-center gap-4">
                  {[
                    t.privacyPolicy,
                    t.termsOfService,
                    t.helpCenter,
                  ].map((txt) => (
                    <button
                      key={txt}
                      className="hover:text-gray-600 transition"
                    >
                      {txt}
                    </button>
                  ))}
                </div>
              </motion.footer>
            </motion.div>
          </main>

          {/* Floating voice button removed */}

          {/* Toast */}
          <AnimatePresence>
            {showToast && (
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 30, scale: 0.9 }}
                className="fixed bottom-24 right-6 z-50"
              >
                <div className="rounded-2xl bg-gray-900 text-white px-5 py-3 shadow-2xl flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  <span className="text-sm font-medium">
                    {toastMessage}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   HELPER COMPONENTS
   ═══════════════════════════════════════════════════════════════════ */

function FloatingInput({ label, value, onChange, disabled, type = "text" }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </label>
      <motion.input
        whileFocus={{ scale: 1.01, borderColor: "#34d399" }}
        type={type}
        value={value}
        onChange={(e) => onChange && onChange(e.target.value)}
        disabled={disabled}
        className="w-full rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all disabled:bg-gray-50/80 disabled:text-gray-400 bg-white"
      />
    </div>
  );
}

function SelectBox({ label, value, onChange, disabled, options }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="w-full appearance-none rounded-2xl border border-gray-200 px-4 py-3 text-sm focus:border-emerald-400 focus:ring-4 focus:ring-emerald-100 outline-none transition-all disabled:bg-gray-50/80 disabled:text-gray-400 bg-white pr-10"
        >
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <ArrowRight className="h-3.5 w-3.5 rotate-90" />
        </div>
      </div>
    </div>
  );
}

function ToggleRow({ label, desc, checked, onChange }) {
  return (
    <motion.div
      whileHover={{ x: 2, backgroundColor: "rgba(236,253,245,0.4)" }}
      className="flex items-center justify-between px-3 py-3 rounded-2xl transition-colors cursor-pointer"
      onClick={onChange}
    >
      <div>
        <p className="text-sm font-semibold text-gray-900">{label}</p>
        <p className="text-xs text-gray-500">{desc}</p>
      </div>
      <button
        type="button"
        className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${
          checked ? "bg-emerald-500" : "bg-gray-200"
        }`}
      >
        <motion.div
          animate={{ x: checked ? 22 : 3 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          className="absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm"
        />
      </button>
    </motion.div>
  );
}

function SecurityRow({ title, subtitle, action }) {
  return (
    <motion.div
      whileHover={{ x: 2, backgroundColor: "rgba(249,250,251,0.8)" }}
      className="flex items-center justify-between p-3 rounded-2xl transition-colors"
    >
      <div>
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      {action}
    </motion.div>
  );
}

function StatTile({ icon: Icon, iconBg, iconColor, value, label, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -6, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 text-center cursor-pointer group"
      style={{ perspective: 600 }}
    >
      <div
        className={`h-10 w-10 mx-auto ${iconBg} ${iconColor} rounded-xl flex items-center justify-center mb-2 group-hover:scale-110 transition-transform`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mt-0.5">
        {label}
      </p>
    </motion.div>
  );
}