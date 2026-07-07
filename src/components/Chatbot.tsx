import React, { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Loader2, Sparkles, Volume2, VolumeX } from "lucide-react";
import Markdown from "react-markdown";

interface Message {
  role: "user" | "model";
  text: string;
}

export function Chatbot({ onRecipeSaved, pantry, recipes = [] }: { onRecipeSaved?: (recipe?: any) => void, pantry?: string[], recipes?: any[] }) {

  const [isOpen, setIsOpen] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { role: "model", text: "Welcome to the Spooky Sweet Bakery. Need help finding a recipe in our spellbook, or wish to conjure a new one entirely? Ask away..." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, isTyping]);

  const speakReply = (textToSpeak: string) => {
    if (isVoiceEnabled && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = textToSpeak.replace(/[\#\*\_\[\]\(\)\`\~]/g, '');
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 0.85;
      utterance.pitch = 0.7;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput("");
    
    // Add user message to UI immediately
    const updatedMessages: Message[] = [...messages, { role: "user", text: userMsg }];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      const historyToSend = updatedMessages.slice(0, -1).map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          history: historyToSend,
          pantry: pantry || [],
          recipes: recipes || []
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to connect to the spirit realm.");
      }

      const data = await res.json();
      const botResponse = data.reply || "No spectral reply...";
      setMessages(prev => [...prev, { role: "model", text: botResponse }]);
      speakReply(botResponse);
      
      if (data.toolUsed && onRecipeSaved) {
        onRecipeSaved(data.recipeToSave);
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "model", text: "*(A magical interference occurred... Please try casting your message again.)*" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-4 rounded-full shadow-[0_4px_16px_rgba(0,0,0,0.5)] transform transition-transform filter hover:scale-110 ${isOpen ? 'hidden' : 'flex'}`}
        style={{
          background: "linear-gradient(135deg, #2a113a, #110e1b)",
          border: "2px solid #ffb7c5"
        }}
      >
        <Sparkles className="absolute text-[#98ffd9] w-4 h-4 top-1 right-1 animate-pulse" />
        <MessageCircle className="text-[#ffb7c5] w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-[calc(100vw-3rem)] sm:w-[400px] h-[550px] max-h-[85vh] z-50 rounded-2xl shadow-[0_12px_40px_rgba(0,0,0,0.7)] flex flex-col overflow-hidden" 
             style={{ 
               backgroundColor: "#171324",
               border: "2px solid #37234a"
             }}>
          
          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between"
               style={{ 
                 background: "linear-gradient(90deg, #28153c, #1f1430)",
                 borderBottom: "1px solid #c397e844"
               }}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#c397e8]" />
              <h3 className="font-bold text-[#c397e8] tracking-wide" style={{ fontFamily: "Space Grotesk, sans-serif" }}>
                Spectral Assistant
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  if (isVoiceEnabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
                  setIsVoiceEnabled(!isVoiceEnabled);
                }}
                className="text-gray-400 hover:text-[#98ffd9] transition-colors mr-2"
                title={isVoiceEnabled ? "Mute Bot Voice" : "Enable Bot Voice"}
              >
                {isVoiceEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
                title="Close Assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-sm pb-10" style={{ background: "url('/noise.png'), #171324" }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div 
                  className={`max-w-[85%] rounded-xl p-3 shadow-md ${msg.role === 'user' ? 'text-[#171324]' : 'text-gray-200'}`}
                  style={{
                    backgroundColor: msg.role === 'user' ? '#c397e8' : '#231b31',
                    border: msg.role === 'model' ? '1px solid #37284d' : 'none'
                  }}
                >
                  {msg.role === 'model' ? (
                    <div className="markdown-body prose prose-invert prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-h1:text-xl prose-h2:text-lg prose-h3:text-md">
                      <Markdown>{msg.text}</Markdown>
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-[#231b31] border border-[#37284d] rounded-xl p-3 shadow-md flex items-center gap-2 text-gray-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-[#98ffd9]" />
                  <em>Consulting the grimoire...</em>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input Area */}
          <div className="p-3" style={{ borderTop: "1px solid #37234a", background: "#1f1430" }}>
            <form onSubmit={handleSend} className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about a recipe..."
                className="w-full bg-[#171324] text-white rounded-xl py-3 pl-4 pr-12 focus:outline-none focus:ring-2 placeholder-gray-500 shadow-inner"
                style={{ 
                  fontFamily: "Inter, sans-serif",
                  border: "1px solid #37234a",
                  boxShadow: "inset 0 2px 4px rgba(0,0,0,0.3)"
                }}
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="absolute right-2 p-2 text-[#98ffd9] hover:text-white disabled:opacity-50 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
