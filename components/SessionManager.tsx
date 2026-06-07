import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI, LiveServerMessage, Modality, Type } from '@google/genai';
import { SessionStatus, Language, UserPlan, User, NeurodivergentMode, GardenPlant } from '../types';
import { getSystemInstruction, MODEL_NAME, TRANSLATIONS, VOICE_IDS, PLAN_LIMITS, WISDOM_QUOTES } from '../constants';
import AudioVisualizer from './AudioVisualizer';
import Logo from './Logo';
import { ImmersiveVisualEngine } from './ImmersiveVisualEngine';
import { 
  Sprout, Heart, Droplet, Flower, AlertCircle, Compass, Sparkles, 
  Eye, EyeOff, Moon, Sun, Activity, Info, X, ChevronRight, CheckCircle2,
  Bookmark, ShieldAlert, Award, Volume2, HelpCircle, Gauge, Shield, Brain,
  HeartHandshake
} from 'lucide-react';
import { MoodConstellation } from './MoodConstellation';
import { AdaptiveProfileCard } from './AdaptiveProfileCard';
import { BreathingGuide } from './BreathingGuide';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, doc, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { useMotorAdaptativo } from '../hooks/useMotorAdaptativo';
import { PainelDaVozAtivo } from './PainelDaVozAtivo';

interface SessionManagerProps {
  onDisconnect: () => void;
  lang: Language;
  userPlan: UserPlan;
  onUpgrade: () => void;
  currentUser?: User | null;
  isMinimalMode?: boolean;
  onToggleMinimalMode?: () => void;
  impersonatedUser?: User | null;
  onClearImpersonation?: () => void;
  isFullyImmersive?: boolean;
  onToggleFullyImmersive?: () => void;
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

const Particle: React.FC<{ delay: number; x: number }> = ({ delay, x }) => {
  return (
    <motion.div
      initial={{ y: '100vh', opacity: 0, scale: 0.5 }}
      animate={{ 
        y: '-10vh', 
        opacity: [0, 1, 1, 0], 
        scale: [0.5, 1.2, 0.8],
        x: [x, x + (Math.sin(delay) * 40)] 
      }}
      transition={{ duration: 4.5, delay: delay, repeat: Infinity, ease: 'easeOut' }}
      className="absolute text-teal-400/80 select-none pointer-events-none fill-current z-[100] font-mono text-lg"
      style={{ left: `${x}%` }}
    >
      ✦
    </motion.div>
  );
};

const SessionManager: React.FC<SessionManagerProps> = ({  
  onDisconnect, 
  lang, 
  userPlan, 
  onUpgrade, 
  currentUser,
  isMinimalMode = false,
  onToggleMinimalMode,
  impersonatedUser,
  onClearImpersonation,
  isFullyImmersive = false,
  onToggleFullyImmersive
}) => {
  const [status, setStatus] = useState<SessionStatus>(SessionStatus.CONNECTING);
  const [showPainelVoz, setShowPainelVoz] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [speechRecError, setSpeechRecError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);
  const [isUserSpeaking, setIsUserSpeaking] = useState(false);
  const [isAiSpeaking, setIsAiSpeaking] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [inputSensitivity, setInputSensitivity] = useState(0.01);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'calibration' | 'overview'>('calibration');
  const [voice, setVoice] = useState<'essencia' | 'esperanca' | 'serenidade' | 'infantil' | 'sabedoria'>('essencia');
  const [voicePitch, setVoicePitch] = useState(1.0);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [voicePersona, setVoicePersona] = useState<'natural' | 'elder' | 'supporter' | 'poet' | 'playful' | 'custom'>('natural');
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [browserVoices, setBrowserVoices] = useState<any[]>([]);

  // Load available speech synthesis voices
  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setBrowserVoices(voices);
    };

    loadVoices();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Update speed/pitch based on voicePersona Selection
  useEffect(() => {
    if (voicePersona === 'natural') {
      setVoicePitch(1.0);
      setSpeechRate(1.0);
    } else if (voicePersona === 'elder') {
      setVoicePitch(0.75);
      setSpeechRate(0.82);
    } else if (voicePersona === 'supporter') {
      setVoicePitch(1.15);
      setSpeechRate(1.05);
    } else if (voicePersona === 'poet') {
      setVoicePitch(0.95);
      setSpeechRate(0.85);
    } else if (voicePersona === 'playful') {
      setVoicePitch(1.35);
      setSpeechRate(1.2);
    }
  }, [voicePersona]);

  // States for Adaptive Consciousness additions
  const [neuroMode, setNeuroMode] = useState<NeurodivergentMode>('natural');
  const [activePanelTab, setActivePanelTab] = useState<'padrao' | 'neutro' | 'frequencia' | 'velocidade' | 'seguranca' | 'habilidade'>('padrao');

  useEffect(() => {
    if (neuroMode === 'natural') {
      setActivePanelTab('padrao');
    } else if (neuroMode === 'anxiety' || neuroMode === 'inclusive') {
      setActivePanelTab('seguranca');
    } else if (['adhd', 'autism', 'dyslexia', 'senior', 'child', 'down', 'gifted', 'burnout', 'grief'].includes(neuroMode)) {
      setActivePanelTab('habilidade');
    }
  }, [neuroMode]);

  const [customSystemPrompt, setCustomSystemPrompt] = useState<string>('');
  const [selectedFeeling, setSelectedFeeling] = useState<string | null>(null);
  const [selectedMetaphor, setSelectedMetaphor] = useState<string | null>(null);
  
  // Dynamically pull configuration from adaptive motor based on preferences (neurotype and emotional state)
  const adaptivoConfig = useMotorAdaptativo(neuroMode, selectedFeeling || undefined);

  // Sync vocal rates from adaptive system automatically
  useEffect(() => {
    if (voicePersona !== 'custom') {
      setSpeechRate(adaptivoConfig.voiceRate);
      setVoicePitch(adaptivoConfig.voicePitch);
    }
  }, [adaptivoConfig, voicePersona]);
  const [showReferral, setShowReferral] = useState(false);
  const [showGarden, setShowGarden] = useState(false);
  const [gardenPlants, setGardenPlants] = useState<GardenPlant[]>([]);

  // Adaptive Journey States
  const [autismTab, setAutismTab] = useState<'talk' | 'breath' | 'register' | 'rest'>('talk');
  const [childFeeling, setChildFeeling] = useState<string | null>(null);
  const [burnoutEnergy, setBurnoutEnergy] = useState<number>(50);
  const [griefRemembrance, setGriefRemembrance] = useState<boolean>(false);

  // Celebration States
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'level' | 'badge' | 'none'>('none');
  const [unlockedItemName, setUnlockedItemName] = useState('');
  const [isSavingSnapshot, setIsSavingSnapshot] = useState<boolean>(false);

  const analyzeTranscriptAndAppendSnapshot = async () => {
    const transcript = sessionTranscriptRef.current.trim();
    if (transcript.length < 15) {
      console.log("Transcript too short to extract sentiment:", transcript.length);
      return;
    }

    try {
      if (!process.env.API_KEY) throw new Error("API Key Missing.");
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
Analyze the following therapeutic conversation transcript between the User and Dr. Evaldo (PCH voice therapeutic guide).
Determine the emotional tone, sentiment, and core issues discussed.

Transcript:
${transcript}

Return a JSON object with:
1. sentimentTags: An array of strings containing matching sentiment IDs. Pick 1 to 3 tags that describe the user's emotional state in this session. Choose ONLY from these valid IDs: ['embraced', 'serene', 'inspired', 'anxious', 'connected', 'flowing', 'grounded'].
2. summary: A highly empathetic and brief paragraph (3-4 sentences) summarizing the interaction, the emotional trajectory, and the insights explored during the session. Write in the same language as the transcript (${lang === 'pt' ? 'Portuguese' : 'English'}).
3. insight: A gentle, uplifting poetic-cognitive reframing or suggestion tailored to the user's emotional state, following the therapeutic style of Dr. Evaldo Poeta. Write in the same language as the transcript (${lang === 'pt' ? 'Portuguese' : 'English'}).
`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sentimentTags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of mood tags from: ['embraced', 'serene', 'inspired', 'anxious', 'connected', 'flowing', 'grounded']"
              },
              summary: {
                type: Type.STRING,
                description: "An empathetic paragraph summarizing the interaction."
              },
              insight: {
                type: Type.STRING,
                description: "Uplifting poetic-cognitive reframing tailored to the user."
              }
            },
            required: ["sentimentTags", "summary", "insight"]
          }
        }
      });

      const resultText = response.text?.trim();
      if (!resultText) throw new Error("Empty response from sentiment analysis.");

      const parsed = JSON.parse(resultText);
      const { sentimentTags = [], summary = "", insight = "" } = parsed;

      const titleStr = lang === 'pt' ? 'Snapshot de Sessão' : 'Session Snapshot';
      const combinedText = `${summary}\n\n**${lang === 'pt' ? 'Lampejo Poético' : 'Uplifting Poetic Insight'}:**\n${insight}`;

      const entryId = Date.now().toString();
      const newEntry = {
        id: entryId,
        date: new Date().toISOString(),
        text: combinedText,
        prompt: titleStr,
        moodTags: sentimentTags.filter((t: string) => ['embraced', 'serene', 'inspired', 'anxious', 'connected', 'flowing', 'grounded'].includes(t)),
        quickNote: lang === 'pt' ? 'Voz Interior PCH • Relato da Sessão' : 'Inner Voice PCH • Session Snapshot'
      };

      const cUser = auth.currentUser;
      if (cUser) {
        try {
          const docRef = doc(db, 'users', cUser.uid, 'journals', entryId);
          await setDoc(docRef, {
            ...newEntry,
            userId: cUser.uid
          });
          console.log("Session Snapshot saved to Firestore successfully!");
        } catch (err) {
          handleFirestoreError(err, OperationType.WRITE, `users/${cUser.uid}/journals/${entryId}`);
        }
      } else {
        const stored = localStorage.getItem('pch_journal_entries');
        let localEntries = [];
        if (stored) {
          try {
            localEntries = JSON.parse(stored);
          } catch (e) {
            console.error(e);
          }
        }
        const updated = [newEntry, ...localEntries];
        localStorage.setItem('pch_journal_entries', JSON.stringify(updated));
        console.log("Session Snapshot saved to LocalStorage successfully!");
      }

    } catch (e) {
      console.error("Failed to capture/append session sentiment snapshot:", e);
    }
  };

  const handlePreDisconnect = async () => {
    setIsSavingSnapshot(true);
    await analyzeTranscriptAndAppendSnapshot();
    setIsSavingSnapshot(false);

    if (currentUser) {
      const oldPoints = currentUser.points || 0;
      const rewardPoints = elapsedSeconds > 45 ? 60 : 35;
      const newPoints = oldPoints + rewardPoints;
      
      const oldLevel = currentUser.level || 1;
      const newLevel = Math.floor(newPoints / 100) + 1;
      
      const oldBadges = currentUser.badges || [];
      
      let badgeEarned = '';
      if (newPoints >= 100 && !oldBadges.includes('Sintonizador de Emoções') && !oldBadges.includes('Emotion Tuner')) {
        badgeEarned = lang === 'pt' ? 'Sintonizador de Emoções' : 'Emotion Tuner';
      } else if (newPoints >= 250 && !oldBadges.includes('Explorador da Calma') && !oldBadges.includes('Calm Explorer')) {
        badgeEarned = lang === 'pt' ? 'Explorador da Calma' : 'Calm Explorer';
      } else if (newPoints >= 500 && !oldBadges.includes('Sábio do Silêncio') && !oldBadges.includes('Silence Sage')) {
        badgeEarned = lang === 'pt' ? 'Sábio do Silêncio' : 'Silence Sage';
      }

      if (newLevel > oldLevel) {
        setCelebrationType('level');
        setUnlockedItemName(newLevel.toString());
        setShowCelebration(true);
      } else if (badgeEarned) {
        setCelebrationType('badge');
        setUnlockedItemName(badgeEarned);
        setShowCelebration(true);
      } else {
        onDisconnect();
      }
    } else {
      onDisconnect();
    }
  };
  const [showWaterEffect, setShowWaterEffect] = useState<string | null>(null);
  const [voiceAlert, setVoiceAlert] = useState<string | null>(null);

  // States for 5-camadas core PCH processing system
  const [activeLayer, setActiveLayer] = useState<number>(0);
  const [detectedEmotion, setDetectedEmotion] = useState<{ emotion: string; intensity: number } | null>(null);
  const [visualAnchor, setVisualAnchor] = useState<'neutral' | 'heavy' | 'reflective' | 'light'>('neutral');
  const [selectedRegionTab, setSelectedRegionTab] = useState<'campo' | 'floresta' | 'lago' | 'montanha' | 'constelacao'>('campo');

  // New States: Rest Mode, Ambient Sound, and Gamification
  const [ambientSound, setAmbientSound] = useState<'off' | 'rain' | 'forest' | 'waves' | 'deepspace'>(() => {
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
  const updateAmbientSynth = useCallback((type: 'off' | 'rain' | 'forest' | 'waves' | 'deepspace', volumeVal: number) => {
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
      } else if (type === 'deepspace') {
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(130, ctx.currentTime);
        filter.Q.setValueAtTime(1.8, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.04, ctx.currentTime); // 25s waves of deep space filter sweep

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(45, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);
        lfo.start(0);

        natureSynthRef.current.lfoNode = lfo;
        natureSynthRef.current.lfoGain = lfoGain;
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
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSessionRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  const [speechTranscript, setSpeechTranscript] = useState<string>('');
  const [isSpeechRecognitionRunning, setIsSpeechRecognitionRunning] = useState<boolean>(false);
  
  const [aiSpeechText, setAiSpeechText] = useState<string>('');
  const accumulatedTextRef = useRef<string>('');

  const speechQueueRef = useRef<string[]>([]);
  const isSpeakingActiveRef = useRef<boolean>(false);
  const unspokenChunkRef = useRef<string>('');
  const sessionTranscriptRef = useRef<string>('');

  const clearSpeechQueue = useCallback(() => {
    speechQueueRef.current = [];
    unspokenChunkRef.current = '';
    isSpeakingActiveRef.current = false;
    setIsAiSpeaking(false);
    setAiSpeechText('');
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn("Cancel speech synthesis failed:", e);
      }
    }
  }, []);

  const speechRateRef = useRef(speechRate);
  const voicePitchRef = useRef(voicePitch);
  const selectedVoiceURIRef = useRef(selectedVoiceURI);
  const langRef = useRef(lang);

  useEffect(() => { speechRateRef.current = speechRate; }, [speechRate]);
  useEffect(() => { voicePitchRef.current = voicePitch; }, [voicePitch]);
  useEffect(() => { selectedVoiceURIRef.current = selectedVoiceURI; }, [selectedVoiceURI]);
  useEffect(() => { langRef.current = lang; }, [lang]);

  const triggerNextSpeech = useCallback(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (isSpeakingActiveRef.current) return;
    if (speechQueueRef.current.length === 0) {
      return;
    }

    const textToSpeak = speechQueueRef.current.shift();
    if (!textToSpeak) return;

    isSpeakingActiveRef.current = true;
    setIsAiSpeaking(true);

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = langRef.current === 'pt' ? 'pt-BR' : 'en-US';
    utterance.rate = Math.max(0.5, Math.min(2.0, speechRateRef.current));
    utterance.pitch = Math.max(0.5, Math.min(2.0, voicePitchRef.current));

    const voices = window.speechSynthesis.getVoices();
    let preferredVoice = null;
    if (selectedVoiceURIRef.current) {
      preferredVoice = voices.find(v => v.voiceURI === selectedVoiceURIRef.current);
    }
    if (!preferredVoice) {
      if (langRef.current === 'pt') {
        preferredVoice = voices.find(v => v.lang.startsWith('pt') && v.name.toLowerCase().includes('google')) || 
                         voices.find(v => v.lang.startsWith('pt'));
      } else {
        preferredVoice = voices.find(v => v.lang.startsWith('en') && v.name.toLowerCase().includes('google')) || 
                         voices.find(v => v.lang.startsWith('en'));
      }
    }
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      isSpeakingActiveRef.current = false;
      setTimeout(() => {
        triggerNextSpeech();
      }, 50);
    };

    utterance.onerror = (e) => {
      console.error("Queue Speech Synthesis error:", e);
      isSpeakingActiveRef.current = false;
      setTimeout(() => {
        triggerNextSpeech();
      }, 50);
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const speakWithWebSpeech = useCallback((textToSpeak: string) => {
    clearSpeechQueue();
    if (!textToSpeak.trim()) return;
    speechQueueRef.current = [textToSpeak];
    triggerNextSpeech();
  }, [clearSpeechQueue, triggerNextSpeech]);

  const isMicMutedRef = useRef(isMicMuted);
  const inputSensitivityRef = useRef(inputSensitivity);

  useEffect(() => {
    isMicMutedRef.current = isMicMuted;
  }, [isMicMuted]);

  useEffect(() => {
    inputSensitivityRef.current = inputSensitivity;
  }, [inputSensitivity]);

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
      streamRef.current.getTracks().forEach(track => {
        try { track.stop(); } catch (e) {}
      });
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        console.warn("Error closing AudioContext", e);
      }
    }
    if (inputAudioContextRef.current && inputAudioContextRef.current.state !== 'closed') {
      try {
        inputAudioContextRef.current.close();
      } catch (e) {
        console.warn("Error closing input AudioContext", e);
      }
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
        recognitionRef.current = null;
      } catch (e) {
        console.warn("Error stopping speech recognition in cleanup", e);
      }
    }
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        console.warn("Error cancelling speech synthesis in cleanup", e);
      }
    }
  }, []);

  const connectToGemini = useCallback(async () => {
    try {
      cleanupAudio();
      sessionTranscriptRef.current = '';
      setStatus(SessionStatus.CONNECTING);

      if (!process.env.API_KEY) throw new Error("API Key Missing.");
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, apiVersion: 'v1alpha' });
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = audioCtx;

      let mediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      } catch (micErr: any) {
        console.error("Microphone access denied:", micErr);
        const permMsg = lang === 'pt' 
          ? "Acesso ao microfone negado ou não permitido. Por favor, libere as permissões do microfone nas configurações de segurança do seu navegador (clique no cadeado ao lado da barra de endereço) e tente novamente."
          : "Microphone access denied or blocked. Please grant microphone permissions in your browser's security/site settings (click the lock icon next to the address bar) and click Retry.";
        throw new Error(permMsg);
      }
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

      // Detect if the mood/neurodivergent profile or selected feeling matches anxiety or burnout
      const isAnxietyOrBurnout = 
        neuroMode === 'anxiety' || 
        neuroMode === 'burnout' || 
        (selectedFeeling && (
          selectedFeeling.toLowerCase().includes('ansiedade') || 
          selectedFeeling.toLowerCase().includes('anxiety') || 
          selectedFeeling.toLowerCase().includes('burnout') ||
          selectedFeeling.toLowerCase().includes('acelerado') ||
          selectedFeeling.toLowerCase().includes('heavy') ||
          selectedFeeling.toLowerCase().includes('pesado') ||
          selectedFeeling.toLowerCase().includes('triste') ||
          selectedFeeling.toLowerCase().includes('sad') ||
          selectedFeeling.toLowerCase().includes('irritado') ||
          selectedFeeling.toLowerCase().includes('angry')
        ));

      let autonomicCoRegulationPrompt = "";
      if (isAnxietyOrBurnout) {
        autonomicCoRegulationPrompt = lang === 'pt'
          ? `\n\n**MICRO-AJUSTE PARA CO-REGULAÇÃO AUTONÔMICA (SINALIZAÇÃO DE ANSIEDADE/ESTRESSE/BURNOUT):**
          Foi detectado um estado elevado de ansiedade, estresse, agitação ou esgotamento (burnout). Para guiar o sistema nervoso do usuário em direção à segurança e autorregulação através da sua voz:
          - Reduza visivelmente o seu tom de voz (fale com um tom mais grave, calmo, aconchegante e profundo).
          - Aumente significativamente a duração de todas as pausas entre as frases para criar espaços de respiração e processamento calmo.
          - Use um ritmo de fala consideravelmente mais desacelerado, constante e compassivo. Deixe claras as pausas entre seus pensamentos/orações.`
          : `\n\n**VOICE MICRO-ADJUSTMENT FOR AUTONOMIC CO-REGULATION (ANXIETY/STRESS/BURNOUT SIGNALS):**
          An elevated state of anxiety, speed, agitation, or stress/burnout has been detected. To coach and guide the user's autonomic nervous system toward safety, harmony, and co-regulation:
          - Noticeably lower your vocal pitch/tone (speak with a deeper, calmer, and more soothing quality).
          - Significantly extend the duration of pauses between sentences/phrases to create room for breathing, assimilation, and processing.
          - Adopt a considerably slowed-down, steady, and highly comforting pace. Make the transitions between ideas fully spatial and peaceful.`;
      }

      // Get instruction combining base, accessibility, and the target neurodiversity instructions
      const lastContext = selectedFeeling ? `${lang === 'pt' ? 'Me sinto assim: ' : 'I feel like: '}${selectedFeeling}` : undefined;
      const baseInstruction = customSystemPrompt || getSystemInstruction(lang, currentTime, accMode, neuroMode, lastContext);
      const instruction = baseInstruction + voiceInstruction + autonomicCoRegulationPrompt;

      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_IDS[voice] } },
          },
          systemInstruction: {
            parts: [{ text: instruction }]
          },
        },
        callbacks: {
          onopen: () => {
            setStatus(SessionStatus.CONNECTED);
            setShowPainelVoz(true);
            // Trigger customized greeting if a feeling or metaphor is pre-selected
            if (selectedFeeling || selectedMetaphor) {
              const greetStr = selectedFeeling 
                ? (lang === 'pt' ? `Olá Dr. Evaldo, hoje eu me sinto: ${selectedFeeling}` : `Hello Dr. Evaldo, today I feel: ${selectedFeeling}`)
                : (lang === 'pt' ? `Dr. Evaldo, me sinto mudo e escolhi o símbolo: ${selectedMetaphor}` : `Dr. Evaldo, I am wordless and chose the symbol: ${selectedMetaphor}`);
              
              sessionTranscriptRef.current += `\nUser: ${greetStr}`;

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
            // 1. Process text parts from the AI turn for Web Speech Synthesis & UI display
            const parts = message.serverContent?.modelTurn?.parts;
            if (parts) {
              for (const part of parts) {
                if (part.text) {
                  accumulatedTextRef.current += part.text;
                  setAiSpeechText(accumulatedTextRef.current);

                  // Accumulate into unspoken queue buffer for immediate streaming speech
                  unspokenChunkRef.current += part.text;

                  // Split unspoken chunk into complete sentences/phrases
                  const txt = unspokenChunkRef.current;
                  const lastPunctuationIndex = Math.max(
                    txt.lastIndexOf('.'),
                    txt.lastIndexOf('?'),
                    txt.lastIndexOf('!'),
                    txt.lastIndexOf(';'),
                    txt.lastIndexOf(':'),
                    txt.lastIndexOf('\n')
                  );

                  if (lastPunctuationIndex !== -1) {
                    const chunkToSpeak = txt.substring(0, lastPunctuationIndex + 1);
                    unspokenChunkRef.current = txt.substring(lastPunctuationIndex + 1);

                    const sentences = chunkToSpeak
                      .split(/[.!?;\n:]+/)
                      .map(s => s.trim())
                      .filter(s => s.length > 2); // Speak meaningful clauses

                    if (sentences.length > 0) {
                      // Web Speech Synthesis is bypassed during the active session to prioritize natural Gemini Live streaming audio
                    }
                  }
                }
              }
            }

            // 2. Play base64 audio natively (Google Live active real-time low-latency stream)
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

            // 3. When the turn is complete, save transcripts to session history and reset buffer
            const isTurnComplete = message.serverContent?.turnComplete;
            if (isTurnComplete) {
              unspokenChunkRef.current = '';
              const responseText = accumulatedTextRef.current.trim();
              if (responseText) {
                sessionTranscriptRef.current += `\nDr. Evaldo (AI): ${responseText}`;
              }
              accumulatedTextRef.current = ''; // Reset accumulation for next turn
            }
          },
          onerror: (e: any) => {
            const hasAbortWord = (msgStr: string) => {
              const lower = msgStr.toLowerCase();
              return lower.includes('abort') || lower.includes('cancel') || lower.includes('close') || lower.includes('db_closed');
            };
            const isAborted = e && (
              (e.name === 'AbortError') || 
              (e.message && hasAbortWord(e.message)) ||
              (typeof e === 'string' && hasAbortWord(e))
            );

            if (isAborted) {
              console.info("Live API Connection aborted or cancelled gracefully:", e);
              return; // Avoid crashing/error modal for expected programmatic disconnects
            }

            console.error("Live API Error:", e);
            const msg = e instanceof Error ? e.message : (e && typeof e === 'object' && 'message' in e ? (e as any).message : String(e));
            setErrorMsg(lang === 'pt' ? `Erro de conexão em tempo real com Dr. Evaldo: ${msg}` : `Realtime connection error with Dr. Evaldo: ${msg}`);
            setStatus(SessionStatus.ERROR);
          },
          onclose: () => setStatus(SessionStatus.ENDED)
        }
      });
      sessionPromiseRef.current = sessionPromise;
      activeSessionRef.current = sessionPromise;

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      inputAudioContextRef.current = inputCtx;
      const srcNode = inputCtx.createMediaStreamSource(mediaStream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      srcNode.connect(processor);
      processor.connect(inputCtx.destination);
      
      processor.onaudioprocess = (e) => {
          if (isMicMutedRef.current) return;
          const input = e.inputBuffer.getChannelData(0);
          
          let sum = 0;
          for(let i=0; i<input.length; i++) sum += input[i] * input[i];
          const rms = Math.sqrt(sum / input.length);
          setVolume(rms);

          const isSpeaking = rms > inputSensitivityRef.current;
          setIsUserSpeaking(isSpeaking);
          if (isSpeaking) {
            // Immediately interrupt and mute AI's speech queue when user starts speaking
            clearSpeechQueue();
          }

          const pcm16 = new Int16Array(input.length);
          for(let i=0; i<input.length; i++) pcm16[i] = input[i] * 32767;
          
          sessionPromise.then(session => {
            session.sendRealtimeInput({ 
              audio: { 
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
  }, [lang, voice, accMode, neuroMode, selectedFeeling, selectedMetaphor]);

  useEffect(() => {
    connectToGemini();
    const t = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    return () => { cleanupAudio(); clearInterval(t); };
  }, [connectToGemini, cleanupAudio]);

  // Hook to automatically unmute mic and trigger listener when session connects successfully
  useEffect(() => {
    if (status === SessionStatus.CONNECTED) {
      setIsMicMuted(false);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    }
  }, [status]);

  // Sync Web Speech API SpeechRecognition dynamically with active session and mic state
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition not supported in this browser.");
      return;
    }

    let lastError: string | null = null;
    let restartTimeout: any = null;

    if (status === SessionStatus.CONNECTED && !isMicMuted) {
      try {
        if (!recognitionRef.current) {
          const rec = new SpeechRecognition();
          rec.continuous = true;
          rec.interimResults = true;
          rec.lang = lang === 'pt' ? 'pt-BR' : 'en-US';

          rec.onstart = () => {
            setIsSpeechRecognitionRunning(true);
            setSpeechTranscript('');
            setSpeechRecError(null); // Clear previous errors on successful start!
            lastError = null;
            triggerVoiceAlert(lang === 'pt' ? 'Reconhecimento de Voz Ativo' : 'Voice Recognition Active');
          };

          rec.onerror = (event: any) => {
            const err = event.error;
            lastError = err;
            if (err === 'no-speech' || err === 'aborted') {
              // Silence and aborted timeouts are standard; log as info instead of an error
              console.info('Speech recognition system status:', err);
            } else if (err === 'network') {
              console.warn('Speech recognition transient network status:', err);
              setSpeechRecError('network');
            } else {
              console.warn('Speech recognition warning status:', err);
              setSpeechRecError(err);
            }
            setIsSpeechRecognitionRunning(false);
          };

          rec.onend = () => {
            setIsSpeechRecognitionRunning(false);
            // Auto restart if still connected and unmuted
            if (activeSessionRef.current && !isMicMutedRef.current) {
              if (restartTimeout) clearTimeout(restartTimeout);
              
              // If there was a network glitch, wait 5s to check connectivity; otherwise wait 800ms
              const delay = lastError === 'network' ? 5000 : 800;
              restartTimeout = setTimeout(() => {
                if (activeSessionRef.current && !isMicMutedRef.current) {
                  try {
                    rec.start();
                  } catch (e) {
                    console.info("SpeechRec auto-restart postponed:", e);
                  }
                }
              }, delay);
            }
          };

          rec.onresult = (event: any) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
              const textStr = event.results[i][0].transcript;
              if (event.results[i].isFinal) {
                finalTranscript += textStr;
              } else {
                interimTranscript += textStr;
              }
            }

            const currentLiveText = interimTranscript || finalTranscript;
            if (currentLiveText.trim()) {
              setSpeechTranscript(currentLiveText);
            }

            if (finalTranscript.trim()) {
              const finalQuery = finalTranscript.trim();
              console.log("Web Speech API final transcription captured:", finalQuery);
              sessionTranscriptRef.current += `\nUser: ${finalQuery}`;
              
              // We do not send parallel text message turns to the Live Session here,
              // as raw microphone audio is already actively streaming real-time to the audio channel.
              // This prevents dual input injection and lets the model speak naturally.

              // After 4 seconds, clear transcript display with fade
              setTimeout(() => {
                setSpeechTranscript(prev => prev === currentLiveText ? '' : prev);
              }, 4000);
            }
          };

          recognitionRef.current = rec;
        }

        recognitionRef.current.start();
      } catch (e) {
        console.warn("Recognition start failed or already running:", e);
      }
    } else {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn("Recognition stop ignored", e);
        }
      }
    }

    return () => {
      if (restartTimeout) clearTimeout(restartTimeout);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {}
      }
    };
  }, [isMicMuted, status, lang]);

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
      if (currentUser) {
        updateDoc(doc(db, 'users', currentUser.uid), { emotionalState: feelingKey }).catch(() => {});
      }
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

      sessionTranscriptRef.current += `\nUser: [Tuned feeling: ${textStr}]`;

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

      sessionTranscriptRef.current += `\nUser: [Selected metaphor: ${textStr}]`;

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
    themeBg = 'bg-[#031c16] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-950/20 via-stone-950 to-stone-950';
    themeCard = 'border-emerald-900/35 bg-emerald-950/15 backdrop-blur-2xl';
    accentBorder = 'border-emerald-800/40 text-emerald-400';
  } else if (neuroMode === 'dyslexia') {
    textSpacing = 'tracking-[0.15em]';
    lineSpacing = 'leading-[1.95] font-sans font-medium';
    fontOverride = 'font-sans';
    themeBg = 'bg-[#151311]';
    themeCard = 'border-stone-800 bg-[#221e1b]/80';
    accentBorder = 'border-stone-750 text-amber-200';
  } else if (neuroMode === 'adhd') {
    themeBg = 'bg-stone-950 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/10 via-stone-950 to-stone-950';
    themeCard = 'border-amber-950/25 bg-stone-900/50';
    accentBorder = 'border-amber-950/30 text-amber-400';
  } else if (neuroMode === 'autism') {
    themeBg = 'bg-[#090e1d]';
    themeCard = 'border-blue-950 bg-[#101931]/60';
    accentBorder = 'border-blue-900/30 text-blue-400 font-bold';
  } else if (neuroMode === 'senior') {
    themeBg = 'bg-[#0a0a0a]';
    themeCard = 'border-stone-850 bg-[#161616]';
    accentBorder = 'border-stone-800 text-stone-200';
    fontOverride = 'font-serif';
    lineSpacing = 'leading-relaxed text-[13px] font-medium';
  } else if (neuroMode === 'child') {
    themeBg = 'bg-[#0f0a20] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#1d123e]/20 to-[#0f0a20]';
    themeCard = 'border-indigo-950 bg-[#1a1435]/65';
    accentBorder = 'border-indigo-900/40 text-indigo-400';
  } else if (neuroMode === 'down') {
    themeBg = 'bg-[#0e1211]';
    themeCard = 'border-teal-500/25 bg-[#141b18]';
    accentBorder = 'border-teal-400/40 text-teal-300 font-extrabold';
    lineSpacing = 'leading-relaxed text-[12.5px] font-extrabold';
  } else if (neuroMode === 'gifted') {
    themeBg = 'bg-[#02010c] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#180d3b]/20 via-[#02010c] to-[#02010c]';
    themeCard = 'border-indigo-950/60 bg-[#070529]/65';
    accentBorder = 'border-indigo-900/40 text-violet-300';
  } else if (neuroMode === 'burnout') {
    themeBg = 'bg-[#0f0c0b]';
    themeCard = 'border-stone-850 bg-[#1a1412]/50';
    accentBorder = 'border-stone-850 text-orange-300';
  } else if (neuroMode === 'grief') {
    themeBg = 'bg-[#100808]';
    themeCard = 'border-rose-950/30 bg-[#1e1010]/50';
    accentBorder = 'border-rose-900/40 text-rose-300';
  }

  const isHumanBridgeActive = aiSpeechText && aiSpeechText.includes('[PONTE_HUMANA]');
  const cleanAiSpeechText = aiSpeechText ? aiSpeechText.replace('[PONTE_HUMANA]', '').trim() : '';

  return (
    <div className={`relative flex flex-col items-center justify-between w-full h-full p-4 overflow-hidden transition-all duration-1000 ${themeBg} ${fontOverride}`}>
      
      {/* Upper Navigation & Neurodivergent Mode Capsule Selector */}
      {!isMinimalMode && !isFullyImmersive && (
         <div className={`w-full flex flex-col md:flex-row justify-between items-center gap-3 z-30 pb-2 border-b border-stone-900/80 transition-opacity duration-[2000ms] ${isRestMode ? 'opacity-20 pointer-events-none' : 'opacity-100'}`}>
            <div className="flex items-center space-x-3 w-full md:w-auto">
               <Logo className="w-5 h-5 text-teal-400" />
               <div className="flex flex-col">
                 <span className="font-serif text-sm text-stone-200 tracking-wider uppercase">{text?.title}</span>
                 <span className="text-[8px] text-teal-400/70 uppercase tracking-widest font-mono">
                   {neuroMode === 'natural' && (lang === 'pt' ? 'Experiência Padrão 🍃' : 'Default Experience 🍃')}
                    {neuroMode === 'senior' && (lang === 'pt' ? 'Modo Idoso Ativo 👵' : 'Seniors Mode Active 👵')}
                    {neuroMode === 'child' && (lang === 'pt' ? 'Modo Infantil Ativo 👶' : 'Children Mode Active 👶')}
                    {neuroMode === 'down' && (lang === 'pt' ? 'Modo S. Down Ativo ❤️' : 'Down Mode Active ❤️')}
                    {neuroMode === 'gifted' && (lang === 'pt' ? 'Modo A. Habilidades Ativo 🌌' : 'Gifted Mode Active 🌌')}
                    {neuroMode === 'burnout' && (lang === 'pt' ? 'Modo Burnout Ativo 🔥' : 'Burnout Mode Active 🔥')}
                    {neuroMode === 'grief' && (lang === 'pt' ? 'Modo Luto Ativo 🌹' : 'Grief Mode Active 🌹')}
                   {neuroMode === 'adhd' && (lang === 'pt' ? 'Modo TDAH Ativo ⚡' : 'ADHD Mode Active ⚡')}
                   {neuroMode === 'autism' && (lang === 'pt' ? 'Modo Autismo Ativo 🧩' : 'Autism Mode Active 🧩')}
                   {neuroMode === 'dyslexia' && (lang === 'pt' ? 'Modo Dislexia Ativo 📚' : 'Dyslexia Mode Active 📚')}
                   {neuroMode === 'anxiety' && (lang === 'pt' ? 'Modo Ansiedade Ativo 🌬️' : 'Anxiety Mode Active 🌬️')}
                   {neuroMode === 'inclusive' && (lang === 'pt' ? 'Modo Inclusivo Ativo 🌿' : 'Inclusive Mode Active 🌿')}
                 </span>
               </div>
            </div>

            {/* FlowTuner: Icon-based sensory sintonizador */}
            <div className="flex items-center space-x-2 p-1 bg-stone-900/40 border border-stone-800/60 rounded-full max-w-full overflow-x-auto no-scrollbar scroll-smooth">
              {[
                { id: 'padrao', icon: Heart, label: lang === 'pt' ? 'Padrão' : 'Standard', tooltip: lang === 'pt' ? 'Sintonia Padrão' : 'Default Sync' },
                { id: 'neutro', icon: Compass, label: lang === 'pt' ? 'Neutro' : 'Neutral', tooltip: lang === 'pt' ? 'Âncoras e Estabilidade' : 'Anchors & Grounding' },
                { id: 'frequencia', icon: Activity, label: lang === 'pt' ? 'Frequência' : 'Frequency', tooltip: lang === 'pt' ? 'Frequência de Tom' : 'Vocal Pitch / Hz Tuning' },
                { id: 'velocidade', icon: Gauge, label: lang === 'pt' ? 'Velocidade' : 'Speed', tooltip: lang === 'pt' ? 'Velocidade Vocal' : 'Voice Pace / Speed' },
                { id: 'seguranca', icon: Shield, label: lang === 'pt' ? 'Segurança' : 'Safety', tooltip: lang === 'pt' ? 'Farol de Calmaria' : 'Co-Regulation Sanctuary' },
                { id: 'habilidade', icon: Brain, label: lang === 'pt' ? 'Habilidade' : 'Ability', tooltip: lang === 'pt' ? 'Focos e Neurodiversidade' : 'Neurodiverse Spaces' }
              ].map((tab) => {
                const IconComp = tab.icon;
                const isSelected = activePanelTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActivePanelTab(tab.id as any);
                      if (tab.id === 'padrao') {
                        setNeuroMode('natural');
                      } else if (tab.id === 'seguranca') {
                        setNeuroMode('anxiety');
                      } else if (tab.id === 'habilidade') {
                        if (neuroMode === 'natural' || neuroMode === 'anxiety' || neuroMode === 'inclusive') {
                          setNeuroMode('adhd');
                        }
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-[9px] uppercase tracking-widest transition-all font-mono flex items-center space-x-1.5 whitespace-nowrap cursor-pointer pointer-events-auto border ${
                      isSelected 
                        ? 'bg-teal-900/50 text-teal-300 border-teal-800/60 shadow-md scale-102 font-bold' 
                        : 'text-stone-500 hover:text-stone-300 hover:bg-stone-900/30 border-transparent'
                    }`}
                    title={tab.tooltip}
                  >
                    <IconComp className={`w-3.5 h-3.5 ${isSelected ? 'text-teal-400' : 'text-stone-500'}`} />
                    <span className="text-[8.5px] tracking-wider">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="hidden md:block font-mono text-[10px] text-stone-500">{Math.floor(elapsedSeconds/60)}:{(elapsedSeconds%60).toString().padStart(2,'0')}</div>
         </div>
      )}

      {/* Impersonated Active Profile Banner */}
      {impersonatedUser && (
        <div className="w-full max-w-4xl bg-teal-950/20 border border-teal-900/40 text-teal-300 px-4 py-2.5 rounded-2xl flex flex-row justify-between items-center z-45 text-xs backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <span className="animate-pulse flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <span className="font-mono text-[9px] uppercase tracking-wider text-teal-400">
              {lang === 'pt' ? `Simulação de Perfil Ativa: ${impersonatedUser.name} (${impersonatedUser.email})` : `Active Profile Simulation: ${impersonatedUser.name} (${impersonatedUser.email})`}
            </span>
          </div>
          <button 
            onClick={onClearImpersonation}
            className="text-stone-400 hover:text-stone-200 font-mono text-[9.5px] uppercase cursor-pointer transition-all border border-stone-850 hover:border-stone-700 bg-stone-900/40 px-3 py-1 rounded-xl"
          >
            {lang === 'pt' ? 'Restaurar Meu Perfil' : 'Restore My Profile'}
          </button>
        </div>
      )}

      {/* Floating Active Voice Actions Info Alerts */}
      {voiceAlert && (
        <div className="absolute top-20 left-12 right-12 z-40 p-3 bg-teal-950/40 backdrop-blur-md border border-teal-900/30 text-[9px] text-teal-300 uppercase tracking-[0.25em] text-center rounded-xl shadow-lg flex items-center justify-center space-x-2 animate-pulse">
           <Sparkles className="w-3.5 h-3.5" />
           <span>{voiceAlert}</span>
        </div>
      )}

      {/* Scrollable Adaptive Dashboard */}
      <div className="flex-1 w-full max-w-5xl overflow-y-auto custom-scrollbar flex flex-col items-center justify-start space-y-6 py-4 px-2 my-2 z-10">
        
        {/* Dynamic Mood Constellation Chart (Emotional Resonance Scoring Graph) */}
        {!isMinimalMode && (
          <div className="w-full max-w-md lg:max-w-none space-y-6 lg:space-y-0 lg:grid lg:grid-cols-12 lg:gap-6 items-stretch">
            <div className="lg:col-span-7 flex flex-col">
              <MoodConstellation history={currentUser?.resonanceHistory || []} lang={lang} />
            </div>
            
            <div className="lg:col-span-5 p-1 bg-stone-900/30 border border-stone-850/50 rounded-3xl backdrop-blur-md flex flex-col">
              <div className="p-3 border-b border-stone-900/80 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold tracking-widest text-teal-400 font-mono">
                  {lang === 'pt' ? '🖼️ Visual Imersivo PCH' : '🖼️ PCH Immersive Scenery'}
                </span>
                <span className="text-[8px] bg-teal-500/10 px-2 py-0.5 rounded-full text-teal-300 font-mono">
                  {neuroMode.toUpperCase()}
                </span>
              </div>
              <ImmersiveVisualEngine 
                emotionalState={selectedFeeling || currentUser?.emotionalState || 'neutral'} 
                neuroMode={neuroMode} 
                lang={lang} 
                inline={true}
                onAddPoints={async (pts) => {
                  if (!currentUser) return;
                  try {
                    const userRef = doc(db, 'users', currentUser.id);
                    const newPoints = (currentUser.points || 0) + pts;
                    const newLevel = Math.floor(newPoints / 100) + 1;
                    await updateDoc(userRef, {
                      points: newPoints,
                      level: newLevel
                    });
                  } catch (e) {
                    console.error("Error updating points:", e);
                  }
                }}
              />
            </div>
          </div>
        )}

        {/* RESPONSIVE CLINICAL BENTO GRID LAYER */}
        {!isMinimalMode ? (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mt-2">
            
            {/* LEFT COLUMN: Expanded Tab Controls & Adaptive Interface (col-span-12 lg:col-span-7) */}
            {!isFullyImmersive && (
              <div className="col-span-1 lg:col-span-7 flex flex-col space-y-6 w-full items-center lg:items-stretch">
                
                {/* Tab: PADRAO */}
                {activePanelTab === 'padrao' && (
                  <div className="w-full space-y-4">
                    <AdaptiveProfileCard
                      neuroMode="natural"
                      lang={lang}
                      currentUser={currentUser}
                      autismTab={autismTab}
                      setAutismTab={setAutismTab}
                      childFeeling={childFeeling}
                      setChildFeeling={setChildFeeling}
                      burnoutEnergy={burnoutEnergy}
                      setBurnoutEnergy={setBurnoutEnergy}
                      griefRemembrance={griefRemembrance}
                      setGriefRemembrance={setGriefRemembrance}
                    />
                    
                    {/* Extra standard alignment feedback badge */}
                    <div className="p-4 bg-stone-900/35 border border-stone-850/60 rounded-2xl flex flex-col space-y-2 text-left">
                      <span className="text-[10px] font-mono tracking-wider uppercase text-teal-400 font-bold">★ {lang === 'pt' ? 'STATUS DE SINCRONIA: ALINHADO' : 'SYNCHRONY STATUS: ALIGNED'}</span>
                      <p className="text-[11px] text-stone-400 font-sans leading-relaxed">
                        {lang === 'pt' 
                          ? 'Sintonia Padrão ativa. Fale naturalmente com o Dr. Evaldo para calibração fisiológica em tempo real.' 
                          : 'Standard Alignment active. Speak naturally with Dr. Evaldo for real-time physiological synchronization.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tab: NEUTRO */}
                {activePanelTab === 'neutro' && (
                  <div className="w-full space-y-4 animate-none">
                    {/* Grounding Background Anchors */}
                    <div className="p-5 bg-stone-900/30 border border-stone-850/50 rounded-3xl space-y-3 text-left">
                      <div className="flex items-center space-x-1.5 text-stone-200">
                         <Compass className="w-4 h-4 text-teal-400 animate-pulse" />
                         <span className="text-[10px] uppercase font-bold tracking-wider">{lang === 'pt' ? 'Âncoras Sensoriais de Fundo' : 'Sensory Background Anchors'}</span>
                      </div>
                      <p className="text-[10px] text-stone-500 leading-normal mb-1">
                        {lang === 'pt' ? 'Selecione uma imagem de âncora sensorial para regenerar os cenários de calmaria.' : 'Select a sensory anchor to realign the serene visual backdrops.'}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2">
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
                              className={`p-3 rounded-2xl border text-left flex flex-col space-y-0.5 transition-all text-xs cursor-pointer pointer-events-auto ${
                                isSel 
                                ? 'bg-teal-950/20 border-teal-500/40 text-teal-300 shadow-sm' 
                                : 'bg-stone-955/20 border-stone-900 hover:bg-stone-900/35 text-stone-500 hover:text-stone-300'
                              }`}
                            >
                              <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                              <span className="text-[7.5px] text-stone-500 leading-tight font-mono truncate">{item.desc}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Feelings Panel inline inside Neutro/Estabilidade panel */}
                    <div className="p-5 bg-stone-900/40 border border-stone-850/60 rounded-3xl space-y-3 text-left">
                       <span className="text-[10.5px] font-bold uppercase tracking-widest text-stone-300 block">{text?.feelings?.title}</span>
                       <p className="text-[9.5px] text-stone-500 tracking-wider mb-2">{text?.feelings?.subtitle}</p>
                       
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
                                  className={`p-2.5 rounded-xl border text-[9.5px] uppercase font-mono transition-all duration-300 text-left flex justify-between items-center cursor-pointer pointer-events-auto ${
                                    isActive 
                                    ? 'bg-teal-900/30 text-teal-300 border-teal-500/60 shadow shadow-teal-500/5' 
                                    : 'bg-stone-900/30 hover:bg-stone-900/70 border-stone-850 text-stone-400 hover:text-stone-250'
                                  }`}
                                >
                                  <span>{label}</span>
                                  {isActive && <CheckCircle2 className="w-3 h-3 text-teal-400" />}
                                </button>
                              );
                          })}
                       </div>

                       {(selectedFeeling || selectedMetaphor) && (
                         <div className="pt-2 border-t border-stone-850/50 flex justify-end">
                           <button
                             onClick={() => {
                               setSelectedFeeling(null);
                               setSelectedMetaphor(null);
                             }}
                             className="text-[9.5px] py-1.5 px-3 bg-stone-950 hover:bg-stone-850 hover:text-stone-250 text-stone-400 border border-stone-850 rounded-lg transition-colors cursor-pointer pointer-events-auto font-mono uppercase"
                           >
                             {lang === 'pt' ? 'Zerar Diagnóstico' : 'Clear Diagnosis'}
                           </button>
                         </div>
                       )}
                    </div>

                    {/* Metaphors Panel inline inside Neutro/Estabilidade panel */}
                    <div className="p-5 bg-stone-900/40 border border-stone-850/60 rounded-3xl space-y-3 text-left">
                       <span className="text-[10.5px] font-bold uppercase tracking-widest text-stone-300 block">{text?.metaphors?.title}</span>
                       
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
                                  className={`p-2.5 rounded-xl border text-xs transition-all duration-300 flex flex-col items-center justify-center text-center cursor-pointer pointer-events-auto ${
                                    isActive 
                                    ? 'bg-amber-955/20 text-amber-300 border-amber-600/50 shadow-md' 
                                    : 'bg-stone-900/30 hover:bg-stone-900/70 border-stone-850 text-stone-400'
                                  }`}
                                >
                                  <span className="font-serif italic text-[11px] tracking-wide">{label}</span>
                                </button>
                              );
                          })}
                       </div>
                    </div>
                  </div>
                )}

                {/* Tab: FREQUENCIA */}
                {activePanelTab === 'frequencia' && (
                  <div className="w-full text-left p-5 bg-stone-900/40 border border-stone-850/60 rounded-3xl space-y-4">
                    <div className="flex items-center space-x-1.5 text-stone-200 border-b border-stone-850 pb-2.5">
                      <Activity className="w-4 h-4 text-teal-400 animate-pulse" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">{lang === 'pt' ? 'Frequência do Tom Vocal PCH' : 'Vocal Pitch & Tuning PCH'}</span>
                    </div>

                    <div className="space-y-4">
                       <div className="flex flex-col space-y-2">
                          <div className="flex justify-between items-center text-[10px] text-stone-400 uppercase tracking-widest">
                             <span>{lang === 'pt' ? 'Frequência do Tom' : 'Vocal Pitch'}</span>
                             <span className="text-teal-400 font-mono font-bold">{voicePitch.toFixed(2)}x</span>
                          </div>
                          <input 
                             type="range"
                             min="0.5"
                             max="1.5"
                             step="0.05"
                             value={voicePitch}
                             onChange={(e) => {
                                setVoicePitch(parseFloat(e.target.value));
                                setVoicePersona('custom');
                             }}
                             className="w-full accent-teal-500 h-1.5 bg-stone-950 rounded appearance-none cursor-pointer pointer-events-auto"
                          />
                          <span className="text-[8.5px] text-stone-500 font-mono italic">
                            {lang === 'pt' ? 'Abaixo de 1.0x cria timbres mais profundos (masculino); acima, timbres agudos (feminino).' : 'Below 1.0x renders deeper notes; above 1.0x renders light melodic registers.'}
                          </span>
                       </div>

                       <div className="flex flex-col space-y-2 pt-2 border-t border-stone-900/30">
                          <span className="text-[9px] text-stone-500 uppercase tracking-widest block">{lang === 'pt' ? 'Voz Sotaque do Navegador' : 'System Native Voice'}</span>
                          {browserVoices.length === 0 ? (
                             <div className="text-[9px] text-stone-600 italic">
                                {lang === 'pt' ? 'Carregando vozes...' : 'Loading voices...'}
                             </div>
                          ) : (
                             <select
                                value={selectedVoiceURI}
                                onChange={(e) => {
                                   setSelectedVoiceURI(e.target.value);
                                   setVoicePersona('custom');
                                }}
                                className="w-full text-[10px] font-mono bg-stone-950 text-stone-200 border border-stone-850 p-2.5 rounded-xl focus:border-teal-500/40 focus:outline-none cursor-pointer pointer-events-auto"
                             >
                                <option value="">
                                   {lang === 'pt' ? '🍃 Automático (Voz Padrão do Sistema)' : '🍃 Automatic (System Default Voice)'}
                                </option>
                                {browserVoices
                                   .filter(v => v.lang.startsWith(lang === 'pt' ? 'pt' : 'en'))
                                   .map((v, idx) => (
                                      <option key={idx} value={v.voiceURI}>
                                         {v.name} ({v.lang})
                                      </option>
                                   ))
                                }
                             </select>
                          )}
                       </div>
                    </div>
                  </div>
                )}

                {/* Tab: VELOCIDADE */}
                {activePanelTab === 'velocidade' && (
                  <div className="w-full text-left p-5 bg-stone-900/40 border border-stone-850/60 rounded-3xl space-y-4">
                    <div className="flex items-center space-x-1.5 text-stone-200 border-b border-stone-850 pb-2.5 font-sans">
                      <Volume2 className="w-4 h-4 text-teal-400" />
                      <span className="text-[10px] uppercase font-bold tracking-wider">{lang === 'pt' ? 'Velocidade Vocal & Ritmo' : 'Vocal Rate & Rhythm Controls'}</span>
                    </div>

                    <div className="space-y-4">
                       <div className="flex flex-col space-y-2">
                          <div className="flex justify-between items-center text-[10px] text-stone-400 uppercase tracking-widest">
                             <span>{lang === 'pt' ? 'Velocidade Vocal' : 'Vocal Speed'}</span>
                             <span className="text-teal-400 font-mono font-bold">{speechRate.toFixed(2)}x</span>
                          </div>
                          <input 
                             type="range"
                             min="0.5"
                             max="1.5"
                             step="0.05"
                             value={speechRate}
                             onChange={(e) => {
                                setSpeechRate(parseFloat(e.target.value));
                                setVoicePersona('custom');
                             }}
                             className="w-full accent-teal-500 h-1.5 bg-stone-950 rounded appearance-none cursor-pointer pointer-events-auto"
                          />
                          <span className="text-[8.5px] text-stone-500 font-mono italic">
                            {lang === 'pt' ? 'Controles que esticam o silêncio protetor (abaixo de 0.8x) ou impulsionam foco (acima de 1.1x).' : 'Stretch protective silent buffers (below 0.8x) or accelerate focused inputs (above 1.1x).'}
                          </span>
                       </div>

                       <div className="flex flex-col space-y-2 pt-2 border-t border-stone-900/30">
                          <span className="text-[9px] text-stone-500 uppercase tracking-widest block">{lang === 'pt' ? 'Estilos Predefinidos PCH' : 'Preset Vocal Profiles PCH'}</span>
                          <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 pt-1">
                             {[
                                { key: 'natural', label: lang === 'pt' ? 'Natural 🍃' : 'Natural 🍃' },
                                { key: 'elder', label: lang === 'pt' ? 'Sabedoria 👵' : 'Wisdom 👵' },
                                { key: 'supporter', label: lang === 'pt' ? 'Apoio ❤️' : 'Supporter ❤️' },
                                { key: 'poet', label: lang === 'pt' ? 'Poético 🕊️' : 'Poet 🕊️' },
                                { key: 'playful', label: lang === 'pt' ? 'Lúdico 🐥' : 'Playful 🐥' }
                             ].map((opt) => {
                                const isSel = voicePersona === opt.key;
                                return (
                                   <button
                                      key={opt.key}
                                      onClick={() => setVoicePersona(opt.key as any)}
                                      className={`py-1.5 px-2 rounded-xl text-[8.5px] font-mono uppercase tracking-wider transition-colors cursor-pointer pointer-events-auto text-center border ${
                                         isSel 
                                         ? 'bg-teal-900/30 border-teal-800/40 text-teal-300' 
                                         : 'bg-stone-955/60 border-stone-850 text-stone-550 hover:text-stone-300'
                                      }`}
                                   >
                                      {opt.label}
                                   </button>
                                );
                             })}
                          </div>
                       </div>
                    </div>
                  </div>
                )}

                {/* Tab: SEGURANÇA */}
                {activePanelTab === 'seguranca' && (
                  <div className="w-full space-y-4">
                    <div className="w-full p-4 bg-[#021d15]/50 border border-emerald-950/40 rounded-2xl text-left font-sans shadow-lg">
                      <div className="flex items-center space-x-2 text-emerald-400 mb-2">
                        <span className="text-xs">🗼</span>
                        <h5 className="text-[10px] text-emerald-400 font-extrabold tracking-widest uppercase">{lang === 'pt' ? 'Faroleiro da Calmaria' : 'Beacon of Calm'}</h5>
                      </div>
                      
                      <div className="p-3.5 bg-emerald-950/30 border border-emerald-900/40 rounded-xl text-center shadow-inner mb-2">
                        <p className="text-xs font-serif font-bold text-emerald-200 animate-pulse leading-relaxed">
                          {lang === 'pt' ? '“Você está seguro, protegido e totalmente amparado neste exato momento.”' : '“You are completely safe, protected, and fully grounded at this very moment.”'}
                        </p>
                      </div>

                      <div className="flex justify-between items-center text-[8.5px] font-mono text-emerald-500/80">
                        <span>{lang === 'pt' ? '📍 Porto Seguro: Conectado' : '📍 Safe Harbor: Connected'}</span>
                        <span>{lang === 'pt' ? 'Autocoesão: Sendo Co-regulada' : 'Co-Regulation: Auto-balancing'}</span>
                      </div>
                    </div>

                    <BreathingGuide
                      lang={lang}
                      breathingScale={breathingScale}
                      breathingStep={breathingStep}
                      breathingText={breathingText}
                      accentBorder="border-emerald-900/40 bg-[#021d15]/20 text-emerald-355"
                    />
                  </div>
                )}

                {/* Tab: HABILIDADE */}
                {activePanelTab === 'habilidade' && (
                  <div className="w-full space-y-4">
                    {/* Compact selector list for Neurodiversity */}
                    <div className="p-4 bg-stone-900/30 border border-stone-850/60 rounded-3xl text-left space-y-3">
                      <div className="flex justify-between items-center border-b border-stone-850/45 pb-2">
                        <span className="text-[10px] font-mono tracking-wider uppercase text-teal-400 font-bold">{lang === 'pt' ? '★ SELECIONE O FOCO INTEGRADO' : '★ SELECT ACTIVE NEURO-COGNITIVE'}</span>
                        <span className="text-[8px] font-mono text-stone-500 uppercase">{lang === 'pt' ? 'Acolhimento' : 'Spaces'}</span>
                      </div>
                      
                      <div className="flex space-x-1.5 p-1 bg-stone-950/40 border border-stone-900 rounded-full max-w-full overflow-x-auto no-scrollbar scroll-smooth">
                        {[
                          { key: 'adhd', label: 'TDAH ⚡' },
                          { key: 'autism', label: 'Autismo 🧩' },
                          { key: 'dyslexia', label: 'Dislexia 📚' },
                          { key: 'burnout', label: 'Burnout 🔥' },
                          { key: 'gifted', label: 'A. Hab. 🌌' },
                          { key: 'grief', label: 'Luto 🌹' },
                          { key: 'senior', label: 'Idoso 👵' },
                          { key: 'child', label: 'Infantil 👶' },
                          { key: 'down', label: 'S. Down ❤️' }
                        ].map((m) => {
                          const isSel = neuroMode === m.key;
                          return (
                            <button
                              key={m.key}
                              onClick={() => {
                                setNeuroMode(m.key as any);
                              }}
                              className={`px-3 py-1.5 rounded-full text-[8.5px] uppercase font-mono tracking-wider transition-colors whitespace-nowrap cursor-pointer pointer-events-auto border ${
                                isSel 
                                ? 'bg-teal-900/40 border-teal-800/40 text-teal-300' 
                                : 'bg-stone-900 border-transparent text-stone-500 hover:text-stone-300'
                              }`}
                            >
                              {m.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <AdaptiveProfileCard
                      neuroMode={neuroMode}
                      lang={lang}
                      currentUser={currentUser}
                      autismTab={autismTab}
                      setAutismTab={setAutismTab}
                      childFeeling={childFeeling}
                      setChildFeeling={setChildFeeling}
                      burnoutEnergy={burnoutEnergy}
                      setBurnoutEnergy={setBurnoutEnergy}
                      griefRemembrance={griefRemembrance}
                      setGriefRemembrance={setGriefRemembrance}
                    />

                    {/* Only show breathing guide in Habilidade if autismo tab breath is selected */}
                    {neuroMode === 'autism' && autismTab === 'breath' && (
                      <BreathingGuide
                        lang={lang}
                        breathingScale={breathingScale}
                        breathingStep={breathingStep}
                        breathingText={breathingText}
                        accentBorder="border-blue-900/30 bg-[#0a1122]/35 text-blue-300"
                      />
                    )}
                  </div>
                )}
                
              </div>
            )}

            {/* RIGHT COLUMN: Active Controls, Telemetry & Feelings (col-span-12 lg:col-span-5) */}
            <div className={`${isFullyImmersive ? "col-span-1 lg:col-span-12 max-w-2xl mx-auto" : "col-span-1 lg:col-span-5"} flex flex-col space-y-6 w-full items-center lg:items-stretch`}>
               
        {/* Sabedoria do Dia Collapsible Section */}
        {!isMinimalMode && showWisdom && !isFullyImmersive && (
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
           
           {onToggleFullyImmersive && (
             <button
               onClick={onToggleFullyImmersive}
               className={`absolute top-4 ${isRestMode ? 'right-20' : 'right-4'} flex items-center space-x-1 px-2.5 py-1 rounded-full border text-[8.5px] font-mono cursor-pointer transition-all hover:bg-stone-900/85 z-40 active:scale-95 ${
                 isFullyImmersive 
                   ? 'bg-teal-500/10 border-teal-500/40 text-teal-400' 
                   : 'bg-stone-950/50 border-stone-850 text-stone-500 hover:text-stone-200'
               }`}
               title={lang === 'pt' ? 'Modo Imersão Total' : 'Full Immersion Mode'}
             >
               {isFullyImmersive ? <EyeOff className="w-3.5 h-3.5 animate-pulse" /> : <Eye className="w-3.5 h-3.5" />}
               <span className="hidden sm:inline">{lang === 'pt' ? 'Imersão' : 'Immersion'}</span>
             </button>
           )}

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

            {/* AI Speech Text display (Web Speech Synthesis transcription) */}
            {cleanAiSpeechText && (
              <div id="ai-caption-bubble" className="mt-4 w-full max-w-sm px-4 py-3 bg-teal-950/30 backdrop-blur-md border border-teal-500/30 rounded-2xl text-center leading-relaxed shadow-lg animate-none z-20">
                <div className="flex items-center justify-center space-x-1 mb-1 bg-teal-900/20 py-0.5 px-2 rounded-full w-fit mx-auto">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping" />
                  <span className="text-[8px] font-bold text-teal-400 uppercase tracking-widest font-mono">
                    {lang === 'pt' ? 'Mente IA (Fórmula de Voz)' : 'Mind AI (Vocal Blueprint)'}
                  </span>
                </div>
                <p className="text-[11.5px] text-stone-100 font-serif leading-relaxed italic">
                  "{cleanAiSpeechText}"
                </p>
              </div>
            )}

            {isHumanBridgeActive && (
              <button
                onClick={() => setShowReferral(true)}
                className="mt-3 w-full max-w-sm py-4 px-5 bg-orange-800 hover:bg-orange-700 active:scale-95 text-white rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 font-medium text-xs md:text-sm cursor-pointer border border-orange-700/20 font-sans z-30 shrink-0 animate-fade-in-up"
              >
                <HeartHandshake className="w-4 h-4 md:w-5 md:h-5 text-orange-200 animate-pulse" />
                <span>{lang === 'pt' ? 'Conversar com alguém agora' : 'Connect with someone now'}</span>
              </button>
            )}

            {/* Interactive visual audio wave animation synced with speech input */}
            {isSpeechRecognitionRunning && (
              <div className="flex items-center justify-center space-x-1 w-full max-w-xs mt-4 h-10 px-4 bg-teal-900/10 border border-teal-950/20 rounded-full self-center z-20">
                <span className="text-[8px] font-mono font-bold text-teal-400/80 uppercase tracking-widest mr-2">{lang === 'pt' ? 'Frequência:' : 'Frequency:'}</span>
                {[...Array(15)].map((_, i) => {
                  const centerDist = Math.abs(i - 7);
                  const factor = Math.max(0.25, (8 - centerDist) / 8);
                  const dynamicHeight = 4 + (volume * 70 * factor) + (Math.sin(elapsedSeconds * 4 + i) * 5 * (volume > 0.015 ? 1 : 0.25));
                  return (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-gradient-to-t from-teal-500 via-emerald-400 to-teal-300 transition-all duration-75"
                      style={{
                        height: `${Math.min(36, dynamicHeight)}px`,
                        opacity: volume > 0.015 ? 1.0 : 0.4,
                      }}
                    />
                  );
                })}
              </div>
            )}

             {/* Supportive Speech Recognition Diagnostic Tip */}
             {speechRecError && speechRecError !== 'aborted' && speechRecError !== 'no-speech' && (
               <div className="mt-4 w-full max-w-sm px-4 py-3 bg-red-950/20 backdrop-blur-md border border-red-500/30 rounded-2xl text-center leading-relaxed shadow-lg z-20 animate-none">
                 <div className="flex items-center justify-center space-x-1 mb-1.5 py-0.5 px-2 rounded-full w-fit mx-auto bg-red-900/10">
                   <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                   <span className="text-[8px] font-bold text-red-400 uppercase tracking-widest font-mono">
                     {lang === 'pt' ? 'Sinal de Voz Restrito' : 'Voice Signal Restrained'}
                   </span>
                 </div>
                 <p className="text-[11px] text-stone-300 leading-relaxed font-sans">
                   {speechRecError === 'not-allowed' ? (
                     lang === 'pt' 
                       ? 'O navegador suspendeu o reconhecimento de voz parcial. Certifique-se de liberar o microfone nos ajustes do site (clique no ícone de de cadeado).' 
                       : 'The browser suspended partial speech recognition. Please check your mic permissions in site settings (click the lock icon).'
                   ) : (
                     lang === 'pt'
                       ? `Não foi possível sintonizar a escuta de texto (${speechRecError}). O canal de voz principal com Dr. Evaldo continua ativo!`
                       : `Voice transcription suspended (${speechRecError}). The main streaming voice channel with Dr. Evaldo is still fully active!`
                   )}
                 </p>
               </div>
             )}

           {/* Custom Web Speech API Live Transcript Bubble */}
           {speechTranscript && (
             <div id="voice-transcript-bubble" className="mt-4 w-full max-w-sm px-4 py-3 bg-stone-950/80 backdrop-blur-md border border-teal-500/20 rounded-2xl text-center leading-relaxed font-sans shadow-lg shadow-teal-500/5 animate-none">
               <div className="flex items-center justify-center space-x-1 mb-1">
                 <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" />
                 <span className="text-[8px] font-bold text-teal-400 uppercase tracking-widest font-mono">
                   {lang === 'pt' ? 'Mente Fala (Reconhecido)' : 'Mind Speak (Recognized)'}
                 </span>
               </div>
               <p className="text-xs text-stone-200 font-medium font-sans">
                 "{speechTranscript}"
               </p>
             </div>
           )}
           
           {/* =========================================================
                MOTOR ADAPTATIVO PCH - MULTI-SENSORY CLINICAL DASHBOARDS
                ========================================================= */}
           {neuroMode === 'adhd' && (
             <div className="mt-4 p-3 bg-stone-900/40 border border-stone-850/60 rounded-2xl text-center max-w-sm w-full mx-auto">
               <span className="text-[9px] text-amber-400 uppercase tracking-widest font-bold block mb-1">🎯 FOCO DO DIA / FOCUS STATE</span>
                <p className="text-[11px] text-stone-300 leading-relaxed italic">
                  {lang === 'pt' ? '"Deixe de lado o ruído externo. Apenas uma palavra por vez."' : '"Leave external noise behind. Just one mindful word at a time."'}
                </p>
              </div>
            )}
      </div>
    </div>
  </div>
  ) : (
          /* MINIMALIST MODE: Compact, centered primary vocal engine */
          <div id="minimalist-visualizer-container" className="w-full max-w-md mx-auto flex flex-col items-center py-6">
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

            {/* AI Speech Text display (Web Speech Synthesis transcription) */}
            {cleanAiSpeechText && (
              <div id="ai-caption-bubble" className="mt-4 w-full max-w-sm px-4 py-3 bg-teal-950/30 backdrop-blur-md border border-teal-500/30 rounded-2xl text-center leading-relaxed shadow-lg animate-none z-20">
                <div className="flex items-center justify-center space-x-1 mb-1 bg-teal-900/20 py-0.5 px-2 rounded-full w-fit mx-auto">
                  <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-ping" />
                  <span className="text-[8px] font-bold text-teal-400 uppercase tracking-widest font-mono">
                    {lang === 'pt' ? 'Mente IA (Fórmula de Voz)' : 'Mind AI (Vocal Blueprint)'}
                  </span>
                </div>
                <p className="text-[11.5px] text-stone-100 font-serif leading-relaxed italic">
                  "{cleanAiSpeechText}"
                </p>
              </div>
            )}

            {isHumanBridgeActive && (
              <button
                onClick={() => setShowReferral(true)}
                className="mt-3 w-full max-w-sm py-4 px-5 bg-orange-800 hover:bg-orange-700 active:scale-95 text-white rounded-2xl shadow-xl transition-all flex items-center justify-center gap-3 font-medium text-xs md:text-sm cursor-pointer border border-orange-700/20 font-sans z-30 shrink-0 animate-fade-in-up"
              >
                <HeartHandshake className="w-4 h-4 md:w-5 md:h-5 text-orange-200 animate-pulse" />
                <span>{lang === 'pt' ? 'Conversar com alguém agora' : 'Connect with someone now'}</span>
              </button>
            )}

            {/* Interactive visual audio wave animation synced with speech input */}
            {isSpeechRecognitionRunning && (
              <div className="flex items-center justify-center space-x-1 w-full max-w-xs mt-4 h-10 px-4 bg-teal-900/10 border border-teal-950/20 rounded-full self-center z-20">
                <span className="text-[8px] font-mono font-bold text-teal-400/80 uppercase tracking-widest mr-2">{lang === 'pt' ? 'Frequência:' : 'Frequency:'}</span>
                {[...Array(15)].map((_, i) => {
                  const centerDist = Math.abs(i - 7);
                  const factor = Math.max(0.25, (8 - centerDist) / 8);
                  const dynamicHeight = 4 + (volume * 70 * factor) + (Math.sin(elapsedSeconds * 4 + i) * 5 * (volume > 0.015 ? 1 : 0.25));
                  return (
                    <span
                      key={i}
                      className="w-1 rounded-full bg-gradient-to-t from-teal-500 via-emerald-400 to-teal-300 transition-all duration-75"
                      style={{
                        height: `${Math.min(36, dynamicHeight)}px`,
                        opacity: volume > 0.015 ? 1.0 : 0.4,
                      }}
                    />
                  );
                })}
              </div>
            )}

             {/* Supportive Speech Recognition Diagnostic Tip */}
             {speechRecError && speechRecError !== 'aborted' && speechRecError !== 'no-speech' && (
               <div className="mt-4 w-full max-w-sm px-4 py-3 bg-red-950/20 backdrop-blur-md border border-red-500/30 rounded-2xl text-center leading-relaxed shadow-lg z-20 animate-none">
                 <div className="flex items-center justify-center space-x-1 mb-1.5 py-0.5 px-2 rounded-full w-fit mx-auto bg-red-900/10">
                   <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                   <span className="text-[8px] font-bold text-red-400 uppercase tracking-widest font-mono">
                     {lang === 'pt' ? 'Sinal de Voz Restrito' : 'Voice Signal Restrained'}
                   </span>
                 </div>
                 <p className="text-[11px] text-stone-300 leading-relaxed font-sans">
                   {speechRecError === 'not-allowed' ? (
                     lang === 'pt' 
                       ? 'O navegador suspendeu o reconhecimento de voz parcial. Certifique-se de liberar o microfone nos ajustes do site (clique no ícone de de cadeado).' 
                       : 'The browser suspended partial speech recognition. Please check your mic permissions in site settings (click the lock icon).'
                   ) : (
                     lang === 'pt'
                       ? `Não foi possível sintonizar a escuta de texto (${speechRecError}). O canal de voz principal com Dr. Evaldo continua ativo!`
                       : `Voice transcription suspended (${speechRecError}). The main streaming voice channel with Dr. Evaldo is still fully active!`
                   )}
                 </p>
               </div>
             )}

           {/* Custom Web Speech API Live Transcript Bubble */}
           {speechTranscript && (
             <div id="voice-transcript-bubble" className="mt-4 w-full max-w-sm px-4 py-3 bg-stone-950/80 backdrop-blur-md border border-teal-500/20 rounded-2xl text-center leading-relaxed font-sans shadow-lg shadow-teal-500/5 animate-none">
               <div className="flex items-center justify-center space-x-1 mb-1">
                 <span className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-bounce" />
                 <span className="text-[8px] font-bold text-teal-400 uppercase tracking-widest font-mono">
                   {lang === 'pt' ? 'Mente Fala (Reconhecido)' : 'Mind Speak (Recognized)'}
                 </span>
               </div>
               <p className="text-xs text-stone-200 font-medium font-sans">
                 "{speechTranscript}"
               </p>
             </div>
           )}
           
           {/* =========================================================
                MOTOR ADAPTATIVO PCH - MULTI-SENSORY CLINICAL DASHBOARDS
                ========================================================= */}
            {neuroMode === 'adhd' && (
              <div className="mt-4 p-3 bg-stone-900/40 border border-stone-850/60 rounded-2xl text-center max-w-sm w-full mx-auto">
                <span className="text-[9px] text-amber-400 uppercase tracking-widest font-bold block mb-1">🎯 FOCO DO DIA / FOCUS STATE</span>
                <p className="text-[11px] text-stone-300 leading-relaxed italic">
                  {lang === 'pt' ? '"Deixe de lado o ruído externo. Apenas uma palavra por vez."' : '"Leave external noise behind. Just one mindful word at a time."'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
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
        
        {/* Floating Ambient Sound Controller */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 p-2 px-4 bg-stone-900/40 backdrop-blur-xl border border-stone-850/80 rounded-[1.75rem] sm:rounded-full w-[95vw] sm:w-[90vw] max-w-xl shadow-lg transition-all duration-300 hover:border-teal-500/20">
          <div className="flex items-center space-x-1.5 border-r border-stone-850/80 pr-3.5 self-start sm:self-center">
            <Volume2 className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-[8.5px] font-mono font-bold tracking-widest text-stone-400">
              {lang === 'pt' ? 'AMBIENTE' : 'AMBIENT'}
            </span>
          </div>

          <div className="flex items-center space-x-1.5 flex-1 overflow-x-auto no-scrollbar py-0.5 w-full">
            {(['off', 'rain', 'forest', 'waves', 'deepspace'] as const).map(soundType => {
              const isActive = ambientSound === soundType;
              let emoji = '🔇';
              if (soundType === 'rain') emoji = '🌧️';
              if (soundType === 'forest') emoji = '🌲';
              if (soundType === 'waves') emoji = '🌊';
              if (soundType === 'deepspace') emoji = '🌌';

              return (
                <button
                  key={soundType}
                  onClick={() => {
                    setAmbientSound(soundType);
                    localStorage.setItem('pch_ambient_sound', soundType);
                    triggerVoiceAlert(lang === 'pt' ? `Ambiente: ${soundType === 'off' ? 'Silêncio' : soundType === 'rain' ? 'Chuva' : soundType === 'forest' ? 'Mata' : soundType === 'waves' ? 'Ondas' : 'Espaço'}` : `Atmosphere: ${soundType}`);
                  }}
                  className={`px-2.5 py-1 rounded-full text-[8.1px] font-bold uppercase tracking-widest font-mono transition-all flex items-center space-x-1.5 shrink-0 ${
                    isActive 
                      ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30' 
                      : 'text-stone-500 hover:text-stone-300 border border-transparent hover:bg-stone-850/10'
                  }`}
                >
                  <span>{emoji}</span>
                  <span>
                    {soundType === 'off' && (lang === 'pt' ? 'Silêncio' : 'Off')}
                    {soundType === 'rain' && (lang === 'pt' ? 'Chuva' : 'Rain')}
                    {soundType === 'forest' && (lang === 'pt' ? 'Mata' : 'Forest')}
                    {soundType === 'waves' && (lang === 'pt' ? 'Ondas' : 'Waves')}
                    {soundType === 'deepspace' && (lang === 'pt' ? 'Espaço' : 'Space')}
                  </span>
                </button>
              );
            })}
          </div>

          {ambientSound !== 'off' && (
            <div className="flex items-center space-x-2 w-full sm:w-[120px] border-t sm:border-t-0 sm:border-l border-stone-850/80 pt-1.5 sm:pt-0 sm:pl-3 mr-1">
              <span className="text-[8px] font-mono text-stone-500 font-semibold whitespace-nowrap min-w-[24px]">
                {Math.round(ambientVolume * 100)}%
              </span>
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
                className="w-full h-1 bg-stone-800 accent-teal-500 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>

        <div className="flex items-center justify-between w-[95vw] sm:w-[90vw] max-w-xl p-3 bg-stone-900/60 backdrop-blur-xl border border-stone-800 rounded-full shadow-2xl">
            
            {/* Left Buttons Group */}
            <div className="flex items-center space-x-1">
               <button 
                 id="onboarding-garden"
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

               <button 
                 onClick={onToggleMinimalMode} 
                 className={`p-3 transition-colors ${isMinimalMode ? 'text-teal-400 hover:text-teal-300' : 'text-stone-400 hover:text-stone-202'}`} 
                 title={isMinimalMode ? (lang === 'pt' ? 'Sair do Modo de Foco' : 'Exit Focus Mode') : (lang === 'pt' ? 'Modo de Foco Minimalista' : 'Minimalist Focus Mode')}
               >
                  {isMinimalMode ? <EyeOff className="w-5 h-5 animate-pulse" /> : <Eye className="w-5 h-5" />}
               </button>

               {onToggleFullyImmersive && (
                 <button 
                   onClick={onToggleFullyImmersive} 
                   className={`p-3 transition-colors ${isFullyImmersive ? 'text-teal-400 hover:text-teal-300' : 'text-stone-400 hover:text-stone-200'}`} 
                   title={isFullyImmersive ? (lang === 'pt' ? 'Sair da Imersão Total' : 'Exit Full Immersion') : (lang === 'pt' ? 'Imersão Total' : 'Full Immersion')}
                 >
                    {isFullyImmersive ? <EyeOff className="w-5 h-5 animate-pulse" /> : <Eye className="w-5 h-5" />}
                 </button>
               )}
            </div>
            
            {/* Main Central Mic Action */}
            <button 
                onClick={() => {
                  const newState = !isMicMuted;
                  setIsMicMuted(newState);
                  if (status === SessionStatus.CONNECTED) {
                    setShowPainelVoz(true);
                  }
                  if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(newState ? [30] : [50, 40, 50]);
                  }
                  if (!newState) {
                    triggerVoiceAlert(lang === 'pt' ? 'Microfone Ativado' : 'Microphone Activated');
                  } else {
                    triggerVoiceAlert(lang === 'pt' ? 'Microfone Mute / Silenciado' : 'Microphone Silenced');
                  }
                }}
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
                 onClick={handlePreDisconnect} 
                 disabled={isSavingSnapshot}
                 className="px-4 py-2.5 bg-stone-950/40 hover:bg-red-950/10 hover:border-red-900/30 border border-transparent text-stone-400 hover:text-red-400 transition-colors text-[9px] uppercase tracking-widest font-black rounded-full disabled:opacity-50"
               >
                 {isSavingSnapshot 
                   ? (lang === 'pt' ? 'Processando...' : 'Saving Snapshot...')
                   : (lang === 'pt' ? 'Sair' : 'Exit')}
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

               {/* Settings Tab Navigation */}
               <div className="grid grid-cols-2 gap-1 p-1 bg-stone-900/60 rounded-xl border border-stone-800">
                  <button
                     onClick={() => setSettingsTab('calibration')}
                     className={`py-2 text-[10px] uppercase font-bold tracking-widest font-mono rounded-lg transition-all ${
                        settingsTab === 'calibration'
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        : 'text-stone-500 hover:text-stone-300'
                     }`}
                  >
                     {lang === 'pt' ? '🔬 Calibração' : '🔬 Calibration'}
                  </button>
                  <button
                     onClick={() => setSettingsTab('overview')}
                     className={`py-2 text-[10px] uppercase font-bold tracking-widest font-mono rounded-lg transition-all ${
                        settingsTab === 'overview'
                        ? 'bg-teal-500/10 text-teal-400 border border-teal-500/20'
                        : 'text-stone-500 hover:text-stone-300'
                     }`}
                  >
                     {lang === 'pt' ? '📖 Visão Geral (PCH)' : '📖 Voice Overview'}
                  </button>
               </div>

              <div className="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar pr-1">
                 
                 {settingsTab === 'overview' ? (
                     <div className="space-y-4 text-left font-sans select-none pb-4">
                        <div className="p-4 bg-teal-950/10 border border-teal-900/30 rounded-2xl space-y-2">
                           <h4 className="text-xs font-serif font-black uppercase text-teal-300 tracking-wide">
                              {lang === 'pt' ? 'Como a Voz do Dr. Evaldo se Adapta 🧬' : 'How Dr. Evaldo\'s Voice Adapts 🧬'}
                           </h4>
                           <p className="text-[10px] text-stone-400 leading-relaxed font-light">
                              {lang === 'pt' 
                                 ? 'A Poesia Cognitiva Hipnótica (PCH) modula dinamicamente a velocidade, a tonalidade de som (altura) e os filtros ambientais para oferecer o máximo conforto e processamento ideal para cada perfil neurodivergente.' 
                                 : 'Hypnotic Cognitive Poetry (PCH) dynamically modulates pitch, pace, and sound triggers to match cognitive processing needs across all neuroprofiles.'}
                           </p>
                        </div>

                        <div className="space-y-2.5">
                           {[
                              {
                                 id: 'natural',
                                 icon: '🍃',
                                 namePt: 'Neurotípico (Padrão)',
                                 nameEn: 'Neurotypical (Default)',
                                 rate: '1.00x',
                                 pitch: '1.00x',
                                 filterPt: 'Silêncio Terrestre',
                                 filterEn: 'Terrestrial Silence',
                                 descPt: 'Padrão estável ideal para escuta e relaxamento geral de nível diário.',
                                 descEn: 'Standard stable pacing suited for day-to-day mindfulness loops.'
                              },
                              {
                                 id: 'adhd',
                                 icon: '⚡',
                                 namePt: 'TDAH (Foco Dinâmico)',
                                 nameEn: 'ADHD (Dynamic Focus)',
                                 rate: '1.15x',
                                 pitch: '1.05x',
                                 filterPt: 'Ruído Branco (Espaço)',
                                 filterEn: 'Atomic Focus (Space)',
                                 descPt: 'Estímulo rápido de cadência rítmica para prender ganchos de atenção de TDAH.',
                                 descEn: 'Fast active spacing designed to maintain focus and attention anchoring.'
                              },
                              {
                                 id: 'autism',
                                 icon: '🧩',
                                 namePt: 'Autismo (Estruturado)',
                                 nameEn: 'Autism (Structured)',
                                 rate: '0.85x',
                                 pitch: '0.90x',
                                 filterPt: 'Silêncio Previsível',
                                 filterEn: 'Predictable Calm',
                                 descPt: 'Voz constante e tons graves com mínima sobrecarga sensorial acústica.',
                                 descEn: 'Smooth predictable cadence with reduced auditory load and high stability.'
                              },
                              {
                                 id: 'anxiety',
                                 icon: '🌬️',
                                 namePt: 'Ansiedade (Respirador)',
                                 nameEn: 'Anxiety (Comfort-Breathe)',
                                 rate: '0.78x',
                                 pitch: '0.88x',
                                 filterPt: 'Chuva Reconfortante',
                                 filterEn: 'Luminous Rain',
                                 descPt: 'Cadência compassiva sincronizada com ciclos de ancoragem física e calma.',
                                 descEn: 'Deep soothing breath gaps with comforting low frequencies to soothe heart rate.'
                              },
                              {
                                 id: 'senior',
                                 icon: '👵',
                                 namePt: 'Idoso (Clareza)',
                                 nameEn: 'Seniors (Clear Connection)',
                                 rate: '0.82x',
                                 pitch: '0.95x',
                                 filterPt: 'Sons do Bosque (Mata)',
                                 filterEn: 'Clear Forest Sounds',
                                 descPt: 'Enunciação clara, contrastes sonoros elevados e suporte vocal amigável.',
                                 descEn: 'Slower, highly articulate parameters with memory guidance support.'
                              },
                              {
                                 id: 'child',
                                 icon: '👶',
                                 namePt: 'Infantil (Lúdico)',
                                 nameEn: 'Children (Playful Space)',
                                 rate: '1.05x',
                                 pitch: '1.15x',
                                 filterPt: 'Eco das Estrelas (Espaço)',
                                 filterEn: 'Stellar Echoes',
                                 descPt: 'Frases coloridas, tom alegre elevado de fada e narrativa animada.',
                                 descEn: 'Warm lighthearted delivery with rewarding tones for playful interactions.'
                              },
                              {
                                 id: 'down',
                                 icon: '❤️',
                                 namePt: 'S. Down (Acessível)',
                                 nameEn: 'Down Syndrome (Assistive)',
                                 rate: '0.85x',
                                 pitch: '1.00x',
                                 filterPt: 'Sons do Bosque',
                                 filterEn: 'Forest Ambient',
                                 descPt: 'Tom doce, tempo de processamento estendido e botões expandidos.',
                                 descEn: 'Patience-centric delay intervals with warm vocal guidance reinforcement.'
                              },
                              {
                                 id: 'dyslexia',
                                 icon: '📚',
                                 namePt: 'Dislexia (Áudio Tutor)',
                                 nameEn: 'Dyslexia (Audio Reader)',
                                 rate: '0.95x',
                                 pitch: '1.00x',
                                 filterPt: 'Melodia PCH (Vento)',
                                 filterEn: 'Melodic Wind',
                                 descPt: 'Tom rítmico que facilita a absorção auditiva integral e apoio fonético.',
                                 descEn: 'Melodic phonetic flow designed to replace complex written hurdles with audio.'
                              },
                              {
                                 id: 'gifted',
                                 icon: '🌌',
                                 namePt: 'A. Habilidades (Denso)',
                                 nameEn: 'Gifted (Conceptual Matrix)',
                                 rate: '1.25x',
                                 pitch: '1.00x',
                                 filterPt: 'Espaço Cósmico',
                                 filterEn: 'Deep Cosmic Resonance',
                                 descPt: 'Vocabulário denso, rítmica ágil e conexões de alta velocidade analítica.',
                                 descEn: 'Fast conceptual delivery for rapid mental schema processing.'
                              },
                              {
                                 id: 'burnout',
                                 icon: '🔥',
                                 namePt: 'Burnout (Descompressão)',
                                 nameEn: 'Burnout (Decompression)',
                                 rate: '0.80x',
                                 pitch: '0.90x',
                                 filterPt: 'Chuva Reconfortante',
                                 filterEn: 'Restorative Rain',
                                 descPt: 'Voz calma e sem exigência alguma para reabastecimento bio-energético.',
                                 descEn: 'Quiet non-demanding flow focusing on absolute recovery and rest.'
                              },
                              {
                                 id: 'grief',
                                 icon: 'rose',
                                 namePt: 'Luto (Acolhimento)',
                                 nameEn: 'Grief (Empathy Anchor)',
                                 rate: '0.75x',
                                 pitch: '0.85x',
                                 filterPt: 'Silêncio Terrestre',
                                 filterEn: 'Sanctuary Silence',
                                 descPt: 'Compassividade amorosa sem cobranças para honrar seus sentimentos.',
                                 descEn: 'Warm compassionate safety designed to gently console and hold memories.'
                              }
                           ].map((prof) => (
                              <div key={prof.id} className="p-3 bg-stone-900 border border-stone-850 rounded-2xl space-y-1.5 hover:border-teal-500/20 transition-all">
                                 <div className="flex justify-between items-center bg-transparent">
                                    <div className="flex items-center space-x-1.5 text-xs font-bold text-stone-200">
                                       <span>{prof.icon === 'rose' ? '🌹' : prof.icon}</span>
                                       <span>{lang === 'pt' ? prof.namePt : prof.nameEn}</span>
                                    </div>
                                    <div className="flex items-center space-x-1">
                                       <span className="text-[8px] font-mono bg-stone-950 border border-stone-850 px-1 py-0.5 rounded text-stone-400">
                                          {lang === 'pt' ? 'Vel: ' : 'Spd: '}{prof.rate}
                                       </span>
                                       <span className="text-[8px] font-mono bg-stone-950 border border-stone-850 px-1 py-0.5 rounded text-stone-400">
                                          {lang === 'pt' ? 'Tom: ' : 'Pch: '}{prof.pitch}
                                       </span>
                                    </div>
                                 </div>
                                 
                                 <p className="text-[9.5px] text-stone-400 leading-relaxed font-light">
                                    {lang === 'pt' ? prof.descPt : prof.descEn}
                                 </p>
                                 
                                 <div className="flex items-center space-x-1 bg-transparent">
                                    <span className="text-[8px] font-mono text-teal-400 font-bold uppercase tracking-wider">{lang === 'pt' ? 'Atmosfera: ' : 'Sound: '}</span>
                                    <span className="text-[8px] font-mono text-stone-400">{lang === 'pt' ? prof.filterPt : prof.filterEn}</span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     </div>
                 ) : (
                     <div className="space-y-4">
                        {/* Motor Adaptativo PCH Engine System Stats */}
                 <div className="p-4 bg-teal-950/10 border border-teal-900/30 rounded-xl flex flex-col space-y-3 font-sans text-left">
                    <div className="flex items-center space-x-2">
                       <Activity className="w-4 h-4 text-teal-400 animate-pulse" />
                       <span className="text-xs font-bold text-teal-300 uppercase tracking-widest">{lang === 'pt' ? 'Motor Adaptativo' : 'PCH Adaptive Engine'}</span>
                       <div className="bg-teal-500/10 border border-teal-500/30 px-1.5 py-0.5 rounded text-[8px] text-teal-400 font-mono tracking-wide uppercase">
                         {lang === 'pt' ? 'Ativo' : 'Active'}
                       </div>
                    </div>
                    <p className="text-[10px] text-stone-400 leading-relaxed font-light">
                       {lang === 'pt' 
                          ? 'Mapeia seu neurotipo e sentimento ativo para sintonizar a interface, relaxamento, e cadência de voz de Dr. Evaldo.' 
                          : 'Maps your active neurotype and feelings to perfectly synchronize interface layers, colors, and Dr. Evaldo\'s vocal delivery.'}
                    </p>
                    
                    <div className="grid grid-cols-2 gap-2 pt-1">
                       <div className="p-2 bg-stone-950 border border-stone-900 rounded-lg flex flex-col">
                          <span className="text-[8px] text-stone-500 uppercase tracking-wider">{lang === 'pt' ? 'Cadência de Voz' : 'Vocal Spacing'}</span>
                          <span className="text-xs text-stone-200 font-mono font-bold">{adaptivoConfig.voiceRate.toFixed(2)}x</span>
                       </div>
                       <div className="p-2 bg-stone-950 border border-stone-900 rounded-lg flex flex-col">
                          <span className="text-[8px] text-stone-500 uppercase tracking-wider">{lang === 'pt' ? 'Tom de Voz' : 'Vocal Pitch'}</span>
                          <span className="text-xs text-stone-200 font-mono font-bold">{adaptivoConfig.voicePitch.toFixed(2)}x</span>
                       </div>
                       <div className="p-2 bg-stone-950 border border-stone-900 rounded-lg flex flex-col">
                          <span className="text-[8px] text-stone-500 uppercase tracking-wider">{lang === 'pt' ? 'Atmosfera Ativa' : 'Active Vibe'}</span>
                          <span className="text-xs text-teal-400 font-mono uppercase font-bold text-ellipsis overflow-hidden whitespace-nowrap">{adaptivoConfig.visualAtmosphere}</span>
                       </div>
                       <div className="p-2 bg-stone-950 border border-stone-900 rounded-lg flex flex-col">
                          <span className="text-[8px] text-stone-500 uppercase tracking-wider">{lang === 'pt' ? 'Acessibilidade' : 'Accessibility'}</span>
                          <span className="text-xs text-stone-200 font-mono font-bold">{adaptivoConfig.accessibilityOptimized ? 'ON' : 'OFF'}</span>
                       </div>
                    </div>
                 </div>

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
                    <div className="grid grid-cols-5 gap-1.5 p-1 bg-stone-950 border border-stone-900 rounded-lg">
                       {(['off', 'rain', 'forest', 'waves', 'deepspace'] as const).map(soundType => (
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
                             {soundType === 'off' && (lang === 'pt' ? 'Desl.' : 'Off')}
                             {soundType === 'rain' && (lang === 'pt' ? 'Chuva' : 'Rain')}
                             {soundType === 'forest' && (lang === 'pt' ? 'Mata' : 'Forest')}
                             {soundType === 'waves' && (lang === 'pt' ? 'Ondas' : 'Waves')}
                              {soundType === 'deepspace' && (lang === 'pt' ? 'Espaço' : 'Space')}
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
                 <div className="p-4 bg-stone-900/30 border border-stone-800 rounded-xl flex flex-col space-y-4 font-sans text-left">
                    <div className="flex flex-col space-y-1">
                       <span className="text-xs font-black text-stone-200 uppercase tracking-widest">{lang === 'pt' ? 'Perfis de Voz (Web Synthesis)' : 'Voice Personas (Web Synthesis)'}</span>
                       <span className="text-[8.5px] text-stone-500 mb-1 leading-relaxed">
                          {lang === 'pt' ? 'Selecione uma persona vocal ou configure um tom exclusivo personalizado.' : 'Choose a synthetic vocal identity or calibrate a custom vocal footprint.'}
                       </span>
                    </div>

                    {/* Voice Persona Presets Grid */}
                    <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-stone-950 border border-stone-900 rounded-xl">
                       {(['natural', 'elder', 'supporter', 'poet', 'playful', 'custom'] as const).map((persona) => {
                          const label = {
                             natural: lang === 'pt' ? '🍃 Padrão' : '🍃 Default',
                             elder: lang === 'pt' ? '👵 Sábio' : '👵 Wise',
                             supporter: lang === 'pt' ? '✨ Acolhedor' : '✨ Soft',
                             poet: lang === 'pt' ? '🌹 Poeta' : '🌹 Poet',
                             playful: lang === 'pt' ? '🎈 Brincalhão' : '🎈 Playful',
                             custom: lang === 'pt' ? '⚙️ Ajustes' : '⚙️ Custom'
                          }[persona];
                          return (
                             <button
                                key={persona}
                                onClick={() => setVoicePersona(persona)}
                                className={`px-2 py-2 text-[9px] font-mono uppercase tracking-wider rounded-lg border transition-all ${
                                   voicePersona === persona 
                                   ? 'bg-gradient-to-r from-teal-950/40 to-teal-900/30 border-teal-500/50 text-teal-300 font-bold shadow-sm shadow-teal-500/5' 
                                   : 'bg-transparent border-transparent text-stone-500 hover:text-stone-300 hover:bg-stone-900/20'
                                }`}
                             >
                                {label}
                             </button>
                          );
                       })}
                    </div>

                    {/* Dynamic Options depending on customization */}
                    <div className="flex flex-col space-y-3.5 pt-1 border-t border-stone-900">
                       {/* Selector of Active Accent Vocal */}
                       <div className="flex flex-col space-y-1.5">
                          <div className="flex justify-between items-center">
                             <span className="text-[9px] text-stone-400 uppercase tracking-widest font-bold">
                                {lang === 'pt' ? 'Sotaque / Accent Vocal' : 'Vocal Accent Profile'}
                             </span>
                             {selectedVoiceURI && (
                                <button 
                                   onClick={() => {
                                      setSelectedVoiceURI('');
                                      setVoicePersona('natural');
                                   }}
                                   className="text-[8px] text-teal-400/80 hover:text-teal-300 underline font-mono"
                                >
                                   {lang === 'pt' ? 'Reset' : 'Reset'}
                                </button>
                             )}
                          </div>
                          {browserVoices.length === 0 ? (
                             <div className="text-[9px] text-stone-600 italic">
                                {lang === 'pt' ? 'Carregando sotaques do navegador...' : 'Loading browser voice list...'}
                             </div>
                          ) : (
                             <select
                                value={selectedVoiceURI}
                                onChange={(e) => {
                                   setSelectedVoiceURI(e.target.value);
                                   setVoicePersona('custom');
                                }}
                                className="w-full text-[10px] font-mono bg-stone-950 text-stone-200 border border-stone-850 p-2 rounded-xl focus:border-teal-500/40 focus:outline-none cursor-pointer"
                             >
                                <option value="">
                                   {lang === 'pt' ? '🍃 Automático (Voz Padrão do Sistema)' : '🍃 Automatic (System Default Voice)'}
                                </option>
                                {browserVoices
                                   .filter(v => v.lang.startsWith(lang === 'pt' ? 'pt' : 'en'))
                                   .map((v, idx) => (
                                      <option key={idx} value={v.voiceURI}>
                                         {v.name} ({v.lang})
                                      </option>
                                   ))
                                }
                                {/* Other languages as fallback */}
                                {browserVoices
                                   .filter(v => !v.lang.startsWith(lang === 'pt' ? 'pt' : 'en'))
                                   .map((v, idx) => (
                                      <option key={`fallback-${idx}`} value={v.voiceURI}>
                                         {v.name} ({v.lang})
                                      </option>
                                   ))
                                }
                             </select>
                          )}
                       </div>

                       {/* Speed Rate Slider */}
                       <div className="flex flex-col space-y-1">
                          <div className="flex justify-between items-center text-[9px] text-stone-500 uppercase tracking-widest">
                             <span>{lang === 'pt' ? 'Velocidade Vocal' : 'Vocal Speed'}</span>
                             <span className="text-teal-400 font-mono font-bold">{speechRate.toFixed(2)}x</span>
                          </div>
                          <input 
                             type="range"
                             min="0.5"
                             max="1.5"
                             step="0.05"
                             value={speechRate}
                             onChange={(e) => {
                                setSpeechRate(parseFloat(e.target.value));
                                setVoicePersona('custom');
                             }}
                             className="w-full accent-teal-500 h-1.5 bg-stone-850 rounded appearance-none cursor-pointer"
                          />
                       </div>

                       {/* Pitch Slider */}
                       <div className="flex flex-col space-y-1">
                          <div className="flex justify-between items-center text-[9px] text-stone-500 uppercase tracking-widest">
                             <span>{lang === 'pt' ? 'Frequência de Tom' : 'Vocal Pitch'}</span>
                             <span className="text-teal-400 font-mono font-bold">{voicePitch.toFixed(2)}x</span>
                          </div>
                          <input 
                             type="range"
                             min="0.5"
                             max="1.5"
                             step="0.05"
                             value={voicePitch}
                             onChange={(e) => {
                                setVoicePitch(parseFloat(e.target.value));
                                setVoicePersona('custom');
                             }}
                             className="w-full accent-teal-500 h-1.5 bg-stone-850 rounded appearance-none cursor-pointer"
                          />
                       </div>
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
				)}
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

      {/* Confetti & Cosmic Celebration Animation Layer */}
      {showCelebration && (
        <div className="absolute inset-0 bg-stone-950/90 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-hidden">
          {/* Cosmic upward floating stars */}
          {[...Array(15)].map((_, i) => (
            <Particle key={i} delay={i * 0.3} x={Math.random() * 90 + 5} />
          ))}

          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full max-w-sm bg-stone-900/40 border border-teal-500/20 rounded-[2.5rem] p-8 text-center relative shadow-2xl shadow-teal-500/5 flex flex-col items-center select-none"
          >
            {/* Pulsing Backlight */}
            <div className="absolute inset-0 bg-gradient-to-b from-teal-500/5 to-transparent rounded-[2.5rem] pointer-events-none" />

            {/* Rotating Sacred Geometry Mandalas */}
            <div className="relative mb-6">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="w-24 h-24 rounded-full border border-teal-500/30 flex items-center justify-center p-1"
              >
                <div className="w-full h-full rounded-full border-2 border-dashed border-teal-400/20" />
              </motion.div>
              <div className="absolute inset-0 flex items-center justify-center">
                {celebrationType === 'level' ? (
                  <motion.div 
                    initial={{ rotate: -180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 10 }}
                    className="w-14 h-14 bg-teal-500/15 border border-teal-500/40 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/10 text-teal-300 font-mono text-xl font-bold"
                  >
                    Lvl {unlockedItemName}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ rotate: 180, scale: 0 }}
                    animate={{ rotate: 0, scale: 1 }}
                    transition={{ type: "spring", stiffness: 100, damping: 10 }}
                  >
                    <Award className="w-12 h-12 text-teal-400 drop-shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                  </motion.div>
                )}
              </div>
            </div>

            {/* Typography Heading */}
            <motion.h3 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xs uppercase tracking-[0.25em] text-teal-400 font-bold font-mono"
            >
              {lang === 'pt' ? 'Sincronização Completa' : 'Synchronization Complete'}
            </motion.h3>

            <motion.h4
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl font-light font-serif text-stone-200 mt-2 tracking-wide"
            >
              {celebrationType === 'level' 
                ? (lang === 'pt' ? 'Novo Nível Conquistado!' : 'New Level Earned!') 
                : (lang === 'pt' ? 'Medalha Desbloqueada!' : 'Badge Unlocked!')}
            </motion.h4>

            {/* Badge or Level name details with ambient feedback */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="mt-4 px-4 py-2 bg-teal-500/5 border border-teal-500/10 rounded-full inline-block"
            >
              <span className="text-stone-300 text-xs font-mono font-medium">
                {celebrationType === 'level' 
                  ? (lang === 'pt' ? `Nível ${unlockedItemName} atingido` : `Level ${unlockedItemName} reached`)
                  : unlockedItemName}
              </span>
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-[10px] text-stone-500 font-mono mt-4 leading-relaxed max-w-xs"
            >
              {lang === 'pt' 
                ? 'Sua ressonância cresce a cada interação. Suas conquistas estão guardadas e integradas ao seu santuário interno.'
                : 'Your resonance expands with every interaction. Your milestones are preserved and integrated into your inner sanctuary.'}
            </motion.p>

            {/* Interactive portal exit to main controller */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              onClick={() => {
                setShowCelebration(false);
                onDisconnect();
              }}
              className="mt-8 px-8 py-3 bg-teal-500 hover:bg-teal-400 hover:scale-105 active:scale-95 text-stone-950 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-teal-500/20 cursor-pointer pointer-events-auto"
            >
              {lang === 'pt' ? 'Integrar ao Painel' : 'Integrate to Panel'}
            </motion.button>
          </motion.div>
        </div>
      )}

      <AnimatePresence>
        {showPainelVoz && status === SessionStatus.CONNECTED && (
          <PainelDaVozAtivo
            fecharPainel={() => setShowPainelVoz(false)}
            lang={lang}
            isMicMuted={isMicMuted}
            onToggleMute={() => {
              const newState = !isMicMuted;
              setIsMicMuted(newState);
              if (typeof navigator !== 'undefined' && navigator.vibrate) {
                navigator.vibrate(newState ? [30] : [50, 40, 50]);
              }
              if (!newState) {
                triggerVoiceAlert(lang === 'pt' ? 'Microfone Ativado' : 'Microphone Activated');
              } else {
                triggerVoiceAlert(lang === 'pt' ? 'Microfone Mute / Silenciado' : 'Microphone Silenced');
              }
            }}
            onDisconnect={handlePreDisconnect}
            volume={volume}
            isUserSpeaking={isUserSpeaking}
            isAiSpeaking={isAiSpeaking}
            speechTranscript={speechTranscript}
            aiSpeechText={aiSpeechText}
            elapsedSeconds={elapsedSeconds}
            onTriggerSupport={() => {
              setShowPainelVoz(false);
              setShowReferral(true);
            }}
          />
        )}
      </AnimatePresence>

    </div>
  );
};

export default SessionManager;
