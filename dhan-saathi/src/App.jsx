import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import SplashScreen from "./components/screens/SplashScreen";
import LanguageSelection from "./components/screens/LanguageSelection";
import SignupScreen from "./components/screens/SignupScreen";
import OTPScreen from "./components/screens/OTPScreen";
import TutorialScreen from "./components/screens/TutorialScreen";

import VoiceProfileSetup from "./components/screens/VoiceProfileSetup";
import DashboardScreen from "./components/screens/DashboardScreen";

import SchemesScreen from "./components/screens/SchemesScreen";
import SchemeDetailScreen from "./components/screens/SchemeDetailScreen";

import CommunityScreen from "./components/screens/CommunityScreen";
import LearnScreen from "./components/screens/LearnScreen";
import HelpScreen from "./components/screens/HelpScreen";

import AskAIScreen from "./components/screens/AskAIScreen";
import TrackerScreen from "./components/screens/TrackerScreen";



function App() {
  return (
    <Router>
      <Routes>
        {/* Onboarding */}
        <Route path="/" element={<SplashScreen />} />
        <Route path="/language-select" element={<LanguageSelection />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/otp" element={<OTPScreen />} />
        <Route path="/tutorial" element={<TutorialScreen />} />

        {/* Voice profile setup */}
        <Route path="/voice-setup" element={<VoiceProfileSetup />} />

        {/* Main app */}
        <Route path="/home" element={<DashboardScreen />} />

        {/* Schemes */}
        <Route path="/schemes" element={<SchemesScreen />} />
        <Route path="/schemes/:schemeId" element={<SchemeDetailScreen />} />

        {/* Community */}
        <Route path="/community" element={<CommunityScreen />} />

        {/* Learn */}
        <Route path="/learn" element={<LearnScreen />} />

        {/* Help */}
        <Route path="/help" element={<HelpScreen />} />

        {/* Other pages */}
        <Route path="/ask-ai" element={<AskAIScreen />} />
        <Route path="/tracker" element={<TrackerScreen />} />

        {/* Catch-all (must be LAST) */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;