
import React from 'react';
import { ChevronRight, Star, Sparkles, MessageCircle, Wind, Heart, CheckCircle, X } from 'lucide-react';

interface ManifestoOverlayProps {
  step: number;
  onNext: () => void;
  onClose: () => void;
  points: number;
}

const STEPS_INFO = [
  { label: "Início", icon: <Sparkles className="w-4 h-4" /> },
  { label: "Expressão", icon: <MessageCircle className="w-4 h-4" /> },
  { label: "Visão", icon: <Star className="w-4 h-4" /> },
  { label: "Sopro", icon: <Wind className="w-4 h-4" /> },
  { label: "Sentir", icon: <Heart className="w-4 h-4" /> },
  { label: "Paz", icon: <CheckCircle className="w-4 h-4" /> }
];

const ManifestoOverlay: React.FC<ManifestoOverlayProps> = ({ step, onNext, onClose, points }) => {
  if (step > 6) return null;

  return (
    <div className="absolute top-0 inset-x-0 z-50 p-6 animate-in slide-in-from-top duration-700">
      <div className="bg-white/10 backdrop-blur-3xl border border-white/10 rounded-3xl p-4 shadow-2xl flex items-center justify-between">
        
        <div className="flex items-center gap-4">
          <div className="p-2 bg-indigo-500/20 rounded-xl text-indigo-400">
            {STEPS_INFO[step - 1].icon}
          </div>
          <div className="text-left">
            <p className="text-[10px] uppercase font-black tracking-widest text-white/30">Manifesto • Passo {step}/6</p>
            <p className="text-xs font-bold text-white">{STEPS_INFO[step - 1].label}</p>
          </div>
        </div>

        <div className="flex-1 max-w-[100px] mx-4 h-1 bg-white/5 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 transition-all duration-1000" 
            style={{ width: `${(step / 6) * 100}%` }}
          />
        </div>

        <div className="flex items-center gap-2">
          {step === 1 || step === 3 || step === 6 ? (
            <button 
              onClick={onNext}
              className="px-4 py-2 bg-white text-black text-[10px] font-black uppercase rounded-xl flex items-center gap-2 active:scale-95 transition-all"
            >
              Próximo <ChevronRight className="w-3 h-3" />
            </button>
          ) : (
             <span className="text-[9px] font-bold text-indigo-300 animate-pulse uppercase tracking-wider">Aguardando...</span>
          )}
          <button onClick={onClose} className="p-2 text-white/20 hover:text-white/50 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManifestoOverlay;
