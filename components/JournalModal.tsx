import React, { useState, useEffect } from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { jsPDF } from 'jspdf';
import { auth, db, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, onSnapshot, setDoc, deleteDoc } from 'firebase/firestore';

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

interface JournalEntry {
  id: string;
  date: string;
  text: string;
  prompt?: string;
  moodTags?: string[];
  quickNote?: string;
}

const XMarkIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TrashIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
  </svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
);

const ListIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 17.25h.007v.008H3.75v-.008Zm.375 0a.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

const PencilSquareIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2050/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const MicIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
  </svg>
);

export const MOOD_TAGS = [
  { id: 'embraced', labelPt: '🫂 Acolhido', labelEn: '🫂 Embraced', color: 'border-amber-500/30 text-amber-300 bg-amber-950/10' },
  { id: 'serene', labelPt: '🌿 Sereno', labelEn: '🌿 Serene', color: 'border-emerald-500/30 text-emerald-300 bg-emerald-950/10' },
  { id: 'inspired', labelPt: '🌬️ Inspirado', labelEn: '🌬️ Inspired', color: 'border-sky-500/30 text-sky-300 bg-sky-950/10' },
  { id: 'anxious', labelPt: '🌀 Ansioso', labelEn: '🌀 Anxious', color: 'border-purple-500/30 text-purple-300 bg-purple-950/10' },
  { id: 'connected', labelPt: '✨ Conectado', labelEn: '✨ Connected', color: 'border-fuchsia-500/30 text-fuchsia-300 bg-fuchsia-950/10' },
  { id: 'flowing', labelPt: '🌊 Fluido', labelEn: '🌊 Flowing', color: 'border-teal-500/30 text-teal-300 bg-teal-950/10' },
  { id: 'grounded', labelPt: '⛰️ Firme', labelEn: '⛰️ Grounded', color: 'border-stone-500/30 text-stone-300 bg-stone-900/40' }
];

export const JournalModal: React.FC<JournalModalProps> = ({ isOpen, onClose, lang }) => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentText, setCurrentText] = useState('');
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [view, setView] = useState<'write' | 'history'>('write');
  
  // New States: Mood tags and Quick Notes
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [quickNoteText, setQuickNoteText] = useState('');
  
  // Speech Recognition States
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

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
      setSpeechError(lang === 'pt' ? 'Reconhecimento de voz não suportado neste navegador.' : 'Voice recognition not supported in this browser.');
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
          console.info('Speech recognition system status:', err);
          setIsListening(false);
          return;
        }
        console.warn('Speech recognition warning status:', err);
        if (err === 'not-allowed') {
          setSpeechError(lang === 'pt' ? 'Acesso ao microfone negado.' : 'Microphone access denied.');
        } else if (err === 'network') {
          setSpeechError(lang === 'pt' ? 'Conexão instável com o reconhecimento de voz. Tente reiniciar.' : 'Unstable voice recognition connection. Please try again.');
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

  const text = TRANSLATIONS[lang].journal;

  // Real-time Firestore Sync Observer
  useEffect(() => {
    if (!isOpen) return;

    let unsubscribe = () => {};
    const currentUser = auth.currentUser;

    if (currentUser) {
      // Connect in real-time to the user subcollection
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
        // Sort chronologically descending
        fetchedEntries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setEntries(fetchedEntries);
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, `users/${currentUser.uid}/journals`);
      });
    } else {
      // Fallback guest offline localState loading
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

  const saveEntry = async () => {
    if (!currentText.trim() && !quickNoteText.trim()) return;

    const entryId = Date.now().toString();
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
      // Secure Write to Firestore
      try {
        const docRef = doc(db, 'users', currentUser.uid, 'journals', entryId);
        await setDoc(docRef, {
          ...newEntry,
          userId: currentUser.uid
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/journals/${entryId}`);
      }
    } else {
      // Fallback local storage
      const updated = [newEntry, ...entries];
      setEntries(updated);
      localStorage.setItem('pch_journal_entries', JSON.stringify(updated));
    }
    
    setCurrentText('');
    setQuickNoteText('');
    setSelectedMoods([]);
    cyclePrompt();
  };

  const cyclePrompt = () => {
    if (text?.prompts && text.prompts.length > 0) {
        let newPrompt = currentPrompt;
        let attempts = 0;
        while (newPrompt === currentPrompt && attempts < 10 && text.prompts.length > 1) {
           newPrompt = text.prompts[Math.floor(Math.random() * text.prompts.length)];
           attempts++;
        }
        if (text.prompts.length === 1) newPrompt = text.prompts[0];
        setCurrentPrompt(newPrompt);
    }
  };

  const deleteEntry = async (id: string) => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      // Firestore remove action
      try {
        const docRef = doc(db, 'users', currentUser.uid, 'journals', id);
        await deleteDoc(docRef);
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, `users/${currentUser.uid}/journals/${id}`);
      }
    } else {
      // Local state fallback remove
      const updated = entries.filter(e => e.id !== id);
      setEntries(updated);
      localStorage.setItem('pch_journal_entries', JSON.stringify(updated));
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString(lang, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' });
  };

  // Add highly-polished jsPDF Exporter
  const handlePdfExport = () => {
    if (entries.length === 0) return;

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const primaryTeal = [20, 184, 166]; // Teal #14b8a6
      const neutralBody = [41, 37, 36]; // Charcoal #292524
      const mutedGrey = [120, 113, 108]; // Warm Gray #78716c

      // Page dimensions
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - (margin * 2);

      // Render cover header block
      doc.setFont('Helvetica', 'bold');
      doc.setFontSize(22);
      doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
      const titleStr = lang === 'pt' ? 'DIÁRIO DE REFLEXÕES' : 'JOURNAL OF REFLECTIONS';
      doc.text(titleStr, margin, 25);
      
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
      const subtitleStr = lang === 'pt' ? 'A Sua Voz Interior — Diário Pessoal' : 'Your Inner Voice — Personal Archive';
      doc.text(subtitleStr, margin, 32);

      // Soft Divider
      doc.setDrawColor(231, 229, 228); 
      doc.setLineWidth(0.5);
      doc.line(margin, 36, pageWidth - margin, 36);

      // Metadata section
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(mutedGrey[0], mutedGrey[1], mutedGrey[2]);
      const printedAtStr = new Date().toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US');
      doc.text(`${lang === 'pt' ? 'Exportado em:' : 'Exported on:'} ${printedAtStr}`, margin, 42);
      doc.text(`${lang === 'pt' ? 'Total de reflexões:' : 'Total entries:'} ${entries.length}`, pageWidth - margin - 45, 42);

      let yPos = 52;

      // Sort entries chronologically for neat layout
      const sorted = [...entries].reverse();

      sorted.forEach((entry, idx) => {
        const itemDateStr = new Date(entry.date).toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });

        const entryHeaderStr = `${lang === 'pt' ? 'REGISTRO' : 'ENTRY'} #${idx + 1} — ${itemDateStr}`;

        // Header check space
        if (yPos > pageHeight - 35) {
          doc.addPage();
          yPos = 25;
        }

        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(11);
        doc.setTextColor(primaryTeal[0], primaryTeal[1], primaryTeal[2]);
        doc.text(entryHeaderStr, margin, yPos);
        yPos += 5;

        // Prompt Highlight Box
        if (entry.prompt) {
          const promptLines = doc.splitTextToSize(`"${entry.prompt}"`, contentWidth - 6);
          const pBoxHeight = (promptLines.length * 5) + 6;

          if (yPos + pBoxHeight > pageHeight - 20) {
            doc.addPage();
            yPos = 25;
          }

          // Shaded background box
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

        // Draw body copy
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

        // Add spaced thin divider
        yPos += 8;
        doc.setDrawColor(245, 245, 244);
        doc.setLineWidth(0.3);
        doc.line(margin, yPos - 4, pageWidth - margin, yPos - 4);
      });

      doc.save(lang === 'pt' ? 'diario_reflexoes_voz_interior.pdf' : 'inner_voice_reflections_journal.pdf');
    } catch (err) {
      console.error("Failed to compile formatted PDF document:", err);
    }
  };

  const handleTxtExport = () => {
    if (entries.length === 0) return;

    try {
      let content = '';
      const titleStr = lang === 'pt' ? 'DIÁRIO DE REFLEXÕES - VOZ INTERIOR PCH' : 'JOURNAL OF REFLECTIONS - INNER VOICE PCH';
      content += `${titleStr}\n`;
      content += `==================================================\n`;
      const printedAtStr = new Date().toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US');
      content += `${lang === 'pt' ? 'Exportado em:' : 'Exported on:'} ${printedAtStr}\n`;
      content += `${lang === 'pt' ? 'Total de reflexões:' : 'Total entries:'} ${entries.length}\n`;
      content += `==================================================\n\n`;

      const sorted = [...entries].reverse();
      sorted.forEach((entry, idx) => {
        const itemDateStr = new Date(entry.date).toLocaleString(lang === 'pt' ? 'pt-BR' : 'en-US');
        content += `REGISTRO #${idx + 1}\n`;
        content += `${lang === 'pt' ? 'Data' : 'Date'}: ${itemDateStr}\n`;
        
        if (entry.moodTags && entry.moodTags.length > 0) {
          const tags = entry.moodTags.map(tagId => {
            const match = MOOD_TAGS.find(t => t.id === tagId);
            return match ? (lang === 'pt' ? match.labelPt : match.labelEn) : tagId;
          }).join(', ');
          content += `${lang === 'pt' ? 'Estado Emocional' : 'Emotional State'}: ${tags}\n`;
        }
        
        if (entry.quickNote) {
          content += `${lang === 'pt' ? 'Nota Rápida' : 'Quick Note'}: "${entry.quickNote}"\n`;
        }
        
        if (entry.prompt) {
          content += `Prompt: "${entry.prompt}"\n`;
        }
        
        content += `--------------------------------------------------\n`;
        content += `${entry.text || ''}\n`;
        content += `==================================================\n\n`;
      });

      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = lang === 'pt' ? 'diario_reflexoes_voz_interior.txt' : 'inner_voice_reflections_journal.txt';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Failed to export as txt:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-6 animate-fade-in" onClick={onClose}>
      <div className="bg-stone-950 border border-stone-800 w-full max-w-4xl h-[85vh] flex flex-col rounded-2xl shadow-2xl relative overflow-hidden ring-1 ring-stone-800" onClick={e => e.stopPropagation()}>
         
         {/* Header */}
         <div className="p-4 md:p-6 border-b border-stone-800 flex justify-between items-center bg-stone-900/50 backdrop-blur-sm z-10">
            <div className="flex items-center space-x-4">
                <div className="flex flex-col">
                    <h3 className="font-serif text-xl md:text-2xl text-stone-200 tracking-widest uppercase drop-shadow-sm">{text?.title}</h3>
                    <div className="flex items-center space-x-2 mt-0.5">
                        <span className="text-[10px] text-stone-500 uppercase tracking-widest leading-none">{entries.length} Entries</span>
                        {entries.length > 0 && (
                          <>
                            <span className="text-stone-800 text-[10px] select-none leading-none">|</span>
                            <button 
                                onClick={handlePdfExport}
                                className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-teal-400 hover:text-teal-300 transition-colors flex items-center space-x-1.5 leading-none cursor-pointer"
                                title={lang === 'pt' ? 'Baixar todas as reflexões salvas como arquivo .pdf' : 'Download all saved reflections as a .pdf file'}
                            >
                                <svg className="w-3.5 h-3.5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>{lang === 'pt' ? 'Exportar (PDF)' : 'Export (PDF)'}</span>
                            </button>
                            <span className="text-stone-800 text-[10px] select-none leading-none">|</span>
                            <button 
                                onClick={handleTxtExport}
                                className="text-[10px] uppercase font-mono tracking-wider font-extrabold text-amber-400 hover:text-amber-300 transition-colors flex items-center space-x-1.5 leading-none cursor-pointer"
                                title={lang === 'pt' ? 'Baixar todas as reflexões salvas como arquivo .txt' : 'Download all saved reflections as a .txt file'}
                            >
                                <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span>{lang === 'pt' ? 'Exportar (TXT)' : 'Export (TXT)'}</span>
                            </button>
                          </>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile View Toggle */}
            <div className="flex md:hidden bg-stone-900 rounded-lg p-1 border border-stone-800">
                <button 
                  onClick={() => setView('write')}
                  className={`p-2 rounded-md transition-all ${view === 'write' ? 'bg-teal-900/30 text-teal-200 shadow-sm' : 'text-stone-500'}`}
                >
                    <PencilSquareIcon className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setView('history')}
                  className={`p-2 rounded-md transition-all ${view === 'history' ? 'bg-teal-900/30 text-teal-200 shadow-sm' : 'text-stone-500'}`}
                >
                    <ListIcon className="w-4 h-4" />
                </button>
            </div>

            <button onClick={onClose} className="text-stone-500 hover:text-stone-200 transition-colors p-2 hover:bg-stone-800 rounded-full">
              <XMarkIcon className="w-6 h-6" />
            </button>
         </div>

         <div className="flex-1 overflow-hidden flex flex-col md:flex-row relative">
            
            {/* WRITE Section */}
            <div className={`flex-1 flex flex-col h-full bg-stone-950/50 ${view === 'write' ? 'flex' : 'hidden md:flex'}`}>
               
               <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                    {/* Prompt Card */}
                    <div className="relative overflow-hidden bg-gradient-to-br from-stone-900 to-stone-950 p-6 md:p-8 rounded-xl border border-stone-800 shadow-lg group">
                        {/* Decorative background elements */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-teal-900/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-900/5 rounded-full blur-xl -ml-10 -mb-10 pointer-events-none"></div>

                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center space-x-2 text-teal-600/80">
                                    <SparklesIcon className="w-4 h-4" />
                                    <span className="text-[10px] uppercase tracking-[0.25em] font-semibold">Prompt</span>
                                </div>
                                
                                <button 
                                    onClick={cyclePrompt}
                                    className="flex items-center space-x-1.5 px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 hover:border-teal-900/50 rounded-full text-[10px] uppercase tracking-widest text-stone-400 hover:text-teal-400 transition-all shadow-sm"
                                >
                                    <PlusIcon className="w-3 h-3" />
                                    <span>{text?.newEntry}</span>
                                </button>
                            </div>
                            
                            <p className="font-serif italic text-xl md:text-2xl text-stone-200 leading-relaxed opacity-90">
                                "{currentPrompt}"
                            </p>
                        </div>
                    </div>
                    
                    {/* Tags de Humor */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold block">
                            {lang === 'pt' ? 'Como você se sente hoje? (Selecione)' : 'How do you feel today? (Select)'}
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
                                        className={`px-3 py-1.5 rounded-full text-xs border transition-all cursor-pointer ${
                                            isSelected
                                                ? `${tag.color} border-current font-medium shadow-md shadow-black/40`
                                                : 'border-stone-850 text-stone-400 hover:text-stone-200 hover:border-stone-700 bg-stone-900/25'
                                        }`}
                                    >
                                        {lang === 'pt' ? tag.labelPt : tag.labelEn}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Nota Rápida */}
                    <div className="space-y-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold block">
                            {lang === 'pt' ? 'Nota Rápida (Resumo / Frase do dia)' : 'Quick Note (Summary / Day phrase)'}
                        </label>
                        <input
                            type="text"
                            maxLength={100}
                            value={quickNoteText}
                            onChange={(e) => setQuickNoteText(e.target.value)}
                            placeholder={lang === 'pt' ? 'Escreva uma reflexão em poucas palavras...' : 'Write a short reflection in a few words...'}
                            className="w-full bg-stone-900/10 border border-stone-850/60 focus:border-teal-500/50 rounded-xl px-4 py-2.5 text-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500/20 placeholder-stone-700 transition-all font-light"
                        />
                    </div>
                    
                     {/* Input Area */}
                     <div className="flex flex-col border border-stone-850/60 rounded-xl p-3 bg-stone-900/10 focus-within:border-teal-500/50 transition-all">
                         <div className="flex justify-between items-center pb-2 border-b border-stone-850/30 mb-2">
                             <span className="text-[10px] uppercase tracking-wider text-stone-500 font-mono">
                                {lang === 'pt' ? 'Corpo do Diário' : 'Journal Body'}
                             </span>
                             <div className="flex items-center space-x-2">
                                {speechError && (
                                    <span className="text-[9px] text-red-400 font-mono">{speechError}</span>
                                )}
                                <button
                                    type="button"
                                    onClick={toggleSpeechRecognition}
                                    className={`px-3 py-1.5 rounded-full text-[10px] uppercase font-mono tracking-wider flex items-center space-x-1.5 transition-all cursor-pointer ${
                                        isListening
                                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                                            : 'bg-teal-950/20 text-teal-400 hover:text-teal-300 border border-teal-500/20 hover:border-teal-500/50'
                                    }`}
                                    title={lang === 'pt' ? 'Falar por Voz' : 'Speak into Journal'}
                                >
                                    <MicIcon className={`w-3.5 h-3.5 ${isListening ? 'animate-bounce' : ''}`} />
                                    <span>{isListening ? (lang === 'pt' ? 'Escutando...' : 'Listening...') : (lang === 'pt' ? 'Ditar Texto' : 'Speak / Dictate')}</span>
                                </button>
                             </div>
                         </div>
                         <textarea 
                             className="w-full min-h-[22vh] bg-transparent resize-none focus:outline-none text-stone-300 font-light text-base leading-relaxed placeholder-stone-700 p-2 selection:bg-teal-900/30 selection:text-teal-100"
                             placeholder={text?.placeholder}
                             value={currentText}
                             onChange={(e) => setCurrentText(e.target.value)}
                             autoFocus
                         />
                     </div>
               </div>

               {/* Action Bar */}
               <div className="p-6 border-t border-stone-800 bg-stone-900/30 flex justify-end">
                  <button 
                    onClick={saveEntry}
                    disabled={!currentText.trim() && !quickNoteText.trim()}
                    className="px-8 py-3 bg-stone-200 hover:bg-white text-stone-900 text-xs font-bold uppercase tracking-[0.2em] transition-all shadow-[0_0_15px_rgba(231,229,228,0.05)] disabled:opacity-30 disabled:cursor-not-allowed rounded disabled:shadow-none cursor-pointer"
                  >
                     {text?.save}
                  </button>
               </div>
            </div>

            {/* HISTORY Sidebar */}
            <div className={`w-full md:w-80 border-t md:border-t-0 md:border-l border-stone-800 bg-stone-950 flex flex-col h-full ${view === 'history' ? 'flex' : 'hidden md:flex'}`}>
                <div className="p-4 border-b border-stone-800 bg-stone-950/80 flex justify-between items-center">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-stone-500 font-bold">Timeline</span>
                    {entries.length > 0 && (
                      <button 
                          onClick={handlePdfExport}
                          className="text-[9px] uppercase font-mono tracking-widest text-teal-400 hover:text-teal-300 transition-colors flex items-center space-x-1 cursor-pointer"
                          title={lang === 'pt' ? 'Baixar todas as reflexões em PDF' : 'Download all reflections in PDF'}
                      >
                          <svg className="w-3 h-3 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          <span>{lang === 'pt' ? 'Exportar' : 'Export'}</span>
                      </button>
                    )}
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
                    {entries.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-40">
                            <PencilSquareIcon className="w-8 h-8 text-stone-600 mb-3" />
                            <p className="text-stone-500 text-xs uppercase tracking-widest">Your story begins here</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {entries.map(entry => (
                                <div key={entry.id} className="p-4 rounded border border-stone-800/50 bg-stone-900/20 hover:bg-stone-900/60 transition-all group relative">
                                    <div className="flex justify-between items-start mb-2">
                                        <span className="text-[10px] text-teal-600/70 font-mono">{formatDate(entry.date)}</span>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); deleteEntry(entry.id); }} 
                                            className="text-stone-700 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1 cursor-pointer"
                                            title="Delete"
                                        >
                                            <TrashIcon className="w-3 h-3" />
                                        </button>
                                    </div>
                                    
                                    {entry.prompt && (
                                        <div className="mb-2 pl-2 border-l-2 border-stone-800">
                                            <p className="text-[10px] text-stone-500 italic line-clamp-1">
                                                {entry.prompt}
                                            </p>
                                        </div>
                                    )}

                                    {entry.moodTags && entry.moodTags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mb-2 mt-1">
                                            {entry.moodTags.map(tId => {
                                                const found = MOOD_TAGS.find(m => m.id === tId);
                                                return found ? (
                                                    <span key={tId} className={`px-1.5 py-0.5 rounded text-[8px] border font-medium ${found.color}`}>
                                                        {lang === 'pt' ? found.labelPt : found.labelEn}
                                                    </span>
                                                ) : null;
                                            })}
                                        </div>
                                    )}

                                    {entry.quickNote && (
                                        <div className="mb-2 bg-stone-950/60 p-2 rounded border border-stone-900/50">
                                            <p className="text-[7.5px] font-mono text-amber-500/80 uppercase tracking-widest font-bold">{lang === 'pt' ? 'Nota Rápida' : 'Quick Note'}</p>
                                            <p className="text-[10px] text-stone-400 mt-0.5 italic leading-tight font-light">"{entry.quickNote}"</p>
                                        </div>
                                    )}
                                    
                                    {entry.text && (
                                        <p className="text-stone-300 text-xs line-clamp-4 leading-relaxed font-light whitespace-pre-wrap">
                                            {entry.text}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

         </div>

      </div>
    </div>
  );
};
