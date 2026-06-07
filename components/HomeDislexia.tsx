import React, { useState } from 'react';
import { User, Language } from '../types';
import { 
  Volume2, 
  BookOpen, 
  MessageSquare, 
  Maximize2, 
  Check, 
  HelpCircle,
  Eye,
  Type
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

export const HomeDislexia: React.FC<HomeViewProps> = ({
  user,
  lang,
  onNavigateToScreen,
  onAddToast,
}) => {
  const [useDysfont, setUseDysfont] = useState(true);

  const handleReadAudible = (text: string) => {
    // Standard Speech Synthesis implementation for dyslexic assistive audio
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const sentence = new SpeechSynthesisUtterance(text);
      sentence.lang = lang === 'pt' ? 'pt-BR' : 'en-US';
      sentence.rate = 0.85; // slightly slower
      window.speechSynthesis.speak(sentence);
      
      onAddToast({
        type: 'success',
        title: lang === 'pt' ? 'Áudio Ouvido 🔊' : 'Audio Streaming Active 🔊',
        description: lang === 'pt' ? 'Reproduzindo ajuda de leitura sintonizada.' : 'Streaming vocal guide directly.'
      });
    } else {
      onAddToast({
        type: 'error',
        title: 'Recurso bloqueado',
        description: 'Seu navegador não oferece suporte para áudio-leitor.'
      });
    }
  };

  const sectionTextPt = "Cuidar do seu diálogo interno é um ato poético. No seu próprio tempo, sem qualquer pressa.";
  const sectionTextEn = "Caring for your inner dialogue is a poetic experience. Work at your own pace, with no rush.";

  return (
    <div className="space-y-8 select-none text-left">
      
      {/* DYSLEXIC OPTIMIZER BAR */}
      <div className="p-6.5 rounded-[2rem] bg-indigo-500/10 border border-indigo-500/25 flex flex-col md:flex-row justify-between items-center gap-4 text-stone-200">
        <div className="flex gap-4 items-center">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-2xl">
            <Type className="w-5.5 h-5.5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-serif font-black text-indigo-300 text-sm uppercase tracking-[0.15em] block">
              {lang === 'pt' ? 'Modulação para Dislexia Ativa' : 'Dyslexia Assistant Active'}
            </h3>
            <p className="text-[11.5px] text-stone-400 font-sans tracking-wide leading-relaxed">
              {lang === 'pt' 
                ? 'Fontes compensadas de base robusta e espaçamento ampliado de caracteres ativado. Toque no símbolo de autofalante para escutar qualquer frase.' 
                : 'Weighted bottom font style configuration, wide tracking, and spoken text help triggered. Press any audio node.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setUseDysfont(!useDysfont);
            onAddToast({
              type: 'success',
              title: useDysfont ? 'Estilo Padrão' : 'Estilo OpenDyslexic',
              description: useDysfont ? 'Exibindo fonte comum.' : 'Reconfigurando caracteres com peso de base.'
            });
          }}
          className={`py-2 px-5 rounded-full font-mono text-[9px] uppercase font-bold tracking-widest flex items-center gap-2 cursor-pointer ${
            useDysfont 
              ? 'bg-indigo-500 text-white shadow-md' 
              : 'bg-stone-900 border border-stone-800 text-indigo-400 hover:bg-stone-850'
          }`}
        >
          <span>{useDysfont ? (lang === 'pt' ? 'Peso de Base (Ativo)' : 'Weighted Base (On)') : (lang === 'pt' ? 'Ativar Peso' : 'Activate Weight')}</span>
        </button>
      </div>

      {/* CORE DYSLEXIC CONTAINER WITH SPECIFIC TRACKINGS AND HEIGHTS */}
      <div 
        className="space-y-8"
        style={{
          letterSpacing: useDysfont ? '0.14em' : 'normal',
          wordSpacing: useDysfont ? '0.25em' : 'normal',
          lineHeight: useDysfont ? '2.1' : '1.5'
        }}
      >
        
        {/* ASSISTED PARAGRAPH WITH SOUND BUTTON */}
        <div className="p-8 rounded-[2rem] bg-[#0c1221] border border-[#1b2641] space-y-6 relative">
          <span className="text-[10px] font-mono tracking-widest text-[#10B981] uppercase block font-black">
            {lang === 'pt' ? 'SEMENTE DE AMOR-PRÓPRIO' : 'SOUL HARMONY'}
          </span>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-5">
            <h3 className="text-xl md:text-2.5xl font-serif text-stone-100 font-black leading-relaxed">
              {lang === 'pt' ? sectionTextPt : sectionTextEn}
            </h3>

            <button
              onClick={() => handleReadAudible(lang === 'pt' ? sectionTextPt : sectionTextEn)}
              className="px-6 py-4 rounded-2xl bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500 hover:text-[#080b14] border border-indigo-500/35 flex items-center gap-3 transition-all cursor-pointer font-sans text-xs uppercase tracking-widest font-black shrink-0"
            >
              <Volume2 className="w-5 h-5" />
              <span>{lang === 'pt' ? 'OUVIR ADIÇÃO' : 'HEAR SEED'}</span>
            </button>
          </div>
        </div>

        {/* CORE NAVIGATION SPLIT */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          <div 
            onClick={() => onNavigateToScreen('chat')}
            className="p-7 rounded-[2rem] bg-[#0d1324] border border-[#1a253f] hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all duration-300 cursor-pointer group text-left"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-indigo-400">
                🎙️ {lang === 'pt' ? 'CONVERSA COMPENSADA' : 'vocal suggestions'}
              </span>
              <BookOpen className="w-4.5 h-4.5 text-indigo-400" />
            </div>
            <div className="my-3">
              <h4 className="text-base font-serif font-black text-stone-100 group-hover:text-indigo-300 transition-colors">
                {lang === 'pt' ? 'Falar por Voz Ativa' : 'Activate spoken helper'}
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed font-light mt-1">
                {lang === 'pt' ? 'Evite telas cheias de palavras e mude para um diálogo acústico acolhedor.' : 'Swap letters for spoken, calming dialog queues.'}
              </p>
            </div>
          </div>

          <div 
            onClick={() => onNavigateToScreen('refugio')}
            className="p-7 rounded-[2rem] bg-[#0d1324] border border-[#1a253f] hover:border-teal-500/40 hover:bg-teal-500/5 transition-all duration-300 cursor-pointer group text-left"
          >
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-mono font-bold uppercase tracking-[0.2em] text-teal-400">
                📝 {lang === 'pt' ? 'DIÁRIO COM SUPORTE' : 'visual notebook'}
              </span>
              <Maximize2 className="w-4.5 h-4.5 text-teal-400" />
            </div>
            <div className="my-3">
              <h4 className="text-base font-serif font-black text-stone-100 group-hover:text-teal-300 transition-colors">
                {lang === 'pt' ? 'Escrever Meu Refúgio' : 'Launch Journal Screen'}
              </h4>
              <p className="text-xs text-stone-400 leading-relaxed font-light mt-1">
                {lang === 'pt' ? 'Registre seus sentimentos passo a passo com layout limpo e confortável.' : 'Soothe word recall fatigue via slow structured journals.'}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
