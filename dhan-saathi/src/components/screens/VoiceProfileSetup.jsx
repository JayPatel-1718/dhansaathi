import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import {
  getUserDoc,
  saveUserProfile,
  saveUserProfileDraft,
} from "../../services/userService";
import { Mic, Volume2, Sparkles, CheckCircle2 } from "lucide-react";

/* ---------------- Speech Recognition helper ---------------- */
function getRecognition() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition || null;
  if (!SR) return null;

  const rec = new SR();
  rec.continuous = false;
  rec.interimResults = false;
  rec.maxAlternatives = 1;
  return rec;
}

/* ---------------- Component ---------------- */
export default function VoiceProfileSetup() {
  const navigate = useNavigate();
  const recognitionRef = useRef(null);

  // auth
  const [fbUser, setFbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ui state
  const [stepIndex, setStepIndex] = useState(0);
  const [listening, setListening] = useState(false);
  const [voiceError, setVoiceError] = useState("");
  const [showCustomizing, setShowCustomizing] = useState(false);

  // mouse reactive background
  const [mouse, setMouse] = useState({ x: 240, y: 260 });

  // profile fields
  const [name, setName] = useState("");
  const [gender, setGender] = useState(""); // male | female | other | prefer_not_say
  const [age, setAge] = useState(""); // numeric string
  const [occupation, setOccupation] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState(""); // numeric string

  const selectedLanguage =
    localStorage.getItem("dhan-saathi-language") || "english";
  const isHindi = selectedLanguage === "hindi";
  const voiceLang = isHindi ? "hi-IN" : "en-IN";

  // Steps
  const steps = useMemo(() => {
    const en = [
      { key: "name", prompt: "What is your name?" },
      { key: "gender", prompt: "What is your gender?" },
      { key: "age", prompt: "What is your age?" },
      { key: "occupation", prompt: "What is your occupation?" },
      { key: "income", prompt: "What is your monthly income in rupees?" },
    ];
    const hi = [
      { key: "name", prompt: "आपका नाम क्या है?" },
      { key: "gender", prompt: "आपका लिंग क्या है?" },
      { key: "age", prompt: "आपकी उम्र कितनी है?" },
      { key: "occupation", prompt: "आपका काम क्या है?" },
      { key: "income", prompt: "आपकी मासिक आय कितनी है? रुपये में बताएं।" },
    ];
    return isHindi ? hi : en;
  }, [isHindi]);

  const currentStep = steps[stepIndex];

  // Voice TTS
  const speak = (text) => {
    try {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(text);
      msg.lang = voiceLang;
      window.speechSynthesis.speak(msg);
    } catch {
      // ignore
    }
  };

  // mic permission (may fail if blocked; typing still works)
  const ensureMicPermission = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return true;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((t) => t.stop());
    return true;
  };

  // parsing helpers
  const parseDigits = (text) => (text || "").replace(/[^\d]/g, "") || "";

  const normalizeGender = (text) => {
    const t = String(text || "").toLowerCase().trim();

    // English
    if (t.includes("male") || t.includes("man") || t.includes("boy")) return "male";
    if (t.includes("female") || t.includes("woman") || t.includes("girl")) return "female";
    if (t.includes("other") || t.includes("non")) return "other";
    if (t.includes("prefer") || t.includes("not say") || t.includes("no")) return "prefer_not_say";

    // Hindi (rough)
    if (t.includes("पुरुष") || t.includes("लड़का") || t.includes("आदमी")) return "male";
    if (t.includes("महिला") || t.includes("औरत") || t.includes("लड़की")) return "female";
    if (t.includes("अन्य")) return "other";
    if (t.includes("नहीं") || t.includes("मत") || t.includes("न बत")) return "prefer_not_say";

    return "";
  };

  // Load user + resume draft
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

        const draft = docData?.profileDraft || {};
        if (draft?.name) setName(String(draft.name));
        if (draft?.gender) setGender(String(draft.gender));
        if (draft?.age) setAge(String(draft.age));
        if (draft?.occupation) setOccupation(String(draft.occupation));
        if (draft?.monthlyIncome) setMonthlyIncome(String(draft.monthlyIncome));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    });

    return () => unsub();
  }, [navigate]);

  // speak prompt when step changes
  useEffect(() => {
    if (loading) return;
    if (!currentStep) return;
    speak(currentStep.prompt);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, loading]);

  // set value based on step
  const setValueForStep = (text) => {
    const t = String(text || "").trim();
    if (!t || !currentStep) return;

    if (currentStep.key === "name") setName(t);

    if (currentStep.key === "gender") {
      const g = normalizeGender(t);
      if (g) setGender(g);
      else setVoiceError(isHindi ? "कृपया पुरुष/महिला/अन्य बोलें" : "Please say male/female/other");
    }

    if (currentStep.key === "age") setAge(parseDigits(t));
    if (currentStep.key === "occupation") setOccupation(t);
    if (currentStep.key === "income") setMonthlyIncome(parseDigits(t));
  };

  // Start voice listening
  const startListening = async () => {
    setVoiceError("");

    const rec = getRecognition();
    if (!rec) {
      setVoiceError(
        "Voice input is not supported in this browser. Use Chrome/Edge or type."
      );
      return;
    }

    try {
      await ensureMicPermission();
    } catch (e) {
      console.error("Mic permission error:", e);
      setVoiceError(
        isHindi
          ? "माइक की अनुमति नहीं मिली। कृपया अनुमति दें या टाइप करें।"
          : "Microphone permission blocked. Allow mic access or type."
      );
      return;
    }

    recognitionRef.current = rec;
    rec.lang = voiceLang;

    rec.onstart = () => setListening(true);
    rec.onend = () => setListening(false);

    rec.onerror = (e) => {
      console.error("Speech recognition error:", e);
      setListening(false);
      const code = e?.error || "unknown";

      let msg = isHindi
        ? "आवाज़ नहीं समझ पाई। कृपया फिर कोशिश करें या टाइप करें।"
        : "Could not capture voice. Try again or type.";

      if (code === "not-allowed" || code === "service-not-allowed") {
        msg = isHindi
          ? "माइक की अनुमति नहीं है। ब्राउज़र में Allow करें।"
          : "Microphone permission denied. Please allow mic access.";
      } else if (code === "no-speech") {
        msg = isHindi
          ? "आवाज़ नहीं मिली। कृपया साफ़ बोलें।"
          : "No speech detected. Please speak clearly.";
      }

      setVoiceError(msg);
    };

    rec.onresult = (event) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || "";
      setValueForStep(transcript);
    };

    try {
      rec.start();
    } catch (e) {
      console.error("rec.start failed:", e);
      setListening(false);
      setVoiceError(
        isHindi
          ? "वॉइस शुरू नहीं हुआ। टाइप करें।"
          : "Voice failed to start. Please type."
      );
    }
  };

  // currentValue getter/setter for inputs
  const currentValue = useMemo(() => {
    if (!currentStep) return "";
    if (currentStep.key === "name") return name;
    if (currentStep.key === "gender") return gender;
    if (currentStep.key === "age") return age;
    if (currentStep.key === "occupation") return occupation;
    if (currentStep.key === "income") return monthlyIncome;
    return "";
  }, [currentStep, name, gender, age, occupation, monthlyIncome]);

  const setCurrentValue = (v) => {
    if (!currentStep) return;
    if (currentStep.key === "name") setName(v);
    if (currentStep.key === "gender") setGender(v); // will be set via buttons typically
    if (currentStep.key === "age") setAge(String(v).replace(/[^\d]/g, ""));
    if (currentStep.key === "occupation") setOccupation(v);
    if (currentStep.key === "income") setMonthlyIncome(String(v).replace(/[^\d]/g, ""));
  };

  // Validation
  const canGoNext = () => {
    if (!currentStep) return false;

    if (currentStep.key === "name") return name.trim().length >= 2;

    if (currentStep.key === "gender") return !!gender;

    if (currentStep.key === "age") {
      const n = Number(age);
      return n >= 10 && n <= 100;
    }

    if (currentStep.key === "occupation") return occupation.trim().length >= 2;

    if (currentStep.key === "income") return String(monthlyIncome || "").trim().length >= 2;

    return false;
  };

  // Save draft (Firestore)
  const persistDraft = async () => {
    if (!fbUser?.uid) return;
    try {
      await saveUserProfileDraft(fbUser.uid, {
        name: name.trim(),
        gender,
        age: Number(age || 0),
        occupation: occupation.trim(),
        monthlyIncome: Number(monthlyIncome || 0),
      });
    } catch (e) {
      console.error("saveUserProfileDraft error:", e);
      // don't block UX
    }
  };

  const next = async () => {
    if (!canGoNext()) return;

    await persistDraft();

    if (stepIndex < steps.length - 1) {
      setStepIndex((s) => s + 1);
      return;
    }

    // Finish -> save final profile
    try {
      setShowCustomizing(true);
      speak(isHindi ? "आपके लिए अनुभव सेट कर रहे हैं।" : "Customizing your experience.");

      await saveUserProfile(fbUser.uid, {
        name: name.trim(),
        gender,
        age: Number(age || 0),
        occupation: occupation.trim(),
        monthlyIncome: Number(monthlyIncome || 0),
      });

      setTimeout(() => navigate("/home", { replace: true }), 1200);
    } catch (e) {
      console.error(e);
      setShowCustomizing(false);
      setVoiceError(isHindi ? "सेव नहीं हुआ। फिर कोशिश करें।" : "Failed to save. Please try again.");
    }
  };

  const back = async () => {
    if (stepIndex === 0) return;
    await persistDraft();
    setStepIndex((s) => s - 1);
  };

  // Suggestions (not for name & gender)
  const suggestions = useMemo(() => {
    if (!currentStep) return [];
    if (currentStep.key === "name") return [];
    if (currentStep.key === "gender") return [];
    if (currentStep.key === "age") return ["18", "25", "35", "45", "60"];
    if (currentStep.key === "occupation") {
      return isHindi
        ? ["किसान", "दुकानदार", "ड्राइवर", "श्रमिक", "छात्र"]
        : ["Farmer", "Shopkeeper", "Driver", "Daily wage worker", "Student"];
    }
    if (currentStep.key === "income") return ["8000", "12000", "15000", "20000", "30000"];
    return [];
  }, [currentStep, isHindi]);

  const applySuggestion = (s) => setCurrentValue(s);

  const genderOptions = useMemo(() => {
    if (!isHindi) {
      return [
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Other" },
        { value: "prefer_not_say", label: "Prefer not to say" },
      ];
    }
    return [
      { value: "male", label: "पुरुष" },
      { value: "female", label: "महिला" },
      { value: "other", label: "अन्य" },
      { value: "prefer_not_say", label: "नहीं बताना" },
    ];
  }, [isHindi]);

  const progressPct = Math.round(((stepIndex + 1) / steps.length) * 100);

  // Styles
  const glassSurface =
    "bg-white/70 backdrop-blur-2xl border border-white/60 shadow-[0_30px_90px_rgba(15,23,42,0.14)]";
  const glassButton =
    "bg-white/60 backdrop-blur-xl border border-white/70 shadow-[0_18px_50px_rgba(15,23,42,0.10)] hover:shadow-[0_24px_70px_rgba(15,23,42,0.14)] hover:-translate-y-0.5 active:translate-y-0 transition-all";

  // Loading
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

  return (
    <>
      {/* Animations */}
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
          0% { transform: translateX(-40%); opacity: 0; }
          20% { opacity: 0.22; }
          60% { opacity: 0.22; }
          100% { transform: translateX(140%); opacity: 0; }
        }
        @keyframes pulseRing {
          0% { transform: scale(0.85); opacity: 0.55; }
          70% { transform: scale(1.25); opacity: 0; }
          100% { transform: scale(1.25); opacity: 0; }
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
        {/* Blobs */}
        <div className="pointer-events-none absolute -top-48 -left-48 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(34,197,94,0.45)_0%,rgba(16,185,129,0.18)_38%,transparent_70%)] blur-3xl opacity-90 mix-blend-multiply animate-[blobA_18s_ease-in-out_infinite]" />
        <div className="pointer-events-none absolute top-[25%] -right-56 h-[620px] w-[620px] rounded-full bg-[radial-gradient(circle_at_40%_40%,rgba(16,185,129,0.40)_0%,rgba(59,130,246,0.14)_42%,transparent_72%)] blur-3xl opacity-80 mix-blend-multiply animate-[blobB_22s_ease-in-out_infinite]" />

        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="w-full max-w-2xl [perspective:1200px]">
            <div className="bg-gradient-to-br from-emerald-200/70 via-white to-slate-100/70 p-[1.5px] rounded-[28px] shadow-[0_35px_110px_rgba(15,23,42,0.18)]">
              <div
                className={`relative rounded-[26px] p-6 sm:p-8 ${glassSurface} transition-transform duration-500 hover:[transform:rotateX(1.2deg)_rotateY(-1.6deg)_translateY(-8px)]`}
              >
                {/* Sheen overlay */}
                <div className="pointer-events-none absolute inset-0 rounded-[26px] overflow-hidden">
                  <div className="absolute -inset-y-10 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-xl animate-[sheen_8s_ease-in-out_infinite]" />
                </div>

                {/* Header */}
                <div className="flex items-start justify-between gap-4 relative">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
                      <Sparkles className="h-4 w-4" />
                      {isHindi ? "वॉइस सेटअप" : "Voice Setup"}
                    </div>

                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-3">
                      {isHindi ? "अपना प्रोफ़ाइल सेट करें" : "Set up your profile"}
                    </h1>
                    <p className="text-gray-600 mt-2">
                      {isHindi
                        ? "माइक दबाकर जवाब बोलें या टाइप करें।"
                        : "Tap the mic and speak, or type your answer."}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => speak(currentStep.prompt)}
                    className={`h-11 w-11 rounded-full grid place-items-center ${glassButton}`}
                    title="Repeat question"
                  >
                    <Volume2 className="h-5 w-5 text-emerald-700" />
                  </button>
                </div>

                {/* Progress */}
                <div className="mt-6 relative">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>
                      {isHindi
                        ? `प्रश्न ${stepIndex + 1} / ${steps.length}`
                        : `Question ${stepIndex + 1} / ${steps.length}`}
                    </span>
                    <span className="font-semibold text-emerald-700">{progressPct}%</span>
                  </div>

                  <div className="h-2 bg-gray-100 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-2 bg-gradient-to-r from-emerald-600 to-green-500 rounded-full transition-all duration-500"
                      style={{ width: `${((stepIndex + 1) / steps.length) * 100}%` }}
                    />
                  </div>
                </div>

                {/* Question */}
                <div className="mt-7 relative">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {isHindi ? "प्रश्न" : "Question"}
                  </p>
                  <h2 className="mt-1 text-lg sm:text-xl font-semibold text-gray-900">
                    {currentStep.prompt}
                  </h2>
                </div>

                {/* Input */}
                <div className="mt-6 relative">
                  {currentStep.key === "gender" ? (
                    <div className="grid grid-cols-2 gap-3">
                      {genderOptions.map((opt) => {
                        const active = gender === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setGender(opt.value)}
                            className={`rounded-2xl px-4 py-3 text-left transition-all ${
                              active
                                ? "bg-emerald-600 text-white shadow-[0_20px_55px_rgba(16,185,129,0.28)] -translate-y-0.5"
                                : "bg-white/70 backdrop-blur-xl border border-white/70 shadow-sm hover:shadow-md hover:-translate-y-0.5"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">{opt.label}</span>
                              {active && <CheckCircle2 className="h-5 w-5" />}
                            </div>
                            <p className={`text-xs mt-1 ${active ? "text-white/90" : "text-gray-600"}`}>
                              {isHindi ? "टैप करें" : "Tap to select"}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="flex gap-3 items-start">
                      <div className="flex-1">
                        <input
                          value={currentValue}
                          onChange={(e) => setCurrentValue(e.target.value)}
                          placeholder={
                            currentStep.key === "income"
                              ? isHindi ? "उदाहरण: 15000" : "Example: 15000"
                              : currentStep.key === "age"
                              ? isHindi ? "उदाहरण: 28" : "Example: 28"
                              : isHindi ? "यहाँ लिखें…" : "Type here…"
                          }
                          className="w-full px-4 py-3.5 rounded-2xl bg-white/70 backdrop-blur-xl border border-white/70 shadow-[0_18px_50px_rgba(15,23,42,0.10)] outline-none focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition text-base sm:text-lg text-gray-900 placeholder:text-gray-400"
                          inputMode={
                            currentStep.key === "income" || currentStep.key === "age"
                              ? "numeric"
                              : "text"
                          }
                        />

                        {suggestions.length > 0 && (
                          <div className="mt-4 flex flex-wrap gap-2">
                            {suggestions.map((s) => (
                              <button
                                key={s}
                                type="button"
                                onClick={() => applySuggestion(s)}
                                className={`px-3 py-1.5 rounded-full text-sm ${glassButton} text-gray-800`}
                              >
                                {currentStep.key === "income" ? `₹${s}` : s}
                              </button>
                            ))}
                          </div>
                        )}

                        {currentStep.key === "income" && (
                          <p className="text-xs text-gray-500 mt-2">
                            {isHindi ? "केवल नंबर सेव होंगे।" : "Only numbers will be saved."}
                          </p>
                        )}
                        {currentStep.key === "age" && (
                          <p className="text-xs text-gray-500 mt-2">
                            {isHindi ? "केवल नंबर (10–100) स्वीकार हैं।" : "Only numbers (10–100) are accepted."}
                          </p>
                        )}
                      </div>

                      {/* Mic button */}
                      <div className="relative">
                        {listening && (
                          <div
                            className="absolute -inset-2 rounded-2xl bg-emerald-400/30"
                            style={{ animation: "pulseRing 1.2s ease-out infinite" }}
                          />
                        )}
                        <button
                          type="button"
                          onClick={startListening}
                          disabled={listening}
                          className={
                            listening
                              ? `h-12 w-12 rounded-2xl grid place-items-center ${glassButton} text-emerald-700 relative`
                              : "h-12 w-12 rounded-2xl grid place-items-center bg-emerald-600/90 backdrop-blur-xl border border-emerald-500/40 text-white shadow-[0_18px_55px_rgba(16,185,129,0.35)] hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0 transition-all relative"
                          }
                          title={isHindi ? "बोलें" : "Speak"}
                        >
                          <Mic className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                  )}

                  {voiceError && <p className="mt-3 text-sm text-red-600">{voiceError}</p>}
                </div>

                {/* Buttons */}
                <div className="mt-8 flex items-center justify-between relative">
                  <button
                    type="button"
                    onClick={back}
                    disabled={stepIndex === 0}
                    className={`px-5 py-2.5 rounded-full font-semibold transition-all
                      ${stepIndex === 0
                        ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                        : "bg-slate-950 text-white shadow-[0_18px_55px_rgba(2,6,23,0.35)] ring-1 ring-slate-900/10 hover:bg-slate-900 hover:-translate-y-0.5 active:translate-y-0"
                      }`}
                  >
                    {isHindi ? "पीछे" : "Back"}
                  </button>

                  <button
                    type="button"
                    onClick={next}
                    disabled={!canGoNext()}
                    className="px-5 py-2.5 rounded-full text-white font-semibold bg-gradient-to-r from-emerald-600/95 to-green-600/95 backdrop-blur-xl border border-white/20 shadow-[0_18px_50px_rgba(16,185,129,0.25)] hover:from-emerald-700 hover:to-green-700 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50"
                  >
                    {stepIndex < steps.length - 1 ? (isHindi ? "अगला" : "Next") : (isHindi ? "पूरा करें" : "Finish")}
                  </button>
                </div>

                {/* Tiny footer */}
                <div className="mt-6 h-1 w-24 mx-auto bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full" />
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
                {isHindi ? "आपका अनुभव सेट हो रहा है" : "Customizing your experience"}
              </h3>
              <p className="text-sm text-gray-600 mt-2">
                {isHindi ? "आपके जवाब के अनुसार सुझाव तैयार कर रहे हैं।" : "Preparing suggestions based on your answers."}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}