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
  IndianRupee,
  Volume2,
  Bell,
  LogOut,
  Landmark,
  ArrowLeft,
  ExternalLink,
  Play,
  Youtube,
} from "lucide-react";
import { getSchemeById } from "../../data/schemes";

/* ───────────────────────────────────────────────
   YouTube video mapping — keys match scheme IDs
   exactly from src/data/schemes.js
   ─────────────────────────────────────────────── */
const SCHEME_VIDEOS = {
  "stand-up-india": {
    videoId: "x80lfYGxjH8",
    url: "https://youtu.be/x80lfYGxjH8?si=tpHg0JAraCGwkKCt",
    title: "Stand Up India Scheme – Complete Guide",
    description:
      "Learn everything about the Stand Up India Scheme including eligibility, loan amount, how to apply, and key benefits for SC/ST and women entrepreneurs.",
  },
  "pm-kisan": {
    videoId: "xsqBqK15Bz8",
    url: "https://youtu.be/xsqBqK15Bz8?si=Z2j2MoQ-jHUD4eqk",
    title: "PM Kisan Samman Nidhi – Full Explanation",
    description:
      "Understand PM Kisan Samman Nidhi Yojana – ₹6,000 per year for farmers. Who is eligible, how to register, and how to check your payment status.",
  },
  mudra: {
    videoId: "LwMYQI7Rh0Y",
    url: "https://youtu.be/LwMYQI7Rh0Y?si=QxUxdMNsL9HFuSGk",
    title: "Pradhan Mantri Mudra Yojana – Detailed Guide",
    description:
      "Everything about MUDRA Loans – Shishu, Kishore & Tarun categories. Loan amounts up to ₹10 lakh without collateral for small businesses.",
  },
  apy: {
    videoId: "FKIWVHHtxnA",
    url: "https://youtu.be/FKIWVHHtxnA?si=lasEm9zE9f5Wmh8y",
    title: "Atal Pension Yojana (APY) – Complete Overview",
    description:
      "Learn about Atal Pension Yojana – guaranteed monthly pension of ₹1,000 to ₹5,000 after age 60. Eligibility, contribution chart, and how to enrol.",
  },
  pmjjby: {
    videoId: "ZZ6-er521j0",
    url: "https://youtu.be/ZZ6-er521j0?si=yoDzsrtVsZlmg_Oy",
    title: "PM Jeevan Jyoti Bima Yojana – Explained",
    description:
      "₹2 lakh life insurance cover at just ₹436/year. Who can apply, how to enrol through your bank, and what your family receives.",
  },
  pmsby: {
    videoId: "qHM1V_nOFbE",
    url: "https://youtu.be/qHM1V_nOFbE?si=y1CENfyGUOY-cGZB",
    title: "PM Suraksha Bima Yojana – Full Details",
    description:
      "Accidental insurance cover of ₹2 lakh at just ₹20/year. Understand the scheme benefits, claim process, and how to activate it via your bank.",
  },
  "pm-svanidhi": {
    videoId: "36pkdhPFIqs",
    url: "https://youtu.be/36pkdhPFIqs?si=9sr7NCJK1gln9yLr",
    title: "PM SVANidhi – Street Vendor Loan Scheme",
    description:
      "Micro-credit facility for street vendors – loans up to ₹50,000 with interest subsidy and digital payment incentives. Full application guide.",
  },
  "ab-pmjay": {
    videoId: "SToefGBjhbM",
    url: "https://youtu.be/SToefGBjhbM?si=IgADSvHQ_RKkGpuN",
    title: "Ayushman Bharat PM-JAY – Health Insurance Explained",
    description:
      "₹5 lakh health insurance per family per year. Check eligibility, find empanelled hospitals, and understand how to get your Ayushman card.",
  },
};

/* ───────────────────────────────────────────────
   YouTube Video Section Component
   ─────────────────────────────────────────────── */
function YouTubeVideoSection({ schemeId }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const videoData = SCHEME_VIDEOS[schemeId];

  if (!videoData) return null;

  const thumbnailUrl = `https://img.youtube.com/vi/${videoData.videoId}/hqdefault.jpg`;

  return (
    <section className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl overflow-hidden shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
      {/* Section Header */}
      <div className="px-5 md:px-6 pt-5 md:pt-6 pb-3">
        <div className="flex items-center gap-2.5 mb-1">
          <div className="h-8 w-8 rounded-lg bg-red-50 flex items-center justify-center">
            <Youtube className="h-4 w-4 text-red-600" />
          </div>
          <h2 className="text-base md:text-lg font-bold text-slate-900">
            Watch & Learn
          </h2>
        </div>
        <p className="text-sm text-slate-500 ml-[42px]">
          Watch this video to understand the scheme in simple language
        </p>
      </div>

      {/* Video Embed / Thumbnail */}
      <div className="px-5 md:px-6 pb-2">
        <div className="relative w-full rounded-2xl overflow-hidden bg-slate-900 shadow-lg border border-slate-200/50">
          <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
            {isPlaying ? (
              <iframe
                className="absolute inset-0 w-full h-full"
                src={`https://www.youtube.com/embed/${videoData.videoId}?autoplay=1&rel=0&modestbranding=1`}
                title={videoData.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                style={{ border: "none" }}
              />
            ) : (
              <>
                <img
                  src={thumbnailUrl}
                  alt={videoData.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-black/10" />

                <button
                  type="button"
                  onClick={() => setIsPlaying(true)}
                  className="absolute inset-0 flex items-center justify-center group cursor-pointer"
                  aria-label={`Play video: ${videoData.title}`}
                >
                  <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-red-500/30 animate-ping" />
                    <div className="relative h-16 w-16 md:h-20 md:w-20 rounded-full bg-red-600 shadow-2xl flex items-center justify-center group-hover:bg-red-700 group-hover:scale-110 transition-all duration-300">
                      <Play
                        className="h-7 w-7 md:h-9 md:w-9 text-white ml-1"
                        fill="white"
                      />
                    </div>
                  </div>
                </button>

                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-black/70 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-lg">
                  <Youtube className="h-3.5 w-3.5 text-red-400" />
                  YouTube
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="px-5 md:px-6 py-4">
        <h3 className="text-sm md:text-[15px] font-bold text-slate-900 leading-snug">
          {videoData.title}
        </h3>
        <p className="text-xs md:text-sm text-slate-600 mt-1.5 leading-relaxed">
          {videoData.description}
        </p>

        <div className="flex flex-wrap items-center gap-2.5 mt-3.5">
          {!isPlaying && (
            <button
              type="button"
              onClick={() => setIsPlaying(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition shadow-md shadow-red-200"
            >
              <Play className="h-4 w-4" fill="white" />
              Play Video
            </button>
          )}

          <a
            href={videoData.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
          >
            <ExternalLink className="h-4 w-4" />
            Open on YouTube
          </a>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────
   Sidebar Video Card Component
   ─────────────────────────────────────────────── */
function SidebarVideoCard({ schemeId }) {
  const videoData = SCHEME_VIDEOS[schemeId];
  if (!videoData) return null;

  const thumbnailUrl = `https://img.youtube.com/vi/${videoData.videoId}/mqdefault.jpg`;

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 backdrop-blur border border-red-200/60 rounded-3xl p-5 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center">
          <Youtube className="h-4 w-4 text-red-600" />
        </div>
        <h4 className="font-bold text-red-900 text-sm">Video explainer</h4>
      </div>

      {/* Mini thumbnail */}
      <a
        href={videoData.url}
        target="_blank"
        rel="noreferrer"
        className="block relative w-full rounded-xl overflow-hidden mb-3 group"
      >
        <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
          <img
            src={thumbnailUrl}
            alt={videoData.title}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-red-600 shadow-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Play className="h-5 w-5 text-white ml-0.5" fill="white" />
            </div>
          </div>
        </div>
      </a>

      <p className="text-xs text-red-900/70 mb-3 leading-relaxed line-clamp-2">
        {videoData.description}
      </p>
      <a
        href={videoData.url}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition shadow-md shadow-red-200"
      >
        <Play className="h-3.5 w-3.5" fill="white" />
        Watch on YouTube
      </a>
    </div>
  );
}

/* ───────────────────────────────────────────────
   Small reusable section wrapper
   ─────────────────────────────────────────────── */
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

/* ───────────────────────────────────────────────
   Simple bullet list renderer
   ─────────────────────────────────────────────── */
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

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════ */
export default function SchemeDetailScreen() {
  const navigate = useNavigate();
  const { schemeId } = useParams();
  const location = useLocation();
  const fromList = location.state?.fromList || false;

  const [fbUser, setFbUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setFbUser(u || null));
    return () => unsub();
  }, []);

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

  const scheme = useMemo(() => getSchemeById(schemeId), [schemeId]);
  const details = scheme?.details || {};

  const schemeTypeLabel =
    scheme?.type === "govt"
      ? "Government Scheme"
      : scheme?.type === "bank"
      ? "Bank / Post Office Savings Product"
      : "";

  const hasVideo = scheme ? !!SCHEME_VIDEOS[scheme.id] : false;

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

  useEffect(() => {
    if (!scheme || !fbUser) return;
    if (fromList) return;
    trackViewFromDetail();
  }, [scheme, fbUser, fromList]);

  const handleListenOverview = async () => {
    speak(`${scheme.title}. ${details.headline || scheme.desc}`);
    await trackListenFromDetail();
  };

  // If scheme not found
  if (!scheme) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 flex flex-col">
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
              The scheme you are trying to view does not exist or the link may
              be incorrect.
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
      {/* ── Navbar ── */}
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

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <button
              type="button"
              onClick={goHome}
              className="flex items-center gap-1.5 hover:text-gray-900 transition"
            >
              <Home className="h-4 w-4" />
              Home
            </button>

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

      {/* ── Page Content ── */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
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

                {hasVideo && (
                  <span className="text-[11px] font-extrabold tracking-wide px-2 py-1 rounded-full bg-red-50 text-red-600 border border-red-100 inline-flex items-center gap-1">
                    <Play className="h-3 w-3" fill="currentColor" />
                    Video Available
                  </span>
                )}
              </div>

              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
                {scheme.title}
              </h1>

              {schemeTypeLabel && (
                <p className="text-sm text-slate-600 mt-1">
                  {schemeTypeLabel}
                </p>
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
  {scheme.image ? (
    <img
      src={scheme.image}
      alt={scheme.title}
      className="h-24 w-32 object-cover rounded-2xl border border-slate-200 shadow-md"
    />
  ) : (
    <div className="h-24 w-32 rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-50 border border-slate-100" />
  )}
</div>

          </div>
        </div>

        {/* ── Main layout: details + sidebar ── */}
        <div className="grid gap-6 lg:grid-cols-[2.3fr,1.1fr]">
          {/* LEFT */}
          <div className="space-y-5">
            {/* ★ YouTube Video Section */}
            <YouTubeVideoSection schemeId={scheme.id} />

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
                This is a simplified, informational overview. Eligibility,
                benefits, amounts, interest rates and rules can change and may
                vary between states, banks and over time. Always confirm latest
                details from official Government / bank / post office sources or
                a qualified advisor before taking action.
              </p>
            </DetailSection>
          </div>

          {/* RIGHT: Sidebar */}
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

            {/* Sidebar Video Card */}
            <SidebarVideoCard schemeId={scheme.id} />

            <div className="bg-amber-50/90 backdrop-blur border border-amber-200 rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span>🛡️</span>
                <h4 className="font-bold text-amber-900">Safety reminder</h4>
              </div>
              <p className="text-sm text-amber-900/80 leading-relaxed">
                DhanSaathi will never ask for your bank OTP, PIN, or password
                over voice or chat. Apply only through official Government
                websites, trusted bank/post office branches or authorised
                agents.
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Voice widget removed */}
    </div>
  );
}