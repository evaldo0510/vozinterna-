import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sprout, Droplets, Volume2, VolumeX, Sparkles, Anchor, Compass, Play, Pause, Wind, Sliders, Heart, BookOpen, Clock } from 'lucide-react';
import { User, Language, NeuroProfileType } from '../types';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { useNeuroProfileManager, neuroProfiles } from './NeuroAdaptiveEngine';
import { DailyAffirmation } from './DailyAffirmation';
import { BreathingGuide } from './BreathingGuide';

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
  const [showBreathingGuide, setShowBreathingGuide] = useState(false);

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
        namePt: 'Semente Cósmica • Intenção', 
        nameEn: 'Cosmic Seed • Intention',
        descPt: 'Sua intenção de calma reside latente no silêncio primordial, envolta por mistério e esperança.',
        descEn: 'Your intent of calm lies dormant in the baseline silence, cradled in baseline peace.'
      };
    } else if (xp <= 255) {
      return { 
        namePt: 'Despertar Verdejante • Presença', 
        nameEn: 'Sacred Sprout Awakening • Presence',
        descPt: 'A primeira folha de presença surge da quietude, buscando a luz dourada do autoconhecimento.',
        descEn: 'The first emerald leaf of presence sprouts from the quiet, reaching for conscious light.'
      };
    } else if (xp <= 500) {
      return { 
        namePt: 'Raízes Profundas • Conexão', 
        nameEn: 'Roots of Calm Presence • Connection',
        descPt: 'Tronco esguio e canopia em expansão firmemente ancorados em aceitação e clareza emocional.',
        descEn: 'A resilient trunk and deep roots anchored in deep emotional clarity.'
      };
    } else if (xp <= 800) {
      return { 
        namePt: 'Espelho da Alma • Florescimento', 
        nameEn: 'Blossoms of Inner Silence • Bloom',
        descPt: 'Pétalas de renovação e cura exalam fragrância cognitiva sob a sintonia de paz profunda.',
        descEn: 'Blossoms of renewal and cognitive healing release tranquility under the inner light.'
      };
    } else {
      return { 
        namePt: 'Santuário Florescido • Integração', 
        nameEn: 'Fully Unfolded Sanctuary • Integration',
        descPt: 'Seu jardim se cura e se une ao cosmos em perfeita serenidade. Cada ramo vibra em paz.',
        descEn: 'Your garden heals and fuses with the cosmos. Every branch and bloom is aligned.'
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
              ? 'Água de presença aplicada. Mais saúde e vitalidade integradas ao seu Santuário Interior.' 
              : 'Flow of presence applied. More health and vitality integrated into your Inner Sanctuary.'
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

  // Helper to obtain custom neurodesign style attributes for each profile
  const getNeuroTheme = (mode: NeuroProfileType, isLight: boolean) => {
    switch (mode) {
      case 'tdah':
        return {
          bgClass: isLight 
            ? 'bg-gradient-to-b from-[#FFFDF8] via-[#FFF9ED] to-[#FFF1CE]' 
            : 'bg-gradient-to-b from-[#080705] via-[#120F0B] to-[#1F1703]',
          cardClass: isLight
            ? 'bg-white/85 backdrop-blur-md border-amber-200/60 shadow-md rounded-[2.5rem] border'
            : 'bg-[#181510]/85 backdrop-blur-md border-[#F59E0B]/25 shadow-[0_8px_32px_rgba(245,158,11,0.05)] rounded-[2.5rem] border',
          accentText: 'text-amber-450',
          accentBg: 'bg-amber-500/10 border border-amber-500/20 text-amber-305',
          primaryText: isLight ? 'text-stone-850' : 'text-stone-100',
          secondaryText: isLight ? 'text-stone-650 font-medium' : 'text-stone-400',
          buttonClass: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-420 hover:to-orange-420 text-stone-950 font-mono tracking-widest uppercase font-black rounded-2xl cursor-pointer hover:shadow-lg hover:shadow-amber-500/25 hover:scale-[1.02] active:scale-98 transition-all',
          subtleBtnClass: 'bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/20 text-amber-450 rounded-xl transition-all cursor-pointer',
          treeGlow: 'rgba(245, 158, 11, 0.45)',
          treePulse: 1.4, // Snappy pulse
          showParticles: true,
          particleColor: '#F59E0B',
          typography: 'font-sans tracking-wide',
          titleFont: 'font-sans font-black uppercase tracking-wider',
          organicBorder: 'rounded-[2.5rem] border border-dashed border-amber-550/20',
          interactiveTonePt: 'Modo Foco Ativo: Micro-tarefas focadas e feed dinâmico para evitar dispersão física.'
        };
      case 'autismo':
        return {
          bgClass: isLight 
            ? 'bg-[#F2F4F8]' 
            : 'bg-[#060810]',
          cardClass: isLight
            ? 'bg-white border-2 border-stone-300 shadow-none rounded-xl'
            : 'bg-[#0C0F1D] border-2 border-[#1E293B]/80 shadow-none rounded-xl',
          accentText: 'text-blue-400',
          accentBg: 'bg-blue-500/10 border border-blue-500/20 text-blue-300',
          primaryText: isLight ? 'text-stone-900 border-b border-stone-200' : 'text-stone-100 border-b border-slate-900',
          secondaryText: isLight ? 'text-stone-700 font-normal' : 'text-stone-400',
          buttonClass: 'bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-mono tracking-wider uppercase font-bold rounded-lg border-2 border-blue-600 cursor-pointer shadow-sm active:scale-95 transition-all',
          subtleBtnClass: 'bg-[#1E293B]/60 hover:bg-[#1E293B]/90 border border-stone-800 text-stone-300 rounded-lg transition-all cursor-pointer',
          treeGlow: 'none',
          treePulse: 0, // Zero movement to avoid sensory saturation
          showParticles: false, // Absolutely still
          particleColor: '#3B82F6',
          typography: 'font-mono select-text',
          titleFont: 'font-mono font-bold tracking-tight',
          organicBorder: 'rounded-xl border-2 border-[#1E293B]/50',
          interactiveTonePt: 'Modo Simetria PCH: Sem decorações supérfluas ou cores flutuantes. Informação estruturada.'
        };
      case 'ansiedade':
        return {
          bgClass: isLight 
            ? 'bg-gradient-to-b from-[#F2FDFB] via-[#E6FAF4] to-[#CEF2EA]' 
            : 'bg-gradient-to-b from-[#04090A] via-[#091516] to-[#02100E]',
          cardClass: isLight
            ? 'bg-white/95 backdrop-blur-md border-emerald-200/50 shadow-[0_4px_32px_rgba(16,185,129,0.03)] rounded-[3rem] border'
            : 'bg-[#0E1B1C]/90 backdrop-blur-md border-[#10B981]/20 shadow-[0_4px_32px_rgba(16,185,129,0.06)] rounded-[3rem] border',
          accentText: 'text-emerald-400',
          accentBg: 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300',
          primaryText: isLight ? 'text-teal-950' : 'text-emerald-50',
          secondaryText: isLight ? 'text-stone-600 font-sans font-normal opacity-90' : 'text-stone-350 font-sans font-light',
          buttonClass: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-450 hover:to-cyan-450 text-stone-950 font-serif italic font-extrabold rounded-full cursor-pointer hover:shadow-[0_8px_32px_rgba(16,185,129,0.2)] hover:scale-[1.01] active:scale-98 transition-all',
          subtleBtnClass: 'bg-emerald-500/5 hover:bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full transition-all cursor-pointer',
          treeGlow: 'rgba(16, 185, 129, 0.4)',
          treePulse: 3.8, // Slow deep breath-like pulse
          showParticles: true,
          particleColor: '#10B981',
          typography: 'font-serif tracking-wide leading-relaxed',
          titleFont: 'font-serif font-semibold tracking-tight italic',
          organicBorder: 'rounded-[3rem] border border-emerald-550/20',
          interactiveTonePt: 'Modo Co-Regulação Suave: Foco em respiração lenta e pacer de expansão do balão.'
        };
      case 'idoso':
        return {
          bgClass: isLight 
            ? 'bg-[#FCFAF2]' 
            : 'bg-[#0F0E0C]',
          cardClass: isLight
            ? 'bg-white border-4 border-stone-900 shadow-[6px_6px_0_0_#1c1917] rounded-3xl'
            : 'bg-[#1F1C18] border-4 border-stone-350 shadow-[6px_6px_0_0_#e7e5e4] rounded-3xl',
          accentText: isLight ? 'text-stone-950 font-black underline' : 'text-stone-105 font-black',
          accentBg: isLight ? 'bg-stone-100 border-4 border-stone-900 text-stone-950' : 'bg-[#2D2824] border-4 border-stone-300 text-stone-100',
          primaryText: isLight ? 'text-stone-950 text-xl font-black' : 'text-white text-xl font-black',
          secondaryText: isLight ? 'text-stone-800 text-sm font-bold' : 'text-stone-150 text-sm font-bold',
          buttonClass: 'bg-stone-900 hover:bg-black text-white border-4 border-stone-900 rounded-2xl px-10 py-5 text-[15px] font-black uppercase tracking-widest shadow-md hover:scale-[1.02] cursor-pointer',
          subtleBtnClass: 'bg-stone-100 hover:bg-stone-200 border-2 border-stone-900 text-stone-900 text-xs font-bold rounded-xl transition-all cursor-pointer py-3 px-5',
          treeGlow: 'none',
          treePulse: 1.8,
          showParticles: false,
          particleColor: '#D97706',
          typography: 'font-sans font-bold leading-normal',
          titleFont: 'font-sans font-black tracking-tight text-xl sm:text-2xl',
          organicBorder: 'rounded-3xl border-4 border-stone-600',
          interactiveTonePt: 'Modo Acessibilidade Idoso: Letras ampliadas, botões grandes e contraste extremo.'
        };
      default: // normal / natural
        return {
          bgClass: isLight 
            ? 'bg-gradient-to-b from-[#F9F7F3] via-[#EFF1EC] to-[#E2E6DF]' 
            : 'bg-gradient-to-b from-[#080B14] via-[#0E1424] to-[#04060B]',
          cardClass: isLight
            ? 'bg-white/90 backdrop-blur-md border-stone-200/70 shadow-sm rounded-[2.5rem] border'
            : 'bg-[#0E1325]/80 backdrop-blur-md border-[#1F2C4C] shadow-lg rounded-[2.5rem] border',
          accentText: 'text-teal-400',
          accentBg: 'bg-teal-500/10 border border-teal-500/20 text-teal-300',
          primaryText: isLight ? 'text-stone-850' : 'text-stone-100',
          secondaryText: isLight ? 'text-stone-600' : 'text-stone-400',
          buttonClass: 'bg-gradient-to-r from-teal-500 to-emerald-505 text-stone-950 font-mono tracking-wider font-extrabold rounded-2xl cursor-pointer hover:shadow-lg hover:shadow-teal-500/15 active:scale-95 transition-all',
          subtleBtnClass: 'bg-stone-900/40 hover:bg-stone-900/60 border border-stone-800 text-stone-400 rounded-xl transition-all cursor-pointer',
          treeGlow: 'rgba(20, 184, 166, 0.3)',
          treePulse: 2.0,
          showParticles: true,
          particleColor: '#14B8A6',
          typography: 'font-sans',
          titleFont: 'font-serif font-semibold tracking-tight',
          organicBorder: 'rounded-[2.5rem] border border-stone-800/20',
          interactiveTonePt: 'Modo Padrão: Sintonias cognitivas integradas às ressonâncias do dia.'
        };
    }
  };

  const themeConfig = getNeuroTheme(activeMode, isLightTheme);

  return (
    <div className={`w-full min-h-full pb-20 ${themeConfig.typography} transition-all duration-700 relative flex flex-col justify-between ${themeConfig.bgClass}`}>
      
      {/* 2. BACKGROUND MIST & SLOW PARTICLES EFFECT */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-teal-500/[0.03] to-transparent blur-3xl" />
        <div className="absolute bottom-0 left-0 right-0 h-96 bg-gradient-to-t from-emerald-500/[0.03] to-transparent blur-3xl" />
      </div>

      {/* 1. Header Greeting & Environmental Tuning Badge */}
      <div className="max-w-4xl mx-auto px-6 pt-10 w-full space-y-4 animate-fade-in relative z-10">
        
        {/* Poetic Greeting Title */}
        <div className="text-left space-y-2">
          <div className="flex items-center gap-1.5 text-xs text-teal-500 dark:text-teal-400 font-mono tracking-widest uppercase font-bold">
            <Sprout className="w-3.5 h-3.5 animate-pulse shrink-0" />
            <span>{lang === 'pt' ? 'Mundo Orgânico Interior' : 'Organic Inner Sanctuary'}</span>
          </div>
          <h2 className={`text-3xl sm:text-4.5xl font-serif font-semibold tracking-tight leading-none ${themeConfig.primaryText} ${themeConfig.titleFont}`}>
            {lang === 'pt' ? `Olá, ${user.name || 'Viajante'}` : `Welcome, ${user.name || 'Traveler'}`}
          </h2>
          <p className={`text-xs sm:text-sm font-light leading-relaxed tracking-wide ${themeConfig.secondaryText} max-w-lg opacity-85`}>
            {lang === 'pt' 
              ? 'Seu santuário e jardim interior te acolhem. Respire fundo e contemple o crescimento do seu ser.' 
              : 'Your inner sanctuary welcomes you home. Breathe deeply and witness your organic growth.'}
          </p>
        </div>

        {/* Delicate neuro-profile identification pill (subtle, no technical clutter) */}
        <div className="flex flex-wrap items-center gap-2 pt-1.5">
          <span className="text-[10px] font-mono uppercase bg-[#14B8A6]/10 text-teal-700 dark:text-teal-400 border border-teal-500/15 rounded-full px-3 py-1 font-bold">
            {lang === 'pt' ? spec.labelPt : spec.labelEn}
          </span>
          <span className="text-[10px] font-mono uppercase bg-stone-500/10 text-stone-500 dark:text-stone-400 border border-stone-500/10 rounded-full px-3 py-1">
            {lang === 'pt' ? 'Cultivo em Harmonia 🍃' : 'Harmonious Growth 🍃'}
          </span>
        </div>

      </div>

      {/* 2. CENTER PIECE: THE LIVING INNER TREE ARCHITECTURE */}
      <div className="w-full max-w-xl mx-auto px-6 py-6 flex flex-col items-center justify-center relative select-none z-10">
        
        {/* Large Glowing Aura reflecting user state */}
        <div className={`absolute w-[280px] h-[280px] rounded-full blur-[96px] pointer-events-none transition-all duration-1000 ${getTuningAuraClass()}`} />

        {/* The Tree SVG Box / Canvas - Refactored to premium gigante sanctuary dimension */}
        <div className={`w-full h-[430px] md:h-[480px] relative flex items-center justify-center p-6 transition-all duration-500 mt-2 bg-gradient-to-b from-white/5 to-white/[0.01] dark:from-stone-900/15 dark:to-transparent backdrop-blur-[6px] rounded-[32px] overflow-hidden ${themeConfig.organicBorder}`}>
          
          <AnimatePresence>
            {isWatering && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-teal-400/5 rounded-[32px] flex flex-col justify-start items-center pt-2 z-20 pointer-events-none"
              >
                {[1, 2, 3, 4, 5, 6].map((p) => (
                  <motion.div
                     key={p}
                     initial={{ y: -20, opacity: 0, scale: 0.8 }}
                     animate={{ y: 480, opacity: [0, 0.9, 0] }}
                     transition={{ duration: 1.3, repeat: Infinity, delay: p * 0.15, ease: 'linear' }}
                     className="absolute w-1 h-4 bg-teal-555 rounded-full"
                     style={{ left: `${15 + p * 12}%`, background: 'linear-gradient(to bottom, #14b8a6, #2dd4bf)' }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {waterSplash && (
              <motion.div 
                initial={{ scale: 0.4, opacity: 0 }}
                animate={{ scale: 2.0, opacity: 1 }}
                exit={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute w-32 h-32 border-2 border-teal-400/30 rounded-full bg-teal-400/5 z-15 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Render real-time customized interactive biological tree model */}
          <motion.div 
            className="w-full h-full relative cursor-pointer flex items-center justify-center" 
            onClick={handleWaterGarden} 
            title={lang === 'pt' ? 'Dê um toque de intenção na árvore para nutri-la' : 'Click our Inner Tree to nourish it'}
            animate={themeConfig.treePulse > 0 ? { scale: [1, 1.025, 1], rotate: [-0.1, 0.1, -0.1] } : {}}
            transition={{ repeat: Infinity, duration: themeConfig.treePulse, ease: "easeInOut" }}
          >
            
            {/* Poetic Dynamic Birds (Pássaros) representing clarity and expansion */}
            {points > 100 && (
              <div className="absolute inset-x-0 top-4 bottom-0 pointer-events-none z-10 overflow-hidden">
                <motion.div
                  className="absolute left-[16%] top-[12%]"
                  animate={{ y: [0, -8, 0], x: [0, 6, 0] }}
                  transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
                >
                  <svg width="24" height="12" viewBox="0 0 24 12" fill="none" className="text-emerald-500/50 dark:text-emerald-400/40">
                    <path d="M 2 10 Q 7 3 12 10 Q 17 3 22 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                  </svg>
                </motion.div>
                <motion.div
                  className="absolute right-[18%] top-[20%]"
                  animate={{ y: [0, -10, 0], x: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 10, ease: "easeInOut", delay: 1 }}
                >
                  <svg width="18" height="9" viewBox="0 0 24 12" fill="none" className="text-teal-500/40 dark:text-teal-400/35">
                    <path d="M 2 10 Q 7 3 12 10 Q 17 3 22 10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                  </svg>
                </motion.div>
              </div>
            )}

            {/* Wholesome falling blossoms (Flores/Petals) when garden starts blooming */}
            {points > 255 && (
              <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                {[1, 2, 3, 4].map((petal) => (
                  <motion.div
                    key={`petal-${petal}`}
                    className="absolute w-2 h-2 rounded-full bg-rose-400/40 dark:bg-rose-350/50 shadow-[0_0_6px_rgba(244,63,94,0.15)]"
                    style={{
                      left: `${15 + petal * 22}%`,
                      top: `-20px`,
                    }}
                    animate={{
                      y: ['0px', '380px'],
                      x: ['0px', `${Math.sin(petal) * 15}px`, '0px'],
                      rotate: [0, 360],
                    }}
                    transition={{
                      duration: 9 + petal * 2,
                      repeat: Infinity,
                      ease: "linear",
                      delay: petal * 1.5,
                    }}
                  />
                ))}
              </div>
            )}

            {/* Lightweight ambient glowing particles representing growth & neural consistency */}
            {themeConfig.showParticles && (
              <div className="absolute inset-x-0 bottom-6 top-0 overflow-hidden pointer-events-none z-10">
                {particles.map((p) => (
                  <motion.span
                    key={`particle-${p.id}`}
                    className="absolute rounded-full"
                    style={{
                      width: p.size,
                      height: p.size,
                      backgroundColor: p.color || themeConfig.particleColor,
                      left: `${p.left}%`,
                      bottom: 0,
                      boxShadow: `0 0 8px ${p.color || themeConfig.particleColor}`,
                      willChange: 'transform, opacity',
                    }}
                    animate={{
                      y: ['110%', '-130%'],
                      x: ['0%', `${Math.sin(p.id) * 35}px`, '0%'],
                      opacity: [0, 0.95, 0.4, 0],
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
            )}

            {/* SINGULAR BIOPHILIC URBAN SANCTUARY TREE - UNIFIED PERSISTENT MODEL */}
            <div className="w-full h-full flex items-center justify-center">
              {(() => {
                const pts = user?.points || 0;
                // continuous proportions for high biological fidelity
                const baseHeight = Math.min(48, 16 + (pts / 800) * 32); // grows from 16 to 48
                const trunkWidth = Math.min(8, 2.5 + (pts / 800) * 5.5); // grows from 2.5 to 8
                const trunkY = 82 - baseHeight;
                const branchesProgress = Math.max(0, Math.min(1.0, (pts - 50) / 200)); // branches appear after 50 pts
                const foliageProgress = Math.max(0, Math.min(1.0, (pts - 150) / 300)); // foliage appears after 150 pts
                const fruitProgress = Math.max(0, Math.min(1.0, (pts - 400) / 400)); // fruits appear after 400 pts

                return (
                  <motion.svg 
                    viewBox="0 0 100 100" 
                    fill="none" 
                    className="w-full h-full filter drop-shadow-[0_4px_16px_rgba(20,184,166,0.15)]"
                    animate={{ 
                      y: [0, -2, 0],
                      rotate: [-0.6, 0.6, -0.6] 
                    }} 
                    transition={{ 
                      repeat: Infinity, 
                      duration: 6, 
                      ease: "easeInOut" 
                    }}
                  >
                    {/* Interactive Ground Soil aura */}
                    <ellipse cx="50" cy="82" rx={Math.min(30, 10 + (pts / 800) * 20)} ry="4" fill={isLightTheme ? '#2DD4BF' : '#0D9488'} fillOpacity="0.15" />
                    
                    {/* 1. Trunk growing continuously with elastic animation */}
                    <motion.path 
                      d={`M50 82 L50 ${trunkY}`} 
                      stroke={isLightTheme ? '#2b1d0c' : '#14b8a6'} 
                      strokeWidth={trunkWidth} 
                      strokeLinecap="round"
                      initial={{ pathLength: 0, scaleY: 0.1 }}
                      animate={{ pathLength: 1, scaleY: 1 }}
                      transition={{ duration: 1.8, ease: "easeOut" }}
                      style={{ originY: 1 }}
                    />

                    {/* 2. Left and Right branches spawning and stretching dynamically */}
                    {branchesProgress > 0 && (
                      <>
                        {/* Left branch */}
                        <motion.path 
                          d={`M50 ${trunkY + baseHeight * 0.3} Q${50 - 20 * branchesProgress} ${trunkY - 5 * branchesProgress}, ${50 - 25 * branchesProgress} ${trunkY - 12 * branchesProgress}`} 
                          stroke={isLightTheme ? '#2b1d0c' : '#0d9488'} 
                          strokeWidth={Math.max(1.5, trunkWidth * 0.6)} 
                          strokeLinecap="round"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 1.5, delay: 0.3, ease: "easeOut" }}
                        />
                        {/* Right branch */}
                        <motion.path 
                          d={`M50 ${trunkY + baseHeight * 0.4} Q${50 + 18 * branchesProgress} ${trunkY - 3 * branchesProgress}, ${50 + 23 * branchesProgress} ${trunkY - 10 * branchesProgress}`} 
                          stroke={isLightTheme ? '#2b1d0c' : '#0d9488'} 
                          strokeWidth={Math.max(1.5, trunkWidth * 0.55)} 
                          strokeLinecap="round"
                          initial={{ pathLength: 0, opacity: 0 }}
                          animate={{ pathLength: 1, opacity: 1 }}
                          transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                        />
                      </>
                    )}

                    {/* 3. Biological Foliage globes growing with elastic wind breathing */}
                    {foliageProgress > 0 && (
                      <>
                        {/* Centered Canopy */}
                        <motion.circle 
                          cx="50" 
                          cy={trunkY - 8} 
                          r={Math.min(22, 6 + foliageProgress * 16)} 
                          fill={isLightTheme ? '#059669' : '#14B8A6'} 
                          fillOpacity={0.25 * foliageProgress} 
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ 
                            scale: [0.95, 1.05, 0.95],
                            opacity: 0.25 * foliageProgress
                          }}
                          transition={{ 
                            scale: { duration: 6, repeat: Infinity, ease: "easeInOut" },
                            opacity: { duration: 1.2 }
                          }}
                        />
                        
                        {/* Left branch foliage canopy */}
                        {branchesProgress > 0.4 && (
                          <motion.circle 
                            cx={50 - 25 * branchesProgress} 
                            cy={trunkY - 12 * branchesProgress} 
                            r={Math.min(16, 4 + foliageProgress * 12)} 
                            fill={isLightTheme ? '#10B981' : '#0D9488'} 
                            fillOpacity={0.2 * foliageProgress}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ 
                              scale: [0.94, 1.03, 0.94],
                              opacity: 0.2 * foliageProgress
                            }}
                            transition={{ 
                              scale: { duration: 5.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 },
                              opacity: { duration: 1.2 }
                            }}
                          />
                        )}

                        {/* Right branch foliage canopy */}
                        {branchesProgress > 0.4 && (
                          <motion.circle 
                            cx={50 + 23 * branchesProgress} 
                            cy={trunkY - 10 * branchesProgress} 
                            r={Math.min(15, 3 + foliageProgress * 12)} 
                            fill={isLightTheme ? '#10B981' : '#0D9488'} 
                            fillOpacity={0.2 * foliageProgress}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ 
                              scale: [0.95, 1.04, 0.95],
                              opacity: 0.2 * foliageProgress
                            }}
                            transition={{ 
                              scale: { duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.8 },
                              opacity: { duration: 1.2 }
                            }}
                          />
                        )}
                      </>
                    )}

                    {/* 4. Blooming Glowing Flowers or Golden Fruits */}
                    {fruitProgress > 0 && (
                      <>
                        <motion.circle 
                          cx="50" 
                          cy={trunkY - 16} 
                          r={Math.min(5.5, 1.5 + fruitProgress * 4)} 
                          fill="#FBBF24" 
                          className="filter drop-shadow-[0_0_8px_#F59E0B]"
                          initial={{ scale: 0 }}
                          animate={{ scale: [1, 1.25, 1] }}
                          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                        />
                        <motion.circle 
                          cx={50 - 15} 
                          cy={trunkY - 6} 
                          r={Math.min(4.5, 1 + fruitProgress * 3.5)} 
                          fill="#F97316" 
                          className="filter drop-shadow-[0_0_6px_#EA580C]"
                          initial={{ scale: 0 }}
                          animate={{ scale: [1, 1.2, 1] }}
                          transition={{ repeat: Infinity, duration: 3.5, delay: 0.5, ease: "easeInOut" }}
                        />
                        <motion.circle 
                          cx={50 + 13} 
                          cy={trunkY - 4} 
                          r={Math.min(4.5, 1 + fruitProgress * 3.5)} 
                          fill="#FBBF24" 
                          className="filter drop-shadow-[0_0_6px_#F59E0B]"
                          initial={{ scale: 0 }}
                          animate={{ scale: [1, 1.22, 1] }}
                          transition={{ repeat: Infinity, duration: 3.2, delay: 0.8, ease: "easeInOut" }}
                        />
                      </>
                    )}

                    {/* Seed stage indicator always visible in trunk center */}
                    <circle cx="50" cy="80" r="1.5" fill="#34D399" />
                  </motion.svg>
                );
              })()}
            </div>

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
        <div className="space-y-1 text-center mt-3 animate-fade-in">
          <span className="text-[10px] font-mono tracking-widest text-[#10B981] font-black uppercase bg-emerald-500/10 px-4.5 py-1.5 rounded-full border border-emerald-500/15">
            {lang === 'pt' ? gardenInfo.namePt : gardenInfo.nameEn}
          </span>
          <p className={`text-xs ${themeConfig.secondaryText} px-6 leading-relaxed max-w-sm mx-auto italic mt-2`}>
            "{lang === 'pt' ? gardenInfo.descPt : gardenInfo.descEn}"
          </p>
        </div>

        {/* Convite do Dia / Dynamic Micro-Practices based on current tone */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className={`w-full max-w-md p-5.5 mt-6 rounded-[2.2rem] flex flex-col gap-3 backdrop-blur-md relative overflow-hidden transition-all duration-500 ${themeConfig.cardClass}`}
        >
          {/* Neon accent glow behind card */}
          <div className="absolute top-0 right-0 w-20 h-20 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-amber-500 font-mono text-[9px] uppercase tracking-widest font-black">
              <span className="text-sm select-none">✨</span>
              <span>{lang === 'pt' ? 'Convite de Sintonia' : 'Daily Invitation'}</span>
            </div>
            <span className="text-[9px] font-mono font-black bg-[#14B8A6]/10 text-teal-550 border border-teal-500/15 rounded-md px-3 py-1.5 uppercase tracking-wider">
              {currentInvite.duration}
            </span>
          </div>

          <div className="space-y-1 text-left">
            <h4 className={`text-sm sm:text-base font-serif font-black flex items-center gap-1.5 ${themeConfig.primaryText}`}>
              <span>{currentInvite.icon}</span>
              <span>{lang === 'pt' ? currentInvite.titlePt : currentInvite.titleEn}</span>
            </h4>
            <p className={`text-[11px] sm:text-xs leading-relaxed font-light ${themeConfig.secondaryText}`}>
              {lang === 'pt' ? currentInvite.descPt : currentInvite.descEn}
            </p>
            <p className="text-[10px] sm:text-[11px] text-teal-500 italic font-mono pt-1.5">
              {lang === 'pt' ? currentInvite.tipPt : currentInvite.tipEn}
            </p>
          </div>

          <button
            onClick={() => onNavigateToTab(currentInvite.targetTab)}
            className="w-full py-3 bg-stone-900 hover:bg-black text-white/95 rounded-xl text-xs uppercase tracking-wider font-mono font-black transition-all hover:scale-[1.01] active:scale-97 cursor-pointer shadow-sm text-center mt-1 border border-stone-800"
          >
            {lang === 'pt' ? 'Iniciar Prática Proposta' : 'Begin Suggested Practice'}
          </button>
        </motion.div>

      </div>

      {/* 3. INTERACTIVE ACTIONS (Water, Sounds and Shortcuts) */}
      <div className="max-w-xl mx-auto px-6 w-full space-y-8 animate-fade-in relative z-10">
        
        {/* HUMAN BENTO GRID: Sua Essência & Crescimento */}
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-2 border-b border-stone-800/10 dark:border-white/5 pb-2">
            <span className="text-sm select-none">🍃</span>
            <h3 className={`text-base font-serif font-semibold tracking-wide ${themeConfig.primaryText}`}>
              {lang === 'pt' ? 'Sua Essência de Hoje' : 'Your Essence Today'}
            </h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* 1. SEU CRESCIMENTO 🌿 */}
            <div className={`p-5 rounded-3xl backdrop-blur-md transition-all duration-300 flex flex-col justify-between ${themeConfig.cardClass}`}>
              <div className="space-y-1.5 text-left">
                <span className="text-xs font-sans font-medium text-emerald-600 dark:text-teal-350 tracking-wide block mb-1">🌿 {lang === 'pt' ? 'Seu crescimento' : 'Your growth'}</span>
                <h4 className="text-[17px] font-serif font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                  {lang === 'pt' ? gardenInfo.namePt : gardenInfo.nameEn}
                </h4>
                <p className="text-xs font-sans tracking-wide leading-relaxed font-normal text-stone-600 dark:text-stone-300 opacity-95">
                  {lang === 'pt' 
                    ? 'O cuidado sutil do seu caminhar estende ramas e novos florescimentos.' 
                    : 'Your mindful care stretches custom branches and new organic horizons.'}
                </p>
              </div>
              <div className="mt-3 pt-1.5 border-t border-stone-800/10 dark:border-white/5">
                <div className="flex justify-between items-center text-[9px] font-mono text-stone-500/80 mb-1">
                  <span>{lang === 'pt' ? 'Ramo de Sintonia' : 'Harmonic Sprout'}</span>
                  <span>{lang === 'pt' ? 'Vitalidade Dinâmica' : 'Organic Vitality'}</span>
                </div>
                {/* Pure Biophilic Branch Growth Visualizing Progress */}
                <div className="w-full h-11 flex items-center justify-center mt-1 relative overflow-hidden bg-stone-950/5 dark:bg-stone-950/25 rounded-2xl p-1 border border-stone-850/10 dark:border-white/5">
                  <svg viewBox="0 0 100 40" fill="none" className="w-full h-full">
                    <defs>
                      <linearGradient id="branchGradient" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0d9488" />
                        <stop offset="100%" stopColor="#10b981" />
                      </linearGradient>
                    </defs>
                    
                    {/* Winding main branch path */}
                    <motion.path 
                      d="M 10 32 Q 35 15 55 25 T 90 10" 
                      stroke="url(#branchGradient)" 
                      strokeWidth="2.2" 
                      strokeLinecap="round"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: Math.min(1.0, 0.15 + (points / 800) * 0.85) }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                    
                    {/* Sprout nodes representing progress stages */}
                    {/* Node 1 (Points > 50) */}
                    <motion.g 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={points >= 50 ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                      transition={{ duration: 0.8, type: "spring", stiffness: 80 }}
                      transform="translate(26, 22)"
                    >
                      <path d="M 0 0 C -3 -5, -6 -1, 0 0 C 3 -5, 6 -1, 0 0" fill="#34d399" />
                      <circle cx="0" cy="0" r="1.0" fill="#fff" />
                    </motion.g>

                    {/* Node 2 (Points > 150) */}
                    <motion.g 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={points >= 150 ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                      transition={{ duration: 0.8, delay: 0.15, type: "spring", stiffness: 80 }}
                      transform="translate(42, 21)"
                    >
                      <path d="M 0 0 C -2 -4, -5 -3, 0 0 C 2 -4, 5 -3, 0 0" fill="#2dd4bf" />
                    </motion.g>

                    {/* Node 3 (Points > 300) */}
                    <motion.g 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={points >= 300 ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                      transition={{ duration: 0.8, delay: 0.3, type: "spring", stiffness: 80 }}
                      transform="translate(58, 23)"
                    >
                      <path d="M 0 0 C -4 -4, -6 1, 0 0 C 4 -4, 6 1, 0 0" fill="#0d9488" />
                    </motion.g>

                    {/* Node 4 (Points > 500) */}
                    <motion.g 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={points >= 500 ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                      transition={{ duration: 0.8, delay: 0.45, type: "spring", stiffness: 80 }}
                      transform="translate(74, 18)"
                    >
                      <path d="M 0 0 C -1 -5, -4 -3, 0 0 C 1 -5, 4 -3, 0 0" fill="#059669" />
                      <circle cx="0" cy="-4" r="1.5" fill="#fbcfe8" className="animate-pulse" />
                    </motion.g>

                    {/* Flower Bloom Node 5 (Points >= 800) */}
                    <motion.g 
                      initial={{ scale: 0, opacity: 0 }}
                      animate={points >= 800 ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                      transition={{ duration: 1.0, delay: 0.6, type: "spring", stiffness: 50 }}
                      transform="translate(86, 12)"
                    >
                      <circle cx="0" cy="0" r="2.8" fill="#fbbd23" className="animate-pulse" />
                      <circle cx="-2.5" cy="0" r="1.5" fill="#fb7185" />
                      <circle cx="2.5" cy="0" r="1.5" fill="#fb7185" />
                      <circle cx="0" cy="-2.5" r="1.5" fill="#fb7185" />
                      <circle cx="0" cy="2.5" r="1.5" fill="#fb7185" />
                    </motion.g>
                  </svg>
                </div>
              </div>
            </div>

            {/* 2. COMO VOCÊ ESTÁ HOJE 🌤 */}
            <div className={`p-5 rounded-3xl backdrop-blur-md transition-all duration-300 flex flex-col justify-between ${themeConfig.cardClass}`}>
              <div className="space-y-1.5 text-left">
                <span className="text-xs font-sans font-medium text-teal-600 dark:text-teal-400 tracking-wide block mb-1">🌤 {lang === 'pt' ? 'Como você está hoje' : 'How you are today'}</span>
                <h4 className="text-[17px] font-serif font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                  {lang === 'pt' ? 'Equilíbrio Fluido' : 'Tranquility Aligned'}
                </h4>
                <p className="text-xs font-sans tracking-wide leading-relaxed font-normal text-stone-600 dark:text-stone-300 opacity-95">
                  {lang === 'pt' 
                    ? `Sua co-regulação está sintonizada no ritmo de coesão do seu perfil adaptativo.` 
                    : `Active core heart sync focused on your custom PCH medical archetype.`}
                </p>
              </div>
              <div className="mt-4 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
                <span className="text-[9px] font-sans tracking-wider text-teal-600 dark:text-teal-400 font-medium">
                  {lang === 'pt' ? 'Conexão Ativa' : 'Stellar Connected'}
                </span>
              </div>
            </div>

            {/* 3. PEQUENAS CONQUISTAS ✨ */}
            <div className={`p-5 rounded-3xl backdrop-blur-md transition-all duration-300 flex flex-col justify-between ${themeConfig.cardClass}`}>
              <div className="space-y-1.5 text-left">
                <span className="text-xs font-sans font-medium text-amber-600 dark:text-amber-400 tracking-wide block mb-1">✨ {lang === 'pt' ? 'Pequenas conquistas' : 'Small achievements'}</span>
                <h4 className="text-[17px] font-serif font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                  {user.streak || 1} {lang === 'pt' ? 'Dias de Sintonia' : 'Consistency Days'}
                </h4>
                <p className="text-xs font-sans tracking-wide leading-relaxed font-normal text-stone-600 dark:text-stone-300 opacity-95">
                  {lang === 'pt' 
                    ? 'Cada gota de intenção vertida na árvore cultiva caminhos de bem-estar.' 
                    : 'Watering your sanctuary, breathing in pace, and speaking clearly build quiet neural pathways.'}
                </p>
              </div>
              <div className="mt-3.5 flex flex-wrap gap-1">
                <span className="text-[9px] font-sans px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/10">Sopro Consciente ✔️</span>
                <span className="text-[9px] font-sans px-2.5 py-0.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-full border border-teal-500/10">Primeiro Regar ✔️</span>
              </div>
            </div>

            {/* 4. REFLEXÃO DO DIA 🪞 */}
            <div className={`p-5 rounded-3xl backdrop-blur-md transition-all duration-300 flex flex-col justify-between ${themeConfig.cardClass}`}>
              <div className="space-y-1.5 text-left">
                <span className="text-xs font-sans font-medium text-indigo-600 dark:text-indigo-400 tracking-wide block mb-1">🪞 {lang === 'pt' ? 'Reflexão do dia' : 'Reflection of the day'}</span>
                {journals.length > 0 ? (
                  <>
                    <p className="text-xs font-serif leading-relaxed line-clamp-2 italic text-stone-700 dark:text-stone-200 opacity-90 font-medium">
                      "{journals[journals.length - 1].text}"
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="text-[17px] font-serif font-semibold tracking-tight text-stone-900 dark:text-stone-100">
                      {lang === 'pt' ? 'Ecos do Silêncio' : 'Silent Echoes'}
                    </h4>
                    <p className="text-xs font-sans tracking-wide leading-relaxed font-normal text-stone-600 dark:text-stone-300 opacity-95">
                      {lang === 'pt' 
                        ? 'Escreva suas reflexões diárias para florescer frutos na Árvore.' 
                        : 'Write down your thoughts to grow bright fruits in your branches.'}
                    </p>
                  </>
                )}
              </div>
              <button 
                onClick={() => onNavigateToTab('refletir')}
                className="mt-3 text-xs font-sans font-semibold tracking-wide text-teal-600 dark:text-teal-400 hover:opacity-80 transition-all flex items-center gap-1 cursor-pointer self-start"
              >
                <span>{lang === 'pt' ? 'Refletir agora' : 'Reflect now'}</span>
                <span>→</span>
              </button>
            </div>

          </div>
        </div>
        
        {/* ACTIONS GRID: Regar com Presença and Sopro 60s Button */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={handleWaterGarden}
            disabled={isWatering}
            style={{ minHeight: '48px' }}
            className={`w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 font-sans text-xs font-semibold tracking-wide transition-all duration-350 border ${
              isWatering
                ? 'bg-emerald-500/10 border-emerald-555/20 text-[#10B981]/50 cursor-slow'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-450 hover:to-teal-450 text-stone-950 border-transparent shadow-[0_4px_24px_rgba(16,185,129,0.22)] active:scale-98 shadow-md cursor-pointer'
            }`}
          >
            <Droplets className={`w-4 h-4 shrink-0 ${isWatering ? 'animate-bounce' : ''}`} />
            <span>
              {isWatering 
                ? (lang === 'pt' ? 'Nutrindo Árvore...' : 'Nourishing Tree...') 
                : (lang === 'pt' ? 'Regar com Intenção 💧' : 'Water with Intention 💧')}
            </span>
          </button>

          <button
            onClick={() => setShowBreathingGuide(true)}
            style={{ minHeight: '48px' }}
            className="w-full py-4 px-6 rounded-2xl flex items-center justify-center gap-2.5 font-sans text-xs font-semibold tracking-wide transition-all duration-350 border bg-stone-900/40 hover:bg-stone-900/60 border-stone-850 hover:border-emerald-505/40 text-emerald-400 shadow-md cursor-pointer"
            id="btn-trigger-60s-breath"
          >
            <Wind className="w-4 h-4 text-emerald-400 animate-pulse shrink-0" />
            <span>
              {lang === 'pt' ? 'Respiração 60s' : '60s Wave Breath'}
            </span>
          </button>
        </div>

        {/* SPECIALIZED PROFILE INFO BOARD */}
        <div className={`p-4 rounded-3xl border border-stone-800/10 text-left ${themeConfig.cardClass}`}>
          <div className="flex gap-2.5 items-center">
            <span className="text-base select-none">💡</span>
            <p className="text-xs font-sans tracking-wide text-teal-650 dark:text-teal-400 leading-relaxed font-medium">
              {themeConfig.interactiveTonePt}
            </p>
          </div>
        </div>

        {/* SOUNDSCAPES: Sons do Santuário Synth Active Panel */}
        <div className={`p-5 rounded-[2rem] border transition-all duration-500 ${themeConfig.cardClass} space-y-4 text-left`}>
          <div className="flex items-center space-x-2 border-b border-stone-800/10 pb-2.5">
            <Volume2 className="w-4 h-4 text-teal-450 shrink-0" />
            <h4 className="text-[15px] font-serif tracking-wide text-teal-600 dark:text-teal-400 font-semibold">
              {lang === 'pt' ? 'Atmosfera Sonora do Santuário' : 'Ambient Sacred Sounds'}
            </h4>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {/* Silêncio */}
            <button
              onClick={() => handleToggleSoundscape('silent')}
              className={`p-2.5 rounded-xl text-[10px] font-mono uppercase tracking-widest text-center border transition-all cursor-pointer ${
                currentSound === 'silent'
                  ? 'bg-stone-50 text-stone-900 border-transparent font-black shadow-sm'
                  : 'bg-stone-950/20 border-stone-850 hover:bg-stone-900/40 text-stone-400'
              }`}
            >
              🔇 {lang === 'pt' ? 'Silêncio' : 'Silence'}
            </button>

            {/* Ondas da Calma */}
            <button
              onClick={() => handleToggleSoundscape('ocean')}
              className={`p-2.5 rounded-xl text-[10px] font-mono uppercase tracking-widest text-center border transition-all cursor-pointer ${
                currentSound === 'ocean'
                  ? 'bg-teal-500/10 border-teal-500/30 text-teal-455 font-black shadow-inner shadow-teal-500/5'
                  : 'bg-stone-950/20 border-stone-850 hover:bg-stone-900/40 text-stone-400'
              }`}
            >
              🌊 {lang === 'pt' ? 'Ondas' : 'Waves'}
            </button>

            {/* Jardim Breeze */}
            <button
              onClick={() => handleToggleSoundscape('breeze')}
              className={`p-2.5 rounded-xl text-[10px] font-mono uppercase tracking-widest text-center border transition-all cursor-pointer ${
                currentSound === 'breeze'
                  ? 'bg-teal-500/10 border-teal-500/30 text-teal-455 font-black shadow-inner shadow-teal-500/5'
                  : 'bg-stone-950/20 border-stone-850 hover:bg-stone-905/40 hover:bg-stone-900/40 text-stone-400'
              }`}
            >
              🍃 {lang === 'pt' ? 'Brisa' : 'Breeze'}
            </button>

            {/* Sino Tibet (Bell Bowl) */}
            <button
              onClick={() => handleToggleSoundscape('bowl')}
              className={`p-2.5 rounded-xl text-[10px] font-mono uppercase tracking-widest text-center border transition-all cursor-pointer ${
                currentSound === 'bowl'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-455 font-black shadow-inner shadow-amber-500/5'
                  : 'bg-stone-950/20 border-stone-850 hover:bg-stone-900/40 text-stone-400'
              }`}
            >
              🔔 {lang === 'pt' ? 'Gong' : 'Singing Bowl'}
            </button>
          </div>
        </div>

        {/* DAILY GROUNDING AFFIRMATION */}
        <DailyAffirmation lang={lang} onAddToast={onAddToast} />

      </div>

      {/* Garden Echo Details Modal */}
      <AnimatePresence>
        {selectedEcho && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedEcho(null)}
            className="fixed inset-0 z-[160] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-stone-50 border border-stone-200 p-6 rounded-3xl shadow-2xl max-w-sm w-full space-y-4 text-stone-850"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-amber-650">
                  <BookOpen className="w-4 h-4 shrink-0 shadow-inner" />
                  <span className="font-mono text-[10px] uppercase tracking-wider font-bold">
                    {lang === 'pt' ? 'Eco do Jardim' : 'Garden Echo'}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedEcho(null)}
                  className="text-stone-400 hover:text-stone-700 font-mono text-xs cursor-pointer p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 text-left">
                <p className="text-[10px] text-stone-500 font-mono">
                  {new Date(selectedEcho.date).toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                {selectedEcho.prompt && (
                  <p className="text-xs italic text-stone-500 font-serif border-l-2 border-teal-500 pl-2.5 leading-relaxed">
                    "{selectedEcho.prompt}"
                  </p>
                )}
                <div className="text-xs sm:text-sm font-sans leading-relaxed text-stone-750 bg-stone-100 p-4 rounded-2xl border border-stone-200/50 max-h-48 overflow-y-auto no-scrollbar font-normal">
                  {selectedEcho.text}
                </div>
              </div>

              <div className="text-center pt-1.5">
                <button
                  onClick={() => setSelectedEcho(null)}
                  className="py-2.5 px-6 bg-stone-900 hover:bg-black text-white rounded-xl text-xs uppercase font-mono tracking-widest font-black cursor-pointer transition-all"
                >
                  {lang === 'pt' ? 'Deixar Eco' : 'Dismiss Echo'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 60s Breathing Guide Overlay Modal */}
      <AnimatePresence>
        {showBreathingGuide && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[170] bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
            onClick={() => setShowBreathingGuide(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md"
            >
              <BreathingGuide 
                lang={lang} 
                onClose={() => setShowBreathingGuide(false)} 
                onAddToast={onAddToast}
                isLightTheme={isLightTheme}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SantuarioView;
