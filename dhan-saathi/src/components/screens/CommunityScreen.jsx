// src/components/screens/CommunityScreen.jsx
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
  limit,
  setDoc,
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
  Globe,
} from "lucide-react";

/**
 * Bilingual content
 */
const COMMUNITY_TEXT = {
  hindi: {
    // Navbar
    appName: "धनसाथी",
    home: "होम",
    schemes: "सरकारी योजनाएं",
    community: "समुदाय",
    learn: "सीखें",
    help: "सहायता",
    notifications: "सूचनाएं",
    logout: "लॉग आउट",
    signin: "साइन इन",
    
    // Page Header
    pageTitle: "पूछें और सीखें",
    pageSubtitle: "भारत के वित्तीय समुदाय से जवाब पाएं। योगदान के लिए अंक अर्जित करें!",
    
    // Search
    searchPlaceholder: "चर्चाएं खोजें...",
    
    // Buttons & Actions
    askQuestion: "प्रश्न पूछें (+10 अंक)",
    askQuestionTitle: "प्रश्न पूछें",
    postAnswer: "उत्तर पोस्ट करें (+5 अंक)",
    readAnswers: "उत्तर पढ़ें",
    hideAnswers: "उत्तर छिपाएं",
    viewFullProfile: "पूर्ण प्रोफाइल देखें",
    cancel: "रद्द करें",
    next: "आगे →",
    back: "← वापस",
    change: "बदलें",
    
    // Categories
    categories: {
      "All Discussions": "सभी चर्चाएं",
      "Tax Planning": "टैक्स प्लानिंग",
      "Mutual Funds": "म्यूचुअल फंड",
      "Stock Market": "शेयर बाजार",
      "Insurance": "बीमा",
      "Retirement": "रिटायरमेंट",
      "Crypto": "क्रिप्टो",
    },
    
    // Ask Domains
    askDomains: {
      "General": "सामान्य",
      "Tax Planning": "टैक्स प्लानिंग",
      "Mutual Funds": "म्यूचुअल फंड",
      "Stock Market": "शेयर बाजार",
      "Insurance": "बीमा",
      "Retirement": "रिटायरमेंट",
      "Crypto": "क्रिप्टो",
    },
    
    // Modals
    chooseDomain: "डोमेन चुनें",
    questionTitlePlaceholder: "प्रश्न शीर्षक",
    questionBodyPlaceholder: "अपना प्रश्न विस्तार से बताएं...",
    stepOf: "चरण",
    
    // Stats & Metrics
    answers: "उत्तर",
    views: "दृश्य",
    helpful: "सहायक",
    activeDiscussions: "सक्रिय चर्चाएं",
    joinConversation: "बातचीत में शामिल हों और पुरस्कार अर्जित करें",
    
    // Top Contributors
    topContributors: "शीर्ष योगदानकर्ता",
    noContributors: "अभी तक कोई योगदानकर्ता नहीं। पहले बनें!",
    points: "अंक",
    level: "स्तर",
    
    // Points System
    pointsSystem: "अंक प्रणाली",
    askQuestionPoints: "प्रश्न पूछें",
    postAnswerPoints: "उत्तर पोस्ट करें",
    helpfulAnswerPoints: "सहायक उत्तर",
    
    // Community Guidelines
    communityGuidelines: "समुदाय दिशानिर्देश",
    guideline1: "चर्चाओं में सम्मानजनक और रचनात्मक रहें।",
    guideline2: "OTP/PIN साझा न करें।",
    guideline3: "प्रश्नों और उत्तरों के लिए अंक अर्जित करें।",
    guideline4: "शीर्ष योगदानकर्ताओं को विशेष बैज मिलते हैं।",
    
    // Your Stats
    yourCommunityStats: "आपके समुदाय आँकड़े",
    questions: "प्रश्न",
    answersStat: "उत्तर",
    
    // Empty States
    noDiscussions: "अभी तक कोई चर्चा नहीं। शुरू करने के लिए 'प्रश्न पूछें' पर क्लिक करें।",
    noAnswersYet: "अभी तक कोई उत्तर नहीं। पहले उत्तर देने के लिए 5 अंक अर्जित करें!",
    signInToAnswer: "उत्तर देने और अंक अर्जित करने के लिए साइन इन करें...",
    writeAnswerPlaceholder: "अपना उत्तर लिखें और 5 अंक अर्जित करें...",
    
    // Badges
    badges: {
      "New": "नया",
      "Trending": "ट्रेंडिंग",
      "Expert Verified": "विशेषज्ञ सत्यापित",
      "Member": "सदस्य",
      "Contributor": "योगदानकर्ता",
    },
    
    // Time Ago
    justNow: "अभी अभी",
    minuteAgo: "मिनट पहले",
    minutesAgo: "मिनट पहले",
    hourAgo: "घंटा पहले",
    hoursAgo: "घंटे पहले",
    dayAgo: "दिन पहले",
    daysAgo: "दिन पहले",
    
    // Alerts & Messages
    signInToAsk: "प्रश्न पूछने के लिए कृपया साइन इन करें।",
    enterTitleDescription: "कृपया शीर्षक और विवरण दर्ज करें।",
    failedToPost: "प्रश्न पोस्ट करने में विफल:",
    failedToMarkHelpful: "सहायक चिह्नित करने में विफल:",
    failedToAnswer: "उत्तर देने में विफल:",
    notificationsComingSoon: "सूचनाएं जल्द ही आ रही हैं",
    learnComingSoon: "सीखें जल्द ही आ रहा है",
    helpComingSoon: "सहायता जल्द ही आ रही है",
  },
  english: {
    // Navbar
    appName: "DhanSaathi",
    home: "Home",
    schemes: "Schemes",
    community: "Community",
    learn: "Learn",
    help: "Help",
    notifications: "Notifications",
    logout: "Logout",
    signin: "Sign in",
    
    // Page Header
    pageTitle: "Ask & Learn",
    pageSubtitle: "Get answers from India's financial community. Earn points for contributing!",
    
    // Search
    searchPlaceholder: "Search discussions...",
    
    // Buttons & Actions
    askQuestion: "Ask question (+10 pts)",
    askQuestionTitle: "Ask a question",
    postAnswer: "Post answer (+5 pts)",
    readAnswers: "Read answers",
    hideAnswers: "Hide answers",
    viewFullProfile: "View full profile",
    cancel: "Cancel",
    next: "Next →",
    back: "← Back",
    change: "Change",
    
    // Categories
    categories: {
      "All Discussions": "All Discussions",
      "Tax Planning": "Tax Planning",
      "Mutual Funds": "Mutual Funds",
      "Stock Market": "Stock Market",
      "Insurance": "Insurance",
      "Retirement": "Retirement",
      "Crypto": "Crypto",
    },
    
    // Ask Domains
    askDomains: {
      "General": "General",
      "Tax Planning": "Tax Planning",
      "Mutual Funds": "Mutual Funds",
      "Stock Market": "Stock Market",
      "Insurance": "Insurance",
      "Retirement": "Retirement",
      "Crypto": "Crypto",
    },
    
    // Modals
    chooseDomain: "Choose a domain",
    questionTitlePlaceholder: "Question title",
    questionBodyPlaceholder: "Describe your question...",
    stepOf: "Step",
    
    // Stats & Metrics
    answers: "Answers",
    views: "Views",
    helpful: "Helpful",
    activeDiscussions: "Active Discussions",
    joinConversation: "Join the conversation and earn rewards",
    
    // Top Contributors
    topContributors: "Top contributors",
    noContributors: "No contributors yet. Be the first!",
    points: "pts",
    level: "Level",
    
    // Points System
    pointsSystem: "Points system",
    askQuestionPoints: "Ask question",
    postAnswerPoints: "Post answer",
    helpfulAnswerPoints: "Helpful answer",
    
    // Community Guidelines
    communityGuidelines: "Community guidelines",
    guideline1: "Be respectful and constructive in discussions.",
    guideline2: "No OTP/PIN sharing.",
    guideline3: "Earn points for questions and answers.",
    guideline4: "Top contributors get special badges.",
    
    // Your Stats
    yourCommunityStats: "Your community stats",
    questions: "Questions",
    answersStat: "Answers",
    
    // Empty States
    noDiscussions: "No discussions yet. Click 'Ask question' to start.",
    noAnswersYet: "No answers yet. Be the first to reply and earn 5 points!",
    signInToAnswer: "Sign in to answer and earn points...",
    writeAnswerPlaceholder: "Write your answer and earn 5 points...",
    
    // Badges
    badges: {
      "New": "New",
      "Trending": "Trending",
      "Expert Verified": "Expert Verified",
      "Member": "Member",
      "Contributor": "Contributor",
    },
    
    // Time Ago
    justNow: "Just now",
    minuteAgo: "min ago",
    minutesAgo: "mins ago",
    hourAgo: "hour ago",
    hoursAgo: "hours ago",
    dayAgo: "day ago",
    daysAgo: "days ago",
    
    // Alerts & Messages
    signInToAsk: "Please sign in to ask a question.",
    enterTitleDescription: "Please enter title and description.",
    failedToPost: "Failed to post question:",
    failedToMarkHelpful: "Failed to mark helpful:",
    failedToAnswer: "Failed to answer:",
    notificationsComingSoon: "Notifications coming soon",
    learnComingSoon: "Learn coming soon",
    helpComingSoon: "Help coming soon",
  }
};

/** Filter chips for the feed */
const CATEGORIES = [
  "All Discussions",
  "Tax Planning",
  "Mutual Funds",
  "Stock Market",
  "Insurance",
  "Retirement",
  "Crypto",
];

/** Domains for posting a question */
const ASK_DOMAINS = [
  "General",
  "Tax Planning",
  "Mutual Funds",
  "Stock Market",
  "Insurance",
  "Retirement",
  "Crypto",
];

function timeAgo(date, language) {
  if (!date) return language === 'hindi' ? "अभी अभी" : "Just now";
  const ms = Date.now() - date.getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 1) return language === 'hindi' ? "अभी अभी" : "Just now";
  if (mins < 60) {
    if (language === 'hindi') {
      return `${mins} ${mins > 1 ? "मिनट पहले" : "मिनट पहले"}`;
    }
    return `${mins} min${mins > 1 ? "s" : ""} ago`;
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    if (language === 'hindi') {
      return `${hours} ${hours > 1 ? "घंटे पहले" : "घंटा पहले"}`;
    }
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  }
  const days = Math.floor(hours / 24);
  if (language === 'hindi') {
    return `${days} ${days > 1 ? "दिन पहले" : "दिन पहले"}`;
  }
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

export default function CommunityScreen() {
  const navigate = useNavigate();

  // Get user's language preference
  const userLanguage = localStorage.getItem('dhan-saathi-language') || 'english';
  const t = COMMUNITY_TEXT[userLanguage];
  
  // Auth + profile dropdown
  const [fbUser, setFbUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Community data
  const [selectedCategory, setSelectedCategory] = useState("All Discussions");
  const [searchText, setSearchText] = useState("");
  const [questions, setQuestions] = useState([]);

  // Ask modal (2-step)
  const [askOpen, setAskOpen] = useState(false);
  const [askStep, setAskStep] = useState(0); // 0 = domain select, 1 = form
  const [askCategory, setAskCategory] = useState("General");
  const [askTitle, setAskTitle] = useState("");
  const [askBody, setAskBody] = useState("");

  // Expanded question answers
  const [openQid, setOpenQid] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [answerText, setAnswerText] = useState("");

  // Top contributors from Firestore
  const [contributors, setContributors] = useState([]);

  // Language state
  const [language, setLanguage] = useState(userLanguage);

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

  const displayName = fbUser?.displayName || (language === 'hindi' ? "अतिथि" : "Guest");
  const email = fbUser?.email || "";

  const initials = useMemo(() => {
    const src = (displayName || email || "U").trim();
    const parts = src.split(" ").filter(Boolean);
    if (parts.length >= 2)
      return (parts[0][0] + parts[1][0]).toUpperCase();
    return (src[0] || "U").toUpperCase();
  }, [displayName, email]);

  // Live questions from Firestore
  useEffect(() => {
    const qy = query(
      collection(db, "communityQuestions"),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(
      qy,
      (snap) => {
        const rows = snap.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            ...data,
            createdAtDate: data.createdAt?.toDate
              ? data.createdAt.toDate()
              : null,
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
            createdAtDate: data.createdAt?.toDate
              ? data.createdAt.toDate()
              : null,
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

  // Top contributors from Firestore (real-time)
  useEffect(() => {
    const qy = query(
      collection(db, "users"),
      orderBy("score", "desc"),
      limit(3)
    );
    const unsub = onSnapshot(
      qy,
      (snap) => {
        const rows = snap.docs.map((d) => {
          const data = d.data();
          const communityActivity = data.communityActivity || {};
          const questionsCount = communityActivity.questionsCount || 0;
          const answersCount = communityActivity.answersCount || 0;
          return {
            id: d.id,
            name: data.name || data.displayName || (language === 'hindi' ? "उपयोगकर्ता" : "User"),
            role: `${questionsCount} ${language === 'hindi' ? 'प्र' : 'Q'} • ${answersCount} ${language === 'hindi' ? 'उ' : 'A'}`,
            score: data.score || 0,
            photoURL: data.photoURL || "",
            communityActivity: communityActivity,
          };
        });
        setContributors(rows);
      },
      (err) => {
        console.error("top contributors read error:", err);
        setContributors([]);
      }
    );
    return () => unsub();
  }, [language]);

  const filteredQuestions = useMemo(() => {
    const q = searchText.trim().toLowerCase();

    return questions.filter((item) => {
      const matchesCategory =
        selectedCategory === "All Discussions" ||
        (item.category || "General") === selectedCategory;

      const matchesSearch =
        !q ||
        (item.title || "").toLowerCase().includes(q) ||
        (item.body || "").toLowerCase().includes(q) ||
        (item.authorName || "").toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [questions, selectedCategory, searchText]);

  // Optional: counts for domains (nice UX in domain picker)
  const domainCounts = useMemo(() => {
    const counts = {};
    for (const q of questions) {
      const cat = q.category || "General";
      counts[cat] = (counts[cat] || 0) + 1;
    }
    return counts;
  }, [questions]);

  // Toggle language
  const toggleLanguage = () => {
    const newLang = language === 'hindi' ? 'english' : 'hindi';
    setLanguage(newLang);
    localStorage.setItem('dhan-saathi-language', newLang);
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await signOut(auth);
      navigate("/signup", { replace: true });
    } catch (e) {
      console.error(e);
      alert(language === 'hindi' ? "लॉगआउट विफल हुआ" : "Logout failed");
    }
  };

  // Ask flow: open domain selection first
  const handleAskOpen = () => {
    if (!fbUser) {
      alert(t.signInToAsk);
      navigate("/signup");
      return;
    }

    setAskTitle("");
    setAskBody("");

    // default domain based on currently selected filter
    const defaultDomain =
      selectedCategory === "All Discussions" ? "General" : selectedCategory;

    setAskCategory(defaultDomain);
    setAskStep(0);
    setAskOpen(true);
  };

  const handleAskSubmit = async () => {
    if (!fbUser) return;

    const title = askTitle.trim();
    const body = askBody.trim();

    if (!title || !body) {
      alert(t.enterTitleDescription);
      return;
    }

    try {
      const questionRef = await addDoc(collection(db, "communityQuestions"), {
        title,
        body,
        category: askCategory || "General",

        uid: fbUser.uid,
        authorName: fbUser.displayName || (language === 'hindi' ? "उपयोगकर्ता" : "User"),
        authorEmail: fbUser.email || "",
        authorPhotoURL: fbUser.photoURL || "",

        badge: t.badges["New"],
        answersCount: 0,
        viewsCount: 0,
        helpfulCount: 0,

        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Update user's community stats for questions asked
      try {
        const userRef = doc(db, "users", fbUser.uid);
        const communityStatsRef = doc(db, "users", fbUser.uid, "stats", "community");
        
        // Update community stats
        await setDoc(communityStatsRef, {
          questionsCount: increment(1),
          answersCount: increment(0),
          lastActiveAt: serverTimestamp(),
        }, { merge: true });
        
        // Update main user document
        await setDoc(
          userRef,
          {
            uid: fbUser.uid,
            name: fbUser.displayName || (language === 'hindi' ? "उपयोगकर्ता" : "User"),
            email: fbUser.email || "",
            photoURL: fbUser.photoURL || "",
            // Update score (10 points per question)
            score: increment(10),
            communityActivity: {
              questionsCount: increment(1),
              answersCount: increment(0),
              lastActiveAt: serverTimestamp(),
            },
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        
        // Log the event
        await addDoc(collection(db, "users", fbUser.uid, "events"), {
          type: "community_question_posted",
          data: {
            questionId: questionRef.id,
            questionTitle: title,
            category: askCategory,
            pointsEarned: 10,
          },
          createdAt: serverTimestamp(),
        });
        
      } catch (statsError) {
        console.error("Failed to update user stats:", statsError);
      }

      setAskOpen(false);
      setAskStep(0);

      // Optional: switch feed to that domain
      setSelectedCategory(
        askCategory === "General" ? "All Discussions" : askCategory
      );
    } catch (e) {
      console.error(e);
      alert(
        `${t.failedToPost} ${e?.code || ""} ${e?.message || ""}`
      );
    }
  };

  const openAnswers = async (qid) => {
    setAnswerText("");
    setOpenQid((curr) => (curr === qid ? null : qid));

    // Increment view count
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
      
      // Also give 2 points to the question author for helpful answer
      const questionDoc = await getDoc(doc(db, "communityQuestions", qid));
      if (questionDoc.exists()) {
        const questionData = questionDoc.data();
        if (questionData.uid) {
          const authorRef = doc(db, "users", questionData.uid);
          await setDoc(authorRef, {
            score: increment(2),
            updatedAt: serverTimestamp(),
          }, { merge: true });
        }
      }
    } catch (e) {
      console.error("helpful increment error:", e);
      alert(
        `${t.failedToMarkHelpful} ${e?.code || ""} ${e?.message || ""}`
      );
    }
  };

  const submitAnswer = async () => {
    if (!fbUser) {
      alert(language === 'hindi' ? "उत्तर देने के लिए कृपया साइन इन करें।" : "Please sign in to answer.");
      navigate("/signup");
      return;
    }
    if (!openQid) return;

    const text = answerText.trim();
    if (!text) return;

    try {
      // Add answer to the question
      await addDoc(
        collection(db, "communityQuestions", openQid, "answers"),
        {
          uid: fbUser.uid,
          authorName: fbUser.displayName || (language === 'hindi' ? "उपयोगकर्ता" : "User"),
          authorEmail: fbUser.email || "",
          authorPhotoURL: fbUser.photoURL || "",
          text,
          createdAt: serverTimestamp(),
        }
      );

      // Increment answersCount on question
      try {
        await updateDoc(doc(db, "communityQuestions", openQid), {
          answersCount: increment(1),
          updatedAt: serverTimestamp(),
        });
      } catch (e2) {
        console.error("answersCount increment blocked:", e2);
      }

      // Update user's community stats
      try {
        const userRef = doc(db, "users", fbUser.uid);
        const communityStatsRef = doc(db, "users", fbUser.uid, "stats", "community");
        
        // Update community stats
        await setDoc(communityStatsRef, {
          answersCount: increment(1),
          lastActiveAt: serverTimestamp(),
        }, { merge: true });
        
        // Update main user document
        await setDoc(
          userRef,
          {
            uid: fbUser.uid,
            name: fbUser.displayName || (language === 'hindi' ? "उपयोगकर्ता" : "User"),
            email: fbUser.email || "",
            photoURL: fbUser.photoURL || "",
            // Update score (5 points per answer)
            score: increment(5),
            communityActivity: {
              answersCount: increment(1),
              lastActiveAt: serverTimestamp(),
            },
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        
        // Log the community event
        await addDoc(collection(db, "users", fbUser.uid, "events"), {
          type: "community_answer_posted",
          data: {
            questionId: openQid,
            questionTitle: questions.find(q => q.id === openQid)?.title || (language === 'hindi' ? "प्रश्न" : "Question"),
            answerLength: text.length,
            pointsEarned: 5,
          },
          createdAt: serverTimestamp(),
        });
        
      } catch (e3) {
        console.error("user stats update error:", e3);
      }

      setAnswerText("");
    } catch (e) {
      console.error(e);
      alert(`${t.failedToAnswer} ${e?.code || ""} ${e?.message || ""}`);
    }
  };

  const badgeStyle = (badge) => {
    if (badge === t.badges["Expert Verified"])
      return "bg-emerald-50 text-emerald-700";
    if (badge === t.badges["Trending"]) return "bg-blue-50 text-blue-700";
    return "bg-amber-50 text-amber-700";
  };

  // Helper function to get badge based on user activity
  const getUserBadge = (userData) => {
    if (!userData) return t.badges["Member"];
    const score = userData.score || 0;
    if (score >= 300) return t.badges["Expert Verified"];
    if (score >= 100) return t.badges["Contributor"];
    return t.badges["Member"];
  };

  // Helper to get category display text
  const getCategoryText = (category) => {
    return t.categories[category] || category;
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Soft background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at top left, rgba(187,247,208,0.6) 0, transparent 55%), radial-gradient(circle at bottom right, rgba(191,219,254,0.55) 0, transparent 55%)",
          opacity: 0.7,
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* NAVBAR */}
        <header className="w-full bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <button
              type="button"
              onClick={goHome}
              className="flex items-center gap-2.5"
            >
              <div className="h-9 w-9 rounded-xl bg-green-600 flex items-center justify-center shadow-md">
                <IndianRupee className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                {t.appName}
              </span>
            </button>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
              <button
                type="button"
                onClick={goHome}
                className="flex items-center gap-1.5 hover:text-gray-900 transition"
              >
                <Home className="h-4 w-4" /> {t.home}
              </button>

              <button
                type="button"
                onClick={goSchemes}
                className="flex items-center gap-1.5 hover:text-gray-900 transition"
              >
                <Building2 className="h-4 w-4" /> {t.schemes}
              </button>

              <button
                type="button"
                onClick={goCommunity}
                className="relative text-green-700 font-semibold flex items-center gap-1.5"
              >
                <MessageCircle className="h-4 w-4" />
                {t.community}
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-green-600" />
              </button>

              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-gray-900 transition"
                onClick={() => navigate("/learn")}
              >
                <BookOpen className="h-4 w-4" /> {t.learn}
              </button>

              <button
                type="button"
                className="flex items-center gap-1.5 hover:text-gray-900 transition"
                onClick={() => navigate("/help")}
              >
                <ShieldCheck className="h-4 w-4" /> {t.help}
              </button>
            </nav>

            <div className="flex items-center gap-3">
              {/* Language Toggle Button */}
              <button
                type="button"
                onClick={toggleLanguage}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 transition"
                title={language === 'hindi' ? "Switch to English" : "Switch to Hindi"}
              >
                <Globe className="h-4 w-4" />
                <span className="text-xs font-medium">
                  {language === 'hindi' ? 'हिंदी' : 'English'}
                </span>
              </button>

              <button
                type="button"
                className="hidden sm:inline-flex h-10 w-10 rounded-full bg-white border border-gray-200 shadow-sm items-center justify-center text-gray-700 hover:bg-gray-50"
                title={t.notifications}
                onClick={() => alert(t.notificationsComingSoon)}
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
                        {email || (language === 'hindi' ? "साइन इन नहीं किया गया" : "Not signed in")}
                      </p>
                    </div>

                    <div className="h-px bg-gray-100" />

                    <div className="p-2">
                      <button
                        type="button"
                        onClick={toggleLanguage}
                        className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <Globe className="h-4 w-4 text-green-600" />
                        {language === 'hindi' ? 'Switch to English' : 'हिंदी में बदलें'}
                      </button>
                    </div>

                    <div className="h-px bg-gray-100" />

                    {fbUser ? (
                      <button
                        type="button"
                        className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        {t.logout}
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="w-full px-4 py-3 text-left text-sm text-green-700 hover:bg-green-50"
                        onClick={() => navigate("/signup")}
                      >
                        {t.signin}
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
          {/* top row */}
          <div className="flex flex-col lg:flex-row gap-4 lg:items-center lg:justify-between mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {t.pageTitle}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {t.pageSubtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/80 border border-gray-200 shadow-sm w-full sm:w-72">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
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
                {t.askQuestion}
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
                {getCategoryText(cat)}
              </button>
            ))}
          </div>

          {/* grid */}
          <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
            {/* LEFT */}
            <section className="space-y-4">
              {filteredQuestions.length === 0 ? (
                <div className="rounded-3xl bg-white/95 backdrop-blur border border-gray-100 shadow p-6 text-gray-700">
                  {t.noDiscussions}
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
                            {q.authorName || (language === 'hindi' ? "उपयोगकर्ता" : "User")}
                          </p>
                          <p className="text-xs text-gray-500">
                            {timeAgo(q.createdAtDate, language)} •{" "}
                            {getCategoryText(q.category || "General")}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${badgeStyle(
                          q.badge
                        )}`}
                      >
                        {q.badge === t.badges["Expert Verified"] && (
                          <ShieldCheck className="h-3.5 w-3.5" />
                        )}
                        {q.badge || t.badges["New"]}
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
                          {q.answersCount || 0} {t.answers}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <Eye className="h-3.5 w-3.5" />
                          {q.viewsCount || 0} {t.views}
                        </span>
                        <button
                          type="button"
                          onClick={() => markHelpful(q.id)}
                          className="inline-flex items-center gap-1.5 hover:text-gray-900"
                        >
                          <ThumbsUp className="h-3.5 w-3.5" />
                          {t.helpful} ({q.helpfulCount || 0})
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => openAnswers(q.id)}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100"
                      >
                        {openQid === q.id ? t.hideAnswers : t.readAnswers}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    {openQid === q.id && (
                      <div className="mt-5 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          {t.answers} (+5 {t.points.toLowerCase()} {language === 'hindi' ? 'प्रत्येक' : 'each'})
                        </h3>

                        {answers.length === 0 ? (
                          <p className="text-sm text-gray-600">
                            {t.noAnswersYet}
                          </p>
                        ) : (
                          <div className="space-y-3">
                            {answers.map((a) => (
                              <div
                                key={a.id}
                                className="bg-white rounded-xl border border-gray-100 p-3"
                              >
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
                                      {(a.authorName || (language === 'hindi' ? "उ" : "U"))[0]
                                        ?.toUpperCase()}
                                    </div>
                                  )}
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold text-gray-900 truncate">
                                      {a.authorName || (language === 'hindi' ? "उपयोगकर्ता" : "User")}
                                    </p>
                                    <p className="text-[11px] text-gray-500">
                                      {timeAgo(a.createdAtDate, language)}
                                    </p>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-700">
                                  {a.text}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="mt-4">
                          <textarea
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            rows={3}
                            placeholder={
                              fbUser
                                ? t.writeAnswerPlaceholder
                                : t.signInToAnswer
                            }
                            className="w-full rounded-xl border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-green-200"
                            disabled={!fbUser}
                          />
                          <div className="flex justify-between items-center mt-2">
                            <span className="text-xs text-gray-500">
                              {language === 'hindi' ? 'सहायक उत्तर के लिए 5 अंक अर्जित करें' : 'Earn 5 points for a helpful answer'}
                            </span>
                            <button
                              type="button"
                              onClick={submitAnswer}
                              className="px-4 py-2 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition disabled:opacity-50"
                              disabled={
                                !fbUser || !answerText.trim()
                              }
                            >
                              {t.postAnswer}
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
              {/* Top contributors */}
              <div className="rounded-3xl bg-white/95 backdrop-blur border border-gray-100 shadow-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {t.topContributors}
                  </h3>
                  <Award className="h-5 w-5 text-amber-500" />
                </div>

                {contributors.length === 0 ? (
                  <p className="text-xs text-gray-500">
                    {t.noContributors}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {contributors.map((c, idx) => (
                      <div
                        key={c.id}
                        className="flex items-center justify-between p-3 rounded-2xl bg-gray-50/50 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-xs font-semibold text-white">
                              {idx + 1}
                            </div>
                            {idx === 0 && (
                              <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-yellow-400 border border-white" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {c.photoURL ? (
                              <img
                                src={c.photoURL}
                                alt={c.name}
                                className="h-8 w-8 rounded-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 grid place-items-center text-xs font-bold">
                                {c.name[0]?.toUpperCase() || "U"}
                              </div>
                            )}
                            <div>
                              <div className="flex items-center gap-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {c.name}
                                </p>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${getUserBadge(c) === t.badges["Expert Verified"] ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'}`}>
                                  {getUserBadge(c)}
                                </span>
                              </div>
                              {c.role && (
                                <p className="text-xs text-gray-500">
                                  {c.role}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-semibold text-emerald-700">
                            {c.score} {t.points}
                          </span>
                          <p className="text-[10px] text-gray-500 mt-0.5">
                            {t.level} {Math.min(4, Math.floor(c.score / 100) + 1)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Points system info */}
                <div className="mt-4 pt-3 border-t border-gray-100">
                  <p className="text-xs font-semibold text-gray-900 mb-2">{t.pointsSystem}:</p>
                  <div className="space-y-1 text-xs text-gray-600">
                    <div className="flex justify-between">
                      <span>{t.askQuestionPoints}</span>
                      <span className="font-semibold text-emerald-700">+10 {t.points.toLowerCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.postAnswerPoints}</span>
                      <span className="font-semibold text-emerald-700">+5 {t.points.toLowerCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t.helpfulAnswerPoints}</span>
                      <span className="font-semibold text-emerald-700">+2 {t.points.toLowerCase()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl bg-white/95 backdrop-blur border border-gray-100 shadow-lg p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Info className="h-4 w-4 text-emerald-600" />
                  {t.communityGuidelines}
                </h3>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5" />
                    {t.guideline1}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5" />
                    {t.guideline2}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5" />
                    {t.guideline3}
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 mt-0.5" />
                    {t.guideline4}
                  </li>
                </ul>
              </div>

              {/* Your stats (if logged in) */}
              {fbUser && (
                <div className="rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg p-5">
                  <h3 className="text-sm font-semibold mb-2">{t.yourCommunityStats}</h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-white/10 rounded-xl p-3 text-center">
                      <p className="text-xs opacity-90">{t.questions}</p>
                      <p className="text-lg font-bold">
                        {contributors.find(c => c.id === fbUser.uid)?.communityActivity?.questionsCount || 0}
                      </p>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3 text-center">
                      <p className="text-xs opacity-90">{t.answersStat}</p>
                      <p className="text-lg font-bold">
                        {contributors.find(c => c.id === fbUser.uid)?.communityActivity?.answersCount || 0}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/profile")}
                    className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-white/20 hover:bg-white/30 text-xs font-semibold transition"
                  >
                    {t.viewFullProfile}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}

              <div className="rounded-3xl bg-white/95 backdrop-blur border border-gray-100 shadow-lg p-5 flex items-center gap-3">
                <Users className="h-6 w-6 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {questions.length} {t.activeDiscussions}
                  </p>
                  <p className="text-xs text-gray-500">
                    {t.joinConversation}
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </main>

        {/* Ask Question Modal (Domain picker -> Form) */}
        {askOpen && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
            <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {t.askQuestionTitle}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {t.stepOf} {askStep + 1} {language === 'hindi' ? 'का 2 • 10 अंक अर्जित करें' : 'of 2 • Earn 10 points'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setAskOpen(false);
                    setAskStep(0);
                  }}
                  className="text-gray-500 hover:text-gray-900"
                >
                  ✕
                </button>
              </div>

              {/* Step 0: Choose Domain */}
              {askStep === 0 && (
                <div className="mt-5">
                  <p className="text-sm font-semibold text-gray-900 mb-3">
                    {t.chooseDomain}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {ASK_DOMAINS.map((d) => {
                      const active = askCategory === d;
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setAskCategory(d)}
                          className={
                            active
                              ? "px-3 py-2 rounded-full bg-green-600 text-white text-sm font-semibold"
                              : "px-3 py-2 rounded-full bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-white"
                          }
                        >
                          {t.askDomains[d] || d}
                          <span className="ml-2 text-xs opacity-80">
                            {domainCounts[d]
                              ? `(${domainCounts[d]})`
                              : ""}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setAskOpen(false);
                        setAskStep(0);
                      }}
                      className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
                    >
                      {t.cancel}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAskStep(1)}
                      className="px-4 py-2 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700"
                    >
                      {t.next}
                    </button>
                  </div>
                </div>
              )}

              {/* Step 1: Title + Body */}
              {askStep === 1 && (
                <div className="mt-5">
                  <div className="mb-3 text-sm text-gray-600">
                    {language === 'hindi' ? 'डोमेन:' : 'Domain:'}{" "}
                    <span className="font-semibold text-gray-900">
                      {t.askDomains[askCategory] || askCategory}
                    </span>
                    <button
                      type="button"
                      onClick={() => setAskStep(0)}
                      className="ml-3 text-green-700 font-semibold hover:text-green-800"
                    >
                      {t.change}
                    </button>
                  </div>

                  <div className="space-y-3">
                    <input
                      value={askTitle}
                      onChange={(e) => setAskTitle(e.target.value)}
                      placeholder={t.questionTitlePlaceholder}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-200"
                    />
                    <textarea
                      value={askBody}
                      onChange={(e) => setAskBody(e.target.value)}
                      placeholder={t.questionBodyPlaceholder}
                      rows={5}
                      className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-green-200"
                    />
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => setAskStep(0)}
                      className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
                    >
                      {t.back}
                    </button>

                    <button
                      type="button"
                      onClick={handleAskSubmit}
                      className="px-4 py-2 rounded-full bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50"
                      disabled={
                        !askTitle.trim() || !askBody.trim()
                      }
                    >
                      {t.askQuestion}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get document (needed for markHelpful)
async function getDoc(documentRef) {
  const { getDoc: firestoreGetDoc } = await import("firebase/firestore");
  return firestoreGetDoc(documentRef);
}