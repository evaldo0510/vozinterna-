import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mic, MicOff, Pause, Play, Square, SlidersHorizontal, ChevronDown, Check, Volume2, HeartHandshake } from 'lucide-react';
import { Language } from '../types';

interface PainelDaVozAtivoProps {
  fecharPainel: () => void;
  lang: Language;
  isMicMuted: boolean;
  onToggleMute: () => void;
  onDisconnect: () => void;
  volume: number; // real voice amplitude value (0 - 1)
  isUserSpeaking: boolean;
  isAiSpeaking: boolean;
  speechTranscript: string;
  aiSpeechText: string;
  elapsedSeconds: number;
  onTriggerSupport?: () => void;
}

export const PainelDaVozAtivo: React.FC<PainelDaVozAtivoProps> = ({
  fecharPainel,
  lang,
  isMicMuted,
  onToggleMute,
  onDisconnect,
  volume = 0,
  isUserSpeaking,
  isAiSpeaking,
  speechTranscript,
  aiSpeechText,
  elapsedSeconds,
  onTriggerSupport,
}) => {
  const [escutando, setEscutando] = useState(!isMicMuted);
  const [textoCapturado, setTextoCapturado] = useState('');

  // Sync state with mic mute status
  useEffect(() => {
    setEscutando(!isMicMuted);
  }, [isMicMuted]);

  // Sync transcription or AI speech text dynamically
  useEffect(() => {
    // If AI is actively speaking, display the AI speech in the transcript area
    if (isAiSpeaking && aiSpeechText) {
      setTextoCapturado(aiSpeechText.replace('[PONTE_HUMANA]', '').trim());
    } else if (speechTranscript) {
      setTextoCapturado(speechTranscript);
    } else {
      setTextoCapturado(
        lang === 'pt'
          ? "Estou ouvindo você. Pode falar no seu tempo..."
          : "I am listening. Please speak at your own pace..."
      );
    }
  }, [speechTranscript, aiSpeechText, isAiSpeaking, lang]);

  // Simulação do pulsar do microfone, mas acoplado às ondas orgânicas reais de som!
  const [pulso, setPulso] = useState(false);
  useEffect(() => {
    if (!escutando) return;
    const intervalo = setInterval(() => setPulso(p => !p), 1500);
    return () => clearInterval(intervalo);
  }, [escutando]);

  // Custom organic scale for the microfone ring
  const pulseScale = escutando 
    ? 1 + (volume * 1.5) + (pulso ? 0.08 : 0)
    : 1;

  // Real-time Canvas Frequency Visualizer implementation
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const frequencies = useRef<number[]>(new Array(48).fill(2));
  const phaseRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = 40; // wrap around the 80px mic button
      const numPoints = frequencies.current.length;
      
      phaseRef.current += 0.035;

      // Update frequency levels with smooth interpolation and natural fluctuations
      for (let i = 0; i < numPoints; i++) {
        const waveOffset = Math.sin(phaseRef.current + i * 0.4) * 3;
        const currentIntensity = volume; 
        
        let targetValue = 2;
        if (isAiSpeaking) {
          // Simulated high-frequency responses when AI is actively speaking
          const harmonic = Math.sin(phaseRef.current * 2.5 + i * 0.8) * 12;
          targetValue = 6 + Math.abs(harmonic) * (0.35 + Math.random() * 0.35);
        } else if (escutando) {
          // Live microphone amplitude reaction
          const randomJitter = Math.random() * 6 * (currentIntensity > 0.015 ? 1 : 0.15);
          targetValue = 2 + (currentIntensity * 60 * (0.3 + Math.abs(Math.sin((i / numPoints) * Math.PI)) * 0.7)) + waveOffset + randomJitter;
        }

        // Dampen back to rest if inactive
        if (targetValue < 2) targetValue = 2;

        // Smooth spring ease
        frequencies.current[i] += (targetValue - frequencies.current[i]) * 0.22;
      }

      // Draw beautiful dynamic aura rings
      if (escutando || isAiSpeaking) {
        ctx.beginPath();
        ctx.arc(cx, cy, baseRadius - 2, 0, Math.PI * 2);
        ctx.strokeStyle = isAiSpeaking 
          ? 'rgba(14, 165, 233, 0.08)' 
          : 'rgba(16, 185, 129, 0.08)';
        ctx.lineWidth = 14 + (volume * 20);
        ctx.stroke();
      }

      // Draw individual radial wave bands
      for (let i = 0; i < numPoints; i++) {
        const angle = (i / numPoints) * Math.PI * 2;
        const val = frequencies.current[i];
        
        // Compute starting and ending points
        const x1 = cx + Math.cos(angle) * baseRadius;
        const y1 = cy + Math.sin(angle) * baseRadius;
        const x2 = cx + Math.cos(angle) * (baseRadius + val);
        const y2 = cy + Math.sin(angle) * (baseRadius + val);

        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);

        // Styling gradient color based on voice actor
        const grad = ctx.createLinearGradient(x1, y1, x2, y2);
        if (isAiSpeaking) {
          grad.addColorStop(0, 'rgba(14, 165, 233, 0.75)'); // Sky-500 aura/AI focus
          grad.addColorStop(0.5, 'rgba(56, 189, 248, 0.4)'); 
          grad.addColorStop(1, 'rgba(186, 230, 253, 0)');
        } else if (escutando) {
          grad.addColorStop(0, 'rgba(5, 150, 105, 0.85)'); // Emerald-600 live feedback
          grad.addColorStop(0.6, 'rgba(52, 211, 153, 0.45)');
          grad.addColorStop(1, 'rgba(209, 250, 229, 0)');
        } else {
          grad.addColorStop(0, 'rgba(168, 162, 158, 0.3)'); // Faded stone mute state
          grad.addColorStop(1, 'rgba(168, 162, 158, 0)');
        }

        ctx.strokeStyle = grad;
        // Make active talk lines thicker
        ctx.lineWidth = 1.75 + (volume > 0.01 ? 1.0 : 0);
        ctx.lineCap = 'round';
        ctx.stroke();
      }

      // Draw a subtle outer atmospheric glow circle
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius + 18 + (volume * 10), 0, Math.PI * 2);
      ctx.strokeStyle = isAiSpeaking 
        ? 'rgba(56, 189, 248, 0.02)' 
        : escutando 
          ? 'rgba(16, 185, 129, 0.02)' 
          : 'rgba(168, 162, 158, 0.01)';
      ctx.lineWidth = 1;
      ctx.stroke();

      animationFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [escutando, isAiSpeaking, volume]);

  // Format elapsed timer
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    // Fundo escurecido com desfoque (Glassmorphism) para isolar a mente do resto do app
    <div className="fixed inset-0 z-[120] flex items-end justify-center bg-stone-900/60 backdrop-blur-md transition-all duration-500">
      
      {/* Container Background Closing Trigger */}
      <div className="absolute inset-0 cursor-default" onClick={fecharPainel} />

      {/* O Painel que sobe (Bottom Sheet) */}
      <motion.div 
        initial={{ y: '100%', opacity: 0.8 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: '100%', opacity: 0.8 }}
        transition={{ type: 'spring', damping: 26, stiffness: 220 }}
        className="w-full max-w-lg bg-[#FAF8F5] dark:bg-[#121619] rounded-t-[2.5rem] shadow-2xl flex flex-col items-center pt-5 pb-10 px-6 z-10 border-t border-stone-200/40 dark:border-stone-800/30 max-h-[85vh] overflow-y-auto no-scrollbar"
      >
        {/* Marcador superior de agarrar (estilo iOS) */}
        <div className="w-12 h-1 bg-stone-200 dark:bg-stone-850 rounded-full mb-6 shrink-0 cursor-pointer" onClick={fecharPainel} />
        
        {/* Header inside the panel with elapsed active session time */}
        <div className="w-full flex justify-between items-center mb-6 shrink-0 px-2 select-none">
          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${escutando ? 'bg-emerald-500 animate-[pulse_1.5s_infinite]' : 'bg-amber-500'}`} />
            <span className="font-mono text-[9px] uppercase tracking-widest text-stone-400 dark:text-stone-500">
              {escutando 
                ? (lang === 'pt' ? 'Conectado • Ao Vivo' : 'Connected • Live')
                : (lang === 'pt' ? 'Sessão Silenciada' : 'Session Paused')}
            </span>
          </div>
          <span className="font-mono text-[10px] text-stone-500 font-semibold bg-stone-100 dark:bg-stone-900 px-2.5 py-1 rounded-full border border-stone-200/50 dark:border-stone-850">
            {formatTime(elapsedSeconds)}
          </span>
        </div>

        {/* Microfone Pulsante no topo do painel */}
        <div className="relative mb-6 flex items-center justify-center h-40 w-40 select-none shrink-0">
          {/* Dynamic real-time Canvas-based frequency visualizer replacing static CSS pulse shadow */}
          <canvas 
            ref={canvasRef} 
            width={160} 
            height={160} 
            className="absolute inset-0 w-40 h-40 pointer-events-none rounded-full" 
          />
          
          <motion.div
            animate={{ scale: pulseScale * 0.9 }}
            transition={{ duration: 0.15 }}
            className={`h-20 w-20 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg z-10 ${
              isAiSpeaking
                ? 'bg-sky-500 text-white shadow-sky-500/15'
                : escutando 
                  ? 'bg-emerald-600 text-white shadow-emerald-500/20' 
                  : 'bg-stone-200 dark:bg-stone-850 text-stone-400 dark:text-stone-600'
            }`}
          >
            {isAiSpeaking ? (
              <Volume2 className="w-8 h-8 animate-bounce" />
            ) : escutando ? (
              <Mic className="w-8 h-8" />
            ) : (
              <MicOff className="w-8 h-8" />
            )}
          </motion.div>
        </div>

        {/* A Transcrição em Tempo Real */}
        <div className="w-full text-center px-4 my-2 flex-1 flex flex-col items-center justify-center min-h-[90px] max-h-[220px] overflow-y-auto custom-scrollbar">
          <p className={`text-sm md:text-base leading-relaxed tracking-wide font-serif transition-colors duration-500 ${
            isAiSpeaking 
              ? 'text-sky-700 dark:text-sky-400 font-medium'
              : escutando 
                ? 'text-stone-700 dark:text-stone-300 font-light' 
                : 'text-stone-400 italic font-light'
          }`}>
            {textoCapturado}
          </p>

          {aiSpeechText && aiSpeechText.includes('[PONTE_HUMANA]') && (
            <button
              onClick={() => {
                if (onTriggerSupport) {
                  onTriggerSupport();
                } else {
                  window.open('https://www.cvv.org.br/', '_blank');
                }
              }}
              className="mt-4 w-full max-w-xs py-3 px-5 bg-orange-850 hover:bg-orange-700 hover:scale-102 active:scale-98 text-white rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 font-medium text-xs font-sans cursor-pointer animate-fade-in-up border border-orange-700/20"
            >
              <HeartHandshake className="w-4 h-4 text-orange-200 animate-pulse" />
              <span>{lang === 'pt' ? 'Conversar com alguém agora' : 'Connect with someone now'}</span>
            </button>
          )}
        </div>

        {/* Indicador Sonoro (se estiver falando) */}
        {isUserSpeaking && (
          <div className="flex gap-1 items-center justify-center h-4 my-2 shrink-0">
            {[1, 2, 3, 4, 5].map((bar) => (
              <div 
                key={bar}
                className="w-0.75 bg-emerald-500 rounded-full transition-all duration-100"
                style={{ 
                  height: `${4 + Math.random() * 12 + (volume * 16)}px`,
                  animation: 'bounce 0.8s ease-in-out infinite alternate',
                  animationDelay: `${bar * 100}ms`
                }}
              />
            ))}
          </div>
        )}

        {/* Controles de Ação principais */}
        <div className="flex items-center gap-5 my-6 shrink-0 w-full justify-center">
          
          {/* Botão Pausar / Retomar com design minimalista */}
          <button
            onClick={onToggleMute}
            className={`flex flex-col items-center gap-1.5 transition-all group`}
            title={escutando ? (lang === 'pt' ? 'Mudar para mudo' : 'Mute') : (lang === 'pt' ? 'Ativar microfone' : 'Unmute')}
          >
            <div className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all ${
              escutando
                ? 'bg-transparent border-stone-300 dark:border-stone-800 hover:border-stone-400 text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-900 active:scale-95'
                : 'bg-emerald-500 border-emerald-400 text-white shadow-md active:scale-95 hover:bg-emerald-600'
            }`}>
              {escutando ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-current" />}
            </div>
            <span className="text-[10px] font-medium text-stone-400 dark:text-stone-500 uppercase tracking-widest">
              {escutando 
                ? (lang === 'pt' ? 'Silenciar' : 'Mute') 
                : (lang === 'pt' ? 'Retomar' : 'Resume')}
            </span>
          </button>

          {/* Botão Finalizar Sessão (Cria snapshot de reflexão) */}
          <button
            onClick={() => {
              onDisconnect();
              fecharPainel();
            }}
            className="flex flex-col items-center gap-1.5 transition-all active:scale-95 group"
            title={lang === 'pt' ? 'Preservar e Sair' : 'Save & Close'}
          >
            <div className="w-14 h-14 rounded-full bg-stone-900 dark:bg-stone-800 hover:bg-red-650 text-white transition-all flex items-center justify-center hover:shadow-lg shadow-black/15">
              <Square className="w-5 h-5 font-black fill-current" />
            </div>
            <span className="text-[10px] font-black text-stone-800 dark:text-stone-200 uppercase tracking-widest">
              {lang === 'pt' ? 'Finalizar' : 'Finish'}
            </span>
          </button>

        </div>

        {/* Dica relaxante para co-regulação mental */}
        <div className="w-full text-center px-4 pt-1 border-t border-stone-200/30 dark:border-stone-850 shrink-0">
          <p className="text-[10px] font-mono tracking-wider uppercase text-stone-400/90 dark:text-stone-500">
            {lang === 'pt'
              ? 'Toque fora da lâmina para recolher e ver o Jardim'
              : 'Tap outside of sheet to collapse and inspect dynamic Garden'}
          </p>
        </div>

      </motion.div>
    </div>
  );
};
export default PainelDaVozAtivo;
