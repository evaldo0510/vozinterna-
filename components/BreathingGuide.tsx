import React from "react";
import { Activity } from "lucide-react";

interface BreathingGuideProps {
  lang: 'pt' | 'en';
  breathingScale: number;
  breathingStep: 'inhale' | 'hold-in' | 'exhale' | 'hold-out';
  breathingText: string;
  accentBorder: string;
}

export const BreathingGuide: React.FC<BreathingGuideProps> = ({
  lang,
  breathingScale,
  breathingStep,
  breathingText,
  accentBorder,
}) => {
  return (
    <div className={`w-full max-w-xl p-6 rounded-[2rem] border text-center transition-all duration-1000 flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-emerald-950/10 to-teal-950/10 ${accentBorder}`}>
      <span className="text-[8px] text-emerald-400 uppercase tracking-[0.3em] font-black mb-3 select-none">
        {lang === 'pt' ? 'Exercício Respiratório de Aterramento' : 'Grounding Breathing Coach'}
      </span>
      
      {/* Animating Breathing Orb */}
      <div 
        className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-[4000ms] border shadow-2xl relative mb-4"
        style={{ 
          transform: `scale(${breathingScale})`,
          backgroundColor: breathingStep === 'inhale' ? 'rgba(20, 184, 166, 0.25)' : breathingStep === 'hold-in' ? 'rgba(52, 211, 153, 0.3)' : breathingStep === 'exhale' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(16, 185, 129, 0.05)',
          borderColor: breathingStep === 'hold-in' ? 'rgba(52,211,153,0.5)' : 'rgba(20, 184, 166, 0.3)'
        }}
      >
        <div className="absolute inset-0 rounded-full blur-xl animate-pulse bg-teal-500/10" />
        <Activity className="w-5 h-5 text-emerald-300 opacity-60" />
      </div>

      <h4 className="text-sm font-serif tracking-widest text-emerald-100 mb-1 transition-all">
        {breathingText}
      </h4>
      <p className="text-[9px] text-emerald-500 uppercase tracking-widest">
        {breathingStep === 'inhale' && (lang === 'pt' ? 'Inale em 4 segundos' : 'Inhale for 4s')}
        {breathingStep === 'hold-in' && (lang === 'pt' ? 'Retenha em plenitude' : 'Hold deep')}
        {breathingStep === 'exhale' && (lang === 'pt' ? 'Solte sem ruído' : 'Release slowly')}
        {breathingStep === 'hold-out' && (lang === 'pt' ? 'Descanse em paz' : 'Rest silent')}
      </p>
    </div>
  );
};
