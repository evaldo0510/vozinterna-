import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Moon, Zap, Waves, Star, Compass } from 'lucide-react';
import { Language } from '../types';

interface TuningPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  currentTuningId?: string;
  isLightTheme: boolean;
}

export const TuningPopover: React.FC<TuningPopoverProps> = ({
  isOpen,
  onClose,
  lang,
  currentTuningId = 'neutral',
  isLightTheme,
}) => {
  // Hardcoded keys matching getStateMetadata mapping logic
  const tId = (currentTuningId || 'neutral').toLowerCase();
  
  const getActiveKey = () => {
    if (tId.includes('low') || tId.includes('sad') || tId.includes('triste') || tId.includes('melanc') || tId.includes('heavy') || tId.includes('pesado') || tId.includes('confuso')) {
      return 'lunar';
    }
    if (tId.includes('anx') || tId.includes('accel') || tId.includes('anxio') || tId.includes('angr') || tId.includes('raiv') || tId.includes('irrit')) {
      return 'calma';
    }
    if (tId.includes('flow') || tId.includes('peace') || tId.includes('seren') || tId.includes('paz') || tId.includes('tranqu')) {
      return 'oceanica';
    }
    if (tId.includes('align') || tId.includes('hope') || tId.includes('conec') || tId.includes('esper') || tId.includes('estrel')) {
      return 'estelar';
    }
    return 'estavel';
  };

  const activeKey = getActiveKey();

  const concepts = [
    {
      key: 'lunar',
      icon: <Moon className="w-4 h-4 text-blue-400" />,
      titlePt: 'Sintonia Lunar ❄️',
      titleEn: 'Lunar Tuning ❄️',
      descPt: 'Frequência sintonizada para momentos de fadiga, tristeza ou névoa mental. É um convite ao recolhimento e respeito ao silêncio interior, sem cobranças ou pressas terapêuticas.',
      descEn: 'Tuning for periods of fatigue, sadness, or mental fog. An invitation to retreat and honor your inner silence, free from performance pressure or rush.',
      badgeStyle: 'border-blue-500/20 bg-blue-500/10 text-blue-400',
      activeBorder: 'border-blue-500 bg-blue-500/5 shadow-lg shadow-blue-500/5'
    },
    {
      key: 'calma',
      icon: <Zap className="w-4 h-4 text-orange-400" />,
      titlePt: 'Sintonia de Calma ⚡',
      titleEn: 'Calming Wave ⚡',
      descPt: 'Destinada a momentos de aceleração, raiva ou ansiedade aguda. O Dr. Evaldo adapta as falas PCH para desacelerar seu batimento, ancorando sua atenção em detalhes corporais imediatos.',
      descEn: 'Tailored for periods of racing thoughts, anger, or acute anxiety. Dr. Evaldo adapts the PCH guidance to soothe cardiac rate, anchoring focus back on the physical body.',
      badgeStyle: 'border-orange-500/20 bg-orange-500/10 text-orange-400',
      activeBorder: 'border-orange-500 bg-orange-500/5 shadow-lg shadow-orange-500/5'
    },
    {
      key: 'oceanica',
      icon: <Waves className="w-4 h-4 text-cyan-400" />,
      titlePt: 'Sintonia Oceânica 🌊',
      titleEn: 'Oceanic Wave 🌊',
      descPt: 'Reflete paz, serenidade e clareza contemplativa. Excelente frequência para consolidar aprendizados, praticar a quietude prazerosa e se manter plenamente conectado ao fluxo do agora.',
      descEn: 'Reflects tranquility, deep silence, and contemplative flow. Perfect frequency to secure learnings, enjoy calm presence, and sustain peaceful clarity.',
      badgeStyle: 'border-cyan-500/20 bg-cyan-500/10 text-cyan-400',
      activeBorder: 'border-cyan-500 bg-cyan-500/5 shadow-lg shadow-cyan-500/5'
    },
    {
      key: 'estelar',
      icon: <Star className="w-4 h-4 text-pink-400" />,
      titlePt: 'Ressonância Estelar ✨',
      titleEn: 'Stellar Resonance ✨',
      descPt: 'Frequência de espiritualidade aberta, esperança, sincronicidades e insights profundos. Ideal para momentos onde a alma busca expansão e percepção sutil do propósito existencial.',
      descEn: 'A state of open spirit, hope, synchronicity, and higher insights. Best for moments when you seek expansion, subtle inspiration, and alignment with your inner core.',
      badgeStyle: 'border-pink-500/20 bg-pink-500/10 text-pink-400',
      activeBorder: 'border-pink-500 bg-pink-500/5 shadow-lg shadow-pink-500/5'
    },
    {
      key: 'estavel',
      icon: <Compass className="w-4 h-4 text-teal-400" />,
      titlePt: 'Sintonia Estável ⛰️',
      titleEn: 'Stable Grounding ⛰️',
      descPt: 'Seu ponto neutro e sólido na Terra. Utilizada para restabelecer bases cognitivas firmes quando você não sabe explicar o que sente, oferecendo pragmatismo e segurança firme.',
      descEn: 'Your neutral, solid point on Earth. Used to rebuild structure and cognitive rest-zones when you cannot explain how you feel, granting grounding safety.',
      badgeStyle: 'border-teal-500/20 bg-teal-500/10 text-teal-400',
      activeBorder: 'border-teal-500 bg-teal-500/5 shadow-lg shadow-teal-500/5'
    }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div id="tuning-popover-portal" className="fixed inset-0 z-[200] flex items-center justify-center">
          {/* Backdrop blur with touch-to-dismiss behavior */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-stone-950/85 backdrop-blur-md cursor-pointer"
          />

          {/* Dialog Container */}
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: 'spring', damping: 26, stiffness: 220 }}
            className={`w-full max-w-lg mx-4 md:mx-auto rounded-[2rem] border overflow-hidden relative z-10 shadow-2xl flex flex-col ${
              isLightTheme 
                ? 'bg-[#FAF7F0] text-stone-800 border-stone-250' 
                : 'bg-[#0A1211] text-stone-100 border-[#142926]'
            }`}
          >
            {/* Soft decorative header pattern */}
            <div className={`p-6 border-b flex justify-between items-start ${
              isLightTheme ? 'border-stone-200' : 'border-[#122321]'
            }`}>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-teal-400 animate-[spin_4s_linear_infinite]" />
                  <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-teal-400 font-mono">
                    {lang === 'pt' ? 'O Mapa de Sintonias' : 'The Tuning Spectrum'}
                  </h3>
                </div>
                <h4 className="text-xl font-serif font-bold text-stone-100 dark:text-stone-100 dark:brightness-110">
                  {lang === 'pt' ? 'Como seu Santuário funciona?' : 'How your Sanctuary tunes?'}
                </h4>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-stone-800/40 text-stone-400 hover:text-stone-200 transition-all cursor-pointer border border-transparent hover:border-stone-800"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Spektrum Listings with scroll area to prevent overflow on very small devices */}
            <div className="p-5 overflow-y-auto max-h-[60vh] space-y-4">
              <p className={`text-xs font-light leading-relaxed mb-4 ${
                isLightTheme ? 'text-stone-500' : 'text-stone-450'
              }`}>
                {lang === 'pt' 
                  ? 'A Voz Interior adapta dinamicamente sons de fundo (ruído marinho, vento calmo, fogueiras) e o vocabulário hipnótico do guia aos seus sentimentos. Toque nos estados no card "O Espelho" da tela inicial para mudar sua sintonia ativamente.'
                  : 'Your Sanctuary dynamically shifts the guided pace, atmospheric loops (sea waves, ambient rain, soft fires) and therapeutic instructions according to your state.'}
              </p>

              {concepts.map((concept) => {
                const isActive = concept.key === activeKey;
                return (
                  <motion.div
                    key={concept.key}
                    whileHover={{ scale: 1.01 }}
                    className={`p-4 rounded-2xl border transition-all ${
                      isActive 
                        ? concept.activeBorder
                        : isLightTheme
                          ? 'border-stone-200/60 bg-stone-100/30'
                          : 'border-[#12221f]/50 bg-stone-900/15'
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${concept.badgeStyle}`}>
                          {concept.icon}
                        </div>
                        <span className="text-xs font-serif font-bold tracking-wide">
                          {lang === 'pt' ? concept.titlePt : concept.titleEn}
                        </span>
                      </div>

                      {isActive && (
                        <span className="text-[8px] uppercase tracking-widest font-mono font-bold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20 activePulse shadow-[#0F0]/10 shadow">
                          {lang === 'pt' ? 'Sua Sintonia Ativa' : 'Your Active Tune'}
                        </span>
                      )}
                    </div>

                    <p className={`text-[11px] leading-relaxed font-light ${
                      isLightTheme ? 'text-stone-600' : 'text-stone-400'
                    }`}>
                      {lang === 'pt' ? concept.descPt : concept.descEn}
                    </p>
                  </motion.div>
                );
              })}
            </div>

            {/* Bottom cta */}
            <div className={`p-4 border-t flex justify-end ${
              isLightTheme ? 'border-stone-200 bg-stone-100/40' : 'border-[#122321] bg-[#080d0d]'
            }`}>
              <button
                onClick={onClose}
                className="py-2 px-6 bg-teal-500 hover:bg-teal-400 text-[#091514] text-xs font-bold uppercase tracking-widest rounded-xl transition-all cursor-pointer active:scale-95"
              >
                {lang === 'pt' ? 'Compreendido' : 'Understood'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
