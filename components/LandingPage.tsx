import React, { useState, useRef, useEffect } from 'react';
import { Terminal, Sparkles, BrainCircuit, ShieldCheck, ArrowRight, Code2, Unlock, Award, Lock, Key, X } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  lessonProgress?: number;
  onDevUnlock?: () => void;
  onDevComplete?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, lessonProgress = 0, onDevUnlock, onDevComplete }) => {
  const hasProgress = lessonProgress > 0;
  const [showDevTools, setShowDevTools] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isAuthModalOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAuthModalOpen]);

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "CrustaceanCreation") {
      setShowDevTools(true);
      setIsAuthModalOpen(false);
      setPasswordInput("");
      setAuthError(false);
    } else {
      setAuthError(true);
      setPasswordInput("");
    }
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setPasswordInput("");
    setAuthError(false);
  };

  return (
    <div className="min-h-screen bg-dark-950 text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-brand-500/30">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-warm-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl w-full z-10 flex flex-col items-center text-center space-y-12 animate-in fade-in zoom-in duration-700">
        
        {/* Header */}
        <div className="space-y-4 max-w-3xl flex flex-col items-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dark-800/50 border border-brand-500/30 text-brand-400 text-xs font-mono mb-2 backdrop-blur-md">
            <Sparkles size={12} className="text-warm-400" />
            <span>Powered by Gemini 3 Pro</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black text-white tracking-tighter drop-shadow-2xl mb-2">
            Elucidate
          </h1>

          <h2 className="text-3xl md:text-5xl font-bold text-slate-300 tracking-tight leading-tight">
            Master the Art of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-warm-500">
              Generative AI
            </span>
          </h2>
          
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto pt-4">
            Unlock the full potential of AI without the confusion. Join our interactive guide to learn prompt engineering, control model behavior, and build with confidence.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <FeatureCard 
            icon={<BrainCircuit className="text-brand-400" />}
            title="Structured Learning"
            description="Master core concepts like Personas, Chain-of-Thought, and Few-Shot prompting through guided lessons."
          />
          <FeatureCard 
            icon={<Code2 className="text-warm-400" />}
            title="Interactive Sandbox"
            description="Experiment freely in a real-time environment powered by Gemini 3 Pro to see your ideas come to life."
          />
          <FeatureCard 
            icon={<ShieldCheck className="text-brand-400" />}
            title="Instant Feedback"
            description="Get real-time evaluations on your prompts. Our AI Tutor guides you toward the best results."
          />
        </div>

        {/* CTA */}
        <div className="pt-8 flex flex-col items-center">
          <div className="flex flex-col items-center">
            <button 
              onClick={onStart}
              className="group relative px-8 py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-full font-semibold text-lg transition-all shadow-lg shadow-brand-900/50 flex items-center gap-3 overflow-hidden"
            >
              <span className="relative z-10">
                {hasProgress ? `Continue to Lesson ${lessonProgress + 1}` : "Start Your Journey"}
              </span>
              <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </button>
          </div>
          
          <div className="mt-4 flex flex-col items-center gap-2">
            <p className="text-xs text-slate-500 font-mono">
              {hasProgress ? "Progress saved" : "No prior AI experience required • Free to explore"}
            </p>
            
            <div className="mt-4 min-h-[40px] flex items-center justify-center">
              {showDevTools ? (
                <div className="flex gap-4 animate-in fade-in slide-in-from-bottom-2">
                  {onDevUnlock && (
                    <button 
                      onClick={onDevUnlock} 
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-950/30 border border-red-900/30 text-red-500 text-[10px] hover:bg-red-950/50 hover:text-red-400 transition-colors uppercase tracking-wider font-bold"
                      title="Developer Mode: Unlock all lessons"
                    >
                      <Unlock size={10} />
                      Dev: Unlock All
                    </button>
                  )}
                  {onDevComplete && (
                    <button 
                      onClick={onDevComplete} 
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-950/30 border border-blue-900/30 text-blue-500 text-[10px] hover:bg-blue-950/50 hover:text-blue-400 transition-colors uppercase tracking-wider font-bold"
                      title="Developer Mode: Simulate Course Completion"
                    >
                      <Award size={10} />
                      Dev: Simulate Grad
                    </button>
                  )}
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="p-2 text-dark-800 hover:text-dark-700 transition-colors rounded-full"
                  title="Restricted Access"
                >
                  <Lock size={12} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-dark-900 border border-dark-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={closeAuthModal}
              className="absolute top-4 right-4 text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X size={20} />
            </button>
            
            <div className="flex flex-col items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-dark-800 rounded-full flex items-center justify-center border border-dark-700">
                <Key size={20} className="text-brand-400" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white">Developer Access</h3>
                <p className="text-sm text-slate-400">Enter the access code to unlock tools.</p>
              </div>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <input
                  ref={inputRef}
                  type="password"
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError(false);
                  }}
                  className={`w-full bg-dark-950 border ${authError ? 'border-red-500/50 focus:border-red-500' : 'border-dark-700 focus:border-brand-500'} rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500/50 transition-all text-center tracking-widest`}
                  placeholder="••••••••"
                />
                {authError && (
                  <p className="text-red-400 text-xs mt-2 text-center">Access Denied: Invalid Password</p>
                )}
              </div>
              
              <button
                type="submit"
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-brand-900/20"
              >
                Authenticate
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="p-6 rounded-2xl bg-dark-900/50 border border-dark-800 hover:border-brand-500/30 transition-colors backdrop-blur-sm">
    <div className="w-12 h-12 rounded-xl bg-dark-800 flex items-center justify-center mb-4 border border-dark-700">
      {icon}
    </div>
    <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
    <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
  </div>
);