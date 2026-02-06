import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OTPScreen = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [stepProgress] = useState(50);

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleVerify = () => {
    const otpString = otp.join('');
    if (otpString.length === 6) {
      localStorage.setItem('dhan-saathi-logged-in', 'true');
      navigate('/tutorial');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-green-50 to-white p-6">
      {/* Progress */}
      <div className="text-right mb-8">
        <div className="text-2xl font-bold text-green-600">{stepProgress}%</div>
        <div className="w-24 h-2 bg-gray-200 rounded-full mt-1 ml-auto">
          <div className="h-full bg-green-500 rounded-full" style={{ width: `${stepProgress}%` }} />
        </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Enter OTP</h2>
        <p className="text-gray-600 mb-8">Sent to {localStorage.getItem('dhan-saathi-phone') || 'your number'}</p>
        
        <div className="flex gap-3 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-xl focus:border-green-500 focus:outline-none"
              maxLength={1}
            />
          ))}
        </div>
        
        <button
          onClick={handleVerify}
          className="btn-primary mb-4"
        >
          Verify OTP
        </button>
        
        <button
          onClick={() => navigate(-1)}
          className="btn-secondary"
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
};

export default OTPScreen;