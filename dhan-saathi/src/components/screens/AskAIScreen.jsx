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
  MessageSquare,
  Mic,
  Users,
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
`;

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

/* ----------------------- UI ----------------------- */
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

  if (!authReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading…
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>
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
              <button type="button" className="flex items-center gap-1.5 hover:text-emerald-700 transition group" onClick={() => navigat("learn")}>
                <BookOpen className="h-4 w-4 group-hover:scale-110 transition-transform" /> Learn
              </button>
              <button type="button" className="flex items-center gap-1.5 hover:text-emerald-700 transition group" onClick={() => alert("Help coming soon")}>
                <ShieldCheck className="h-4 w-4 group-hover:scale-110 transition-transform" /> Help
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
                      Ask AI (Schemes Helper)
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">
                      Suggestions use your saved profile (gender + age included).
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

                {/* Quick questions */}
                <div className="relative mt-5 flex flex-wrap gap-2">
                  {QUICK_QUESTIONS.map((q, index) => (
                    <button
                      key={q}
                      type="button"
                      onClick={() => send(q)}
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
                    <div className="text-sm text-gray-600 italic">
                      Ask a question to get personalized scheme recommendations...
                    </div>
                  ) : (
                    messages.map((m, idx) => (
                      <div
                        key={m.id}
                        className={`p-3 rounded-2xl border backdrop-blur-sm ${
                          m.role === "user"
                            ? "bg-emerald-50/90 border-emerald-100 ml-auto max-w-[85%] hover:-translate-y-0.5 transition-all"
                            : "bg-gray-50/90 border-gray-200 mr-auto max-w-[85%] hover:-translate-y-0.5 transition-all"
                        }`}
                        style={{ animation: `fadeInUp 0.4s ease-out ${idx * 0.05}s both` }}
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

                {/* Input */}
                <div className="relative mt-4 flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about schemes…"
                    className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-emerald-200 bg-white/90 backdrop-blur focus:bg-white transition-all"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") send(input);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => send(input)}
                    className="h-12 w-12 rounded-2xl bg-emerald-600 text-white grid place-items-center hover:bg-emerald-700 hover:scale-105 transition-all shadow-md hover:shadow-lg"
                    title="Send"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </div>

                <div className="relative mt-4 flex items-center gap-2">
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
                </div>
              </div>
            </aside>
          </div>
        </main>

        {/* Floating Voice Button with Pulse */}
        <div className="fixed bottom-6 right-6">
          <div
            className="absolute inset-0 rounded-full bg-emerald-400/30"
            style={{ animation: "micPulse 1.8s ease-out infinite" }}
          />
          <button
            className="relative h-16 w-16 rounded-full bg-green-600 shadow-2xl flex items-center justify-center text-white hover:bg-green-700 transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
            aria-label="Voice assistant"
            type="button"
            onClick={() => alert("Voice questions for Ask AI coming soon")}
          >
            <Mic className="h-7 w-7" />
          </button>
        </div>
      </div>
    </>
  );
}