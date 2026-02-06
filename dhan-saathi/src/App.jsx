import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import SplashScreen from "./components/screens/SplashScreen";
import LanguageSelection from "./components/screens/LanguageSelection";
import SignupScreen from "./components/screens/SignupScreen";
import OTPScreen from "./components/screens/OTPScreen";
import TutorialScreen from "./components/screens/TutorialScreen";
import LearnScreen from "./components/screens/LearnScreen";
import HelpScreen from "./components/screens/HelpScreen";
import VoiceProfileSetup from "./components/screens/VoiceProfileSetup";
import DashboardScreen from "./components/screens/DashboardScreen";
import SchemesScreen from "./components/screens/SchemesScreen";
import CommunityScreen from "./components/screens/CommunityScreen";
import AskAIScreen from "./components/screens/AskAIScreen"; // ✅ add
import TrackerScreen from "./components/screens/TrackerScreen";
import SchemeDetailScreen from "./components/screens/SchemeDetailScreen";
import ProfileScreen from "./components/screens/ProfileScreen";



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/language-select" element={<LanguageSelection />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/otp" element={<OTPScreen />} />
        <Route path="/tutorial" element={<TutorialScreen />} />

        <Route path="/voice-setup" element={<VoiceProfileSetup />} />

        <Route path="/home" element={<DashboardScreen />} />
        <Route path="/schemes" element={<SchemesScreen />} />
        <Route path="/community" element={<CommunityScreen />} />
        <Route path="/ask-ai" element={<AskAIScreen />} /> {/* ✅ add */}
        <Route path="/tracker" element={<TrackerScreen />} />
         <Route path="/schemes/:schemeId" element={<SchemeDetailScreen />} />

        <Route path="*" element={<Navigate to="/" replace />} />

        <Route path="/learn" element={<LearnScreen />} />
        <Route path="/help" element={<HelpScreen />} />
         <Route path="/profile" element={<ProfileScreen />} />

      
      </Routes>
    </Router>
  );
}

export default App; 