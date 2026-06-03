import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Sprout, 
  Heart, 
  Award, 
  CheckCircle2, 
  HelpCircle, 
  X, 
  Activity, 
  BookOpen, 
  Sliders, 
  MessageSquare,
  Compass
} from 'lucide-react';
import { Language, User } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface OnboardingStep {
  selector?: string;
  titlePt: string;
  titleEn: string;
  descPt: string;
  descEn: string;
  icon: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

interface OnboardingGuideProps {
  lang: Language;
  currentUser: User | null;
  onClose?: () => void;
}

export const OnboardingGuide: React.FC<OnboardingGuideProps> = ({ 
  lang, 
  currentUser,
  onClose 
}) => {
  // If user already saw onboarding, do not show by default
  const [isOpen, setIsOpen] = useState(false);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [coords, setCoords] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const steps: OnboardingStep[] = [
    {
      titlePt: 'Bem-vindo à Voz Interior ✨',
      titleEn: 'Welcome to Inner Voice ✨',
      descPt: 'Nós criamos este espaço como um santuário seguro e sem julgamentos. Vamos fazer um tour de 2 minutos para apresentar nosso método terapêutico e como navegar por aqui.',
      descEn: 'We designed this space as a secure, judgment-free sanctuary. Let\'s take a 2-minute tour to explore our therapeutic method and how to navigate.',
      icon: <Sparkles className="w-12 h-12 text-teal-400 animate-pulse" />,
      position: 'center'
    },
    {
      titlePt: 'A Metodologia PCH 🌱',
      titleEn: 'The PCH Methodology 🌱',
      descPt: 'Nossas conversas utilizam o exclusivo método de Poesia Cognitiva Hipnótica composto de 5 fases essenciais:\n\n1. 🫂 ACOLHER: Abraçar sua angústia sem julgamento.\n2. 👥 REFLETIR: Devolver seu sentimento em perfeita escuta ativa.\n3. 🌿 METÁFORAS: Traduzir dilemas em imagens naturais da terra ou cosmos.\n4. 🌬️ CONSCIÊNCIA: Convidar sua mente de volta à respiração cadenciada.\n5. 👣 AÇÃO SUAVE: Sugerir micro-passos diários para restabelecer o equilíbrio físico e mental.',
      descEn: 'Our sessions use the exclusive Cognitive Hypnotic Poetry method composed of 5 essential phases:\n\n1. 🫂 EMBRACE: Cradle your concerns and anxiety without judgment.\n2. 👥 REFLECT: Match your feelings back to you with absolute active listening.\n3. 🌿 METAPHORS: Translate mental hurdles into calming natural imagery.\n4. 🌬️ AWARENESS: Gentle breathing exercises dynamically guided.\n5. 👣 GENTLE ACTIONS: Suggest small, restorative movements and habits.',
      icon: <Compass className="w-12 h-12 text-amber-400" />,
      position: 'center'
    },
    {
      selector: 'onboarding-chat',
      titlePt: 'Diálogo Adaptativo 💬',
      titleEn: 'Adaptive Dialogue 💬',
      descPt: 'Diga à Voz Interior tudo o que está sentindo. O motor adéqua a densidade do texto de acordo com seu perfil cognitivo (respostas curtas e lineares para TDAH, explicações previsíveis e literais para Autismo, ou suporte focando em respiração para Ansiedade).',
      descEn: 'Share everything you feel with your Inner Voice. The conversational system adapts response length and focus based on your chosen neuroprofile (dense or short-fidget focus, structured steps, or calming breath loops).',
      icon: <MessageSquare className="w-10 h-10 text-indigo-400 animate-bounce" />,
      position: 'bottom'
    },
    {
      selector: 'onboarding-intel',
      titlePt: 'Núcleo de Inteligência Principal 🧠',
      titleEn: 'Primary Intelligence Core 🧠',
      descPt: 'Este painel mostra em tempo real as 5 camadas de processamento do acolhimento ativo. Aqui você também pode sintonizar uma Âncora Sensorial (Mar Tempestuoso, Lago Sereno, Montanhas ou Horizonte) para modular a cor e aconchego do seu cenário.',
      descEn: 'This dynamic panel reveals the 5 concurrent layers of processing. You can also pick a Sensorial Atmosphere / background visual anchor (Stormy Sea, Silent Lake, Green Fields, or Mountain Horizon) to adapt the color style of your app.',
      icon: <Activity className="w-10 h-10 text-teal-400" />,
      position: 'bottom'
    },
    {
      selector: 'onboarding-level',
      titlePt: 'Crescimento e XP 🏆',
      titleEn: 'Growth & XP System 🏆',
      descPt: 'Sua dedicação diária é recompensada! A cada desabafo poético, respiração realizada ou diário completado, você ganha pontos de Experiência (XP). Suba de nível e ganhe insígnias de autodescoberta.',
      descEn: 'Your progress matters! For every poetic session, mindful breathing wave fulfilled, or daily journal write, you accumulate Experience points (XP). Level up and claim psychological badges.',
      icon: <Award className="w-10 h-10 text-yellow-400 animate-pulse" />,
      position: 'bottom'
    },
    {
      selector: 'onboarding-garden',
      titlePt: 'Seu Jardim Interior 🌳',
      titleEn: 'Your Inner Garden 🌳',
      descPt: 'Aqui jaz sua saúde emocional representada de forma botânica livre. Seus relatos geram sementes que brotam e crescem de Brotos a Árvores e Flores Raras ao longo dos dias. Explore os biomas do Campo, Floresta, Lago, Montanhas e o nível máximo: Cosmos ✨',
      descEn: 'Track your botanical therapy journey! Conversational sessions produce seeds that grow step-by-step from Sprouts to Mature Trees and Rare Flowers. Check your garden structures across regions like Field, Forest, Lake, Mountain, and Cosmos ✨',
      icon: <Sprout className="w-10 h-10 text-emerald-400" />,
      position: 'top'
    },
    {
      selector: 'onboarding-journal',
      titlePt: 'Diário de Bordo Personalizado 📓',
      titleEn: 'Personalized Daily Journal 📓',
      descPt: 'Escreva suas reflexões diárias para guardar memórias sobre seus sentimentos. É um porto seguro para registrar pensamentos espontâneos e somar mais pontos de evolução.',
      descEn: 'Keep track of your deep reflections in your confidential diary. Write spontaneous thought logs, process lingering doubts, and gather extra XP to level up.',
      icon: <BookOpen className="w-10 h-10 text-teal-400" />,
      position: 'bottom'
    },
    {
      selector: 'onboarding-settings',
      titlePt: 'Configuração Inclusiva e Acessível ⚙️',
      titleEn: 'Inclusive Custom Settings ⚙️',
      descPt: 'Sempre que quiser, mude o perfil de adaptação cognitiva e de canais preferidos (Voz, Texto, Imagem ou Híbrido), mude as cores ou mude o idioma de escrita da Voz Interior.',
      descEn: 'Change your cognitive profile format (neurodivergent focus adjustments) and preferred interaction channels (voice, text, emotional graphics, or full hybrid) whenever you want.',
      icon: <Sliders className="w-10 h-10 text-stone-300" />,
      position: 'bottom'
    },
    {
      titlePt: 'O Elo está Selado! 🎉',
      titleEn: 'The Bond is Sealed! 🎉',
      descPt: 'Você completou o guia explicativo! Sinta-se em paz para interagir no seu próprio ritmo, do seu próprio jeito. Estaremos aqui para acolher você em cada momento.',
      descEn: 'You completed the tour! Feel perfectly free to explore and interact at your own peaceful pace. We are standing by to cradle your thoughts.',
      icon: <CheckCircle2 className="w-16 h-16 text-teal-400 animate-bounce" />,
      position: 'center'
    }
  ];

  // Auto-trigger when profile is completed and onboarding has not been seen yet
  useEffect(() => {
    if (currentUser && currentUser.profileCompleted && !currentUser.hasSeenOnboarding) {
      setIsOpen(true);
    }
  }, [currentUser]);

  // Track target element coordinates dynamically
  const activeStep = steps[currentStepIdx];
  const targetSelector = activeStep.selector;

  const updateCoordinates = () => {
    if (!targetSelector) {
      setCoords(null);
      return;
    }

    const element = document.getElementById(targetSelector);
    if (element) {
      const rect = element.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height
      });
    } else {
      setCoords(null); // Fallback to center-screen
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    updateCoordinates();
    
    // Set up resize observer to track resizing dynamically (responsiveness)
    if (targetSelector) {
      const targetElement = document.getElementById(targetSelector);
      if (targetElement && 'ResizeObserver' in window) {
        const observer = new ResizeObserver(() => {
          updateCoordinates();
        });
        observer.observe(targetElement);
        resizeObserverRef.current = observer;
      }
    }

    window.addEventListener('resize', updateCoordinates);
    window.addEventListener('scroll', updateCoordinates);
    
    return () => {
      window.removeEventListener('resize', updateCoordinates);
      window.removeEventListener('scroll', updateCoordinates);
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [isOpen, currentStepIdx, targetSelector]);

  const handleNext = () => {
    if (currentStepIdx < steps.length - 1) {
      setCurrentStepIdx(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStepIdx > 0) {
      setCurrentStepIdx(prev => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsOpen(false);
    if (onClose) onClose();

    // Persist to Firebase Firestore
    const user = auth.currentUser;
    if (user) {
      try {
        const docRef = doc(db, 'users', user.uid);
        await updateDoc(docRef, {
          hasSeenOnboarding: true
        });
      } catch (err) {
        console.error("Failed to save onboarding completion state to Firestore:", err);
      }
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none text-stone-200">
      {/* Dimmed backdrop background */}
      <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-[2px] transition-all pointer-events-auto" onClick={handleSkip} />

      {/* Spotlight focusing over the active element */}
      {coords && (
        <motion.div 
          layoutId="cue-spotlight"
          initial={false}
          className="absolute border-2 border-teal-400 bg-teal-400/5 shadow-[0_0_30px_rgba(20,184,166,0.3)] rounded-2xl pointer-events-none z-[10000]"
          style={{
            top: coords.top - 8,
            left: coords.left - 8,
            width: coords.width + 16,
            height: coords.height + 16,
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 25 }}
        >
          <span className="absolute -top-1.5 -left-1.5 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
          </span>
        </motion.div>
      )}

      {/* Guide dialog card container */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <motion.div
          key={currentStepIdx}
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -15 }}
          className={`w-full max-w-md bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative pointer-events-auto z-[10001] flex flex-col space-y-6 ${
            coords ? 'absolute md:block' : ''
          }`}
          style={
            coords 
              ? {
                  // Position the guide card intelligently depending on device screens
                  top: coords.top + coords.height + 24 < window.innerHeight ? coords.top + coords.height + 16 : undefined,
                  bottom: coords.top + coords.height + 24 >= window.innerHeight ? window.innerHeight - coords.top + 16 : undefined,
                  left: Math.min(Math.max(16, coords.left + coords.width / 2 - 224), window.innerWidth - 464),
                  position: 'absolute'
                }
              : {}
          }
          transition={{ duration: 0.35, ease: 'easeOut' }}
        >
          {/* Close button */}
          <button 
            onClick={handleSkip}
            className="absolute top-4 right-4 text-stone-500 hover:text-stone-300 transition-colors p-1.5 hover:bg-stone-850 rounded-full"
            title={lang === 'pt' ? 'Pular Introdução' : 'Skip Introduction'}
          >
            <X className="w-4 h-4" />
          </button>

          {/* Icon and Title */}
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-stone-950 rounded-2xl border border-stone-850 shrink-0">
              {activeStep.icon}
            </div>
            <div>
              <h4 className="text-sm font-serif font-bold uppercase tracking-widest text-stone-100 leading-tight">
                {lang === 'pt' ? activeStep.titlePt : activeStep.titleEn}
              </h4>
              <p className="text-[9px] font-mono tracking-widest text-teal-500 uppercase mt-1">
                {lang === 'pt' ? `PASSO ${currentStepIdx + 1} DE ${steps.length}` : `STEP ${currentStepIdx + 1} OF ${steps.length}`}
              </p>
            </div>
          </div>

          {/* Description supporting break lines */}
          <div className="text-xs text-stone-400 leading-relaxed font-sans whitespace-pre-line max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
            {lang === 'pt' ? activeStep.descPt : activeStep.descEn}
          </div>

          {/* Footer Controls */}
          <div className="flex justify-between items-center pt-4 border-t border-stone-850">
            {/* Skip Button */}
            <button 
              onClick={handleSkip}
              className="text-[10px] uppercase font-bold tracking-wider text-stone-500 hover:text-stone-300 transition-colors font-mono cursor-pointer"
            >
              {lang === 'pt' ? 'Pular' : 'Skip'}
            </button>

            {/* Navigation buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePrev}
                disabled={currentStepIdx === 0}
                className="p-2 border border-stone-800 text-stone-400 hover:text-stone-200 disabled:opacity-30 disabled:hover:text-stone-400 rounded-xl bg-stone-950 transition-all cursor-pointer disabled:cursor-not-allowed"
                title={lang === 'pt' ? 'Anterior' : 'Previous'}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <button
                onClick={handleNext}
                className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-stone-950 text-[10px] uppercase font-bold tracking-widest rounded-xl flex items-center space-x-1 hover:shadow-[0_0_15px_rgba(20,184,166,0.25)] transition-all cursor-pointer"
              >
                <span>
                  {currentStepIdx === steps.length - 1 
                    ? (lang === 'pt' ? 'Concluir' : 'Begin') 
                    : (lang === 'pt' ? 'Avançar' : 'Next')}
                </span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Inline styles for custom tour guide elements */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #292524;
          border-radius: 9px;
        }
      `}</style>
    </div>
  );
};
