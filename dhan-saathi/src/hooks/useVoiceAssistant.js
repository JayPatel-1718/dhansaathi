import { useState, useEffect, useCallback } from 'react';

// Voice Assistant Hook
export const useVoiceAssistant = () => {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [language, setLanguage] = useState('en-IN');
  const [error, setError] = useState('');
  const [isSupported, setIsSupported] = useState(false);

  // Initialize speech recognition
  const initSpeechRecognition = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      setIsSupported(false);
      setError('Speech recognition not supported in your browser');
      return null;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = language;
    recognition.maxAlternatives = 1;
    
    setIsSupported(true);
    return recognition;
  }, [language]);

  // Initialize speech synthesis
  const initSpeechSynthesis = useCallback(() => {
    if (!window.speechSynthesis) {
      setIsSupported(false);
      setError('Speech synthesis not supported in your browser');
      return null;
    }
    
    // Load voices
    const voices = window.speechSynthesis.getVoices();
    let selectedVoice = voices.find(voice => 
      voice.lang.includes(language) || 
      voice.lang.includes('en-IN') ||
      voice.name.toLowerCase().includes('india')
    ) || voices[0];
    
    return { synthesis: window.speechSynthesis, voice: selectedVoice };
  }, [language]);

  // Start voice input
  const startVoiceInput = useCallback((onTranscriptReceived) => {
    setError('');
    setTranscript('');
    
    const recognition = initSpeechRecognition();
    if (!recognition) return;

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      const isFinal = event.results[0].isFinal;
      
      if (isFinal) {
        setTranscript(transcript);
        if (onTranscriptReceived) {
          onTranscriptReceived(transcript);
        }
      }
    };

    recognition.onerror = (event) => {
      setError(`Voice recognition error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    try {
      recognition.start();
      setIsListening(true);
    } catch (error) {
      setError(error.message);
      setIsListening(false);
    }
  }, [initSpeechRecognition]);

  // Stop voice input
  const stopVoiceInput = useCallback(() => {
    const recognition = initSpeechRecognition();
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  }, [initSpeechRecognition, isListening]);

  // Speak text
  const speak = useCallback((text) => {
    setError('');
    
    const synth = initSpeechSynthesis();
    if (!synth) return;

    // Cancel any ongoing speech
    synth.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    
    // Configure voice
    if (synth.voice) {
      utterance.voice = synth.voice;
    }
    
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Event handlers
    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (event) => {
      setError(`Speech synthesis error: ${event.error}`);
      setIsSpeaking(false);
    };

    // Start speaking
    synth.synthesis.speak(utterance);
  }, [initSpeechSynthesis, language]);

  // Stop speaking
  const stopSpeaking = useCallback(() => {
    const synth = initSpeechSynthesis();
    if (synth) {
      synth.synthesis.cancel();
      setIsSpeaking(false);
    }
  }, [initSpeechSynthesis]);

  // Toggle language between English and Hindi
  const toggleLanguage = useCallback(() => {
    const newLang = language === 'en-IN' ? 'hi-IN' : 'en-IN';
    setLanguage(newLang);
  }, [language]);

  // Check browser support on mount
  useEffect(() => {
    const checkSupport = () => {
      const hasRecognition = !!(window.SpeechRecognition || window.webkitSpeechRecognition);
      const hasSynthesis = !!window.speechSynthesis;
      setIsSupported(hasRecognition && hasSynthesis);
      
      if (!hasRecognition) {
        setError('Speech recognition not supported. Try Chrome or Edge browser.');
      } else if (!hasSynthesis) {
        setError('Speech synthesis not supported.');
      }
    };
    
    checkSupport();
    
    // Force voices to load
    window.speechSynthesis?.getVoices();
  }, []);

  return {
    isListening,
    isSpeaking,
    transcript,
    language,
    error,
    isSupported,
    startVoiceInput,
    stopVoiceInput,
    speak,
    stopSpeaking,
    toggleLanguage,
    setLanguage,
  };
};

// Default export for convenience
export default useVoiceAssistant;