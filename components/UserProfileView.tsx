import React from 'react';
import { User, Language } from '../types';
import { Award, ShieldCheck, Mail, Calendar, Sparkles, Sliders, MessageSquare } from 'lucide-react';

interface UserProfileViewProps {
  user: User | null;
  lang: Language;
  onNavigateToSettings: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ user, lang, onNavigateToSettings }) => {
  if (!user) return null;

  const points = user.points || 0;
  // Let's calculate a simple dynamic level based on points (e.g. Level 1 is < 100 points, Level 2 is < 200, etc.)
  const level = Math.floor(points / 100) + 1;
  const pointsRemaining = 100 - (points % 100);
  const levelProgress = (points % 100);

  // Subtitle translations for preferences
  const translateComm = (pref: string | undefined) => {
    switch(pref) {
      case 'voice': return lang === 'pt' ? '🎤 Apenas Voz' : '🎤 Voice Only';
      case 'text': return lang === 'pt' ? '⌨️ Apenas Texto' : '⌨️ Text Only';
      case 'image': return lang === 'pt' ? '🖼️ Apenas Imagens' : '🖼️ Images Only';
      default: return lang === 'pt' ? '🔄 Integração Sensorial' : '🔄 Full Integration';
    }
  };

  const translateNeuro = (mode: string | undefined) => {
    switch(mode) {
      case 'adhd': return lang === 'pt' ? 'PCH adaptada para TDAH' : 'PCH adapted for ADHD';
      case 'autism': return lang === 'pt' ? 'Acessibilidade para Autismo' : 'Accessibility for Autism';
      case 'dyslexia': return lang === 'pt' ? 'Leitura para Dislexia' : 'Reading for Dyslexia';
      case 'anxiety': return lang === 'pt' ? 'Exercícios para Ansiedade' : 'Comfort for Anxiety';
      case 'inclusive': return lang === 'pt' ? 'Modo de Consciência Adaptado' : 'Adaptive Inclusive Mode';
      default: return lang === 'pt' ? 'Método PCH Tradicional' : 'Traditional PCH Standard';
    }
  };

  const userBadges = (user as any).badges || ['Explorador Interior'];

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in p-2">
      {/* Visual Identity Profile Card */}
      <div className="bg-stone-900/40 border border-stone-850/60 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl"></div>

        <div className="flex flex-col items-center text-center space-y-4">
          {/* Avatar simulation */}
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-teal-500 to-amber-400 p-0.5 shadow-xl relative">
            <div className="w-full h-full rounded-full bg-stone-950 flex items-center justify-center font-serif text-lg text-stone-200">
              {user.name.charAt(0).toUpperCase()}
            </div>
            {user.isAdmin && (
              <span className="absolute -bottom-1 -right-1 bg-red-500 text-[8px] font-black tracking-widest text-white px-2 py-0.5 rounded-full uppercase border border-stone-950">
                ADMIN
              </span>
            )}
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-serif text-stone-100 tracking-wide">{user.name}</h3>
            <p className="text-[10px] text-stone-400 tracking-wider flex items-center justify-center gap-1">
              <Mail className="w-3 h-3 text-stone-600" /> {user.email}
            </p>
          </div>

          {/* Plan badge */}
          <span className={`px-4 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold border ${
            user.plan === 'guardian' 
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
              : 'bg-teal-500/10 text-teal-400 border-teal-500/20'
          }`}>
            {user.plan === 'guardian' ? (lang === 'pt' ? '👑 Guardião' : '👑 Guardian') : (lang === 'pt' ? '🛡️ Guardião Membro' : '🛡️ Standard Member')}
          </span>
        </div>
      </div>

      {/* Gamification Level Status Card */}
      <div className="bg-stone-900/20 border border-stone-850/50 p-6 rounded-3xl space-y-4 backdrop-blur-md">
        <div className="flex justify-between items-center text-xs">
          <span className="text-[10px] uppercase tracking-widest text-stone-500 font-mono">Nível {level}</span>
          <span className="text-[10px] text-amber-400 font-mono">{points} XP</span>
        </div>

        {/* Custom Progress bar */}
        <div className="w-full h-2 bg-stone-950 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-teal-500 to-amber-400 transition-all duration-1000"
            style={{ width: `${levelProgress}%` }}
          />
        </div>

        <p className="text-[10px] text-stone-500 font-light italic leading-relaxed">
          {lang === 'pt' 
            ? `Faltam ${pointsRemaining} pontos para desbloquear o próximo nível do seu Jardim.` 
            : `${pointsRemaining} points needed until your next Garden level-up.`}
        </p>
      </div>

      {/* Custom adaptive preferences active visual lines */}
      <div className="bg-stone-900/30 border border-stone-850/50 rounded-3xl p-5 space-y-4">
        <h4 className="text-[9px] uppercase text-stone-500 tracking-[0.2em] font-bold border-b border-stone-900 pb-2">
          {lang === 'pt' ? 'Preferências Adaptativas' : 'Active Adapted Setup'}
        </h4>

        <div className="space-y-3">
          <div className="flex items-center space-x-3 text-xs">
            <MessageSquare className="w-4 h-4 text-teal-400 shrink-0" />
            <div>
              <p className="text-[10px] uppercase text-stone-500 tracking-wider font-semibold">{lang === 'pt' ? 'Comunicação' : 'Preferred Channel'}</p>
              <p className="text-stone-300 font-semibold text-xs mt-0.5">{translateComm(user.communicationPreference)}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 text-xs pt-2 border-t border-stone-900/60">
            <Sliders className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <p className="text-[10px] uppercase text-stone-500 tracking-wider font-semibold">{lang === 'pt' ? 'Experiência' : 'Cognitive Style'}</p>
              <p className="text-stone-300 font-semibold text-xs mt-0.5">{translateNeuro(user.neuroMode)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badges / Achievements catalog */}
      <div className="bg-stone-900/30 border border-stone-850/50 rounded-3xl p-5 space-y-4">
        <h4 className="text-[9px] uppercase text-stone-500 tracking-[0.2em] font-bold border-b border-stone-900 pb-2">
          {lang === 'pt' ? 'Conquistas & Medalhas' : 'Unlocked Badges'}
        </h4>

        <div className="grid grid-cols-1 gap-2">
          {userBadges.map((badge: string, i: number) => (
            <div key={i} className="flex items-center space-x-4 bg-stone-950/40 p-3 rounded-2xl border border-stone-900/80">
              <div className="p-2 bg-yellow-500/10 rounded-xl text-yellow-500 shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[11px] font-bold text-stone-200">
                  {badge === 'Explorador Interior' && lang === 'pt' ? 'Explorador Interior' : 'Inner Explorer'}
                </p>
                <p className="text-[9px] text-stone-500 mt-0.5">
                  {lang === 'pt' ? 'Concluiu com sucesso o manifesto fundador' : 'Completed the foundational PCH manifesto setup'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA to modify preferences */}
      <div className="text-center pt-2">
        <button
          onClick={onNavigateToSettings}
          className="text-[10px] uppercase tracking-widest text-teal-400 hover:text-teal-300 font-bold transition-all underline shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>{lang === 'pt' ? 'Gerenciar Ajustes / Acessibilidade' : 'Adjust Cognitive Preferences'}</span>
        </button>
      </div>
    </div>
  );
};
