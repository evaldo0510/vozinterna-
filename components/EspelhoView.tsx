import React, { useState, useEffect } from 'react';
import { User, Language } from '../types';
import { Sun, Cloud, Wind, Droplets, ShieldCheck, ArrowLeft, Check } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface EspelhoViewProps {
  user: User;
  lang: Language;
  onBack: () => void;
  onAddToast: (toast: { type: string; title: string; description: string }) => void;
}

export const EspelhoView: React.FC<EspelhoViewProps> = ({ user, lang, onBack, onAddToast }) => {
  const [selectedMood, setSelectedMood] = useState<string>(user.emotionalState || '');
  const [noteText, setNoteText] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Set default initial state from user model
  useEffect(() => {
    if (user.emotionalState) {
      setSelectedMood(user.emotionalState);
    }
  }, [user.emotionalState]);

  const moodsList = [
    {
      id: 'feliz',
      label: lang === 'pt' ? 'Clareza' : 'Clarity',
      sub: 'SOL',
      subEn: 'SUN',
      icon: Sun,
      corBg: 'bg-amber-100/60 text-amber-600',
      corCard: 'hover:border-amber-400/40 bg-white/70 border-stone-200/40',
      corSelected: 'border-amber-400 bg-amber-50/20 shadow-[0_4px_16px_rgba(245,158,11,0.06)]'
    },
    {
      id: 'confuso',
      label: lang === 'pt' ? 'Confuso' : 'Confused',
      sub: 'NÉVOA',
      subEn: 'FOG',
      icon: Cloud,
      corBg: 'bg-stone-200/60 text-stone-600',
      corCard: 'hover:border-stone-400/40 bg-white/70 border-stone-200/40',
      corSelected: 'border-stone-400 bg-stone-50/20 shadow-[0_4px_16px_rgba(120,113,108,0.06)]'
    },
    {
      id: 'ansioso',
      label: lang === 'pt' ? 'Agitado' : 'Agitated',
      sub: 'VENTO',
      subEn: 'WIND',
      icon: Wind,
      corBg: 'bg-violet-100/60 text-violet-600',
      corCard: 'hover:border-violet-400/40 bg-white/70 border-stone-200/40',
      corSelected: 'border-violet-400 bg-violet-50/20 shadow-[0_4px_16px_rgba(124,58,237,0.06)]'
    },
    {
      id: 'calmo',
      label: lang === 'pt' ? 'Lidando' : 'Coping',
      sub: 'CHUVA',
      subEn: 'RAIN',
      icon: Droplets,
      corBg: 'bg-sky-100/65 text-sky-600',
      corCard: 'hover:border-sky-400/40 bg-white/70 border-stone-200/40',
      corSelected: 'border-sky-400 bg-sky-50/20 shadow-[0_4px_16px_rgba(14,165,233,0.06)]'
    }
  ];

  const handleSaveMoment = async () => {
    if (!selectedMood) {
      onAddToast({
        type: 'error',
        title: lang === 'pt' ? 'Sintonia Requerida' : 'Tuning Required',
        description: lang === 'pt' ? 'Selecione um elemento antes de prosseguir.' : 'Please select an element before proceeding.'
      });
      return;
    }

    setIsSaving(true);
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        emotionalState: selectedMood,
        lastActive: new Date().toISOString()
      });

      // Save note in localStorage or trigger a temporary logging to simulate note storage
      if (noteText.trim()) {
        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`pch_reflection_${user.id}_${today}`, noteText);
      }

      onAddToast({
        type: 'success',
        title: lang === 'pt' ? 'Frequência Sintonizada' : 'Frequency Synced',
        description: lang === 'pt' ? 'Seu clima interno foi guardado no Espelho.' : 'Your inner climate was successfully saved.'
      });

      // Award XP
      const earnedXP = 30;
      const currentPoints = user.points || 0;
      const newPoints = currentPoints + earnedXP;
      await updateDoc(userRef, {
        points: newPoints,
        level: Math.floor(newPoints / 100) + 1
      });

      setTimeout(() => {
        onBack();
      }, 900);

    } catch (err) {
      console.error("Error setting climate:", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-full w-full bg-[#fcf9f4] text-[#1c2e24] flex flex-col font-sans select-none select-none pb-24">
      {/* Mini inner header modeled after Screenshot 1 */}
      <div className="w-full max-w-4xl mx-auto px-6 py-4 flex justify-between items-center bg-transparent">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs uppercase tracking-wider font-mono font-medium">
            {lang === 'pt' ? 'Santuário' : 'Sanctuary'}
          </span>
        </button>
        <span className="text-[10px] tracking-[0.4em] text-stone-400 font-bold uppercase font-mono">
          O ESPELHO
        </span>
      </div>

      <div className="w-full max-w-2xl mx-auto px-6 space-y-8 mt-4 animate-fade-in">
        
        {/* Core title and subtitle */}
        <div className="text-center space-y-2.5 max-w-md mx-auto">
          <h1 className="text-3xl font-serif text-stone-800 tracking-wide font-normal">
            {lang === 'pt' ? 'O Espelho' : 'The Mirror'}
          </h1>
          <p className="text-stone-500 text-xs md:text-sm leading-relaxed font-light">
            {lang === 'pt' 
              ? 'Como está o tempo dentro de você hoje? Escolha o elemento que melhor reflete sua paisagem interna.' 
              : 'How is the weather inside you today? Choose the element that best reflects your inner landscape.'}
          </p>
        </div>

        {/* 4 Vertical-Stacked Cards */}
        <div className="space-y-4 max-w-md mx-auto">
          {moodsList.map((m) => {
            const isSelected = selectedMood === m.id;
            const Icon = m.icon;
            
            return (
              <button
                key={m.id}
                onClick={() => setSelectedMood(m.id)}
                className={`w-full p-4.5 rounded-3xl border flex items-center justify-between transition-all duration-300 relative overflow-hidden cursor-pointer ${
                  isSelected ? m.corSelected : m.corCard
                }`}
              >
                <div className="flex items-center gap-4.5">
                  <div className={`p-3 rounded-full ${m.corBg} flex items-center justify-center shrink-0`}>
                    <Icon className="w-[22px] h-[22px]" />
                  </div>
                  <div className="text-left space-y-1">
                    <span className="text-base font-serif font-semibold text-stone-800 leading-none">
                      {m.label}
                    </span>
                    <p className="text-[9px] font-mono tracking-widest text-stone-400 leading-none">
                      {lang === 'pt' ? m.sub : m.subEn}
                    </p>
                  </div>
                </div>
                
                {/* Subtle right tick selection helper */}
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-emerald-600/10 text-emerald-700 flex items-center justify-center text-xs animate-scale-in">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Note Area */}
        <div className="w-full max-w-md mx-auto space-y-3.5 pt-4">
          <div className="text-center">
            <span className="text-[10px] tracking-[0.25em] text-stone-400 font-bold uppercase font-mono">
              {lang === 'pt' ? 'NOTA DE REFLEXÃO' : 'REFLECTION NOTE'}
            </span>
          </div>

          <div className="rounded-[2rem] bg-white border border-stone-200/40 p-5.5 space-y-5.5 shadow-[0_4px_20px_rgba(139,92,26,0.02)]">
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder={
                lang === 'pt' 
                  ? 'O que está presente em sua mente agora? Deixe fluir sem julgamentos...' 
                  : 'What is present in your mind right now? Let it flow without judgment...'
              }
              className="w-full bg-transparent border-none outline-none resize-none text-[13px] md:text-sm leading-relaxed text-[#1c2e24] placeholder:text-stone-350 focus:ring-0 min-h-[90px] font-light p-0"
            />

            {/* Bottom Inner Segment with Padlock status & Save Button */}
            <div className="flex items-center justify-between border-t border-stone-100/60 pt-4">
              <div className="flex items-center gap-1.5 text-stone-400 pl-1 select-none">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-300" />
                <span className="text-[9px] font-mono tracking-wider font-light uppercase">
                  {lang === 'pt' ? 'Dados Privados/Seguros' : 'Private and secure'}
                </span>
              </div>

              <button
                onClick={handleSaveMoment}
                disabled={isSaving}
                className="py-2.5 px-6 bg-[#2d4734] hover:bg-[#223627] disabled:opacity-50 text-white font-semibold tracking-wider text-[10px] rounded-full uppercase transition-all shadow-md active:scale-95 cursor-pointer"
              >
                {isSaving 
                  ? (lang === 'pt' ? 'Sintonizando...' : 'Saving...') 
                  : (lang === 'pt' ? 'Salvar Momento' : 'Save Moment')}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
