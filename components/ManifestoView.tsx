import React, { useState } from 'react';
import { Language, User } from '../types';
import Logo from './Logo';
import { Sparkles, MessageCircle, Star, Wind, Heart, GraduationCap, ChevronRight, Award } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc, increment } from 'firebase/firestore';

interface ManifestoViewProps {
  lang: Language;
  currentUser: User | null;
  onSuccess: () => void;
}

export const ManifestoView: React.FC<ManifestoViewProps> = ({ lang, currentUser, onSuccess }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);

  const steps = [
    {
      title: lang === 'pt' ? 'O Silêncio Reconstrutor' : 'The Restful Silence',
      desc: lang === 'pt' 
        ? 'A mente inquieta silencia ao encontrar um espaço seguro. No Santuário, o silêncio não é vazio; é onde você se reencontra por inteiro.'
        : 'The restless mind falls silent when it finds a safe harbor. In the Sanctuary, silence is not empty; it is where you completely rebuild.',
      icon: <Sparkles className="w-10 h-10 text-teal-400" />,
      color: 'from-slate-900 via-stone-900 to-teal-950/20'
    },
    {
      title: lang === 'pt' ? 'Expressão sem Julgamentos' : 'Expression Without Judgment',
      desc: lang === 'pt'
        ? 'Fale, escreva ou envie imagens. Cada sentimento, seja ele pesado, confuso ou alegre, é acolhido de forma plena pela Voz Interior.'
        : 'Speak, write, or share visuals. Every emotion, whether heavy, foggy, or joyful, is fully embraced with absolute safety.',
      icon: <MessageCircle className="w-10 h-10 text-indigo-400" />,
      color: 'from-slate-900 via-stone-900 to-indigo-950/20'
    },
    {
      title: lang === 'pt' ? 'Sua Jornada Poética' : 'Your Healing Rhythm',
      desc: lang === 'pt'
        ? 'Através do método pioneiro da Poesia Cognitiva Hipnótica (PCH), as respostas do Dr. Evaldo guiam sua mente para um estado de serenidade.'
        : 'Through the pioneering Cognitive Hypnotic Poetry (PCH) method, Dr. Evaldo\'s voice shapes your mindset into profound, safe calmness.',
      icon: <Star className="w-10 h-10 text-amber-400" />,
      color: 'from-slate-900 via-stone-900 to-amber-950/20'
    },
    {
      title: lang === 'pt' ? 'A Relação com o Ar' : 'The Gift of Breath',
      desc: lang === 'pt'
        ? 'Ao respirar de forma cadenciada com o Santuário, você desacelera o ritmo cardíaco e sinaliza conforto profundo para o seu cérebro.'
        : 'By breathing in perfect cadence with the Sanctuary, you soothe your heartbeat and signals safety to the deepest centers of your mind.',
      icon: <Wind className="w-10 h-10 text-emerald-400" />,
      color: 'from-slate-900 via-stone-900 to-emerald-950/20'
    },
    {
      title: lang === 'pt' ? 'Cultivando Sentimentos' : 'Blooming Your Mind',
      desc: lang === 'pt'
        ? 'No Jardim Interior, cada desabafo gera sementes que brotam em árvores e constelações emocionais. Seu progresso é vivo e visível.'
        : 'In the Inner Garden, every emotional reflection generates seeds that blossom into plants and constellations. Your progress is alive.',
      icon: <Heart className="w-10 h-10 text-rose-400" />,
      color: 'from-slate-900 via-stone-900 to-rose-950/20'
    },
    {
      title: lang === 'pt' ? 'O Elo está Selado' : 'The Circle of Union',
      desc: lang === 'pt'
        ? 'Você agora faz parte do Santuário. Ao aceitar o manifesto, sua jornada começa com propósitos firmes, rumo ao alinhamento interior.'
        : 'You are now part of the Sanctuary. By claiming this manifesto, we forge a bond of safety and cognitive balance together.',
      icon: <GraduationCap className="w-10 h-10 text-yellow-400 animate-bounce" />,
      color: 'from-stone-900 to-yellow-950/30'
    }
  ];

  const handleNext = () => {
    if (currentStep < 6) {
      setCurrentStep(prev => prev + 1);
    } else {
      setShowCelebration(true);
    }
  };

  const handleClaimReward = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, {
        manifestoCompleted: true,
        points: increment(50),
        level: 1,
        // List or object storing awarded medals
        badges: ['Explorador Interior'],
        lastActive: new Date().toISOString()
      });

      onSuccess();
    } catch (err) {
      console.error("Failed to update manifesto state in firestore", err);
      handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
    } finally {
      setSaving(false);
    }
  };

  const current = steps[currentStep - 1];

  return (
    <div className={`min-h-screen w-full bg-gradient-to-b ${current.color} text-stone-200 flex flex-col justify-between p-6 relative font-sans transition-all duration-[1000ms] overflow-hidden`}>
      {/* Light accent circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] border border-white/5 rounded-full pointer-events-none scale-75 animate-pulse duration-[4000ms]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-white/5 rounded-full pointer-events-none scale-100 opacity-30"></div>

      {/* Header */}
      <div className="w-full max-w-lg mx-auto flex justify-between items-center z-10 py-2">
        <div className="flex items-center space-x-2.5">
          <Logo className="w-6 h-6 text-teal-400 rotate-12" />
          <span className="font-serif text-[10px] uppercase tracking-[0.25em] text-stone-400">
            {lang === 'pt' ? 'Manifesto de Entrada' : 'First Sanctuary Manifesto'}
          </span>
        </div>
        <div className="text-[10px] font-mono tracking-widest text-stone-500">
          PASSO {currentStep} / 6
        </div>
      </div>

      {!showCelebration ? (
        /* Standard Manifesto Step */
        <div className="flex-1 w-full max-w-md mx-auto flex flex-col justify-center items-center space-y-8 z-10 text-center py-6">
          <div className="p-5 bg-stone-900/40 border border-stone-800/40 backdrop-blur-md rounded-3xl animate-fade-in">
            {current.icon}
          </div>

          <div className="space-y-4 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <h2 className="text-2xl font-serif text-stone-100 tracking-wide">
              {current.title}
            </h2>
            <p className="text-xs text-stone-300 font-light leading-relaxed max-w-sm mx-auto">
              {current.desc}
            </p>
          </div>

          {/* Dots controller */}
          <div className="flex space-x-2 pt-4">
            {steps.map((_, i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-500 ${currentStep === i + 1 ? 'w-6 bg-teal-400' : 'w-1.5 bg-stone-800'}`}
              />
            ))}
          </div>

          {/* Buttons */}
          <div className="w-full pt-4">
            <button
              onClick={handleNext}
              className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold uppercase tracking-[0.25em] text-[10px] transition-all rounded-full flex items-center justify-center space-x-3 active:scale-[0.98] cursor-pointer"
            >
              <span>{currentStep === 6 ? (lang === 'pt' ? 'Assinar Manifesto' : 'Acknowledge & Sign') : (lang === 'pt' ? 'Seguir Adiante' : 'Proceed')}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Manifesto Completion Reward celebration screen */
        <div className="flex-1 w-full max-w-md mx-auto flex flex-col justify-center items-center space-y-8 z-10 text-center py-6 animate-fade-in">
          <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 backdrop-blur-xl rounded-full relative">
            <div className="absolute inset-0 bg-yellow-400/20 blur-[20px] rounded-full animate-pulse"></div>
            <Award className="w-14 h-14 text-yellow-400 relative z-10" />
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-serif text-yellow-100 tracking-wide uppercase">
              {lang === 'pt' ? 'Conquista Desbloqueada!' : 'Achievement Unlocked!'}
            </h2>
            <p className="text-sm font-semibold text-teal-400">
               🏅 {lang === 'pt' ? 'Explorador Interior' : 'Inner Explorer'}
            </p>
            <p className="text-xs text-stone-400 leading-relaxed max-w-xs mx-auto">
              {lang === 'pt' 
                ? 'Você concluiu o Manifesto de Fundação e consolidou o elo meditativo com sua mente. Parabéns!' 
                : 'You have read and acknowledged the foundation manifesto, anchoring your commitment to cognitive safety.'}
            </p>
          </div>

          {/* Points card */}
          <div className="py-3 px-6 bg-stone-900 border border-stone-800 p-4 rounded-2xl flex items-center justify-center space-x-3">
            <span className="text-xl">✨</span>
            <span className="font-serif font-bold text-lg text-amber-400 tracking-widest">+50 {lang === 'pt' ? 'PONTOS' : 'POINTS'}</span>
          </div>

          <div className="w-full pt-4">
            <button
              onClick={handleClaimReward}
              disabled={saving}
              className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 disabled:bg-stone-900 text-stone-950 disabled:text-stone-600 font-bold uppercase tracking-[0.2em] text-[10px] transition-all rounded-full active:scale-[0.98] cursor-pointer flex items-center justify-center"
            >
              {saving ? (
                <span>{lang === 'pt' ? 'Sincronizando Recompensas...' : 'Syncing Rewards...'}</span>
              ) : (
                <span>{lang === 'pt' ? 'Reivindicar Recompensas' : 'Claim Reward & Begin'}</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="w-full text-center py-2 border-t border-white/5">
        <p className="text-[8px] uppercase tracking-[0.3em] text-stone-700">
          INNER EXPLORER LICENSE • PCH FOUNDATIONAL SHIFT
        </p>
      </div>
    </div>
  );
};
