import React, { useState, useEffect } from 'react';
import { User, Language } from '../types';
import { Award, ShieldCheck, Mail, Calendar, Sparkles, Sliders, MessageSquare, Heart, Smile } from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ResonanceInsights } from './ResonanceInsights';
import { MOOD_TAGS } from './JournalModal';

interface UserProfileViewProps {
  user: User | null;
  lang: Language;
  onNavigateToSettings: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ user, lang, onNavigateToSettings }) => {
  if (!user) return null;

  const [journalEntries, setJournalEntries] = useState<any[]>([]);

  useEffect(() => {
    let unsubscribe = () => {};
    const currentUser = auth.currentUser;
    if (currentUser) {
      const colRef = collection(db, 'users', user.id, 'journals');
      unsubscribe = onSnapshot(colRef, (snapshot) => {
        const fetched: any[] = [];
        snapshot.forEach((snapDoc) => {
          const d = snapDoc.data();
          fetched.push({
            id: snapDoc.id,
            date: d.date,
            text: d.text,
            moodTags: d.moodTags || [],
            quickNote: d.quickNote || ''
          });
        });
        // Sort chronologically descending
        fetched.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setJournalEntries(fetched);
      }, (err) => {
        console.error("Failed to sync sentiment timeline:", err);
      });
    } else {
      // Offline/Local storage fallback
      try {
        const stored = localStorage.getItem('pch_journal_entries');
        if (stored) {
          setJournalEntries(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load local journal entries", e);
      }
    }
    
    return () => unsubscribe();
  }, [user.id]);

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

      {/* Resonance Insights (Harmonic Progress Line Chart) */}
      <ResonanceInsights user={user} lang={lang} />

      {/* Linha do Tempo de Sentimentos */}
      <div className="bg-stone-900/30 border border-stone-850/50 rounded-3xl p-5 space-y-4 backdrop-blur-md">
        <div className="flex items-center space-x-2 border-b border-stone-950 pb-2.5">
          <Heart className="w-4 h-4 text-pink-400" />
          <h4 className="text-[9px] uppercase text-stone-300 tracking-[0.2em] font-bold">
            {lang === 'pt' ? 'Linha do Tempo de Sentimentos' : 'Sentiment Harmony'}
          </h4>
        </div>

        {journalEntries.length === 0 ? (
          <div className="py-6 text-center">
            <Smile className="w-5 h-5 text-stone-600 mx-auto mb-2 animate-pulse" />
            <p className="text-[10px] text-stone-500 italic max-w-[240px] mx-auto leading-normal">
              {lang === 'pt'
                ? 'Como está seu fluxo emocional? Vá ao Diário e registre seus sentimentos.'
                : 'How is your emotional flow? Go to the Journal and log your feelings.'}
            </p>
          </div>
        ) : (
          <div className="relative pl-4 space-y-4 border-l border-stone-850/65 mt-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
            {journalEntries.slice(0, 5).map((entry, index) => {
              // Find first mood tag's info
              const primaryTagId = entry.moodTags?.[0];
              const tagInfo = primaryTagId ? MOOD_TAGS.find(m => m.id === primaryTagId) : null;
              
              const formatEntryDate = (dString: string) => {
                const date = new Date(dString);
                return date.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              };
              
              return (
                <div key={entry.id || index} className="relative">
                  {/* Timeline bullet indicator */}
                  <span className="absolute -left-[20.5px] top-1.5 w-1.5 h-1.5 rounded-full border border-stone-950 bg-stone-500 ring-4 ring-stone-950 flex items-center justify-center">
                    {tagInfo && <span className="w-1 h-1 rounded-full bg-[#14b8a6]" />}
                  </span>
                  
                  <div className="space-y-1 bg-stone-950/40 p-2.5 rounded-2xl border border-stone-900/60">
                    <div className="flex justify-between items-center">
                      <span className="text-[8px] font-mono text-stone-500">{formatEntryDate(entry.date)}</span>
                    </div>

                    {entry.moodTags && entry.moodTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {entry.moodTags.map((tId: string) => {
                          const tag = MOOD_TAGS.find(m => m.id === tId);
                          return tag ? (
                            <span key={tId} className={`px-1.5 py-0.5 rounded text-[8px] border font-medium ${tag.color}`}>
                              {lang === 'pt' ? tag.labelPt : tag.labelEn}
                            </span>
                          ) : null;
                        })}
                      </div>
                    )}

                    {entry.quickNote && (
                      <p className="text-[10px] text-stone-300 italic font-light leading-normal">
                        "{entry.quickNote}"
                      </p>
                    )}

                    {!entry.quickNote && entry.text && (
                      <p className="text-[9px] text-stone-400 font-light truncate leading-normal">
                        {entry.text}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Visual Progress bars for each 'resonance' category */}
      <div className="bg-stone-900/35 border border-stone-850/50 p-5 rounded-3xl space-y-4 backdrop-blur-md">
        <h4 className="text-[9px] uppercase text-stone-500 tracking-[0.2em] font-bold border-b border-stone-900 pb-2">
          {lang === 'pt' ? 'Ressonância & Crescimento' : 'Resonance Categories'}
        </h4>
        
        <div className="space-y-4">
          {([
            {
              id: 'embrace',
              name: lang === 'pt' ? 'Acolhimento & Calma' : 'Embrace & Calm',
              desc: lang === 'pt' ? 'Pensamentos e regulação de ansiedade' : 'Anxiety soothing and calm mapping',
              score: points === 0 ? 15 : Math.max(10, (points * 12) % 100),
              color: 'from-amber-500 to-orange-400'
            },
            {
              id: 'reflection',
              name: lang === 'pt' ? 'Reflexão Cognitiva' : 'Cognitive Reflection',
              desc: lang === 'pt' ? 'Autoconhecimento e processamento' : 'Self-awareness and mental alignment',
              score: points === 0 ? 20 : Math.max(10, (points * 8) % 100),
              color: 'from-teal-500 to-emerald-400'
            },
            {
              id: 'metaphor',
              name: lang === 'pt' ? 'Sintonia Poética' : 'Poetic Metaphors',
              desc: lang === 'pt' ? 'Integração de símbolos terapêuticos' : 'Connection with sensory metaphors',
              score: points === 0 ? 10 : Math.max(10, (points * 10) % 100),
              color: 'from-fuchsia-500 to-pink-500'
            },
            {
              id: 'breathing',
              name: lang === 'pt' ? 'Consciência do Sopro' : 'Resonant Breathing',
              desc: lang === 'pt' ? 'Controle síncrono da respiração' : 'Rhythmic breathing and focus control',
              score: points === 0 ? 25 : Math.max(10, (points * 15) % 100),
              color: 'from-sky-500 to-indigo-500'
            },
            {
              id: 'action',
              name: lang === 'pt' ? 'Ação Suave' : 'Gentle Human Actions',
              desc: lang === 'pt' ? 'Integração social e gestos generosos' : 'Social connection and support actions',
              score: points === 0 ? 15 : Math.max(10, (points * 7) % 100),
              color: 'from-emerald-400 to-teal-400'
            }
          ]).map((cat) => (
            <div key={cat.id} className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-stone-300">{cat.name}</span>
                <span className="font-mono text-stone-500">{cat.score}%</span>
              </div>
              
              <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
                <div 
                  className={`h-full bg-gradient-to-r ${cat.color} transition-all duration-1000`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
              <p className="text-[8px] text-stone-600 leading-normal">{cat.desc}</p>
            </div>
          ))}
        </div>
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
