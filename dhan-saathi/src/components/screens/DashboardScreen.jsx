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
} from "firebase/firestore";

import {
  Home,
  Building2,
  Sparkle,
  BookOpen,
  MessageSquare,
  Mic,
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
} from "lucide-react";

const DashboardScreen = () => {
  const navigate = useNavigate();

  // navigation
  const goHome = () => navigate("/home");
  const goToSchemes = () => navigate("/schemes");
  const goToCommunity = () => navigate("/community");

  // auth + firestore
  const [fbUser, setFbUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [recentSchemes, setRecentSchemes] = useState([]);
  const [reminders, setReminders] = useState([]);

  // profile dropdown
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // 1) auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setFbUser(u || null));
    return () => unsub();
  }, []);

  // 2) user doc (stats)
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

  // 3) recent schemes
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

  // 4) reminders (empty for new users)
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

  // close dropdown on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const displayName = fbUser?.displayName || "Guest";
  const email = fbUser?.email || "";

  const initials = useMemo(() => {
    const src = (displayName || email || "U").trim();
    const parts = src.split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (src[0] || "U").toUpperCase();
  }, [displayName, email]);

  // stats start at 0
  const stats = userDoc?.stats || { schemesViewed: 0, schemesListened: 0 };

  // daily goal: based on activity
  const dailyTarget = 6;
  const dailyProgressRaw =
    (stats.schemesViewed || 0) + (stats.schemesListened || 0);
  const dailyProgressPct = Math.min(
    100,
    Math.round((dailyProgressRaw / dailyTarget) * 100)
  );

  const speakTip = () => {
    try {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(
        "Saving just fifty rupees daily can help build a strong emergency fund over time."
      );
      msg.lang = "en-IN";
      window.speechSynthesis.speak(msg);
    } catch {}
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await signOut(auth);
      navigate("/signup", { replace: true });
    } catch (e) {
      console.error(e);
      alert("Logout failed");
    }
  };

  const features = [
    {
      title: "Schemes",
      subtitle: "Govt Benefits & Subsidies",
      icon: Building2,
      onClick: goToSchemes,
    },
    {
      title: "Tracker",
      subtitle: "Daily Expense Monitor",
      icon: BarChart3,
      onClick: () => alert("Tracker coming soon"),
    },
{
  title: "Ask AI",
  subtitle: "Financial Voice Assistant",
  icon: MessageSquare,
  onClick: () => navigate("/ask-ai"),
},
    {
      title: "Learn",
      subtitle: "Financial Literacy Courses",
      icon: BookOpen,
      onClick: () => alert("Learn coming soon"),
    },
    {
      title: "Safety",
      subtitle: "Secure Document Vault",
      icon: ShieldCheck,
      onClick: () => alert("Safety coming soon"),
    },
    {
      title: "Profile",
      subtitle: "Manage Account Settings",
      icon: UserCog,
      onClick: () => alert("Profile coming soon"),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 flex flex-col">
      {/* Top Navbar */}
      <header className="w-full bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Logo + Brand */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-green-600 flex items-center justify-center shadow-md">
              <IndianRupee className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              DhanSaathi
            </span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <button
              type="button"
              onClick={goHome}
              className="relative text-green-700 font-semibold"
            >
              <Home className="inline h-4 w-4 mr-1.5 -mt-0.5" />
              Home
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-green-600" />
            </button>

            <button
              type="button"
              onClick={goToSchemes}
              className="flex items-center gap-1.5 hover:text-gray-900 transition"
            >
              <Building2 className="h-4 w-4" />
              Schemes
            </button>

            <button
              type="button"
              onClick={goToCommunity}
              className="flex items-center gap-1.5 hover:text-gray-900 transition"
            >
              <Sparkle className="h-4 w-4" />
              Community
            </button>

            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-gray-900 transition"
              onClick={() => alert("Learn coming soon")}
            >
              <BookOpen className="h-4 w-4" />
              Learn
            </button>

            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-gray-900 transition"
              onClick={() => alert("Help coming soon")}
            >
              <MessageSquare className="h-4 w-4" />
              Help
            </button>
          </nav>

          {/* Right side: bell + profile */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hidden sm:inline-flex h-10 w-10 rounded-full bg-white border border-gray-200 shadow-sm items-center justify-center text-gray-700 hover:bg-gray-50"
              title="Notifications"
              onClick={() => alert("Notifications coming soon")}
            >
              <Bell className="h-5 w-5" />
            </button>

            {/* Profile dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-emerald-500 shadow flex items-center justify-center text-white font-semibold"
                aria-label="Account menu"
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
                <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-white border border-gray-200 shadow-xl overflow-hidden">
                  <div className="px-4 py-4">
                    <p className="text-sm font-semibold text-gray-900">
                      {displayName}
                    </p>
                    <p className="text-xs text-gray-600 mt-1 break-all">
                      {email || "Not signed in"}
                    </p>
                  </div>

                  <div className="h-px bg-gray-100" />

                  {fbUser ? (
                    <button
                      type="button"
                      className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-4 w-4" />
                      Logout
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="w-full px-4 py-3 text-left text-sm text-green-700 hover:bg-green-50"
                      onClick={() => navigate("/signup")}
                    >
                      Sign in
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[2.1fr,1fr]">
          {/* LEFT COLUMN */}
          <section className="space-y-6 lg:space-y-8">
            {/* Greeting + Stats */}
            <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-gray-200 shadow-xl p-6 sm:p-8">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                  Namaste, {displayName}!
                </p>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Welcome to your dashboard
                </h1>
                <p className="text-base text-gray-600">
                  First-time users start at 0. Your dashboard grows as you explore.
                </p>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-green-50 border border-green-100 p-4">
                  <p className="text-xs font-semibold text-green-800">
                    Schemes Viewed
                  </p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1">
                    {stats.schemesViewed || 0}
                  </p>
                </div>
                <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                  <p className="text-xs font-semibold text-emerald-800">
                    Schemes Listened
                  </p>
                  <p className="text-2xl font-extrabold text-gray-900 mt-1">
                    {stats.schemesListened || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* ✅ FEATURES GRID (exactly like your screenshot style) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <button
                    key={f.title}
                    type="button"
                    onClick={f.onClick}
                    className="text-left rounded-2xl bg-white/90 backdrop-blur border border-gray-200 shadow-sm hover:shadow-md transition p-6"
                  >
                    <div className="h-12 w-12 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">
                      {f.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{f.subtitle}</p>
                  </button>
                );
              })}
            </div>

            {/* Recent Schemes */}
            <div className="rounded-3xl bg-white/90 backdrop-blur border border-gray-200 shadow-lg p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Schemes
                </h2>
                <button
                  type="button"
                  onClick={goToSchemes}
                  className="text-sm font-medium text-green-700 hover:text-green-800"
                >
                  Explore →
                </button>
              </div>

              {recentSchemes.length === 0 ? (
                <p className="text-gray-600">
                  No schemes viewed yet. Open <span className="font-semibold">Schemes</span> to start.
                </p>
              ) : (
                <div className="space-y-3 mt-4">
                  {recentSchemes.map((s) => (
                    <div
                      key={s.schemeId}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100"
                    >
                      <div>
                        <p className="font-semibold text-gray-900">{s.title}</p>
                        <p className="text-xs text-gray-600 mt-1">
                          {s.tag} • {s.type}
                        </p>
                      </div>
                      <span className="text-gray-400">›</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Community Insights */}
            <div className="rounded-3xl bg-white/90 backdrop-blur border border-gray-200 shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Community Insights
              </h2>
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-xl bg-green-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-700" />
                </div>
                <div>
                  <p className="text-gray-800">
                    Start exploring schemes to see insights based on your activity.
                  </p>
                  <button
                    type="button"
                    onClick={goToCommunity}
                    className="mt-2 text-sm font-medium text-green-700 hover:text-green-800"
                  >
                    Go to Community →
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* RIGHT COLUMN */}
          <section className="space-y-6 lg:space-y-8">
            {/* Today's Tip */}
            <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-gray-200 shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Today's Tip</h2>
                <Lightbulb className="h-7 w-7 text-amber-500" />
              </div>
              <p className="text-gray-700">
                Saving just ₹50 a day can help you build an emergency fund over time.
              </p>
              <button
                type="button"
                onClick={speakTip}
                className="mt-4 text-sm font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
              >
                <Volume2 className="h-4 w-4" /> Listen to Tip
              </button>
            </div>

            {/* Reminders */}
            <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-gray-200 shadow-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Reminders
              </h2>

              {reminders.length === 0 ? (
                <div className="text-gray-600">
                  <p>No reminders yet.</p>
                  <button
                    type="button"
                    onClick={() => alert("Add Reminder coming soon")}
                    className="mt-3 text-sm font-medium text-green-700 hover:text-green-800"
                  >
                    Add a reminder →
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {reminders.map((r) => (
                    <div
                      key={r.id}
                      className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl"
                    >
                      <div className="flex items-center gap-3">
                        <Calendar className="h-6 w-6 text-blue-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            {r.title || "Reminder"}
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

            {/* Daily Goal */}
            <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-gray-200 shadow-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">
                Daily Goal
              </h2>

              <div className="flex items-center gap-4">
                <div className="relative h-20 w-20">
                  <div className="absolute inset-0 rounded-full border-[6px] border-gray-200" />
                  <div
                    className="absolute inset-0 rounded-full border-[6px] border-transparent"
                    style={{
                      borderTopColor: "#16a34a",
                      borderRightColor: "#16a34a",
                      transform: `rotate(${Math.min(
                        360,
                        (dailyProgressPct / 100) * 360
                      )}deg)`,
                      borderRadius: "9999px",
                    }}
                  />
                  <div className="absolute inset-[10px] rounded-full bg-white flex items-center justify-center shadow-inner">
                    <span className="text-sm font-semibold text-gray-900">
                      {dailyProgressPct}%
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {dailyProgressRaw}/{dailyTarget} actions
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    View or listen to schemes to complete your daily goal.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Floating Voice Button */}
      <button
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-green-600 shadow-2xl flex items-center justify-center text-white hover:bg-green-700 transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
        aria-label="Voice assistant"
        type="button"
      >
        <Mic className="h-7 w-7" />
      </button>
    </div>
  );
};

export default DashboardScreen;