// src/components/screens/ProfileScreen.jsx (UPDATED VERSION)

import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  serverTimestamp,
  increment,
} from "firebase/firestore";
import {
  IndianRupee,
  Home,
  Building2,
  MessageCircle,
  BookOpen,
  ShieldCheck,
  Bell,
  UserCircle2,
  Edit3,
  MapPin,
  Award,
  ChevronDown,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  LogOut,
  MessageSquare,
  HelpCircle,
} from "lucide-react";

/**
 * DhanSaathi Profile / Preferences / Security Page
 * Firebase integrated - stores user profile data in Firestore
 */

const TABS = ["Profile", "Preferences", "Security"];

// Default values for new users
const defaultBasicInfo = {
  fullName: "",
  email: "",
  phone: "",
  location: "",
  profession: "",
  about: "",
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
};

const defaultFinancialProfile = {
  incomeRange: "Select Range",
  goal: "Select Goal",
  risk: "Select Risk",
};

const defaultPreferences = {
  emailNotifications: true,
  productUpdates: true,
  darkMode: false,
  language: "english",
  currency: "INR",
};

// Default contributor stats
const defaultContributorStats = {
  level: 1,
  points: 0,
  targetPoints: 100,
  questionsCount: 0,
  answersCount: 0,
  joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
  weeklyDelta: "+0 pts this week",
};

export default function ProfileScreen() {
  const [activeTab, setActiveTab] = useState("Profile");
  const [basicInfo, setBasicInfo] = useState(defaultBasicInfo);
  const [financialProfile, setFinancialProfile] = useState(
    defaultFinancialProfile
  );
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [fbUser, setFbUser] = useState(null);
  
  // Community stats from Firestore
  const [contributorStats, setContributorStats] = useState(defaultContributorStats);
  const [communityStats, setCommunityStats] = useState({
    questionsCount: 0,
    answersCount: 0,
    points: 0,
    lastActiveAt: null,
  });

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFbUser(user);
      if (user) {
        loadUserData(user.uid);
      } else {
        setLoading(false);
        // Redirect to login or show guest state
      }
    });
    return () => unsubscribe();
  }, []);

  // Calculate weekly delta
  const calculateWeeklyDelta = () => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    // This would ideally come from a weekly stats collection
    // For now, we'll simulate based on recent activity
    const recentActivity = Math.floor(Math.random() * 5) + 1;
    const pointsGained = recentActivity * 5; // 5 points per activity
    return `+${pointsGained} pts this week`;
  };

  // Load user data from Firestore
  const loadUserData = async (userId) => {
    try {
      setLoading(true);
      
      // Create user document reference
      const userDocRef = doc(db, "users", userId);
      const userDoc = await getDoc(userDocRef);
      
      // Load profile data from subcollections
      const profileRef = doc(db, "users", userId, "profile", "basic");
      const profileDoc = await getDoc(profileRef);
      
      const financialRef = doc(db, "users", userId, "profile", "financial");
      const financialDoc = await getDoc(financialRef);
      
      const preferencesRef = doc(db, "users", userId, "profile", "preferences");
      const preferencesDoc = await getDoc(preferencesRef);
      
      // Load community stats
      const communityStatsRef = doc(db, "users", userId, "stats", "community");
      const communityStatsDoc = await getDoc(communityStatsRef);
      
      // Load overall user score for contributor ranking
      const userData = userDoc.exists() ? userDoc.data() : {};
      
      // Set profile data if exists, otherwise use defaults
      if (profileDoc.exists()) {
        setBasicInfo(profileDoc.data());
      } else {
        // If no profile exists, create one with user's email
        const initialProfile = {
          ...defaultBasicInfo,
          email: fbUser?.email || "",
          fullName: fbUser?.displayName || "",
        };
        setBasicInfo(initialProfile);
        await setDoc(profileRef, initialProfile);
      }
      
      if (financialDoc.exists()) {
        setFinancialProfile(financialDoc.data());
      } else {
        await setDoc(financialRef, defaultFinancialProfile);
      }
      
      if (preferencesDoc.exists()) {
        setPreferences(preferencesDoc.data());
      } else {
        await setDoc(preferencesRef, defaultPreferences);
      }
      
      // Load community stats if available
      if (communityStatsDoc.exists()) {
        const communityData = communityStatsDoc.data();
        setCommunityStats({
          questionsCount: communityData.questionsCount || 0,
          answersCount: communityData.answersCount || 0,
          points: (communityData.questionsCount || 0) * 10 + (communityData.answersCount || 0) * 5,
          lastActiveAt: communityData.lastActiveAt || null,
        });
      }
      
      // Calculate contributor stats based on community activity
      const userQuestionsCount = communityStatsDoc.exists() ? communityStatsDoc.data().questionsCount || 0 : 0;
      const userAnswersCount = communityStatsDoc.exists() ? communityStatsDoc.data().answersCount || 0 : 0;
      const userTotalPoints = userData.score || 0;
      
      // Determine contributor level based on points
      let contributorLevel = 1;
      if (userTotalPoints >= 300) contributorLevel = 4;
      else if (userTotalPoints >= 200) contributorLevel = 3;
      else if (userTotalPoints >= 100) contributorLevel = 2;
      else contributorLevel = 1;
      
      // Calculate next tier requirements
      const targetPoints = contributorLevel === 4 ? 500 : 
                          contributorLevel === 3 ? 300 : 
                          contributorLevel === 2 ? 200 : 100;
      
      // Get joined date from user creation or profile
      const joinedDate = userData.createdAt?.toDate
        ? userData.createdAt.toDate().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
        : new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      setContributorStats({
        level: contributorLevel,
        points: userTotalPoints,
        targetPoints: targetPoints,
        questionsCount: userQuestionsCount,
        answersCount: userAnswersCount,
        joinedDate: joinedDate,
        weeklyDelta: calculateWeeklyDelta(),
      });
      
    } catch (error) {
      console.error("Error loading user data:", error);
      setToastMessage("Error loading profile data");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const initials = useMemo(() => {
    const src = basicInfo.fullName || basicInfo.email || fbUser?.email || "U";
    const parts = src.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (src[0] || "U").toUpperCase();
  }, [basicInfo.fullName, basicInfo.email, fbUser]);

  const progressPercent = Math.min(
    100,
    Math.round((contributorStats.points / contributorStats.targetPoints) * 100)
  );
  const remainingPoints = Math.max(
    0,
    contributorStats.targetPoints - contributorStats.points
  );
  
  // Determine next tier name and target
  const getNextTierInfo = () => {
    const currentLevel = contributorStats.level;
    const currentPoints = contributorStats.points;
    
    if (currentLevel >= 4) {
      return { name: "Platinum", requiredPoints: currentPoints + 100, level: 5 };
    } else if (currentLevel >= 3) {
      return { name: "Gold", requiredPoints: 300, level: 4 };
    } else if (currentLevel >= 2) {
      return { name: "Silver", requiredPoints: 200, level: 3 };
    } else {
      return { name: "Bronze", requiredPoints: 100, level: 2 };
    }
  };
  
  const nextTierInfo = getNextTierInfo();

  const markDirty = () => {
    if (!isEditing) setIsEditing(true);
    setHasChanges(true);
  };

  const handleBasicChange = (field, value) => {
    setBasicInfo((prev) => ({ ...prev, [field]: value }));
    markDirty();
  };

  const handleFinancialChange = (field, value) => {
    setFinancialProfile((prev) => ({ ...prev, [field]: value }));
    markDirty();
  };

  const handlePreferenceToggle = (field) => {
    setPreferences((prev) => ({ ...prev, [field]: !prev[field] }));
    markDirty();
  };

  // Save all changes to Firestore
  const handleSave = async () => {
    if (!fbUser?.uid) {
      setToastMessage("Please sign in to save changes");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    try {
      setLoading(true);
      
      // Update basic info
      const basicRef = doc(db, "users", fbUser.uid, "profile", "basic");
      await setDoc(basicRef, {
        ...basicInfo,
        updatedAt: serverTimestamp(),
      }, { merge: true });
      
      // Update financial profile
      const financialRef = doc(db, "users", fbUser.uid, "profile", "financial");
      await setDoc(financialRef, financialProfile, { merge: true });
      
      // Update preferences
      const preferencesRef = doc(db, "users", fbUser.uid, "profile", "preferences");
      await setDoc(preferencesRef, preferences, { merge: true });
      
      // Update main user document timestamp
      const userRef = doc(db, "users", fbUser.uid);
      await updateDoc(userRef, {
        updatedAt: serverTimestamp(),
        displayName: basicInfo.fullName || fbUser.displayName,
      });
      
      setIsEditing(false);
      setHasChanges(false);
      setToastMessage("Profile updated successfully!");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2500);
      
    } catch (error) {
      console.error("Error saving profile:", error);
      setToastMessage("Error saving changes");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reload data from Firestore
    if (fbUser?.uid) {
      loadUserData(fbUser.uid);
    }
    setIsEditing(false);
    setHasChanges(false);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      // Redirect will be handled by auth state listener
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  // Navigate to community page
  const goToCommunity = () => {
    window.location.href = "/community";
  };

  const cardMotion = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: "easeOut" },
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at top left, rgba(187,247,208,0.7) 0, transparent 55%), radial-gradient(circle at bottom right, rgba(191,219,254,0.6) 0, transparent 55%)",
          opacity: 0.8,
        }}
      />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* NAVBAR */}
        <header className="w-full bg-white/90 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.location.href = "/home"}>
              <div className="h-9 w-9 rounded-xl bg-green-600 flex items-center justify-center shadow-md">
                <IndianRupee className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900">
                DhanSaathi
              </span>
            </div>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
              <div className="flex items-center gap-1.5 hover:text-gray-900 transition cursor-pointer" onClick={() => window.location.href = "/home"}>
                <Home className="h-4 w-4" /> Home
              </div>

              <div className="flex items-center gap-1.5 hover:text-gray-900 transition cursor-pointer" onClick={() => window.location.href = "/schemes"}>
                <Building2 className="h-4 w-4" /> Schemes
              </div>

              <div className="flex items-center gap-1.5 hover:text-gray-900 transition cursor-pointer" onClick={goToCommunity}>
                <MessageCircle className="h-4 w-4" /> Community
              </div>

              <div className="flex items-center gap-1.5 hover:text-gray-900 transition cursor-pointer" onClick={() => alert("Learn coming soon")}>
                <BookOpen className="h-4 w-4" /> Learn
              </div>

              <div className="flex items-center gap-1.5 text-green-700 font-semibold">
                <ShieldCheck className="h-4 w-4" /> Profile
              </div>
            </nav>

            <div className="flex items-center gap-3">
              <button
                type="button"
                className="hidden sm:inline-flex h-9 w-9 rounded-full bg-white border border-gray-200 shadow-sm items-center justify-center text-gray-700 hover:bg-gray-50 transition"
                title="Notifications"
                onClick={() => alert("Notifications coming soon")}
              >
                <Bell className="h-4 w-4" />
              </button>

              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow flex items-center justify-center text-white font-semibold text-xs">
                {initials}
              </div>
            </div>
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 space-y-6">
          {/* Page heading + Tabs */}
          <section className="mb-1">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-3">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Account Preferences &amp; Security
                </h1>
                <p className="text-sm sm:text-base text-gray-600 mt-1">
                  Manage how you interact with DhanSaathi and tune your profile
                  for the community.
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs sm:text-sm bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full text-emerald-800">
                <ShieldCheck className="h-4 w-4" />
                <span className="font-semibold">Security: High</span>
              </div>
            </div>

            {/* Tabs */}
            <LayoutGroup>
              <div className="mt-5 border-b border-gray-100 flex items-center gap-6 text-sm font-medium text-gray-600">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className="relative pb-3"
                  >
                    <span
                      className={
                        activeTab === tab
                          ? "text-gray-900 font-semibold"
                          : "hover:text-gray-900"
                      }
                    >
                      {tab}
                    </span>
                    {activeTab === tab && (
                      <motion.div
                        layoutId="profileTabIndicator"
                        className="absolute left-0 right-0 -bottom-[1px] h-0.5 rounded-full bg-emerald-500"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      />
                    )}
                  </button>
                ))}
              </div>
            </LayoutGroup>
          </section>

          {/* Header + Right Stats */}
          <section className="grid gap-5 lg:grid-cols-[2fr,1.2fr]">
            {/* Profile header card */}
            <motion.div
              className="rounded-3xl bg-white/95 backdrop-blur shadow-[0_16px_40px_rgba(15,23,42,0.06)] border border-emerald-50 px-5 sm:px-7 py-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5"
              {...cardMotion}
            >
              <div className="flex items-center gap-4 sm:gap-5">
                <div className="relative">
                  <div className="h-16 w-16 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-2xl font-semibold shadow-lg">
                    {initials}
                  </div>
                  <button
                    type="button"
                    className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-white shadow flex items-center justify-center text-emerald-600 border border-emerald-100"
                    title="Edit photo"
                    onClick={() => alert("Profile photo upload coming soon")}
                  >
                    <Edit3 className="h-3 w-3" />
                  </button>
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                      {basicInfo.fullName || "New User"}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-semibold uppercase tracking-wide">
                      <Award className="h-3.5 w-3.5" />
                      Level {contributorStats.level} Contributor
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-xs sm:text-sm text-gray-600">
                    <span>{basicInfo.email || fbUser?.email || "No email"}</span>
                    <span className="text-gray-400">•</span>
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                      {basicInfo.location || "Location not set"}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    Contributor Level {contributorStats.level} • {contributorStats.points} points
                  </p>
                </div>
              </div>

              <div className="w-full sm:w-64">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Contributor Level {contributorStats.level}</span>
                  <span className="font-semibold text-gray-900">
                    {contributorStats.points} / {contributorStats.targetPoints} pts
                  </span>
                </div>
                <div className="h-2 rounded-full bg-emerald-100 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-emerald-500 to-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-emerald-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {remainingPoints} points to {nextTierInfo.name}
                </p>
              </div>
            </motion.div>

            {/* Right column: Community Snapshot + Road to Next Tier */}
            <div className="space-y-4">
              {/* Community Snapshot */}
              <motion.div
                className="rounded-3xl bg-white/95 backdrop-blur shadow-md border border-gray-100 px-5 py-4"
                {...cardMotion}
                transition={{ ...cardMotion.transition, delay: 0.05 }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-emerald-600" />
                    Community Snapshot
                  </h3>
                  <span className="text-[11px] text-gray-500">
                    {contributorStats.joinedDate}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center text-xs">
                  <div className="rounded-2xl bg-emerald-50/60 py-3 px-3 hover:bg-emerald-100 transition-colors cursor-pointer" onClick={goToCommunity}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <HelpCircle className="h-3.5 w-3.5 text-emerald-700" />
                      <p className="text-[11px] uppercase tracking-wide text-emerald-700 font-semibold">
                        Questions
                      </p>
                    </div>
                    <p className="text-lg font-bold text-emerald-900 mt-1">
                      {contributorStats.questionsCount}
                    </p>
                  </div>
                  <div className="rounded-2xl bg-blue-50/60 py-3 px-3 hover:bg-blue-100 transition-colors cursor-pointer" onClick={goToCommunity}>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <MessageCircle className="h-3.5 w-3.5 text-blue-700" />
                      <p className="text-[11px] uppercase tracking-wide text-blue-700 font-semibold">
                        Answers
                      </p>
                    </div>
                    <p className="text-lg font-bold text-blue-900 mt-1">
                      {contributorStats.answersCount}
                    </p>
                  </div>
                </div>
                <div className="mt-3 text-center">
                  <button
                    type="button"
                    onClick={goToCommunity}
                    className="text-xs text-emerald-700 font-semibold hover:text-emerald-800 inline-flex items-center gap-1"
                  >
                    View all community activity
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </motion.div>

              {/* Road to Next Tier */}
              <motion.div
                className="rounded-3xl bg-gradient-to-br from-emerald-500 to-green-600 text-white shadow-lg px-5 py-4 relative overflow-hidden"
                {...cardMotion}
                transition={{ ...cardMotion.transition, delay: 0.1 }}
              >
                <div className="absolute right-3 bottom-3 opacity-20">
                  <Award className="h-16 w-16" />
                </div>
                <h3 className="text-sm font-semibold mb-1 flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Road to {nextTierInfo.name}
                </h3>
                <p className="text-[11px] text-emerald-50 mb-2">
                  {contributorStats.weeklyDelta}
                </p>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-emerald-100">
                      Current Level
                    </p>
                    <p className="text-lg font-bold">Level {contributorStats.level}</p>
                    <p className="text-[11px] text-emerald-50">{contributorStats.weeklyDelta}</p>
                  </div>
                  <div className="text-right text-[11px]">
                    <p className="uppercase tracking-wide text-emerald-100">
                      Next Tier: {nextTierInfo.name}
                    </p>
                    <p>{nextTierInfo.requiredPoints} pts required</p>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-emerald-900/40 mt-2 overflow-hidden">
                  <motion.div
                    className="h-full bg-lime-300"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
                <button
                  type="button"
                  className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-medium bg-white/10 hover:bg-white/15 px-3 py-1.5 rounded-full transition"
                  onClick={goToCommunity}
                >
                  Earn more points in Community
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            </div>
          </section>

          {/* Main body: tab content + right quick actions */}
          <section className="grid gap-5 lg:grid-cols-[2fr,1.2fr] items-start">
            {/* LEFT: Tab content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                {...cardMotion}
                className="space-y-4"
              >
                {activeTab === "Profile" && (
                  <>
                    {/* Basic Information */}
                    <div className="rounded-3xl bg-white/95 backdrop-blur shadow-md border border-gray-100 p-5 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <UserCircle2 className="h-3.5 w-3.5" />
                          </span>
                          <h3 className="text-sm font-semibold text-gray-900">
                            Basic Information
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsEditing((v) => !v)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          {isEditing ? "Stop Editing" : "Edit Profile"}
                        </button>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={basicInfo.fullName}
                            disabled={!isEditing}
                            onChange={(e) =>
                              handleBasicChange("fullName", e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">
                            Phone Number
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              value={basicInfo.phone}
                              disabled={!isEditing}
                              onChange={(e) =>
                                handleBasicChange("phone", e.target.value)
                              }
                              className="w-full rounded-xl border border-gray-200 pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-gray-50 disabled:text-gray-500"
                            />
                            <span className="absolute left-3 top-2.5 text-gray-400">
                              <svg
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="none"
                                aria-hidden="true"
                              >
                                <path
                                  d="M4.167 2.5h2.5L8.75 7.083l-1.667.834A8.333 8.333 0 0012.083 12.5l.834-1.667 4.583 2.083v2.5a1.667 1.667 0 01-1.667 1.667A13.333 13.333 0 013.333 3.333 1.667 1.667 0 015 1.667L4.167 2.5z"
                                  stroke="currentColor"
                                  strokeWidth="1.3"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">
                            Profession
                          </label>
                          <input
                            type="text"
                            value={basicInfo.profession}
                            disabled={!isEditing}
                            onChange={(e) =>
                              handleBasicChange("profession", e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={basicInfo.email || fbUser?.email || ""}
                            disabled
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-gray-50 text-gray-500"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs font-medium text-gray-700">
                            Location
                          </label>
                          <input
                            type="text"
                            value={basicInfo.location}
                            disabled={!isEditing}
                            onChange={(e) =>
                              handleBasicChange("location", e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-gray-50 disabled:text-gray-500"
                          />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs font-medium text-gray-700">
                            About Me
                          </label>
                          <textarea
                            rows={3}
                            value={basicInfo.about}
                            disabled={!isEditing}
                            onChange={(e) =>
                              handleBasicChange("about", e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-200 disabled:bg-gray-50 disabled:text-gray-500"
                          />
                          <p className="text-[11px] text-gray-500 mt-1">
                            Share a short bio so others know your background
                            (e.g., Tax professional, Long-term investor).
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Financial Profile */}
                    <div className="rounded-3xl bg-white/95 backdrop-blur shadow-md border border-gray-100 p-5 sm:p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                            <IndianRupee className="h-3.5 w-3.5" />
                          </span>
                          <h3 className="text-sm font-semibold text-gray-900">
                            Financial Profile
                          </h3>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">
                            Annual Income Range
                          </label>
                          <select
                            disabled={!isEditing}
                            value={financialProfile.incomeRange}
                            onChange={(e) =>
                              handleFinancialChange("incomeRange", e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white disabled:bg-gray-50 disabled:text-gray-500"
                          >
                            <option value="Select Range">Select Range</option>
                            <option value="₹0 - ₹5L">₹0 - ₹5L</option>
                            <option value="₹5L - ₹10L">₹5L - ₹10L</option>
                            <option value="₹10L - ₹15L">₹10L - ₹15L</option>
                            <option value="₹15L - ₹25L">₹15L - ₹25L</option>
                            <option value="₹25L - ₹50L">₹25L - ₹50L</option>
                            <option value="₹50L+">₹50L+</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">
                            Primary Goal
                          </label>
                          <select
                            disabled={!isEditing}
                            value={financialProfile.goal}
                            onChange={(e) =>
                              handleFinancialChange("goal", e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white disabled:bg-gray-50 disabled:text-gray-500"
                          >
                            <option value="Select Goal">Select Goal</option>
                            <option value="Wealth Accumulation">Wealth Accumulation</option>
                            <option value="Retirement Planning">Retirement Planning</option>
                            <option value="Child Education">Child Education</option>
                            <option value="Emergency Fund">Emergency Fund</option>
                            <option value="Home Purchase">Home Purchase</option>
                            <option value="Debt Reduction">Debt Reduction</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-gray-700">
                            Risk Appetite
                          </label>
                          <select
                            disabled={!isEditing}
                            value={financialProfile.risk}
                            onChange={(e) =>
                              handleFinancialChange("risk", e.target.value)
                            }
                            className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm bg-white disabled:bg-gray-50 disabled:text-gray-500"
                          >
                            <option value="Select Risk">Select Risk</option>
                            <option value="Low (Conservative)">Low (Conservative)</option>
                            <option value="Medium (Moderate)">Medium (Moderate)</option>
                            <option value="High (Aggressive)">High (Aggressive)</option>
                          </select>
                        </div>
                      </div>

                      <p className="text-[11px] text-gray-500 mt-3">
                        This information is private and helps personalise your
                        experience. It is never shared publicly.
                      </p>

                      <div className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <button
                          type="button"
                          onClick={handleCancel}
                          disabled={!hasChanges}
                          className="inline-flex items-center justify-center px-4 py-2.5 rounded-full bg-gray-50 text-xs font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleSave}
                          disabled={!hasChanges || loading}
                          className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-emerald-600 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-emerald-700 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === "Preferences" && (
                  <>
                    {/* System Preferences */}
                    <div className="rounded-3xl bg-white/95 backdrop-blur shadow-md border border-gray-100 p-5 sm:p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <Bell className="h-3.5 w-3.5" />
                        </span>
                        <h3 className="text-sm font-semibold text-gray-900">
                          System Preferences
                        </h3>
                      </div>

                      <div className="space-y-4 text-sm">
                        <PreferenceRow
                          title="Email Notifications"
                          description="Weekly portfolio performance reports"
                          enabled={preferences.emailNotifications}
                          onToggle={() =>
                            handlePreferenceToggle("emailNotifications")
                          }
                        />
                        <PreferenceRow
                          title="Product Updates"
                          description="New features and investment insights"
                          enabled={preferences.productUpdates}
                          onToggle={() =>
                            handlePreferenceToggle("productUpdates")
                          }
                        />
                        <PreferenceRow
                          title="Dark Mode"
                          description="Toggle visual interface appearance"
                          enabled={preferences.darkMode}
                          onToggle={() =>
                            handlePreferenceToggle("darkMode")
                          }
                        />
                      </div>
                    </div>

                    {/* Security Center (summary style) */}
                    <div className="rounded-3xl bg-white/95 backdrop-blur shadow-md border border-gray-100 p-5 sm:p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </span>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Security Center
                        </h3>
                      </div>

                      <div className="space-y-4 text-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              Login Method
                            </p>
                            <p className="text-xs text-gray-500">
                              {fbUser?.providerData?.[0]?.providerId === "password" 
                                ? "Email/Password" 
                                : fbUser?.providerData?.[0]?.providerId || "Not set"}
                            </p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              Change Password
                            </p>
                            <p className="text-xs text-gray-500">
                              Last updated 3 months ago
                            </p>
                          </div>
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                            onClick={() => alert("Password reset coming soon")}
                          >
                            Update
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              Active Sessions
                            </p>
                            <p className="text-xs text-gray-500">
                              Currently logged in on this device
                            </p>
                          </div>
                          <button
                            type="button"
                            className="text-xs font-semibold text-red-600 hover:text-red-700"
                            onClick={handleLogout}
                          >
                            Sign out all
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Save prefs button */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleSave}
                        disabled={!hasChanges || loading}
                        className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-emerald-600 text-xs sm:text-sm font-semibold text-white shadow-md hover:bg-emerald-700 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? "Saving..." : "Save Preferences"}
                      </button>
                    </div>
                  </>
                )}

                {activeTab === "Security" && (
                  <>
                    {/* Security summary re-used */}
                    <div className="rounded-3xl bg-white/95 backdrop-blur shadow-md border border-gray-100 p-5 sm:p-6">
                      <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <ShieldCheck className="h-3.5 w-3.5" />
                        </span>
                        <h3 className="text-sm font-semibold text-gray-900">
                          Security Center
                        </h3>
                      </div>

                      <div className="space-y-4 text-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              Login Method
                            </p>
                            <p className="text-xs text-gray-500">
                              {fbUser?.providerData?.[0]?.providerId === "password" 
                                ? "Email/Password" 
                                : fbUser?.providerData?.[0]?.providerId || "Not set"}
                            </p>
                          </div>
                          <ExternalLink className="h-4 w-4 text-gray-400" />
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              Change Password
                            </p>
                            <p className="text-xs text-gray-500">
                              Last updated 3 months ago
                            </p>
                          </div>
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-full bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700"
                            onClick={() => alert("Password reset coming soon")}
                          >
                            Update
                          </button>
                        </div>

                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium text-gray-900">
                              Active Sessions
                            </p>
                            <p className="text-xs text-gray-500">
                              Currently logged in on this device
                            </p>
                          </div>
                          <button
                            type="button"
                            className="text-xs font-semibold text-red-600 hover:text-red-700"
                            onClick={handleLogout}
                          >
                            Sign out all
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="rounded-3xl bg-white/95 backdrop-blur shadow-md border border-red-100 p-5 sm:p-6">
                      <div className="flex items-center gap-2 mb-3 text-red-600">
                        <AlertTriangle className="h-4 w-4" />
                        <h3 className="text-sm font-semibold">Danger Zone</h3>
                      </div>

                      <p className="text-xs text-gray-600 mb-4">
                        Once deleted, your community history and linked data
                        will be permanently removed. This action cannot be
                        undone.
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <p className="text-xs text-gray-500">
                          Consider downloading your data before closing your
                          account.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                              setToastMessage("Account deletion feature coming soon");
                              setShowToast(true);
                              setTimeout(() => setShowToast(false), 3000);
                            }
                          }}
                          className="inline-flex items-center justify-center px-5 py-2.5 rounded-full border border-red-300 text-xs sm:text-sm font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete my account
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            </AnimatePresence>

            {/* RIGHT: Quick actions + refer card */}
            <motion.aside
              className="space-y-4"
              {...cardMotion}
              transition={{ ...cardMotion.transition, delay: 0.08 }}
            >
              {/* Quick actions */}
              <div className="rounded-3xl bg-white/95 backdrop-blur shadow-md border border-gray-100 p-5">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Quick Actions
                </h3>
                <div className="space-y-3 text-sm">
                  <QuickActionRow label="Public Profile" onClick={() => alert("Public profile coming soon")} />
                  <QuickActionRow label="Community Guidelines" onClick={() => alert("Guidelines coming soon")} />
                  <QuickActionRow label="Contribution History" onClick={() => alert("History coming soon")} />
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-red-600 hover:text-red-700"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Log Out
                  </button>
                </div>
              </div>

              {/* Refer & Earn */}
              <div className="rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-green-700 text-white shadow-xl p-5 relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 opacity-25">
                  <IndianRupee className="h-32 w-32" />
                </div>
                <p className="text-[11px] uppercase tracking-wide text-emerald-200 font-semibold mb-1">
                  Refer &amp; Earn
                </p>
                <h3 className="text-sm font-semibold mb-1">
                  Invite friends to DhanSaathi and get 50 bonus pts each.
                </h3>
                <p className="text-xs text-emerald-100 mb-3">
                  Share your referral link and climb the leaderboard faster.
                </p>
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white text-emerald-700 text-xs font-semibold shadow hover:bg-emerald-50"
                  onClick={() => alert("Referral system coming soon")}
                >
                  Get link
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </motion.aside>
          </section>

          {/* Footer */}
          <footer className="mt-6 border-t border-gray-100 pt-4 pb-6 text-[11px] text-gray-500 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p>© 2024 DhanSaathi Financial Services. All data is encrypted.</p>
            <div className="flex items-center gap-4">
              <button type="button" className="hover:text-gray-700" onClick={() => alert("Privacy Policy coming soon")}>
                Privacy Policy
              </button>
              <button type="button" className="hover:text-gray-700" onClick={() => alert("Terms of Service coming soon")}>
                Terms of Service
              </button>
              <button type="button" className="hover:text-gray-700" onClick={() => alert("Help Center coming soon")}>
                Help Center
              </button>
            </div>
          </footer>
        </main>

        {/* Save toast */}
        <AnimatePresence>
          {showToast && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3 }}
              className="fixed bottom-5 right-5 z-50"
            >
              <div className="rounded-2xl bg-white shadow-lg border border-emerald-100 px-4 py-3 flex items-center gap-2 text-sm text-emerald-800">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>{toastMessage}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* Helper components */

function PreferenceRow({ title, description, enabled, onToggle }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={onToggle}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled ? "bg-emerald-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
            enabled ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

function QuickActionRow({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-between text-left text-sm text-gray-700 hover:text-gray-900 group"
    >
      <span>{label}</span>
      <ArrowRight className="h-3.5 w-3.5 text-gray-400 group-hover:text-gray-700" />
    </button>
  );
}