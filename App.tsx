
import React, { useState, useEffect } from 'react';
import SessionManager from './components/SessionManager';
import { TRANSLATIONS } from './constants';
import { Language, UserPlan, User } from './types';
// Fix: Corrected Logo import from named to default
import Logo from './components/Logo';
import { JournalModal } from './components/JournalModal';
import { LandingModal } from './components/LandingModal';
import { LoginModal } from './components/LoginModal';

// Icons
const BookIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
  </svg>
);

const PenIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
  </svg>
);

const StarIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
  </svg>
);

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09-3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
  </svg>
);

const UserIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
  </svg>
);

function App() {
  const [hasStarted, setHasStarted] = useState(false);
  const [lang, setLang] = useState<Language>('pt');
  const [userPlan, setUserPlan] = useState<UserPlan>('visitor');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [showJournal, setShowJournal] = useState(false);
  const [showLanding, setShowLanding] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showPremium, setShowPremium] = useState(false);

  const text = TRANSLATIONS[lang];

  return (
    <div className="h-[100dvh] w-full bg-stone-950 text-stone-200 overflow-hidden flex flex-col font-sans">
      
      {/* Organized Navigation Header */}
      {!hasStarted && (
        <header className="absolute top-0 left-0 w-full p-6 flex flex-col md:flex-row justify-between items-center z-50">
          <div className="flex items-center space-x-3 mb-6 md:mb-0">
             <Logo className="w-10 h-10 text-teal-500" />
             <div className="flex flex-col">
               <span className="font-serif text-lg tracking-widest text-stone-100 uppercase">{text.title}</span>
               <span className="text-[9px] uppercase tracking-[0.3em] text-stone-500">The Sanctuary</span>
             </div>
          </div>
          
          <nav className="flex items-center gap-3">
              {/* Cluster 1: Knowledge */}
              <div className="flex items-center bg-stone-900/40 backdrop-blur-md border border-stone-800 rounded-full p-1">
                <button onClick={() => setShowLanding(true)} className="p-2 text-stone-400 hover:text-teal-400" title="Conceito"><SparklesIcon className="w-5 h-5" /></button>
                <button onClick={() => setShowLanding(true)} className="p-2 text-stone-400 hover:text-stone-100" title="Guia"><BookIcon className="w-5 h-5" /></button>
              </div>

              {/* Cluster 2: Journey */}
              <div className="flex items-center bg-stone-900/40 backdrop-blur-md border border-stone-800 rounded-full p-1">
                <button onClick={() => setShowJournal(true)} className="p-2 text-stone-400 hover:text-teal-400" title="Diário"><PenIcon className="w-5 h-5" /></button>
              </div>

              {/* Cluster 3: User/Premium */}
              <div className="flex items-center bg-stone-900/40 backdrop-blur-md border border-stone-800 rounded-full p-1">
                <button onClick={() => setShowPremium(true)} className={`p-2 ${userPlan !== 'visitor' ? 'text-amber-400' : 'text-stone-400 hover:text-amber-300'}`} title="Membership"><StarIcon className="w-5 h-5" /></button>
                <button onClick={() => setShowLogin(true)} className={`p-2 ${currentUser ? 'text-teal-500' : 'text-stone-400 hover:text-teal-400'}`} title="Conta"><UserIcon className="w-5 h-5" /></button>
              </div>
          </nav>
        </header>
      )}

      {/* Modals */}
      <JournalModal isOpen={showJournal} onClose={() => setShowJournal(false)} lang={lang} />
      <LandingModal isOpen={showLanding} onClose={() => setShowLanding(false)} lang={lang} />
      <LoginModal isOpen={showLogin} onClose={() => setShowLogin(false)} lang={lang} onLogin={(u) => { setCurrentUser(u); setUserPlan(u.plan); }} />

      {/* Main UI */}
      <main className="flex-1 flex flex-col items-center justify-center relative">
        {!hasStarted ? (
          <div className="text-center space-y-12">
             <div className="flex flex-col items-center">
                <Logo className="w-24 h-24 text-stone-100 mb-6 drop-shadow-[0_0_20px_rgba(20,184,166,0.3)]" />
                <h1 className="text-5xl md:text-7xl font-serif text-stone-100 tracking-wider">{text.title}</h1>
                <p className="text-xs tracking-[0.4em] text-stone-400 uppercase mt-4">{text.subtitle}</p>
             </div>
             
             {currentUser && currentUser.accessibilityMode && (
                <div className="p-3 border border-teal-900/30 bg-teal-900/10 rounded-xl text-[10px] text-teal-400 uppercase tracking-widest inline-block">
                    Modo Acessível Ativo para {currentUser.name}
                </div>
             )}

             <button 
                onClick={() => setHasStarted(true)}
                className="group relative px-12 py-4 border border-stone-600 rounded-full hover:border-teal-500 transition-all duration-500"
             >
                <span className="relative text-stone-200 font-serif text-sm tracking-widest uppercase">{text.beginBtn}</span>
             </button>

             <div className="pt-8 flex justify-center space-x-4 opacity-40">
                <button onClick={() => setLang('pt')} className={`text-[10px] uppercase tracking-widest ${lang === 'pt' ? 'text-teal-400' : 'text-stone-500'}`}>PT</button>
                <button onClick={() => setLang('en')} className={`text-[10px] uppercase tracking-widest ${lang === 'en' ? 'text-teal-400' : 'text-stone-500'}`}>EN</button>
             </div>
          </div>
        ) : (
          <SessionManager onDisconnect={() => setHasStarted(false)} lang={lang} userPlan={userPlan} onUpgrade={() => setShowPremium(true)} currentUser={currentUser} />
        )}
      </main>
    </div>
  );
}

export default App;
