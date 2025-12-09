import React, { useState, useCallback, useEffect } from 'react';
import { CURRICULUM } from './constants';
import { ChatInterface } from './components/ChatInterface';
import { LessonView } from './components/LessonView';
import { LandingPage } from './components/LandingPage';
import { HelperAvatar } from './components/HelperAvatar';
import { Message, Role, EvaluationResult, AppState } from './types';
import { streamChatResponse, evaluateChallenge } from './services/geminiService';
import { Terminal, ShieldCheck, Github, Home, RotateCcw } from 'lucide-react';

const STORAGE_KEY = 'genai_architect_progress';

function App() {
  // Initialize state from local storage if available
  const [hasStarted, setHasStarted] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof parsed.hasStarted === 'boolean' ? parsed.hasStarted : false;
      }
    } catch (e) {
      console.warn('Failed to parse progress from storage');
    }
    return false;
  });

  const [currentLessonIndex, setCurrentLessonIndex] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const savedIndex = typeof parsed.currentLessonIndex === 'number' ? parsed.currentLessonIndex : 0;
        // Ensure index is valid within current curriculum bounds
        return Math.min(Math.max(0, savedIndex), CURRICULUM.length - 1);
      }
    } catch (e) {
      console.warn('Failed to parse progress from storage');
    }
    return 0;
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  
  const currentLesson = CURRICULUM[currentLessonIndex];
  const hasNext = currentLessonIndex < CURRICULUM.length - 1;

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      hasStarted,
      currentLessonIndex
    }));
  }, [hasStarted, currentLessonIndex]);

  // Reset chat when lesson changes, pre-fill if needed
  useEffect(() => {
    // Only reset messages if we are actually switching lessons, not just reloading the page
    // We could persist messages too, but for now, let's just clear chat on lesson change
    // to keep the prompt sandbox clean for the specific challenge.
    setMessages([]);
    setEvaluation(null);
  }, [currentLessonIndex]);

  const handleResetProgress = () => {
    if (window.confirm("Are you sure you want to reset your progress? This will return you to Lesson 1.")) {
      setCurrentLessonIndex(0);
      setMessages([]);
      setEvaluation(null);
      localStorage.removeItem(STORAGE_KEY);
      // Optional: Send them back to landing page
      setHasStarted(false);
    }
  };

  const handleSendMessage = useCallback(async (text: string) => {
    // 1. Add user message
    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);
    setEvaluation(null); // Clear old eval while thinking

    try {
      // 2. Stream AI response (The "Subject" AI)
      let fullResponseText = "";
      const assistantMsgId = (Date.now() + 1).toString();
      
      // Add placeholder for assistant
      setMessages(prev => [
        ...prev, 
        { id: assistantMsgId, role: Role.MODEL, text: "", timestamp: Date.now() }
      ]);

      const stream = streamChatResponse(messages.concat(userMsg), text);

      for await (const chunk of stream) {
        fullResponseText += chunk;
        setMessages(prev => prev.map(msg => 
          msg.id === assistantMsgId 
            ? { ...msg, text: fullResponseText }
            : msg
        ));
      }

      // 3. Evaluate the interaction (The "Judge" AI)
      // We evaluate silently in the background after the response is done
      const evalResult = await evaluateChallenge(
        text, 
        fullResponseText, 
        currentLesson.challenge.criteria
      );
      setEvaluation(evalResult);

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: Role.MODEL,
        text: "Error: Failed to generate response. Check API Key.",
        isError: true,
        timestamp: Date.now()
      }]);
    } finally {
      setIsProcessing(false);
    }
  }, [messages, currentLesson]);

  const handleNextLesson = () => {
    if (hasNext) {
      setCurrentLessonIndex(prev => prev + 1);
    }
  };

  if (!hasStarted) {
    return (
      <LandingPage 
        onStart={() => setHasStarted(true)} 
        lessonProgress={currentLessonIndex}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-dark-950 text-slate-200 font-sans selection:bg-brand-500/30 animate-in fade-in duration-500">
      
      {/* Top Bar */}
      <header className="h-16 border-b border-dark-800 bg-dark-950 flex items-center justify-between px-6 flex-shrink-0 relative">
        <div className="flex items-center gap-3 z-10">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-900/50 cursor-pointer hover:bg-brand-500 transition-colors" onClick={() => setHasStarted(false)}>
            <Terminal size={20} />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-tight">GenAI Architect</h1>
            <div className="text-[10px] text-brand-400 font-mono flex items-center gap-1">
              <ShieldCheck size={10} />
              TUTOR MODE ACTIVE
            </div>
          </div>
        </div>
        
        {/* Progress Bar (Centered) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex flex-col w-64 lg:w-80">
          <div className="flex justify-between items-center mb-1.5 px-0.5">
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                  Milestone Progress
              </span>
              <span className="text-[10px] text-warm-400 font-mono">
                  {currentLessonIndex + 1}/{CURRICULUM.length}
              </span>
          </div>
          <div className="flex gap-1.5 h-1.5 w-full">
              {CURRICULUM.map((_, idx) => (
                  <div 
                      key={idx}
                      className={`h-full flex-1 rounded-full transition-all duration-500 ${
                          idx <= currentLessonIndex 
                              ? 'bg-warm-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                              : 'bg-dark-800'
                      }`}
                  />
              ))}
          </div>
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-400 z-10">
           <button 
             onClick={handleResetProgress} 
             className="hover:text-red-400 transition-colors flex items-center gap-1 text-xs" 
             title="Reset Progress"
           >
             <RotateCcw size={14} />
             <span className="hidden sm:inline">Reset</span>
           </button>
           <div className="w-px h-4 bg-dark-800 mx-1" />
           <button onClick={() => setHasStarted(false)} className="hover:text-white transition-colors" title="Home">
             <Home size={20} className="opacity-50 hover:opacity-100" />
           </button>
           <div className="hidden md:flex items-center gap-2 bg-dark-800 py-1 px-3 rounded-full border border-dark-700">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-mono">Gemini 3 Pro</span>
           </div>
           <Github size={20} className="hover:text-white cursor-pointer transition-colors opacity-50" />
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 flex overflow-hidden relative">
        {/* Left Panel: Lesson & Theory */}
        <section className="w-full md:w-[450px] lg:w-[500px] flex-shrink-0 z-10 shadow-2xl shadow-black/20">
          <LessonView 
            lesson={currentLesson} 
            evaluation={evaluation}
            isEvaluating={isProcessing}
            onNextLesson={handleNextLesson}
            hasNext={hasNext}
          />
        </section>

        {/* Right Panel: Workspace / Chat */}
        <section className="flex-1 bg-gradient-to-br from-dark-900 to-dark-950 p-4 md:p-6 flex flex-col min-w-0">
           <div className="max-w-4xl w-full mx-auto h-full flex flex-col">
              <div className="flex items-center justify-between mb-4 px-1">
                 <h3 className="text-sm font-medium text-slate-400 uppercase tracking-widest">Prompt Engineering Sandbox</h3>
                 <span className="text-xs text-slate-600 font-mono">Session ID: {Date.now().toString().slice(-6)}</span>
              </div>
              
              <div className="flex-1 min-h-0">
                <ChatInterface 
                  messages={messages}
                  isLoading={isProcessing}
                  onSendMessage={handleSendMessage}
                  initialValue={currentLesson.challenge.initialPrompt}
                  placeholder="Draft your prompt here to solve the challenge..."
                />
              </div>
           </div>
        </section>

        {/* AI Helper Avatar */}
        <HelperAvatar 
          lesson={currentLesson}
          messages={messages}
        />
      </main>
    </div>
  );
}

export default App;