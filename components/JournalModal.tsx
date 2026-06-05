import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Check, Feather, Sparkles, RotateCw, 
  Mic, MicOff, History, Trash2, Download, X,
  ChevronDown, ChevronUp, FileText, Calendar
} from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { jsPDF } from 'jspdf';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  isLightTheme?: boolean;
}

interface JournalEntry {
  id: string;
  date: string;
  text: string;
  prompt?: string;
  moodTags?: string[];
  quickNote?: string;
}

export const MOOD_TAGS = [
  { id: 'embraced', labelPt: '🫂 Acolhido', labelEn: '🫂 Embraced', color: 'border-amber-500/30 text-amber-500 dark:text-amber-300 bg-amber-500/10' },
  { id: 'serene', labelPt: '🌿 Sereno', labelEn: '🌿 Serene', color: 'border-emerald-500/30 text-emerald-500 dark:text-emerald-300 bg-emerald-500/10' },
  { id: 'inspired', labelPt: '🌬️ Inspirado', labelEn: '🌬️ Inspired', color: 'border-sky-500/30 text-sky-500 dark:text-sky-300 bg-sky-500/10' },
  { id: 'anxious', labelPt: '🌀 Ansioso', labelEn: '🌀 Anxious', color: 'border-purple-500/30 text-purple-500 dark:text-purple-300 bg-purple-500/10' },
  { id: 'connected', labelPt: '✨ Conectado', labelEn: '✨ Connected', color: 'border-fuchsia-500/30 text-fuchsia-500 dark:text-fuchsia-300 bg-fuchsia-500/10' },
  { id: 'flowing', labelPt: '🌊 Fluido', labelEn: '🌊 Flowing', color: 'border-teal-500/30 text-teal-500 dark:text-teal-300 bg-teal-500/10' },
  { id: 'grounded', labelPt: '⛰️ Firme', labelEn: '⛰️ Grounded', color: 'border-stone-500/30 text-stone-600 dark:text-stone-300 bg-stone-500/10' }
];

export const JournalModal: React.FC<JournalModalProps> = ({ 
  isOpen, 
  onClose, 
  lang,
  isLightTheme = false
}) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [showExtras, setShowExtras] = useState(false);
  
  // Mood tags and Quick Notes
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [quickNoteText, setQuickNoteText] = useState('');
  
  // Speech Recognition
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const text = TRANSLATIONS[lang].journal;

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      const activeRec = (window as any).activeJournalRecognition;
      if (activeRec) {
        try {
          activeRec.stop();
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, []);

  const toggleSpeechRecognition = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError(lang === 'pt' ? 'Reconhecimento de voz não suportado.' : 'Voice recognition not supported.');
      return;
    }

    if (isListening) {
      const activeRec = (window as any).activeJournalRecognition;
      if (activeRec) {
        try {
          activeRec.stop();
        } catch (e) {
          console.error(e);
        }
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = lang === 'pt' ? 'pt-BR' : 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onerror = (event: any) => {
        const err = event.error;
        if (err === 'no-speech' || err === 'aborted') {
          setIsListening(false);
          return;
        }
        if (err === 'not-allowed') {
          setSpeechError(lang === 'pt' ? 'Microfone bloqueado.' : 'Microphone blocked.');
        } else {
          setSpeechError(err);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setCurrentText(prev => prev ? prev + ' ' + finalTranscript : finalTranscript);
        }
      };

      recognition.start();
      (window as any).activeJournalRecognition = recognition;
    } catch (e: any) {
      console.error(e);
      setSpeechError(e.message);
      setIsListening(false);
    }
  };

  // Real-time Firestore Sync Observer
  useEffect(() => {
    if (!isOpen) return;

    let unsubscribe = () => {};
    const currentUser = auth.currentUser;

    if (currentUser) {
      const colRef = collection(db, 'users', currentUser.uid, 'journals');
      unsubscribe = onSnapshot(colRef, (snapshot) => {
        const fetchedEntries: JournalEntry[] = [];
        snapshot.forEach((snapshotDoc) => {
          const data = snapshotDoc.data();
          fetchedEntries.push({
            id: snapshotDoc.id,
            date: data.date,
            text: data.text,
            prompt: data.prompt,
            moodTags: data.moodTags || [],
            quickNote: data.quickNote || ''
          });
        });
        fetchedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEntries(fetchedEntries);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, `users/${currentUser.uid}/journals`);
      });
    } else {
      try {
        const stored = localStorage.getItem('pch_journal_entries');
        if (stored) {
          setEntries(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load local journal background", e);
      }
    }

    // Initialize prompt template
    if (!currentPrompt && text?.prompts && text.prompts.length > 0) {
      const random = text.prompts[Math.floor(Math.random() * text.prompts.length)];
      setCurrentPrompt(random);
    }

    return () => {
      unsubscribe();
    };
  }, [isOpen, text?.prompts]);

  // Clean / Prepare fresh session on open
  useEffect(() => {
    if (isOpen) {
      setActiveEntryId(null);
      setCurrentText('');
      setQuickNoteText('');
      setSelectedMoods([]);
      setSaveStatus('idle');
    }
  }, [isOpen]);

  // Debounced auto-save engine
  useEffect(() => {
    if (!currentText.trim() && !quickNoteText.trim()) {
      setSaveStatus('idle');
      return;
    }

    setSaveStatus('saving');
    const timer = setTimeout(async () => {
      const entryId = activeEntryId || Date.now().toString();
      if (!activeEntryId) {
        setActiveEntryId(entryId);
      }

      const newEntry: JournalEntry = {
        id: entryId,
        date: new Date().toISOString(),
        text: currentText,
        prompt: currentPrompt || undefined,
        moodTags: selectedMoods,
        quickNote: quickNoteText.trim() || undefined
      };

      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid, 'journals', entryId);
          await setDoc(docRef, {
            ...newEntry,
            userId: currentUser.uid
          });
          setSaveStatus('saved');
        } catch (err) {
          console.error("Auto-save failed to Firestore:", err);
          setSaveStatus('idle');
        }
      } else {
        const stored = localStorage.getItem('pch_journal_entries');
        let currentEntriesList: JournalEntry[] = [];
        if (stored) {
          try {
            currentEntriesList = JSON.parse(stored);
          } catch (e) {
            console.error(e);
          }
        }
        const filtered = currentEntriesList.filter(e => e.id !== entryId);
        const updated = [newEntry, ...filtered];
        localStorage.setItem('pch_journal_entries', JSON.stringify(updated));
        setEntries(updated);
        setSaveStatus('saved');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [currentText, quickNoteText, selectedMoods, currentPrompt, activeEntryId]);

  const cyclePrompt = () => {
    if (text?.prompts && text.prompts.length > 0) {
        let newPrompt = currentPrompt;
        let attempts = 0;
        while (newPrompt === currentPrompt && attempts < 10 && text.prompts.length > 1) {
           newPrompt = text.prompts[Math.floor(Math.random() * text.prompts.length)];
           attempts++;
        }
        setCurrentPrompt(newPrompt);
    }
  };

  const deleteEntry = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const confirmed = window.confirm(lang === 'pt' ? 'Excluir esta reflexão permanentemente?' : 'Delete this reflection permanently?');
    if (!confirmed) return;

    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const docRef = doc(db, 'users', currentUser.uid, 'journals', id);
        await deleteDoc(docRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/journals/${id}`);
      }
    } else {
      const updated = entries.filter(item => item.id !== id);
      setEntries(updated);
      localStorage.setItem('pch_journal_entries', JSON.stringify(updated));
    }
  };

  const loadPastEntry = (entry: JournalEntry) => {
    setActiveEntryId(entry.id);
    setCurrentText(entry.text || '');
    setQuickNoteText(entry.quickNote || '');
    setSelectedMoods(entry.moodTags || []);
    if (entry.prompt) {
      setCurrentPrompt(entry.prompt);
    }
    setShowHistoryDrawer(false);
  };

  const createNewReflection = () => {
    setActiveEntryId(null);
    setCurrentText('');
    setQuickNoteText('');
    setSelectedMoods([]);
    setSaveStatus('idle');
    cyclePrompt();
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString(lang, { 
      month: 'short', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const handlePdfExport = () => {
    if (entries.length === 0) return;

    try {
      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const primaryTeal = [20, 184, 166];
      const neutralBody = [41, 37, 36];
      const mutedGrey = [120, 113, 108];

      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
      const titleStr = lang === 'pt' ? 'CONFISSÕES DO SANTUÁRIO' : 'SANCTUARY REVEALS';
      doc.text(titleStr, margin, 25);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
      doc.text(lang === 'pt' ? 'A Sua Voz Interior — Memórias' : 'Your Inner Voice — Memories', margin, 32);

      doc.setDrawColor(231, 229, 228); 
      doc.setLineWidth(0.5);
      doc.line(margin, 36, pageWidth - margin, 36);

      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(mutedGrey[0], mutedGrey[1], mutedGrey[2]);
      doc.text(`${lang === 'pt' ? 'Exportado em:' : 'Exported on:'} ${new Date().toLocaleString()}`, margin, 42);
      doc.text(`${lang === 'pt' ? 'Total registros:' : 'Total entries:'} ${entries.length}`, pageWidth - margin - 45, 42);

      let yPos = 52;
      const sorted = [...entries].reverse();

      sorted.forEach((entry, idx) => {
        const itemDateStr = new Date(entry.date).toLocaleString();
        const entryHeaderStr = `${lang === 'pt' ? 'REGISTRO' : 'ENTRY'} #${idx + 1} — ${itemDateStr}`;

        if (yPos > pageHeight - 35) {
          doc.addPage();
          yPos = 25;
        }

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
        doc.text(entryHeaderStr, margin, yPos);
        yPos += 6;

        if (entry.prompt) {
          const promptLines = doc.splitTextToSize(`"${entry.prompt}"`, contentWidth - 6);
          const pBoxHeight = (promptLines.length * 5) + 6;

          if (yPos + pBoxHeight > pageHeight - 20) {
            doc.addPage();
            yPos = 25;
          }

          doc.setFillColor(245, 245, 244); 
          doc.rect(margin, yPos, contentWidth, pBoxHeight, 'F');
          doc.setFont('Helvetica', 'oblique');
          doc.setFontSize(9);
          doc.setTextColor(neutralBody[0], neutralBody[1], neutralBody[2]);
          
          let py = yPos + 5;
          promptLines.forEach(pline => {
            doc.text(pline, margin + 3, py);
            py += 5;
          });
          yPos += pBoxHeight + 4;
        }

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(neutralBody[0], neutralBody[1], neutralBody[2]);
        
        const splitText = doc.splitTextToSize(entry.text, contentWidth);
        const textHeight = splitText.length * 5.5;

        if (yPos + textHeight > pageHeight - 20) {
          doc.addPage();
          yPos = 25;
        }

        splitText.forEach(line => {
          if (yPos > pageHeight - 15) {
            doc.addPage();
            yPos = 25;
          }
          doc.text(line, margin, yPos);
          yPos += 5.5;
        });

        yPos += 8;
        doc.setDrawColor(245, 245, 244);
        doc.line(margin, yPos - 4, pageWidth - margin, yPos - 4);
      });

      doc.save(lang === 'pt' ? 'diario_santuario_reflexoes.pdf' : 'sanctuary_journal_reflections.pdf');
    } catch (err) {
      console.error("Failed to generate PDF document:", err);
    }
  };

  const handleTxtExport = () => {
    if (entries.length === 0) return;

    try {
      let content = '';
      const titleStr = lang === 'pt' ? 'CONFISSÕES DO SANTUÁRIO' : 'SANCTUARY REVEALS';
      content += `${titleStr}\n==================================================\n`;
      content += `${lang === 'pt' ? 'Exportado em:' : 'Exported on:'} ${new Date().toLocaleString()}\n`;
      content += `${lang === 'pt' ? 'Total registros:' : 'Total entries:'} ${entries.length}\n`;
      content += `==================================================\n\n`;

      const sorted = [...entries].reverse();
      sorted.forEach((entry, idx) => {
        content += `REGISTRO #${idx + 1}\nDate: ${new Date(entry.date).toLocaleString()}\n`;
        if (entry.moodTags && entry.moodTags.length > 0) {
          const tags = entry.moodTags.map(tagId => MOOD_TAGS.find(t => t.id === tagId)?.labelPt || tagId).join(', ');
          content += `Sintonia: ${tags}\n`;
        }
        if (entry.quickNote) {
          content += `Resumo: "${entry.quickNote}"\n`;
        }
        if (entry.prompt) {
          content += `Âncora: "${entry.prompt}"\n`;
        }
        content += `--------------------------------------------------\n${entry.text || ''}\n==================================================\n\n`;
      });

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = lang === 'pt' ? 'diario_santuario.txt' : 'sanctuary_journal.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export txt:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className={`fixed inset-0 z-[120] flex flex-col font-sans select-none transition-colors duration-500 overflow-hidden ${
        isLightTheme 
          ? 'bg-[#FDFBF7] text-stone-800 selection:bg-emerald-100' 
          : 'bg-[#0B1516] text-stone-100 selection:bg-teal-950/40'
      }`}
    >
      {/* Barra de Navegação Minimalista */}
      <header className={`w-full flex justify-between items-center px-6 md:px-12 py-4 md:py-6 border-b transition-all ${
        isLightTheme ? 'border-stone-200/50 bg-[#FDFBF7]/90' : 'border-[#142926]/40 bg-[#0B1516]/90'
      } backdrop-blur-md sticky top-0 z-30`}>
        
        {/* Voltar em silêncio */}
        <button 
          onClick={onClose}
          className={`flex items-center gap-2 group transition-colors cursor-pointer text-xs md:text-sm font-medium ${
            isLightTheme ? 'text-stone-400 hover:text-stone-800' : 'text-stone-450 hover:text-stone-200'
          }`}
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
          <span>{lang === 'pt' ? 'Voltar em silêncio' : 'Return in silence'}</span>
        </button>

        {/* Indicador de Salvamento Calmo */}
        <div className="flex items-center gap-4">
          <AnimatePresence mode="wait">
            {saveStatus === 'saving' && (
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-[10px] uppercase font-mono tracking-wider text-stone-400 animate-pulse"
              >
                {lang === 'pt' ? 'Sintonizando silenciosamente...' : 'Saving silently...'}
              </motion.span>
            )}
            
            {saveStatus === 'saved' && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400"
              >
                <Check className="w-3.5 h-3.5" />
                <span className="text-[10px] md:text-xs font-mono font-medium tracking-wide">
                  {lang === 'pt' ? 'Guardado com segurança' : 'Saved securely'}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          <span className={`text-stone-450 opacity-30 select-none hidden md:inline text-xs`}>|</span>

          {/* Action buttons (Dictate, New Ref, Timeline) */}
          <div className="flex items-center gap-2">
            
            {/* Speach Dictate */}
            <button
              onClick={toggleSpeechRecognition}
              className={`p-2 rounded-full cursor-pointer transition-all ${
                isListening 
                  ? 'bg-rose-500/10 text-rose-500 border border-rose-500/30 animate-pulse' 
                  : isLightTheme
                    ? 'hover:bg-stone-100 text-stone-500 hover:text-stone-800 border border-transparent hover:border-stone-200'
                    : 'hover:bg-teal-950/30 text-stone-400 hover:text-stone-100 border border-transparent hover:border-[#142926]'
              }`}
              title={lang === 'pt' ? 'Ditar Texto por Voz' : 'Speak into Sanctuary'}
            >
              {isListening ? <Mic className="w-4 h-4 animate-bounce" /> : <MicOff className="w-4 h-4" />}
            </button>

            {/* Nova Reflexão */}
            <button
              onClick={createNewReflection}
              className={`p-2 rounded-full cursor-pointer transition-all ${
                isLightTheme
                  ? 'hover:bg-stone-100 text-stone-500 hover:text-stone-800 border border-transparent hover:border-stone-200'
                  : 'hover:bg-teal-950/30 text-stone-400 hover:text-stone-100 border border-transparent hover:border-[#142926]'
              }`}
              title={lang === 'pt' ? 'Pristina Nova Sessão' : 'Start Fresh Session'}
            >
              <RotateCw className="w-4 h-4" />
            </button>

            {/* Timeline History toggle */}
            <button
              onClick={() => setShowHistoryDrawer(true)}
              className={`p-2 rounded-full cursor-pointer relative transition-all ${
                isLightTheme
                  ? 'hover:bg-stone-100 text-stone-500 hover:text-stone-800 border border-transparent hover:border-stone-200'
                  : 'hover:bg-teal-950/30 text-stone-400 hover:text-stone-100 border border-transparent hover:border-[#142926]'
              }`}
              title={lang === 'pt' ? 'Ver Linha do Tempo' : 'View Core Timelines'}
            >
              <History className="w-4 h-4" />
              {entries.length > 0 && (
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-teal-400" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Área Central de Escrita */}
      <main className="flex-1 w-full max-w-3xl mx-auto flex flex-col px-6 md:px-12 py-8 overflow-y-auto custom-scrollbar">
        {/* A Âncora (Acolhimento) */}
        <div className="mb-10 text-left">
          <div className="flex items-center gap-3 mb-3 shrink-0">
            <Feather className={`w-5 h-5 opacity-40 ${isLightTheme ? 'text-emerald-700' : 'text-teal-400'}`} />
            <button 
              onClick={cyclePrompt}
              className={`text-[9px] uppercase tracking-widest font-mono font-medium opacity-50 hover:opacity-100 transition-opacity cursor-pointer flex items-center gap-1.5 px-2.5 py-1 rounded-full border ${
                isLightTheme ? 'border-stone-200 hover:bg-stone-100/60' : 'border-[#142926] hover:bg-teal-950/15'
              }`}
            >
              {lang === 'pt' ? 'Outra Âncora' : 'Another Anchor'}
            </button>
          </div>

          <h2 className={`text-xl md:text-2.5xl font-serif font-medium leading-relaxed tracking-wide ${
            isLightTheme ? 'text-stone-700' : 'text-stone-200'
          }`}>
            {currentPrompt}
          </h2>
          <p className={`mt-2 text-xs font-light tracking-wide ${
            isLightTheme ? 'text-stone-400' : 'text-stone-500'
          }`}>
            {lang === 'pt' ? 'Respire. Não há pressa e não há erros aqui.' : 'Breathe. There is no rush and there are countess errors accepted here.'}
          </p>

          {speechError && (
             <p className="text-[10px] text-rose-500 font-mono mt-2 animate-pulse">{speechError}</p>
          )}
        </div>

        {/* O Espaço em Branco (Textarea Autoresize) */}
        <textarea
          value={currentText}
          onChange={(e) => setCurrentText(e.target.value)}
          placeholder={text?.placeholder || (lang === 'pt' ? 'Comece por aqui...' : 'Begin here...')}
          className={`flex-1 w-full bg-transparent border-none outline-none resize-none text-base md:text-lg leading-relaxed focus:ring-0 px-0 min-h-[30vh] font-light ${
            isLightTheme 
              ? 'text-stone-800 placeholder-stone-300' 
              : 'text-stone-100 placeholder-stone-700/80'
          }`}
          autoFocus
        />

        {/* Bottom Collapsible Settings panel for tags/quicknotes */}
        <div className={`mt-8 border-t pt-6 space-y-4 ${
          isLightTheme ? 'border-stone-200/50' : 'border-[#142926]/40'
        }`}>
          <button 
            type="button"
            onClick={() => setShowExtras(!showExtras)}
            className={`flex items-center gap-2 text-[10px] uppercase tracking-widest font-mono cursor-pointer transition-all ${
              isLightTheme ? 'text-stone-400 hover:text-stone-700' : 'text-stone-500 hover:text-stone-300'
            }`}
          >
            <span>{lang === 'pt' ? 'Sintonizar sentimentos e nota rápida' : 'Tune feelings & quick summary'}</span>
            {showExtras ? <ChevronUp className="w-3" /> : <ChevronDown className="w-3" />}
          </button>
          
          {showExtras && (
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              className="space-y-5 pt-1"
            >
              {/* Mood tags */}
              <div className="space-y-2">
                <label className={`text-[9px] uppercase tracking-widest font-semibold font-mono block ${
                  isLightTheme ? 'text-stone-400' : 'text-stone-500'
                }`}>
                    {lang === 'pt' ? 'Sintonize seu estado' : 'Sintonize your emotions'}
                </label>
                <div className="flex flex-wrap gap-2">
                    {MOOD_TAGS.map((tag) => {
                        const isSelected = selectedMoods.includes(tag.id);
                        return (
                            <button
                                key={tag.id}
                                type="button"
                                onClick={() => {
                                    if (isSelected) {
                                        setSelectedMoods(selectedMoods.filter(id => id !== tag.id));
                                    } else {
                                        setSelectedMoods([...selectedMoods, tag.id]);
                                    }
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs border transition-all cursor-pointer ${
                                    isSelected
                                        ? `${tag.color} border-current font-medium shadow-sm`
                                        : isLightTheme
                                          ? 'border-stone-200 text-stone-500 hover:text-stone-800 hover:bg-stone-100 bg-white'
                                          : 'border-stone-800/40 text-stone-400 hover:text-stone-200 hover:bg-teal-950/20'
                                }`}
                            >
                                {lang === 'pt' ? tag.labelPt : tag.labelEn}
                            </button>
                        );
                    })}
                </div>
              </div>

              {/* Quick note input summary */}
              <div className="space-y-1.5">
                  <label className={`text-[9px] uppercase tracking-widest font-semibold font-mono block ${
                    isLightTheme ? 'text-stone-400' : 'text-stone-500'
                  }`}>
                      {lang === 'pt' ? 'Frase Síntese do Dia' : 'The Quick Day Synthesis'}
                  </label>
                  <input
                      type="text"
                      maxLength={100}
                      value={quickNoteText}
                      onChange={(e) => setQuickNoteText(e.target.value)}
                      placeholder={lang === 'pt' ? 'O que resume este momento em poucas palavras?' : 'What summarizes this moment in a short line?'}
                      className={`w-full bg-transparent border-b outline-none rounded-none py-1.5 text-xs focus:outline-none focus:ring-0 transition-all font-light ${
                        isLightTheme 
                          ? 'border-stone-250 focus:border-stone-500 text-stone-700 placeholder-stone-300' 
                          : 'border-[#142926]/60 focus:border-teal-500/50 text-stone-200 placeholder-stone-700'
                      }`}
                  />
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Sliding Timeline HISTORY Drawer */}
      <AnimatePresence>
        {showHistoryDrawer && (
          <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowHistoryDrawer(false)}
              className="absolute inset-0 bg-stone-950/70 backdrop-blur-sm cursor-pointer"
            />

            {/* Slate drawer panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`w-full max-w-md h-full shadow-2xl relative z-10 flex flex-col border-l ${
                isLightTheme 
                  ? 'bg-[#FAF7F0] text-stone-800 border-stone-200' 
                  : 'bg-[#080E0D] text-stone-200 border-[#142926]'
              }`}
            >
              {/* Drawer header */}
              <div className={`p-5 border-b flex justify-between items-center ${
                isLightTheme ? 'border-stone-150' : 'border-[#142926]/55'
              }`}>
                <div>
                  <h3 className="font-serif text-lg font-bold">
                    {lang === 'pt' ? 'Memórias do Santuário' : 'Library of Reflections'}
                  </h3>
                  <p className="text-[10px] text-stone-450 uppercase tracking-wider font-mono">
                    {entries.length} {entries.length === 1 ? 'Entry' : 'Entries'} saved
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  {entries.length > 0 && (
                    <>
                      <button
                        onClick={handlePdfExport}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isLightTheme 
                            ? 'border-stone-200 hover:bg-stone-100 text-stone-500' 
                            : 'border-[#122321] hover:bg-teal-950/20 text-stone-400 hover:text-teal-400'
                        }`}
                        title={lang === 'pt' ? 'Baixar PDF completo' : 'Export complete PDF'}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={handleTxtExport}
                        className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                          isLightTheme 
                            ? 'border-stone-200 hover:bg-stone-100 text-stone-500' 
                            : 'border-[#122321] hover:bg-teal-950/20 text-stone-400 hover:text-amber-400'
                        }`}
                        title={lang === 'pt' ? 'Exportar TXT' : 'Export document TXT'}
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setShowHistoryDrawer(false)}
                    className={`p-1.5 rounded-full cursor-pointer transition-colors ${
                      isLightTheme ? 'hover:bg-stone-205 text-stone-500' : 'hover:bg-stone-900/40 text-stone-400'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrolling Entry List */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
                {entries.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40 py-20">
                    <Feather className="w-8 h-8 text-stone-500 mb-3" />
                    <p className="text-stone-505 text-xs uppercase tracking-widest font-mono">
                      {lang === 'pt' ? 'Em silêncio aguardando vozes' : 'Silent waiting for voices'}
                    </p>
                  </div>
                ) : (
                  entries.map((entry) => (
                    <div 
                      key={entry.id} 
                      onClick={() => loadPastEntry(entry)}
                      className={`p-4 rounded-xl border transition-all relative group cursor-pointer text-left ${
                        entry.id === activeEntryId
                          ? isLightTheme
                            ? 'border-emerald-600 bg-emerald-500/5 shadow-sm'
                            : 'border-teal-500 bg-teal-500/5 shadow-sm'
                          : isLightTheme
                            ? 'border-stone-200 bg-white hover:border-stone-300'
                            : 'border-[#142926]/40 bg-stone-900/10 hover:border-teal-950'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-1 text-stone-500 font-mono text-[9px]">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(entry.date)}</span>
                        </div>

                        <button 
                          onClick={(e) => deleteEntry(entry.id, e)} 
                          className="text-stone-500 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer rounded"
                          title="Delete permanently"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {entry.prompt && (
                        <p className={`text-[10px] italic line-clamp-1 mb-2 pl-2 border-l ${
                          isLightTheme ? 'border-stone-300 text-stone-500' : 'border-stone-800 text-stone-500'
                        }`}>
                          "{entry.prompt}"
                        </p>
                      )}

                      {entry.moodTags && entry.moodTags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-2 mt-1">
                          {entry.moodTags.map(tagId => {
                            const found = MOOD_TAGS.find(m => m.id === tagId);
                            return found ? (
                              <span key={tagId} className={`px-1.5 py-0.5 rounded text-[8px] border font-medium ${found.color}`}>
                                {lang === 'pt' ? found.labelPt : found.labelEn}
                              </span>
                            ) : null;
                          })}
                        </div>
                      )}

                      {entry.quickNote && (
                        <div className={`mb-2 p-2 rounded text-[10px] leading-tight ${
                          isLightTheme ? 'bg-stone-50 text-stone-600' : 'bg-stone-950/75 text-stone-300'
                        }`}>
                          <span className="text-[7.5px] uppercase font-mono tracking-widest text-teal-500 font-bold block mb-0.5">
                            {lang === 'pt' ? 'Resumo' : 'Synthesis'}
                          </span>
                          "{entry.quickNote}"
                        </div>
                      )}

                      {entry.text && (
                        <p className={`text-xs font-light line-clamp-4 leading-relaxed whitespace-pre-wrap ${
                          isLightTheme ? 'text-stone-600' : 'text-stone-300'
                        }`}>
                          {entry.text}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
