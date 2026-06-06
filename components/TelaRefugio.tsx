import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, Feather, Sparkles, Volume2, VolumeX, Lock, Unlock, Shield, EyeOff, Clipboard, FileText } from 'lucide-react';
import { Language } from '../types';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, collection } from 'firebase/firestore';

interface TelaRefugioProps {
  onClose: () => void;
  lang: Language;
}

export const TelaRefugio: React.FC<TelaRefugioProps> = ({ onClose, lang }) => {
  const [texto, setTexto] = useState('');
  const [salvo, setSalvo] = useState(false);
  const [ancoraDoDia, setAncoraDoDia] = useState('');
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);

  // Feature 1: Deep Focus Mode
  const [deepFocus, setDeepFocus] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [draftLoadedMsg, setDraftLoadedMsg] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());
  const inactivityTimerRef = useRef<any>(null);

  // Feature 2: Speech Synthesis
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Feature 4: Visual Guided Breathing States (Box Breathing 4-4-4-4)
  const [isBreathingExpanded, setIsBreathingExpanded] = useState(true);
  const [isBreathingRunning, setIsBreathingRunning] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdEmpty'>('inhale');
  const [breathingElapsed, setBreathingElapsed] = useState(0);
  const [breathingCycles, setBreathingCycles] = useState(0);

  useEffect(() => {
    if (!isBreathingRunning) {
      setBreathingElapsed(0);
      setBreathingPhase('inhale');
      return;
    }

    const intervalMs = 50;
    const timer = setInterval(() => {
      setBreathingElapsed((prev) => {
        const next = prev + intervalMs / 1000;
        if (next >= 4) {
          setBreathingPhase((currentPhase) => {
            if (currentPhase === 'inhale') return 'hold';
            if (currentPhase === 'hold') return 'exhale';
            if (currentPhase === 'exhale') return 'holdEmpty';
            setBreathingCycles((c) => c + 1);
            return 'inhale';
          });
          return 0;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isBreathingRunning]);

  const getBreathingLabel = () => {
    if (!isBreathingRunning) {
      return lang === 'pt' 
        ? 'Pronto para sintonizar?' 
        : 'Ready to align your breath?';
    }

    switch (breathingPhase) {
      case 'inhale':
        return lang === 'pt' ? 'Inspire pelo nariz...' : 'Inhale through your nose...';
      case 'hold':
        return lang === 'pt' ? 'Segure o ar e sinta o silêncio...' : 'Hold your breath, feel the silence...';
      case 'exhale':
        return lang === 'pt' ? 'Solte o ar suavemente...' : 'Release breath slowly...';
      case 'holdEmpty':
        return lang === 'pt' ? 'Aguarde em quietude...' : 'Hold empty, reside in calm...';
      default:
        return '';
    }
  };

  const breathingScale = !isBreathingRunning 
    ? 1.0 
    : breathingPhase === 'inhale'
      ? 1.0 + (breathingElapsed / 4) * 0.8
      : breathingPhase === 'hold'
        ? 1.8
        : breathingPhase === 'exhale'
          ? 1.8 - (breathingElapsed / 4) * 0.8
          : 1.0;

  // Determinando as âncoras (prompts) poéticas dependendo do idioma
  useEffect(() => {
    const templatesPt = [
      "Se o seu pensamento agora fosse uma sala, as janelas estariam abertas ou fechadas?",
      "Qual é a textura da preocupação que você tenta deixar ir hoje?",
      "Se pudesse dar uma cor ao silêncio que sente agora, qual seria?",
      "Que palavra melhor descreve a sua respiração neste exato momento?",
      "Se o seu cansaço pudesse falar em sussurros, o que ele pediria?"
    ];

    const templatesEn = [
      "If your thought right now were a room, would the windows be open or closed?",
      "What is the texture of the worry you are trying to let go of today?",
      "If you could give a color to the silence you feel right now, what would it be?",
      "Which word best describes your breathing at this very moment?",
      "If your exhaustion could speak in whispers, what would it ask for?"
    ];

    const pool = lang === 'pt' ? templatesPt : templatesEn;
    // Escolhe uma baseada na data para ser a "Âncora do Dia" estável
    const dayIndex = new Date().getDate() % pool.length;
    setAncoraDoDia(pool[dayIndex]);
  }, [lang]);

  // Feature 1: Inactivity Tracking Loop for Deep Focus (5 minutes)
  useEffect(() => {
    if (!deepFocus || isLocked) {
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
      return;
    }

    const resetInactivity = () => {
      lastActivityRef.current = Date.now();
    };

    // Listeners for active human interactions
    window.addEventListener('mousemove', resetInactivity);
    window.addEventListener('keydown', resetInactivity);
    window.addEventListener('click', resetInactivity);
    window.addEventListener('touchstart', resetInactivity);
    window.addEventListener('scroll', resetInactivity);

    // Core active checker - checks remaining time every second
    inactivityTimerRef.current = setInterval(() => {
      const fiveMinutesInMs = 5 * 60 * 1000; // 5 minutes inactivity trigger
      const elapsed = Date.now() - lastActivityRef.current;
      if (elapsed >= fiveMinutesInMs) {
        setIsLocked(true);
        // Cancel speech synthesis if speaking on privacy lock
        if (window.speechSynthesis) {
          window.speechSynthesis.cancel();
          setIsSpeaking(false);
        }
      }
    }, 1000);

    return () => {
      if (inactivityTimerRef.current) {
        clearInterval(inactivityTimerRef.current);
      }
      window.removeEventListener('mousemove', resetInactivity);
      window.removeEventListener('keydown', resetInactivity);
      window.removeEventListener('click', resetInactivity);
      window.removeEventListener('touchstart', resetInactivity);
      window.removeEventListener('scroll', resetInactivity);
    };
  }, [deepFocus, isLocked]);

  // Feature 3: Local Storage Draft Manager (Restore on Mount / Save on Type)
  useEffect(() => {
    // 1. Recover previous unsaved draft if it exists
    const draftKey = `pch_refugio_draft_${auth.currentUser?.uid || 'guest'}`;
    const storedDraft = localStorage.getItem(draftKey);
    if (storedDraft && storedDraft.trim().length > 0) {
      setTexto(storedDraft);
      setDraftLoadedMsg(true);
      // Fade active msg in 4s
      const t = setTimeout(() => setDraftLoadedMsg(false), 4500);
      return () => clearTimeout(t);
    }
  }, []);

  // Save changes to draft on every keystroke
  useEffect(() => {
    const draftKey = `pch_refugio_draft_${auth.currentUser?.uid || 'guest'}`;
    if (texto.trim().length > 0) {
      localStorage.setItem(draftKey, texto);
    } else {
      localStorage.removeItem(draftKey);
    }
  }, [texto]);

  // Cleanup draft once it is deleted or emptied, and handle SpeechSynthesis on exit
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Simulação de salvamento automático gentil e persistente
  useEffect(() => {
    if (texto.trim().length === 0) {
      setSalvo(false);
      return;
    }

    setSalvo(false);
    const saveTimer = setTimeout(async () => {
      const entryId = activeEntryId || Date.now().toString();
      if (!activeEntryId) {
        setActiveEntryId(entryId);
      }

      const newEntry = {
        id: entryId,
        date: new Date().toISOString(),
        text: texto,
        prompt: ancoraDoDia,
        moodTags: ['serene'],
        quickNote: lang === 'pt' ? 'Reflexão no Refúgio' : 'Refuge Reflection'
      };

      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const docRef = doc(db, 'users', currentUser.uid, 'journals', entryId);
          await setDoc(docRef, {
            ...newEntry,
            userId: currentUser.uid
          });
          setSalvo(true);
        } catch (err) {
          console.error("Erro ao salvar no Firestore (Refúgio):", err);
        }
      } else {
        // Fallback localstorage para visitantes offline
        try {
          const stored = localStorage.getItem('pch_journal_entries');
          let currentEntries = [];
          if (stored) {
            currentEntries = JSON.parse(stored);
          }
          const filtered = currentEntries.filter((e: any) => e.id !== entryId);
          const updated = [newEntry, ...filtered];
          localStorage.setItem('pch_journal_entries', JSON.stringify(updated));
          setSalvo(true);
        } catch (e) {
          console.error("Local storage error:", e);
        }
      }
    }, 1500);

    return () => clearTimeout(saveTimer);
  }, [texto, ancoraDoDia, activeEntryId, lang]);

  // Feature 2: Speech Synthesis read anchor aloud with a calm, synthesized voice
  const readAnchorAloud = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = ancoraDoDia;
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utteranceRef.current = utterance;

    // Pick dynamic voice matching selected language with slow rate for peaceful vibe
    utterance.lang = lang === 'pt' ? 'pt-BR' : 'en-US';
    utterance.rate = 0.85; // Calmer speed rate
    utterance.pitch = 1.0; // Comfort pitch

    // Attempt to select a native natural voice
    const voices = window.speechSynthesis.getVoices();
    const voiceMatch = voices.find(v => v.lang.startsWith(lang === 'pt' ? 'pt' : 'en'));
    if (voiceMatch) {
      utterance.voice = voiceMatch;
    }

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleUnlock = () => {
    setIsLocked(false);
    lastActivityRef.current = Date.now();
  };

  return (
    <div className={`fixed inset-0 z-[140] bg-[#FDFBF7] flex flex-col font-sans transition-all duration-700 select-none overflow-y-auto no-scrollbar ${
      deepFocus ? 'brightness-[0.93] contrast-[1.03]' : ''
    }`}>
      
      {/* Privacy Lock Screen Overlay */}
      {isLocked && (
        <div className="fixed inset-0 z-[200] bg-stone-950/98 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-stone-100 animate-fade-in">
          <div className="max-w-md text-center space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <Shield className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-2xl tracking-wide text-stone-200">
                {lang === 'pt' ? 'Silêncio Protegido' : 'Silence Protected'}
              </h3>
              <p className="text-stone-400 text-sm leading-relaxed max-w-xs mx-auto">
                {lang === 'pt' 
                  ? 'A sua sessão de escrita foi ocultada temporariamente para salvaguardar a sua privacidade.' 
                  : 'Your writing session was temporarily hidden to preserve your absolute privacy.'}
              </p>
            </div>
            
            <button
              onClick={handleUnlock}
              className="py-3 px-6 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-sm font-medium transition-all shadow-md inline-flex items-center gap-2 cursor-pointer"
            >
              <Unlock className="w-4 h-4" />
              <span>{lang === 'pt' ? 'Retomar Presença' : 'Restore Session'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Barra de Navegação Minimalista */}
      <header className="w-full flex justify-between items-center p-6 md:px-12 bg-transparent z-10 select-none">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-stone-400 hover:text-stone-800 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">
            {lang === 'pt' ? 'Voltar em silêncio' : 'Return in silence'}
          </span>
        </button>

        {/* Feature Switches & Indicators */}
        <div className="flex items-center gap-4">
          {/* Deep Focus Toggle option */}
          <button
            onClick={() => {
              setDeepFocus(!deepFocus);
              lastActivityRef.current = Date.now();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs tracking-wider transition-all cursor-pointer ${
              deepFocus
                ? 'bg-stone-900 border-stone-800 text-[#FDFBF7]'
                : 'bg-transparent border-stone-200 text-stone-400 hover:text-stone-700'
            }`}
            title={lang === 'pt' ? 'Bloquear e escurecer após 5min sem usar' : 'Lock session and dim screen after 5m of inactivity'}
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span className="font-mono text-[9px] uppercase hidden sm:inline">
              {lang === 'pt' ? 'Foco Profundo' : 'Deep Focus'}
            </span>
          </button>

          {/* Quick indicator of draft auto-recovery */}
          {draftLoadedMsg && (
            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-100 rounded-lg py-1 px-2.5 animate-pulse font-mono">
              {lang === 'pt' ? 'Rascunho restaurado' : 'Draft recovered'}
            </span>
          )}
          
          {/* Indicador de Salvamento Oculto e Calmo */}
          <div 
            className="flex items-center gap-1.5 text-emerald-600/70 text-xs font-medium transition-all duration-700 ease-out" 
            style={{ 
              opacity: salvo ? 1 : 0,
              transform: salvo ? 'translateY(0)' : 'translateY(-4px)'
            }}
          >
            <Check className="w-3.5 h-3.5" />
            <span className="font-mono text-[10px]">
              {lang === 'pt' ? 'Guardado' : 'Saved'}
            </span>
          </div>
        </div>
      </header>

      {/* Área Central de Escrita */}
      <main className="flex-1 w-full max-w-3xl mx-auto flex flex-col px-6 pb-12 justify-center md:justify-start">
        
        {/* A Âncora (Acolhimento) */}
        <div className="mb-10 mt-6 animate-fade-in-up">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-emerald-700/50 mb-3 font-mono text-[10px] uppercase tracking-widest font-semibold select-none">
              <Feather className="w-4 h-4 shrink-0 animate-bounce" />
              <span>{lang === 'pt' ? 'A Âncora do Dia' : 'Today\'s Anchor'}</span>
            </div>

            {/* Read Aloud Trigger */}
            <button
              onClick={readAnchorAloud}
              className={`p-1.5 rounded-lg border transition-all cursor-pointer flex items-center gap-1.5 ${
                isSpeaking 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-600 animate-pulse' 
                  : 'border-stone-200 hover:border-stone-400 text-stone-450 hover:text-stone-700'
              }`}
              title={lang === 'pt' ? 'Ouvir âncora da meditação' : 'Listen to anchor voice'}
            >
              {isSpeaking ? (
                <>
                  <VolumeX className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-mono uppercase font-bold">{lang === 'pt' ? 'Pausar' : 'Stop'}</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-mono uppercase">{lang === 'pt' ? 'Ouvir' : 'Listen'}</span>
                </>
              )}
            </button>
          </div>

          <h2 
            onClick={readAnchorAloud}
            className={`text-xl md:text-2.5xl font-serif font-medium leading-relaxed text-stone-700 cursor-pointer hover:text-emerald-800 transition-colors ${
              isSpeaking ? 'text-emerald-900 border-l-2 border-emerald-400 pl-3' : ''
            }`}
          >
            {ancoraDoDia}
          </h2>

          <p className="text-stone-400 mt-3 text-xs md:text-sm font-light leading-relaxed">
            {lang === 'pt' 
              ? 'Respire. Não há pressa e não há erros aqui.' 
              : 'Breathe. There is no rush and there are countess errors accepted here.'}
          </p>
        </div>

        {/* Visual Guided Breathing (Círculo de Respiração Animado) */}
        <div id="guias-respiracao" className="w-full bg-[#fbf9f4]/80 border border-stone-200/50 rounded-2xl p-5 mb-8 transition-all duration-300 animate-fade-in shadow-[0_4px_16px_rgba(139,92,26,0.02)]">
          <div className="flex items-center justify-between mb-4 select-none">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-lg bg-emerald-50 text-emerald-700 ${isBreathingRunning ? 'animate-pulse' : ''}`}>
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-serif text-xs font-semibold text-stone-700">
                  {lang === 'pt' ? 'Guia de Respiração' : 'Guided Breathing'}
                </h3>
                <p className="text-[10px] text-stone-400">
                  {lang === 'pt' ? 'Técnica 4-4-4-4 (Box Breathing) para acalmar e focar' : '4-4-4-4 Box Breathing to calm and stabilize focus'}
                </p>
              </div>
            </div>
            
            <button
              id="expand-breathing-btn"
              onClick={() => setIsBreathingExpanded(!isBreathingExpanded)}
              className="text-stone-450 hover:text-stone-700 text-[10px] font-mono py-1 px-2.5 rounded-lg border border-stone-200 hover:bg-stone-50 transition-all cursor-pointer"
            >
              {isBreathingExpanded ? (lang === 'pt' ? 'Ocultar' : 'Hide') : (lang === 'pt' ? 'Ver Guia' : 'Show')}
            </button>
          </div>

          {isBreathingExpanded && (
            <div className="flex flex-col md:flex-row items-center gap-6 py-1 select-none animate-fade-in">
              {/* Animating Breathing Circle */}
              <div className="relative w-36 h-36 flex items-center justify-center bg-stone-50/40 rounded-full border border-stone-100 flex-shrink-0">
                {/* Maximum dotted outline bound helper */}
                <div className="absolute w-[100px] h-[100px] rounded-full border border-dashed border-emerald-500/25 animate-pulse" />
                
                {/* Core breathing balloon that scales smoothly */}
                <div 
                  className="absolute w-[54px] h-[54px] rounded-full bg-gradient-to-tr from-emerald-100/80 to-teal-100/80 border border-teal-200/40 shadow-inner flex items-center justify-center transition-all duration-[50ms] ease-linear"
                  style={{ 
                    transform: `scale(${breathingScale})`,
                    boxShadow: isBreathingRunning ? '0 0 20px rgba(16, 185, 129, 0.25)' : 'none'
                  }}
                />

                {/* Counter & helper text in the center */}
                <div className="absolute flex flex-col items-center justify-center text-center">
                  {isBreathingRunning ? (
                    <>
                      <span className="font-mono text-2xl font-semibold text-stone-700 tabular-nums">
                        {Math.ceil(4 - breathingElapsed)}
                      </span>
                      <span className="text-[8px] font-mono uppercase tracking-widest text-emerald-800/80 font-bold">
                        {breathingPhase === 'inhale' && (lang === 'pt' ? 'Inspirar' : 'Inhale')}
                        {breathingPhase === 'hold' && (lang === 'pt' ? 'Segurar' : 'Hold')}
                        {breathingPhase === 'exhale' && (lang === 'pt' ? 'Expirar' : 'Exhale')}
                        {breathingPhase === 'holdEmpty' && (lang === 'pt' ? 'Vazio' : 'Hold Empty')}
                      </span>
                    </>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-emerald-600/10 text-emerald-700 flex items-center justify-center">
                      <span className="text-xs font-serif italic">Zen</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Controls and guidance description */}
              <div className="flex-1 flex flex-col justify-center text-center md:text-left space-y-3">
                <div className="space-y-1">
                  <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#0D9488]">
                    {getBreathingLabel()}
                  </p>
                  <p className="text-xs font-serif italic text-stone-500 leading-relaxed min-h-[36px] flex items-center justify-center md:justify-start">
                    {isBreathingRunning 
                      ? (lang === 'pt' 
                          ? 'Mantenha o olhar no fluxo silencioso da expansão. Sinta o peito expandir.' 
                          : 'Focus your attention entirely on the slow, silent rhythm of expansion.')
                      : (lang === 'pt'
                          ? 'Inicie o ciclo guiado antes de colocar suas palavras no diário para clarear os pensamentos.'
                          : 'Begin a gentle guided breathing cycle to ground your thoughts before journaling.')}
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                  <button
                    id="toggle-breathing-running-btn"
                    onClick={() => {
                      setIsBreathingRunning(!isBreathingRunning);
                      if (isBreathingRunning) {
                        setBreathingCycles(0);
                      }
                    }}
                    className={`py-2 px-5 rounded-xl text-xs uppercase font-mono tracking-wider font-semibold transition-all cursor-pointer shadow-sm ${
                      isBreathingRunning 
                        ? 'bg-stone-800 text-white hover:bg-stone-700' 
                        : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-98'
                    }`}
                  >
                    {isBreathingRunning 
                      ? (lang === 'pt' ? 'Pausar Exercício' : 'Pause Guide') 
                      : (lang === 'pt' ? 'Iniciar Respiração' : 'Start Breathing')}
                  </button>

                  {isBreathingRunning && (
                    <div className="text-[10px] font-mono font-medium text-stone-500 bg-stone-100 rounded-lg py-1 px-3 border border-stone-200/40">
                      {lang === 'pt' ? `Ciclos Completados: ${breathingCycles}` : `Cycles Completed: ${breathingCycles}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* O Espaço em Branco (Textarea Autoresize) */}
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={lang === 'pt' ? 'Comece de onde de seu coração ditar...' : 'Begin writing wherever your breathing guides you...'}
          className="flex-1 w-full bg-transparent border-none outline-none resize-none text-lg md:text-xl leading-relaxed text-stone-800 placeholder:text-stone-350 focus:ring-0 min-h-[40vh] font-light py-2"
          autoFocus
        />
      </main>
      
    </div>
  );
};
export default TelaRefugio;
