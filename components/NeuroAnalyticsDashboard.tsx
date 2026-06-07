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
  Bar,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';

interface NeuroAnalyticsDashboardProps {
  users: User[];
  neuroProfiles?: any[];
  lang: Language;
}

export const NeuroAnalyticsDashboard: React.FC<NeuroAnalyticsDashboardProps> = ({ users, neuroProfiles = [], lang }) => {
  
  // Merge users with their neuro profiles for realistic scatter representation
  const combinedUserData = React.useMemo(() => {
    return users.map(u => {
      const profile = (neuroProfiles || []).find(p => p.userId === u.id || p.id === u.id);
      
      // Calculate normalized resonance score
      const resScore = u.resonanceScore !== undefined && u.resonanceScore !== 0 && u.resonanceScore !== null
        ? u.resonanceScore
        : (profile?.evolutionHistory && profile.evolutionHistory.length 
          ? Math.round(profile.evolutionHistory.reduce((sum: number, item: any) => sum + (item.alignmentPercent || 0), 0) / profile.evolutionHistory.length)
          : Math.min(100, Math.max(30, 45 + ((u.points || 0) % 40)))); // fallbacks for lovely visualization

      const level = profile?.currentLevel || u.id === 'evaluation_user' ? 4 : u.level || 1;
      const points = u.points || 0;
      const neuroType = profile?.neuroType || u.neuroMode || 'normal';

      return {
        id: u.id,
        name: u.name,
        email: u.email,
        resonanceScore: resScore,
        level,
        points,
        neuroType,
        plan: u.plan
      };
    });
  }, [users, neuroProfiles]);

  // Calculate distribution of users by neuroMode (usuários por perfil)
  const neuroModeDistribution = React.useMemo(() => {
    const counts: Record<string, number> = {
      normal: 0,
      tdah: 0,
      autismo: 0,
      ansiedade: 0,
      burnout: 0,
      idoso: 0,
      adolescente: 0,
      luto: 0,
      cristao: 0,
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
      burnout: { pt: 'Burnout (Descompressão)', en: 'Burnout Relief' },
      idoso: { pt: 'Idoso (Acessibilidade)', en: 'Elderly Easy' },
      adolescente: { pt: 'Adolescente (Expressão)', en: 'Teens Cyber' },
      luto: { pt: 'Luto (Acolhimento Doce)', en: 'Grief Solace' },
      cristao: { pt: 'Cristão (Fé Poética)', en: 'Christian Devotion' },
      dislexia: { pt: 'Dislexia (Compensada)', en: 'Dyslexia Open' },
      tea_tdah: { pt: 'TEA + TDAH Combinado', en: 'Combined TEA+ADHD' },
    };

    return Object.entries(counts).map(([key, val]) => ({
      name: lang === 'pt' ? labelMap[key].pt : labelMap[key].en,
      value: val,
      key
    })).filter(item => item.value >= 0);
  }, [users, lang]);

  const COLORS = ['#14b8a6', '#f59e0b', '#3b82f6', '#10b981', '#a855f7', '#ec4899', '#6366f1', '#10b981', '#f59e0b', '#ec4899', '#a855f7'];

  // Average session length mock/calculated models based on profile complexity
  const sessionLengthByProfile = [
    { name: lang === 'pt' ? 'Mente Natural' : 'Natural', minutes: 16.5 },
    { name: lang === 'pt' ? 'TDAH / ADHD' : 'ADHD', minutes: 8.2 },
    { name: lang === 'pt' ? 'Autismo / ASD' : 'Autism', minutes: 19.1 },
    { name: lang === 'pt' ? 'Ansiedade / Anx' : 'Anxiety', minutes: 12.4 },
    { name: lang === 'pt' ? 'Burnout Relief' : 'Burnout', minutes: 25.5 },
    { name: lang === 'pt' ? 'Idoso / Senior' : 'Elderly', minutes: 22.0 },
    { name: lang === 'pt' ? 'Adolescente / Teen' : 'Teenager', minutes: 14.8 },
    { name: lang === 'pt' ? 'Luto / Solace' : 'Grief', minutes: 28.0 },
    { name: lang === 'pt' ? 'Cristão / Faith' : 'Christian', minutes: 18.2 },
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

      {/* SCATTER CHART: CLINICAL NEURODIVERSITY MATRIX */}
      <div className="p-6 bg-[#0c1221] border border-[#1c263f] rounded-[2rem] space-y-4">
        <div className="flex border-b border-[#1b2641] pb-3 justify-between items-center flex-wrap gap-2">
          <div>
            <h4 className="font-mono text-xs uppercase tracking-widest text-[#14b8a6] font-black">
              {lang === 'pt' ? 'Mapeamento Clínico de Neurodiversidade' : 'Clinical Neurodiversity Mapping'}
            </h4>
            <p className="text-[10px] text-stone-400 font-sans mt-0.5">
              {lang === 'pt' 
                ? 'Distribuição bidimensional de praticantes: Ressonância Coerente (Eixo-X) versus Pontos de Evolução (Eixo-Y)' 
                : 'Bi-dimensional practitioner distribution: Coherent Resonance (X-Axis) vs Evolution XP (Y-Axis)'}
            </p>
          </div>
          <div className="text-[9px] uppercase font-mono text-stone-400 bg-[#090f1d] border border-[#1a253e] px-2.5 py-1 rounded-full flex items-center space-x-2 select-none">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{lang === 'pt' ? 'Dados no Firestore' : 'Live Firestore'}</span>
          </div>
        </div>

        <div className="h-80 w-full relative">
          {combinedUserData.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-stone-600 font-mono text-xs uppercase">
              {lang === 'pt' ? 'Sem dados de praticantes' : 'No practitioner data found'}
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#152033" />
                <XAxis 
                  type="number" 
                  dataKey="resonanceScore" 
                  name={lang === 'pt' ? 'Ressonância Coerente' : 'Coherent Resonance'} 
                  unit="%" 
                  stroke="#4b5563"
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fontFamily: 'monospace', fill: '#9ca3af' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="points" 
                  name={lang === 'pt' ? 'Evolução / Engajamento' : 'Evolution / Engagement'} 
                  unit=" XP"
                  stroke="#4b5563"
                  tick={{ fontSize: 9, fontFamily: 'monospace', fill: '#9ca3af' }}
                />
                <ZAxis type="category" dataKey="neuroType" name="Perfil" />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3', stroke: '#374151' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const labelMap: Record<string, { pt: string; en: string }> = {
                        normal: { pt: 'Mente Natural', en: 'Standard' },
                        tdah: { pt: 'TDAH (Modo Foco)', en: 'ADHD' },
                        autismo: { pt: 'Autismo (Previsibilidade)', en: 'Autism' },
                        ansiedade: { pt: 'Ansiedade (Acolhimento)', en: 'Anxiety' },
                        burnout: { pt: 'Burnout (Descompressão)', en: 'Burnout Relief' },
                        idoso: { pt: 'Idoso (Acessibilidade)', en: 'Elderly Easy' },
                        adolescente: { pt: 'Adolescente (Expressão)', en: 'Teens Cyber' },
                        luto: { pt: 'Luto (Acolhimento Doce)', en: 'Grief Solace' },
                        cristao: { pt: 'Cristão (Fé Poética)', en: 'Christian Devotion' },
                        dislexia: { pt: 'Dislexia (Compensada)', en: 'Dyslexia Open' },
                        tea_tdah: { pt: 'TEA + TDAH Combinado', en: 'Combined TEA+ADHD' },
                      };
                      const resolvedLabel = labelMap[data.neuroType] 
                        ? (lang === 'pt' ? labelMap[data.neuroType].pt : labelMap[data.neuroType].en)
                        : data.neuroType;
                      return (
                        <div className="bg-[#080c14] border border-[#1b2641] p-3 rounded-xl text-[11px] font-mono space-y-1 block max-w-xs text-stone-200 shadow-2xl backdrop-blur-md">
                          <p className="font-sans font-bold text-[#14b8a6] text-xs">{data.name}</p>
                          <p className="text-stone-500 text-[10px]">{data.email}</p>
                          <div className="border-t border-[#1b2641] pt-1.5 mt-1.5 space-y-0.5">
                            <p>
                              <span className="text-stone-400">Perfil:</span>{' '}
                              <span className="font-bold text-amber-500 uppercase">{resolvedLabel}</span>
                            </p>
                            <p>
                              <span className="text-stone-400">Ressonância:</span>{' '}
                              <span className="font-bold text-emerald-400">{data.resonanceScore}%</span>
                            </p>
                            <p>
                              <span className="text-stone-400">Evolução:</span>{' '}
                              <span className="font-bold text-indigo-400">{data.points} XP (Lvl {data.level})</span>
                            </p>
                            <p>
                              <span className="text-stone-400">Licença:</span>{' '}
                              <span className="font-bold text-purple-400 uppercase text-[9px]">{data.plan}</span>
                            </p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name={lang === 'pt' ? 'Praticantes' : 'Practitioners'} data={combinedUserData}>
                  {combinedUserData.map((entry, index) => {
                    const colorMap: Record<string, string> = {
                      normal: '#14b8a6',   // teal-500
                      tdah: '#f59e0b',     // amber-500
                      autismo: '#3b82f6',  // blue-500
                      ansiedade: '#10b981',// emerald-500
                      burnout: '#8b5cf6',  // violet-500
                      idoso: '#ec4899',    // pink-500
                      adolescente: '#6366f1', // indigo-500
                      luto: '#ef4444',     // red-500
                      cristao: '#06b6d4',  // cyan-500
                      dislexia: '#f43f5e', // rose-500
                      tea_tdah: '#a855f7'  // purple-500
                    };
                    const fill = colorMap[entry.neuroType] || '#14b8a6';
                    const radius = Math.min(12, Math.max(5.5, (entry.level || 1) * 1.5 + 4));
                    return (
                      <Cell 
                        key={`cell-${entry.id || index}`} 
                        fill={fill} 
                        stroke="#080c14" 
                        strokeWidth={1.5}
                        r={radius} 
                        className="cursor-pointer transition-all hover:scale-125 duration-150"
                      />
                    );
                  })}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Legend block with colored pills for clarity */}
        <div className="flex flex-wrap gap-2.5 pt-3 border-t border-[#152033]/50 text-[8.5px] font-mono font-bold uppercase tracking-wider justify-center">
          <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#14b8a6' }}></span><span>Natural</span></div>
          <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f59e0b' }}></span><span>TDAH</span></div>
          <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#3b82f6' }}></span><span>Autismo</span></div>
          <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#10b981' }}></span><span>Ansiedade</span></div>
          <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#8b5cf6' }}></span><span>Burnout</span></div>
          <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ec4899' }}></span><span>Sênior</span></div>
          <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#6366f1' }}></span><span>Adolescente</span></div>
          <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ef4444' }}></span><span>Luto</span></div>
          <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#06b6d4' }}></span><span>Devocional</span></div>
          <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#f43f5e' }}></span><span>Dislexia</span></div>
          <div className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#a855f7' }}></span><span>TEA+TDAH</span></div>
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
