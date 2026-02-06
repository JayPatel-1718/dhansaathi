import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import {
  getUserDoc,
  saveUserProfile,
  saveUserProfileDraft,
} from "../../services/userService";
import { Mic, Volume2, Sparkles } from "lucide-react";

function getRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  if (!SR) return null;

  const rec = new SR();
  rec.continuous = false;
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  return rec;
}

export default function VoiceProfileSetup() {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  const [fbUser, setFbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [stepIndex, setStepIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");

  const [name, setName] = useState("");
  const [occupation, setOccupation] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");

  const [showCustomizing, setShowCustomizing] = useState(false);

  // mouse reactive background
  const [mouse, setMouse] = useState({ x: 200, y: 200 });

  const selectedLanguage =
    localStorage.getItem("dhan-saathi-language") || "english";
  const voiceLang = selectedLanguage === "hindi" ? "hi-IN" : "en-IN";

  const steps = useMemo(() => {
    const en = [
      { key: "name", prompt: "What is your name?" },
      { key: "occupation", prompt: "What is your occupation?" },
      { key: "income", prompt: "What is your monthly income in rupees?" },
    ];
    const hi = [
      { key: "name", prompt: "आपका नाम क्या है?" },
      { key: "occupation", prompt: "आपका काम क्या है?" },
      { key: "income", prompt: "आपकी मासिक आय कितनी है? रुपये में बताएं।" },
    ];
    return selectedLanguage === "hindi" ? hi : en;
  }, [selectedLanguage]);

  const currentStep = steps[stepIndex];

  const speak = (text) => {
    try {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = voiceLang;
      window.speechSynthesis.speak(msg);
    } catch {}
  };

  const ensureMicPermission = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return true;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return true;
  };

  // ✅ Load user + resume draft if exists
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setFbUser(u || null);

      if (!u) {
        setLoading(false);
        navigate("/signup", { replace: true });
        return;
      }

      try {
        const docData = await getUserDoc(u.uid);

        if (docData?.profileComplete) {
          navigate("/home", { replace: true });
          return;
        }

        // ✅ Resume draft if it exists
        const draft = docData?.profileDraft || {};
        if (draft?.name) setName(draft.name);
        if (draft?.occupation) setOccupation(draft.occupation);
        if (draft?.monthlyIncome)
          setMonthlyIncome(String(draft.monthlyIncome));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [navigate]);

  // Speak prompt whenever step changes
  useEffect(() => {
    if (loading) return;
    if (!currentStep) return;
    speak(currentStep.prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, loading]);

  const parseIncome = (text) => {
    const digits = (text || "").replace(/[^\d]/g, "");
    return digits || "";
  };

  const setValueForStep = (text) => {
    const t = (text || "").trim();
    if (!t) return;

    if (currentStep.key === "name") setName(t);
    if (currentStep.key === "occupation") setOccupation(t);
    if (currentStep.key === "income") setMonthlyIncome(parseIncome(t));
  };

  const startListening = async () => {
    setVoiceError("");

    const rec = getRecognition();
    if (!rec) {
      setVoiceError(
        "Voice input is not supported in this browser. Please use Chrome/Edge or type the answer."
      );
      return;
    }

    try {
      await ensureMicPermission();
    } catch (e) {
      console.error("Mic permission error:", e);
      setVoiceError(
        "Microphone permission blocked. Please allow mic access or type the answer."
      );
      return;
    }

    recognitionRef.current = rec;
    rec.lang = voiceLang;

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);

    rec.onerror = (e) => {
      console.error("Speech recognition error:", e);
      const code = e?.error || "unknown";
      let msg = "Could not capture voice. Please try again or type.";

      if (code === "not-allowed" || code === "service-not-allowed") {
        msg =
          "Microphone permission denied. Please allow mic access and try again.";
      } else if (code === "audio-capture") {
        msg =
          "No microphone detected. Please connect/enable a mic and try again.";
      } else if (code === "no-speech") {
        msg =
          "No speech detected. Please speak closer to the mic and try again.";
      } else if (code === "network") {
        msg = "Network error in speech service. Check internet and try again.";
      } else if (code === "aborted") {
        msg = "Voice capture stopped. Tap the mic again.";
      }

      setVoiceError(msg);
      setListening(false);
    };

    rec.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      setValueForStep(transcript);
    };

    try {
      rec.start();
    } catch (e) {
      console.error("rec.start() failed:", e);
      setVoiceError("Could not start voice recognition. Please try again or type.");
      setListening(false);
    }
  };

  const currentValue =
    currentStep?.key === "name"
      ? name
      : currentStep?.key === "occupation"
      ? occupation
      : monthlyIncome;

  const setCurrentValue = (v) => {
    if (currentStep.key === "name") setName(v);
    if (currentStep.key === "occupation") setOccupation(v);
    if (currentStep.key === "income") setMonthlyIncome(v.replace(/[^\d]/g, ""));
  };

  const canGoNext = () => {
    if (!currentStep) return false;
    if (currentStep.key === "name") return name.trim().length >= 2;
    if (currentStep.key === "occupation") return occupation.trim().length >= 2;
    if (currentStep.key === "income") return (monthlyIncome || "").trim().length >= 2;
    return false;
  };

  const persistDraft = async () => {
    if (!fbUser?.uid) return;
    try {
      await saveUserProfileDraft(fbUser.uid, {
        name: name.trim(),
        occupation: occupation.trim(),
        monthlyIncome: Number(monthlyIncome || 0),
      });
    } catch (e) {
      console.error("saveUserProfileDraft error:", e);
    }
  };

  const next = async () => {
    if (!canGoNext()) return;

    await persistDraft();

    if (stepIndex < steps.length - 1) {
      setStepIndex((s) => s + 1);
      return;
    }

    try {
      setShowCustomizing(true);
      speak(selectedLanguage === "hindi" ? "आपके लिए अनुभव सेट कर रहे हैं।" : "Customizing your experience.");

      await saveUserProfile(fbUser.uid, {
        name: name.trim(),
        occupation: occupation.trim(),
        monthlyIncome: Number(monthlyIncome || 0),
      });

      setTimeout(() => {
        navigate("/home", { replace: true });
      }, 1200);
    } catch (e) {
      console.error(e);
      setShowCustomizing(false);
      setVoiceError("Failed to save your details. Please try again.");
    }
  };

  const back = async () => {
    if (stepIndex === 0) return;
    await persistDraft();
    setStepIndex((s) => s - 1);
  };

  // ✅ Suggestions per step
  const suggestions = useMemo(() => {
    if (!currentStep) return [];

    // ✅ remove suggestions for name step
    if (currentStep.key === "name") return [];

    if (currentStep.key === "occupation") {
      return selectedLanguage === "hindi"
        ? ["किसान", "दुकानदार", "ड्राइवर", "श्रमिक", "छात्र"]
        : ["Farmer", "Shopkeeper", "Driver", "Daily wage worker", "Student"];
    }

    if (currentStep.key === "income") {
      return ["8000", "12000", "15000", "20000", "30000"];
    }

    return [];
  }, [currentStep, selectedLanguage]);

  const applySuggestion = (s) => {
    setCurrentValue(s);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 to-white">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow">
          Loading…
        </div>
      </div>
    );
  }

  if (!currentStep) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Something went wrong. Please refresh.
      </div>
    );
  }

  const progress = Math.round(((stepIndex + 1) / steps.length) * 100);

  return (
    <>
      {/* Premium animations */}
      <style>{`
        @keyframes floaty {
          0%,100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
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
          0% { transform: translateX(-40%); opacity: 0; }
          20% { opacity: 0.25; }
          60% { opacity: 0.25; }
          100% { transform: translateX(140%); opacity: 0; }
        }
      `}</style>

      <div
        className="min-h-screen relative overflow-hidden bg-gradient-to-b from-green-50 via-white to-blue-50"
        onMouseMove={(e) => setMouse({ x: e.clientX, y: e.clientY })}
        style={{
          backgroundImage: `
            radial-gradient(700px circle at ${mouse.x}px ${mouse.y}px, rgba(16,185,129,0.16), transparent 42%),
            radial-gradient(circle at top left, rgba(187,247,208,0.55) 0, transparent 55%),
            radial-gradient(circle at bottom right, rgba(191,219,254,0.45) 0, transparent 55%)
          `,
        }}
      >
        {/* Floating blobs */}
        <div className="pointer-events-none absolute -top-48 -left-48 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(34,197,94,0.45)_0%,rgba(16,185,129,0.18)_38%,transparent_70%)] blur-3xl opacity-90 mix-blend-multiply animate-[blobA_18s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute top-[25%] -right-56 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(16,185,129,0.40)_0%,rgba(59,130,246,0.14)_42%,transparent_72%)] blur-3xl opacity-80 mix-blend-multiply animate-[blobB_22s_ease-in-out_infinite]" />

        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-2xl [perspective:1200px]">
            {/* Gradient border ring */}
            <div className="bg-gradient-to-br from-emerald-200/70 via-white to-slate-100/70 p-[1.5px] rounded-[28px] shadow-[0_35px_110px_rgba(15,23,42,0.18)]">
              {/* Glass body (3D hover tilt) */}
              <div className="relative bg-white/78 backdrop-blur-2xl border border-white/60 rounded-[26px] shadow-inner p-6 sm:p-8 transition-transform duration-500 hover:[transform:rotateX(1.3deg)_rotateY(-1.8deg)_translateY(-8px)]">
                {/* moving sheen */}
                <div className="pointer-events-none absolute inset-0 rounded-[26px] overflow-hidden">
                  <div className="absolute -inset-y-10 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-xl animate-[sheen_8s_ease-in-out_infinite]" />
                </div>

                {/* Header row */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
                      <Sparkles className="h-4 w-4" />
                      {selectedLanguage === "hindi" ? "वॉइस सेटअप" : "Voice Setup"}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
                      {selectedLanguage === "hindi" ? "अपना प्रोफ़ाइल सेट करें" : "Set up your profile"}
                    </h1>

                    <p className="text-gray-600 mt-2">
                      {selectedLanguage === "hindi"
                        ? "माइक दबाकर जवाब बोलें या टाइप करें।"
                        : "Tap the mic and speak, or type your answer."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => speak(currentStep.prompt)}
                    className="h-11 w-11 rounded-full bg-white/70 backdrop-blur border border-gray-200 grid place-items-center shadow-sm hover:shadow-md transition"
                    title="Repeat question"
                  >
                    <Volume2 className="h-5 w-5 text-emerald-700" />
                  </button>
                </div>

                {/* Progress */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      {selectedLanguage === "hindi"
                        ? `प्रश्न ${stepIndex + 1} / ${steps.length}`
                        : `Question ${stepIndex + 1} / ${steps.length}`}
                    </span>
                    <span className="font-semibold text-emerald-700">
                      {progress}%
                    </span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-emerald-600 to-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Prompt (no box) */}
                <div className="mt-7">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {selectedLanguage === "hindi" ? "प्रश्न" : "Question"}
                  </p>
                  <h2 className="mt-1 text-lg sm:text-xl font-semibold text-gray-900">
                    {currentStep.prompt}
                  </h2>
                </div>

                {/* Input + mic */}
                <div className="mt-6">
                  <div className="flex gap-3 items-start">
                    <div className="flex-1">
                      {/* ✅ Proper box for name, premium input for others */}
                      <input
                        value={currentValue}
                        onChange={(e) => setCurrentValue(e.target.value)}
                        placeholder={
                          currentStep.key === "income"
                            ? selectedLanguage === "hindi"
                              ? "उदाहरण: 15000"
                              : "Example: 15000"
                            : selectedLanguage === "hindi"
                            ? "यहाँ लिखें…"
                            : "Type here…"
                        }
                        className={
                          currentStep.key === "name"
                            ? "w-full px-4 py-3.5 rounded-2xl bg-white/85 backdrop-blur border border-gray-200 shadow-[0_18px_40px_rgba(15,23,42,0.08)] outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition text-base sm:text-lg text-gray-900 placeholder:text-gray-400"
                            : "w-full bg-transparent text-base sm:text-lg text-gray-900 placeholder:text-gray-400 outline-none border-b border-gray-200 focus:border-emerald-500 focus:ring-0 py-3 transition"
                        }
                      />

                      {/* ✅ Suggestions (NOT for name) */}
                      {suggestions.length > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          {suggestions.map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => applySuggestion(s)}
                              className="px-3 py-1.5 rounded-full text-sm border border-gray-200 bg-white/75 backdrop-blur hover:bg-white hover:border-emerald-300 hover:text-emerald-700 transition shadow-sm"
                            >
                              {currentStep.key === "income" ? `₹${s}` : s}
                            </button>
                          ))}
                        </div>
                      )}

                      {currentStep.key === "income" && (
                        <p className="text-xs text-gray-500 mt-2">
                          {selectedLanguage === "hindi"
                            ? "केवल नंबर सेव होंगे।"
                            : "Only numbers will be saved."}
                        </p>
                      )}
                    </div>

                    {/* Mic button */}
                    <button
                      type="button"
                      onClick={startListening}
                      disabled={listening}
                      className={`h-12 w-12 rounded-2xl grid place-items-center border transition ${
                        listening
                          ? "bg-emerald-100 border-emerald-200 text-emerald-700 shadow-inner"
                          : "bg-emerald-600 border-emerald-600 text-white hover:bg-emerald-700 shadow-[0_18px_55px_rgba(16,185,129,0.35)] hover:-translate-y-0.5"
                      }`}
                      title="Speak"
                    >
                      <Mic className="h-6 w-6" />
                    </button>
                  </div>

                  {voiceError && (
                    <p className="mt-3 text-sm text-red-600">{voiceError}</p>
                  )}
                </div>

                {/* Buttons */}
                <div className="mt-8 flex items-center justify-between">
                  {/* ✅ Back button made high contrast and visible */}
                  <button
                    type="button"
                    onClick={back}
                    disabled={stepIndex === 0}
                    className="px-5 py-2.5 rounded-full bg-slate-900 text-white font-semibold shadow hover:bg-slate-800 transition disabled:opacity-50 disabled:shadow-none"
                  >
                    {selectedLanguage === "hindi" ? "पीछे" : "Back"}
                  </button>

                  <button
                    type="button"
                    onClick={next}
                    disabled={!canGoNext()}
                    className="px-5 py-2.5 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 text-white font-semibold hover:from-emerald-700 hover:to-green-700 shadow-[0_18px_50px_rgba(16,185,129,0.25)] hover:-translate-y-0.5 transition disabled:opacity-50"
                  >
                    {stepIndex < steps.length - 1
                      ? selectedLanguage === "hindi"
                        ? "अगला"
                        : "Next"
                      : selectedLanguage === "hindi"
                      ? "पूरा करें"
                      : "Finish"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Customizing popup */}
          {showCustomizing && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center px-4">
              <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-200 w-full max-w-md text-center">
                <div className="h-12 w-12 rounded-full border-4 border-gray-200 border-t-emerald-600 animate-spin mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900">
                  {selectedLanguage === "hindi"
                    ? "आपका अनुभव सेट हो रहा है"
                    : "Customizing your experience"}
                </h3>
                <p className="text-sm text-gray-600 mt-2">
                  {selectedLanguage === "hindi"
                    ? "आपके जवाब के अनुसार सुझाव तैयार कर रहे हैं।"
                    : "Preparing suggestions based on your answers."}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}