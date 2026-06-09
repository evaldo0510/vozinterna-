import React, { useState, useEffect } from 'react';
import { User, Language } from '../types';
import { 
  Sprout, 
  BookOpen, 
  MessageSquare, 
  Droplet, 
  Menu, 
  ArrowRight, 
  Check, 
  CheckCircle2, 
  Anchor,
  Sparkles,
  Award,
  Info
} from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';

interface HomeViewProps {
  user: User;
  lang: Language;
  onNavigateToScreen: (screen: 'portal' | 'home' | 'chat' | 'jornada' | 'espelho' | 'refugio' | 'sopro') => void;
  isLightTheme: boolean;
  onToggleTheme: () => void;
  onAddToast: (toast: { type: string; title: string; description: string }) => void;
  onOpenTuningPopover: () => void;
}

export const HomeNormal: React.FC<HomeViewProps> = ({
  user,
  lang,
  onNavigateToScreen,
  isLightTheme,
  onToggleTheme,
  onAddToast,
  onOpenTuningPopover,
}) => {
  const [activeAphorismIdx, setActiveAphorismIdx] = useState(0);
  const [isWatering, setIsWatering] = useState(false);
  const [waterSplash, setWaterSplash] = useState(false);
  const [selectedStar, setSelectedStar] = useState<string | null>(null);

  const [dailyMissions, setDailyMissions] = useState({
    waterGarden: false,
    talkEvaldo: false,
    writeJournal: false,
    doBreathing: false
  });
  const [hasClaimedMission, setHasClaimedMission] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const keyPrefix = `pch_m_${user?.id || 'visitor'}_${today}`;
    
    setDailyMissions({
      waterGarden: localStorage.getItem(`${keyPrefix}_water`) === 'true',
      talkEvaldo: localStorage.getItem(`${keyPrefix}_talk`) === 'true' || (user?.resonanceHistory?.length ?? 0) > 0,
      writeJournal: localStorage.getItem(`${keyPrefix}_journal`) === 'true',
      doBreathing: localStorage.getItem(`${keyPrefix}_breath`) === 'true'
    });

    setHasClaimedMission(localStorage.getItem(`${keyPrefix}_claimed`) === 'true');
  }, [user?.id, user?.resonanceHistory]);

  const toggleMission = (key: keyof typeof dailyMissions) => {
    const today = new Date().toISOString().split('T')[0];
    const keyPrefix = `pch_m_${user?.id || 'visitor'}_${today}`;
    const nextVal = !dailyMissions[key];
    
    setDailyMissions(prev => {
      const updated = { ...prev, [key]: nextVal };
      const itemKey = key === 'waterGarden' ? 'water' 
                    : key === 'talkEvaldo' ? 'talk' 
                    : key === 'writeJournal' ? 'journal' 
                    : 'breath';
      localStorage.setItem(`${keyPrefix}_${itemKey}`, nextVal ? 'true' : 'false');
      return updated;
    });
  };

  const points = user?.points || 0;
  
  const getGardenStage = (xp: number) => {
    if (xp <= 100) {
      return { 
        stage: 1, 
        namePt: 'Fase 1: Semente Cósmica', 
        nameEn: 'Phase 1: Cosmic Seed',
        descPt: 'Sua intenção reside latente no silêncio primordial, envolta por mistério.',
        descEn: 'Your intention lies dormant in the baseline silence, cradled in mystery.'
      };
    } else if (xp <= 255) {
      return { 
        stage: 2, 
        namePt: 'Fase 2: Broto Sagrado', 
        nameEn: 'Phase 2: Sacred Sprout',
        descPt: 'A primeira folha verde surge da quietude, buscando a luz do autoconhecimento.',
        descEn: 'The first emerald leaf sprouts from the quiet, reaching for conscious light.'
      };
    } else if (xp <= 500) {
      return { 
        stage: 3, 
        namePt: 'Fase 3: Árvore da Presença', 
        nameEn: 'Phase 3: Tree of Presence',
        descPt: 'Tronco robusto e raízes profundas firmemente ancorados em clareza emocional.',
        descEn: 'A resilient trunk and deep roots anchored in emotional clarity.'
      };
    } else if (xp <= 800) {
      return { 
        stage: 4, 
        namePt: 'Fase 4: Florescimento Poético', 
        nameEn: 'Phase 4: Poetic Blooming',
        descPt: 'Pétalas de renovação e cura exalam fragrância cognitiva sob a sintonia de paz.',
        descEn: ' Blossoms of renewal and cognitive healing release tranquility under the light.'
      };
    } else {
      return { 
        stage: 5, 
        namePt: 'Fase 5: Constelação Interior', 
        nameEn: 'Phase 5: Inner Constellation',
        descPt: 'Seu jardim se conecta ao cosmos. Cada flor é uma estrela sintonizada.',
        descEn: 'Your garden fuses with the stars. Each blossom acts as a stellar coordinate.'
      };
    }
  };

  const gardenInfo = getGardenStage(points);

  const handleWaterGarden = async () => {
    if (isWatering) return;
    setIsWatering(true);
    setWaterSplash(true);

    setTimeout(() => {
      setWaterSplash(false);
    }, 1200);

    setTimeout(async () => {
      setIsWatering(false);
      
      if (user?.id && db) {
        try {
          const userDocRef = doc(db, 'users', user.id);
          const newPoints = (user.points || 0) + 15;
          let newLevel = user.level || 1;
          if (newPoints >= newLevel * 200) {
            newLevel += 1;
          }
          await updateDoc(userDocRef, {
            points: newPoints,
            level: newLevel
          });

          toggleMission('waterGarden');

          onAddToast({
            type: 'success',
            title: lang === 'pt' ? 'Jardim Regado! 💧' : 'Garden Nourished! 💧',
            description: lang === 'pt' 
              ? 'Água de intenção aplicada! +15 XP adicionados ao seu santuário.' 
              : 'Flow of presence applied! +15 XP added to your sanctuary.'
          });
        } catch (e) {
          console.error("Database update failed:", e);
        }
      } else {
        toggleMission('waterGarden');
      }
    }, 1600);
  };

  const totalMissionsCompleted = Object.values(dailyMissions).filter(Boolean).length;
  const isMissionComplete = totalMissionsCompleted === 4;

  const handleClaimReward = async () => {
    if (!isMissionComplete || hasClaimedMission) return;
    
    if (user?.id && db) {
      try {
        const userDocRef = doc(db, 'users', user.id);
        const newPoints = (user.points || 0) + 50;
        let newLevel = user.level || 1;
        if (newPoints >= newLevel * 200) {
          newLevel += 1;
        }
        await updateDoc(userDocRef, {
          points: newPoints,
          level: newLevel
        });

        const today = new Date().toISOString().split('T')[0];
        localStorage.setItem(`pch_m_${user.id}_${today}_claimed`, 'true');
        setHasClaimedMission(true);

        onAddToast({
          type: 'level',
          title: lang === 'pt' ? 'Missão Concluída! 🌌' : 'Daily Mission Cleared! 🌌',
          description: lang === 'pt'
            ? 'Poesia cognitiva internalizada! Recompensa de +50 XP resgatada.'
            : 'Cognitive poetry fully incorporated! +50 XP reward successfully claimed.'
        });
      } catch (err) {
        console.error("Error setting mission claim:", err);
      }
    } else {
      setHasClaimedMission(true);
    }
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    const userName = user?.name || 'Alma';
    if (hours >= 6 && hours < 12) {
      return lang === 'pt' ? `Bom dia, ${userName}.` : `Good morning, ${userName}.`;
    } else if (hours >= 12 && hours < 18) {
      return lang === 'pt' ? `Boa tarde, ${userName}.` : `Good afternoon, ${userName}.`;
    } else {
      return lang === 'pt' ? `Boa noite, ${userName}.` : `Good evening, ${userName}.`;
    }
  };

  const achievementsList = [
    { 
      id: 'first', 
      titlePt: '⭐ Primeira Reflexão', 
      titleEn: '⭐ First Reflection', 
      xp: 10, 
      cx: 40, 
      cy: 35,
      poemPt: '“A mente encontrou o primeiro sussurro de quietude. Um farol acendeu.”',
      poemEn: '“The mind captured its first ripple of quiet. A stellar beacon ignited.”'
    },
    { 
      id: 'streak', 
      titlePt: '⭐️ Laço de Calma (7 Dias)', 
      titleEn: '⭐️ 7 Days of Calm', 
      xp: 100, 
      cx: 120, 
      cy: 50,
      poemPt: '“Diante da névoa pesada, você se manteve firme. O hábito de respirar cura.”',
      poemEn: '“Faced with thick mist, you stood firm. The rhythmic breath keeps healing.”'
    },
    { 
      id: 'garden', 
      titlePt: '⭐️ Jardim Crescente', 
      titleEn: '⭐️ Growing Garden', 
      xp: 200, 
      cx: 190, 
      cy: 80,
      poemPt: '“As sementes de intenção abriram folhas. Você regou o amanhã hoje.”',
      poemEn: '“Your seeds of intention unfurled. You watered tomorrow in your presence today.”'
    },
    { 
      id: 'explorer', 
      titlePt: '⭐️ Explorador Interior', 
      titleEn: '⭐️ Inner Explorer', 
      xp: 450, 
      cx: 260, 
      cy: 40,
      poemPt: '“Percursos longos e fardos decodificados. Você escuta as próprias profundezas.”',
      poemEn: '“Long paths traversed and weights unraveled. You listen to your own depth.”'
    },
    { 
      id: 'consagrado', 
      titlePt: '⭐️ Santuário Alinhado', 
      titleEn: '⭐️ Fully Aligned', 
      xp: 750, 
      cx: 340, 
      cy: 65,
      poemPt: '“O cosmos interno brilha cristalino. O santuário se tornou parte de quem você é.”',
      poemEn: '“The cosmic horizon shines crystalline. The sanctuary is now part of you.”'
    }
  ];

  const containerBg = 'neu-card';

  const secondaryBg = 'glass-panel';

  const textPrimary = isLightTheme ? 'text-stone-850 text-stone-800' : 'text-stone-100';
  const textSecondary = isLightTheme ? 'text-stone-600' : 'text-stone-300';
  const textMuted = isLightTheme ? 'text-stone-400' : 'text-slate-400';

  return (
    <div className="space-y-10">
      {/* GREETING */}
      <div className="space-y-2 max-w-xl z-10 relative">
        <div className="flex items-center gap-1.5 text-xs text-[#14B8A6] font-mono tracking-widest uppercase">
          <Anchor className="w-3.5 h-3.5" />
          <span>{lang === 'pt' ? 'Conexão Restaurada' : 'Connection Restored'}</span>
        </div>
        <h2 className={`text-3xl md:text-4.5xl font-serif tracking-tight leading-tight ${textPrimary}`}>
          {getGreeting()}
        </h2>
        <p className={`text-xs md:text-sm font-light leading-relaxed tracking-wide ${textSecondary}`}>
          {lang === 'pt' 
            ? 'Este é o seu santuário digital vivo, livre de pressões sociais ou métricas vazias. Escolha seu tempo para florescer.' 
            : 'This is your living digital sanctuary, free from social anxiety or performance demands. Cultivate your mind at your own pace.'}
        </p>
      </div>

      {/* JARDIM */}
      <div className={`p-7 rounded-[2rem] border relative overflow-hidden group transition-all duration-300 ${containerBg}`}>
        <div className="absolute top-0 right-0 w-[240px] h-[240px] bg-[#10b981]/4 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-5 border-b border-stone-200/20">
          <div className="space-y-1">
            <span className="text-[10px] font-mono tracking-[0.25em] font-bold text-[#10B981] uppercase block">Seção 01 • JARDIM METAFÓRICO</span>
            <h3 className={`text-xl font-serif font-black ${textPrimary}`}>🌱 {lang === 'pt' ? 'Cultivar o Jardim Interior' : 'Garden of the Soul'}</h3>
            <p className={`text-xs ${textSecondary}`}>{lang === 'pt' ? 'O reflexo orgânico da sua co-regulação mental.' : 'The organic mirror of your emotional co-regulation.'}</p>
          </div>
          <div className={`px-4 py-2 rounded-2xl text-xs font-mono font-bold tracking-wider shadow-inner transition-colors duration-300 ${
            isLightTheme 
              ? 'bg-emerald-50 border border-emerald-100 text-emerald-850 text-emerald-800' 
              : 'bg-[#090b14] border border-[#1d2744] hover:bg-[#111624] text-[#10B981]'
          }`}>
            {lang === 'pt' ? gardenInfo.namePt : gardenInfo.nameEn}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 items-center">
          <div className={`flex flex-col items-center justify-center p-6 border rounded-[2rem] min-h-[220px] shadow-inner relative overflow-hidden transition-all duration-300 ${secondaryBg}`}>
            <AnimatePresence>
              {isWatering && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-[#14b8a6]/5 flex flex-col justify-start items-center pt-2 z-20 pointer-events-none"
                >
                  {[1, 2, 3, 4, 5, 6].map((p) => (
                    <motion.div
                      key={p}
                      initial={{ y: -20, opacity: 0, scale: 0.8 }}
                      animate={{ y: 220, opacity: [0, 0.8, 0] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: p * 0.18, ease: 'linear' }}
                      className="absolute w-1 h-3 bg-[#14b8a6] rounded-full"
                      style={{ left: `${15 + p * 13}%` }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {waterSplash && (
                <motion.div 
                  initial={{ scale: 0.3, opacity: 0 }}
                  animate={{ scale: 1.6, opacity: 1 }}
                  exit={{ scale: 1.8, opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute w-24 h-24 border border-teal-400 rounded-full bg-teal-400/5 z-10 pointer-events-none"
                />
              )}
            </AnimatePresence>

            <div className="h-44 w-44 relative select-none flex items-center justify-center">
              {/* Dynamic decorative visual glow rings around tree */}
              <div className="absolute inset-0 rounded-full border border-teal-505/5 border-[#14B8A6]/5 animate-ping pointer-events-none" style={{ animationDuration: '4s' }} />
              <div className="absolute w-[80%] h-[80%] rounded-full border border-dashed border-emerald-500/10 pointer-events-none animate-spin" style={{ animationDuration: '30s' }} />

              {gardenInfo.stage === 1 && (
                <motion.svg 
                  viewBox="0 0 100 100" 
                  fill="none" 
                  className="w-full h-full"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                >
                  {/* Cosmic Seed Stage */}
                  <circle cx="50" cy="50" r="14" fill="url(#cosmicSeedGrad)" className="filter drop-shadow-[0_0_12px_rgba(251,191,36,0.35)]" />
                  <motion.circle 
                    cx="50" cy="50" r="22" 
                    stroke="#FBBF24" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.4"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 15, ease: "linear" }}
                  />
                  {/* Bud emergence */}
                  <motion.path 
                    d="M50 50 Q48 42, 50 36 M50 50 Q52 44, 55 38" 
                    stroke="#34D399" strokeWidth="2.5" strokeLinecap="round"
                    animate={{ scale: [0.9, 1.1, 0.9] }}
                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  />
                  <defs>
                    <radialGradient id="cosmicSeedGrad" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 50) rotate(90) scale(14)">
                      <stop stopColor="#FBBF24" />
                      <stop offset="0.75" stopColor="#D97706" />
                      <stop offset="1" stopColor="#080B14" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </motion.svg>
              )}

              {gardenInfo.stage === 2 && (
                <motion.svg 
                  viewBox="0 0 100 100" 
                  fill="none" 
                  className="w-full h-full"
                  animate={{ rotate: [-1, 1, -1] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                >
                  {/* Ground base line */}
                  <path d="M20 78 C40 74, 60 74, 80 78" stroke="#101826" strokeWidth="3" strokeLinecap="round" />
                  <path d="M20 78 C40 74, 60 74, 80 78" stroke="#14B8A6" strokeWidth="1.5" strokeLinecap="round" strokeOpacity="0.3" />
                  
                  {/* Stem and Leaves path drawing and sway */}
                  <motion.path 
                    d="M50 76 Q45 52, 51 34" 
                    stroke="#34D399" strokeWidth="4.5" strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                  />
                  {/* Left budding leaf */}
                  <motion.path 
                    d="M50 52 Q37 44, 38 34 Q46 38, 49 48" 
                    fill="#14B8A6" 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  />
                  {/* Right budding leaf */}
                  <motion.path 
                    d="M50 44 Q63 40, 64 28 Q57 32, 51 39" 
                    fill="#34D399" 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                  />
                  <circle cx="51" cy="24" r="4.5" fill="#FBBF24" className="animate-pulse filter drop-shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                </motion.svg>
              )}

              {gardenInfo.stage === 3 && (
                <motion.svg 
                  viewBox="0 0 100 100" 
                  fill="none" 
                  className="w-full h-full"
                  animate={{ y: [0, -1.5, 0], rotate: [-0.5, 0.5, -0.5] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                >
                  {/* Tree trunk with deep roots anchor */}
                  <path d="M50 82 L50 48" stroke="#1E293B" strokeWidth="7" strokeLinecap="round" />
                  <path d="M50 82 L50 48" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.4" />
                  <path d="M38 84 Q50 80, 62 84" stroke="#101826" strokeWidth="2.5" strokeLinecap="round" />

                  {/* Gentle curved side branches */}
                  <path d="M50 58 Q34 48, 30 40" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
                  <path d="M50 52 Q66 45, 70 38" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.8" />

                  {/* Foilage circles with premium gradients and breathing scale animations */}
                  <motion.circle 
                    cx="50" cy="35" r="16" 
                    fill="#34D399" fillOpacity="0.3" stroke="#34D399" strokeWidth="1" strokeOpacity="0.3"
                    className="backdrop-blur-sm"
                    animate={{ scale: [1, 1.05, 1] }} 
                    transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }} 
                  />
                  <motion.circle 
                    cx="32" cy="35" r="11" 
                    fill="#14B8A6" fillOpacity="0.25" stroke="#14B8A6" strokeWidth="1" strokeOpacity="0.25"
                    className="backdrop-blur-sm"
                    animate={{ scale: [1, 1.08, 1] }} 
                    transition={{ repeat: Infinity, duration: 4.5, delay: 0.5, ease: "easeInOut" }} 
                  />
                  <motion.circle 
                    cx="68" cy="32" r="13" 
                    fill="#14B8A6" fillOpacity="0.25" stroke="#14B8A6" strokeWidth="1" strokeOpacity="0.25"
                    className="backdrop-blur-sm"
                    animate={{ scale: [1, 1.06, 1] }} 
                    transition={{ repeat: Infinity, duration: 5, delay: 1, ease: "easeInOut" }} 
                  />
                  {/* Core crown glowing light node */}
                  <circle cx="50" cy="22" r="4.5" fill="#34D399" className="animate-pulse filter drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                </motion.svg>
              )}

              {gardenInfo.stage === 4 && (
                <motion.svg 
                  viewBox="0 0 100 100" 
                  fill="none" 
                  className="w-full h-full"
                  animate={{ y: [0, -2, 0], rotate: [-1, 1, -1] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                >
                  <path d="M50 82 L50 48" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
                  <path d="M50 82 L50 48" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
                  
                  {/* Splaying branches */}
                  <path d="M50 55 Q30 40, 24 35" stroke="#1E293B" strokeWidth="3" />
                  <path d="M50 50 Q70 36, 76 30" stroke="#1E293B" strokeWidth="3" />

                  {/* Multiple soft foliage overlay loops */}
                  <circle cx="50" cy="38" r="16" fill="#14B8A6" fillOpacity="0.2" />
                  <circle cx="28" cy="35" r="12" fill="#34D399" fillOpacity="0.2" />
                  <circle cx="72" cy="30" r="13" fill="#34D399" fillOpacity="0.2" />

                  {/* Pulsing blossoms (representing mental poetry accomplishments) */}
                  <motion.circle 
                    cx="28" cy="28" r="5" fill="#FBBF24" 
                    className="filter drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]"
                    animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.7, 1, 0.7] }} 
                    transition={{ repeat: Infinity, duration: 3 }} 
                  />
                  <motion.circle 
                    cx="74" cy="22" r="6" fill="#FBBF24" 
                    className="filter drop-shadow-[0_0_12px_rgba(251,191,36,0.75)]"
                    animate={{ scale: [1.2, 0.8, 1.2], opacity: [1, 0.6, 1] }} 
                    transition={{ repeat: Infinity, duration: 4, delay: 0.5 }} 
                  />
                  <motion.circle 
                    cx="48" cy="22" r="7" fill="#14B8A6" 
                    className="filter drop-shadow-[0_0_10px_rgba(20,184,166,0.6)]"
                    animate={{ scale: [0.9, 1.1, 0.9] }} 
                    transition={{ repeat: Infinity, duration: 3.5, delay: 1 }} 
                  />
                  
                  {/* Floating stardust leaves */}
                  <motion.circle cx="34" cy="48" r="1.5" fill="#34D399" animate={{ y: [0, -30], opacity: [0, 0.8, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 0.2 }} />
                  <motion.circle cx="62" cy="46" r="1.5" fill="#14B8A6" animate={{ y: [0, -35], opacity: [0, 0.8, 0] }} transition={{ repeat: Infinity, duration: 3.5, delay: 1.1 }} />
                </motion.svg>
              )}

              {gardenInfo.stage === 5 && (
                <motion.svg 
                  viewBox="0 0 100 100" 
                  fill="none" 
                  className="w-full h-full"
                >
                  {/* Stellar geometric connection chords */}
                  <motion.line 
                    x1="50" y1="80" x2="28" y2="45" 
                    stroke="#14B8A6" strokeWidth="1.5" strokeOpacity="0.4"
                    strokeDasharray="4 4"
                    animate={{ strokeDashoffset: [0, -20] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  />
                  <motion.line 
                    x1="50" y1="80" x2="72" y2="45" 
                    stroke="#14B8A6" strokeWidth="1.5" strokeOpacity="0.4"
                    strokeDasharray="4 4"
                    animate={{ strokeDashoffset: [0, 20] }}
                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                  />
                  <line x1="28" y1="45" x2="50" y2="18" stroke="#FBBF24" strokeWidth="1" strokeOpacity="0.3" />
                  <line x1="72" y1="45" x2="50" y2="18" stroke="#FBBF24" strokeWidth="1" strokeOpacity="0.3" />

                  {/* Root center */}
                  <circle cx="50" cy="80" r="5" fill="#34D399" className="filter drop-shadow-[0_0_10px_rgba(52,211,153,0.6)]" />

                  {/* Rotating/Orbiting cosmic celestial tree centers */}
                  <g 
                    className="animate-[spin_25s_linear_infinite]"
                    style={{ transformOrigin: '50px 45px' }}
                  >
                    <circle cx="28" cy="45" r="9" fill="url(#starGrad1)" className="filter drop-shadow-[0_0_12px_rgba(20,184,166,0.6)]" />
                    <circle cx="72" cy="45" r="10" fill="url(#starGrad2)" className="filter drop-shadow-[0_0_12px_rgba(139,92,246,0.6)]" />
                  </g>

                  {/* Central radiant cosmic coordinates core */}
                  <motion.circle 
                    cx="50" cy="18" r="13" 
                    fill="url(#starGradMain)"
                    animate={{ scale: [1, 1.12, 1] }}
                    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                  />

                  {/* Floating particle systems */}
                  <motion.circle cx="50" cy="42" r="1.5" fill="#FBBF24" animate={{ y: [0, -35], opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 4, delay: 0.1 }} />
                  <motion.circle cx="38" cy="55" r="1.5" fill="#34D399" animate={{ y: [0, -25], opacity: [0, 0.9, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 0.8 }} />
                  <motion.circle cx="62" cy="55" r="1.5" fill="#14B8A6" animate={{ y: [0, -28], opacity: [0, 0.9, 0] }} transition={{ repeat: Infinity, duration: 3.5, delay: 1.5 }} />

                  <defs>
                    <radialGradient id="starGrad1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(28 45) rotate(90) scale(9)">
                      <stop stopColor="#14B8A6" />
                      <stop offset="0.7" stopColor="#0D9488" />
                      <stop offset="1" stopColor="#080B14" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="starGrad2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(72 45) rotate(90) scale(10)">
                      <stop stopColor="#8B5CF6" />
                      <stop offset="0.8" stopColor="#6D28D9" />
                      <stop offset="1" stopColor="#080B14" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="starGradMain" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(50 18) rotate(90) scale(13)">
                      <stop stopColor="#FBBF24" />
                      <stop offset="0.5" stopColor="#EC4899" />
                      <stop offset="1" stopColor="#080B14" stopOpacity="0" />
                    </radialGradient>
                  </defs>
                </motion.svg>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <span className="text-[10px] font-mono tracking-widest text-[#10B981] uppercase block">STATUS DO ECOSSISTEMA</span>
            <p className={`font-serif italic text-sm md:text-base leading-relaxed ${textPrimary}`}>
              "{lang === 'pt' ? gardenInfo.descPt : gardenInfo.descEn}"
            </p>
            
            <div className="space-y-2">
              <div className={`flex justify-between items-center text-[9px] font-mono ${textMuted}`}>
                <span>{lang === 'pt' ? 'Próxima Fase' : 'Next Growth Threshold'}</span>
                <span className={`font-bold ${textPrimary}`}>{points} XP</span>
              </div>
              <div className={`w-full h-1.5 rounded-full overflow-hidden border ${
                isLightTheme ? 'bg-stone-100 border-stone-200' : 'bg-[#0a0d17] border-[#1b2641]/55'
              }`}>
                <div 
                  className="h-full bg-gradient-to-r from-[#10B981] via-[#14B8A6] to-[#8B5CF6] rounded-full transition-all duration-[1200ms] ease-out"
                  style={{ width: `${Math.min(100, (points / 800) * 100)}%` }}
                />
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={handleWaterGarden}
                disabled={isWatering}
                className={`w-full py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 font-mono text-xs uppercase tracking-widest font-bold transition-all duration-300 cursor-pointer border ${
                  isWatering
                    ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]/50'
                    : 'bg-[#10B981] hover:bg-[#0da070] text-stone-900 border-transparent shadow-[#10b981]/15 active:scale-98 shadow-md'
                }`}
              >
                <Droplet className={`w-4 h-4 ${isWatering ? 'animate-bounce' : ''}`} />
                <span>
                  {isWatering 
                    ? (lang === 'pt' ? 'Regando...' : 'Nourishing...') 
                    : (lang === 'pt' ? 'Regar com Presença' : 'Water Garden')}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 5: 🏆 CONQUISTAS (Interactive Stellar Constellation SVG) */}
      <div className={`p-7 rounded-[2rem] border shadow-xl space-y-6 relative transition-all duration-300 ${containerBg}`}>
        <div className="absolute inset-0 bg-[#8B5CF6]/2 rounded-[2rem] pointer-events-none" />
        
        <div className="space-y-0.5 text-left">
          <span className="text-[10px] font-mono tracking-[0.25em] font-bold text-teal-500 uppercase block">Seção 02 • MAPA DE REALIZAÇÕES</span>
          <h3 className={`text-xl font-serif font-black ${textPrimary}`}>🏆 {lang === 'pt' ? 'Constelação de Conquistas' : 'Constellation of Progress'}</h3>
          <p className={`text-xs ${textSecondary}`}>{lang === 'pt' ? 'Toque nas estrelas cósmicas para ler as revelações do seu progresso.' : 'Tap any stellar coordinate to read achievements details.'}</p>
        </div>

        {/* Connected SVG Night Sky Constellation Grid */}
        <div className={`relative w-full h-[180px] border rounded-[2rem] overflow-hidden flex flex-col justify-between p-4 shadow-inner transition-all duration-305 ${secondaryBg}`}>
          
          {/* Ambient Star-sky particles */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute w-[2px] h-[2px] bg-white rounded-full top-[15%] left-[25%] opacity-30 animate-pulse" />
            <div className="absolute w-[1.5px] h-[1.5px] bg-white rounded-full top-[65%] left-[12%] opacity-40 animate-pulse" />
            <div className="absolute w-[2px] h-[2px] bg-teal-400 rounded-full top-[45%] right-[22%] opacity-55 animate-pulse" style={{ animationDelay: '400ms' }} />
            <div className="absolute w-[1.5px] h-[1.5px] bg-amber-400 rounded-full top-[85%] right-[45%] opacity-30 animate-pulse" style={{ animationDelay: '800ms' }} />
            <div className="absolute w-[2px] h-[2px] bg-purple-400 rounded-full top-[25%] left-[75%] opacity-50 animate-pulse" style={{ animationDelay: '1200ms' }} />
          </div>

          <svg viewBox="0 0 380 120" className="absolute inset-0 w-full h-full z-10 select-none">
            {/* Connection Lines */}
            <line x1="40" y1="35" x2="120" y2="50" stroke="rgba(14, 165, 233, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="120" y1="50" x2="190" y2="80" stroke="rgba(14, 165, 233, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
            <line x1="190" y1="80" x2="260" y2="40" stroke="rgba(139, 92, 246, 0.25)" strokeWidth="1" />
            <line x1="260" y1="40" x2="340" y2="65" stroke="rgba(245, 158, 11, 0.25)" strokeWidth="1" />

            {/* Individual Glowing Achievements Stars */}
            {achievementsList.map((star) => {
              const isActivated = points >= star.xp;
              const isSelected = selectedStar === star.id;
              return (
                <circle 
                  key={star.id}
                  cx={star.cx} 
                  cy={star.cy} 
                  r={isSelected ? 6 : isActivated ? 3.5 : 2.5} 
                  fill={isActivated ? (isSelected ? "#F59E0B" : "#14B8A6") : "#334155"} 
                  className="transition-all duration-300 cursor-pointer pointer-events-auto filter drop-shadow-[0_0_8px_rgba(20,184,166,0.6)]"
                  onClick={() => setSelectedStar(star.id)}
                />
              );
            })}
          </svg>

          {/* Micro SVG Interactive Buttons Shorthand Overlay */}
          <div className="absolute inset-0 z-20 flex justify-between pointer-events-none">
            {achievementsList.map((star) => {
              return (
                <button
                  key={star.id} 
                  onClick={() => setSelectedStar(star.id)}
                  className="absolute pointer-events-auto cursor-pointer flex flex-col items-center"
                  style={{ left: `${Math.round((star.cx / 380) * 88) + 4}%`, top: `${Math.round((star.cy / 120) * 65) + 10}%` }}
                >
                  <span className={`text-[7.5px] font-mono tracking-wide mt-3 block font-bold transition-colors ${
                    isLightTheme ? 'text-stone-700 hover:text-emerald-750' : 'text-slate-400 hover:text-teal-400'
                  }`}>
                    {lang === 'pt' ? star.titlePt.replace('⭐️ ','').replace('⭐ ','') : star.titleEn.replace('⭐️ ','').replace('⭐ ','')}
                  </span>
                </button>
              );
            })}
          </div>

        </div>

        {/* Interactive Descriptive Info-Card */}
        <div className={`p-5 rounded-2xl text-left select-none border transition-all duration-300 ${secondaryBg}`}>
          {selectedStar ? (() => {
            const starDetail = achievementsList.find(s => s.id === selectedStar);
            const isActivated = points >= (starDetail?.xp || 0);
            return (
              <div className="space-y-2 animate-fade-in">
                <div className="flex justify-between items-center">
                  <span className={`font-serif font-bold text-sm ${isLightTheme ? 'text-stone-850 text-stone-800' : 'text-[#F59E0B]'}`}>
                    {lang === 'pt' ? starDetail?.titlePt : starDetail?.titleEn}
                  </span>
                  <span className={`text-[8.5px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    isActivated 
                      ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981] uppercase' 
                      : 'bg-stone-500/10 border-stone-200 text-stone-500 uppercase'
                  }`}>
                    {isActivated ? (lang === 'pt' ? 'ATIVADA' : 'UNLOCKED') : (lang === 'pt' ? `Bloqueada • Requer ${starDetail?.xp} XP` : `Locked • Needs ${starDetail?.xp} XP`)}
                  </span>
                </div>
                <p className={`text-[12px] leading-relaxed font-serif italic ${textPrimary}`}>
                  {lang === 'pt' ? starDetail?.poemPt : starDetail?.poemEn}
                </p>
              </div>
            );
          })() : (
            <div className={`flex items-center space-x-3 ${textSecondary}`}>
              <Info className="w-4 h-4 text-teal-400 shrink-0" />
              <p className="text-xs font-light">
                {lang === 'pt' 
                  ? 'Clique em qualquer uma das estrelas da constelação cósmica acima para revelar os marcos de evolução e conquistas salvos.' 
                  : 'Click any of the coordinate star markers above to evaluate historical accomplishments saved inside your profile.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* SECTION 6: 📊 EVOLUÇÃO (Smooth, non-clinical wavy graph) */}
      <div className={`p-7 rounded-[2rem] border shadow-xl space-y-6 relative transition-all duration-300 ${containerBg}`}>
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[#14b8a6]/2 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="space-y-0.5 text-left">
          <span className="text-[10px] font-mono tracking-[0.25em] font-bold text-[#8B5CF6] uppercase block">Seção 03 • HISTÓRICO INTEGRADO</span>
          <h3 className={`text-xl font-serif font-black ${textPrimary}`}>📊 {lang === 'pt' ? 'Sintonia Geral do Ser' : 'Resonance Alignment Chart'}</h3>
          <p className={`text-xs ${textSecondary}`}>{lang === 'pt' ? 'Nossos gráficos não são clínicos ou punitivos; refletem o balanço das ondas do mar emocional.' : 'A peaceful organic graph illustrating weekly calming frequency.'}</p>
        </div>

        {/* Rolling Sine Wave SVG representation of Introspection and Calm */}
        <div className={`relative w-full h-[140px] border rounded-[2rem] overflow-hidden flex flex-col justify-end p-2 shrink-0 transition-colors duration-305 ${secondaryBg}`}>
          
          <svg viewBox="0 0 400 120" className="absolute inset-0 w-full h-full select-none" preserveAspectRatio="none">
            {/* Base Wave Layer 1 (Turquoise Wave of Calm) */}
            <path 
              d="M 0 90 Q 50 45, 100 80 T 200 50 T 300 75 T 400 45" 
              fill="none" 
              stroke="#14B8A6" 
              strokeWidth="1.5" 
              strokeOpacity="0.4"
            />
            {/* Base Wave Layer 2 (Lavender Wave of Introspection) */}
            <path 
              d="M 0 100 Q 60 55, 120 90 T 240 60 T 360 85 T 400 70" 
              fill="none" 
              stroke="#8B5CF6" 
              strokeWidth="1" 
              strokeOpacity="0.25"
              strokeDasharray="4 2"
            />
          </svg>

          {/* Minimal coordinate labels */}
          <div className="flex justify-between text-[8px] font-mono text-stone-500 px-4 py-1 z-20">
            <span>{lang === 'pt' ? 'Seg' : 'Mon'}</span>
            <span>{lang === 'pt' ? 'Qua' : 'Wed'}</span>
            <span>{lang === 'pt' ? 'Sex' : 'Fri'}</span>
            <span>{lang === 'pt' ? 'Dom' : 'Sun'}</span>
          </div>
        </div>
      </div>

      {/* SEÇÃO — GRID DE FERRAMENTAS TERAPÊUTICAS */}
      <div className="space-y-4">
        <div className="text-left">
          <span className="text-[10px] font-mono tracking-[0.25em] font-bold text-[#14B8A6] uppercase block">Seção 03 • AMBIENTES DE CO-REGULAÇÃO</span>
          <h3 className={`text-xl font-serif font-black ${textPrimary}`}>🛠️ {lang === 'pt' ? 'Grelha de Práticas Terapêuticas' : 'Therapeutic Regulation Grid'}</h3>
          <p className={`text-xs ${textSecondary}`}>{lang === 'pt' ? 'Selecione uma ferramenta PCH premium sob medida para alinhar sua mente e ressonância.' : 'Select a premium PCH tool tailored to restore neurological alignment.'}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Item 1: Sopro Coerente */}
          <div 
            onClick={() => onNavigateToScreen('sopro')}
            className={`p-6 rounded-[2rem] border transition-all duration-300 flex flex-col justify-between min-h-[185px] shadow-md cursor-pointer group hover:scale-[1.03] ${containerBg} hover:border-[#14B8A6]/40`}
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-2xl bg-[#14B8A6]/10 border border-[#14B8A6]/10 group-hover:bg-[#14B8A6]/20">
                <Droplet className="w-5 h-5 text-[#14B8A6]" />
              </div>
              <span className="text-[9px] font-mono font-bold uppercase text-[#14B8A6] bg-[#14B8A6]/10 px-2 py-0.5 rounded-md">
                {lang === 'pt' ? 'REGULAÇÃO' : 'PACE'}
              </span>
            </div>
            <div className="mt-3 text-left">
              <h4 className={`text-sm font-semibold transition-colors group-hover:text-[#14B8A6] ${textPrimary}`}>
                {lang === 'pt' ? '🌬️ Sopro Coerente' : '🌬️ Coherent Breath'}
              </h4>
              <p className="text-[10.5px] text-slate-400 mt-1 line-clamp-2">
                {lang === 'pt' ? 'Respiração guiada minimalista com 4 ambientes cinematográficos.' : 'Guided minimalist breathing synced to calming atmospheric scopes.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-[#14B8A6] font-bold font-mono uppercase tracking-wider pt-2 border-t border-[#1d2745]/30">
              <span>{lang === 'pt' ? 'Entrar em Sopro' : 'Breathe Now'}</span>
              <ArrowRight className="w-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Item 2: Diário do Silêncio */}
          <div 
            onClick={() => onNavigateToScreen('refugio')}
            className={`p-6 rounded-[2rem] border transition-all duration-300 flex flex-col justify-between min-h-[185px] shadow-md cursor-pointer group hover:scale-[1.03] ${containerBg} hover:border-[#FBBF24]/40`}
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-2xl bg-[#FBBF24]/10 border border-[#FBBF24]/10 group-hover:bg-[#FBBF24]/20">
                <BookOpen className="w-5 h-5 text-[#FBBF24]" />
              </div>
              <span className="text-[9px] font-mono font-bold uppercase text-[#FBBF24] bg-[#FBBF24]/10 px-2 py-0.5 rounded-md">
                {lang === 'pt' ? 'INTEGRAÇÃO' : 'JOURNAL'}
              </span>
            </div>
            <div className="mt-3 text-left">
              <h4 className={`text-sm font-semibold transition-colors group-hover:text-[#FBBF24] ${textPrimary}`}>
                {lang === 'pt' ? '📝 Caderno Vivo' : '📝 Living Journal'}
              </h4>
              <p className="text-[10.5px] text-slate-400 mt-1 line-clamp-2">
                {lang === 'pt' ? 'Diário terapêutico estilo caderno vivo com rascunho de rastro.' : 'A living notebook workspace with fluid keystroke auto-saving.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-[#FBBF24] font-bold font-mono uppercase tracking-wider pt-2 border-t border-[#1d2745]/30">
              <span>{lang === 'pt' ? 'Escrever Diário' : 'Access Diary'}</span>
              <ArrowRight className="w-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Item 3: Espelho Emocional */}
          <div 
            onClick={() => onNavigateToScreen('espelho')}
            className={`p-6 rounded-[2rem] border transition-all duration-300 flex flex-col justify-between min-h-[185px] shadow-md cursor-pointer group hover:scale-[1.03] ${containerBg} hover:border-[#34D399]/40`}
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-2xl bg-[#34D399]/10 border border-[#34D399]/10 group-hover:bg-[#34D399]/20">
                <Droplet className="w-5 h-5 text-[#34D399]" />
              </div>
              <span className="text-[9px] font-mono font-bold uppercase text-[#34D399] bg-[#34D399]/10 px-2 py-0.5 rounded-md">
                {lang === 'pt' ? 'METÁFORA' : 'WEATHER'}
              </span>
            </div>
            <div className="mt-3 text-left">
              <h4 className={`text-sm font-semibold transition-colors group-hover:text-[#34D399] ${textPrimary}`}>
                {lang === 'pt' ? '🔮 Espelho Interno' : '🔮 Emotion Mirror'}
              </h4>
              <p className="text-[10.5px] text-slate-400 mt-1 line-clamp-2">
                {lang === 'pt' ? 'Espelho emocional cinematográfico de climatologia mental.' : 'A reflective surface translating mood into raw landscape poetry.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-[#34D399] font-bold font-mono uppercase tracking-wider pt-2 border-t border-[#1d2745]/30">
              <span>{lang === 'pt' ? 'Olhar o Espelho' : 'View Mirror'}</span>
              <ArrowRight className="w-3  w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Item 4: IA Voz Ativa (Chat) */}
          <div 
            onClick={() => onNavigateToScreen('chat')}
            className={`p-6 rounded-[2rem] border transition-all duration-300 flex flex-col justify-between min-h-[185px] shadow-md cursor-pointer group hover:scale-[1.03] ${containerBg} hover:border-violet-400/40`}
          >
            <div className="flex justify-between items-start">
              <div className="p-2.5 rounded-2xl bg-violet-400/10 border border-violet-400/10 group-hover:bg-violet-400/20">
                <MessageSquare className="w-5 h-5 text-violet-400" />
              </div>
              <span className="text-[9px] font-mono font-bold uppercase text-violet-400 bg-violet-400/10 px-2 py-0.5 rounded-md">
                {lang === 'pt' ? 'SINTONIA' : 'AI RESONANCE'}
              </span>
            </div>
            <div className="mt-3 text-left">
              <h4 className={`text-sm font-semibold transition-colors group-hover:text-violet-400 ${textPrimary}`}>
                {lang === 'pt' ? '🎤 Diálogo VozAtiva' : '🎤 Live Voice Chat'}
              </h4>
              <p className="text-[10.5px] text-slate-400 mt-1 line-clamp-2">
                {lang === 'pt' ? 'Ressonância terapêutica com o Dr. Evaldo em fluxo desacelerado.' : 'Slowing conversational companion engine calibrating brainwaves.'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[9px] text-violet-400 font-bold font-mono uppercase tracking-wider pt-2 border-t border-[#1d2745]/30">
              <span>{lang === 'pt' ? 'Falar com Dr.' : 'Converse Now'}</span>
              <ArrowRight className="w-3 w-3 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* MISSIONS */}
      <div className={`p-7 rounded-[2rem] border shadow-xl space-y-6 transition-all duration-300 ${containerBg}`}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-[10px] font-mono tracking-[0.25em] font-bold text-[#14B8A6] uppercase block">Seção 04 • CONQUISTAR O DIA</span>
            <h3 className={`text-xl font-serif font-black ${textPrimary}`}>🎯 {lang === 'pt' ? 'Missão do Dia PCH' : "Today's Harmonic Goal"}</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded-full border border-[#10B981]/25">
              {totalMissionsCompleted}/4 {lang === 'pt' ? 'concluídos' : 'completed'}
            </span>
            <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 font-bold">
              +50 XP
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {[
            { id: 'waterGarden', descPt: '🌿 Regar o Jardim Interior (+15 XP)', descEn: '🌿 Water the Cosmic Garden (+15 XP)' },
            { id: 'talkEvaldo', descPt: '💬 Conversar com Dr. Evaldo (Voz/Chat)', descEn: '💬 Talk with Dr. Evaldo (Voice/Chat)' },
            { id: 'writeJournal', descPt: '📝 Registrar 01 Página no Diário', descEn: '📝 Record 01 Page inside Private Journal' },
            { id: 'doBreathing', descPt: '🌬️ Completar 01 Ciclo de Sopro Coerente', descEn: '🌬️ Complete 01 Coherent Breath loop' }
          ].map((mission) => {
            const isChecked = dailyMissions[mission.id as keyof typeof dailyMissions];
            return (
              <div 
                key={mission.id}
                onClick={() => toggleMission(mission.id as any)}
                className={`p-4 rounded-2xl border flex items-center justify-between transition-all duration-300 cursor-pointer ${
                  isChecked 
                    ? 'bg-[#10B981]/10 border-[#10B981]/35 text-[#10B981]'
                    : isLightTheme
                      ? 'bg-stone-50 border-stone-200/60 text-stone-600 hover:border-stone-400/50'
                      : 'bg-[#0f1423] border-[#1b253f] text-slate-400 hover:border-slate-500/40'
                }`}
              >
                <span className={`text-xs font-serif leading-relaxed ${isChecked ? 'text-[#10B981] font-semibold' : textSecondary}`}>
                  {lang === 'pt' ? mission.descPt : mission.descEn}
                </span>
                <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                  isChecked 
                    ? 'bg-[#10B981] border-transparent text-white' 
                    : isLightTheme ? 'border-stone-350 border-stone-300' : 'border-slate-700'
                }`}>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 flex flex-col items-center">
          {hasClaimedMission ? (
            <div className="py-3 px-6 bg-emerald-950/20 border border-emerald-500/35 rounded-2xl text-[11px] font-mono tracking-wider text-emerald-500 uppercase font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>{lang === 'pt' ? 'Recompensa do Dia Resgatada!' : 'Daily Rewards Claimed!'}</span>
            </div>
          ) : (
            <button
              onClick={handleClaimReward}
              disabled={!isMissionComplete}
              className={`py-3 px-8 rounded-2xl font-mono text-xs uppercase tracking-widest font-black transition-all cursor-pointer ${
                isMissionComplete
                  ? 'bg-gradient-to-r from-amber-500 to-[#14b8a6] text-stone-950 hover:scale-103 shadow-lg'
                  : isLightTheme
                    ? 'bg-stone-100 border border-stone-250 text-stone-400 cursor-not-allowed'
                    : 'bg-stone-900 border border-stone-850 text-stone-600 cursor-not-allowed'
              }`}
            >
              {lang === 'pt' ? '★ Concluir Missão do Dia (+50 XP)' : '★ Claim Daily Alignment Award (+50 XP)'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
