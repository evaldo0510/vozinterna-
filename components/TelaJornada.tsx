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
