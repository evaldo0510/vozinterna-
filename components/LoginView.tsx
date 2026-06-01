import React, { useState } from 'react';
import { Language } from '../types';
import Logo from './Logo';
import { auth, db, OperationType, handleFirestoreError } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ADMIN_EMAILS } from '../constants';

interface LoginViewProps {
  lang: Language;
  onSetLang: (lang: Language) => void;
  onNavigate: (screen: 'splash' | 'register') => void;
  onSuccess: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ lang, onSetLang, onNavigate, onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorText('');
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      
      const result = await signInWithPopup(auth, provider);
      const authUser = result.user;
      
      const userDocRef = doc(db, 'users', authUser.uid);
      const docSnap = await getDoc(userDocRef);
      
      const normalizedEmail = (authUser.email || '').toLowerCase().trim();
      const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);
      
      if (!docSnap.exists()) {
        const userProfile = {
          id: authUser.uid,
          name: authUser.displayName || 'Praticante Zen',
          email: normalizedEmail,
          isAdmin,
          plan: isAdmin ? 'guardian' : 'member',
          registeredAt: new Date().toISOString(),
          lastActive: new Date().toISOString(),
          resonanceScore: 0,
          accessibilityMode: false,
          points: 0,
          level: 1,
          manifestoStep: 1,
          manifestoCompleted: false,
          profileCompleted: false
        };
        await setDoc(userDocRef, userProfile);
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorText(lang === 'pt' ? 'Falha na autenticação do Google.' : 'Google Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorText('');
    const normalizedEmail = email.toLowerCase().trim();

    try {
      await signInWithEmailAndPassword(auth, normalizedEmail, password);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      let errorMsg = lang === 'pt' ? 'E-mail ou senha incorretos.' : 'Incorrect email or password.';
      if (err?.code === 'auth/user-not-found') {
        errorMsg = lang === 'pt' ? 'Usuário não cadastrado.' : 'User is not signed up.';
      } else if (err?.code === 'auth/wrong-password') {
        errorMsg = lang === 'pt' ? 'Senha inválida.' : 'Incorrect password.';
      }
      setErrorText(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-stone-950 text-stone-200 flex flex-col justify-between p-6 relative font-sans overflow-hidden">
      {/* Glow backdrop */}
      <div className="absolute top-10 left-10 w-60 h-60 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header */}
      <div className="w-full max-w-sm mx-auto flex justify-between items-center z-10">
        <button 
          onClick={() => onNavigate('splash')} 
          className="text-xs uppercase tracking-widest text-stone-500 hover:text-stone-300 transition-colors"
        >
          {lang === 'pt' ? '← Voltar' : '← Back'}
        </button>
        <div className="flex space-x-2">
          <button onClick={() => onSetLang('pt')} className={`text-[10px] font-mono tracking-wider ${lang === 'pt' ? 'text-teal-400' : 'text-stone-600 hover:text-stone-400'}`}>PT</button>
          <button onClick={() => onSetLang('en')} className={`text-[10px] font-mono tracking-wider ${lang === 'en' ? 'text-teal-400' : 'text-stone-600 hover:text-stone-400'}`}>EN</button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 w-full max-w-sm mx-auto flex flex-col justify-center space-y-8 z-10">
        <div className="flex flex-col items-center text-center">
          <Logo className="w-14 h-14 text-teal-400 mb-3" />
          <h2 className="text-2xl font-serif text-stone-200 tracking-widest uppercase">
            {lang === 'pt' ? 'Entrar na Conta' : 'Sign In'}
          </h2>
          <p className="text-[9px] text-stone-500 uppercase tracking-widest mt-1">
            {lang === 'pt' ? 'Harmonize com seu Santuário' : 'Harmonize with your Sanctuary'}
          </p>
        </div>

        {errorText && (
          <div className="bg-rose-950/40 border border-rose-900/40 text-rose-300 rounded-xl p-3 text-[10px] uppercase tracking-wider text-center font-bold">
            {errorText}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] text-stone-500 uppercase tracking-widest block px-1">
              {lang === 'pt' ? 'Seu E-mail' : 'Your Email'}
            </label>
            <input 
              type="email" 
              value={email}
              required
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 focus:border-teal-500 text-xs rounded-xl p-3 text-stone-300 focus:outline-none transition-all placeholder-stone-800"
              placeholder="email@exemplo.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-stone-500 uppercase tracking-widest block px-1">
              {lang === 'pt' ? 'Sua Senha' : 'Your Password'}
            </label>
            <input 
              type="password" 
              value={password}
              required
              disabled={loading}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 focus:border-teal-500 text-xs rounded-xl p-3 text-stone-300 focus:outline-none transition-all placeholder-stone-800"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 text-stone-950 font-bold uppercase tracking-[0.2em] text-[10px] transition-all rounded-xl mt-3 active:scale-[0.98] cursor-pointer disabled:opacity-50"
          >
            {loading ? (lang === 'pt' ? 'Conectando...' : 'Connecting...') : (lang === 'pt' ? 'Acessar' : 'Access')}
          </button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-1 h-[1px] bg-stone-800"></div>
          <span className="text-[8px] font-mono mx-3 uppercase text-stone-600 tracking-widest">{lang === 'pt' ? 'Ou' : 'Or'}</span>
          <div className="flex-1 h-[1px] bg-stone-800"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 bg-white hover:bg-stone-100 disabled:bg-stone-800 text-stone-950 font-bold uppercase tracking-[0.15em] text-[10px] transition-all rounded-xl shadow-md flex items-center justify-center space-x-2.5 active:scale-[0.98] cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.68 14.9 1 12 1 7.24 1 3.2 3.73 1.24 7.72l3.75 2.91C5.92 7.15 8.71 5.04 12 5.04z" />
            <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.44-1.09 2.66-2.31 3.49l3.58 2.78c2.1-1.94 3.78-4.79 3.78-8.37z" />
            <path fill="#FBBC05" d="M4.99 10.63c-.24-.72-.37-1.49-.37-2.29s.13-1.57.37-2.29L1.24 3.14C.45 4.73 0 6.52 0 8.35s.45 3.61 1.24 5.21l3.75-2.93z" />
            <path fill="#34A853" d="M12 23c3.24 0 5.96-1.08 7.95-2.93l-3.58-2.78c-1 .67-2.28 1.07-4.37 1.07-3.29 0-6.08-2.11-7.07-5.59l-3.75 2.91C3.2 20.27 7.24 23 12 23z" />
          </svg>
          <span>{lang === 'pt' ? 'Entrar com Google' : 'Sign in with Google'}</span>
        </button>

        <p className="text-center text-[10px] text-stone-500">
          {lang === 'pt' ? 'Não tem conta?' : "Don't have an account?"}{' '}
          <button onClick={() => onNavigate('register')} className="text-teal-400 hover:underline font-bold">
            {lang === 'pt' ? 'Cadastre-se' : 'Register'}
          </button>
        </p>
      </div>

      <div className="w-full text-center py-2">
        <p className="text-[8px] uppercase tracking-[0.3em] text-stone-750">
          VOICE INTERIOR • {lang === 'pt' ? 'ESTABILIDADE MENTAL' : 'MENTAL STABILITY'}
        </p>
      </div>
    </div>
  );
};
