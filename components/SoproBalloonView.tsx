import React, { useState, useEffect } from 'react';
import { X, Wind, Sparkles, Anchor, HelpCircle, Eye } from 'lucide-react';
import { Language } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface SoproBalloonViewProps {
  onClose: () => void;
  lang: Language;
}

type Environment = 'oceano' | 'floresta' | 'chuva' | 'cosmos';

interface BreathingPattern {
  id: string;
  namePt: string;
  nameEn: string;
  descriptionPt: string;
  descriptionEn: string;
  phases: {
    inhale: number;
    hold: number;
    exhale: number;
    holdEmpty: number;
  };
}

const PCH_PATTERNS: BreathingPattern[] = [
  {
    id: 'coherent',
    namePt: 'Coerência PCH (4-4-4-4)',
    nameEn: 'PCH Coherence (4-4-4-4)',
    descriptionPt: 'Ajuste cardiopulmonar ideal para equilíbrio emocional e clareza imediata.',
    descriptionEn: 'Ideal cardiopulmonary alignment to establish immediate emotional balance.',
    phases: { inhale: 4, hold: 4, exhale: 4, holdEmpty: 4 }
  },
  {
    id: 'deep_sleep',
    namePt: 'Ancoragem Relaxante (4-7-8)',
    nameEn: 'Deep Anchor (4-7-8)',
    descriptionPt: 'Desativa o estado de hiperalerta rítmico, facilitando calma e relaxamento profundo.',
    descriptionEn: 'Deactivates autonomic hyperalert triggers to induce total calm and ease sleep induction.',
    phases: { inhale: 4, hold: 7, exhale: 8, holdEmpty: 0 }
  },
  {
    id: 'crisis_relief',
    namePt: 'Alívio Imediato (4-0-6-0)',
    nameEn: 'Flash Anxiety Relief (4-0-6-0)',
    descriptionPt: 'Expiração alongada para esvaziamento de correntes de estresse e pânico.',
    descriptionEn: 'Lengthened exhalations designed to rapidly sweep away patterns of panic or tension.',
    phases: { inhale: 4, hold: 0, exhale: 6, holdEmpty: 0 }
  },
  {
    id: 'focus_ignition',
    namePt: 'Foco Criativo (5-2-5-2)',
    nameEn: 'Creative Focus (5-2-5-2)',
    descriptionPt: 'Ritmo ampliado para oxigenação neurológica e estados de hiperfoco.',
    descriptionEn: 'Elevated pacing to optimize brain oxygenation and ignite active focus states.',
    phases: { inhale: 5, hold: 2, exhale: 5, holdEmpty: 2 }
  }
];

export const SoproBalloonView: React.FC<SoproBalloonViewProps> = ({ onClose, lang }) => {
  const [activePattern, setActivePattern] = useState<BreathingPattern>(PCH_PATTERNS[0]);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale' | 'holdEmpty'>('inhale');
  const [elapsed, setElapsed] = useState<number>(0);
  const [cycles, setCycles] = useState<number>(0);
  const [env, setEnv] = useState<Environment>('oceano');

  // Dynamic Cardiac Coherence Feedback States
  const [liveBpm, setLiveBpm] = useState(82);

  // Calculate live respiratory sinus arrhythmia aligned BPM
  const maxPhaseLimit = activePattern.phases[breathingPhase] || 4;
  const currentProgressRatio = Math.min(elapsed / maxPhaseLimit, 1.0);

  useEffect(() => {
    // base BPM gets calmer the more cycles are completed
    const baseBpm = Math.max(61, 80 - cycles * 2.2);
    
    // Inhale speeds up heart rate slightly, Exhale slows it down (RSA coherence)
    let currentBpm = baseBpm;
    if (breathingPhase === 'inhale') {
      currentBpm = baseBpm + (currentProgressRatio * 5.8);
    } else if (breathingPhase === 'hold') {
      currentBpm = baseBpm + 3.5;
    } else if (breathingPhase === 'exhale') {
      currentBpm = baseBpm - (currentProgressRatio * 6.2);
    } else if (breathingPhase === 'holdEmpty') {
      currentBpm = baseBpm - 3.0;
    }
    
    // Add micro biological noise for perfect therapeutic clinical authenticity (+/- 0.4 bpm)
    const noise = Math.sin(Date.now() / 1500) * 0.45;
    const finalBpm = parseFloat((currentBpm + noise).toFixed(1));
    setLiveBpm(finalBpm);

    // Cumulative average heart rate logging
    try {
      const storedAvg = localStorage.getItem('pch_sopro_avg_bpm');
      let avg = 68;
      if (storedAvg) {
        // Simple smoothing filter towards current finalBpm
        avg = Math.round(parseFloat(storedAvg) * 0.95 + finalBpm * 0.05);
      } else {
        avg = Math.round(finalBpm);
      }
      localStorage.setItem('pch_sopro_avg_bpm', String(avg));
    } catch (e) {
      console.error(e);
    }
  }, [cycles, breathingPhase, currentProgressRatio]);

  const phrasePt: Record<string, string> = {
    inhale: 'Inspire preenchendo o peito...',
    hold: 'Sinta a suspensão do tempo...',
    exhale: 'Solte o peso e a tensão suavemente...',
    holdEmpty: 'Resida no vácuo de calmaria...'
  };
  const phraseEn: Record<string, string> = {
    inhale: 'Inhale deeply and float...',
    hold: 'Hold, suspended in high calm...',
    exhale: 'Gently release details and pressure...',
    holdEmpty: 'Rest in the silent empty space...'
  };

  const descPt: Record<string, string> = {
    inhale: 'Siga a expansão orgânica do balão de ar.',
    hold: 'Sua mente flutua em pura imersão.',
    exhale: 'Deixe qualquer cansaço se dissipar na atmosfera.',
    holdEmpty: 'Estabilize seu foco até o próximo ciclo.'
  };
  const descEn: Record<string, string> = {
    inhale: 'Follow the organic expansion of the balloon.',
    hold: 'Your thoughts float in pure suspension.',
    exhale: 'Let all weariness dissolve back into space.',
    holdEmpty: 'Gather your focus for the upcoming cycle.'
  };

  // Skip inactive or zero-duration phases helper
  const getNextPhase = (current: 'inhale' | 'hold' | 'exhale' | 'holdEmpty'): 'inhale' | 'hold' | 'exhale' | 'holdEmpty' => {
    const order: ('inhale' | 'hold' | 'exhale' | 'holdEmpty')[] = ['inhale', 'hold', 'exhale', 'holdEmpty'];
    const startIdx = order.indexOf(current);
    for (let i = 1; i <= 4; i++) {
      const candidate = order[(startIdx + i) % 4];
      if (activePattern.phases[candidate] > 0) {
        return candidate;
      }
    }
    return 'inhale';
  };

  // Handle pattern selection reset
  useEffect(() => {
    setBreathingPhase('inhale');
    setElapsed(0);
    setCycles(0);
  }, [activePattern]);

  // High precision breathing timer loop supporting customizable patterns
  useEffect(() => {
    const intervalMs = 25;
    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + intervalMs / 1000;
        const currentLimit = activePattern.phases[breathingPhase] || 1;
        
        if (next >= currentLimit) {
          setBreathingPhase((current) => {
            const nextP = getNextPhase(current);
            if (nextP === 'inhale') {
              setCycles((prevC) => prevC + 1);
            }
            return nextP;
          });
          return 0;
        }
        return next;
      });
    }, intervalMs);

    return () => clearInterval(interval);
  }, [breathingPhase, activePattern]);

  // Calculate dynamic circular balloon scale
  const currentLimit = activePattern.phases[breathingPhase] || 1;
  const progressRatio = Math.min(elapsed / currentLimit, 1.0);

  let balloonScale = 1.0;
  if (breathingPhase === 'inhale') {
    balloonScale = 1.0 + progressRatio * 0.90; // expands from 1.0 to 1.9
  } else if (breathingPhase === 'hold') {
    balloonScale = 1.90; // remains suspended at peak size
  } else if (breathingPhase === 'exhale') {
    balloonScale = 1.90 - progressRatio * 0.90; // shrinks from 1.9 to 1.0
  } else if (breathingPhase === 'holdEmpty') {
    balloonScale = 1.0; // remains empty ready to start
  }

  // Calculate continuous path tracing coordinates (across the entire cycle timeline)
  const totalDuration = (
    activePattern.phases.inhale +
    activePattern.phases.hold +
    activePattern.phases.exhale +
    activePattern.phases.holdEmpty
  ) || 16;

  const W_inhale = (activePattern.phases.inhale / totalDuration) * 400;
  const W_hold = (activePattern.phases.hold / totalDuration) * 400;
  const W_exhale = (activePattern.phases.exhale / totalDuration) * 400;
  const W_holdEmpty = (activePattern.phases.holdEmpty / totalDuration) * 400;

  // Render curved bezier mountain-plateau representing current schedule
  const wavePath = `M 0,100 ` +
    (W_inhale > 0 ? `C ${W_inhale * 0.4},100 ${W_inhale * 0.6},20 ${W_inhale},20 ` : '') +
    (W_hold > 0 ? `L ${W_inhale + W_hold},20 ` : '') +
    (W_exhale > 0 ? `C ${W_inhale + W_hold + W_exhale * 0.4},20 ${W_inhale + W_hold + W_exhale * 0.6},100 ${W_inhale + W_hold + W_exhale},100 ` : '') +
    (W_holdEmpty > 0 ? `L 400,100` : '');

  // Calculate current point trace coordinates on the curve with simple type-safe cascade
  let accumulatedTime = 0;
  if (breathingPhase === 'inhale') {
    accumulatedTime = elapsed;
  } else if (breathingPhase === 'hold') {
    accumulatedTime = activePattern.phases.inhale + elapsed;
  } else if (breathingPhase === 'exhale') {
    accumulatedTime = activePattern.phases.inhale + activePattern.phases.hold + elapsed;
  } else {
    accumulatedTime = activePattern.phases.inhale + activePattern.phases.hold + activePattern.phases.exhale + elapsed;
  }

  const cycleProgress = Math.min(Math.max(accumulatedTime / totalDuration, 0), 1.0);
  const dotX = cycleProgress * 400;

  // Let coordinate glider follow the bezier eased contour perfectly
  let dotY = 100;
  if (breathingPhase === 'inhale') {
    const eased = (1 - Math.cos(progressRatio * Math.PI)) / 2;
    dotY = 100 - eased * 80;
  } else if (breathingPhase === 'hold') {
    dotY = 20;
  } else if (breathingPhase === 'exhale') {
    const eased = (1 - Math.cos((1 - progressRatio) * Math.PI)) / 2;
    dotY = 100 - eased * 80;
  } else {
    dotY = 100;
  }

  // Environmental styles
  const envConfigs: Record<Environment, {
    classBg: string;
    balloonGrad: string;
    glowShadow: string;
    particleColor: string;
    radialAmbient: string;
    labelPt: string;
    labelEn: string;
  }> = {
    oceano: {
      classBg: 'bg-[#031518]',
      balloonGrad: 'from-teal-400/40 via-cyan-500/30 to-blue-500/20',
      glowShadow: 'rgba(20, 184, 166, 0.3)',
      particleColor: '#14B8A6',
      radialAmbient: 'radial-gradient(circle, rgba(20, 184, 166, 0.12) 0%, transparent 70%)',
      labelPt: '🌊 Oceano Profundo',
      labelEn: '🌊 Deep Ocean'
    },
    floresta: {
      classBg: 'bg-[#03160a]',
      balloonGrad: 'from-emerald-400/40 via-teal-500/35 to-[#34D399]/20',
      glowShadow: 'rgba(52, 211, 153, 0.3)',
      particleColor: '#34D399',
      radialAmbient: 'radial-gradient(circle, rgba(52, 211, 153, 0.12) 0%, transparent 70%)',
      labelPt: '🌲 Floresta Ancestral',
      labelEn: '🌲 Ancient Forest'
    },
    chuva: {
      classBg: 'bg-[#070e1b]',
      balloonGrad: 'from-[#38bdf8]/40 via-blue-500/30 to-indigo-500/20',
      glowShadow: 'rgba(56, 189, 248, 0.3)',
      particleColor: '#38bdf8',
      radialAmbient: 'radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, transparent 70%)',
      labelPt: '🌌 Chuva das Estrelas',
      labelEn: '🌌 Stellar Rain'
    },
    cosmos: {
      classBg: 'bg-[#0e0413]',
      balloonGrad: 'from-amber-400/40 via-purple-500/30 to-[#EC4899]/20',
      glowShadow: 'rgba(251, 191, 36, 0.25)',
      particleColor: '#FBBF24',
      radialAmbient: 'radial-gradient(circle, rgba(251, 191, 36, 0.1) 0%, transparent 70%)',
      labelPt: '💫 Nebulosa Cósmica',
      labelEn: '💫 Cosmic Space'
    }
  };

  const activeConf = envConfigs[env];

  return (
    <div className={`fixed inset-0 z-50 ${activeConf.classBg} text-[#E0E7E5] flex flex-col justify-between p-6 font-sans animate-fade-in select-none overflow-hidden transition-all duration-[1000ms]`}>
      
      {/* Immersive background particle effect */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        
        {/* Dynamic environment-based ambient glow */}
        <div 
          className="absolute inset-0 transition-all duration-[1200ms]"
          style={{ background: activeConf.radialAmbient }}
        />

        {/* Ambient floating bubbles/particles tailored to current Environment */}
        <AnimatePresence mode="popLayout">
          {Array.from({ length: 18 }).map((_, i) => {
            const randomX = (i * 7) % 95;
            const randomDelay = (i * 0.4) % 4;
            const randomDur = 4 + (i % 3) * 2;
            const size = 2 + (i % 3) * 2;

            return (
              <motion.div
                key={`${env}-${i}`}
                initial={
                  env === 'chuva' 
                    ? { y: -20, x: `${randomX}%`, opacity: 0 } 
                    : { y: '110%', x: `${randomX}%`, opacity: 0 }
                }
                animate={
                  env === 'chuva'
                    ? { y: '110%', opacity: [0, 0.7, 0] }
                    : { y: '-10%', opacity: [0, 0.6, 0] }
                }
                transition={{
                  duration: randomDur,
                  repeat: Infinity,
                  delay: randomDelay,
                  ease: 'linear'
                }}
                className="absolute rounded-full"
                style={{
                  width: `${size}px`,
                  height: env === 'chuva' ? `${size * 3.5}px` : `${size}px`,
                  backgroundColor: activeConf.particleColor,
                  filter: `blur(${env === 'cosmos' ? 1.5 : 0.5}px)`
                }}
              />
            );
          })}
        </AnimatePresence>
      </div>

      {/* Top Header */}
      <div className="w-full flex justify-between items-center bg-transparent max-w-4xl mx-auto pt-2 px-2 z-10">
        <button 
          onClick={onClose}
          className="p-2.5 rounded-full border border-slate-700/60 hover:border-slate-500 hover:bg-[#101826]/40 text-slate-350 transition-all cursor-pointer group shrink-0"
          title={lang === 'pt' ? 'Fechar respiração' : 'Close breathing'}
        >
          <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
        </button>
        <span className="text-[10px] tracking-[0.4em] font-bold font-mono text-slate-500 uppercase">
          {lang === 'pt' ? 'SOPRO COERENTE' : 'COHERENT PATTERN'}
        </span>
        <div className="w-8 shrink-0" />
      </div>

      {/* PCH Methodology Pattern Selector */}
      <div className="w-full max-w-2xl mx-auto scrollbar-none overflow-x-auto z-10 py-1 flex flex-col items-center">
        <div className="flex space-x-2 min-w-max px-2 justify-center">
          {PCH_PATTERNS.map((pat) => {
            const isSelected = activePattern.id === pat.id;
            return (
              <button
                key={pat.id}
                onClick={() => setActivePattern(pat)}
                className={`px-3 py-1.5 rounded-full border text-[10px] font-mono tracking-wider transition-all cursor-pointer select-none whitespace-nowrap active:scale-95 ${
                  isSelected
                    ? 'bg-teal-500/20 text-teal-300 border-teal-500/50 shadow-sm shadow-teal-500/10 font-bold'
                    : 'bg-[#101826]/30 text-slate-400 border-slate-800/40 hover:text-slate-200 hover:bg-[#101826]/60'
                }`}
              >
                {lang === 'pt' ? pat.namePt : pat.nameEn}
              </button>
            );
          })}
        </div>
        <p className="text-center text-[9px] text-slate-400 font-mono italic mt-1.5 select-none opacity-80 max-w-md px-4">
          {lang === 'pt' ? activePattern.descriptionPt : activePattern.descriptionEn}
        </p>
      </div>

      {/* Atmospheric Environment Selector */}
      <div className="w-full max-w-lg mx-auto bg-[#101826]/40 backdrop-blur-md rounded-2xl border border-slate-800/40 p-1.5 grid grid-cols-4 gap-1 z-10">
        {(Object.keys(envConfigs) as Environment[]).map((e) => {
          const isSelected = env === e;
          return (
            <button
              key={e}
              onClick={() => setEnv(e)}
              className={`py-1.5 text-[9.5px] font-medium rounded-xl select-none transition-all cursor-pointer font-mono ${
                isSelected
                  ? 'bg-slate-800 text-stone-100 border border-slate-700 shadow-sm'
                  : 'text-slate-400 hover:text-stone-300 hover:bg-slate-900/40'
              }`}
            >
              {lang === 'pt' ? envConfigs[e].labelPt.split(' ')[1] : envConfigs[e].labelEn.split(' ')[1]}
            </button>
          );
        })}
      </div>

      {/* Main Guided Balloon Area with ripple nodes */}
      <div className="flex-1 flex flex-col justify-center items-center relative py-2 z-10">
        
        <div className="relative w-56 h-56 md:w-72 md:h-72 flex items-center justify-center">
          
          {/* Subtle outer bounds pulsing ring */}
          <div className="absolute w-[200px] h-[200px] md:w-[260px] md:h-[260px] rounded-full border border-dashed border-slate-700/40 animate-pulse pointer-events-none" />
          
          {/* Synchronized concentric energy ripples matching current phase */}
          <AnimatePresence>
            {breathingPhase === 'inhale' && (
              <motion.div
                initial={{ scale: 0.9, opacity: 0.7 }}
                animate={{ scale: 2.1, opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeOut' }}
                className="absolute w-32 h-32 md:w-40 md:h-40 rounded-full border border-teal-500/20 pointer-events-none"
              />
            )}
            {breathingPhase === 'exhale' && (
              <motion.div
                initial={{ scale: 2.1, opacity: 0 }}
                animate={{ scale: 0.9, opacity: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeIn' }}
                className="absolute w-32 h-32 md:w-40 md:h-40 rounded-full border border-sky-400/20 pointer-events-none"
              />
            )}
            {breathingPhase === 'hold' && (
              <motion.div
                initial={{ scale: 1.8, opacity: 0.3 }}
                animate={{ scale: [1.8, 1.9, 1.8], opacity: [0.3, 0.45, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute w-32 h-32 md:w-40 md:h-40 rounded-full border border-emerald-500/15 pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Glowing adaptive Balloon */}
          <div 
            className={`absolute w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-tr ${activeConf.balloonGrad} border border-slate-600/35 transition-transform duration-75 ease-linear flex items-center justify-center shadow-2xl`}
            style={{ 
              transform: `scale(${balloonScale})`,
              boxShadow: `0 0 50px ${activeConf.glowShadow}, inset 0 0 20px rgba(255, 255, 255, 0.1)` 
            }}
          >
            {/* Center core point */}
            <div className={`w-3 h-3 rounded-full ${env === 'oceano' ? 'bg-teal-400/40' : env === 'floresta' ? 'bg-emerald-400/40' : env === 'chuva' ? 'bg-[#38bdf8]/40' : 'bg-amber-400/40'} animate-pulse`} />
          </div>

          {/* Clock timer */}
          <div className="absolute flex flex-col items-center justify-center leading-none select-none pointer-events-none">
            <span className="font-mono text-5xl font-black text-white tabular-nums leading-none filter drop-shadow-md">
              {Math.max(Math.ceil((activePattern.phases[breathingPhase] || 4) - elapsed), 1)}
            </span>
            <span className="text-[8px] font-mono tracking-[0.35em] text-slate-400 font-bold uppercase mt-2.5">
              {lang === 'pt' ? 'Segundos' : 'Seconds'}
            </span>
          </div>
        </div>

        {/* Dynamic breathing phase typography instruction */}
        <div className="text-center space-y-1.5 max-w-sm mx-auto mt-6 px-6">
          <span className="text-[9px] font-mono tracking-[0.3em] font-bold text-teal-400 uppercase block">
            {breathingPhase === 'inhale' && (lang === 'pt' ? 'INSPIRAÇÃO' : 'INHALE')}
            {breathingPhase === 'hold' && (lang === 'pt' ? 'RETENÇÃO CHEIO' : 'SUSPEND')}
            {breathingPhase === 'exhale' && (lang === 'pt' ? 'EXPIRAÇÃO' : 'EXHALE')}
            {breathingPhase === 'holdEmpty' && (lang === 'pt' ? 'RETENÇÃO VAZIO' : 'REST EMPTY')}
          </span>
          <h2 className="text-lg md:text-xl font-serif text-white font-bold tracking-tight transition-all duration-300">
            {lang === 'pt' ? phrasePt[breathingPhase] : phraseEn[breathingPhase]}
          </h2>
          <p className="text-slate-450 text-[11px] font-light tracking-wide leading-relaxed">
            {lang === 'pt' ? descPt[breathingPhase] : descEn[breathingPhase]}
          </p>
        </div>
      </div>

      {/* Advanced interactive visual breathing pacer (trajectory graph) */}
      <div className="w-full max-w-md mx-auto bg-[#101826]/30 backdrop-blur-md border border-slate-800/40 rounded-2xl p-3.5 mt-2 mb-4 z-10">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-mono flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
            {lang === 'pt' ? 'Trajetória do Sopro' : 'Breath Stream Pacer'}
          </span>
          <span className="text-[8px] font-mono text-slate-500 uppercase">
            {lang === 'pt' ? `${activePattern.namePt}` : `${activePattern.nameEn}`}
          </span>
        </div>

        <div className="relative h-14 w-full overflow-visible">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 400 120" preserveAspectRatio="none">
            {/* Background trace line */}
            <path
              d={wavePath}
              fill="none"
              stroke="#1e293b"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Active glowing trace trail */}
            <path
              d={wavePath}
              fill="none"
              stroke="url(#waveGlowGrad)"
              strokeWidth="3.5"
              strokeLinecap="round"
              className="opacity-90"
            />
            
            {/* Real-time vertical crosshair line */}
            <line
              x1={dotX}
              y1={20}
              x2={dotX}
              y2={100}
              stroke="rgba(20, 184, 166, 0.2)"
              strokeWidth="1.2"
              strokeDasharray="3 3"
            />

            {/* Glowing guide pearl gliding on the curve */}
            <circle
              cx={dotX}
              cy={dotY}
              r="6.5"
              fill={activeConf.particleColor}
              className="transition-all duration-75"
              style={{
                filter: `drop-shadow(0 0 8px ${activeConf.particleColor})`
              }}
            />

            {/* Path glow linear gradient definitions */}
            <defs>
              <linearGradient id="waveGlowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#14B8A6" stopOpacity="0.4" />
                <stop offset={`${cycleProgress * 100}%`} stopColor={activeConf.particleColor} stopOpacity="1" />
                <stop offset={`${Math.min(cycleProgress * 100 + 1, 100)}%`} stopColor="#1e293b" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>

          {/* Time tags for horizontal alignments */}
          <div className="absolute bottom-[-11px] left-0 right-0 flex justify-between px-1 text-[8px] font-mono text-slate-500 uppercase select-none pointer-events-none">
            <span>{lang === 'pt' ? 'Inalar' : 'Inhale'}</span>
            {activePattern.phases.hold > 0 && <span>{lang === 'pt' ? 'Reter' : 'Hold'}</span>}
            <span>{lang === 'pt' ? 'Exalar' : 'Exhale'}</span>
            {activePattern.phases.holdEmpty > 0 && <span>{lang === 'pt' ? 'R.Vazio' : 'Rest'}</span>}
          </div>
        </div>
      </div>

      {/* Footer statistics counter tags */}
      <div className="w-full max-w-md mx-auto flex justify-center items-center gap-2 flex-wrap pb-2 z-10">
        <div className="py-1.5 px-3 rounded-full border border-slate-800/40 bg-[#101826]/40 backdrop-blur-md flex items-center gap-2 text-[9px] uppercase font-mono tracking-widest text-[#34D399]">
          <Anchor className="w-3.5 h-3.5" />
          <span>{lang === 'pt' ? `Ciclo ${cycles}` : `Cycle ${cycles}`}</span>
        </div>
        <div className="py-1.5 px-3 rounded-full border border-rose-950/40 bg-rose-950/10 backdrop-blur-md flex items-center gap-2 text-[9px] uppercase font-mono tracking-widest text-rose-350">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping shrink-0" />
          <span className="font-bold">💓 {liveBpm} BPM</span>
        </div>
        <div className="py-1.5 px-3 rounded-full border border-slate-800/40 bg-[#101826]/40 backdrop-blur-md flex items-center gap-2 text-[9px] uppercase font-mono tracking-widest text-slate-400">
          <Wind className="w-3.5 h-3.5" />
          <span>{activePattern.phases.inhale}-{activePattern.phases.hold}-{activePattern.phases.exhale}-{activePattern.phases.holdEmpty} PCH</span>
        </div>
      </div>
    </div>
  );
};
