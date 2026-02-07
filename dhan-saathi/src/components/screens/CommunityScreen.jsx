// src/components/screens/CommunityScreen.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../firebase";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  limit,
  setDoc,
  where,
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
  Sparkles,
  X,
  ChevronRight,
  ChevronLeft,
  Menu,
  HelpCircle,
  UserCog,
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
    helpComingSoon: "सहायता जल्द ही आ रहा है",
    
    // AI Recommendations
    aiRecommendationsTitle: "🎯 AI आपके लिए इन विषयों की सिफारिश करता है",
    aiRecommendationsSubtitle: "अपने रुचि क्षेत्रों के आधार पर हमने कुछ प्रश्न सुझाए हैं",
    aiSelectInterests: "अपनी रुचियाँ चुनें (कम से कम 2)",
    aiSkip: "बाद के लिए छोड़ें",
    aiSaveInterests: "रुचियाँ सहेजें",
    aiLoading: "सिफारिशें लोड हो रही हैं...",
    aiRecommendedQuestions: "आपके लिए अनुशंसित प्रश्न",
    aiBasedOnYourInterests: "आपकी रुचियों के आधार पर",
    aiNoRecommendations: "अभी तक कोई सिफारिश नहीं। रुचियाँ चुनें या चर्चाओं को ब्राउज़ करें।",
    aiAskRecommended: "यह प्रश्न पूछें",
    aiInterestsSaved: "रुचियाँ सफलतापूर्वक सहेजी गईं!",
    aiUpdateInterests: "रुचियाँ अपडेट करें",

    // Sidebar
    sidebarMainMenu: "मुख्य मेनू",
    sidebarOthers: "अन्य",
    profile: "प्रोफाइल",
    language: "भाषा",
    collapseSidebar: "साइडबार छोटा करें",
    expandSidebar: "साइडबार बड़ा करें",
    profileComplete: "प्रोफाइल पूर्ण",
    profileIncomplete: "प्रोफाइल अधूरी",
    viewProfile: "प्रोफाइल देखें",
    changeLanguage: "भाषा बदलें",
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
    
    // AI Recommendations
    aiRecommendationsTitle: "🎯 AI Recommended Topics For You",
    aiRecommendationsSubtitle: "Based on your interest areas, we've suggested some questions",
    aiSelectInterests: "Select your interests (minimum 2)",
    aiSkip: "Skip for later",
    aiSaveInterests: "Save Interests",
    aiLoading: "Loading recommendations...",
    aiRecommendedQuestions: "Recommended Questions For You",
    aiBasedOnYourInterests: "Based on your interests",
    aiNoRecommendations: "No recommendations yet. Select interests or browse discussions.",
    aiAskRecommended: "Ask this question",
    aiInterestsSaved: "Interests saved successfully!",
    aiUpdateInterests: "Update Interests",

    // Sidebar
    sidebarMainMenu: "Main Menu",
    sidebarOthers: "Others",
    profile: "Profile",
    language: "Language",
    collapseSidebar: "Collapse sidebar",
    expandSidebar: "Expand sidebar",
    profileComplete: "Profile Complete",
    profileIncomplete: "Profile Incomplete",
    viewProfile: "View Profile",
    changeLanguage: "Change Language",
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

/** AI recommended questions based on interests */
const AI_RECOMMENDED_QUESTIONS = {
  "Tax Planning": [
    "How to save tax under Section 80C with mutual funds?",
    "Is it better to invest in ELSS or PPF for tax saving?",
    "How to claim HRA exemption when working from home?",
    "Tax implications of switching jobs mid-year?",
    "Best tax saving options for salaried employees beyond 80C?",
    "How to file ITR for income from freelance work?",
    "Tax benefits available for first-time home buyers?",
    "How to save tax on capital gains from stock investments?",
    "Difference between old and new tax regime - which is better?",
    "How to calculate advance tax for FY 2024-25?"
  ],
  "Mutual Funds": [
    "Which is better: SIP or lump sum investment in mutual funds?",
    "How to choose between growth and dividend option in mutual funds?",
    "What are the tax implications of redeeming mutual funds?",
    "How to build a diversified mutual fund portfolio with ₹5000/month?",
    "Are sectoral mutual funds good for long-term investment?",
    "How to track performance of my mutual fund investments?",
    "What is expense ratio and why does it matter in mutual funds?",
    "Should I invest in international mutual funds for diversification?",
    "How to switch between mutual funds without tax implications?",
    "Are debt mutual funds safer than equity mutual funds?"
  ],
  "Stock Market": [
    "How to analyze a company's fundamentals before investing?",
    "What are the best indicators for identifying entry points in stocks?",
    "How much emergency fund should I have before investing in stocks?",
    "Is it better to invest in large-cap or small-cap stocks for long term?",
    "How to build a stock portfolio for retirement?",
    "What are the risks of investing in IPO stocks?",
    "How to use technical analysis for day trading in Indian markets?",
    "Should I invest in stocks directly or through mutual funds?",
    "How to manage risk while investing in volatile stocks?",
    "What are the tax implications of intraday trading vs delivery?"
  ],
  "Insurance": [
    "How much life insurance coverage do I actually need?",
    "Term insurance vs whole life insurance - which is better?",
    "Should I buy health insurance from employer or separately?",
    "How to choose the right sum insured for health insurance?",
    "What is critical illness cover and do I need it?",
    "How does claim settlement ratio affect insurance policy choice?",
    "Should I buy insurance online or through an agent?",
    "How to port health insurance policy to another company?",
    "What are the tax benefits available for health insurance?",
    "Is it necessary to have both term and health insurance?"
  ],
  "Retirement": [
    "How much corpus do I need to retire at 60 in India?",
    "NPS vs PPF - which is better for retirement planning?",
    "How to calculate my retirement corpus requirement?",
    "Should I invest in annuity plans for retirement income?",
    "How to balance between EPF and other retirement investments?",
    "What withdrawal strategy should I follow during retirement?",
    "How to account for inflation in retirement planning?",
    "Is it too late to start retirement planning at age 40?",
    "How to generate monthly income from retirement corpus?",
    "What are the tax implications of retirement withdrawals?"
  ],
  "Crypto": [
    "How to safely store cryptocurrency in India?",
    "What are the tax implications of cryptocurrency trading in India?",
    "How to identify potential cryptocurrency investment opportunities?",
    "What percentage of portfolio should be in cryptocurrency?",
    "How to secure crypto wallets from hacking attempts?",
    "What are the risks of investing in new cryptocurrencies?",
    "How does blockchain technology work in simple terms?",
    "Should I invest in Bitcoin or other altcoins?",
    "How to track cryptocurrency investments for tax purposes?",
    "What are the regulatory risks for crypto in India?"
  ],
  "General": [
    "How to start investing with just ₹1000 per month?",
    "What is the difference between saving and investing?",
    "How to create a budget that actually works?",
    "What are the first steps to financial planning for beginners?",
    "How to build an emergency fund in 6 months?",
    "What financial mistakes should young earners avoid?",
    "How to balance between spending and saving?",
    "What are good financial habits to develop in your 20s?",
    "How to talk to family about money matters?",
    "What are the basic documents needed for financial planning?"
  ]
};

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
  const [userDoc, setUserDoc] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

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

  // AI Recommendations
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [userInterests, setUserInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [aiQuestions, setAiQuestions] = useState([]);
  const [loadingAI, setLoadingAI] = useState(false);
  const [hasSeenAIRecommendations, setHasSeenAIRecommendations] = useState(false);
  const [showUpdateInterests, setShowUpdateInterests] = useState(false);

  // Navigation functions
  const goHome = () => navigate("/home");
  const goSchemes = () => navigate("/schemes");
  const goCommunity = () => navigate("/community");
  const goLearn = () => navigate("/learn");
  const goHelp = () => navigate("/help");

  // Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setFbUser(u || null);
      
      // Check if we should show AI recommendations
      if (u) {
        await checkAndShowAIRecommendations(u.uid);
      }
    });
    return () => unsub();
  }, []);

  // Load user document
  useEffect(() => {
    if (!fbUser) {
      setUserDoc(null);
      return;
    }
    const unsub = onSnapshot(
      doc(db, "users", fbUser.uid),
      (snap) => setUserDoc(snap.exists() ? snap.data() : null),
      (err) => {
        console.error("Firestore users doc error:", err);
        setUserDoc(null);
      }
    );
    return () => unsub();
  }, [fbUser]);

  // Check if user has seen AI recommendations
  const checkAndShowAIRecommendations = async (userId) => {
    try {
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        // Check if user has interests set
        const interests = userData.interests || [];
        const hasSeen = userData.hasSeenAIRecommendations || false;
        
        setUserInterests(interests);
        setSelectedInterests(interests);
        setHasSeenAIRecommendations(hasSeen);
        
        // If interests exist, load AI recommendations
        if (interests.length > 0) {
          loadAIRecommendations(interests);
        }
        
        // Show popup if user hasn't seen it before
        if (!hasSeen && !hasSeenAIRecommendations) {
          setTimeout(() => {
            setShowAIRecommendations(true);
          }, 1500); // Show after 1.5 seconds
        }
      } else {
        // New user - show AI recommendations
        setTimeout(() => {
          setShowAIRecommendations(true);
        }, 1500);
      }
    } catch (error) {
      console.error("Error checking AI recommendations:", error);
    }
  };

  // Load AI recommendations based on interests
  const loadAIRecommendations = (interests) => {
    setLoadingAI(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const recommendedQuestions = [];
      
      // For each interest, pick 2 random questions
      interests.forEach(interest => {
        const questionsForInterest = AI_RECOMMENDED_QUESTIONS[interest] || [];
        const randomQuestions = [...questionsForInterest]
          .sort(() => 0.5 - Math.random())
          .slice(0, 2);
        
        randomQuestions.forEach(question => {
          recommendedQuestions.push({
            id: Math.random().toString(36).substr(2, 9),
            question,
            category: interest,
            isAIRecommended: true
          });
        });
      });
      
      // Remove duplicates and limit to 6 questions
      const uniqueQuestions = Array.from(new Set(recommendedQuestions.map(q => q.question)))
        .map(question => {
          return recommendedQuestions.find(q => q.question === question);
        })
        .slice(0, 6);
      
      setAiQuestions(uniqueQuestions);
      setLoadingAI(false);
    }, 800);
  };

  // Save user interests to Firestore
  const saveUserInterests = async () => {
    if (!fbUser) return;
    
    if (selectedInterests.length < 2) {
      alert(language === 'hindi' 
        ? "कृपया कम से कम 2 रुचियाँ चुनें" 
        : "Please select at least 2 interests");
      return;
    }
    
    try {
      const userRef = doc(db, "users", fbUser.uid);
      
      await setDoc(userRef, {
        uid: fbUser.uid,
        name: fbUser.displayName || (language === 'hindi' ? "उपयोगकर्ता" : "User"),
        email: fbUser.email || "",
        photoURL: fbUser.photoURL || "",
        interests: selectedInterests,
        hasSeenAIRecommendations: true,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      // Update local state
      setUserInterests(selectedInterests);
      setHasSeenAIRecommendations(true);
      
      // Show success message
      alert(t.aiInterestsSaved);
      
      // Load recommendations
      loadAIRecommendations(selectedInterests);
      
      // Close modal
      setShowAIRecommendations(false);
      setShowUpdateInterests(false);
      
    } catch (error) {
      console.error("Error saving interests:", error);
      alert(language === 'hindi' 
        ? "रुचियाँ सहेजने में त्रुटि" 
        : "Error saving interests");
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const onDown = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  // Close mobile sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const displayName = useMemo(() => {
    if (fbUser?.displayName) return fbUser.displayName;
    if (fbUser?.email) {
      const emailName = fbUser.email.split("@")[0];
      return emailName.charAt(0).toUpperCase() + emailName.slice(1);
    }
    return language === "hindi" ? "अतिथि" : "Guest";
  }, [fbUser, language]);

  const email = fbUser?.email || "";

  const initials = useMemo(() => {
    const src = (displayName || email || "U").trim();
    const parts = src.split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
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
            interests: data.interests || [],
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

  // Handle interest selection
  const toggleInterest = (interest) => {
    setSelectedInterests(prev => {
      if (prev.includes(interest)) {
        return prev.filter(i => i !== interest);
      } else {
        return [...prev, interest];
      }
    });
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

  // Handle asking a recommended question
  const handleAskRecommendedQuestion = (question, category) => {
    if (!fbUser) {
      alert(t.signInToAsk);
      navigate("/signup");
      return;
    }

    setAskTitle(question);
    setAskCategory(category);
    setAskBody(language === 'hindi' 
      ? `मुझे ${t.askDomains[category] || category} के बारे में और जानना चाहिए। क्या कोई मदद कर सकता है?`
      : `I'd like to know more about ${category}. Can anyone help?`
    );
    setAskStep(1);
    setAskOpen(true);
    setShowAIRecommendations(false);
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

  // Sidebar navigation items
  const sidebarNavItems = [
    { label: t.home, icon: Home, onClick: goHome },
    { label: t.schemes, icon: Building2, onClick: goSchemes },
    { label: t.community, icon: MessageCircle, onClick: goCommunity, active: true },
    { label: t.learn, icon: BookOpen, onClick: goLearn },
    { label: t.help, icon: HelpCircle, onClick: goHelp },
  ];

  const sidebarBottomItems = [
    {
      label: t.profile,
      icon: UserCog,
      onClick: () => navigate("/profile"),
    },
    {
      label: t.changeLanguage,
      icon: Globe,
      onClick: toggleLanguage,
    },
  ];

  // Sidebar component
  const SidebarContent = ({ collapsed = false, onClose = null }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div
        className={`flex items-center ${
          collapsed ? "justify-center" : "justify-between"
        } px-4 py-5 border-b border-gray-100`}
      >
        <div
          className="flex items-center gap-2.5 cursor-pointer"
          onClick={goHome}
        >
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-green-200/50 flex-shrink-0">
            <IndianRupee className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <span className="text-xl font-bold tracking-tight text-gray-900">
              {t.appName}
            </span>
          )}
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* User card */}
      <div
        className={`mx-3 mt-4 mb-2 ${
          collapsed ? "px-1" : "px-3"
        } py-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100`}
      >
        <div
          className={`flex ${
            collapsed ? "justify-center" : "items-center gap-3"
          }`}
        >
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow flex-shrink-0">
            {fbUser?.photoURL ? (
              <img
                src={fbUser.photoURL}
                alt=""
                className="h-full w-full rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              initials
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {displayName}
              </p>
              <p className="text-[11px] text-gray-500 truncate">{email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Main nav */}
      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <p
          className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest ${
            collapsed ? "text-center" : "px-3"
          } mb-2`}
        >
          {collapsed ? "—" : t.sidebarMainMenu}
        </p>

        {sidebarNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => {
                item.onClick();
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center ${
                collapsed ? "justify-center" : ""
              } gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                item.active
                  ? "bg-emerald-100 text-emerald-800 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`h-5 w-5 flex-shrink-0 ${
                  item.active
                    ? "text-emerald-600"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.active && (
                <div className="ml-auto h-2 w-2 rounded-full bg-emerald-500" />
              )}
            </button>
          );
        })}

        <div className="my-4 border-t border-gray-100" />

        <p
          className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest ${
            collapsed ? "text-center" : "px-3"
          } mb-2`}
        >
          {collapsed ? "—" : t.sidebarOthers}
        </p>

        {sidebarBottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => {
                item.onClick();
                setMobileSidebarOpen(false);
              }}
              className={`w-full flex items-center ${
                collapsed ? "justify-center" : ""
              } gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all group`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-600" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Bottom section */}
      <div className="px-3 pb-4 space-y-2 border-t border-gray-100 pt-3">
        {/* Collapse toggle (desktop only) */}
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className={`hidden lg:flex w-full items-center ${
            collapsed ? "justify-center" : ""
          } gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all`}
          title={sidebarOpen ? t.collapseSidebar : t.expandSidebar}
        >
          <ChevronLeft
            className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
          {!collapsed && (
            <span>
              {sidebarOpen ? t.collapseSidebar : t.expandSidebar}
            </span>
          )}
        </button>

        {/* Logout */}
        {fbUser ? (
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${
              collapsed ? "justify-center" : ""
            } gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all`}
            title={collapsed ? t.logout : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{t.logout}</span>}
          </button>
        ) : (
          <button
            onClick={() => navigate("/signup")}
            className={`w-full flex items-center ${
              collapsed ? "justify-center" : ""
            } gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-green-700 hover:bg-green-50 transition-all`}
            title={collapsed ? t.signin : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0 rotate-180" />
            {!collapsed && <span>{t.signin}</span>}
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <style>{`
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
      `}</style>

      <div className="flex h-screen overflow-hidden bg-gray-50">
        {/* ═══ MOBILE SIDEBAR OVERLAY ═══ */}
        {mobileSidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}

        {/* ═══ MOBILE SIDEBAR ═══ */}
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
            mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <SidebarContent onClose={() => setMobileSidebarOpen(false)} />
        </aside>

        {/* ═══ DESKTOP SIDEBAR ═══ */}
        <aside
          className={`hidden lg:flex flex-col flex-shrink-0 bg-white border-r border-gray-100 transition-all duration-300 ease-in-out ${
            sidebarOpen ? "w-64" : "w-20"
          }`}
        >
          <SidebarContent collapsed={!sidebarOpen} />
        </aside>

        {/* ═══ MAIN AREA ═══ */}
        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* ═══ TOP BAR ═══ */}
          <header className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-20">
            <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
              {/* Left: hamburger + page title */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setMobileSidebarOpen(true)}
                  className="lg:hidden h-10 w-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                    {t.community}
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {language === "hindi"
                      ? "आपका वित्तीय समुदाय"
                      : "Your financial community"}
                  </p>
                </div>
              </div>

              {/* Right: lang + notification + profile */}
              <div className="flex items-center gap-3">
                {/* Update Interests Button (shown when user has interests) */}
                {fbUser && userInterests.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowUpdateInterests(true)}
                    className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 shadow-sm text-emerald-700 hover:bg-emerald-100 transition"
                    title="Update your interests"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span className="text-xs font-medium">
                      {language === 'hindi' ? 'रुचियाँ' : 'Interests'}
                    </span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={toggleLanguage}
                  className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 transition hover:-translate-y-0.5"
                >
                  <Globe className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {language === "hindi" ? "हिंदी" : "English"}
                  </span>
                  <span className="text-xs text-gray-500">⇄</span>
                </button>

                <button
                  type="button"
                  className="h-10 w-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition relative"
                  onClick={() => alert(t.notificationsComingSoon)}
                >
                  <Bell className="h-5 w-5" />
                  <div className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
                </button>

                {/* Profile mini-dropdown */}
                <div className="relative" ref={menuRef}>
                  <button
                    type="button"
                    onClick={() => setMenuOpen((v) => !v)}
                    className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-emerald-500 shadow flex items-center justify-center text-white font-semibold"
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

                  <div
                    className={`absolute right-0 mt-3 w-72 rounded-2xl bg-white/95 backdrop-blur border border-gray-200 shadow-xl overflow-hidden origin-top-right transition-all duration-200 ${
                      menuOpen
                        ? "opacity-100 scale-100 translate-y-0"
                        : "pointer-events-none opacity-0 scale-95 -translate-y-2"
                    }`}
                  >
                    <div className="px-4 py-4">
                      <p className="text-sm font-semibold text-gray-900">
                        {displayName}
                      </p>
                      <p className="text-xs text-gray-600 mt-1 break-all">
                        {email ||
                          (language === "hindi"
                            ? "साइन इन नहीं"
                            : "Not signed in")}
                      </p>
                      <div className="mt-2">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            userDoc?.profileComplete
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {userDoc?.profileComplete
                            ? t.profileComplete
                            : t.profileIncomplete}
                        </span>
                      </div>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setMenuOpen(false);
                      }}
                      className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <UserCog className="h-4 w-4 text-gray-400" />
                      {t.viewProfile}
                    </button>
                    <div className="h-px bg-gray-100" />
                    {fbUser ? (
                      <button
                        className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                        {t.logout}
                      </button>
                    ) : (
                      <button
                        className="w-full px-4 py-3 text-left text-sm text-green-700 hover:bg-green-50"
                        onClick={() => navigate("/signup")}
                      >
                        {t.signin}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* ═══ SCROLLABLE CONTENT ═══ */}
          <main className="flex-1 overflow-y-auto">
            <div
              className="min-h-full relative"
              style={{
                backgroundImage: `
                  radial-gradient(circle at top left, rgba(187,247,208,0.6) 0, transparent 55%),
                  radial-gradient(circle at bottom right, rgba(191,219,254,0.55) 0, transparent 55%)
                `,
                opacity: 1,
              }}
            >
              {/* Blobs */}
              <div className="pointer-events-none absolute -top-48 -left-48 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(34,197,94,0.25)_0%,rgba(16,185,129,0.08)_38%,transparent_70%)] blur-3xl opacity-90 mix-blend-multiply animate-[blobA_18s_ease-in-out_infinite]" />
              <div className="pointer-events-none absolute top-[25%] -right-56 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(16,185,129,0.20)_0%,rgba(59,130,246,0.08)_42%,transparent_72%)] blur-3xl opacity-80 mix-blend-multiply animate-[blobB_22s_ease-in-out_infinite]" />

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
                {/* AI Recommendations Section (only shown when user has interests) */}
                {fbUser && userInterests.length > 0 && aiQuestions.length > 0 && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-emerald-600" />
                          {t.aiRecommendedQuestions}
                        </h2>
                        <p className="text-sm text-gray-600">
                          {t.aiBasedOnYourInterests}: {userInterests.map(i => t.askDomains[i] || i).join(", ")}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowUpdateInterests(true)}
                        className="text-xs text-emerald-700 hover:text-emerald-800 font-medium"
                      >
                        {language === 'hindi' ? 'रुचियाँ बदलें' : 'Change interests'}
                      </button>
                    </div>
                    
                    {loadingAI ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="rounded-2xl bg-gray-100 animate-pulse p-4 h-32"></div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {aiQuestions.slice(0, 3).map((q) => (
                          <div
                            key={q.id}
                            className="rounded-2xl bg-gradient-to-br from-emerald-50 to-white border border-emerald-100 p-4 hover:border-emerald-300 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                                {t.askDomains[q.category] || q.category}
                              </span>
                              <Sparkles className="h-4 w-4 text-emerald-400" />
                            </div>
                            <p className="text-sm font-medium text-gray-900 mb-3 line-clamp-2">
                              {q.question}
                            </p>
                            <button
                              type="button"
                              onClick={() => handleAskRecommendedQuestion(q.question, q.category)}
                              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition"
                            >
                              {t.aiAskRecommended}
                              <ChevronRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

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
                    <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-gray-200 shadow-sm w-full sm:w-72">
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
                          : "px-4 py-2 rounded-full bg-white border border-gray-200 text-xs sm:text-sm text-gray-700 hover:border-green-400 hover:text-green-700 transition"
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
                      <div className="rounded-3xl bg-white border border-gray-100 shadow p-6 text-gray-700">
                        {t.noDiscussions}
                      </div>
                    ) : (
                      filteredQuestions.map((q) => (
                        <article
                          key={q.id}
                          className="rounded-3xl bg-white border border-gray-100 shadow-[0_18px_35px_rgba(15,23,42,0.06)] p-5 sm:p-6"
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
                    <div className="rounded-3xl bg-white border border-gray-100 shadow-lg p-5">
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
                              className="flex items-center justify-between p-3 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors"
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

                    <div className="rounded-3xl bg-white border border-gray-100 shadow-lg p-5">
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

                    <div className="rounded-3xl bg-white border border-gray-100 shadow-lg p-5 flex items-center gap-3">
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
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* AI Recommendations Modal */}
      {(showAIRecommendations || showUpdateInterests) && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-200 p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-emerald-600" />
                  {t.aiRecommendationsTitle}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {t.aiRecommendationsSubtitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAIRecommendations(false);
                  setShowUpdateInterests(false);
                }}
                className="text-gray-500 hover:text-gray-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-900 mb-3">
                {t.aiSelectInterests}
              </p>
              <div className="flex flex-wrap gap-2">
                {ASK_DOMAINS.map((domain) => (
                  <button
                    key={domain}
                    type="button"
                    onClick={() => toggleInterest(domain)}
                    className={
                      selectedInterests.includes(domain)
                        ? "px-4 py-3 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 text-white text-sm font-semibold shadow-sm transition-all transform hover:scale-105"
                        : "px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-800 hover:bg-gray-100 hover:border-emerald-300 transition"
                    }
                  >
                    {t.askDomains[domain] || domain}
                    <span className="ml-2 text-xs opacity-80">
                      {domainCounts[domain] ? `(${domainCounts[domain]})` : ""}
                    </span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                {language === 'hindi' 
                  ? `चयनित: ${selectedInterests.length} (न्यूनतम 2 आवश्यक)`
                  : `Selected: ${selectedInterests.length} (minimum 2 required)`}
              </p>
            </div>

            {selectedInterests.length >= 2 && (
              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-900 mb-3">
                  {t.aiRecommendedQuestions}
                </p>
                {loadingAI ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="rounded-xl bg-gray-100 animate-pulse p-4 h-16"></div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedInterests.slice(0, 2).map((interest, idx) => {
                      const questionsForInterest = AI_RECOMMENDED_QUESTIONS[interest] || [];
                      const sampleQuestion = questionsForInterest[0] || `${interest} से संबंधित प्रश्न`;
                      return (
                        <div
                          key={idx}
                          className="rounded-xl bg-gradient-to-r from-emerald-50 to-white border border-emerald-100 p-4 hover:border-emerald-300 transition-colors cursor-pointer"
                          onClick={() => handleAskRecommendedQuestion(sampleQuestion, interest)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 mb-2">
                                {t.askDomains[interest] || interest}
                              </span>
                              <p className="text-sm font-medium text-gray-900">
                                {sampleQuestion}
                              </p>
                            </div>
                            <ChevronRight className="h-5 w-5 text-emerald-400" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => {
                  setShowAIRecommendations(false);
                  setShowUpdateInterests(false);
                  // Mark as seen even if skipped
                  if (fbUser && !hasSeenAIRecommendations) {
                    const userRef = doc(db, "users", fbUser.uid);
                    setDoc(userRef, {
                      hasSeenAIRecommendations: true,
                      updatedAt: serverTimestamp(),
                    }, { merge: true });
                  }
                }}
                className="px-4 py-2 rounded-full bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
              >
                {t.aiSkip}
              </button>
              <button
                type="button"
                onClick={saveUserInterests}
                className="px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-700 text-white font-semibold hover:from-emerald-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedInterests.length < 2}
              >
                {showUpdateInterests ? t.aiUpdateInterests : t.aiSaveInterests}
              </button>
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}