import React, { useState, useEffect } from 'react';
import { Bot, X, Lightbulb, RefreshCw, MessageSquare } from 'lucide-react';
import { Lesson, Message } from '../types';
import { generateHint } from '../services/geminiService';

interface HelperAvatarProps {
  lesson: Lesson;
  messages: Message[];
}

export const HelperAvatar: React.FC<HelperAvatarProps> = ({ lesson, messages }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hint, setHint] = useState<string>("");
  const [isThinking, setIsThinking] = useState(false);
  const [prevMessageCount, setPrevMessageCount] = useState(messages.length);

  // Reset hint when lesson changes
  useEffect(() => {
    setHint("");
    setIsOpen(false);
  }, [lesson.id]);

  const handleGetHint = async () => {
    if (isThinking) return;
    
    setIsThinking(true);
    setIsOpen(true);
    
    try {
      const newHint = await generateHint(lesson, messages);
      setHint(newHint);
    } catch (e) {
      setHint("Oops, I lost my train of thought. Try again!");
    } finally {
      setIsThinking(false);
    }
  };

  const toggleOpen = () => {
    if (isOpen) {
      setIsOpen(false);
    } else {
      if (!hint) {
        handleGetHint();
      } else {
        setIsOpen(true);
      }
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-50 flex flex-col items-end gap-2">
      
      {/* Speech Bubble */}
      {isOpen && (
        <div className="bg-white text-slate-800 p-4 rounded-2xl rounded-br-none shadow-2xl max-w-xs animate-in fade-in slide-in-from-bottom-4 duration-300 relative border border-slate-200 mb-2">
            <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-bold text-warm-600 uppercase tracking-wide flex items-center gap-1">
                    <Lightbulb size={12} className="fill-warm-600" />
                    Helpful Tip
                </span>
                <button 
                    onClick={() => setIsOpen(false)}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={14} />
                </button>
            </div>
            
            <div className="text-sm leading-relaxed min-h-[40px]">
                {isThinking ? (
                    <div className="flex items-center gap-2 text-slate-500">
                        <div className="w-1.5 h-1.5 bg-warm-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-1.5 h-1.5 bg-warm-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-1.5 h-1.5 bg-warm-500 rounded-full animate-bounce"></div>
                    </div>
                ) : (
                   hint
                )}
            </div>

            {!isThinking && (
                <button 
                    onClick={handleGetHint}
                    className="mt-3 text-xs text-warm-600 hover:text-warm-800 font-medium flex items-center gap-1 transition-colors"
                >
                    <RefreshCw size={10} />
                    New Hint
                </button>
            )}
        </div>
      )}

      {/* Avatar / Button */}
      <button
        onClick={toggleOpen}
        className={`
            group relative flex items-center justify-center 
            transition-all duration-300 ease-in-out shadow-lg shadow-warm-900/40
            ${isOpen 
                ? 'w-14 h-14 bg-warm-500 hover:bg-warm-600 rounded-full' 
                : 'bg-warm-500 hover:bg-warm-600 px-4 py-3 rounded-full gap-2'
            }
        `}
      >
        {/* "Clippy" Eye Animation */}
        <div className="relative">
            <Bot size={isOpen ? 28 : 20} className="text-white transition-all" />
            {/* Eyes */}
            <div className="absolute top-[30%] left-[25%] flex gap-[3px]">
                <div className={`bg-white rounded-full transition-all ${isOpen ? 'w-[4px] h-[4px] animate-blink' : 'w-[2px] h-[2px]'}`} />
                <div className={`bg-white rounded-full transition-all ${isOpen ? 'w-[4px] h-[4px] animate-blink' : 'w-[2px] h-[2px]'}`} />
            </div>
        </div>

        {/* Label (Only when closed, and only on desktop to save mobile space) */}
        {!isOpen && (
            <span className="text-white font-semibold text-sm whitespace-nowrap hidden md:inline">
                Need a Hint?
            </span>
        )}
      </button>

      {/* CSS for custom blink animation */}
      <style>{`
        @keyframes blink {
            0%, 100% { transform: scaleY(1); }
            5% { transform: scaleY(0.1); }
            10% { transform: scaleY(1); }
        }
        .animate-blink {
            animation: blink 3s infinite;
        }
      `}</style>
    </div>
  );
};