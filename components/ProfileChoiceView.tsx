import React, { useState } from 'react';
import { Language, User, NeurodivergentMode } from '../types';
import Logo from './Logo';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { ADMIN_EMAILS } from '../constants';

interface ProfileChoiceViewProps {
  lang: Language;
  currentUser: User | null;
  onSuccess: () => void;
  onLogout: () => void;
}

export const ProfileChoiceView: React.FC<ProfileChoiceViewProps> = ({ lang, currentUser, onSuccess, onLogout }) => {
  const [commPreference, setCommPreference] = useState<'voice' | 'text' | 'image' | 'hybrid'>('hybrid');
  const [adaptationMode, setAdaptationMode] = useState<NeurodivergentMode>('natural');
  const [saving, setSaving] = useState(false);

  const commOptions = [
    { id: 'voice' as const, label: lang === 'pt' ? 'Voz' : 'Voice', icon: '🎤', desc: lang === 'pt' ? 'Interações guiadas por fala' : 'Voice guided sessions' },
    { id: 'text' as const, label: lang === 'pt' ? 'Texto' : 'Text', icon: '⌨️', desc: lang === 'pt' ? 'Conversações e silêncios' : 'Written reflections' },
    { id: 'image' as const, label: lang === 'pt' ? 'Imagens' : 'Images', icon: '🖼️', desc: lang === 'pt' ? 'Imagens de ressonância emocional' : 'Emotional visualizations' },
    { id: 'hybrid' as const, label: lang === 'pt' ? 'Tudo junto' : 'All together', icon: '🔄', desc: lang === 'pt' ? 'Imersão sensorial completa' : 'Full sensory immersion' },
  ];

  const adaptationOptions = [
    { id: 'natural' as const, label: lang === 'pt' ? 'Padrão 🍃' : 'Standard 🍃', desc: lang === 'pt' ? 'Experiência rítmica padrão' : 'Standard rhythmic flow' },
    { id: 'adhd' as const, label: lang === 'pt' ? 'TDAH ⚡' : 'ADHD ⚡', desc: lang === 'pt' ? 'Prazos dinâmicos e sementes de foco' : 'Dynamic flow & focus seeds' },
    { id: 'autism' as const, label: lang === 'pt' ? 'Autismo 🧩' : 'Autism 🧩', desc: lang === 'pt' ? 'Estrutura previsível e ícones' : 'Predictable structure & icons' },
    { id: 'dyslexia' as const, label: lang === 'pt' ? 'Dislexia 📚' : 'Dyslexia 📚', desc: lang === 'pt' ? 'Fontes legíveis, áudio-leitor' : 'Clean fonts, audio helper' },
    { id: 'anxiety' as const, label: lang === 'pt' ? 'Ansiedade 🌬️' : 'Anxiety 🌬️', desc: lang === 'pt' ? 'Respiração guiada e relaxamento' : 'Guided breathing & safety' },
    { id: 'senior' as const, label: lang === 'pt' ? 'Idosos 👵' : 'Seniors 👵', desc: lang === 'pt' ? 'Contraste alto, legado e memórias' : 'High contrast, memory logs' },
    { id: 'child' as const, label: lang === 'pt' ? 'Infantil 👶' : 'Children 👶', desc: lang === 'pt' ? 'Narrativas lúdicas e estrelas' : 'Playful stories & rewards' },
    { id: 'down' as const, label: lang === 'pt' ? 'S. Down ❤️' : 'S. Down ❤️', desc: lang === 'pt' ? 'Botões expandidos e áudio total' : 'Expanded buttons & full audio' },
    { id: 'gifted' as const, label: lang === 'pt' ? 'A. Habilidades 🌌' : 'A. Habilidades 🌌', desc: lang === 'pt' ? 'Desafios conceituais e reflexões' : 'Conceptual depth & mind maps' },
    { id: 'burnout' as const, label: lang === 'pt' ? 'Burnout 🔥' : 'Burnout 🔥', desc: lang === 'pt' ? 'Redução suave de estresse' : 'Decompression & inner fire' },
    { id: 'grief' as const, label: lang === 'pt' ? 'Luto 🌹' : 'Grief 🌹', desc: lang === 'pt' ? 'Honrar memórias e restaurar' : 'Honoring memories & healing' },
  ];

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    setSaving(true);
    try {
      const docRef = doc(db, 'users', user.uid);
      const chosenNeuroMode = adaptationMode;
      const enableAccessibility = ['autism', 'down', 'senior'].includes(chosenNeuroMode);

      if (!currentUser) {
        const normalizedEmail = (user.email || '').toLowerCase().trim();
        const isAdminUser = ADMIN_EMAILS.includes(normalizedEmail);

        const userObj: User = {
          id: user.uid,
          name: user.displayName || 'Praticante Zen',
          email: normalizedEmail,
          isAdmin: isAdminUser,
          plan: isAdminUser ? 'guardian' : 'member',
          registeredAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          resonanceScore: 0,
          accessibilityMode: enableAccessibility,
          points: 0,
          level: 1,
          manifestoStep: 1,
          manifestoCompleted: false,
          profileCompleted: true,
          communicationPreference: commPreference,
          neuroMode: chosenNeuroMode
        };
        await setDoc(docRef, userObj);
      } else {
        await updateDoc(docRef, {
          communicationPreference: commPreference,
          neuroMode: chosenNeuroMode,
          accessibilityMode: enableAccessibility,
          profileCompleted: true,
          lastActive: new Date().toISOString()
        });
      }

      onSuccess();
    } catch (err) {
      console.error("Failed to update profile selections", err);
      handleFirestoreError(err, OperationType.UPDATE, `users/${user?.uid}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-stone-950 text-stone-200 flex flex-col justify-between p-6 relative font-sans overflow-y-auto">
      {/* Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-teal-500/5 rounded-full blur-[80px] pointer-events-none"></div>

      {/* Header */}
      <div className="w-full max-w-xl mx-auto flex justify-between items-center z-10 py-2">
        <div className="flex items-center space-x-2">
          <Logo className="w-6 h-6 text-teal-400" />
          <span className="font-serif text-xs uppercase tracking-widest text-stone-300">
            {lang === 'pt' ? 'Perfil Inicial' : 'Active Profile Setup'}
          </span>
        </div>
        <button 
          onClick={onLogout}
          className="text-[9px] uppercase tracking-widest text-stone-500 hover:text-stone-300 transition-colors font-mono"
        >
          {lang === 'pt' ? 'Sair da Conta' : 'Logout'}
        </button>
      </div>

      {/* Main content onboarding questions */}
      <div className="flex-1 w-full max-w-xl mx-auto flex flex-col justify-center py-6 space-y-8 z-10">
        <div className="text-left space-y-2 border-b border-stone-900 pb-4">
          <h2 className="text-xl md:text-2xl font-serif text-stone-100 uppercase tracking-widest leading-relaxed">
            {lang === 'pt' ? 'Olá, seu Santuário está pronto.' : 'Hello, your Sanctuary awaits.'}
          </h2>
          <p className="text-xs text-stone-400 leading-relaxed">
            {lang === 'pt' ? 'Para uma imersão verdadeiramente adaptada às suas necessidades sensoriais e cognitivas, nos diga:' : 'To craft an experience that fully aligns with your sensory and cognitive needs, guide us:'}
          </p>
        </div>

        {/* Question 1 */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <span className="text-lg">🎯</span>
            <h3 className="text-xs uppercase font-bold text-stone-300 tracking-wider">
              {lang === 'pt' ? 'Como você prefere se comunicar?' : 'How do you prefer to communicate?' }
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {commOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setCommPreference(opt.id)}
                className={`p-4 text-left rounded-2xl border transition-all text-stone-300 flex items-start space-x-4 active:scale-[0.99] cursor-pointer ${
                  commPreference === opt.id 
                    ? 'border-teal-500/50 bg-teal-500/5 text-stone-100' 
                    : 'border-stone-900 bg-stone-900/30 hover:border-stone-800'
                }`}
              >
                <span className="text-xl p-2 bg-stone-950/50 rounded-xl">{opt.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs">{opt.label}</p>
                  <p className="text-[10px] text-stone-500 truncate mt-1 leading-tight">{opt.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Question 2 */}
        <div className="space-y-4 pt-4 border-t border-stone-900">
          <div className="flex items-center space-x-3">
            <span className="text-lg">♿</span>
            <h3 className="text-xs uppercase font-bold text-stone-300 tracking-wider">
              {lang === 'pt' ? 'Você deseja uma experiência adaptada?' : 'Do you want an adapted experience?' }
            </h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {adaptationOptions.map((opt) => {
              const matchedId = opt.id;
              const isActive = adaptationMode === matchedId;
              return (
                <button
                  key={opt.id}
                  onClick={() => setAdaptationMode(matchedId)}
                  className={`p-3 text-left rounded-xl border transition-all text-stone-300 flex flex-col justify-between h-20 active:scale-[0.99] cursor-pointer ${
                    isActive 
                      ? 'border-teal-500/50 bg-teal-500/5 text-teal-300' 
                      : 'border-stone-900 bg-stone-900/10 hover:border-stone-800'
                  }`}
                >
                  <p className="font-bold text-[11px]">{opt.label}</p>
                  <p className="text-[9px] text-stone-500 leading-tight block mt-1 leading-snug">{opt.desc}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Save button */}
        <div className="pt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-teal-500 hover:bg-teal-400 disabled:bg-stone-900 text-stone-950 disabled:text-stone-600 font-bold uppercase tracking-[0.2em] text-[10px] transition-all rounded-full active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {saving ? (
              <span>{lang === 'pt' ? 'Modulando Santuário...' : 'Modulating Sanctuary...'}</span>
            ) : (
              <span>{lang === 'pt' ? 'Salvar Configurações' : 'Save Preferences & Begin'}</span>
            )}
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="w-full text-center py-2 z-10 border-t border-stone-900/60 mt-4">
        <p className="text-[8px] uppercase tracking-[0.3em] text-stone-750">
          GENUINE COGNITIVE THERAPY PILOT • {lang === 'pt' ? 'CONFORTO TOTAL' : 'TOTAL COMFORT'}
        </p>
      </div>
    </div>
  );
};
