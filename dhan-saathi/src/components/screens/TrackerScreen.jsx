import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  onSnapshot as onSnap,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { addSavingsEntry, getMonthKey } from "../../services/savingsService";

import {
  Home,
  Building2,
  Sparkle,
  BookOpen,
  MessageSquare,
  Bell,
  LogOut,
  IndianRupee,
  Mic,
  Trash2,
  Globe,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
} from "recharts";

/* ------------------ helpers ------------------ */
function normalize(s = "") {
  return s.toLowerCase().trim();
}

function currency(n) {
  const x = Number(n || 0);
  return `₹${x.toLocaleString("en-IN")}`;
}

function getAllocation(monthlySavings) {
  const m = Number(monthlySavings || 0);

  if (m <= 0) {
    return [
      { name: "Emergency", value: 0 },
      { name: "Safe", value: 0 },
      { name: "Growth", value: 0 },
    ];
  }

  if (m < 2000) {
    return [
      { name: "Emergency", value: Math.round(m * 0.6) },
      { name: "Safe", value: Math.round(m * 0.4) },
      { name: "Growth", value: 0 },
    ];
  }

  return [
    { name: "Emergency", value: Math.round(m * 0.5) },
    { name: "Safe", value: Math.round(m * 0.3) },
    { name: "Growth", value: Math.round(m * 0.2) },
  ];
}

function getSchemeSuggestions(profile, isHindi = false) {
  const occ = normalize(profile?.occupation || "");
  const income = Number(profile?.monthlyIncome || 0);

  const suggestions = [];

  if (occ.includes("farmer") || occ.includes("kisan") || occ.includes("agri")) {
    suggestions.push(
      isHindi 
        ? "PM किसान सम्मान निधि (किसानों के लिए)"
        : "PM Kisan Samman Nidhi (for farmers)"
    );
  }
  if (
    occ.includes("business") ||
    occ.includes("shop") ||
    occ.includes("vendor") ||
    occ.includes("trader")
  ) {
    suggestions.push(
      isHindi
        ? "प्रधानमंत्री मुद्रा योजना (छोटे व्यवसाय ऋण के लिए)"
        : "Pradhan Mantri Mudra Yojana (for small business loans)"
    );
  }

  if (income > 0) {
    suggestions.push(
      isHindi
        ? "पोस्ट ऑफिस आरडी/एफडी (सुरक्षित मासिक बचत आदत)"
        : "Post Office RD/FD (safe monthly saving habit)"
    );
    suggestions.push(
      isHindi
        ? "पीपीएफ / एपीवाई (दीर्घकालिक सेवानिवृत्ति विकल्प)"
        : "PPF / APY (long-term retirement style options)"
    );
  } else {
    suggestions.push(
      isHindi
        ? "योजना पृष्ठ में सरकारी + बैंक योजनाएं देखें"
        : "Explore Govt + Bank schemes in Schemes page"
    );
  }

  return [...new Set(suggestions)];
}

/* ------------------ Voice (optional, type works always) ------------------ */
function getRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  if (!SR) return null;
  const rec = new SR();
  rec.continuous = false;
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  return rec;
}

/* ------------------ Firestore delete helper ------------------ */
/**
 * Deletes savingsEntries for a user for a given monthKey.
 * Uses batching (500 write limit per batch).
 */
async function deleteSavingsEntriesForMonth(uid, monthKey) {
  const qy = query(
    collection(db, "users", uid, "savingsEntries"),
    where("monthKey", "==", monthKey)
  );

  const snap = await getDocs(qy);
  if (snap.empty) return { deleted: 0 };

  const docs = snap.docs;
  let deleted = 0;

  // Firestore batch limit is 500 operations
  const CHUNK = 450; // safe buffer

  for (let i = 0; i < docs.length; i += CHUNK) {
    const batch = writeBatch(db);
    const chunk = docs.slice(i, i + CHUNK);

    chunk.forEach((d) => batch.delete(d.ref));
    await batch.commit();

    deleted += chunk.length;
  }

  return { deleted };
}

export default function TrackerScreen() {
  const navigate = useNavigate();

  // navbar routing
  const goHome = () => navigate("/home");
  const goSchemes = () => navigate("/schemes");
  const goCommunity = () => navigate("/community");

  // auth + dropdown
  const [fbUser, setFbUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // tracker data
  const [todaySaving, setTodaySaving] = useState("");
  const [savingError, setSavingError] = useState("");
  const [savingSuccess, setSavingSuccess] = useState("");

  // reset/delete UI state
  const [resetText, setResetText] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const [resetMsg, setResetMsg] = useState("");

  // voice
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef(null);

  // savings entries this month
  const [entries, setEntries] = useState([]);

  // Language state
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem("dhan-saathi-language") || "english";
  });

  const isHindi = selectedLanguage === "hindi";
  const voiceLang = isHindi ? "hi-IN" : "en-IN";

  const speak = (text) => {
    try {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = voiceLang;
      window.speechSynthesis.speak(msg);
    } catch {}
  };

  // Toggle language
  const toggleLanguage = () => {
    const newLang = isHindi ? "english" : "hindi";
    setSelectedLanguage(newLang);
    localStorage.setItem("dhan-saathi-language", newLang);
    
    // Speak confirmation
    if (newLang === "hindi") {
      speak("हिंदी भाषा चुनी गई है");
    } else {
      speak("English language selected");
    }
  };

  // Text translations
  const translations = {
    // Navbar
    home: isHindi ? "होम" : "Home",
    schemes: isHindi ? "योजनाएं" : "Schemes",
    community: isHindi ? "समुदाय" : "Community",
    learn: isHindi ? "सीखें" : "Learn",
    help: isHindi ? "सहायता" : "Help",
    notifications: isHindi ? "सूचनाएं" : "Notifications",
    logout: isHindi ? "लॉग आउट" : "Logout",
    notSignedIn: isHindi ? "साइन इन नहीं किया गया" : "Not signed in",
    
    // Main section
    title: isHindi ? "बचत ट्रैकर (एआई कोच)" : "Savings Tracker (AI Coach)",
    subtitle: isHindi 
      ? "आज की बचत दर्ज करें (या आपका औसत)। हम मासिक बचत का अनुमान लगाएंगे और एक आवंटन सुझाएंगे।"
      : "Enter today's saving (or your average). We'll project monthly savings and suggest an allocation.",
    
    // Input section
    placeholder: isHindi ? "₹ आज बचाई गई राशि (जैसे 100)" : "₹ amount saved today (e.g. 100)",
    save: isHindi ? "सेव करें" : "Save",
    speakAmount: isHindi ? "राशि बोलें" : "Speak amount",
    
    // Error/Success messages
    pleaseSignIn: isHindi ? "कृपया अपना ट्रैकर डेटा सेव करने के लिए Google से साइन इन करें।" : "Please sign in with Google to save your tracker data.",
    enterValidAmount: isHindi ? "एक वैध राशि दर्ज करें (₹)।" : "Enter a valid amount (₹).",
    savedSuccess: isHindi ? "सेव हो गया! आपका डैशबोर्ड और ग्राफ अपडेट हो जाएगा।" : "Saved! Your dashboard and graphs will update.",
    failedToSave: isHindi ? "सेव करने में विफल। कृपया पुनः प्रयास करें।" : "Failed to save. Please try again.",
    voiceNotSupported: isHindi ? "यहां वॉइस इनपुट समर्थित नहीं है। राशि टाइप करें।" : "Voice input not supported here. Type the amount.",
    voiceCaptureFailed: isHindi ? "वॉइस कैप्चर नहीं कर सका। कृपया राशि टाइप करें।" : "Could not capture voice. Please type the amount.",
    voiceRecognitionFailed: isHindi ? "वॉइस रिकग्निशन शुरू नहीं हो सका।" : "Voice recognition failed to start.",
    
    // Reset section
    resetTitle: isHindi ? "इस महीने रीसेट करें (सभी एंट्रीज़ हटाएं)" : "Reset this month (delete all entries)",
    resetDescription: isHindi 
      ? "यह फायरस्टोर से वर्तमान महीने के लिए सभी सेव की गई एंट्रीज़ को स्थायी रूप से हटा देगा।"
      : "This permanently deletes all saved entries for the current month from Firestore.",
    resetPlaceholder: isHindi ? '"DELETE" टाइप करके पुष्टि करें' : 'Type "DELETE" to confirm',
    deleteAll: isHindi ? "सभी हटाएं (इस महीने)" : "Delete all (this month)",
    deleting: isHindi ? "हटा रहे हैं..." : "Deleting...",
    confirmReset: isHindi 
      ? "यह वर्तमान महीने के लिए सभी बचत एंट्रीज़ को स्थायी रूप से हटा देगा। जारी रखें?"
      : "This will permanently delete all savings entries for this month. Continue?",
    pleaseSignInReset: isHindi ? "कृपया अपने ट्रैकर को रीसेट करने के लिए साइन इन करें।" : "Please sign in to reset your tracker.",
    resetConfirmText: isHindi ? `"DELETE" टाइप करके पुष्टि करें` : `Type DELETE to confirm reset.`,
    resetDone: isHindi 
      ? (deleted) => `रीसेट हो गया। इस महीने के लिए ${deleted} एंट्रीज़ हटा दी गईं।`
      : (deleted) => `Reset done. Deleted ${deleted} entries for this month.`,
    noEntriesToDelete: isHindi 
      ? "इस महीने हटाने के लिए कोई एंट्री नहीं मिली।"
      : "No entries found to delete for this month.",
    resetFailed: isHindi ? "रीसेट करने में विफल। कृपया पुनः प्रयास करें।" : "Failed to reset. Please try again.",
    
    // Charts
    allocationTitle: isHindi ? "एआई आवंटन (अनुमानित)" : "AI Allocation (Projected)",
    projectedMonthly: isHindi ? "अनुमानित मासिक बचत:" : "Projected monthly saving:",
    note: isHindi ? "नोट: यह शैक्षिक मार्गदर्शन है, वित्तीय सलाह नहीं।" : "Note: This is educational guidance, not financial advice.",
    
    // Bar chart
    monthlyChartTitle: isHindi ? "मासिक बचत (ग्राफ)" : "Monthly Saving (Graph)",
    avgDaily: isHindi ? "औसत दैनिक:" : "Avg daily:",
    daysLogged: isHindi ? "दर्ज किए गए दिन:" : "Days logged:",
    
    // Suggestions
    aiSuggestions: isHindi ? "एआई सुझाव" : "AI Suggestions",
    openSchemes: isHindi ? "योजनाएं खोलें →" : "Open Schemes →",
    
    // Entries section
    entriesTitle: isHindi ? "इस महीने की एंट्रीज़" : "This Month Entries",
    entriesSubtitle: isHindi 
      ? "आपके औसत की गणना करने के लिए उपयोग की गई सेव की गई एंट्रीज़।"
      : "Saved entries used to compute your averages.",
    noEntries: isHindi 
      ? "अभी तक कोई एंट्री नहीं। अपनी पहली एंट्री ऊपर सेव करें।"
      : "No entries yet. Save your first entry above.",
    
    // Pie chart labels
    emergency: isHindi ? "आपातकाल" : "Emergency",
    safe: isHindi ? "सुरक्षित" : "Safe",
    growth: isHindi ? "वृद्धि" : "Growth",
    
    // Bar chart labels
    thisMonth: isHindi ? "यह महीना (दर्ज)" : "This Month (logged)",
    projected: isHindi ? "अनुमानित (30 दिन)" : "Projected (30d)",
  };

  // auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setFbUser(u || null));
    return () => unsub();
  }, []);

  // user doc (for profile-based suggestions)
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

  // listen to this month's entries
  useEffect(() => {
    if (!fbUser) {
      setEntries([]);
      return;
    }

    const monthKey = getMonthKey(new Date());
    const qy = query(
      collection(db, "users", fbUser.uid, "savingsEntries"),
      where("monthKey", "==", monthKey)
    );

    const unsub = onSnap(
      qy,
      (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        rows.sort((a, b) =>
          String(a.dateKey).localeCompare(String(b.dateKey))
        );
        setEntries(rows);
      },
      (err) => {
        console.error("savingsEntries error:", err);
        setEntries([]);
      }
    );

    return () => unsub();
  }, [fbUser]);

  // close dropdown outside click
  useEffect(() => {
    const onDown = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // On first open, AI asks
  useEffect(() => {
    speak(
      isHindi
        ? "आज आपने कितनी बचत की? रुपये में बताएं।"
        : "How much did you save today? Please say the amount in rupees."
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const displayName = fbUser?.displayName || (isHindi ? "अतिथि" : "Guest");
  const email = fbUser?.email || "";

  const initials = useMemo(() => {
    const src = (displayName || email || "U").trim();
    const parts = src.split(" ").filter(Boolean);
    if (parts.length >= 2)
      return (parts[0][0] + parts[1][0]).toUpperCase();
    return (src[0] || "U").toUpperCase();
  }, [displayName, email]);

  const profile = userDoc?.profile || {};
  const suggestions = useMemo(() => getSchemeSuggestions(profile, isHindi), [profile, isHindi]);

  // stats
  const monthTotal = useMemo(
    () => entries.reduce((sum, e) => sum + Number(e.amount || 0), 0),
    [entries]
  );
  const daysLogged = useMemo(() => {
    const set = new Set(entries.map((e) => e.dateKey));
    return set.size;
  }, [entries]);

  const avgDaily = useMemo(
    () => (daysLogged ? Math.round(monthTotal / daysLogged) : 0),
    [monthTotal, daysLogged]
  );
  const projectedMonthly = useMemo(() => avgDaily * 30, [avgDaily]);

  // Update allocation with translated names
  const allocation = useMemo(() => {
    const rawAllocation = getAllocation(projectedMonthly);
    return rawAllocation.map((item, index) => ({
      ...item,
      name: index === 0 ? translations.emergency : 
            index === 1 ? translations.safe : 
            translations.growth
    }));
  }, [projectedMonthly, translations.emergency, translations.safe, translations.growth]);

  // chart data
  const pieData = allocation.map((a) => ({ name: a.name, value: a.value }));
  const barData = [
    { name: translations.thisMonth, value: monthTotal },
    { name: translations.projected, value: projectedMonthly },
  ];

  const handleLogout = async () => {
    setMenuOpen(false);
    await signOut(auth);
    navigate("/signup", { replace: true });
  };

  const parseAmount = (txt) => {
    const digits = (txt || "").replace(/[^\d]/g, "");
    return digits || "";
  };

  // voice capture for amount
  const startListening = () => {
    setSavingError("");
    const rec = getRecognition();
    if (!rec) {
      setSavingError(translations.voiceNotSupported);
      return;
    }

    recognitionRef.current = rec;
    rec.lang = voiceLang;

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);

    rec.onerror = (e) => {
      console.error("Speech error:", e);
      setListening(false);
      setSavingError(translations.voiceCaptureFailed);
    };

    rec.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      setTodaySaving(parseAmount(transcript));
    };

    try {
      rec.start();
    } catch (e) {
      console.error(e);
      setSavingError(translations.voiceRecognitionFailed);
    }
  };

  const submitTodaySaving = async () => {
    setSavingError("");
    setSavingSuccess("");

    if (!fbUser?.uid) {
      setSavingError(translations.pleaseSignIn);
      return;
    }

    const amt = Number(todaySaving || 0);
    if (!amt || amt < 1) {
      setSavingError(translations.enterValidAmount);
      return;
    }

    try {
      await addSavingsEntry(fbUser.uid, amt);
      setTodaySaving("");
      setSavingSuccess(translations.savedSuccess);
      speak(isHindi ? "सेव हो गया।" : "Saved.");
    } catch (e) {
      console.error(e);
      setSavingError(translations.failedToSave);
    }
  };

  // Reset: delete all entries for current month
  const handleResetMonth = async () => {
    setResetMsg("");
    setSavingError("");
    setSavingSuccess("");

    if (!fbUser?.uid) {
      setResetMsg(translations.pleaseSignInReset);
      return;
    }

    const mustType = "DELETE";
    if (resetText.trim().toUpperCase() !== mustType) {
      setResetMsg(translations.resetConfirmText);
      return;
    }

    const ok = window.confirm(translations.confirmReset);
    if (!ok) return;

    try {
      setResetBusy(true);
      const monthKey = getMonthKey(new Date());
      const { deleted } = await deleteSavingsEntriesForMonth(
        fbUser.uid,
        monthKey
      );
      setResetText("");
      setResetMsg(
        deleted > 0
          ? (typeof translations.resetDone === 'function' 
              ? translations.resetDone(deleted) 
              : `Reset done. Deleted ${deleted} entries for this month.`)
          : translations.noEntriesToDelete
      );
    } catch (e) {
      console.error(e);
      setResetMsg(translations.resetFailed);
    } finally {
      setResetBusy(false);
    }
  };

  // Stable card style (no 3D transforms on chart parents)
  const chartCardClass =
    "rounded-3xl bg-white/90 backdrop-blur border border-gray-200 p-6 shadow-xl " +
    "transition-transform duration-200 ease-out will-change-transform hover:-translate-y-1";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 flex flex-col">
      {/* Navbar */}
      <header className="w-full bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={goHome}
            className="flex items-center gap-2.5"
          >
            <div className="h-9 w-9 rounded-xl bg-green-600 flex items-center justify-center shadow-md">
              <IndianRupee className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              DhanSaathi
            </span>
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <button
              type="button"
              onClick={goHome}
              className="flex items-center gap-1.5 hover:text-gray-900 transition"
            >
              <Home className="h-4 w-4" /> {translations.home}
            </button>
            <button
              type="button"
              onClick={goSchemes}
              className="flex items-center gap-1.5 hover:text-gray-900 transition"
            >
              <Building2 className="h-4 w-4" /> {translations.schemes}
            </button>
            <button
              type="button"
              onClick={goCommunity}
              className="flex items-center gap-1.5 hover:text-gray-900 transition"
            >
              <Sparkle className="h-4 w-4" /> {translations.community}
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-gray-900 transition"
              onClick={() => navigate("/learn")}
            >
              <BookOpen className="h-4 w-4" /> {translations.learn}
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-gray-900 transition"
              onClick={() => navigate("/help")}
            >
              <MessageSquare className="h-4 w-4" /> {translations.help}
            </button>
          </nav>

          <div className="flex items-center gap-3">
            {/* Language Toggle - Updated to match Dashboard */}
            <button
              type="button"
              onClick={toggleLanguage}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 transition hover:-translate-y-0.5"
            >
              <Globe className="h-4 w-4" />
              <span className="text-xs font-medium">
                {isHindi ? "हिंदी" : "English"}
              </span>
              <span className="text-xs text-gray-500">⇄</span>
            </button>

            <button
              type="button"
              className="hidden sm:inline-flex h-10 w-10 rounded-full bg-white border border-gray-200 shadow-sm items-center justify-center text-gray-700 hover:bg-gray-50"
              title={translations.notifications}
            >
              <Bell className="h-5 w-5" />
            </button>

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

              {menuOpen && (
                <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-white border border-gray-200 shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-4">
                    <p className="text-sm font-semibold text-gray-900">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 break-all">
                      {email || translations.notSignedIn}
                    </p>
                  </div>
                  <div className="h-px bg-gray-100" />
                  {fbUser ? (
                    <button
                      type="button"
                      className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" /> {translations.logout}
                    </button>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-10 space-y-6">
        {/* AI Coach input */}
        <div className="rounded-3xl bg-gradient-to-br from-emerald-200/60 via-white to-sky-100/70 p-[1px] shadow-[0_28px_90px_rgba(15,23,42,0.20)]">
          <div className="rounded-3xl bg-white/90 backdrop-blur border border-gray-200 p-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {translations.title}
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              {translations.subtitle}
            </p>

            <div className="mt-4 flex gap-3">
              <input
                value={todaySaving}
                onChange={(e) =>
                  setTodaySaving(e.target.value.replace(/[^\d]/g, ""))
                }
                placeholder={translations.placeholder}
                className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-200 bg-white"
              />

              <button
                type="button"
                onClick={startListening}
                disabled={listening}
                className={`h-12 w-12 rounded-2xl grid place-items-center border transition ${
                  listening
                    ? "bg-emerald-100 border-emerald-200 text-emerald-700"
                    : "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700"
                }`}
                title={translations.speakAmount}
              >
                <Mic className="h-6 w-6" />
              </button>

              <button
                type="button"
                onClick={submitTodaySaving}
                className="px-5 rounded-2xl bg-green-600 text-white font-semibold hover:bg-green-700"
              >
                {translations.save}
              </button>
            </div>

            {savingError && (
              <p className="mt-3 text-sm text-red-600">{savingError}</p>
            )}
            {savingSuccess && (
              <p className="mt-3 text-sm text-emerald-700">{savingSuccess}</p>
            )}

            {/* Reset / Delete all entries (this month) */}
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50/60 p-4">
              <p className="text-sm font-semibold text-red-800 flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                {translations.resetTitle}
              </p>
              <p className="text-xs text-red-700 mt-1">
                {translations.resetDescription}
              </p>

              <div className="mt-3 flex flex-col sm:flex-row gap-3">
                <input
                  value={resetText}
                  onChange={(e) => setResetText(e.target.value)}
                  placeholder={translations.resetPlaceholder}
                  className="flex-1 px-4 py-3 rounded-2xl border border-red-200 outline-none focus:ring-2 focus:ring-red-200 bg-white"
                />
                <button
                  type="button"
                  onClick={handleResetMonth}
                  disabled={resetBusy}
                  className={`px-5 py-3 rounded-2xl font-semibold text-white ${
                    resetBusy
                      ? "bg-red-400 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  {resetBusy ? translations.deleting : translations.deleteAll}
                </button>
              </div>

              {resetMsg && (
                <p className="mt-2 text-sm text-red-800">{resetMsg}</p>
              )}
            </div>
          </div>
        </div>

        {/* Graphs */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Allocation Pie */}
          <div className="rounded-3xl bg-gradient-to-br from-green-200/50 via-white to-blue-100/60 p-[1px]">
            <div className={chartCardClass}>
              <h2 className="text-lg font-bold text-gray-900">
                {translations.allocationTitle}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {translations.projectedMonthly}{" "}
                <span className="font-semibold">
                  {currency(projectedMonthly)}
                </span>
              </p>

              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#10B981" stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor="#34D399"
                          stopOpacity={1}
                        />
                      </linearGradient>
                      <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#60A5FA" stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor="#93C5FD"
                          stopOpacity={1}
                        />
                      </linearGradient>
                      <linearGradient id="g3" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor="#FBBF24"
                          stopOpacity={1}
                        />
                      </linearGradient>
                    </defs>

                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={90}
                      paddingAngle={3}
                      isAnimationActive={false}
                    >
                      {pieData.map((_, idx) => (
                        <Cell
                          key={idx}
                          fill={
                            idx === 0
                              ? "url(#g1)"
                              : idx === 1
                              ? "url(#g2)"
                              : "url(#g3)"
                          }
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v) => currency(v)} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
                {allocation.map((a) => (
                  <div
                    key={a.name}
                    className="rounded-2xl bg-gray-50 border border-gray-200 p-3"
                  >
                    <p className="font-semibold text-gray-900">{a.name}</p>
                    <p className="text-gray-600">{currency(a.value)}</p>
                  </div>
                ))}
              </div>

              <p className="text-xs text-gray-500 mt-3">
                {translations.note}
              </p>
            </div>
          </div>

          {/* Monthly chart */}
          <div className="rounded-3xl bg-gradient-to-br from-sky-200/50 via-white to-emerald-100/60 p-[1px]">
            <div className={chartCardClass}>
              <h2 className="text-lg font-bold text-gray-900">
                {translations.monthlyChartTitle}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {translations.avgDaily}{" "}
                <span className="font-semibold">{currency(avgDaily)}</span> •
                {translations.daysLogged}{" "}
                <span className="font-semibold">{daysLogged}</span>
              </p>

              <div className="mt-4 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <defs>
                      <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#16A34A" stopOpacity={1} />
                        <stop
                          offset="100%"
                          stopColor="#86EFAC"
                          stopOpacity={1}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="name" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => {
                        // Handle long text in XAxis
                        if (value.length > 10) {
                          return value.substring(0, 8) + '...';
                        }
                        return value;
                      }}
                    />
                    <Tooltip formatter={(v) => currency(v)} />
                    <Bar
                      dataKey="value"
                      fill="url(#barGrad)"
                      radius={[14, 14, 4, 4]}
                      isAnimationActive={false}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-4 rounded-2xl bg-gray-50 border border-gray-200 p-4">
                <p className="text-sm font-semibold text-gray-900">
                  {translations.aiSuggestions}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-700 list-disc pl-5">
                  {suggestions.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => navigate("/schemes")}
                  className="mt-4 px-4 py-2 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
                >
                  {translations.openSchemes}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent entries */}
        <div className="rounded-3xl bg-white/90 backdrop-blur border border-gray-200 shadow-xl p-6">
          <h3 className="text-lg font-bold text-gray-900">
            {translations.entriesTitle}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {translations.entriesSubtitle}
          </p>

          {entries.length === 0 ? (
            <p className="text-gray-600 mt-3">
              {translations.noEntries}
            </p>
          ) : (
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {entries
                .slice(-9)
                .reverse()
                .map((e) => (
                  <div
                    key={e.id}
                    className="rounded-2xl bg-gray-50 border border-gray-200 p-4"
                  >
                    <p className="text-xs text-gray-500">{e.dateKey}</p>
                    <p className="text-lg font-extrabold text-gray-900">
                      {currency(e.amount)}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}