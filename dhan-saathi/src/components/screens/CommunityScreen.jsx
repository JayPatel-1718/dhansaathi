import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../firebase";

import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

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
  Bell,
  LogOut,
  IndianRupee,
} from "lucide-react";

const CATEGORIES = [
  "All Discussions",
  "Tax Planning",
  "Mutual Funds",
  "Stock Market",
  "Insurance",
  "Retirement",
  "Crypto",
];

function timeAgo(date) {
  if (!date) return "Just now";
  const ms = Date.now() - date.getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function CommunityScreen() {
  const navigate = useNavigate();

  // Auth + profile dropdown
  const [fbUser, setFbUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Community data
  const [selectedCategory, setSelectedCategory] = useState("All Discussions");
  const [searchText, setSearchText] = useState("");
  const [questions, setQuestions] = useState([]);

  // Ask modal
  const [askOpen, setAskOpen] = useState(false);
  const [askTitle, setAskTitle] = useState("");
  const [askBody, setAskBody] = useState("");

  // Expanded question answers
  const [openQid, setOpenQid] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [answerText, setAnswerText] = useState("");

  // Navbar navigation
  const goHome = () => navigate("/home");
  const goSchemes = () => navigate("/schemes");
  const goCommunity = () => navigate("/community");

  // Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setFbUser(u || null));
    return () => unsub();
  }, []);

  // Close dropdown on outside click
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

  // Live questions from Firestore
  useEffect(() => {
    const qy = query(collection(db, "communityQuestions"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(
      qy,
      (snap) => {
        const rows = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            createdAtDate: data.createdAt?.toDate ? data.createdAt.toDate() : null,
          };
        });
        setQuestions(rows);
      },
      (err) => {
        console.error("communityQuestions read error:", err);
        setQuestions([]);
      }
    );
    return () => unsub();
  }, []);

  // Live answers for expanded question
  useEffect(() => {
    if (!openQid) {
      setAnswers([]);
      return;
    }
    const qy = query(
      collection(db, "communityQuestions", openQid, "answers"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(
      qy,
      (snap) => {
        const rows = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            createdAtDate: data.createdAt?.toDate ? data.createdAt.toDate() : null,
          };
        });
        setAnswers(rows);
      },
      (err) => {
        console.error("answers read error:", err);
        setAnswers([]);
      }
    );
    return () => unsub();
  }, [openQid]);

  const filteredQuestions = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return questions.filter((item) => {
      const matchesCategory =
        selectedCategory === "All Discussions" || item.category === selectedCategory;

      const matchesSearch =
        !q ||
        (item.title || "").toLowerCase().includes(q) ||
        (item.body || "").toLowerCase().includes(q) ||
        (item.authorName || "").toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [questions, selectedCategory, searchText]);

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

  const handleAskOpen = () => {
    if (!fbUser) {
      alert("Please sign in to ask a question.");
      navigate("/signup");
      return;
    }
    setAskTitle("");
    setAskBody("");
    setAskOpen(true);
  };

  const handleAskSubmit = async () => {
    if (!fbUser) return;

    const title = askTitle.trim();
    const body = askBody.trim();

    if (!title || !body) {
      alert("Please enter title and description.");
      return;
    }

    try {
      await addDoc(collection(db, "communityQuestions"), {
        title,
        body,
        category: selectedCategory === "All Discussions" ? "General" : selectedCategory,

        uid: fbUser.uid,
        authorName: fbUser.displayName || "User",
        authorEmail: fbUser.email || "",
        authorPhotoURL: fbUser.photoURL || "",

        badge: "New",
        answersCount: 0,
        viewsCount: 0,
        helpfulCount: 0,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setAskOpen(false);
    } catch (e) {
      console.error(e);
      alert(`Failed to post question: ${e?.code || ""} ${e?.message || ""}`);
    }
  };

  const openAnswers = async (qid) => {
    setAnswerText(""); // reset input when switching
    setOpenQid((curr) => (curr === qid ? null : qid));

    // increment views when opening
    try {
      await updateDoc(doc(db, "communityQuestions", qid), {
        viewsCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("views increment error:", e);
    }
  };

  const markHelpful = async (qid) => {
    try {
      await updateDoc(doc(db, "communityQuestions", qid), {
        helpfulCount: increment(1),
        updatedAt: serverTimestamp(),
      });
    } catch (e) {
      console.error("helpful increment error:", e);
      alert(`Failed to mark helpful: ${e?.code || ""} ${e?.message || ""}`);
    }
  };

  // ✅ FIXED: post answer should not fail due to counter update
  const submitAnswer = async () => {
    if (!fbUser) {
      alert("Please sign in to answer.");
      navigate("/signup");
      return;
    }
    if (!openQid) return;

    const text = answerText.trim();
    if (!text) return;

    try {
      // 1) create answer
      await addDoc(collection(db, "communityQuestions", openQid, "answers"), {
        uid: fbUser.uid,
        authorName: fbUser.displayName || "User",
        authorEmail: fbUser.email || "",
        authorPhotoURL: fbUser.photoURL || "",
        text,
        createdAt: serverTimestamp(),
      });

      // 2) try to increment answersCount (if rules block, answer still exists)
      try {
        await updateDoc(doc(db, "communityQuestions", openQid), {
          answersCount: increment(1),
          updatedAt: serverTimestamp(),
        });
      } catch (e2) {
        console.error("answersCount increment blocked:", e2);
        // do not throw
      }

      setAnswerText("");
    } catch (e) {
      console.error(e);
      alert(`Failed to answer: ${e?.code || ""} ${e?.message || ""}`);
    }
  };

  const badgeStyle = (badge) => {
    if (badge === "Expert Verified") return "bg-emerald-50 text-emerald-700";
    if (badge === "Trending") return "bg-blue-50 text-blue-700";
    return "bg-amber-50 text-amber-700";
  };

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
        {/* ✅ CONSISTENT NAVBAR */}
        <header className="w-full bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-20">
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
              <button type="button" onClick={goHome} className="flex items-center gap-1.5 hover:text-gray-900 transition">
                <Home className="h-4 w-4" />
                Home
              </button>

              <button type="button" onClick={goSchemes} className="flex items-center gap-1.5 hover:text-gray-900 transition">
                <Building2 className="h-4 w-4" />
                Schemes
              </button>

              <button type="button" onClick={goCommunity} className="relative text-green-700 font-semibold flex items-center gap-1.5">
                <MessageCircle className="h-4 w-4" />
                Community
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-green-600" />
              </button>

              <button type="button" className="flex items-center gap-1.5 hover:text-gray-900 transition" onClick={() => alert("Learn coming soon")}>
                <BookOpen className="h-4 w-4" />
                Learn
              </button>

              <button type="button" className="flex items-center gap-1.5 hover:text-gray-900 transition" onClick={() => alert("Help coming soon")}>
                <ShieldCheck className="h-4 w-4" />
                Help
              </button>
            </nav>

            {/* Right: Bell + Profile dropdown */}
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
                      <p className="text-sm font-semibold text-gray-900">{displayName}</p>
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

        {/* MAIN */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-9">
          {/* Top row */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                Ask &amp; Learn
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Get answers from India&apos;s financial community.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 border border-gray-200 shadow-sm w-full sm:w-72">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search discussions..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="bg-transparent outline-none text-sm text-gray-700 flex-1"
                />
              </div>
              <button
                type="button"
                onClick={handleAskOpen}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-green-600 text-white text-sm font-semibold shadow-lg hover:bg-green-700 transition"
              >
                <PlusCircle className="h-4 w-4" />
                Ask question
              </button>
            </div>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-3 mb-6">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={
                  selectedCategory === cat
                    ? "px-4 py-2 rounded-full bg-green-600 text-white text-xs sm:text-sm font-semibold shadow-sm"
                    : "px-4 py-2 rounded-full bg-white/80 border border-gray-200 text-xs sm:text-sm text-gray-700 hover:border-green-400 hover:text-green-700 transition"
                }
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Main grid */}
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            {/* LEFT */}
            <section className="space-y-4">
              {filteredQuestions.length === 0 ? (
                <div className="rounded-3xl bg-white/95 backdrop-blur border border-gray-100 shadow p-6 text-gray-700">
                  No discussions yet. Click <span className="font-semibold">Ask question</span> to start.
                </div>
              ) : (
                filteredQuestions.map((q) => (
                  <article
                    key={q.id}
                    className="rounded-3xl bg-white/95 backdrop-blur border border-gray-100 shadow-[0_18px_35px_rgba(15,23,42,0.06)] p-5 sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        {q.authorPhotoURL ? (
                          <img
                            src={q.authorPhotoURL}
                            alt="User"
                            className="h-9 w-9 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <UserCircle2 className="h-9 w-9 text-emerald-500" />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-gray-900">
                            {q.authorName || "User"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {timeAgo(q.createdAtDate)} • {q.category || "General"}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${badgeStyle(q.badge)}`}
                      >
                        {q.badge === "Expert Verified" && (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        )}
                        {q.badge || "New"}
                      </span>
                    </div>

                    <h2 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                      {q.title}
                    </h2>
                    <p className="text-sm text-gray-600 mb-4">{q.body}</p>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                          <MessageCircle className="h-3.5 w-3.5" />
                          {q.answersCount || 0} Answers
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          {q.viewsCount || 0} Views
                        </span>
                        <button
                          type="button"
                          onClick={() => markHelpful(q.id)}
                          className="inline-flex items-center gap-1.5 hover:text-gray-900"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          Helpful ({q.helpfulCount || 0})
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => openAnswers(q.id)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100"
                      >
                        {openQid === q.id ? "Hide answers" : "Read answers"}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {openQid === q.id && (
                      <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          Answers
                        </h3>

                        {answers.length === 0 ? (
                          <p className="text-sm text-gray-600">
                            No answers yet. Be the first to reply.
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {answers.map((a) => (
                              <div key={a.id} className="bg-white rounded-xl border border-gray-100 p-3">
                                <div className="flex items-center gap-2 mb-1">
                                  {a.authorPhotoURL ? (
                                    <img
                                      src={a.authorPhotoURL}
                                      alt="User"
                                      className="h-7 w-7 rounded-full object-cover"
                                      referrerPolicy="no-referrer"
                                    />
                                  ) : (
                                    <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-800 grid place-items-center text-xs font-bold">
                                      {(a.authorName || "U")[0]?.toUpperCase()}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-gray-900 truncate">
                                      {a.authorName || "User"}
                                    </p>
                                    <p className="text-[11px] text-gray-500">
                                      {timeAgo(a.createdAtDate)}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700">{a.text}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-4">
                          <textarea
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            rows={3}
                            placeholder={fbUser ? "Write your answer..." : "Sign in to answer..."}
                            className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-green-200"
                            disabled={!fbUser}
                          />
                          <div className="flex justify-end mt-2">
                            <button
                              type="button"
                              onClick={submitAnswer}
                              className="px-4 py-2 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
                              disabled={!fbUser || !answerText.trim()}
                            >
                              Post answer
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </article>
                ))
              )}
            </section>

            {/* RIGHT */}
            <aside className="space-y-5 lg:space-y-6">
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
                          <p className="text-sm font-medium text-gray-900">{c.name}</p>
                          <p className="text-xs text-gray-500">{c.role}</p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold text-emerald-700">{c.score}</span>
                    </div>
                  ))}
                </div>
                <button className="mt-3 text-xs font-medium text-emerald-700 hover:text-emerald-800">
                  View leaderboard →
                </button>
              </div>

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
                </ul>
              </div>

              <div className="rounded-3xl bg-white/95 backdrop-blur border border-gray-100 shadow-lg p-5 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Community</p>
                    <p className="text-xs text-gray-500">Growing with every question</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <ShieldCheck className="h-6 w-6 text-emerald-600" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Safety</p>
                    <p className="text-xs text-gray-500">Never share OTP/PIN</p>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>

        {/* Ask Question Modal */}
        {askOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Ask a question</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Category:{" "}
                    <span className="font-semibold text-gray-900">
                      {selectedCategory === "All Discussions" ? "General" : selectedCategory}
                    </span>
                  </p>
                </div>
                <button type="button" onClick={() => setAskOpen(false)} className="text-gray-500 hover:text-gray-900">
                  ✕
                </button>
              </div>

              <div className="mt-4 space-y-3">
                <input
                  value={askTitle}
                  onChange={(e) => setAskTitle(e.target.value)}
                  placeholder="Question title"
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-200"
                />
                <textarea
                  value={askBody}
                  onChange={(e) => setAskBody(e.target.value)}
                  placeholder="Describe your question..."
                  rows={5}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-200"
                />
              </div>

              <div className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAskOpen(false)}
                  className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAskSubmit}
                  className="px-4 py-2 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
                  disabled={!askTitle.trim() || !askBody.trim()}
                >
                  Post question
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}