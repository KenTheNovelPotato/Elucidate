import React from 'react';
import { Terminal, Sparkles, BrainCircuit, ShieldCheck, ArrowRight, Code2 } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  lessonProgress?: number;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, lessonProgress = 0 }) => {
  const hasProgress = lessonProgress > 0;

  return (
    <div className="min-h-screen bg-dark-950 text-slate-200 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans selection:bg-brand-500/30">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-900/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-warm-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-5xl w-full z-10 flex flex-col items-center text-center space-y-12 animate-in fade-in zoom-in duration-700">
        
        {/* Header */}
        <div className="space-y-6 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-dark-800/50 border border-brand-500/30 text-brand-400 text-xs font-mono mb-4 backdrop-blur-md">
            <Sparkles size={12} className="text-warm-400" />
            <span>Powered by Gemini 3 Pro</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white tracking-tight leading-tight">
            Master the Art of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-warm-500">
              Generative AI
            </span>
          </h1>
          
          <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-2xl mx-auto">
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
        <div className="pt-8">
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
          <p className="mt-4 text-xs text-slate-500 font-mono">
            {hasProgress ? "Progress saved" : "No prior AI experience required • Free to explore"}
          </p>
        </div>
      </div>
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