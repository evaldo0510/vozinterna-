import React, { useState, useEffect } from 'react';
import { User, Language } from '../types';
import { 
  Check, 
  MapPin, 
  AlertCircle, 
  BookOpen, 
  MessageSquare, 
  HelpCircle, 
  Anchor, 
  Hourglass, 
  Sliders
} from 'lucide-react';
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

export const HomeAutismo: React.FC<HomeViewProps> = ({
  user,
  lang,
  onNavigateToScreen,
  onAddToast,
}) => {
  // Previsibilidade e Sequência de Rotina do Dia
  const [activeStep, setActiveStep] = useState(0);
  const [stepsCompleted, setStepsCompleted] = useState<boolean[]>([false, false, false, false]);

  const routine = [
    { 
      id: 0, 
      time: "08:00", 
      titlePt: "🌱 Sintonização Matinal (Breve Foco)", 
      titleEn: "🌱 Morning Calibration (Gentle Focus)",
      descPt: "Um breve alongamento consciente ou check-in no santuário.",
      descEn: "A short conscious breathing space inside your secure refuge."
    },
    { 
      id: 1, 
      time: "14:00", 
      titlePt: "🌬️ Exercício de Expiração Coerente", 
      titleEn: "🌬️ Coherent Slow Breath Space",
      descPt: "3 ciclos de respiração lenta para recalibrar o sistema nervoso.",
      descEn: "3 repetitions of slow diaphragmatic pacing to rest."
    },
    { 
      id: 2, 
      time: "19:00", 
      titlePt: "📝 Ancoragem Escrita de Palavras", 
      titleEn: "📝 Emotional Anchoring Journal",
      descPt: "Registrar um único fato concreto que aconteceu no seu dia.",
      descEn: "Write down some exact physical factual details of the surroundings."
    },
    { 
      id: 3, 
      time: "21:30", 
      titlePt: "💬 Diálogo com Dr. Evaldo", 
      titleEn: "💬 Conversing with Dr. Evaldo (Routine Feedback)",
      descPt: "Falar ou escrever em ritmo lento e previsível para dormir em paz.",
      descEn: "Spoken or written suggestions in a structured pacing before rest."
    }
  ];

  const handleCompleteStep = async (id: number) => {
    const nextCompleted = [...stepsCompleted];
    nextCompleted[id] = !nextCompleted[id];
    setStepsCompleted(nextCompleted);

    if (nextCompleted[id]) {
      onAddToast({
        type: 'success',
        title: lang === 'pt' ? 'Etapa Registrada ☘️' : 'Routine Step Validated ☘️',
        description: lang === 'pt' ? 'Progresso previsível cultivado com sucesso no seu tempo.' : 'Routine step consolidated into your inner growth.'
      });

      if (user?.id && db) {
        try {
          const userDocRef = doc(db, 'users', user.id);
          await updateDoc(userDocRef, {
            points: (user.points || 0) + 15
          });
        } catch (err) {
          console.error("Failed to add points", err);
        }
      }
    }
  };

  return (
    <div className="space-y-8 select-none text-left">
      
      {/* EXPLICIT SAFETY BAR - ZERO ANIMATIONS */}
      <div className="p-6.5 rounded-2xl bg-teal-950/20 border border-teal-500/30 flex items-start gap-4">
        <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl">
          <Anchor className="w-5.5 h-5.5 stroke-[2.5]" />
        </div>
        <div className="space-y-1">
          <h3 className="font-serif font-black text-teal-400 text-sm uppercase tracking-wider">
            {lang === 'pt' ? 'Santuário de Previsibilidade Ativado 🧩' : 'Predictability Sanctuary Configured 🧩'}
          </h3>
          <p className="text-[11.5px] text-stone-400 leading-relaxed max-w-2xl font-light">
            {lang === 'pt' 
              ? 'Animações foram reduzidas ao mínimo, cores limpas e um roteiro estruturado guiam cada ação. Sem imprevistos ou surpresas na tela.' 
              : 'Layout motion has been simplified to zero, high-contrast clean flat colors and timeline grids guide your actions.'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* TIMELINE COLUMN - STRUCTURE & PREDICTABILITY */}
        <div className="col-span-12 md:col-span-7 space-y-5">
          <div className="p-6.5 rounded-[2rem] bg-[#0c1221] border border-[#1a253f] space-y-5">
            <div>
              <span className="text-[9px] font-mono tracking-widest text-teal-400 uppercase font-black">
                {lang === 'pt' ? 'ROTEIRO VISUAL DO DIA PCH' : 'DAILY VISUAL TIMELINE'}
              </span>
              <h4 className="text-lg font-serif font-bold text-stone-100 mt-1">
                {lang === 'pt' ? 'Cronograma Espacial Saudável' : 'Your Grounded Path'}
              </h4>
              <p className="text-xs text-stone-400 mt-0.5">
                {lang === 'pt' ? 'Uma sequência imutável de autocuidado com tempos sugeridos.' : 'A fixed sequence of comforting sensory events.'}
              </p>
            </div>

            {/* List of Static Predictable Steps */}
            <div className="space-y-4">
              {routine.map((step) => {
                const isDone = stepsCompleted[step.id];
                return (
                  <div 
                    key={step.id}
                    onClick={() => handleCompleteStep(step.id)}
                    className={`p-4 rounded-xl border flex gap-4 items-start transition-all cursor-pointer ${
                      isDone 
                        ? 'bg-teal-500/5 border-teal-500/40 text-stone-100' 
                        : 'bg-[#080d19] border-stone-850 text-stone-400 hover:border-teal-500/20'
                    }`}
                  >
                    <div className="p-1.5 bg-stone-900 border border-stone-850 font-mono text-[9.5px] tracking-wider text-teal-400 font-bold rounded-lg shrink-0">
                      {step.time}
                    </div>
                    <div className="flex-1 space-y-0.5 text-left">
                      <p className={`text-xs font-serif font-black ${isDone ? 'text-teal-400' : 'text-stone-200'}`}>
                        {lang === 'pt' ? step.titlePt : step.titleEn}
                      </p>
                      <p className="text-[11px] text-stone-500 font-light leading-relaxed">
                        {lang === 'pt' ? step.descPt : step.descEn}
                      </p>
                    </div>
                    <div className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-colors ${
                      isDone ? 'bg-teal-500 border-transparent text-[#080b14]' : 'border-stone-700 bg-transparent'
                    }`}>
                      <Check className="w-4 h-4 stroke-[3.5]" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CONTROLS LAUNCHER COLUMN - FAST ACCESS */}
        <div className="col-span-12 md:col-span-5 space-y-6">
          
          {/* SECURE TOOLS CARD */}
          <div className="p-6 rounded-[2rem] bg-[#0c1221] border border-[#1a253f] space-y-4">
            <h4 className="font-serif font-bold text-sm text-stone-100">
              {lang === 'pt' ? 'Atalhos de Comunicação Limpa' : 'Clean Interaction Portals'}
            </h4>
            
            <button
              onClick={() => onNavigateToScreen('chat')}
              className="w-full p-4 hover:bg-teal-500/5 bg-[#080d19] border border-stone-850 hover:border-teal-500/40 text-left rounded-xl flex items-center justify-between transition-colors cursor-pointer group"
            >
              <div className="flex gap-3 items-center">
                <div className="p-2 bg-stone-900 border border-stone-850 rounded-lg text-teal-400">
                  <MessageSquare className="w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-serif font-black text-stone-200">
                    {lang === 'pt' ? 'Canal de Conversa Linear' : 'Linear Chat Channel'}
                  </p>
                  <p className="text-[10px] text-stone-500 font-light mt-0.5">
                    {lang === 'pt' ? 'Feedback textual ou falado sem ruídos' : 'Voice or text feedback with Dr. Evaldo'}
                  </p>
                </div>
              </div>
              <Hourglass className="w-4 h-4 text-stone-600 group-hover:text-teal-400" />
            </button>

            <button
              onClick={() => onNavigateToScreen('refugio')}
              className="w-full p-4 hover:bg-purple-500/5 bg-[#080d19] border border-stone-850 hover:border-purple-500/40 text-left rounded-xl flex items-center justify-between transition-colors cursor-pointer group"
            >
              <div className="flex gap-3 items-center">
                <div className="p-2 bg-stone-900 border border-stone-850 rounded-lg text-purple-400">
                  <BookOpen className="w-4.5 h-4.5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-serif font-black text-stone-200">
                    {lang === 'pt' ? 'Registrar meu Diário Factual' : 'Write Journal entries'}
                  </p>
                  <p className="text-[10px] text-stone-500 font-light mt-0.5">
                    {lang === 'pt' ? 'Guardar minhas rotinas de progresso' : 'Log precise concrete thoughts'}
                  </p>
                </div>
              </div>
              <Hourglass className="w-4 h-4 text-stone-600 group-hover:text-purple-400" />
            </button>
          </div>

          {/* SENSORY SHIELD INFO */}
          <div className="p-6 rounded-2xl bg-[#090e18] border border-stone-900 text-left">
            <h5 className="text-[10.5px] font-mono tracking-wider text-slate-500 uppercase block font-bold">
              {lang === 'pt' ? '🛡️ Blindagem Sensorial' : '🛡️ Sensory Shielding'}
            </h5>
            <p className="text-xs text-stone-400 mt-2 leading-relaxed">
              {lang === 'pt' 
                ? 'Neste perfil, as interações verbais utilizam frases mais diretas e literais, e o Dr. Evaldo evita perguntas ambíguas ou metáforas que causem confusão.' 
                : 'Under this profile Dr. Evaldo employs literal sentence processing and avoids ambiguous, metaphoric structures to aid focus.'}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
