import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Send,
    User,
    Bot,
    HelpCircle,
    ChevronRight,
    ExternalLink,
    AlertTriangle,
    MessageSquare,
    Info,
    RefreshCw,
    X
} from 'lucide-react';
import { SCHEME_DB, GENERAL_FAQS, analyzeQuery, OCCUPATIONS } from '../utils/chatbotUtils';
import '../../styles/chatbot.css';

const ChatMessage = ({ msg, onSchemeClick }) => {
    const isBot = msg.role === 'saathi';
    const language = msg.language || 'en';

    return (
        <div className={`chatbot-message-wrapper ${isBot ? 'saathi-msg' : 'user-msg'}`}>
            <div className="chatbot-avatar">
                {isBot ? <Bot size={18} /> : <User size={18} />}
            </div>
            <div className="chatbot-bubble">
                {msg.type === 'warning' && (
                    <div className="chatbot-warning-alert">
                        <AlertTriangle size={16} />
                        <span>{language === 'hi' ? 'सुरक्षा अनुस्मारक' : 'Security Reminder'}</span>
                    </div>
                )}
                <div className="chatbot-text">{msg.text}</div>

                {msg.type === 'recommendation' && msg.recommendations && (
                    <div className="chatbot-recommendations-grid">
                        {msg.recommendations.map((scheme, idx) => (
                            <div 
                                key={idx} 
                                className="recommendation-mini-card"
                                onClick={() => onSchemeClick(scheme)}
                                style={{ cursor: 'pointer' }}
                            >
                                <div className="mini-card-header">
                                    <span className="mini-card-name">{scheme.name}</span>
                                    <span className="mini-card-tag">{scheme.tags[0]}</span>
                                </div>
                                <p className="mini-card-desc">{scheme.desc}</p>
                                <div className="mini-card-link" style={{ cursor: 'pointer' }}>
                                    {language === 'hi' ? 'विवरण देखें' : 'View Details'} <ChevronRight size={14} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {msg.scheme && msg.type !== 'recommendation' && (
                    <div className="chatbot-scheme-details">
                        <div className="scheme-info-row">
                            <strong>{language === 'hi' ? 'लाभार्थी:' : 'Beneficiary:'}</strong> <span>{msg.scheme.eligibility}</span>
                        </div>
                        <div className="scheme-links mt-3">
                            <a
                                href={msg.scheme.officialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="chatbot-link-btn"
                            >
                                {language === 'hi' ? 'आधिकारिक पोर्टल' : 'Official Portal'} <ExternalLink size={14} />
                            </a>
                        </div>
                    </div>
                )}

                <div className="chatbot-time">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
            </div>
        </div>
    );
};

const SaathiChatbot = ({ onClose }) => {
    const navigate = useNavigate();
    const [language, setLanguage] = useState(localStorage.getItem('dhan-saathi-language') || 'en');
    const [messages, setMessages] = useState([
        {
            role: 'saathi',
            text: language === 'hi'
                ? "नमस्ते! 👋 मैं आपका **साथी** सलाहकार हूँ। आपके बारे में बताएं ताकि मैं आपके लिए उपयुक्त सरकारी योजनाएं सुझा सकूँ।"
                : "Namaste! 👋 I'm your **Saathi** advisor. Tell me about yourself so I can suggest relevant government schemes for you.",
            timestamp: Date.now(),
            type: 'initial',
            language: language
        }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef(null);

    // Sync language with localStorage
    useEffect(() => {
        const storedLang = localStorage.getItem('dhan-saathi-language') || 'en';
        if (storedLang !== language) {
            setLanguage(storedLang);
        }
    }, []);

    // Reset messages when language changes
    useEffect(() => {
        setMessages([
            {
                role: 'saathi',
                text: language === 'hi'
                    ? "नमस्ते! 👋 मैं आपका **साथी** सलाहकार हूँ। आपके बारे में बताएं ताकि मैं आपके लिए उपयुक्त सरकारी योजनाएं सुझा सकूँ।"
                    : "Namaste! 👋 I'm your **Saathi** advisor. Tell me about yourself so I can suggest relevant government schemes for you.",
                timestamp: Date.now(),
                type: 'initial',
                language: language
            }
        ]);
    }, [language]);

    const scrollToBottom = () => {
        if (scrollRef.current) {
            setTimeout(() => {
                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
            }, 0);
        }
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSchemeClick = (scheme) => {
        // Close chatbot and navigate to schemes page with scheme filter
        onClose();
        
        // Navigate to schemes page
        navigate('/schemes', { 
            state: { 
                highlightScheme: scheme.name,
                schemeData: scheme 
            } 
        });
    };

    const handleSend = (text) => {
        const query = text || inputValue;
        if (!query.trim()) return;

        // Update localStorage
        localStorage.setItem('dhan-saathi-language', language);

        setMessages(prev => [...prev, { 
            role: 'user', 
            text: query, 
            timestamp: Date.now(),
            language: language
        }]);
        setInputValue('');
        setIsTyping(true);

        setTimeout(() => {
            const response = analyzeQuery(query, language);
            setMessages(prev => [...prev, {
                role: 'saathi',
                text: response.text,
                type: response.type,
                recommendations: response.data,
                scheme: response.data && response.data.length === 1 ? response.data[0] : null,
                timestamp: Date.now(),
                language: language
            }]);
            setIsTyping(false);
        }, 1200);
    };

    // no external voice prop (mic feature removed)

    return (
        <div className="chatbot-container">
            <div className="chatbot-card">
                <div className="chatbot-header">
                    <div className="chatbot-header-info">
                        <div className="chatbot-online-indicator"></div>
                        <div>
                            <h2 className="chatbot-title">🤖 Saathi Bot</h2>
                            <p className="chatbot-status">{language === 'hi' ? 'स्मार्ट सहायक' : 'Smart Assistant'}</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <div className="chatbot-lang-toggle">
                            <button 
                                className={`lang-btn ${language === 'en' ? 'active' : ''}`} 
                                onClick={() => {
                                    setLanguage('en');
                                    localStorage.setItem('dhan-saathi-language', 'en');
                                }}
                            >
                                EN
                            </button>
                            <button 
                                className={`lang-btn ${language === 'hi' ? 'active' : ''}`} 
                                onClick={() => {
                                    setLanguage('hi');
                                    localStorage.setItem('dhan-saathi-language', 'hi');
                                }}
                            >
                                हिन्दी
                            </button>
                        </div>
                        <button 
                            onClick={onClose}
                            style={{
                                background: 'rgba(255, 255, 255, 0.2)',
                                border: 'none',
                                color: 'white',
                                width: '28px',
                                height: '28px',
                                borderRadius: '50%',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                transition: 'all 0.2s'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                <div className="chatbot-body" ref={scrollRef}>
                    <div className="chatbot-welcome-tips">
                        <div className="tip-item">
                            <div className="tip-icon blue"><Info size={14} /></div>
                            <span>
                                {language === 'hi' ? '💡 बताएं: मैं एक किसान हूँ' : '💡 Try: I am a farmer'}
                            </span>
                        </div>
                    </div>

                    {messages.map((msg, idx) => (
                        <ChatMessage key={idx} msg={msg} onSchemeClick={handleSchemeClick} />
                    ))}

                    {isTyping && (
                        <div className="chatbot-message-wrapper saathi-msg">
                            <div className="chatbot-avatar typing"><Bot size={18} /></div>
                            <div className="chatbot-bubble typing-bubble">
                                <div className="typing-dots">
                                    <span></span>
                                    <span></span>
                                    <span></span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="chatbot-footer-top">
                    <div className="faq-chips-scroll">
                        {Object.values(OCCUPATIONS).map((occ, idx) => (
                            <button 
                                key={idx} 
                                className="faq-chip" 
                                onClick={() => handleSend(occ[language] || occ.en)}
                            >
                                {occ[language] || occ.en}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="chatbot-input-area">
                    <input
                        type="text"
                        className="chatbot-input"
                        placeholder={language === 'hi' ? 'अपना काम या प्रश्न लिखें...' : 'Type your field or question...'}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    />
                    <button 
                        className="chatbot-send-btn" 
                        onClick={() => handleSend()} 
                        disabled={!inputValue.trim()}
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
            <p className="chatbot-disclaimer">
                {language === 'hi' 
                    ? '💬 परामर्श सहायक। आपके काम के आधार पर योजनाएं सुझाता है।' 
                    : '💬 Recommendation assistant. Suggests schemes based on your profession.'}
            </p>
        </div>
    );
};

export default SaathiChatbot;
