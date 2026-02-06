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
  onSnapshot as onSnap,
} from "firebase/firestore";
import { ensureChatSession, addChatMessage } from "../../services/aiChatService";

import {
  Home,
  Building2,
  Sparkle,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  Bell,
  LogOut,
  IndianRupee,
  Send,
  Sparkles as SparklesIcon,
} from "lucide-react";

const SCHEMES = [
  {
    id: "pm-kisan",
    tag: "FARMER",
    title: "PM Kisan Samman Nidhi",
    desc: "Annual income support of ₹6,000 in three installments for eligible farmer families.",
  },
  {
    id: "mudra",
    tag: "SMALL BUSINESS",
    title: "Pradhan Mantri Mudra Yojana (PMMY)",
    desc: "Loans up to ₹10 Lakh for micro and small businesses.",
  },
  {
    id: "mahila-savings",
    tag: "WOMEN",
    title: "Mahila Samman Savings Certificate",
    desc: "Small savings scheme with fixed interest (safe savings option).",
  },
];

const QUICK_QUESTIONS = [
  "Which scheme is best for me?",
  "I am a farmer. What should I apply for?",
  "I run a small shop. Any support schemes?",
  "Suggest safe saving options",
];

function normalize(str = "") {
  return str.toLowerCase().trim();
}

function getRecommendations(profile, question) {
  const q = normalize(question);
  const occ = normalize(profile?.occupation || "");
  const income = Number(profile?.monthlyIncome || 0);

  const recIds = [];

  const looksFarmer =
    q.includes("farmer") || q.includes("kisan") || occ.includes("farmer") || occ.includes("kisan");

  const looksBusiness =
    q.includes("business") || q.includes("shop") || occ.includes("business") || occ.includes("shop") || occ.includes("vendor");

  const looksWomen = q.includes("women") || q.includes("mahila");

  if (looksFarmer) recIds.push("pm-kisan");
  if (looksBusiness) recIds.push("mudra");
  if (looksWomen) recIds.push("mahila-savings");

  if (recIds.length === 0) {
    if (income > 0 && income <= 15000) recIds.push("pm-kisan", "mudra");
    else if (income > 15000) recIds.push("mahila-savings", "mudra");
    else recIds.push("pm-kisan", "mudra", "mahila-savings");
  }

  return [...new Set(recIds)]
    .map((id) => SCHEMES.find((s) => s.id === id))
    .filter(Boolean);
}

export default function AskAIScreen() {
  const navigate = useNavigate();
  const [fbUser, setFbUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  const [userDoc, setUserDoc] = useState(null);

  // dropdown
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // chat
  const [sessionId, setSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const goHome = () => navigate("/home");
  const goSchemes = () => navigate("/schemes");
  const goCommunity = () => navigate("/community");

  // ✅ Auth state (DO NOT redirect if null — allow guest mode)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFbUser(u || null);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  // ✅ User profile (only if logged in)
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

  // close dropdown outside click
  useEffect(() => {
    const onDown = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // ✅ Firestore chat only for logged in users
  useEffect(() => {
    if (!fbUser) {
      setSessionId(null);
      setMessages([]);
      return;
    }

    (async () => {
      const sid = await ensureChatSession(fbUser.uid, null);
      setSessionId(sid);

      const qy = query(
        collection(db, "users", fbUser.uid, "aiChats", sid, "messages"),
        orderBy("createdAt", "asc")
      );

      const unsub = onSnap(qy, (snap) => {
        const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setMessages(rows);
      });

      return () => unsub();
    })();
  }, [fbUser]);

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
      ? (profileComplete
          ? `Based on your profile (occupation: ${profile.occupation || "—"}, income: ₹${profile.monthlyIncome || 0}/month), here are suggestions:`
          : `Your profile is incomplete. For better results, complete voice setup. For now:`
        )
      : `You are using Guest mode. Sign in to save chat and get better personalization. For now:`;

    const list = recs.map((s, i) => `${i + 1}) ${s.title} — ${s.desc}`).join("\n");

    return {
      text: `${intro}\n\n${list}\n\nOpen Schemes to view details.`,
      recommendedSchemeIds: recs.map((r) => r.id),
    };
  };

  // ✅ send in both modes (logged in: save to Firestore; guest: local state)
  const send = async (text) => {
    const q = (text || "").trim();
    if (!q) return;

    setInput("");

    // If not logged in => local messages only
    if (!fbUser) {
      const assistant = buildAssistantResponse(q);
      setMessages((prev) => [
        ...prev,
        { id: `u_${Date.now()}`, role: "user", text: q },
        { id: `a_${Date.now()}`, role: "assistant", text: assistant.text, meta: assistant },
      ]);
      return;
    }

    // Logged in => Firestore persistence
    if (!sessionId) return;

    await addChatMessage(fbUser.uid, sessionId, "user", q);

    const assistant = buildAssistantResponse(q);
    await addChatMessage(fbUser.uid, sessionId, "assistant", assistant.text, {
      recommendedSchemeIds: assistant.recommendedSchemeIds,
    });
  };

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 flex flex-col">
      {/* Navbar */}
      <header className="w-full bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <button type="button" onClick={goHome} className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-green-600 flex items-center justify-center shadow-md">
              <IndianRupee className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900">DhanSaathi</span>
          </button>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <button type="button" onClick={goHome} className="flex items-center gap-1.5 hover:text-gray-900 transition">
              <Home className="h-4 w-4" /> Home
            </button>
            <button type="button" onClick={goSchemes} className="flex items-center gap-1.5 hover:text-gray-900 transition">
              <Building2 className="h-4 w-4" /> Schemes
            </button>
            <button type="button" onClick={goCommunity} className="flex items-center gap-1.5 hover:text-gray-900 transition">
              <Sparkle className="h-4 w-4" /> Community
            </button>
            <button type="button" className="flex items-center gap-1.5 hover:text-gray-900 transition" onClick={() => alert("Learn coming soon")}>
              <BookOpen className="h-4 w-4" /> Learn
            </button>
            <button type="button" className="flex items-center gap-1.5 hover:text-gray-900 transition" onClick={() => alert("Help coming soon")}>
              <ShieldCheck className="h-4 w-4" /> Help
            </button>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              className="hidden sm:inline-flex h-10 w-10 rounded-full bg-white border border-gray-200 shadow-sm items-center justify-center text-gray-700 hover:bg-gray-50"
              title="Notifications"
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
                  <img src={fbUser.photoURL} alt="Profile" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <span>{initials}</span>
                )}
              </button>

              {menuOpen && (
                <div className="absolute right-0 mt-3 w-72 rounded-2xl bg-white border border-gray-200 shadow-xl overflow-hidden">
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
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Page */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          <section className="rounded-3xl bg-white/90 backdrop-blur border border-gray-200 shadow-xl p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <SparklesIcon className="h-6 w-6 text-emerald-600" />
                  Ask AI (Schemes Helper)
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  Ask what scheme to explore. Suggestions use your saved profile if available.
                </p>
              </div>

              {fbUser && !profileComplete && (
                <button
                  type="button"
                  onClick={() => navigate("/voice-setup")}
                  className="px-4 py-2 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-100 text-sm font-semibold hover:bg-emerald-100"
                >
                  Complete profile →
                </button>
              )}
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {QUICK_QUESTIONS.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => send(q)}
                  className="px-3 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm text-gray-700 hover:bg-white"
                >
                  {q}
                </button>
              ))}
            </div>

            <div className="mt-6 h-[420px] overflow-auto rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-sm text-gray-600">
                  Ask a question to get scheme recommendations.
                </div>
              ) : (
                messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-3 rounded-2xl border ${
                      m.role === "user"
                        ? "bg-emerald-50 border-emerald-100 ml-auto max-w-[85%]"
                        : "bg-gray-50 border-gray-200 mr-auto max-w-[85%]"
                    }`}
                  >
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      {m.role === "user" ? "You" : "DhanSaathi AI"}
                    </div>
                    <pre className="text-sm text-gray-800 whitespace-pre-wrap font-sans">
                      {m.text}
                    </pre>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about schemes…"
                className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-200 bg-white"
              />
              <button
                type="button"
                onClick={() => send(input)}
                className="h-12 w-12 rounded-2xl bg-emerald-600 text-white grid place-items-center hover:bg-emerald-700"
                title="Send"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => navigate("/schemes")}
                className="px-4 py-2 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700"
              >
                Open Schemes
              </button>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-3xl bg-white/90 backdrop-blur border border-gray-200 shadow-xl p-6">
              <h2 className="text-lg font-bold text-gray-900">Your Profile</h2>
              <div className="mt-3 text-sm text-gray-700 space-y-2">
                <div>
                  <span className="text-gray-500">Name:</span>{" "}
                  <span className="font-semibold">{profile?.name || displayName}</span>
                </div>
                <div>
                  <span className="text-gray-500">Occupation:</span>{" "}
                  <span className="font-semibold">{profile?.occupation || "—"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Monthly Income:</span>{" "}
                  <span className="font-semibold">
                    {profile?.monthlyIncome ? `₹${profile.monthlyIncome}` : "—"}
                  </span>
                </div>
              </div>

              {fbUser ? (
                <button
                  type="button"
                  onClick={() => navigate("/voice-setup")}
                  className="mt-4 w-full px-4 py-3 rounded-2xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-white"
                >
                  Edit profile via voice →
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate("/signup")}
                  className="mt-4 w-full px-4 py-3 rounded-2xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
                >
                  Sign in for personalization →
                </button>
              )}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}