import React, { useEffect, useRef, useState } from 'react';
import { LessonResult } from '../types';
import { generateFinalAnalysis } from '../services/geminiService';
import { Award, Star, TrendingUp, RefreshCw, Home, Sparkles } from 'lucide-react';

interface CompletionViewProps {
  results: LessonResult[];
  onReset: () => void;
  onHome: () => void;
}

export const CompletionView: React.FC<CompletionViewProps> = ({ results, onReset, onHome }) => {
  const [analysisText, setAnalysisText] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Calculate stats
  const averageScore = Math.round(results.reduce((acc, curr) => acc + curr.score, 0) / Math.max(results.length, 1));
  const totalAttempts = results.reduce((acc, curr) => acc + curr.attempts, 0);

  // Confetti Animation Effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: { x: number; y: number; vx: number; vy: number; color: string; size: number }[] = [];
    const colors = ['#d946ef', '#f59e0b', '#3b82f6', '#10b981', '#ef4444'];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 15,
        vy: (Math.random() - 0.5) * 15,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2; // Gravity
        p.vx *= 0.96; // Friction
        p.vy *= 0.96;

        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);

        // Remove if off screen
        if (p.y > canvas.height) {
             particles.splice(index, 1);
        }
      });

      if (particles.length > 0) {
        animationId = requestAnimationFrame(animate);
      }
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);

  // Generate Analysis
  useEffect(() => {
    let active = true;
    const fetchAnalysis = async () => {
      try {
        const stream = generateFinalAnalysis(results);
        for await (const chunk of stream) {
          if (active) {
            setAnalysisText(prev => prev + chunk);
          }
        }
      } catch (e) {
        console.error("Failed to generate analysis", e);
        if (active) setAnalysisText("Failed to generate AI analysis. But congratulations on completing the course!");
      }
    };
    fetchAnalysis();
    return () => { active = false; };
  }, [results]);

  return (
    <div className="min-h-screen bg-dark-950 text-slate-200 relative overflow-hidden flex flex-col items-center">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-0" />
      
      <div className="max-w-4xl w-full p-6 z-10 flex flex-col gap-8 animate-in fade-in zoom-in duration-700 mt-10 mb-20">
        
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="w-24 h-24 bg-gradient-to-br from-brand-500 to-warm-500 rounded-full mx-auto flex items-center justify-center shadow-2xl shadow-brand-500/30 mb-6">
            <Award size={48} className="text-white" />
          </div>
          <h1 className="text-5xl font-bold text-white tracking-tight">Course Completed!</h1>
          <p className="text-xl text-slate-400">You have officially mastered the basics of Generative AI Architecture.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-dark-900/50 border border-dark-800 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                <Star className="text-warm-500" size={32} />
                <span className="text-3xl font-bold text-white">{averageScore}%</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Avg. Score</span>
            </div>
            <div className="bg-dark-900/50 border border-dark-800 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                <TrendingUp className="text-brand-500" size={32} />
                <span className="text-3xl font-bold text-white">{totalAttempts}</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Total Attempts</span>
            </div>
            <div className="bg-dark-900/50 border border-dark-800 p-6 rounded-2xl flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                <Sparkles className="text-purple-500" size={32} />
                <span className="text-3xl font-bold text-white">{results.length}</span>
                <span className="text-xs text-slate-500 uppercase tracking-wider">Lessons Mastered</span>
            </div>
        </div>

        {/* AI Analysis Card */}
        <div className="bg-dark-900 border border-dark-700 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-dark-950 p-4 border-b border-dark-800 flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                <span className="font-mono text-sm text-slate-300">Gemini 3 Pro Analysis</span>
            </div>
            <div className="p-8 min-h-[300px] text-slate-300 leading-relaxed whitespace-pre-wrap font-sans">
                {analysisText ? (
                    analysisText
                ) : (
                    <div className="flex items-center gap-3 text-slate-500">
                        <span className="animate-pulse">Analyzing your performance history...</span>
                    </div>
                )}
            </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center gap-4 pt-4">
            <button 
                onClick={onHome}
                className="px-6 py-3 rounded-xl bg-dark-800 hover:bg-dark-700 text-white font-medium flex items-center gap-2 transition-colors border border-dark-700"
            >
                <Home size={18} />
                Return Home
            </button>
            <button 
                onClick={onReset}
                className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-medium flex items-center gap-2 transition-colors shadow-lg shadow-brand-900/20"
            >
                <RefreshCw size={18} />
                Restart Course
            </button>
        </div>

      </div>
    </div>
  );
};