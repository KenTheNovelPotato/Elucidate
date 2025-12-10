import React, { useState, useCallback, useEffect } from 'react';
import { CURRICULUM } from './constants';
import { ChatInterface } from './components/ChatInterface';
import { LessonView } from './components/LessonView';
import { LandingPage } from './components/LandingPage';
import { HelperAvatar } from './components/HelperAvatar';
import { CompletionView } from './components/CompletionView';
import { CourseNavigation } from './components/CourseNavigation';
import { Message, Role, EvaluationResult, LessonResult } from './types';
import { streamChatResponse, evaluateChallenge } from './services/geminiService';
import { Terminal, ShieldCheck, Github, Home, RotateCcw, BookOpen, MessageSquare, Menu } from 'lucide-react';

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
        return Math.min(Math.max(0, savedIndex), CURRICULUM.length - 1);
      }
    } catch (e) {
      console.warn('Failed to parse progress from storage');
    }
    return 0;
  });

  const [furthestLessonIndex, setFurthestLessonIndex] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Default furthest to current if missing (migration)
        const savedFurthest = typeof parsed.furthestLessonIndex === 'number' 
          ? parsed.furthestLessonIndex 
          : (typeof parsed.currentLessonIndex === 'number' ? parsed.currentLessonIndex : 0);
        return Math.min(Math.max(0, savedFurthest), CURRICULUM.length);
      }
    } catch (e) {
      console.warn('Failed to parse progress from storage');
    }
    return 0;
  });

  const [isCompleted, setIsCompleted] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return typeof parsed.isCompleted === 'boolean' ? parsed.isCompleted : false;
      }
    } catch (e) {
        return false;
    }
  });

  const [lessonResults, setLessonResults] = useState<LessonResult[]>(() => {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            return Array.isArray(parsed.lessonResults) ? parsed.lessonResults : [];
        }
    } catch (e) { return []; }
    return [];
  });

  const [messages, setMessages] = useState<Message[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [currentAttempts, setCurrentAttempts] = useState(0);
  const [mobileTab, setMobileTab] = useState<'lesson' | 'chat'>('lesson');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const currentLesson = CURRICULUM[currentLessonIndex];
  const isLastLesson = currentLessonIndex === CURRICULUM.length - 1;

  // Persist state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      hasStarted,
      currentLessonIndex,
      furthestLessonIndex,
      isCompleted,
      lessonResults
    }));
  }, [hasStarted, currentLessonIndex, furthestLessonIndex, isCompleted, lessonResults]);

  // Reset chat when lesson changes
  useEffect(() => {
    setMessages([]);
    setEvaluation(null);
    setCurrentAttempts(0);
  }, [currentLessonIndex]);

  const handleResetProgress = () => {
    if (window.confirm("Are you sure you want to reset your progress? This will return you to Lesson 1.")) {
      setCurrentLessonIndex(0);
      setFurthestLessonIndex(0);
      setMessages([]);
      setEvaluation(null);
      setLessonResults([]);
      setIsCompleted(false);
      setCurrentAttempts(0);
      localStorage.removeItem(STORAGE_KEY);
      setHasStarted(false);
      setMobileTab('lesson');
      setIsMenuOpen(false);
    }
  };

  const handleDevUnlock = () => {
    // Unlocks all lessons and starts the app
    setFurthestLessonIndex(CURRICULUM.length - 1);
    setHasStarted(true);
  };

  const handleDevComplete = () => {
    // Generate mock results for visualization
    const mockResults: LessonResult[] = CURRICULUM.map(lesson => ({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        score: Math.floor(Math.random() * 20) + 80, // Random score 80-100
        attempts: Math.floor(Math.random() * 3) + 1 // Random attempts 1-3
    }));
    
    setLessonResults(mockResults);
    setFurthestLessonIndex(CURRICULUM.length);
    setHasStarted(true);
    setIsCompleted(true);
  };

  const handleSendMessage = useCallback(async (text: string) => {
    setCurrentAttempts(prev => prev + 1);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: Role.USER,
      text,
      timestamp: Date.now()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsProcessing(true);
    setEvaluation(null); 

    try {
      let fullResponseText = "";
      const assistantMsgId = (Date.now() + 1).toString();
      
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

      const evalResult = await evaluateChallenge(
        text, 
        fullResponseText, 
        currentLesson.challenge.criteria
      );
      setEvaluation(evalResult);

      if (evalResult.passed) {
        setLessonResults(prev => {
            const filtered = prev.filter(r => r.lessonId !== currentLesson.id);
            return [...filtered, {
                lessonId: currentLesson.id,
                lessonTitle: currentLesson.title,
                score: evalResult.score,
                attempts: currentAttempts + 1
            }];
        });
        // Unlock next lesson
        setFurthestLessonIndex(prev => Math.max(prev, currentLessonIndex + 1));
      }

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
  }, [messages, currentLesson, currentAttempts, currentLessonIndex]);

  const handleNextLesson = () => {
    if (isLastLesson) {
        setIsCompleted(true);
    } else {
        setCurrentLessonIndex(prev => prev + 1);
        setMobileTab('lesson');
    }
  };

  const handleSelectLesson = (index: number) => {
    setCurrentLessonIndex(index);
    setMobileTab('lesson');
  };

  if (!hasStarted) {
    return (
      <LandingPage 
        onStart={() => setHasStarted(true)} 
        lessonProgress={currentLessonIndex}
        onDevUnlock={handleDevUnlock}
        onDevComplete={handleDevComplete}
      />
    );
  }

  if (isCompleted) {
      return (
          <CompletionView 
            results={lessonResults}
            onReset={handleResetProgress}
            onHome={() => setHasStarted(false)}
          />
      );
  }

  return (
    <div className="flex flex-col h-screen bg-dark-950 text-slate-200 font-sans selection:bg-brand-500/30 animate-in fade-in duration-500 overflow-hidden">
      
      <CourseNavigation 
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        curriculum={CURRICULUM}
        currentLessonIndex={currentLessonIndex}
        furthestLessonIndex={furthestLessonIndex}
        lessonResults={lessonResults}
        onSelectLesson={handleSelectLesson}
      />

      {/* Top Bar */}
      <header className="h-16 border-b border-dark-800 bg-dark-950 flex items-center justify-between px-4 md:px-6 flex-shrink-0 relative z-30">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsMenuOpen(true)}
            className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-brand-900/50 cursor-pointer hover:bg-brand-500 transition-colors" onClick={() => setHasStarted(false)}>
              <Terminal size={20} />
            </div>
            <div>
              <h1 className="font-bold text-white tracking-tight text-sm md:text-base">GenAI Architect</h1>
              <div className="text-[10px] text-brand-400 font-mono flex items-center gap-1">
                <ShieldCheck size={10} />
                <span className="hidden xs:inline">TUTOR MODE ACTIVE</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Progress Bar (Centered - Desktop) */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden md:flex flex-col w-64 lg:w-80 pointer-events-none">
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
                          idx <= furthestLessonIndex // Show progress based on furthest reached
                              ? 'bg-warm-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]' 
                              : 'bg-dark-800'
                      }`}
                  />
              ))}
          </div>
        </div>

        {/* Mobile Progress Text */}
        <div className="md:hidden text-xs text-warm-400 font-mono mr-2">
            {currentLessonIndex + 1}/{CURRICULUM.length}
        </div>

        <div className="flex items-center gap-4 text-sm text-slate-400 z-10">
           <button 
             onClick={() => setHasStarted(false)} 
             className="hover:text-brand-400 transition-colors flex items-center gap-1 text-xs" 
             title="Return Home"
           >
             <Home size={16} />
             <span className="hidden sm:inline">Home</span>
           </button>

           <div className="w-px h-4 bg-dark-800 mx-1" />

           <button 
             onClick={handleResetProgress} 
             className="hover:text-red-400 transition-colors flex items-center gap-1 text-xs" 
             title="Reset Progress"
           >
             <RotateCcw size={14} />
             <span className="hidden sm:inline">Reset</span>
           </button>
           
           <div className="hidden md:block w-px h-4 bg-dark-800 mx-1" />
           <div className="hidden md:flex items-center gap-2 bg-dark-800 py-1 px-3 rounded-full border border-dark-700">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-xs font-mono">Gemini 3 Pro</span>
           </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Panel: Lesson & Theory - Hidden on mobile if tab is 'chat' */}
        <section className={`
            w-full md:w-[450px] lg:w-[500px] flex-shrink-0 z-10 shadow-2xl shadow-black/20 md:flex flex-col
            ${mobileTab === 'lesson' ? 'flex flex-1 overflow-hidden' : 'hidden'}
        `}>
          <LessonView 
            lesson={currentLesson} 
            evaluation={evaluation}
            isEvaluating={isProcessing}
            onNextLesson={handleNextLesson}
            hasNext={true} 
          />
        </section>

        {/* Right Panel: Workspace / Chat - Hidden on mobile if tab is 'lesson' */}
        <section className={`
            flex-1 bg-gradient-to-br from-dark-900 to-dark-950 p-4 md:p-6 flex-col min-w-0 md:flex
            ${mobileTab === 'chat' ? 'flex h-full' : 'hidden'}
        `}>
           <div className="max-w-4xl w-full mx-auto h-full flex flex-col">
              <div className="flex items-center justify-between mb-4 px-1">
                 <h3 className="text-sm font-medium text-slate-400 uppercase tracking-widest hidden md:block">Prompt Engineering Sandbox</h3>
                 <div className="md:hidden text-xs text-slate-400 uppercase tracking-wider font-bold">Workspace</div>
                 <span className="text-xs text-slate-600 font-mono">Session ID: {Date.now().toString().slice(-6)}</span>
              </div>
              
              <div className="flex-1 min-h-0">
                <ChatInterface 
                  messages={messages}
                  isLoading={isProcessing}
                  onSendMessage={(text) => {
                      handleSendMessage(text);
                  }}
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

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden h-16 bg-dark-950 border-t border-dark-800 flex items-center justify-around shrink-0 z-40 pb-safe">
         <button 
            onClick={() => setMobileTab('lesson')}
            className={`flex flex-col items-center gap-1 p-2 w-full transition-colors ${mobileTab === 'lesson' ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'}`}
         >
            <BookOpen size={20} />
            <span className="text-[10px] font-medium uppercase tracking-wide">Lesson</span>
         </button>
         <div className="w-px h-8 bg-dark-800" />
         <button 
            onClick={() => setMobileTab('chat')}
            className={`flex flex-col items-center gap-1 p-2 w-full transition-colors ${mobileTab === 'chat' ? 'text-brand-400' : 'text-slate-500 hover:text-slate-300'}`}
         >
            <MessageSquare size={20} />
            <span className="text-[10px] font-medium uppercase tracking-wide">Workspace</span>
         </button>
      </div>
    </div>
  );
}

export default App;