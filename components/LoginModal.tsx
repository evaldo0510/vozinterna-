
import React, { useState } from 'react';
import { Language, User } from '../types';
import { TRANSLATIONS, ADMIN_EMAILS } from '../constants';
import Logo from './Logo';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
  onLogin: (user: User) => void;
}

const XMarkIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, lang, onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [accMode, setAccMode] = useState(false);
  
  const t = TRANSLATIONS[lang].login || TRANSLATIONS['en'].login; 

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    const normalizedEmail = email.toLowerCase().trim();
    const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);

    const user: User = {
      id: Date.now().toString(),
      name,
      email: normalizedEmail,
      isAdmin,
      plan: isAdmin ? 'guardian' : 'member',
      registeredAt: new Date().toISOString(),
      lastActive: new Date().toISOString(),
      resonanceScore: 0,
      accessibilityMode: accMode
    };

    onLogin(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/95 backdrop-blur-md p-6 animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 w-full max-w-sm rounded-3xl flex flex-col relative shadow-2xl p-8 overflow-hidden">
         
         {/* Decorative light */}
         <div className="absolute -top-20 -left-20 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl"></div>

         <button onClick={onClose} className="absolute top-4 right-4 text-stone-600 hover:text-stone-300 transition-colors">
            <XMarkIcon className="w-6 h-6" />
         </button>

         <div className="flex flex-col items-center mb-8 relative z-10">
             <Logo className="w-14 h-14 mb-4" />
             <h2 className="text-2xl font-serif text-stone-200 tracking-widest uppercase">{t?.title}</h2>
         </div>

         <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
             <div className="space-y-1">
                 <label className="text-[10px] text-stone-500 uppercase tracking-widest block px-1">{t?.name}</label>
                 <input 
                    type="text" 
                    value={name}
                    required
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3.5 text-stone-300 focus:outline-none focus:border-teal-500/50 transition-all placeholder-stone-800"
                    placeholder="Evaldo Poeta..."
                 />
             </div>

             <div className="space-y-1">
                 <label className="text-[10px] text-stone-500 uppercase tracking-widest block px-1">{t?.email}</label>
                 <input 
                    type="email" 
                    value={email}
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3.5 text-stone-300 focus:outline-none focus:border-teal-500/50 transition-all placeholder-stone-800"
                    placeholder="email@exemplo.com"
                 />
             </div>

             <div 
                onClick={() => setAccMode(!accMode)}
                className={`flex items-center space-x-4 p-4 rounded-2xl cursor-pointer transition-all border ${accMode ? 'bg-teal-900/20 border-teal-500/30' : 'bg-stone-950 border-stone-800 hover:bg-stone-800/30'}`}
             >
                <div className={`w-12 h-6 rounded-full relative transition-all duration-300 ${accMode ? 'bg-teal-500' : 'bg-stone-700'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md ${accMode ? 'left-7' : 'left-1'}`}></div>
                </div>
                <div className="flex flex-col">
                    <span className={`text-[11px] font-bold uppercase tracking-wider ${accMode ? 'text-teal-400' : 'text-stone-300'}`}>{t?.accessibility}</span>
                    <span className="text-[9px] text-stone-500 leading-tight">{t?.accessibilitySub}</span>
                </div>
             </div>

             <button 
                type="submit"
                className="w-full py-4 bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold uppercase tracking-[0.2em] text-xs transition-all rounded-xl mt-4 shadow-lg shadow-teal-500/10 active:scale-[0.98]"
             >
                 {t?.submit}
             </button>
         </form>

      </div>
    </div>
  );
};
