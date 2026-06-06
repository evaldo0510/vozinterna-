import React, { useState, useEffect } from 'react';
import { User, Language } from '../types';
import { 
  Feather, 
  Droplet, 
  Waves, 
  Compass, 
  Menu, 
  Sparkles,
  ArrowRight,
  BookOpen,
  RefreshCw,
  Heart
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { DailyAffirmation } from './DailyAffirmation';

interface HomeViewProps {
  user: User;
  lang: Language;
  onNavigateToScreen: (screen: 'portal' | 'home' | 'chat' | 'jornada' | 'espelho' | 'refugio' | 'sopro') => void;
  isLightTheme: boolean;
  onToggleTheme: () => void;
  onAddToast: (toast: { type: string; title: string; description: string }) => void;
  onOpenTuningPopover: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  user,
  lang,
  onNavigateToScreen,
  isLightTheme,
  onToggleTheme,
  onAddToast,
  onOpenTuningPopover,
}) => {
  // Daily PCH hypnotic cognitive aphorisms
  const aforismosPCH = [
    {
      pt: "As palavras sintonizadas que você escolhe hoje são sementes que florescem no silêncio do seu subconsciente amanhã.",
      en: "The tuned words you select today are seeds blossoming tomorrow in the silent sanctuary of your subconscious."
    },
    {
      pt: "A sua mente subconsciente não dorme; ela apenas espera o sopro leve de uma autossugestão poética para se reorganizar.",
      en: "Your subconscious mind never sleeps; it only awaits the gentle breath of poetic suggestion to heal and realign."
    },
    {
      pt: "Ao mudar a métrica do seu diálogo interno, você altera a frequência cardíaca das suas próprias reações emocionais.",
      en: "By altering the meter of your inner dialogue, you transform the heartbeat frequency of your emotional responses."
    },
    {
      pt: "A quietude não é o esvaziamento total do ser, mas a permissão poética para cada pensamento apenas passar como nuvem passageira.",
      en: "Stillness is not the hollow emptying of the self, but the poetic permission for thoughts to drift like passing summer clouds."
    }
  ];

  const [activeAphorismIdx, setActiveAphorismIdx] = useState(0);
  const [isMeditatingOnTip, setIsMeditatingOnTip] = useState(false);

  // Daily activities tracked in localStorage
  const [activities, setActivities] = useState({
    journal: false,
    mood: false,
    chat: false,
    breathing: false
  });

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

  // Time based friendly greeting
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours >= 6 && hours < 12) {
      return lang === 'pt' ? 'Bom dia, Alma.' : 'Good morning, Soul.';
    } else if (hours >= 12 && hours < 18) {
      return lang === 'pt' ? 'Boa tarde, Alma.' : 'Good afternoon, Soul.';
    } else {
      return lang === 'pt' ? 'Boa noite, Alma.' : 'Good evening, Soul.';
    }
  };

  // Computing completed percentage
  const totalCompleted = Object.values(activities).filter(Boolean).length;
  const completedPercentage = Math.round((totalCompleted / 4) * 100);

  return (
    <div className="min-h-full w-full bg-[#fcf9f4] text-[#1c2e24] font-sans pb-24 transition-colors duration-500">
      <div className="max-w-4xl mx-auto px-6 py-8 md:py-12 space-y-9 select-none">
        
        {/* Header Bar - Visual match of Screenshots 1 & 6 */}
        <div className="flex justify-between items-center border-b pb-4.5 border-stone-200/50 transition-all">
          <div className="flex items-center gap-3">
            <button 
              onClick={onOpenTuningPopover}
              className="p-1.5 rounded-lg border border-stone-200/40 hover:bg-stone-50 text-stone-550 hover:text-stone-800 transition-all cursor-pointer"
              title={lang === 'pt' ? 'Conceito Santuário' : 'Sanctuary Concept'}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl md:text-2xl font-serif text-[#1c2e24] font-medium tracking-wide">
              {lang === 'pt' ? 'Voz Interior' : 'Inner Voice'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Soft Level/Points indicators */}
            <div className="px-3 py-1 bg-stone-100 border border-stone-200/45 rounded-full text-[10px] font-mono leading-relaxed font-bold tracking-wider text-[#3E5F35]">
              LVL {user.level || 1} • {user.points || 0} XP
            </div>
            
            {/* User profile choice direct shortcut or badge */}
            <button
              onClick={() => onNavigateToScreen('jornada')}
              className="w-8 h-8 rounded-full bg-[#5c7c64] hover:bg-[#4d6954] text-white flex items-center justify-center font-mono text-[10px] font-bold shadow-sm transition-all"
              title={lang === 'pt' ? 'Preferências do Espaço' : 'Space Preferences'}
            >
              {user.name?.charAt(0).toUpperCase() || 'A'}
            </button>
          </div>
        </div>

        {/* Hero Welcome Prompt */}
        <div className="space-y-1.5 max-w-lg">
          <h2 className="text-2.5xl md:text-3.5xl font-serif text-stone-850 tracking-tight leading-tight">
            {getGreeting()}
          </h2>
          <p className="text-xs md:text-sm text-stone-500 font-light leading-relaxed tracking-wide">
            {lang === 'pt' 
              ? 'O Santuário está pronto para sua pausa. Como você deseja cultivar sua paz hoje?' 
              : 'The Sanctuary is ready for your pause. How do you wish to cultivate your peace today?'}
          </p>
        </div>

        {/* Layout matches Screenshot 6 Bento layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5.5">
          
          {/* Card 1: Refúgio prominent writing (Large horizontal/spanning card) */}
          <div 
            onClick={() => onNavigateToScreen('refugio')}
            className="p-7 rounded-[2rem] bg-[#ecf2ed] border border-[#dce8de] hover:border-[#bfdac3] transition-all duration-300 relative overflow-hidden flex flex-col justify-between min-h-[190px] shadow-sm hover:shadow-md hover:translate-y-[-1px] md:col-span-2 cursor-pointer group"
          >
            {/* Soft abstract visual word in the back */}
            <span className="absolute bottom-2 right-4 text-[7rem] font-serif font-black tracking-widest text-[#5c7c64]/5 leading-none select-none pointer-events-none uppercase">
              BREATHE
            </span>

            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.25em] text-[#3e5f35]">
                {lang === 'pt' ? 'REFÚGIO' : 'SANCTUARY'}
              </span>
              <div className="p-2 ml-auto rounded-full bg-[#dce8de]/60 group-hover:bg-[#bfdac3]/35 transition-all">
                <Feather className="w-5 h-5 text-[#3e5f35]" />
              </div>
            </div>

            <div className="my-4.5 max-w-sm">
              <h3 className="text-xl md:text-2.5xl font-serif font-medium text-[#1c2e24]">
                {lang === 'pt' ? 'Meditações guiadas para silenciar o ruído externo.' : 'Guided meditations designed to quiet external noise.'}
              </h3>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-[#3e5f35] font-semibold tracking-wider font-mono uppercase mt-1">
              <span>{lang === 'pt' ? 'Iniciar Escrita Livre' : 'Start Free Writing'}</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Grid spheres containing Espelho, Eco, Sopro */}
          
          {/* Sphere 2: Espelho Card (Water Droplet) */}
          <div 
            onClick={() => onNavigateToScreen('espelho')}
            className="p-6.5 rounded-[2rem] bg-[#eef5f8] border border-[#deeaf1] hover:border-[#cbdde7] transition-all duration-300 flex flex-col justify-between h-[165px] h-auto min-h-[160px] shadow-sm hover:shadow-md cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-[#1D4A66]">
                {lang === 'pt' ? 'ESPELHO' : 'MIRROR'}
              </span>
              <div className="p-2 rounded-full bg-[#deeaf1]/60 transition-all">
                <Droplet className="w-4.5 h-4.5 text-[#1D4A66]" />
              </div>
            </div>

            <div className="my-2.5">
              <h3 className="text-base font-serif font-semibold text-[#18364A] leading-tight flex items-center gap-1">
                <span>{lang === 'pt' ? 'Espelho' : 'Mirror'}</span>
                <span className="text-[10px] text-stone-400 font-mono font-light ml-1">→</span>
              </h3>
              <p className="text-[11px] text-[#2C4A5E] font-light leading-snug mt-1">
                {lang === 'pt' ? 'Rastreie e sintonize humores diários.' : 'Track and choose your internal weather.'}
              </p>
            </div>
          </div>

          {/* Sphere 3: Eco Card (Waves / Microphone) */}
          <div 
            onClick={() => onNavigateToScreen('chat')}
            className="p-6.5 rounded-[2rem] bg-[#faf0eb] border border-[#f2ded1] hover:border-[#ebd2c1] transition-all duration-300 flex flex-col justify-between h-[165px] h-auto min-h-[160px] shadow-sm hover:shadow-md cursor-pointer group"
          >
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-[#8C5D3A]">
                {lang === 'pt' ? 'ECO' : 'ECHO'}
              </span>
              <div className="p-2 rounded-full bg-[#f2ded1]/60 transition-all">
                <Waves className="w-4.5 h-4.5 text-[#8C5D3A]" />
              </div>
            </div>

            <div className="my-2.5">
              <h3 className="text-base font-serif font-semibold text-[#5B3E29] leading-tight flex items-center gap-1">
                <span>{lang === 'pt' ? 'Eco' : 'Echo'}</span>
                <span className="text-[10px] text-stone-400 font-mono font-light ml-1">→</span>
              </h3>
              <p className="text-[11px] text-[#73503B] font-light leading-snug mt-1">
                {lang === 'pt' ? 'Diga e ouça o reflexo de sua voz.' : 'Syllables and speech reflection logs.'}
              </p>
            </div>
          </div>

          {/* Sphere 4: Sopro Card (Breath circle balloon popup shortcut) */}
          <div 
            onClick={() => onNavigateToScreen('sopro')}
            className="p-6.5 rounded-[2rem] bg-[#fbf5ee] border border-[#f5eae0] hover:border-[#ecd9c7] transition-all duration-300 flex flex-col justify-between h-[165px] h-auto min-h-[160px] shadow-sm hover:shadow-md cursor-pointer group md:col-span-2"
          >
            <div className="flex justify-between items-start">
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.25em] text-[#a06f3c]">
                {lang === 'pt' ? 'SOPRO' : 'BREATH'}
              </span>
              <div className="p-2 rounded-full bg-[#f5eae0]/60 transition-all">
                <Compass className="w-4.5 h-4.5 text-[#a06f3c]" />
              </div>
            </div>

            <div className="my-3">
              <h3 className="text-base font-serif font-semibold text-[#66421c] leading-tight">
                {lang === 'pt' ? 'O Sopro' : 'The Breath'}
              </h3>
              <p className="text-[11px] text-[#7c5b36] font-light leading-snug mt-1">
                {lang === 'pt' ? 'Ancoragem silenciosa através de um balão de respiração coerente.' : 'Quiet grounding with our beautifully breathing harmonic balloon.'}
              </p>
            </div>
          </div>

        </div>

        {/* Progression Dashboard matched after Screenshot 6 */}
        <div className="p-7 rounded-[2rem] border border-stone-200/40 bg-white/70 backdrop-blur-md shadow-[0_4px_24px_rgba(21,46,34,0.015)] space-y-5.5">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="space-y-0.5">
              <h3 className="text-xs font-mono font-bold uppercase tracking-[0.25em] text-stone-400">
                {lang === 'pt' ? 'PROGRESSO DA JORNADA' : 'JOURNEY PROGRESS'}
              </h3>
              <p className="text-sm font-serif font-semibold text-stone-850 bg-transparent text-stone-800">
                {lang === 'pt' ? 'Continue cultivando seu hábito de paz.' : 'Continue cultivating your habit of peace.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {/* Sparkle badge */}
              <div className="p-1 rounded-full bg-orange-100 text-orange-600">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-mono font-bold text-[#3E5F35] tracking-tight">
                {completedPercentage}% • {
                  lang === 'pt' 
                    ? `Faltam ${4 - totalCompleted} atividades` 
                    : `${4 - totalCompleted} activities left`
                }
              </span>
            </div>
          </div>

          {/* Elegant fluid progress bar */}
          <div className="w-full h-2.5 rounded-full bg-stone-100 overflow-hidden relative border border-stone-200/10">
            <div 
              className="h-full bg-gradient-to-r from-[#5c7c64] via-[#82B98E] to-[#d4a381] transition-all duration-1000 ease-out rounded-full"
              style={{ width: `${completedPercentage || 10}%` }}
            />
          </div>
        </div>

        {/* Brand New Predefined Daily Affirmation Card */}
        <DailyAffirmation lang={lang} onAddToast={onAddToast} />

        {/* Dica Diária PCH Aphorism layout */}
        <div className="p-7 rounded-[2rem] bg-gradient-to-br from-[#ffffff] to-[#fcfaf7] border border-stone-200/40 shadow-[0_4px_20px_rgba(21,46,34,0.01)] space-y-5 animate-fade-in">
          <div className="flex justify-between items-center bg-transparent">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-stone-50 rounded-full text-[#5c7c64]">
                <BookOpen className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[9px] font-mono tracking-[0.25em] font-bold text-[#5c7c64] uppercase block">
                  {lang === 'pt' ? 'POESIA COGNITIVA HIPNÓTICA (PCH)' : 'HYPNOTIC COGNITIVE POETRY'}
                </span>
                <h3 className="text-base font-serif font-bold text-stone-850 leading-tight">
                  {lang === 'pt' ? 'Dica e Aforismo Diário' : 'Daily Tip & Aphorism'}
                </h3>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveAphorismIdx((prev) => (prev + 1) % aforismosPCH.length);
                setIsMeditatingOnTip(false);
              }}
              className="p-2 bg-stone-50 rounded-full hover:bg-stone-100 hover:text-[#5c7c64] text-stone-500 transition-all cursor-pointer group border border-stone-200/30"
              title={lang === 'pt' ? 'Próxima dica' : 'Next tip'}
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>

          <div className="bg-stone-50/40 p-5 rounded-2xl border border-stone-100/60">
            <p className="text-base md:text-lg font-serif italic text-stone-800 leading-relaxed font-normal">
              "{lang === 'pt' ? aforismosPCH[activeAphorismIdx].pt : aforismosPCH[activeAphorismIdx].en}"
            </p>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-1">
            <span className="text-[10px] font-mono text-stone-400 font-light select-none">
              {lang === 'pt' ? 'Feche os olhos por 10 segundos ao ler a frase' : 'Close your eyes for 10 seconds while reading this phrase'}
            </span>

            <button
              onClick={() => {
                setIsMeditatingOnTip(!isMeditatingOnTip);
                if (!isMeditatingOnTip) {
                  onAddToast({
                    type: 'success',
                    title: lang === 'pt' ? 'Sintonizado!' : 'Inner Harmony Unlocked!',
                    description: lang === 'pt' ? 'Respire devagar e sinta o aforismo se ancorar na mente.' : 'Breathe slowly and absorb the rhythm deeply.'
                  });
                }
              }}
              className={`px-4.5 py-2 rounded-full text-xs font-mono font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                isMeditatingOnTip 
                  ? 'bg-[#ecf2ed] text-[#3e5f35] border border-[#dce8de]' 
                  : 'bg-[#5c7c64] hover:bg-[#4d6954] text-white border border-transparent shadow-sm'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isMeditatingOnTip ? 'fill-[#3e5f35] animate-pulse' : ''}`} />
              <span>
                {isMeditatingOnTip 
                  ? (lang === 'pt' ? 'Sintonizando...' : 'Absorbing...') 
                  : (lang === 'pt' ? 'Meditar na Dica' : 'Meditate on This')}
              </span>
            </button>
          </div>
        </div>

        {/* Âncora do Dia Quote Card directly sintoniza with Screenshot 6 */}
        <div className="p-7 rounded-[2rem] bg-[#ecf2ed] border border-[#dce8de]/80 flex flex-col sm:flex-row items-center sm:items-start gap-5 shadow-[0_3px_15px_rgba(92,124,100,0.01)]">
          <div className="w-13 h-13 rounded-full bg-[#5c7c64] text-white flex items-center justify-center shrink-0 relative shadow-sm">
            <Compass className="w-[26px] h-[26px] stroke-[1.5]" />
            <div className="absolute -top-1 -right-1 p-0.5 rounded-full bg-amber-400 border border-white text-stone-950">
              <Sparkles className="w-2.5 h-2.5" />
            </div>
          </div>

          <div className="space-y-2.5 flex-1 text-center sm:text-left">
            <div className="space-y-0.5">
              <span className="text-[9px] font-mono tracking-[0.3em] font-bold text-[#3e5f35] uppercase leading-none">
                {lang === 'pt' ? 'ÂN_CORA DO DIA' : 'DAILY ANCHOR'}
              </span>
              <p className="text-xs text-stone-400 font-light font-mono">
                {lang === 'pt' ? '1.2k praticaram hoje' : '1.2k practiced today'}
              </p>
            </div>

            <p className="text-lg font-serif font-normal italic leading-relaxed text-[#152e22]">
              {lang === 'pt'
                ? '"A quietude não é a ausência de som, mas a presença de si mesmo."'
                : '"Stillness is not the absence of sound, but the presence of oneself."'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
export default HomeView;
