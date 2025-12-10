import React from 'react';
import { Lesson, EvaluationResult } from '../types';
import { BookOpen, CheckCircle, XCircle, ArrowRight, BrainCircuit, Sparkles } from 'lucide-react';

interface LessonViewProps {
  lesson: Lesson;
  evaluation: EvaluationResult | null;
  isEvaluating: boolean;
  onNextLesson: () => void;
  hasNext: boolean;
}

export const LessonView: React.FC<LessonViewProps> = ({ 
  lesson, 
  evaluation, 
  isEvaluating,
  onNextLesson,
  hasNext
}) => {
  return (
    <div className="flex flex-col h-full bg-dark-900 border-r border-dark-800 overflow-y-auto relative">
      {/* Header */}
      <div className="p-6 border-b border-dark-800 bg-dark-950 sticky top-0 z-10">
        <div className="flex items-center gap-2 text-warm-500 mb-2">
          <BookOpen size={16} />
          <span className="text-xs font-bold uppercase tracking-wider">Current Lesson</span>
        </div>
        <h2 className="text-2xl font-bold text-white mb-1">{lesson.title}</h2>
        <p className="text-slate-400 text-sm">{lesson.description}</p>
      </div>

      {/* Theory Content */}
      <div className="p-6 space-y-6 flex-1">
        <div className="prose prose-invert prose-sm max-w-none text-slate-300">
          <div className="whitespace-pre-line">{lesson.theory}</div>
        </div>

        {/* Challenge Box */}
        <div className="mt-8 bg-dark-950 border border-brand-900/50 rounded-xl p-5 relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-br from-brand-900/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          <div className="relative z-10">
            <h3 className="text-warm-400 font-semibold mb-3 flex items-center gap-2">
              <BrainCircuit size={18} />
              Mission Objective
            </h3>
            <p className="text-white font-medium mb-2 text-sm">{lesson.challenge.instruction}</p>
          </div>
        </div>

        {/* Feedback / Evaluation Status */}
        {evaluation && (
          <div className={`rounded-xl p-4 border animate-in fade-in slide-in-from-bottom-4 duration-500 relative overflow-hidden ${
            evaluation.passed 
              ? 'bg-green-950/30 border-green-900/50' 
              : 'bg-red-950/30 border-red-900/50'
          }`}>
            
            {/* Celebration Animation Elements */}
            {evaluation.passed && (
              <>
                <div className="absolute -top-12 -right-12 w-32 h-32 bg-green-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(15)].map((_, i) => (
                    <div 
                      key={i}
                      className="absolute bg-green-400 rounded-full opacity-0 animate-rise"
                      style={{
                        left: `${Math.random() * 100}%`,
                        bottom: '-10%',
                        width: `${Math.random() * 4 + 2}px`,
                        height: `${Math.random() * 4 + 2}px`,
                        animationDuration: `${Math.random() * 1.5 + 1}s`,
                        animationDelay: `${Math.random() * 0.5}s`
                      }}
                    />
                  ))}
                  <style>{`
                    @keyframes rise {
                      0% { transform: translateY(0) scale(0.5); opacity: 0; }
                      50% { opacity: 0.6; }
                      100% { transform: translateY(-60px) scale(0); opacity: 0; }
                    }
                    .animate-rise {
                      animation: rise ease-out forwards;
                    }
                  `}</style>
                </div>
              </>
            )}

            <div className="flex items-center gap-3 mb-2 relative z-10">
              {evaluation.passed ? (
                <div className="relative">
                   <div className="absolute inset-0 bg-green-500 blur-sm opacity-50 animate-pulse rounded-full"></div>
                   <CheckCircle className="text-green-500 relative z-10" size={24} />
                </div>
              ) : (
                <XCircle className="text-red-500" size={24} />
              )}
              <h4 className={`font-bold flex items-center gap-2 ${evaluation.passed ? 'text-green-400' : 'text-red-400'}`}>
                {evaluation.passed ? 'Objective Complete!' : 'Objective Failed'}
                {evaluation.passed && <Sparkles size={16} className="text-yellow-400 animate-bounce" />}
              </h4>
              {evaluation.score > 0 && (
                 <span className="ml-auto text-xs font-mono bg-dark-950/80 border border-dark-800 px-2 py-1 rounded text-slate-400">Score: {evaluation.score}/100</span>
              )}
            </div>
            <p className="text-sm text-slate-300 mb-4 relative z-10">{evaluation.feedback}</p>
            
            {evaluation.passed && hasNext && (
              <button 
                onClick={onNextLesson}
                className="w-full py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg flex items-center justify-center gap-2 transition-all font-medium text-sm shadow-lg shadow-green-900/20 relative z-10 group"
              >
                Next Lesson <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};