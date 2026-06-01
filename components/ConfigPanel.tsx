
import React, { useState } from 'react';
import { 
  Settings, Volume2, Type, X, Trophy, Star, 
  Eye, EyeOff, Award, Sparkles, Headphones, Minus, Plus, Zap
} from 'lucide-react';
import { ThemeName, Language } from '../types.ts';
import { TRANSLATIONS } from '../constants.ts';

interface ConfigPanelProps {
  lang: Language;
  theme: ThemeName;
  soundEnabled: boolean;
  isLiveMode: boolean;
  speechRate: number;
  voiceGender: 'male' | 'female';
  voicePitch: number;
  fontSize: number;
  points: number;
  badges: string[];
  dailyMissionCompleted: boolean;
  isHighContrast: boolean;
  onUpdate: (key: string, value: any) => void;
  onSelectQuickPhrase: (phrase: string) => void;
}

const ConfigPanel: React.FC<ConfigPanelProps> = ({ 
  lang, theme, soundEnabled, isLiveMode, speechRate, voiceGender, voicePitch, fontSize, points, badges = [], dailyMissionCompleted, isHighContrast, onUpdate 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'audio' | 'journey' | 'display'>('audio');

  const text = TRANSLATIONS[lang];

  const tabs = [
    { id: 'audio', icon: <Volume2 className="w-5 h-5" />, label: text.settings.voice },
    { id: 'journey', icon: <Star className="w-5 h-5" />, label: 'Alma' },
    { id: 'display', icon: <Type className="w-5 h-5" />, label: 'Visão' }
  ];

  return (
    <div className="absolute top-8 left-8 z-[100]">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`p-4 rounded-full border backdrop-blur-3xl shadow-2xl transition-all duration-500 active:scale-90 ${
          isOpen ? 'bg-white text-black border-white' : 'bg-black/20 border-white/10 text-white/40 hover:text-white'
        }`}
      >
        <Settings className={`w-5 h-5 transition-transform duration-500 ${isOpen ? 'rotate-90' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 w-[350px] max-h-[85vh] bg-slate-950/85 backdrop-blur-[100px] border border-white/10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-300 flex flex-col overflow-hidden">
          
          {/* Header */}
          <div className="p-8 pb-2 flex justify-between items-center">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Configurações</span>
              <span className="text-xs font-serif italic text-white/60">Ajuste o seu manifesto</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
              <X className="w-4 h-4 text-white/20" />
            </button>
          </div>

          {/* Navigation Bar */}
          <div className="flex justify-around px-4 py-4 mt-2 border-b border-white/5">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex flex-col items-center gap-2 py-3 rounded-2xl transition-all duration-300 ${
                  activeTab === tab.id ? 'bg-white/10 text-white shadow-inner' : 'text-white/20 hover:text-white/40'
                }`}
              >
                {tab.icon}
                <span className="text-[10px] font-bold uppercase tracking-widest">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-8 space-y-8 scrollbar-hide">
            
            {activeTab === 'audio' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                {/* Immersive Mode Card */}
                <div 
                  className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer ${
                    isLiveMode 
                    ? 'bg-indigo-500/10 border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.2)]' 
                    : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                  onClick={() => onUpdate('isLiveMode', !isLiveMode)}
                >
                  <div className="flex items-center gap-4 mb-3">
                    <div className={`p-3 rounded-2xl ${isLiveMode ? 'bg-indigo-500 text-white' : 'bg-white/10 text-white/40'}`}>
                      <Headphones className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">Modo Imersivo</p>
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-black">Experiência Viva</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-white/40 leading-relaxed italic">
                    {isLiveMode 
                      ? "Focando apenas na voz e na materialização visual. Chat oculto."
                      : "Clique para silenciar o mundo e ouvir apenas a Voz Interior."}
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-center px-1">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white/80">Sons Ativos</span>
                      <span className="text-[9px] text-white/20 uppercase tracking-wider">Narração e Feedback</span>
                    </div>
                    <button 
                      onClick={() => onUpdate('soundEnabled', !soundEnabled)}
                      className={`w-14 h-7 rounded-full relative transition-all duration-500 ${soundEnabled ? 'bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-lg ${soundEnabled ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>
                  
                  <div className="space-y-6 p-4 bg-white/5 rounded-3xl border border-white/5">
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                        <span>{text.settings.voice}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => onUpdate('voiceGender', 'male')}
                          className={`py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${voiceGender === 'male' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-white/20 hover:bg-white/10'}`}
                        >
                          {text.settings.male}
                        </button>
                        <button 
                          onClick={() => onUpdate('voiceGender', 'female')}
                          className={`py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${voiceGender === 'female' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-white/5 text-white/20 hover:bg-white/10'}`}
                        >
                          {text.settings.female}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                        <span>{text.settings.speed}</span>
                        <span className="text-indigo-400">{speechRate}x</span>
                      </div>
                      <input 
                        type="range" min="0.5" max="1.5" step="0.1" value={speechRate}
                        onChange={e => onUpdate('speechRate', parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-full appearance-none accent-indigo-500 cursor-pointer"
                      />
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black text-white/30 uppercase tracking-[0.2em]">
                        <span>{text.settings.pitch}</span>
                        <span className="text-indigo-400">{voicePitch > 1 ? text.settings.pitchAgudo : voicePitch < 1 ? text.settings.pitchGrave : 'Normal'}</span>
                      </div>
                      <input 
                        type="range" min="0.5" max="1.5" step="0.1" value={voicePitch}
                        onChange={e => onUpdate('voicePitch', parseFloat(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-full appearance-none accent-indigo-500 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'journey' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-8 rounded-[2.8rem] border border-white/10 space-y-6 text-center">
                  <div className="relative inline-block">
                     <Trophy className="w-12 h-12 text-yellow-500/80 mx-auto" />
                     <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full" />
                  </div>
                  <div>
                    <span className="text-4xl font-black text-white tracking-tighter">{points.toLocaleString()}</span>
                    <p className="text-[10px] uppercase font-black tracking-[0.4em] text-white/20 mt-2">Mood Points</p>
                  </div>
                  <div className="flex gap-1 justify-center">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className={`h-1.5 w-8 rounded-full transition-all duration-1000 ${points > i * 150 ? 'bg-indigo-500' : 'bg-white/5'}`} />
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em] px-2 flex items-center gap-2">
                    <Award className="w-3 h-3" /> Conquistas Desbloqueadas
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    {badges.length > 0 ? badges.map((b, i) => (
                      <div key={i} className="p-4 bg-white/5 border border-white/5 rounded-3xl flex flex-col items-center justify-center gap-2 text-center group transition-colors hover:bg-white/10">
                        <Zap className="w-4 h-4 text-indigo-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[10px] text-white/60 font-bold leading-tight">{b}</span>
                      </div>
                    )) : (
                      <div className="col-span-2 py-8 text-center border-2 border-dashed border-white/5 rounded-3xl">
                        <p className="text-[10px] text-white/10 uppercase tracking-widest font-bold italic">Nenhum selo de alma ainda</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'display' && (
              <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
                <div 
                  className={`p-6 rounded-[2.5rem] border transition-all flex items-center justify-between cursor-pointer ${isHighContrast ? 'bg-white border-white text-black' : 'bg-white/5 border-white/5 text-white'}`}
                  onClick={() => onUpdate('isHighContrast', !isHighContrast)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-2xl ${isHighContrast ? 'bg-black text-white' : 'bg-white/10 text-white/40'}`}>
                      {isHighContrast ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold">Alto Contraste</p>
                      <p className={`text-[10px] uppercase tracking-widest font-black ${isHighContrast ? 'text-black/40' : 'text-white/20'}`}>Acessibilidade</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 px-2">
                   <div className="flex justify-between items-end mb-2">
                      <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">Tamanho do Texto</span>
                      <span className="text-lg font-black text-indigo-400">{fontSize}px</span>
                    </div>
                  <div className="flex gap-4">
                    <button 
                      onClick={() => onUpdate('fontSize', Math.max(12, fontSize - 2))} 
                      className="flex-1 p-5 bg-white/5 hover:bg-white/10 rounded-[1.8rem] text-white/40 text-xl font-light transition-all active:scale-90"
                    >
                      <Minus className="mx-auto" />
                    </button>
                    <button 
                      onClick={() => onUpdate('fontSize', Math.min(24, fontSize + 2))} 
                      className="flex-1 p-5 bg-white/5 hover:bg-white/10 rounded-[1.8rem] text-white/40 text-xl font-light transition-all active:scale-90"
                    >
                      <Plus className="mx-auto" />
                    </button>
                  </div>
                </div>

                <div className="p-6 bg-indigo-500/5 rounded-[2.5rem] border border-indigo-500/10 flex items-center gap-4">
                  <Sparkles className="w-6 h-6 text-indigo-400/50" />
                  <p className="text-[10px] text-indigo-200/40 uppercase tracking-widest font-bold leading-relaxed">
                    A interface adapta-se dinamicamente ao seu estado de espírito.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="p-8 pt-4 border-t border-white/5 text-center">
            <p className="text-[9px] font-black text-white/10 uppercase tracking-[0.6em]">YARA Core v3.2 Imersiva</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConfigPanel;
