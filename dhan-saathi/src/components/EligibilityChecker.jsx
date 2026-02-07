// src/components/EligibilityChecker.jsx
import React, { useState, useEffect } from 'react';
import { X, Check, XCircle, HelpCircle, Volume2, Mic } from 'lucide-react';

// Eligibility questions for each scheme
const ELIGIBILITY_QUESTIONS = {
  "pm-kisan": [
    {
      id: 1,
      question: "Do you own cultivable land in your name?",
      hint: "Small and marginal farmers with land ownership"
    },
    {
      id: 2,
      question: "Are you a citizen of India?",
      hint: "Scheme is for Indian citizens only"
    },
    {
      id: 3,
      question: "Is your annual income above ₹10 lakh?",
      hint: "High-income earners may not be eligible",
      reverse: true
    }
  ],
  "mudra": [
    {
      id: 1,
      question: "Do you have a small business or want to start one?",
      hint: "Manufacturing, trading, or service business"
    },
    {
      id: 2,
      question: "Is your business registered or have proper documents?",
      hint: "Shop license, GST registration, or similar"
    },
    {
      id: 3,
      question: "Do you need a loan up to ₹10 lakh?",
      hint: "MUDRA offers loans up to ₹10 lakh"
    }
  ],
  "pmjdy": [
    {
      id: 1,
      question: "Do you not have a basic savings bank account?",
      hint: "For those without existing bank accounts"
    },
    {
      id: 2,
      question: "Do you have valid ID proof (Aadhaar, PAN, etc.)?",
      hint: "Required for KYC verification"
    },
    {
      id: 3,
      question: "Are you above 10 years of age?",
      hint: "Minimum age requirement"
    }
  ],
  "apy": [
    {
      id: 1,
      question: "Is your age between 18 and 40 years?",
      hint: "Only for individuals aged 18-40 years"
    },
    {
      id: 2,
      question: "Do you have a savings bank or post office account?",
      hint: "Required for auto-debit of contributions"
    },
    {
      id: 3,
      question: "Are you working in the unorganised sector?",
      hint: "Workers without employer pension benefits"
    }
  ],
  "pmjjby": [
    {
      id: 1,
      question: "Is your age between 18 and 50 years?",
      hint: "Only for individuals aged 18-50 years"
    },
    {
      id: 2,
      question: "Do you have a savings bank account?",
      hint: "Required for premium auto-debit"
    },
    {
      id: 3,
      question: "Are you willing to pay annual premium?",
      hint: "₹436 per year premium"
    }
  ],
  "pmsby": [
    {
      id: 1,
      question: "Is your age between 18 and 70 years?",
      hint: "Only for individuals aged 18-70 years"
    },
    {
      id: 2,
      question: "Do you have a savings bank account?",
      hint: "Required for premium auto-debit"
    },
    {
      id: 3,
      question: "Are you willing to pay ₹20 annual premium?",
      hint: "Very low premium for accident cover"
    }
  ],
  "pm-svanidhi": [
    {
      id: 1,
      question: "Are you a street vendor in urban areas?",
      hint: "Operating in urban or surrounding areas"
    },
    {
      id: 2,
      question: "Do you have vending certificate or identity card?",
      hint: "Issued by Urban Local Bodies (ULBs)"
    },
    {
      id: 3,
      question: "Do you need working capital loan?",
      hint: "For resuming business activities"
    }
  ],
  "stand-up-india": [
    {
      id: 1,
      question: "Are you SC/ST or woman entrepreneur?",
      hint: "One of these categories required"
    },
    {
      id: 2,
      question: "Do you want to start a new business?",
      hint: "Greenfield (new) enterprises only"
    },
    {
      id: 3,
      question: "Is your business in manufacturing/services/trading?",
      hint: "Eligible sectors"
    }
  ],
  "ab-pmjay": [
    {
      id: 1,
      question: "Is your family in eligible socio-economic category?",
      hint: "Based on SECC data or other criteria"
    },
    {
      id: 2,
      question: "Do you have valid ID proof?",
      hint: "Aadhaar, ration card, etc."
    },
    {
      id: 3,
      question: "Are you willing to use empanelled hospitals?",
      hint: "Cashless treatment at network hospitals"
    }
  ],
  "mahila-savings": [
    {
      id: 1,
      question: "Are you a resident Indian woman?",
      hint: "Only for Indian women residents"
    },
    {
      id: 2,
      question: "Do you have valid KYC documents?",
      hint: "Aadhaar, PAN, etc."
    },
    {
      id: 3,
      question: "Can you invest for fixed tenure?",
      hint: "2-year fixed deposit scheme"
    }
  ],
  "ssy": [
    {
      id: 1,
      question: "Do you have a girl child below 10 years?",
      hint: "Account must be opened before girl turns 10"
    },
    {
      id: 2,
      question: "Are you the parent or legal guardian?",
      hint: "Only parents/guardians can open account"
    },
    {
      id: 3,
      question: "Can you make regular yearly deposits?",
      hint: "Minimum deposit required annually"
    }
  ],
  "ppf": [
    {
      id: 1,
      question: "Are you a resident Indian?",
      hint: "Only for Indian residents"
    },
    {
      id: 2,
      question: "Are you above 18 years of age?",
      hint: "Minor accounts require guardian"
    },
    {
      id: 3,
      question: "Can you invest for 15 years?",
      hint: "Long-term investment commitment"
    }
  ],
  "nsc": [
    {
      id: 1,
      question: "Are you a resident Indian?",
      hint: "Only for Indian residents"
    },
    {
      id: 2,
      question: "Do you want fixed returns?",
      hint: "Guaranteed interest rates"
    },
    {
      id: 3,
      question: "Can you invest for 5 years?",
      hint: "Medium-term investment"
    }
  ],
  "kvp": [
    {
      id: 1,
      question: "Are you a resident Indian?",
      hint: "Only for Indian residents"
    },
    {
      id: 2,
      question: "Do you want guaranteed returns?",
      hint: "Amount doubles in fixed period"
    },
    {
      id: 3,
      question: "Can you invest for long term?",
      hint: "Investment locked for specified period"
    }
  ],
  "po-savings": [
    {
      id: 1,
      question: "Do you need a basic savings account?",
      hint: "Simple account with interest"
    },
    {
      id: 2,
      question: "Do you have valid KYC documents?",
      hint: "Aadhaar, PAN, etc."
    },
    {
      id: 3,
      question: "Do you live near a post office?",
      hint: "Available at post offices nationwide"
    }
  ],
  "default": [
    {
      id: 1,
      question: "Are you an Indian citizen?",
      hint: "Most schemes require Indian citizenship"
    },
    {
      id: 2,
      question: "Do you have valid ID proof?",
      hint: "Aadhaar, PAN, or other ID documents"
    },
    {
      id: 3,
      question: "Do you have a bank account?",
      hint: "Required for most financial transactions"
    }
  ]
};

export default function EligibilityChecker({ 
  schemeId, 
  schemeTitle, 
  isOpen, 
  onClose,
  onComplete
}) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Get questions for this scheme
  const questions = ELIGIBILITY_QUESTIONS[schemeId] || ELIGIBILITY_QUESTIONS.default;
  
  // Speak the current question
  const speakQuestion = () => {
    if (!questions[currentQuestion]) return;
    
    try {
      window.speechSynthesis.cancel();
      const msg = new SpeechSynthesisUtterance(
        `${questions[currentQuestion].question}. ${questions[currentQuestion].hint}`
      );
      msg.lang = 'en-IN';
      msg.onstart = () => setIsSpeaking(true);
      msg.onend = () => setIsSpeaking(false);
      window.speechSynthesis.speak(msg);
    } catch (error) {
      console.error("Speech synthesis error:", error);
    }
  };

  // Auto-speak question when it changes
  useEffect(() => {
    if (isOpen && questions[currentQuestion]) {
      speakQuestion();
    }
  }, [currentQuestion, isOpen]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentQuestion(0);
      setAnswers({});
      setShowResult(false);
      setResult(null);
    }
  }, [isOpen]);

  const handleAnswer = (answer) => {
    const currentQ = questions[currentQuestion];
    const isReverse = currentQ.reverse;
    
    // Store answer (adjust for reverse logic questions)
    const effectiveAnswer = isReverse ? !answer : answer;
    setAnswers(prev => ({ ...prev, [currentQ.id]: effectiveAnswer }));

    // Move to next question or show results
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      calculateResult();
    }
  };

  const calculateResult = () => {
    const answerValues = Object.values(answers);
    const yesCount = answerValues.filter(ans => ans === true).length;
    const totalQuestions = questions.length;

    let resultType;
    if (yesCount === totalQuestions) {
      resultType = {
        title: "🎉 You may qualify!",
        message: "Based on your answers, you seem to meet the basic eligibility criteria for this scheme.",
        action: "Proceed to official application",
        tip: "Next steps: Gather required documents and visit the official website or nearest bank branch.",
        color: "text-emerald-600",
        bgColor: "bg-emerald-50",
        borderColor: "border-emerald-200"
      };
    } else if (yesCount >= Math.ceil(totalQuestions / 2)) {
      resultType = {
        title: "🤔 Need more details",
        message: "Some criteria need clarification. Please consult official sources or scheme helpline.",
        action: "Contact official helpline",
        tip: "You can also visit a Common Service Centre (CSC) for assistance.",
        color: "text-amber-600",
        bgColor: "bg-amber-50",
        borderColor: "border-amber-200"
      };
    } else {
      resultType = {
        title: "📝 Check official criteria",
        message: "Based on your answers, you might not meet some eligibility requirements. Please verify with official sources.",
        action: "Review official guidelines",
        tip: "Eligibility can vary based on specific circumstances. Always check the latest official rules.",
        color: "text-rose-600",
        bgColor: "bg-rose-50",
        borderColor: "border-rose-200"
      };
    }

    setResult(resultType);
    setShowResult(true);
    
    // Track completion
    if (onComplete) {
      onComplete({
        schemeId,
        schemeTitle,
        result: resultType.title.includes("qualify") ? "eligible" : 
                resultType.title.includes("details") ? "unsure" : "notEligible",
        answers,
        totalQuestions,
        yesCount
      });
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
    setResult(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 sticky top-0 bg-white">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Check Eligibility
            </h3>
            <p className="text-sm text-slate-600 mt-1">{schemeTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center"
          >
            <X className="h-5 w-5 text-slate-600" />
          </button>
        </div>

        {/* Progress bar */}
        {!showResult && (
          <div className="px-6 pt-4">
            <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <span>{Math.round(((currentQuestion + 1) / questions.length) * 100)}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-600 transition-all duration-300"
                style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Content */}
        <div className="p-6">
          {!showResult ? (
            // Questions
            <>
              <div className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <h4 className="text-xl font-bold text-slate-900">
                    {questions[currentQuestion]?.question}
                  </h4>
                  <button
                    onClick={speakQuestion}
                    disabled={isSpeaking}
                    className="h-10 w-10 rounded-full bg-blue-100 hover:bg-blue-200 flex items-center justify-center flex-shrink-0 ml-2"
                  >
                    {isSpeaking ? (
                      <Mic className="h-5 w-5 text-blue-600 animate-pulse" />
                    ) : (
                      <Volume2 className="h-5 w-5 text-blue-600" />
                    )}
                  </button>
                </div>
                <p className="text-sm text-slate-500 flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  {questions[currentQuestion]?.hint}
                </p>
              </div>

              {/* Answer buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleAnswer(true)}
                  className="p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 flex items-center justify-center gap-3 group"
                >
                  <div className="h-10 w-10 rounded-full bg-emerald-100 group-hover:bg-emerald-200 flex items-center justify-center">
                    <Check className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-emerald-900">Yes</div>
                    <div className="text-xs text-emerald-700">I meet this criteria</div>
                  </div>
                </button>

                <button
                  onClick={() => handleAnswer(false)}
                  className="p-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center justify-center gap-3 group"
                >
                  <div className="h-10 w-10 rounded-full bg-rose-100 group-hover:bg-rose-200 flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-rose-600" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-rose-900">No</div>
                    <div className="text-xs text-rose-700">I don't meet this</div>
                  </div>
                </button>
              </div>
            </>
          ) : (
            // Results
            <>
              <div className="text-center mb-6">
                <div className={`h-16 w-16 rounded-full ${result.bgColor} ${result.borderColor} border-2 flex items-center justify-center mx-auto mb-4`}>
                  {result.title.includes("🎉") ? '🎉' : result.title.includes("🤔") ? '🤔' : '📝'}
                </div>
                <h4 className={`text-2xl font-bold ${result.color} mb-2`}>
                  {result.title}
                </h4>
                <p className="text-slate-600 mb-4">
                  {result.message}
                </p>
                
                <div className="bg-slate-50 rounded-xl p-4 mb-6 text-left">
                  <div className="text-sm font-semibold text-slate-700 mb-2">
                    Your Answers Summary
                  </div>
                  {questions.map((q, idx) => (
                    <div key={q.id} className="flex items-center justify-between py-2 border-b border-slate-200 last:border-0">
                      <span className="text-sm text-slate-600">
                        {q.question}
                      </span>
                      <span className={`text-sm font-semibold ${answers[q.id] ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {answers[q.id] ? 'Yes' : 'No'}
                      </span>
                    </div>
                  ))}
                </div>

                <p className="text-sm text-slate-500 bg-blue-50 p-4 rounded-xl mb-6">
                  💡 {result.tip}
                </p>
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={restartQuiz}
                  className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Try Again
                </button>
                <button
                  onClick={onClose}
                  className="py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold"
                >
                  Continue
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-500">
            This is a simplified self-assessment. Always verify with official sources.
          </p>
        </div>
      </div>
    </div>
  );
}