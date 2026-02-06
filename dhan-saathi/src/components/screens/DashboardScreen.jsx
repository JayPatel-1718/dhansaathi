import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Wallet,
  Building2,
  BarChart3,
  MessageSquare,
  BookOpen,
  ShieldCheck,
  UserCog,
  Trophy,
  Lightbulb,
  Bell,
  Calendar,
  CircleDollarSign,
  Goal,
  PieChart,
  Mic,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
  Sparkle,
  Users,
  Volume2,
} from "lucide-react";

const DashboardScreen = () => {
  const navigate = useNavigate();

  const goToSchemes = () => navigate("/schemes");
  const goToCommunity = () => navigate("/community"); // ✅ NEW

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
            <button className="relative text-green-700 font-semibold">
              <Home className="inline h-4 w-4 mr-1.5 -mt-0.5" />
              Home
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-green-600" />
            </button>

            {/* ✅ Schemes nav redirect */}
            <button
              type="button"
              onClick={goToSchemes}
              className="flex items-center gap-1.5 hover:text-gray-900 transition"
            >
              <Building2 className="h-4 w-4" />
              Schemes
            </button>

            {/* ✅ Community nav redirect */}
            <button
              type="button"
              onClick={goToCommunity}
              className="flex items-center gap-1.5 hover:text-gray-900 transition"
            >
              <Sparkle className="h-4 w-4" />
              Community
            </button>

            <button className="flex items-center gap-1.5 hover:text-gray-900 transition">
              <BookOpen className="h-4 w-4" />
              Learn
            </button>
            <button className="flex items-center gap-1.5 hover:text-gray-900 transition">
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

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="grid gap-6 lg:grid-cols-[2.1fr,1fr]">
          {/* LEFT COLUMN */}
          <section className="space-y-6 lg:space-y-8">
            {/* Greeting + Progress card */}
            <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-gray-200 shadow-xl p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6">
                <div className="space-y-3 flex-1">
                  <p className="text-sm font-semibold uppercase tracking-wide text-green-700">
                    Namaste, Friend!
                  </p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                    You're making great progress
                  </h1>
                  <p className="text-base text-gray-600">
                    towards financial freedom.
                  </p>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-700">
                        CURRENT TIER
                      </span>
                      <span className="font-semibold text-emerald-700">
                        Gold Saver
                      </span>
                    </div>
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-500 to-emerald-600 rounded-full"
                        style={{ width: "20%" }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">
                      Level Progress • 20% • Complete 3 more modules to reach
                      Level 3
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-center sm:items-end gap-4">
                  <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                    <Goal className="h-12 w-12 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Tiles */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 lg:gap-5">
              {[
                {
                  label: "Schemes",
                  desc: "Govt Benefits & Subsidies",
                  icon: Wallet,
                  onClick: goToSchemes, // ✅ redirect on tile click
                },
                { label: "Tracker", desc: "Daily Expense Monitor", icon: BarChart3 },
                { label: "Ask AI", desc: "Financial Voice Assistant", icon: MessageSquare },
                { label: "Learn", desc: "Financial Literacy Courses", icon: BookOpen },
                { label: "Safety", desc: "Secure Document Vault", icon: ShieldCheck },
                { label: "Profile", desc: "Manage Account Settings", icon: UserCog },
              ].map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={item.onClick}
                  className="group rounded-2xl bg-white/90 backdrop-blur-xl border border-gray-200 shadow-md p-5 text-left flex flex-col hover:-translate-y-1 hover:shadow-xl transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-4">
                    <item.icon
                      className="h-8 w-8 text-emerald-600"
                      strokeWidth={1.8}
                    />
                    <span className="text-gray-300 group-hover:text-emerald-500 text-xl transition">
                      →
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">{item.label}</p>
                  <p className="text-sm text-gray-600 mt-1">{item.desc}</p>
                </button>
              ))}
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
                    54 people in your district just applied for the PM Kisan
                    Scheme.
                  </p>
                  <button className="mt-2 text-sm font-medium text-green-700 hover:text-green-800">
                    Check your eligibility? →
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
                <h2 className="text-lg font-semibold text-gray-900">
                  Today's Tip
                </h2>
                <Lightbulb className="h-7 w-7 text-amber-500" />
              </div>
              <p className="text-gray-700">
                Saving just ₹50 a day can help you build an emergency fund of
                ₹18,000 in one year.
              </p>
              <button className="mt-4 text-sm font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5">
                <Volume2 className="h-4 w-4" /> Listen to Tip
              </button>
            </div>

            {/* Reminders */}
            <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-gray-200 shadow-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Reminders
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Electricity Bill
                      </p>
                      <p className="text-sm text-gray-600">
                        Due in 2 days • ₹850
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-6 w-6 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">
                        Insurance Premium
                      </p>
                      <p className="text-sm text-gray-600">
                        Due next Monday • ₹2,400
                      </p>
                    </div>
                  </div>
                </div>
                <button className="w-full text-center text-sm font-medium text-gray-600 hover:text-gray-900 mt-2">
                  View All →
                </button>
              </div>
            </div>

            {/* Daily Goal */}
            <div className="rounded-3xl bg-white/90 backdrop-blur-xl border border-gray-200 shadow-xl p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-5">
                Daily Goal
              </h2>
              <div className="flex flex-col items-center">
                <div className="relative h-32 w-32">
                  <PieChart className="h-full w-full text-gray-200" strokeWidth={8} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-green-700">75%</p>
                      <p className="text-xs text-gray-600 mt-1">COMPLETE</p>
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-center text-gray-700">
                  Current Streak: 5 Days 🔥<br />
                  Visit 2 more days to earn 50 bonus pts
                </p>
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