import React, { useState, useEffect } from 'react';
import { User, Language } from '../types';
import { 
  Heart, 
  Wind, 
  Smile, 
  Sparkles, 
  CheckCircle2, 
  RefreshCw, 
  MessageCircle, 
  VolumeX, 
  ShieldCheck,
  Feather
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

export const HomeAnsiedade: React.FC<HomeViewProps> = ({
  user,
  lang,
  onNavigateToScreen,
  onAddToast,
}) => {
  const [moodCheck, setMoodCheck] = useState<string | null>(null);
  const [comfortPhraseIdx, setComfortPhraseIdx] = useState(0);
  const [timerCount, setTimerCount] = useState(4);
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');

  // Grounding comforting phrases
  const comfortPhrases = [
    {
      pt: "Você está em segurança. Nada ruim está acontecendo aqui. Respire.",
      en: "You are fully safe right now. No harm resides in this room. Just drift and breathe."
    },
    {
      pt: "Cada batida do seu coração sabe exatamente como recuperar o ritmo de calma.",
      en: "Every heartbeat of yours knows exactly how to retrieve its natural cadence of peace."
    },
    {
      pt: "Pensamentos são como nuvens. Deixe-os passar. Seu porto seguro é este momento.",
      en: "Thoughts are nothing but summer clouds. Let them pass. Your secure port is now."
    },
    {
      pt: "Não há pressa ou expectativas das quais você precisa prestar contas hoje.",
      en: "There are no expectations or demands pressing you here today. Rest fully."
    }
  ];

  // Micro breathing pacer (4s Inhale, 4s Hold, 4s Exhale)
  useEffect(() => {
    const clock = setInterval(() => {
      setTimerCount(t => {
        if (t <= 1) {
          setBreathPhase(curr => {
            if (curr === 'inhale') return 'hold';
            if (curr === 'hold') return 'exhale';
            return 'inhale';
          });
          return 4;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(clock);
  }, []);

  const handleMoodCheckIn = async (mood: string) => {
    setMoodCheck(mood);
    onAddToast({
      type: 'success',
      title: lang === 'pt' ? 'Check-in Acolhido 💕' : 'Check-in Welcomed 💕',
      description: lang === 'pt' 
        ? 'Dr. Evaldo já sintonizou suas próximas palavras para te confortar.' 
        : 'Dr. Evaldo has adapted vocabulary frequencies to comfort you.'
    });

    if (user?.id && db) {
      try {
        const userDocRef = doc(db, 'users', user.id);
        await updateDoc(userDocRef, {
          emotionalState: mood,
          points: (user.points || 0) + 25
        });
      } catch (err) {
        console.error("Failed to write emotional check-in", err);
      }
    }
  };

  return (
    <div className="space-y-8 select-none text-left">
      
      {/* BREATHING GUIDANCE BANNER AT THE TOP */}
      <div className="p-7 rounded-[2.5rem] bg-gradient-to-r from-[#14b8a6]/15 via-[#0d1324] to-[#14b8a6]/5 border border-[#14b8a6]/30 relative overflow-hidden flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_left,_var(--tw-gradient-stops))] from-teal-500/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 bg-teal-500/20 text-teal-400 rounded-full flex items-center justify-center relative">
            <span className="absolute inset-0 bg-teal-500/10 rounded-full animate-ping" />
            <Wind className="w-6.5 h-6.5 stroke-[2]" />
          </div>
          <div>
            <span className="text-[9px] font-mono tracking-widest text-[#14B8A6] uppercase font-bold">
              {lang === 'pt' ? 'SOPRO DA VIDA' : 'LIFE ANCHOR BREATH'}
            </span>
            <h3 className="text-base font-serif font-black text-stone-100">
              {breathPhase === 'inhale' && (lang === 'pt' ? '🌬️ Inspire profundamente...' : '🌬️ Inhale deeply...')}
              {breathPhase === 'hold' && (lang === 'pt' ? '🎈 Segure com calma...' : '🎈 Hold gently...')}
              {breathPhase === 'exhale' && (lang === 'pt' ? '🍃 Solte devagar...' : '🍃 Exhale slowly...')}
            </h3>
            <p className="text-[11px] text-stone-400 font-sans tracking-wide mt-0.5">
              {lang === 'pt' ? `Acompanhe o ritmo por mais ${timerCount} segundos.` : `Pace your lungs for ${timerCount} more seconds.`}
            </p>
          </div>
        </div>

        <button 
          onClick={() => onNavigateToScreen('sopro')}
          className="w-full md:w-auto py-3 px-6 bg-teal-500 text-[#080b14] font-mono text-[10.5px] uppercase font-black tracking-widest rounded-2xl cursor-pointer hover:bg-teal-450 active:scale-98 shadow-md"
        >
          {lang === 'pt' ? 'Expandir Respiração' : 'Full Breathing Guide'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* EMOTIONAL CHECK-IN SECTION */}
        <div className="col-span-12 md:col-span-12 space-y-6">
          <div className="p-8 rounded-[2rem] bg-[#0c1221] border border-[#1b2641] space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#F59E0B]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-[#F59E0B] uppercase font-black">
                {lang === 'pt' ? 'CHECK-IN EMOCIONAL SEGURO' : 'SECURE WELLNESS CHECK-IN'}
              </span>
              <h4 className="text-xl md:text-2xl font-serif text-stone-100 font-bold block">
                {lang === 'pt' ? 'Como seu peito se sente ao respirar agora?' : 'How does your chest feel inside right now?'}
              </h4>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'comprimido', labelPt: 'Apertado/Preocupado 🫧', labelEn: 'Heavy / Constricted 🫧' },
                { id: 'agitado', labelPt: 'Com muitas ideias 🌀', labelEn: 'Racing Mind 🌀' },
                { id: 'cansado', labelPt: 'Exausto/Sem energia 🔋', labelEn: 'Fatigued / Low Energy 🔋' },
                { id: 'neutro', labelPt: 'Procurando âncora ⚓', labelEn: 'Seeking Anchor ⚓' }
              ].map((m) => {
                const isSelected = moodCheck === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleMoodCheckIn(m.id)}
                    className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-22 transition-all cursor-pointer ${
                      isSelected 
                        ? 'border-amber-500 bg-amber-500/5 text-amber-400' 
                        : 'border-stone-850 bg-[#080d19] text-stone-300 hover:border-amber-500/30'
                    }`}
                  >
                    <span className="text-xs font-serif font-black">{lang === 'pt' ? m.labelPt : m.labelEn}</span>
                    <span className="text-[8.5px] font-mono text-stone-500 uppercase">{isSelected ? 'Registrado' : 'Escolher'}</span>
                  </button>
                );
              })}
            </div>

            {/* COZY GROUNDING QUOTE PANEL */}
            <div className="p-5 rounded-2xl bg-[#090f1e] border border-amber-500/20 text-left relative flex justify-between items-center">
              <div className="space-y-1">
                <p className="text-stone-300 text-xs md:text-sm font-serif italic italic leading-relaxed">
                  "{lang === 'pt' ? comfortPhrases[comfortPhraseIdx].pt : comfortPhrases[comfortPhraseIdx].en}"
                </p>
                <span className="text-[8.5px] font-mono text-teal-400 uppercase tracking-widest">{lang === 'pt' ? '★ Mensagem de Apoio dr. evaldo' : '★ Doctor comforting code active'}</span>
              </div>
              <button 
                onClick={() => setComfortPhraseIdx(prev => (prev + 1) % comfortPhrases.length)}
                className="p-2 ml-4 rounded-xl bg-stone-900 border border-stone-850 text-amber-500 hover:bg-stone-850 cursor-pointer"
                title={lang === 'pt' ? 'Mudar frase' : 'Next comforting suggestion'}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ACCESS DOCK */}
        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 gap-5.5">
          <div 
            onClick={() => onNavigateToScreen('chat')}
            className="p-7 rounded-[2rem] bg-[#0d1324] border border-amber-500/20 hover:border-amber-500/50 hover:bg-amber-500/5 transition-all duration-300 cursor-pointer text-left group flex items-start gap-4"
          >
            <div className="p-3 bg-[#F59E0B]/10 border border-[#F59E0B]/20 text-amber-500 rounded-2xl">
              <Feather className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-[#F59E0B] uppercase font-bold tracking-widest">Sussurro seguro</span>
              <h4 className="text-base font-serif font-black text-stone-100 group-hover:text-amber-400 mt-1 leading-tight">Mural de VozAtiva</h4>
              <p className="text-[11px] text-stone-400 leading-normal font-light mt-0.5">Fale qualquer angústia. Ela é processada e instantaneamente acolhida.</p>
            </div>
          </div>

          <div 
            onClick={() => onNavigateToScreen('refugio')}
            className="p-7 rounded-[2rem] bg-[#0d1324] border border-[#1e2a4a] hover:border-teal-500/40 hover:bg-[#14b8a6]/5 transition-all duration-300 cursor-pointer text-left group flex items-start gap-4"
          >
            <div className="p-3 bg-teal-500/10 border border-teal-500/20 text-teal-400 rounded-2xl">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[9px] font-mono text-[#14B8A6] uppercase font-bold tracking-widest">Registros de calma</span>
              <h4 className="text-base font-serif font-black text-stone-100 group-hover:text-teal-300 mt-1 leading-tight">Escrita de Refúgio</h4>
              <p className="text-[11px] text-stone-400 leading-normal font-light mt-0.5">Sua mente no papel. Sem julgamentos ou corretores ortográficos impessoais.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
