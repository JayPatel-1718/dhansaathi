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
  const goToVerify = () => navigate("/verify-scheme"); // NEW: navigate to verification screen

  // auth + firestore
  const [fbUser, setFbUser] = useState(null);
  const [userDoc, setUserDoc] = useState(null);
  const [recentSchemes, setRecentSchemes] = useState([]);
  const [reminders, setReminders] = useState([]);

  // profile dropdown
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // reactive bg
  const [mouse, setMouse] = useState({ x: 280, y: 180 });

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

  // 4) reminders
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

  // daily goal
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

  // Track when user opens a scheme from "Recent Schemes" on dashboard
  const trackOpenRecentScheme = async (scheme) => {
    if (!fbUser?.uid || !scheme?.schemeId) return;

    try {
      // increment schemesViewed
      await setDoc(
        doc(db, "users", fbUser.uid),
        {
          "stats.schemesViewed": increment(1),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // update lastViewedAt for this scheme in recentSchemes
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

      // optional: log event
      await logEvent("scheme_view_from_dashboard", {
        schemeId: scheme.schemeId,
        title: scheme.title,
      });
    } catch (e) {
      console.error("trackOpenRecentScheme error:", e);
    }
  };

  // Open scheme from dashboard + update schemesViewed count
  const openSchemeFromDashboard = async (scheme) => {
    await trackOpenRecentScheme(scheme);
    navigate(`/schemes/${scheme.schemeId}`);
  };

  const features = [
    {
      title: "Schemes",
      subtitle: "Govt Benefits & Subsidies",
      icon: Building2,
      onClick: goToSchemes,
    },
    {
      title: "Verify Scam", // NEW CARD
      subtitle: "Check suspicious messages",
      icon: ShieldCheck,
      onClick: goToVerify,
    },
    {
      title: "Tracker",
      subtitle: "Daily Expense Monitor",
      icon: BarChart3,
      onClick: () => navigate("/tracker"),
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
    <>
      {/* Animations */}
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
        @keyframes micPulse {
          0% { transform: scale(0.90); opacity: 0.45; }
          70% { transform: scale(1.25); opacity: 0; }
          100% { transform: scale(1.25); opacity: 0; }
        }
      `}</style>

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
                className="hidden sm:inline-flex h-10 w-10 rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow-sm items-center justify-center text-gray-700 hover:bg-gray-50 transition hover:-translate-y-0.5"
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

                <div
                  className={`absolute right-0 mt-3 w-72 rounded-2xl bg-white/90 backdrop-blur border border-gray-200 shadow-xl overflow-hidden origin-top-right transition-all duration-200
                    ${menuOpen ? "opacity-100 scale-100 translate-y-0" : "pointer-events-none opacity-0 scale-95 -translate-y-2"}
                  `}
                >
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
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-[2.1fr,1fr]">
            {/* LEFT COLUMN */}
            <section className="space-y-6 lg:space-y-8">
              {/* Greeting + Stats (with sheen) */}
              <div className="relative overflow-hidden rounded-3xl bg-white/85 backdrop-blur-xl border border-gray-200 shadow-[0_28px_80px_rgba(15,23,42,0.12)] p-6 sm:p-8">
                {/* sheen overlay */}
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute -inset-y-10 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-xl animate-[sheen_8s_ease-in-out_infinite]" />
                </div>

                <div className="relative space-y-3">
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

                <div className="relative mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-green-50/90 border border-green-100 p-4 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md">
                    <p className="text-xs font-semibold text-green-800">
                      Schemes Viewed
                    </p>
                    <p className="text-2xl font-extrabold text-gray-900 mt-1">
                      {stats.schemesViewed || 0}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-emerald-50/90 border border-emerald-100 p-4 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md">
                    <p className="text-xs font-semibold text-emerald-800">
                      Schemes Listened
                    </p>
                    <p className="text-2xl font-extrabold text-gray-900 mt-1">
                      {stats.schemesListened || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* FEATURES GRID */}
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
                      <p className="text-sm text-gray-500 mt-1">{f.subtitle}</p>
                    </button>
                  );
                })}
              </div>

              {/* Recent Schemes */}
              <div className="rounded-3xl bg-white/85 backdrop-blur border border-gray-200 shadow-lg p-6 hover:shadow-xl transition-all">
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
                    No schemes viewed yet. Open{" "}
                    <span className="font-semibold">Schemes</span> to start.
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
                          <p className="font-semibold text-gray-900">{s.title}</p>
                          <p className="text-xs text-gray-600 mt-1">
                            {s.tag} • {s.type}
                          </p>
                        </div>
                        <span className="text-gray-400 text-lg leading-none">›</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Community Insights */}
              <div className="rounded-3xl bg-white/85 backdrop-blur border border-gray-200 shadow-lg p-6 hover:shadow-xl transition-all">
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
              <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-gray-200 shadow-xl p-6 hover:shadow-2xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Today's Tip
                  </h2>
                <Lightbulb className="h-7 w-7 text-amber-500" />
                </div>
                <p className="text-gray-700">
                  Saving just ₹50 a day can help you build an emergency fund over time.
                </p>
                <button
                  type="button"
                  onClick={speakTip}
                  className="mt-4 text-sm font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 hover:-translate-y-0.5 transition"
                >
                  <Volume2 className="h-4 w-4" /> Listen to Tip
                </button>
              </div>

              {/* Reminders */}
              <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-gray-200 shadow-xl p-6 hover:shadow-2xl transition-all">
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
                        className="flex items-center justify-between p-4 bg-blue-50/80 rounded-2xl border border-blue-100 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-md"
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
              <div className="rounded-3xl bg-white/85 backdrop-blur-xl border border-gray-200 shadow-xl p-6 hover:shadow-2xl transition-all">
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
                        transition: "transform 500ms ease",
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

        {/* Floating Voice Button (pulse ring) */}
        <div className="fixed bottom-6 right-6">
          <div
            className="absolute inset-0 rounded-full bg-emerald-400/30"
            style={{ animation: "micPulse 1.8s ease-out infinite" }}
          />
          <button
            className="relative h-16 w-16 rounded-full bg-green-600 shadow-2xl flex items-center justify-center text-white hover:bg-green-700 transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
            aria-label="Voice assistant"
            type="button"
            onClick={() => alert("Voice assistant coming soon")}
          >
            <Mic className="h-7 w-7" />
          </button>
        </div>
      </div>
    </>
  );
};

export default DashboardScreen;