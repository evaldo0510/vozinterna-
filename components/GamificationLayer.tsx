
import React, { useMemo } from 'react';
import { Star, Award, CheckCircle2, Trophy } from 'lucide-react';
import { GamificationEvent } from '../types.ts';

interface GamificationLayerProps {
  activeEvents: GamificationEvent[];
  points: number;
  missionProgress: number;
  missionCompleted: boolean;
  isHighContrast: boolean;
}

const GamificationLayer: React.FC<GamificationLayerProps> = ({ 
  activeEvents = [], points = 0, missionProgress = 0, missionCompleted = false, isHighContrast = false 
}) => {
  const missionText = useMemo(() => {
    if (missionCompleted) return "Missão Concluída";
    return `Missão: ${missionProgress}/3 Conversas`;
  }, [missionProgress, missionCompleted]);

  return (
    <>
      {/* HUD Persistente - Superior Direito */}
      <div className="absolute top-8 right-8 z-[60] flex flex-col items-end space-y-2 pointer-events-none">
        <div className={`px-4 py-2 rounded-2xl flex items-center gap-3 border transition-all duration-1000 ${
          isHighContrast ? 'bg-black border-white' : 'bg-black/40 backdrop-blur-2xl border-white/10 shadow-xl'
        }`}>
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Total</span>
            <span className="text-sm font-black text-white flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400 animate-pulse" />
              {points.toLocaleString()}
            </span>
          </div>
          <div className="w-[1px] h-8 bg-white/10 mx-1" />
          <div className="flex flex-col items-end">
            <span className="text-[9px] uppercase tracking-widest text-white/30 font-bold">Diário</span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ${missionCompleted ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                  style={{ width: `${(missionProgress / 3) * 100}%` }}
                />
              </div>
              <span className={`text-[10px] font-bold ${missionCompleted ? 'text-emerald-400' : 'text-white/60'}`}>
                {missionCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : `${missionProgress}/3`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Notificações (Toasts) */}
      <div className="fixed top-28 right-8 z-[100] flex flex-col items-end pointer-events-none space-y-3">
        {activeEvents.map((event) => (
          <div
            key={event.id}
            className={`animate-in fade-in slide-in-from-right-8 duration-500 fill-mode-forwards flex items-center gap-3 px-5 py-3 rounded-[1.5rem] shadow-2xl border ${
              isHighContrast ? 'bg-black border-white' : 'bg-white/10 backdrop-blur-3xl border-white/20'
            }`}
          >
            {event.type === 'points' && (
              <>
                <div className="p-2 bg-yellow-500/20 rounded-xl">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                </div>
                <span className="text-sm font-bold text-white">+{event.value} Mood Points</span>
              </>
            )}
            {event.type === 'badge' && (
              <>
                <div className="p-2 bg-indigo-500/20 rounded-xl">
                  <Trophy className="w-4 h-4 text-indigo-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-widest text-white/40 font-black">Nova Conquista</span>
                  <span className="text-sm font-bold text-white">{event.value}</span>
                </div>
              </>
            )}
            {event.type === 'mission' && (
              <>
                <div className="p-2 bg-emerald-500/20 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-sm font-bold text-white">{event.value}</span>
              </>
            )}
          </div>
        ))}
      </div>
    </>
  );
};

export default GamificationLayer;
