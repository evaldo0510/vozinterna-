import React from 'react';
import { User, Language, NeuroProfileType } from '../types';
import { neuroProfiles, useNeuroProfileManager, NeuroProfileConfig } from './NeuroAdaptiveEngine';
import { 
  Cpu, 
  Settings, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle, 
  Clock, 
  TrendingUp, 
  Target, 
  Heart, 
  Bookmark, 
  Zap, 
  Eye, 
  Volume2, 
  Sliders, 
  ArrowLeft 
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface NeuroProfileDashboardProps {
  user: User;
  lang: Language;
  onBack: () => void;
  onAddToast: (toast: { type: string; title: string; description: string }) => void;
}

export const NeuroProfileDashboard: React.FC<NeuroProfileDashboardProps> = ({
  user,
  lang,
  onBack,
  onAddToast
}) => {
  const { profile, loading, updateProfile, addEvolutionLog } = useNeuroProfileManager(user?.id);
  const [selectedProfileId, setSelectedProfileId] = React.useState<NeuroProfileType>('normal');

  React.useEffect(() => {
    if (profile?.neuroType) {
      setSelectedProfileId(profile.neuroType);
    } else if (user?.neuroMode) {
      setSelectedProfileId(user.neuroMode as NeuroProfileType);
    }
  }, [profile, user]);

  const activeSpec = neuroProfiles[selectedProfileId] || neuroProfiles.normal;

  const handleActivateProfile = async (targetType: NeuroProfileType) => {
    if (!user?.id) return;
    try {
      // 1. Update user_neuro_profile in Firestore
      const spec = neuroProfiles[targetType];
      await updateProfile(user.id, {
        neuroType: targetType,
        currentJourney: lang === 'pt' ? spec.journeyNamePt : spec.journeyNameEn,
        lastInteraction: new Date().toISOString()
      });

      // 2. Also update primary user.neuroMode in Firestore for global coherence
      const userRef = doc(db, 'users', user.id);
      await updateDoc(userRef, {
        neuroMode: targetType
      });

      // Log evolution activity
      await addEvolutionLog(user.id, 20, `Ativou Perfil Adaptativo: ${targetType.toUpperCase()}`, 100);

      onAddToast({
        type: 'level',
        title: lang === 'pt' ? 'Mente Adaptada' : 'Aura Synchronized',
        description: lang === 'pt' 
          ? `Perfil ${spec.labelPt} ativado com sucesso em seu santuário.`
          : `Profile ${spec.labelEn} successfully locked to your sanctuary.`
      });
    } catch (err) {
      console.error('Failed to update profiles: ', err);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#070b14] text-[#E0E7E5] px-4 py-8 md:px-8 space-y-8 select-none relative pb-28">
      {/* Background gradients mirroring cognitive fields */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[#8B5CF6]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 left-0 w-[300px] h-[300px] bg-teal-400/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Header bar */}
      <div className="flex justify-between items-center bg-[#0d1324]/50 border border-[#1e2a4a]/45 rounded-[2rem] p-5 shadow-lg relative">
        <div className="flex items-center gap-3.5 text-left">
          <button 
            onClick={onBack}
            className="p-3 bg-[#0d1222] border border-[#1d2645] hover:bg-[#121932] rounded-2xl cursor-pointer transition-all hover:-translate-x-1 duration-300"
            title={lang === 'pt' ? 'Voltar para Home' : 'Back to Sanctuary'}
          >
            <ArrowLeft className="w-4 h-4 text-teal-400" />
          </button>
          <div className="flex flex-col">
            <span className="text-[9px] font-mono tracking-[0.3em] font-medium text-teal-400 uppercase">SISTEMA INTEGRADO NEUROPCH</span>
            <h1 className="text-xl md:text-2xl font-serif font-black text-stone-100 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-teal-400 animate-pulse" />
              {lang === 'pt' ? 'Centro de Adaptação Cognitiva' : 'Neuro-Adaptation Center'}
            </h1>
          </div>
        </div>

        {profile && (
          <div className="hidden sm:flex items-center gap-2.5 bg-teal-500/10 border border-teal-500/20 px-4 py-2 rounded-2xl">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
            <span className="text-[10px] font-mono text-teal-400 font-bold uppercase tracking-wider">
              {lang === 'pt' ? `Ativo: ${profile.neuroType.toUpperCase()}` : `Active: ${profile.neuroType.toUpperCase()}`}
            </span>
          </div>
        )}
      </div>

      {/* Quick intro layout */}
      <div className="bg-gradient-to-r from-[#0d1324] to-[#121932] border border-[#1a2542] rounded-[2rem] p-7 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5 text-left max-w-xl">
          <span className="text-[9px] font-mono tracking-widest text-[#8b5cf6] font-bold uppercase">FASE 1: MOTOR INTELIGENTE</span>
          <h2 className="text-xl font-serif font-black text-stone-100">{lang === 'pt' ? 'Identificação Genotípica Adaptativa' : 'Dynamic Mind-Type Alignment'}</h2>
          <p className="text-xs text-slate-400 leading-relaxed font-light">
            {lang === 'pt' 
              ? 'Abaixo, escolha um dos 9 perfis suportados para remodelar instantaneamente todo o comportamento estético, tamanho de fontes, ritmos, diretrizes e jornadas internas do Voz Interior.' 
              : 'Select one of the 9 custom neuro-profiles below to automatically realign styling, screen padding, animation speeds, and verbal suggestion tones.'}
          </p>
        </div>
        <div className="px-5 py-3 bg-[#080b15]/60 border border-[#1d2745] rounded-2xl flex flex-col items-center">
          <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">{lang === 'pt' ? 'Seu Nível' : 'Your Level'}</span>
          <span className="text-2xl font-serif font-black text-teal-400">LVL {profile?.currentLevel || 1}</span>
        </div>
      </div>

      {/* Primary Selector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: 9 Profiles Switcher Buttons */}
        <div className="lg:col-span-1 space-y-3.5 text-left">
          <span className="text-[10px] font-mono text-slate-500 tracking-wider uppercase font-semibold">{lang === 'pt' ? '💡 Selecionar Genótipo' : '💡 Choose Genotype'}</span>
          <div className="grid grid-cols-1 gap-2.5">
            {(Object.keys(neuroProfiles) as NeuroProfileType[]).map((type) => {
              const spec = neuroProfiles[type];
              const isSelected = selectedProfileId === type;
              const isCurrentActive = profile?.neuroType === type;
              
              return (
                <button
                  key={type}
                  onClick={() => setSelectedProfileId(type)}
                  className={`w-full p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between pointer-events-auto cursor-pointer ${
                    isSelected 
                      ? 'bg-[#1b253f] border-[#3b82f6] shadow-md shadow-[#3b82f6]/10 transform translate-x-1.5'
                      : 'bg-[#0b0e17] border-[#16213c] hover:border-slate-700/60 hover:bg-[#0f1423]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{spec.labelPt.split(' ')[0]}</span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-stone-100">
                        {lang === 'pt' ? spec.labelPt.replace(/^\S+\s*/, '') : spec.labelEn.replace(/^\S+\s*/, '')}
                      </span>
                      <span className="text-[8px] font-mono text-slate-500 uppercase tracking-wider mt-0.5">
                        {spec.badge}
                      </span>
                    </div>
                  </div>

                  {isCurrentActive && (
                    <span className="text-[8.5px] font-mono bg-emerald-500/10 border border-emerald-500/25 px-2 py-0.5 rounded-full text-emerald-400 font-bold uppercase tracking-wider">
                      {lang === 'pt' ? 'Ativo' : 'Active'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Col: Deep Profile Adaptive Parameters & Activation */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Card detailing the active design specs */}
          <div className="p-7 rounded-[2rem] bg-[#0d1324] border border-[#1e2a4a] shadow-xl relative overflow-hidden space-y-6 text-left">
            <div className="absolute top-0 right-0 w-[200px] h-[200px]" style={{ background: `radial-gradient(circle, ${activeSpec.colorPalette.accent}05 0%, transparent 70%)` }} />
            
            {/* Spec Title & Save */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#1b253f]/60 pb-5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{activeSpec.labelPt.split(' ')[0]}</span>
                  <h3 className="text-xl font-serif font-black text-stone-100">
                    {lang === 'pt' ? activeSpec.labelPt.replace(/^\S+\s*/, '') : activeSpec.labelEn.replace(/^\S+\s*/, '')}
                  </h3>
                </div>
                <p className="text-xs text-slate-400">{lang === 'pt' ? `Genótipo adaptável sintonizado com o modo ${activeSpec.badge}.` : `Calibrated for comfort using ${activeSpec.badge} mechanics.`}</p>
              </div>

              {profile?.neuroType === selectedProfileId ? (
                <div className="py-2.5 px-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono tracking-widest font-bold rounded-xl uppercase flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{lang === 'pt' ? 'Ativado no Perfil' : 'Fully Synchronized'}</span>
                </div>
              ) : (
                <button
                  onClick={() => handleActivateProfile(selectedProfileId)}
                  className="py-3 px-6 bg-teal-400 hover:bg-teal-300 text-stone-950 font-mono text-xs uppercase tracking-widest font-black rounded-2xl cursor-pointer pointer-events-auto transition-all shadow-md shadow-teal-400/10 active:scale-95"
                >
                  {lang === 'pt' ? 'Ativar no Meu Perfil' : 'Activate this Profile'}
                </button>
              )}
            </div>

            {/* Spec details grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              
              {/* Design parameters checklist */}
              <div className="space-y-4">
                <span className="text-[9px] font-mono text-slate-500 tracking-wider uppercase block">⚙️ ADAPTAÇÃO DO ECOSSISTEMA</span>
                
                <div className="space-y-3">
                  <div className="p-3 bg-[#080b14] border border-[#16213c] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-teal-400" />
                      <span className="text-xs font-serif text-slate-300">{lang === 'pt' ? 'Paleta de Cores' : 'Exclusive Colors'}</span>
                    </div>
                    <div className="flex gap-1.5">
                      <span className="w-4.5 h-4.5 rounded-full border border-stone-800" style={{ backgroundColor: activeSpec.colorPalette.bg }} title="Background" />
                      <span className="w-4.5 h-4.5 rounded-full border border-stone-800" style={{ backgroundColor: activeSpec.colorPalette.card }} title="Cards" />
                      <span className="w-4.5 h-4.5 rounded-full border border-stone-800" style={{ backgroundColor: activeSpec.colorPalette.accent }} title="Accent" />
                    </div>
                  </div>

                  <div className="p-3 bg-[#080b14] border border-[#16213c] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-teal-400" />
                      <span className="text-xs font-serif text-slate-300">{lang === 'pt' ? 'Tamanho de Fontes' : 'Dynamic Sizing'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-teal-400 uppercase font-bold">{activeSpec.typography.fontSize === '110%' ? 'Large / Letras Gigantes' : 'Medium / Padrão'}</span>
                  </div>

                  <div className="p-3 bg-[#080b14] border border-[#16213c] rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-[#8b5cf6]" />
                      <span className="text-xs font-serif text-slate-300">{lang === 'pt' ? 'Ritmo de Animações' : 'Motion Cadence'}</span>
                    </div>
                    <span className="text-[10px] font-mono text-[#8b5cf6] uppercase font-bold">{activeSpec.animationMode.toUpperCase()}</span>
                  </div>

                  <div className="p-3 bg-[#080b14] border border-[#16213c] rounded-xl flex flex-col gap-1 text-left">
                    <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest">{lang === 'pt' ? 'Tom de Linguagem PCH' : 'PCH Suggestive Tone'}</span>
                    <span className="text-xs font-serif text-stone-200 mt-1 italic">
                      "{lang === 'pt' ? activeSpec.tonePt : activeSpec.toneEn}"
                    </span>
                  </div>
                </div>
              </div>

              {/* Dynamic Action Exercises */}
              <div className="space-y-4">
                <span className="text-[9px] font-mono text-slate-500 tracking-wider uppercase block">🧘 EXERCÍCIOS DE CO-REGULAÇÃO EXCLUSIVOS</span>
                <div className="space-y-2.5">
                  {(lang === 'pt' ? activeSpec.exercisesPt : activeSpec.exercisesEn).map((ex, idx) => (
                    <div key={idx} className="p-3 bg-[#080c18] border border-[#16213d]/80 rounded-xl flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-teal-500/10 text-teal-400 font-mono text-[9px] flex items-center justify-center shrink-0 border border-teal-500/20 font-bold">
                        0{idx + 1}
                      </span>
                      <span className="text-xs text-stone-300 font-sans leading-relaxed">
                        {ex}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Smart Recommendations */}
            <div className="border-t border-[#1b253f]/60 pt-5 space-y-3">
              <span className="text-[9px] font-mono text-slate-500 tracking-wider uppercase block">💡 RECOMENDAÇÕES INTELIGENTES</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {(lang === 'pt' ? activeSpec.recommendationsPt : activeSpec.recommendationsEn).map((rec, idx) => (
                  <div key={idx} className="p-3.5 bg-[#080b14]/40 border border-[#16213d]/60 rounded-xl text-left">
                    <p className="text-[11px] text-slate-400 font-serif leading-relaxed">
                      {rec}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Journey Information */}
            <div className="p-4 bg-gradient-to-r from-teal-500/5 to-[#1a2542]/10 border border-teal-500/20 rounded-2xl flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Target className="w-5 h-5 text-teal-400 shrink-0" />
                <div className="flex flex-col">
                  <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest">{lang === 'pt' ? 'Jornada Atribuída' : 'Assigned Journey Path'}</span>
                  <span className="text-xs font-serif font-black text-stone-200">
                    {lang === 'pt' ? activeSpec.journeyNamePt : activeSpec.journeyNameEn}
                  </span>
                </div>
              </div>
              <span className="text-[9px] font-mono bg-teal-500/15 text-teal-400 px-3 py-1 rounded-full border border-teal-500/30 font-bold uppercase tracking-wider shrink-0">
                {lang === 'pt' ? 'Própria' : 'Exclusives'}
              </span>
            </div>

          </div>

          {/* Historical Evolution / Tracking logs */}
          <div className="p-6 rounded-[2rem] bg-[#0d1324]/50 border border-[#1e2a4a]/75 shadow-xl text-left space-y-4">
            <span className="text-[9px] font-mono text-slate-500 tracking-wider uppercase block">📊 HISTÓRICO DE SINTONIA EVOLUTIVA</span>
            {profile?.evolutionHistory && profile.evolutionHistory.length > 0 ? (
              <div className="space-y-2.5">
                {profile.evolutionHistory.slice(-4).reverse().map((log, idx) => (
                  <div key={idx} className="p-3 bg-[#070b14] border border-[#16213c] rounded-xl flex justify-between items-center text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-lg">⭐</span>
                      <div className="flex flex-col">
                        <span className="font-serif font-medium text-stone-200">{log.activity}</span>
                        <span className="text-[8.5px] font-mono text-slate-500">{new Date(log.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono font-bold text-amber-500 px-3 py-1 bg-amber-500/10 rounded-full border border-amber-500/20">
                      +{log.pointsGained} XP
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-light italic">
                {lang === 'pt' 
                  ? 'Nenhum log de evolução gerado ainda. Complete atividades do sanatório para catalogar seu balanço emocional.' 
                  : 'No evolution milestones achieved today yet. Complete sanctuary habits to record progress logs here.'}
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
export default NeuroProfileDashboard;
