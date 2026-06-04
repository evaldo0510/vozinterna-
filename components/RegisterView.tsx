import React, { useState } from 'react';
import { Language, User } from '../types';
import Logo from './Logo';
import { auth, db, OperationType, handleFirestoreError } from '../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ADMIN_EMAILS } from '../constants';

interface RegisterViewProps {
  lang: Language;
  onSetLang: (lang: Language) => void;
  onNavigate: (screen: 'splash' | 'login') => void;
  onSuccess: () => void;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ lang, onSetLang, onNavigate, onSuccess }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState('');

  const handleGoogleRegister = async () => {
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
        const userProfile: User = {
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
          profileCompleted: false,
          communicationPreference: 'hybrid',
          neuroMode: 'natural'
        };
        await setDoc(userDocRef, userProfile);
      }
      onSuccess();
    } catch (err: any) {
      console.error(err);
      let errorMsg = lang === 'pt' ? 'Falha no cadastro com Google.' : 'Google Registration failed.';
      if (err?.code === 'auth/popup-blocked') {
        errorMsg = lang === 'pt' 
          ? 'Os popups foram bloqueados pelo seu navegador. Por favor, permita popups para este site ou abra o link em uma nova janela.' 
          : 'Popups were blocked by your browser. Please allow popups for this site or open in a new tab.';
      } else if (err?.code === 'auth/popup-closed-by-user') {
        errorMsg = lang === 'pt' ? 'O popup foi fechado antes de concluir Auth.' : 'The popup was closed before completion.';
      } else if (err?.message) {
        errorMsg += ` (${err.code || err.message})`;
      }
      setErrorText(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    if (password.length < 6) {
      setErrorText(lang === 'pt' ? 'A senha precisa ter pelo menos 6 caracteres.' : 'Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorText('');
    const normalizedEmail = email.toLowerCase().trim();
    const isAdmin = ADMIN_EMAILS.includes(normalizedEmail);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, normalizedEmail, password);
      const authUser = userCredential.user;

      await updateProfile(authUser, { displayName: name });

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
        accessibilityMode: false,
        points: 0,
        level: 1,
        manifestoStep: 1,
        manifestoCompleted: false,
        profileCompleted: false,
        communicationPreference: 'hybrid',
        neuroMode: 'natural'
      };

      await setDoc(userDocRef, userObj);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      let errorMsg = lang === 'pt' ? 'Erro ao realizar cadastro.' : 'Failed to register account.';
      if (err?.code === 'auth/email-already-in-use') {
        errorMsg = lang === 'pt' ? 'Este e-mail já está em uso.' : 'This email is already in use.';
      } else if (err?.code === 'auth/invalid-email') {
        errorMsg = lang === 'pt' ? 'Formato de e-mail inválido.' : 'Invalid email format.';
      } else if (err?.code === 'auth/weak-password') {
        errorMsg = lang === 'pt' ? 'Senha muito fraca!' : 'Password is too weak!';
      } else if (err?.code === 'auth/operation-not-allowed') {
        errorMsg = lang === 'pt' 
          ? 'O provedor de e-mail/senha não está ativado no Firebase Console do seu projeto. Ative-o em Authentication > Sign-in method ou use o Google no login.' 
          : 'Email/password authentication is not enabled in Firebase. Please enable it under Authentication > Sign-in method or sign in with Google.';
      } else if (err?.message) {
        errorMsg += ` (${err.code || err.message})`;
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
      <div className="flex-1 w-full max-w-sm mx-auto flex flex-col justify-center space-y-6 z-10 py-6">
        <div className="flex flex-col items-center text-center">
          <Logo className="w-14 h-14 text-teal-400 mb-3 animate-pulse" />
          <h2 className="text-2xl font-serif text-stone-200 tracking-widest uppercase">
            {lang === 'pt' ? 'Criar Nova Conta' : 'Register'}
          </h2>
          <p className="text-[9px] text-stone-500 uppercase tracking-widest mt-1">
            {lang === 'pt' ? 'Abra as portas do autoconhecimento' : 'Open the gates of self-knowledge'}
          </p>
        </div>

        {window.self !== window.top && (
          <div className="bg-teal-950/20 border border-teal-900/30 text-teal-300 rounded-xl p-3.5 text-[9px] uppercase tracking-wider text-center font-medium leading-relaxed">
            {lang === 'pt' 
              ? '💡 No celular? Abra o app em tela inteira (usando a URL de compartilhamento do AI Studio) para evitar que o navegador bloqueie popups ou cookies de cadastro.' 
              : '💡 On mobile? Try launching in full screen (using the AI Studio shared URL directly) to prevent browser-specific popup blockades or cross-origin restrictions.'}
          </div>
        )}

        {errorText && (
          <div className="bg-rose-950/40 border border-rose-900/40 text-rose-300 rounded-xl p-3 text-[10px] uppercase tracking-wider text-center font-bold">
            {errorText}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] text-stone-500 uppercase tracking-widest block px-1">
              {lang === 'pt' ? 'Seu Nome Completo' : 'Your Complete Name'}
            </label>
            <input 
              type="text" 
              value={name}
              required
              disabled={loading}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 focus:border-teal-500 text-xs rounded-xl p-3 text-stone-300 focus:outline-none transition-all placeholder-stone-800"
              placeholder="Ex: Evaldo de Souza"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-stone-500 uppercase tracking-widest block px-1">
              {lang === 'pt' ? 'Seu Melhor E-mail' : 'Your Best Email'}
            </label>
            <input 
              type="email" 
              value={email}
              required
              disabled={loading}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-stone-900 border border-stone-800 focus:border-teal-500 text-xs rounded-xl p-3 text-stone-300 focus:outline-none transition-all placeholder-stone-800"
              placeholder="nome@email.com"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[9px] text-stone-500 uppercase tracking-widest block px-1">
              {lang === 'pt' ? 'Sua Senha Segura' : 'Your Secure Password'}
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
            {loading ? (lang === 'pt' ? 'Processando...' : 'Registering...') : (lang === 'pt' ? 'Confirmar Cadastro' : 'Confirm Registration')}
          </button>
        </form>

        <div className="flex items-center my-2">
          <div className="flex-1 h-[1px] bg-stone-800"></div>
          <span className="text-[8px] font-mono mx-3 uppercase text-stone-600 tracking-widest">{lang === 'pt' ? 'Ou' : 'Or'}</span>
          <div className="flex-1 h-[1px] bg-stone-800"></div>
        </div>

        <button
          type="button"
          onClick={handleGoogleRegister}
          disabled={loading}
          className="w-full py-3.5 bg-white hover:bg-stone-100 disabled:bg-stone-800 text-stone-950 font-bold uppercase tracking-[0.15em] text-[10px] transition-all rounded-xl shadow-md flex items-center justify-center space-x-2.5 active:scale-[0.98] cursor-pointer"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.68 14.9 1 12 1 7.24 1 3.2 3.73 1.24 7.72l3.75 2.91C5.92 7.15 8.71 5.04 12 5.04z" />
            <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.44-1.09 2.66-2.31 3.49l3.58 2.78c2.1-1.94 3.78-4.79 3.78-8.37z" />
            <path fill="#FBBC05" d="M4.99 10.63c-.24-.72-.37-1.49-.37-2.29s.13-1.57.37-2.29L1.24 3.14C.45 4.73 0 6.52 0 8.35s.45 3.61 1.24 5.21l3.75-2.93z" />
            <path fill="#34A853" d="M12 23c3.24 0 5.96-1.08 7.95-2.93l-3.58-2.78c-1 .67-2.28 1.07-4.37 1.07-3.29 0-6.08-2.11-7.07-5.59l-3.75 2.91C3.2 20.27 7.24 23 12 23z" />
          </svg>
          <span>{lang === 'pt' ? 'Cadastrar com Google' : 'Sign up with Google'}</span>
        </button>

        <p className="text-center text-[10px] text-stone-500">
          {lang === 'pt' ? 'Já possui uma conta?' : 'Already have an account?'}{' '}
          <button onClick={() => onNavigate('login')} className="text-teal-400 hover:underline font-bold">
            {lang === 'pt' ? 'Acesse aqui' : 'Access here'}
          </button>
        </p>
      </div>

      <div className="w-full text-center py-2">
        <p className="text-[8px] uppercase tracking-[0.3em] text-stone-750">
          VOICE INTERIOR • {lang === 'pt' ? 'RESPIRAR EM COMUNIDADE' : 'COMMUNITY BREATHING'}
        </p>
      </div>
    </div>
  );
};
