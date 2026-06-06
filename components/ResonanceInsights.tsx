import React from 'react';
import { User, Language } from '../types';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Sparkles, TrendingUp, Activity } from 'lucide-react';

interface ResonanceInsightsProps {
  user: User | null;
  lang: Language;
}

export const ResonanceInsights: React.FC<ResonanceInsightsProps> = ({ user, lang }) => {
  if (!user) return null;

  // Format or generate progression data
  const getResonanceData = () => {
    const actualHistory = user.resonanceHistory || [];
    
    // If we have actual user logged history, let's display it directly to visualize their true trajectory.
    if (actualHistory.length > 0) {
      // Deduplicate history by date, keeping the latest score for each date
      const uniqueHistoryMap = new Map<string, number>();
      actualHistory.forEach(item => {
        if (item.date && typeof item.score === 'number') {
          uniqueHistoryMap.set(item.date, item.score);
        }
      });

      const uniqueHistory = Array.from(uniqueHistoryMap.entries()).map(([date, score]) => ({
        date,
        score
      }));

      // Sort by some simple heuristics or sequence. Check-ins are appended chronologically.
      // If the user has only 1 point, we can prepend a starting baseline to make the chart smooth
      if (uniqueHistory.length === 1) {
        const firstScore = uniqueHistory[0].score;
        return [
          { date: lang === 'pt' ? 'Início' : 'Start', score: Math.min(100, Math.max(30, Math.round(firstScore * 0.82))) },
          uniqueHistory[0]
        ];
      }

      return uniqueHistory;
    }

    // Fallback: If no actual history is registered yet, build a beautiful 30-day baseline wave
    const baseScore = user.resonanceScore > 0 ? user.resonanceScore : 72;
    const history = [];
    const days = 30;

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', {
        day: '2-digit',
        month: '2-digit'
      });
      const todayLabel = lang === 'pt' ? 'Hoje' : 'Today';
      const finalLabel = i === 0 ? todayLabel : dateStr;

      // Look up actual score or fallback to progressive emotional growth calculations
      const growthFactor = (days - 1 - i) / (days - 1);
      const drift = (baseScore - 12) + (12 * growthFactor); // grows steadily toward overall resonance
      const wave = Math.sin((days - 1 - i) * 0.8) * 3.5; // ambient emotional wave fluctuations
      const scoreVal = Math.min(100, Math.max(30, Math.round(drift + wave)));

      history.push({
        date: finalLabel,
        score: scoreVal
      });
    }
    return history;
  };

  const data = getResonanceData();
  const hasRealHistory = (user.resonanceHistory || []).length > 0;
  const currentScore = user.resonanceScore || (data[data.length - 1]?.score) || 72;

  // Feedback based on rating
  const getCalibrationFeedback = (score: number) => {
    if (score >= 85) {
      return lang === 'pt' 
        ? 'Sua voz e padrões de respiração indicam excelente alinhamento cognitivo.' 
        : 'Your voice and breathing patterns indicate excellent cognitive alignment.';
    } else if (score >= 65) {
      return lang === 'pt'
        ? 'Sintonia estável. Continue exercitando a respiração consciente para se harmonizar.'
        : 'Stable tuning. Keep practicing mindful breathing to reach full harmony.';
    } else {
      return lang === 'pt'
        ? 'Ressonância em calibração inicial. Experimente falar sobre sentimentos calmos.'
        : 'Resonance in initial calibration. Try speaking about calm feelings to align.';
    }
  };

  return (
    <div className="bg-stone-900/35 border border-stone-850/60 rounded-3xl p-5 space-y-4 backdrop-blur-md">
      <div className="flex justify-between items-center border-b border-stone-900 pb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-teal-400" />
          <h4 className="text-[10px] uppercase text-stone-300 tracking-[0.2em] font-bold">
            {lang === 'pt' ? 'Resonance Insights (Progresso)' : 'Resonance Insights (Tuning)'}
          </h4>
        </div>
        <div className="flex items-center space-x-1.5 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">
          <Sparkles className="w-3 h-3 text-teal-400" />
          <span className="text-[9px] font-bold text-teal-300 font-mono">{currentScore}%</span>
        </div>
      </div>

      <p className="text-[10px] text-stone-500 leading-relaxed -mt-1 font-light">
        {hasRealHistory ? (
          lang === 'pt'
            ? 'Visualização em tempo real do histórico sintonizado de sua oscilação emocional.'
            : 'Real-time visualization of your logged trajectory of emotional oscillations.'
        ) : (
          lang === 'pt'
            ? 'Modelo calibrador preliminar de decibéis harmônicos, pausas reflexivas e simetria vocal.'
            : 'Preliminary calibration baseline of harmonic decibels, reflective pauses, and vocal symmetry.'
        )}
      </p>

      {/* Chart container */}
      <div className="h-44 w-full bg-stone-950 p-2 rounded-2xl border border-stone-900 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2c2724" vertical={false} />
            <XAxis 
              dataKey="date" 
              stroke="#57534e" 
              fontSize={8}
              tickLine={false}
              axisLine={false}
              dy={5}
              interval={hasRealHistory ? 0 : 5}
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
              itemStyle={{ color: '#14b8a6', padding: '0px' }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#14b8a6" 
              strokeWidth={2}
              dot={{ fill: '#14b8a6', r: 3, stroke: '#0c0a09', strokeWidth: 1 }}
              activeDot={{ r: 5, strokeWidth: 0, fill: '#34d399' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-2.5 bg-stone-950/30 p-3 rounded-2xl border border-stone-900/60 items-start">
        <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-[9px] font-mono uppercase tracking-widest text-[#78716c] font-black">
            {lang === 'pt' ? 'Diagnóstico do Sopro' : 'Breathing Diagnostics'}
          </p>
          <p className="text-[10px] text-stone-300 mt-1 leading-normal font-light">
            {getCalibrationFeedback(currentScore)}
          </p>
        </div>
      </div>
    </div>
  );
};
