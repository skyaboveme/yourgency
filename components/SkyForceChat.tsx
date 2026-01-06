import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Sparkles, X, MapPin } from 'lucide-react';
import { chatWithYourgency } from '../services/geminiService';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  groundingChunks?: any[];
}

const SkyForceChat: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Hello! I'm Yourgency AI. I can help you draft emails, analyze competitors, or strategize for your next call. What's on your mind?" }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [useMaps, setUseMaps] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);

    try {
      // Format history for Gemini API
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const response = await chatWithYourgency(userMsg, history, useMaps);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: response.text,
        groundingChunks: response.groundingChunks
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "I'm having trouble connecting to Yourgency HQ. Please check your API key." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const renderGroundingSource = (chunk: any, index: number) => {
    if (chunk.web) {
      return (
        <a key={index} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs hover:bg-blue-100 transition-colors mb-1 mr-1">
          <span>🔗</span>
          <span className="truncate max-w-[150px]">{chunk.web.title || "Web Source"}</span>
        </a>
      );
    }
    if (chunk.maps) {
      return (
        <a key={index} href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 bg-green-50 text-green-700 px-2 py-1 rounded text-xs hover:bg-green-100 transition-colors mb-1 mr-1">
          <MapPin size={12} />
          <span className="truncate max-w-[150px]">{chunk.maps.title || "Map Location"}</span>
        </a>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-2xl border-l border-gray-200 flex flex-col z-50 transform transition-transform duration-300">
      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-700 text-white flex flex-col shadow-md">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center space-x-2">
            <Sparkles size={20} className="text-yellow-300" />
            <h3 className="font-bold text-lg">Yourgency Assistant</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>
        
        {/* Maps Toggle */}
        <div className="flex items-center space-x-2 bg-white/10 p-2 rounded-lg">
          <button 
            onClick={() => setUseMaps(!useMaps)}
            className={`w-10 h-5 rounded-full relative transition-colors ${useMaps ? 'bg-green-400' : 'bg-gray-400/50'}`}
          >
            <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${useMaps ? 'translate-x-5' : 'translate-x-0'}`} />
          </button>
          <span className="text-xs font-medium flex items-center">
            <MapPin size={12} className="mr-1" />
            Google Maps Data
          </span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : 'flex-row'} space-x-2`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 ${
                msg.role === 'user' ? 'bg-gray-200 text-gray-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
              </div>
              <div className="flex flex-col">
                <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-200 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
                
                {/* Render Grounding Sources if available */}
                {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                  <div className="mt-2 flex flex-wrap">
                    {msg.groundingChunks.map((chunk, i) => renderGroundingSource(chunk, i))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
             <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-200 shadow-sm ml-10">
                <Loader2 size={16} className="animate-spin text-blue-500" />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSend} className="relative">
          <input
            type="text"
            className="w-full pl-4 pr-12 py-3 bg-gray-100 border-transparent focus:bg-white border focus:border-blue-500 rounded-xl outline-none transition-all text-sm"
            placeholder={useMaps ? "Ask about locations..." : "Ask Yourgency..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-2 p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={16} />
          </button>
        </form>
        <div className="text-center mt-2">
           <p className="text-[10px] text-gray-400">Yourgency can make mistakes. Verify important info.</p>
        </div>
      </div>
    </div>
  );
};

export default SkyForceChat;