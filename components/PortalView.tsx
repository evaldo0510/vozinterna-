import React from 'react';
import { Language } from '../types';

interface PortalViewProps {
  lang: Language;
  onEnterSanctuary: () => void;
  isLightTheme?: boolean;
}

export const FlowerOfLifeSVG = ({ className = "w-28 h-28 text-stone-300" }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    fill="none" 
    className={className} 
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* Center dot/ring and symmetric outer circles forming a rosette petal network */}
    <circle cx="50" cy="50" r="14" stroke="currentColor" strokeWidth="2" strokeOpacity="0.55" fill="none" />
    {[0, 60, 120, 180, 240, 300].map((angle) => {
      const rad = (angle * Math.PI) / 180;
      const cx = 50 + 17 * Math.cos(rad);
      const cy = 50 + 17 * Math.sin(rad);
      return (
        <circle 
          key={angle} 
          cx={cx} 
          cy={cy} 
          r="14" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeOpacity="0.55" 
          fill="none" 
        />
      );
    })}
    <circle cx="50" cy="50" r="3" fill="currentColor" fillOpacity="0.3" />
  </svg>
);

export const PortalView: React.FC<PortalViewProps> = ({ lang, onEnterSanctuary, isLightTheme }) => {
  return (
    <div className={`min-h-full w-full flex flex-col justify-between items-center py-16 px-6 relative font-sans overflow-hidden select-none transition-colors duration-300 ${
      isLightTheme 
        ? 'bg-[#FCFBF9] text-stone-800' 
        : 'bg-[#080B14] text-stone-200'
    }`}>
      
      {/* Small subtle centered header */}
      <div className="w-full flex justify-center items-center z-10">
        <span className="text-[10px] tracking-[0.4em] text-stone-400 uppercase font-bold font-mono">
          {lang === 'pt' ? 'VOZ INTERIOR' : 'INNER VOICE'}
        </span>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 w-full max-w-xl mx-auto flex flex-col items-center justify-center text-center space-y-16 z-10 my-auto">
        <div className="space-y-4 animate-fade-in">
          <h1 className={`text-3xl md:text-4xl font-serif tracking-wide font-normal leading-relaxed max-w-md mx-auto ${
            isLightTheme ? 'text-stone-800' : 'text-stone-100'
          }`}>
            {lang === 'pt' 
              ? 'O que trouxe a sua mente até aqui hoje?' 
              : 'What brought your mind here today?'}
          </h1>
        </div>

        {/* Elegant rosette flower symbol in the center */}
        <div className="relative flex items-center justify-center p-8 rounded-full animate-fade-in glass-panel shadow-md">
          <FlowerOfLifeSVG className={`w-32 h-32 transition-colors duration-700 hover:scale-105 ${
            isLightTheme ? 'text-stone-300 hover:text-emerald-800/40' : 'text-stone-700 hover:text-emerald-400/40'
          }`} />
          <div className={`absolute w-[180px] h-[180px] rounded-full border animate-pulse pointer-events-none ${
            isLightTheme ? 'border-stone-200/40' : 'border-stone-800/40'
          }`} />
        </div>

        {/* Action capsule button */}
        <div className="w-full max-w-xs mx-auto animate-fade-in">
          <button 
            id="portal-enter-btn"
            onClick={onEnterSanctuary}
            className="w-full py-4 bg-[#5c7c64] hover:bg-[#4d6954] text-white font-semibold uppercase tracking-[0.22em] text-[10px] transition-all rounded-full shadow-[0_4px_16px_rgba(92,124,100,0.22)] active:scale-[0.98] cursor-pointer"
          >
            {lang === 'pt' ? 'Entrar no Santuário' : 'Enter the Sanctuary'}
          </button>
        </div>
      </div>

      {/* Footer Text */}
      <div className="w-full max-sm mb-4 text-center z-10 mt-12 animate-fade-in">
        <p className="text-[10px] text-stone-400 font-serif italic tracking-wider">
          {lang === 'pt' ? 'Respire. Este é o seu espaço de clareza.' : 'Breathe. This is your space of clarity.'}
        </p>
      </div>
    </div>
  );
};
