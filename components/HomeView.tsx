import React, { useState, useEffect, useRef } from 'react';
import { User, Language } from '../types';
import { 
  Feather, 
  Droplet, 
  Waves, 
  Leaf, 
  Sun, 
  Moon, 
  CheckCircle2, 
  Circle, 
  Play,
  Square,
  Sparkles
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface HomeViewProps {
  user: User;
  lang: Language;
  onOpenJournal: () => void;
  onNavigateToChat: () => void;
  onNavigateToSettings: () => void;
  onNavigateToProfile: () => void;
  isLightTheme: boolean;
  onToggleTheme: () => void;
  onAddToast: (toast: { type: string; title: string; description: string; actionLabel?: string }) => void;
  onOpenTuningPopover: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  lang,
  onOpenJournal,
  onNavigateToChat,
  onNavigateToSettings,
  onNavigateToProfile,
  isLightTheme,
  onToggleTheme,
  onAddToast,
  onOpenTuningPopover,
}) => {
  // Breathing animation states
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingStep, setBreathingStep] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingTimer, setBreathingTimer] = useState(4);
  const [breathingProgress, setBreathingProgress] = useState(1); // multiplier scale

  // Daily activities tracked in localStorage
  const [activities, setActivities] = useState({
    journal: false,
    mood: false,
    chat: false,
    breathing: false
  });

  const breathingInterval = useRef<NodeJS.Timeout | null>(null);

  // Synchronize daily activities from state/localStorage
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const journalKey = `pch_act_journal_${user.id}_${today}`;
    const moodKey = `pch_act_mood_${user.id}_${today}`;
    const chatKey = `pch_act_chat_${user.id}_${today}`;
    const breathKey = `pch_act_breath_${user.id}_${today}`;

    setActivities({
      journal: localStorage.getItem(journalKey) === 'true',
      mood: localStorage.getItem(moodKey) === 'true' || !!user.emotionalState,
      chat: localStorage.getItem(chatKey) === 'true',
      breathing: localStorage.getItem(breathKey) === 'true'
    });
  }, [user.id, user.emotionalState]);

  // Set activity state helper
  const claimActivity = (type: 'journal' | 'mood' | 'chat' | 'breathing') => {
    const today = new Date().toISOString().split('T')[0];
    const key = `pch_act_${type}_${user.id}_${today}`;
    localStorage.setItem(key, 'true');
    setActivities(prev => {
      const updated = { ...prev, [type]: true };
      
      // Calculate XP rewards
      if (!prev[type]) {
        // Award XP on first time completion
        const earnedXP = 25;
        const currentPoints = user.points || 0;
        const newPoints = currentPoints + earnedXP;
        
        updateDoc(doc(db, 'users', user.id), {
          points: newPoints,
          level: Math.floor(newPoints / 100) + 1
        }).then(() => {
          onAddToast({
            type: 'success',
            title: lang === 'pt' ? 'Senda de Evolução' : 'Evolution Path',
            description: lang === 'pt' 
              ? `Progresso diário atualizado! +${earnedXP} XP adicionados no Jardim.`
              : `Daily progress updated! +${earnedXP} XP added to your Garden.`
          });
        }).catch(err => console.error("Error updating points:", err));
      }

      return updated;
    });
  };

  // Breathing loop logic (4s inhale -> 4s hold -> 4s exhale)
  useEffect(() => {
    if (isBreathingActive) {
      setBreathingTimer(4);
      setBreathingStep('inhale');
      setBreathingProgress(1.4); // expand scale

      const interval = setInterval(() => {
        setBreathingTimer(prev => {
          if (prev <= 1) {
            // Stage transitions
            setBreathingStep(current => {
              if (current === 'inhale') {
                setBreathingProgress(1.45); // keep max scale
                return 'hold';
              }
              if (current === 'hold') {
                setBreathingProgress(1.0); // shrink scale
                return 'exhale';
              }
              // complete loop
              claimActivity('breathing');
              setBreathingProgress(1.4); // inflate back
              return 'inhale';
            });
            return 4; // reset 4s timer
          }
          return prev - 1;
        });
      }, 1000);

      breathingInterval.current = interval;
    } else {
      if (breathingInterval.current) {
        clearInterval(breathingInterval.current);
      }
      setBreathingProgress(1.0);
    }

    return () => {
      if (breathingInterval.current) {
        clearInterval(breathingInterval.current);
      }
    };
  }, [isBreathingActive]);

  const toggleBreathing = () => {
    setIsBreathingActive(prev => !prev);
    if (!isBreathingActive) {
      onAddToast({
        type: 'session',
        title: lang === 'pt' ? 'O Sopro de Vida' : 'Breath of Life',
        description: lang === 'pt' 
          ? 'Respire fundo observando a folha flutuar com o ritmo.'
          : 'Breathe deeply noting how the leaf floats in harmony.'
      });
    }
  };

  // Time based friendly greeting
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 6 && hours < 12) {
      return lang === 'pt' ? 'Bom dia' : 'Good morning';
    } else if (hours >= 12 && hours < 18) {
      return lang === 'pt' ? 'Boa tarde' : 'Good afternoon';
    } else {
      return lang === 'pt' ? 'Boa noite' : 'Good evening';
    }
  };

  // Minimal sun/moon icon dynamic determination
  const getGreetingIcon = () => {
    const hours = new Date().getHours();
    if (hours >= 6 && hours < 18) {
      return <Sun className="w-5 h-5 text-amber-500 animate-[pulse_2.5s_infinite] shrink-0" />;
    } else {
      return <Moon className="w-4 h-4 text-emerald-300 dark:text-teal-450 shrink-0" />;
    }
  };

  // Update emotional state directly from Espelho tags (Blue Deep Waters representation)
  const handleMoodSelect = async (moodId: string, label: string) => {
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        emotionalState: moodId
      });
      claimActivity('mood');
      
      const messagesPt: Record<string, string> = {
        confuso: 'Sincronizado. Frequência sintonizada para Neblina — permitindo espaço para clareza.',
        ansioso: 'Tudo bem. Frequência Fogo ativada — tome um ciclo de Sopro com a folha guiada.',
        calmo: 'Lindo. Sintonia de Lago Sereno estabelecida — desfrute da calmaria.',
        feliz: 'Irradiante! Sintonia de Sol Registrada em sua jornada natural.'
      };
      const messagesEn: Record<string, string> = {
        confuso: 'Synced. Tone updated to Fog — allowing space for absolute clarity.',
        ansioso: 'It is okay. Active Fire frequency logged — breathe deeply with the guided leaf.',
        calmo: 'Lovely. Calm Lake frequency established — enjoy the deep tranquility.',
        feliz: 'Radiant! Bright Sun frequency logged into your natural rhythm.'
      };

      onAddToast({
        type: 'success',
        title: lang === 'pt' ? 'Frequência de Sintonia' : 'Tuning Frequency',
        description: lang === 'pt' ? (messagesPt[moodId] || `Estado ${label} registrado.`) : (messagesEn[moodId] || `${label} frequency registered.`)
      });
    } catch (err) {
      console.error("Error setting emotional state", err);
    }
  };

  // Computing completed percentage
  const totalCompleted = Object.values(activities).filter(Boolean).length;
  const completedPercentage = Math.round((totalCompleted / 4) * 100);

  return (
    <div className={`min-h-full w-full transition-colors duration-700 font-sans ${
      isLightTheme 
        ? 'bg-[#F4EFE6] text-stone-800' 
        : 'bg-[#0B1516] text-stone-100'
    }`}>
      <div className="max-w-4xl mx-auto px-6 py-8 md:py-12 space-y-8 select-none">
        
        {/* Welcome Block + Top Header Bar */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center border-b pb-6 border-stone-200/50 dark:border-stone-850/60 transition-all gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl md:text-3.5xl font-serif font-semibold tracking-wide flex items-center gap-2">
                <span>{getGreeting()}, {user.name}</span>
              </h1>
              <div className="p-1 rounded-full bg-stone-100/50 dark:bg-stone-900/30 backdrop-blur-md shrink-0">
                {getGreetingIcon()}
              </div>

              {/* Active tuning badge directly on Home screen header */}
              <button
                onClick={onOpenTuningPopover}
                className={`px-2 py-0.5 rounded-full border text-[8px] font-mono tracking-wide flex items-center space-x-1 hover:scale-105 active:scale-95 transition-all select-none cursor-pointer ${
                  user.emotionalState?.includes('confuso') || user.emotionalState?.includes('triste') || user.emotionalState?.includes('heavy')
                    ? 'text-blue-400 border-blue-500/20 bg-blue-500/10'
                    : user.emotionalState?.includes('ansioso') || user.emotionalState?.includes('irrit')
                      ? 'text-orange-400 border-orange-500/20 bg-orange-500/10'
                      : user.emotionalState?.includes('calmo') || user.emotionalState?.includes('seren')
                        ? 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10'
                        : user.emotionalState?.includes('feliz')
                          ? 'text-pink-400 border-pink-500/20 bg-pink-500/10'
                          : 'text-teal-400 border-teal-500/20 bg-teal-500/10'
                }`}
                title={lang === 'pt' ? 'Ver conceito sintonias' : 'See tuning concept'}
              >
                <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  user.emotionalState?.includes('confuso') || user.emotionalState?.includes('triste') || user.emotionalState?.includes('heavy')
                    ? 'bg-blue-400'
                    : user.emotionalState?.includes('ansioso') || user.emotionalState?.includes('irrit')
                      ? 'bg-orange-400'
                      : user.emotionalState?.includes('calmo') || user.emotionalState?.includes('seren')
                        ? 'bg-cyan-400'
                        : user.emotionalState?.includes('feliz')
                          ? 'bg-pink-400'
                          : 'bg-teal-400'
                }`} />
                <span>
                  {lang === 'pt' 
                    ? user.emotionalState?.includes('confuso') || user.emotionalState?.includes('triste') || user.emotionalState?.includes('heavy')
                      ? 'Sintonia Lunar ❄️'
                      : user.emotionalState?.includes('ansioso') || user.emotionalState?.includes('irrit')
                        ? 'Sintonia de Calma ⚡'
                        : user.emotionalState?.includes('calmo') || user.emotionalState?.includes('seren')
                          ? 'Sintonia Oceânica 🌊'
                          : user.emotionalState?.includes('feliz')
                            ? 'Ress. Estelar ✨'
                            : 'Sintonia Estável ⛰️'
                    : user.emotionalState?.includes('confuso') || user.emotionalState?.includes('triste') || user.emotionalState?.includes('heavy')
                      ? 'Lunar Tuning ❄️'
                      : user.emotionalState?.includes('ansioso') || user.emotionalState?.includes('irrit')
                        ? 'Calming Wave ⚡'
                        : user.emotionalState?.includes('calmo') || user.emotionalState?.includes('seren')
                          ? 'Oceanic Wave 🌊'
                          : user.emotionalState?.includes('feliz')
                            ? 'Stellar Ress. ✨'
                            : 'Stable Grounding ⛰️'
                  }
                </span>
              </button>
            </div>
            <p className={`text-xs md:text-sm ${isLightTheme ? 'text-stone-605' : 'text-[#8EA39A]'} font-light leading-relaxed tracking-wider`}>
              {lang === 'pt' 
                ? 'Como sua mente está respirando hoje?' 
                : 'How is your mind breathing today?'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Soft level indicator matching organic layout */}
            <div className={`px-3 py-1.5 rounded-2xl text-[10px] font-bold font-mono tracking-wider backdrop-blur-md border ${
              isLightTheme 
                ? 'bg-white/30 text-[#4c5c50] border-stone-200/40' 
                : 'bg-stone-900/45 text-[#9AC3B4] border-stone-800/40'
            }`}>
              LVL {user.level || 1} • {user.points || 0} XP
            </div>

            {/* Theme Toggle Button */}
            <button 
              onClick={onToggleTheme}
              className={`p-2.5 rounded-full border transition-all cursor-pointer backdrop-blur-md ${
                isLightTheme
                  ? 'bg-white/45 hover:bg-[#FAF7F0] text-amber-700 border-stone-205/65'
                  : 'bg-stone-900/45 border-stone-800/50 hover:bg-stone-850 text-teal-400'
              }`}
              title={lang === 'pt' ? 'Mudar visual' : 'Toggle aesthetic'}
            >
              {isLightTheme ? (
                <Moon className="w-4 h-4" />
              ) : (
                <Sun className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* 2x2 Bento Grid - The 4 Mindful Spheres */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          
          {/* Card 1: O Refúgio (Foliage/Forest Green) */}
          <div className={`p-6 rounded-[2rem] border transition-all duration-500 relative overflow-hidden backdrop-blur-md flex flex-col justify-between h-[210px] shadow-sm hover:translate-y-[-2px] ${
            isLightTheme 
              ? 'bg-[#E5EDE0]/75 border-[#C9DCC4]/50 hover:bg-[#EAF3E4] hover:shadow-md' 
              : 'bg-[#152519]/45 border-[#233C29]/40 hover:bg-[#192C1E]/55 hover:border-[#33553C]'
          }`}>
            <div className="flex justify-between items-start">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isLightTheme ? 'text-[#3E5F35]' : 'text-[#82B98E]'}`}>
                {lang === 'pt' ? 'O Refúgio' : 'The Sanctuary'}
              </span>
              <div className={`p-2 rounded-2xl ${isLightTheme ? 'bg-[#D6E6CC]/45' : 'bg-[#1D3222]/50'} transition-all`}>
                <Feather className={`w-5 h-5 ${isLightTheme ? 'text-[#3E5F35]' : 'text-[#82B98E]'}`} />
              </div>
            </div>
            
            <div className="my-3">
              <p className={`text-[11px] ${isLightTheme ? 'text-stone-600' : 'text-stone-400'} font-light italic leading-relaxed`}>
                {lang === 'pt' 
                  ? '"Escreva livremente."' 
                  : '"Write freely, let it flow."'}
              </p>
              <h3 className={`text-lg md:text-xl font-serif font-bold mt-1 ${isLightTheme ? 'text-[#2D4527]' : 'text-[#AEE2B5]'}`}>
                {lang === 'pt' ? 'Escrita Livre' : 'Free Writing'}
              </h3>
            </div>

            <button 
              onClick={() => {
                onOpenJournal();
                claimActivity('journal');
              }}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wider text-center transition-all cursor-pointer ${
                isLightTheme 
                  ? 'bg-[#3E5F35] text-white hover:bg-[#34502C] shadow-sm' 
                  : 'bg-[#82B98E] text-[#0A1A0E] hover:bg-[#92C79D]'
              }`}
            >
              {lang === 'pt' ? 'Começar a Escrever' : 'Start Writing'}
            </button>
          </div>

          {/* Card 2: O Espelho (Deep Lake Blue) */}
          <div className={`p-6 rounded-[2rem] border transition-all duration-500 relative overflow-hidden backdrop-blur-md flex flex-col justify-between h-[210px] shadow-sm hover:translate-y-[-2px] ${
            isLightTheme 
              ? 'bg-[#E5F0F5]/75 border-[#C2DCEB]/50 hover:bg-[#EAF5FA] hover:shadow-md' 
              : 'bg-[#0B2135]/45 border-[#183957]/45 hover:bg-[#0E2C44]/55 hover:border-[#1E4D75]'
          }`}>
            <div className="flex justify-between items-start">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isLightTheme ? 'text-[#1D4A66]' : 'text-[#74A9D3]'}`}>
                {lang === 'pt' ? 'O Espelho' : 'The Mirror'}
              </span>
              <div className={`p-2 rounded-2xl ${isLightTheme ? 'bg-[#CDE3F0]/45' : 'bg-[#102A42]/50'} transition-all`}>
                <Droplet className={`w-5 h-5 ${isLightTheme ? 'text-[#1D4A66]' : 'text-[#74A9D3]'}`} />
              </div>
            </div>
            
            <div className="my-2 select-none">
              <p className={`text-[11px] ${isLightTheme ? 'text-stone-600' : 'text-stone-400'} font-light italic leading-relaxed`}>
                {lang === 'pt' 
                  ? '"Nomeie o que você sente."' 
                  : '"Give a name to your feeling."'}
              </p>
              <h3 className={`text-lg md:text-xl font-serif font-bold mt-1 mb-2 ${isLightTheme ? 'text-[#1B364A]' : 'text-[#8CC7F5]'}`}>
                {lang === 'pt' ? 'Rastreador Emocional' : 'Emotion Tuner'}
              </h3>

              {/* Soothing responsive tags inside the card */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[
                  { id: 'confuso', label: 'Confuso' },
                  { id: 'ansioso', label: 'Ansioso' },
                  { id: 'calmo', label: 'Calmo' },
                  { id: 'feliz', label: 'Feliz' }
                ].map((mood) => {
                  const isActive = user.emotionalState === mood.id;
                  return (
                    <button
                      key={mood.id}
                      onClick={() => handleMoodSelect(mood.id, mood.label)}
                      className={`px-2.5 py-1 text-[10px] font-medium tracking-wide rounded-lg transition-all cursor-pointer ${
                        isActive
                          ? isLightTheme
                            ? 'bg-[#1D4A66]/20 border-[#1D4A66]/40 text-[#133042] font-semibold scale-105'
                            : 'bg-[#74A9D3]/25 border-[#74A9D3]/50 text-[#ADDCFF] scale-105 font-bold'
                          : isLightTheme
                            ? 'bg-[#FAF7F0]/60 border-[#CDE1EF] text-[#2C4A5E] hover:bg-white'
                            : 'bg-[#0E243A]/30 border-stone-800/60 text-[#8BB9DD] hover:text-stone-200 hover:border-stone-700'
                      } border`}
                    >
                      {mood.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div /> {/* spacing anchor */}
          </div>

          {/* Card 3: O Eco (Warm Terracotta / Soil Clay) */}
          <div className={`p-6 rounded-[2rem] border transition-all duration-500 relative overflow-hidden backdrop-blur-md flex flex-col justify-between h-[210px] shadow-sm hover:translate-y-[-2px] ${
            isLightTheme 
              ? 'bg-[#F7EEE6]/75 border-[#E5D2C2]/50 hover:bg-[#FBECE0] hover:shadow-md' 
              : 'bg-[#2D1B13]/40 border-[#442C21]/40 hover:bg-[#382218]/50 hover:border-[#5A3B2E]'
          }`}>
            <div className="flex justify-between items-start">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isLightTheme ? 'text-[#8C5D3A]' : 'text-[#D4A381]'}`}>
                {lang === 'pt' ? 'O Eco' : 'The Echo'}
              </span>
              <div className={`p-2 rounded-2xl ${isLightTheme ? 'bg-[#EDDDD0]/45' : 'bg-[#3C251B]/50'} transition-all`}>
                <Waves className={`w-5 h-5 ${isLightTheme ? 'text-[#8C5D3A]' : 'text-[#D4A381]'}`} />
              </div>
            </div>
            
            <div className="my-3">
              <p className={`text-[11px] ${isLightTheme ? 'text-stone-600' : 'text-stone-400'} font-light italic leading-relaxed`}>
                {lang === 'pt' 
                  ? '"Fale no seu ritmo."' 
                  : '"Speak at your own pace."'}
              </p>
              <h3 className={`text-lg md:text-xl font-serif font-bold mt-1 ${isLightTheme ? 'text-[#5B3E29]' : 'text-[#E3BA9E]'}`}>
                {lang === 'pt' ? 'Sessão por Voz' : 'Voice Sanctuary'}
              </h3>
            </div>

            <button 
              onClick={() => {
                onNavigateToChat();
                claimActivity('chat');
              }}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wider text-center transition-all cursor-pointer ${
                isLightTheme 
                  ? 'bg-[#8c5d3a] text-white hover:bg-[#734c2f] shadow-sm' 
                  : 'bg-[#d4a381] text-[#221208] hover:bg-[#e4b595]'
              }`}
            >
              {lang === 'pt' ? 'Iniciar ou Gravar' : 'Begin Voice'}
            </button>
          </div>

          {/* Card 4: O Sopro (Foliage / Wind Leaf - Sage Air) */}
          <div className={`p-6 rounded-[2rem] border transition-all duration-500 relative overflow-hidden backdrop-blur-md flex flex-col justify-between h-[210px] shadow-sm hover:translate-y-[-2px] ${
            isLightTheme 
              ? 'bg-[#EDEBE0]/75 border-[#DDD6C0]/50 hover:bg-[#F3EFE0] hover:shadow-md' 
              : 'bg-[#21231D]/45 border-[#34372F]/40 hover:bg-[#2A2E26]/50 hover:border-[#4B5244]'
          }`}>
            <div className="flex justify-between items-start">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isLightTheme ? 'text-[#5F634A]' : 'text-[#C4BC9E]'}`}>
                {lang === 'pt' ? 'O Sopro' : 'The Breath'}
              </span>
              <div className={`p-2 rounded-2xl ${isLightTheme ? 'bg-[#DFDAC4]/45' : 'bg-[#2A2C25]/50'} transition-all`}>
                <Leaf className={`w-5 h-5 ${isLightTheme ? 'text-[#5F634A]' : 'text-[#C4BC9E]'}`} />
              </div>
            </div>
            
            <div className="flex flex-row items-center gap-4 my-2">
              <div className="flex-1">
                <p className={`text-[11px] ${isLightTheme ? 'text-[#5F634A]' : 'text-stone-400'} font-light italic leading-relaxed`}>
                  {lang === 'pt' 
                    ? '"Respire no ritmo PCH."' 
                    : '"Breathe with the PCH cycle."'}
                </p>
                <h3 className={`text-base md:text-lg font-serif font-bold mt-1 ${isLightTheme ? 'text-[#3B3E2D]' : 'text-[#EBE4C5]'}`}>
                  {isBreathingActive 
                    ? breathingStep === 'inhale' 
                      ? (lang === 'pt' ? 'Inale...' : 'Inhale...') 
                      : breathingStep === 'hold' 
                        ? (lang === 'pt' ? 'Retenha...' : 'Hold...') 
                        : (lang === 'pt' ? 'Exale...' : 'Exhale...')
                    : (lang === 'pt' ? 'Ancoragem do Sopro' : 'Mindful Anchoring')}
                </h3>
                {isBreathingActive && (
                  <p className={`text-[9px] uppercase tracking-widest mt-1 font-mono font-bold ${
                    isLightTheme ? 'text-stone-550' : 'text-stone-400'
                  }`}>
                    {breathingStep === 'inhale' && (lang === 'pt' ? 'Expandindo' : 'Expanding')}
                    {breathingStep === 'hold' && (lang === 'pt' ? 'Pausa Plena' : 'Holding breath')}
                    {breathingStep === 'exhale' && (lang === 'pt' ? 'Esvaziando' : 'Releasing')}
                    {` • ${breathingTimer}s`}
                  </p>
                )}
              </div>

              {/* Dynamic scale visualizer bubble */}
              <div className="w-12 h-12 flex items-center justify-center relative select-none shrink-0">
                <div 
                  className={`w-10 h-10 rounded-full transition-all duration-1000 ${
                    isLightTheme 
                      ? 'bg-[#5F634A]/15 border border-[#5F634A]/30' 
                      : 'bg-[#C4BC9E]/20 border border-[#C4BC9E]/40'
                  }`}
                  style={{
                    transform: `scale(${isBreathingActive ? breathingProgress : 1})`,
                    boxShadow: isBreathingActive ? '0 0 16px rgba(196, 188, 158, 0.2)' : 'none'
                  }}
                />
                <span className={`absolute text-[8px] font-mono tracking-tighter ${
                  isLightTheme ? 'text-[#444734]' : 'text-[#DFD7B5]'
                }`}>
                  {isBreathingActive ? `${breathingTimer}s` : 'PCH'}
                </span>
              </div>
            </div>

            <button 
              onClick={toggleBreathing}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold tracking-wider text-center transition-all cursor-pointer ${
                isBreathingActive
                  ? isLightTheme
                    ? 'bg-stone-200 text-stone-700 hover:bg-stone-300'
                    : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                  : isLightTheme 
                    ? 'bg-[#5F634A] text-white hover:bg-[#4E513C] shadow-sm' 
                    : 'bg-[#C4BC9E] text-[#201F18] hover:bg-[#DDD6B8]'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                {isBreathingActive ? (
                  <>
                    <Square className="w-3.5 h-3.5" />
                    {lang === 'pt' ? 'Pausar' : 'Pause'}
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    {lang === 'pt' ? 'Fazer Pausa' : 'Take Pause'}
                  </>
                )}
              </span>
            </button>
          </div>

        </div>

        {/* 3. Sua Jornada de Hoje - Progression Dashboard block with glassmorphism */}
        <div className={`p-6 md:p-8 rounded-[2rem] border backdrop-blur-md transition-all ${
          isLightTheme 
            ? 'bg-white/45 border-stone-200/55 shadow-[#000]/1' 
            : 'bg-[#0E2421]/20 border-white/[0.04] shadow-inner'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-4 border-stone-200/30 dark:border-stone-850/60 transition-all">
            <div className="space-y-0.5">
              <h2 className="text-sm md:text-base font-serif font-semibold tracking-widest uppercase">
                {lang === 'pt' ? 'Sua Jornada de Hoje' : 'Your Journey Today'}
              </h2>
              <p className={`text-[11px] ${isLightTheme ? 'text-stone-500' : 'text-[#8EA39A]'} font-light`}>
                {lang === 'pt' 
                  ? 'Compromisso diário de autoconhecimento e calma.' 
                  : 'Daily touchpoint of awareness, clarity and mindfulness.'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-teal-500">{completedPercentage}% {lang === 'pt' ? 'concluido' : 'completed'}</span>
            </div>
          </div>

          {/* Clean Progress indicator bar */}
          <div className={`w-full h-2 rounded-full overflow-hidden my-4 ${
            isLightTheme ? 'bg-stone-200/60' : 'bg-[#0E201B]'
          }`}>
            <div 
              className="h-full bg-gradient-to-r from-teal-500 via-[#82B98E] to-[#d4a381] transition-all duration-1000 rounded-full"
              style={{ width: `${completedPercentage}%` }}
            />
          </div>

          {/* Activity items with responsive tick icons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
            
            {/* Act 1 */}
            <div className="flex items-center gap-3">
              {activities.journal ? (
                <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
              ) : (
                <Circle className={`w-5 h-5 ${isLightTheme ? 'text-stone-300' : 'text-stone-750'} shrink-0`} />
              )}
              <div>
                <p className="text-xs font-semibold leading-none">{lang === 'pt' ? 'Refúgio de Ideias' : 'Sanctuary of thought'}</p>
                <p className={`text-[10px] ${isLightTheme ? 'text-stone-400' : 'text-stone-500'} mt-0.5`}>
                  {lang === 'pt' ? 'Escrita livre ou pensamento anotado' : 'Free journal logging completed'}
                </p>
              </div>
            </div>

            {/* Act 2 */}
            <div className="flex items-center gap-3">
              {activities.mood ? (
                <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
              ) : (
                <Circle className={`w-5 h-5 ${isLightTheme ? 'text-stone-300' : 'text-stone-750'} shrink-0`} />
              )}
              <div>
                <p className="text-xs font-semibold leading-none">{lang === 'pt' ? 'Sintonia Presente' : 'Present awareness'}</p>
                <p className={`text-[10px] ${isLightTheme ? 'text-stone-400' : 'text-stone-500'} mt-0.5`}>
                  {lang === 'pt' ? 'Rastreou suas flutuações e humor atual' : 'Emotional frequency synchronized'}
                </p>
              </div>
            </div>

            {/* Act 3 */}
            <div className="flex items-center gap-3">
              {activities.chat ? (
                <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
              ) : (
                <Circle className={`w-5 h-5 ${isLightTheme ? 'text-stone-300' : 'text-stone-750'} shrink-0`} />
              )}
              <div>
                <p className="text-xs font-semibold leading-none">{lang === 'pt' ? 'Conexão e Voz' : 'Echo resonance voice'}</p>
                <p className={`text-[10px] ${isLightTheme ? 'text-stone-400' : 'text-stone-500'} mt-0.5`}>
                  {lang === 'pt' ? 'Apoio e insights gerados em chat' : 'Spoken session with guide done'}
                </p>
              </div>
            </div>

            {/* Act 4 */}
            <div className="flex items-center gap-3">
              {activities.breathing ? (
                <CheckCircle2 className="w-5 h-5 text-teal-500 shrink-0" />
              ) : (
                <Circle className={`w-5 h-5 ${isLightTheme ? 'text-stone-300' : 'text-stone-750'} shrink-0`} />
              )}
              <div>
                <p className="text-xs font-semibold leading-none">{lang === 'pt' ? 'Pausa Coerente' : 'Rhythmic pause'}</p>
                <p className={`text-[10px] ${isLightTheme ? 'text-stone-400' : 'text-stone-500'} mt-0.5`}>
                  {lang === 'pt' ? 'Exercício respiratório guiado concluído' : 'Sopro anchoring practice done'}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Minimalist quotes generated by PCH */}
        <div className="text-center pt-2 select-none">
          <p className={`text-[11px] font-serif italic ${isLightTheme ? 'text-stone-400' : 'text-[#647C72]'} leading-relaxed tracking-widest max-w-md mx-auto`}>
            {lang === 'pt'
              ? '"O silêncio não está vazio. Está cheio de respostas sintonizadas pelo sopro correto."'
              : '"Silence is not empty. It is full of answers tuned through the perfect mindful breath."'}
          </p>
        </div>

      </div>
    </div>
  );
};
