import React from 'react';
import { ArrowLeft, Wind, CloudFog, Sun, Sparkles, User, ShieldCheck } from 'lucide-react';
import { Language } from '../types';
import { motion } from 'motion/react';

interface TelaJornadaProps {
  lang: Language;
  onBack: () => void;
  onNavigateToProfile?: () => void;
}

export default function TelaJornada({ lang, onBack, onNavigateToProfile }: TelaJornadaProps) {
  // Simulação de memórias passadas adaptadas para os dois idiomas
  const memorias = [
    {
      id: 1,
      data: lang === 'pt' ? 'Hoje' : 'Today',
      clima: lang === 'pt' ? 'Brisa Serena' : 'Serene Breeze',
      icone: Wind,
      cor: 'text-[#14B8A6]',
      bg: 'bg-[#14B8A6]/10 border border-[#14B8A6]/20',
      fragmento: lang === 'pt' 
        ? '"A mente estava correndo sob intensa pressão externa, mas consegui pausar e sintonizar os batimentos..."' 
        : '"The mind was racing under high external pressure, but I managed to pause and align my heartbeat..."'
    },
    {
      id: 2,
      data: lang === 'pt' ? 'Ontem' : 'Yesterday',
      clima: lang === 'pt' ? 'Névoa Calma' : 'Calm Fog',
      icone: CloudFog,
      cor: 'text-[#FBBF24]',
      bg: 'bg-[#FBBF24]/10 border border-[#FBBF24]/20',
      fragmento: lang === 'pt'
        ? '"Não sei explicar racionalmente o peso do silêncio de hoje, apenas deixei as palavras caírem no caderno vivo e descansei."'
        : '"I cannot explain the heavy silence of today rationally; I simply let the words fall on my living log and rested."'
    },
    {
      id: 3,
      data: lang === 'pt' ? '12 de Maio' : 'May 12',
      clima: lang === 'pt' ? 'Sol Deslumbrante' : 'Warming Sun',
      icone: Sun,
      cor: 'text-[#34D399]',
      bg: 'bg-[#34D399]/10 border border-[#34D399]/20',
      fragmento: lang === 'pt'
        ? '"Uma epifania sutil e rara. Senti a conexão dos pés com a terra fértil e fiz as pazes com as minhas próprias imperfeições."'
        : '"A subtle and rare epiphany. I felt the physical roots connecting to the quiet earth and embraced my faults."'
    }
  ];

  return (
    <div className="min-h-screen bg-[#080B14] flex flex-col font-sans text-[#E2E8F0] select-none pb-24 relative overflow-hidden">
      
      {/* Dynamic atmospheric radial backdrop flares */}
      <div className="absolute top-[-20%] left-[-10%] w-[350px] h-[350px] bg-[#14B8A6]/4 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[300px] h-[300px] bg-[#8B5CF6]/3 rounded-full blur-[90px] pointer-events-none" />

      {/* Header */}
      <header className="w-full p-6 md:px-12 flex justify-between items-center sticky top-0 bg-[#080B14]/80 backdrop-blur-md z-20">
         <button 
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 hover:text-[#14B8A6] transition-colors group cursor-pointer"
         >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs uppercase tracking-wider font-mono font-bold">
            {lang === 'pt' ? 'Santuário' : 'Sanctuary'}
          </span>
        </button>

        {onNavigateToProfile && (
          <button
            onClick={onNavigateToProfile}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-slate-800 bg-[#101826]/60 text-slate-400 hover:text-[#14B8A6] hover:border-[#14B8A6]/45 text-xs transition-all cursor-pointer shadow-sm"
          >
            <User className="w-3.5 h-3.5" />
            <span className="font-mono text-[9px] font-bold uppercase tracking-wider">
              {lang === 'pt' ? 'Estatísticas' : 'Resonance Details'}
            </span>
          </button>
        )}
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-6 pb-12 flex flex-col z-10">
        
        {/* Page title section */}
        <div className="mb-10 mt-4 text-left">
          <span className="text-[10px] font-mono tracking-[0.3em] font-bold text-[#14B8A6] uppercase block">Seção 02 • LINHA DO TEMPO</span>
          <h2 className="text-3xl font-serif font-black text-white leading-tight">
            {lang === 'pt' ? 'Sua Jornada Interior' : 'Your Deep Journey'}
          </h2>
          <p className="text-slate-400 text-xs md:text-sm font-light mt-1.5 leading-relaxed">
            {lang === 'pt' 
              ? 'O mapa dos seus climas internos ao longo do tempo. Sem métricas de pressão ou cobranças, apenas observação acolhedora.' 
              : 'The continuous timeline of your internal weather patterns. Free of performative goals, dedicated to loving observation.'}
          </p>
        </div>

        {/* Visual progress card featuring milestones of PCH integration */}
        <div className="mb-10 p-6 md:p-7 rounded-[2rem] bg-[#101826] border border-[#1d2745] shadow-2xl space-y-6">
          <div className="flex justify-between items-center bg-transparent text-left">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-[#14B8A6] uppercase block">
                {lang === 'pt' ? 'Marcos de Integração PCH' : 'PCH Integration Milestones'}
              </span>
              <h3 className="text-base font-serif font-bold text-white">
                {lang === 'pt' ? 'Florescer da Árvore Interior' : 'Inner Tree Alignment'}
              </h3>
            </div>
            <div className="px-3 py-1 rounded-full bg-[#14B8A6]/10 text-[#14B8A6] border border-[#14B8A6]/20 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#FBBF24]" />
              <span className="text-[10px] font-mono font-bold">50% {lang === 'pt' ? 'Alinhado' : 'Aligned'}</span>
            </div>
          </div>

          {/* Visual Step Timeline Gauge */}
          <div className="relative w-full py-4 px-2">
            <div className="absolute top-[31px] left-5 right-5 h-[1.5px] bg-slate-800 rounded-full z-0">
              <div className="h-full bg-[#14B8A6] rounded-full transition-all duration-[1200ms]" style={{ width: '50%' }} />
            </div>

            <div className="relative z-10 flex justify-between items-center">
              {/* Step 1 */}
              <div className="flex flex-col items-center space-y-2 group">
                <div className="w-9 h-9 rounded-full bg-[#14B8A6] text-stone-900 flex items-center justify-center font-bold text-xs shadow-md transition-transform group-hover:scale-105">
                  ✓
                </div>
                <div className="text-center">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-300 block">
                    {lang === 'pt' ? 'Sopro' : 'Breath'}
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex flex-col items-center space-y-2 group">
                <div className="w-9 h-9 rounded-full bg-[#14B8A6] text-stone-900 flex items-center justify-center font-bold text-xs shadow-md transition-transform group-hover:scale-105">
                  ✓
                </div>
                <div className="text-center">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-300 block">
                    {lang === 'pt' ? 'Espelho' : 'Mirror'}
                  </span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex flex-col items-center space-y-2 group">
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-[#14B8A6]/30 text-[#14B8A6] flex items-center justify-center font-mono text-xs shadow-sm group-hover:scale-105 relative">
                  <span className="absolute w-full h-full rounded-full bg-[#14B8A6]/10 animate-ping" />
                  3
                </div>
                <div className="text-center">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#14B8A6] block">
                    {lang === 'pt' ? 'Diálogo' : 'Converse'}
                  </span>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex flex-col items-center space-y-2 group">
                <div className="w-9 h-9 rounded-full bg-slate-900 border border-slate-800 text-slate-505 flex items-center justify-center font-bold text-xs shadow-sm transition-transform group-hover:scale-105">
                  ★
                </div>
                <div className="text-center">
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                    {lang === 'pt' ? 'Sintonia' : 'Unity'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#101826]/60 border border-slate-800/40 text-xs space-y-1 text-left">
            <div className="flex items-center gap-1.5 font-bold text-[#34D399] font-mono text-[10px] uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>{lang === 'pt' ? 'Marcos de Estabilidade' : 'Integrative Next Step'}</span>
            </div>
            <p className="text-slate-400 leading-relaxed font-light">
              {lang === 'pt' 
                ? 'Sua rotina respiratória está madura. Recomendamos abrir o "Diálogo VozAtiva" para sintonizar vocalmente seu estado emocional e liberar a bagagem retida nos canais criativos.' 
                : 'Your daily breathing cadence is fully integrated. Try opening the vocal resonance room to anchor your active states verbally.'}
            </p>
          </div>
        </div>

        {/* Timeline representation (O Rio do Ser) */}
        <div className="relative border-l border-slate-850 border-slate-800/60 ml-5 pl-8 flex flex-col gap-8 text-left">
          
          {memorias.map((memoria, idx) => {
            const Icone = memoria.icone;
            
            return (
              <div 
                key={memoria.id} 
                className="relative group block"
              >
                {/* Timeline node */}
                <div className={`absolute -left-[53px] top-1.5 w-10 h-10 rounded-full ${memoria.bg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-lg`}>
                  <Icone className={`w-4 h-4 ${memoria.cor}`} />
                </div>
                
                {/* Memory card */}
                <div className="bg-[#101826] p-6 rounded-[2rem] border border-slate-800/60 hover:border-slate-750 hover:bg-[#101826]/80 transition-all duration-300 shadow-md">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                      {memoria.data}
                    </span>
                    <span className="text-[9.5px] font-bold uppercase font-mono tracking-widest text-[#14B8A6] px-2.5 py-0.5 rounded-full bg-[#14B8A6]/10 border border-[#14B8A6]/10">
                      {memoria.clima}
                    </span>
                  </div>
                  <p className="text-slate-205 text-stone-200 text-[14.5px] italic leading-relaxed font-serif">
                    {memoria.fragmento}
                  </p>
                </div>
              </div>
            );
          })}

        </div>

        {/* Lock privacy safety notation */}
        <div className="mt-10 flex items-center justify-center gap-2 text-slate-500 text-xs">
          <ShieldCheck className="w-4 h-4 text-[#34D399]" />
          <span className="font-mono text-[9px] uppercase tracking-wider">
            {lang === 'pt' ? 'Criptografia Local Segura • PCH Autoria Própria' : 'Safe local storage • PCH Identity Protected'}
          </span>
        </div>

      </main>
    </div>
  );
}
