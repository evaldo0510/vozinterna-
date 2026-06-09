import React from 'react';
import { User, Language } from '../types';
import { 
  Plus, 
  HelpCircle, 
  Book, 
  Speaker, 
  PhoneCall, 
  Settings,
  Shield,
  Smile,
  LogOut
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

export const HomeIdoso: React.FC<HomeViewProps> = ({
  user,
  lang,
  onNavigateToScreen,
  onAddToast,
}) => {

  const handleWaterSeniors = async () => {
    onAddToast({
      type: 'success',
      title: lang === 'pt' ? 'Atividade Concluída! 👴👵' : 'Nourishment Confirmed! 👵👴',
      description: lang === 'pt' ? 'Parabéns por praticar seu autocuidado de hoje. Você está cultivando seu bem-estar!' : 'Good job taking care of your wellness. Your growth expands!'
    });

    if (user?.id && db) {
      try {
        const userDocRef = doc(db, 'users', user.id);
        await updateDoc(userDocRef, {
          points: (user.points || 0) + 25
        });
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-10 select-none text-left max-w-3xl mx-auto">
      
      {/* COGNITIVE WELCOME PANEL IN HIGH CONTRAST */}
      <div className="p-8 rounded-[2rem] bg-white border-4 border-stone-900 shadow-xl space-y-4 text-stone-950">
        <span className="text-xs uppercase tracking-widest text-[#10B981] font-mono font-black block">MODO ACESSIBILIDADE FACILITADA ATIVO 👵👴</span>
        <h2 className="text-2xl md:text-3.5xl font-serif font-black text-stone-900 leading-snug">
          {lang === 'pt' ? `Olá, seja muito bem-vindo, ${user?.name || 'Alma'}.` : `Hello and welcome, ${user?.name || 'Soul'}.`}
        </h2>
        <p className="text-base md:text-lg text-stone-800 leading-relaxed font-medium">
          {lang === 'pt' 
            ? 'Este sistema foi configurado com letras grandes, botões coloridos e mensagens claras para que sua navegação seja confortável, segura e sem esforço.'
            : 'This workspace features enlarged typography, robust contrasting controls, and explicit labels for total safety.'}
        </p>
      </div>

      {/* GIANT ACTION BUTTONS Grid - ALWAYS EXPLICIT COGNITIVE TEXT OVER CRYPTIC ICONS */}
      <div className="space-y-5">
        <span className="text-xs uppercase tracking-widest text-teal-400 font-mono font-black block">Escolha uma ação abaixo tocando em qualquer botão grande:</span>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* GIANT BUTTON 1: TALK */}
          <button
            onClick={() => onNavigateToScreen('chat')}
            style={{ minHeight: '80px' }}
            className="w-full p-6 text-left rounded-[2rem] bg-teal-450 hover:bg-teal-400 text-stone-950 font-bold tracking-wide active:scale-98 transition-all cursor-pointer border-3 border-stone-950 flex items-center justify-between shadow-md"
          >
            <div className="space-y-1">
              <span className="text-lg md:text-xl font-serif font-black block text-stone-950">💬 MICROFONE: CONVERSAR COM DR. EVALDO</span>
              <span className="text-xs font-sans text-stone-900 font-medium block">Toque aqui para falar por voz ou escrever suas memórias.</span>
            </div>
          </button>

          {/* GIANT BUTTON 2: JOURNAL */}
          <button
            onClick={() => onNavigateToScreen('refugio')}
            style={{ minHeight: '80px' }}
            className="w-full p-6 text-left rounded-[2rem] bg-amber-400 hover:bg-amber-350 text-stone-950 font-bold tracking-wide active:scale-98 transition-all cursor-pointer border-3 border-stone-950 flex items-center justify-between shadow-md"
          >
            <div className="space-y-1">
              <span className="text-lg md:text-xl font-serif font-black block text-stone-950">📝 CADERNO: ESCREVER NO DIÁRIO</span>
              <span className="text-xs font-sans text-stone-900 font-medium block">Toque aqui para anotar fatos do seu dia ou fazer desabafos.</span>
            </div>
          </button>

          {/* GIANT BUTTON 3: BREATHING */}
          <button
            onClick={() => onNavigateToScreen('sopro')}
            style={{ minHeight: '80px' }}
            className="w-full p-6 text-left rounded-[2rem] bg-purple-500 hover:bg-purple-400 text-white font-bold tracking-wide active:scale-98 transition-all cursor-pointer border-3 border-stone-950 flex items-center justify-between shadow-md"
          >
            <div className="space-y-1">
              <span className="text-lg md:text-xl font-serif font-black block text-white">🌬️ RESPIRAÇÃO: ALIVIAR A MENTE</span>
              <span className="text-xs font-sans text-purple-100 font-medium block">Toque aqui para acalmar o coração com exercícios de sopro guiados.</span>
            </div>
          </button>

          {/* GIANT BUTTON 4: EXERCISE */}
          <button
            onClick={handleWaterSeniors}
            style={{ minHeight: '80px' }}
            className="w-full p-6 text-left rounded-[2rem] bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold tracking-wide active:scale-98 transition-all cursor-pointer border-3 border-stone-950 flex items-center justify-between shadow-md"
          >
            <div className="space-y-1">
              <span className="text-lg md:text-xl font-serif font-black block text-stone-950">☘️ COLHER SEMENTE: ATIVIDADE CONCLUÍDA</span>
              <span className="text-xs font-sans text-stone-900 font-medium block">Toque aqui caso tenha regado suas plantas ou praticado hoje (Cultivo do Dia).</span>
            </div>
          </button>

        </div>
      </div>

      {/* COGNITIVE MEMORIES TIP BOX */}
      <div className="p-7 rounded-2xl bg-stone-950 border-3 border-stone-800 text-left space-y-2">
        <h4 className="text-sm uppercase tracking-wide font-mono font-black text-amber-400">💡 Recordações Importantes</h4>
        <p className="text-sm md:text-base text-stone-300 leading-relaxed font-light">
          {lang === 'pt'
            ? 'Escrever sobre memórias de infância, receitas antigas ou contar histórias de vida exercitam seu cérebro, ativam vias cognitivas da memória de longo prazo e evitam o declínio mental.'
            : 'Writing down childhood anecdotes, old recipes, or stories helps exercise standard memory pathways.'}
        </p>
      </div>

    </div>
  );
};
