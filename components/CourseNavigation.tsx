import React from 'react';
import { Lesson, LessonResult } from '../types';
import { CheckCircle, Lock, PlayCircle, X, Map } from 'lucide-react';

interface CourseNavigationProps {
  isOpen: boolean;
  onClose: () => void;
  curriculum: Lesson[];
  currentLessonIndex: number;
  furthestLessonIndex: number;
  lessonResults: LessonResult[];
  onSelectLesson: (index: number) => void;
}

export const CourseNavigation: React.FC<CourseNavigationProps> = ({
  isOpen,
  onClose,
  curriculum,
  currentLessonIndex,
  furthestLessonIndex,
  lessonResults,
  onSelectLesson,
}) => {
  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 w-[85%] max-w-sm bg-dark-950 border-r border-dark-800 z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b border-dark-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-white font-bold text-lg">
              <Map className="text-brand-500" />
              <span>Course Map</span>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {curriculum.map((lesson, index) => {
              const isCompleted = lessonResults.some(r => r.lessonId === lesson.id && r.score > 0);
              const isUnlocked = index <= furthestLessonIndex;
              const isActive = index === currentLessonIndex;

              return (
                <button
                  key={lesson.id}
                  disabled={!isUnlocked}
                  onClick={() => {
                    onSelectLesson(index);
                    onClose();
                  }}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200 group
                    ${isActive 
                      ? 'bg-brand-900/20 border-brand-500/50 shadow-[0_0_15px_rgba(217,70,239,0.15)]' 
                      : isUnlocked 
                        ? 'bg-dark-900/50 border-dark-800 hover:border-dark-700 hover:bg-dark-800' 
                        : 'bg-dark-950 border-dark-900 opacity-60 cursor-not-allowed'
                    }
                  `}
                >
                  {/* Status Icon */}
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors
                    ${isCompleted 
                      ? 'bg-green-500/20 text-green-500' 
                      : isActive 
                        ? 'bg-brand-500 text-white'
                        : isUnlocked
                          ? 'bg-dark-800 text-slate-400 group-hover:bg-dark-700'
                          : 'bg-dark-900 text-dark-700'
                    }
                  `}>
                    {isCompleted ? (
                      <CheckCircle size={16} />
                    ) : isActive ? (
                      <PlayCircle size={16} className="fill-current" />
                    ) : isUnlocked ? (
                      <div className="w-2 h-2 rounded-full bg-slate-500" />
                    ) : (
                      <Lock size={14} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-xs font-mono uppercase tracking-wider ${isActive ? 'text-brand-400' : 'text-slate-500'}`}>
                        Lesson {index + 1}
                      </span>
                      {isCompleted && <span className="text-[10px] bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded border border-green-900/50">Done</span>}
                    </div>
                    <h4 className={`font-medium truncate ${isActive ? 'text-white' : isUnlocked ? 'text-slate-200' : 'text-slate-600'}`}>
                      {lesson.title}
                    </h4>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-dark-800 bg-dark-950 text-xs text-center text-slate-500 font-mono">
            {lessonResults.length} / {curriculum.length} Lessons Completed
          </div>
        </div>
      </div>
    </>
  );
};
