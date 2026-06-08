import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BookOpen, Sparkles, Feather, Eye, Compass, Anchor, ArrowLeft } from 'lucide-react';
import { User, Language } from '../types';
import { TelaRefugio } from './TelaRefugio';
import { EspelhoView } from './EspelhoView';
import { SoproBalloonView } from './SoproBalloonView';

interface RefletirViewProps {
  user: User;
  lang: Language;
  isLightTheme: boolean;
  onAddToast: (toast: { type: string; title: string; description: string }) => void;
}

type RefletirSection = 'menu' | 'diario' | 'espelho' | 'sopro';

export const RefletirView: React.FC<RefletirViewProps> = ({
  user,
  lang,
  isLightTheme,
  onAddToast,
}) => {
  const [activeSection, setActiveSection] = useState<RefletirSection>('menu');

  const textPrimary = isLightTheme ? 'text-stone-850 text-stone-800' : 'text-stone-100';
  const textSecondary = isLightTheme ? 'text-stone-600' : 'text-stone-300';
  const cardBg = isLightTheme ? 'bg-white border-stone-200/80 shadow-sm' : 'bg-stone-900/40 border-stone-800/80';
  const containerBg = isLightTheme ? 'bg-[#FCFBF9]' : 'bg-[#080B14]';

  return (
    <div className={`w-full min-h-full pb-24 transition-colors duration-500 overflow-x-hidden ${containerBg}`}>
      <AnimatePresence mode="wait">
        {activeSection === 'menu' && (
          <motion.div
            key="menu"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
            className="max-w-4xl mx-auto px-6 pt-8 space-y-8"
          >
            {/* Header section with poetic intro */}
            <div className="space-y-2 text-left">
              <div className="flex items-center gap-1.5 text-xs text-teal-400 font-mono tracking-widest uppercase">
                <Feather className="w-3.5 h-3.5" />
                <span>{lang === 'pt' ? 'Templo da Mente' : 'Temple of Mind'}</span>
              </div>
              <h2 className={`text-2xl md:text-3xl font-serif font-black ${textPrimary}`}>
                {lang === 'pt' ? 'Espaço de Reflexão' : 'Space for Reflection'}
              </h2>
              <p className={`text-xs md:text-sm font-light leading-relaxed tracking-wide ${textSecondary}`}>
                {lang === 'pt'
                  ? 'Reserve um momento de silêncio para olhar para si mesmo sem julgamentos. Escolha a prática que mais ressoa com o seu presente.'
                  : 'Take a quiet moment to look inward without judgment. Select the practice that best resonates with your present state.'}
              </p>
            </div>

            {/* Three beautiful organic choice cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
              
              {/* Card 1: Diário / Caderno Vivo */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveSection('diario')}
                className={`p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer group flex flex-col justify-between min-h-[220px] ${cardBg} hover:border-amber-500/30`}
              >
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/10 text-amber-500">
                    <Feather className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-mono font-bold uppercase text-amber-500 bg-amber-500/10 px-2.5 py-0.5 rounded-full">
                    {lang === 'pt' ? 'SILÊNCIO' : 'SILENCE'}
                  </span>
                </div>
                <div className="mt-4 text-left space-y-1">
                  <h3 className={`text-base font-serif font-bold ${textPrimary}`}>
                    {lang === 'pt' ? '📝 Caderno Vivo' : '📝 Living Journal'}
                  </h3>
                  <p className={`text-[11px] leading-relaxed font-light ${textSecondary}`}>
                    {lang === 'pt'
                      ? 'Escreva livremente com âncoras poéticas diárias e o modo de foco profundo.'
                      : 'Write freely with dynamic seasonal prompts and integrated deep focus modes.'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-amber-500 font-bold font-mono uppercase tracking-wider pt-3 border-t border-stone-800/10 mt-3">
                  <span>{lang === 'pt' ? 'Escrever pensamento' : 'Open Notebook'}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </motion.div>

              {/* Card 2: Espelho Emocional */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveSection('espelho')}
                className={`p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer group flex flex-col justify-between min-h-[220px] ${cardBg} hover:border-teal-500/30`}
              >
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-2xl bg-[#14B8A6]/10 border border-[#14B8A6]/10 text-[#14B8A6]">
                    <Compass className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-mono font-bold uppercase text-[#14B8A6] bg-[#14B8A6]/10 px-2.5 py-0.5 rounded-full">
                    {lang === 'pt' ? 'SINTONIA' : 'RESONANCE'}
                  </span>
                </div>
                <div className="mt-4 text-left space-y-1">
                  <h3 className={`text-base font-serif font-bold ${textPrimary}`}>
                    {lang === 'pt' ? '🔮 Espelho Interno' : '🔮 Emotion Mirror'}
                  </h3>
                  <p className={`text-[11px] leading-relaxed font-light ${textSecondary}`}>
                    {lang === 'pt'
                      ? 'Identifique o seu tempo climático interior e sintonize-se com metáforas curativas.'
                      : 'Map your internal weather patterns and realign your mind with healing metaphors.'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-[#14B8A6] font-bold font-mono uppercase tracking-wider pt-3 border-t border-stone-800/10 mt-3">
                  <span>{lang === 'pt' ? 'Calibrar emoção' : 'Check Mirror'}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </motion.div>

              {/* Card 3: Sopro Coerente */}
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setActiveSection('sopro')}
                className={`p-6 rounded-[2rem] border transition-all duration-300 cursor-pointer group flex flex-col justify-between min-h-[220px] ${cardBg} hover:border-purple-500/30`}
              >
                <div className="flex justify-between items-start">
                  <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/10 text-purple-400">
                    <Anchor className="w-5 h-5" />
                  </div>
                  <span className="text-[9px] font-mono font-bold uppercase text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full">
                    {lang === 'pt' ? 'PULSAÇÃO' : 'BREATH'}
                  </span>
                </div>
                <div className="mt-4 text-left space-y-1">
                  <h3 className={`text-base font-serif font-bold ${textPrimary}`}>
                    {lang === 'pt' ? '🌬️ Sopro Coerente' : '🌬️ Coherent Breath'}
                  </h3>
                  <p className={`text-[11px] leading-relaxed font-light ${textSecondary}`}>
                    {lang === 'pt'
                      ? 'Exercício de respiração cardiopulmonar guiado por um balão e paisagens relaxantes.'
                      : 'Rhythmic deep breathing with responsive visual balloon feedback loops.'}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-[9px] text-purple-400 font-bold font-mono uppercase tracking-wider pt-3 border-t border-stone-800/10 mt-3">
                  <span>{lang === 'pt' ? 'Iniciar respiração' : 'Breathe Now'}</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </motion.div>

            </div>
          </motion.div>
        )}

        {/* Dynamic Inner Subviews */}
        {activeSection === 'diario' && (
          <motion.div
            key="diario"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full relative"
          >
            <div className="max-w-4xl mx-auto px-4 pt-4">
              <button
                onClick={() => setActiveSection('menu')}
                className={`px-4 py-2 text-xs font-mono tracking-widest uppercase flex items-center gap-2 cursor-pointer transition-all ${textSecondary} hover:text-amber-500`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{lang === 'pt' ? 'Voltar para Práticas' : 'Back to Practices'}</span>
              </button>
            </div>
            <TelaRefugio onClose={() => setActiveSection('menu')} lang={lang} user={user} />
          </motion.div>
        )}

        {activeSection === 'espelho' && (
          <motion.div
            key="espelho"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full relative"
          >
            <div className="max-w-4xl mx-auto px-4 pt-4">
              <button
                onClick={() => setActiveSection('menu')}
                className={`px-4 py-2 text-xs font-mono tracking-widest uppercase flex items-center gap-2 cursor-pointer transition-all ${textSecondary} hover:text-teal-400`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{lang === 'pt' ? 'Voltar para Práticas' : 'Back to Practices'}</span>
              </button>
            </div>
            <div className="max-w-4xl mx-auto">
              <EspelhoView
                user={user}
                lang={lang}
                onBack={() => setActiveSection('menu')}
                onAddToast={onAddToast}
              />
            </div>
          </motion.div>
        )}

        {activeSection === 'sopro' && (
          <motion.div
            key="sopro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full relative"
          >
            <div className="max-w-4xl mx-auto px-4 pt-4">
              <button
                onClick={() => setActiveSection('menu')}
                className={`px-4 py-2 text-xs font-mono tracking-widest uppercase flex items-center gap-2 cursor-pointer transition-all ${textSecondary} hover:text-purple-400`}
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{lang === 'pt' ? 'Voltar para Práticas' : 'Back to Practices'}</span>
              </button>
            </div>
            <SoproBalloonView onClose={() => setActiveSection('menu')} lang={lang} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RefletirView;
