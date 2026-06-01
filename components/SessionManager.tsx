
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { SessionStatus, Language, UserPlan, User } from '../types';
import { getSystemInstruction, MODEL_NAME, TRANSLATIONS, VOICE_IDS, PLAN_LIMITS } from '../constants';
import AudioVisualizer from './AudioVisualizer';
// Fix: Corrected Logo import from named to default
import Logo from './Logo';

interface SessionManagerProps {
  onDisconnect: () => void;
  lang: Language;
  userPlan: UserPlan;
  onUpgrade: () => void;
  currentUser?: User | null;
}

// Icons
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

const LockIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
  </svg>
);

const MAX_SENSITIVITY_RANGE = 0.2;

// Fix: Helper functions for audio encoding/decoding as per @google/genai guidelines
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
  const [voice, setVoice] = useState<'male' | 'female'>('male');
  const [voicePitch, setVoicePitch] = useState(1.0);
  const [speechRate, setSpeechRate] = useState(1.0);

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);

  const text = TRANSLATIONS[lang];
  const accMode = currentUser?.accessibilityMode || false;

  const cleanupAudio = useCallback(() => {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (audioContextRef.current) audioContextRef.current.close();
  }, []);

  const connectToGemini = useCallback(async () => {
    try {
      if (!process.env.API_KEY) throw new Error("API Key Missing.");
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = audioCtx;

      const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = mediaStream;

      const currentTime = new Date().toLocaleTimeString(lang);
      const voiceInstruction = `\n\n**ESTILO DE VOZ ATUAL:**
      - Velocidade: ${speechRate}x (0.5x é muito lento, 1.5x é rápido).
      - Tom: ${voicePitch > 1 ? 'Mais agudo/feminino' : voicePitch < 1 ? 'Mais grave/masculino' : 'Normal'}.
      Por favor, ajuste seu ritmo e entonação para refletir essas configurações.`;
      
      const instruction = getSystemInstruction(lang, currentTime, accMode) + voiceInstruction;

      const sessionPromise = ai.live.connect({
        model: MODEL_NAME,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: VOICE_IDS[voice] } },
          },
          // Fix: systemInstruction should be a string in Live API config
          systemInstruction: instruction,
        },
        callbacks: {
          onopen: () => setStatus(SessionStatus.CONNECTED),
          onmessage: async (message: LiveServerMessage) => {
            const base64Audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
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

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const source = inputCtx.createMediaStreamSource(mediaStream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      source.connect(processor);
      processor.connect(inputCtx.destination);
      
      processor.onaudioprocess = (e) => {
          if (isMicMuted) return;
          const input = e.inputBuffer.getChannelData(0);
          
          // Audio level detection for visualizer
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
  }, [lang, voice, accMode, inputSensitivity, isMicMuted]);

  useEffect(() => {
    connectToGemini();
    const t = setInterval(() => setElapsedSeconds(s => s + 1), 1000);
    return () => { cleanupAudio(); clearInterval(t); };
  }, [connectToGemini, cleanupAudio]);

  if (status === SessionStatus.ERROR) return <div className="p-8 text-center text-stone-400">{errorMsg}</div>;

  return (
    <div className="relative flex flex-col items-center justify-between w-full h-full p-6 overflow-hidden bg-stone-950">
      
      {/* Header Info */}
      <div className="w-full flex justify-between items-start z-10">
         <div className="flex items-center space-x-3">
            <Logo className="w-5 h-5 text-teal-400" />
            <div className="flex flex-col">
              <span className="font-serif text-lg text-stone-200">{text.title}</span>
              {accMode && <span className="text-[8px] text-teal-500 uppercase tracking-widest">Modo Acessível Ativo</span>}
            </div>
         </div>
         <div className="font-mono text-[10px] text-stone-500">{Math.floor(elapsedSeconds/60)}:{(elapsedSeconds%60).toString().padStart(2,'0')}</div>
      </div>

      {/* Visualizer */}
      <div className="flex-1 flex items-center justify-center w-full">
         <AudioVisualizer volume={volume} isActive={isUserSpeaking || isAiSpeaking} color={isAiSpeaking ? "rgb(20, 184, 166)" : "rgb(168, 162, 158)"} />
      </div>

      {/* Settings Modal */}
      {showSettings && (
         <div className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-stone-900 border border-stone-800 p-6 rounded-2xl z-40 w-80 shadow-2xl">
            <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                    <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">{text.settings?.title}</span>
                    <button onClick={() => setShowSettings(false)} className="text-stone-500 hover:text-stone-200">✕</button>
                </div>
                
                <div className="space-y-3">
                     <label className="text-[10px] text-stone-400 uppercase tracking-wider">{text.settings?.voice}</label>
                     <div className="grid grid-cols-2 gap-2">
                         <button onClick={() => setVoice('male')} className={`py-2 text-[10px] rounded-lg border ${voice === 'male' ? 'border-teal-500 text-teal-200 bg-teal-900/20' : 'border-stone-800 text-stone-500'}`}>{text.settings?.male}</button>
                         <button onClick={() => setVoice('female')} className={`py-2 text-[10px] rounded-lg border ${voice === 'female' ? 'border-teal-500 text-teal-200 bg-teal-900/20' : 'border-stone-800 text-stone-500'}`}>{text.settings?.female}</button>
                     </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] text-stone-400 uppercase tracking-wider">{text.settings?.sensitivity}</label>
                    <input type="range" min="0.001" max={MAX_SENSITIVITY_RANGE} step="0.001" value={inputSensitivity} onChange={(e)=>setInputSensitivity(parseFloat(e.target.value))} className="w-full accent-teal-500" />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-stone-400 uppercase tracking-wider">
                      <span>{text.settings?.speed}</span>
                      <span className="text-teal-500">{speechRate}x</span>
                    </div>
                    <input type="range" min="0.5" max="1.5" step="0.1" value={speechRate} onChange={(e)=>setSpeechRate(parseFloat(e.target.value))} className="w-full accent-teal-500" />
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] text-stone-400 uppercase tracking-wider">
                      <span>{text.settings?.pitch}</span>
                      <span className="text-teal-500">{voicePitch > 1 ? text.settings?.pitchAgudo : voicePitch < 1 ? text.settings?.pitchGrave : 'Normal'}</span>
                    </div>
                    <input type="range" min="0.5" max="1.5" step="0.1" value={voicePitch} onChange={(e)=>setVoicePitch(parseFloat(e.target.value))} className="w-full accent-teal-500" />
                </div>
            </div>
         </div>
      )}

      {/* Main Control Deck */}
      <div className="flex flex-col items-center space-y-6 w-full pb-8">
        <div className="flex items-center justify-between w-[90vw] max-w-md p-4 bg-stone-900/60 backdrop-blur-xl border border-stone-700/50 rounded-full shadow-2xl">
            <button onClick={() => setShowSettings(!showSettings)} className="p-3 text-stone-400 hover:text-stone-200 transition-colors"><SettingsIcon className="w-5 h-5" /></button>
            
            <button 
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMicMuted ? 'bg-red-950/20 border border-red-900/30 text-red-500' : 'bg-stone-800 border border-stone-600 text-stone-200 shadow-lg shadow-teal-500/10'}`}
            >
                {isMicMuted ? <MicOffIcon className="w-6 h-6" /> : <MicIcon className="w-6 h-6" />}
            </button>

            <button onClick={onDisconnect} className="p-3 text-stone-500 hover:text-red-400 transition-colors text-[10px] uppercase tracking-widest font-bold">Sair</button>
        </div>
      </div>

    </div>
  );
};

export default SessionManager;
