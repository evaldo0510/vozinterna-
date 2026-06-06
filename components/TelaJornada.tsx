import React from 'react';
import { ArrowLeft, Wind, CloudFog, Sun, Sparkles, User } from 'lucide-react';
import { Language } from '../types';

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
      clima: lang === 'pt' ? 'brisa' : 'breeze',
      icone: Wind,
      cor: 'text-sky-500',
      bg: 'bg-sky-50',
      fragmento: lang === 'pt' 
        ? '"A mente estava correndo, mas consegui pausar..."' 
        : '"The mind was racing, but I managed to pause..."'
    },
    {
      id: 2,
      data: lang === 'pt' ? 'Ontem' : 'Yesterday',
      clima: lang === 'pt' ? 'neblina' : 'fog',
      icone: CloudFog,
      cor: 'text-stone-400',
      bg: 'bg-stone-100',
      fragmento: lang === 'pt'
        ? '"Não sei explicar o peso, apenas deixei as palavras caírem aqui."'
        : '"I can\'t explain the weight, I simply let the words fall onto the page here."'
    },
    {
      id: 3,
      data: lang === 'pt' ? '12 de Maio' : 'May 12',
      clima: lang === 'pt' ? 'sol' : 'sunny',
      icone: Sun,
      cor: 'text-amber-500',
      bg: 'bg-amber-50',
      fragmento: lang === 'pt'
        ? '"Uma epifania rara. Senti o chão sob os pés."'
        : '"A rare epiphany. I felt the steady ground beneath my feet."'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FDFBF7] flex flex-col font-sans text-stone-800 select-none">
      
      {/* Cabeçalho */}
      <header className="w-full p-6 md:px-12 flex justify-between items-center sticky top-0 bg-[#FDFBF7]/80 backdrop-blur-md z-10">
         <button 
          onClick={onBack}
          className="flex items-center gap-2 text-stone-400 hover:text-stone-800 transition-colors group cursor-pointer"
         >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">
            {lang === 'pt' ? 'Voltar' : 'Back'}
          </span>
        </button>

        {onNavigateToProfile && (
          <button
            onClick={onNavigateToProfile}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 text-stone-500 hover:text-stone-800 text-xs tracking-wider transition-all cursor-pointer bg-white/40 shadow-sm"
          >
            <User className="w-3.5 h-3.5" />
            <span className="font-mono text-[9px] uppercase">
              {lang === 'pt' ? 'Ver Perfil' : 'Resonance Details'}
            </span>
          </button>
        )}
      </header>

      <main className="flex-1 w-full max-w-2xl mx-auto px-6 pb-24 flex flex-col">
        
        <div className="mb-12 mt-4 animate-fade-in-up">
          <h2 className="text-3xl font-medium text-stone-700 mb-2 font-serif">
            {lang === 'pt' ? 'Sua Jornada' : 'Your Journey'}
          </h2>
          <p className="text-stone-500 text-sm">
            {lang === 'pt' 
              ? 'O mapa dos seus climas internos. Sem cobranças, apenas observação.' 
              : 'The map of your inner climates. Free of demands, dedicated purely to gentle observation.'}
          </p>
        </div>

        {/* Visual progress bar of milestones of Hypnotic Cognitive Poetry */}
        <div className="mb-12 p-6 md:p-8 rounded-[2rem] bg-gradient-to-tr from-[#fbfaf7] to-[#f5f0e6] border border-[#e6dfd3] shadow-[0_4px_24px_rgba(21,46,34,0.02)] space-y-6">
          <div className="flex justify-between items-center bg-transparent">
            <div className="space-y-1">
              <span className="text-[9px] font-mono font-bold tracking-[0.25em] text-[#5c7c64] uppercase block">
                {lang === 'pt' ? 'Marcos de Integração PCH' : 'PCH Integration Milestones'}
              </span>
              <h3 className="text-lg font-serif font-semibold text-stone-850">
                {lang === 'pt' ? 'Evolução da Voz Interior' : 'Inner Voice Evolution'}
              </h3>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-[#5c7c64] text-white flex items-center gap-1.5 shadow-sm">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[11px] font-mono font-bold">50% {lang === 'pt' ? 'Concluído' : 'Done'}</span>
            </div>
          </div>

          {/* Visual Step Bar */}
          <div className="relative w-full py-4">
            <div className="absolute top-[31px] left-3 right-3 h-1 bg-stone-200/80 rounded-full z-0">
              <div className="h-full bg-gradient-to-r from-[#5c7c64] to-[#82b98e] rounded-full transition-all duration-1000" style={{ width: '50%' }} />
            </div>

            <div className="relative z-10 flex justify-between items-center">
              {/* Step 1: Completed */}
              <div className="flex flex-col items-center space-y-2 group">
                <div className="w-9 h-9 rounded-full bg-[#5c7c64] text-white flex items-center justify-center font-bold text-xs ring-4 ring-[#fbece2]/15 shadow-sm transition-transform group-hover:scale-105">
                  ✓
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600 block">
                    {lang === 'pt' ? 'Sopro' : 'Breath'}
                  </span>
                  <span className="text-[8px] text-stone-400 block max-w-[70px] leading-tight select-none">
                    {lang === 'pt' ? 'Âncora Coerente' : 'Anchor'}
                  </span>
                </div>
              </div>

              {/* Step 2: Completed */}
              <div className="flex flex-col items-center space-y-2 group">
                <div className="w-9 h-9 rounded-full bg-[#5c7c64] text-white flex items-center justify-center font-bold text-xs ring-4 ring-[#fbece2]/15 shadow-sm transition-transform group-hover:scale-105">
                  ✓
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-600 block">
                    {lang === 'pt' ? 'Espelho' : 'Mirror'}
                  </span>
                  <span className="text-[8px] text-stone-400 block max-w-[70px] leading-tight select-none">
                    {lang === 'pt' ? 'Climas Internos' : 'Inner Weather'}
                  </span>
                </div>
              </div>

              {/* Step 3: Current Active */}
              <div className="flex flex-col items-center space-y-2 group">
                <div className="w-9 h-9 rounded-full bg-white border-2 border-[#5c7c64] text-[#5c7c64] flex items-center justify-center font-bold text-xs shadow-sm shadow-[#5c7c64]/10 transition-transform group-hover:scale-105 relative">
                  <span className="absolute w-full h-full rounded-full bg-[#5c7c64]/12 animate-ping" />
                  3
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#5c7c64] block">
                    {lang === 'pt' ? 'Escuta' : 'Echo'}
                  </span>
                  <span className="text-[8px] text-stone-500 font-medium block max-w-[70px] leading-tight">
                    {lang === 'pt' ? 'Voz Sintonizada' : 'Vocal Sync'}
                  </span>
                </div>
              </div>

              {/* Step 4: Locked Future */}
              <div className="flex flex-col items-center space-y-2 group">
                <div className="w-9 h-9 rounded-full bg-white border border-stone-250 text-stone-400 flex items-center justify-center font-bold text-xs shadow-sm transition-transform group-hover:scale-105">
                  ★
                </div>
                <div className="text-center">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-stone-400 block">
                    {lang === 'pt' ? 'Metáfora' : 'Metaphor'}
                  </span>
                  <span className="text-[8px] text-stone-400 block max-w-[70px] leading-tight select-none">
                    {lang === 'pt' ? 'Integração PCH' : 'Full Poetry'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 border border-[#efece1] text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-[#3e5f35] font-mono text-[10px] uppercase tracking-wider">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>{lang === 'pt' ? 'Próximo Passo Recomendado' : 'Recommended Next Step'}</span>
            </div>
            <p className="text-stone-650 leading-relaxed font-light">
              {lang === 'pt' 
                ? 'Seu reflexo do clima diário está consolidado. Experimente a "Escuta" no menu inferior para registrar ou escutar o eco sussurrado das suas palavras e sintonizar sua voz profunda.' 
                : 'Your daily weather reflection module is unlocked. Try "Echo" in the bottom menu to record or listen to the whispered reflection of your lyrics.'}
            </p>
          </div>
        </div>

        {/* A Linha do Tempo (O Rio) */}
        <div className="relative border-l-2 border-stone-100 ml-6 pl-8 flex flex-col gap-10">
          
          {memorias.map((memoria, idx) => {
            const Icone = memoria.icone;
            
            return (
              <div 
                key={memoria.id} 
                className="relative group animate-fade-in-up"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                {/* O Nó da Linha do Tempo */}
                <div className={`absolute -left-[53px] top-2 w-10 h-10 rounded-full ${memoria.bg} border-4 border-[#FDFBF7] flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                  <Icone className={`w-4 h-4 ${memoria.cor}`} />
                </div>
                
                {/* O Cartão de Memória */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100/70 group-hover:border-stone-200/80 transition-all hover:shadow-md cursor-pointer">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                      {memoria.data}
                    </span>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-stone-400 px-2 py-0.5 rounded-full bg-stone-50">
                      {memoria.clima}
                    </span>
                  </div>
                  <p className="text-stone-700 text-lg italic leading-relaxed font-serif">
                    {memoria.fragmento}
                  </p>
                </div>
              </div>
            );
          })}

        </div>
      </main>
    </div>
  );
}
