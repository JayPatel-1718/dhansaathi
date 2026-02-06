import React from "react";
import {
  Home,
  Building2,
  MessageCircle,
  BookOpen,
  ShieldCheck,
  Users,
  Search,
  ArrowRight,
  UserCircle2,
  Eye,
  ThumbsUp,
  Award,
  Info,
  CheckCircle2,
  PlusCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const CommunityScreen = () => {
  const navigate = useNavigate();

  const categories = [
    "All Discussions",
    "Tax Planning",
    "Mutual Funds",
    "Stock Market",
    "Insurance",
    "Retirement",
    "Crypto",
  ];

  const questions = [
    {
      id: 1,
      name: "Priya Sharma",
      tag: "Salaried · Income Tax",
      time: "1 hour ago",
      title: "How to save tax under new regime for 12L income?",
      excerpt:
        "I recently switched to the new tax regime. My annual CTC is 12L. Apart from standard deduction, what other ways can I minimize my tax liability effectively?",
      answers: 8,
      views: "1.3k",
      badge: "Expert Verified",
      badgeColor: "bg-emerald-50 text-emerald-700",
    },
    {
      id: 2,
      name: "Rohan Mehta",
      tag: "Age 30 · Mutual Funds",
      time: "3 hours ago",
      title: "Best index funds for long-term growth in India?",
      excerpt:
        "Planning to start a 20-year SIP journey. Should I stick to Nifty 50 or look into Nifty Next 50 for better returns? Looking for low tracking error suggestions.",
      answers: 12,
      views: "4.8k",
      badge: "Trending",
      badgeColor: "bg-blue-50 text-blue-700",
    },
    {
      id: 3,
      name: "Vikram Singh",
      tag: "Investor · Gold & Bullion",
      time: "Yesterday",
      title: "Is it the right time to invest in Gold ETFs vs Physical Gold?",
      excerpt:
        "With the recent price surge, I am confused between buying sovereign gold bonds or just sticking to digital gold apps. What’s the liquidity like?",
      answers: 9,
      views: "920",
      badge: "New",
      badgeColor: "bg-amber-50 text-amber-700",
    },
  ];

  const contributors = [
    { name: "Animesh Das", role: "CA · 27 Answers", score: "+275 pts" },
    { name: "Sneha Reddy", role: "Tax Expert · 18 Answers", score: "+190 pts" },
    { name: "Rajesh Iyer", role: "Investor · 12 Answers", score: "+140 pts" },
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Soft background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: `
            radial-gradient(circle at top left, rgba(187,247,208,0.6) 0, transparent 55%),
            radial-gradient(circle at bottom right, rgba(191,219,254,0.55) 0, transparent 55%)
          `,
          opacity: 0.7,
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* NAVBAR */}
        <header className="w-full bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            {/* Logo + Brand */}
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-green-600 flex items-center justify-center shadow-md">
                <span className="text-white font-extrabold text-lg">₹</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                DhanSaathi
              </span>
            </div>

            {/* Nav links */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
              <button
                className="flex items-center gap-1.5 hover:text-gray-900 transition"
                onClick={() => navigate("/home")}
              >
                <Home className="h-4 w-4" />
                Home
              </button>
              <button className="flex items-center gap-1.5 hover:text-gray-900 transition">
                <Building2 className="h-4 w-4" />
                Schemes
              </button>
              <button className="relative text-green-700 font-semibold flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4" />
                Community
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-green-600" />
              </button>
              <button className="flex items-center gap-1.5 hover:text-gray-900 transition">
                <BookOpen className="h-4 w-4" />
                Learn
              </button>
              <button className="flex items-center gap-1.5 hover:text-gray-900 transition">
                <ShieldCheck className="h-4 w-4" />
                Help
              </button>
            </nav>

            {/* Profile pill */}
            <div className="flex items-center gap-3 text-xs sm:text-sm">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-medium shadow">
                U
              </div>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-9">
          {/* Top row: heading + search + ask button */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                Ask &amp; Learn
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Get answers from India&apos;s top financial community and verified
                experts.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 border border-gray-200 shadow-sm w-full sm:w-72">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  className="bg-transparent outline-none text-sm text-gray-700 flex-1"
                />
              </div>
              <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-green-600 text-white text-sm font-semibold shadow-lg hover:bg-green-700 transition">
                <PlusCircle className="h-4 w-4" />
                Ask question
              </button>
            </div>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-3 mb-6">
            {categories.map((cat, idx) => (
              <button
                key={cat}
                className={
                  idx === 0
                    ? "px-4 py-2 rounded-full bg-green-600 text-white text-xs sm:text-sm font-semibold shadow-sm"
                    : "px-4 py-2 rounded-full bg-white/80 border border-gray-200 text-xs sm:text-sm text-gray-700 hover:border-green-400 hover:text-green-700 transition"
                }
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Main grid: left questions, right sidebar */}
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            {/* LEFT: Questions list */}
            <section className="space-y-4">
              {questions.map((q) => (
                <article
                  key={q.id}
                  className="rounded-3xl bg-white/95 backdrop-blur border border-gray-100 shadow-[0_18px_35px_rgba(15,23,42,0.06)] p-5 sm:p-6"
                >
                  {/* Header: user + time + badge */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <UserCircle2 className="h-9 w-9 text-emerald-500" />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {q.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {q.time} • {q.tag}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${q.badgeColor}`}
                    >
                      {q.badge === "Expert Verified" && (
                        <ShieldCheck className="h-3.5 w-3.5" />
                      )}
                      {q.badge}
                    </span>
                  </div>

                  {/* Title & excerpt */}
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                    {q.title}
                  </h2>
                  <p className="text-sm text-gray-600 mb-4">{q.excerpt}</p>

                  {/* Footer: meta + button */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1.5">
                        <MessageCircle className="h-3.5 w-3.5" />
                        {q.answers} Answers
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5" />
                        {q.views} Views
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <ThumbsUp className="h-3.5 w-3.5" />
                        Helpful
                      </span>
                    </div>
                    <button className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100">
                      Read answers
                      <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </article>
              ))}
            </section>

            {/* RIGHT: Sidebar */}
            <aside className="space-y-5 lg:space-y-6">
              {/* Top Contributors */}
              <div className="rounded-3xl bg-white/95 backdrop-blur border border-gray-100 shadow-lg p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center justify-between">
                  <span>Top contributors</span>
                  <Award className="h-5 w-5 text-amber-500" />
                </h3>
                <div className="space-y-3">
                  {contributors.map((c, idx) => (
                    <div key={c.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-emerald-50 flex items-center justify-center text-xs font-semibold text-emerald-700">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {c.name}
                          </p>
                          <p className="text-xs text-gray-500">{c.role}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700">
                        {c.score}
                      </span>
                    </div>
                  ))}
                </div>
                <button className="mt-3 text-xs font-medium text-emerald-700 hover:text-emerald-800">
                  View leaderboard →
                </button>
              </div>

              {/* Guidelines */}
              <div className="rounded-3xl bg-white/95 backdrop-blur border border-gray-100 shadow-lg p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-emerald-600" />
                  Community guidelines
                </h3>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5" />
                    Be respectful and constructive in discussions.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5" />
                    Search for existing questions before posting new ones.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5" />
                    No sharing of OTPs, passwords, or personal bank details.
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5" />
                    Disclaimer: This is not financial advice. Verify with a
                    professional.
                  </li>
                </ul>
              </div>

              {/* Stats */}
              <div className="rounded-3xl bg-white/95 backdrop-blur border border-gray-100 shadow-lg p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      45k+ members
                    </p>
                    <p className="text-xs text-gray-500">
                      From towns and villages across India
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      120+ experts
                    </p>
                    <p className="text-xs text-gray-500">
                      CAs, CFPs, bankers and social workers
                    </p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CommunityScreen;