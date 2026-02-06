import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Building2,
  Sparkle,
  BookOpen,
  MessageSquare,
  Bell,
  IndianRupee,
  Mic,
  PhoneCall,
  ShieldAlert,
  Headset,
  Star,
  Volume2,
  CheckCircle2,
  ArrowRight,
  Crown,
} from "lucide-react";

export default function HelpScreen() {
  const navigate = useNavigate();

  // reactive bg
  const [mouse, setMouse] = useState({ x: 320, y: 220 });

  const appLang = localStorage.getItem("dhan-saathi-language") || "english";
  const ttsLang = appLang === "hindi" ? "hi-IN" : "en-IN";

  const speak = (text) => {
    try {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = ttsLang;
      msg.rate = 1.0;
      window.speechSynthesis.speak(msg);
    } catch {
      // ignore
    }
  };

  const tiers = [
    {
      id: "free",
      badge: "FREE TIER",
      price: "₹0",
      title: appLang === "hindi" ? "मुफ़्त सहायता" : "Free Support",
      points: [
        appLang === "hindi" ? "Chat support" : "Chat support",
        appLang === "hindi" ? "24hr response time" : "24hr response time",
        appLang === "hindi"
          ? "Community viewable answers"
          : "Community viewable answers",
      ],
      buttonText: appLang === "hindi" ? "Start Free Chat" : "Start Free Chat",
      buttonStyle:
        "bg-white/70 border border-emerald-300 text-emerald-800 hover:bg-emerald-50",
      cardAccent: "from-emerald-100/70 via-white to-slate-50/60",
    },
    {
      id: "premium",
      badge: "PREMIUM EXPERT",
      price: "₹499",
      title: appLang === "hindi" ? "प्रीमियम विशेषज्ञ" : "Premium Expert",
      points: [
        appLang === "hindi" ? "Direct voice call" : "Direct voice call",
        appLang === "hindi" ? "15‑min response time" : "15‑min response time",
        appLang === "hindi" ? "Private 1‑on‑1 session" : "Private 1‑on‑1 session",
      ],
      buttonText: appLang === "hindi" ? "Connect Now" : "Connect Now",
      buttonStyle:
        "bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 shadow-[0_18px_55px_rgba(16,185,129,0.28)]",
      cardAccent: "from-emerald-200/60 via-white to-sky-100/50",
    },
  ];

  const experts = [
    {
      name: "Ananya Sharma",
      tags: ["BANKING", "FRAUD PREVENTION"],
      rating: 4.9,
      reviews: 124,
      online: true,
    },
    {
      name: "Rajesh Malhotra",
      tags: ["TAX SPECIALIST", "WEALTH MGMT"],
      rating: 4.8,
      reviews: 89,
      online: true,
    },
    {
      name: "Priya Verma",
      tags: ["CYBERCRIME", "SECURITY"],
      rating: 5.0,
      reviews: 56,
      online: false,
    },
    {
      name: "Vikram Iyer",
      tags: ["INSURANCE", "CLAIMS"],
      rating: 4.7,
      reviews: 210,
      online: true,
    },
  ];

  const helplines = [
    {
      title: "Bank Fraud (1930)",
      desc:
        "Immediate reporting for suspicious bank transactions or UPI fraud.",
      number: "1930",
      theme: "bg-red-50/70 border-red-200",
      button:
        "bg-red-500 text-white hover:bg-red-600 shadow-[0_14px_40px_rgba(239,68,68,0.25)]",
    },
    {
      title: "Cybercrime (1930 / portal)",
      desc:
        "National portal for reporting identity theft or digital harassment.",
      number: "1930",
      theme: "bg-slate-50/70 border-slate-200",
      button:
        "bg-slate-900 text-white hover:bg-slate-800 shadow-[0_14px_40px_rgba(2,6,23,0.20)]",
    },
    {
      title: "Women’s Helpline (181)",
      desc: "24/7 support for safety and emergency assistance.",
      number: "181",
      theme: "bg-emerald-50/70 border-emerald-200",
      button:
        "bg-slate-900 text-white hover:bg-slate-800 shadow-[0_14px_40px_rgba(2,6,23,0.20)]",
    },
  ];

  const callNumber = (num) => {
    // Works on mobile; on desktop it may open handler
    window.location.href = `tel:${num}`;
  };

  return (
    <>
      <style>{`
        @keyframes blobA {
          0% { transform: translate(0,0) scale(1); }
          35% { transform: translate(30px,-20px) scale(1.12); }
          70% { transform: translate(-25px,20px) scale(0.96); }
          100% { transform: translate(0,0) scale(1); }
        }
        @keyframes blobB {
          0% { transform: translate(0,0) scale(1); }
          40% { transform: translate(-25px,-18px) scale(1.10); }
          75% { transform: translate(22px,18px) scale(0.98); }
          100% { transform: translate(0,0) scale(1); }
        }
        @keyframes sheen {
          0% { transform: translateX(-55%); opacity: 0; }
          20% { opacity: 0.20; }
          60% { opacity: 0.20; }
          100% { transform: translateX(155%); opacity: 0; }
        }
      `}</style>

      <div
        className="min-h-screen relative overflow-hidden bg-[#F4FAF3]"
        onMouseMove={(e) => setMouse({ x: e.clientX, y: e.clientY })}
        style={{
          backgroundImage: `
            radial-gradient(900px circle at ${mouse.x}px ${mouse.y}px, rgba(16,185,129,0.14), transparent 42%),
            radial-gradient(circle at top left, rgba(187,247,208,0.55) 0, transparent 60%),
            radial-gradient(circle at bottom right, rgba(191,219,254,0.45) 0, transparent 60%)
          `,
        }}
      >
        {/* background blobs */}
        <div className="pointer-events-none absolute -top-52 -left-52 h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(34,197,94,0.40)_0%,rgba(16,185,129,0.16)_38%,transparent_70%)] blur-3xl opacity-90 mix-blend-multiply animate-[blobA_18s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute top-[25%] -right-60 h-[640px] w-[640px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(16,185,129,0.34)_0%,rgba(59,130,246,0.14)_42%,transparent_72%)] blur-3xl opacity-80 mix-blend-multiply animate-[blobB_22s_ease-in-out_infinite]" />

        {/* NAVBAR */}
        <header className="w-full bg-white/80 backdrop-blur-xl border-b border-gray-200 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-green-600 flex items-center justify-center shadow-md">
                <IndianRupee className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                DhanSaathi
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
              <button
                type="button"
                onClick={() => navigate("/home")}
                className="flex items-center gap-1.5 hover:text-gray-900 transition"
              >
                <Home className="h-4 w-4" />
                Home
              </button>

              <button
                type="button"
                onClick={() => navigate("/schemes")}
                className="flex items-center gap-1.5 hover:text-gray-900 transition"
              >
                <Building2 className="h-4 w-4" />
                Schemes
              </button>

              <button
                type="button"
                onClick={() => navigate("/community")}
                className="flex items-center gap-1.5 hover:text-gray-900 transition"
              >
                <Sparkle className="h-4 w-4" />
                Community
              </button>

              <button
                type="button"
                onClick={() => navigate("/learn")}
                className="flex items-center gap-1.5 hover:text-gray-900 transition"
              >
                <BookOpen className="h-4 w-4" />
                Learn
              </button>

              {/* Help active */}
              <button
                type="button"
                className="relative text-green-700 font-semibold flex items-center gap-1.5"
              >
                <MessageSquare className="h-4 w-4" />
                Help
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-green-600" />
              </button>
            </nav>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="hidden sm:inline-flex h-10 w-10 rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow-sm items-center justify-center text-gray-700 hover:bg-gray-50"
                title="Notifications"
              >
                <Bell className="h-5 w-5" />
              </button>
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-semibold shadow">
                U
              </div>
            </div>
          </div>
        </header>

        {/* PAGE */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 lg:py-10">
          {/* Header */}
          <div className="mb-7">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
              Help & Support
            </h1>
            <p className="text-gray-600 mt-2">
              Find immediate answers or talk to our experts.
            </p>
          </div>

          {/* Main grid */}
          <div className="grid gap-6 lg:grid-cols-[2.1fr,1fr]">
            {/* LEFT */}
            <section className="space-y-6">
              {/* Ask an Expert header + toggle */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Ask an Expert</h2>
                <div className="bg-white/80 backdrop-blur border border-gray-200 rounded-full p-1 shadow-sm">
                  <button className="px-4 py-2 rounded-full text-sm font-semibold bg-white shadow">
                    Standard
                  </button>
                  <button className="px-4 py-2 rounded-full text-sm font-semibold text-gray-600 hover:text-gray-900">
                    Advanced
                  </button>
                </div>
              </div>

              {/* Pricing cards */}
              <div className="grid sm:grid-cols-2 gap-5 [perspective:1200px]">
                {tiers.map((t) => (
                  <div
                    key={t.id}
                    className="relative overflow-hidden rounded-3xl bg-gradient-to-br p-[1.5px] shadow-[0_28px_80px_rgba(15,23,42,0.12)] hover:shadow-[0_34px_100px_rgba(15,23,42,0.16)] transition-all hover:-translate-y-1"
                    style={{
                      backgroundImage: `linear-gradient(135deg, rgba(34,197,94,0.22), rgba(59,130,246,0.10), rgba(255,255,255,0.75))`,
                    }}
                  >
                    <div className="relative rounded-[22px] bg-white/80 backdrop-blur-2xl border border-white/60 p-6">
                      {/* sheen */}
                      <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[22px]">
                        <div className="absolute -inset-y-10 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-xl animate-[sheen_9s_ease-in-out_infinite]" />
                      </div>

                      <div className="relative">
                        <div className="flex items-start justify-between">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700">
                            {t.badge}
                          </span>
                          <p className="text-3xl font-extrabold text-gray-900">
                            {t.price}
                          </p>
                        </div>

                        <p className="text-sm text-gray-600 mt-3">
                          {t.title}
                        </p>

                        <div className="mt-5 space-y-3">
                          {t.points.map((p) => (
                            <div key={p} className="flex items-center gap-2">
                              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                              <p className="text-sm text-gray-700">{p}</p>
                            </div>
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            alert(
                              t.id === "premium"
                                ? "Premium connect (demo)"
                                : "Free chat (demo)"
                            )
                          }
                          className={`mt-6 w-full px-4 py-3 rounded-2xl font-semibold transition-all hover:-translate-y-0.5 ${t.buttonStyle}`}
                        >
                          {t.buttonText}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Available Experts */}
              <div className="mt-2">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  Available Experts
                </h2>

                <div className="grid sm:grid-cols-2 gap-4">
                  {experts.map((e) => (
                    <button
                      key={e.name}
                      type="button"
                      onClick={() => alert(`Open expert profile: ${e.name}`)}
                      className="text-left rounded-3xl bg-white/85 backdrop-blur border border-gray-200 shadow-[0_16px_45px_rgba(15,23,42,0.08)] hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)] transition-all p-5 hover:-translate-y-1"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-sky-100 border border-gray-200 grid place-items-center">
                          <Headset className="h-6 w-6 text-emerald-700" />
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate">
                            {e.name}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {e.tags.map((t) => (
                              <span
                                key={t}
                                className="text-[11px] font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-700"
                              >
                                {t}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-2 mt-3 text-sm text-gray-600">
                            <Star className="h-4 w-4 text-amber-500" />
                            <span className="font-semibold text-gray-900">
                              {e.rating.toFixed(1)}
                            </span>
                            <span className="text-xs text-gray-500">
                              ({e.reviews} reviews)
                            </span>
                            <span
                              className={`ml-auto text-xs font-semibold ${
                                e.online ? "text-emerald-700" : "text-gray-500"
                              }`}
                            >
                              {e.online ? "Online" : "Offline"}
                            </span>
                          </div>
                        </div>

                        <ArrowRight className="h-5 w-5 text-gray-300 ml-auto" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* RIGHT: Emergency Helplines panel */}
            <aside className="space-y-5">
              <div className="rounded-3xl bg-white/90 backdrop-blur-2xl border border-gray-200 shadow-[0_28px_80px_rgba(15,23,42,0.10)] overflow-hidden">
                <div className="p-5 border-l-4 border-red-500">
                  <div className="flex items-center gap-3">
                    <span className="text-red-500 text-2xl">*</span>
                    <h3 className="text-xl font-extrabold text-gray-900">
                      Emergency Helplines
                    </h3>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {helplines.map((h) => (
                    <div
                      key={h.title}
                      className={`rounded-2xl border p-4 ${h.theme}`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {h.title}
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            {h.desc}
                          </p>

                          <button
                            type="button"
                            onClick={() => speak(`${h.title}. ${h.desc}`)}
                            className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                          >
                            <Volume2 className="h-4 w-4" />
                            Listen
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => callNumber(h.number)}
                          className={`px-4 py-2 rounded-full text-xs font-bold inline-flex items-center gap-2 ${h.button}`}
                        >
                          <PhoneCall className="h-4 w-4" />
                          Call Now
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200 p-4">
                    <p className="text-sm font-bold text-emerald-900">
                      DhanSaathi Safety Protocol
                    </p>
                    <p className="text-xs text-emerald-900/80 mt-2">
                      Our experts will never ask for your passwords, OTPs, or CVV.
                      Report suspicious requests immediately.
                    </p>
                  </div>
                </div>
              </div>

              {/* quick CTA */}
              <div className="rounded-3xl bg-white/85 backdrop-blur border border-gray-200 shadow-lg p-5">
                <p className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  <Crown className="h-4 w-4 text-emerald-700" />
                  Premium faster support
                </p>
                <p className="text-sm text-gray-600 mt-2">
                  Get priority expert replies and 1‑on‑1 sessions.
                </p>
                <button
                  type="button"
                  onClick={() => alert("Upgrade (demo)")}
                  className="mt-4 w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold shadow hover:from-emerald-700 hover:to-green-700 transition hover:-translate-y-0.5"
                >
                  Upgrade to Premium
                </button>
              </div>
            </aside>
          </div>
        </main>

        {/* Floating Voice Button */}
        <button
          className="fixed bottom-6 right-6 h-16 w-16 rounded-full bg-green-600 shadow-2xl flex items-center justify-center text-white hover:bg-green-700 transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
          aria-label="Voice assistant"
          type="button"
          onClick={() => alert("Voice help coming soon")}
        >
          <Mic className="h-7 w-7" />
        </button>
      </div>
    </>
  );
}