import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User as UserIcon, Sparkles, MapPin, Award, ArrowLeft, Heart, Compass, Info, Sliders, Shield, BookOpen } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { User, Language } from '../types';
import { UserProfileView } from './UserProfileView';
import TelaJornada from './TelaJornada';
import { auth, db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

interface EvoluirViewProps {
  user: User;
  lang: Language;
  isLightTheme: boolean;
  onNavigateToSettings: () => void;
}

type EvoluirSubSection = 'perfil' | 'jornada' | 'constelacao';

export const EvoluirView: React.FC<EvoluirViewProps> = ({
  user,
  lang,
  isLightTheme,
  onNavigateToSettings,
}) => {
  const [subSection, setSubSection] = useState<EvoluirSubSection>('perfil');
  const [selectedStar, setSelectedStar] = useState<string | null>(null);

  const textPrimary = isLightTheme ? 'text-stone-850 text-stone-800' : 'text-stone-100';
  const textSecondary = isLightTheme ? 'text-stone-600' : 'text-stone-300';
  const textMuted = isLightTheme ? 'text-stone-400' : 'text-slate-400';
  const tabActive = isLightTheme
    ? 'bg-emerald-50 border border-emerald-100 text-[#2B6140] font-semibold shadow-sm'
    : 'bg-emerald-950/40 border border-emerald-900/40 text-[#4ade80] font-semibold shadow-sm';
  const tabInactive = isLightTheme
    ? 'text-stone-500 hover:text-stone-800 hover:bg-stone-100/40'
    : 'text-stone-400 hover:text-stone-100 hover:bg-stone-900/20';

  const points = user?.points || 0;

  // Get resonanceHistory or safe defaults for visual rhythm
  const chartData = user?.resonanceHistory && user.resonanceHistory.length > 0
    ? user.resonanceHistory
    : [
        { date: lang === 'pt' ? 'Início' : 'Start', score: 62 },
        { date: lang === 'pt' ? 'Sem 1' : 'Wk 1', score: 69 },
        { date: lang === 'pt' ? 'Sem 2' : 'Wk 2', score: 73 },
        { date: lang === 'pt' ? 'Sem 3' : 'Wk 3', score: 78 },
        { date: lang === 'pt' ? 'Sessão 4' : 'Sess. 4', score: user?.resonanceScore || 85 }
      ];

  const [journals, setJournals] = useState<any[]>([]);
  const [loadingJournals, setLoadingJournals] = useState(false);

  useEffect(() => {
    const fetchJournals = async () => {
      const currentUser = auth?.currentUser;
      let localEntries: any[] = [];
      
      try {
        const stored = localStorage.getItem('pch_journal_entries');
        if (stored) {
          localEntries = JSON.parse(stored);
        }
      } catch (err) {
        console.error("Localstorage journals error:", err);
      }

      if (currentUser) {
        setLoadingJournals(true);
        try {
          const colRef = collection(db, 'users', currentUser.uid, 'journals');
          const snap = await getDocs(colRef);
          const fbEntries: any[] = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          const merged: any[] = [...fbEntries];
          localEntries.forEach(le => {
            if (!merged.some(fe => fe.id === le.id)) {
              merged.push(le);
            }
          });
          // Sort chronologically (oldest to newest)
          merged.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          setJournals(merged);
        } catch (err) {
          console.error("Error fetching journals for constellation:", err);
          localEntries.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          setJournals(localEntries);
        } finally {
          setLoadingJournals(false);
        }
      } else {
        localEntries.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setJournals(localEntries);
      }
    };

    fetchJournals();
  }, [subSection]);

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

  return (
    <div className={`w-full min-h-full pb-24 transition-colors duration-500 overflow-x-hidden ${isLightTheme ? 'bg-[#FCFBF9]' : 'bg-[#080B14]'}`}>
      <div className="max-w-4xl mx-auto px-6 pt-6 space-y-6">
        
        {/* Poetic Area Hero and Selector */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-850/10 pb-5">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-1 text-xs text-[#14B8A6] font-mono tracking-widest uppercase">
              <Award className="w-3.5 h-3.5 animate-pulse" />
              <span>{lang === 'pt' ? 'Templo do Crescimento' : 'Temple of Growth'}</span>
            </div>
            <h2 className={`text-xl font-serif font-black ${textPrimary}`}>
              {lang === 'pt' ? 'Minha Evolução' : 'My Evolution'}
            </h2>
          </div>

          {/* Core sub-tab switchers */}
          <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-stone-900/15 border border-stone-850/5/30 shrink-0">
            <button
              onClick={() => setSubSection('perfil')}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer ${
                subSection === 'perfil' ? tabActive : tabInactive
              }`}
            >
              👤 {lang === 'pt' ? 'Perfil' : 'Profile'}
            </button>
            <button
              onClick={() => setSubSection('jornada')}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer ${
                subSection === 'jornada' ? tabActive : tabInactive
              }`}
            >
              🌌 {lang === 'pt' ? 'Jornada' : 'Journey'}
            </button>
            <button
              onClick={() => setSubSection('constelacao')}
              className={`px-4 py-1.5 rounded-xl text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer ${
                subSection === 'constelacao' ? tabActive : tabInactive
              }`}
            >
              ⭐ {lang === 'pt' ? 'Sintonia' : 'Harmonics'}
            </button>
          </div>
        </div>

        {/* Content switch box */}
        <div className="w-full relative">
          <AnimatePresence mode="wait">
            
            {/* View 1: Perfil (UserProfileView) */}
            {subSection === 'perfil' && (
              <motion.div
                key="perfil"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <UserProfileView
                  user={user}
                  lang={lang}
                  onNavigateToSettings={onNavigateToSettings}
                />
              </motion.div>
            )}

            {/* View 2: Jornada (TelaJornada) */}
            {subSection === 'jornada' && (
              <motion.div
                key="jornada"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <TelaJornada
                  lang={lang}
                  onBack={() => setSubSection('perfil')}
                />
              </motion.div>
            )}

            {/* View 3: Estrelas & Conquistas Constellation */}
            {subSection === 'constelacao' && (
              <motion.div
                key="constelacao"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6 text-left"
              >
                {/* Constellation description card */}
                <div className={`p-6 rounded-[2rem] border relative overflow-hidden transition-all duration-300 ${
                  isLightTheme ? 'bg-white border-stone-200' : 'bg-stone-900/40 border-stone-800'
                }`}>
                  <div className="absolute top-0 right-0 w-[240px] h-[240px] bg-[#14b8a6]/4 rounded-full blur-[80px] pointer-events-none" />
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono tracking-[0.25em] font-bold text-teal-400 uppercase block">MAPA DE ALINHAMENTO</span>
                    <h3 className={`text-base font-serif font-black ${textPrimary}`}>🏆 {lang === 'pt' ? 'Constelação do Autoconhecimento' : 'Self-Knowledge Constellation'}</h3>
                    <p className={`text-xs ${textSecondary}`}>
                      {lang === 'pt' 
                        ? 'Sua jornada mapeada no cosmos. As estrelas douradas representam conquistas sagradas, e as esferas celestes menores representam suas sessões de voz e reflexões.' 
                        : 'Your journey mapped in the cosmos. Golden stars indicate active achievements, while lighter cyan ripples indicate your self-reflection journal entries.'}
                    </p>
                  </div>

                  {/* connected SVG Grid */}
                  <div className={`relative w-full h-[220px] border rounded-[2rem] overflow-hidden flex flex-col justify-between p-4 shadow-inner mt-5 ${
                    isLightTheme ? 'bg-stone-50 border-stone-200 shadow-stone-100' : 'bg-[#04060c] border-[#111625]'
                  }`}>
                    {/* Stars ambiance background */}
                    <div className="absolute inset-0 pointer-events-none opacity-65">
                      <div className="absolute w-[2px] h-[2px] bg-white rounded-full top-[15%] left-[25%] opacity-35 animate-pulse" />
                      <div className="absolute w-[1.5px] h-[1.5px] bg-white rounded-full top-[65%] left-[12%] opacity-40 animate-pulse" />
                      <div className="absolute w-[1.5px] h-[1.5px] bg-white rounded-full top-[35%] right-[15%] opacity-30 animate-pulse" />
                      <div className="absolute w-[2px] h-[2px] bg-teal-400 rounded-full top-[45%] right-[42%] opacity-60 animate-pulse" />
                      <div className="absolute w-[2px] h-[2px] bg-indigo-400 rounded-full top-[75%] right-[22%] opacity-50 animate-pulse" />
                    </div>

                    <svg viewBox="0 0 500 180" className="absolute inset-0 w-full h-full z-10 select-none">
                      {/* Connection lines for Core Achievements (Golden Constellation skeleton) */}
                      <line x1="40" y1="40" x2="140" y2="140" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="1.5" />
                      <line x1="140" y1="140" x2="240" y2="50" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="1.5" />
                      <line x1="240" y1="50" x2="350" y2="130" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="1.5" />
                      <line x1="350" y1="130" x2="460" y2="70" stroke="rgba(245, 158, 11, 0.15)" strokeWidth="1.5" />

                      {/* Connection lines for Reflexões (Procedural dynamic connections) */}
                      {journals.length > 1 && journals.map((entry, index) => {
                        if (index === 0) return null;
                        const step = 340 / (journals.length - 1);
                        const prevX = 80 + (index - 1) * step + Math.cos((index - 1) * 2) * 15;
                        const prevY = 90 + Math.sin((index - 1) * 3) * 35;
                        const currX = 80 + index * step + Math.cos(index * 2) * 15;
                        const currY = 90 + Math.sin(index * 3) * 35;
                        return (
                          <line 
                            key={`path-${entry.id}`} 
                            x1={prevX} 
                            y1={prevY} 
                            x2={currX} 
                            y2={currY} 
                            stroke="rgba(20, 184, 166, 0.45)" 
                            strokeWidth="1" 
                            strokeDasharray="2 3" 
                          />
                        );
                      })}

                      {/* Render Core achievements stars */}
                      {achievementsList.map((star) => {
                        const isActivated = points >= star.xp;
                        const isSelected = selectedStar === star.id;
                        return (
                          <g key={star.id} className="cursor-pointer" onClick={() => setSelectedStar(star.id)}>
                            {/* Glow radius halo if selected */}
                            {isSelected && (
                              <circle cx={star.cx} cy={star.cy} r="12" fill="rgba(245, 158, 11, 0.15)" className="animate-ping" />
                            )}
                            <circle 
                              cx={star.cx} 
                              cy={star.cy} 
                              r={isSelected ? 7 : isActivated ? 5 : 4} 
                              fill={isActivated ? (isSelected ? "#F59E0B" : "#D97706") : "#475569"} 
                              className="transition-all duration-300 pointer-events-auto filter drop-shadow-[0_0_6px_rgba(217,119,6,0.5)]"
                            />
                            {/* Inner core spark */}
                            {isActivated && (
                              <circle cx={star.cx} cy={star.cy} r="1.5" fill="#FFFFFF" />
                            )}
                          </g>
                        );
                      })}

                      {/* Render PCH entry sparks */}
                      {journals.map((entry, index) => {
                        const step = journals.length > 1 ? (340 / (journals.length - 1)) : 170;
                        const cx = 80 + index * step + Math.cos(index * 2) * 15;
                        const cy = 90 + Math.sin(index * 3) * 35;
                        const isSelected = selectedStar === entry.id;
                        
                        return (
                          <g key={entry.id} className="cursor-pointer" onClick={() => setSelectedStar(entry.id)}>
                            {isSelected && (
                              <circle cx={cx} cy={cy} r="10" fill="rgba(20, 184, 166, 0.2)" className="animate-pulse" />
                            )}
                            <circle 
                              cx={cx} 
                              cy={cy} 
                              r={isSelected ? 6 : 4} 
                              fill={isSelected ? "#14B8A6" : "#2DD4BF"} 
                              className="transition-all duration-300 pointer-events-auto filter drop-shadow-[0_0_4px_rgba(45,212,191,0.6)]"
                            />
                          </g>
                        );
                      })}
                    </svg>

                    {/* Captions / Legend HUD */}
                    <div className="absolute bottom-3 left-4 right-4 z-20 flex justify-between items-center bg-stone-900/10 backdrop-blur-sm rounded-lg px-3 py-1 text-[8px] font-mono leading-none border border-stone-200/10 text-stone-450 select-none">
                      <div className="flex gap-4">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#D97706]" />
                          {lang === 'pt' ? 'Estrela Teológica (Conquista)' : 'Golden Star (Achievement)'}
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-[#2DD4BF]" />
                          {lang === 'pt' ? 'Centelha Reflexiva (Diário)' : 'Crystalline Spark (My PCH)'}
                        </span>
                      </div>
                      <div>
                        {lang === 'pt' 
                          ? `${journals.length} Centelhas Ativas` 
                          : `${journals.length} Sparks Synchronized`}
                      </div>
                    </div>
                  </div>

                  {/* interactive Star/Reflexão click display card */}
                  <div className={`p-5 rounded-2xl text-left border mt-5 shadow-inner transition-all ${
                    isLightTheme ? 'bg-stone-50 border-stone-200' : 'bg-[#06080e] border-[#161d30]'
                  }`}>
                    {selectedStar ? (() => {
                      // Check achievements first
                      const starDetail = achievementsList.find(s => s.id === selectedStar);
                      const isAchievement = !!starDetail;

                      if (isAchievement) {
                        const isActivated = points >= (starDetail?.xp || 0);
                        return (
                          <div className="space-y-1.5 animate-fade-in text-left">
                            <div className="flex justify-between items-center gap-2">
                              <h4 className={`font-serif font-black text-sm ${isLightTheme ? 'text-stone-850 text-stone-800' : 'text-[#F59E0B]'}`}>
                                {lang === 'pt' ? starDetail?.titlePt : starDetail?.titleEn}
                              </h4>
                              <span className={`text-[8px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                                isActivated ? 'bg-amber-500/10 border-amber-500/20 text-amber-550 text-amber-600' : 'bg-stone-500/10 border-stone-800 text-stone-500'
                              }`}>
                                {isActivated ? (lang === 'pt' ? 'MARCO ATIVADO' : 'MILESTONE ACTIVE') : (lang === 'pt' ? `REQUER ${starDetail?.xp} XP` : `REQUIRES ${starDetail?.xp} XP`)}
                              </span>
                            </div>
                            <p className={`text-[12px] font-light leading-relaxed font-serif italic ${textPrimary}`}>
                              {lang === 'pt' ? starDetail?.poemPt : starDetail?.poemEn}
                            </p>
                          </div>
                        );
                      } else {
                        // Check custom journals
                        const index = journals.findIndex(j => j.id === selectedStar);
                        const journalDetail = journals[index];
                        if (!journalDetail) return null;
                        
                        return (
                          <div className="space-y-2 animate-fade-in text-left">
                            <div className="flex justify-between items-center gap-2 border-b border-stone-200/20 pb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="p-1 rounded-lg bg-teal-500/10 text-teal-400">
                                  <BookOpen className="w-3.5 h-3.5" />
                                </span>
                                <h4 className={`font-serif font-bold text-xs ${isLightTheme ? 'text-stone-800' : 'text-teal-400'}`}>
                                  {lang === 'pt' 
                                    ? `Reflexão Vital #${journals.length - index}` 
                                    : `Integral Mind Spark #${journals.length - index}`}
                                </h4>
                              </div>
                              <span className="text-[9px] font-mono font-medium text-stone-450">
                                {new Date(journalDetail.date).toLocaleString()}
                              </span>
                            </div>

                            {journalDetail.prompt && (
                              <p className="text-[10px] text-stone-450 italic pl-2 border-l border-teal-500/30 font-serif">
                                💬 {journalDetail.prompt}
                              </p>
                            )}

                            <div className={`p-3 rounded-xl text-xs font-light leading-relaxed ${
                              isLightTheme ? 'bg-white text-stone-700' : 'bg-[#0a0f1b] text-stone-300'
                            }`}>
                              {journalDetail.text || (lang === 'pt' ? 'Sem texto anotado.' : 'No notes written.')}
                            </div>
                          </div>
                        );
                      }
                    })() : (
                      <div className={`flex items-space space-x-3 ${textSecondary}`}>
                        <Info className="w-4 h-4 text-teal-400 shrink-0" />
                        <p className="text-xs font-light leading-relaxed">
                          {lang === 'pt' 
                            ? 'Navegue pelo autoconhecimento: Toque em qualquer uma das estrelas (marcos) ou centelhas cristalinas (suas reflexões) no céu de sintonias para inspecionar seus segredos poéticos e pensamentos salvados.' 
                            : 'Explore your alignment: Tap any star (achievement milestone) or crystalline spark (your own journal sessions) inside the constellation map above to read and inspect details.'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Healing wave resonance history sparkline chart using Recharts */}
                <div className={`p-6 rounded-[2rem] border relative overflow-hidden transition-all duration-300 ${
                  isLightTheme ? 'bg-white border-stone-200' : 'bg-stone-900/40 border-stone-800'
                }`}>
                  <div className="space-y-0.5 text-left mb-4">
                    <span className="text-[9px] font-mono tracking-[0.25em] font-bold text-[#14B8A6] uppercase block">ONDA DE ALINHAMENTO</span>
                    <h3 className={`text-base font-serif font-black ${textPrimary}`}>📈 {lang === 'pt' ? 'Histórico de Ressonância Emocional' : 'Emotional Resonance History'}</h3>
                    <p className={`text-xs ${textSecondary}`}>
                      {lang === 'pt' 
                        ? 'Seu alinhamento de ressonância pós-sessão capturado ao longo do tempo.' 
                        : 'Your post-session bio-resonance alignment scores tracked over time.'}
                    </p>
                  </div>
                  <div className={`w-full h-[180px] border rounded-[2rem] p-4 flex flex-col justify-end ${
                    isLightTheme ? 'bg-stone-50 border-stone-200' : 'bg-[#090b14] border-stone-850'
                  }`} id="recharts-sparkline-wrapper">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                        <defs>
                          <linearGradient id="resonanceColor" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#14B8A6" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#14B8A6" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <XAxis 
                          dataKey="date" 
                          stroke="#78716c" 
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false} 
                          dy={12}
                        />
                        <YAxis 
                          domain={[0, 100]}
                          stroke="#78716c"
                          fontSize={10} 
                          tickLine={false} 
                          axisLine={false}
                          dx={-10}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: isLightTheme ? '#ffffff' : '#0e1424',
                            border: '1px solid currentColor',
                            borderColor: isLightTheme ? '#e2e8f0' : '#1e293b',
                            borderRadius: '1.25rem',
                            fontSize: '11px',
                            color: isLightTheme ? '#14B8A6' : '#2DD4BF'
                          }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="score" 
                          stroke="#14B8A6" 
                          strokeWidth={2} 
                          fillOpacity={1} 
                          fill="url(#resonanceColor)" 
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
};

export default EvoluirView;
