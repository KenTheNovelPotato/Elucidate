import React, { useRef, useEffect } from 'react';
import { Message, Role } from '../types';
import { Send, User, Bot, Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
  placeholder?: string;
  initialValue?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  messages, 
  isLoading, 
  onSendMessage,
  placeholder = "Type your prompt here...",
  initialValue = ""
}) => {
  const [inputValue, setInputValue] = React.useState(initialValue);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (initialValue) setInputValue(initialValue);
  }, [initialValue]);

  // Auto-resize textarea logic
  useEffect(() => {
    const textarea = inputRef.current;
    if (textarea) {
      // Reset height to auto to shrink if text was deleted
      textarea.style.height = 'auto';
      // Set to scrollHeight to fit content, capped at 300px (approx 10-12 lines)
      // We use 56px as the base height (matches h-14)
      const newHeight = Math.max(56, Math.min(textarea.scrollHeight, 300));
      textarea.style.height = `${newHeight}px`;
    }
  }, [inputValue]);

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    onSendMessage(inputValue);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-dark-900 rounded-xl border border-dark-800 overflow-hidden shadow-2xl">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
            <Bot size={48} className="mb-4" />
            <p>Start the conversation...</p>
          </div>
        )}
        
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex gap-3 ${msg.role === Role.USER ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === Role.MODEL && (
              <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={18} className="text-white" />
              </div>
            )}
            
            <div 
              className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === Role.USER 
                  ? 'bg-brand-600 text-white rounded-tr-none' 
                  : msg.isError 
                    ? 'bg-red-900/30 text-red-200 border border-red-800' 
                    : 'bg-dark-800 text-slate-200 rounded-tl-none border border-dark-700'
              }`}
            >
              {msg.text}
            </div>

            {msg.role === Role.USER && (
              <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0 mt-1">
                <User size={18} className="text-slate-300" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
             <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot size={18} className="text-white" />
              </div>
              <div className="bg-dark-800 text-slate-200 rounded-2xl rounded-tl-none border border-dark-700 p-3 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-brand-400" />
                <span className="text-xs text-slate-400">Generating...</span>
              </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-dark-950 border-t border-dark-800">
        <div className="relative">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={1}
            className="w-full bg-dark-800 text-white rounded-xl py-3 pl-4 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-brand-500 border border-transparent focus:border-brand-500 transition-all placeholder:text-slate-500 min-h-[56px] overflow-y-auto"
            style={{ maxHeight: '300px' }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            className="absolute right-2 bottom-3 p-2 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:hover:bg-brand-600 text-white rounded-lg transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="text-[10px] text-slate-500 mt-2 text-center">
          Gemini may display inaccurate info, including about people, so double-check its responses.
        </div>
      </div>
    </div>
  );
};