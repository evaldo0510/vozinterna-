import React, { useState, useEffect, useRef } from 'react';
import { User, Language } from '../types';
import { 
  Feather, 
  Droplet, 
  Mic, 
  Wind, 
  Sun, 
  Moon, 
  CheckCircle2, 
  Circle, 
  BookOpen, 
  Sliders, 
  User as UserIcon,
  Play,
  Square,
  Sparkles,
  Volume2
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
                setBreathingProgress(1.5); // keep max scale
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
          ? 'Respire fundo seguindo a expansão do círculo.'
          : 'Breathe deeply following the circle expansion.'
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

  // Update emotional state directly from Espelho tags
  const handleMoodSelect = async (moodId: string, label: string) => {
    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        emotionalState: moodId
      });
      claimActivity('mood');
      
      const messagesPt: Record<string, string> = {
        confuso: 'Sincronizado. Frequência sintonizada para Neblina — um espaço para clareza.',
        ansioso: 'Tudo bem. Frequência Fogo ativada — respire fundo com O Sopro agora.',
        calmo: 'Lindo. Sopro de Brisa estabelecido — aproveite este momento.',
        feliz: 'Irradiante! Sintonia de Sol radiante registrada em sua jornada.'
      };
      const messagesEn: Record<string, string> = {
        confuso: 'Synced. Tone updated to Fog — allow space for cognitive clarity.',
        ansioso: 'It is okay. Fire frequency logged — take a slow deep breath with O Sopro.',
        calmo: 'Lovely. Gentle breeze grounding established — enjoy this moment.',
        feliz: 'Radiant! Bright sun energy recorded in your cognitive path.'
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
        ? 'bg-[#fdfbf6] text-stone-800' 
        : 'bg-stone-950 text-stone-100'
    }`}>
      <div className="max-w-4xl mx-auto px-6 py-6 md:py-10 space-y-8 select-none">
        
        {/* Welcome Block + Top Header Bar */}
        <div className="flex flex-row justify-between items-start border-b pb-6 border-stone-200/40 dark:border-stone-900/60 transition-all">
          <div className="space-y-1.5 md:space-y-2">
            <h1 className="text-xl md:text-3xl font-serif font-semibold tracking-wide flex items-center gap-2">
              <span>{getGreeting()}, {user.name}</span>
            </h1>
            <p className={`text-sm md:text-base ${isLightTheme ? 'text-stone-500' : 'text-stone-400'} font-light leading-relaxed tracking-wider`}>
              {lang === 'pt' 
                ? 'Como sua mente está respirando hoje?' 
                : 'How is your mind breathing today?'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Soft level indicator */}
            <div className={`px-3 py-1.5 rounded-2xl text-[10px] font-bold font-mono tracking-wider ${
              isLightTheme ? 'bg-stone-100 text-stone-600' : 'bg-stone-900/60 text-stone-400'
            }`}>
              LVL {user.level || 1} • {user.points || 0} XP
            </div>

            {/* Theme Toggle Button matching top right design */}
            <button 
              onClick={onToggleTheme}
              className={`p-2.5 rounded-full border transition-all cursor-pointer ${
                isLightTheme
                  ? 'bg-stone-100 hover:bg-stone-200 text-amber-600 border-stone-200'
                  : 'bg-stone-900/40 border-stone-850 hover:bg-stone-900 text-teal-400'
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
          
          {/* Card 1: O Refúgio (Mint / Sage theme) */}
          <div className={`p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[210px] shadow-sm hover:translate-y-[-2px] ${
            isLightTheme 
              ? 'bg-[#edf4e8]/85 border-[#dfedd5]/60 hover:bg-[#ebf3e6] shadow-[#e1ebd9]/40' 
              : 'bg-[#182312]/30 border-[#1f3017]/40 hover:bg-[#1a2914]/40 hover:border-[#2f4923]'
          }`}>
            <div className="flex justify-between items-start">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isLightTheme ? 'text-[#3b4c34]' : 'text-[#8dae7e]'}`}>
                {lang === 'pt' ? 'O Refúgio' : 'The Sanctuary'}
              </span>
              <div className={`p-2 rounded-2xl ${isLightTheme ? 'bg-[#dfefe0]/50' : 'bg-[#22351c]/30'} transition-all`}>
                <Feather className={`w-5 h-5 ${isLightTheme ? 'text-[#485e3f]' : 'text-[#8fbf80]'}`} />
              </div>
            </div>
            
            <div className="my-3">
              <p className={`text-xs ${isLightTheme ? 'text-stone-550' : 'text-stone-400'} font-light leading-relaxed`}>
                {lang === 'pt' 
                  ? 'Escreva sem regras. Apenas deixe fluir.' 
                  : 'Write without limits. Just let thoughts drift.'}
              </p>
              <h3 className={`text-lg md:text-xl font-serif font-bold mt-1 ${isLightTheme ? 'text-[#2b3a24]' : 'text-[#aee29a]'}`}>
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
                  ? 'bg-[#3e5635] text-white hover:bg-[#34482c] shadow-sm shadow-[#3e5635]/20' 
                  : 'bg-[#89b378] text-[#12230a] hover:bg-[#9cc18c]'
              }`}
            >
              {lang === 'pt' ? 'Começar a Escrever' : 'Start Writing'}
            </button>
          </div>

          {/* Card 2: O Espelho (Ice / Sky theme) */}
          <div className={`p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[210px] shadow-sm hover:translate-y-[-2px] ${
            isLightTheme 
              ? 'bg-[#e9f2f8]/85 border-[#d6e6f1]/60 hover:bg-[#e4eff6] shadow-[#dae7f0]/40' 
              : 'bg-[#101c27]/30 border-[#152737]/40 hover:bg-[#132231]/40 hover:border-[#1d3d57]'
          }`}>
            <div className="flex justify-between items-start">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isLightTheme ? 'text-[#1d354a]' : 'text-[#6caee0]'}`}>
                {lang === 'pt' ? 'O Espelho' : 'The Mirror'}
              </span>
              <div className={`p-2 rounded-2xl ${isLightTheme ? 'bg-[#dfebf5]/50' : 'bg-[#162f43]/30'} transition-all`}>
                <Droplet className={`w-5 h-5 ${isLightTheme ? 'text-[#1e3c54]' : 'text-[#7fbbe2]'}`} />
              </div>
            </div>
            
            <div className="my-2 select-none">
              <p className={`text-xs ${isLightTheme ? 'text-stone-550' : 'text-stone-400'} font-light leading-relaxed`}>
                {lang === 'pt' 
                  ? 'Dê um nome ao que você sente agora.' 
                  : 'Speak a name into what you feel right now.'}
              </p>
              <h3 className={`text-lg md:text-xl font-serif font-bold mt-1 mb-2 ${isLightTheme ? 'text-[#192b3a]' : 'text-[#8bc7f5]'}`}>
                {lang === 'pt' ? 'Rastreador Emocional' : 'Emotion Tuner'}
              </h3>

              {/* Soothing responsive tags inside the card - matching mockup */}
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
                            ? 'bg-[#1d3c52]/15 border-[#1d3c52]/30 text-[#153444] font-semibold scale-105'
                            : 'bg-[#6ab3eb]/20 border-[#6ab3eb]/45 text-[#9acbf2] scale-105 font-bold'
                          : isLightTheme
                            ? 'bg-[rgba(255,255,255,0.45)] border-[#dae6ef] text-[#2c404e] hover:bg-white'
                            : 'bg-[#1b2b3a]/30 border-stone-850/60 text-stone-400 hover:text-stone-200 hover:border-stone-700'
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

          {/* Card 3: O Eco (Lavender / Twilight theme) */}
          <div className={`p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[210px] shadow-sm hover:translate-y-[-2px] ${
            isLightTheme 
              ? 'bg-[#f1edf8]/85 border-[#e5ddf2]/60 hover:bg-[#ede7f5] shadow-[#e3daef]/40' 
              : 'bg-[#1e1329]/30 border-[#281839]/40 hover:bg-[#211531]/40 hover:border-[#42295d]'
          }`}>
            <div className="flex justify-between items-start">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isLightTheme ? 'text-[#3e2c56]' : 'text-[#b9a5d3]'}`}>
                {lang === 'pt' ? 'O Eco' : 'The Echo'}
              </span>
              <div className={`p-2 rounded-2xl ${isLightTheme ? 'bg-[#eadef5]/50' : 'bg-[#2a1b38]/30'} transition-all`}>
                <Mic className={`w-5 h-5 ${isLightTheme ? 'text-[#503a6a]' : 'text-[#ca9eed]'}`} />
              </div>
            </div>
            
            <div className="my-3">
              <p className={`text-xs ${isLightTheme ? 'text-stone-550' : 'text-stone-400'} font-light leading-relaxed`}>
                {lang === 'pt' 
                  ? 'Fale livremente. Nós acolhemos e organizamos.' 
                  : 'Speak freely. We organize and tune your thoughts.'}
              </p>
              <h3 className={`text-lg md:text-xl font-serif font-bold mt-1 ${isLightTheme ? 'text-[#2e1d42]' : 'text-[#d6c2ed]'}`}>
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
                  ? 'bg-[#402e5c] text-white hover:bg-[#34244c] shadow-sm shadow-[#402e5c]/20' 
                  : 'bg-[#ab93cb] text-[#1c112b] hover:bg-[#beabda]'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Volume2 className="w-4 h-4" />
                {lang === 'pt' ? 'Iniciar ou Gravar' : 'Begin Voice'}
              </span>
            </button>
          </div>

          {/* Card 4: O Sopro (Peach / Terracotta theme with embedded breathing loop animations) */}
          <div className={`p-6 rounded-[2rem] border transition-all duration-300 relative overflow-hidden flex flex-col justify-between h-[210px] shadow-sm hover:translate-y-[-2px] ${
            isLightTheme 
              ? 'bg-[#faefe8]/85 border-[#f3ded2]/60 hover:bg-[#f6eae0] shadow-[#efe0d6]/40' 
              : 'bg-[#291711]/30 border-[#3b2016]/40 hover:bg-[#2f1b13]/40 hover:border-[#5c3121]'
          }`}>
            <div className="flex justify-between items-start">
              <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${isLightTheme ? 'text-[#4e2f20]' : 'text-[#daa387]'}`}>
                {lang === 'pt' ? 'O Sopro' : 'The Breath'}
              </span>
              <div className={`p-2 rounded-2xl ${isLightTheme ? 'bg-[#f4dfd3]/50' : 'bg-[#3b2014]/30'} transition-all`}>
                <Wind className={`w-5 h-5 ${isLightTheme ? 'text-[#643d2c]' : 'text-[#eaad8e]'}`} />
              </div>
            </div>
            
            <div className="flex flex-row items-center gap-4 my-2">
              <div className="flex-1">
                <p className={`text-xs ${isLightTheme ? 'text-stone-550' : 'text-stone-400'} font-light leading-relaxed`}>
                  {lang === 'pt' 
                    ? 'Um minuto de pausa consciente.' 
                    : 'One minute of deep calming rhythm.'}
                </p>
                <h3 className={`text-lg md:text-xl font-serif font-bold mt-1 ${isLightTheme ? 'text-[#3d2214]' : 'text-[#eaa886]'}`}>
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
                    isLightTheme ? 'text-stone-500' : 'text-stone-400'
                  }`}>
                    {breathingStep === 'inhale' && (lang === 'pt' ? 'Expandindo' : 'Expanding')}
                    {breathingStep === 'hold' && (lang === 'pt' ? 'Plenitude em Pausa' : 'Holding breath')}
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
                      ? 'bg-[#bd633b]/15 border border-[#bd633b]/30' 
                      : 'bg-[#ea936c]/20 border border-[#ea936c]/40'
                  }`}
                  style={{
                    transform: `scale(${isBreathingActive ? breathingProgress : 1})`,
                    boxShadow: isBreathingActive ? '0 0 16px rgba(234, 147, 108, 0.2)' : 'none'
                  }}
                />
                <span className={`absolute text-[8px] font-mono tracking-tighter ${
                  isLightTheme ? 'text-[#4e2c1c]' : 'text-[#eaad8d]'
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
                    ? 'bg-[#5c311c] text-white hover:bg-[#4d2917] shadow-sm shadow-[#5c311c]/20' 
                    : 'bg-[#ea966f] text-[#241108] hover:bg-[#ecaa89]'
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
                    {lang === 'pt' ? 'Começar Respiração' : 'Begin Breathing'}
                  </>
                )}
              </span>
            </button>
          </div>

        </div>

        {/* 3. Sua Jornada de Hoje - Progression Dashboard block */}
        <div className={`p-6 md:p-8 rounded-[2rem] border transition-all ${
          isLightTheme 
            ? 'bg-stone-50/70 border-stone-200/50 shadow-[#000]/2' 
            : 'bg-stone-900/30 border-stone-900/80 shadow-inner'
        }`}>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b pb-4 border-stone-200/30 dark:border-stone-850/60 transition-all">
            <div className="space-y-0.5">
              <h2 className="text-base font-serif font-semibold tracking-widest uppercase">
                {lang === 'pt' ? 'Sua Jornada de Hoje' : 'Your Journey Today'}
              </h2>
              <p className={`text-[11px] ${isLightTheme ? 'text-stone-500' : 'text-stone-400'} font-light`}>
                {lang === 'pt' 
                  ? 'Compromisso diário de autoconhecimento e calma.' 
                  : 'Daily touchpoint of awareness, clarity and mindfulness.'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-teal-500">{completedPercentage}% {lang === 'pt' ? 'concluído' : 'completed'}</span>
            </div>
          </div>

          {/* Clean Progress indicator bar */}
          <div className={`w-full h-2 rounded-full overflow-hidden my-4 ${
            isLightTheme ? 'bg-stone-200/60' : 'bg-stone-950'
          }`}>
            <div 
              className="h-full bg-gradient-to-r from-teal-500 via-sky-500 to-[#ea936c] transition-all duration-1000 rounded-full"
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
                <Circle className={`w-5 h-5 ${isLightTheme ? 'text-stone-300' : 'text-stone-700'} shrink-0`} />
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
                <Circle className={`w-5 h-5 ${isLightTheme ? 'text-stone-300' : 'text-stone-700'} shrink-0`} />
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
                <Circle className={`w-5 h-5 ${isLightTheme ? 'text-stone-300' : 'text-stone-700'} shrink-0`} />
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
                <Circle className={`w-5 h-5 ${isLightTheme ? 'text-stone-300' : 'text-stone-700'} shrink-0`} />
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
          <p className={`text-[11px] font-serif italic ${isLightTheme ? 'text-stone-400' : 'text-stone-600'} leading-relaxed tracking-widest max-w-md mx-auto`}>
            {lang === 'pt'
              ? '"O silêncio não está vazio. Está cheio de respostas que estão esperando pelo sopro correto."'
              : '"Silence is not empty. It of full of answers waiting for the perfect mindful breath."'}
          </p>
        </div>

      </div>
    </div>
  );
};
