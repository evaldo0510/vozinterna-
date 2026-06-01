import React from 'react';
import Logo from './Logo';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface SplashViewProps {
  lang: Language;
  onSetLang: (lang: Language) => void;
  onNavigate: (screen: 'login' | 'register') => void;
}

export const SplashView: React.FC<SplashViewProps> = ({ lang, onSetLang, onNavigate }) => {
  const t = TRANSLATIONS[lang];

  return (
    <div className="min-h-screen w-full bg-stone-950 text-stone-200 flex flex-col justify-between p-6 relative font-sans overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-teal-500/5 rounded-full blur-[80px] pointer-events-none"></div>
      <div className="absolute bottom-10 left-1/4 w-[200px] h-[200px] bg-amber-500/5 rounded-full blur-[60px] pointer-events-none"></div>

      {/* Header with Language pickers */}
      <div className="w-full max-w-lg mx-auto flex justify-end items-center space-x-4 z-10">
        <button 
          onClick={() => onSetLang('pt')} 
          className={`text-[10px] uppercase font-mono tracking-[0.3em] transition-colors py-1 px-2.5 rounded-full border ${
            lang === 'pt' ? 'text-teal-400 border-teal-500/30 bg-teal-500/5' : 'text-stone-600 border-transparent hover:text-stone-400'
          }`}
        >
          Português
        </button>
        <button 
          onClick={() => onSetLang('en')} 
          className={`text-[10px] uppercase font-mono tracking-[0.3em] transition-colors py-1 px-2.5 rounded-full border ${
            lang === 'en' ? 'text-teal-400 border-teal-500/30 bg-teal-500/5' : 'text-stone-600 border-transparent hover:text-stone-400'
          }`}
        >
          English
        </button>
      </div>

      {/* Main hero brand */}
      <div className="flex-1 w-full max-w-sm mx-auto flex flex-col items-center justify-center text-center space-y-12 z-10">
        <div className="flex flex-col items-center animate-fade-in">
          <Logo className="w-20 h-20 text-teal-400 mb-6 drop-shadow-[0_0_30px_rgba(20,184,166,0.25)] animate-pulse" />
          <h1 className="text-4xl md:text-5xl font-serif text-stone-100 tracking-[0.2em] font-medium uppercase">
            {lang === 'pt' ? 'VOZ INTERIOR' : 'INNER VOICE'}
          </h1>
          <p className="text-[10px] tracking-[0.4em] text-stone-500 uppercase mt-4 font-sans font-semibold">
            {t.subtitle}
          </p>
        </div>

        {/* Elegant actions */}
        <div className="w-full flex flex-col space-y-4 animate-fade-in" style={{ animationDelay: '150ms' }}>
          <button 
            onClick={() => onNavigate('login')}
            className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold uppercase tracking-[0.2em] text-[10px] transition-all rounded-full shadow-lg hover:shadow-teal-500/10 active:scale-[0.98] cursor-pointer"
          >
            {lang === 'pt' ? 'Entrar na Sessão' : 'Sign In to Session'}
          </button>
          
          <button 
            onClick={() => onNavigate('register')}
            className="w-full py-4 bg-transparent border border-stone-800 hover:border-stone-700 text-stone-300 hover:text-stone-100 font-bold uppercase tracking-[0.2em] text-[10px] transition-all rounded-full active:scale-[0.98] cursor-pointer"
          >
            {lang === 'pt' ? 'Criar Nova Conta' : 'Create New Account'}
          </button>
        </div>
      </div>

      {/* Footer text */}
      <div className="w-full max-w-sm mx-auto text-center z-10">
        <p className="text-[8px] uppercase tracking-[0.3em] text-stone-700 leading-relaxed">
          {lang === 'pt' ? 'Portas abertas para a tranquilidade cognitiva • PCH v1.0.0' : 'Doors open to cognitive tranquility • PCH v1.0.0'}
        </p>
      </div>
    </div>
  );
};
