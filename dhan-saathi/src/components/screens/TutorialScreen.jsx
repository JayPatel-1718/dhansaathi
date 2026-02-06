// src/components/screens/TutorialScreen.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Mic,
  Volume2,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  UserRound,
  FileText,
  Bot,
  Users,
  PhoneCall,
  IndianRupee,
} from "lucide-react";

export default function TutorialScreen() {
  const navigate = useNavigate();

  // language + voice
  const [selectedLanguage, setSelectedLanguage] = useState("english");
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const lang = localStorage.getItem("dhan-saathi-language") || "hindi";
    setSelectedLanguage(lang);
  }, []);

  const speak = (text) => {
    try {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      if (selectedLanguage === "hindi") msg.lang = "hi-IN";
      else if (selectedLanguage === "tamil") msg.lang = "ta-IN";
      else if (selectedLanguage === "telugu") msg.lang = "te-IN";
      else msg.lang = "en-IN";
      window.speechSynthesis.speak(msg);
    } catch {
      // ignore
    }
  };

  // STEP CONTENT (English text kept simple; TTS can still speak local language)
  const steps = useMemo(
    () => [
      {
        id: 1,
        title: "Add your basic details",
        description:
          "Tell DhanSaathi simple things about you, like your age, work and goals, so we can guide you better.",
        icon: (
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#6EE830] to-emerald-400 flex items-center justify-center shadow-md">
            <UserRound className="h-7 w-7 text-white" />
          </div>
        ),
      },
      {
        id: 2,
        title: "Explore government schemes",
        description:
          "See government and bank schemes in one place. Find what matches your family, farming, business or savings.",
        icon: (
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-lime-300 flex items-center justify-center shadow-md">
            <FileText className="h-7 w-7 text-white" />
          </div>
        ),
      },
      {
        id: 3,
        title: "Get instant AI guidance",
        description:
          "Our AI assistant checks basic eligibility and explains schemes in simple, clear language for you.",
        icon: (
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#6EE830] to-green-500 flex items-center justify-center shadow-md">
            <Bot className="h-7 w-7 text-white" />
          </div>
        ),
      },
      {
        id: 4,
        title: "Learn from the community",
        description:
          "Ask questions, read real stories and learn from other families, farmers and small business owners.",
        icon: (
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-400 flex items-center justify-center shadow-md">
            <Users className="h-7 w-7 text-white" />
          </div>
        ),
      },
      {
        id: 5,
        title: "Get help anytime",
        description:
          "If you feel confused, you can always ask DhanSaathi or call for support. You are never alone.",
        icon: (
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-lime-400 to-emerald-500 flex items-center justify-center shadow-md">
            <PhoneCall className="h-7 w-7 text-white" />
          </div>
        ),
      },
    ],
    []
  );

  const totalSteps = steps.length;
  const step = steps[currentStep];

  const handleListen = () => {
    const textToSpeak = `${step.title}. ${step.description}`;
    speak(textToSpeak);
  };

  const handleFinish = () => {
    // mark tutorial completed so you can skip for existing users
    localStorage.setItem("dhan-saathi-tutorial-completed", "true");

    const userType = localStorage.getItem("dhan-saathi-user-type");
    // simple routing rule: registered users go to voice setup, guests to home
    if (userType === "guest") {
      navigate("/home", { replace: true });
    } else {
      navigate("/voice-setup", { replace: true });
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((s) => s - 1);
    }
  };

  return (
    <>
      {/* Custom animations / gradients */}
      <style>{`
        @keyframes bubbleFloatA {
          0% { transform: translate(0px,0px) scale(1); opacity: 0.75; }
          50% { transform: translate(18px,-16px) scale(1.08); opacity: 1; }
          100% { transform: translate(0px,0px) scale(1); opacity: 0.75; }
        }
        @keyframes bubbleFloatB {
          0% { transform: translate(0px,0px) scale(1); opacity: 0.65; }
          50% { transform: translate(-16px,18px) scale(1.04); opacity: 1; }
          100% { transform: translate(0px,0px) scale(1); opacity: 0.65; }
        }
        @keyframes micGlow {
          0% { box-shadow: 0 0 0 0 rgba(110,232,48,0.4); }
          70% { box-shadow: 0 0 0 14px rgba(110,232,48,0); }
          100% { box-shadow: 0 0 0 0 rgba(110,232,48,0); }
        }
      `}</style>

      <div className="min-h-screen flex flex-col bg-gradient-to-b from-[#f4ffe9] via-white to-[#e9ffe5] relative overflow-hidden">
        {/* Floating blobs for background */}
        <div className="pointer-events-none absolute -top-32 -left-32 h-[260px] w-[260px] rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(110,232,48,0.55)_0%,rgba(110,232,48,0.18)_40%,transparent_70%)] blur-2xl animate-[bubbleFloatA_16s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute top-[40%] -right-40 h-[280px] w-[280px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(74,222,128,0.50)_0%,rgba(45,212,191,0.22)_40%,transparent_70%)] blur-2xl animate-[bubbleFloatB_20s_ease-in-out_infinite]" />

        {/* Header */}
        <header className="px-4 pt-4 pb-3 sm:px-6 sm:pt-6 relative z-10">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-[#6EE830] flex items-center justify-center shadow-md">
                <IndianRupee className="h-5 w-5 text-white" />
              </div>
              <div className="leading-tight">
                <p className="text-xs uppercase tracking-wide text-gray-500">
                  DhanSaathi
                </p>
                <p className="text-sm font-semibold text-gray-800">
                  Quick Tutorial
                </p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-xs text-gray-500">
                Step {currentStep + 1} of {totalSteps}
              </p>
              <div className="mt-1 h-1.5 w-24 bg-gray-200/70 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#6EE830] to-emerald-500 transition-all duration-300"
                  style={{
                    width: `${((currentStep + 1) / totalSteps) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 flex items-stretch px-4 pb-28 sm:px-6 relative z-10">
          <div className="w-full max-w-md mx-auto flex flex-col justify-center">
            {/* Glass card */}
            <div className="relative rounded-3xl bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_18px_45px_rgba(22,163,74,0.18)] px-5 py-6 sm:px-6 sm:py-7">
              {/* step icon + title */}
              <div className="flex items-start gap-4">
                {step.icon}
                <div>
                  <p className="text-xs font-medium tracking-wide uppercase text-emerald-600">
                    DhanSaathi in 30 seconds
                  </p>
                  <h1 className="mt-1 text-xl sm:text-2xl font-bold text-gray-900">
                    {step.title}
                  </h1>
                </div>
              </div>

              {/* description */}
              <p className="mt-4 text-sm sm:text-base text-gray-700 leading-relaxed">
                {step.description}
              </p>

              {/* Listen row */}
              <div className="mt-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handleListen}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 text-emerald-700 text-sm font-semibold border border-emerald-100 shadow-sm hover:bg-emerald-100/80 transition"
                >
                  <Volume2 className="h-4 w-4" />
                  Listen
                </button>

                <p className="text-[11px] text-gray-500 text-right leading-snug">
                  Tap “Listen” if reading is difficult. DhanSaathi will speak
                  this step aloud.
                </p>
              </div>

              {/* Bottom nav buttons (Prev / Next or Get Started) */}
              <div className="mt-6 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrev}
                  disabled={currentStep === 0}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-medium border transition ${
                    currentStep === 0
                      ? "border-gray-200 text-gray-300 cursor-default"
                      : "border-gray-200 text-gray-600 bg-white/70 hover:bg-gray-50"
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </button>

                {currentStep < totalSteps - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="ml-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#6EE830] to-emerald-500 shadow-md hover:shadow-lg hover:translate-y-[-1px] transition"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="ml-auto inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-[#6EE830] via-lime-400 to-emerald-500 shadow-md hover:shadow-lg hover:translate-y-[-1px] transition"
                  >
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Step dots */}
              <div className="mt-5 flex items-center justify-center gap-2">
                {steps.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setCurrentStep(idx)}
                    className={`h-2.5 rounded-full transition-all ${
                      idx === currentStep
                        ? "w-6 bg-gradient-to-r from-[#6EE830] to-emerald-500"
                        : "w-1.5 bg-gray-300/80"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Helper text under card */}
            <p className="mt-4 text-xs text-gray-500 text-center">
              DhanSaathi will never ask for your bank OTP, UPI PIN, or password.
            </p>
          </div>
        </main>

        {/* Floating mic at bottom center */}
        <div className="fixed inset-x-0 bottom-4 flex flex-col items-center justify-center pointer-events-none z-20">
          <button
            type="button"
            onClick={() =>
              speak(
                "You can use your voice anytime to ask DhanSaathi for help."
              )
            }
            className="pointer-events-auto relative h-16 w-16 rounded-full bg-gradient-to-br from-[#6EE830] via-emerald-400 to-lime-400 flex items-center justify-center text-white shadow-xl hover:scale-105 transition-transform"
            style={{ animation: "micGlow 2s infinite" }}
          >
            <Mic className="h-7 w-7" />
          </button>
          <p className="mt-2 text-[11px] text-gray-600 font-medium">
            You can use voice anytime
          </p>
        </div>
      </div>
    </>
  );
}