import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  X, 
  Minus, 
  Send, 
  Sparkles, 
  Trash2, 
  MessageSquare, 
  ArrowDownCircle,
  HelpCircle,
  Compass,
  CheckCircle2
} from 'lucide-react';
import { processUserMessage } from '../services/guideBuddyService';

export default function GuideBuddy({ classrooms = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [lastRoomId, setLastRoomId] = useState(null);

  // Initial welcome message setup
  const initialMessage = {
    id: 'welcome-1',
    sender: 'bot',
    text: "Hi! I'm GuideBuddy 👋\nI can help you find classrooms, check occupancy, and understand the Smart Classroom dashboard.",
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    suggestions: [
      'Find a vacant classroom',
      'Which rooms are occupied?',
      'Show classroom status',
      'How does this system work?',
      'Help'
    ]
  };

  const [messages, setMessages] = useState([initialMessage]);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);

  // Quick Action presets at bottom of chat panel
  const quickActions = [
    { label: 'Find Vacant Room', query: 'Find a vacant classroom' },
    { label: 'Occupied Rooms', query: 'Which rooms are occupied?' },
    { label: 'Full Rooms', query: 'Which classroom is full?' },
    { label: 'FF05 Status', query: 'What is the current status of FF05?' },
    { label: 'How It Works', query: 'How does the PIR sensor work?' },
  ];

  // Auto-scroll on new message or state change
  useEffect(() => {
    if (isOpen && !isMinimized) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen, isMinimized]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, isMinimized]);

  // ESC key handler to close/minimize chat panel
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Handle message submission
  const handleSendMessage = async (textToSend) => {
    const text = (textToSend || inputMessage).trim();
    if (!text) return;

    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Append user message
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: userTimestamp
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    try {
      // Process through GuideBuddy NLU engine
      const response = await processUserMessage(text, classrooms, { lastRoomId });

      // Update context memory if room was referenced
      if (response.referencedRoomId) {
        setLastRoomId(response.referencedRoomId);
      }

      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error("GuideBuddy Error:", err);
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: "I encountered a minor issue processing your request. Please try asking again!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([initialMessage]);
    setLastRoomId(null);
  };

  // Helper renderer to render basic markdown formatting (bold, list items) cleanly
  const renderFormattedText = (text) => {
    const lines = text.split('\n');
    return lines.map((line, lIdx) => {
      // Process bold formatting **word**
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedLine = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-slate-900">{part.slice(2, -2)}</strong>;
        }
        return part;
      });

      return (
        <React.Fragment key={lIdx}>
          {formattedLine}
          {lIdx < lines.length - 1 && <br />}
        </React.Fragment>
      );
    });
  };

  return (
    <>
      {/* ==================================================
          FLOATING TRIGGER BUTTON (Bottom-Right)
          ================================================== */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center space-x-2 group">
          {/* Tooltip Label */}
          <div className="hidden sm:flex items-center px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold shadow-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 text-sky-400 mr-1.5 animate-pulse" />
            <span>GuideBuddy</span>
          </div>

          <button
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            aria-label="Open GuideBuddy Smart Classroom Assistant"
            className="relative w-14 h-14 rounded-full bg-sky-500 hover:bg-sky-600 text-white shadow-xl shadow-sky-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 border-2 border-white focus:outline-none focus:ring-4 focus:ring-sky-300"
          >
            <Bot className="w-7 h-7 text-white" />
            {/* Status dot */}
            <span className="absolute top-0 right-0 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-300 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white"></span>
            </span>
          </button>
        </div>
      )}

      {/* ==================================================
          MINIMIZED BAR (When minimized)
          ================================================== */}
      {isOpen && isMinimized && (
        <div className="fixed bottom-5 right-5 z-50 bg-white border border-sky-200 rounded-2xl shadow-xl p-3 flex items-center space-x-3 hover:shadow-2xl transition-all">
          <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center text-white">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">GuideBuddy</h4>
            <p className="text-[10px] text-slate-500">Smart Assistant Active</p>
          </div>
          <button
            onClick={() => setIsMinimized(false)}
            className="p-1.5 hover:bg-sky-50 rounded-lg text-slate-500 hover:text-sky-600 transition-colors"
            title="Expand"
          >
            <MessageSquare className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 hover:bg-rose-50 rounded-lg text-slate-500 hover:text-rose-600 transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ==================================================
          MAIN CHATBOT PANEL (Desktop & Mobile Responsive)
          ================================================== */}
      {isOpen && !isMinimized && (
        <div 
          role="dialog"
          aria-label="GuideBuddy Smart Classroom Assistant Chat Window"
          className="fixed inset-2 sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[410px] sm:h-[620px] max-h-[92vh] bg-white rounded-2xl border border-sky-200/80 shadow-2xl z-50 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200"
        >
          {/* 1. CHATBOT HEADER */}
          <div className="px-4 py-3.5 bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 text-white flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-inner">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5">
                  <h3 className="font-extrabold text-base tracking-tight font-outfit text-white">GuideBuddy</h3>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-sky-400/30 text-sky-100 border border-sky-300/30">
                    AI Active
                  </span>
                </div>
                <p className="text-xs text-sky-100/90 font-medium">Your Smart Classroom Assistant</p>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center space-x-1">
              <button
                onClick={clearChat}
                className="p-1.5 text-sky-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Clear Chat History"
                aria-label="Clear chat history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1.5 text-sky-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Minimize"
                aria-label="Minimize chatbot panel"
              >
                <Minus className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-sky-100 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                title="Close"
                aria-label="Close chatbot panel"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 2. MESSAGES CONTAINER */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/70">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}
                >
                  <div className="flex items-end space-x-2 max-w-[88%]">
                    {isBot && (
                      <div className="w-7 h-7 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center flex-shrink-0 mb-1">
                        <Bot className="w-4 h-4 text-sky-600" />
                      </div>
                    )}

                    <div
                      className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        isBot
                          ? 'bg-white text-slate-800 border border-sky-100 shadow-sm rounded-tl-xs'
                          : 'bg-sky-600 text-white rounded-tr-xs shadow-sm font-medium'
                      }`}
                    >
                      {renderFormattedText(msg.text)}

                      {/* Initial Suggestion Buttons if provided */}
                      {msg.suggestions && msg.suggestions.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Suggestions:</p>
                          <div className="flex flex-col space-y-1">
                            {msg.suggestions.map((sug, sIdx) => (
                              <button
                                key={sIdx}
                                onClick={() => handleSendMessage(sug)}
                                className="w-full text-left px-3 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-semibold border border-sky-200 transition-colors duration-150 flex items-center justify-between"
                              >
                                <span>{sug}</span>
                                <ChevronRight className="w-3.5 h-3.5 text-sky-500" />
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              );
            })}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-sky-100 border border-sky-200 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-sky-600 animate-bounce" />
                </div>
                <div className="bg-white border border-sky-100 shadow-sm rounded-2xl rounded-tl-xs px-4 py-3 flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping"></span>
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping delay-100"></span>
                  <span className="w-2 h-2 rounded-full bg-sky-600 animate-ping delay-200"></span>
                  <span className="text-xs text-slate-400 ml-1 font-medium">GuideBuddy is thinking...</span>
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* 3. QUICK ACTION BAR */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 flex items-center space-x-1.5 overflow-x-auto scrollbar-none">
            {quickActions.map((qa, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qa.query)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 hover:bg-sky-100 text-slate-700 hover:text-sky-800 border border-slate-200 hover:border-sky-300 transition-all duration-150 flex-shrink-0"
              >
                {qa.label}
              </button>
            ))}
          </div>

          {/* 4. CHAT INPUT AREA */}
          <div className="p-3 bg-white border-t border-sky-100 flex items-center space-x-2">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask GuideBuddy a question..."
              aria-label="Ask GuideBuddy a question"
              className="flex-1 bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white focus:ring-2 focus:ring-sky-200 text-slate-800 text-sm rounded-xl px-3.5 py-2.5 outline-none transition-all placeholder:text-slate-400"
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              aria-label="Send message to GuideBuddy"
              className="w-10 h-10 rounded-xl bg-sky-500 hover:bg-sky-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all duration-150 shadow-md shadow-sky-200 flex-shrink-0 focus:outline-none focus:ring-2 focus:ring-sky-400"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Chevron helper icon
function ChevronRight(props) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24" 
      strokeWidth={2.5} 
      stroke="currentColor" 
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  );
}
