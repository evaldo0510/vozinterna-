import React, { useState, useEffect } from 'react';
import { User, Language } from '../types';
import { 
  Smile, 
  Type, 
  Contrast, 
  Bell, 
  ArrowLeft, 
  ShieldAlert, 
  Sparkles, 
  LogOut, 
  Check, 
  Plus,
  Music,
  Play,
  Pause,
  Volume2
} from 'lucide-react';
import { db, auth } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface SettingsViewProps {
  user: User | null;
  lang: Language;
  onSetLang: (lang: Language) => void;
  onLogout: () => void;
  onBack: () => void;
  // Dynamic settings hooks to update the client experience
  textSize: 'small' | 'medium' | 'large';
  onTextSizeChange: (size: 'small' | 'medium' | 'large') => void;
  accessibilityMode: boolean;
  onAccessibilityModeChange: (active: boolean) => void;
  onToggleTheme: () => void;
  isLightTheme: boolean;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  user, 
  lang, 
  onLogout, 
  onBack,
  textSize,
  onTextSizeChange,
  accessibilityMode,
  onAccessibilityModeChange,
  onToggleTheme,
  isLightTheme
}) => {
  const [leituraAssistida, setLeituraAssistida] = useState<boolean>(true);
  const [gestosSuaves, setGestosSuaves] = useState<boolean>(false);
  const [silencioNoturno, setSilencioNoturno] = useState<boolean>(true);
  const [contrasRef, setContrasRef] = useState<'natural' | 'sepia' | 'crepusculo'>('natural');

  // Web Audio ambient soundscape generator state
  const audioCtxRef = React.useRef<AudioContext | null>(null);
  const droneNodesRef = React.useRef<any[]>([]);
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);
  const [activeSoundtrack, setActiveSoundtrack] = useState<string>('silence');

  const soundtracks = [
    {
      id: 'silence',
      namePt: 'Ressonância Terrestre (Drone)',
      nameEn: 'Earth Resonance (Drone)',
      descPt: 'Frequências puras e profundas em 110Hz para alinhamento e relaxamento mental imediato.',
      descEn: 'Deep and pure 110Hz frequencies for mental alignment and immediate physical calm.',
    },
    {
      id: 'rain',
      namePt: 'Chuva Tranquila',
      nameEn: 'Tranquil Rain',
      descPt: 'Modulações orgânicas que recordam uma chuva filtrante ao final da tarde.',
      descEn: 'Organic modulations bringing back memories of soft rainfall on late autumn leaves.',
    },
    {
      id: 'wind',
      namePt: 'Sopro da Floresta',
      nameEn: 'Forest Whispers',
      descPt: 'Ondas oscilantes relaxantes mimetizando o vento passando pelas copas das árvores.',
      descEn: 'Easing sweeps replicating high mountain breeze moving gently between the pine trees.',
    }
  ];

  const stopAmbient = () => {
    droneNodesRef.current.forEach(node => {
      try { node.stop(); } catch(e){}
      try { node.disconnect(); } catch(e){}
    });
    droneNodesRef.current = [];
    setIsPlayingSound(false);
  };

  const startAmbient = (soundId: string) => {
    stopAmbient();
    
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (soundId === 'silence') {
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const lowpass = ctx.createBiquadFilter();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(110, ctx.currentTime);
        
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(165.4, ctx.currentTime); // perfect fifth + a tiny detune

        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(200, ctx.currentTime);

        gainNode.gain.setValueAtTime(0.06, ctx.currentTime);

        osc1.connect(lowpass);
        osc2.connect(lowpass);
        lowpass.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start();
        osc2.start();

        droneNodesRef.current = [osc1, osc2, gainNode, lowpass];
      } else if (soundId === 'rain') {
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const whiteNoise = ctx.createBufferSource();
        whiteNoise.buffer = noiseBuffer;
        whiteNoise.loop = true;

        const filter1 = ctx.createBiquadFilter();
        filter1.type = 'lowpass';
        filter1.frequency.setValueAtTime(500, ctx.currentTime);

        const filter2 = ctx.createBiquadFilter();
        filter2.type = 'bandpass';
        filter2.frequency.setValueAtTime(320, ctx.currentTime);
        filter2.Q.setValueAtTime(1.2, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.12, ctx.currentTime);

        whiteNoise.connect(filter1);
        filter1.connect(filter2);
        filter2.connect(gainNode);
        gainNode.connect(ctx.destination);

        whiteNoise.start();

        // Slow modulation of depth to resemble changing wind/rain sweeps
        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.15, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(150, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(filter2.frequency);
        lfo.start();

        droneNodesRef.current = [whiteNoise, filter1, filter2, gainNode, lfo, lfoGain];
      } else if (soundId === 'wind') {
        const bufferSize = 2 * ctx.sampleRate;
        const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer;
        noise.loop = true;

        const bandpass = ctx.createBiquadFilter();
        bandpass.type = 'bandpass';
        bandpass.frequency.setValueAtTime(250, ctx.currentTime);
        bandpass.Q.setValueAtTime(2.2, ctx.currentTime);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.20, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.frequency.setValueAtTime(0.06, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(120, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(bandpass.frequency);

        noise.connect(bandpass);
        bandpass.connect(gainNode);
        gainNode.connect(ctx.destination);

        noise.start();
        lfo.start();

        droneNodesRef.current = [noise, bandpass, gainNode, lfo, lfoGain];
      }

      setIsPlayingSound(true);
    } catch (err) {
      console.warn("Web Audio Context blocked or faulty:", err);
    }
  };

  const handleTogglePlay = () => {
    if (isPlayingSound) {
      stopAmbient();
    } else {
      startAmbient(activeSoundtrack);
    }
  };

  const handleChangeSoundtrack = (id: string) => {
    setActiveSoundtrack(id);
    if (isPlayingSound) {
      startAmbient(id);
    }
  };

  // Clean ambient audio on leaving/unmonting
  useEffect(() => {
    return () => {
      droneNodesRef.current.forEach(node => {
        try { node.stop(); } catch(e){}
        try { node.disconnect(); } catch(e){}
      });
    };
  }, []);

  // Trigger state updates
  useEffect(() => {
    if (contrasRef === 'crepusculo' && isLightTheme) {
      onToggleTheme();
    } else if ((contrasRef === 'natural' || contrasRef === 'sepia') && !isLightTheme) {
      onToggleTheme();
    }
  }, [contrasRef]);

  if (!user) return null;

  return (
    <div className="min-h-full w-full bg-[#fcf9f4] text-[#1c2e24] flex flex-col font-sans pb-24 select-none">
      
      {/* Top micro Header */}
      <div className="w-full max-w-4xl mx-auto px-6 py-4 flex justify-between items-center bg-transparent">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-stone-500 hover:text-stone-800 transition-colors group cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs uppercase tracking-wider font-mono font-medium">
            {lang === 'pt' ? 'Voltar' : 'Back'}
          </span>
        </button>
        <span className="text-[10px] tracking-[0.3em] font-bold font-mono text-stone-400 uppercase">
          {lang === 'pt' ? 'O ESPAÇO' : 'THE SPACE'}
        </span>
        <button
          onClick={onLogout}
          className="p-1.5 rounded-full border border-stone-200 hover:bg-red-50 text-stone-450 hover:text-red-700 transition-all cursor-pointer"
          title={lang === 'pt' ? 'Sair da sessão' : 'Logout'}
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      <div className="w-full max-w-xl mx-auto px-6 space-y-8 mt-4 animate-fade-in">
        
        {/* Core title and subtitle */}
        <div className="space-y-2.5 max-w-md">
          <h1 className="text-3xl font-serif text-[#1c2e24] tracking-wide font-normal">
            {lang === 'pt' ? 'O Espaço' : 'The Space'}
          </h1>
          <p className="text-stone-500 text-xs md:text-sm leading-relaxed font-light">
            {lang === 'pt' 
              ? 'Sinta-se em casa. Ajuste as ferramentas deste refúgio digital para que sua jornada seja tão leve quanto um sopro.' 
              : 'Feel at home. Adjust this digital sanctuary features so that your journey feels light as a soft breath.'}
          </p>
        </div>

        {/* Section Blocks matches Screenshot 4 */}
        <div className="space-y-6">
          
          {/* Card 1: Acessibilidade */}
          <div className="p-6.5 rounded-[2rem] bg-white border border-stone-200/40 shadow-[0_3px_15px_rgba(21,46,34,0.01)] space-y-5">
            <div className="flex gap-4.5 items-start">
              <div className="p-3 bg-stone-50 rounded-full text-[#5c7c64]">
                <Smile className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base font-serif font-semibold text-stone-850">
                  {lang === 'pt' ? 'Acessibilidade' : 'Accessibility'}
                </h3>
                <p className="text-xs text-stone-400 font-light leading-relaxed">
                  {lang === 'pt' ? 'Recursos projetados para acolher diferentes formas de interagir.' : 'Features crafted to embrace different modes of connection.'}
                </p>
              </div>
            </div>

            {/* Sub options with switches */}
            <div className="space-y-4 pt-1">
              {/* Leitura Assistida */}
              <div className="flex justify-between items-center bg-stone-50/40 p-3.5 rounded-2xl border border-stone-100">
                <span className="text-[13px] font-medium text-stone-750">
                  {lang === 'pt' ? 'Leitura Assistida' : 'Voice Assisted Reading'}
                </span>
                <button
                  onClick={() => {
                    setLeituraAssistida(!leituraAssistida);
                    onAccessibilityModeChange(!leituraAssistida);
                  }}
                  className={`w-10 h-6.5 rounded-full p-0.5 transition-colors duration-300 outline-none ${
                    leituraAssistida ? 'bg-[#5c7c64]' : 'bg-stone-200'
                  }`}
                >
                  <div className={`bg-white w-5.5 h-5.5 rounded-full shadow-sm transition-transform duration-300 ${
                    leituraAssistida ? 'translate-x-3.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Navegação por Gestos Suaves */}
              <div className="flex justify-between items-center bg-stone-50/40 p-3.5 rounded-2xl border border-stone-100">
                <span className="text-[13px] font-medium text-stone-750">
                  {lang === 'pt' ? 'Navegação por Gestos Suaves' : 'Gentle Gesture Navigation'}
                </span>
                <button
                  onClick={() => setGestosSuaves(!gestosSuaves)}
                  className={`w-10 h-6.5 rounded-full p-0.5 transition-colors duration-300 outline-none ${
                    gestosSuaves ? 'bg-[#5c7c64]' : 'bg-stone-200'
                  }`}
                >
                  <div className={`bg-white w-5.5 h-5.5 rounded-full shadow-sm transition-transform duration-300 ${
                    gestosSuaves ? 'translate-x-3.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Tamanho do Texto */}
          <div className="p-6.5 rounded-[2rem] bg-white border border-stone-200/40 shadow-[0_3px_15px_rgba(21,46,34,0.01)] space-y-5">
            <div className="flex gap-4.5 items-start">
              <div className="p-3 bg-stone-50 rounded-full text-[#5c7c64]">
                <Type className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base font-serif font-semibold text-stone-850">
                  {lang === 'pt' ? 'Tamanho do Texto' : 'Text Size'}
                </h3>
                <p className="text-xs text-stone-400 font-light leading-relaxed">
                  {lang === 'pt' ? 'Encontre a clareza ideal para o seu olhar.' : 'Locate the ideal layout reading zoom for your eyes.'}
                </p>
              </div>
            </div>

            {/* Zoom slider markings layout from Screenshot 4 */}
            <div className="pt-2.5 px-2 space-y-4">
              <div className="relative w-full h-1.5 bg-stone-100 rounded-full">
                {/* Active slider bar */}
                <div 
                  className="absolute h-full bg-[#5c7c64] rounded-full" 
                  style={{ 
                    width: textSize === 'small' ? '0%' : textSize === 'medium' ? '50%' : '100%' 
                  }} 
                />
                {/* Visual selector node handles */}
                <input 
                  type="range" 
                  min="1" 
                  max="3" 
                  step="1"
                  value={textSize === 'small' ? 1 : textSize === 'medium' ? 2 : 3}
                  onChange={(e) => {
                    const v = parseInt(e.target.value);
                    if (v === 1) onTextSizeChange('small');
                    else if (v === 2) onTextSizeChange('medium');
                    else onTextSizeChange('large');
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                
                {/* Marking dots */}
                <div className="absolute w-full -top-1 px-1 flex justify-between pointer-events-none">
                  <div className={`w-3.5 h-3.5 rounded-full border border-stone-200 ${textSize === 'small' ? 'bg-[#5c7c64] scale-110' : 'bg-white'}`} />
                  <div className={`w-3.5 h-3.5 rounded-full border border-stone-200 ${textSize === 'medium' ? 'bg-[#5c7c64] scale-110' : 'bg-white'}`} style={{ marginLeft: '-1px' }} />
                  <div className={`w-3.5 h-3.5 rounded-full border border-stone-200 ${textSize === 'large' ? 'bg-[#5c7c64] scale-110' : 'bg-white'}`} />
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] font-mono tracking-widest text-[#5c7c64] font-bold">
                <span>{lang === 'pt' ? 'PEQUENO' : 'SMALL'}</span>
                <span>{lang === 'pt' ? 'EQUILIBRADO' : 'BALANCED'}</span>
                <span>{lang === 'pt' ? 'AMPLO' : 'LARGE'}</span>
              </div>
            </div>
          </div>

          {/* Card 3: Contraste Suave */}
          <div className="p-6.5 rounded-[2rem] bg-white border border-stone-200/40 shadow-[0_3px_15px_rgba(21,46,34,0.01)] space-y-5">
            <div className="flex gap-4.5 items-start">
              <div className="p-3 bg-stone-50 rounded-full text-[#5c7c64]">
                <Contrast className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base font-serif font-semibold text-stone-850">
                  {lang === 'pt' ? 'Contraste Suave' : 'Soft Contrast'}
                </h3>
                <p className="text-xs text-stone-400 font-light leading-relaxed">
                  {lang === 'pt' ? 'Reduza a fadiga visual com tons terrosos e orgânicos.' : 'Soothe eye strain with organic earth-based contrasts.'}
                </p>
              </div>
            </div>

            {/* Bubble selection circles layout */}
            <div className="flex gap-4.5 pt-2 select-none">
              {/* Natural */}
              <button 
                onClick={() => setContrasRef('natural')}
                className="flex-1 flex flex-col items-center gap-2 p-2 focus:outline-none"
              >
                <div className={`w-12 h-12 rounded-full bg-[#fcf9f4] border-2 transition-all flex items-center justify-center ${
                  contrasRef === 'natural' ? 'border-[#5c7c64] scale-105 shadow-sm' : 'border-stone-200 hover:border-stone-400'
                }`}>
                  <div className="w-5 h-5 rounded-full bg-[#5c7c64]/20" />
                </div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500">Natural</span>
              </button>

              {/* Sépia */}
              <button
                onClick={() => setContrasRef('sepia')}
                className="flex-1 flex flex-col items-center gap-2 p-2 focus:outline-none"
              >
                <div className={`w-12 h-12 rounded-full bg-[#f4ebd0] border-2 transition-all flex items-center justify-center ${
                  contrasRef === 'sepia' ? 'border-[#8c5d3a] scale-105 shadow-sm' : 'border-stone-200 hover:border-stone-400'
                }`}>
                  <div className="w-5 h-5 rounded-full bg-[#8c5d3a]/25" />
                </div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500">Sépia</span>
              </button>

              {/* Crepúsculo */}
              <button
                onClick={() => setContrasRef('crepusculo')}
                className="flex-1 flex flex-col items-center gap-2 p-2 focus:outline-none"
              >
                <div className={`w-12 h-12 rounded-full bg-[#1e2321] border-2 transition-all flex items-center justify-center ${
                  contrasRef === 'crepusculo' ? 'border-teal-500 scale-105 shadow-sm' : 'border-stone-200 hover:border-stone-400'
                }`}>
                  <div className="w-5 h-5 rounded-full bg-teal-400/20" />
                </div>
                <span className="text-[10px] uppercase font-mono tracking-wider text-stone-500">Crepúsculo</span>
              </button>
            </div>
          </div>

          {/* Card: Paysagens Sonoras / Trilha Sonora */}
          <div className="p-6.5 rounded-[2rem] bg-white border border-stone-200/40 shadow-[0_3px_15px_rgba(21,46,34,0.01)] space-y-5">
            <div className="flex justify-between items-start">
              <div className="flex gap-4.5 items-start">
                <div className="p-3 bg-stone-50 rounded-full text-[#5c7c64]">
                  <Music className="w-5 h-5 stroke-[1.8]" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="text-base font-serif font-semibold text-stone-850">
                    {lang === 'pt' ? 'Trilha Sonora Ambiente' : 'Ambient Soundscapes'}
                  </h3>
                  <p className="text-xs text-stone-400 font-light leading-relaxed">
                    {lang === 'pt' ? 'Sintonize paisagens harmônicas de fundo para guiar seu foco.' : 'Tune into comforting background frequencies to guide your focus.'}
                  </p>
                </div>
              </div>

              {/* Master Play/Pause Controller in Card Header */}
              <button
                onClick={handleTogglePlay}
                className={`p-3 rounded-full cursor-pointer transition-all duration-300 shadow-sm border ${
                  isPlayingSound 
                    ? 'bg-amber-100 border-amber-200 text-amber-700 font-bold scale-105' 
                    : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-600'
                }`}
                title={isPlayingSound ? 'Pausar Áudio' : 'Reproduzir Áudio'}
              >
                {isPlayingSound ? <Pause className="w-4.5 h-4.5 fill-amber-700" /> : <Play className="w-4.5 h-4.5 fill-stone-600 ml-0.5" />}
              </button>
            </div>

            {/* Selector list */}
            <div className="space-y-3 pt-1">
              {soundtracks.map((track) => {
                const isActive = activeSoundtrack === track.id;
                return (
                  <button
                    key={track.id}
                    onClick={() => handleChangeSoundtrack(track.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-3 cursor-pointer ${
                      isActive 
                        ? 'bg-[#f4efe6] border-[#cfc0a9] text-[#1c2e24] font-medium shadow-[0_2px_8px_rgba(0,0,0,0.02)]' 
                        : 'bg-white hover:bg-stone-50 border-stone-100 text-[#1c2e24]/90'
                    }`}
                  >
                    <div className="space-y-1 max-w-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-serif font-bold">
                          {lang === 'pt' ? track.namePt : track.nameEn}
                        </span>
                        {isActive && isPlayingSound && (
                          <span className="flex items-center gap-0.5">
                            <span className="w-1 h-3.5 bg-[#5c7c64] rounded-full animate-pulse inline-block" />
                            <span className="w-1 h-2 bg-[#5c7c64] rounded-full animate-pulse inline-block [animation-delay:0.2s]" />
                            <span className="w-1 h-3 bg-[#5c7c64] rounded-full animate-pulse inline-block [animation-delay:0.4s]" />
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-stone-550 font-normal leading-relaxed">
                        {lang === 'pt' ? track.descPt : track.descEn}
                      </p>
                    </div>

                    <div className="shrink-0 flex items-center md:self-center">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                        isActive ? 'border-[#5c7c64] bg-[#5c7c64]/10' : 'border-stone-300'
                      }`}>
                        {isActive && <div className="w-2.5 h-2.5 rounded-full bg-[#5c7c64]" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 4: Limites do Sistema */}
          <div className="p-6.5 rounded-[2rem] bg-white border border-stone-200/40 shadow-[0_3px_15px_rgba(21,46,34,0.01)] space-y-5">
            <div className="flex gap-4.5 items-start">
              <div className="p-3 bg-stone-50 rounded-full text-[#5c7c64]">
                <Bell className="w-5 h-5 stroke-[1.8]" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base font-serif font-semibold text-stone-850">
                  {lang === 'pt' ? 'Limites do Sistema' : 'System Constraints'}
                </h3>
                <p className="text-xs text-stone-400 font-light leading-relaxed">
                  {lang === 'pt' ? 'Proteja seu silêncio interior definindo períodos de quietude.' : 'Shield your inner quiet with scheduled periods of rest.'}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-1">
              <div className="flex justify-between items-center bg-stone-50/40 p-3.5 rounded-2xl border border-stone-100">
                <div className="text-left space-y-0.5">
                  <span className="text-[13px] font-medium text-stone-750 block leading-tight">
                    {lang === 'pt' ? 'Silêncio Noturno' : 'Night Quiet'}
                  </span>
                  <span className="text-[10px] font-mono text-stone-400 font-light block leading-none">
                    22:00 — 07:00
                  </span>
                </div>
                
                <button
                  onClick={() => setSilencioNoturno(!silencioNoturno)}
                  className={`w-10 h-6.5 rounded-full p-0.5 transition-colors duration-300 outline-none ${
                    silencioNoturno ? 'bg-[#5c7c64]' : 'bg-stone-200'
                  }`}
                >
                  <div className={`bg-white w-5.5 h-5.5 rounded-full shadow-sm transition-transform duration-300 ${
                    silencioNoturno ? 'translate-x-3.5' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Add limit block */}
              <button className="w-full py-3 border border-dashed border-stone-300 hover:border-stone-500 rounded-2xl text-[11px] font-mono font-bold uppercase tracking-widest text-[#5c7c64]/80 hover:text-[#5c7c64] flex items-center justify-center gap-1.5 transition-all cursor-pointer">
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>{lang === 'pt' ? 'Adicionar Novo Limite' : 'Add New Limit'}</span>
              </button>
            </div>
          </div>

          {/* Panoramic Landscape Banner */}
          <div className="relative w-full rounded-[2rem] overflow-hidden min-h-[165px] bg-[#223326] flex flex-col justify-end p-8 shadow-[0_3px_20px_rgba(21,46,34,0.06)] group">
            {/* Elegant deep fog ambient CSS background mask */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#152e22]/95 via-transparent to-transparent z-10" />
            <div className="absolute inset-0 bg-gradient-to-tr from-[#1b3629]/20 to-[#2c4e3b]/30 z-0 animate-pulse pointer-events-none" />
            
            <p className="text-sm font-serif font-normal italic text-stone-100 leading-relaxed max-w-sm z-20">
              {lang === 'pt'
                ? '"Cuidar de si é um ato revolucionário. Sua configuração está salva em seu ritmo."'
                : '"Caring for yourself is a revolutionary act. Setup registered inside your natural flow."'}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
};
export default SettingsView;
