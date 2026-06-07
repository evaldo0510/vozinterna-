import React, { useState, useEffect } from 'react';
import { User, Language } from '../types';
import { Award, ShieldCheck, Mail, Calendar, Sparkles, Sliders, MessageSquare, Heart, Smile, FileDown } from 'lucide-react';
import { jsPDF } from 'jspdf';
import { collection, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { ResonanceInsights } from './ResonanceInsights';
import { InnerHarmonyChart } from './InnerHarmonyChart';
import { MOOD_TAGS } from './JournalModal';

interface JourneyMedal {
  id: string;
  titlePt: string;
  titleEn: string;
  descPt: string;
  descEn: string;
  requirementPt: string;
  requirementEn: string;
  color: string;
  icon: string;
  checkUnlocked: (userPoints: number, entriesCount: number, badgesList: string[]) => boolean;
}

const JOURNEY_MEDALS: JourneyMedal[] = [
  {
    id: 'explorer',
    titlePt: 'Explorador da Alma',
    titleEn: 'Soul Explorer',
    descPt: 'Manifesto PCH concluído e sintonizado com o santuário.',
    descEn: 'PCH manifesto completed and custom sanctuary tuned.',
    requirementPt: 'Registo e perfil de adaptação completo.',
    requirementEn: 'Registered and completed adaptive preferences.',
    color: 'from-teal-500/10 to-teal-400/10 text-teal-400 border-teal-500/20 shadow-teal-500/5',
    icon: '🍃',
    checkUnlocked: () => true
  },
  {
    id: 'breath',
    titlePt: 'Sopro Cósmico',
    titleEn: 'Cosmic Breath',
    descPt: 'Foco síncrono e controle respiratório harmonioso.',
    descEn: 'Mindful rhythmic breathing done in safe, focused sessions.',
    requirementPt: 'Alcançar 100 pontos de experiência (XP).',
    requirementEn: 'Reach 100 Experience points (XP).',
    color: 'from-amber-500/10 to-amber-400/10 text-amber-400 border-amber-500/20 shadow-amber-500/5',
    icon: '🌬️',
    checkUnlocked: (pts, entries, badges) => pts >= 100 || badges.includes('Sopro Cósmico') || badges.includes('Cosmic Breath')
  },
  {
    id: 'gardener',
    titlePt: 'Cultivador do Éden',
    titleEn: 'Eden Gardener',
    descPt: 'Dedicação diária e germinação das sementes botânicas.',
    descEn: 'Cultivated emotional flowers inside your inner sanctuary.',
    requirementPt: 'Alcançar 200 pontos de experiência (XP).',
    requirementEn: 'Reach 200 Experience points (XP).',
    color: 'from-emerald-500/10 to-emerald-400/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5',
    icon: '🌱',
    checkUnlocked: (pts, entries, badges) => pts >= 200 || badges.includes('Semeador do Éden') || badges.includes('Eden Seeds')
  },
  {
    id: 'diary',
    titlePt: 'Confissão Íntima',
    titleEn: 'Written Confession',
    descPt: 'Reflexões profundas com sentimentos sintonizados no diário.',
    descEn: 'Shared deep feelings in your confidential diary.',
    requirementPt: 'Ter pelo menos 3 diários guardados.',
    requirementEn: 'Have at least 3 journal entries recorded.',
    color: 'from-purple-500/10 to-purple-400/10 text-purple-400 border-purple-500/20 shadow-purple-500/5',
    icon: '📓',
    checkUnlocked: (pts, entries, badges) => entries >= 3 || pts >= 300 || badges.includes('Verdade Escrita') || badges.includes('Written Truth')
  },
  {
    id: 'resonance',
    titlePt: 'Sinfonia Mental',
    titleEn: 'Mental Symphony',
    descPt: 'Sinergia cognitiva e alinhamento de ressonância profunda.',
    descEn: 'Achieved high harmonic alignment across categories.',
    requirementPt: 'Alcançar 400 pontos de experiência (XP).',
    requirementEn: 'Reach 400 Experience points (XP).',
    color: 'from-pink-500/10 to-rose-450/10 text-pink-400 border-pink-500/20 shadow-pink-500/5',
    icon: '✨',
    checkUnlocked: (pts, entries, badges) => pts >= 400 || badges.includes('Voz da Alma') || badges.includes('Soul Voice')
  },
  {
    id: 'light',
    titlePt: 'Guardião de Luz',
    titleEn: 'Beacon of Light',
    descPt: 'Acesso pleno ao autoconhecimento e decompressão de burnout.',
    descEn: 'Accessed the peak of mindfulness and emotional wisdom.',
    requirementPt: 'Alcançar 500 pontos de experiência (XP).',
    requirementEn: 'Reach 500 Experience points (XP).',
    color: 'from-fuchsia-500/10 to-violet-500/10 text-fuchsia-400 border-fuchsia-500/20 shadow-fuchsia-500/5',
    icon: '👑',
    checkUnlocked: (pts, entries, badges) => pts >= 500 || badges.includes('Guardião da Luz') || badges.includes('Beacon of Light')
  }
];

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
      case 'adhd':
      case 'tdah': return lang === 'pt' ? 'Foco Blindado TDAH ⚡' : 'ADHD Laser Focus ⚡';
      case 'autism':
      case 'autismo': return lang === 'pt' ? 'Roteiro Previsível Autismo 🧩' : 'Predictable Autism Route 🧩';
      case 'dyslexia':
      case 'dislexia': return lang === 'pt' ? 'Leitura de Dislexia Compensada 📚' : 'Compensated Dyslexia Reading 📚';
      case 'anxiety':
      case 'ansiedade': return lang === 'pt' ? 'Calma de Ansiedade 💕' : 'Anxiety Calming Haven 💕';
      case 'senior':
      case 'idoso': return lang === 'pt' ? 'Acessibilidade Idoso 👵👴' : 'Enlarged Senior Display 👵👴';
      case 'burnout': return lang === 'pt' ? 'Descompressão de Burnout 🌌' : 'Burnout Adrenal Recovery 🌌';
      case 'adolescente': return lang === 'pt' ? 'Expressão Jovem 🪐' : 'Young Expression Cyber 🪐';
      case 'grief':
      case 'luto': return lang === 'pt' ? 'Acolhimento ao Luto 🌹' : 'Grief Solace Remembrance 🌹';
      case 'cristao': return lang === 'pt' ? 'Fé Contemplativa ⛪' : 'Faith Devotional Contemplation ⛪';
      case 'tea_tdah': return lang === 'pt' ? 'TEA + TDAH Sinergia' : 'ASD + ADHD Dual Symphony';
      default: return lang === 'pt' ? 'Mente Plena Natural 🍃' : 'Standard Natural Sanctuary 🍃';
    }
  };

  const translateGoal = (goal: string | undefined) => {
    switch(goal) {
      case 'autoconhecimento': return lang === 'pt' ? '🧘 Autoconhecimento Profundo' : '🧘 Deep Self-knowledge';
      case 'organizacao': return lang === 'pt' ? '📅 Organização & Clareza' : '📅 Calm Routines & Focus';
      case 'apoio': return lang === 'pt' ? '🫂 Apoio Emocional Seguro' : '🫂 Secure Emotional Support';
      case 'talentos': return lang === 'pt' ? '✨ Desenvolver Talentos & Dons' : '✨ Talent & Potential Development';
      case 'companhia_vocal': return lang === 'pt' ? '🎤 Companhia Vocal Ativa' : '🎤 Spoken Conversational Companion';
      case 'reabilitacao': return lang === 'pt' ? '🧩 Reabilitação & Terapia Cognitiva' : '🧩 Cognitive Therapy & Memory';
      default: return lang === 'pt' ? '🧘 Autoconhecimento Profundo' : '🧘 Deep Self-knowledge';
    }
  };

  const exportPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      let y = 20;
      const leftMargin = 20;
      const pageHeight = 297;
      
      const checkPageOverflow = (neededHeight: number) => {
        if (y + neededHeight > pageHeight - 20) {
          doc.addPage();
          y = 20;
        }
      };

      // Header block
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.setTextColor(20, 184, 166); // Teal primary color matching app theme
      doc.text(lang === 'pt' ? 'Voz Interior - Relatorio PCH' : 'Voz Interior - PCH Report', leftMargin, y);
      y += 8;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(115, 115, 115); // Neutral text
      doc.text(lang === 'pt' ? 'Sua Jornada de Autoconhecimento e Ressonancia Cognitiva' : 'Your Self-Knowledge and Cognitive Resonance Journey', leftMargin, y);
      y += 12;
      
      // Horizontal divider
      doc.setDrawColor(229, 229, 229);
      doc.line(leftMargin, y, 190, y);
      y += 10;
      
      // User Profile details
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(38, 38, 38);
      doc.text(lang === 'pt' ? 'Perfil do Explorador' : 'Explorer Profile', leftMargin, y);
      y += 8;
      
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(64, 64, 64);
      
      doc.text(`${lang === 'pt' ? 'Nome' : 'Name'}: ${user.name}`, leftMargin, y);
      y += 6;
      doc.text(`${lang === 'pt' ? 'E-mail' : 'Email'}: ${user.email}`, leftMargin, y);
      y += 6;
      doc.text(`${lang === 'pt' ? 'Plano' : 'Plan'}: ${user.plan === 'guardian' ? 'Guardian (Guardiao)' : 'Standard (Membro)'}`, leftMargin, y);
      y += 6;
      
      doc.text(`${lang === 'pt' ? 'Nivel de Progresso' : 'Progress Level'}: Nivel ${level} (${points} XP)`, leftMargin, y);
      y += 6;
      
      const cleanNeuro = translateNeuro(user.neuroMode).replace(/[^\x00-\x7F]/g, "").trim(); // strip emojis for PDF safety
      const cleanComm = translateComm(user.communicationPreference).replace(/[^\x00-\x7F]/g, "").trim(); // strip emojis for PDF safety
      
      doc.text(`${lang === 'pt' ? 'Estilo Cognitivo' : 'Cognitive Style'}: ${cleanNeuro}`, leftMargin, y);
      y += 6;
      doc.text(`${lang === 'pt' ? 'Canal Preferencial' : 'Preferred Channel'}: ${cleanComm}`, leftMargin, y);
      y += 12;
      
      // Section 1: Resonance Scores
      checkPageOverflow(40);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(38, 38, 38);
      doc.text(lang === 'pt' ? 'Categorias de Ressonancia' : 'Resonance Categories', leftMargin, y);
      y += 8;
      
      const categories = [
        {
          name: lang === 'pt' ? 'Acolhimento & Calma' : 'Embrace & Calm',
          score: points === 0 ? 15 : Math.max(10, (points * 12) % 100),
          desc: lang === 'pt' ? 'Fluxos de autocompaixao e atenuacao de ansiedade.' : 'Anxiety soothing and inner self-compassion mapping.'
        },
        {
          name: lang === 'pt' ? 'Reflexao Cognitiva' : 'Cognitive Reflection',
          score: points === 0 ? 20 : Math.max(10, (points * 8) % 100),
          desc: lang === 'pt' ? 'Analise objetiva e alinhamento de clareza mental.' : 'Self-awareness, deep logical clarity and mental alignment.'
        },
        {
          name: lang === 'pt' ? 'Sintonia Poetica' : 'Poetic Metaphors',
          score: points === 0 ? 10 : Math.max(10, (points * 10) % 100),
          desc: lang === 'pt' ? 'Integracao de simbolos imageticos e metaforas curativas.' : 'Connection with sensory metaphors and symbolic representations.'
        },
        {
          name: lang === 'pt' ? 'Consciencia do Sopro' : 'Resonant Breathing',
          score: points === 0 ? 25 : Math.max(10, (points * 15) % 100),
          desc: lang === 'pt' ? 'Estados de foco sincrono e controle respiratorio.' : 'Rhythmic breathing feedback, pace and focus control.'
        },
        {
          name: lang === 'pt' ? 'Acao Suave' : 'Gentle Human Actions',
          score: points === 0 ? 15 : Math.max(10, (points * 7) % 100),
          desc: lang === 'pt' ? 'Abertura social e gestos generosos.' : 'Social empathy, connection and support actions.'
        }
      ];
      
      categories.forEach(cat => {
        checkPageOverflow(18);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(20, 184, 166);
        doc.text(`${cat.name}: ${cat.score}%`, leftMargin, y);
        y += 5;
        
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(82, 82, 82);
        doc.text(cat.desc, leftMargin, y);
        y += 7;
      });
      
      y += 5;
      
      // Section 2: JournalEntries / Timeline
      checkPageOverflow(30);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.setTextColor(38, 38, 38);
      doc.text(lang === 'pt' ? 'Historico de Sentimentos Registrados' : 'Tracked Sentiment History', leftMargin, y);
      y += 8;
      
      if (journalEntries.length === 0) {
        doc.setFont("helvetica", "italic");
        doc.setFontSize(10);
        doc.setTextColor(115, 115, 115);
        doc.text(lang === 'pt' ? 'Nenhum registro emocional encontrado.' : 'No emotional records logged.', leftMargin, y);
      } else {
        const MOOD_TAGS_MAP: Record<string, { labelPt: string, labelEn: string }> = {
          joy: { labelPt: 'Alegria', labelEn: 'Joy' },
          sadness: { labelPt: 'Tristeza', labelEn: 'Sadness' },
          anger: { labelPt: 'Raiva', labelEn: 'Anger' },
          fear: { labelPt: 'Medo', labelEn: 'Fear' },
          calm: { labelPt: 'Calma', labelEn: 'Calm' },
          anxiety: { labelPt: 'Ansiedade', labelEn: 'Anxiety' },
          fatigue: { labelPt: 'Exaustao', labelEn: 'Fatigue' },
          hope: { labelPt: 'Esperanca', labelEn: 'Hope' }
        };

        const getMoodTagLabel = (tId: string) => {
          const m = MOOD_TAGS_MAP[tId];
          return m ? (lang === 'pt' ? m.labelPt : m.labelEn) : tId;
        };

        journalEntries.forEach((entry, idx) => {
          checkPageOverflow(32);
          doc.setFont("helvetica", "bold");
          doc.setFontSize(9.5);
          doc.setTextColor(64, 64, 64);
          
          const entryDate = new Date(entry.date).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
          
          doc.text(`[#${idx + 1}] ${entryDate}`, leftMargin, y);
          y += 5;
          
          // Mood tags
          if (entry.moodTags && entry.moodTags.length > 0) {
            doc.setFont("helvetica", "italic");
            doc.setFontSize(9);
            doc.setTextColor(120, 113, 108);
            
            const tagsFormatted = (entry.moodTags as string[]).map(tId => getMoodTagLabel(tId)).join(', ');
            doc.text(`${lang === 'pt' ? 'Sentimentos' : 'Feelings'}: ${tagsFormatted}`, leftMargin + 4, y);
            y += 5;
          }
          
          doc.setFont("helvetica", "normal");
          doc.setFontSize(9.5);
          doc.setTextColor(38, 38, 38);
          
          if (entry.quickNote) {
            const splitNote = doc.splitTextToSize(`"${entry.quickNote}"`, 160);
            doc.text(splitNote, leftMargin + 4, y);
            y += (splitNote.length * 4.5) + 1;
          }
          
          if (entry.text) {
            const splitText = doc.splitTextToSize(entry.text, 160);
            doc.text(splitText, leftMargin + 4, y);
            y += (splitText.length * 4.5) + 1;
          }
          
          y += 3; // spacer between items
        });
      }
      
      // Save output
      doc.save(lang === 'pt' ? 'voz_interior_jornada_pch.pdf' : 'inner_voice_pch_journey.pdf');
    } catch (err) {
      console.error("PDF generation failed:", err);
    }
  };

  const userBadges = (user as any).badges || ['Explorador Interior'];

  return (
    <div className="w-full max-w-md mx-auto space-y-6 animate-fade-in p-2">
      {/* Visual Identity Profile Card */}
      <div className="neu-card rounded-3xl p-6 relative overflow-hidden">
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

      {/* Export to PDF Action button */}
      <button
        onClick={exportPDF}
        className="w-full py-3 px-4 rounded-2xl bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/20 hover:border-teal-500/40 text-teal-300 hover:text-teal-200 text-xs font-bold font-mono uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
      >
        <FileDown className="w-4 h-4 text-teal-400 animate-pulse" />
        <span>{lang === 'pt' ? 'Exportar Relatório PDF' : 'Export PDF Report'}</span>
      </button>

      {/* Gamification Level Status Card */}
      <div className="glass-panel p-6 rounded-3xl space-y-4">
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

      {/* Índice de Sintonia Interior (ISI) Chart using recharts */}
      <InnerHarmonyChart user={user} lang={lang} />

      {/* Linha do Tempo de Sentimentos */}
      <div className="neu-card rounded-3xl p-5 space-y-4">
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
      <div className="glass-panel p-5 rounded-3xl space-y-4">
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
      <div className="neu-card rounded-3xl p-5 space-y-4">
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

          <div className="flex items-center space-x-3 text-xs pt-2 border-t border-stone-900/60">
            <Smile className="w-4 h-4 text-teal-400 shrink-0" />
            <div>
              <p className="text-[10px] uppercase text-stone-500 tracking-wider font-semibold">{lang === 'pt' ? 'Objetivo do Cultivo' : 'Cultivation Goal'}</p>
              <p className="text-stone-300 font-semibold text-xs mt-0.5">{translateGoal(user.seekingGoal)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badges / Achievements catalog (Medalhas de Jornada) */}
      <div className="glass-panel rounded-3xl p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-stone-900 pb-2.5">
          <h4 className="text-[9px] uppercase text-stone-300 tracking-[0.2em] font-bold">
            {lang === 'pt' ? 'Medalhas de Jornada 🏆' : 'Journey Medals 🏆'}
          </h4>
          <span className="text-[9px] font-mono text-stone-500 uppercase">
            {lang === 'pt' 
              ? `${JOURNEY_MEDALS.filter(m => m.checkUnlocked(points, journalEntries.length, userBadges)).length} de ${JOURNEY_MEDALS.length} Conquistadas` 
              : `${JOURNEY_MEDALS.filter(m => m.checkUnlocked(points, journalEntries.length, userBadges)).length} of ${JOURNEY_MEDALS.length} Earned`}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {JOURNEY_MEDALS.map((medal) => {
            const isUnlocked = medal.checkUnlocked(points, journalEntries.length, userBadges);
            return (
              <div 
                key={medal.id}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between h-[155px] relative overflow-hidden transition-all duration-350 select-none ${
                  isUnlocked
                    ? `bg-gradient-to-br ${medal.color} hover:scale-[1.05] hover:-translate-y-1 cursor-pointer hover:shadow-[0_8px_20px_rgba(20,184,166,0.12)]`
                    : 'bg-stone-950/20 border-stone-900/50 grayscale opacity-30 cursor-not-allowed hover:grayscale-0 hover:opacity-55 hover:scale-[1.02]'
                }`}
              >
                {/* Background glow for unlocked badges */}
                {isUnlocked && (
                  <div className="absolute -top-10 -right-10 w-20 h-20 bg-teal-500/5 rounded-full blur-xl pointer-events-none"></div>
                )}

                <div className="space-y-1.5 z-10">
                  {/* Badge Icon */}
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg shadow-sm border ${
                    isUnlocked 
                      ? 'bg-stone-950/65 border-stone-800/60' 
                      : 'bg-stone-950/40 border-stone-950'
                  }`}>
                    {medal.icon}
                  </div>

                  <div>
                    {/* Badge Title */}
                    <h5 className="text-[11px] font-semibold tracking-wide text-stone-100 leading-tight">
                      {lang === 'pt' ? medal.titlePt : medal.titleEn}
                    </h5>
                    {/* Badge Short Desc */}
                    <p className="text-[8.5px] leading-tight text-stone-450 mt-0.5 font-light line-clamp-2">
                      {lang === 'pt' ? medal.descPt : medal.descEn}
                    </p>
                  </div>
                </div>

                {/* Lock Status / Subtext */}
                <div className="text-[8px] font-mono leading-none pt-1 z-10 border-t border-stone-900/40 flex items-center justify-between">
                  {isUnlocked ? (
                    <span className="text-emerald-400 font-bold uppercase tracking-widest">{lang === 'pt' ? '✓ Conquistado' : '✓ Earned'}</span>
                  ) : (
                    <span className="text-stone-500 tracking-wider truncate" title={lang === 'pt' ? medal.requirementPt : medal.requirementEn}>
                      {lang === 'pt' ? medal.requirementPt : medal.requirementEn}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
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
