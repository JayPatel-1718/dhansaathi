import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const OTPScreen = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [stepProgress] = useState(50);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState('');
  
  const inputRefs = useRef([]);

  // Timer for OTP resend
  useEffect(() => {
    let interval;
    if (timer > 0 && !canResend) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer, canResend]);

  const handleOtpChange = (index, value) => {
    // Allow only numbers
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      setError(''); // Clear error on new input
      
      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
      
      // Auto-submit when all digits are filled
      if (newOtp.every(digit => digit !== '') && index === 5) {
        handleVerify();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d{6}$/.test(pastedData)) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      setError('');
    }
  };

  const handleVerify = () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setError('Please enter all 6 digits');
      return;
    }

    // For testing: Accept any 6-digit OTP, but show success for 123456
    if (otpString === '123456') {
      console.log('Test OTP accepted - navigating to tutorial');
    }
    
    localStorage.setItem('dhan-saathi-logged-in', 'true');
    localStorage.setItem('dhan-saathi-phone', localStorage.getItem('dhan-saathi-phone') || '9876543210');
    
    // Optional: Add a small delay for better UX
    setTimeout(() => {
      navigate('/tutorial');
    }, 300);
  };

  const handleResendOtp = () => {
    if (canResend) {
      setTimer(30);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      setError('');
      inputRefs.current[0]?.focus();
      
      // Simulate OTP resend
      console.log('OTP resent to', localStorage.getItem('dhan-saathi-phone'));
      
      // Optional: Show success message
      alert('OTP has been resent to your mobile number');
    }
  };

  const phoneNumber = localStorage.getItem('dhan-saathi-phone') || '+91 98765 43210';

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white p-6">
      {/* Progress Bar */}
      <div className="text-right mb-8">
        <div className="text-2xl font-bold text-green-600">{stepProgress}%</div>
        <div className="w-24 h-2 bg-gray-200 rounded-full mt-1 ml-auto">
          <div className="h-full bg-green-500 rounded-full" style={{ width: `${stepProgress}%` }} />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Enter OTP</h1>
        
        {/* Subtitle */}
        <p className="text-gray-600 mb-8 text-center max-w-md">
          We've sent a verification code to your mobile number
        </p>
        
        {/* Phone Number Display */}
        <div className="flex items-center gap-2 mb-8 px-4 py-2 bg-blue-50 rounded-lg">
          <span className="text-blue-600">📱</span>
          <span className="text-gray-800 font-medium">{phoneNumber}</span>
          <button 
            onClick={() => navigate('/signup')}
            className="text-blue-600 text-sm font-medium hover:text-blue-800 ml-4"
          >
            Change
          </button>
        </div>
        
        {/* OTP Input Fields */}
        <div className="flex gap-3 mb-6">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputRefs.current[index] = el)}
              id={`otp-${index}`}
              type="text"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
              className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl 
                       focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200
                       transition duration-200"
              maxLength={1}
              autoFocus={index === 0}
              inputMode="numeric"
              pattern="[0-9]*"
            />
          ))}
        </div>
        
        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm mb-4 flex items-center gap-2">
            <span>⚠️</span>
            {error}
          </div>
        )}
        
        {/* Timer/Resend OTP */}
        <div className="mb-8 text-center">
          {canResend ? (
            <button
              onClick={handleResendOtp}
              className="text-blue-600 font-medium hover:text-blue-800"
            >
              Resend OTP
            </button>
          ) : (
            <p className="text-gray-600">
              Resend OTP in <span className="font-bold">{timer}s</span>
            </p>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button
            onClick={handleVerify}
            className="w-full py-3 bg-green-600 text-white font-semibold rounded-lg 
                     hover:bg-green-700 shadow-md transition duration-200
                     focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
          >
            Verify & Continue
          </button>
          
          <button
            onClick={() => navigate(-1)}
            className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-lg 
                     hover:bg-gray-200 transition duration-200
                     focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            ← Back to Sign Up
          </button>
        </div>
        
        {/* Testing Info */}
        <div className="mt-8 p-3 bg-yellow-50 border border-yellow-200 rounded-lg max-w-sm">
          <p className="text-sm text-yellow-800 text-center">
            <span className="font-medium">For Testing:</span> Use any 6-digit OTP
            <br />
            <span className="text-xs">(Test OTP: <strong>123456</strong>)</span>
          </p>
        </div>
      </div>
      
      {/* Footer Note */}
      <div className="text-center text-gray-500 text-sm mt-8 pt-4 border-t border-gray-200">
        <p>By continuing, you agree to our 
          <a href="#" className="text-blue-600 hover:text-blue-800 ml-1">Terms</a> and 
          <a href="#" className="text-blue-600 hover:text-blue-800 ml-1">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
};

export default OTPScreen;