import React from 'react';
import { User, Language } from '../types';
import { neuroProfiles, useNeuroProfileManager, NeuroProfileConfig } from './NeuroAdaptiveEngine';
import { 
  Compass, 
  MapPin, 
  Sparkles, 
  ChevronRight, 
  Award, 
  ArrowLeft, 
  Star, 
  Feather, 
  Send,
  Loader2 
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface NeuroJourneyMapProps {
  user: User;
  lang: Language;
  onBack: () => void;
  onAddToast: (toast: { type: string; title: string; description: string }) => void;
}

export const NeuroJourneyMap: React.FC<NeuroJourneyMapProps> = ({
  user,
  lang,
  onBack,
  onAddToast
}) => {
  const { profile, loading, updateProfile, addEvolutionLog } = useNeuroProfileManager(user?.id);
  const [selectedStarId, setSelectedStarId] = React.useState<string | null>(null);
  
  const currentType = profile?.neuroType || (user?.neuroMode as any) || 'normal';
  const spec: NeuroProfileConfig = neuroProfiles[currentType] || neuroProfiles.normal;

  const points = user?.points || 0;

  React.useEffect(() => {
    // Select first star as default
    if (spec?.journeyStars?.length > 0) {
      setSelectedStarId(spec.journeyStars[0].id);
    }
  }, [spec]);

  const selectedStar = spec?.journeyStars?.find(s => s.id === selectedStarId) || spec?.journeyStars?.[0];

  const handleLevelUpSimulator = async () => {
    if (!user?.id) return;
    try {
      const dbPoints = user.points || 0;
      const addedXp = 50;
      const nextPoints = dbPoints + addedXp;
      let nextLevel = user.level || 1;
      if (nextPoints >= nextLevel * 200) {
        nextLevel += 1;
      }
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        points: nextPoints,
        level: nextLevel
      });

      await addEvolutionLog(user.id, addedXp, lang === 'pt' ? 'Mapeou Caminho Estelar' : 'Mapped Cosmic Meridian', 100);
      
      onAddToast({
        type: 'level',
        title: lang === 'pt' ? 'Sintonia Elevada! 🌟' : 'Ethereal Spark Recruited! 🌟',
        description: lang === 'pt' 
          ? `+${addedXp} XP de autoconhecimento integrados à sua jornada.`
          : `+${addedXp} XP of presence successfully merged to your coordinates.`
      });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#070b14] text-[#E0E7E5] px-4 py-8 md:px-8 space-y-8 select-none relative pb-28">
      {/* Background grids */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[350px] h-[350px] bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header bar */}
      <div className="flex justify-between items-center bg-[#0d1324]/50 border border-[#1e2a4a]/45 rounded-[2rem] p-5 shadow-lg relative">
        <div className="flex items-center gap-3.5 text-left">
          <button 
            onClick={onBack}
            className="p-3 bg-[#0d1222] border border-[#1d2645] hover:bg-[#121932] rounded-2xl cursor-pointer transition-all hover:-translate-x-1 duration-300"
            title={lang === 'pt' ? 'Voltar para Home' : 'Back to Sanctuary'}
          >
            <ArrowLeft className="w-4 h-4 text-purple-400" />
          </button>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono tracking-[0.3em] font-medium text-purple-400 uppercase">MAPA DE JORNADA PERSONALIZADA</span>
            <h1 className="text-xl md:text-2xl font-serif font-black text-stone-100 flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-400" />
              {lang === 'pt' ? 'Mapa de Sintonia Estelar' : 'Cosmic Meridian Map'}
            </h1>
          </div>
        </div>

        <div className="px-4 py-1.5 bg-[#0f1423] border border-[#1b253f] rounded-full text-[10px] font-mono tracking-wider font-bold shadow-md">
          {points} XP
        </div>
      </div>

      {/* Hero Visual Map Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Aspect: Interactive Connected Map Vector View */}
        <div className="lg:col-span-8 p-7 bg-[#0d1324]/80 border border-[#1e2a4a]/90 rounded-[2rem] space-y-5 text-center relative overflow-hidden shadow-xl min-h-[420px] flex flex-col justify-between">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="flex justify-between items-center z-10 relative">
            <div className="text-left">
              <span className="text-[9px] font-mono tracking-widest text-[#a78bfa] uppercase block font-bold">JORNADA ATIVA</span>
              <h3 className="text-lg font-serif font-black text-stone-100">
                {lang === 'pt' ? spec.journeyNamePt : spec.journeyNameEn}
              </h3>
            </div>
            <span className="text-[8.5px] font-mono text-purple-400 font-bold bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 uppercase tracking-widest">
              {spec.badge}
            </span>
          </div>

          {/* Interactive SVG Celestial Sky */}
          <div className="my-6 w-full h-[240px] bg-[#05080e] border border-[#151c2e] rounded-[2rem] relative shadow-inner overflow-hidden flex items-center justify-center">
            
            {/* Twinkly particles */}
            <div className="absolute inset-0 pointer-events-none opacity-40">
              <div className="absolute w-1 h-1 bg-white rounded-full top-[10%] left-[20%] animate-ping" />
              <div className="absolute w-[1.5px] h-[1.5px] bg-sky-200 rounded-full top-[80%] left-[10%] animate-pulse" />
              <div className="absolute w-1 h-1 bg-purple-300 rounded-full top-[40%] right-[30%] animate-bounce" />
              <div className="absolute w-[2px] h-[2px] bg-teal-300 rounded-full top-[70%] right-[15%] animate-pulse" />
            </div>

            <svg viewBox="0 0 380 120" className="absolute inset-0 w-full h-full z-10 select-none">
              {/* Dynamic Line Connections between sequential coordinate stars */}
              {spec?.journeyStars && spec.journeyStars.map((star, idx) => {
                if (idx === 0) return null;
                const prev = spec.journeyStars[idx - 1];
                const prevUnlocked = points >= prev.xp;
                const curUnlocked = points >= star.xp;
                return (
                  <line
                    key={`line-${idx}`}
                    x1={prev.cx}
                    y1={prev.cy}
                    x2={star.cx}
                    y2={star.cy}
                    stroke={prevUnlocked && curUnlocked ? 'rgba(167, 139, 250, 0.5)' : '#1e293b'}
                    strokeWidth={prevUnlocked && curUnlocked ? '1.5' : '1'}
                    strokeDasharray={!(prevUnlocked && curUnlocked) ? '3 3' : 'none'}
                    className="transition-all duration-500"
                  />
                );
              })}

              {/* Glowing Nodes map */}
              {spec?.journeyStars && spec.journeyStars.map((star) => {
                const isUnlocked = points >= star.xp;
                const isSelected = selectedStarId === star.id;
                
                return (
                  <circle
                    key={star.id}
                    cx={star.cx}
                    cy={star.cy}
                    r={isSelected ? 6 : isUnlocked ? 3.5 : 2}
                    fill={isSelected ? '#EC4899' : isUnlocked ? '#8B5CF6' : '#334155'}
                    className="transition-all duration-300 cursor-pointer pointer-events-auto filter drop-shadow-[0_0_6px_rgba(139,92,246,0.6)]"
                    onClick={() => setSelectedStarId(star.id)}
                  />
                );
              })}
            </svg>

            {/* Interactive labels positioning overlay */}
            <div className="absolute inset-0 z-20 flex justify-between pointer-events-none">
              {spec?.journeyStars && spec.journeyStars.map((star) => {
                const isUnlocked = points >= star.xp;
                return (
                  <button
                    key={star.id}
                    onClick={() => setSelectedStarId(star.id)}
                    className="absolute pointer-events-auto cursor-pointer flex flex-col items-center"
                    style={{ left: `${Math.round((star.cx / 380) * 88) + 4}%`, top: `${Math.round((star.cy / 120) * 65) + 12}%` }}
                  >
                    <span className={`text-[8px] font-mono tracking-wide mt-2 block ${isUnlocked ? 'text-slate-300' : 'text-slate-600 font-light'}`}>
                      {lang === 'pt' ? star.namePt : star.nameEn}
                    </span>
                  </button>
                );
              })}
            </div>

          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-3 border-t border-[#1b253f]/50 pt-4 text-xs font-mono text-slate-500">
            <span>{lang === 'pt' ? '★ Clique em qualquer coordenada para focar sua lição' : '★ Tap coordinates to focus alignment lessons'}</span>
            <button
              onClick={handleLevelUpSimulator}
              className="px-4 py-2 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/20 rounded-xl transition-all cursor-pointer pointer-events-auto"
            >
              {lang === 'pt' ? 'Simular Hábitos (+50 XP)' : 'Simulate Care Habit (+50 XP)'}
            </button>
          </div>

        </div>

        {/* Right Aspect: Narrative Poetic Focus lesson Card */}
        <div className="lg:col-span-4 space-y-6 text-left">
          
          <div className="p-6 rounded-[2rem] bg-[#0d1324] border border-[#1e2a4a] space-y-5 shadow-xl relative overflow-hidden min-h-[300px]">
            <span className="text-[9px] font-mono text-pink-500 tracking-widest uppercase font-bold block">REVELAÇÃO COGNITIVA DA COORDENADA</span>
            
            {selectedStar ? (
              <div className="space-y-4 animate-fade-in">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">☀️</span>
                    <h4 className="text-base font-serif font-black text-stone-100">
                      {lang === 'pt' ? selectedStar.namePt : selectedStar.nameEn}
                    </h4>
                  </div>
                  <span className={`text-[8.5px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                    points >= selectedStar.xp 
                      ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' 
                      : 'bg-stone-900 border-stone-800 text-stone-500'
                  }`}>
                    {points >= selectedStar.xp ? (lang === 'pt' ? 'ATRIBUÍDO' : 'UNLOCKED') : (lang === 'pt' ? `${selectedStar.xp} XP` : `${selectedStar.xp} XP NEEDED`)}
                  </span>
                </div>

                {/* Cognitive Poem induction */}
                <div className="p-4 bg-[#070b14] border border-[#16213c] rounded-2xl">
                  <Feather className="w-4 h-4 text-pink-400 mb-2 animate-pulse" />
                  <p className="text-xs font-serif text-stone-200 leading-relaxed italic">
                    {lang === 'pt' ? selectedStar.poemPt : selectedStar.poemEn}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">{lang === 'pt' ? 'Diretriz de Atenção' : 'Aura Guideline'}</span>
                  <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                    {points >= selectedStar.xp 
                      ? (lang === 'pt' 
                          ? 'Parabéns. O pilar cognitivo deste marco foi integrado com sucesso no seu subconsciente. Respire e sintonize.' 
                          : 'Outstanding. This cognitive beacon node is firmly registered inside your emotional database.') 
                      : (lang === 'pt' 
                          ? 'Esta estrela requer maior XP. Pratique novos exercícios, medite e regue seu jardim para abrir novos marcos.' 
                          : 'Complete more co-regulatory items or water the inner sanctuary vegetation coordinates to open.')}
                  </p>
                </div>

              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-slate-500 italic text-xs">
                <span>{lang === 'pt' ? 'Nenhuma estrela selecionada' : 'No coordinate focused'}</span>
              </div>
            )}
          </div>

          <div className="p-6 rounded-[2rem] bg-gradient-to-br from-[#8b5cf6]/5 to-transparent border border-[#1e2a4a]/85 text-left">
            <h5 className="text-xs font-serif font-black text-stone-200 mb-2 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-[#8b5cf6]" />
              {lang === 'pt' ? 'Metas do Genótipo de Conquistas' : 'Aura Genotype Alignment Target'}
            </h5>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              {lang === 'pt' ? spec.gamificationGoalPt : spec.gamificationGoalEn}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
export default NeuroJourneyMap;
