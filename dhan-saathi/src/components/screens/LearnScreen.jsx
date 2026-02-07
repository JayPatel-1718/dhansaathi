// src/components/screens/LearnScreen.jsx

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc, collection } from "firebase/firestore";
import {
  Home,
  Building2,
  Sparkle,
  BookOpen,
  MessageSquare,
  Bell,
  IndianRupee,
  Search,
  Play,
  Volume2,
  Bookmark,
  CheckCircle2,
  X,
  ShieldAlert,
  Eye,
  Clock,
  Share2,
  LogOut,
  User,
  Youtube,
  ExternalLink,
  ArrowRight,
  Shield,
  TrendingUp,
  Target,
  Award,
  ChevronRight,
  Star,
  Lock,
  Unlock,
  HelpCircle,
  Mic,
  VolumeX,
  PiggyBank,
  TrendingUp as TrendingUpIcon,
  BanknoteIcon,
  ChevronLeft,
  Menu,
  UserCog,
  Globe,
  ChevronLeft as ChevronLeftIcon,
} from "lucide-react";

// Firebase storage keys
const FB_KEYS = {
  SAVED: "savedLessons",
  COMPLETED: "completedLessons",
  LEARNING_STATS: "learningStats",
  TTS_SPEED: "ttsSpeed",
  LEARN_LANG: "learnSummaryLang",
  MODULE_PROGRESS: "moduleProgress",
  BADGES: "badges",
  QUIZ_SCORES: "quizScores",
  POINTS: "points",
  CURRENT_MODULE: "currentModule",
};

const LS = {
  saved: "dhan-saathi-saved-lessons",
  completed: "dhan-saathi-completed-lessons",
  ttsSpeed: "dhan-saathi-tts-speed",
  learnLang: "dhan-saathi-learn-summary-lang",
  moduleProgress: "dhan-saathi-module-progress",
  badges: "dhan-saathi-badges",
  quizScores: "dhan-saathi-quiz-scores",
  points: "dhan-saathi-points",
  currentModule: "dhan-saathi-current-module",
};

function readJSON(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback));
  } catch {
    return fallback;
  }
}

// Module Data - Updated with all 3 modules
const MODULES = [
  {
    id: "essential-finance-basics",
    titleEn: "Stay Safe, Grow Smart – 6 Essential Lessons",
    titleHi: "सुरक्षित रहें, समझदारी से बढ़ें – 6 जरूरी सबक",
    descriptionEn: "Protect your hard-earned money from scammers and build strong financial habits with these 6 short, beginner-to-intermediate videos. Learn to spot fake calls & UPI tricks, understand why your savings account matters, follow the golden 50/30/20 budgeting rule, start mutual funds with just ₹500, invest wisely in gold, and much more — all explained simply in Hindi (with some bilingual content).",
    descriptionHi: "अपनी मेहनत की कमाई को ठगों से बचाएं और मजबूत वित्तीय आदतें बनाएं — ये 6 छोटे-छोटे वीडियो देखें। फर्जी बैंक कॉल और UPI धोखाधड़ी पहचानें, बचत खाते का महत्व समझें, 50/30/20 बजट नियम सीखें, सिर्फ ₹500 से म्यूचुअल फंड शुरू करें, सोने में समझदारी से निवेश करें — सब कुछ आसान हिंदी में (कुछ वीडियो में अंग्रेजी भी)।",
    badge: "Safety + Smart Money",
    badgeHi: "सुरक्षा + स्मार्ट बचत",
    icon: "ShieldRupee",
    totalDuration: 60,
    totalLessons: 6,
    thumbStyle: "bg-gradient-to-br from-emerald-100 via-blue-50 to-cyan-100",
    accentColor: "emerald",
    badgeUnlocked: "Safety Champion",
    badgeUnlockedHi: "सुरक्षा योद्धा",
    order: 1,
    isFeatured: true,
    isFree: true,
    pointsToEarn: 60,
  },
  {
    id: "save-first-worry-less",
    titleEn: "Save First, Worry Less – Build Your Safety Net",
    titleHi: "पहले बचाएं, कम चिंता करें – अपना सुरक्षा जाल बनाएं",
    descriptionEn: "Build strong saving habits and understand why savings accounts matter. Learn about emergency funds, simple banking tools (post office/bank accounts, RD/FD basics) in an encouraging, zero-pressure tone. Perfect for beginners who want to start saving confidently.",
    descriptionHi: "मजबूत बचत की आदतें बनाएं और समझें कि बचत खाते क्यों महत्वपूर्ण हैं। आपातकालीन फंड, सरल बैंकिंग टूल (पोस्ट ऑफिस/बैंक खाते, आरडी/एफडी बेसिक्स) के बारे में जानें। शुरुआती लोगों के लिए आदर्श जो आत्मविश्वास से बचत शुरू करना चाहते हैं।",
    badge: "Saving Habits",
    badgeHi: "बचत की आदतें",
    icon: "PiggyBank",
    totalDuration: 55,
    totalLessons: 6,
    thumbStyle: "bg-gradient-to-br from-blue-100 via-indigo-50 to-purple-100",
    accentColor: "blue",
    badgeUnlocked: "Savings Pro",
    badgeUnlockedHi: "बचत विशेषज्ञ",
    order: 2,
    isFeatured: false,
    isFree: true,
    pointsToEarn: 75,
  },
  {
    id: "grow-your-money-wisely",
    titleEn: "Grow Your Money Wisely – Start Small Investing",
    titleHi: "अपने पैसे को समझदारी से बढ़ाएं – छोटे निवेश से शुरुआत करें",
    descriptionEn: "Introduce low-risk, small-ticket investing (SIP in mutual funds, gold, tax-saving options). Perfect for users who completed saving module and are ready for growth. Exciting but safe tone — 'Investing is not gambling when you start small and smart'.",
    descriptionHi: "कम जोखिम, छोटे निवेश (म्यूचुअल फंड में SIP, सोना, टैक्स-बचत विकल्प) से परिचित हों। उन उपयोगकर्ताओं के लिए आदर्श जिन्होंने बचत मॉड्यूल पूरा कर लिया है और विकास के लिए तैयार हैं। रोमांचक लेकिन सुरक्षित टोन — 'निवेश जुए नहीं है जब आप छोटे और समझदारी से शुरू करते हैं'।",
    badge: "Smart Investing",
    badgeHi: "स्मार्ट निवेश",
    icon: "TrendingUp",
    totalDuration: 80,
    totalLessons: 6,
    thumbStyle: "bg-gradient-to-br from-purple-100 via-pink-50 to-rose-100",
    accentColor: "purple",
    badgeUnlocked: "Investor Beginner",
    badgeUnlockedHi: "निवेशक शुरुआती",
    order: 3,
    isFeatured: false,
    isFree: true,
    pointsToEarn: 95,
  },
];

// Get the featured module
const FEATURED_MODULE = MODULES.find(m => m.isFeatured) || MODULES[0];

// Quiz Questions Data - Updated with new module questions
const QUIZ_QUESTIONS = {
  // Module 1 questions (existing)
  "otp-safety": {
    question: "What is the most important rule when someone calls claiming to be from your bank?",
    questionHi: "जब कोई आपके बैंक से होने का दावा करके कॉल करे, तो सबसे महत्वपूर्ण नियम क्या है?",
    options: [
      { id: "A", text: "Share your OTP to verify your identity", textHi: "अपनी पहचान सत्यापित करने के लिए अपना OTP साझा करें" },
      { id: "B", text: "Never share your OTP, PIN, or password with anyone", textHi: "कभी भी अपना OTP, PIN या पासवर्ड किसी के साथ साझा न करें" },
      { id: "C", text: "Give them your full bank account number to confirm", textHi: "पुष्टि करने के लिए उन्हें अपना पूरा बैंक खाता नंबर दें" },
      { id: "D", text: "Send them a screenshot of your recent transactions", textHi: "उन्हें अपने हालिया लेनदेन का स्क्रीनशॉट भेजें" }
    ],
    correct: "B",
    explanation: "Banks never ask for OTP, PIN, or password over calls. These are always scams.",
    explanationHi: "बैंक कभी भी कॉल पर OTP, PIN या पासवर्ड नहीं मांगते। ये हमेशा धोखाधड़ी होती हैं।",
    points: 10,
    moduleId: "essential-finance-basics"
  },
  "upi-fake-collect": {
    question: "Which of these is a common sign of a fake UPI payment request?",
    questionHi: "निम्नलिखित में से कौन सा फर्जी UPI भुगतान अनुरोध का एक सामान्य संकेत है?",
    options: [
      { id: "A", text: "The request comes from a verified merchant QR code", textHi: "अनुरोध एक सत्यापित व्यापारी QR कोड से आता है" },
      { id: "B", text: "The sender asks you to approve a payment you did not initiate", textHi: "प्रेषक आपको उस भुगतान को स्वीकृत करने के लिए कहता है जिसे आपने शुरू नहीं किया था" },
      { id: "C", text: "The amount matches exactly what you expected to pay", textHi: "राशि वही है जो आपने भुगतान करने की उम्मीद की थी" },
      { id: "D", text: "It shows the official UPI app logo and name", textHi: "यह आधिकारिक UPI ऐप लोगो और नाम दिखाता है" }
    ],
    correct: "B",
    explanation: "Real UPI payments don't need your approval to receive money. Fake requests trick you into approving payments.",
    explanationHi: "असली UPI भुगतानों को पैसा प्राप्त करने के लिए आपकी स्वीकृति की आवश्यकता नहीं होती। फर्जी अनुरोध आपको भुगतान स्वीकार करने के लिए धोखा देते हैं।",
    points: 10,
    moduleId: "essential-finance-basics"
  },
  "50-30-20": {
    question: "According to the 50/30/20 budgeting rule, what percentage of your after-tax income should go toward needs (rent, food, bills, etc.)?",
    questionHi: "50/30/20 बजट नियम के अनुसार, आपकी कर-रहित आय का कितना प्रतिशत जरूरतों (किराया, खाना, बिल, आदि) के लिए जाना चाहिए?",
    options: [
      { id: "A", text: "20%", textHi: "20%" },
      { id: "B", text: "30%", textHi: "30%" },
      { id: "C", text: "50%", textHi: "50%" },
      { id: "D", text: "70%", textHi: "70%" }
    ],
    correct: "C",
    explanation: "50% for needs, 30% for wants, and 20% for savings/investments.",
    explanationHi: "50% जरूरतों के लिए, 30% इच्छाओं के लिए, और 20% बचत/निवेश के लिए।",
    points: 10,
    moduleId: "essential-finance-basics"
  },
  "savings-account": {
    question: "What is one of the most important benefits of maintaining a regular savings account?",
    questionHi: "नियमित बचत खाता बनाए रखने के सबसे महत्वपूर्ण लाभों में से एक क्या है?",
    options: [
      { id: "A", text: "It guarantees very high returns like stock market", textHi: "यह शेयर बाजार की तरह बहुत अधिक रिटर्न की गारंटी देता है" },
      { id: "B", text: "It provides emergency funds and builds financial discipline", textHi: "यह आपातकालीन फंड प्रदान करता है और वित्तीय अनुशासन बनाता है" },
      { id: "C", text: "It allows unlimited free international transactions", textHi: "यह असीमित मुफ्त अंतर्राष्ट्रीय लेनदेन की अनुमति देता है" },
      { id: "D", text: "It automatically invests your money in mutual funds", textHi: "यह आपके पैसे को स्वचालित रूप से म्यूचुअल फंड में निवेश कर देता है" }
    ],
    correct: "B",
    explanation: "Savings accounts are safe, accessible, and help build emergency funds and financial discipline.",
    explanationHi: "बचत खाते सुरक्षित, सुलभ होते हैं और आपातकालीन फंड तथा वित्तीय अनुशासन बनाने में मदद करते हैं।",
    points: 10,
    moduleId: "essential-finance-basics"
  },
  "mutual-funds-basics": {
    question: "What is a key advantage of starting mutual funds with a small amount like ₹500 through SIP?",
    questionHi: "SIP के माध्यम से ₹500 जैसी छोटी राशि से म्यूचुअल फंड शुरू करने का एक प्रमुख लाभ क्या है?",
    options: [
      { id: "A", text: "You get guaranteed fixed returns every month", textHi: "आपको हर महीने गारंटीकृत निश्चित रिटर्न मिलता है" },
      { id: "B", text: "It helps build wealth over time through rupee cost averaging", textHi: "यह रुपये की लागत को औसत करके समय के साथ धन बनाने में मदद करता है" },
      { id: "C", text: "The government gives extra bonus money on every investment", textHi: "सरकार हर निवेश पर अतिरिक्त बोनस राशि देती है" },
      { id: "D", text: "You can withdraw the full amount anytime without any charges", textHi: "आप बिना किसी शुल्क के किसी भी समय पूरी राशि निकाल सकते हैं" }
    ],
    correct: "B",
    explanation: "SIP with small amounts allows rupee cost averaging, reducing risk and building wealth gradually.",
    explanationHi: "छोटी राशि के साथ SIP रुपये की लागत को औसत करने की अनुमति देता है, जिससे जोखिम कम होता है और धन धीरे-धीरे बनता है।",
    points: 10,
    moduleId: "essential-finance-basics"
  },
  "gold-investing": {
    question: "Which option is generally considered a safer and more convenient way for beginners to invest in gold in India?",
    questionHi: "भारत में सोने में निवेश करने के लिए शुरुआती लोगों के लिए आम तौर पर कौन सा विकल्प सुरक्षित और अधिक सुविधाजनक माना जाता है?",
    options: [
      { id: "A", text: "Buying physical gold jewellery every month", textHi: "हर महीने भौतिक सोने के आभूषण खरीदना" },
      { id: "B", text: "Investing in Gold ETFs or Sovereign Gold Bonds", textHi: "गोल्ड ETFs या सॉवरेन गोल्ड बॉन्ड में निवेश करना" },
      { id: "C", text: "Keeping all savings in cash to buy gold later", textHi: "बाद में सोना खरीदने के लिए सभी बचत नकद रखना" },
      { id: "D", text: "Taking a gold loan to invest in more gold", textHi: "अधिक सोने में निवेश करने के लिए सोने का ऋण लेना" }
    ],
    correct: "B",
    explanation: "Gold ETFs and SGBs are digital, safe from theft, and often provide interest/bonus benefits.",
    explanationHi: "गोल्ड ETFs और SGBs डिजिटल होते हैं, चोरी से सुरक्षित होते हैं, और अक्सर ब्याज/बोनस लाभ प्रदान करते हैं।",
    points: 10,
    moduleId: "essential-finance-basics"
  },
  
  // Module 2 questions
  "savings-account-benefits": {
    question: "What is the main benefit of a zero-balance savings account like PMJDY?",
    questionHi: "PMJDY जैसे जीरो-बैलेंस बचत खाते का मुख्य लाभ क्या है?",
    options: [
      { id: "A", text: "High interest rates", textHi: "उच्च ब्याज दरें" },
      { id: "B", text: "No minimum balance penalty", textHi: "न्यूनतम शेष राशि जुर्माना नहीं" },
      { id: "C", text: "Free stocks", textHi: "मुफ्त स्टॉक" },
      { id: "D", text: "Unlimited loans", textHi: "असीमित ऋण" }
    ],
    correct: "B",
    explanation: "Zero-balance accounts like PMJDY allow you to maintain any balance without penalties, making banking accessible to everyone.",
    explanationHi: "PMJDY जैसे जीरो-बैलेंस खाते आपको बिना किसी जुर्माने के कोई भी बैलेंस रखने की अनुमति देते हैं, जिससे बैंकिंग सभी के लिए सुलभ हो जाती है।",
    points: 10,
    moduleId: "save-first-worry-less"
  },
  "daily-savings-growth": {
    question: "If you save ₹50 daily at 7% interest, how does it grow?",
    questionHi: "यदि आप 7% ब्याज पर ₹50 रोजाना बचाते हैं, तो यह कैसे बढ़ता है?",
    options: [
      { id: "A", text: "Stays the same", textHi: "वैसा ही रहता है" },
      { id: "B", text: "Doubles every 10 years", textHi: "हर 10 साल में दोगुना हो जाता है" },
      { id: "C", text: "Loses value", textHi: "मूल्य खो देता है" },
      { id: "D", text: "Grows only if you add more", textHi: "तभी बढ़ता है जब आप और जोड़ते हैं" }
    ],
    correct: "B",
    explanation: "Through compound interest, small daily savings can grow significantly over time, typically doubling every 10-12 years at 7%.",
    explanationHi: "चक्रवृद्धि ब्याज के माध्यम से, छोटी दैनिक बचत समय के साथ काफी बढ़ सकती है, आमतौर पर 7% पर हर 10-12 साल में दोगुनी हो जाती है।",
    points: 10,
    moduleId: "save-first-worry-less"
  },
  "emergency-fund-coverage": {
    question: "How much should your emergency fund cover?",
    questionHi: "आपके आपातकालीन फंड को कितना कवर करना चाहिए?",
    options: [
      { id: "A", text: "1 month expenses", textHi: "1 महीने का खर्च" },
      { id: "B", text: "3–6 months expenses", textHi: "3–6 महीने का खर्च" },
      { id: "C", text: "1 year salary", textHi: "1 वर्ष का वेतन" },
      { id: "D", text: "All your savings", textHi: "आपकी सारी बचत" }
    ],
    correct: "B",
    explanation: "An emergency fund should cover 3-6 months of living expenses to handle unexpected situations without debt.",
    explanationHi: "आपातकालीन फंड में 3-6 महीने का जीवनयापन खर्च होना चाहिए ताकि बिना कर्ज के अप्रत्याशित स्थितियों से निपटा जा सके।",
    points: 10,
    moduleId: "save-first-worry-less"
  },
  "rd-difference": {
    question: "What makes RD different from regular savings?",
    questionHi: "RD को नियमित बचत से क्या अलग बनाता है?",
    options: [
      { id: "A", text: "One-time deposit", textHi: "एकमुश्त जमा" },
      { id: "B", text: "Monthly fixed deposit", textHi: "मासिक स्थिर जमा" },
      { id: "C", text: "No interest", textHi: "कोई ब्याज नहीं" },
      { id: "D", text: "Unlimited withdrawals", textHi: "असीमित निकासी" }
    ],
    correct: "B",
    explanation: "RD (Recurring Deposit) requires a fixed monthly deposit for a fixed tenure, offering higher interest than regular savings.",
    explanationHi: "RD (आवर्ती जमा) के लिए एक निश्चित अवधि के लिए निश्चित मासिक जमा की आवश्यकता होती है, जो नियमित बचत की तुलना में अधिक ब्याज प्रदान करती है।",
    points: 10,
    moduleId: "save-first-worry-less"
  },
  "fd-advantage": {
    question: "What is the main advantage of FD?",
    questionHi: "FD का मुख्य लाभ क्या है?",
    options: [
      { id: "A", text: "High risk", textHi: "उच्च जोखिम" },
      { id: "B", text: "Guaranteed fixed returns", textHi: "गारंटीकृत निश्चित रिटर्न" },
      { id: "C", text: "Daily withdrawals", textHi: "दैनिक निकासी" },
      { id: "D", text: "Market-linked", textHi: "बाजार-लिंक्ड" }
    ],
    correct: "B",
    explanation: "Fixed Deposits offer guaranteed fixed returns at a predetermined interest rate, making them low-risk investments.",
    explanationHi: "फिक्स्ड डिपॉजिट पूर्व निर्धारित ब्याज दर पर गारंटीकृत निश्चित रिटर्न प्रदान करते हैं, जिससे वे कम जोखिम वाले निवेश बन जाते हैं।",
    points: 10,
    moduleId: "save-first-worry-less"
  },
  "post-office-rural": {
    question: "For rural users, post office savings are often better because?",
    questionHi: "ग्रामीण उपयोगकर्ताओं के लिए, पोस्ट ऑफिस बचत अक्सर बेहतर होती है क्योंकि?",
    options: [
      { id: "A", text: "Higher tech", textHi: "उच्च तकनीक" },
      { id: "B", text: "More branches in villages", textHi: "गांवों में अधिक शाखाएं" },
      { id: "C", text: "Lower interest", textHi: "कम ब्याज" },
      { id: "D", text: "Complex apps", textHi: "जटिल ऐप्स" }
    ],
    correct: "B",
    explanation: "Post offices have wider reach in rural areas, making them more accessible than banks for many villagers.",
    explanationHi: "पोस्ट ऑफिस का ग्रामीण क्षेत्रों में व्यापक पहुंच है, जिससे वे कई ग्रामीणों के लिए बैंकों की तुलना में अधिक सुलभ होते हैं।",
    points: 10,
    moduleId: "save-first-worry-less"
  },
  
  // Module 3 questions
  "investing-early": {
    question: "Why start investing early?",
    questionHi: "निवेश जल्दी क्यों शुरू करें?",
    options: [
      { id: "A", text: "More risk", textHi: "अधिक जोखिम" },
      { id: "B", text: "Power of compounding", textHi: "चक्रवृद्धि की शक्ति" },
      { id: "C", text: "Higher taxes", textHi: "उच्च कर" },
      { id: "D", text: "Less money needed", textHi: "कम पैसे की जरूरत" }
    ],
    correct: "B",
    explanation: "Starting early gives your money more time to compound, significantly increasing your wealth over the long term.",
    explanationHi: "जल्दी शुरू करने से आपके पैसे को चक्रवृद्धि के लिए अधिक समय मिलता है, जिससे लंबी अवधि में आपकी संपत्ति में काफी वृद्धि होती है।",
    points: 10,
    moduleId: "grow-your-money-wisely"
  },
  "mutual-funds-explained": {
    question: "Mutual funds are?",
    questionHi: "म्यूचुअल फंड हैं?",
    options: [
      { id: "A", text: "Individual stocks", textHi: "व्यक्तिगत स्टॉक" },
      { id: "B", text: "Pooled investments managed by pros", textHi: "पेशेवरों द्वारा प्रबंधित पूल्ड निवेश" },
      { id: "C", text: "Bank loans", textHi: "बैंक ऋण" },
      { id: "D", text: "Gold bars", textHi: "सोने की बार" }
    ],
    correct: "B",
    explanation: "Mutual funds pool money from multiple investors to invest in diversified portfolios managed by professional fund managers.",
    explanationHi: "म्यूचुअल फंड कई निवेशकों से पैसा जुटाकर पेशेवर फंड मैनेजरों द्वारा प्रबंधित विविध पोर्टफोलियो में निवेश करते हैं।",
    points: 10,
    moduleId: "grow-your-money-wisely"
  },
  "sip-meaning": {
    question: "SIP means?",
    questionHi: "SIP का मतलब है?",
    options: [
      { id: "A", text: "One-time big investment", textHi: "एकमुश्त बड़ा निवेश" },
      { id: "B", text: "Regular small investments", textHi: "नियमित छोटे निवेश" },
      { id: "C", text: "Selling shares", textHi: "शेयर बेचना" },
      { id: "D", text: "Bank fixed deposit", textHi: "बैंक फिक्स्ड डिपॉजिट" }
    ],
    correct: "B",
    explanation: "SIP (Systematic Investment Plan) involves investing a fixed amount regularly, typically monthly, in mutual funds.",
    explanationHi: "SIP (सिस्टमैटिक इन्वेस्टमेंट प्लान) में म्यूचुअल फंड में नियमित रूप से, आमतौर पर मासिक, एक निश्चित राशि का निवेश शामिल होता है।",
    points: 10,
    moduleId: "grow-your-money-wisely"
  },
  "gold-beginner": {
    question: "Best way for beginners to invest in gold?",
    questionHi: "शुरुआती लोगों के लिए सोने में निवेश का सबसे अच्छा तरीका?",
    options: [
      { id: "A", text: "Physical jewellery", textHi: "भौतिक आभूषण" },
      { id: "B", text: "Gold ETF/Sovereign Bond", textHi: "गोल्ड ETF/सॉवरेन बॉन्ड" },
      { id: "C", text: "Coins from market", textHi: "बाजार से सिक्के" },
      { id: "D", text: "None", textHi: "कोई नहीं" }
    ],
    correct: "B",
    explanation: "Gold ETFs and Sovereign Gold Bonds are digital, secure, and often provide additional interest, making them ideal for beginners.",
    explanationHi: "गोल्ड ETF और सॉवरेन गोल्ड बॉन्ड डिजिटल, सुरक्षित होते हैं और अक्सर अतिरिक्त ब्याज प्रदान करते हैं, जिससे वे शुरुआती लोगों के लिए आदर्श होते हैं।",
    points: 10,
    moduleId: "grow-your-money-wisely"
  },
  "80c-max": {
    question: "Max deduction under 80C?",
    questionHi: "80C के तहत अधिकतम कटौती?",
    options: [
      { id: "A", text: "₹50,000", textHi: "₹50,000" },
      { id: "B", text: "₹1.5 lakh", textHi: "₹1.5 लाख" },
      { id: "C", text: "₹5 lakh", textHi: "₹5 लाख" },
      { id: "D", text: "No limit", textHi: "कोई सीमा नहीं" }
    ],
    correct: "B",
    explanation: "Section 80C allows tax deduction up to ₹1.5 lakh for specified investments and expenses.",
    explanationHi: "धारा 80C निर्दिष्ट निवेश और व्यय के लिए ₹1.5 लाख तक की कर कटौती की अनुमति देती है।",
    points: 10,
    moduleId: "grow-your-money-wisely"
  },
  "investing-mistake": {
    question: "Biggest first-time investor mistake?",
    questionHi: "पहली बार निवेशक की सबसे बड़ी गलती?",
    options: [
      { id: "A", text: "Starting small", textHi: "छोटे से शुरुआत करना" },
      { id: "B", text: "Panicking and selling low", textHi: "घबराकर कम दाम पर बेचना" },
      { id: "C", text: "Saving first", textHi: "पहले बचत करना" },
      { id: "D", text: "Asking experts", textHi: "विशेषज्ञों से पूछना" }
    ],
    correct: "B",
    explanation: "Emotional decisions like panic selling during market dips are common mistakes that can lock in losses.",
    explanationHi: "बाजार में गिरावट के दौरान घबराहट में बेचने जैसे भावनात्मक निर्णय आम गलतियाँ हैं जो नुकसान को लॉक कर सकती हैं।",
    points: 10,
    moduleId: "grow-your-money-wisely"
  }
};

// Updated LESSONS array with all 3 modules
const LESSONS = [
  // Module 1: Essential Finance Basics (existing)
  {
    id: "otp-safety",
    title: "Never Share Your OTP – Spot Bank Scams",
    titleHi: "OTP कभी न दें – बैंक के नाम पर ठगी से बचें",
    category: "Scam Safety",
    duration: "3:45",
    difficulty: "Beginner",
    views: "12.4k",
    langTag: "Hindi",
    urgent: true,
    module: "essential-finance-basics",
    orderInModule: 1,
    whyThisOrder: "Most urgent safety topic - foundation for all digital security",
    youtube: [
      {
        id: "b81-ayrWZgU",
        title: "Beware! Your Next OTP Request Could Be a Scam",
        channel: "Financial Awareness",
        description: "Explains how scammers trick people into sharing OTPs to drain bank accounts. Emphasizes that no genuine bank asks for OTP on calls/SMS.",
        duration: "3:45"
      },
      {
        id: "SzftRFW_EM0",
        title: "अपना ACCOUNT खाली होने से पहले देखो | NO OTP fraud EXPOSE",
        channel: "Sunny Yadav Sir",
        description: "Detailed exposure of OTP hacking scams in Hindi, with real examples and protection tips to prevent bank account emptying.",
        duration: "12:25"
      },
    ],
    summaryEn: [
      "OTP is the final key to your money. Sharing it is like giving away your bank vault keys.",
      "Scammers pretend to be bank officials or KYC agents to trick you into revealing OTP.",
      "Genuine banks never ask for OTP on calls/SMS/WhatsApp.",
    ],
    summaryHi: [
      "OTP आपके पैसे की सबसे आख़िरी चाबी है। इसे साझा करना खतरनाक है।",
      "ठग खुद को बैंक/केवाईसी एजेंट बताकर OTP मांगते हैं।",
      "असली बैंक कभी कॉल/मैसेज पर OTP नहीं मांगते।",
    ],
    warningEn: "Bank officials will NEVER ask for OTP over a call or SMS. If someone asks, they are a scammer.",
    warningHi: "बैंक कभी भी कॉल/मैसेज पर OTP नहीं मांगता। अगर कोई मांगे, तो वह ठग है।",
    stepsEn: ["Hang up immediately if anyone asks for OTP or PIN.", "Do not click unknown KYC links.", "Call your bank using the official number."],
    stepsHi: ["OTP/PIN मांगने पर तुरंत कॉल काट दें।", "अनजान KYC लिंक पर क्लिक न करें।", "बैंक के official नंबर पर कॉल करें।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.25)_0%,transparent_55%),linear-gradient(135deg,#E9FFE1_0%,#FFFFFF_60%,#E0FBFF_100%)]",
  },
  {
    id: "upi-fake-collect",
    title: "Identify Fake UPI Payment Requests",
    titleHi: "फर्जी UPI पेमेंट रिक्वेस्ट कैसे पहचानें",
    category: "UPI & Digital Payments",
    duration: "3:15",
    difficulty: "Advanced",
    views: "15.2k",
    langTag: "Hindi",
    module: "essential-finance-basics",
    orderInModule: 2,
    whyThisOrder: "Very common digital scam today - follows OTP safety",
    youtube: [
      {
        id: "fmj3yiLzE3g",
        title: "UPI Collect Request Scam | Jamkar Phenko | Union Bank of India",
        channel: "Union Bank of India",
        description: "Official Union Bank awareness video in Hindi — how to spot and avoid fake collect requests; 'Jamkar Phenko' (throw away fake requests).",
        duration: "3:15"
      },
      {
        id: "0y99EDDZXo4",
        title: "Nakli UPI Payment Scam Samjhiye | Scan–Request Ke Naam Par Fraud",
        channel: "Cyber Safety India",
        description: "Hindi explanation of fake UPI requests/scams (collect requests, fake screenshots), with tips to stay safe.",
        duration: "11:45"
      },
    ],
    summaryEn: ["To receive money you don't need UPI PIN.", "Unknown 'collect' requests can be scams.", "Only pay when YOU enter amount and confirm."],
    summaryHi: ["पैसा पाने के लिए UPI PIN की जरूरत नहीं होती।", "अनजान 'collect' requests धोखा हो सकते हैं।", "भुगतान तभी करें जब आप amount डालें।"],
    warningEn: "If someone asks you to approve a request to 'receive money', it's likely fraud.",
    warningHi: "अगर कोई बोले 'पैसा लेने के लिए approve करो', तो धोखा हो सकता है।",
    stepsEn: ["Decline unknown collect.", "Never share UPI PIN.", "Use QR scan for payments."],
    stepsHi: ["अनजान collect decline करें।", "UPI PIN न शेयर करें।", "QR scan से pay करें।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.18)_0%,transparent_55%),linear-gradient(135deg,#ECFDF5_0%,#FFFFFF_70%,#EEF2FF_100%)]",
  },
  {
    id: "50-30-20",
    title: "The 50/30/20 Rule Explained",
    titleHi: "50/30/20 बजट नियम समझें",
    category: "Budgeting",
    duration: "7:30",
    difficulty: "Beginner",
    views: "9.1k",
    langTag: "Hindi/English",
    module: "essential-finance-basics",
    orderInModule: 3,
    whyThisOrder: "First step to control money - after security basics",
    youtube: [
      {
        id: "WkTuyRqIOA0",
        title: "50 30 20 Rule In Hindi पैसे बचत और खर्च करने का नियम",
        channel: "Easy Money Rules",
        description: "Clear Hindi breakdown of the 50% needs, 30% wants, 20% savings rule with easy examples. Great for beginners managing monthly income.",
        duration: "7:30"
      },
      {
        id: "5uaXq-xDp2g",
        title: "PAISA kaise BUDGET, SAVE aur EARN Karein? | Ankur Warikoo",
        channel: "Ankur Warikoo",
        description: "Popular educator Ankur Warikoo explains the rule (with a twist) in Hindi/English mix — how to budget salary effectively for savings.",
        duration: "15:45"
      },
    ],
    summaryEn: ["50% for needs (rent, food).", "30% for wants (shopping).", "20% for savings/investments."],
    summaryHi: ["50% ज़रूरतें (खाना, किराया)।", "30% इच्छाएँ (मनपसंद खर्च)।", "20% बचत/निवेश।"],
    stepsEn: ["List needs/wants/savings.", "Set monthly limits.", "Track weekly."],
    stepsHi: ["जरूरत/इच्छा/बचत लिखें।", "मासिक limit तय करें।", "हर हफ्ते ट्रैक करें।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.18)_0%,transparent_55%),linear-gradient(135deg,#EEF2FF_0%,#FFFFFF_70%,#ECFDF5_100%)]",
  },
  {
    id: "savings-account",
    title: "Why Your Savings Account Matters",
    titleHi: "आपका बचत खाता क्यों महत्वपूर्ण है",
    category: "Savings",
    duration: "10:20",
    difficulty: "Beginner",
    views: "8.9k",
    langTag: "Hindi",
    module: "essential-finance-basics",
    orderInModule: 4,
    whyThisOrder: "Foundation before investing - building emergency fund",
    youtube: [
      {
        id: "hA3Yi4RdY50",
        title: "Savings Account - Explained in Hindi",
        channel: "Finance Explained",
        description: "Full explanation in Hindi — interest rates, benefits, safety, how to open, and why it's important for beginners/emergencies.",
        duration: "10:20"
      },
      {
        id: "nhX5UUPcY10",
        title: "Importance of Saving | Hindi",
        channel: "Financial Literacy",
        description: "Simple Hindi video on why saving (especially in bank accounts) builds security, with tips for regular small savings.",
        duration: "6:45"
      },
    ],
    summaryEn: ["A savings account helps you keep money safe and accessible.", "Interest is small but safety is high in regulated banks.", "Use it for emergency funds before risky investments."],
    summaryHi: ["सेविंग अकाउंट पैसा सुरक्षित रखने में मदद करता है।", "बैंकों में सुरक्षा ज्यादा होती है।", "पहले आपातकालीन फंड बनाएं।"],
    stepsEn: ["Keep SMS alerts.", "Set a monthly auto transfer.", "Avoid unnecessary withdrawals."],
    stepsHi: ["SMS alerts रखें।", "मासिक auto transfer सेट करें।", "बार‑बार निकालने से बचें।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.18)_0%,transparent_55%),linear-gradient(135deg,#FEF3C7_0%,#FFFFFF_70%,#E0FBFF_100%)]",
  },
  {
    id: "mutual-funds-basics",
    title: "Mutual Funds – Start with Just ₹500",
    titleHi: "म्यूचुअल फंड – सिर्फ ₹500 से शुरू करें",
    category: "Mutual Funds",
    duration: "22:30",
    difficulty: "Intermediate",
    views: "7.8k",
    langTag: "Hindi",
    module: "essential-finance-basics",
    orderInModule: 5,
    whyThisOrder: "Practical next step after saving - first investment vehicle",
    youtube: [
      {
        id: "e6Ny74qZN4A",
        title: "SIP Kaise Kare 2026 (Full Course) | SIP Investment in HINDI",
        channel: "Investment Guru",
        description: "Complete Hindi guide for beginners — what are mutual funds, how SIP works, starting from ₹500/month.",
        duration: "22:30"
      },
      {
        id: "4rb1vPBFByw",
        title: "500 से Investment शुरू करें | SIP Guide for Students Step by Step",
        channel: "Student Finance",
        description: "Step-by-step in Hindi — start mutual fund SIP with just ₹500, beginner-friendly with practical tutorial.",
        duration: "14:20"
      },
    ],
    summaryEn: ["Mutual funds pool money from many investors.", "Professional managers invest in stocks/bonds.", "Start small with Systematic Investment Plans (SIP)."],
    summaryHi: ["म्यूचुअल फंड में कई निवेशकों के पैसे जुड़ते हैं।", "प्रोफेशनल मैनेजर स्टॉक/बॉन्ड में निवेश करते हैं।", "SIP के जरिए छोटी रकम से शुरुआत करें।"],
    stepsEn: ["Research fund house reputation.", "Choose SIP amount and date.", "Monitor quarterly statements."],
    stepsHi: ["फंड हाउस की प्रतिष्ठा जाँचें।", "SIP amount और date चुनें।", "त्रैमासिक statements देखें।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.18)_0%,transparent_55%),linear-gradient(135deg,#F5F3FF_0%,#FFFFFF_70%,#F0F9FF_100%)]",
  },
  {
    id: "gold-investing",
    title: "Smart Gold Investing for Beginners",
    titleHi: "शुरुआती लोगों के लिए समझदारी से सोना निवेश",
    category: "Gold Investing",
    duration: "13:45",
    difficulty: "Beginner",
    views: "6.3k",
    langTag: "Hindi",
    module: "essential-finance-basics",
    orderInModule: 6,
    whyThisOrder: "Popular & emotional investment in India - final growth topic",
    youtube: [
      {
        id: "OS2NfDMTpeM",
        title: "Digital Gold vs Physical Gold | What is Digital Gold",
        channel: "Investment Comparison",
        description: "Hindi comparison — why digital gold/SGB is safer/smarter than physical, with interest benefits.",
        duration: "13:45"
      },
      {
        id: "Myu3oOlMZrE",
        title: "How to Invest in Sovereign Gold Bonds | Gold Bond Scheme 2026",
        channel: "Government Bonds Guide",
        description: "Step-by-step Hindi guide to Sovereign Gold Bonds (interest + gold price appreciation), safe for beginners.",
        duration: "11:20"
      },
    ],
    summaryEn: ["Digital gold is safer than physical.", "Sovereign Gold Bonds offer interest + gold appreciation.", "Avoid buying during high festival seasons."],
    summaryHi: ["डिजिटल गोल्ड, फिजिकल से सुरक्षित है।", "सॉवरेन गोल्ड बॉन्ड से ब्याज + सोने की कीमत दोनों मिलते हैं।", "त्योहारों के समय खरीदने से बचें।"],
    stepsEn: ["Open demat account for digital gold.", "Compare making charges for physical.", "Keep investment below 10% of portfolio."],
    stepsHi: ["डिजिटल गोल्ड के लिए डीमैट अकाउंट खोलें।", "फिजिकल गोल्ड के making charges compare करें।", "निवेश पोर्टफोलियो के 10% से कम रखें।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.25)_0%,transparent_55%),linear-gradient(135deg,#FEF3C7_0%,#FFFFFF_70%,#FFFBEB_100%)]",
  },

  // Module 2: Save First, Worry Less
  {
    id: "savings-account-benefits",
    title: "Why Your Savings Account Is Your First Superpower",
    titleHi: "आपका बचत खाता आपकी पहली सुपरपावर क्यों है",
    category: "Savings",
    duration: "9:00",
    difficulty: "Beginner",
    views: "8.5k",
    langTag: "Hindi",
    module: "save-first-worry-less",
    orderInModule: 1,
    whyThisOrder: "Foundation of financial security - starts with basic banking",
    youtube: [
      {
        id: "hA3Yi4RdY50",
        title: "Savings Account Explained in Hindi (Basics, Interest, Opening)",
        channel: "Asset Yogi",
        description: "Clear explanation for beginners about savings accounts, interest, and how to open one.",
        duration: "9:00"
      },
      {
        id: "nhX5UUPcY10",
        title: "Importance of Saving in Hindi (Beginner Guide)",
        channel: "Pranjal Kamra",
        description: "Motivational guide about why saving matters and how to start.",
        duration: "7:00"
      },
    ],
    summaryEn: [
      "A dedicated savings account is your foundation for financial security.",
      "No-fee options like PMJDY make banking accessible to everyone.",
      "Easy access to your money when you need it most.",
    ],
    summaryHi: [
      "एक समर्पित बचत खाता वित्तीय सुरक्षा की आपकी नींव है।",
      "PMJDY जैसे नो-फी विकल्प बैंकिंग को सभी के लिए सुलभ बनाते हैं।",
      "जब आपको सबसे ज्यादा जरूरत हो तो आपके पैसे तक आसान पहुंच।",
    ],
    warningEn: "Never share your banking details with anyone. Always use official bank channels.",
    warningHi: "कभी भी अपनी बैंकिंग जानकारी किसी के साथ साझा न करें। हमेशा आधिकारिक बैंक चैनलों का उपयोग करें।",
    stepsEn: ["Choose a bank with no minimum balance requirement.", "Enable SMS and email alerts.", "Set up auto-transfer from salary account."],
    stepsHi: ["न्यूनतम शेष राशि की आवश्यकता वाला बैंक चुनें।", "एसएमएस और ईमेल अलर्ट सक्षम करें।", "वेतन खाते से ऑटो-ट्रांसफर सेट करें।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.25)_0%,transparent_55%),linear-gradient(135deg,#DBEAFE_0%,#FFFFFF_60%,#E0E7FF_100%)]",
  },
  {
    id: "daily-savings-growth",
    title: "The Magic of Small Daily Savings",
    titleHi: "छोटी दैनिक बचत का जादू",
    category: "Savings",
    duration: "8:00",
    difficulty: "Beginner",
    views: "7.2k",
    langTag: "Hindi",
    module: "save-first-worry-less",
    orderInModule: 2,
    whyThisOrder: "Shows how small amounts can grow - motivates consistent saving",
    youtube: [
      {
        id: "power-of-compounding",
        title: "Power of Compounding: Small Savings Grow Big (Hindi)",
        channel: "Money Purse",
        description: "Simple calculations showing how small daily savings compound into big wealth over time.",
        duration: "8:00"
      },
      {
        id: "small-investments",
        title: "Power of Compounding in Hindi (Small Investments)",
        channel: "Abhishek Kar",
        description: "Easy visuals explaining compounding with small investment examples.",
        duration: "6:00"
      },
    ],
    summaryEn: [
      "Tiny daily savings compound into significant wealth over time.",
      "₹50 per day can become ₹1 lakh in 5 years with interest.",
      "Consistency is more important than the amount.",
    ],
    summaryHi: [
      "छोटी दैनिक बचत समय के साथ महत्वपूर्ण धन में बदल जाती है।",
      "ब्याज के साथ ₹50 प्रतिदिन 5 साल में ₹1 लाख हो सकता है।",
      "राशि की तुलना में निरंतरता अधिक महत्वपूर्ण है।",
    ],
    warningEn: "Don't wait to save 'more' - start with whatever you can today.",
    warningHi: "'अधिक' बचत करने की प्रतीक्षा न करें - आज जो कुछ भी कर सकते हैं उससे शुरुआत करें।",
    stepsEn: ["Start with ₹10-50 per day.", "Use a separate piggy bank or digital wallet.", "Review and increase monthly."],
    stepsHi: ["₹10-50 प्रतिदिन से शुरुआत करें।", "एक अलग गुल्लक या डिजिटल वॉलेट का उपयोग करें।", "मासिक समीक्षा करें और बढ़ाएं।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(168,85,247,0.25)_0%,transparent_55%),linear-gradient(135deg,#F3E8FF_0%,#FFFFFF_60%,#E0E7FF_100%)]",
  },
  {
    id: "emergency-fund-coverage",
    title: "Emergency Fund: Your Safety Shield",
    titleHi: "आपातकालीन फंड: आपकी सुरक्षा ढाल",
    category: "Emergency Fund",
    duration: "10:00",
    difficulty: "Beginner",
    views: "9.8k",
    langTag: "Hindi",
    module: "save-first-worry-less",
    orderInModule: 3,
    whyThisOrder: "Critical financial safety net - follows basic saving habits",
    youtube: [
      {
        id: "emergency-fund-formula",
        title: "Building an Emergency Fund in Hindi (6-Step Formula)",
        channel: "Deepak Bajaj",
        description: "Practical steps to create and maintain an emergency fund.",
        duration: "10:00"
      },
      {
        id: "emergency-fund-guide",
        title: "How to Build Emergency Fund (Hindi Guide)",
        channel: "Groww",
        description: "Beginner-friendly guide to emergency funds.",
        duration: "9:00"
      },
    ],
    summaryEn: [
      "Emergency fund covers 3-6 months of living expenses.",
      "Keep it in safe, liquid options like savings account.",
      "Separate from other savings to avoid temptation.",
    ],
    summaryHi: [
      "आपातकालीन फंड 3-6 महीने के जीवनयापन खर्च को कवर करता है।",
      "इसे बचत खाते जैसे सुरक्षित, तरल विकल्पों में रखें।",
      "प्रलोभन से बचने के लिए अन्य बचत से अलग रखें।",
    ],
    warningEn: "Don't touch emergency fund except for real emergencies like job loss or medical crisis.",
    warningHi: "नौकरी छूटने या चिकित्सा संकट जैसी वास्तविक आपात स्थितियों को छोड़कर आपातकालीन फंड को न छुएं।",
    stepsEn: ["Calculate monthly expenses.", "Set target amount (3-6 months).", "Save systematically each month."],
    stepsHi: ["मासिक खर्च की गणना करें।", "लक्ष्य राशि निर्धारित करें (3-6 महीने)।", "हर महीने व्यवस्थित रूप से बचत करें।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(14,165,233,0.25)_0%,transparent_55%),linear-gradient(135deg,#E0F2FE_0%,#FFFFFF_60%,#F0F9FF_100%)]",
  },
  {
    id: "rd-difference",
    title: "Recurring Deposit (RD) – Save Automatically Every Month",
    titleHi: "आवर्ती जमा (RD) – हर महीने स्वचालित रूप से बचाएं",
    category: "Banking",
    duration: "9:00",
    difficulty: "Beginner",
    views: "6.5k",
    langTag: "Hindi",
    module: "save-first-worry-less",
    orderInModule: 4,
    whyThisOrder: "Introduces disciplined saving tools after emergency fund",
    youtube: [
      {
        id: "rd-explained",
        title: "Recurring Deposit Explained in Hindi (Full Guide)",
        channel: "FinBaba",
        description: "Complete guide to RD benefits, calculations, and how to start.",
        duration: "9:00"
      },
      {
        id: "rd-basics",
        title: "What is RD in Hindi? (Simple Explanation)",
        channel: "Groww",
        description: "Basic explanation of Recurring Deposits for beginners.",
        duration: "8:00"
      },
    ],
    summaryEn: [
      "RD is an auto-save tool with fixed monthly deposits.",
      "Offers guaranteed interest higher than savings accounts.",
      "Builds financial discipline through regular contributions.",
    ],
    summaryHi: [
      "RD निश्चित मासिक जमा के साथ एक ऑटो-सेव टूल है।",
      "बचत खातों की तुलना में अधिक गारंटीकृत ब्याज प्रदान करता है।",
      "नियमित योगदान के माध्यम से वित्तीय अनुशासन बनाता है।",
    ],
    warningEn: "Premature withdrawal may attract penalties. Choose tenure carefully.",
    warningHi: "समय से पहले निकासी पर जुर्माना लग सकता है। कार्यकाल सावधानी से चुनें।",
    stepsEn: ["Decide monthly amount and tenure.", "Open RD at bank/post office.", "Set up auto-debit for convenience."],
    stepsHi: ["मासिक राशि और कार्यकाल तय करें।", "बैंक/डाकघर में RD खोलें।", "सुविधा के लिए ऑटो-डेबिट सेट करें।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.25)_0%,transparent_55%),linear-gradient(135deg,#DCFCE7_0%,#FFFFFF_60%,#F0FDF4_100%)]",
  },
  {
    id: "fd-advantage",
    title: "Fixed Deposit (FD) – Let Your Money Grow Safely",
    titleHi: "फिक्स्ड डिपॉजिट (FD) – अपने पैसे को सुरक्षित रूप से बढ़ने दें",
    category: "Banking",
    duration: "8:00",
    difficulty: "Beginner",
    views: "7.8k",
    langTag: "Hindi",
    module: "save-first-worry-less",
    orderInModule: 5,
    whyThisOrder: "Safe growth option after disciplined saving tools",
    youtube: [
      {
        id: "fd-beginners",
        title: "Fixed Deposit Explained for Beginners in Hindi",
        channel: "FinBaba",
        description: "Pros and cons of FDs, interest rates, and how to start.",
        duration: "8:00"
      },
      {
        id: "fd-guide",
        title: "FD Full Guide in Hindi (Interest, Risks)",
        channel: "Sagar Sinha",
        description: "Detailed guide to Fixed Deposits including tax implications.",
        duration: "9:00"
      },
    ],
    summaryEn: [
      "FD offers guaranteed fixed returns with low risk.",
      "Lump-sum deposit for fixed tenure with predetermined interest.",
      "Consider tax implications on interest income.",
    ],
    summaryHi: [
      "FD कम जोखिम के साथ गारंटीकृत निश्चित रिटर्न प्रदान करता है।",
      "पूर्व निर्धारित ब्याज के साथ निश्चित कार्यकाल के लिए एकमुश्त जमा।",
      "ब्याज आय पर कर प्रभावों पर विचार करें।",
    ],
    warningEn: "FD interest is taxable. Consider tax-saving FDs for better returns.",
    warningHi: "FD ब्याज कर योग्य है। बेहतर रिटर्न के लिए टैक्स-सेविंग FD पर विचार करें।",
    stepsEn: ["Compare bank FD rates.", "Choose tenure based on needs.", "Consider FD laddering for liquidity."],
    stepsHi: ["बैंक FD दरों की तुलना करें।", "आवश्यकताओं के आधार पर कार्यकाल चुनें।", "तरलता के लिए FD लैडरिंग पर विचार करें।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.25)_0%,transparent_55%),linear-gradient(135deg,#FEF3C7_0%,#FFFFFF_60%,#FFFBEB_100%)]",
  },
  {
    id: "post-office-rural",
    title: "Post Office vs Bank – Which Is Better for You?",
    titleHi: "पोस्ट ऑफिस बनाम बैंक – आपके लिए कौन सा बेहतर है?",
    category: "Banking",
    duration: "7:00",
    difficulty: "Beginner",
    views: "5.9k",
    langTag: "Hindi",
    module: "save-first-worry-less",
    orderInModule: 6,
    whyThisOrder: "Helps choose right institution based on location/needs",
    youtube: [
      {
        id: "post-office-vs-bank",
        title: "Post Office vs Bank Savings Account Comparison (Hindi)",
        channel: "FinBaba",
        description: "Full comparison of post office and bank savings options.",
        duration: "7:00"
      },
      {
        id: "which-better",
        title: "Which is Better: Post Office or Bank Savings? (Hindi)",
        channel: "Groww",
        description: "Quick pros and cons for rural and urban users.",
        duration: "6:00"
      },
    ],
    summaryEn: [
      "Post offices have wider reach in rural areas.",
      "Banks offer more digital services and ATMs.",
      "Compare interest rates, accessibility, and services.",
    ],
    summaryHi: [
      "पोस्ट ऑफिस का ग्रामीण क्षेत्रों में व्यापक पहुंच है।",
      "बैंक अधिक डिजिटल सेवाएं और एटीएम प्रदान करते हैं।",
      "ब्याज दरों, पहुंच और सेवाओं की तुलना करें।",
    ],
    warningEn: "Consider transaction costs, accessibility, and digital features before choosing.",
    warningHi: "चुनने से पहले लेनदेन लागत, पहुंच और डिजिटल सुविधाओं पर विचार करें।",
    stepsEn: ["Assess location and access needs.", "Compare interest rates.", "Check digital banking features."],
    stepsHi: ["स्थान और पहुंच आवश्यकताओं का आकलन करें।", "ब्याज दरों की तुलना करें।", "डिजिटल बैंकिंग सुविधाओं की जाँच करें।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.25)_0%,transparent_55%),linear-gradient(135deg,#FEE2E2_0%,#FFFFFF_60%,#FEF2F2_100%)]",
  },

  // Module 3: Grow Your Money Wisely
  {
    id: "investing-early",
    title: "What Is Investing & Why Start Now?",
    titleHi: "निवेश क्या है और अभी क्यों शुरू करें?",
    category: "Investing",
    duration: "9:00",
    difficulty: "Beginner",
    views: "10.2k",
    langTag: "Hindi",
    module: "grow-your-money-wisely",
    orderInModule: 1,
    whyThisOrder: "Foundation of investing mindset - importance of starting early",
    youtube: [
      {
        id: "investing-now",
        title: "What is Investing & Why Start Now? (Hindi)",
        channel: "Groww",
        description: "Motivational guide for 20s on why time is your biggest asset in investing.",
        duration: "9:00"
      },
      {
        id: "investing-kya-hai",
        title: "Investing Kya Hai? Simple Explanation in Hindi",
        channel: "True Investing",
        description: "Basic explanation of what investing means for beginners.",
        duration: "8:00"
      },
    ],
    summaryEn: [
      "Time is your biggest asset in investing through compounding.",
      "Starting early beats waiting for 'big money' to invest.",
      "Small regular investments can grow significantly over decades.",
    ],
    summaryHi: [
      "चक्रवृद्धि के माध्यम से निवेश में समय आपकी सबसे बड़ी संपत्ति है।",
      "निवेश करने के लिए 'बड़े पैसे' की प्रतीक्षा करने की तुलना में जल्दी शुरू करना बेहतर है।",
      "छोटे नियमित निवेश दशकों में काफी बढ़ सकते हैं।",
    ],
    warningEn: "Don't delay investing thinking you need large sums. Start small, start now.",
    warningHi: "यह सोचकर निवेश में देरी न करें कि आपको बड़ी रकम चाहिए। छोटी शुरुआत करें, अभी शुरू करें।",
    stepsEn: ["Understand your risk tolerance.", "Start with education before money.", "Set clear financial goals."],
    stepsHi: ["अपनी जोखिम सहनशीलता समझें।", "पैसे से पहले शिक्षा से शुरुआत करें।", "स्पष्ट वित्तीय लक्ष्य निर्धारित करें।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.25)_0%,transparent_55%),linear-gradient(135deg,#F5F3FF_0%,#FFFFFF_60%,#FAF5FF_100%)]",
  },
  {
    id: "mutual-funds-explained",
    title: "Mutual Funds Made Super Simple",
    titleHi: "म्यूचुअल फंड सुपर सरल बनाया गया",
    category: "Mutual Funds",
    duration: "11:00",
    difficulty: "Beginner",
    views: "12.5k",
    langTag: "Hindi",
    module: "grow-your-money-wisely",
    orderInModule: 2,
    whyThisOrder: "Introduces most accessible investment vehicle for beginners",
    youtube: [
      {
        id: "mf-simple",
        title: "Mutual Funds Explained Simply in Hindi",
        channel: "Asset Yogi",
        description: "Beginner guide to mutual funds as pooled investments managed by experts.",
        duration: "11:00"
      },
      {
        id: "mf-beginners",
        title: "What are Mutual Funds? (Hindi for Beginners)",
        channel: "Sanjay Kathuria",
        description: "Easy language explanation of mutual funds for complete beginners.",
        duration: "10:00"
      },
    ],
    summaryEn: [
      "Mutual funds are pooled investments managed by professionals.",
      "Diversified across stocks, bonds, or other assets.",
      "Suitable for beginners due to professional management.",
    ],
    summaryHi: [
      "म्यूचुअल फंड पेशेवरों द्वारा प्रबंधित पूल्ड निवेश हैं।",
      "स्टॉक, बॉन्ड या अन्य संपत्तियों में विविधतापूर्ण।",
      "पेशेवर प्रबंधन के कारण शुरुआती लोगों के लिए उपयुक्त।",
    ],
    warningEn: "Past performance doesn't guarantee future returns. Understand risk before investing.",
    warningHi: "पिछला प्रदर्शन भविष्य के रिटर्न की गारंटी नहीं देता। निवेश से पहले जोखिम समझें।",
    stepsEn: ["Learn about equity, debt, hybrid funds.", "Check expense ratios.", "Review fund manager track record."],
    stepsHi: ["इक्विटी, डेट, हाइब्रिड फंड के बारे में जानें।", "व्यय अनुपात की जाँच करें।", "फंड मैनेजर के ट्रैक रिकॉर्ड की समीक्षा करें।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.25)_0%,transparent_55%),linear-gradient(135deg,#ECFEFF_0%,#FFFFFF_60%,#F0F9FF_100%)]",
  },
  {
    id: "sip-meaning",
    title: "Start SIP with Just ₹500 – Step by Step",
    titleHi: "सिर्फ ₹500 से SIP शुरू करें – चरण दर चरण",
    category: "Mutual Funds",
    duration: "10:00",
    difficulty: "Beginner",
    views: "15.3k",
    langTag: "Hindi",
    module: "grow-your-money-wisely",
    orderInModule: 3,
    whyThisOrder: "Practical implementation after understanding mutual funds",
    youtube: [
      {
        id: "sip-step-by-step",
        title: "How to Start SIP with ₹500 Step by Step (Hindi)",
        channel: "Zerodha",
        description: "Tutorial on opening SIP, KYC, and first SIP setup with apps like Groww/Zerodha.",
        duration: "10:00"
      },
      {
        id: "sip-500",
        title: "Start SIP in Mutual Funds from ₹500 (Hindi)",
        channel: "Pushkar Raj Thakur",
        description: "Practical guide to starting SIP with small amounts.",
        duration: "9:00"
      },
    ],
    summaryEn: [
      "SIP allows regular small investments in mutual funds.",
      "Start with as little as ₹500 per month.",
      "Rupee cost averaging reduces risk over time.",
    ],
    summaryHi: [
      "SIP म्यूचुअल फंड में नियमित छोटे निवेश की अनुमति देता है।",
      "प्रति माह ₹500 जितनी कम राशि से शुरुआत करें।",
      "रुपये की लागत औसतन समय के साथ जोखिम को कम करती है।",
    ],
    warningEn: "SIPs don't guarantee profits. Market risks apply. Stay invested for long term.",
    warningHi: "SIP लाभ की गारंटी नहीं देते। बाजार जोखिम लागू होते हैं। लंबी अवधि के लिए निवेशित रहें।",
    stepsEn: ["Download investment app (Groww/Zerodha).", "Complete KYC.", "Choose fund and set up auto-debit."],
    stepsHi: ["निवेश ऐप डाउनलोड करें (Groww/Zerodha)।", "KYC पूरा करें।", "फंड चुनें और ऑटो-डेबिट सेट करें।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.25)_0%,transparent_55%),linear-gradient(135deg,#DCFCE7_0%,#FFFFFF_60%,#F0FDF4_100%)]",
  },
  {
    id: "gold-beginner",
    title: "Gold Investing for Beginners – Safe & Smart",
    titleHi: "शुरुआती लोगों के लिए सोने का निवेश – सुरक्षित और स्मार्ट",
    category: "Gold Investing",
    duration: "9:00",
    difficulty: "Beginner",
    views: "8.7k",
    langTag: "Hindi",
    module: "grow-your-money-wisely",
    orderInModule: 4,
    whyThisOrder: "Introduces safe investment option after equity exposure",
    youtube: [
      {
        id: "gold-beginners-guide",
        title: "Gold Investing for Beginners in Hindi",
        channel: "Ankur Warikoo",
        description: "Best ways to invest in gold beyond physical jewellery.",
        duration: "9:00"
      },
      {
        id: "gold-silver",
        title: "How to Invest in Gold & Silver (Hindi)",
        channel: "Ankur Warikoo",
        description: "Detailed guide to modern gold investment options.",
        duration: "8:00"
      },
    ],
    summaryEn: [
      "Gold is a safe hedge against inflation and market volatility.",
      "Modern options: Digital gold, Gold ETF, Sovereign Gold Bonds.",
      "Avoid storage and purity issues of physical gold.",
    ],
    summaryHi: [
      "सोना मुद्रास्फीति और बाजार की अस्थिरता के खिलाफ एक सुरक्षित हेज है।",
      "आधुनिक विकल्प: डिजिटल गोल्ड, गोल्ड ETF, सॉवरेन गोल्ड बॉन्ड।",
      "भौतिक सोने की भंडारण और शुद्धता समस्याओं से बचें।",
    ],
    warningEn: "Gold doesn't generate regular income. Allocate only 5-10% of portfolio to gold.",
    warningHi: "सोना नियमित आय उत्पन्न नहीं करता है। पोर्टफोलियो का केवल 5-10% सोने में आवंटित करें।",
    stepsEn: ["Open demat account for Gold ETFs.", "Compare Sovereign Gold Bond issues.", "Start with small allocation."],
    stepsHi: ["गोल्ड ETF के लिए डीमैट खाता खोलें।", "सॉवरेन गोल्ड बॉन्ड इश्यू की तुलना करें।", "छोटे आवंटन से शुरुआत करें।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.25)_0%,transparent_55%),linear-gradient(135deg,#FEF3C7_0%,#FFFFFF_60%,#FFFBEB_100%)]",
  },
  {
    id: "80c-max",
    title: "Tax-Saving Investments Under 80C",
    titleHi: "80C के तहत कर-बचत निवेश",
    category: "Tax Planning",
    duration: "11:00",
    difficulty: "Intermediate",
    views: "14.2k",
    langTag: "Hindi",
    module: "grow-your-money-wisely",
    orderInModule: 5,
    whyThisOrder: "Teaches tax efficiency - important for growing wealth",
    youtube: [
      {
        id: "80c-options",
        title: "Section 80C Tax Saving Options Explained in Hindi",
        channel: "Anil Singhvi",
        description: "Full list of 80C options with pros and cons.",
        duration: "11:00"
      },
      {
        id: "tax-saving",
        title: "Tax Saving Under 80C in Hindi",
        channel: "CA Sakchi Jain",
        description: "Deductions available under Section 80C.",
        duration: "10:00"
      },
    ],
    summaryEn: [
      "Save up to ₹1.5 lakh tax under Section 80C.",
      "Options: PPF, ELSS, NSC, life insurance, etc.",
      "Choose based on risk, returns, and lock-in period.",
    ],
    summaryHi: [
      "धारा 80C के तहत ₹1.5 लाख तक कर बचाएं।",
      "विकल्प: पीपीएफ, ईएलएसएस, एनएससी, जीवन बीमा, आदि।",
      "जोखिम, रिटर्न और लॉक-इन अवधि के आधार पर चुनें।",
    ],
    warningEn: "Don't invest only for tax saving. Consider returns and liquidity needs.",
    warningHi: "केवल कर बचत के लिए निवेश न करें। रिटर्न और तरलता आवश्यकताओं पर विचार करें।",
    stepsEn: ["List eligible 80C investments.", "Compare returns and lock-in periods.", "Allocate based on financial goals."],
    stepsHi: ["पात्र 80C निवेश सूचीबद्ध करें।", "रिटर्न और लॉक-इन अवधियों की तुलना करें।", "वित्तीय लक्ष्यों के आधार पर आवंटित करें।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.25)_0%,transparent_55%),linear-gradient(135deg,#DBEAFE_0%,#FFFFFF_60%,#E0E7FF_100%)]",
  },
  {
    id: "investing-mistake",
    title: "Common Mistakes to Avoid in First Investments",
    titleHi: "पहले निवेश में करने से बचने वाली आम गलतियाँ",
    category: "Investing",
    duration: "8:00",
    difficulty: "Beginner",
    views: "13.8k",
    langTag: "Hindi",
    module: "grow-your-money-wisely",
    orderInModule: 6,
    whyThisOrder: "Final lesson - helps avoid pitfalls after learning all concepts",
    youtube: [
      {
        id: "investing-mistakes",
        title: "Don't Make These 10 Investing Mistakes (Hindi)",
        channel: "Ankur Warikoo",
        description: "Common errors beginners make and how to avoid them.",
        duration: "8:00"
      },
      {
        id: "mf-mistakes",
        title: "Beginner Mutual Fund Mistakes (Hindi)",
        channel: "Labour Law Advisor",
        description: "Lessons learned from real investor stories.",
        duration: "7:00"
      },
    ],
    summaryEn: [
      "Don't chase high returns without understanding risk.",
      "Avoid panic selling during market dips.",
      "Stay consistent with investments regardless of market noise.",
    ],
    summaryHi: [
      "जोखिम को समझे बिना उच्च रिटर्न का पीछा न करें।",
      "बाजार में गिरावट के दौरान घबराहट में बेचने से बचें।",
      "बाजार के शोर की परवाह किए बिना निवेश के साथ सुसंगत रहें।",
    ],
    warningEn: "Emotional decisions are the biggest wealth destroyers. Stick to your plan.",
    warningHi: "भावनात्मक निर्णय सबसे बड़े धन विनाशक हैं। अपनी योजना से चिपके रहें।",
    stepsEn: ["Create an investment plan.", "Set realistic expectations.", "Review portfolio annually, not daily."],
    stepsHi: ["एक निवेश योजना बनाएं।", "यथार्थवादी अपेक्षाएं निर्धारित करें।", "पोर्टफोलियो की वार्षिक समीक्षा करें, दैनिक नहीं।"],
    thumbStyle: "bg-[radial-gradient(circle_at_30%_20%,rgba(239,68,68,0.25)_0%,transparent_55%),linear-gradient(135deg,#FEE2E2_0%,#FFFFFF_60%,#FEF2F2_100%)]",
  },
];

const DEFAULT_SAFETY_TIP = "Enable Two-Factor Authentication (2FA) on your UPI apps and email. It's the strongest shield against account takeovers.";

// Bilingual content for sidebar
const LEARN_TEXT = {
  hindi: {
    appName: "धनसाथी",
    home: "होम",
    schemes: "सरकारी योजनाएं",
    community: "समुदाय",
    learn: "सीखें",
    help: "सहायता",
    logout: "लॉग आउट",
    signin: "साइन इन",
    profile: "प्रोफाइल",
    settings: "सेटिंग्स",
    collapseSidebar: "साइडबार छोटा करें",
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
    profile: "Profile",
    settings: "Settings",
    collapseSidebar: "Collapse sidebar",
  },
};

export default function LearnScreen() {
  const navigate = useNavigate();
  const [mouse, setMouse] = useState({ x: 300, y: 200 });
  const [fbUser, setFbUser] = useState(null);
  const [profile, setProfile] = useState({});

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const menuRef = useRef(null);

  // User learning data
  const [saved, setSaved] = useState(() => readJSON(LS.saved, []));
  const [completed, setCompleted] = useState(() => new Set(readJSON(LS.completed, [])));
  const [moduleProgress, setModuleProgress] = useState(() => readJSON(LS.moduleProgress, {}));
  const [badges, setBadges] = useState(() => readJSON(LS.badges, []));
  const [quizScores, setQuizScores] = useState(() => readJSON(LS.quizScores, {}));
  const [points, setPoints] = useState(() => Number(localStorage.getItem(LS.points)) || 0);
  const [currentModuleId, setCurrentModuleId] = useState(() => {
    return localStorage.getItem(LS.currentModule) || MODULES[0].id;
  });

  // UI states
  const [summaryLang, setSummaryLang] = useState(() => {
    return localStorage.getItem(LS.learnLang) || "en";
  });
  const [ttsSpeed, setTtsSpeed] = useState(() => {
    const v = Number(localStorage.getItem(LS.ttsSpeed));
    return v && v > 0 ? v : 1.0;
  });
  const [activeCat, setActiveCat] = useState("All Topics");
  const [searchQuery, setSearchQuery] = useState("");
  const [openLesson, setOpenLesson] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [activeModule, setActiveModule] = useState(() => {
    return MODULES.find(m => m.id === currentModuleId) || MODULES[0];
  });
  const [videoPlayerOpen, setVideoPlayerOpen] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [currentQuiz, setCurrentQuiz] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizCorrect, setQuizCorrect] = useState(false);
  const [showModuleQuiz, setShowModuleQuiz] = useState(false);
  const [moduleQuizAnswers, setModuleQuizAnswers] = useState({});
  const [moduleQuizSubmitted, setModuleQuizSubmitted] = useState(false);
  const [voiceQuizActive, setVoiceQuizActive] = useState(false);
  const [voiceResponse, setVoiceResponse] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  // Language
  const userLanguage = localStorage.getItem("dhan-saathi-language") || "english";
  const [language, setLanguage] = useState(userLanguage);
  const t = LEARN_TEXT[language];

  // Calculate module progress
  const moduleLessons = LESSONS.filter(l => l.module === activeModule.id);
  const completedInModule = moduleLessons.filter(l => completed.has(l.id)).length;
  const moduleProgressPercentage = (completedInModule / activeModule.totalLessons) * 100;
  const isModuleComplete = completedInModule === activeModule.totalLessons;

  // Calculate total progress across all modules
  const totalLessons = LESSONS.length;
  const totalCompleted = Array.from(completed).length;
  const totalProgressPercentage = (totalCompleted / totalLessons) * 100;

  // Calculate module quiz score
  const moduleQuizScore = useMemo(() => {
    if (!moduleQuizSubmitted) return 0;
    let score = 0;
    moduleLessons.forEach(lesson => {
      const question = QUIZ_QUESTIONS[lesson.id];
      if (question && moduleQuizAnswers[lesson.id] === question.correct) {
        score++;
      }
    });
    return score;
  }, [moduleQuizAnswers, moduleQuizSubmitted, moduleLessons]);

  // Auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setFbUser(u || null);
    });
    return () => unsub();
  }, []);

  // Load user data from Firebase
  useEffect(() => {
    if (!fbUser) {
      // Use localStorage for guest users
      setProfile({});
      return;
    }

    const loadUserData = async () => {
      try {
        // Load user document
        const userDocRef = doc(db, "users", fbUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (userDocSnap.exists()) {
          const data = userDocSnap.data();
          setProfile(data.profile || {});
          
          // Load learning data from user subcollection
          const learningRef = doc(collection(userDocRef, "learning"), "progress");
          const learningSnap = await getDoc(learningRef);
          
          if (learningSnap.exists()) {
            const learningData = learningSnap.data();
            
            // Load saved lessons
            if (learningData.savedLessons) {
              setSaved(learningData.savedLessons);
              localStorage.setItem(LS.saved, JSON.stringify(learningData.savedLessons));
            }
            
            // Load completed lessons
            if (learningData.completedLessons) {
              const completedSet = new Set(learningData.completedLessons);
              setCompleted(completedSet);
              localStorage.setItem(LS.completed, JSON.stringify(Array.from(completedSet)));
            }
            
            // Load module progress
            if (learningData.moduleProgress) {
              setModuleProgress(learningData.moduleProgress);
              localStorage.setItem(LS.moduleProgress, JSON.stringify(learningData.moduleProgress));
            }
            
            // Load badges
            if (learningData.badges) {
              setBadges(learningData.badges);
              localStorage.setItem(LS.badges, JSON.stringify(learningData.badges));
            }
            
            // Load quiz scores
            if (learningData.quizScores) {
              setQuizScores(learningData.quizScores);
              localStorage.setItem(LS.quizScores, JSON.stringify(learningData.quizScores));
            }
            
            // Load points
            if (learningData.points) {
              setPoints(learningData.points);
              localStorage.setItem(LS.points, String(learningData.points));
            }
            
            // Load current module
            if (learningData.currentModule) {
              setCurrentModuleId(learningData.currentModule);
              localStorage.setItem(LS.currentModule, learningData.currentModule);
              const module = MODULES.find(m => m.id === learningData.currentModule);
              if (module) setActiveModule(module);
            }
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();
  }, [fbUser]);

  // Persist data to Firebase
  const saveToFirebase = async (key, data) => {
    if (!fbUser) return;

    try {
      const userDocRef = doc(db, "users", fbUser.uid);
      const learningRef = doc(collection(userDocRef, "learning"), "progress");
      
      await setDoc(learningRef, {
        [key]: data,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      console.error("Error saving to Firebase:", error);
    }
  };

  // Save updated learning data
  useEffect(() => {
    if (fbUser && saved.length > 0) {
      saveToFirebase(FB_KEYS.SAVED, saved);
    }
  }, [saved, fbUser]);

  useEffect(() => {
    if (fbUser && completed.size > 0) {
      saveToFirebase(FB_KEYS.COMPLETED, Array.from(completed));
      
      // Update module progress
      const updatedModuleProgress = {
        ...moduleProgress,
        [activeModule.id]: {
          completedLessons: completedInModule,
          totalLessons: activeModule.totalLessons,
          lastUpdated: new Date().toISOString(),
          isComplete: isModuleComplete,
        }
      };
      
      setModuleProgress(updatedModuleProgress);
      saveToFirebase(FB_KEYS.MODULE_PROGRESS, updatedModuleProgress);
      
      // Award badge if module is complete
      if (isModuleComplete && !badges.includes(activeModule.badgeUnlocked)) {
        const newBadges = [...badges, activeModule.badgeUnlocked];
        setBadges(newBadges);
        saveToFirebase(FB_KEYS.BADGES, newBadges);
      }
    }
  }, [completed, fbUser, activeModule.id, completedInModule]);

  useEffect(() => {
    if (fbUser) {
      saveToFirebase(FB_KEYS.QUIZ_SCORES, quizScores);
      saveToFirebase(FB_KEYS.POINTS, points);
      saveToFirebase(FB_KEYS.CURRENT_MODULE, currentModuleId);
    }
  }, [quizScores, points, currentModuleId, fbUser]);

  // Persist local storage
  useEffect(() => {
    localStorage.setItem(LS.saved, JSON.stringify(saved));
  }, [saved]);

  useEffect(() => {
    localStorage.setItem(LS.completed, JSON.stringify(Array.from(completed)));
  }, [completed]);

  useEffect(() => {
    localStorage.setItem(LS.ttsSpeed, String(ttsSpeed));
  }, [ttsSpeed]);

  useEffect(() => {
    localStorage.setItem(LS.learnLang, summaryLang);
  }, [summaryLang]);

  useEffect(() => {
    localStorage.setItem(LS.moduleProgress, JSON.stringify(moduleProgress));
  }, [moduleProgress]);

  useEffect(() => {
    localStorage.setItem(LS.badges, JSON.stringify(badges));
  }, [badges]);

  useEffect(() => {
    localStorage.setItem(LS.quizScores, JSON.stringify(quizScores));
  }, [quizScores]);

  useEffect(() => {
    localStorage.setItem(LS.points, String(points));
  }, [points]);

  useEffect(() => {
    localStorage.setItem(LS.currentModule, currentModuleId);
  }, [currentModuleId]);

  // Close mobile sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setMobileSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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

  const appLang = localStorage.getItem("dhan-saathi-language") || "english";
  const ttsLang = appLang === "hindi" ? "hi-IN" : "en-IN";

  const displayName = fbUser?.displayName || profile?.name || "Guest";
  const email = fbUser?.email || "";
  const initials = useMemo(() => {
    const src = (displayName || email || "U").trim();
    const parts = src.split(" ").filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (src[0] || "U").toUpperCase();
  }, [displayName, email]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(LESSONS.map((l) => l.category)));
    return ["All Topics", "Scam Safety", "Budgeting", "Savings", "Mutual Funds", "Gold Investing", "UPI & Digital Payments", "Emergency Fund", "Banking", "Investing", "Tax Planning"];
  }, []);

  const lessons = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return LESSONS.filter((l) => {
      const matchCat = activeCat === "All Topics" ? true : l.category === activeCat;
      const matchQ =
        !q ||
        l.title.toLowerCase().includes(q) ||
        l.category.toLowerCase().includes(q) ||
        (l.summaryEn || []).join(" ").toLowerCase().includes(q) ||
        (l.summaryHi || []).join(" ").toLowerCase().includes(q);
      return matchCat && matchQ;
    }).sort((a, b) => a.orderInModule - b.orderInModule);
  }, [activeCat, searchQuery]);

  const totalCount = LESSONS.length;
  const doneCount = completed.size;
  const pct = Math.min(100, Math.round((doneCount / Math.max(1, totalCount)) * 100));

  const savedLessons = saved
    .map((id) => LESSONS.find((l) => l.id === id))
    .filter(Boolean);

  const speak = (text) => {
    try {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = ttsLang;
      msg.rate = ttsSpeed;
      window.speechSynthesis.speak(msg);
    } catch {
      // ignore
    }
  };

  const speakQuizQuestion = (questionData) => {
    const appLang = localStorage.getItem("dhan-saathi-language") || "english";
    const questionText = appLang === "hindi" ? questionData.questionHi : questionData.question;
    const optionsText = questionData.options.map(opt => 
      `${opt.id}: ${appLang === "hindi" ? opt.textHi : opt.text}`
    ).join(". ");
    
    speak(`${questionText}. ${optionsText}. Please say A, B, C, or D.`);
  };

  const startVoiceQuiz = () => {
    if (!currentQuiz) return;
    
    setVoiceQuizActive(true);
    speakQuizQuestion(currentQuiz);
    
    // Start speech recognition (simplified version)
    const recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (recognition) {
      const rec = new recognition();
      rec.lang = ttsLang;
      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim().toUpperCase();
        setVoiceResponse(transcript);
        
        // Check if response is A, B, C, or D
        if (['A', 'B', 'C', 'D'].includes(transcript)) {
          handleQuizSubmit(transcript);
          setVoiceQuizActive(false);
        } else {
          speak("Sorry, I didn't understand. Please say A, B, C, or D.");
        }
      };
      
      rec.start();
    } else {
      // Fallback if speech recognition not available
      speak("Voice quiz not supported on this device. Please use the text options.");
      setVoiceQuizActive(false);
    }
  };

  const speakLesson = (lesson) => {
    const summary = summaryLang === "hi" ? lesson.summaryHi : lesson.summaryEn;
    const warning = summaryLang === "hi" ? lesson.warningHi : lesson.warningEn;
    const steps = summaryLang === "hi" ? lesson.stepsHi : lesson.stepsEn;

    const parts = [
      lesson.title,
      "Summary:",
      ...(summary || []),
      warning ? `Key warning: ${warning}` : "",
      steps?.length ? `Steps: ${steps.join(". ")}` : "",
    ].filter(Boolean);

    speak(parts.join(". "));
  };

  const toggleSave = async (id) => {
    const newSaved = saved.includes(id) ? saved.filter((x) => x !== id) : [...saved, id];
    setSaved(newSaved);
    
    if (fbUser) {
      await saveToFirebase(FB_KEYS.SAVED, newSaved);
    }
  };

  const markCompleted = async (id) => {
    const newCompleted = new Set(completed);
    newCompleted.add(id);
    setCompleted(newCompleted);
    
    if (fbUser) {
      await saveToFirebase(FB_KEYS.COMPLETED, Array.from(newCompleted));
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/signup", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      alert("Logout failed");
    }
  };

  const openYouTubeVideo = (videoId, lesson) => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, '_blank');
    // Auto-mark as completed after watching external video
    setTimeout(() => {
      markCompleted(lesson.id);
    }, 30000); // Mark as completed after 30 seconds (simulating video watch)
  };

  const startModuleLearning = () => {
    if (moduleLessons.length > 0) {
      setCurrentVideoIndex(0);
      setVideoPlayerOpen(true);
    }
  };

  const handleNextVideo = () => {
    if (currentVideoIndex < moduleLessons.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
      
      // Show quiz after video ends
      const currentLessonId = moduleLessons[currentVideoIndex].id;
      if (QUIZ_QUESTIONS[currentLessonId]) {
        setTimeout(() => {
          startQuizForLesson(currentLessonId);
        }, 500);
      }
    } else {
      // Module complete
      setVideoPlayerOpen(false);
      
      // Show module quiz
      setTimeout(() => {
        setShowModuleQuiz(true);
      }, 1000);
    }
  };

  const handlePreviousVideo = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  const getCurrentVideo = () => {
    const lesson = moduleLessons[currentVideoIndex];
    if (lesson && lesson.youtube && lesson.youtube.length > 0) {
      return lesson.youtube[0];
    }
    return null;
  };

  const shareCertificate = () => {
    const message = `I just completed the "${activeModule.titleEn}" module on DhanSaathi! 🎉 Learned about financial safety, budgeting, saving, and smart investing. #FinancialLiteracy #DhanSaathi`;
    const url = encodeURIComponent(window.location.href);
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  // Quiz Functions
  const startQuizForLesson = (lessonId) => {
    const quizData = QUIZ_QUESTIONS[lessonId];
    if (quizData) {
      setCurrentQuiz(quizData);
      setShowQuiz(true);
      setSelectedAnswer(null);
      setQuizSubmitted(false);
      setQuizCorrect(false);
    }
  };

  const handleQuizSubmit = (answer) => {
    if (!currentQuiz || quizSubmitted) return;
    
    setSelectedAnswer(answer);
    setQuizSubmitted(true);
    
    const isCorrect = answer === currentQuiz.correct;
    setQuizCorrect(isCorrect);
    
    // Update points
    if (isCorrect) {
      const newPoints = points + currentQuiz.points;
      setPoints(newPoints);
      
      // Update quiz scores
      const newQuizScores = {
        ...quizScores,
        [moduleLessons[currentVideoIndex].id]: {
          score: currentQuiz.points,
          correct: true,
          date: new Date().toISOString()
        }
      };
      setQuizScores(newQuizScores);
      
      speak("Correct! Well done!");
    } else {
      speak("Good try! Let's review the key points.");
    }
  };

  const handleNextQuiz = () => {
    setShowQuiz(false);
    setCurrentQuiz(null);
    setSelectedAnswer(null);
    setQuizSubmitted(false);
    
    // Automatically mark lesson as completed after quiz
    const currentLessonId = moduleLessons[currentVideoIndex].id;
    if (!completed.has(currentLessonId)) {
      markCompleted(currentLessonId);
    }
    
    // Move to next video if in video player
    if (videoPlayerOpen) {
      setTimeout(() => {
        handleNextVideo();
      }, 500);
    }
  };

  const handleModuleQuizSubmit = () => {
    setModuleQuizSubmitted(true);
    
    // Calculate score and award points
    let correctCount = 0;
    moduleLessons.forEach(lesson => {
      const question = QUIZ_QUESTIONS[lesson.id];
      if (question && moduleQuizAnswers[lesson.id] === question.correct) {
        correctCount++;
      }
    });
    
    // Award points for correct answers
    const pointsEarned = correctCount * 10;
    setPoints(points + pointsEarned);
    
    // Update quiz scores
    const newQuizScores = { ...quizScores };
    moduleLessons.forEach(lesson => {
      const question = QUIZ_QUESTIONS[lesson.id];
      if (question) {
        newQuizScores[lesson.id] = {
          score: moduleQuizAnswers[lesson.id] === question.correct ? 10 : 0,
          correct: moduleQuizAnswers[lesson.id] === question.correct,
          date: new Date().toISOString()
        };
      }
    });
    setQuizScores(newQuizScores);
    
    // Award badge based on score
    if (correctCount >= 5) {
      if (!badges.includes(activeModule.badgeUnlocked)) {
        const newBadges = [...badges, activeModule.badgeUnlocked];
        setBadges(newBadges);
        saveToFirebase(FB_KEYS.BADGES, newBadges);
      }
    }
  };

  const handleModuleQuizAnswer = (lessonId, answer) => {
    setModuleQuizAnswers({
      ...moduleQuizAnswers,
      [lessonId]: answer
    });
  };

  const retakeModuleQuiz = () => {
    setModuleQuizAnswers({});
    setModuleQuizSubmitted(false);
  };

  const closeModuleQuiz = () => {
    setShowModuleQuiz(false);
    setModuleQuizAnswers({});
    setModuleQuizSubmitted(false);
    
    // Show certificate if module is complete
    if (isModuleComplete) {
      setTimeout(() => {
        setShowCertificate(true);
      }, 500);
    }
  };

  const handleModuleChange = (moduleId) => {
    setCurrentModuleId(moduleId);
    const module = MODULES.find(m => m.id === moduleId);
    if (module) {
      setActiveModule(module);
    }
  };

  const getModuleIcon = (module) => {
    switch (module.icon) {
      case "PiggyBank":
        return <PiggyBank className="h-6 w-6 text-white" />;
      case "TrendingUp":
        return <TrendingUpIcon className="h-6 w-6 text-white" />;
      case "ShieldRupee":
      default:
        return (
          <div className="relative">
            <Shield className="h-6 w-6 text-white" />
            <IndianRupee className="h-4 w-4 text-white absolute -bottom-1 -right-1" />
          </div>
        );
    }
  };

  const getAccentColorClass = (module) => {
    switch (module.accentColor) {
      case "blue":
        return "from-blue-600 to-blue-500";
      case "purple":
        return "from-purple-600 to-indigo-500";
      case "emerald":
      default:
        return "from-emerald-600 to-green-500";
    }
  };

  const getAccentBgClass = (module) => {
    switch (module.accentColor) {
      case "blue":
        return "bg-blue-50 border-blue-200 text-blue-900";
      case "purple":
        return "bg-purple-50 border-purple-200 text-purple-900";
      case "emerald":
      default:
        return "bg-emerald-50 border-emerald-200 text-emerald-900";
    }
  };

  // Navigation helpers
  const goHome = () => navigate("/home");
  const goToSchemes = () => navigate("/schemes");
  const goToCommunity = () => navigate("/community");
  const goToLearn = () => navigate("/learn");
  const goToHelp = () => navigate("/help");
  const goToProfile = () => navigate("/profile");

  // Toggle language
  const toggleLanguage = () => {
    const newLang = language === "hindi" ? "english" : "hindi";
    setLanguage(newLang);
    localStorage.setItem("dhan-saathi-language", newLang);
  };

  // Sidebar nav items
  const sidebarNavItems = [
    { label: t.home, icon: Home, onClick: goHome },
    { label: t.schemes, icon: Building2, onClick: goToSchemes },
    { label: t.community, icon: Sparkle, onClick: goToCommunity },
    { label: t.learn, icon: BookOpen, onClick: goToLearn, active: true },
    { label: t.help, icon: HelpCircle, onClick: goToHelp },
  ];

  const sidebarBottomItems = [
    {
      label: t.profile,
      icon: UserCog,
      onClick: goToProfile,
    },
    {
      label: language === "hindi" ? "भाषा बदलें" : "Language",
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
          {collapsed ? "—" : language === "hindi" ? "मुख्य मेनू" : "Main Menu"}
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
          {collapsed
            ? "—"
            : language === "hindi"
            ? "अन्य"
            : "Others"}
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
          title={t.collapseSidebar}
        >
          <ChevronLeft
            className={`h-5 w-5 flex-shrink-0 transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
          {!collapsed && (
            <span>
              {language === "hindi" ? "छोटा करें" : "Collapse"}
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
          0% { transform: translateX(-50%); opacity: 0; }
          20% { opacity: 0.22; }
          60% { opacity: 0.22; }
          100% { transform: translateX(150%); opacity: 0; }
        }
        @keyframes floaty {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(12px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(34, 197, 94, 0.3); }
          50% { box-shadow: 0 0 40px rgba(34, 197, 94, 0.6); }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .youtube-thumbnail {
          background-size: cover;
          background-position: center;
          transition: all 0.3s ease;
        }
        .youtube-thumbnail:hover {
          transform: scale(1.02);
        }
        .progress-ring {
          transform: rotate(-90deg);
        }
        .progress-ring-circle {
          transition: stroke-dashoffset 0.5s ease;
        }
        .option-selected {
          transform: scale(1.02);
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
                    {t.learn}
                  </h1>
                  <p className="text-xs text-gray-500 hidden sm:block">
                    {language === "hindi"
                      ? "वित्तीय साक्षरता सीखें"
                      : "Learn Financial Literacy"}
                  </p>
                </div>
              </div>

              {/* Right: lang + notification + profile */}
              <div className="flex items-center gap-3">
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

                {/* Points Display */}
                <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-yellow-100 border border-amber-200">
                  <div className="h-6 w-6 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 grid place-items-center">
                    <Star className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-bold text-amber-800">{points} pts</span>
                </div>

                <button
                  type="button"
                  className="h-10 w-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 hover:bg-gray-50 transition relative"
                  onClick={() =>
                    alert(
                      language === "hindi"
                        ? "जल्द ही आ रहा है"
                        : "Notifications coming soon"
                    )
                  }
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
                      <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                          {doneCount} lessons
                        </span>
                        <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded-full">
                          {points} points
                        </span>
                        {badges.length > 0 && (
                          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">
                            {badges.length} badge{badges.length !== 1 ? 's' : ''}
                          </span>
                        )}
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
                      {language === "hindi" ? "प्रोफाइल देखें" : "View Profile"}
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
          <main
            className="flex-1 overflow-y-auto"
            onMouseMove={(e) => setMouse({ x: e.clientX, y: e.clientY })}
          >
            <div
              className="min-h-full relative"
              style={{
                backgroundImage: `
                  radial-gradient(800px circle at ${mouse.x}px ${mouse.y}px, rgba(16,185,129,0.08), transparent 42%),
                  radial-gradient(circle at top left, rgba(187,247,208,0.35) 0, transparent 55%),
                  radial-gradient(circle at bottom right, rgba(191,219,254,0.3) 0, transparent 55%)
                `,
              }}
            >
              {/* Blobs */}
              <div className="pointer-events-none absolute -top-48 -left-48 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(34,197,94,0.25)_0%,rgba(16,185,129,0.08)_38%,transparent_70%)] blur-3xl opacity-90 mix-blend-multiply animate-[blobA_18s_ease-in-out_infinite]" />
              <div className="pointer-events-none absolute top-[25%] -right-56 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(16,185,129,0.20)_0%,rgba(59,130,246,0.08)_42%,transparent_72%)] blur-3xl opacity-80 mix-blend-multiply animate-[blobB_22s_ease-in-out_infinite]" />

              <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
                {/* Header */}
                <div className="relative overflow-hidden rounded-3xl bg-white/85 backdrop-blur-xl border border-emerald-200 shadow-[0_28px_80px_rgba(15,23,42,0.12)] p-6 sm:p-8 mb-8">
                  {/* Sheen overlay */}
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -inset-y-10 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-xl animate-[sheen_8s_ease-in-out_infinite]" />
                  </div>

                  <div className="relative flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                    <div>
                      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                        Learn Financial Basics
                      </h1>
                      <p className="text-gray-600 mt-2 max-w-2xl">
                        Master money management with curated lessons across {MODULES.length} modules. {fbUser ? "Your progress syncs across devices." : "Sign in to save your progress."}
                      </p>
                      
                      <div className="mt-4 flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <User className="h-5 w-5 text-emerald-600" />
                          <span className="text-sm font-medium text-gray-700">{displayName}</span>
                        </div>
                        <div className="h-4 w-px bg-gray-300" />
                        <div className="flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-emerald-600" />
                          <span className="text-sm font-medium text-gray-700">{doneCount}/{totalCount} completed</span>
                        </div>
                        <div className="h-4 w-px bg-gray-300" />
                        <div className="flex items-center gap-2">
                          <Star className="h-5 w-5 text-amber-500" />
                          <span className="text-sm font-medium text-gray-700">{points} points</span>
                        </div>
                        {badges.length > 0 && (
                          <>
                            <div className="h-4 w-px bg-gray-300" />
                            <div className="flex items-center gap-2">
                              <Award className="h-5 w-5 text-yellow-600" />
                              <span className="text-sm font-medium text-gray-700">{badges.length} badge{badges.length !== 1 ? 's' : ''}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-600">
                          <span className="font-semibold text-gray-900">{doneCount}/{totalCount}</span> completed
                        </span>
                        <div className="h-2 w-36 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-2 bg-gradient-to-r from-emerald-600 to-green-500 rounded-full transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      
                      {fbUser && (
                        <div className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          🔄 Synced to cloud
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* MODULES SELECTOR */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Available Modules</h2>
                    <span className="text-sm text-gray-600">{MODULES.length} modules • All free</span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {MODULES.map((module, index) => {
                      const isActive = activeModule.id === module.id;
                      const moduleProgressData = moduleProgress[module.id] || { completedLessons: 0 };
                      const progressPercentage = (moduleProgressData.completedLessons / module.totalLessons) * 100;
                      const moduleLessonsCount = LESSONS.filter(l => l.module === module.id).length;
                      const completedInThisModule = moduleLessonsCount > 0 ? 
                        moduleLessons.filter(l => completed.has(l.id)).length : 0;
                      
                      return (
                        <button
                          key={module.id}
                          type="button"
                          onClick={() => handleModuleChange(module.id)}
                          className={`relative overflow-hidden rounded-2xl border p-5 text-left transition-all hover:-translate-y-1 ${isActive ? 'border-emerald-300 bg-white shadow-lg' : 'border-gray-200 bg-white/70 hover:border-emerald-200 hover:shadow-md'}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`h-14 w-14 rounded-xl bg-gradient-to-br ${getAccentColorClass(module)} border ${isActive ? 'border-white' : 'border-gray-200'} shadow flex items-center justify-center`}>
                              {getModuleIcon(module)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className={`text-xs font-bold px-2 py-1 rounded-full ${getAccentBgClass(module)}`}>
                                  {appLang === 'hindi' ? module.badgeHi : module.badge}
                                </span>
                                <span className="text-xs text-gray-500">
                                  {completedInThisModule}/{module.totalLessons}
                                </span>
                              </div>
                              
                              <h3 className="font-bold text-gray-900 mt-2">
                                {appLang === 'hindi' ? module.titleHi : module.titleEn}
                              </h3>
                              
                              <div className="mt-2 flex items-center gap-3 text-xs text-gray-600">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> ~{module.totalDuration} min
                                </span>
                                <span>•</span>
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3 text-amber-500" /> {module.pointsToEarn} pts
                                </span>
                                {module.isFree && (
                                  <>
                                    <span>•</span>
                                    <span className="text-emerald-700 font-semibold">FREE</span>
                                  </>
                                )}
                              </div>
                              
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-gray-600">Progress</span>
                                  <span className="font-semibold text-emerald-700">{progressPercentage.toFixed(0)}%</span>
                                </div>
                                <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div 
                                    className="h-1.5 rounded-full transition-all"
                                    style={{ 
                                      width: `${progressPercentage}%`,
                                      background: `linear-gradient(to right, ${module.accentColor === 'blue' ? '#3b82f6' : module.accentColor === 'purple' ? '#8b5cf6' : '#10b981'}, ${module.accentColor === 'blue' ? '#60a5fa' : module.accentColor === 'purple' ? '#a78bfa' : '#34d399'})`
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {isActive && (
                            <div className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-emerald-500 border border-white" />
                          )}
                          
                          {module.isFeatured && (
                            <div className="absolute -top-2 -left-2 px-2 py-1 rounded-md bg-gradient-to-r from-amber-500 to-yellow-500 text-xs font-bold text-white">
                              Featured
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* ACTIVE MODULE DETAILS */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-50 via-blue-50 to-cyan-100 border border-emerald-200 shadow-[0_28px_80px_rgba(15,23,42,0.15)] p-6 sm:p-8 mb-8">
                  <div className="pointer-events-none absolute inset-0">
                    <div className="absolute -inset-y-10 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent blur-xl animate-[sheen_10s_ease-in-out_infinite]" />
                  </div>

                  <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-3 mb-4">
                        <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${getAccentColorClass(activeModule)} border ${activeModule.accentColor === 'emerald' ? 'border-emerald-300' : activeModule.accentColor === 'blue' ? 'border-blue-300' : 'border-purple-300'} shadow-lg grid place-items-center`}>
                          {getModuleIcon(activeModule)}
                        </div>
                        <div>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full ${getAccentBgClass(activeModule)} text-xs font-bold`}>
                            {appLang === 'hindi' ? activeModule.badgeHi : activeModule.badge}
                          </span>
                          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-2">
                            {appLang === 'hindi' ? activeModule.titleHi : activeModule.titleEn}
                          </h2>
                        </div>
                      </div>

                      <p className="text-gray-700 mb-6">
                        {appLang === 'hindi' ? activeModule.descriptionHi : activeModule.descriptionEn}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-xl bg-white/80 backdrop-blur border border-gray-200 grid place-items-center">
                            <Target className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{activeModule.totalLessons} Lessons</p>
                            <p className="text-xs text-gray-600">Step-by-step curriculum</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-xl bg-white/80 backdrop-blur border border-gray-200 grid place-items-center">
                            <HelpCircle className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{activeModule.totalLessons} Quizzes</p>
                            <p className="text-xs text-gray-600">Test your knowledge</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-xl bg-white/80 backdrop-blur border border-gray-200 grid place-items-center">
                            <Clock className="h-5 w-5 text-emerald-600" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">~{activeModule.totalDuration} min</p>
                            <p className="text-xs text-gray-600">Total duration</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-10 w-10 rounded-xl bg-white/80 backdrop-blur border border-gray-200 grid place-items-center">
                            <Star className="h-5 w-5 text-amber-500" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{activeModule.pointsToEarn} Points</p>
                            <p className="text-xs text-gray-600">Available to earn</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={startModuleLearning}
                          className={`px-6 py-3 rounded-full bg-gradient-to-r ${getAccentColorClass(activeModule)} text-white font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center gap-2 animate-pulseGlow`}
                        >
                          {completedInModule > 0 ? 'Continue Learning' : 'Start Learning'} 
                          <ArrowRight className="h-5 w-5" />
                        </button>
                        {isModuleComplete && (
                          <button
                            type="button"
                            onClick={() => setShowModuleQuiz(true)}
                            className="px-6 py-3 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center gap-2"
                          >
                            Take Final Quiz
                          </button>
                        )}
                        {activeModule.id === "grow-your-money-wisely" && isModuleComplete && (
                          <div className="px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-300 text-purple-800 text-sm font-bold">
                            🎉 Last Free Module Completed!
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className="relative h-48 w-48">
                        <svg viewBox="0 0 120 120" className="h-full w-full progress-ring">
                          <circle cx="60" cy="60" r="46" stroke="#E5E7EB" strokeWidth="12" fill="none" />
                          <circle
                            cx="60"
                            cy="60"
                            r="46"
                            stroke={activeModule.accentColor === 'blue' ? '#3b82f6' : activeModule.accentColor === 'purple' ? '#8b5cf6' : '#10B981'}
                            strokeWidth="12"
                            fill="none"
                            strokeLinecap="round"
                            className="progress-ring-circle"
                            strokeDasharray={2 * Math.PI * 46}
                            strokeDashoffset={2 * Math.PI * 46 * (1 - moduleProgressPercentage / 100)}
                            style={{ transition: "stroke-dashoffset 600ms ease" }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <p className="text-3xl font-extrabold text-gray-900">
                            {completedInModule}/{activeModule.totalLessons}
                          </p>
                          <p className="text-sm text-gray-600 font-semibold">LESSONS DONE</p>
                          <p className="text-xs text-emerald-600 mt-2 font-bold">
                            {moduleProgressPercentage.toFixed(0)}% Complete
                          </p>
                        </div>
                      </div>
                      {isModuleComplete && badges.includes(activeModule.badgeUnlocked) && (
                        <div className="mt-4 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-300 flex items-center gap-2">
                          <Award className="h-4 w-4 text-yellow-700" />
                          <span className="text-sm font-bold text-yellow-800">
                            {appLang === 'hindi' ? activeModule.badgeUnlockedHi : activeModule.badgeUnlocked} Unlocked!
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Categories + Search */}
                <div className="mt-6 flex flex-col lg:flex-row lg:items-center gap-3">
                  <div className="flex flex-wrap gap-2">
                    {categories.slice(0, 8).map((c) => {
                      const active = activeCat === c;
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setActiveCat(c)}
                          className={
                            active
                              ? "px-4 py-2 rounded-full bg-gradient-to-r from-emerald-600 to-green-500 text-white text-sm font-semibold shadow-sm hover:shadow-md transition-shadow"
                              : "px-4 py-2 rounded-full bg-white/75 backdrop-blur border border-gray-200 text-sm text-gray-700 hover:border-emerald-300 hover:text-emerald-700 transition-all hover:-translate-y-0.5"
                          }
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex-1" />

                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/85 backdrop-blur border border-gray-200 shadow-sm w-full lg:w-[360px] hover:shadow-md transition-shadow">
                    <Search className="h-4 w-4 text-gray-400" />
                    <input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search lessons..."
                      className="bg-transparent outline-none text-sm text-gray-700 flex-1"
                    />
                  </div>
                </div>

                {/* Main grid */}
                <div className="mt-6 grid gap-6 lg:grid-cols-[2.1fr,1fr]">
                  {/* LEFT */}
                  <section className="space-y-6">
                    {/* Module Curriculum */}
                    <div className="relative overflow-hidden rounded-3xl bg-white/85 backdrop-blur border border-gray-200 shadow-[0_28px_80px_rgba(15,23,42,0.08)] p-6">
                      <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -inset-y-10 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-xl animate-[sheen_8s_ease-in-out_infinite]" />
                      </div>

                      <div className="relative flex items-center justify-between mb-6">
                        <div>
                          <p className="text-sm font-bold text-emerald-700 uppercase tracking-wide">MODULE CURRICULUM</p>
                          <h3 className="text-xl font-extrabold text-gray-900 mt-1">
                            {appLang === 'hindi' ? "पाठ्यक्रम की रूपरेखा" : "Course Outline"} • {activeModule.titleEn}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-600">
                            {completedInModule} of {activeModule.totalLessons} completed
                          </span>
                          <div className="h-2 w-20 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-2 bg-gradient-to-r from-emerald-600 to-green-500 rounded-full transition-all"
                              style={{ width: `${moduleProgressPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        {moduleLessons.map((lesson, index) => {
                          const isCompleted = completed.has(lesson.id);
                          const isCurrent = currentVideoIndex === index;
                          const quizData = QUIZ_QUESTIONS[lesson.id];
                          const quizScore = quizScores[lesson.id];
                          
                          return (
                            <div
                              key={lesson.id}
                              className={`group rounded-2xl border ${isCompleted ? 'border-emerald-200 bg-emerald-50/50' : isCurrent ? 'border-emerald-300 bg-white' : 'border-gray-200 bg-white/70'} p-4 hover:shadow-md transition-all hover:-translate-y-0.5`}
                            >
                              <div className="flex items-start gap-4">
                                <div className="relative">
                                  <div className={`h-12 w-12 rounded-xl border ${isCompleted ? 'border-emerald-300 bg-emerald-100' : 'border-gray-300 bg-gray-100'} grid place-items-center`}>
                                    {isCompleted ? (
                                      <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                                    ) : (
                                      <span className="text-lg font-bold text-gray-700">{index + 1}</span>
                                    )}
                                  </div>
                                  {index < moduleLessons.length - 1 && (
                                    <div className={`absolute top-12 left-1/2 h-8 w-0.5 ${isCompleted ? 'bg-emerald-300' : 'bg-gray-300'}`} />
                                  )}
                                </div>
                                
                                <div className="flex-1">
                                  <div className="flex items-start justify-between">
                                    <div>
                                      <h4 className="font-semibold text-gray-900">
                                        {appLang === 'hindi' && lesson.titleHi ? lesson.titleHi : lesson.title}
                                      </h4>
                                      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                                        <span className="flex items-center gap-1">
                                          <Clock className="h-3 w-3" /> {lesson.duration}
                                        </span>
                                        <span>•</span>
                                        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                          {lesson.difficulty}
                                        </span>
                                        <span>•</span>
                                        <span>{lesson.views}</span>
                                        {quizScore && (
                                          <>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                              <Star className="h-3 w-3 text-amber-500" /> {quizScore.score} pts
                                            </span>
                                          </>
                                        )}
                                      </div>
                                      {lesson.whyThisOrder && (
                                        <p className="text-xs text-gray-600 mt-2 italic">{lesson.whyThisOrder}</p>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      {isCompleted && (
                                        <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                                          <CheckCircle2 className="h-3 w-3" /> Done
                                        </span>
                                      )}
                                      {quizData && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setCurrentQuiz(quizData);
                                            setShowQuiz(true);
                                          }}
                                          className="px-3 py-1.5 rounded-full bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-all hover:-translate-y-0.5 flex items-center gap-1"
                                        >
                                          <HelpCircle className="h-3 w-3" /> Quiz
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setCurrentVideoIndex(index);
                                          setVideoPlayerOpen(true);
                                        }}
                                        className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all hover:-translate-y-0.5 flex items-center gap-1"
                                      >
                                        <Play className="h-3 w-3" /> Watch
                                      </button>
                                    </div>
                                  </div>
                                  
                                  {lesson.youtube && lesson.youtube.length > 0 && (
                                    <div className="mt-3 flex items-center gap-2 text-xs text-red-600">
                                      <Youtube className="h-3 w-3" />
                                      <span>{lesson.youtube.length} video{lesson.youtube.length > 1 ? 's' : ''} available</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* CARDS GRID */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {lessons.slice(0, 4).map((l, index) => {
                        const isSaved = saved.includes(l.id);
                        const isDone = completed.has(l.id);
                        const hasYoutube = l.youtube && l.youtube.length > 0;
                        const quizScore = quizScores[l.id];

                        return (
                          <div
                            key={l.id}
                            className="group rounded-3xl bg-white/85 backdrop-blur border border-gray-200 shadow-[0_16px_45px_rgba(15,23,42,0.08)] hover:shadow-[0_24px_70px_rgba(15,23,42,0.12)] transition-all p-4 hover:-translate-y-1 [perspective:900px]"
                            style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.05}s both` }}
                          >
                            <div
                              className={`relative h-32 rounded-2xl border border-gray-200 overflow-hidden youtube-thumbnail ${hasYoutube ? '' : l.thumbStyle}`}
                              style={hasYoutube ? {
                                backgroundImage: `url(https://img.youtube.com/vi/${l.youtube[0].id}/mqdefault.jpg)`
                              } : {}}
                            >
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                              <button
                                type="button"
                                onClick={() => setOpenLesson(l)}
                                className="absolute inset-0 grid place-items-center"
                                aria-label="Watch"
                              >
                                <div className="h-12 w-12 rounded-full bg-white/80 backdrop-blur border border-gray-200 shadow grid place-items-center group-hover:scale-105 transition">
                                  <Play className="h-6 w-6 text-emerald-700" />
                                </div>
                              </button>

                              <span className="absolute bottom-2 right-2 text-[11px] font-semibold px-2 py-1 rounded-full bg-black/60 text-white">
                                {hasYoutube ? l.youtube[0].duration : l.duration}
                              </span>

                              {hasYoutube && (
                                <span className="absolute top-2 right-2 text-[10px] font-bold px-2 py-1 rounded-full bg-red-600 text-white flex items-center gap-1">
                                  <Youtube className="h-3 w-3" />
                                  YouTube
                                </span>
                              )}

                              {isDone && (
                                <span className="absolute top-2 left-2 text-[11px] font-semibold px-2 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-1">
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Done
                                </span>
                              )}

                              {quizScore && (
                                <span className="absolute top-2 left-2 text-[11px] font-semibold px-2 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 flex items-center gap-1">
                                  <Star className="h-3 w-3" />
                                  {quizScore.score} pts
                                </span>
                              )}
                            </div>

                            <div className="mt-4">
                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">
                                  {l.category}
                                </span>
                                <span className="text-[11px] font-semibold text-gray-500">
                                  {l.difficulty}
                                </span>
                              </div>

                              <h3 className="mt-2 text-sm font-extrabold text-gray-900 leading-snug">
                                {appLang === 'hindi' && l.titleHi ? l.titleHi : l.title}
                              </h3>

                              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                                <span className="inline-flex items-center gap-1">
                                  <Eye className="h-3.5 w-3.5" /> {l.views}
                                </span>
                                <span className="inline-flex items-center gap-1">
                                  <Clock className="h-3.5 w-3.5" /> {l.langTag}
                                </span>
                              </div>

                              {hasYoutube && (
                                <div className="mt-2 flex items-center gap-1 text-xs text-red-600">
                                  <Youtube className="h-3 w-3" />
                                  <span>{l.youtube.length} video{l.youtube.length > 1 ? 's' : ''} available</span>
                                </div>
                              )}

                              <div className="mt-4 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => setOpenLesson(l)}
                                  className="flex-1 px-3 py-2 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-all hover:-translate-y-0.5"
                                >
                                  Watch Now
                                </button>
                                {QUIZ_QUESTIONS[l.id] && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCurrentQuiz(QUIZ_QUESTIONS[l.id]);
                                      setShowQuiz(true);
                                    }}
                                    className="flex-1 px-3 py-2 rounded-full bg-amber-600 text-white text-xs font-semibold hover:bg-amber-700 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-1"
                                  >
                                    <HelpCircle className="h-3 w-3" /> Quiz
                                  </button>
                                )}
                              </div>

                              <div className="mt-3 flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => speakLesson(l)}
                                  className="h-10 w-10 rounded-full bg-white/75 backdrop-blur border border-gray-200 grid place-items-center hover:shadow-md hover:-translate-y-0.5 transition-all"
                                  title="Listen"
                                >
                                  <Volume2 className="h-4 w-4 text-emerald-700" />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => toggleSave(l.id)}
                                  className="h-10 w-10 rounded-full bg-white/75 backdrop-blur border border-gray-200 grid place-items-center hover:shadow-md hover:-translate-y-0.5 transition-all"
                                  title="Save"
                                >
                                  <Bookmark
                                    className={`h-4 w-4 ${isSaved ? "text-emerald-700" : "text-gray-500"}`}
                                  />
                                </button>

                                <button
                                  type="button"
                                  onClick={() => markCompleted(l.id)}
                                  className="flex-1 px-3 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold hover:bg-emerald-100 transition-all hover:-translate-y-0.5"
                                >
                                  Mark completed
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </section>

                  {/* RIGHT SIDEBAR */}
                  <aside className="space-y-5">
                    {/* Overall progress ring */}
                    <div className="relative overflow-hidden rounded-3xl bg-white/85 backdrop-blur border border-gray-200 shadow-lg p-5">
                      <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -inset-y-10 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent blur-xl animate-[sheen_10s_ease-in-out_infinite]" />
                      </div>

                      <div className="relative flex items-center justify-between">
                        <p className="text-sm font-semibold text-gray-900">Overall Progress</p>
                        <p className="text-sm font-bold text-emerald-700">{totalProgressPercentage.toFixed(0)}%</p>
                      </div>

                      <div className="relative mt-4 flex items-center justify-center">
                        <div className="relative h-36 w-36">
                          <svg viewBox="0 0 120 120" className="h-full w-full">
                            <circle cx="60" cy="60" r="46" stroke="#E5E7EB" strokeWidth="10" fill="none" />
                            <circle
                              cx="60"
                              cy="60"
                              r="46"
                              stroke="#22C55E"
                              strokeWidth="10"
                              fill="none"
                              strokeLinecap="round"
                              strokeDasharray={2 * Math.PI * 46}
                              strokeDashoffset={2 * Math.PI * 46 * (1 - totalProgressPercentage / 100)}
                              style={{ transition: "stroke-dashoffset 600ms ease" }}
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <p className="text-2xl font-extrabold text-gray-900">
                              {totalCompleted}/{totalLessons}
                            </p>
                            <p className="text-xs text-gray-500 font-semibold">LESSONS DONE</p>
                          </div>
                        </div>
                      </div>

                      <div className="relative mt-4 rounded-2xl bg-emerald-50/80 backdrop-blur border border-emerald-200 p-4">
                        <p className="text-xs font-semibold text-emerald-900">
                          Complete {Math.max(0, 5 - totalCompleted)} more lessons to unlock:
                        </p>
                        <p className="text-sm font-bold text-emerald-800 mt-1">
                          {totalCompleted < 5 ? "Consistent Learner badge" : "🎉 Next badge unlocked!"}
                        </p>
                      </div>
                    </div>

                    {/* Points Summary */}
                    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-50/80 to-yellow-50/50 backdrop-blur border border-amber-200 p-5">
                      <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -inset-y-10 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-amber-100/30 to-transparent blur-xl animate-[sheen_12s_ease-in-out_infinite]" />
                      </div>

                      <div className="relative flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-amber-800 flex items-center gap-2">
                          <Star className="h-4 w-4" /> Points Earned
                        </p>
                        <span className="text-xl font-bold text-amber-700">{points}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Lesson quizzes</span>
                          <span className="font-semibold text-emerald-700">+10 each</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Module completion</span>
                          <span className="font-semibold text-emerald-700">+50</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-600">Perfect quiz score</span>
                          <span className="font-semibold text-emerald-700">+30 bonus</span>
                        </div>
                      </div>

                      <div className="mt-4 text-center">
                        <p className="text-xs text-gray-600">
                          Earn points to unlock badges and track your learning journey!
                        </p>
                      </div>
                    </div>

                    {/* Badges Earned */}
                    {badges.length > 0 && (
                      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-50/80 to-amber-50/50 backdrop-blur border border-yellow-200 p-5">
                        <div className="pointer-events-none absolute inset-0">
                          <div className="absolute -inset-y-10 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-yellow-100/30 to-transparent blur-xl animate-[sheen_12s_ease-in-out_infinite]" />
                        </div>

                        <div className="relative flex items-center justify-between mb-3">
                          <p className="text-sm font-semibold text-yellow-800 flex items-center gap-2">
                            <Award className="h-4 w-4" /> Badges Earned
                          </p>
                          <span className="text-xs text-yellow-700 font-bold">{badges.length}</span>
                        </div>

                        <div className="space-y-3">
                          {badges.map((badge, index) => (
                            <div
                              key={badge}
                              className="flex items-center gap-3 p-3 rounded-2xl bg-white/70 backdrop-blur border border-yellow-200"
                              style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both` }}
                            >
                              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-yellow-400 to-amber-500 border border-yellow-300 grid place-items-center shadow">
                                <Award className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="text-sm font-bold text-gray-900">{badge}</p>
                                <p className="text-xs text-gray-600">Module completed</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Saved for later */}
                    <div className="relative overflow-hidden rounded-3xl bg-white/85 backdrop-blur border border-gray-200 shadow-lg p-5">
                      <div className="pointer-events-none absolute inset-0">
                        <div className="absolute -inset-y-10 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/50 to-transparent blur-xl animate-[sheen_12s_ease-in-out_infinite]" />
                      </div>

                      <div className="relative flex items-center justify-between mb-3">
                        <p className="text-sm font-semibold text-gray-900">Saved for later</p>
                        <button
                          type="button"
                          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                          onClick={() => setActiveCat("All Topics")}
                        >
                          View All
                        </button>
                      </div>

                      {savedLessons.length === 0 ? (
                        <p className="text-sm text-gray-600">
                          Save lessons to watch later.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {savedLessons.slice(0, 3).map((l, index) => (
                            <button
                              key={l.id}
                              type="button"
                              onClick={() => setOpenLesson(l)}
                              className="w-full text-left flex items-center gap-3 p-3 rounded-2xl bg-gray-50/80 border border-gray-100 hover:bg-gray-50 transition-all hover:-translate-y-0.5"
                              style={{ animation: `fadeInUp 0.3s ease-out ${index * 0.1}s both` }}
                            >
                              <div 
                                className={`h-12 w-14 rounded-xl border border-gray-200 ${l.youtube ? 'youtube-thumbnail' : l.thumbStyle}`}
                                style={l.youtube ? {
                                  backgroundImage: `url(https://img.youtube.com/vi/${l.youtube[0].id}/default.jpg)`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center'
                                } : {}}
                              />
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 truncate">
                                  {appLang === 'hindi' && l.titleHi ? l.titleHi : l.title}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {l.duration} • {l.difficulty}
                                </p>
                                {l.youtube && (
                                  <p className="text-[10px] text-red-600 flex items-center gap-1">
                                    <Youtube className="h-3 w-3" />
                                    YouTube available
                                  </p>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </aside>
                </div>
              </div>
            </div>
          </main>
        </div>

        {/* VIDEO PLAYER MODAL */}
        {videoPlayerOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-4xl bg-white rounded-3xl overflow-hidden shadow-2xl">
                <div className={`p-4 bg-gradient-to-r ${getAccentColorClass(activeModule)} text-white flex items-center justify-between`}>
                  <div>
                    <p className="text-sm font-semibold">Module Learning</p>
                    <h3 className="text-lg font-bold">
                      Lesson {currentVideoIndex + 1} of {moduleLessons.length}: {appLang === 'hindi' && moduleLessons[currentVideoIndex].titleHi ? moduleLessons[currentVideoIndex].titleHi : moduleLessons[currentVideoIndex].title}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setVideoPlayerOpen(false)}
                    className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 grid place-items-center transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="aspect-video rounded-2xl overflow-hidden bg-black mb-6">
                    {getCurrentVideo() ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${getCurrentVideo().id}?autoplay=1`}
                        title={getCurrentVideo().title}
                        className="w-full h-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <div className="w-full h-full grid place-items-center bg-gradient-to-br from-emerald-50 to-blue-50">
                        <div className="text-center">
                          <Youtube className="h-16 w-16 text-red-600 mx-auto mb-4" />
                          <p className="text-gray-700 font-semibold">Video loading...</p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-2">
                      {appLang === 'hindi' && moduleLessons[currentVideoIndex].titleHi ? moduleLessons[currentVideoIndex].titleHi : moduleLessons[currentVideoIndex].title}
                    </h4>
                    <p className="text-gray-600 mb-4">
                      {getCurrentVideo()?.description || "Watch this video to learn important financial concepts."}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> {moduleLessons[currentVideoIndex].duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" /> {moduleLessons[currentVideoIndex].difficulty}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="h-4 w-4" /> {moduleLessons[currentVideoIndex].views}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        markCompleted(moduleLessons[currentVideoIndex].id);
                        setVideoPlayerOpen(false);
                      }}
                      className={`px-6 py-3 rounded-full bg-gradient-to-r ${getAccentColorClass(activeModule)} text-white font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center gap-2`}
                    >
                      <CheckCircle2 className="h-5 w-5" /> Mark as Completed
                    </button>
                    
                    <button
                      type="button"
                      onClick={handlePreviousVideo}
                      disabled={currentVideoIndex === 0}
                      className={`px-6 py-3 rounded-full border font-semibold transition-all hover:-translate-y-0.5 flex items-center gap-2 ${currentVideoIndex === 0 ? 'border-gray-300 text-gray-400 cursor-not-allowed' : 'border-gray-300 text-gray-700 hover:border-emerald-300 hover:text-emerald-700'}`}
                    >
                      Previous
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleNextVideo}
                      className={`px-6 py-3 rounded-full bg-gradient-to-r ${getAccentColorClass(activeModule)} text-white font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center gap-2`}
                    >
                      {currentVideoIndex === moduleLessons.length - 1 ? 'Finish Module' : 'Next Lesson'} 
                      <ArrowRight className="h-5 w-5" />
                    </button>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">Progress in this module:</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-3 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className={`h-3 rounded-full transition-all`}
                          style={{ 
                            width: `${((currentVideoIndex + 1) / moduleLessons.length) * 100}%`,
                            background: `linear-gradient(to right, ${activeModule.accentColor === 'blue' ? '#3b82f6' : activeModule.accentColor === 'purple' ? '#8b5cf6' : '#10b981'}, ${activeModule.accentColor === 'blue' ? '#60a5fa' : activeModule.accentColor === 'purple' ? '#a78bfa' : '#34d399'})`
                          }}
                        />
                      </div>
                      <span className="text-sm font-semibold text-emerald-700">
                        {currentVideoIndex + 1}/{moduleLessons.length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SINGLE LESSON QUIZ MODAL */}
        {showQuiz && currentQuiz && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Quick Quiz</p>
                    <h3 className="text-lg font-bold">Test Your Knowledge</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowQuiz(false);
                      setCurrentQuiz(null);
                      setSelectedAnswer(null);
                      setQuizSubmitted(false);
                    }}
                    className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 grid place-items-center transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="p-6">
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-amber-600" />
                        <span className="text-sm font-semibold text-gray-700">Question</span>
                      </div>
                      <span className="text-sm font-bold text-amber-700">{currentQuiz.points} points</span>
                    </div>
                    
                    <h4 className="text-lg font-bold text-gray-900 mb-6">
                      {appLang === 'hindi' ? currentQuiz.questionHi : currentQuiz.question}
                    </h4>
                    
                    <div className="space-y-3">
                      {currentQuiz.options.map((option) => {
                        const isSelected = selectedAnswer === option.id;
                        const isCorrect = option.id === currentQuiz.correct;
                        
                        let bgColor = "bg-white border-gray-200";
                        let textColor = "text-gray-900";
                        
                        if (quizSubmitted) {
                          if (isCorrect) {
                            bgColor = "bg-emerald-50 border-emerald-200";
                            textColor = "text-emerald-900";
                          } else if (isSelected && !isCorrect) {
                            bgColor = "bg-red-50 border-red-200";
                            textColor = "text-red-900";
                          }
                        } else if (isSelected) {
                          bgColor = "bg-amber-50 border-amber-200";
                          textColor = "text-amber-900";
                        }
                        
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => !quizSubmitted && handleQuizSubmit(option.id)}
                            disabled={quizSubmitted}
                            className={`w-full p-4 rounded-2xl border ${bgColor} ${textColor} text-left transition-all hover:-translate-y-1 flex items-start gap-3 ${!quizSubmitted ? 'hover:border-amber-300 hover:shadow-md' : ''} ${isSelected ? 'option-selected' : ''}`}
                          >
                            <div className={`h-8 w-8 rounded-full grid place-items-center text-sm font-bold ${quizSubmitted ? (isCorrect ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : isSelected ? 'bg-red-100 text-red-700 border border-red-200' : 'bg-gray-100 text-gray-700 border border-gray-200') : isSelected ? 'bg-amber-100 text-amber-700 border border-amber-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                              {option.id}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">
                                {appLang === 'hindi' ? option.textHi : option.text}
                              </p>
                              {quizSubmitted && isCorrect && (
                                <p className="text-sm text-emerald-700 mt-2 font-semibold">
                                  ✓ Correct answer
                                </p>
                              )}
                              {quizSubmitted && isSelected && !isCorrect && (
                                <p className="text-sm text-red-700 mt-2 font-semibold">
                                  ✗ Your answer
                                </p>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  
                  {quizSubmitted && (
                    <div className={`p-4 rounded-2xl mb-6 ${quizCorrect ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
                      <div className="flex items-start gap-3">
                        {quizCorrect ? (
                          <div className="h-10 w-10 rounded-full bg-emerald-100 border border-emerald-200 grid place-items-center">
                            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-amber-100 border border-amber-200 grid place-items-center">
                            <HelpCircle className="h-5 w-5 text-amber-600" />
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {quizCorrect ? 'Well done!' : 'Good try!'}
                          </p>
                          <p className="text-sm text-gray-700 mt-1">
                            {appLang === 'hindi' ? currentQuiz.explanationHi : currentQuiz.explanation}
                          </p>
                          {quizCorrect && (
                            <p className="text-sm font-bold text-emerald-700 mt-2">
                              +{currentQuiz.points} points earned!
                            </p>
                          )}
                          {!quizCorrect && (
                            <p className="text-sm text-amber-700 mt-2 font-semibold">
                              Watch the video again to learn more
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-3">
                    {!quizSubmitted ? (
                      <>
                        <button
                          type="button"
                          onClick={startVoiceQuiz}
                          className="px-6 py-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center gap-2"
                          disabled={voiceQuizActive}
                        >
                          {voiceQuizActive ? (
                            <>
                              <VolumeX className="h-5 w-5" /> Listening...
                            </>
                          ) : (
                            <>
                              <Mic className="h-5 w-5" /> Voice Quiz
                            </>
                          )}
                        </button>
                        <div className="flex-1" />
                        <button
                          type="button"
                          onClick={() => {
                            setShowQuiz(false);
                            setCurrentQuiz(null);
                          }}
                          className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-semibold hover:border-gray-400 hover:text-gray-900 transition-all hover:-translate-y-0.5"
                        >
                          Skip Quiz
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={handleNextQuiz}
                          className="flex-1 px-6 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        >
                          Continue <ArrowRight className="h-5 w-5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedAnswer(null);
                            setQuizSubmitted(false);
                            setQuizCorrect(false);
                          }}
                          className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-semibold hover:border-gray-400 hover:text-gray-900 transition-all hover:-translate-y-0.5"
                        >
                          Try Again
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODULE FINAL QUIZ MODAL */}
        {showModuleQuiz && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-3xl bg-white rounded-3xl overflow-hidden shadow-2xl">
                <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-500 text-white flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Module Final Quiz</p>
                    <h3 className="text-lg font-bold">Test Your Knowledge - {activeModule.totalLessons} Questions</h3>
                  </div>
                  <button
                    type="button"
                    onClick={closeModuleQuiz}
                    className="h-10 w-10 rounded-full bg-white/20 hover:bg-white/30 grid place-items-center transition"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                  {!moduleQuizSubmitted ? (
                    <>
                      <div className="mb-6 text-center">
                        <HelpCircle className="h-16 w-16 text-purple-600 mx-auto mb-4" />
                        <h4 className="text-xl font-bold text-gray-900">Final Knowledge Check</h4>
                        <p className="text-gray-600 mt-2">
                          Answer all {activeModule.totalLessons} questions to complete the module and earn your badge!
                        </p>
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <span className="text-sm font-semibold text-purple-700">
                            Total points available: {activeModule.totalLessons * 10}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-8">
                        {moduleLessons.map((lesson, index) => {
                          const quizData = QUIZ_QUESTIONS[lesson.id];
                          const selectedAnswer = moduleQuizAnswers[lesson.id];
                          
                          if (!quizData) return null;
                          
                          return (
                            <div key={lesson.id} className="p-4 rounded-2xl border border-gray-200">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 border border-purple-200 grid place-items-center">
                                  <span className="text-lg font-bold text-purple-700">{index + 1}</span>
                                </div>
                                <div>
                                  <p className="text-sm text-gray-600">From: {appLang === 'hindi' && lesson.titleHi ? lesson.titleHi : lesson.title}</p>
                                  <h5 className="font-bold text-gray-900">
                                    {appLang === 'hindi' ? quizData.questionHi : quizData.question}
                                  </h5>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {quizData.options.map((option) => {
                                  const isSelected = selectedAnswer === option.id;
                                  
                                  return (
                                    <button
                                      key={option.id}
                                      type="button"
                                      onClick={() => handleModuleQuizAnswer(lesson.id, option.id)}
                                      className={`p-3 rounded-xl border text-left transition-all hover:-translate-y-0.5 ${isSelected ? 'bg-purple-50 border-purple-300 text-purple-900' : 'bg-white border-gray-200 text-gray-900 hover:border-purple-200'}`}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full grid place-items-center text-sm font-bold ${isSelected ? 'bg-purple-100 text-purple-700 border border-purple-200' : 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                                          {option.id}
                                        </div>
                                        <span className="font-medium">
                                          {appLang === 'hindi' ? option.textHi : option.text}
                                        </span>
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                              
                              {selectedAnswer && (
                                <div className="mt-3 text-right">
                                  <span className="text-xs text-gray-500">Selected: {selectedAnswer}</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                      
                      <div className="mt-8 pt-6 border-t border-gray-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600">Questions answered:</p>
                            <p className="text-lg font-bold text-gray-900">
                              {Object.keys(moduleQuizAnswers).length} / {activeModule.totalLessons}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={handleModuleQuizSubmit}
                            disabled={Object.keys(moduleQuizAnswers).length !== activeModule.totalLessons}
                            className={`px-8 py-3 rounded-full font-bold shadow-lg transition-all hover:-translate-y-0.5 ${Object.keys(moduleQuizAnswers).length === activeModule.totalLessons ? 'bg-gradient-to-r from-purple-600 to-indigo-500 text-white hover:shadow-xl' : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
                          >
                            Submit All Answers
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <div className="mb-6">
                        {moduleQuizScore >= 5 ? (
                          <div className="h-24 w-24 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 border-4 border-yellow-300 grid place-items-center mx-auto animate-bounce">
                            <Award className="h-12 w-12 text-white" />
                          </div>
                        ) : (
                          <div className="h-24 w-24 rounded-full bg-gradient-to-r from-purple-400 to-indigo-500 border-4 border-purple-300 grid place-items-center mx-auto">
                            <CheckCircle2 className="h-12 w-12 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <h4 className="text-2xl font-bold text-gray-900 mb-2">
                        {moduleQuizScore >= 5 ? 'Excellent! 🎉' : 'Good job! 👍'}
                      </h4>
                      
                      <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 mb-6">
                        <span className="text-4xl font-bold text-purple-700">{moduleQuizScore}</span>
                        <span className="text-gray-600">out of {activeModule.totalLessons} correct</span>
                      </div>
                      
                      <div className="space-y-4 mb-8">
                        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200">
                          <p className="font-semibold text-emerald-900">
                            Points earned: {moduleQuizScore * 10}
                          </p>
                          <p className="text-sm text-emerald-700">
                            {moduleQuizScore >= 5 ? '+30 bonus points for excellent score!' : 'Keep learning to earn more points!'}
                          </p>
                        </div>
                        
                        {moduleQuizScore >= 5 && !badges.includes(activeModule.badgeUnlocked) && (
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200">
                            <p className="font-semibold text-yellow-900">
                              🎖️ {activeModule.badgeUnlocked} Badge Unlocked!
                            </p>
                            <p className="text-sm text-yellow-700">
                              You've demonstrated excellent knowledge of {activeModule.titleEn}!
                            </p>
                          </div>
                        )}
                        
                        {moduleQuizScore < 5 && (
                          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                            <p className="font-semibold text-amber-900">
                              Keep Learning
                            </p>
                            <p className="text-sm text-amber-700">
                              Review the lessons and try again to improve your score!
                            </p>
                          </div>
                        )}
                        
                        {/* Premium Teaser for Module 3 */}
                        {activeModule.id === "grow-your-money-wisely" && moduleQuizScore >= 5 && (
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-300">
                            <p className="font-bold text-purple-900 text-lg">
                              🚀 Ready for More Advanced Learning?
                            </p>
                            <p className="text-sm text-purple-700 mt-2">
                              Want to learn how ₹500/month can grow into lakhs? Unlock Premium Courses for advanced investing strategies, stock market basics, real estate investing, and more!
                            </p>
                            <button
                              type="button"
                              onClick={() => alert("Premium courses coming soon!")}
                              className="mt-3 px-6 py-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold hover:shadow-lg transition-all hover:-translate-y-0.5"
                            >
                              Explore Premium Courses
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-3 justify-center">
                        <button
                          type="button"
                          onClick={closeModuleQuiz}
                          className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
                        >
                          Continue to Certificate
                        </button>
                        <button
                          type="button"
                          onClick={retakeModuleQuiz}
                          className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-semibold hover:border-gray-400 hover:text-gray-900 transition-all hover:-translate-y-0.5"
                        >
                          Retake Quiz
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CERTIFICATE MODAL */}
        {showCertificate && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm">
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl">
                <div className={`p-6 bg-gradient-to-r ${getAccentColorClass(activeModule)} text-white text-center`}>
                  <Award className="h-16 w-16 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold">Congratulations! 🎉</h3>
                  <p className="mt-2">You've completed the {activeModule.titleEn} module!</p>
                </div>
                
                <div className="p-8 text-center">
                  <div className="border-4 border-dashed border-emerald-300 rounded-3xl p-8 mb-6 bg-gradient-to-br from-emerald-50/50 to-blue-50/50">
                    <h4 className="text-3xl font-bold text-emerald-800 mb-4">Certificate of Completion</h4>
                    <p className="text-xl text-gray-700 mb-2">Awarded to</p>
                    <p className="text-2xl font-bold text-gray-900 mb-6">{displayName}</p>
                    <p className="text-lg text-gray-700 mb-4">for successfully completing</p>
                    <p className="text-xl font-bold text-emerald-700 mb-6">{activeModule.titleEn}</p>
                    <div className="flex justify-center gap-8 mb-6">
                      <div>
                        <p className="text-sm text-gray-600">Lessons Completed</p>
                        <p className="text-2xl font-bold text-gray-900">{activeModule.totalLessons}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Quiz Score</p>
                        <p className="text-2xl font-bold text-gray-900">{moduleQuizScore}/{activeModule.totalLessons}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Points Earned</p>
                        <p className="text-2xl font-bold text-gray-900">{moduleQuizScore * 10 + (moduleQuizScore >= 5 ? 30 : 0)}</p>
                      </div>
                    </div>
                    {badges.includes(activeModule.badgeUnlocked) && (
                      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-300 mb-4">
                        <Award className="h-4 w-4 text-yellow-700" />
                        <span className="text-sm font-bold text-yellow-800">{activeModule.badgeUnlocked} Badge Awarded</span>
                      </div>
                    )}
                    <p className="text-sm text-gray-500">Completed on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  
                  <div className="flex flex-wrap gap-3 justify-center">
                    <button
                      type="button"
                      onClick={shareCertificate}
                      className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-green-500 text-white font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <Share2 className="h-5 w-5" /> Share on WhatsApp
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowCertificate(false)}
                      className="px-6 py-3 rounded-full border border-gray-300 text-gray-700 font-semibold hover:border-gray-400 hover:text-gray-900 transition-all hover:-translate-y-0.5"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LESSON DETAIL MODAL WITH YOUTUBE VIDEOS */}
        {openLesson && (
          <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm">
            <button
              type="button"
              className="absolute inset-0 w-full h-full cursor-default"
              onClick={() => {
                setOpenLesson(null);
                setSelectedVideo(null);
              }}
              aria-label="Close"
            />

            <div className="absolute right-0 top-0 h-full w-full sm:w-[580px] bg-white/90 backdrop-blur-2xl border-l border-gray-200 shadow-2xl overflow-y-auto">
              <div className="p-5 sm:p-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold text-emerald-700">
                    {openLesson.youtube ? "VIDEO LEARNING TOOL" : "AI SUMMARY TOOL"}
                  </p>
                  <h3 className="text-2xl font-extrabold text-gray-900 mt-2">
                    {appLang === 'hindi' && openLesson.titleHi ? openLesson.titleHi : openLesson.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setOpenLesson(null);
                    setSelectedVideo(null);
                  }}
                  className="h-10 w-10 rounded-full bg-white border border-gray-200 grid place-items-center hover:bg-gray-50 transition-all hover:-translate-y-0.5"
                >
                  <X className="h-5 w-5 text-gray-600" />
                </button>
              </div>

              {/* Top controls */}
              <div className="px-5 sm:px-6 pb-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 bg-white/70 border border-gray-200 rounded-full p-1">
                  <button
                    type="button"
                    onClick={() => setSummaryLang("en")}
                    className={
                      summaryLang === "en"
                        ? "px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-green-500 text-white text-xs font-semibold"
                        : "px-3 py-1 rounded-full text-xs font-semibold text-gray-700 hover:text-emerald-700"
                    }
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setSummaryLang("hi")}
                    className={
                      summaryLang === "hi"
                        ? "px-3 py-1 rounded-full bg-gradient-to-r from-emerald-600 to-green-500 text-white text-xs font-semibold"
                        : "px-3 py-1 rounded-full text-xs font-semibold text-gray-700 hover:text-emerald-700"
                    }
                  >
                    Hindi
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">Speed</span>
                  <select
                    value={ttsSpeed}
                    onChange={(e) => setTtsSpeed(Number(e.target.value))}
                    className="text-xs bg-white border border-gray-200 rounded-xl px-2 py-1 outline-none"
                  >
                    <option value={0.85}>Slow</option>
                    <option value={1.0}>Normal</option>
                    <option value={1.15}>Fast</option>
                  </select>
                </div>
              </div>

              <div className="px-5 sm:px-6 pb-6 space-y-5">
                {/* YouTube Videos Section */}
                {openLesson.youtube && openLesson.youtube.length > 0 && (
                  <div className="rounded-2xl bg-white/70 border border-gray-200 p-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-bold text-red-700 uppercase tracking-wide flex items-center gap-2">
                        <Youtube className="h-4 w-4" />
                        Recommended YouTube Videos
                      </p>
                      <span className="text-xs text-gray-500">
                        {openLesson.youtube.length} videos
                      </span>
                    </div>

                    <div className="space-y-3">
                      {openLesson.youtube.map((video, index) => (
                        <div
                          key={video.id}
                          className={`group rounded-xl border ${selectedVideo === index ? 'border-red-300 bg-red-50/50' : 'border-gray-200 hover:border-red-200'} overflow-hidden transition-all hover:-translate-y-0.5`}
                        >
                          <div className="flex">
                            <div 
                              className="w-28 h-20 flex-shrink-0 bg-cover bg-center cursor-pointer"
                              style={{ backgroundImage: `url(https://img.youtube.com/vi/${video.id}/mqdefault.jpg)` }}
                              onClick={() => openYouTubeVideo(video.id, openLesson)}
                            >
                              <div className="w-full h-full bg-black/30 hover:bg-black/10 transition flex items-center justify-center">
                                <div className="h-10 w-10 rounded-full bg-white/90 grid place-items-center">
                                  <Play className="h-5 w-5 text-red-600" />
                                </div>
                              </div>
                            </div>
                            <div className="flex-1 p-3">
                              <p className="text-sm font-semibold text-gray-900 line-clamp-2">
                                {video.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{video.channel}</p>
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs text-gray-500">{video.duration}</span>
                                <button
                                  type="button"
                                  onClick={() => openYouTubeVideo(video.id, openLesson)}
                                  className="text-xs font-semibold text-red-600 hover:text-red-700 flex items-center gap-1"
                                >
                                  Watch <ExternalLink className="h-3 w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                          {selectedVideo === index && (
                            <div className="px-3 pb-3">
                              <p className="text-xs text-gray-600 mt-2">{video.description}</p>
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setSelectedVideo(selectedVideo === index ? null : index)}
                            className="w-full text-center text-xs text-gray-500 py-2 hover:text-gray-700 border-t border-gray-100"
                          >
                            {selectedVideo === index ? 'Show less' : 'Show description'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => speakLesson(openLesson)}
                  className="w-full px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-semibold flex items-center justify-between hover:bg-emerald-100 transition-all hover:-translate-y-0.5"
                >
                  <span className="flex items-center gap-2">
                    <Volume2 className="h-5 w-5 text-emerald-700" />
                    Listen to Summary
                  </span>
                  <span className="text-xs text-emerald-700">
                    {openLesson.duration} audio
                  </span>
                </button>

                <div className="rounded-2xl bg-white/70 border border-gray-200 p-4">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-wide">
                    Summary in simple words
                  </p>
                  <ul className="mt-3 space-y-2 text-sm text-gray-800">
                    {(summaryLang === "hi" ? openLesson.summaryHi : openLesson.summaryEn)?.map(
                      (x, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-emerald-600" />
                          <span>{x}</span>
                        </li>
                      )
                    )}
                  </ul>
                </div>

                {(summaryLang === "hi" ? openLesson.warningHi : openLesson.warningEn) && (
                  <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-4">
                    <p className="text-xs font-bold text-amber-800 uppercase tracking-wide">
                      Key Warning
                    </p>
                    <p className="mt-2 text-sm text-amber-900/90">
                      {summaryLang === "hi" ? openLesson.warningHi : openLesson.warningEn}
                    </p>
                  </div>
                )}

                <div className="rounded-2xl bg-white/70 border border-gray-200 p-4">
                  <p className="text-xs font-bold text-gray-700 uppercase tracking-wide">
                    Steps to follow
                  </p>
                  <ol className="mt-3 space-y-2 text-sm text-gray-800">
                    {(summaryLang === "hi" ? openLesson.stepsHi : openLesson.stepsEn)?.map(
                      (s, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <span className="h-6 w-6 rounded-full bg-gray-100 border border-gray-200 grid place-items-center text-xs font-bold text-gray-700">
                            {i + 1}
                          </span>
                          <span className="mt-0.5">{s}</span>
                        </li>
                      )
                    )}
                  </ol>
                </div>

                {QUIZ_QUESTIONS[openLesson.id] && (
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentQuiz(QUIZ_QUESTIONS[openLesson.id]);
                      setShowQuiz(true);
                      setOpenLesson(null);
                    }}
                    className="w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-extrabold shadow hover:shadow-lg transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <HelpCircle className="h-5 w-5" /> Take Quiz (+10 points)
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => markCompleted(openLesson.id)}
                  className="w-full px-4 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-green-500 text-white font-extrabold shadow hover:shadow-lg transition-all hover:-translate-y-0.5"
                >
                  ✓ Mark Completed
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => toggleSave(openLesson.id)}
                    className="px-4 py-3 rounded-2xl bg-white/70 backdrop-blur border border-gray-200 text-gray-900 font-semibold hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Bookmark className="h-4 w-4 text-emerald-700" />
                    Save for later
                  </button>

                  <button
                    type="button"
                    onClick={() => alert("Share (demo)")}
                    className="px-4 py-3 rounded-2xl bg-white/70 backdrop-blur border border-gray-200 text-gray-900 font-semibold hover:shadow-md transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Share2 className="h-4 w-4 text-emerald-700" />
                    Share
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}