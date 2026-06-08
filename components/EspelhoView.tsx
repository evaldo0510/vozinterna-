import React, { useState, useEffect } from 'react';
import { User, Language } from '../types';
import { Sun, Cloud, Wind, Droplets, ShieldCheck, ArrowLeft, Check, Sparkles } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

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
      corBg: 'bg-amber-500/20 text-amber-400 border border-amber-500/20',
      corCard: 'hover:border-amber-500/30 bg-[#101826]/70 border-[#1d2745]',
      corSelected: 'border-amber-400 bg-amber-500/10 shadow-[0_0_20px_rgba(251,191,36,0.15)]',
      metaphorPt: '“O vento desfez as nuvens. A luz dourada do sol penetra o santuário interno, acalentando cada folha.”',
      metaphorEn: '“The wind has dispersed the clutter. Soft golden sunlight penetrates your inner sanctuary, warming every leaf.”'
    },
    {
      id: 'confuso',
      label: lang === 'pt' ? 'Névoa / Pausa' : 'Fog / Pause',
      sub: 'NÉVOA',
      subEn: 'FOG',
      icon: Cloud,
      corBg: 'bg-teal-500/20 text-teal-300 border border-teal-500/20',
      corCard: 'hover:border-teal-500/30 bg-[#101826]/70 border-[#1d2745]',
      corSelected: 'border-[#14B8A6] bg-teal-500/10 shadow-[0_0_20px_rgba(20,184,166,0.15)]',
      metaphorPt: '“Uma névoa cinzenta e pacífica repousa sobre a floresta da mente. Não há pressa para enxergar longe; confie nas raízes.”',
      metaphorEn: '“A peaceful silvery mist cradles your mental landscape. There is no rush to see clearly; rest in your steady roots.”'
    },
    {
      id: 'ansioso',
      label: lang === 'pt' ? 'Agitado / Vento' : 'Agitated / Wind',
      sub: 'VENTO',
      subEn: 'WIND',
      icon: Wind,
      corBg: 'bg-violet-500/20 text-violet-400 border border-violet-500/20',
      corCard: 'hover:border-violet-500/30 bg-[#101826]/70 border-[#1d2745]',
      corSelected: 'border-violet-400 bg-violet-400/10 shadow-[0_0_20px_rgba(167,139,250,0.15)]',
      metaphorPt: '“Ventos fortes agitam a copa. A árvore balança livremente na tempestade, mas seu centro permanece inteiro e seguro.”',
      metaphorEn: '“Fierce gales sweep across the heights. The timber sways freely with the gusts, yet its inner core sits still.”'
    },
    {
      id: 'calmo',
      label: lang === 'pt' ? 'Lidando / Chuva' : 'Coping / Rain',
      sub: 'CHUVA',
      subEn: 'RAIN',
      icon: Droplets,
      corBg: 'bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/20',
      corCard: 'hover:border-[#34D399]/30 bg-[#101826]/70 border-[#1d2745]',
      corSelected: 'border-[#34D399] bg-[#34D399]/10 shadow-[0_0_20px_rgba(52,211,153,0.15)]',
      metaphorPt: '“A chuva cai mansa, limpando a poeira sobre os galhos altos. Cada gota nutre o silêncio da terra fértil.”',
      metaphorEn: '“A gentle rain descends, cleansing weights from your branches. Every droplet slowly nourishes the receptive earth.”'
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
        level: Math.floor(newPoints / 200) + 1
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

  const activeMetaphorObj = moodsList.find(m => m.id === selectedMood);

  return (
    <div className="min-h-full w-full bg-[#080B14] text-[#E0E7E5] flex flex-col font-sans select-none pb-24 relative overflow-hidden">
      
      {/* Decorative ambient blurred backgrounds */}
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-[#14B8A6]/5 rounded-full blur-[90px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#34D399]/5 rounded-full blur-[90px] pointer-events-none" />

      {/* Mini inner header */}
      <div className="w-full max-w-4xl mx-auto px-6 py-4 flex justify-between items-center bg-transparent z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-[#14B8A6] transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs uppercase tracking-wider font-mono font-bold">
            {lang === 'pt' ? 'Santuário' : 'Sanctuary'}
          </span>
        </button>
        <span className="text-[10px] tracking-[0.4em] text-slate-500 font-bold uppercase font-mono">
          O ESPELHO EMOCIONAL
        </span>
      </div>

      <div className="w-full max-w-2xl mx-auto px-6 space-y-8 mt-4 z-10">
        
        {/* Core title and subtitle */}
        <div className="text-center space-y-2.5 max-w-md mx-auto">
          <h1 className="text-3xl font-serif text-stone-105 tracking-wide font-black bg-gradient-to-r from-[#14B8A6] via-[#34D399] to-amber-300 bg-clip-text text-transparent">
            {lang === 'pt' ? 'Espelho Emocional' : 'Emotion Mirror'}
          </h1>
          <p className="text-slate-400 text-xs md:text-sm leading-relaxed font-light">
            {lang === 'pt' 
              ? 'Como está o clima ecológico dentro de você hoje? Escolha o elemento que melhor espelha sua paisagem interna.' 
              : 'How is the ecological weather inside you today? Choose the element that best mirrors your internal landscape.'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-11 gap-6 max-w-3xl mx-auto items-start">
          
          {/* Stacked element list - Left block */}
          <div className="space-y-3.5 md:col-span-5">
            {moodsList.map((m) => {
              const isSelected = selectedMood === m.id;
              const Icon = m.icon;
              
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMood(m.id)}
                  className={`w-full p-4 rounded-3xl border flex items-center justify-between transition-all duration-300 relative overflow-hidden cursor-pointer ${
                    isSelected ? m.corSelected : m.corCard
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 rounded-full ${m.corBg} flex items-center justify-center shrink-0`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="text-left space-y-0.5">
                      <span className="text-sm font-semibold text-stone-100 leading-none">
                        {m.label}
                      </span>
                      <p className="text-[9px] font-mono tracking-widest text-[#14B8A6] leading-none">
                        {lang === 'pt' ? m.sub : m.subEn}
                      </p>
                    </div>
                  </div>
                  
                  {/* Subtle right tick selection helper */}
                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 text-[#34D399] flex items-center justify-center text-xs animate-scale-in">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Cinematic Metaphor Card and Reflection Text - Right block */}
          <div className="space-y-4 md:col-span-6">
            
            {/* Dynamic cinematic weather description */}
            <AnimatePresence mode="wait">
              {activeMetaphorObj ? (
                <motion.div 
                  key={activeMetaphorObj.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                  className="p-5.5 rounded-[2rem] bg-[#101826]/60 border border-[#1d2745] text-left space-y-3"
                >
                  <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-amber-400 font-bold uppercase">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>{lang === 'pt' ? 'Mapeamento Coerente' : 'Adaptive Translation'}</span>
                  </div>
                  <p className="font-serif italic text-[12.5px] md:text-sm leading-relaxed text-stone-300">
                    {lang === 'pt' ? activeMetaphorObj.metaphorPt : activeMetaphorObj.metaphorEn}
                  </p>
                </motion.div>
              ) : (
                <div className="p-5.5 rounded-[2rem] bg-[#101826]/30 border border-[#1d2745]/30 text-left">
                  <p className="text-xs text-slate-500 italic font-mono">
                    {lang === 'pt' ? 'Selecione uma sintonia climática ao lado para ver sua tradução poética.' : 'Select a weather tuning element to view its poetic counterpart.'}
                  </p>
                </div>
              )}
            </AnimatePresence>

            {/* Private notepad container */}
            <div className="rounded-[2.2rem] bg-[#101826] border border-[#1d2745] p-5.5 space-y-4 shadow-xl">
              <div className="text-left border-b border-[#1d2745]/50 pb-2.5">
                <span className="text-[9px] tracking-[0.25em] text-[#14B8A6] font-bold uppercase font-mono">
                  {lang === 'pt' ? 'ANOTAÇÃO SENSORIAL SECO' : 'PRIVATE REFLECTION LOG'}
                </span>
              </div>

              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder={
                  lang === 'pt' 
                    ? 'Quais sentimentos ou percepções físicas estão agindo sob sua mente agora? Permita-se ancorá-los suavemente...' 
                    : 'What feelings or sensory states populate your mind code right now? Anchor them gently without constraint...'
                }
                className="w-full bg-transparent border-none outline-none resize-none text-xs md:text-sm leading-relaxed text-slate-300 placeholder:text-slate-500 focus:ring-0 min-h-[95px] font-light p-0"
              />

              {/* Bottom security padlock status & Save Button */}
              <div className="flex items-center justify-between border-t border-[#1d2745]/40 pt-4">
                <div className="flex items-center gap-1.5 text-slate-500 pl-1 select-none">
                  <ShieldCheck className="w-4 h-4 text-[#34D399] opacity-80" />
                  <span className="text-[9px] font-mono tracking-wider font-light uppercase">
                    {lang === 'pt' ? 'Dados Privados • Zero Nuvem Social' : 'Secure & isolated'}
                  </span>
                </div>

                <button
                  onClick={handleSaveMoment}
                  disabled={isSaving}
                  className="py-2.5 px-6 bg-gradient-to-r from-[#14B8A6] to-[#34D399] hover:from-[#0da090] hover:to-[#2cb082] disabled:opacity-40 text-stone-900 font-bold tracking-wider text-[10px] rounded-full uppercase transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  {isSaving 
                    ? (lang === 'pt' ? 'Sintonizando...' : 'Saving...') 
                    : (lang === 'pt' ? 'Sintonizar clima' : 'Save Moment')}
                </button>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
