import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, getDoc } from 'firebase/firestore';
import {
  X,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Home,
  Building2,
  Sparkle,
  BookOpen,
  HelpCircle,
  IndianRupee,
  LogOut,
  UserCog,
  Globe,
  Menu,
  ChevronLeft,
} from 'lucide-react';
import SpeechToTextButton from '../SpeechToTextButton';

// Bilingual content
const DOCUMENT_HELP_TEXT = {
  hindi: {
    appName: "धनसाथी",
    home: "होम",
    schemes: "सरकारी योजनाएं",
    community: "समुदाय",
    learn: "सीखें",
    help: "सहायता",
    logout: "लॉग आउट",
    signin: "साइन इन",
    collapseSidebar: "साइडबार छोटा करें",
    documentHelp: "दस्तावेज़ सहायता",
    language: "भाषा",
    english: "English",
    hindi: "हिंदी",
    importantInstructions: "महत्वपूर्ण निर्देश",
    dos: "✅ करें",
    donts: "❌ न करें",
    fieldSelector: "फील्ड चुनें",
    notes: "नोट्स",
    field: "फील्ड",
    type: "प्रकार",
    importance: "महत्व",
    steps: "कदम",
    examples: "उदाहरण",
    mistakes: "गलतियां",
    tip: "सुझाव",
    doList: [
      "बड़े अक्षरों (CAPITAL LETTERS) में स्पष्ट लिखें",
      "सिर्फ काली या नीली कलम का दोनों",
      "नंबर को दिए गए बॉक्स में रखें",
      "दस्तावेज़ लिखी जानकारी से मेल खाएं"
    ],
    dontList: [
      "स्पेलिंग की गलतियां न करें",
      "आवश्यक फील्ड खाली न छोड़ें",
      "गलत जानकारी न लिखें",
      "पेंसिल या सुधार न करें"
    ],
    optionalNotes: "नोट्स (वैकल्पिक)",
    critical: "जरूरी",
    important: "महत्वपूर्ण",
    formAssistant: "साथी फॉर्म सहायक",
    formGuide: "सरकारी फॉर्मों को सही तरीके से भरना सीखें, चरण-दर-चरण मार्गदर्शन के साथ",
  },
  english: {
    appName: "DhanSaathi",
    home: "Home",
    schemes: "Schemes",
    community: "Community",
    learn: "Learn",
    help: "Help",
    logout: "Logout",
    signin: "Sign in",
    collapseSidebar: "Collapse sidebar",
    documentHelp: "Document Help",
    language: "Language",
    english: "English",
    hindi: "हिंदी",
    importantInstructions: "Important Instructions",
    dos: "✅ DO's",
    donts: "❌ DON'Ts",
    fieldSelector: "Select Field",
    notes: "Notes",
    field: "Field",
    type: "Type",
    importance: "Importance",
    steps: "Steps",
    examples: "Examples",
    mistakes: "Mistakes to Avoid",
    tip: "Pro Tip",
    doList: [
      "Write in CAPITAL LETTERS clearly",
      "Use black or blue pen only",
      "Keep numbers within given boxes",
      "Match documents with written info"
    ],
    dontList: [
      "DO NOT make spelling mistakes",
      "DO NOT leave required fields blank",
      "DO NOT write false information",
      "DO NOT use pencil or corrections"
    ],
    optionalNotes: "Notes (optional)",
    critical: "Critical",
    important: "Important",
    formAssistant: "Saathi Form Assistant",
    formGuide: "Learn how to fill government forms correctly with step-by-step guidance",
  },
};

// Form data in both languages
const DEMO_FORM_DATA = {
  english: {
    title: 'PM Mudra Loan Application Form',
    summary: '📋 PM Mudra Loan: Loans up to ₹10 lakh for small businesses. Fill all fields correctly to succeed!',
    fields: [
      {
        field: '1. Full Name',
        type: 'Text',
        importance: 'Critical',
        steps: ['Write your complete name as it appears in your Aadhaar card', 'Use CAPITAL LETTERS only', 'Do not use abbreviations or nicknames', 'Example: RAJESH KUMAR SHARMA'],
        examples: 'RAJESH KUMAR SHARMA, PRIYA SINGH',
        mistakes: 'R. Kumar Sharma, Raj Kumar (too short), Using initials only',
        tip: '💡 Your name must match your government ID exactly for approval.'
      },
      {
        field: '2. Aadhaar Number',
        type: 'Number (12 digits)',
        importance: 'Critical',
        steps: ['Find your Aadhaar card', 'Write all 12 digits without spaces', 'Do NOT use hyphens (–) or dashes', 'Example: 123456789012'],
        examples: '123456789012, 987654321098',
        mistakes: '1234-5678-9012, 12345678901 (only 11 digits), XXXX5678901X (partial)',
        tip: '⚠️ Wrong Aadhaar number = Application rejected. Check twice before submitting!'
      },
      {
        field: '3. Date of Birth',
        type: 'Date (DD/MM/YYYY)',
        importance: 'Critical',
        steps: ['Write in format: DD/MM/YYYY', 'Use / (forward slash) to separate', 'Day = 01-31, Month = 01-12, Year = 1960-2010', 'Example: 05/03/1985 means 5th March 1985'],
        examples: '05/03/1985, 12/11/1978, 25/07/1992',
        mistakes: '5/3/1985 (should be 05/03), 1985/03/05 (wrong order), 05-03-1985 (wrong separator)',
        tip: '📅 You must be 18+ years old. Age calculated on application date.'
      },
      {
        field: '4. Mobile Number',
        type: 'Number (10 digits)',
        importance: 'Critical',
        steps: ['Write 10-digit mobile number only', 'No spaces, hyphens, or country code (+91)', 'Should be a working number (you will get OTP)', 'Example: 9876543210'],
        examples: '9876543210, 8765432109, 7654321098',
        mistakes: '+91 9876543210, 98-765-43210, 098765 (6 digits only), 9876543 (7 digits)',
        tip: '📱 Use your own number or close family member number. You must verify via OTP.'
      },
      {
        field: '5. Business Description',
        type: 'Text (50-100 words)',
        importance: 'Critical',
        steps: ['Describe what your business does in simple words', 'Write 50-100 words (2-3 lines)', 'Be specific: Grocery shop in Mumbai not just Retail', 'Mention location and type of products/services'],
        examples: 'I run a small grocery shop in Bandra, Mumbai selling vegetables, fruits, and daily items. I have 2 employees and want to expand my stock.',
        mistakes: 'Too short: Shop, Too vague: Business, Unrelated: I want to become wealthy',
        tip: '🎯 Bank officer should understand your business clearly. Good description = Higher approval chances!'
      },
      {
        field: '6. Annual Income',
        type: 'Number (with ₹ symbol)',
        importance: 'Critical',
        steps: ['Write your yearly income from all sources', 'Use ₹ symbol before the number', 'Include income from: Job, Business, Farming, Part-time work', 'Example: ₹2,50,000'],
        examples: '₹2,50,000, ₹5,00,000, ₹10,00,000',
        mistakes: '250000 (no ₹ symbol), EUR2,50,000 (wrong currency), About 2.5 lakhs (not a number)',
        tip: '💰 Bank may verify your income with tax documents. Be honest - wrong info = rejection.'
      },
      {
        field: '7. Address',
        type: 'Text',
        importance: 'Critical',
        steps: ['Write complete permanent address', 'Include: House number, Street name, Area, City, Pincode', 'Use CAPITAL LETTERS', 'Example: HOUSE NO. 123, MAIN STREET, BANDRA, MUMBAI - 400050'],
        examples: 'HOUSE NO. 45, OAK LANE, SECTOR 5, NOIDA - 201301',
        mistakes: 'Incomplete: Mumbai (no street/house), Too short: Bandra, Pincode only: 400050',
        tip: '📍 Bank will verify your address. Must match Aadhaar or ID proof.'
      }
    ]
  },
  hindi: {
    title: 'पीएम मुद्रा लोन आवेदन पत्र',
    summary: '📋 पीएम मुद्रा: छोटे व्यवसायों के लिए ₹10 लाख तक का कर्ज। सभी फील्ड सही भरें और सफल हों!',
    fields: [
      {
        field: '1. पूरा नाम',
        type: 'टेक्स्ट',
        importance: 'जरूरी',
        steps: ['अपना पूरा नाम लिखें जैसा आधार कार्ड में है', 'सभी अक्षर बड़े हों (CAPITAL LETTERS)', 'संक्षिप्त नाम या उपनाम न लिखें', 'उदाहरण: RAJESH KUMAR SHARMA'],
        examples: 'RAJESH KUMAR SHARMA, PRIYA SINGH',
        mistakes: 'R. Kumar Sharma, Raj Kumar (बहुत छोटा), सिर्फ शुरुआती अक्षर',
        tip: '💡 नाम सरकारी दस्तावेज़ से बिल्कुल मेल खाना चाहिए।'
      },
      {
        field: '2. आधार नंबर',
        type: 'नंबर (12 अंक)',
        importance: 'जरूरी',
        steps: ['आधार कार्ड निकालें', '12 अंक बिना स्पेस लिखें', 'डैश (-) या हाइफन न लगाएं', 'उदाहरण: 123456789012'],
        examples: '123456789012, 987654321098',
        mistakes: '1234-5678-9012, 12345678901 (सिर्फ 11 अंक), XXXX5678901X',
        tip: '⚠️ गलत आधार = आवेदन खारिज। जमा करने से पहले दो बार चेक करें!'
      },
      {
        field: '3. जन्म तारीख',
        type: 'तारीख (DD/MM/YYYY)',
        importance: 'जरूरी',
        steps: ['फॉर्मेट में लिखें: DD/MM/YYYY', 'स्लैश (/) से अलग करें', 'दिन = 01-31, महीना = 01-12, साल = 1960-2010', 'उदाहरण: 05/03/1985 यानी 5 मार्च 1985'],
        examples: '05/03/1985, 12/11/1978, 25/07/1992',
        mistakes: '5/3/1985 (05/03 होना चाहिए), 1985/03/05 (गलत क्रम), 05-03-1985 (गलत चिह्न)',
        tip: '📅 आपकी उम्र 18+ होनी चाहिए। उम्र आवेदन की तारीख को गिनी जाती है।'
      },
      {
        field: '4. मोबाइल नंबर',
        type: 'नंबर (10 अंक)',
        importance: 'जरूरी',
        steps: ['10 अंक का मोबाइल नंबर लिखें', 'स्पेस, डैश या +91 न लगाएं', 'काम करने वाला नंबर हो (OTP आएगा)', 'उदाहरण: 9876543210'],
        examples: '9876543210, 8765432109, 7654321098',
        mistakes: '+91 9876543210, 98-765-43210, 098765 (6 अंक), 9876543 (7 अंक)',
        tip: '📱 आपका अपना नंबर या परिवार का नंबर डालें। OTP सत्यापन जरूरी है।'
      },
      {
        field: '5. व्यवसाय विवरण',
        type: 'टेक्स्ट (50-100 शब्द)',
        importance: 'जरूरी',
        steps: ['अपने व्यवसाय के बारे में सरल शब्दों में लिखें', '50-100 शब्द लिखें (2-3 पंक्तियां)', 'विशिष्ट हो: मुंबई में किराना दुकान, सिर्फ खुदरा नहीं', 'स्थान और उत्पादों का प्रकार बताएं'],
        examples: 'मैं मुंबई के बांद्रा में एक किराना दुकान चलाता हूं जहां सब्जियां, फल और रोज़मर्रा की चीजें बिकती हैं। मेरे पास 2 कर्मचारी हैं और मैं स्टॉक बढ़ाना चाहता हूं।',
        mistakes: 'बहुत छोटा: दुकान, अस्पष्ट: व्यवसाय, असंबंधित: मैं अमीर बनना चाहता हूं',
        tip: '🎯 बैंक अधिकारी को व्यवसाय समझ आना चाहिए। अच्छा विवरण = अधिक मंजूरी की संभावना!'
      },
      {
        field: '6. वार्षिक आय',
        type: 'नंबर (₹ के साथ)',
        importance: 'जरूरी',
        steps: ['सभी स्रोतों से सालाना आय लिखें', 'नंबर से पहले ₹ लगाएं', 'शामिल करें: नौकरी, व्यवसाय, खेती, अंशकालीन काम', 'उदाहरण: ₹2,50,000'],
        examples: '₹2,50,000, ₹5,00,000, ₹10,00,000',
        mistakes: '250000 (₹ बिना), EUR2,50,000 (गलत मुद्रा), लगभग 2.5 लाख (नंबर नहीं)',
        tip: '💰 बैंक आपकी आय कर दस्तावेज़ से सत्यापित कर सकता है। सच बताएं - गलत = खारिज।'
      },
      {
        field: '7. पता',
        type: 'टेक्स्ट',
        importance: 'जरूरी',
        steps: ['स्थायी पूरा पता लिखें', 'शामिल करें: घर नंबर, सड़क का नाम, क्षेत्र, शहर, पिनकोड', 'सभी अक्षर बड़े हों (CAPITAL LETTERS)', 'उदाहरण: HOUSE NO. 123, MAIN STREET, BANDRA, MUMBAI - 400050'],
        examples: 'HOUSE NO. 45, OAK LANE, SECTOR 5, NOIDA - 201301',
        mistakes: 'अधूरा: मुंबई (सड़क/घर बिना), बहुत छोटा: बांद्रा, सिर्फ पिनकोड: 400050',
        tip: '📍 बैंक आपका पता सत्यापित करेगा। आधार या पहचान पत्र से मेल खाना चाहिए।'
      }
    ]
  }
};

const DocumentHelp = () => {
  const navigate = useNavigate();
  
  // Language & Auth
  const userLanguage = localStorage.getItem("dhan-saathi-language") || "english";
  const [language, setLanguage] = useState(userLanguage);
  const t = DOCUMENT_HELP_TEXT[language];
  const demoFormData = DEMO_FORM_DATA[language];
  
  // Auth state
  const [fbUser, setFbUser] = useState(null);
  
  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  
  // Document Help state
  const [activeField, setActiveField] = useState(0);
  const [notes, setNotes] = useState('');
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    localStorage.setItem("dhan-saathi-language", newLanguage);
  };


  // Auth effect
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFbUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Display name
  const displayName = useMemo(() => {
    if (!fbUser) return language === "hindi" ? "अतिथि" : "Guest";
    return fbUser.displayName || fbUser.email?.split("@")[0] || "User";
  }, [fbUser, language]);

  const email = fbUser?.email || "";

  const initials = useMemo(() => {
    const name = displayName || "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "DH";
  }, [displayName]);

  // Navigation
  const goHome = () => navigate("/home");
  const goToSchemes = () => navigate("/schemes");
  const goToCommunity = () => navigate("/community");
  const goToLearn = () => navigate("/learn");
  const goToHelp = () => navigate("/help");

  const toggleLanguage = () => {
    const newLang = language === "hindi" ? "english" : "hindi";
    setLanguage(newLang);
    localStorage.setItem("dhan-saathi-language", newLang);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/signup");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Sidebar nav items
  const sidebarNavItems = [
    { label: t.home, icon: Home, onClick: goHome, active: false },
    { label: t.schemes, icon: Building2, onClick: goToSchemes, active: false },
    { label: t.community, icon: Sparkle, onClick: goToCommunity, active: false },
    { label: t.learn, icon: BookOpen, onClick: goToLearn, active: false },
    { label: t.help, icon: HelpCircle, onClick: goToHelp, active: false },
  ];

  const sidebarBottomItems = [
    {
      label: t.language || "Language",
      icon: Globe,
      onClick: toggleLanguage,
    },
    {
      label: language === "hindi" ? "प्रोफाइल" : "Profile",
      icon: UserCog,
      onClick: () => navigate("/profile"),
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
         <img
  src="/Dhaansaathi.jpeg"
  alt="DhanSaathi Logo"
  className="h-12 w-12 object-contain"
/>
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
          {collapsed ? "—" : language === "hindi" ? "मुख्य मेनू" : "Main Menu"}
        </p>

        {sidebarNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.label === t.documentHelp;
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
                isActive
                  ? "bg-emerald-100 text-emerald-800 shadow-sm"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
              title={collapsed ? item.label : undefined}
            >
              <Icon
                className={`h-5 w-5 flex-shrink-0 ${
                  isActive
                    ? "text-emerald-600"
                    : "text-gray-400 group-hover:text-gray-600"
                }`}
              />
              {!collapsed && <span>{item.label}</span>}
              {!collapsed && isActive && (
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
          {collapsed ? "—" : language === "hindi" ? "अन्य" : "Others"}
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
        <button
          onClick={() => setSidebarOpen((v) => !v)}
          className={`hidden lg:flex w-full items-center ${
            collapsed ? "justify-center" : ""
          } gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 hover:text-gray-700 transition-all`}
          title={t.collapseSidebar}
        >
          <ChevronLeft
            className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
          {!collapsed && (
            <span>{language === "hindi" ? "छोटा करें" : "Collapse"}</span>
          )}
        </button>

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

  // Document Help functions (original)
  const currentField = demoFormData.fields[activeField];


  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-100 shadow-2xl transform transition-transform duration-300 ease-in-out lg:hidden ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <SidebarContent onClose={() => setMobileSidebarOpen(false)} />
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col flex-shrink-0 bg-white border-r border-gray-100 transition-all duration-300 ease-in-out ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <SidebarContent collapsed={!sidebarOpen} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        {/* Top bar */}
        <header className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileSidebarOpen(true)}
                className="lg:hidden h-10 w-10 rounded-xl bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                  {t.documentHelp}
                </h1>
              </div>
            </div>

            {/* Language Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => handleLanguageChange('english')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  language === 'english'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.english}
              </button>
              <button
                onClick={() => handleLanguageChange('hindi')}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  language === 'hindi'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.hindi}
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-y-auto">
          <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="text-5xl mb-3">📋</div>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                  {t.formAssistant}
                </h2>
                <p className="text-gray-600 text-lg">
                  {t.formGuide}
                </p>
              </div>

              {/* Guidance Section */}
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Left: Field Selector */}
                <div className="md:col-span-1">
                  <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-6">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 uppercase tracking-wide">
                      📝 {t.fieldSelector}
                    </h3>
                    <div className="space-y-2">
                      {demoFormData.fields.map((field, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveField(idx)}
                          className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition ${
                            activeField === idx
                              ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          <div className="font-semibold">{field.field}</div>
                          <div className={`text-xs mt-1 ${activeField === idx ? 'text-green-100' : 'text-gray-500'}`}>
                            {field.type}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Detailed Guidance */}
                <div className="md:col-span-2">
                  <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
                    {currentField && (
                      <div className="space-y-6">
                        {/* Field Header */}
                        <div className="border-b border-gray-200 pb-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="text-2xl font-bold text-gray-900">
                                {currentField.field}
                              </h3>
                              <div className="flex items-center gap-3 mt-2">
                                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                  currentField.importance === 'Critical'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}>
                                  {currentField.importance === 'Critical' ? '🚨 ' : '⚠️ '} {
                                    currentField.importance === 'Critical' 
                                      ? t.critical 
                                      : t.important
                                  }
                                </span>
                                <span className="text-xs bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
                                  {currentField.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Steps */}
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2 text-lg">
                            <span>👉</span> {t.steps}:
                          </h4>
                          <ol className="space-y-3">
                            {currentField.steps.map((step, i) => (
                              <li key={i} className="flex gap-4">
                                <span className="h-7 w-7 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold flex items-center justify-center flex-shrink-0 text-sm">
                                  {i + 1}
                                </span>
                                <span className="text-gray-700 pt-1 text-sm">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>

                        {/* Example */}
                        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
                          <p className="text-xs font-semibold text-blue-900 mb-2">✅ {language === 'hindi' ? 'सही उदाहरण:' : 'CORRECT EXAMPLES:'}</p>
                          <p className="text-sm text-blue-800 font-medium">{currentField.examples}</p>
                        </div>

                        {/* Common Mistakes */}
                        <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                          <p className="text-xs font-semibold text-red-900 mb-2">❌ {language === 'hindi' ? 'बचने योग्य गलतियां:' : 'COMMON MISTAKES TO AVOID:'}</p>
                          <p className="text-sm text-red-800">{currentField.mistakes}</p>
                        </div>

                        {/* Pro Tip */}
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                          <p className="text-sm text-amber-900 font-medium">{currentField.tip}</p>
                        </div>

                        {/* Navigation Buttons */}
                        <div className="flex gap-3 pt-4">
                          {activeField > 0 && (
                            <button
                              onClick={() => setActiveField(activeField - 1)}
                              className="flex-1 py-3 px-4 bg-gray-100 text-gray-700 font-semibold rounded-lg hover:bg-gray-200 transition text-sm"
                            >
                              ← {language === 'hindi' ? 'पिछला फील्ड' : 'Previous Field'}
                            </button>
                          )}
                          {activeField < demoFormData.fields.length - 1 && (
                            <button
                              onClick={() => setActiveField(activeField + 1)}
                              className="flex-1 py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition flex items-center justify-center gap-2 text-sm"
                            >
                              {language === 'hindi' ? 'अगला फील्ड' : 'Next Field'} <ChevronRight className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary Card */}
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl shadow-lg p-6 text-white text-center mb-8">
                <p className="text-lg font-semibold">{demoFormData.summary}</p>
              </div>

              {/* Important Notes */}
              <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📌 {t.importantInstructions}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-blue-50">
                    <p className="font-semibold text-blue-900 mb-2">{t.dos}</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      {t.doList.map((item, i) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-lg bg-red-50">
                    <p className="font-semibold text-red-900 mb-2">{t.donts}</p>
                    <ul className="text-sm text-red-800 space-y-1">
                      {t.dontList.map((item, i) => (
                        <li key={i}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Notes Section */}
              <div className="mt-6">
                <div className="bg-white rounded-2xl shadow-lg p-4 border border-gray-100">
                  <label className="block text-sm font-medium text-gray-700 mb-2">{t.optionalNotes}</label>
                  <div className="flex items-start gap-3">
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder={language === 'hindi' ? 'फॉर्म के लिए कोई नोट या संदर्भ जोड़ें' : 'Add any notes or context for the form'}
                      className="flex-1 min-h-[80px] p-3 rounded-lg border border-gray-200 resize-y"
                    />
                    <div className="pt-2">
                      <SpeechToTextButton
                        ariaLabel={language === 'hindi' ? 'नोट्स बोलें' : 'Dictate notes'}
                        onResult={(text) => setNotes((s) => (s ? s + ' ' + text : text))}
                        lang={language === 'hindi' ? 'hi-IN' : 'en-IN'}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentHelp;