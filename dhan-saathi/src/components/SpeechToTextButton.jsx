import React, { useEffect, useRef, useState } from 'react';
import { Mic, X } from 'lucide-react';

export default function SpeechToTextButton({ onResult, lang = 'en-IN', ariaLabel = 'Start voice input' }) {
  const recognitionRef = useRef(null);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.onresult = null; recognitionRef.current.onend = null; recognitionRef.current.onerror = null; recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  const start = async () => {
    setError('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser.');
      return;
    }

    // Ask for permission by requesting audio stream first
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch (err) {
      setError('Microphone permission denied or unavailable.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = lang;
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => setListening(true);

      let finalTranscript = '';
      recognition.onresult = (e) => {
        const last = e.results[e.results.length - 1];
        const text = last[0].transcript || '';
        if (last.isFinal) {
          finalTranscript += text + ' ';
          if (onResult) onResult(finalTranscript.trim());
        }
      };

      recognition.onerror = (ev) => {
        setError(ev.error || 'Recognition error');
        setListening(false);
      };

      recognition.onend = () => setListening(false);

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      setError('Could not start recognition');
    }
  };

  const stop = () => {
    try {
      if (recognitionRef.current) recognitionRef.current.stop();
    } catch (e) {}
    setListening(false);
  };

  const toggle = () => {
    if (listening) stop(); else start();
  };

  return (
    <div className="inline-flex items-center gap-2">
      <button
        type="button"
        aria-label={ariaLabel}
        onClick={toggle}
        className={`p-2 rounded-full flex items-center justify-center transition ${listening ? 'bg-red-600 text-white shadow-lg animate-pulse' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
      >
        {listening ? <X className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
}
