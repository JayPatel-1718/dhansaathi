// src/components/screens/SchemesScreen.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  Landmark, // icon for bank schemes
} from "lucide-react";

/**
 * Schemes data
 * - type: "govt" shows under Govt tab
 * - type: "bank" shows under Bank tab (includes India Post / small savings / bank channel schemes)
 * - verified: true => show Verified badge
 *
 * NOTE: "bank" tab here is used as "Bank/Post Office savings products & channels".
 * You can rename tag/types later if you want.
 */
const schemesData = [
  // ---------------- GOVT (Verified) ----------------
  {
    id: "pm-kisan",
    type: "govt",
    tag: "FARMER",
    verified: true,
    title: "PM Kisan Samman Nidhi",
    desc:
      "Eligible farmer families receive annual income support of ₹6,000 in three installments directly to their bank accounts (as per scheme rules).",
    source: "https://pmkisan.gov.in/",
  },
  {
    id: "mudra",
    type: "govt",
    tag: "SMALL BUSINESS",
    verified: true,
    title: "Pradhan Mantri Mudra Yojana (PMMY)",
    desc:
      "Loans up to ₹10 lakh to support micro and small enterprises for manufacturing, trading and services (as per lender/scheme rules).",
    source: "https://www.mudra.org.in/",
  },
  {
    id: "pmjdy",
    type: "govt",
    tag: "BANK ACCOUNT",
    verified: true,
    title: "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
    desc:
      "Financial inclusion program enabling basic savings account with no minimum balance requirement and access to RuPay card & DBT benefits (as applicable).",
    source: "https://pmjdy.gov.in/",
  },
  {
    id: "apy",
    type: "govt",
    tag: "PENSION",
    verified: true,
    title: "Atal Pension Yojana (APY)",
    desc:
      "Pension scheme for eligible subscribers (typically 18–40) providing a defined pension after 60 based on contributions (subject to rules).",
    source: "https://www.npscra.proteantech.in/scheme-details.php",
  },
  {
    id: "pmjjby",
    type: "govt",
    tag: "LIFE INSURANCE",
    verified: true,
    title: "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
    desc:
      "Low-cost renewable life insurance cover with annual premium auto-debited from bank/post office account (eligibility as per scheme rules).",
    source: "https://financialservices.gov.in/beta/en/pmjjby",
  },
  {
    id: "pmsby",
    type: "govt",
    tag: "ACCIDENT INSURANCE",
    verified: true,
    title: "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
    desc:
      "Accident insurance cover with a small annual premium auto-debited from bank/post office account (eligibility and benefits as per scheme rules).",
    source: "https://jansuraksha.in/pmsbyScheme",
  },
  {
    id: "pm-svanidhi",
    type: "govt",
    tag: "STREET VENDOR",
    verified: true,
    title: "PM SVANidhi (Street Vendor’s AtmaNirbhar Nidhi)",
    desc:
      "Working capital loans for eligible street vendors to resume livelihoods, with interest subsidy and incentives as applicable (as per rules).",
    source: "https://www.myscheme.gov.in/schemes/pm-svanidhi",
  },
  {
    id: "stand-up-india",
    type: "govt",
    tag: "WOMEN / SC-ST",
    verified: true,
    title: "Stand-Up India",
    desc:
      "Facilitates bank loans for eligible SC/ST and/or women entrepreneurs for greenfield enterprises in manufacturing/services/trading (as per rules).",
    source: "https://www.myscheme.gov.in/schemes/sui",
  },
  {
    id: "ab-pmjay",
    type: "govt",
    tag: "HEALTH",
    verified: true,
    title: "Ayushman Bharat – PM-JAY",
    desc:
      "Health assurance scheme offering coverage for secondary/tertiary hospitalization to eligible families (benefits as per rules).",
    source: "https://beneficiary.nha.gov.in/",
  },

  // ---------------- BANK / POST OFFICE (Verified) ----------------
  {
    id: "mahila-savings",
    type: "bank",
    tag: "WOMEN",
    verified: true,
    title: "Mahila Samman Savings Certificate",
    desc:
      "Government-backed small savings scheme for women (via post offices/banks as notified) with fixed tenure and interest as per rules.",
    source: "https://www.nsiindia.gov.in/",
  },
  {
    id: "ssy",
    type: "bank",
    tag: "GIRL CHILD",
    verified: true,
    title: "Sukanya Samriddhi Account (SSY)",
    desc:
      "Small savings scheme for a girl child with yearly deposit limit and long-term benefits; available through banks/post offices (as notified).",
    source: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=89",
  },
  {
    id: "ppf",
    type: "bank",
    tag: "TAX SAVING",
    verified: true,
    title: "Public Provident Fund (PPF)",
    desc:
      "Long-term savings scheme with yearly deposit limits and tax benefits as per rules; available via banks and post offices.",
    source: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=169",
  },
  {
    id: "nsc",
    type: "bank",
    tag: "FIXED INCOME",
    verified: true,
    title: "National Savings Certificate (NSC)",
    desc:
      "Government-backed fixed-income savings bond available through post offices; fixed maturity and interest as notified.",
    source: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=91",
  },
  {
    id: "kvp",
    type: "bank",
    tag: "LONG TERM",
    verified: true,
    title: "Kisan Vikas Patra (KVP)",
    desc:
      "Post Office savings certificate where a one-time investment grows over a fixed tenure (returns as per notified rates).",
    source: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=56",
  },
  {
    id: "po-savings",
    type: "bank",
    tag: "POST OFFICE",
    verified: true,
    title: "Post Office Savings Account (SB)",
    desc:
      "Basic savings account offered by India Post with interest and features as per applicable rules.",
    source: "https://www.indiapost.gov.in/",
  },
];

const trending = [
  { title: "Sukanya Samriddhi Account (SSY)", views: "12.4k people viewed today" },
  { title: "Atal Pension Yojana (APY)", views: "8.1k people viewed today" },
  { title: "PM Jan Dhan Yojana (PMJDY)", views: "5.2k people viewed today" },
];

export default function SchemesScreen() {
  const navigate = useNavigate();

  // tabs + search
  const [tab, setTab] = useState("govt"); // govt | bank | my
  const [queryText, setQueryText] = useState("");

  // auth + profile dropdown
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

  // navbar navigation
  const goHome = () => navigate("/home");
  const goSchemes = () => navigate("/schemes");
  const goCommunity = () => navigate("/community");

  // filtered schemes
  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();

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
  }, [tab, queryText]);

  // voice speak
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

  // Track View Details
  const trackViewDetails = async (scheme) => {
    if (!fbUser?.uid) return;

    try {
      // increment stats
      await setDoc(
        doc(db, "users", fbUser.uid),
        {
          "stats.schemesViewed": increment(1),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // update recentSchemes subcollection
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

      // log event
      await logEvent("scheme_view_details", {
        schemeId: scheme.id,
        title: scheme.title,
      });
    } catch (e) {
      console.error("trackViewDetails error:", e);
    }
  };

  // Track Listen
  const trackListen = async (scheme) => {
    if (!fbUser?.uid) return;

    try {
      await setDoc(
        doc(db, "users", fbUser.uid),
        {
          "stats.schemesListened": increment(1),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      await logEvent("scheme_listen", {
        schemeId: scheme.id,
        title: scheme.title,
      });
    } catch (e) {
      console.error("trackListen error:", e);
    }
  };

  // View Details -> track + navigate
  const handleViewDetails = async (scheme) => {
    await trackViewDetails(scheme);
    // pass flag so detail screen knows this view was tracked already
    navigate(`/schemes/${scheme.id}`, { state: { fromList: true } });
  };

  // Listen -> track + speak
  const handleListen = async (scheme) => {
    await trackListen(scheme);
    speak(`${scheme.title}. ${scheme.desc}`);
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

  const pillBase =
    "px-4 py-2 rounded-full text-sm font-semibold border transition";
  const pillActive = "bg-white border-slate-200 text-slate-900 shadow-sm";
  const pillIdle =
    "bg-slate-50 border-transparent text-slate-600 hover:bg-white hover:border-slate-200";

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 flex flex-col">
      {/* Navbar */}
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
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Schemes</h1>
          <p className="text-slate-600 mt-2">
            Discover personalized financial support and verified initiatives
            tailored for you.
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
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400 bg-transparent"
                placeholder="Search schemes for farmers, business, pension, savings..."
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
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-[11px] font-extrabold tracking-wide px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {s.tag}
                      </span>

                      {s.type === "bank" && (
                        <span className="text-[11px] font-extrabold tracking-wide px-2 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100 inline-flex items-center gap-1">
                          <Landmark className="h-3.5 w-3.5" />
                          Bank / Post Office
                        </span>
                      )}

                      {s.verified && (
                        <span className="text-xs font-semibold text-emerald-700">
                          ✅ Verified
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                    <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                      {s.desc}
                    </p>

                    <div className="flex items-center gap-3 mt-4 flex-wrap">
                      <button
                        type="button"
                        onClick={() => handleViewDetails(s)}
                        className="px-4 py-2 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition"
                      >
                        View Details
                      </button>

                      <button
                        type="button"
                        onClick={() => handleListen(s)}
                        className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition flex items-center gap-2"
                      >
                        <Volume2 className="h-4 w-4" />
                        Listen
                      </button>

                      {s.source ? (
                        <a
                          href={s.source}
                          target="_blank"
                          rel="noreferrer"
                          className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition"
                          onClick={() =>
                            logEvent("scheme_open_source", {
                              schemeId: s.id,
                              title: s.title,
                              source: s.source,
                            })
                          }
                        >
                          Official Source ↗
                        </a>
                      ) : null}
                    </div>
                  </div>

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
          </aside>
        </div>
      </main>

      {/* Bottom right voice widget + mic button */}
      <div className="fixed bottom-6 right-6 flex items-end gap-3">
        <div className="hidden md:block bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.10)]">
          <p className="text-sm text-slate-700">“Tell me about schemes for pension”</p>
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