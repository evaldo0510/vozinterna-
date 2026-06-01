import React, { useState } from 'react';
import { User, Language, NeurodivergentMode } from '../types';
import { Sliders, Sun, Moon, Volume2, Globe, Sparkles, LogOut, Check } from 'lucide-react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';

interface SettingsViewProps {
  user: User | null;
  lang: Language;
  onSetLang: (lang: Language) => void;
  onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, lang, onSetLang, onLogout }) => {
  const [savingLoading, setSavingLoading] = useState(false);

  if (!user) return null;

  const currentNeuroMode = user.neuroMode || 'natural';
  const currentCommPreference = user.communicationPreference || 'hybrid';
  const isHighContrast = user.accessibilityMode || false;

  const handleUpdateNeuroMode = async (mode: NeurodivergentMode) => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    setSavingLoading(true);
    try {
      const docRef = doc(db, 'users', firebaseUser.uid);
      const enableAccessibility = ['autism', 'inclusive'].includes(mode);
      await updateDoc(docRef, {
        neuroMode: mode,
        accessibilityMode: enableAccessibility,
        lastActive: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
    } finally {
      setSavingLoading(false);
    }
  };

  const handleUpdateComm = async (pref: 'voice' | 'text' | 'image' | 'hybrid') => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    setSavingLoading(true);
    try {
      const docRef = doc(db, 'users', firebaseUser.uid);
      await updateDoc(docRef, {
        communicationPreference: pref,
        lastActive: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
      handleFirestoreError(err, OperationType.UPDATE, `users/${firebaseUser.uid}`);
    } finally {
      setSavingLoading(false);
    }
  };

  const toggleHighContrast = async () => {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return;

    setSavingLoading(true);
    try {
      const docRef = doc(db, 'users', firebaseUser.uid);
      await updateDoc(docRef, {
        accessibilityMode: !isHighContrast,
        lastActive: new Date().toISOString()
      });
    } catch (err) {
      console.error(err);
    } finally {
      setSavingLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in p-2 pb-12">
      {/* Settings Module Title */}
      <div className="flex items-center space-x-3 mb-2">
        <Globe className="w-5 h-5 text-teal-400" />
        <h3 className="font-serif text-lg text-stone-100 uppercase tracking-widest leading-relaxed">
          {lang === 'pt' ? 'Ajustes de Sintonia' : 'Sanctuary Settings'}
        </h3>
      </div>

      {/* Language Section Wrapper */}
      <div className="bg-stone-900/40 border border-stone-850/60 p-5 rounded-3xl space-y-3 backdrop-blur-md">
        <h4 className="text-[9px] uppercase text-stone-500 tracking-[0.2em] font-bold">
          {lang === 'pt' ? 'Idioma do Templo' : 'Workspace Language'}
        </h4>
        <div className="grid grid-cols-2 gap-2">
          <button 
            onClick={() => onSetLang('pt')}
            className={`py-2.5 rounded-2xl text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              lang === 'pt' ? 'bg-teal-500/10 border border-teal-500/30 text-teal-400 font-black' : 'bg-stone-950 border border-transparent text-stone-500 hover:text-stone-300'
            }`}
          >
            {lang === 'pt' && <Check className="w-3.5 h-3.5" />}
            <span>Português</span>
          </button>
          <button 
            onClick={() => onSetLang('en')}
            className={`py-2.5 rounded-2xl text-[10px] uppercase font-bold tracking-widest transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              lang === 'en' ? 'bg-teal-500/10 border border-teal-500/30 text-teal-400 font-black' : 'bg-stone-950 border border-transparent text-stone-500 hover:text-stone-300'
            }`}
          >
            {lang === 'en' && <Check className="w-3.5 h-3.5" />}
            <span>English</span>
          </button>
        </div>
      </div>

      {/* Cognitive Adaptability Options */}
      <div className="bg-stone-900/40 border border-stone-850/60 p-5 rounded-3xl space-y-4 backdrop-blur-md">
        <h4 className="text-[9px] uppercase text-stone-500 tracking-[0.2em] font-bold">
          {lang === 'pt' ? 'Modo de Consciência (PCH)' : 'State of Attention'}
        </h4>
        <div className="grid grid-cols-1 gap-2">
          {([
            { id: 'natural', label: lang === 'pt' ? 'Padrão (Natureza PCH)' : 'Natural (Standard)', desc: lang === 'pt' ? 'Poesia rítmica padrão' : 'Standard poetic cadence' },
            { id: 'adhd', label: lang === 'pt' ? 'TDAH (Agilidade Relâmpago)' : 'ADHD Mode', desc: lang === 'pt' ? 'Mensagens simplificadas focadas' : 'Highly focused and linear micro-responses' },
            { id: 'autism', label: lang === 'pt' ? 'Autismo (Predictibilidade)' : 'Autism Clarity Mode', desc: lang === 'pt' ? 'Comunicação direta sem figuras abstratas' : 'Extreme clarity, step-by-step predictability' },
            { id: 'anxiety', label: lang === 'pt' ? 'Ansiedade (Acalento)' : 'Anxiety Comfort Mode', desc: lang === 'pt' ? 'Ritmo desacelerado e respiração síncrona' : 'Deeply soothing breath pacing support' }
          ] as const).map((mode) => (
            <button
              key={mode.id}
              onClick={() => handleUpdateNeuroMode(mode.id)}
              disabled={savingLoading}
              className={`p-3 text-left rounded-2xl border transition-all cursor-pointer ${
                currentNeuroMode === mode.id 
                  ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' 
                  : 'bg-stone-950 border-stone-900/40 text-stone-400 hover:border-stone-800'
              }`}
            >
              <p className="text-[11px] font-bold uppercase tracking-wider">{mode.label}</p>
              <p className="text-[9px] text-stone-500 mt-1 leading-normal">{mode.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* High Contrast Accessibility Toggle */}
      <div className="bg-stone-900/40 border border-stone-850/60 p-5 rounded-3xl space-y-3 backdrop-blur-md">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-xs font-bold text-stone-200">
              {lang === 'pt' ? 'Alto Contraste Estrito' : 'High Contrast Interface'}
            </h4>
            <p className="text-[9px] text-stone-500 leading-normal mt-0.5">
              {lang === 'pt' ? 'Melhora a legibilidade visual para idosos e disléxicos' : 'Optimizes accessibility styles across views'}
            </p>
          </div>
          <button 
            onClick={toggleHighContrast}
            disabled={savingLoading}
            className={`w-12 h-6 rounded-full relative transition-[background-color] duration-300 flex items-center p-0.5 cursor-pointer ${
              isHighContrast ? 'bg-teal-500' : 'bg-stone-850'
            }`}
          >
            <div className={`w-5 h-5 rounded-full bg-stone-950 transition-all ${
              isHighContrast ? 'translate-x-6' : 'translate-x-0'
            }`} />
          </button>
        </div>
      </div>

      {/* Exit / Sign out button */}
      <div className="pt-2">
        <button
          onClick={onLogout}
          className="w-full py-4 bg-rose-950/20 border border-rose-900/30 hover:bg-rose-900/20 text-rose-400 hover:text-rose-300 text-[10px] font-bold uppercase tracking-[0.2em] rounded-2xl transition-all cursor-pointer flex items-center justify-center space-x-2 active:scale-[0.98]"
        >
          <LogOut className="w-4 h-4" />
          <span>{lang === 'pt' ? 'Encerrar Sessão no Santuário' : 'Leave Sanctuary Portal'}</span>
        </button>
      </div>
    </div>
  );
};
