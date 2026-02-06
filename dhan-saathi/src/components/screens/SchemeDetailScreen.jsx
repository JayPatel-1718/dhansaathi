// src/components/screens/SchemeDetailScreen.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import {
  addDoc,
  collection,
  doc,
  increment,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import {
  Home,
  Building2,
  Sparkle,
  BookOpen,
  MessageSquare,
  Mic,
  IndianRupee,
  Volume2,
  Bell,
  LogOut,
  Landmark,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { getSchemeById } from "../../data/schemes";

// Small reusable section wrapper
function DetailSection({ title, children }) {
  if (!children) return null;
  return (
    <section className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-5 md:p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      <h2 className="text-base md:text-lg font-bold text-slate-900 mb-3">
        {title}
      </h2>
      <div className="text-sm md:text-[15px] text-slate-700 space-y-2 leading-relaxed">
        {children}
      </div>
    </section>
  );
}

// Simple bullet list renderer
function BulletList({ items }) {
  if (!items || !items.length) return null;
  return (
    <ul className="list-disc list-inside space-y-1.5">
      {items.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  );
}

export default function SchemeDetailScreen() {
  const navigate = useNavigate();
  const { schemeId } = useParams();
  const location = useLocation();
  const fromList = location.state?.fromList || false;

  // Auth + profile dropdown (same pattern as SchemesScreen)
  const [fbUser, setFbUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setFbUser(u || null));
    return () => unsub();
  }, []);

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

  // Navbar navigation
  const goHome = () => navigate("/home");
  const goSchemes = () => navigate("/schemes");
  const goCommunity = () => navigate("/community");

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

  // Voice speak
  const speak = (text) => {
    try {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = "en-IN";
      window.speechSynthesis.speak(msg);
    } catch {
      // ignore
    }
  };

  // Get scheme from shared data
  const scheme = useMemo(() => getSchemeById(schemeId), [schemeId]);
  const details = scheme?.details || {};

  const schemeTypeLabel =
    scheme?.type === "govt"
      ? "Government Scheme"
      : scheme?.type === "bank"
      ? "Bank / Post Office Savings Product"
      : "";

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

  // Track view from detail page (for direct / dashboard entry)
  const trackViewFromDetail = async () => {
    if (!fbUser?.uid || !scheme) return;

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
        doc(db, "users", fbUser.uid, "recentSchemes", scheme.id),
        {
          schemeId: scheme.id,
          title: scheme.title,
          tag: scheme.tag,
          type: scheme.type,
          lastViewedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await logEvent("scheme_view_details_detail_page", {
        schemeId: scheme.id,
        title: scheme.title,
      });
    } catch (e) {
      console.error("trackViewFromDetail error:", e);
    }
  };

  // Track listen from detail page
  const trackListenFromDetail = async () => {
    if (!fbUser?.uid || !scheme) return;

    try {
      await setDoc(
        doc(db, "users", fbUser.uid),
        {
          "stats.schemesListened": increment(1),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await logEvent("scheme_listen_detail_page", {
        schemeId: scheme.id,
        title: scheme.title,
      });
    } catch (e) {
      console.error("trackListenFromDetail error:", e);
    }
  };

  // On mount / when auth or scheme loaded: track view
  // Only if we did NOT already track on list page
  useEffect(() => {
    if (!scheme || !fbUser) return;
    if (fromList) return; // already tracked in SchemesScreen
    trackViewFromDetail();
  }, [scheme, fbUser, fromList]);

  const handleListenOverview = async () => {
    speak(`${scheme.title}. ${details.headline || scheme.desc}`);
    await trackListenFromDetail();
  };

  // If scheme not found, show simple error state
  if (!scheme) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 flex flex-col">
        {/* Navbar (simplified) */}
        <header className="w-full bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <button
              type="button"
              onClick={goHome}
              className="flex items-center gap-2.5"
              aria-label="Go to Dashboard"
            >
              <div className="h-9 w-9 rounded-xl bg-green-600 flex items-center justify-center shadow-md">
                <IndianRupee className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                DhanSaathi
              </span>
            </button>
          </div>
        </header>

        <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 text-center shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
            <h1 className="text-xl font-bold text-slate-900 mb-2">
              Scheme not found
            </h1>
            <p className="text-sm text-slate-600 mb-4">
              The scheme you are trying to view does not exist or the link may be
              incorrect.
            </p>
            <button
              type="button"
              onClick={goSchemes}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to schemes
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 flex flex-col">
      {/* Navbar (same style as SchemesScreen) */}
      <header className="w-full bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          {/* Logo + Brand */}
          <button
            type="button"
            onClick={goHome}
            className="flex items-center gap-2.5"
            aria-label="Go to Dashboard"
          >
            <div className="h-9 w-9 rounded-xl bg-green-600 flex items-center justify-center shadow-md">
              <IndianRupee className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">
              DhanSaathi
            </span>
          </button>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <button
              type="button"
              onClick={goHome}
              className="flex items-center gap-1.5 hover:text-gray-900 transition"
            >
              <Home className="h-4 w-4" />
              Home
            </button>

            {/* Active: Schemes */}
            <button
              type="button"
              onClick={goSchemes}
              className="relative text-green-700 font-semibold flex items-center gap-1.5"
            >
              <Building2 className="h-4 w-4" />
              Schemes
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-green-600" />
            </button>

            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-gray-900 transition"
              onClick={goCommunity}
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

          {/* Right: bell + profile dropdown */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hidden sm:inline-flex h-10 w-10 rounded-full bg-white border border-gray-200 shadow-sm items-center justify-center text-gray-700 hover:bg-gray-50"
              title="Notifications"
              onClick={() => alert("Notifications coming soon")}
            >
              <Bell className="h-5 w-5" />
            </button>

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

      {/* Page content */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        {/* Back + breadcrumb */}
        <button
          type="button"
          onClick={goSchemes}
          className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to all schemes
        </button>

        {/* Header section */}
        <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-5 md:p-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] mb-6">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-[11px] font-extrabold tracking-wide px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  {scheme.tag}
                </span>

                {scheme.type === "bank" && (
                  <span className="text-[11px] font-extrabold tracking-wide px-2 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100 inline-flex items-center gap-1">
                    <Landmark className="h-3.5 w-3.5" />
                    Bank / Post Office
                  </span>
                )}

                {scheme.verified && (
                  <span className="text-xs font-semibold text-emerald-700">
                    ✅ Verified
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {scheme.title}
              </h1>

              {schemeTypeLabel && (
                <p className="text-sm text-slate-600 mt-1">{schemeTypeLabel}</p>
              )}

              <p className="text-sm text-slate-600 mt-3 max-w-2xl">
                {details.headline || scheme.desc}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleListenOverview}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition"
                >
                  <Volume2 className="h-4 w-4" />
                  Listen to overview
                </button>

                {scheme.source && (
                  <a
                    href={scheme.source}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Official source
                  </a>
                )}
              </div>
            </div>

            <div className="hidden sm:block">
              <div className="h-24 w-32 rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-50 border border-slate-100" />
            </div>
          </div>
        </div>

        {/* Main layout: details + sidebar */}
        <div className="grid gap-6 lg:grid-cols-[2.3fr,1.1fr]">
          {/* LEFT: Detailed sections */}
          <div className="space-y-5">
            <DetailSection title="What you get">
              <BulletList items={details.whatYouGet} />
            </DetailSection>

            <DetailSection title="Who can apply">
              <BulletList items={details.whoCanApply} />
            </DetailSection>

            <DetailSection title="How to apply">
              <BulletList items={details.howToApply} />
            </DetailSection>

            <DetailSection title="Documents you may need">
              <BulletList items={details.documentsRequired} />
            </DetailSection>

            <DetailSection title="Important points">
              <BulletList items={details.important} />
            </DetailSection>

            {details.links && details.links.length > 0 && (
              <DetailSection title="Useful links">
                <ul className="space-y-1.5 text-sm">
                  {details.links.map((link, idx) => (
                    <li key={idx}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-green-700 hover:text-green-800 font-semibold"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        <span>{link.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </DetailSection>
            )}

            <DetailSection title="Disclaimer">
              <p className="text-xs text-slate-500">
                This is a simplified, informational overview. Eligibility, benefits,
                amounts, interest rates and rules can change and may vary between
                states, banks and over time. Always confirm latest details from
                official Government / bank / post office sources or a qualified
                advisor before taking action.
              </p>
            </DetailSection>
          </div>

          {/* RIGHT: Quick summary sidebar */}
          <aside className="space-y-5">
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
              <h4 className="font-bold text-slate-900 mb-3">Quick summary</h4>
              <div className="space-y-3 text-sm text-slate-700">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500">Type</span>
                  <span className="font-semibold">
                    {schemeTypeLabel || "Scheme"}
                  </span>
                </div>
                <div className="flex items-start justify-between gap-2">
                  <span className="text-slate-500">Category</span>
                  <span className="font-semibold">{scheme.tag}</span>
                </div>
                {scheme.verified && (
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-slate-500">Status</span>
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold">
                      ✅ Verified
                    </span>
                  </div>
                )}
                {scheme.source && (
                  <div className="pt-1">
                    <p className="text-xs text-slate-500 mb-1">Official info</p>
                    <a
                      href={scheme.source}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 hover:text-green-800"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                      Open official website
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-amber-50/90 backdrop-blur border border-amber-200 rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span>🛡️</span>
                <h4 className="font-bold text-amber-900">Safety reminder</h4>
              </div>
              <p className="text-sm text-amber-900/80 leading-relaxed">
                DhanSaathi will never ask for your bank OTP, PIN, or password over
                voice or chat. Apply only through official Government websites,
                trusted bank/post office branches or authorised agents.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Bottom right voice widget + mic button */}
      <div className="fixed bottom-6 right-6 flex items-end gap-3">
        <div className="hidden md:block bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.10)]">
          <p className="text-sm text-slate-700">
            “Ask me: who can apply for this scheme?”
          </p>
        </div>

        <button
          type="button"
          className="h-16 w-16 rounded-full bg-green-600 shadow-2xl flex items-center justify-center text-white hover:bg-green-700 transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
          aria-label="Voice assistant"
          onClick={() =>
            speak(
              `How can I help you understand more about ${scheme.title} and its eligibility, benefits, and how to apply?`
            )
          }
        >
          <Mic className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
}