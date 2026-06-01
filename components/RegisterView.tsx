import React, { useState } from 'react';
import { Language, User } from '../types';
import Logo from './Logo';
import { auth, db, OperationType, handleFirestoreError } from '../lib/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
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
