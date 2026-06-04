import React, { useState } from 'react';
import { Language, User } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Sparkles, HeartPulse } from 'lucide-react';

interface DailyCheckInModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  lang: Language;
  onAddToast: (toast: { type: string; title: string; description: string }) => void;
}

const CHECKIN_OPTIONS = [
  { id: 'low', labelPt: '😔 Melancólico', labelEn: '😔 Low Energy', score: 45, descPt: 'Baixa energia, cansado ou sensível.', descEn: 'Low energy, tired or sensitive.' },
  { id: 'anxious', labelPt: '🌀 Ansioso', labelEn: '🌀 Anxious', score: 60, descPt: 'Mente acelerada, tenso ou inquieto.', descEn: 'Fast mind, tense or restless.' },
  { id: 'neutral', labelPt: '⛰️ Estável', labelEn: '⛰️ Stable', score: 75, descPt: 'Neutro, centrado e seguro.', descEn: 'Neutral, centered and grounded.' },
  { id: 'flowing', labelPt: '🌊 Sereno', labelEn: '🌊 Serene', score: 88, descPt: 'Tranquilo, calmo e presente.', descEn: 'Tranquil, calm and present.' },
  { id: 'aligned', labelPt: '✨ Alinhado', labelEn: '✨ Aligned', score: 98, descPt: 'Altamente conectado e focado.', descEn: 'Highly connected and focused.' }
];

export const DailyCheckInModal: React.FC<DailyCheckInModalProps> = ({
  isOpen,
  onClose,
  user,
  lang,
  onAddToast
}) => {
  const [selectedOption, setSelectedOption] = useState<string>('neutral');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const chosen = CHECKIN_OPTIONS.find(o => o.id === selectedOption) || CHECKIN_OPTIONS[2];
    
    const todayDateStr = new Date().toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { 
      day: '2-digit', 
      month: '2-digit' 
    });

    const currentHistory = user.resonanceHistory || [];
    // Append or replace today's checkpoint entry
    const newHistory = [...currentHistory.filter(item => item.date !== todayDateStr), { 
      date: todayDateStr, 
      score: chosen.score 
    }];

    const oldPoints = user.points || 0;
    const newPoints = oldPoints + 20; // 20 XP reward points
    const oldLevel = user.level || 1;
    const newLevel = Math.floor(newPoints / 100) + 1;

    try {
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        resonanceScore: chosen.score,
        resonanceHistory: newHistory,
        emotionalState: chosen.id,
        points: newPoints,
        level: newLevel,
        lastActive: new Date().toISOString()
      });

      // Save locally to avoid repeating checkin today
      const todayKey = new Date().toISOString().split('T')[0];
      localStorage.setItem(`pch_last_check_in_date_${user.id}`, todayKey);

      onAddToast({
        type: 'session',
        title: lang === 'pt' ? 'Check-in Realizado! 🌿' : 'Check-in Complete! 🌿',
        description: lang === 'pt' ? `Ressonância de hoje sincronizada em ${chosen.score}%. (+20 XP)` : `Today's resonance synchronized at ${chosen.score}%. (+20 XP)`
      });

      if (newLevel > oldLevel) {
        onAddToast({
          type: 'level',
          title: lang === 'pt' ? 'Evolução de Nível! 🎉' : 'Level Up! 🎉',
          description: lang === 'pt' ? `Parabéns! Você alcançou o Nível ${newLevel}!` : `Congratulations! You reached Level ${newLevel}!`
        });
      }

      onClose();
    } catch (err) {
      console.error('Failed to register checkin:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-950/95 backdrop-blur-md z-[150] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md bg-stone-900/60 border border-stone-800/80 rounded-3xl p-6 relative flex flex-col shadow-2xl select-none"
      >
        <div className="absolute top-0 inset-x-0 h-24 bg-gradient-to-b from-teal-500/5 to-transparent pointer-events-none rounded-3xl" />
        
        {/* Modal Top Header */}
        <div className="flex items-center space-x-3 mb-6 relative">
          <div className="w-10 h-10 rounded-full bg-teal-950/40 border border-teal-500/20 flex items-center justify-center text-teal-400">
            <HeartPulse className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <span className="text-[9px] uppercase tracking-[0.25em] text-teal-400 font-bold font-mono">
              {lang === 'pt' ? 'Sintonização Diária' : 'Daily Tuning'}
            </span>
            <h2 className="font-serif text-lg tracking-wide text-stone-200">
              {lang === 'pt' ? 'Como você se sente agora?' : 'How are you feeling now?'}
            </h2>
          </div>
        </div>

        {/* Emotion Options Cards Grid */}
        <div className="space-y-2.5 max-h-[46vh] overflow-y-auto pr-1 scrollbar-thin">
          {CHECKIN_OPTIONS.map((opt) => {
            const isSelected = selectedOption === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedOption(opt.id)}
                className={`w-full p-4 rounded-2xl border text-left flex items-start space-x-3 transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-teal-950/20 border-teal-500 text-stone-100 shadow-md shadow-teal-500/5'
                    : 'bg-stone-900/10 border-stone-850/60 text-stone-400 hover:text-stone-200 hover:border-stone-700'
                }`}
              >
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-xs text-stone-200">
                      {lang === 'pt' ? opt.labelPt : opt.labelEn}
                    </span>
                    <span className="text-[10px] font-mono text-teal-400/80">
                      {opt.score}%
                    </span>
                  </div>
                  <p className="text-[9px] text-stone-500 font-light mt-1">
                    {lang === 'pt' ? opt.descPt : opt.descEn}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Submit action button */}
        <div className="pt-6 border-t border-stone-800/40 mt-6 flex flex-col space-y-2">
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3 bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md shadow-teal-500/10 active:scale-[0.98] disabled:opacity-30 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isSubmitting 
                ? (lang === 'pt' ? 'Sincronizando...' : 'Synchronizing...') 
                : (lang === 'pt' ? 'Registrar Ressonância' : 'Submit Tuning')}
            </span>
          </button>
          
          <p className="text-[8.5px] text-center text-stone-600 font-mono">
            {lang === 'pt' 
              ? 'Métricas geradas calibram o canal da Poesia Cognitiva Hipnótica.' 
              : 'Generated metrics calibrate your cognitive hypnotic feedback loops.'}
          </p>
        </div>
      </motion.div>
    </div>
  );
};
