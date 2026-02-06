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
  Globe,
} from "lucide-react";

/**
 * Bilingual content
 */
const SCHEMES_TEXT = {
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
    pageTitle: "योजनाएं",
    pageSubtitle: "आपके लिए व्यक्तिगत वित्तीय सहायता और सत्यापित पहलों की खोज करें।",
    
    // Tabs
    govtTab: "सरकारी",
    bankTab: "बैंक/डाकघर",
    mySchemesTab: "मेरी योजनाएं",
    
    // Search
    searchPlaceholder: "किसान, व्यवसाय, पेंशन, बचत के लिए योजनाएं खोजें...",
    
    // Scheme Cards
    verified: "✅ सत्यापित",
    bankPostOffice: "बैंक / डाकघर",
    viewDetails: "विवरण देखें",
    listen: "सुनें",
    officialSource: "आधिकारिक स्रोत ↗",
    
    // Empty State
    noSchemesFound: "आपकी खोज के लिए कोई योजना नहीं मिली।",
    
    // Sidebar
    popularToday: "आज लोकप्रिय",
    exploreAllTrending: "सभी ट्रेंडिंग योजनाएं देखें",
    safetyReminder: "सुरक्षा अनुस्मारक",
    safetyMessage: "धनसाथी आपके बैंक OTP, PIN, या पासवर्ड के लिए कभी भी वॉयस या चैट पर नहीं पूछेगा। धोखेबाजों से सावधान रहें।",
    
    // Voice Widget
    voicePrompt: "“मुझे पेंशन की योजनाओं के बारे में बताएं”",
    
    // Tags
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
    
    // Scheme Titles (Hindi)
    schemeTitles: {
      "pm-kisan": "पीएम किसान सम्मान निधि",
      "mudra": "प्रधानमंत्री मुद्रा योजना",
      "pmjdy": "प्रधानमंत्री जन धन योजना",
      "apy": "अटल पेंशन योजना",
      "pmjjby": "प्रधानमंत्री जीवन ज्योति बीमा योजना",
      "pmsby": "प्रधानमंत्री सुरक्षा बीमा योजना",
      "pm-svanidhi": "पीएम स्वनिधि",
      "stand-up-india": "स्टैंड-अप इंडिया",
      "ab-pmjay": "आयुष्मान भारत - पीएम-जय",
      "mahila-savings": "महिला सम्मान बचत प्रमाणपत्र",
      "ssy": "सुकन्या समृद्धि खाता",
      "ppf": "पब्लिक प्रोविडेंट फंड",
      "nsc": "नेशनल सेविंग्स सर्टिफिकेट",
      "kvp": "किसान विकास पत्र",
      "po-savings": "डाकघर बचत खाता",
    },
    
    // Scheme Descriptions (Hindi)
    schemeDescriptions: {
      "pm-kisan": "पात्र किसान परिवारों को उनके बैंक खातों में तीन किस्तों में ₹6,000 की वार्षिक आय सहायता मिलती है।",
      "mudra": "सूक्ष्म और लघु उद्यमों के लिए विनिर्माण, व्यापार और सेवाओं हेतु ₹10 लाख तक का ऋण सहायता।",
      "pmjdy": "न्यूनतम शेष राशि की आवश्यकता के बिना बुनियादी बचत खाता और रुपे कार्ड तक पहुंच सहित वित्तीय समावेशन कार्यक्रम।",
      "apy": "18-40 वर्ष के पात्र ग्राहकों के लिए पेंशन योजना, योगदान के आधार पर 60 वर्ष के बाद निश्चित पेंशन प्रदान करती है।",
      "pmjjby": "बैंक/डाकघर खाते से स्वतः डेबिट वार्षिक प्रीमियम के साथ कम लागत वाला नवीकरणीय जीवन बीमा कवर।",
      "pmsby": "बैंक/डाकघर खाते से स्वतः डेबिट छोटे वार्षिक प्रीमियम के साथ दुर्घटना बीमा कवर।",
      "pm-svanidhi": "पात्र सड़क विक्रेताओं के लिए जीविकोपार्जन फिर से शुरू करने हेतु कार्यशील पूंजी ऋण।",
      "stand-up-india": "विनिर्माण/सेवा/व्यापार में हरित क्षेत्र उद्यमों के लिए पात्र SC/ST और/या महिला उद्यमियों को बैंक ऋण सुविधा।",
      "ab-pmjay": "स्वास्थ्य आश्वासन योजना जो पात्र परिवारों को माध्यमिक/तृतीयक अस्पताल में भर्ती के लिए कवरेज प्रदान करती है।",
      "mahila-savings": "महिलाओं के लिए सरकारी समर्थित लघु बचत योजना (डाकघरों/बैंकों के माध्यम से) निश्चित अवधि और नियमों के अनुसार ब्याज के साथ।",
      "ssy": "बालिका के लिए वार्षिक जमा सीमा और दीर्घकालिक लाभों के साथ लघु बचत योजना; बैंक/डाकघरों के माध्यम से उपलब्ध।",
      "ppf": "वार्षिक जमा सीमा और कर लाभों के साथ दीर्घकालिक बचत योजना; बैंक और डाकघरों के माध्यम से उपलब्ध।",
      "nsc": "डाकघरों के माध्यम से उपलब्ध सरकारी समर्थित निश्चित आय बचत बांड; निश्चित परिपक्वता और अधिसूचित ब्याज।",
      "kvp": "डाकघर बचत प्रमाणपत्र जहां एकमुश्त निवेश निश्चित अवधि में बढ़ता है।",
      "po-savings": "भारतीय डाक द्वारा प्रस्तावित बुनियादी बचत खाता, लागत नियमों के अनुसार ब्याज और सुविधाओं के साथ।",
    },
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
    pageTitle: "Schemes",
    pageSubtitle: "Discover personalized financial support and verified initiatives tailored for you.",
    
    // Tabs
    govtTab: "Govt",
    bankTab: "Bank",
    mySchemesTab: "My Schemes",
    
    // Search
    searchPlaceholder: "Search schemes for farmers, business, pension, savings...",
    
    // Scheme Cards
    verified: "✅ Verified",
    bankPostOffice: "Bank / Post Office",
    viewDetails: "View Details",
    listen: "Listen",
    officialSource: "Official Source ↗",
    
    // Empty State
    noSchemesFound: "No schemes found for your search.",
    
    // Sidebar
    popularToday: "Popular Today",
    exploreAllTrending: "Explore All Trending",
    safetyReminder: "Safety Reminder",
    safetyMessage: "DhanSaathi will never ask for your bank OTP, PIN, or password over voice or chat. Be cautious of scammers.",
    
    // Voice Widget
    voicePrompt: "“Tell me about schemes for pension”",
    
    // Tags
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
    
    // Scheme Titles (English)
    schemeTitles: {
      "pm-kisan": "PM Kisan Samman Nidhi",
      "mudra": "Pradhan Mantri Mudra Yojana (PMMY)",
      "pmjdy": "Pradhan Mantri Jan Dhan Yojana (PMJDY)",
      "apy": "Atal Pension Yojana (APY)",
      "pmjjby": "Pradhan Mantri Jeevan Jyoti Bima Yojana (PMJJBY)",
      "pmsby": "Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
      "pm-svanidhi": "PM SVANidhi",
      "stand-up-india": "Stand-Up India",
      "ab-pmjay": "Ayushman Bharat – PM-JAY",
      "mahila-savings": "Mahila Samman Savings Certificate",
      "ssy": "Sukanya Samriddhi Account (SSY)",
      "ppf": "Public Provident Fund (PPF)",
      "nsc": "National Savings Certificate (NSC)",
      "kvp": "Kisan Vikas Patra (KVP)",
      "po-savings": "Post Office Savings Account (SB)",
    },
    
    // Scheme Descriptions (English)
    schemeDescriptions: {
      "pm-kisan": "Eligible farmer families receive annual income support of ₹6,000 in three installments directly to their bank accounts.",
      "mudra": "Loans up to ₹10 lakh to support micro and small enterprises for manufacturing, trading and services.",
      "pmjdy": "Financial inclusion program enabling basic savings account with no minimum balance requirement and access to RuPay card.",
      "apy": "Pension scheme for eligible subscribers (typically 18–40) providing a defined pension after 60 based on contributions.",
      "pmjjby": "Low-cost renewable life insurance cover with annual premium auto-debited from bank/post office account.",
      "pmsby": "Accident insurance cover with a small annual premium auto-debited from bank/post office account.",
      "pm-svanidhi": "Working capital loans for eligible street vendors to resume livelihoods.",
      "stand-up-india": "Facilitates bank loans for eligible SC/ST and/or women entrepreneurs for greenfield enterprises in manufacturing/services/trading.",
      "ab-pmjay": "Health assurance scheme offering coverage for secondary/tertiary hospitalization to eligible families.",
      "mahila-savings": "Government-backed small savings scheme for women with fixed tenure and interest as per rules.",
      "ssy": "Small savings scheme for a girl child with yearly deposit limit and long-term benefits.",
      "ppf": "Long-term savings scheme with yearly deposit limits and tax benefits as per rules.",
      "nsc": "Government-backed fixed-income savings bond available through post offices.",
      "kvp": "Post Office savings certificate where a one-time investment grows over a fixed tenure.",
      "po-savings": "Basic savings account offered by India Post with interest and features as per applicable rules.",
    },
  }
};

/**
 * Schemes data with bilingual support
 */
const schemesData = [
  // ---------------- GOVT (Verified) ----------------
  {
    id: "pm-kisan",
    type: "govt",
    tag: "FARMER",
    verified: true,
    source: "https://pmkisan.gov.in/",
  },
  {
    id: "mudra",
    type: "govt",
    tag: "SMALL BUSINESS",
    verified: true,
    source: "https://www.mudra.org.in/",
  },
  {
    id: "pmjdy",
    type: "govt",
    tag: "BANK ACCOUNT",
    verified: true,
    source: "https://pmjdy.gov.in/",
  },
  {
    id: "apy",
    type: "govt",
    tag: "PENSION",
    verified: true,
    source: "https://www.npscra.proteantech.in/scheme-details.php",
  },
  {
    id: "pmjjby",
    type: "govt",
    tag: "LIFE INSURANCE",
    verified: true,
    source: "https://financialservices.gov.in/beta/en/pmjjby",
  },
  {
    id: "pmsby",
    type: "govt",
    tag: "ACCIDENT INSURANCE",
    verified: true,
    source: "https://jansuraksha.in/pmsbyScheme",
  },
  {
    id: "pm-svanidhi",
    type: "govt",
    tag: "STREET VENDOR",
    verified: true,
    source: "https://www.myscheme.gov.in/schemes/pm-svanidhi",
  },
  {
    id: "stand-up-india",
    type: "govt",
    tag: "WOMEN / SC-ST",
    verified: true,
    source: "https://www.myscheme.gov.in/schemes/sui",
  },
  {
    id: "ab-pmjay",
    type: "govt",
    tag: "HEALTH",
    verified: true,
    source: "https://beneficiary.nha.gov.in/",
  },

  // ---------------- BANK / POST OFFICE (Verified) ----------------
  {
    id: "mahila-savings",
    type: "bank",
    tag: "WOMEN",
    verified: true,
    source: "https://www.nsiindia.gov.in/",
  },
  {
    id: "ssy",
    type: "bank",
    tag: "GIRL CHILD",
    verified: true,
    source: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=89",
  },
  {
    id: "ppf",
    type: "bank",
    tag: "TAX SAVING",
    verified: true,
    source: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=169",
  },
  {
    id: "nsc",
    type: "bank",
    tag: "FIXED INCOME",
    verified: true,
    source: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=91",
  },
  {
    id: "kvp",
    type: "bank",
    tag: "LONG TERM",
    verified: true,
    source: "https://www.nsiindia.gov.in/InternalPage.aspx?Id_Pk=56",
  },
  {
    id: "po-savings",
    type: "bank",
    tag: "POST OFFICE",
    verified: true,
    source: "https://www.indiapost.gov.in/",
  },
];

// Trending data with bilingual support
const getTrendingData = (language) => {
  const t = language === 'hindi' ? SCHEMES_TEXT.hindi : SCHEMES_TEXT.english;
  return [
    { 
      title: t.schemeTitles["ssy"], 
      views: language === 'hindi' ? "12.4k लोगों ने आज देखा" : "12.4k people viewed today" 
    },
    { 
      title: t.schemeTitles["apy"], 
      views: language === 'hindi' ? "8.1k लोगों ने आज देखा" : "8.1k people viewed today" 
    },
    { 
      title: t.schemeTitles["pmjdy"], 
      views: language === 'hindi' ? "5.2k लोगों ने आज देखा" : "5.2k people viewed today" 
    },
  ];
};

export default function SchemesScreen() {
  const navigate = useNavigate();

  // Get user's language preference
  const userLanguage = localStorage.getItem('dhan-saathi-language') || 'english';
  const t = SCHEMES_TEXT[userLanguage];
  
  // State
  const [tab, setTab] = useState("govt"); // govt | bank | my
  const [queryText, setQueryText] = useState("");
  const [fbUser, setFbUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [language, setLanguage] = useState(userLanguage);
  const menuRef = useRef(null);

  // Get trending data based on current language
  const trending = getTrendingData(language);

  // Helper function to get scheme title and description
  const getSchemeContent = (schemeId) => {
    const schemeTitle = t.schemeTitles[schemeId];
    const schemeDesc = t.schemeDescriptions[schemeId];
    const schemeTag = t.tags[schemesData.find(s => s.id === schemeId)?.tag] || schemesData.find(s => s.id === schemeId)?.tag;
    
    return { schemeTitle, schemeDesc, schemeTag };
  };

  // Process schemes data with bilingual content
  const processedSchemesData = useMemo(() => {
    return schemesData.map(scheme => {
      const content = getSchemeContent(scheme.id);
      return {
        ...scheme,
        title: content.schemeTitle,
        desc: content.schemeDesc,
        tag: content.schemeTag,
      };
    });
  }, [language, t]);

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

  const displayName = fbUser?.displayName || (language === 'hindi' ? "अतिथि" : "Guest");
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

    return processedSchemesData.filter((s) => {
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
  }, [tab, queryText, processedSchemesData]);

  // voice speak
  const speak = (text) => {
    try {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = language === 'hindi' ? 'hi-IN' : 'en-IN';
      window.speechSynthesis.speak(msg);
    } catch {
      // ignore
    }
  };

  // Toggle language
  const toggleLanguage = () => {
    const newLang = language === 'hindi' ? 'english' : 'hindi';
    setLanguage(newLang);
    localStorage.setItem('dhan-saathi-language', newLang);
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
      alert(language === 'hindi' ? "लॉगआउट विफल हुआ" : "Logout failed");
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
              {t.appName}
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
              {t.home}
            </button>

            {/* Active: Schemes */}
            <button
              type="button"
              onClick={goSchemes}
              className="relative text-green-700 font-semibold flex items-center gap-1.5"
            >
              <Building2 className="h-4 w-4" />
              {t.schemes}
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-green-600" />
            </button>

            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-gray-900 transition"
              onClick={goCommunity}
            >
              <Sparkle className="h-4 w-4" />
              {t.community}
            </button>

            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-gray-900 transition"
              onClick={() => navigate("/learn")}
            >
              <BookOpen className="h-4 w-4" />
              {t.learn}
            </button>

            <button
              type="button"
              className="flex items-center gap-1.5 hover:text-gray-900 transition"
              onClick={() => navigate("/help")}
            >
              <MessageSquare className="h-4 w-4" />
              {t.help}
            </button>
          </nav>

          {/* Right: language toggle + bell + profile dropdown */}
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
              onClick={() => alert(language === 'hindi' ? "जल्द ही आ रहा है" : "Notifications coming soon")}
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

      {/* Page content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">{t.pageTitle}</h1>
          <p className="text-slate-600 mt-2">
            {t.pageSubtitle}
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
              {t.govtTab}
            </button>
            <button
              type="button"
              onClick={() => setTab("bank")}
              className={`${pillBase} ${tab === "bank" ? pillActive : pillIdle}`}
            >
              {t.bankTab}
            </button>
            <button
              type="button"
              onClick={() => setTab("my")}
              className={`${pillBase} ${tab === "my" ? pillActive : pillIdle}`}
            >
              {t.mySchemesTab}
            </button>
          </div>

          <div className="flex-1">
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-full px-4 py-2 flex items-center gap-2 shadow-sm">
              <span className="text-slate-400">🔎</span>
              <input
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                className="w-full outline-none text-sm text-slate-700 placeholder:text-slate-400 bg-transparent"
                placeholder={t.searchPlaceholder}
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
                          {t.bankPostOffice}
                        </span>
                      )}

                      {s.verified && (
                        <span className="text-xs font-semibold text-emerald-700">
                          {t.verified}
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
                        {t.viewDetails}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleListen(s)}
                        className="px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold hover:bg-slate-200 transition flex items-center gap-2"
                      >
                        <Volume2 className="h-4 w-4" />
                        {t.listen}
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
                          {t.officialSource}
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
                {t.noSchemesFound}
              </div>
            )}
          </section>

          {/* RIGHT: sidebar */}
          <aside className="space-y-5">
            <div className="bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl p-5 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-2 mb-3">
                <span>📈</span>
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

              <button
                type="button"
                className="mt-4 w-full px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-white transition"
              >
                {t.exploreAllTrending}
              </button>
            </div>

            <div className="bg-amber-50/90 backdrop-blur border border-amber-200 rounded-3xl p-5">
              <div className="flex items-center gap-2 mb-2">
                <span>🛡️</span>
                <h4 className="font-bold text-amber-900">{t.safetyReminder}</h4>
              </div>
              <p className="text-sm text-amber-900/80 leading-relaxed">
                {t.safetyMessage}
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Bottom right voice widget + mic button */}
      <div className="fixed bottom-6 right-6 flex items-end gap-3">
        <div className="hidden md:block bg-white/90 backdrop-blur-xl border border-slate-200 rounded-3xl px-4 py-3 shadow-[0_18px_45px_rgba(15,23,42,0.10)]">
          <p className="text-sm text-slate-700">{t.voicePrompt}</p>
        </div>

        <button
          type="button"
          className="h-16 w-16 rounded-full bg-green-600 shadow-2xl flex items-center justify-center text-white hover:bg-green-700 transition transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-green-300"
          aria-label="Voice assistant"
          onClick={() => speak(language === 'hindi' ? "मैं आपकी योजनाओं में कैसे मदद कर सकता हूं?" : "How can I help you with schemes?")}
        >
          <Mic className="h-7 w-7" />
        </button>
      </div>
    </div>
  );
}