
import React from 'react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
// Fix: Corrected Logo import from named to default
import Logo from './Logo';

interface LandingModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const XMarkIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
  </svg>
);

const BrainIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 0 0 4.5 4.5H18a3.75 3.75 0 0 0 1.332-7.257 3 3 0 0 0-3.758-3.848 5.25 5.25 0 0 0-10.233 2.33A4.502 4.502 0 0 0 2.25 15Z" />
    </svg>
);

export const LandingModal: React.FC<LandingModalProps> = ({ isOpen, onClose, lang }) => {
  const t = (TRANSLATIONS[lang] as any).landing;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/95 backdrop-blur-md p-0 md:p-6 animate-fade-in overflow-hidden">
      <div className="bg-stone-900 border border-stone-800 w-full h-full md:max-w-4xl md:h-[90vh] md:rounded-2xl flex flex-col relative shadow-2xl overflow-hidden">
         
         {/* Close Button */}
         <button onClick={onClose} className="absolute top-6 right-6 z-20 text-stone-500 hover:text-stone-200 transition-colors bg-black/20 p-2 rounded-full backdrop-blur-sm">
            <XMarkIcon className="w-6 h-6" />
         </button>

         {/* Content Container - Scrollable */}
         <div className="flex-1 overflow-y-auto custom-scrollbar">
            
            {/* Hero Section */}
            <div className="relative py-20 px-8 text-center flex flex-col items-center justify-center border-b border-stone-800 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-stone-800/40 via-stone-900 to-stone-950">
                <Logo className="w-20 h-20 text-teal-500/80 mb-8 animate-pulse" />
                <h2 className="text-3xl md:text-5xl font-serif text-stone-100 tracking-wide mb-4 max-w-2xl leading-tight">
                    {t?.heroTitle}
                </h2>
                <p className="text-stone-400 text-sm md:text-lg font-light tracking-widest uppercase max-w-xl">
                    {t?.heroSubtitle}
                </p>
                
                {/* Decoration */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-20">
                    <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-900/40 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-amber-900/20 rounded-full blur-3xl"></div>
                </div>
            </div>

            {/* Grid Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-8 md:p-12 max-w-4xl mx-auto">
                
                {/* What is it? */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-2">
                        <SparklesIcon className="w-5 h-5 text-amber-500" />
                        <h3 className="text-xl font-serif text-stone-200">{t?.whatIsTitle}</h3>
                    </div>
                    <p className="text-stone-400 font-light leading-relaxed text-sm md:text-base">
                        {t?.whatIsText}
                    </p>
                </div>

                {/* The Method */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-3 mb-2">
                        <BrainIcon className="w-5 h-5 text-teal-500" />
                        <h3 className="text-xl font-serif text-stone-200">{t?.methodTitle}</h3>
                    </div>
                    <p className="text-stone-400 font-light leading-relaxed text-sm md:text-base">
                        {t?.methodText}
                    </p>
                </div>

                {/* How to Use - Full Width */}
                <div className="md:col-span-2 mt-8 pt-8 border-t border-stone-800">
                     <h3 className="text-2xl font-serif text-center text-stone-300 mb-8">{t?.howTitle}</h3>
                     <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {t?.steps?.map((step: any, index: number) => (
                            <div key={index} className="bg-stone-950/50 p-6 rounded-lg border border-stone-800 hover:border-stone-700 transition-colors">
                                <span className="text-4xl font-serif text-stone-800 block mb-2">0{index + 1}</span>
                                <h4 className="text-stone-300 font-medium mb-2 uppercase tracking-wide text-xs">{step.title}</h4>
                                <p className="text-stone-500 text-sm leading-relaxed">{step.text}</p>
                            </div>
                        ))}
                     </div>
                </div>

            </div>

            {/* CTA Footer */}
            <div className="p-8 md:p-12 text-center bg-stone-950 border-t border-stone-800">
                <button 
                    onClick={onClose}
                    className="inline-flex items-center justify-center px-10 py-4 bg-teal-900/20 border border-teal-900/50 rounded-full text-teal-200 uppercase tracking-[0.2em] hover:bg-teal-900/40 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(20,184,166,0.1)]"
                >
                    {t?.cta}
                </button>
            </div>

         </div>

      </div>
    </div>
  );
};
