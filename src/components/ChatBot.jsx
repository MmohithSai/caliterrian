import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, ChevronRight } from "lucide-react";

const QUICK_OPTIONS = [
  { label: "Book Free Trial", value: "I want to book a free trial session" },
  { label: "Adult Programs", value: "Tell me about adult calisthenics programs" },
  { label: "Kids Programs", value: "Tell me about kids calisthenics classes" },
  { label: "Weight Loss", value: "How can I lose weight with calisthenics?" },
  { label: "Location & Timing", value: "What are the timings and location?" },
  { label: "Speak to Coach", value: "I'd like to speak to a coach directly" },
];

// Hardcoded bot responses for Phase 1 (no API)
const BOT_RESPONSES = {
  "trial": "Great choice! You can book a free trial at Cali Terrain by calling us at 8688458907 or chatting on WhatsApp. We'd love to have you!",
  "adult": "Our Adult Calisthenics program covers pull-ups, dips, push-ups, core control, and full-body strength. Suitable for all levels, 16+ years. Sessions run morning and evening.",
  "kids": "Kids Calisthenics at Cali Terrain is for ages 6-16. We focus on coordination, confidence, discipline and athletic development through fun bodyweight training.",
  "weight": "Our Weight Loss Program combines bodyweight conditioning, circuit training and progressive overload. Many members lose 10-15kg in 3-5 months!",
  "timing": "We're at SS Complex, 156/2, Sikh Rd, Bowenpally, Secunderabad 500009.\n\nMorning: 5:00 AM - 11:00 AM\nEvening: 5:00 PM - 10:00 PM\n\nCall: 8688458907",
  "coach": "You can speak to Coach Vidya Sagar directly on WhatsApp: 8688458907. He'll be happy to discuss your fitness goals!",
  "default": "Thanks for reaching out! For specific questions, please call us at 8688458907 or visit us at Cali Terrain, Bowenpally. We're always happy to help!",
};

const WELCOME_MESSAGE = {
  role: "assistant",
  content: "Hi! Welcome to Cali Terrain.\n\nHow can we help you today? Choose an option below or type your question.",
  id: "welcome",
};

function getBotResponse(text) {
  const lower = text.toLowerCase();
  if (lower.includes("trial") || lower.includes("book")) return BOT_RESPONSES.trial;
  if (lower.includes("adult") || lower.includes("calisthenics")) return BOT_RESPONSES.adult;
  if (lower.includes("kid") || lower.includes("child")) return BOT_RESPONSES.kids;
  if (lower.includes("weight") || lower.includes("lose") || lower.includes("fat")) return BOT_RESPONSES.weight;
  if (lower.includes("timing") || lower.includes("location") || lower.includes("where") || lower.includes("when")) return BOT_RESPONSES.timing;
  if (lower.includes("coach") || lower.includes("speak")) return BOT_RESPONSES.coach;
  return BOT_RESPONSES.default;
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showOptions, setShowOptions] = useState(true);
  const messagesEndRef = useRef(null);
  const idCounter = useRef(0);
  const nextId = () => `m${++idCounter.current}`;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Seed the welcome message the first time the panel opens (no effect needed).
  const toggleOpen = () => {
    const next = !open;
    setOpen(next);
    if (next && messages.length === 0) setMessages([WELCOME_MESSAGE]);
  };

  useEffect(() => { scrollToBottom(); }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    setShowOptions(false);
    const userMsg = { role: "user", content: text, id: nextId() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // Simulate delay then respond
    setTimeout(() => {
      const response = getBotResponse(text);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response, id: nextId() },
      ]);
      setLoading(false);
    }, 800);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        data-testid="chatbot-toggle-btn"
        onClick={toggleOpen}
        className={`fixed bottom-4 left-4 z-50 w-14 h-14 rounded-full flex items-center justify-center shadow-md shadow-black/25 transition-all duration-300 ${
          open ? "bg-[#1A1A1A] border border-white/20" : "bg-[#2EC4B6]"
        }`}
        aria-label="Open chat"
      >
        {open ? <X className="w-5 h-5 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>

      {/* Chat Window */}
      {open && (
        <div
          data-testid="chatbot-window"
          className="fixed bottom-20 left-4 z-50 w-80 sm:w-96 bg-[#111111] border border-white/10 shadow-2xl flex flex-col"
          style={{ height: "480px", maxHeight: "calc(100vh - 120px)" }}
        >
          {/* Header */}
          <div className="bg-[#2EC4B6] px-4 py-3 flex items-center gap-3">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <MessageCircle className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm font-heading tracking-wide">CALI TERRAIN</p>
              <p className="text-white/70 text-xs">AI Assistant • Usually replies instantly</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                  msg.role === "user"
                    ? "bg-[#2EC4B6] text-white"
                    : "bg-[#1A1A1A] border border-white/10 text-zinc-200"
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-[#1A1A1A] border border-white/10 px-4 py-3 flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-[#2EC4B6] rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#2EC4B6] rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 bg-[#2EC4B6] rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}

            {/* Quick Options */}
            {showOptions && messages.length > 0 && (
              <div className="flex flex-col gap-2 mt-2">
                {QUICK_OPTIONS.map((opt) => (
                  <button
                    key={opt.label}
                    onClick={() => sendMessage(opt.value)}
                    className="flex items-center justify-between text-left text-xs text-white bg-[#1A1A1A] border border-white/10 hover:border-[#2EC4B6] px-3 py-2 transition-colors duration-200"
                  >
                    {opt.label}
                    <ChevronRight className="w-3 h-3 text-[#2EC4B6] flex-shrink-0" />
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSubmit} className="border-t border-white/10 p-3 flex gap-2">
            <input
              data-testid="chatbot-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 bg-[#1A1A1A] border border-white/10 text-white text-sm px-3 py-2 outline-none focus:border-[#2EC4B6] placeholder-zinc-600 transition-colors duration-200"
              disabled={loading}
            />
            <button
              data-testid="chatbot-send-btn"
              type="submit"
              disabled={loading || !input.trim()}
              className="w-10 h-10 bg-[#2EC4B6] hover:bg-[#25A599] disabled:opacity-50 flex items-center justify-center transition-colors duration-200"
            >
              <Send className="w-4 h-4 text-white" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
