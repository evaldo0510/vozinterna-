
import React from 'react';
import { ThemeName } from '../types.ts';

interface VisualizerProps {
  isSpeaking: boolean;
  isListening: boolean;
  isLiveMode: boolean;
  theme: ThemeName;
}

const THEME_VISUALS = {
  neutral: { 
    orb: 'from-indigo-500/30 via-blue-900/10 to-transparent', 
    core: 'bg-white/95', 
    shadow: 'shadow-[0_0_80px_rgba(99,102,241,0.4)]',
    particles: 'bg-indigo-400' 
  },
  reflective: { 
    orb: 'from-purple-500/40 via-indigo-950/20 to-transparent', 
    core: 'bg-white/95', 
    shadow: 'shadow-[0_0_90px_rgba(168,85,247,0.5)]',
    particles: 'bg-purple-400' 
  },
  heavy: { 
    orb: 'from-stone-600/20 via-stone-900/10 to-transparent', 
    core: 'bg-stone-100/90', 
    shadow: 'shadow-[0_0_70px_rgba(68,64,60,0.4)]',
    particles: 'bg-stone-500' 
  },
  light: { 
    orb: 'from-teal-400/50 via-emerald-950/20 to-transparent', 
    core: 'bg-white/95', 
    shadow: 'shadow-[0_0_90px_rgba(20,184,166,0.5)]',
    particles: 'bg-teal-300' 
  }
};

const Visualizer: React.FC<VisualizerProps> = ({ isSpeaking, isListening, isLiveMode, theme }) => {
  const current = THEME_VISUALS[theme];

  return (
    <div className={`flex flex-col items-center justify-center relative shrink-0 transition-all duration-[2000ms] ease-in-out ${isLiveMode ? 'h-[50vh]' : 'pt-10 pb-4 h-auto'}`}>
      
      <div className={`relative flex items-center justify-center transition-all duration-[2000ms] ${isLiveMode ? 'scale-150' : 'scale-100'} w-64 h-64`}>
        {/* Aura Difusa Principal */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-tr ${current.orb} blur-[100px] transition-all duration-[3000ms] 
          ${isSpeaking ? 'scale-150 opacity-100' : 'scale-100 opacity-20'} 
          ${isListening ? 'animate-pulse opacity-80' : ''}`} 
        />
        
        {/* Camadas Líquidas (Camada 1) */}
        <div className={`absolute w-44 h-44 rounded-[45%] bg-gradient-to-tr ${current.orb} transition-all duration-[4000ms]
          ${isSpeaking ? 'scale-125 rotate-180 opacity-60' : 'scale-100 rotate-0 opacity-20'} 
          animate-[spin_35s_linear_infinite] mix-blend-screen`}
        />

        {/* Camadas Líquidas (Camada 2 - Contra-rotação) */}
        <div className={`absolute w-40 h-40 rounded-[48%] bg-gradient-to-bl ${current.orb} transition-all duration-[5000ms]
          ${isSpeaking ? 'scale-110 rotate-[-180deg]' : 'scale-90 rotate-0'} 
          animate-[spin_25s_linear_infinite_reverse] opacity-30 mix-blend-color-dodge`}
        />
        
        {/* Núcleo Central */}
        <div className={`relative w-10 h-10 rounded-full ${current.core} ${current.shadow} z-20 transition-all duration-[700ms]
          ${isSpeaking ? 'scale-150' : 'scale-100'} ${isListening ? 'animate-pulse' : ''}`}>
          <div className={`absolute inset-0 rounded-full border-2 border-white/40 ${isSpeaking || isListening ? 'animate-ping' : ''} opacity-20`} />
          {/* Inner Light */}
          <div className="absolute inset-1 rounded-full bg-white blur-[2px] opacity-80" />
        </div>

        {/* Partículas Orbitais */}
        <div className={`absolute inset-0 transition-opacity duration-[2000ms] ${isSpeaking || isListening || isLiveMode ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`absolute w-1.5 h-1.5 rounded-full ${current.particles} animate-[orbit_12s_linear_infinite] opacity-60 blur-[1px]`} />
            <div className={`absolute w-2 h-2 rounded-full ${current.particles} animate-[orbit_18s_linear_infinite_reverse] opacity-30 top-4`} />
            {isLiveMode && (
              <div className={`absolute w-1 h-1 rounded-full ${current.particles} animate-[orbit_8s_linear_infinite] opacity-40 left-10`} />
            )}
        </div>
      </div>
      
      <div className={`mt-10 flex flex-col items-center gap-2 transition-all duration-1000 ${isLiveMode ? 'opacity-80 scale-125' : 'opacity-40 scale-100'}`}>
          <div className="flex items-center gap-3">
             {isListening && <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />}
             <span className="text-[10px] font-black uppercase tracking-[1.2em] text-white">
               {isListening ? "Escutando" : isSpeaking ? "Transmitindo" : "Presença"}
             </span>
          </div>
          {isLiveMode && (
             <span className="text-[8px] font-medium uppercase tracking-[0.5em] text-white/20 italic">
               Modo Imersivo Ativo
             </span>
          )}
      </div>
    </div>
  );
};

export default Visualizer;
