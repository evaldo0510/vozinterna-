import React from 'react';
import { User, Language, NeuroProfileType } from '../types';
import { useNeuroProfileManager, neuroProfiles } from './NeuroAdaptiveEngine';
import { AdaptiveExperienceEngine } from './AdaptiveExperienceEngine';
import { NeuroProfileDashboard } from './NeuroProfileDashboard';
import { NeuroJourneyMap } from './NeuroJourneyMap';
import { 
  Compass, 
  Cpu, 
  MapPin, 
  Sparkles, 
  Heart, 
  Clock, 
  Maximize2, 
  ShieldAlert,
  FlameKindling
} from 'lucide-react';

interface AdaptiveHomeProps {
  user: User;
  lang: Language;
  onNavigateToScreen: (screen: 'portal' | 'home' | 'chat' | 'jornada' | 'espelho' | 'refugio' | 'sopro') => void;
  isLightTheme: boolean;
  onToggleTheme: () => void;
  onAddToast: (toast: { type: string; title: string; description: string }) => void;
  onOpenTuningPopover: () => void;
  onTextSizeChange?: (size: 'small' | 'medium' | 'large') => void;
  onAccessibilityModeChange?: (active: boolean) => void;
}

export const AdaptiveHome: React.FC<AdaptiveHomeProps> = ({
  user,
  lang,
  onNavigateToScreen,
  isLightTheme,
  onToggleTheme,
  onAddToast,
  onOpenTuningPopover,
  onTextSizeChange,
  onAccessibilityModeChange,
}) => {
  const { profile } = useNeuroProfileManager(user?.id);
  const [subView, setSubView] = React.useState<'santuario' | 'jornada' | 'perfis'>('santuario');

  const activeMode = profile?.neuroType || (user?.neuroMode as NeuroProfileType) || 'normal';
  const spec = neuroProfiles[activeMode] || neuroProfiles.normal;

  return (
    <div className="w-full min-h-full text-[#E0E7E5] font-sans pb-24 transition-colors duration-500 overflow-x-hidden relative">
      
      {/* Dynamic top bar links layout */}
      <div className="max-w-4xl mx-auto px-6 pt-6 pb-2">
        <div className="bg-[#0c101d]/90 border border-[#1d2745] rounded-3xl p-3 flex flex-wrap justify-between items-center gap-3 shadow-md">
          {/* Quick status details */}
          <div className="flex items-center gap-2.5 px-3">
            <span className="text-xs">🧘</span>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-mono uppercase text-teal-400 font-bold leading-none">
                {lang === 'pt' ? 'Mente Adaptiva Ativa' : 'Mind Profile Engaged'}
              </span>
              <span className="text-xs font-serif font-bold text-stone-100">
                {lang === 'pt' ? spec.labelPt : spec.labelEn}
              </span>
            </div>
          </div>

          {/* Quick switcher buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSubView('santuario')}
              className={`px-4.5 py-2 rounded-2xl text-[10px] font-mono uppercase tracking-widest font-black transition-all cursor-pointer ${
                subView === 'santuario'
                  ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-[#080b14] shadow-md'
                  : 'bg-[#151c2f]/60 hover:bg-[#1c263f] text-slate-400'
              }`}
            >
              🍃 {lang === 'pt' ? 'Santuário' : 'Santuário'}
            </button>

            <button
              onClick={() => setSubView('jornada')}
              className={`px-4.5 py-2 rounded-2xl text-[10px] font-mono uppercase tracking-widest font-black transition-all cursor-pointer ${
                subView === 'jornada'
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-[#080b14] shadow-md'
                  : 'bg-[#151c2f]/60 hover:bg-[#1c263f] text-slate-400'
              }`}
            >
              🌌 {lang === 'pt' ? 'Jornada' : 'Journey'}
            </button>

            <button
              onClick={() => setSubView('perfis')}
              className={`px-4.5 py-2 rounded-2xl text-[10px] font-mono uppercase tracking-widest font-black transition-all cursor-pointer ${
                subView === 'perfis'
                  ? 'bg-[#8b5cf6] text-stone-950 shadow-md font-bold'
                  : 'bg-[#151c2f]/60 hover:bg-[#1c263f] text-slate-400'
              }`}
            >
              ⚡ {lang === 'pt' ? 'NeuroCentro' : 'Profiles'}
            </button>
          </div>
        </div>
      </div>

      {/* Render selected view */}
      {subView === 'santuario' && (
        <AdaptiveExperienceEngine
          user={user}
          lang={lang}
          onNavigateToScreen={onNavigateToScreen}
          isLightTheme={isLightTheme}
          onToggleTheme={onToggleTheme}
          onAddToast={onAddToast}
          onOpenTuningPopover={onOpenTuningPopover}
          onTextSizeChange={onTextSizeChange}
          onAccessibilityModeChange={onAccessibilityModeChange}
        />
      )}

      {subView === 'jornada' && (
        <NeuroJourneyMap
          user={user}
          lang={lang}
          onBack={() => setSubView('santuario')}
          onAddToast={onAddToast}
        />
      )}

      {subView === 'perfis' && (
        <NeuroProfileDashboard
          user={user}
          lang={lang}
          onBack={() => setSubView('santuario')}
          onAddToast={onAddToast}
        />
      )}

    </div>
  );
};
export default AdaptiveHome;
