import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles, MessageCircle, ArrowRight } from 'lucide-react';
import type { WebsiteSettings, ChatMessage } from '../types';

interface ChatbotWidgetProps {
  settings: WebsiteSettings;
  onOpenBooking: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  settings,
  onOpenBooking,
  onScrollToSection,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [inputVal, setInputVal] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const initialGreeting: ChatMessage = {
    id: 'msg-initial',
    role: 'assistant',
    content: `Hello! Welcome to MR. CRAFT STUDIO. 👋\n\nWe help businesses grow with professional websites, creative design, AI solutions, business automation, and SEO.\n\nHow can we help you today?`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    quickActions: [
      { label: 'Explore Services', action: 'services' },
      { label: 'Get Pricing', action: 'pricing' },
      { label: 'View Portfolio', action: 'portfolio' },
      { label: 'Book a Consultation', action: 'booking' },
      { label: 'Talk on WhatsApp', action: 'whatsapp' },
    ],
  };

  const [messages, setMessages] = useState<ChatMessage[]>([initialGreeting]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (userText?: string) => {
    const textToSend = (userText || inputVal).trim();
    if (!textToSend || loading) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setLoading(true);

    try {
      const historyPayload = messages.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      const replyContent = data.reply || "I'd be pleased to connect you with our studio team directly via WhatsApp or email.";

      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        content: replyContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: data.quickActions || [
          { label: 'Book Consultation', action: 'booking' },
          { label: 'WhatsApp', action: 'whatsapp' },
        ],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      const fallbackMsg: ChatMessage = {
        id: `asst-err-${Date.now()}`,
        role: 'assistant',
        content: `I'm currently unable to reach the neural studio service, but our team is immediately available on WhatsApp at ${settings.whatsappIntl} or email at ${settings.email}.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quickActions: [
          { label: 'Chat on WhatsApp', action: 'whatsapp' },
          { label: 'Book Consultation', action: 'booking' },
        ],
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (action: string) => {
    if (action === 'booking') {
      onOpenBooking();
      setIsOpen(false);
    } else if (action === 'services') {
      onScrollToSection('services');
      setIsOpen(false);
    } else if (action === 'pricing') {
      onScrollToSection('pricing');
      setIsOpen(false);
    } else if (action === 'portfolio') {
      onScrollToSection('portfolio');
      setIsOpen(false);
    } else if (action === 'whatsapp') {
      window.open(settings.whatsappLink, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <>
      {/* Floating Trigger Button (Minimal Dark Luxury Style) */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Open Studio AI Assistant"
          className="group relative flex items-center gap-2.5 px-4 py-3 bg-[#130e09] border border-white/20 text-white hover:border-white/40 shadow-2xl transition-all duration-300 active:scale-95"
        >
          <div className="relative">
            <Bot size={18} className="text-white group-hover:text-emerald-400 transition-colors" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping opacity-75" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full" />
          </div>
          <span className="text-[11px] font-mono uppercase tracking-[0.2em] font-semibold hidden sm:inline">
            Studio AI Assistant
          </span>
        </button>
      </div>

      {/* Slide-Up Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[420px] max-h-[580px] h-[82vh] bg-[#130e09] border border-white/20 shadow-2xl flex flex-col overflow-hidden backdrop-blur-xl">
          
          {/* Header */}
          <div className="p-4 bg-white/[0.03] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-white text-[#130e09] flex items-center justify-center font-bold text-xs">
                MC
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  MR. CRAFT ASSISTANT
                </h4>
                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" />
                  Live Studio Knowledge
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-white/50 hover:text-white transition-colors border border-white/10"
              aria-label="Close Assistant"
            >
              <X size={15} />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${
                  m.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div
                  className={`max-w-[85%] p-3.5 text-xs font-light leading-relaxed whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-white text-[#130e09] font-medium'
                      : 'bg-white/[0.04] text-white/90 border border-white/10'
                  }`}
                >
                  {m.content}
                </div>

                <span className="text-[9px] font-mono text-white/30 mt-1 px-1">
                  {m.timestamp}
                </span>

                {/* Quick action chips if assistant */}
                {m.quickActions && m.quickActions.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {m.quickActions.map((qa, i) => (
                      <button
                        key={i}
                        onClick={() => handleActionClick(qa.action)}
                        className="px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/15 transition-all flex items-center gap-1"
                      >
                        {qa.action === 'whatsapp' && <MessageCircle size={10} className="text-emerald-400" />}
                        <span>{qa.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs font-mono text-white/40 p-2 bg-white/[0.02]">
                <Sparkles size={12} className="animate-spin text-white/60" />
                <span>Formulating response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="p-3 bg-white/[0.02] border-t border-white/10">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="Ask about web design, AI bots, pricing..."
                className="flex-1 p-2.5 bg-white/[0.04] border border-white/15 text-white text-xs placeholder:text-white/30 focus:border-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={!inputVal.trim() || loading}
                className="p-2.5 bg-white text-[#130e09] hover:bg-white/90 disabled:opacity-40 transition-colors"
                aria-label="Send"
              >
                <Send size={14} />
              </button>
            </form>
          </div>

        </div>
      )}
    </>
  );
};
