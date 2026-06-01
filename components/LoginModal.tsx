import React, { useState } from 'react';
import { Language, User } from '../types';
import { TRANSLATIONS, ADMIN_EMAILS } from '../constants';
import Logo from './Logo';
import { auth, db, OperationType, handleFirestoreError } from '../lib/firebase';
import { signInAnonymously, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

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
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');
  
  const t = TRANSLATIONS[lang].login || TRANSLATIONS['en'].login; 

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorText('');
    try {
      const provider = new GoogleAuthProvider();
      // Optional: enforce custom account selector
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const authUser = result.user;
      
      // Save/merge Google profile in Firestore
      const userDocRef = doc(db, 'users', authUser.uid);
      const normalizedEmail = (authUser.email || '').toLowerCase().trim();
      const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);
      
      const userProfile = {
        id: authUser.uid,
        name: authUser.displayName || name || 'Praticante Zen',
        email: normalizedEmail,
        isAdmin,
        plan: isAdmin ? 'guardian' : 'member',
        registeredAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        resonanceScore: 0,
        accessibilityMode: accMode
      };
      
      await setDoc(userDocRef, userProfile);
      onClose();
    } catch (err: any) {
      console.error(err);
      setErrorText(lang === 'pt' ? 'Falha na autenticação do Google.' : 'Google Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) return;

    setLoading(true);
    setErrorText('');
    const normalizedEmail = email.toLowerCase().trim();
    const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);

    try {
      // Authenticate anonymously so we receive a unique Auth coordinate
      const credential = await signInAnonymously(auth);
      const authUser = credential.user;

      // Save user profile details in Firestore
      const userDocRef = doc(db, 'users', authUser.uid);
      const userObj: User = {
        id: authUser.uid,
        name,
        email: normalizedEmail,
        isAdmin,
        plan: isAdmin ? 'guardian' : 'member',
        registeredAt: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        resonanceScore: 0,
        accessibilityMode: accMode
      };

      await setDoc(userDocRef, userObj);
      onClose();
    } catch (err: any) {
      handleFirestoreError(err, OperationType.WRITE, `users/anonymous_registration`);
      setErrorText(lang === 'pt' ? 'Erro ao salvar perfil.' : 'Failed saving profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-stone-950/95 backdrop-blur-md p-6 animate-fade-in">
      <div className="bg-stone-900 border border-stone-800 w-full max-w-sm rounded-[2rem] flex flex-col relative shadow-2xl p-8 overflow-hidden">
         
         {/* Decorative spotlight */}
         <div className="absolute -top-20 -left-20 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl"></div>

         <button 
           onClick={onClose} 
           disabled={loading}
           className="absolute top-5 right-5 text-stone-600 hover:text-stone-300 transition-colors disabled:opacity-50"
         >
            <XMarkIcon className="w-6 h-6" />
         </button>

         <div className="flex flex-col items-center mb-6 relative z-10">
             <Logo className="w-14 h-14 mb-3" />
             <h2 className="text-2xl font-serif text-stone-200 tracking-widest uppercase">{t?.title}</h2>
             <p className="text-[9px] text-stone-500 uppercase tracking-widest mt-1">
               {lang === 'pt' ? 'Portal da Serenidade' : 'Portal of Serenity'}
             </p>
         </div>

         {errorText && (
           <div className="mb-4 bg-rose-950/55 border border-rose-800 text-rose-300 rounded-xl p-3 text-[10px] uppercase tracking-wider text-center font-bold">
             {errorText}
           </div>
         )}

         {/* PRIMARY: Google Auth Call-to-Action */}
         <button
           type="button"
           onClick={handleGoogleLogin}
           disabled={loading}
           className="w-full py-3.5 bg-white hover:bg-stone-100 disabled:bg-stone-800 text-stone-950 font-bold uppercase tracking-[0.15em] text-[10px] transition-all rounded-xl shadow-md flex items-center justify-center space-x-2.5 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
         >
           {/* Custom clean inline google icon (using native visual specs) */}
           <svg className="w-4 h-4" viewBox="0 0 24 24">
             <path fill="#EA4335" d="M12 5.04c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.68 14.9 1 12 1 7.24 1 3.2 3.73 1.24 7.72l3.75 2.91C5.92 7.15 8.71 5.04 12 5.04z" />
             <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.44-1.09 2.66-2.31 3.49l3.58 2.78c2.1-1.94 3.78-4.79 3.78-8.37z" />
             <path fill="#FBBC05" d="M4.99 10.63c-.24-.72-.37-1.49-.37-2.29s.13-1.57.37-2.29L1.24 3.14C.45 4.73 0 6.52 0 8.35s.45 3.61 1.24 5.21l3.75-2.93z" />
             <path fill="#34A853" d="M12 23c3.24 0 5.96-1.08 7.95-2.93l-3.58-2.78c-1 .67-2.28 1.07-4.37 1.07-3.29 0-6.08-2.11-7.07-5.59l-3.75 2.91C3.2 20.27 7.24 23 12 23z" />
           </svg>
           <span>{lang === 'pt' ? 'Entrar com Google' : 'Sign in with Google'}</span>
         </button>

         {/* Separator visual */}
         <div className="flex items-center my-5">
           <div className="flex-1 h-[1px] bg-stone-800"></div>
           <span className="text-[8px] font-mono mx-3 uppercase text-stone-600 tracking-widest">{lang === 'pt' ? 'Ou' : 'Or'}</span>
           <div className="flex-1 h-[1px] bg-stone-800"></div>
         </div>

         {/* Fallback anonymous input submission form */}
         <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
             <div className="space-y-1">
                 <label className="text-[9px] text-stone-500 uppercase tracking-widest block px-1">{t?.name}</label>
                 <input 
                    type="text" 
                    value={name}
                    required
                    disabled={loading}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-teal-500 text-xs rounded-xl p-3 text-stone-300 focus:outline-none transition-all placeholder-stone-800"
                    placeholder="Evaldo Poeta..."
                 />
             </div>

             <div className="space-y-1">
                 <label className="text-[9px] text-stone-500 uppercase tracking-widest block px-1">{t?.email}</label>
                 <input 
                    type="email" 
                    value={email}
                    required
                    disabled={loading}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 focus:border-teal-500 text-xs rounded-xl p-3 text-stone-300 focus:outline-none transition-all placeholder-stone-800"
                    placeholder="email@exemplo.com"
                 />
             </div>

             <div 
                onClick={() => !loading && setAccMode(!accMode)}
                className={`flex items-center space-x-4 p-3 rounded-xl cursor-pointer transition-all border ${accMode ? 'bg-teal-900/10 border-teal-500/30' : 'bg-stone-950 border-stone-800 hover:bg-stone-800/30'} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
             >
                <div className={`w-10 h-5 rounded-full relative transition-all duration-300 ${accMode ? 'bg-teal-500' : 'bg-stone-700'}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all shadow-md ${accMode ? 'left-5.5' : 'left-0.5'}`}></div>
                </div>
                <div className="flex flex-col">
                    <span className={`text-[9px] font-bold uppercase tracking-wider ${accMode ? 'text-teal-400' : 'text-stone-300'}`}>{t?.accessibility}</span>
                    <span className="text-[8px] text-stone-500 leading-tight">{t?.accessibilitySub}</span>
                </div>
             </div>

             <button 
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-stone-800 hover:bg-stone-750 disabled:bg-stone-900 text-stone-200 hover:text-stone-100 disabled:text-stone-600 font-bold uppercase tracking-[0.2em] text-[10px] transition-all rounded-xl mt-3 active:scale-[0.98] cursor-pointer disabled:cursor-not-allowed"
             >
                 {loading ? (lang === 'pt' ? 'Carregando...' : 'Connecting...') : t?.submit}
             </button>
         </form>

      </div>
    </div>
  );
};
