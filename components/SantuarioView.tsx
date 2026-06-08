import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, Droplets, Volume2, VolumeX, Sparkles, Anchor, Compass, Play, Pause, Wind, Sliders, Heart, BookOpen, Clock } from 'lucide-react';
import { User, Language, NeuroProfileType } from '../types';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { useNeuroProfileManager, neuroProfiles } from './NeuroAdaptiveEngine';

interface SantuarioViewProps {
  user: User;
  lang: Language;
  onNavigateToTab: (tab: 'conversar' | 'refletir' | 'evoluir') => void;
  isLightTheme: boolean;
  onToggleTheme: () => void;
  onAddToast: (toast: { type: string; title: string; description: string }) => void;
  onOpenTuningPopover: () => void;
  onTextSizeChange?: (size: 'small' | 'medium' | 'large') => void;
  onAccessibilityModeChange?: (active: boolean) => void;
}

type Soundscape = 'silent' | 'ocean' | 'breeze' | 'bowl';

export const SantuarioView: React.FC<SantuarioViewProps> = ({
  user,
  lang,
  onNavigateToTab,
  isLightTheme,
  onToggleTheme,
  onAddToast,
  onOpenTuningPopover,
  onTextSizeChange,
  onAccessibilityModeChange,
}) => {
  const { profile } = useNeuroProfileManager(user?.id);
  const activeMode = profile?.neuroType || (user?.neuroMode as NeuroProfileType) || 'normal';
  const spec = neuroProfiles[activeMode] || neuroProfiles.normal;

  const [isWatering, setIsWatering] = useState(false);
  const [waterSplash, setWaterSplash] = useState(false);
  const [currentSound, setCurrentSound] = useState<Soundscape>('silent');

  // Dynamic average Sopro heart rate and sync pulse
  const [soproBpm, setSoproBpm] = useState(65);

  // Core Garden Echoes (Reflected Thoughts)
  const [journals, setJournals] = useState<any[]>([]);
  const [selectedEcho, setSelectedEcho] = useState<any | null>(null);

  useEffect(() => {
    // Fetch average heart rate from Sopro breathing sessions
    try {
      const savedBpm = localStorage.getItem('pch_sopro_avg_bpm');
      if (savedBpm) {
        const parsed = parseInt(savedBpm, 10);
        if (parsed >= 40 && parsed <= 180) {
          setSoproBpm(parsed);
        }
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const fetchJournals = async () => {
      const currentUser = auth?.currentUser;
      let localEntries: any[] = [];
      
      try {
        const stored = localStorage.getItem('pch_journal_entries');
        if (stored) {
          localEntries = JSON.parse(stored);
        }
      } catch (err) {
        console.error("Localstorage journals error:", err);
      }

      if (currentUser) {
        try {
          const colRef = collection(db, 'users', currentUser.uid, 'journals');
          const snap = await getDocs(colRef);
          const fbEntries: any[] = snap.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          
          const merged: any[] = [...fbEntries];
          localEntries.forEach(le => {
            if (!merged.some(fe => fe.id === le.id)) {
              merged.push(le);
            }
          });
          // Sort chronologically (oldest to newest)
          merged.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          setJournals(merged);
        } catch (err) {
          console.error("Error fetching journals for sanctuary echoes:", err);
          localEntries.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
          setJournals(localEntries);
        }
      } else {
        localEntries.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        setJournals(localEntries);
      }
    };

    fetchJournals();
  }, []);

  // Web Audio Synthesizer refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeSynthNodesRef = useRef<any[]>([]);
  const bowlIntervalRef = useRef<any>(null);

  const points = user?.points || 0;

  // Feature: Reactive Organic Glowing Spores (Particles representing Growth & consistency)
  const [particles, setParticles] = useState<any[]>([]);

  useEffect(() => {
    // Generate organic particles depending on experience and streak (consistency)
    const consistency = user?.streak || 3;
    const count = Math.min(12 + consistency * 4, 35);
    const items = Array.from({ length: count }).map((_, idx) => {
      const size = Math.random() * 3 + 1.2;
      const left = Math.random() * 88 + 6; 
      const duration = Math.random() * 5 + 4; 
      const delay = Math.random() * -10; 
      const colors = ['#34D399', '#2DD4BF', '#FBBF24', '#8B5CF6'];
      const color = colors[idx % colors.length];
      return {
        id: idx,
        size,
        left,
        duration,
        delay,
        color
      };
    });
    setParticles(items);
  }, [user?.streak, points]);

  // Cleanup synthesizer on unmount
  useEffect(() => {
    return () => {
      stopAllSynth();
    };
  }, []);

  // Web Audio ambient soundscape engine
  const initAudioCtx = () => {
    if (!audioCtxRef.current) {
      const AudioCtxClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtxClass) {
        audioCtxRef.current = new AudioCtxClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const stopAllSynth = () => {
    if (bowlIntervalRef.current) {
      clearInterval(bowlIntervalRef.current);
      bowlIntervalRef.current = null;
    }
    activeSynthNodesRef.current.forEach((node) => {
      try {
        node.stop();
      } catch (e) {}
    });
    activeSynthNodesRef.current = [];
  };

  const startSoundscape = (type: Soundscape) => {
    initAudioCtx();
    stopAllSynth();
    
    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (type === 'silent') return;

    if (type === 'breeze') {
      // 1. Synthesize atmospheric warm breeze using noise buffer with a sweeping lowpass BiquadFilter
      const bufferSize = ctx.sampleRate * 2; // 2 seconds
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoiseSource = ctx.createBufferSource();
      whiteNoiseSource.buffer = noiseBuffer;
      whiteNoiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.04, ctx.currentTime);

      // Modulate lowpass frequency to simulate wind gusts
      const lfo = ctx.createOscillator();
      lfo.frequency.setValueAtTime(0.15, ctx.currentTime); // very slow sweep
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(140, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      whiteNoiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      lfo.start();
      whiteNoiseSource.start();

      activeSynthNodesRef.current.push(whiteNoiseSource, lfo);
    } 
    else if (type === 'ocean') {
      // 2. Synthesize comforting ocean waves utilizing sweeping narrow-band filtered pink-equivalent noise
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(1.2, ctx.currentTime);
      filter.frequency.setValueAtTime(240, ctx.currentTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.03, ctx.currentTime);

      // Sweep bandpass center to simulate wave swells
      const oscMod = ctx.createOscillator();
      oscMod.frequency.setValueAtTime(0.08, ctx.currentTime); // 12 seconds per wave period
      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(120, ctx.currentTime);

      oscMod.connect(oscGain);
      oscGain.connect(filter.frequency);
      noiseSource.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      oscMod.start();
      noiseSource.start();

      activeSynthNodesRef.current.push(noiseSource, oscMod);
    } 
    else if (type === 'bowl') {
      // 3. Tibetan Singing Bowl Synthesizer generator (bell synthesis) with slow repetitions
      const triggerBowlSino = () => {
        if (!audioCtxRef.current) return;
        const c = audioCtxRef.current;
        const now = c.currentTime;

        const baseFreq = 168.2; // deep calming baritone frequency F3
        const harmonics = [1, 1.98, 2.95, 4.05]; // Bell frequencies ratios
        const gains = [0.15, 0.08, 0.04, 0.02];

        harmonics.forEach((ratio, idx) => {
          const osc = c.createOscillator();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(baseFreq * ratio, now);

          // Add subtle vibrato (ambient detuning sound)
          const lfo = c.createOscillator();
          lfo.frequency.setValueAtTime(1.5 + idx * 0.5, now);
          const lfoGain = c.createGain();
          lfoGain.gain.setValueAtTime(1.5, now);

          const envelope = c.createGain();
          envelope.gain.setValueAtTime(0, now);
          envelope.gain.linearRampToValueAtTime(gains[idx] * 0.5, now + 0.1);
          envelope.gain.exponentialRampToValueAtTime(0.00001, now + 5); // decay over 5s

          lfo.connect(lfoGain);
          lfoGain.connect(osc.frequency);
          osc.connect(envelope);
          envelope.connect(c.destination);

          lfo.start();
          osc.start();
          osc.stop(now + 6.5);
        });
      };

      triggerBowlSino();
      bowlIntervalRef.current = setInterval(triggerBowlSino, 6500);
    }
  };

  const handleToggleSoundscape = (type: Soundscape) => {
    if (currentSound === type) {
      stopAllSynth();
      setCurrentSound('silent');
    } else {
      startSoundscape(type);
      setCurrentSound(type);
      onAddToast({
        type: 'success',
        title: lang === 'pt' ? 'Som Ativado 🎶' : 'Calm Engaged 🎶',
        description: lang === 'pt' 
          ? `O ambiente sonoro do Santuário foi sintonizado com sua mente.` 
          : `Synthesized background soundscape loaded.`
      });
    }
  };

  const getGardenStage = (xp: number) => {
    if (xp <= 100) {
      return { 
        stage: 1, 
        namePt: 'Fase 1: Semente Cósmica', 
        nameEn: 'Phase 1: Cosmic Seed',
        descPt: 'Sua intenção reside latente no silêncio primordial, envolta por mistério.',
        descEn: 'Your intention lies dormant in the baseline silence, cradled in mystery.'
      };
    } else if (xp <= 255) {
      return { 
        stage: 2, 
        namePt: 'Fase 2: Broto Sagrado', 
        nameEn: 'Phase 2: Sacred Sprout',
        descPt: 'A primeira folha verde surge da quietude, buscando a luz do autoconhecimento.',
        descEn: 'The first emerald leaf sprouts from the quiet, reaching for conscious light.'
      };
    } else if (xp <= 500) {
      return { 
        stage: 3, 
        namePt: 'Fase 3: Árvore da Presença', 
        nameEn: 'Phase 3: Tree of Presence',
        descPt: 'Tronco robusto e raízes profundas firmemente ancorados em clareza emocional.',
        descEn: 'A resilient trunk and deep roots anchored in emotional clarity.'
      };
    } else if (xp <= 800) {
      return { 
        stage: 4, 
        namePt: 'Fase 4: Florescimento Poético', 
        nameEn: 'Phase 4: Poetic Blooming',
        descPt: 'Pétalas de renovação e cura exalam fragrância cognitiva sob a sintonia de paz.',
        descEn: 'Blossoms of renewal and cognitive healing release tranquility under the light.'
      };
    } else {
      return { 
        stage: 5, 
        namePt: 'Fase 5: Constelação Interior', 
        nameEn: 'Phase 5: Inner Constellation',
        descPt: 'Seu jardim se conecta ao cosmos. Cada flor é uma estrela sintonizada.',
        descEn: 'Your garden fuses with the stars. Each blossom acts as a stellar coordinate.'
      };
    }
  };

  const gardenInfo = getGardenStage(points);

  const triggerGongWaterPitch = () => {
    initAudioCtx();
    const c = audioCtxRef.current;
    if (!c) return;
    const now = c.currentTime;
    
    // Play sweet celestial water xylophone note
    const osc = c.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(523.25, now); // C5 harmonic
    osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.35); // G5 glide
    
    const env = c.createGain();
    env.gain.setValueAtTime(0.08, now);
    env.gain.exponentialRampToValueAtTime(0.0001, now + 0.82);
    
    osc.connect(env);
    env.connect(c.destination);
    osc.start();
    osc.stop(now + 1);
  };

  const handleWaterGarden = async () => {
    if (isWatering) return;
    setIsWatering(true);
    setWaterSplash(true);
    triggerGongWaterPitch();

    setTimeout(() => {
      setWaterSplash(false);
    }, 1200);

    setTimeout(async () => {
      setIsWatering(false);
      
      if (user?.id) {
        try {
          const userDocRef = doc(db, 'users', user.id);
          const newPoints = (user.points || 0) + 15;
          let newLevel = user.level || 1;
          if (newPoints >= newLevel * 200) {
            newLevel += 1;
          }
          await updateDoc(userDocRef, {
            points: newPoints,
            level: newLevel
          });

          onAddToast({
            type: 'success',
            title: lang === 'pt' ? 'Árvore Nutrida! 💧' : 'Tree Nourished! 💧',
            description: lang === 'pt' 
              ? 'Água de presença aplicada. +15 XP integrados ao seu Santuário Interior.' 
              : 'Flow of presence applied. +15 XP integrated into your Inner Sanctuary.'
          });
        } catch (e) {
          console.error("Database update failed:", e);
        }
      }
    }, 1600);
  };

  const getGreeting = () => {
    const hours = new Date().getHours();
    const userName = user?.name || 'Alma';
    if (hours >= 6 && hours < 12) {
      return lang === 'pt' ? `Bom dia, ${userName}.` : `Good morning, ${userName}.`;
    } else if (hours >= 12 && hours < 18) {
      return lang === 'pt' ? `Boa tarde, ${userName}.` : `Good afternoon, ${userName}.`;
    } else {
      return lang === 'pt' ? `Boa noite, ${userName}.` : `Good evening, ${userName}.`;
    }
  };

  // Check state categories details from profile emotional state
  const getTuningAuraClass = () => {
    const s = (user?.emotionalState || 'neutral').toLowerCase();
    if (s.includes('low') || s.includes('sad') || s.includes('triste') || s.includes('heavy')) {
      return 'from-blue-500/10 to-indigo-500/10 shadow-[0_0_80px_rgba(59,130,246,0.15)]';
    }
    if (s.includes('anx') || s.includes('accel') || s.includes('irrit') || s.includes('raiv')) {
      return 'from-orange-500/10 to-amber-500/10 shadow-[0_0_80px_rgba(249,115,22,0.15)]';
    }
    if (s.includes('flow') || s.includes('peace') || s.includes('seren') || s.includes('paz')) {
      return 'from-emerald-500/10 to-cyan-500/10 shadow-[0_0_80px_rgba(16,185,129,0.15)]';
    }
    return 'from-teal-500/10 to-violet-500/10 shadow-[0_0_80px_rgba(20,184,166,0.15)]';
  };

  const textPrimary = isLightTheme ? 'text-stone-850 text-stone-800' : 'text-stone-100';
  const textSecondary = isLightTheme ? 'text-stone-600' : 'text-stone-300';
  const cardBgCl = isLightTheme ? 'bg-white border-stone-200/80 shadow-sm' : 'bg-stone-900/40 border-stone-800/80';

  // Synchronized Pulse Duration based on average Sopro heart rate
  const pulseDuration = 60 / soproBpm;

  interface MicroPractice {
    titlePt: string;
    titleEn: string;
    descPt: string;
    descEn: string;
    tipPt: string;
    tipEn: string;
    duration: string;
    icon: string;
    targetTab: 'conversar' | 'refletir' | 'evoluir';
  }

  const getMicroPractice = (): MicroPractice => {
    const s = (user?.emotionalState || '').toLowerCase();
    
    if (s.includes('low') || s.includes('sad') || s.includes('triste') || s.includes('heavy') || s.includes('rest')) {
      return {
        titlePt: 'Ancoragem do Silêncio 🕊️',
        titleEn: 'Sanctuary of Gentle Rest 🕊️',
        descPt: 'Seu estado indica cansaço ou peso mental. Faça 2 minutos de escrita lenta no seu refúgio diário para acalmar o coração e desabafar.',
        descEn: 'Your tone/state reflects exhaustion. Refuse active strain and write your thoughts down slowly for 2 minutes inside our journal space.',
        tipPt: 'Dica: Permita-se escrever sem filtros ou julgamentos.',
        tipEn: 'Tip: Speak and let your feelings flow unconditionally.',
        duration: '2 min',
        icon: '❄️',
        targetTab: 'refletir'
      };
    }
    
    if (s.includes('anx') || s.includes('accel') || s.includes('irrit') || s.includes('raiv') || s.includes('agita')) {
      return {
        titlePt: 'Pausa Coerente de Sopro 🌀',
        titleEn: 'Cardiopulmonary Cardiac Coherence 🌀',
        descPt: 'Sua mente apresenta certa turbulência ou agitação. Pratique um ciclo completo de Box Breathing (4-4-4-4) para regular seus batimentos em tempo real.',
        descEn: 'Your mind is exhibiting speed. Activate 4 cycles of Coherent Box Breathing right now to harmonize heart rate and calm neurotransmitters.',
        tipPt: 'Dica: Siga o pacer de expansão do balão cósmico até o fim.',
        tipEn: 'Tip: Slow down and match your breath pace exactly to the scaling balloon.',
        duration: '3 min',
        icon: '🔥',
        targetTab: 'refletir'
      };
    }
    
    if (s.includes('flow') || s.includes('peace') || s.includes('seren') || s.includes('paz')) {
      return {
        titlePt: 'Ampliação de Presença e Gratidão ✨',
        titleEn: 'Presence Expansion & Gratitude ✨',
        descPt: 'Você está vibrando em serenidade e fluxo excelente! Firme essa harmonia registrando 3 percepções gratas em seu repositório de memórias.',
        descEn: 'You are residing in beautiful clarity! Anchor this stable neural resonance by writing 3 small gratitudes or bright moments.',
        tipPt: 'Dica: Regue a árvore em seguida para selar sua semente de crescimento.',
        tipEn: 'Tip: Click or touch our Inner Tree to water it and multiply its flowers.',
        duration: '1.5 min',
        icon: '🍃',
        targetTab: 'refletir'
      };
    }

    return {
      titlePt: 'Sintonização Primordial Diária 🧘',
      titleEn: 'Primordial Daily Coherence 🧘',
      descPt: 'Bem-vindo ao seu ninho. Vamos fazer uma prática de escuta e fala compassiva com a Voz Interior para purificar o filtro cognitivo de hoje.',
      descEn: 'Welcome back. Let us initiate an active speech session with our speech guide to align today\'s cognitive adaptations.',
      tipPt: 'Dica: Siga os sussurros do jardim para abrir as portas de sua mente.',
      tipEn: 'Tip: Activate one of our singing bell soundscapes to set the right room vibe.',
      duration: '4 min',
      icon: '🔮',
      targetTab: 'conversar'
    };
  };

  const currentInvite = getMicroPractice();

  return (
    <div className="w-full min-h-full pb-24 text-[#E0E7E5] font-sans transition-colors duration-500 relative flex flex-col justify-between">
      
      {/* 1. Header Greeting & Environmental Tuning Badge */}
      <div className="max-w-4xl mx-auto px-6 pt-6 w-full space-y-4">
        
        {/* Poetic Greeting Title */}
        <div className="text-left space-y-1">
          <div className="flex items-center gap-1 text-xs text-teal-400 font-mono tracking-widest uppercase">
            <Sprout className="w-3.5 h-3.5 animate-pulse" />
            <span>{lang === 'pt' ? 'Mundo Orgânico Interior' : 'Organic Inner Sanctuary'}</span>
          </div>
          <h2 className={`text-2xl md:text-3xl font-serif font-black tracking-tight leading-tight ${textPrimary}`}>
            {getGreeting()}
          </h2>
          <p className={`text-xs md:text-sm font-light leading-relaxed tracking-wide ${textSecondary}`}>
            {lang === 'pt' 
              ? 'Contemple sua Árvore Interior. Ela é o espelho vivo das suas práticas e ressonâncias.' 
              : 'Contemplate your Inner Tree. It stands as a living mirror for your mindfulness growth.'}
          </p>
        </div>

        {/* Neuro Adaptive Info-Rail / Pill (Humor, Profile Type) */}
        <div className={`p-3.5 rounded-3xl border flex flex-wrap justify-between items-center gap-3 backdrop-blur-md ${cardBgCl}`}>
          <div className="flex items-center gap-2.5 px-2">
            <span className="text-base select-none">🧘</span>
            <div className="flex flex-col text-left">
              <span className="text-[9px] font-mono uppercase text-teal-400 font-bold leading-none">
                {lang === 'pt' ? 'Filtro Cognitivo Ativo' : 'Cognitive Filter Active'}
              </span>
              <span className={`text-[12px] font-serif font-black ${textPrimary}`}>
                {lang === 'pt' ? spec.labelPt : spec.labelEn}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick adjust accessibility profile link */}
            <span className="text-[10px] text-stone-500 font-mono select-none">
              LVL {user.level || 1} • {user.points || 0} XP
            </span>
          </div>
        </div>

      </div>

      {/* 2. CENTER PIECE: THE LIVING INNER TREE ARCHITECTURE */}
      <div className="w-full max-w-xl mx-auto px-6 py-6 flex flex-col items-center justify-center relative">
        
        {/* Large Glowing Aura reflecting user state */}
        <div className={`absolute w-[240px] h-[240px] rounded-full blur-[80px] pointer-events-none transition-all duration-1000 ${getTuningAuraClass()}`} />

        {/* The Tree SVG box / canvas */}
        <div className="w-60 h-60 relative flex items-center justify-center select-none">
          
          <AnimatePresence>
            {isWatering && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-teal-400/5 rounded-full flex flex-col justify-start items-center pt-2 z-20 pointer-events-none"
              >
                {[1, 2, 3, 4, 5, 6].map((p) => (
                  <motion.div
                    key={p}
                    initial={{ y: -20, opacity: 0, scale: 0.8 }}
                    animate={{ y: 220, opacity: [0, 0.8, 0] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: p * 0.15, ease: 'linear' }}
                    className="absolute w-1 h-3.5 bg-teal-400 rounded-full"
                    style={{ left: `${20 + p * 11}%` }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {waterSplash && (
              <motion.div 
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 1.6, opacity: 1 }}
                exit={{ scale: 1.8, opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute w-24 h-24 border border-teal-400/40 rounded-full bg-teal-400/5 z-15 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Render real-time customized interactive biological tree model */}
          <motion.div 
            className="w-full h-full relative cursor-pointer" 
            onClick={handleWaterGarden} 
            title={lang === 'pt' ? 'Toque na árvore para regá-la' : 'Click tree to nourish it'}
            animate={{ scale: [1, 1.025, 1], rotate: [-0.2, 0.2, -0.2] }}
            transition={{ repeat: Infinity, duration: pulseDuration, ease: "easeInOut" }}
          >
            
            {/* Lightweight ambient glowing particles representing growth & neural consistency */}
            <div className="absolute inset-x-0 bottom-4 top-0 overflow-hidden pointer-events-none z-10">
              {particles.map((p) => (
                <motion.span
                  key={`particle-${p.id}`}
                  className="absolute rounded-full"
                  style={{
                    width: p.size,
                    height: p.size,
                    backgroundColor: p.color,
                    left: `${p.left}%`,
                    bottom: 0,
                    boxShadow: `0 0 6px ${p.color}`,
                    willChange: 'transform, opacity',
                  }}
                  animate={{
                    y: ['100%', '-140%'],
                    x: ['0%', `${Math.sin(p.id) * 30}px`, '0%'],
                    opacity: [0, 0.9, 0.4, 0],
                  }}
                  transition={{
                    duration: p.duration,
                    repeat: Infinity,
                    ease: 'linear',
                    delay: p.delay,
                  }}
                />
              ))}
            </div>
            
            {gardenInfo.stage === 1 && (
              <motion.svg viewBox="0 0 100 100" fill="none" className="w-full h-full" animate={{ y: [0, -3, 0] }} transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}>
                <circle cx="50" cy="50" r="14" fill="url(#sSGrad1)" className="filter drop-shadow-[0_0_12px_rgba(251,191,36,0.35)]" />
                <motion.circle cx="50" cy="50" r="22" stroke="#FBBF24" strokeWidth="1" strokeDasharray="4 4" strokeOpacity="0.4" animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 15, ease: "linear" }} />
                <path d="M50 50 Q48 42, 50 36 M50 50 Q52 44, 55 38" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
                <defs>
                  <radialGradient id="sSGrad1" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#FBBF24" />
                    <stop offset="100%" stopColor="#D97706" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </motion.svg>
            )}

            {gardenInfo.stage === 2 && (
              <motion.svg viewBox="0 0 100 100" fill="none" className="w-full h-full" animate={{ rotate: [-1, 1, -1] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}>
                <path d="M20 78 C40 74, 60 74, 80 78" stroke="rgba(20, 184, 166, 0.3)" strokeWidth="1.5" strokeLinecap="round" />
                <motion.path d="M50 76 Q45 52, 51 34" stroke="#34D399" strokeWidth="4.5" strokeLinecap="round" />
                <path d="M50 52 Q37 44, 38 34 Q46 38, 49 48" fill="#14B8A6" />
                <path d="M50 44 Q63 40, 64 28 Q57 32, 51 39" fill="#34D399" />
                <circle cx="51" cy="24" r="4.5" fill="#FBBF24" className="animate-pulse" />
              </motion.svg>
            )}

            {gardenInfo.stage === 3 && (
              <motion.svg viewBox="0 0 100 100" fill="none" className="w-full h-full" animate={{ y: [0, -1.5, 0], rotate: [-0.5, 0.5, -0.5] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}>
                <path d="M50 82 L50 48" stroke="#1E293B" strokeWidth="7" strokeLinecap="round" />
                <path d="M50 82 L50 48" stroke="#14B8A6" strokeWidth="2.5" strokeLinecap="round" strokeOpacity="0.4" />
                <path d="M50 58 Q34 48, 30 40" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" />
                <path d="M50 52 Q66 45, 70 38" stroke="#1E293B" strokeWidth="4" strokeLinecap="round" strokeOpacity="0.8" />
                
                <circle cx="50" cy="35" r="16" fill="#34D399" fillOpacity="0.3" stroke="#34D399" strokeWidth="1" strokeOpacity="0.3" />
                <circle cx="32" cy="35" r="11" fill="#14B8A6" fillOpacity="0.25" stroke="#14B8A6" strokeWidth="1" strokeOpacity="0.25" />
                <circle cx="68" cy="32" r="13" fill="#14B8A6" fillOpacity="0.25" stroke="#14B8A6" strokeWidth="1" strokeOpacity="0.25" />
                <circle cx="50" cy="22" r="4.5" fill="#34D399" className="animate-pulse" />
              </motion.svg>
            )}

            {gardenInfo.stage === 4 && (
              <motion.svg viewBox="0 0 100 100" fill="none" className="w-full h-full" animate={{ y: [0, -2, 0], rotate: [-1, 1, -1] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}>
                <path d="M50 82 L50 48" stroke="#1E293B" strokeWidth="6" strokeLinecap="round" />
                <path d="M50 82 L50 48" stroke="#14B8A6" strokeWidth="2" strokeLinecap="round" strokeOpacity="0.5" />
                
                <path d="M50 55 Q30 40, 24 35" stroke="#1E293B" strokeWidth="3" />
                <path d="M50 50 Q70 36, 76 30" stroke="#1E293B" strokeWidth="3" />

                <circle cx="50" cy="38" r="16" fill="#14B8A6" fillOpacity="0.2" />
                <circle cx="28" cy="35" r="12" fill="#34D399" fillOpacity="0.2" />
                <circle cx="72" cy="30" r="13" fill="#34D399" fillOpacity="0.2" />

                <circle cx="28" cy="28" r="5" fill="#FBBF24" className="filter drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                <circle cx="74" cy="22" r="6" fill="#FBBF24" className="filter drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
                <circle cx="48" cy="22" r="7" fill="#14B8A6" className="filter drop-shadow-[0_0_8px_rgba(20,184,166,0.5)]" />
              </motion.svg>
            )}

            {gardenInfo.stage === 5 && (
              <motion.svg viewBox="0 0 100 100" fill="none" className="w-full h-full">
                <line x1="50" y1="80" x2="28" y2="45" stroke="#14B8A6" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="4 4" />
                <line x1="50" y1="80" x2="72" y2="45" stroke="#14B8A6" strokeWidth="1.5" strokeOpacity="0.4" strokeDasharray="4 4" />
                <circle cx="50" cy="80" r="5" fill="#34D399" />
                <motion.g animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 25, ease: "linear" }} style={{ originX: '50px', originY: '45px' }}>
                  <circle cx="28" cy="45" r="9" fill="#14B8A6" fillOpacity="0.5" />
                  <circle cx="72" cy="45" r="10" fill="#8B5CF6" fillOpacity="0.5" />
                </motion.g>
                <circle cx="50" cy="18" r="13" fill="#FBBF24" className="filter drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]" />
              </motion.svg>
            )}

            {/* Garden Echoes (Ecos do Jardim) Overlay interactive fruits */}
            {journals.slice(0, 6).map((entry, index) => {
              const echoPosCoords = [
                { left: '32%', top: '38%' },
                { left: '68%', top: '35%' },
                { left: '50%', top: '23%' },
                { left: '26%', top: '48%' },
                { left: '74%', top: '45%' },
                { left: '44%', top: '34%' },
              ];
              const pos = echoPosCoords[index % echoPosCoords.length];
              const colorsList = ['bg-rose-500', 'bg-amber-500', 'bg-emerald-500', 'bg-sky-500', 'bg-indigo-500', 'bg-teal-500'];
              const colorClass = colorsList[index % colorsList.length];
              
              return (
                <button
                  key={`echo-fruit-${entry.id}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedEcho(entry);
                  }}
                  style={{ left: pos.left, top: pos.top }}
                  className={`absolute w-3.5 h-3.5 rounded-full ${colorClass} shadow-md border border-white/80 cursor-pointer animate-pulse hover:scale-[1.3] transition-transform z-20 flex items-center justify-center`}
                  title={lang === 'pt' ? 'Ver eco de reflexão' : 'View reflection echo'}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-white block" />
                </button>
              );
            })}

          </motion.div>

        </div>

        {/* Display Garden Level Info Label */}
        <div className="space-y-1 text-center mt-2">
          <span className="text-[10px] font-mono tracking-widest text-[#10B981] font-extrabold uppercase bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/10">
            {lang === 'pt' ? gardenInfo.namePt : gardenInfo.nameEn}
          </span>
          <p className={`text-xs ${textSecondary} px-8 leading-relaxed max-w-sm mx-auto italic mt-2`}>
            "{lang === 'pt' ? gardenInfo.descPt : gardenInfo.descEn}"
          </p>
        </div>

        {/* Convite do Dia / Dynamic Micro-Practices based on current tone */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`w-full max-w-md p-4 mt-6 rounded-2.5xl border flex flex-col gap-3 backdrop-blur-md relative overflow-hidden ${cardBgCl}`}
        >
          {/* Neon accent glow behind card */}
          <div className="absolute top-0 right-0 w-16 h-16 bg-teal-500/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-500 font-mono text-[9px] uppercase tracking-widest font-extrabold">
              <span className="text-xs select-none">✨</span>
              <span>{lang === 'pt' ? 'Convite de Sintonia' : 'Daily Invitation'}</span>
            </div>
            <span className="text-[9px] font-mono font-bold bg-[#14B8A6]/10 text-teal-400 border border-teal-500/10 rounded px-2.5 py-0.5 uppercase tracking-wide">
              {currentInvite.duration}
            </span>
          </div>

          <div className="space-y-1 text-left">
            <h4 className={`text-sm font-serif font-black ${textPrimary} flex items-center gap-1`}>
              <span>{currentInvite.icon}</span>
              <span>{lang === 'pt' ? currentInvite.titlePt : currentInvite.titleEn}</span>
            </h4>
            <p className={`text-[11px] leading-relaxed font-light ${textSecondary}`}>
              {lang === 'pt' ? currentInvite.descPt : currentInvite.descEn}
            </p>
            <p className="text-[10px] text-teal-500 italic font-mono pt-1">
              {lang === 'pt' ? currentInvite.tipPt : currentInvite.tipEn}
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab(currentInvite.targetTab)}
            className="w-full py-2 bg-stone-850 hover:bg-stone-900 bg-stone-800 text-white rounded-xl text-xs uppercase tracking-wider font-mono font-bold transition-all hover:scale-[1.01] active:scale-95 cursor-pointer shadow-sm text-center"
          >
            {lang === 'pt' ? 'Iniciar Prática Proposta' : 'Begin Suggested Practice'}
          </button>
        </motion.div>

      </div>

      {/* 3. INTERACTIVE ACTIONS (Water, Sounds and Shortcuts) */}
      <div className="max-w-xl mx-auto px-6 w-full space-y-6">
        
        {/* ACTION: Regar com Presença Button */}
        <div className="text-center w-full">
          <button
            onClick={handleWaterGarden}
            disabled={isWatering}
            className={`w-full py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2.5 font-mono text-xs uppercase tracking-widest font-black transition-all duration-300 border ${
              isWatering
                ? 'bg-emerald-500/10 border-emerald-500/20 text-[#10B981]/50 cursor-slow'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-stone-950 border-transparent shadow-[0_4px_16px_rgba(16,185,129,0.2)] active:scale-98 shadow-md cursor-pointer'
            }`}
          >
            <Droplets className={`w-4 h-4 ${isWatering ? 'animate-bounce' : ''}`} />
            <span>
              {isWatering 
                ? (lang === 'pt' ? 'Nutrindo Árvore...' : 'Nourishing Tree...') 
                : (lang === 'pt' ? 'Regar com Intenção (+15 XP)' : 'Water with Intention (+15 XP)')}
            </span>
          </button>
        </div>

        {/* SOUNDSCAPES: Sons do Santuário Synth Active Panel */}
        <div className={`p-5 rounded-3xl border ${cardBgCl} space-y-3.5 text-left`}>
          <div className="flex items-center space-x-2 border-b border-stone-800/10 pb-2">
            <Volume2 className="w-4 h-4 text-teal-400" />
            <h4 className={`text-[10px] font-mono tracking-widest uppercase font-bold ${textPrimary}`}>
              {lang === 'pt' ? 'Atmosfera Sonora do Santuário' : 'Ambient Sacred Sounds'}
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Silêncio */}
            <button
              onClick={() => handleToggleSoundscape('silent')}
              className={`p-2 rounded-xl text-[10px] font-mono uppercase tracking-widest text-center border transition-all cursor-pointer ${
                currentSound === 'silent'
                  ? 'bg-stone-50 text-stone-900 border-transparent'
                  : 'bg-stone-950/20 border-stone-800 hover:bg-stone-900/40 text-stone-400'
              }`}
            >
              🔇 {lang === 'pt' ? 'Silêncio' : 'Silence'}
            </button>

            {/* Ondas da Calma */}
            <button
              onClick={() => handleToggleSoundscape('ocean')}
              className={`p-2 rounded-xl text-[10px] font-mono uppercase tracking-widest text-center border transition-all cursor-pointer ${
                currentSound === 'ocean'
                  ? 'bg-teal-500/10 border-teal-500/30 text-teal-400 font-bold'
                  : 'bg-stone-950/20 border-stone-800 hover:bg-stone-900/40 text-stone-400'
              }`}
            >
              🌊 {lang === 'pt' ? 'Ondas' : 'Waves'}
            </button>

            {/* Brisa do Jardim */}
            <button
              onClick={() => handleToggleSoundscape('breeze')}
              className={`p-2 rounded-xl text-[10px] font-mono uppercase tracking-widest text-center border transition-all cursor-pointer ${
                currentSound === 'breeze'
                  ? 'bg-teal-500/10 border-teal-500/30 text-teal-400 font-bold'
                  : 'bg-stone-950/20 border-stone-800 hover:bg-stone-900/40 text-stone-400'
              }`}
            >
              🍃 {lang === 'pt' ? 'Brisa' : 'Breeze'}
            </button>

            {/* Sino Tibetan (Bell Bowl) */}
            <button
              onClick={() => handleToggleSoundscape('bowl')}
              className={`p-2 rounded-xl text-[10px] font-mono uppercase tracking-widest text-center border transition-all cursor-pointer ${
                currentSound === 'bowl'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 font-bold'
                  : 'bg-stone-950/20 border-stone-800 hover:bg-stone-900/40 text-stone-400'
              }`}
            >
              🔔 {lang === 'pt' ? 'Gong' : 'Singing Bowl'}
            </button>
          </div>
        </div>

        {/* CO-REGULATION SHORTCUT TRILOGY */}
        <div className="grid grid-cols-3 gap-3">
          
          <button
            onClick={() => onNavigateToTab('conversar')}
            className={`p-3.5 rounded-2xl border text-center transition-all hover:scale-[1.03] active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1.5 ${cardBgCl}`}
          >
            <span className="text-[14px]">🎙️</span>
            <span className={`text-[9px] font-mono uppercase tracking-wider font-extrabold ${textPrimary}`}>
              {lang === 'pt' ? 'Conversar' : 'Chat'}
            </span>
          </button>

          <button
            onClick={() => onNavigateToTab('refletir')}
            className={`p-3.5 rounded-2xl border text-center transition-all hover:scale-[1.03] active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1.5 ${cardBgCl}`}
          >
            <span className="text-[14px]">📖</span>
            <span className={`text-[9px] font-mono uppercase tracking-wider font-extrabold ${textPrimary}`}>
              {lang === 'pt' ? 'Refletir' : 'Reflect'}
            </span>
          </button>

          <button
            onClick={() => onNavigateToTab('evoluir')}
            className={`p-3.5 rounded-2xl border text-center transition-all hover:scale-[1.03] active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1.5 ${cardBgCl}`}
          >
            <span className="text-[14px]">⭐</span>
            <span className={`text-[9px] font-mono uppercase tracking-wider font-extrabold ${textPrimary}`}>
              {lang === 'pt' ? 'Evoluir' : 'Evolve'}
            </span>
          </button>

        </div>

      </div>

      {/* Garden Echo Details Modal */}
      <AnimatePresence>
        {selectedEcho && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEcho(null)}
            className="fixed inset-0 z-[160] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#FDFBF7] border border-stone-200 p-6 rounded-2xl shadow-xl max-w-sm w-full space-y-4 text-stone-800 animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-600">
                  <BookOpen className="w-4 h-4" />
                  <span className="font-mono text-[10px] uppercase tracking-wider font-semibold">
                    {lang === 'pt' ? 'Eco do Jardim' : 'Garden Echo'}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedEcho(null)}
                  className="text-stone-400 hover:text-stone-750 font-mono text-xs cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2">
                <p className="text-[10px] text-stone-450 font-mono">
                  {new Date(selectedEcho.date).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                {selectedEcho.prompt && (
                  <p className="text-xs italic text-stone-500 font-serif border-l-2 border-amber-300 pl-2.5">
                    "{selectedEcho.prompt}"
                  </p>
                )}
                <div className="text-sm font-sans leading-relaxed text-stone-700 bg-stone-50/50 p-3 rounded-xl border border-stone-200/40 max-h-48 overflow-y-auto no-scrollbar font-light">
                  {selectedEcho.text}
                </div>
              </div>

              <div className="text-center pt-2">
                <button
                  onClick={() => setSelectedEcho(null)}
                  className="py-1.5 px-4 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs uppercase font-mono tracking-wider cursor-pointer transition-all"
                >
                  {lang === 'pt' ? 'Deixar Eco' : 'Dismiss Echo'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SantuarioView;
