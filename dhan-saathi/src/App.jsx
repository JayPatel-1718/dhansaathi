import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SplashScreen from './components/screens/SplashScreen';
import LanguageSelection from './components/screens/LanguageSelection';
import SignupScreen from './components/screens/SignupScreen';
import './styles/globals.css';
import OTPScreen from './components/screens/OTPScreen';

// Temporary screens for next steps
const TutorialScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
    <div className="bg-white rounded-3xl p-8 shadow-lg max-w-md w-full text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Tutorial Screen</h2>
      <p className="text-gray-600 mb-6">Step 3 of 4 - Coming soon</p>
      <button 
        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full"
        onClick={() => window.history.back()}
      >
        Go Back
      </button>
    </div>
  </div>
);

const HomeScreen = () => (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white p-4">
    <div className="bg-white rounded-3xl p-8 shadow-lg max-w-md w-full text-center">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Home Dashboard</h2>
      <p className="text-gray-600 mb-6">Step 4 of 4 - Coming soon</p>
      <button 
        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-full"
        onClick={() => window.history.back()}
      >
        Go Back
      </button>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/language-select" element={<LanguageSelection />} />
        <Route path="/signup" element={<SignupScreen />} />
        <Route path="/otp" element={<OTPScreen />} />
        <Route path="/tutorial" element={<TutorialScreen />} />
        <Route path="/home" element={<HomeScreen />} />
      </Routes>
    </Router>
  );
}

export default App;