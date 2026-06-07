import React, { useState } from 'react';
import { User, Language } from '../types';
import { 
  Zap, 
  Play, 
  MessageSquare, 
  CheckCircle2, 
  Volume2, 
  Flame, 
  EyeOff, 
  Eye, 
  Sparkles,
  Award
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

export const HomeTDAH: React.FC<HomeViewProps> = ({
  user,
  lang,
  onNavigateToScreen,
  onAddToast,
}) => {
  // Focus Mode state (specifically requested to reduce distraction for ADHD)
  const [focusMode, setFocusMode] = useState(true);
  const [activeTask, setActiveTask] = useState<string>('');
  const [tasks, setTasks] = useState<string[]>([
    lang === 'pt' ? 'Respirar profundamente por 2 minutos 🌬️' : 'Deep coherent breathing for 2 minutes 🌬️',
    lang === 'pt' ? 'Conversar sobre meu pico de energia de hoje ⚡' : 'Converse about today’s peak energy levels ⚡',
    lang === 'pt' ? 'Escrever uma única frase sincera no Diário 📝' : 'Record a single raw sentence inside the Journal 📝'
  ]);
  const [completedCount, setCompletedCount] = useState(0);

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTask.trim()) return;
    setTasks(prev => [...prev, activeTask.trim()]);
    setActiveTask('');
    onAddToast({
      type: 'success',
      title: lang === 'pt' ? 'Meta criada! 🎯' : 'Habit seed registered! 🎯',
      description: lang === 'pt' ? 'Visualização limpa e direta para te apoiar.' : 'Clear visual cue generated to keep you oriented.'
    });
  };

  const handleCompleteTask = async (idxToRemove: number) => {
    setTasks(prev => prev.filter((_, idx) => idx !== idxToRemove));
    setCompletedCount(v => v + 1);
    
    onAddToast({
      type: 'level',
      title: lang === 'pt' ? 'Meta focada e batida! 🦾' : 'Hyper-focus trigger unlocked! 🦾',
      description: lang === 'pt' ? 'Energia canalizada com sucesso! +20 XP.' : 'Cognitive energy successfully channeled! +20 XP.'
    });

    if (user?.id && db) {
      try {
        const userDocRef = doc(db, 'users', user.id);
        await updateDoc(userDocRef, {
          points: (user.points || 0) + 20
        });
      } catch (err) {
        console.error("Failed to add points", err);
      }
    }
  };

  return (
    <div className="space-y-8 select-none">
      
      {/* HEADER CONTROLLER - ENCOURAGE HYPERFOCUS */}
      <div className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-full animate-pulse">
            <Zap className="w-6 h-6 stroke-[2]" />
          </div>
          <div className="text-left">
            <h3 className="font-serif font-black text-amber-300 text-lg uppercase tracking-wide">
              {lang === 'pt' ? 'Modulação TDAH Ativa ⚡' : 'ADHD Modulator Active ⚡'}
            </h3>
            <p className="text-[11px] text-stone-400 font-sans tracking-wide">
              {lang === 'pt' 
                ? 'Modo foco ativado por padrão. Menos texto, zero ruído, recompensas imediatas.' 
                : 'Focus mode calibrated. Less noise, zero visual pollution, instant feedback.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setFocusMode(!focusMode);
            onAddToast({
              type: 'success',
              title: focusMode ? 'Modo Livre Ativado 🌐' : 'Modo Foco Total Ativado 🎯',
              description: focusMode 
                ? 'Exibindo links secundários do seu santuário.' 
                : 'Minimizando distrações para seu cérebro focar no essencial.'
            });
          }}
          className={`py-2.5 px-5 rounded-full font-mono text-[10px] uppercase font-bold tracking-widest flex items-center gap-2 transition-all cursor-pointer ${
            focusMode 
              ? 'bg-amber-400 text-[#080b14]' 
              : 'bg-stone-900 border border-stone-800 text-amber-400 hover:bg-stone-850'
          }`}
        >
          {focusMode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          <span>{focusMode ? (lang === 'pt' ? 'Foco Total (Ativo)' : 'Pure Focus (On)') : (lang === 'pt' ? 'Expandir Tela' : 'Show All Elements')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* MAIN PANEL: DYNAMIC MICRO HABITS & CHAT ACTION */}
        <div className={`space-y-6 ${focusMode ? 'md:col-span-12' : 'md:col-span-8'}`}>
          
          <div className="p-8 rounded-[2.5rem] bg-[#0c1221] border border-[#1b2641] text-left relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <span className="text-[10px] font-mono tracking-widest text-[#14B8A6] uppercase font-black">
              {lang === 'pt' ? 'PASSO IMEDIATO' : 'NEXT STEP'}
            </span>
            <h2 className="text-2xl md:text-3xl font-serif text-stone-100 font-block mt-1">
              {lang === 'pt' ? 'O que te ancora no presente agora?' : 'What grounds your focus right now?'}
            </h2>
            <p className="text-xs text-stone-400 mt-2 font-light max-w-lg leading-relaxed">
              {lang === 'pt' 
                ? 'Não tente abraçar tudo de uma vez. Escolha uma ação rápida abaixo para liberar dopamina saudável.' 
                : 'Do not seek to process everything at once. Undertake a single micro-task below to stimulate natural focus.'}
            </p>

            {/* DYNAMIC Dopamine habit queue */}
            <div className="mt-6 space-y-3">
              <AnimatePresence>
                {tasks.map((t, idx) => (
                  <motion.div
                    key={t}
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ x: 100, opacity: 0 }}
                    className="p-4 bg-[#080d19]/80 border border-[#1d2744] hover:border-amber-500/40 transition-all rounded-2xl flex justify-between items-center group cursor-pointer"
                    onClick={() => handleCompleteTask(idx)}
                  >
                    <span className="text-sm font-medium font-serif text-stone-200 group-hover:text-amber-400 transition-colors">
                      {t}
                    </span>
                    <button className="p-2 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-stone-950 transition-all cursor-pointer">
                      <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>

              {tasks.length === 0 && (
                <div className="py-6 text-center text-stone-500 font-mono text-xs italic">
                  {lang === 'pt' 
                    ? '🎉 Todas as decolagens mentais concluídas! Crie mais focos rápidos abaixo.'
                    : '🎉 Mind queue cleared! Seed more rapid objectives below to maintain track.'}
                </div>
              )}
            </div>

            {/* Add meta-habit button form */}
            <form onSubmit={handleAddTask} className="mt-6 flex gap-2.5">
              <input
                type="text"
                placeholder={lang === 'pt' ? 'Adicionar canal de foco rápido...' : 'Seed urgent focal microtask...'}
                value={activeTask}
                onChange={e => setActiveTask(e.target.value)}
                className="flex-1 bg-[#090b14] border border-[#1c263f] focus:border-amber-500 text-stone-200 text-xs px-4.5 py-3 rounded-2xl focus:outline-none placeholder-stone-600 transition-colors"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-[#080b14] font-mono text-xs uppercase tracking-widest font-black rounded-2xl transition-colors shrink-0"
              >
                {lang === 'pt' ? 'Ativar' : 'Ignite'}
              </button>
            </form>
          </div>

          {/* CHAT/VOICE LAUNCHER SPECIAL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5.5">
            <div 
              onClick={() => onNavigateToScreen('chat')}
              className="p-7 rounded-[2rem] bg-[#0d1324] border-2 border-amber-500/30 hover:border-amber-500/80 hover:bg-amber-500/5 transition-all duration-300 flex flex-col justify-between min-h-[160px] cursor-pointer group text-left"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-amber-400">
                  ⚡ {lang === 'pt' ? 'HIPNOTERAPIA DE VOZ IP' : 'spoken dopamine'}
                </span>
                <MessageSquare className="w-5 h-5 text-amber-500 animate-pulse" />
              </div>
              <div>
                <h4 className="text-base font-serif font-black text-stone-100 group-hover:text-amber-300 transition-colors">
                  {lang === 'pt' ? 'Falar por Voz Ativa' : 'Activate Live Speaking'}
                </h4>
                <p className="text-[11px] text-stone-400 mt-1 font-sans">
                  {lang === 'pt' ? 'Descarregue o turbilhão mental. Dr. Evaldo escuta sem pausas.' : 'Empty your mental congestion instantly. Smooth feedback.'}
                </p>
              </div>
            </div>

            <div 
              onClick={() => onNavigateToScreen('sopro')}
              className="p-7 rounded-[2rem] bg-[#0d1324] border border-[#1e2a4a] hover:border-teal-500/50 transition-all duration-300 flex flex-col justify-between min-h-[160px] cursor-pointer group text-left"
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-teal-400">
                  🌬️ {lang === 'pt' ? 'FALAR MENOS, RESPIRAR CONCRETO' : 'instant slow breath'}
                </span>
                <Flame className="w-5 h-5 text-teal-400" />
              </div>
              <div>
                <h4 className="text-base font-serif font-black text-stone-100 group-hover:text-teal-300 transition-colors">
                  {lang === 'pt' ? 'Sopro Coerente Dinâmico' : 'Spontaneous Balloon Breath'}
                </h4>
                <p className="text-[11px] text-stone-400 mt-1 font-sans">
                  {lang === 'pt' ? 'Estímulo visual simples e rítmico para desacelerar o coração.' : 'A visual breathing sphere that realigns standard cardiac rhythms.'}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* SECONDARY PANELS - SHIELDED IN FOCUS MODE BUT VISIBLE IN EXPANDED MODE */}
        {!focusMode && (
          <div className="col-span-12 md:col-span-4 space-y-6 animate-fade-in text-left">
            <div className="p-6 rounded-[2rem] bg-[#0c1221] border border-[#1c263e] space-y-4">
              <h4 className="font-serif font-bold text-sm text-stone-100">
                {lang === 'pt' ? '📊 Status de Dopamina' : '📊 Concentration Level'}
              </h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-[10px] font-mono text-stone-400">
                  <span>{lang === 'pt' ? 'Sementes Germinadas:' : 'Stellar Seeds Planted:'}</span>
                  <span className="text-amber-400 font-bold">{completedCount}</span>
                </div>
                <div className="w-full h-1 bg-[#070b13] rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: `${Math.min(100, completedCount * 15)}%` }} />
                </div>
              </div>
              <p className="text-[11px] font-serif italic text-stone-400 leading-relaxed">
                {lang === 'pt' 
                  ? '"Completar micro-tarefas reconfigura o córtex pré-frontal de forma saudável."' 
                  : '"Accomplishing micro goals structures executive networks successfully."'}
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
