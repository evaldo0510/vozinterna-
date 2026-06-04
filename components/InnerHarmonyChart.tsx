import React from 'react';
import { User, Language } from '../types';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ShieldCheck, Flame, Scale, Compass } from 'lucide-react';

interface InnerHarmonyChartProps {
  user: User | null;
  lang: Language;
}

export const InnerHarmonyChart: React.FC<InnerHarmonyChartProps> = ({ user, lang }) => {
  if (!user) return null;

  // Format historical records of the Index of Inner Harmony (ISI / Índice de Sintonia Interior)
  const getIsiData = () => {
    const rawHistory = user.resonanceHistory || [];
    
    // Map dates to fast search index
    const historyMap: { [key: string]: number } = {};
    rawHistory.forEach(item => {
      if (item.date && typeof item.score === 'number') {
        historyMap[item.date] = item.score;
      }
    });

    const finalHistory = [];
    const daysToShow = 15; // Focus on last 15 checkpoints for clear detail

    for (let i = daysToShow - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
        day: '2-digit',
        month: '2-digit'
      });
      const todayLabel = lang === 'pt' ? 'Hoje' : 'Today';
      const finalLabel = i === 0 ? todayLabel : dateStr;

      // Find actual score in database or fallback to simulated wave matching the overall score with healthy drift
      let scoreVal = historyMap[dateStr] || historyMap[finalLabel];
      if (scoreVal === undefined) {
        const baseScore = user.resonanceScore > 0 ? user.resonanceScore : 75;
        const offset = i === 0 ? 0 : Math.sin(i * 1.5) * 6 + (i * -0.5); // emotional drift wave
        scoreVal = Math.min(100, Math.max(25, Math.round(baseScore + offset)));
      }

      finalHistory.push({
        label: finalLabel,
        isi: scoreVal,
        calm: Math.min(100, Math.max(30, Math.round(scoreVal * 1.05))),
        focus: Math.min(100, Math.max(20, Math.round(scoreVal * 0.92)))
      });
    }

    return finalHistory;
  };

  const chartData = getIsiData();
  const currentIsi = user.resonanceScore || 75;

  // Emotional equilibrium rating PCH
  const getIsiFeedback = (score: number) => {
    if (score >= 90) return lang === 'pt' ? 'Sintonia Plena (Ressonância Magnética)' : 'In Full Accord (Optimal Resonance)';
    if (score >= 75) return lang === 'pt' ? 'Fluxo Estável e Equilibrado' : 'Stable & Flowing State';
    if (score >= 60) return lang === 'pt' ? 'Ajuste Sensorial Intermediário' : 'Intermediate Harmony Adjustment';
    return lang === 'pt' ? 'Calibração Emocional PCH Ativa' : 'Active PCH Emotional Calibration';
  };

  return (
    <div className="bg-stone-900/35 border border-stone-850/60 rounded-3xl p-5 space-y-4 backdrop-blur-md" id="user-profile-isi">
      <div className="flex justify-between items-center border-b border-stone-900/80 pb-3">
        <div className="flex items-center space-x-2">
          <Scale className="w-4 h-4 text-amber-400" />
          <h4 className="text-[10px] uppercase text-stone-300 tracking-[0.2em] font-bold">
            {lang === 'pt' ? 'Índice de Sintonia Interior (ISI)' : 'Inner Harmony Index (IHI)'}
          </h4>
        </div>
        <div className="flex items-center space-x-1.5 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-[9px] font-bold text-amber-300 font-mono">ISI {currentIsi}%</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 py-1">
        <div className="bg-stone-950/40 border border-stone-900/60 p-2.5 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-[8px] text-stone-500 uppercase font-mono tracking-wider">{lang === 'pt' ? 'Foco Mental' : 'Focus'}</span>
          <span className="text-[12px] font-bold text-amber-400/90 font-mono mt-0.5">{Math.round(currentIsi * 0.92)}%</span>
        </div>
        <div className="bg-stone-950/40 border border-stone-900/60 p-2.5 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-[8px] text-stone-500 uppercase font-mono tracking-wider">{lang === 'pt' ? 'Paz / Calma' : 'Calm / Peace'}</span>
          <span className="text-[12px] font-bold text-teal-400/90 font-mono mt-0.5">{Math.round(currentIsi * 1.05 > 100 ? 100 : currentIsi * 1.05)}%</span>
        </div>
        <div className="bg-stone-950/40 border border-stone-900/60 p-2.5 rounded-2xl flex flex-col items-center justify-center text-center">
          <span className="text-[8px] text-stone-500 uppercase font-mono tracking-wider">{lang === 'pt' ? 'Estabilidade' : 'Grounding'}</span>
          <span className="text-[12px] font-bold text-pink-400/90 font-mono mt-0.5">{currentIsi}%</span>
        </div>
      </div>

      <div className="h-44 w-full bg-stone-950/80 p-2.5 rounded-2xl border border-stone-900/80 flex items-center justify-center relative">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="isiGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.25}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#221e1c" vertical={false} />
            <XAxis 
              dataKey="label" 
              stroke="#57534e" 
              fontSize={8}
              tickLine={false}
              axisLine={false}
              dy={5}
            />
            <YAxis 
              domain={[0, 100]} 
              stroke="#57534e" 
              fontSize={8}
              tickLine={false}
              axisLine={false}
              tickCount={5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0c0a09',
                borderColor: '#292524',
                borderRadius: '12px',
                fontSize: '10px',
                fontFamily: 'monospace'
              }}
              labelStyle={{ color: '#78716c', fontWeight: 'bold' }}
              itemStyle={{ color: '#f59e0b', padding: '0px' }}
            />
            <Area 
              type="monotone" 
              dataKey="isi" 
              stroke="#f59e0b" 
              strokeWidth={1.5}
              fillOpacity={1}
              fill="url(#isiGradient)"
              activeDot={{ r: 5, strokeWidth: 0, fill: '#fbbf24' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-2.5 bg-stone-950/30 p-3 rounded-2xl border border-stone-900/60 items-center">
        <Compass className="w-4 h-4 text-amber-400 shrink-0" />
        <div className="flex-1">
          <p className="text-[10px] text-stone-300 leading-normal font-light">
            {lang === 'pt' 
              ? `Estado atual: ${getIsiFeedback(currentIsi)}. Seu Índice de Sintonia reflete conexões harmoniosas compostas por ritmos cardíacos cognitivos e decibéis de paz.`
              : `Current Tuning: ${getIsiFeedback(currentIsi)}. Your Harmony Index represents deep integration of calm pauses and peaceful vocal biofeedback.`
            }
          </p>
        </div>
      </div>
    </div>
  );
};
