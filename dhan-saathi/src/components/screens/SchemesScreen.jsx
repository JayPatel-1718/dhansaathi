// src/components/screens/SchemesScreen.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
  IndianRupee,
  Volume2,
  Bell,
  LogOut,
  Landmark,
  Globe,
  CheckCircle,
  Menu,
  X,
  ChevronLeft,
  HelpCircle,
  UserCog,
} from "lucide-react";
import EligibilityChecker from "../EligibilityChecker";

const SCHEMES_TEXT = {
  hindi: {
    appName: "धनसाथी",
    home: "होम",
    schemes: "सरकारी योजनाएं",
    community: "समुदाय",
    learn: "सीखें",
    help: "सहायता",
    notifications: "सूचनाएं",
    logout: "लॉग आउट",
    signin: "साइन इन",
    pageTitle: "योजनाएं",
    pageSubtitle:
      "आपके लिए व्यक्तिगत वित्तीय सहायता और सत्यापित पहलों की खोज करें।",
    govtTab: "सरकारी",
    bankTab: "बैंक/डाकघर",
    mySchemesTab: "मेरी योजनाएं",
    searchPlaceholder:
      "किसान, व्यवसाय, पेंशन, बचत के लिए योजनाएं खोजें...",
    verified: "✅ सत्यापित",
    bankPostOffice: "बैंक / डाकघर",
    viewDetails: "विवरण देखें",
    listen: "सुनें",
    officialSource: "आधिकारिक स्रोत ↗",
    checkEligibility: "पात्रता जांचें",
    eligibilityTooltip:
      "2-3 सरल प्रश्नों में पता करें कि क्या आप पात्र हैं",
    noSchemesFound: "आपकी खोज के लिए कोई योजना नहीं मिली।",
    popularToday: "आज लोकप्रिय",
    exploreAllTrending: "सभी ट्रेंडिंग योजनाएं देखें",
    safetyReminder: "सुरक्षा अनुस्मारक",
    safetyMessage:
      "धनसाथी आपके बैंक OTP, PIN, या पासवर्ड के लिए कभी भी वॉयस या चैट पर नहीं पूछेगा। धोखेबाजों से सावधान रहें।",
    voicePrompt: "\u201Cमुझे पेंशन की योजनाओं के बारे में बताएं\u201D",
    profile: "प्रोफाइल",
    collapseSidebar: "साइडबार छोटा करें",
    mainMenu: "मुख्य मेनू",
    others: "अन्य",
    collapse: "छोटा करें",
    yourFinancialSchemes: "आपकी वित्तीय योजनाएं",
    tags: {
      FARMER: "किसान",
      "SMALL BUSINESS": "छोटा व्यवसाय",
      "BANK ACCOUNT": "बैंक खाता",
      PENSION: "पेंशन",
      "LIFE INSURANCE": "जीवन बीमा",
      "ACCIDENT INSURANCE": "दुर्घटना बीमा",
      "STREET VENDOR": "सड़क विक्रेता",
      "WOMEN / SC-ST": "महिला / SC-ST",
      HEALTH: "स्वास्थ्य",
      WOMEN: "महिला",
      "GIRL CHILD": "बालिका",
      "TAX SAVING": "टैक्स सेविंग",
      "FIXED INCOME": "फिक्स्ड इनकम",
      "LONG TERM": "लॉन्ग टर्म",
      "POST OFFICE": "डाकघर",
    },
    schemeTitles: {
      "pm-kisan": "पीएम किसान सम्मान निधि",
      mudra: "प्रधानमंत्री मुद्रा योजना",
      pmjdy: "प्रधानमंत्री जन धन योजना",
      apy: "अटल पेंशन योजना",
      pmjjby: "प्रधानमंत्री जीवन ज्योति बीमा योजना",
      pmsby: "प्रधानमंत्री सुरक्षा बीमा योजना",
      "pm-svanidhi": "पीएम स्वनिधि",
      "stand-up-india": "स्टैंड-अप इंडिया",
      "ab-pmjay": "आयुष्मान भारत - पीएम-जय",
      "mahila-savings": "महिला सम्मान बचत प्रमाणपत्र",
      ssy: "सुकन्या समृद्धि खाता",
      ppf: "पब्लिक प्रोविडेंट फंड",
      nsc: "नेशनल सेविंग्स सर्टिफिकेट",
      kvp: "किसान विकास पत्र",
      "po-savings": "डाकघर बचत खाता",
    },
    schemeDescriptions: {
      "pm-kisan":
        "पात्र किसान परिवारों को उनके बैंक खातों में तीन किस्तों में ₹6,000 की वार्षिक आय सहायता मिलती है।",
      mudra:
        "सूक्ष्म और लघु उद्यमों के लिए विनिर्माण, व्यापार और सेवाओं हेतु ₹10 लाख तक का ऋण सहायता।",
      pmjdy:
        "न्यूनतम शेष राशि की आवश्यकता के बिना बुनियादी बचत खाता और रुपे कार्ड तक पहुंच सहित वित्तीय समावेशन कार्यक्रम।",
      apy: "18-40 वर्ष के पात्र ग्राहकों के लिए पेंशन योजना, योगदान के आधार पर 60 वर्ष के बाद निश्चित पेंशन प्रदान करती है।",
      pmjjby:
        "बैंक/डाकघर खाते से स्वतः डेबिट वार्षिक प्रीमियम के साथ कम लागत वाला नवीकरणीय जीवन बीमा कवर।",
      pmsby:
        "बैंक/डाकघर खाते से स्वतः डेबिट छोटे वार्षिक प्रीमियम के साथ दुर्घटना बीमा कवर।",
      "pm-svanidhi":
        "पात्र सड़क विक्रेताओं के लिए जीविकोपार्जन फिर से शुरू करने हेतु कार्यशील पूंजी ऋण।",
      "stand-up-india":
        "विनिर्माण/सेवा/व्यापार में हरित क्षेत्र उद्यमों के लिए पात्र SC/ST और/या महिला उद्यमियों को बैंक ऋण सुविधा।",
      "ab-pmjay":
        "स्वास्थ्य आश्वासन योजना जो पात्र परिवारों को माध्यमिक/तृतीयक अस्पताल में भर्ती के लिए कवरेज प्रदान करती है।",
      "mahila-savings":
        "महिलाओं के लिए सरकारी समर्थित लघु बचत योजना (डाकघरों/बैंकों के माध्यम से) निश्चित अवधि और नियमों के अनुसार ब्याज के साथ।",
      ssy: "बालिका के लिए वार्षिक जमा सीमा और दीर्घकालिक लाभों के साथ लघु बचत योजना; बैंक/डाकघरों के माध्यम से उपलब्ध।",
      ppf: "वार्षिक जमा सीमा और कर लाभों के साथ दीर्घकालिक बचत योजना; बैंक और डाकघरों के माध्यम से उपलब्ध।",
      nsc: "डाकघरों के माध्यम से उपलब्ध सरकारी समर्थित निश्चित आय बचत बांड; निश्चित परिपक्वता और अधिसूचित ब्याज।",
      kvp: "डाकघर बचत प्रमाणपत्र जहां एकमुश्त निवेश निश्चित अवधि में बढ़ता है।",
      "po-savings":
        "भारतीय डाक द्वारा प्रस्तावित बुनियादी बचत खाता, लागत नियमों के अनुसार ब्याज और सुविधाओं के साथ।",
    },
  },
  english: {
    appName: "DhanSaathi",
    home: "Home",
    schemes: "Schemes",
    community: "Community",
    learn: "Learn",
    help: "Help",
    notifications: "Notifications",
    logout: "Logout",
    signin: "Sign in",
    pageTitle: "Schemes",
    pageSubtitle:
      "Discover personalized financial support and verified initiatives tailored for you.",
    govtTab: "Govt",
    bankTab: "Bank",
    mySchemesTab: "My Schemes",
    searchPlaceholder:
      "Search schemes for farmers, business, pension, savings...",
    verified: "✅ Verified",
    bankPostOffice: "Bank / Post Office",
    viewDetails: "View Details",
    listen: "Listen",
    officialSource: "Official Source ↗",
    checkEligibility: "Check Eligibility",
    eligibilityTooltip:
      "Quick 2-3 question quiz to see if you qualify",
    noSchemesFound: "No schemes found for your search.",
    popularToday: "Popular Today",
    exploreAllTrending: "Explore All Trending",
    safetyReminder: "Safety Reminder",
    safetyMessage:
      "DhanSaathi will never ask for your bank OTP, PIN, or password over voice or chat. Be cautious of scammers.",
    voicePrompt: "\u201CTell me about schemes for pension\u201D",
    profile: "Profile",
    collapseSidebar: "Collapse sidebar",
    mainMenu: "Main Menu",
    others: "Others",
    collapse: "Collapse",
    yourFinancialSchemes: "Your financial schemes",
    tags: {
      FARMER: "FARMER",
      "SMALL BUSINESS": "SMALL BUSINESS",
      "BANK ACCOUNT": "BANK ACCOUNT",
      PENSION: "PENSION",
      "LIFE INSURANCE": "LIFE INSURANCE",
      "ACCIDENT INSURANCE": "ACCIDENT INSURANCE",
      "STREET VENDOR": "STREET VENDOR",
      "WOMEN / SC-ST": "WOMEN / SC-ST",
      HEALTH: "HEALTH",
      WOMEN: "WOMEN",
      "GIRL CHILD": "GIRL CHILD",
      "TAX SAVING": "TAX SAVING",
      "FIXED INCOME": "FIXED INCOME",
      "LONG TERM": "LONG TERM",
      "POST OFFICE": "POST OFFICE",
    },
    schemeTitles: {
      "pm-kisan": "PM Kisan Samman Nidhi",
      mudra: "Pradhan Mantri Mudra Yojana (PMMY)",
      pmjdy: "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
      apy: "Atal Pension Yojana (APY)",
      pmjjby: "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
      pmsby: "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
      "pm-svanidhi": "PM SVANidhi",
      "stand-up-india": "Stand-Up India",
      "ab-pmjay": "Ayushman Bharat \u2013 PM-JAY",
      "mahila-savings": "Mahila Samman Savings Certificate",
      ssy: "Sukanya Samriddhi Account (SSY)",
      ppf: "Public Provident Fund (PPF)",
      nsc: "National Savings Certificate (NSC)",
      kvp: "Kisan Vikas Patra (KVP)",
      "po-savings": "Post Office Savings Account (SB)",
    },
    schemeDescriptions: {
      "pm-kisan":
        "Eligible farmer families receive annual income support of \u20B96,000 in three installments directly to their bank accounts.",
      mudra:
        "Loans up to \u20B910 lakh to support micro and small enterprises for manufacturing, trading and services.",
      pmjdy:
        "Financial inclusion program enabling basic savings account with no minimum balance requirement and access to RuPay card.",
      apy: "Pension scheme for eligible subscribers (typically 18\u201340) providing a defined pension after 60 based on contributions.",
      pmjjby:
        "Low-cost renewable life insurance cover with annual premium auto-debited from bank/post office account.",
      pmsby:
        "Accident insurance cover with a small annual premium auto-debited from bank/post office account.",
      "pm-svanidhi":
        "Working capital loans for eligible street vendors to resume livelihoods.",
      "stand-up-india":
        "Facilitates bank loans for eligible SC/ST and/or women entrepreneurs for greenfield enterprises in manufacturing/services/trading.",
      "ab-pmjay":
        "Health assurance scheme offering coverage for secondary/tertiary hospitalization to eligible families.",
      "mahila-savings":
        "Government-backed small savings scheme for women with fixed tenure and interest as per rules.",
      ssy: "Small savings scheme for a girl child with yearly deposit limit and long-term benefits.",
      ppf: "Long-term savings scheme with yearly deposit limits and tax benefits as per rules.",
      nsc: "Government-backed fixed-income savings bond available through post offices.",
      kvp: "Post Office savings certificate where a one-time investment grows over a fixed tenure.",
      "po-savings":
        "Basic savings account offered by India Post with interest and features as per applicable rules.",
    },
  },
};

const schemesData = [
  { id: "pm-kisan", type: "govt", tag: "FARMER", verified: true, source: "https://pmkisan.gov.in/" },
  { id: "mudra", type: "govt", tag: "SMALL BUSINESS", verified: true, source: "https://www.mudra.org.in/" },
  { id: "pmjdy", type: "govt", tag: "BANK ACCOUNT", verified: true, source: "https://pmjdy.gov.in/" },
  { id: "apy", type: "govt", tag: "PENSION", verified: true, source: "https://www.npscra.proteantech.in/scheme-details.php" },
  { id: "pmjjby", type: "govt", tag: "LIFE INSURANCE", verified: true, source: "https://financialservices.gov.in/beta/en/pmjjby" },
  { id: "pmsby", type: "govt", tag: "ACCIDENT INSURANCE", verified: true, source: "https://jansuraksha.in/pmsbyScheme" },
  { id: "pm-svanidhi", type: "govt", tag: "STREET VENDOR", verified: true, source: "https://www.myscheme.gov.in/schemes/pm-svanidhi" },
  { id: "stand-up-india", type: "govt", tag: "WOMEN / SC-ST", verified: true, source: "https://www.myscheme.gov.in/schemes/sui" },
  { id: "ab-pmjay", type: "govt", tag: "HEALTH", verified: true, source: "https://beneficiary.nha.gov.in/" },
  { id: "mahila-savings", type: "bank", tag: "WOMEN", verified: true, source: "https://www.nsiindia.gov.in/" },
  { id: "ssy", type: "bank", tag: "GIRL CHILD", verified: true, source: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=89" },
  { id: "ppf", type: "bank", tag: "TAX SAVING", verified: true, source: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=169" },
  { id: "nsc", type: "bank", tag: "FIXED INCOME", verified: true, source: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=91" },
  { id: "kvp", type: "bank", tag: "LONG TERM", verified: true, source: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=56" },
  { id: "po-savings", type: "bank", tag: "POST OFFICE", verified: true, source: "https://www.indiapost.gov.in/" },
];

const getTrendingData = (language) => {
  const t = language === "hindi" ? SCHEMES_TEXT.hindi : SCHEMES_TEXT.english;
  return [
    { title: t.schemeTitles["ssy"], views: language === "hindi" ? "12.4k \u0932\u094B\u0917\u094B\u0902 \u0928\u0947 \u0906\u091C \u0926\u0947\u0916\u093E" : "12.4k people viewed today" },
    { title: t.schemeTitles["apy"], views: language === "hindi" ? "8.1k \u0932\u094B\u0917\u094B\u0902 \u0928\u0947 \u0906\u091C \u0926\u0947\u0916\u093E" : "8.1k people viewed today" },
    { title: t.schemeTitles["pmjdy"], views: language === "hindi" ? "5.2k \u0932\u094B\u0917\u094B\u0902 \u0928\u0947 \u0906\u091C \u0926\u0947\u0916\u093E" : "5.2k people viewed today" },
  ];
};

export default function SchemesScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const userLanguage = localStorage.getItem("dhan-saathi-language") || "english";
  const [language, setLanguage] = useState(userLanguage);
  const t = SCHEMES_TEXT[language];

  const [tab, setTab] = useState("govt");
  const [queryText, setQueryText] = useState("");
  const [fbUser, setFbUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [eligibilityCheckerOpen, setEligibilityCheckerOpen] = useState(false);
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [highlightedScheme, setHighlightedScheme] = useState(null);
  const menuRef = useRef(null);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const trending = getTrendingData(language);

  // Handle chatbot recommendation
  useEffect(() => {
    if (location.state?.highlightScheme) {
      setHighlightedScheme(location.state.highlightScheme);
      // Scroll to the highlighted scheme after a short delay
      setTimeout(() => {
        const element = document.getElementById(`scheme-${location.state.highlightScheme?.replace(/\s+/g, '-').toLowerCase()}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 500);
    }
  }, [location.state]);

  const getSchemeContent = (schemeId) => {
    const schemeTitle = t.schemeTitles[schemeId];
    const schemeDesc = t.schemeDescriptions[schemeId];
    const schemeTag = t.tags[schemesData.find((s) => s.id === schemeId)?.tag] || schemesData.find((s) => s.id === schemeId)?.tag;
    return { schemeTitle, schemeDesc, schemeTag };
  };

  const processedSchemesData = useMemo(() => {
    return schemesData.map((scheme) => {
      const content = getSchemeContent(scheme.id);
      return { ...scheme, title: content.schemeTitle, desc: content.schemeDesc, tag: content.schemeTag };
    });
  }, [language, t]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setFbUser(u || null));
    return () => unsub();
  }, []);

  useEffect(() => {
    const onDown = (e) => {
      if (!menuRef.current) return;
      if (!menuRef.current.contains(e.target)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

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
    return language === "hindi" ? "\u0905\u0924\u093F\u0925\u093F" : "Guest";
  }, [fbUser, language]);

  const email = fbUser?.email || "";

  const initials = useMemo(() => {
    const src = (displayName || email || "U").trim();
    const parts = src.split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (src[0] || "U").toUpperCase();
  }, [displayName, email]);

  const goHome = () => navigate("/home");
  const goSchemes = () => navigate("/schemes");
  const goCommunity = () => navigate("/community");
  const goToLearn = () => navigate("/learn");

  const filtered = useMemo(() => {
    const q = queryText.trim().toLowerCase();
    const myIds = new Set(JSON.parse(localStorage.getItem("dhan-saathi-my-schemes") || "[]"));
    return processedSchemesData.filter((s) => {
      const matchesTab = tab === "my" ? myIds.has(s.id) : tab === "govt" ? s.type === "govt" : s.type === "bank";
      const matchesQuery = !q || s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q) || s.tag.toLowerCase().includes(q);
      return matchesTab && matchesQuery;
    });
  }, [tab, queryText, processedSchemesData]);

  const speak = (text) => {
    try {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = language === "hindi" ? "hi-IN" : "en-IN";
      window.speechSynthesis.speak(msg);
    } catch {}
  };

  const toggleLanguage = () => {
    const newLang = language === "hindi" ? "english" : "hindi";
    setLanguage(newLang);
    localStorage.setItem("dhan-saathi-language", newLang);
  };

  const logEvent = async (type, data = {}) => {
    if (!fbUser?.uid) return;
    try {
      await addDoc(collection(db, "users", fbUser.uid, "events"), { type, data, createdAt: serverTimestamp() });
    } catch (e) {
      console.error("logEvent error:", e);
    }
  };

  const trackViewDetails = async (scheme) => {
    if (!fbUser?.uid) return;
    try {
      await setDoc(doc(db, "users", fbUser.uid), { "stats.schemesViewed": increment(1), updatedAt: serverTimestamp() }, { merge: true });
      await setDoc(doc(db, "users", fbUser.uid, "recentSchemes", scheme.id), { schemeId: scheme.id, title: scheme.title, tag: scheme.tag, type: scheme.type, lastViewedAt: serverTimestamp() }, { merge: true });
      await logEvent("scheme_view_details", { schemeId: scheme.id, title: scheme.title });
    } catch (e) {
      console.error("trackViewDetails error:", e);
    }
  };

  const trackListen = async (scheme) => {
    if (!fbUser?.uid) return;
    try {
      await setDoc(doc(db, "users", fbUser.uid), { "stats.schemesListened": increment(1), updatedAt: serverTimestamp() }, { merge: true });
      await logEvent("scheme_listen", { schemeId: scheme.id, title: scheme.title });
    } catch (e) {
      console.error("trackListen error:", e);
    }
  };

  const trackEligibilityCheck = async (resultData) => {
    if (!fbUser?.uid) return;
    try {
      await setDoc(doc(db, "users", fbUser.uid, "eligibilityChecks", resultData.schemeId), { schemeId: resultData.schemeId, result: resultData.result, yesCount: resultData.yesCount, totalQuestions: resultData.totalQuestions, completedAt: serverTimestamp() }, { merge: true });
      await setDoc(doc(db, "users", fbUser.uid), { "stats.eligibilityChecks": increment(1), updatedAt: serverTimestamp() }, { merge: true });
      await logEvent("eligibility_check_completed", resultData);
    } catch (e) {
      console.error("trackEligibilityCheck error:", e);
    }
  };

  const handleViewDetails = async (scheme) => {
    await trackViewDetails(scheme);
    navigate(`/schemes/${scheme.id}`, { state: { fromList: true } });
  };

  const handleListen = async (scheme) => {
    await trackListen(scheme);
    speak(`${scheme.title}. ${scheme.desc}`);
  };

  const handleCheckEligibility = (scheme) => {
    setSelectedScheme(scheme);
    setEligibilityCheckerOpen(true);
    if (fbUser?.uid) {
      logEvent("eligibility_check_started", { schemeId: scheme.id, title: scheme.title });
    }
  };

  const handleEligibilityComplete = (resultData) => {
    trackEligibilityCheck(resultData);
    const completedChecks = JSON.parse(localStorage.getItem("dhan-saathi-eligibility-checks") || "[]");
    if (!completedChecks.includes(resultData.schemeId)) {
      completedChecks.push(resultData.schemeId);
      localStorage.setItem("dhan-saathi-eligibility-checks", JSON.stringify(completedChecks));
    }
  };

  const handleLogout = async () => {
    setMenuOpen(false);
    try {
      await signOut(auth);
      navigate("/signup", { replace: true });
    } catch (e) {
      console.error(e);
      alert(language === "hindi" ? "\u0932\u0949\u0917\u0906\u0909\u091F \u0935\u093F\u092B\u0932 \u0939\u0941\u0906" : "Logout failed");
    }
  };

  const pillBase = "px-4 py-2 rounded-full text-sm font-semibold border transition";
  const pillActive = "bg-white border-slate-200 text-slate-900 shadow-sm";
  const pillIdle = "bg-slate-50 border-transparent text-slate-600 hover:bg-white hover:border-slate-200";

  const sidebarNavItems = [
    { label: t.home, icon: Home, onClick: goHome, active: false },
    { label: t.schemes, icon: Building2, onClick: goSchemes, active: true },
    { label: t.community, icon: Sparkle, onClick: goCommunity, active: false },
    { label: t.learn, icon: BookOpen, onClick: goToLearn, active: false },
    { label: t.help, icon: HelpCircle, onClick: () => navigate("/help"), active: false },
  ];

  const sidebarBottomItems = [
    { label: t.profile, icon: UserCog, onClick: () => navigate("/profile") },
    { label: language === "hindi" ? "\u092D\u093E\u0937\u093E \u092C\u0926\u0932\u0947\u0902" : "Language", icon: Globe, onClick: toggleLanguage },
  ];

  const SidebarContent = ({ collapsed = false, onClose = null }) => (
    <div className="flex flex-col h-full">
      <div className={`flex items-center ${collapsed ? "justify-center" : "justify-between"} px-4 py-5 border-b border-gray-100`}>
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={goHome}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-green-200/50 flex-shrink-0">
            <IndianRupee className="h-5 w-5 text-white" />
          </div>
          {!collapsed && <span className="text-xl font-bold tracking-tight text-gray-900">{t.appName}</span>}
        </div>
        {onClose && (
          <button onClick={onClose} className="lg:hidden h-8 w-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition">
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      <div className={`mx-3 mt-4 mb-2 ${collapsed ? "px-1" : "px-3"} py-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100`}>
        <div className={`flex ${collapsed ? "justify-center" : "items-center gap-3"}`}>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm shadow flex-shrink-0">
            {fbUser?.photoURL ? (
              <img src={fbUser.photoURL} alt="" className="h-full w-full rounded-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              initials
            )}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
              <p className="text-[11px] text-gray-500 truncate">{email}</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
        <p className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest ${collapsed ? "text-center" : "px-3"} mb-2`}>
          {collapsed ? "\u2014" : t.mainMenu}
        </p>
        {sidebarNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => { item.onClick(); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center ${collapsed ? "justify-center" : ""} gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${item.active ? "bg-emerald-100 text-emerald-800 shadow-sm" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 ${item.active ? "text-emerald-600" : "text-gray-400 group-hover:text-gray-600"}`} />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && item.active && <div className="ml-auto h-2 w-2 rounded-full bg-emerald-500" />}
            </button>
          );
        })}

        <div className="my-4 border-t border-gray-100" />

        <p className={`text-[10px] font-bold text-gray-400 uppercase tracking-widest ${collapsed ? "text-center" : "px-3"} mb-2`}>
          {collapsed ? "\u2014" : t.others}
        </p>
        {sidebarBottomItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => { item.onClick(); setMobileSidebarOpen(false); }}
              className={`w-full flex items-center ${collapsed ? "justify-center" : ""} gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all group`}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-600" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div className="px-3 pb-4 space-y-2 border-t border-gray-100 pt-3">
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className={`hidden lg:flex w-full items-center ${collapsed ? "justify-center" : ""} gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all`}
          title={t.collapseSidebar}
        >
          <ChevronLeft className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          {!collapsed && <span>{t.collapse}</span>}
        </button>
        {fbUser ? (
          <button
            onClick={handleLogout}
            className={`w-full flex items-center ${collapsed ? "justify-center" : ""} gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-all`}
            title={collapsed ? t.logout : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>{t.logout}</span>}
          </button>
        ) : (
          <button
            onClick={() => navigate("/signup")}
            className={`w-full flex items-center ${collapsed ? "justify-center" : ""} gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-green-700 hover:bg-green-50 transition-all`}
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
      <style>{`/* micPulse removed */`}</style>

      <div className="flex h-screen overflow-hidden bg-gray-50">
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden" onClick={() => setMobileSidebarOpen(false)} />
        )}

        <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <SidebarContent onClose={() => setMobileSidebarOpen(false)} />
        </aside>

        <aside className={`hidden lg:flex flex-col flex-shrink-0 bg-white border-r border-gray-100 transition-all duration-300 ease-in-out ${sidebarOpen ? "w-64" : "w-20"}`}>
          <SidebarContent collapsed={!sidebarOpen} />
        </aside>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <header className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-20">
            <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setMobileSidebarOpen(true)} className="lg:hidden h-10 w-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition">
                  <Menu className="h-5 w-5" />
                </button>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900">{t.pageTitle}</h1>
                  <p className="text-xs text-gray-500 hidden sm:block">{t.yourFinancialSchemes}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button type="button" onClick={toggleLanguage} className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 shadow-sm text-gray-700 hover:bg-gray-50 transition hover:-translate-y-0.5">
                  <Globe className="h-4 w-4" />
                  <span className="text-xs font-medium">{language === "hindi" ? "\u0939\u093F\u0902\u0926\u0940" : "English"}</span>
                  <span className="text-xs text-gray-500">\u21C4</span>
                </button>
                <button type="button" className="h-10 w-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition relative" onClick={() => alert(language === "hindi" ? "\u091C\u0932\u094D\u0926 \u0939\u0940 \u0906 \u0930\u0939\u093E \u0939\u0948" : "Notifications coming soon")}>
                  <Bell className="h-5 w-5" />
                  <div className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-white" />
                </button>
                <div className="relative" ref={menuRef}>
                  <button type="button" onClick={() => setMenuOpen((v) => !v)} className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-br from-green-400 to-emerald-500 shadow flex items-center justify-center text-white font-semibold">
                    {fbUser?.photoURL ? (
                      <img src={fbUser.photoURL} alt="Profile" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      <span>{initials}</span>
                    )}
                  </button>
                  <div className={`absolute right-0 mt-3 w-72 rounded-2xl bg-white/95 backdrop-blur border border-gray-200 shadow-xl overflow-hidden origin-top-right transition-all duration-200 ${menuOpen ? "opacity-100 scale-100 translate-y-0" : "pointer-events-none opacity-0 scale-95 -translate-y-2"}`}>
                    <div className="px-4 py-4">
                      <p className="text-sm font-semibold text-gray-900">{displayName}</p>
                      <p className="text-xs text-gray-600 mt-1 break-all">{email || (language === "hindi" ? "\u0938\u093E\u0907\u0928 \u0907\u0928 \u0928\u0939\u0940\u0902" : "Not signed in")}</p>
                    </div>
                    <div className="h-px bg-gray-100" />
                    <button onClick={() => { navigate("/profile"); setMenuOpen(false); }} className="w-full px-4 py-3 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2">
                      <UserCog className="h-4 w-4 text-gray-400" />
                      {language === "hindi" ? "\u092A\u094D\u0930\u094B\u092B\u093E\u0907\u0932 \u0926\u0947\u0916\u0947\u0902" : "View Profile"}
                    </button>
                    <div className="h-px bg-gray-100" />
                    {fbUser ? (
                      <button className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2" onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        {t.logout}
                      </button>
                    ) : (
                      <button className="w-full px-4 py-3 text-left text-sm text-green-700 hover:bg-green-50" onClick={() => navigate("/signup")}>
                        {t.signin}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-y-auto">
            <div className="min-h-full relative" style={{ backgroundImage: "radial-gradient(circle at top left, rgba(187,247,208,0.35) 0, transparent 55%), radial-gradient(circle at bottom right, rgba(191,219,254,0.3) 0, transparent 55%)" }}>
              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
                <div className="mb-6">
                  <h1 className="text-3xl font-bold text-slate-900">{t.pageTitle}</h1>
                  <p className="text-slate-600 mt-2">{t.pageSubtitle}</p>
                </div>

                <div className="flex flex-col lg:flex-row lg:items-center gap-4 mb-6">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setTab("govt")} className={`${pillBase} ${tab === "govt" ? pillActive : pillIdle}`}>{t.govtTab}</button>
                    <button type="button" onClick={() => setTab("bank")} className={`${pillBase} ${tab === "bank" ? pillActive : pillIdle}`}>{t.bankTab}</button>
                    <button type="button" onClick={() => setTab("my")} className={`${pillBase} ${tab === "my" ? pillActive : pillIdle}`}>{t.mySchemesTab}</button>
                  </div>
                  <div className="flex-1">
                    <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
                      <span className="text-slate-400">{"\uD83D\uDD0E"}</span>
                      <input value={queryText} onChange={(e) => setQueryText(e.target.value)} className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400 bg-transparent" placeholder={t.searchPlaceholder} />
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[2.2fr,1fr]">
                  <section className="space-y-4">
                    {filtered.map((s) => {
                      const isHighlighted = highlightedScheme && s.title === highlightedScheme;
                      return (
                        <div 
                          key={s.id} 
                          id={`scheme-${s.title.replace(/\s+/g, '-').toLowerCase()}`}
                          className={`bg-white/90 backdrop-blur-xl rounded-3xl p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)] transition-all duration-500 ${
                            isHighlighted 
                              ? 'border-2 border-green-500 ring-2 ring-green-200 scale-105' 
                              : 'border border-slate-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-6">
                            <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="text-[11px] font-extrabold tracking-wide px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">{s.tag}</span>
                              {s.type === "bank" && (
                                <span className="text-[11px] font-extrabold tracking-wide px-2 py-1 rounded-full bg-sky-50 text-sky-700 border border-sky-100 inline-flex items-center gap-1">
                                  <Landmark className="h-3.5 w-3.5" />
                                  {t.bankPostOffice}
                                </span>
                              )}
                              {s.verified && <span className="text-xs font-semibold text-emerald-700">{t.verified}</span>}
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">{s.title}</h3>
                            <p className="text-sm text-slate-600 mt-2 leading-relaxed">{s.desc}</p>
                            <div className="flex items-center gap-3 mt-4 flex-wrap">
                              <button type="button" onClick={() => handleViewDetails(s)} className="px-4 py-2 rounded-full bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition">{t.viewDetails}</button>
                              <button type="button" onClick={() => handleListen(s)} className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition flex items-center gap-2">
                                <Volume2 className="h-4 w-4" />
                                {t.listen}
                              </button>
                              <button type="button" onClick={() => handleCheckEligibility(s)} className="px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold hover:bg-blue-200 transition flex items-center gap-2 group relative" title={t.eligibilityTooltip}>
                                <CheckCircle className="h-4 w-4" />
                                {t.checkEligibility}
                                <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">{t.eligibilityTooltip}</span>
                              </button>
                              {s.source && (
                                <a href={s.source} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-full bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition" onClick={() => logEvent("scheme_open_source", { schemeId: s.id, title: s.title, source: s.source })}>
                                  {t.officialSource}
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="hidden sm:block h-20 w-28 rounded-2xl bg-gradient-to-br from-emerald-50 to-slate-50 border border-slate-100" />
                        </div>
                      </div>
                      );
                    })}
                    {filtered.length === 0 && (
                      <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-6 text-slate-600">{t.noSchemesFound}</div>
                    )}
                  </section>

                  <aside className="space-y-5">
                    <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                      <div className="flex items-center gap-2 mb-3">
                        <span>{"\uD83D\uDCC8"}</span>
                        <h4 className="font-bold text-slate-900">{t.popularToday}</h4>
                      </div>
                      <div className="space-y-3">
                        {trending.map((tItem, index) => (
                          <div key={index} className="text-sm">
                            <p className="font-semibold text-slate-900">{tItem.title}</p>
                            <p className="text-xs text-slate-500">{tItem.views}</p>
                          </div>
                        ))}
                      </div>
                      <button type="button" className="mt-4 w-full px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-white transition">{t.exploreAllTrending}</button>
                    </div>

                    <div className="bg-amber-50/90 backdrop-blur border border-amber-200 rounded-3xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span>{"\uD83D\uDEE1\uFE0F"}</span>
                        <h4 className="font-bold text-amber-900">{t.safetyReminder}</h4>
                      </div>
                      <p className="text-sm text-amber-900/80 leading-relaxed">{t.safetyMessage}</p>
                    </div>

                    <div className="bg-blue-50/90 backdrop-blur border border-blue-200 rounded-3xl p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <span>{"\uD83C\uDFAF"}</span>
                        <h4 className="font-bold text-blue-900">
                          {language === "hindi" ? "\u0928\u092F\u093E: \u092A\u093E\u0924\u094D\u0930\u0924\u093E \u091C\u093E\u0902\u091A\u0915\u0930\u094D\u0924\u093E" : "New: Eligibility Checker"}
                        </h4>
                      </div>
                      <p className="text-sm text-blue-900/80 leading-relaxed mb-3">
                        {language === "hindi"
                          ? "\u0915\u093F\u0938\u0940 \u092F\u094B\u091C\u0928\u093E \u0915\u0947 \u0932\u093F\u090F \u0906\u092A\u0915\u0940 \u092A\u093E\u0924\u094D\u0930\u0924\u093E \u091C\u093E\u0928\u0928\u0947 \u0915\u0947 \u0932\u093F\u090F 2-3 \u0938\u0930\u0932 \u092A\u094D\u0930\u0936\u094D\u0928\u094B\u0902 \u0915\u093E \u092A\u094D\u0930\u092F\u093E\u0938 \u0915\u0930\u0947\u0902\u0964"
                          : "Try our 2-3 simple questions to know your eligibility for any scheme. Voice-enabled, bilingual."}
                      </p>
                      <div className="text-xs text-blue-700">
                        {"\uD83D\uDCA1"}{" "}
                        {language === "hindi"
                          ? "\u092A\u094D\u0930\u0924\u094D\u092F\u0947\u0915 \u092F\u094B\u091C\u0928\u093E \u0915\u093E\u0930\u094D\u0921 \u092A\u0930 \"\u092A\u093E\u0924\u094D\u0930\u0924\u093E \u091C\u093E\u0902\u091A\u0947\u0902\" \u092C\u091F\u0928 \u092A\u0930 \u0915\u094D\u0932\u093F\u0915 \u0915\u0930\u0947\u0902"
                          : "Click \"Check Eligibility\" button on each scheme card"}
                      </div>
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* Floating voice UI removed */}
      </div>

      {selectedScheme && (
        <EligibilityChecker
          schemeId={selectedScheme.id}
          schemeTitle={selectedScheme.title}
          isOpen={eligibilityCheckerOpen}
          onClose={() => { setEligibilityCheckerOpen(false); setSelectedScheme(null); }}
          onComplete={handleEligibilityComplete}
        />
      )}
    </>
  );
}