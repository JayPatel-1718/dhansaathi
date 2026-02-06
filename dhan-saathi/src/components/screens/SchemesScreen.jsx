// src/components/screens/SchemesScreen.jsx
import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Building2,
  Sparkle,
  BookOpen,
  MessageSquare,
  Trophy,
  CircleDollarSign,
  Mic,
  IndianRupee,
  Volume2,
} from "lucide-react";

const schemesData = [
  {
    id: "pm-kisan",
    type: "govt",
    tag: "FARMER",
    verified: true,
    title: "PM Kisan Samman Nidhi",
    desc:
      "Eligible farmer families receive an annual income support of ₹6,000 in three equal installments directly to their bank accounts.",
  },
  {
    id: "mudra",
    type: "govt",
    tag: "SMALL BUSINESS",
    verified: true,
    title: "Pradhan Mantri Mudra Yojana (PMMY)",
    desc:
      "Financial assistance up to ₹10 Lakh for micro enterprises for manufacturing, trading, and service sector activities.",
  },
  {
    id: "mahila-savings",
    type: "bank",
    tag: "WOMEN",
    verified: true,
    title: "Mahila Samman Savings Certificate",
    desc:
      "A one-time small savings scheme for women with a fixed interest rate (tenure based).",
  },
];

const trending = [
  { title: "Sukanya Samriddhi Yojana", views: "12.4k people viewed today" },
  { title: "Atal Pension Yojana", views: "8.1k people viewed today" },
  { title: "Post Office Savings Account", views: "5.2k people viewed today" },
];

export default function SchemesScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("govt"); // govt | bank | my
  const [query, setQuery] = useState("");

  const goHome = () => navigate("/home");
  const goSchemes = () => navigate("/schemes");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();

    const myIds = new Set(
      JSON.parse(localStorage.getItem("dhan-saathi-my-schemes") || "[]")
    );

    return schemesData.filter((s) => {
      const matchesTab =
        tab === "my"
          ? myIds.has(s.id)
          : tab === "govt"
          ? s.type === "govt"
          : s.type === "bank";

      const matchesQuery =
        !q ||
        s.title.toLowerCase().includes(q) ||
        s.desc.toLowerCase().includes(q) ||
        s.tag.toLowerCase().includes(q);

      return matchesTab && matchesQuery;
    });
  }, [tab, query]);

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

  const handleViewDetails = (scheme) => {
    alert(`Open details for: ${scheme.title}`);
  };

  const pillBase = "px-4 py-2 rounded-full text-sm font-semibold border transition";
  const pillActive = "bg-white border-slate-200 text-slate-900 shadow-sm";
  const pillIdle =
    "bg-slate-50 border-transparent text-slate-600 hover:bg-white hover:border-slate-200";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 flex flex-col">
      {/* ✅ SAME NAVBAR AS DASHBOARD */}
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
              onClick={() => alert("Community coming soon")}
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

          {/* Level + points + avatar */}
          <div className="flex items-center gap-3 text-xs sm:text-sm">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              <Trophy className="h-4 w-4" />
              <span>Level 2</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-50 text-slate-700 border border-slate-200">
              <CircleDollarSign className="h-4 w-4" />
              <span>450 pts</span>
            </div>
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-medium shadow">
              U
            </div>
          </div>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Schemes</h1>
          <p className="text-slate-600 mt-2">
            Discover personalized financial support and government initiatives tailored for you.
          </p>
        </div>

        {/* Tabs + Search */}
        <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab("govt")}
              className={`${pillBase} ${tab === "govt" ? pillActive : pillIdle}`}
            >
              Govt
            </button>
            <button
              type="button"
              onClick={() => setTab("bank")}
              className={`${pillBase} ${tab === "bank" ? pillActive : pillIdle}`}
            >
              Bank
            </button>
            <button
              type="button"
              onClick={() => setTab("my")}
              className={`${pillBase} ${tab === "my" ? pillActive : pillIdle}`}
            >
              My Schemes
            </button>
          </div>

          <div className="flex-1">
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
              <span className="text-slate-400">🔎</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400 bg-transparent"
                placeholder="Search schemes for farmers, business, education..."
              />
            </div>
          </div>
        </div>

        {/* Grid: left list + right sidebar */}
        <div className="grid gap-6 lg:grid-cols-[2.2fr,1fr]">
          {/* LEFT: schemes list */}
          <section className="space-y-4">
            {filtered.map((s) => (
              <div
                key={s.id}
                className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[11px] font-extrabold tracking-wide px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {s.tag}
                      </span>
                      {s.verified && (
                        <span className="text-xs font-semibold text-emerald-700">
                          ✅ Verified
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">
                      {s.title}
                    </h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      {s.desc}
                    </p>

                    <div className="flex items-center gap-3 mt-4">
                      <button
                        type="button"
                        onClick={() => handleViewDetails(s)}
                        className="px-4 py-2 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        onClick={() => speak(`${s.title}. ${s.desc}`)}
                        className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition flex items-center gap-2"
                      >
                        <Volume2 className="h-4 w-4" />
                        Listen
                      </button>
                    </div>
                  </div>

                  {/* Right thumbnail placeholder */}
                  <div className="hidden sm:block h-20 w-28 rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-50 border border-slate-100" />
                </div>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 text-slate-600">
                No schemes found for your search.
              </div>
            )}
          </section>

          {/* RIGHT: sidebar */}
          <aside className="space-y-5">
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-2 mb-3">
                <span>📈</span>
                <h4 className="font-bold text-slate-900">Popular Today</h4>
              </div>

              <div className="space-y-3">
                {trending.map((t) => (
                  <div key={t.title} className="text-sm">
                    <p className="font-semibold text-slate-900">{t.title}</p>
                    <p className="text-xs text-slate-500">{t.views}</p>
                  </div>
                ))}
              </div>

              <button
                type="button"
                className="mt-4 w-full px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-white transition"
              >
                Explore All Trending
              </button>
            </div>

            <div className="bg-amber-50/90 backdrop-blur border border-amber-200 rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span>🛡️</span>
                <h4 className="font-bold text-amber-900">Safety Reminder</h4>
              </div>
              <p className="text-sm text-amber-900/80 leading-relaxed">
                DhanSaathi will never ask for your bank OTP, PIN, or password over voice or chat.
                Be cautious of scammers.
              </p>
            </div>

            <div className="bg-emerald-50/90 backdrop-blur border border-emerald-200 rounded-3xl p-5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-extrabold tracking-wide text-emerald-800 uppercase">
                  Total Benefits Claimed
                </p>
                <p className="text-2xl font-extrabold text-slate-900 mt-1">
                  ₹14.2 Cr
                </p>
              </div>
              <div className="h-10 w-10 rounded-2xl bg-emerald-100 grid place-items-center">
                ⭐
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Bottom right voice widget + mic button */}
      <div className="fixed bottom-6 right-6 flex items-end gap-3">
        <div className="hidden md:block bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.10)]">
          <p className="text-sm text-slate-700">
            “Tell me about schemes for students”
          </p>
        </div>

        <button
          type="button"
          className="h-16 w-16 rounded-full bg-green-600 shadow-2xl flex items-center justify-center text-white hover:bg-green-700 transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
          aria-label="Voice assistant"
          onClick={() => speak("How can I help you with schemes?")}
        >
          <Mic className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
}