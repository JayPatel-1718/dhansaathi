import React, { useState } from 'react';
import { MessageCircle } from 'lucide-react';
import SaathiChatbot from './screens/SaathiChatbot';
import '../styles/chatbot.css';

const ChatbotWidget = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Button */}
            {!isOpen && (
                <button
                    className="chatbot-widget-button"
                    onClick={() => setIsOpen(true)}
                    title="Open Saathi Assistant"
                    aria-label="Open Saathi Assistant"
                >
                    <MessageCircle size={28} />
                </button>
            )}

            {/* Chatbot Modal */}
            {isOpen && (
                <div className="chatbot-modal-overlay">
                    <SaathiChatbot onClose={() => setIsOpen(false)} />
                </div>
            )}
        </>
    );
};

export default ChatbotWidget;
