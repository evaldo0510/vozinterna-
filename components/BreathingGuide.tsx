import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Wind, CircleAlert, Sparkles, Play, RotateCcw, X, Heart, Shield } from 'lucide-react';
import { Language } from '../types';

interface BreathingGuideProps {
  lang: Language;
  onClose: () => void;
  onAddToast?: (toast: { type: string; title: string; description: string }) => void;
  isLightTheme?: boolean;
}

type BreathingPhase = 'idle' | 'inhale' | 'hold-full' | 'exhale' | 'hold-empty' | 'complete';

export const BreathingGuide: React.FC<BreathingGuideProps> = ({
  lang,
  onClose,
  onAddToast,
  isLightTheme = false
}) => {
  const [phase, setPhase] = useState<BreathingPhase>('idle');
  const [timeLeft, setTimeLeft] = useState(60);
  const [totalSeconds, setTotalSeconds] = useState(0); // Track total elapsed for phase shifts
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Box Breathing parameters (4 seconds each)
  const STEP_DURATION = 4;

  const textPrimary = isLightTheme ? 'text-stone-800' : 'text-stone-100';
  const textSecondary = isLightTheme ? 'text-stone-550' : 'text-stone-400';
  const cardBg = isLightTheme ? 'bg-white border-stone-200' : 'bg-[#0f1424] border-stone-800';

  useEffect(() => {
    if (phase !== 'idle' && phase !== 'complete') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setPhase('complete');
            if (onAddToast) {
              onAddToast({
                type: 'success',
                title: lang === 'pt' ? 'Sopro Completo ✨' : 'Breath Complete ✨',
                description: lang === 'pt' 
                  ? 'Você concluiu o ciclo de respiração profunda com sucesso.' 
                  : 'You have completed the deep breathing guide successfully.'
              });
            }
            return 0;
          }
          return prev - 1;
        });

        setTotalSeconds((prev) => {
          const nextVal = prev + 1;
          const cycleSec = nextVal % (STEP_DURATION * 4);
          
          if (cycleSec === 0) {
            setPhase('inhale');
          } else if (cycleSec === STEP_DURATION) {
            setPhase('hold-full');
          } else if (cycleSec === STEP_DURATION * 2) {
            setPhase('exhale');
          } else if (cycleSec === STEP_DURATION * 3) {
            setPhase('hold-empty');
          }
          
          return nextVal;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [phase, lang, onAddToast]);

  const handleStart = () => {
    setTimeLeft(60);
    setTotalSeconds(0);
    setPhase('inhale');
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(60);
    setTotalSeconds(0);
    setPhase('idle');
  };

  // Determine current label based on phase
  const getPhaseText = () => {
    switch (phase) {
      case 'inhale':
        return lang === 'pt' ? 'Inspire...' : 'Inhale...';
      case 'hold-full':
        return lang === 'pt' ? 'Retenha o ar...' : 'Hold your breath...';
      case 'exhale':
        return lang === 'pt' ? 'Expire devagar...' : 'Exhale slowly...';
      case 'hold-empty':
        return lang === 'pt' ? 'Mantenha vazio...' : 'Hold empty...';
      case 'complete':
        return lang === 'pt' ? 'Sessão Concluída!' : 'Session Complete!';
      default:
        return lang === 'pt' ? 'Prepare-se para alinhar' : 'Get ready to align';
    }
  };

  const getCircleScale = () => {
    switch (phase) {
      case 'inhale':
        return 1.8;
      case 'hold-full':
        return 1.8;
      case 'exhale':
        return 1.0;
      case 'hold-empty':
        return 1.0;
      default:
        return 1.2;
    }
  };

  const getTransitionDuration = () => {
    if (phase === 'inhale' || phase === 'exhale') {
      return STEP_DURATION;
    }
    return 0.5; // Quick adjust for static phases
  };

  return (
    <div className={`p-8 rounded-[2.5rem] border ${cardBg} shadow-2xl relative max-w-md w-full mx-auto overflow-hidden`}>
      {/* Absolute ambient lights */}
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* Close button */}
      <button 
        onClick={onClose}
        className="absolute top-5 right-5 p-2 rounded-full hover:bg-stone-500/10 transition-colors text-stone-400 hover:text-stone-300 cursor-pointer"
        id="btn-close-breathing-guide"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Header section */}
      <div className="text-center space-y-1 mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[9px] tracking-widest uppercase border border-emerald-500/10">
          <Wind className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>{lang === 'pt' ? 'Sopro de Ressonância PCH' : 'PCH Resonant Wave Breath'}</span>
        </div>
        <h3 className={`text-xl font-serif font-black ${textPrimary} mt-2`}>
          {lang === 'pt' ? 'Alinhamento Cardiorrespiratório' : 'Cardiorespiratory Balance'}
        </h3>
        <p className={`text-[11px] leading-relaxed max-w-xs mx-auto ${textSecondary}`}>
          {lang === 'pt' 
            ? 'Uma técnica milenar de respiração em caixa de 4 segundos para regular seu sistema nervoso autônomo.' 
            : 'A gentle 4s box breathing exercise to balance your autonomic nervous system.'}
        </p>
      </div>

      {/* Interactive area */}
      <div className="flex flex-col items-center justify-center min-h-[220px] mb-8 relative">
        <AnimatePresence mode="wait">
          {phase !== 'idle' && phase !== 'complete' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="absolute top-2 right-2 text-xs font-mono text-emerald-400 flex items-center gap-1.5 bg-emerald-500/5 px-3 py-1 rounded-full border border-emerald-500/10"
              id="breathing-timer"
            >
              <span>⏱️</span>
              <span>{timeLeft}s</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Breathing Circle Visualizer using motion */}
        <div className="w-48 h-48 flex items-center justify-center relative">
          <AnimatePresence>
            {phase !== 'idle' && phase !== 'complete' && (
              <motion.div 
                className="absolute inset-0 rounded-full border border-emerald-400/20 blur-sm pointer-events-none"
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
              />
            )}
          </AnimatePresence>

          <motion.div
            animate={{ 
              scale: getCircleScale(),
              backgroundColor: phase === 'inhale' 
                ? 'rgba(16, 185, 129, 0.25)' 
                : phase === 'hold-full' 
                ? 'rgba(20, 184, 166, 0.3)' 
                : phase === 'exhale' 
                ? 'rgba(16, 185, 129, 0.15)' 
                : 'rgba(78, 113, 84, 0.08)'
            }}
            transition={{ 
              duration: getTransitionDuration(),
              ease: "easeInOut"
            }}
            className="w-24 h-24 rounded-full border border-emerald-400/30 flex flex-col items-center justify-center text-center shadow-xl relative z-20"
          >
            <div className="absolute inset-2 rounded-full border border-white/5 bg-transparent" />
            <span className="text-xl">🌬️</span>
          </motion.div>
        </div>

        {/* Phase textual response */}
        <div className="mt-4 text-center h-12 flex flex-col justify-center">
          <motion.h4 
            key={phase + getPhaseText()}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-base font-serif italic ${textPrimary}`}
          >
            {getPhaseText()}
          </motion.h4>
          <p className="text-[10px] text-stone-500 font-mono tracking-wider mt-1 uppercase">
            {phase === 'inhale' && (lang === 'pt' ? 'Inale pelo nariz' : 'Inhale nose')}
            {phase === 'hold-full' && (lang === 'pt' ? 'Retenha e sinta a paz' : 'Suspend gracefully')}
            {phase === 'exhale' && (lang === 'pt' ? 'Solte suavemente' : 'Exhale mouth')}
            {phase === 'hold-empty' && (lang === 'pt' ? 'Aguarde o novo sopro' : 'Wait empty')}
            {phase === 'idle' && (lang === 'pt' ? 'Guia pronto' : 'Coach ready')}
            {phase === 'complete' && (lang === 'pt' ? 'Paz alcançada' : 'Serenity achieved')}
          </p>
        </div>
      </div>

      {/* Progress indicators */}
      {phase !== 'idle' && phase !== 'complete' && (
        <div className="w-full bg-stone-900/40 border border-stone-850 h-2.5 rounded-full overflow-hidden mb-6">
          <motion.div 
            className="bg-emerald-500 h-full origin-left"
            initial={{ width: '100%' }}
            animate={{ width: `${(timeLeft / 60) * 100}%` }}
            transition={{ ease: 'linear', duration: 1 }}
          />
        </div>
      )}

      {/* Action buttons */}
      <div className="flex justify-center gap-3">
        {phase === 'idle' ? (
          <button
            onClick={handleStart}
            className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-stone-950 font-mono text-xs uppercase tracking-widest font-black rounded-xl cursor-pointer hover:shadow-lg transition-transform active:scale-95 flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-stone-950 shrink-0" />
            <span>{lang === 'pt' ? 'Iniciar Respiração' : 'Start Exercise'}</span>
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 border border-stone-800 text-stone-400 bg-stone-900/30 font-mono text-xs uppercase tracking-wider font-semibold rounded-xl cursor-pointer hover:text-stone-200 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{lang === 'pt' ? 'Reiniciar' : 'Reset'}</span>
            </button>
            
            {phase === 'complete' && (
              <button
                onClick={handleStart}
                className="px-4 py-2.5 bg-emerald-600 text-white font-mono text-xs uppercase tracking-wider font-bold rounded-xl cursor-pointer hover:bg-emerald-500 transition-colors"
              >
                {lang === 'pt' ? 'Outro Ciclo' : 'Cycle Again'}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
