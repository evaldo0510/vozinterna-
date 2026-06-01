
import React from 'react';
import { Wind, User, Heart, Activity, Sparkles, MessageSquare, X, Zap, Moon, Sun, CloudRain, Smile } from 'lucide-react';
import { ThemeName } from '../types';

interface ModalProps {
  onClose: () => void;
}

export const BreathingModal: React.FC<ModalProps> = ({ onClose }) => {
  return (
    <div className="bg-slate-900/95 backdrop-blur-3xl border border-indigo-500/30 rounded-[2.5rem] p-8 text-center shadow-2xl animate-fade-in-up">
      <div className="w-14 h-14 bg-indigo-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
        <Wind className="w-7 h-7 text-indigo-300" />
      </div>
      <h3 className="text-xl font-medium text-white mb-2">Pausa Sagrada</h3>
      <p className="text-sm text-indigo-200/50 mb-8">Sincroniza o teu ser com o ritmo do núcleo.</p>
      <div className="w-24 h-24 mx-auto relative flex items-center justify-center mb-8">
        <div className="absolute inset-0 rounded-full bg-indigo-500/20 border border-indigo-400/30 animate-[ping_4s_infinite]"></div>
        <div className="w-10 h-10 rounded-full bg-white/40 animate-pulse blur-sm"></div>
      </div>
      <button onClick={onClose} className="w-full py-4 bg-indigo-600 rounded-2xl text-white font-bold active:scale-95 transition-all">Concluir</button>
    </div>
  );
};

export const ReferralModal: React.FC<ModalProps> = ({ onClose }) => {
  return (
    <div className="bg-slate-900/95 backdrop-blur-3xl border border-rose-500/20 rounded-[2.5rem] p-8 text-center shadow-2xl animate-fade-in-up">
      <User className="w-8 h-8 text-rose-400 mx-auto mb-4" />
      <h3 className="text-xl font-medium text-white mb-4">Apoio Externo</h3>
      <p className="text-sm text-white/50 mb-8 leading-relaxed">Às vezes, a jornada pede um guia humano especializado. Queres que te conecte com alguém?</p>
      <div className="space-y-4">
        <button className="w-full py-4 bg-rose-600 rounded-2xl text-white font-bold flex items-center justify-center gap-3 active:scale-95"><MessageSquare className="w-5 h-5" /> Falar com Profissional</button>
        <button onClick={onClose} className="text-xs text-white/30">Agora não, obrigado</button>
      </div>
    </div>
  );
};

interface AccessibilityProps {
  onClose: () => void;
  onSelectPhrase: (phrase: string) => void;
  setTheme: (theme: ThemeName) => void;
  speakText: (text: string) => void;
  addPoints: (pts: number) => void;
  isHighContrast: boolean;
}

export const AccessibilityPanel: React.FC<AccessibilityProps> = ({ 
  onClose, onSelectPhrase, setTheme, speakText, addPoints, isHighContrast 
}) => {
  const phrases = [
    { icon: <Wind className="w-7 h-7"/>, text: "Mente turva.", mood: "reflective" as ThemeName, color: "text-indigo-400" },
    { icon: <Zap className="w-7 h-7"/>, text: "Peito agitado.", mood: "heavy" as ThemeName, color: "text-amber-400" },
    { icon: <Sparkles className="w-7 h-7"/>, text: "Sinto paz.", mood: "light" as ThemeName, color: "text-teal-400" },
    { icon: <Heart className="w-7 h-7"/>, text: "Acolhimento.", mood: "heavy" as ThemeName, color: "text-rose-400" },
    { icon: <Moon className="w-7 h-7"/>, text: "Só silêncio.", mood: "neutral" as ThemeName, color: "text-slate-400" },
    { icon: <Smile className="w-7 h-7"/>, text: "Gratidão.", mood: "light" as ThemeName, color: "text-emerald-400" }
  ];

  const handleSelect = (p: typeof phrases[0]) => {
    if ('vibrate' in navigator) navigator.vibrate(40);
    onSelectPhrase(p.text);
    setTheme(p.mood);
    speakText(p.text);
    addPoints(20);
    onClose();
  };

  return (
    <div className={`p-6 rounded-[3.5rem] shadow-2xl animate-fade-in-up border-2 ${isHighContrast ? 'bg-black border-white' : 'bg-slate-950/95 border-white/10 backdrop-blur-3xl'}`}>
      <div className="flex items-center justify-between mb-8 px-2">
        <h4 className="text-[10px] font-bold uppercase tracking-widest text-white/30">Painel Adaptativo</h4>
        <button onClick={onClose} className="p-2 bg-white/5 rounded-full"><X className="w-4 h-4 text-white/40" /></button>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {phrases.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSelect(p)}
            className={`flex flex-col items-center justify-center p-6 rounded-[2.5rem] transition-all active:scale-95 border-2 ${
              isHighContrast ? 'border-white text-white' : 'border-white/5 bg-white/5'
            }`}
          >
            <div className={isHighContrast ? 'text-white' : p.color}>{p.icon}</div>
            <span className="mt-3 text-[13px] font-medium text-white/80">{p.text}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
