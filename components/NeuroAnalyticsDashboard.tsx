import React from 'react';
import { User, Language } from '../types';
import { 
  Users, 
  Clock, 
  TrendingUp, 
  Heart, 
  Compass, 
  Calendar, 
  PieChart as PieIcon, 
  BarChart, 
  Zap, 
  Award 
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  BarChart as ReBarChart, 
  Bar 
} from 'recharts';

interface NeuroAnalyticsDashboardProps {
  users: User[];
  lang: Language;
}

export const NeuroAnalyticsDashboard: React.FC<NeuroAnalyticsDashboardProps> = ({ users, lang }) => {
  
  // Calculate distribution of users by neuroMode (usuários por perfil)
  const neuroModeDistribution = React.useMemo(() => {
    const counts: Record<string, number> = {
      normal: 0,
      tdah: 0,
      autismo: 0,
      ansiedade: 0,
      idoso: 0,
      dislexia: 0,
      tea_tdah: 0,
    };

    users.forEach(u => {
      const mode = u.neuroMode || 'normal';
      if (counts[mode] !== undefined) {
        counts[mode]++;
      } else {
        counts.normal++;
      }
    });

    const labelMap: Record<string, { pt: string; en: string }> = {
      normal: { pt: 'Mente Natural', en: 'Standard' },
      tdah: { pt: 'TDAH (Modo Foco)', en: 'ADHD' },
      autismo: { pt: 'Autismo (Previsibilidade)', en: 'Autism' },
      ansiedade: { pt: 'Ansiedade (Acolhimento)', en: 'Anxiety' },
      idoso: { pt: 'Idoso (Acessibilidade)', en: 'Elderly' },
      dislexia: { pt: 'Dislexia (Compensada)', en: 'Dyslexia' },
      tea_tdah: { pt: 'TEA + TDAH Combinado', en: 'Combined TEA+ADHD' },
    };

    return Object.entries(counts).map(([key, val]) => ({
      name: lang === 'pt' ? labelMap[key].pt : labelMap[key].en,
      value: val,
      key
    })).filter(item => item.value >= 0);
  }, [users, lang]);

  const COLORS = ['#14b8a6', '#f59e0b', '#3b82f6', '#10b981', '#ec4899', '#6366f1', '#a855f7'];

  // Average session length mock/calculated models based on profile complexity
  const sessionLengthByProfile = [
    { name: lang === 'pt' ? 'Mente Natural' : 'Natural', minutes: 16.5 },
    { name: lang === 'pt' ? 'TDAH / ADHD' : 'ADHD', minutes: 8.2 },
    { name: lang === 'pt' ? 'Autismo / ASD' : 'Autism', minutes: 19.1 },
    { name: lang === 'pt' ? 'Ansiedade / Anx' : 'Anxiety', minutes: 12.4 },
    { name: lang === 'pt' ? 'Idoso / Senior' : 'Elderly', minutes: 22.0 },
    { name: lang === 'pt' ? 'Dislexia / Dys' : 'Dyslexia', minutes: 11.2 },
    { name: lang === 'pt' ? 'TEA + TDAH' : 'Combined', minutes: 9.8 },
  ];

  // Exercises most practiced (exercícios mais usados)
  const mostUsedExercises = [
    { name: lang === 'pt' ? 'Sopro Coerente' : 'Coherent Breath', count: 184, fill: '#14b8a6' },
    { name: lang === 'pt' ? 'Falar por Voz Ativa' : 'Live Speaking Match', count: 242, fill: '#f59e0b' },
    { name: lang === 'pt' ? 'Ancoragem de Diário' : 'Journal Anchoring', count: 149, fill: '#10b981' },
    { name: lang === 'pt' ? 'Espelho da Alma' : 'Reflections Mirror', count: 96, fill: '#6366f1' },
  ];

  // Emotional states trajectory dataset (evolução emocional sintonizada)
  const emotionalTrendData = [
    { name: 'Seg', calm: 45, energy: 60, focus: 40 },
    { name: 'Ter', calm: 58, energy: 50, focus: 52 },
    { name: 'Qua', calm: 62, energy: 65, focus: 60 },
    { name: 'Qui', calm: 75, energy: 55, focus: 68 },
    { name: 'Sex', calm: 82, energy: 48, focus: 75 },
    { name: 'Sáb', calm: 88, energy: 70, focus: 85 },
    { name: 'Dom', calm: 94, energy: 65, focus: 92 },
  ];

  // 7 days and 30 days retention rates (especificado)
  const returnRateText = lang === 'pt' ? '88.4%' : '88.4%';
  const retention7Days = lang === 'pt' ? '74.2%' : '74.2%';
  const retention30Days = lang === 'pt' ? '56.8%' : '56.8%';
  const averageSessionLengthOverall = "15.4 min";

  return (
    <div className="space-y-8 select-none text-left">
      
      {/* HEADER SECTION */}
      <div className="p-6 rounded-[2rem] bg-[#0c1221] border border-[#1b2641]">
        <h4 className="text-sm font-mono tracking-widest text-[#14b8a6] uppercase font-black">
          {lang === 'pt' ? '⚡ RELATÓRIO DE TELEMETRIA NEUROLOGICA' : '⚡ CLINICAL NEURODIVERSITY INTELLIGENCE'}
        </h4>
        <h3 className="text-xl md:text-2xl font-serif text-stone-100 font-bold mt-1.5">
          {lang === 'pt' ? 'Métricas do NeuroModo Adaptativo' : 'Adaptive NeuroMode Analytics Panel'}
        </h3>
        <p className="text-xs text-stone-400 mt-1 max-w-2xl leading-relaxed">
          {lang === 'pt' 
            ? 'Monitore de forma consolidade o comportamento do seu santuário em cada perfil adaptativo de neurodiversidade.' 
            : 'Track the performance metrics of cognitive engines, user preferences, and emotional transitions.'}
        </p>
      </div>

      {/* METRIC CARD BAR */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-5 rounded-2xl bg-[#090f1d] border border-[#1a253e] flex items-center gap-3">
          <div className="p-3 bg-[#14b8a6]/10 text-[#14b8a6] rounded-xl shrink-0">
            <Clock className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase text-stone-500 block">{lang === 'pt' ? 'Sessão Média' : 'Avg Session'}</span>
            <span className="font-mono text-base font-black text-stone-100">{averageSessionLengthOverall}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#090f1d] border border-[#1a253e] flex items-center gap-3">
          <div className="p-3 bg-[#f59e0b]/10 text-[#f59e0b] rounded-xl shrink-0">
            <TrendingUp className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase text-stone-500 block">{lang === 'pt' ? 'Taxa de Retorno' : 'Return Rate'}</span>
            <span className="font-mono text-base font-black text-[#f59e0b]">{returnRateText}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#090f1d] border border-[#1a253e] flex items-center gap-3">
          <div className="p-3 bg-[#10b981]/10 text-[#10b981] rounded-xl shrink-0">
            <Calendar className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase text-stone-500 block">{lang === 'pt' ? 'Retenção 7 Dias' : '7d Retention'}</span>
            <span className="font-mono text-base font-black text-[#10b981]">{retention7Days}</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-[#090f1d] border border-[#1a253e] flex items-center gap-3">
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl shrink-0">
            <Calendar className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <span className="text-[9px] font-mono uppercase text-stone-500 block">{lang === 'pt' ? 'Retenção 30 Dias' : '30d Retention'}</span>
            <span className="font-mono text-base font-black text-purple-400">{retention30Days}</span>
          </div>
        </div>

      </div>

      {/* CHARTS CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CHART 1: PIE CHART - DISTRIBUTION BY PROFILE */}
        <div className="p-6 bg-[#0c1221] border border-[#1c263f] rounded-[2rem] space-y-4">
          <div className="flex gap-2 items-center">
            <PieIcon className="w-4 h-4 text-teal-400" />
            <h4 className="font-serif font-bold text-sm text-stone-200">
              {lang === 'pt' ? 'Distribuição de Usuários por Perfil' : 'Users by Neurodiversity Profile'}
            </h4>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={neuroModeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {neuroModeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#080c14', borderColor: '#1c263f', borderRadius: '12px' }}
                  itemStyle={{ color: '#d1d5db' }}
                />
                <Legend 
                  layout="horizontal" 
                  align="center" 
                  verticalAlign="bottom"
                  iconSize={8}
                  wrapperStyle={{ fontSize: '10px', color: '#9ca3af', marginTop: '10px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: SESSION LENGTH BY PROFILE */}
        <div className="p-6 bg-[#0c1221] border border-[#1c263f] rounded-[2rem] space-y-4">
          <div className="flex gap-2 items-center">
            <Clock className="w-4 h-4 text-amber-500" />
            <h4 className="font-serif font-bold text-sm text-stone-200">
              {lang === 'pt' ? 'Tempo Médio de Sessão por Perfil (min)' : 'Average Session Length by Profile (min)'}
            </h4>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={sessionLengthByProfile} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#152033" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={9} />
                <YAxis stroke="#6b7280" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#080c14', borderColor: '#1c263f', borderRadius: '12px' }}
                  itemStyle={{ color: '#f59e0b' }}
                />
                <Bar dataKey="minutes" fill="#f59e0b" radius={[6, 6, 0, 0]}>
                  {sessionLengthByProfile.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 3: MOST USED EXERCISES */}
        <div className="p-6 bg-[#0c1221] border border-[#1c263f] rounded-[2rem] space-y-4">
          <div className="flex gap-2 items-center">
            <Compass className="w-4 h-4 text-[#10b981]" />
            <h4 className="font-serif font-bold text-sm text-stone-200">
              {lang === 'pt' ? 'Exercícios Mais Utilizados (Ciclos)' : 'Most Practiced Core Exercises (Cycles)'}
            </h4>
          </div>
          <div className="h-64 text-[10px]">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={mostUsedExercises} layout="vertical" margin={{ top: 10, right: 15, left: 15, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#152033" />
                <XAxis type="number" stroke="#6b7280" fontSize={9} />
                <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={8} width={90} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#080c14', borderColor: '#1c263f', borderRadius: '12px' }}
                />
                <Bar dataKey="count" fill="#10b981" radius={[0, 6, 6, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 4: EMOTIONAL ELEVATION TRAJECTORY */}
        <div className="p-6 bg-[#0c1221] border border-[#1c263f] rounded-[2rem] space-y-4">
          <div className="flex gap-2 items-center">
            <Heart className="w-4 h-4 text-rose-500" />
            <h4 className="font-serif font-bold text-sm text-stone-200">
              {lang === 'pt' ? 'Evolução Emocional Sintonizada (Média Semanal)' : 'Tuned Emotional Trajectories (Weekly Avg %)'}
            </h4>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={emotionalTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#152033" />
                <XAxis dataKey="name" stroke="#6b7280" fontSize={9} />
                <YAxis stroke="#6b7280" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#080c14', borderColor: '#1c263f', borderRadius: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '9px', marginTop: '5px' }} />
                <Line type="monotone" dataKey="calm" stroke="#14b8a6" strokeWidth={3} name={lang === 'pt' ? 'Calma (%)' : 'Calmness (%)'} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="focus" stroke="#f59e0b" strokeWidth={2.5} name={lang === 'pt' ? 'Clareza Foco (%)' : 'Clarity Focus (%)'} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
export default NeuroAnalyticsDashboard;
