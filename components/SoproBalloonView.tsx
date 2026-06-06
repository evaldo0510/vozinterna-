import React, { useState, useEffect, useRef } from 'react';
import { X, Wind, Sparkles } from 'lucide-react';
import { Language } from '../types';

interface SoproBalloonViewProps {
  onClose: () => void;
  lang: Language;
}

export const SoproBalloonView: React.FC<SoproBalloonViewProps> = ({ onClose, lang }) => {
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdEmpty'>('inhale');
  const [elapsed, setElapsed] = useState<number>(0);
  const [cycles, setCycles] = useState<number>(0);

  const phrasePt: Record<string, string> = {
    inhale: 'Inspire a coragem...',
    hold: 'Sinta a pausa e a quietude...',
    exhale: 'Solte o peso e a tensão suavemente...',
    holdEmpty: 'Resida no silêncio do momento vazio...'
  };
  const phraseEn: Record<string, string> = {
    inhale: 'Inhale courage deeply...',
    hold: 'Feel the quiet of the pause...',
    exhale: 'Gently release any weights...',
    holdEmpty: 'Reside in the silence of empty space...'
  };

  const descPt: Record<string, string> = {
    inhale: 'Sinta o ar preenchendo o silêncio corporal.',
    hold: 'Deixe a mente flutuar suspensa no tempo.',
    exhale: 'Deixe o corpo derreter nas palavras escritas.',
    holdEmpty: 'Mantenha-se presente, pronto para recomeçar.'
  };
  const descEn: Record<string, string> = {
    inhale: 'Feel the air filling up your inner silence.',
    hold: 'Let your mind float suspended in pure time.',
    exhale: 'Let your physical form melt onto the page.',
    holdEmpty: 'Stay fully present, ready to begin anew.'
  };

  useEffect(() => {
    const intervalMs = 40;
    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + intervalMs / 1000;
        if (next >= 4) {
          setBreathingPhase((current) => {
            if (current === 'inhale') return 'hold';
            if (current === 'hold') return 'exhale';
            if (current === 'exhale') return 'holdEmpty';
            setCycles((prevC) => prevC + 1);
            return 'inhale';
          });
          return 0;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, []);

  const balloonScale = 
    breathingPhase === 'inhale'
      ? 1.0 + (elapsed / 4) * 0.9  // grow from 1.0 to 1.9
      : breathingPhase === 'hold'
        ? 1.9                      // stay at 1.9 with ambient pulse
        : breathingPhase === 'exhale'
          ? 1.9 - (elapsed / 4) * 0.9 // shrink back to 1.0
          : 1.0;                     // stay at 1.0

  return (
    <div className="fixed inset-0 z-50 bg-[#fcf9f4] text-[#1c2e24] flex flex-col justify-between p-6 font-sans animate-fade-in select-none">
      
      {/* Top Header / exit */}
      <div className="w-full flex justify-between items-center bg-transparent max-w-4xl mx-auto pt-4 px-2">
        <button 
          onClick={onClose}
          className="p-2 rounded-full border border-stone-200 hover:bg-stone-50 text-stone-550 hover:text-stone-850 transition-all cursor-pointer shadow-sm"
          title={lang === 'pt' ? 'Fechar respiração' : 'Close breathing'}
        >
          <X className="w-4 h-4" />
        </button>
        <span className="text-[9px] tracking-[0.3em] font-bold font-mono text-stone-400 uppercase">
          {lang === 'pt' ? 'O SOPRO' : 'THE BREATH'}
        </span>
        <div className="w-8 shrink-0" /> {/* center spacer */}
      </div>

      {/* Centered breathing circle / balloon */}
      <div className="flex-1 flex flex-col justify-center items-center relative py-8">
        
        {/* Massive glowing balloon base */}
        <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center">
          
          {/* Subtle outer bounds */}
          <div className="absolute w-[220px] h-[220px] md:w-[280px] md:h-[280px] rounded-full border border-dashed border-rose-400/20 animate-pulse pointer-events-none" />
          
          {/* High quality glowing Balloon */}
          <div 
            className="absolute w-44 h-44 md:w-56 md:h-56 rounded-full bg-gradient-to-tr from-rose-200/50 via-amber-150/45 to-orange-100/50 border border-orange-200/35 transition-all duration-75 ease-linear flex items-center justify-center shadow-inner"
            style={{ 
              transform: `scale(${balloonScale})`,
              boxShadow: '0 0 45px rgba(244,143,177, 0.22)' 
            }}
          >
            {/* Dark focal point in the middle */}
            <div className="w-3 h-3 rounded-full bg-[#1c2e24]/30 animate-pulse" />
          </div>

          {/* Active Phase timer */}
          <div className="absolute flex flex-col items-center justify-center leading-none select-none select-none pointer-events-none">
            <span className="font-mono text-4xl font-light text-[#1c2e24] tabular-nums leading-none">
              {Math.ceil(4 - elapsed)}
            </span>
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#1c2e24]/60 font-bold uppercase mt-2.5">
              {lang === 'pt' ? 'Segundos' : 'Secs'}
            </span>
          </div>
        </div>

        {/* Phase textual guidance */}
        <div className="text-center space-y-2.5 max-w-sm mx-auto mt-12 px-4 select-none">
          <h2 className="text-2xl font-serif text-stone-850 font-normal tracking-wide transition-all duration-500">
            {lang === 'pt' ? phrasePt[breathingPhase] : phraseEn[breathingPhase]}
          </h2>
          <p className="text-stone-500 text-xs md:text-sm font-light">
            {lang === 'pt' ? descPt[breathingPhase] : descEn[breathingPhase]}
          </p>
        </div>
      </div>

      {/* Floating tag buttons at bottom */}
      <div className="w-full max-w-sm mx-auto flex justify-center items-center gap-3.5 pb-8">
        <div className="py-2.5 px-4.5 rounded-full border border-stone-200/40 bg-white/50 backdrop-blur-md flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-stone-450 select-none">
          <Wind className="w-3.5 h-3.5 text-stone-400" />
          <span>{lang === 'pt' ? 'Fluxo Contínuo' : 'Continuous Flow'}</span>
        </div>
        <div className="py-2.5 px-4.5 rounded-full border border-stone-200/40 bg-white/50 backdrop-blur-md flex items-center gap-2 text-[10px] uppercase font-mono tracking-widest text-stone-450 select-none">
          <Sparkles className="w-3.5 h-3.5 text-stone-400" />
          <span>{lang === 'pt' ? 'Presença' : 'Presence'}</span>
        </div>
      </div>
    </div>
  );
};
