import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { SessionStatus, Language, UserPlan, User, NeurodivergentMode, GardenPlant } from '../types';
import { getSystemInstruction, MODEL_NAME, TRANSLATIONS, VOICE_IDS, PLAN_LIMITS, WISDOM_QUOTES } from '../constants';
import AudioVisualizer from './AudioVisualizer';
import Logo from './Logo';
import { 
  Sprout, Heart, Droplet, Flower, AlertCircle, Compass, Sparkles, 
  Eye, Moon, Sun, Activity, Info, X, ChevronRight, CheckCircle2,
  Bookmark, ShieldAlert, Award, Volume2, HelpCircle
} from 'lucide-react';
import { MoodConstellation } from './MoodConstellation';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';

interface SessionManagerProps {
  onDisconnect: () => void;
  lang: Language;
  userPlan: UserPlan;
  onUpgrade: () => void;
  currentUser?: User | null;
}

// Inline Icons
const MicIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
  </svg>
);

const MicOffIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 5.25l-15 15m0-15l15 15m-4.02-3.831a6 6 0 0 0 1.02-3.169v-1.5m-6 7.5a6 6 0 0 1-3.674-.634m9.674.634v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v1.751m-6 10.998v-3m0 0h.01" />
  </svg>
);

const SettingsIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
  </svg>
);

const MAX_SENSITIVITY_RANGE = 0.2;

// Audio Encoding/Decoding helpers as per GenAI Guidelines
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

const SessionManager: React.FC<SessionManagerProps> = ({ onDisconnect, lang, userPlan, onUpgrade, currentUser }) => {
  const [status, setStatus] = useState<SessionStatus>(SessionStatus.CONNECTING);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [inputSensitivity, setInputSensitivity] = useState(0.01);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [voice, setVoice] = useState<'essencia' | 'esperanca' | 'serenidade' | 'infantil' | 'sabedoria'>('essencia');
  const [voicePitch, setVoicePitch] = useState(1.0);
  const [speechRate, setSpeechRate] = useState(1.0);

  // States for Adaptive Consciousness additions
  const [neuroMode, setNeuroMode] = useState<NeurodivergentMode>('natural');
  const [customSystemPrompt, setCustomSystemPrompt] = useState<string>('');
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [selectedMetaphor, setSelectedMetaphor] = useState<string | null>(null);
  const [showReferral, setShowReferral] = useState(false);
  const [showGarden, setShowGarden] = useState(false);
  const [gardenPlants, setGardenPlants] = useState<GardenPlant[]>([]);
  const [showWaterEffect, setShowWaterEffect] = useState<string | null>(null);
  const [voiceAlert, setVoiceAlert] = useState<string | null>(null);

  // States for 5-camadas core PCH processing system
  const [activeLayer, setActiveLayer] = useState<number>(0);
  const [detectedEmotion, setDetectedEmotion] = useState<{ emotion: string; intensity: number } | null>(null);
  const [visualAnchor, setVisualAnchor] = useState<'neutral' | 'heavy' | 'reflective' | 'light'>('neutral');
  const [selectedRegionTab, setSelectedRegionTab] = useState<'campo' | 'floresta' | 'lago' | 'montanha' | 'constelacao'>('campo');

  // New States: Rest Mode, Ambient Sound, and Gamification
  const [ambientSound, setAmbientSound] = useState<'off' | 'rain' | 'forest' | 'waves'>(() => {
    return (localStorage.getItem('pch_ambient_sound') as any) || 'off';
  });
  const [ambientVolume, setAmbientVolume] = useState<number>(() => {
    const v = localStorage.getItem('pch_ambient_volume');
    return v ? parseFloat(v) : 0.3;
  });
  const [isRestMode, setIsRestMode] = useState<boolean>(() => {
    return localStorage.getItem('pch_is_rest_mode') === 'true';
  });
  const [conversationsCompleted, setConversationsCompleted] = useState<number>(() => {
    const val = localStorage.getItem('pch_daily_conversations');
    return val ? parseInt(val, 10) : 0;
  });
  const [showCelebration, setShowCelebration] = useState(false);
  const [showWisdom, setShowWisdom] = useState(true);

  // Audio refs and helper triggers
  const lastIncrementTimeRef = useRef<number>(0);
  const natureSynthRef = useRef<{
    audioCtx: AudioContext | null;
    gainNode: GainNode | null;
    noiseSource: AudioBufferSourceNode | null;
    filterNode: BiquadFilterNode | null;
    lfoNode: OscillatorNode | null;
    lfoGain: GainNode | null;
    chirpTimeout: NodeJS.Timeout | null;
  } | null>(null);

  // Silent-guarding helper for Voice Alerts
  const triggerVoiceAlert = useCallback((msg: string) => {
    if (isRestMode) return; // Completely silenced in Rest Mode!
    setVoiceAlert(msg);
  }, [isRestMode]);

  // Handle fading voiceAlert resets
  useEffect(() => {
    if (voiceAlert) {
      const timer = setTimeout(() => setVoiceAlert(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [voiceAlert]);

  // Gamification: completing missions increments with full celebration animations
  const incrementConversations = useCallback(() => {
    setConversationsCompleted(prev => {
      if (prev >= 3) return prev;
      const nextVal = prev + 1;
      localStorage.setItem('pch_daily_conversations', nextVal.toString());
      if (nextVal === 3) {
        setShowCelebration(true);
        // Play success haptics if available
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
      }
      return nextVal;
    });
  }, []);

  // Web Audio Synthesizer for Nature Sounds
  const updateAmbientSynth = useCallback((type: 'off' | 'rain' | 'forest' | 'waves', volumeVal: number) => {
    // If set to off or volume is 0, stop context and return
    if (type === 'off' || volumeVal <= 0) {
      if (natureSynthRef.current) {
        try { natureSynthRef.current.noiseSource?.stop(); } catch (e) {}
        try { natureSynthRef.current.lfoNode?.stop(); } catch (e) {}
        if (natureSynthRef.current.chirpTimeout) clearTimeout(natureSynthRef.current.chirpTimeout);
        try { natureSynthRef.current.audioCtx?.close(); } catch (e) {}
        natureSynthRef.current = null;
      }
      return;
    }

    try {
      // Lazy init AudioContext for spacey nature soundscapes
      if (!natureSynthRef.current) {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const mainGain = ctx.createGain();
        mainGain.connect(ctx.destination);

        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const channelData = noiseBuffer.getChannelData(0);

        // Pinkish noise generator block
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          b6 = white * 0.115926;
          channelData[i] = pink * 0.08;
        }

        const noiseSource = ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        const filter = ctx.createBiquadFilter();

        natureSynthRef.current = {
          audioCtx: ctx,
          gainNode: mainGain,
          noiseSource: noiseSource,
          filterNode: filter,
          lfoNode: null,
          lfoGain: null,
          chirpTimeout: null
        };

        noiseSource.connect(filter);
        filter.connect(mainGain);
        noiseSource.start(0);
      }

      const { audioCtx: ctx, gainNode: mainGain, filterNode: filter } = natureSynthRef.current;
      if (!ctx || !mainGain || !filter) return;

      // Update volume
      mainGain.gain.setValueAtTime(volumeVal * 0.65, ctx.currentTime);

      // Reset nested sounds/LFOs from preceding selection
      if (natureSynthRef.current.lfoNode) {
        try { natureSynthRef.current.lfoNode.stop(); } catch (e) {}
        natureSynthRef.current.lfoNode = null;
      }
      if (natureSynthRef.current.lfoGain) {
        natureSynthRef.current.lfoGain = null;
      }
      if (natureSynthRef.current.chirpTimeout) {
        clearTimeout(natureSynthRef.current.chirpTimeout);
      }

      if (type === 'rain') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(750, ctx.currentTime);
        filter.Q.setValueAtTime(0.8, ctx.currentTime);
      } else if (type === 'waves') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(280, ctx.currentTime);
        filter.Q.setValueAtTime(1.0, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.08, ctx.currentTime); // ~12s full cycle wave swelling

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(160, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start(0);

        natureSynthRef.current.lfoNode = lfo;
        natureSynthRef.current.lfoGain = lfoGain;
      } else if (type === 'forest') {
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(450, ctx.currentTime);
        filter.Q.setValueAtTime(1.8, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.04, ctx.currentTime);

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(120, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start(0);

        natureSynthRef.current.lfoNode = lfo;
        natureSynthRef.current.lfoGain = lfoGain;

        const scheduleChirp = () => {
          if (!natureSynthRef.current || natureSynthRef.current.audioCtx?.state === 'closed') return;
          const actCtx = natureSynthRef.current.audioCtx;
          if (!actCtx) return;

          const chirpTime = actCtx.currentTime + Math.random() * 5 + 3;
          const osc = actCtx.createOscillator();
          const oscGain = actCtx.createGain();
          osc.type = 'sine';

          const startFreq = 2100 + Math.random() * 500;
          osc.frequency.setValueAtTime(startFreq, chirpTime);
          osc.frequency.exponentialRampToValueAtTime(startFreq - 700, chirpTime + 0.14);

          oscGain.gain.setValueAtTime(0, chirpTime);
          oscGain.gain.linearRampToValueAtTime(volumeVal * 0.1, chirpTime + 0.04);
          oscGain.gain.exponentialRampToValueAtTime(0.001, chirpTime + 0.14);

          osc.connect(oscGain);
          oscGain.connect(actCtx.destination);
          
          try {
            osc.start(chirpTime);
            osc.stop(chirpTime + 0.15);
          } catch (err) {}

          natureSynthRef.current.chirpTimeout = setTimeout(scheduleChirp, (Math.random() * 7 + 5) * 1000);
        };

        scheduleChirp();
      }
    } catch (e) {
      console.warn("Ambient Audio Synthesis failed to load: ", e);
    }
  }, []);

  // Update Synths when volume/ambientSound toggled
  useEffect(() => {
    updateAmbientSynth(ambientSound, ambientVolume);
  }, [ambientSound, ambientVolume, updateAmbientSynth]);

  // Destroy sound contexts on cleanup
  useEffect(() => {
    return () => {
      if (natureSynthRef.current) {
        try { natureSynthRef.current.noiseSource?.stop(); } catch (e) {}
        try { natureSynthRef.current.lfoNode?.stop(); } catch (e) {}
        if (natureSynthRef.current.chirpTimeout) clearTimeout(natureSynthRef.current.chirpTimeout);
        try { natureSynthRef.current.audioCtx?.close(); } catch (e) {}
        natureSynthRef.current = null;
      }
    };
  }, []);

  // Breathing Coach states
  const [breathingText, setBreathingText] = useState('Respire profundamente');
  const [breathingStep, setBreathingStep] = useState<'inhale' | 'hold-in' | 'exhale' | 'hold-out'>('inhale');
  const [breathingScale, setBreathingScale] = useState(1.0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSessionRef = useRef<any>(null);

  const text = TRANSLATIONS[lang];
  const accMode = currentUser?.accessibilityMode || false;

  // Synchronize adaptive consciousness configurations and cloud-persisted system prompts
  useEffect(() => {
    if (currentUser?.neuroMode) {
      setNeuroMode(currentUser.neuroMode);
    }
  }, [currentUser?.neuroMode]);

  useEffect(() => {
    const configDocRef = doc(db, 'system_config', 'voice_settings');
    const unsubscribe = onSnapshot(configDocRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.systemPrompt) {
          setCustomSystemPrompt(data.systemPrompt);
        }
      }
    }, (err) => {
      console.error("Failed to fetch cloud system prompt", err);
    });
    return () => unsubscribe();
  }, []);

  // Initialize Garden Plants with real-time Firestore synchronization or Offline localStorage fallbacks
  useEffect(() => {
    let unsubscribe = () => {};
    const currentUser = auth.currentUser;

    const defaultPlants: GardenPlant[] = [
      { id: '1', type: 'flower', name: lang === 'pt' ? 'Sutileza Celeste' : 'Celestial Subtlety', stage: 2, color: 'text-teal-400', createdAt: new Date().toISOString(), lastWatered: new Date().toISOString() },
      { id: '2', type: 'tree', name: lang === 'pt' ? 'Ipê de Foco' : 'Ipê of Focus', stage: 1, color: 'text-amber-400', createdAt: new Date().toISOString(), lastWatered: new Date().toISOString() },
      { id: '3', type: 'succulent', name: lang === 'pt' ? 'Cacto de Força' : 'Resilience Cactus', stage: 3, color: 'text-emerald-400', createdAt: new Date().toISOString(), lastWatered: new Date().toISOString() }
    ];

    if (currentUser) {
      const colRef = collection(db, 'users', currentUser.uid, 'plants');
      unsubscribe = onSnapshot(colRef, (snapshot) => {
        if (snapshot.empty) {
          // Automatic self-healing bootstrap of initial plants inside Firestore
          defaultPlants.forEach(async (p) => {
            try {
              await setDoc(doc(db, 'users', currentUser.uid, 'plants', p.id), p);
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `users/${currentUser.uid}/plants/${p.id}`);
            }
          });
        } else {
          const synced: GardenPlant[] = [];
          snapshot.forEach((snapDoc) => {
            const data = snapDoc.data();
            synced.push({
              id: snapDoc.id,
              type: data.type,
              name: data.name,
              stage: typeof data.stage === 'number' ? data.stage : 0,
              color: data.color || 'text-teal-400',
              createdAt: data.createdAt || new Date().toISOString(),
              lastWatered: data.lastWatered || new Date().toISOString()
            });
          });
          // Sort by creation or ID to maintain consistent UI layout order
          synced.sort((a,b) => a.id.localeCompare(b.id));
          setGardenPlants(synced);
        }
      }, (err) => {
        handleFirestoreError(err, OperationType.LIST, `users/${currentUser.uid}/plants`);
      });
    } else {
      // Offline Local Guest Mode fallback
      const cached = localStorage.getItem('pch_garden_plants');
      if (cached) {
        try {
          setGardenPlants(JSON.parse(cached));
        } catch (e) {
          console.error("Failed to parse cached plants", e);
        }
      } else {
        setGardenPlants(defaultPlants);
        localStorage.setItem('pch_garden_plants', JSON.stringify(defaultPlants));
      }
    }

    return () => {
      unsubscribe();
    };
  }, [lang]);

  // Breathing cycle interval with haptic feedback vibrations
  useEffect(() => {
    let breathingInterval: NodeJS.Timeout;
    let step = 0; // 0: Inhale, 1: Hold, 2: Exhale, 3: Hold Out

    const runCycle = () => {
      // Trigger a gentle, non-disruptive physical pulse on cycle step transitions
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }

      if (step === 0) {
        setBreathingStep('inhale');
        setBreathingText(lang === 'pt' ? 'Inale devagar...' : 'Inhale slowly...');
        setBreathingScale(1.4);
        step = 1;
      } else if (step === 1) {
        setBreathingStep('hold-in');
        setBreathingText(lang === 'pt' ? 'Segure o ar...' : 'Hold in...');
        setBreathingScale(1.4);
        step = 2;
      } else if (step === 2) {
        setBreathingStep('exhale');
        setBreathingText(lang === 'pt' ? 'Exale suavemente...' : 'Exhale smoothly...');
        setBreathingScale(0.9);
        step = 3;
      } else {
        setBreathingStep('hold-out');
        setBreathingText(lang === 'pt' ? 'Aguarde em quietude...' : 'Hold empty...');
        setBreathingScale(1.0);
        step = 0;
      }
    };

    runCycle();
    breathingInterval = setInterval(runCycle, 4000);

    return () => clearInterval(breathingInterval);
  }, [lang]);

  const cleanupAudio = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
  }, []);

  const connectToGemini = useCallback(async () => {
    try {
      cleanupAudio();
      setStatus(SessionStatus.CONNECTING);

      if (!process.env.API_KEY) throw new Error("API Key Missing.");
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = audioCtx;

      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = mediaStream;

      const currentTime = new Date().toLocaleTimeString(lang);
      
      const voiceThematicInstructions: Record<string, string> = {
        essencia: `\n\n**ESTILO DE ATUAÇÃO E VOZ (VOZ ESSÊNCIA):** Fale com seu tom de voz natural de equilíbrio e calmaria básica. Seja o porto seguro estável e sintonizado.`,
        esperanca: `\n\n**ESTILO DE ATUAÇÃO E VOZ (VOZ ESPERANÇA):** Fale com um tom de voz caloroso, encorajador e visivelmente esperançoso. Use palavras inspiradoras e acolha com profundo carinho.`,
        serenidade: `\n\n**ESTILO DE ATUAÇÃO E VOZ (VOZ SERENIDADE):** Fale calmamente e devagar. Desacelere a fala e faça pausas reflexivas comuns a um repouso meditativo profundo.`,
        infantil: `\n\n**ESTILO DE ATUAÇÃO E VOZ (VOZ INFANTIL):** Fale de forma leve, protetora, imaginativa, simples e lúdica, adequada para acalmar mentes inocentes. Evite conceitos densos ou abstratos. Sintonize a suavidade de uma canção de ninar.`,
        sabedoria: `\n\n**ESTILO DE ATUAÇÃO E VOZ (VOZ SABEDORIA):** Fale com postura madura e cheia de paciência, de profunda empatia sênior, com o recolhimento de quem sintoniza a clareza e o sossego sábio milenar.`
      };
      
      const thematicPrompt = voiceThematicInstructions[voice] || "";

      // Inject speech speed/pitch options alongside actual active NeurodivergentMode System Prompt segment!
      const voiceInstruction = `\n\n**ESTILO DE VOZ ATUAL:**
      - Velocidade: ${speechRate}x (0.5x é muito lento, 1.5x é rápido).
      - Tom: ${voicePitch > 1 ? 'Mais agudo/feminino' : voicePitch < 1 ? 'Mais grave/masculino' : 'Normal'}.
      Por favor, ajuste seu ritmo, velocidade e entonação para refletir essas configurações e respeitar o tom do perfil ativo.${thematicPrompt}`;

      // Get instruction combining base, accessibility, and the target neurodiversity instructions
      const lastContext = selectedFeeling ? `${lang === 'pt' ? 'Me sinto assim: ' : 'I feel like: '}${selectedFeeling}` : undefined;
      const baseInstruction = customSystemPrompt || getSystemInstruction(lang, currentTime, accMode, neuroMode, lastContext);
      const instruction = baseInstruction + voiceInstruction;

      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_IDS[voice] } },
          },
          systemInstruction: instruction,
        },
        callbacks: {
          onopen: () => {
            setStatus(SessionStatus.CONNECTED);
            // Trigger customized greeting if a feeling or metaphor is pre-selected
            if (selectedFeeling || selectedMetaphor) {
              const greetStr = selectedFeeling 
                ? (lang === 'pt' ? `Olá Dr. Evaldo, hoje eu me sinto: ${selectedFeeling}` : `Hello Dr. Evaldo, today I feel: ${selectedFeeling}`)
                : (lang === 'pt' ? `Dr. Evaldo, me sinto mudo e escolhi o símbolo: ${selectedMetaphor}` : `Dr. Evaldo, I am wordless and chose the symbol: ${selectedMetaphor}`);
              
              sessionPromise.then((s: any) => {
                s.send({
                  clientContent: {
                    turns: [{
                      role: 'user',
                      parts: [{ text: greetStr }]
                    }],
                    turnComplete: true
                  }
                });
              });
            }
          },
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
              const now = Date.now();
              if (now - lastIncrementTimeRef.current > 30000) {
                lastIncrementTimeRef.current = now;
                incrementConversations();
              }
              setIsAiSpeaking(true);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtx.currentTime);
              
              const audioBuffer = await decodeAudioData(
                decode(base64Audio),
                audioCtx,
                24000,
                1
              );
              
              const source = audioCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioCtx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              
              source.onended = () => {
                if (audioCtx.currentTime >= nextStartTimeRef.current - 0.1) {
                  setIsAiSpeaking(false);
                }
              };
            }
          },
          onerror: (e) => {
            console.error("Live API Error:", e);
            setStatus(SessionStatus.ERROR);
          },
          onclose: () => setStatus(SessionStatus.ENDED)
        }
      });
      sessionPromiseRef.current = sessionPromise;
      activeSessionRef.current = sessionPromise;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const srcNode = inputCtx.createMediaStreamSource(mediaStream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      srcNode.connect(processor);
      processor.connect(inputCtx.destination);
      
      processor.onaudioprocess = (e) => {
          if (isMicMuted) return;
          const input = e.inputBuffer.getChannelData(0);
          
          let sum = 0;
          for(let i=0; i<input.length; i++) sum += input[i] * input[i];
          const rms = Math.sqrt(sum / input.length);
          setVolume(rms);
          setIsUserSpeaking(rms > inputSensitivity);

          const pcm16 = new Int16Array(input.length);
          for(let i=0; i<input.length; i++) pcm16[i] = input[i] * 32767;
          
          sessionPromise.then(session => {
            session.sendRealtimeInput({ 
              media: { 
                mimeType: 'audio/pcm;rate=16000', 
                data: encode(new Uint8Array(pcm16.buffer)) 
              } 
            });
          });
      };

    } catch (e: any) {
      setErrorMsg(e.message);
      setStatus(SessionStatus.ERROR);
    }
  }, [lang, voice, accMode, neuroMode, inputSensitivity, isMicMuted, selectedFeeling, selectedMetaphor]);

  useEffect(() => {
    connectToGemini();
    const t = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    return () => { cleanupAudio(); clearInterval(t); };
  }, [connectToGemini, cleanupAudio]);

  // Propagate plant watering to LocalStorage/Firestore and growth stages
  const handleWaterPlant = async (id: string) => {
    setShowWaterEffect(id);
    setTimeout(() => setShowWaterEffect(null), 1000);

    // Register subtle haptic vibration (50ms) on plant water
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }

    const currentUser = auth.currentUser;
    const targetPlant = gardenPlants.find(p => p.id === id);
    if (!targetPlant) return;

    const nextStage = targetPlant.stage < 4 ? targetPlant.stage + 1 : 0;
    const updatedPlant: GardenPlant = {
      ...targetPlant,
      stage: nextStage,
      lastWatered: new Date().toISOString()
    };

    if (currentUser) {
      try {
        const docRef = doc(db, 'users', currentUser.uid, 'plants', id);
        await setDoc(docRef, updatedPlant);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/plants/${id}`);
      }
    } else {
      const updated = gardenPlants.map(p => p.id === id ? updatedPlant : p);
      setGardenPlants(updated);
      localStorage.setItem('pch_garden_plants', JSON.stringify(updated));
    }
  };

  // Plant a new seed
  const handlePlantSeed = async () => {
    const types: ('flower' | 'tree' | 'shrub' | 'succulent' | 'fern' | 'flower2')[] = ['flower', 'tree', 'succulent', 'flower2', 'fern'];
    const chosenType = types[Math.floor(Math.random() * types.length)];
    const colors = ['text-teal-400', 'text-amber-400', 'text-emerald-400', 'text-indigo-400', 'text-rose-400'];
    const chosenColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Physical haptic confirm on planting
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(25);
    }

    const regionalNames: Record<string, string[]> = {
      campo: ['Muda de Luz 🌱', 'Broto da Atenção 🌿', 'Dente-de-Leão da Clareza ✨'],
      floresta: ['Germe da Bravura 🌲', 'Semente de Carvalho 🌳', 'Arbusto Resiliente 🌿'],
      lago: ['Lótus da Serenidade 🌸', 'Vitória-Régia PCH 💮', 'Junco da Calmaria 🌾'],
      montanha: ['Edelweiss das Neves 🏔️', 'Flor de Gelo Cósmica ❄️', 'Cacto de Altitude 🌵'],
      constelacao: ['Fagulha Galáctica 🌟', 'Cristal Astral ✨', 'Poeira Cósmica de Insight ☄️']
    };

    const nameList = regionalNames[selectedRegionTab] || regionalNames.campo;
    const randomName = nameList[Math.floor(Math.random() * nameList.length)];

    const newId = Date.now().toString();
    const newPlant: GardenPlant = {
      id: newId,
      type: chosenType,
      name: randomName,
      stage: 0,
      color: chosenColor,
      createdAt: new Date().toISOString(),
      lastWatered: new Date().toISOString()
    };

    // Store custom region property on the plant document representation
    (newPlant as any).region = selectedRegionTab;

    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const docRef = doc(db, 'users', currentUser.uid, 'plants', newId);
        await setDoc(docRef, newPlant);
      } catch (err) {
        handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/plants/${newId}`);
      }
    } else {
      const updated = [...gardenPlants, newPlant];
      setGardenPlants(updated);
      localStorage.setItem('pch_garden_plants', JSON.stringify(updated));
    }
  };

  const runIntelligencePipeline = (inputEmotion: string) => {
    setActiveLayer(1);
    const mockIntensities: Record<string, number> = {
      Tristeza: 8, Sadness: 8,
      Ansiedade: 9, Anxiety: 9,
      Raiva: 7, Anger: 7,
      Medo: 8, Fear: 8,
      Confusão: 6, Confusion: 6,
      Esperança: 5, Hope: 5,
      Alegria: 4, Joy: 4,
      Solidão: 7, Solitude: 7
    };
    
    // Fallback if not matching feeling keys
    const rawVal = inputEmotion.split(" ")[0]; // e.g. "Oceano"
    const intensity = mockIntensities[inputEmotion] || Math.floor(Math.random() * 4) + 5;
    setDetectedEmotion({ emotion: rawVal, intensity });

    setTimeout(() => {
      setActiveLayer(2);
      setTimeout(() => {
        setActiveLayer(3);
        setTimeout(() => {
          setActiveLayer(4);
          setTimeout(() => {
            setActiveLayer(5);
          }, 700);
        }, 700);
      }, 700);
    }, 700);
  };

  // Helper trigger for feelings click
  const triggerFeeling = (feelingKey: string, textStr: string) => {
    setSelectedFeeling(textStr);
    triggerVoiceAlert(`${lang === 'pt' ? 'Sentindo' : 'Feeling'}: ${textStr}`);
    runIntelligencePipeline(textStr);

    // Plant progress can boost slightly
    try {
      const currentUser = auth.currentUser;
      const boostedPlants = gardenPlants.map(p => {
        if (Math.random() > 0.5 && p.stage < 3) {
          const updatedPlant = { ...p, stage: p.stage + 1 };
          if (currentUser) {
            const docRef = doc(db, 'users', currentUser.uid, 'plants', p.id);
            setDoc(docRef, updatedPlant).catch(err => {
              handleFirestoreError(err, OperationType.WRITE, `users/${currentUser.uid}/plants/${p.id}`);
            });
          }
          return updatedPlant;
        }
        return p;
      });
      if (!currentUser) {
        setGardenPlants(boostedPlants);
        localStorage.setItem('pch_garden_plants', JSON.stringify(boostedPlants));
      }
    } catch(e) {}

    // Send direct text through existing active connection to guide model immediately
    if (activeSessionRef.current) {
      const textToSend = lang === 'pt' 
        ? `Sintonizar no estado de espírito: ${textStr}.`
        : `Tuning into my current feeling: ${textStr}.`;

      activeSessionRef.current.then((session: any) => {
        session.send({
          clientContent: {
            turns: [{
              role: 'user',
              parts: [{ text: textToSend }]
            }],
            turnComplete: true
          }
        });
      });
    }
  };

  // Helper trigger for metaphor selection
  const triggerMetaphor = (metaphorKey: string, textStr: string) => {
    setSelectedMetaphor(textStr);
    triggerVoiceAlert(`${lang === 'pt' ? 'Símbolo Ativo' : 'Active Symbol'}: ${textStr}`);
    runIntelligencePipeline(textStr);

    // Send direct text through existing connection
    if (activeSessionRef.current) {
      const textToSend = lang === 'pt' 
        ? `Escolhi o símbolo da metáfora visual: ${textStr}. Dr. Evaldo, por favor integre o que esse símbolo representa no meu estado de espírito hoje usando a Poesia Cognitiva Hipnótica.`
        : `I chose the visual metaphor symbol: ${textStr}. Dr. Evaldo, please integrate what this symbol represents into my current emotional state using Hypnotic Cognitive Poetry.`;

      activeSessionRef.current.then((session: any) => {
        session.send({
          clientContent: {
            turns: [{
              role: 'user',
              parts: [{ text: textToSend }]
            }],
            turnComplete: true
          }
        });
      });
    }
  };

  if (status === SessionStatus.ERROR) {
    return (
      <div className="p-8 text-center text-stone-400 bg-stone-950 flex flex-col justify-center items-center h-full space-y-4">
        <AlertCircle className="w-12 h-12 text-red-500" />
        <h3 className="font-serif text-xl tracking-wide text-stone-200">{lang === 'pt' ? 'Erro de Conexão' : 'Connection Error'}</h3>
        <p className="text-xs text-stone-500 max-w-sm">{errorMsg || (lang === 'pt' ? 'Houve um problema de rede ao se conectar ao Dr. Evaldo.' : 'A network issue occurred connecting to Dr. Evaldo.')}</p>
        <button onClick={connectToGemini} className="px-6 py-2 bg-stone-800 text-stone-200 rounded-full border border-stone-700 hover:border-teal-500 text-xs tracking-widest uppercase transition-all">
          {lang === 'pt' ? 'Tentar Novamente' : 'Retry'}
        </button>
      </div>
    );
  }

  // Define sensory theme styles
  let themeBg = 'bg-stone-950';
  if (visualAnchor === 'heavy') {
    themeBg = 'bg-gradient-to-b from-stone-900/60 via-purple-950/20 to-stone-950';
  } else if (visualAnchor === 'reflective') {
    themeBg = 'bg-gradient-to-b from-stone-900/65 via-teal-950/25 to-stone-950';
  } else if (visualAnchor === 'light') {
    themeBg = 'bg-gradient-to-b from-stone-900/60 via-amber-950/15 to-stone-900';
  } else if (visualAnchor === 'neutral') {
    themeBg = 'bg-stone-950';
  }
  let themeCard = 'border-stone-800 bg-stone-900/40';
  let accentBorder = 'border-stone-700/50';
  let textSpacing = 'tracking-normal';
  let lineSpacing = 'leading-normal font-sans';
  let fontOverride = '';

  if (neuroMode === 'anxiety') {
    themeBg = 'bg-emerald-950/20';
    themeCard = 'border-emerald-900/30 bg-emerald-950/15 backdrop-blur-2xl';
    accentBorder = 'border-emerald-800/40';
  } else if (neuroMode === 'dyslexia') {
    textSpacing = 'tracking-[0.14em]';
    lineSpacing = 'leading-[1.95] font-sans';
    fontOverride = 'font-sans';
  } else if (neuroMode === 'adhd') {
    themeBg = 'bg-stone-950';
    themeCard = 'border-stone-800/80 bg-stone-900/60';
  } else if (neuroMode === 'autism') {
    themeBg = 'bg-slate-950';
    themeCard = 'border-slate-800 bg-slate-900/50';
  }

  return (
    <div className={`relative flex flex-col items-center justify-between w-full h-full p-4 overflow-hidden transition-all duration-1000 ${themeBg} ${fontOverride}`}>
      
      {/* Upper Navigation & Neurodivergent Mode Capsule Selector */}
      <div className={`w-full flex flex-col md:flex-row justify-between items-center gap-3 z-30 pb-2 border-b border-stone-900/80 transition-opacity duration-[2000ms] ${isRestMode ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
         <div className="flex items-center space-x-3 w-full md:w-auto">
            <Logo className="w-5 h-5 text-teal-400" />
            <div className="flex flex-col">
              <span className="font-serif text-sm text-stone-200 tracking-wider uppercase">{text?.title}</span>
              <span className="text-[8px] text-teal-400/70 uppercase tracking-widest font-mono">
                {neuroMode === 'natural' && (lang === 'pt' ? 'Experiência Padrão' : 'Default Experience')}
                {neuroMode === 'adhd' && (lang === 'pt' ? 'Modo TDAH Ativo' : 'ADHD Mode Active')}
                {neuroMode === 'autism' && (lang === 'pt' ? 'Modo Autismo Ativo' : 'Autism Mode Active')}
                {neuroMode === 'dyslexia' && (lang === 'pt' ? 'Modo Dislexia Ativo' : 'Dyslexia Mode Active')}
                {neuroMode === 'anxiety' && (lang === 'pt' ? 'Modo Ansiedade Ativo' : 'Anxiety Mode Active')}
                {neuroMode === 'inclusive' && (lang === 'pt' ? 'Modo Inclusivo Ativo' : 'Inclusive Mode Active')}
              </span>
            </div>
         </div>

         {/* Mode Slicers */}
         <div className="flex items-center space-x-1.5 p-1 bg-stone-900/40 border border-stone-800/60 rounded-full max-w-full overflow-x-auto no-scrollbar scroll-smooth">
           {(['natural', 'adhd', 'autism', 'dyslexia', 'anxiety', 'inclusive'] as NeurodivergentMode[]).map(mode => (
             <button
               key={mode}
               onClick={() => setNeuroMode(mode)}
               className={`px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest transition-all font-mono whitespace-nowrap ${
                 neuroMode === mode 
                 ? 'bg-teal-900/30 text-teal-300 border border-teal-800/40 shadow-sm' 
                 : 'text-stone-500 hover:text-stone-300 border border-transparent'
               }`}
             >
               {text?.modes?.[mode] || mode}
             </button>
           ))}
         </div>

         <div className="hidden md:block font-mono text-[10px] text-stone-500">{Math.floor(elapsedSeconds/60)}:{(elapsedSeconds%60).toString().padStart(2,'0')}</div>
      </div>

      {/* Floating Active Voice Actions Info Alerts */}
      {voiceAlert && (
        <div className="absolute top-20 left-12 right-12 z-40 p-3 bg-teal-950/40 backdrop-blur-md border border-teal-900/30 text-[9px] text-teal-300 uppercase tracking-[0.25em] text-center rounded-xl shadow-lg flex items-center justify-center space-x-2 animate-pulse">
           <Sparkles className="w-3.5 h-3.5" />
           <span>{voiceAlert}</span>
        </div>
      )}

      {/* Scrollable Adaptive Dashboard */}
      <div className="flex-1 w-full max-w-4xl overflow-y-auto custom-scrollbar flex flex-col items-center justify-start space-y-6 py-4 px-2 my-2 z-10">
        
        {/* Dynamic Mood Constellation Chart (Emotional Resonance Scoring Graph) */}
        <div className="w-full max-w-md">
          <MoodConstellation history={currentUser?.resonanceHistory || []} lang={lang} />
        </div>

        {/* Sabedoria do Dia Collapsible Section */}
        {showWisdom && (
          <div className={`w-full max-w-md p-4 rounded-2xl border text-center transition-all duration-[2000ms] relative bg-stone-900/20 backdrop-blur-md ${accentBorder} ${isRestMode ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
             <button 
                onClick={() => setShowWisdom(false)} 
                className="absolute top-2.5 right-2.5 text-stone-600 hover:text-stone-300 transition-colors p-0.5 hover:bg-stone-900/50 rounded"
                title={lang === 'pt' ? 'Ocultar' : 'Hide'}
             >
                <X className="w-3.5 h-3.5" />
             </button>
             <div className="flex justify-center items-center gap-1.5 text-[9px] uppercase tracking-widest text-teal-400 font-bold mb-1 select-none">
                <Sparkles className="w-3 h-3 text-teal-400 animate-pulse" />
                <span>{lang === 'pt' ? 'Sabedoria do Dia' : 'Wisdom of the Day'}</span>
             </div>
             <p className="text-xs font-serif italic text-stone-300 leading-relaxed px-5">
                "{WISDOM_QUOTES[lang][new Date().getDate() % WISDOM_QUOTES[lang].length]}"
             </p>
          </div>
        )}

        {/* Visualizer Frame */}
        <div className={`w-full max-w-md p-6 rounded-[2rem] border flex flex-col items-center justify-center relative min-h-[160px] md:min-h-[200px] ${themeCard} ${accentBorder}`}>
           
           {isRestMode && (
             <div className="absolute top-3 right-4 flex space-x-1 items-center animate-pulse">
                <Moon className="w-3 h-3 text-amber-300 fill-amber-300/20" />
                <span className="text-[7px] font-mono text-amber-300 uppercase tracking-widest">{lang === 'pt' ? 'REPOUSO' : 'REST ACTIVE'}</span>
             </div>
           )}

           <div className="absolute top-3 left-4 flex space-x-1.5 items-center">
             <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-ping" />
             <span className="text-[8px] font-mono tracking-widest text-teal-400 uppercase">
               {isAiSpeaking ? (lang === 'pt' ? 'Dr. Evaldo falando' : 'Dr. Evaldo speaking') : (isUserSpeaking ? (lang === 'pt' ? 'Escutando você' : 'Listening to you') : (lang === 'pt' ? 'Sintonizado' : 'Aligned'))}
             </span>
           </div>

           <AudioVisualizer volume={volume} isActive={isUserSpeaking || isAiSpeaking} color={isAiSpeaking ? "rgb(20, 184, 166)" : "rgb(168, 162, 158)"} />
           
           {/* Focus sentence indicator for TDAH (ADHD) or standard prompt feedback */}
           {neuroMode === 'adhd' && (
             <div className="mt-4 p-2 bg-stone-950/60 border border-stone-800 rounded-xl text-center">
               <span className="text-[10px] text-amber-400 uppercase tracking-widest font-black block mb-1">FOCO DE HOJE</span>
               <p className="text-xs text-stone-300 leading-relaxed italic">"Deixe de lado o ruído externo. Apenas uma palavra por vez."</p>
             </div>
           )}
        </div>

        {/* Respirador Integrado (Grounding Breath Coach) - Displayed as top card in Anxiety Mode or togglable */}
        {(neuroMode === 'anxiety' || neuroMode === 'inclusive') && (
          <div className={`w-full max-w-md p-6 rounded-[2rem] border text-center transition-all duration-1000 flex flex-col items-center relative overflow-hidden bg-gradient-to-br from-emerald-950/10 to-teal-950/10 ${accentBorder}`}>
             <span className="text-[8px] text-emerald-400 uppercase tracking-[0.3em] font-black mb-3 select-none">Exercício Respiratório de Aterramento</span>
             
             {/* Animating Breathing Orb */}
             <div 
               className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-[4000ms] border shadow-2xl relative mb-4"
               style={{ 
                 transform: `scale(${breathingScale})`,
                 backgroundColor: breathingStep === 'inhale' ? 'rgba(20, 184, 166, 0.25)' : breathingStep === 'hold-in' ? 'rgba(52, 211, 153, 0.3)' : breathingStep === 'exhale' ? 'rgba(74, 222, 128, 0.15)' : 'rgba(16, 185, 129, 0.05)',
                 borderColor: breathingStep === 'hold-in' ? 'rgba(52,211,153,0.5)' : 'rgba(20, 184, 166, 0.3)'
               }}
             >
                <div className="absolute inset-0 rounded-full blur-xl animate-pulse bg-teal-500/10" />
                <Activity className="w-5 h-5 text-emerald-300 opacity-60" />
             </div>

             <h4 className="text-sm font-serif tracking-widest text-emerald-100 mb-1 transition-all">
                {breathingText}
             </h4>
             <p className="text-[9px] text-emerald-500 uppercase tracking-widest">
                {breathingStep === 'inhale' && (lang === 'pt' ? 'Inale em 4 segundos' : 'Inhale for 4s')}
                {breathingStep === 'hold-in' && (lang === 'pt' ? 'Retenha em plenitude' : 'Hold deep')}
                {breathingStep === 'exhale' && (lang === 'pt' ? 'Solte sem ruído' : 'Release slowly')}
                {breathingStep === 'hold-out' && (lang === 'pt' ? 'Descanse em paz' : 'Rest silent')}
             </p>
          </div>
        )}

        {/* Painel do Núcleo da Inteligência Principal (5-layer processing view & anchor selects) */}
        <div className="w-full max-w-xl bg-stone-900/40 border border-stone-850/60 rounded-3xl p-5 space-y-4 transition-all duration-500">
           <div className="flex justify-between items-center border-b border-stone-850/60 pb-2.5">
              <div className="flex items-center space-x-2">
                 <Activity className="w-4 h-4 text-teal-400 animate-pulse" />
                 <span className="text-[10px] font-bold uppercase tracking-widest text-stone-200">Núcleo de Inteligência Principal PCH</span>
              </div>
              <span className="text-[8px] font-mono font-bold text-stone-500 uppercase tracking-widest bg-stone-950 px-2 py-0.5 rounded border border-stone-900">
                 Acolhimento Ativo
              </span>
           </div>

           {/* Step-by-Step 5 Layers Grid flow status */}
           <div className="grid grid-cols-1 sm:grid-cols-5 gap-1.5">
              {[
                {
                  layer: 1,
                  title: '1. Escuta',
                  desc: 'Intake Ativo',
                  accent: 'text-teal-400 bg-teal-950/20 border-teal-800/40'
                },
                {
                  layer: 2,
                  title: '2. Leitura',
                  desc: detectedEmotion ? `${detectedEmotion.emotion} (${detectedEmotion.intensity}/10)` : '...',
                  accent: 'text-indigo-400 bg-indigo-950/20 border-indigo-800/40'
                },
                {
                  layer: 3,
                  title: '3. Motor PCH',
                  desc: 'Metáfora Ativa',
                  accent: 'text-amber-400 bg-amber-950/20 border-amber-800/40'
                },
                {
                  layer: 4,
                  title: '4. Perfil',
                  desc: `${neuroMode.toUpperCase()}`,
                  accent: 'text-rose-400 bg-rose-950/20 border-rose-800/40'
                },
                {
                  layer: 5,
                  title: '5. Ação',
                  desc: 'Sopro Pronto',
                  accent: 'text-emerald-400 bg-emerald-950/20 border-emerald-800/40'
                }
              ].map((item) => {
                const isActive = activeLayer >= item.layer;
                return (
                  <div 
                    key={item.layer} 
                    className={`p-2.5 rounded-xl border flex flex-col justify-between text-left transition-all duration-300 ${
                      isActive 
                      ? `${item.accent} scale-[1.02] shadow-sm` 
                      : 'bg-stone-950/30 border-stone-900/50 text-stone-600'
                    }`}
                  >
                    <div className="flex items-center space-x-1">
                       <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-current animate-ping' : 'bg-stone-800'}`} />
                       <span className="text-[8.5px] font-mono uppercase font-bold tracking-tight">{item.title}</span>
                    </div>
                    <span className="text-[7.5px] font-mono leading-tight tracking-tight capitalize opacity-95 truncate mt-1">{item.desc}</span>
                  </div>
                );
              })}
           </div>

           {/* Sensorial Custom Emotional Image selectors */}
           <div className="pt-2 border-t border-stone-850/60 flex flex-col space-y-2">
              <div className="flex items-center space-x-1 text-stone-400">
                 <Sparkles className="w-3.5 h-3.5" />
                 <span className="text-[10px] uppercase font-bold tracking-wider">Biblioteca de Imagens / Âncoras Sensoriais de Fundo</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                 {[
                   { key: 'heavy', label: '🌧️ Profundo', desc: 'Mar, Chuva, Tempestade' },
                   { key: 'reflective', label: '🌙 Reflexivo', desc: 'Rio, Lago, Calmaria' },
                   { key: 'light', label: '🌅 Leve', desc: 'Sol, Campo, Céu' },
                   { key: 'neutral', label: '🏔️ Neutro', desc: 'Montanha, Horizonte' }
                 ].map((item) => {
                   const isSel = visualAnchor === item.key;
                   return (
                     <button
                       key={item.key}
                       onClick={() => setVisualAnchor(item.key as any)}
                       className={`p-2 rounded-xl border text-left flex flex-col space-y-0.5 transition-all text-xs cursor-pointer ${
                         isSel 
                         ? 'bg-teal-950/20 border-teal-500/40 text-teal-300' 
                         : 'bg-stone-950/20 border-stone-900 hover:bg-stone-900/30 text-stone-500 hover:text-stone-300'
                       }`}
                     >
                       <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
                       <span className="text-[7px] text-stone-500 leading-tight font-mono truncate">{item.desc}</span>
                     </button>
                   );
                 })}
              </div>
           </div>
        </div>

        {/* Painel de Sentimentos (Feelings Dashboard) - Lowers cognitive load */}
        <div className={`w-full max-w-xl flex flex-col space-y-3 transition-opacity duration-[2000ms] ${isRestMode ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
           <div className="text-center md:text-left">
              <h4 className={`text-xs uppercase tracking-widest text-stone-400 font-bold ${textSpacing}`}>{text?.feelings?.title}</h4>
              <p className="text-[10px] text-stone-500 tracking-wider mt-1">{text?.feelings?.subtitle}</p>
           </div>
           
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(text?.feelings || {}) as string[])
                .filter(k => k !== 'title' && k !== 'subtitle')
                .map(feelingKey => {
                  const label = text.feelings[feelingKey];
                  const isActive = selectedFeeling === label;
                  return (
                    <button
                      key={feelingKey}
                      onClick={() => triggerFeeling(feelingKey, label)}
                      className={`p-3 rounded-xl border text-[10px] uppercase font-mono transition-all duration-300 text-left flex justify-between items-center ${
                        isActive 
                        ? 'bg-teal-900/30 text-teal-300 border-teal-500/60 shadow-lg shadow-teal-500/5' 
                        : 'bg-stone-900/30 hover:bg-stone-900/70 border-stone-800 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span>{label}</span>
                      {isActive && <CheckCircle2 className="w-3 h-3 text-teal-400" />}
                    </button>
                  );
              })}
           </div>
        </div>

        {/* Metaphors Panel - When words fail completely */}
        <div className={`w-full max-w-xl flex flex-col space-y-3 pt-2 transition-opacity duration-[2000ms] ${isRestMode ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
           <div className="text-center md:text-left flex items-center space-x-1.5 justify-center md:justify-start">
              <Compass className="w-4 h-4 text-stone-500" />
              <h4 className={`text-xs uppercase tracking-widest text-stone-400 font-bold ${textSpacing}`}>{text?.metaphors?.title}</h4>
           </div>
           
           <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {(Object.keys(text?.metaphors || {}) as string[])
                .filter(k => k !== 'title')
                .map(metaphorKey => {
                  const label = text.metaphors[metaphorKey];
                  const isActive = selectedMetaphor === label;
                  return (
                    <button
                      key={metaphorKey}
                      onClick={() => triggerMetaphor(metaphorKey, label)}
                      className={`p-3.5 rounded-xl border text-xs transition-all duration-300 hover:scale-105 flex flex-col items-center justify-center space-y-1.5 text-center ${
                        isActive 
                        ? 'bg-amber-950/20 text-amber-300 border-amber-600/50 shadow-lg' 
                        : 'bg-stone-900/30 hover:bg-stone-900/70 border-stone-800/80 text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      <span className="font-serif italic tracking-wide">{label}</span>
                    </button>
                  );
              })}
           </div>
        </div>

      </div>

      {/* Supporting Modals (Inner Garden Panel / Professional supportive clinical networks) */}
      {showGarden && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-6" onClick={() => setShowGarden(false)}>
           <div className="bg-stone-950 border border-stone-800 w-full max-w-2xl p-6 rounded-[2.5rem] relative overflow-hidden shadow-2xl flex flex-col space-y-6" onClick={e=>e.stopPropagation()}>
              
              <div className="flex justify-between items-start">
                 <div className="flex items-center space-x-3.5">
                    <div className="p-3 bg-emerald-900/20 text-emerald-400 border border-emerald-900/30 rounded-2xl">
                       <Sprout className="w-6 h-6 animate-pulse" />
                    </div>
                    <div className="flex flex-col">
                       <h3 className="font-serif text-xl text-stone-100 tracking-wider uppercase">{text?.garden?.title}</h3>
                       <p className="text-[10px] text-stone-500 uppercase tracking-widest">{text?.garden?.subtitle}</p>
                    </div>
                 </div>
                 <button onClick={() => setShowGarden(false)} className="text-stone-500 hover:text-stone-200 transition-colors p-2 hover:bg-stone-900 rounded-full">
                  <X className="w-5 h-5" />
                  </button>
               </div>

               {/* Garden Spatial Regional Slicers */}
               <div className="grid grid-cols-5 gap-1 p-1 bg-stone-900/30 border border-stone-850/60 rounded-2xl shrink-0">
                  {[
                    { key: 'campo', label: 'Campo 🌱', desc: 'Lvl 1+' },
                    { key: 'floresta', label: 'Floresta 🌿', desc: 'Lvl 2+' },
                    { key: 'lago', label: 'Lago 🌳', desc: 'Lvl 5+' },
                    { key: 'montanha', label: 'Montanha 🌺', desc: 'Lvl 10+' },
                    { key: 'constelacao', label: 'Cosmos ✨', desc: 'Lvl 15+' }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setSelectedRegionTab(tab.key as any)}
                      className={`px-1 py-1 rounded-xl text-[8px] uppercase font-bold tracking-wider transition-all cursor-pointer flex flex-col items-center justify-center text-center ${
                        selectedRegionTab === tab.key 
                        ? 'bg-emerald-950/45 text-emerald-300 border border-emerald-800/40' 
                        : 'text-stone-600 hover:text-stone-400 border border-transparent'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span className="text-[6px] text-stone-600 font-mono font-medium mt-0.5">{tab.desc}</span>
                    </button>
                  ))}
               </div>
              {/* Dynamic Plants Grid board */}
              <div className="flex-1 max-h-[50vh] overflow-y-auto custom-scrollbar pr-2">
                 {gardenPlants.length === 0 ? (
                     <div className="py-12 text-center border-2 border-dashed border-stone-900 rounded-2xl flex flex-col items-center justify-center">
                        <Flower className="w-8 h-8 text-stone-700 mb-2 animate-bounce" />
                        <p className="text-xs text-stone-500 uppercase tracking-widest">{text?.garden?.empty}</p>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-4">
                        {gardenPlants.map(p => {
                           const isWatering = showWaterEffect === p.id;
                           return (
                             <div key={p.id} className="p-4 bg-stone-900/30 border border-stone-800 rounded-2xl hover:border-teal-900/40 transition-colors flex justify-between items-center relative overflow-hidden group">
                                {isWatering && (
                                   <div className="absolute inset-0 bg-teal-950/20 backdrop-blur-sm shadow-inner flex items-center justify-center z-10 animate-fade-in">
                                      <Droplet className="w-6 h-6 text-teal-400 animate-bounce" />
                                   </div>
                                )}
                                
                                <div className="flex items-center space-x-3.5">
                                   <div className="text-3xl filter drop-shadow-md select-none transition-transform duration-500 hover:scale-125">
                                      {p.stage === 0 && '🌱'}
                                      {p.stage === 1 && '🌿'}
                                      {p.stage === 2 && '🌳'}
                                      {p.stage === 3 && '🌺'}
                                      {p.stage === 4 && '✨'}
                                   </div>
                                   <div className="flex flex-col">
                                      <span className="text-xs text-stone-100 font-bold font-serif leading-tight">{p.name}</span>
                                      <span className="text-[8px] uppercase tracking-widest text-stone-500 font-semibold mt-0.5">
                                         {p.stage === 0 && (lang === 'pt' ? 'Semente' : 'Seed')}
                                         {p.stage === 1 && (lang === 'pt' ? 'Broto' : 'Sprout')}
                                         {p.stage === 2 && (lang === 'pt' ? 'Árvore' : 'Tree')}
                                         {p.stage === 3 && (lang === 'pt' ? 'Flor Rara' : 'Rare Flower')}
                                         {p.stage === 4 && (lang === 'pt' ? 'Constelação' : 'Constellation')}
                                      </span>
                                   </div>
                                </div>

                                <button 
                                  onClick={() => handleWaterPlant(p.id)}
                                  className="p-2 border border-stone-800 hover:border-teal-500/40 hover:bg-teal-950/10 text-stone-500 hover:text-teal-400 rounded-full transition-all active:scale-90"
                                  title={text?.garden?.water}
                                >
                                   <Droplet className="w-4 h-4" />
                                </button>
                             </div>
                           )
                        })}
                     </div>
                 )}
              </div>

              {/* Garden Footer */}
              <div className="flex flex-col sm:flex-row justify-between items-center pt-3 border-t border-stone-900 gap-3">
                 <p className="text-[9px] text-stone-500 uppercase tracking-widest leading-relaxed text-center sm:text-left">
                    Seu Jardim cultivará sementes a cada progresso ou escrita feita nos diários.
                 </p>
                 <button 
                    onClick={handlePlantSeed}
                    className="px-6 py-2 bg-stone-900 text-stone-200 border border-stone-800 hover:border-emerald-500 text-[10px] tracking-widest uppercase font-mono rounded-full font-bold transition-all shadow-md shrink-0"
                 >
                    Plantas extra Semente 🌱
                 </button>
              </div>

           </div>
        </div>
      )}

      {showReferral && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 md:p-6" onClick={() => setShowReferral(false)}>
           <div className="bg-stone-950 border border-stone-800 w-full max-w-md p-6 rounded-[2.5rem] relative shadow-2xl flex flex-col space-y-6" onClick={e=>e.stopPropagation()}>
              
              <div className="flex justify-between items-center pb-2 border-b border-stone-900">
                 <div className="flex items-center space-x-2 text-stone-200">
                    <Heart className="w-5 h-5 text-red-500 fill-red-500/20" />
                    <h3 className="font-serif text-lg tracking-wider uppercase">{text?.referral?.title}</h3>
                 </div>
                 <button onClick={() => setShowReferral(false)} className="text-stone-500 hover:text-stone-200 transition-colors p-2 hover:bg-stone-900 rounded-full">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="space-y-4">
                 <p className="text-xs text-stone-400 font-light leading-relaxed">
                    {text?.referral?.text}
                 </p>

                 {/* Brazil Resources mapping */}
                 <div className="p-4 bg-stone-900/40 border border-stone-800 rounded-xl space-y-3">
                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">CVV - Centro de Valorização da Vida</span>
                       <span className="text-[11px] text-stone-300 font-medium leading-relaxed mt-0.5">Ligue 188 ou converse pelo chat online em cvv.org.br. Suporte emocional ético, anônimo e gratuito 24h.</span>
                    </div>

                    <div className="w-full h-[1px] bg-stone-800/80" />

                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-teal-400 uppercase tracking-widest">Plataforma e-Psi (Conselho de Psicologia)</span>
                       <span className="text-[11px] text-stone-300 font-medium leading-relaxed mt-0.5">Consulte diretórios éticos nacionais certificados para atendimento psicológico online seguro em e-psi.cfp.org.br.</span>
                    </div>

                    <div className="w-full h-[1px] bg-stone-800/80" />

                    <div className="flex flex-col">
                       <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">Helplines Globais</span>
                       <span className="text-[11px] text-stone-300 font-medium leading-relaxed mt-0.5">Se estiver fora do país, use crisis text line mandando "HOME" para 741741 (EUA/Londres) ou befrienders.org.</span>
                    </div>
                 </div>
              </div>

              <button 
                onClick={() => setShowReferral(false)} 
                className="w-full py-3 bg-stone-200 hover:bg-white text-stone-900 text-xs font-bold uppercase tracking-widest rounded"
              >
                 Voltar para a Voz Interior
              </button>

           </div>
        </div>
      )}

      {/* Main Bottom Control Deck with clean modular alignments */}
      <div className={`flex flex-col items-center space-y-4 w-full pb-3 md:pb-6 z-30 transition-all duration-[2000ms] ${isRestMode ? 'opacity-40 hover:opacity-100' : 'opacity-100'}`}>
        <div className="flex items-center justify-between w-[95vw] sm:w-[90vw] max-w-xl p-3 bg-stone-900/60 backdrop-blur-xl border border-stone-800 rounded-full shadow-2xl">
            
            {/* Left Buttons Group */}
            <div className="flex items-center space-x-1">
               <button 
                 onClick={() => setShowGarden(true)} 
                 className="p-3 text-stone-400 hover:text-emerald-400 transition-colors group relative" 
                 title="Jardim Interior"
               >
                  <Sprout className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-stone-950 text-[7px] w-4 h-4 rounded-full flex items-center justify-center font-bold font-mono">
                     {gardenPlants.length}
                  </span>
               </button>
               
               <button 
                 onClick={() => setShowSettings(!showSettings)} 
                 className="p-3 text-stone-400 hover:text-stone-200 transition-colors" 
                 title="Ajustes"
               >
                  <SettingsIcon className="w-5 h-5" />
               </button>
            </div>
            
            {/* Main Central Mic Action */}
            <button 
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
                  isMicMuted 
                  ? 'bg-red-950/20 border border-red-900/30 text-red-500 hover:bg-red-950/40' 
                  : 'bg-stone-800 border border-stone-600 text-stone-200 shadow-lg shadow-teal-500/10 hover:border-teal-500/80 hover:shadow-teal-500/20'
                }`}
            >
                {isMicMuted ? <MicOffIcon className="w-6 h-6 animate-pulse" /> : <MicIcon className="w-6 h-6" />}
            </button>

            {/* Right Buttons Group */}
            <div className="flex items-center space-x-1">
               <button 
                 onClick={() => setShowReferral(true)} 
                 className="p-3 text-stone-400 hover:text-red-400 transition-colors" 
                 title="Apoio Humano"
               >
                  <Heart className="w-5 h-5" />
               </button>

               <button 
                 onClick={onDisconnect} 
                 className="px-4 py-2.5 bg-stone-950/40 hover:bg-red-950/10 hover:border-red-900/30 border border-transparent text-stone-400 hover:text-red-400 transition-colors text-[9px] uppercase tracking-widest font-black rounded-full"
               >
                 Sair
               </button>
            </div>
        </div>
      </div>

      {/* Settings Modal (Adjustments Panel) */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 md:p-6" onClick={() => setShowSettings(false)}>
           <div className="bg-stone-950 border border-stone-800 w-full max-w-md p-6 rounded-[2.5rem] relative shadow-2xl flex flex-col space-y-5" onClick={e=>e.stopPropagation()}>
              
              <div className="flex justify-between items-center pb-2 border-b border-stone-900">
                 <div className="flex items-center space-x-2 text-stone-200">
                    <SettingsIcon className="w-5 h-5 text-teal-400" />
                    <h3 className="font-serif text-lg tracking-wider uppercase">{lang === 'pt' ? 'Ajustes de Sessão' : 'Session Settings'}</h3>
                 </div>
                 <button onClick={() => setShowSettings(false)} className="text-stone-500 hover:text-stone-200 transition-colors p-2 hover:bg-stone-900 rounded-full">
                    <X className="w-5 h-5" />
                 </button>
              </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
                 
                 {/* Modo Repouso section */}
                 <div className="p-4 bg-stone-900/30 border border-stone-800 rounded-xl flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                       <div className="flex items-center space-x-2">
                          <Moon className={`w-4 h-4 ${isRestMode ? 'text-amber-400 fill-amber-400/10' : 'text-stone-400'}`} />
                          <span className="text-xs font-bold text-stone-200 uppercase tracking-widest">{lang === 'pt' ? 'Modo Repouso' : 'Rest Mode'}</span>
                       </div>
                       <button
                          onClick={() => {
                             const newVal = !isRestMode;
                             setIsRestMode(newVal);
                             localStorage.setItem('pch_is_rest_mode', newVal ? 'true' : 'false');
                          }}
                          className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 ${isRestMode ? 'bg-amber-500' : 'bg-stone-850'}`}
                       >
                          <div className={`bg-stone-950 w-4 h-4 rounded-full shadow-md transform duration-300 ${isRestMode ? 'translate-x-5' : 'translate-x-0'}`} />
                       </button>
                    </div>
                    <p className="text-[10px] text-stone-500 leading-relaxed font-light">
                       {lang === 'pt' 
                          ? 'Foca no respirador e visualizador ao atenuar a opacidade do painel secundário e silenciar os avisos de fala.' 
                          : 'Dims the active layouts and silences minor spoken triggers to help you drift deeper into pure meditation.'}
                    </p>
                 </div>

                 {/* Ambiente Sonoro section */}
                 <div className="p-4 bg-stone-900/30 border border-stone-800 rounded-xl flex flex-col space-y-3">
                    <div className="flex items-center space-x-2">
                       <Volume2 className="w-4 h-4 text-teal-400" />
                       <span className="text-xs font-bold text-stone-200 uppercase tracking-widest">{lang === 'pt' ? 'Ambiente Sonoro' : 'Sound Atmosphere'}</span>
                    </div>
                    
                    {/* Select Atmosphere */}
                    <div className="grid grid-cols-4 gap-1.5 p-1 bg-stone-950 border border-stone-900 rounded-lg">
                       {(['off', 'rain', 'waves', 'forest'] as const).map(soundType => (
                          <button
                             key={soundType}
                             onClick={() => {
                                setAmbientSound(soundType);
                                localStorage.setItem('pch_ambient_sound', soundType);
                             }}
                             className={`py-1.5 rounded text-[9px] font-mono uppercase tracking-widest transition-all ${
                                ambientSound === soundType 
                                ? 'bg-teal-950/20 text-teal-300 font-bold border border-teal-900/30' 
                                : 'text-stone-500 hover:text-stone-300 border border-transparent'
                             }`}
                          >
                             {soundType === 'off' && (lang === 'pt' ? 'Off' : 'Off')}
                             {soundType === 'rain' && (lang === 'pt' ? 'Chuva' : 'Rain')}
                             {soundType === 'waves' && (lang === 'pt' ? 'Ondas' : 'Waves')}
                             {soundType === 'forest' && (lang === 'pt' ? 'Mata' : 'Forest')}
                          </button>
                       ))}
                    </div>

                    {/* Ambient Volume slider */}
                    {ambientSound !== 'off' && (
                       <div className="flex flex-col space-y-1">
                          <div className="flex justify-between items-center text-[9px] text-stone-500 uppercase tracking-widest">
                             <span>{lang === 'pt' ? 'Volume do Ambiente' : 'Atmosphere Volume'}</span>
                             <span>{Math.round(ambientVolume * 100)}%</span>
                          </div>
                          <input 
                             type="range"
                             min="0"
                             max="1"
                             step="0.05"
                             value={ambientVolume}
                             onChange={(e) => {
                                const v = parseFloat(e.target.value);
                                setAmbientVolume(v);
                                localStorage.setItem('pch_ambient_volume', v.toString());
                             }}
                             className="w-full accent-teal-500 bg-stone-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                          />
                       </div>
                    )}
                 </div>

                 {/* Sensibilidade do Microfone */}
                 <div className="p-4 bg-stone-900/30 border border-stone-800 rounded-xl flex flex-col space-y-1.5">
                    <div className="flex justify-between items-center text-xs text-stone-300 uppercase tracking-widest font-black">
                       <span>{lang === 'pt' ? 'Sensibilidade de Voz' : 'Voice Threshold'}</span>
                       <span className="font-mono text-[10px] text-stone-500">{(MAX_SENSITIVITY_RANGE - inputSensitivity).toFixed(3)}</span>
                    </div>
                    <input 
                       type="range"
                       min="0.002"
                       max={MAX_SENSITIVITY_RANGE}
                       step="0.005"
                       value={MAX_SENSITIVITY_RANGE - inputSensitivity}
                       onChange={(e) => setInputSensitivity(MAX_SENSITIVITY_RANGE - parseFloat(e.target.value))}
                       className="w-full accent-teal-500 bg-stone-800 h-1 rounded cursor-pointer"
                    />
                    <span className="text-[8px] text-stone-500 leading-relaxed font-light">
                       {lang === 'pt' ? 'Reduza se capturar muitos ruídos ou barulho ambiente.' : 'Lower if ambient noise triggers speech response automatically.'}
                    </span>
                 </div>

                 {/* Ajustes de Voz (Pitch & Rate) */}
                 <div className="p-4 bg-stone-900/30 border border-stone-800 rounded-xl flex flex-col space-y-3.5">
                    <span className="text-xs font-bold text-stone-200 uppercase tracking-widest">{lang === 'pt' ? 'Opções de Voz da IA' : 'AI Speech Options'}</span>
                    
                    {/* Voice Select */}
                    <div className="flex flex-col space-y-2">
                       <span className="text-[10px] text-stone-500 uppercase tracking-widest">{lang === 'pt' ? 'Voz do Guia' : 'Guide Voice'}</span>
                       <div className="grid grid-cols-2 gap-1.5 p-1 bg-stone-950 border border-stone-900 rounded-xl">
                          {(['essencia', 'esperanca', 'serenidade', 'infantil', 'sabedoria'] as const).map((vKey) => (
                             <button
                                key={vKey}
                                onClick={() => setVoice(vKey)}
                                className={`px-2 py-1.5 text-[8px] font-mono uppercase tracking-widest rounded-lg border transition-all ${
                                   voice === vKey 
                                   ? 'bg-teal-950/30 border-teal-500/40 text-teal-300 font-bold' 
                                   : 'bg-transparent border-transparent text-stone-500 hover:text-stone-300'
                                }`}
                             >
                                {text?.settings?.[`voice_${vKey}`] || vKey}
                             </button>
                          ))}
                       </div>
                    </div>

                    {/* Speed Rate Slider */}
                    <div className="flex flex-col space-y-1">
                       <div className="flex justify-between items-center text-[9px] text-stone-500 uppercase tracking-widest">
                          <span>{lang === 'pt' ? 'Velocidade' : 'Speed'}</span>
                          <span>{speechRate.toFixed(1)}x</span>
                       </div>
                       <input 
                          type="range"
                          min="0.6"
                          max="1.4"
                          step="0.1"
                          value={speechRate}
                          onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                          className="w-full accent-teal-500 h-1.5 rounded-lg border-transparent appearance-none bg-stone-850 cursor-pointer"
                       />
                    </div>
                 </div>

                 {/* Conexão Trilha Diária / Gamificação */}
                 <div className="p-4 bg-stone-900/30 border border-stone-800 rounded-xl flex flex-col space-y-2">
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-bold text-stone-200 uppercase tracking-widest">{lang === 'pt' ? 'Jornada Diária' : 'Daily Journey'}</span>
                       <span className="text-xs font-mono font-bold text-teal-400">
                          {conversationsCompleted === 3 ? (lang === 'pt' ? 'Concluída!' : 'Completed!') : `${conversationsCompleted}/3`}
                       </span>
                    </div>
                    
                    <div className="w-full h-1.5 bg-stone-950 rounded-full overflow-hidden">
                       <div 
                          className={`h-full transition-all duration-1000 ${conversationsCompleted === 3 ? 'bg-teal-400' : 'bg-teal-600'}`}
                          style={{ width: `${(conversationsCompleted / 3) * 100}%` }}
                       />
                    </div>

                    <div className="flex justify-between items-center pt-1.5">
                       <span className="text-[9px] text-stone-500 leading-snug max-w-[200px] font-light">
                          {lang === 'pt' 
                             ? 'Complete 3 conversas hoje para florescer o seu espírito.'
                             : 'Complete 3 conversations today to nourish your inner growth.'}
                       </span>
                       
                       <button
                          onClick={() => {
                             incrementConversations();
                          }}
                          disabled={conversationsCompleted >= 3}
                          className="text-[9px] py-1 px-2.5 border border-teal-900/40 hover:border-teal-500 text-teal-400 hover:bg-teal-950/20 active:scale-95 disabled:opacity-30 disabled:border-stone-850 disabled:text-stone-600 transition-all font-mono uppercase rounded-full tracking-wider"
                       >
                          {lang === 'pt' ? 'Simular +1' : 'Simulate +1'}
                       </button>
                    </div>
                 </div>

              </div>

              <button 
                 onClick={() => setShowSettings(false)} 
                 className="w-full py-3 bg-stone-200 hover:bg-white text-stone-900 text-xs font-bold uppercase tracking-widest rounded"
              >
                 {lang === 'pt' ? 'Confirmar Ajustes' : 'Confirm Settings'}
              </button>

           </div>
        </div>
      )}

      {/* Confetti Animation Layer */}
      {showCelebration && (
        <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
          <style>{`
            @keyframes fall {
              0% { transform: translateY(-20px) rotate(0deg); opacity: 0; }
              10% { opacity: 1; }
              90% { opacity: 1; }
              100% { transform: translateY(105vh) rotate(360deg); opacity: 0; }
            }
            .animate-fall {
              animation: fall linear infinite;
            }
          `}</style>
          {[...Array(50)].map((_, i) => {
            const delay = Math.random() * 5;
            const left = Math.random() * 100;
            const size = Math.random() * 6 + 4;
            const color = ['bg-yellow-400', 'bg-teal-400', 'bg-emerald-400', 'bg-amber-400', 'bg-rose-400'][Math.floor(Math.random() * 5)];
            return (
              <div 
                key={i}
                className={`absolute rounded-full filter blur-[1px] animate-fall ${color}`}
                style={{
                  left: `${left}%`,
                  top: `-20px`,
                  width: `${size}px`,
                  height: `${size}px`,
                  animationDelay: `${delay}s`,
                  animationDuration: `${Math.random() * 5 + 3}s`,
                  opacity: Math.random() * 0.8 + 0.2
                }}
              />
            );
          })}
          <div className="absolute inset-x-8 top-1/4 bg-teal-950/40 backdrop-blur-md border border-teal-500/20 p-6 rounded-[2rem] text-center shadow-2xl z-50 max-w-sm mx-auto flex flex-col items-center">
             <button
                onClick={() => setShowCelebration(false)}
                className="absolute top-3 right-3 text-teal-400/50 hover:text-teal-400 p-1 pointer-events-auto"
             >
                <X className="w-4 h-4" />
             </button>
             <Award className="w-12 h-12 text-yellow-400 animate-bounce mb-2" />
             <h3 className="font-serif text-lg tracking-widest text-teal-300 uppercase select-none">{lang === 'pt' ? 'Mente Expandida!' : 'Consciousness Aligned!'}</h3>
             <p className="text-[10px] text-stone-300 font-mono mt-1.5 leading-relaxed">
                {lang === 'pt' 
                   ? 'Missão diária de 3 conversas concluída com sucesso!'
                   : 'Daily mission of 3 sessions has been beautifully synchronized!'}
             </p>
          </div>
        </div>
      )}

    </div>
  );
};

export default SessionManager;
