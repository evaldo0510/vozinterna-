import React, { useState } from 'react';
import { User, Language } from '../types';
import { 
  Puzzle, 
  Zap, 
  CheckCircle2, 
  MessageSquare, 
  Bookmark, 
  ArrowRight, 
  ShieldCheck, 
  Compass,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface HomeViewProps {
  user: User;
  lang: Language;
  onNavigateToScreen: (screen: 'portal' | 'home' | 'chat' | 'jornada' | 'espelho' | 'refugio' | 'sopro') => void;
  isLightTheme: boolean;
  onToggleTheme: () => void;
  onAddToast: (toast: { type: string; title: string; description: string }) => void;
  onOpenTuningPopover: () => void;
}

export const HomeTeaTdah: React.FC<HomeViewProps> = ({
  user,
  lang,
  onNavigateToScreen,
  onAddToast,
}) => {
  const [goals, setGoals] = useState([
    { id: 1, titlePt: "🌱 Sopro de 10 segundos para ancoragem física", titleEn: "🌱 10 second grounding breath cycle", done: false },
    { id: 2, titlePt: "🎙️ Sintonizar um conselho terapêutico rápido por voz", titleEn: "🎙️ Stream a single quick spoken piece of wisdom", done: false },
    { id: 3, titlePt: "📝 Ancorar 3 palavras de desabafo no Diário", titleEn: "📝 Type 3 words about how you feel in the Journal", done: false }
  ]);

  const handleToggleGoal = async (id: number) => {
    const updated = goals.map(g => g.id === id ? { ...g, done: !g.done } : g);
    setGoals(updated);
    
    const target = goals.find(g => g.id === id);
    if (target && !target.done) {
      onAddToast({
        type: 'success',
        title: lang === 'pt' ? 'Etapa batida! 🦾🧩' : 'Milestone completed! 🦾🧩',
        description: lang === 'pt' 
          ? 'Equilíbrio sintonizado com sucesso! +20 XP.' 
          : 'Grounded milestone unlocked successfully! +20 XP.'
      });

      if (user?.id && db) {
        try {
          const userDocRef = doc(db, 'users', user.id);
          await updateDoc(userDocRef, {
            points: (user.points || 0) + 20
          });
        } catch (err) {
          console.error(err);
        }
      }
    }
  };

  return (
    <div className="space-y-8 select-none text-left">
      
      {/* COGNITIVE DUAL SHIELD AT THE TOP */}
      <div className="p-7 rounded-[2rem] bg-gradient-to-r from-teal-500/10 via-[#0d1324] to-purple-500/10 border-2 border-teal-500/20 flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex gap-4 items-center">
          <div className="w-13 h-13 bg-gradient-to-tr from-teal-400 to-purple-500 rounded-2xl flex items-center justify-center text-[#080b14] shrink-0">
            <Puzzle className="w-6.5 h-6.5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[9.5px] font-mono tracking-widest text-[#14B8A6] uppercase font-bold block">
              {lang === 'pt' ? 'DIREÇÃO COMBINADA AUTISMO & TDAH 🧠' : 'COMBINED ASD + ADHD MODULATION 🧠'}
            </span>
            <h3 className="text-base font-serif font-black text-stone-100 mt-1">
              {lang === 'pt' ? 'Santuário de Co-Regulação Ativo' : 'Symmetric Co-Regulation Active'}
            </h3>
            <p className="text-[11px] text-stone-400 leading-relaxed font-light mt-0.5">
              {lang === 'pt' 
                ? 'Previsibilidade estrutural do TEA com o fluxo interativo direcionado do TDAH. Sequências límpidas para focar sua mente.' 
                : 'Structure meets focus prompts. Low layout movement, clear tracking lists.'}
            </p>
          </div>
        </div>

        <div className="px-4 py-2 bg-stone-900 border border-stone-850 rounded-2xl text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">
          {lang === 'pt' ? 'Nível de Ruído: Zero' : 'Noise filter: 100%'}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* FOCUS BLOCKS SEQUENCE */}
        <div className="col-span-12 md:col-span-7 space-y-5">
          <div className="p-7 rounded-[2rem] bg-[#0c1221] border border-[#1b2641] space-y-5">
            <div>
              <span className="text-[9.5px] font-mono tracking-widest text-[#10B981] uppercase font-black">
                {lang === 'pt' ? 'PEQUENAS COISAS AGORA' : 'CURRENT TACTILE FOCUS'}
              </span>
              <h4 className="text-lg font-serif font-bold text-stone-100 mt-1">
                {lang === 'pt' ? 'Metas Rápidas e Organizadas' : 'Structured Focal Targets'}
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">
                {lang === 'pt' ? 'Toque para marcar conforme seu ritmo de hoje.' : 'Tap to register milestones as you clear them.'}
              </p>
            </div>

            <div className="space-y-3.5">
              {goals.map((g) => (
                <div
                  key={g.id}
                  onClick={() => handleToggleGoal(g.id)}
                  className={`p-4 rounded-xl border flex justify-between items-center transition-all cursor-pointer ${
                    g.done 
                      ? 'bg-[#10B981]/5 border-[#10B981]/30 text-stone-100 shadow-inner' 
                      : 'bg-[#080d19] border-stone-850 text-stone-300 hover:border-teal-500/20'
                  }`}
                >
                  <span className={`text-[12.5px] font-medium font-serif leading-relaxed ${g.done ? 'line-through text-stone-500' : ''}`}>
                    {lang === 'pt' ? g.titlePt : g.titleEn}
                  </span>
                  
                  <div className={`w-5.5 h-5.5 rounded-lg border flex items-center justify-center shrink-0 ${
                    g.done ? 'bg-[#10B981] border-transparent text-[#080b14]' : 'border-stone-700 bg-transparent'
                  }`}>
                    <Check className="w-3.5 h-3.5 stroke-[3.5]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* COMPLEMENTARY CHANNELS */}
        <div className="col-span-12 md:col-span-5 space-y-6">
          <div className="p-6 rounded-[2rem] bg-[#0c1221]/80 border border-[#1b2641] space-y-4">
            <h4 className="font-serif font-bold text-sm text-stone-100 tracking-wide uppercase text-teal-400">
              {lang === 'pt' ? 'Atalhos Livres de Estresse' : 'Secure Launch Controllers'}
            </h4>

            <button
              onClick={() => onNavigateToScreen('chat')}
              className="w-full p-4 hover:bg-teal-500/5 bg-[#080d19] border border-stone-850 rounded-xl flex justify-between items-center transition-all cursor-pointer group"
            >
              <div className="text-left">
                <p className="text-xs font-serif font-black text-stone-200">
                  {lang === 'pt' ? '💬 Linha Direta dr. evaldo' : '💬 Liner Dr. Evaldo Voice'}
                </p>
                <p className="text-[10px] text-stone-550 mt-0.5 font-light">Conversa focada sem menus complicados</p>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-600 group-hover:text-teal-400 group-hover:translate-x-1" />
            </button>

            <button
              onClick={() => onNavigateToScreen('refugio')}
              className="w-full p-4 hover:bg-purple-500/5 bg-[#080d19] border border-stone-850 rounded-xl flex justify-between items-center transition-all cursor-pointer group"
            >
              <div className="text-left">
                <p className="text-xs font-serif font-black text-stone-200">
                  {lang === 'pt' ? '📝 Diário de Palavras-Chave' : '📝 Bullet Reflection Logs'}
                </p>
                <p className="text-[10px] text-stone-550 mt-0.5 font-light">Escreva pouco e sintonize muito</p>
              </div>
              <ArrowRight className="w-4 h-4 text-stone-600 group-hover:text-purple-400 group-hover:translate-x-1" />
            </button>
          </div>

          <div className="p-5 rounded-2xl bg-[#090e18] border border-stone-900 text-left">
            <h5 className="text-[10px] uppercase tracking-wide font-mono font-black text-[#14b8a6]">
              {lang === 'pt' ? '🧠 Alinhamento Cognitivo' : '🧠 Cognitive Grounding'}
            </h5>
            <p className="text-[11px] text-stone-400 mt-2 leading-relaxed">
              {lang === 'pt' 
                ? 'Estruturas ordenadas mantêm as ideias focadas enquanto a navegação rítmica por rotinas acalma sua ansiedade.' 
                : 'Ordered structures keep ideas in place while routine timers prevent hyper-arousal.'}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
