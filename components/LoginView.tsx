import React, { useState } from 'react';
import { Language } from '../types';
import Logo from './Logo';
import { auth, db, OperationType, handleFirestoreError } from '../lib/firebase';
import { signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, sendPasswordResetEmail } from 'firebase/auth';
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
  const [successText, setSuccessText] = useState('');
  const [showTroubleshoot, setShowTroubleshoot] = useState(false);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorText('');
    setSuccessText('');
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
      let errorMsg = lang === 'pt' ? 'Falha na autenticação do Google.' : 'Google Authentication failed.';
      if (err?.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        errorMsg = lang === 'pt'
          ? `Erro de Domínio Autorizado: Este domínio (${domain}) não está cadastrado como 'Domínio Autorizado' no console do Firebase. Adicione ele em seu Console Firebase > Authentication > Configurações > Domínios Autorizados.`
          : `Unauthorized Domain Error: This domain (${domain}) is not authorized for Google Sign-In. Add it to your Firebase Console under Authentication > Settings > Authorized Domains.`;
      } else if (err?.code === 'auth/operation-not-allowed') {
        errorMsg = lang === 'pt'
          ? 'O login por Google não está habilitado no Console do Firebase. Ative o provedor Google em Authentication > Sign-in method.'
          : 'Google sign-in is not enabled in your Firebase project. Please enable Google under Authentication > Sign-in method in your Firebase Console.';
      } else if (err?.code === 'auth/popup-blocked') {
        errorMsg = lang === 'pt' 
          ? 'Os popups foram bloqueados pelo seu navegador. Por favor, permita popups para este site ou abra o link em uma nova janela.' 
          : 'Popups were blocked by your browser. Please allow popups for this site or open in a new tab.';
      } else if (err?.code === 'auth/popup-closed-by-user') {
        errorMsg = lang === 'pt' ? 'O popup de login foi fechado antes de concluir Auth.' : 'The sign in popup was closed before completion.';
      } else if (err?.message) {
        errorMsg += ` (${err.code || err.message})`;
      }
      setErrorText(errorMsg);
      setShowTroubleshoot(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorText('');
    setSuccessText('');
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
      } else if (err?.code === 'auth/operation-not-allowed') {
        errorMsg = lang === 'pt' 
          ? 'O provedor de e-mail/senha não está ativado no Firebase Console para o seu projeto. Por favor, ative-o em Authentication > Sign-in method.' 
          : 'Email/password provider is not enabled in Firebase Console. Please enable it under Authentication > Sign-in method.';
      } else if (err?.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        errorMsg = lang === 'pt'
          ? `Este domínio (${domain}) não está autorizado no console do seu Firebase para efetuar logins. Cadastre ele em Authentication > Configurações > Domínios Autorizados.`
          : `Unauthorized Domain (${domain}): Please authorize this domain in configuration under Authentication > Settings > Authorized Domains in your Firebase Console.`;
      } else if (err?.message) {
        errorMsg += ` (${err.code || err.message})`;
      }
      setErrorText(errorMsg);
      setShowTroubleshoot(true);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorText(lang === 'pt' 
        ? 'Por favor, digite seu e-mail no campo correspondente primeiro.' 
        : 'Please enter your email addresses inside the input field first.');
      setSuccessText('');
      return;
    }
    setLoading(true);
    setErrorText('');
    setSuccessText('');
    try {
      await sendPasswordResetEmail(auth, email.toLowerCase().trim());
      setSuccessText(lang === 'pt'
        ? 'Pronto! E-mail de redefinição de senha enviado. Verifique sua caixa de entrada.'
        : 'Done! Password reset instructions sent to your email. Please check your inbox.');
    } catch (err: any) {
      console.error(err);
      let errorMsg = lang === 'pt' ? 'Falha ao redefinir senha.' : 'Failed to trigger password reset.';
      if (err?.code === 'auth/user-not-found') {
        errorMsg = lang === 'pt' ? 'Usuário não cadastrado com este e-mail.' : 'User not found with this email.';
      } else if (err?.code === 'auth/invalid-email') {
        errorMsg = lang === 'pt' ? 'E-mail inválido.' : 'Invalid email.';
      } else {
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

        {window.self !== window.top && (
          <div className="bg-teal-950/20 border border-teal-900/30 text-teal-300 rounded-xl p-3.5 text-[9px] uppercase tracking-wider text-center font-medium leading-relaxed">
            {lang === 'pt' 
              ? '💡 No celular? Abra o app em tela inteira (usando a URL de compartilhamento do AI Studio) para garantir que logins por Google ou e-mail funcionem sem bloqueios de segurança do frame.' 
              : '💡 On mobile? Try launching in full screen (using the AI Studio shared URL directly) to prevent browser-specific popup blockades or cross-origin restrictions.'}
          </div>
        )}

        {errorText && (
          <div id="login-error-alert" className="bg-rose-950/40 border border-rose-900/40 text-rose-300 rounded-xl p-3 text-[10px] uppercase tracking-wider text-center font-bold">
            {errorText}
          </div>
        )}

        {successText && (
          <div id="login-success-alert" className="bg-teal-950/40 border border-teal-900/40 text-teal-300 rounded-xl p-3 text-[10px] uppercase tracking-wider text-center font-bold">
            {successText}
          </div>
        )}

        <form id="login-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[9px] text-stone-500 uppercase tracking-widest block px-1">
              {lang === 'pt' ? 'Seu E-mail' : 'Your Email'}
            </label>
            <input 
              id="login-email-input"
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
            <div className="flex justify-between items-center px-1">
              <label className="text-[9px] text-stone-500 uppercase tracking-widest block">
                {lang === 'pt' ? 'Sua Senha' : 'Your Password'}
              </label>
              <button
                id="forgot-password-trigger"
                type="button"
                onClick={handleForgotPassword}
                disabled={loading}
                className="text-[9px] uppercase tracking-widest text-teal-400 hover:text-teal-300 transition-colors disabled:opacity-40"
              >
                {lang === 'pt' ? 'Esqueceu a senha?' : 'Forgot Password?'}
              </button>
            </div>
            <input 
              id="login-password-input"
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
            id="login-submit-btn"
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-teal-500 hover:bg-teal-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-bold uppercase tracking-[0.2em] text-[10px] transition-all rounded-xl mt-3 active:scale-[0.98] cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            {loading && (
              <svg className="animate-spin h-3.5 w-3.5 text-stone-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            <span>{loading ? (lang === 'pt' ? 'Conectando...' : 'Connecting...') : (lang === 'pt' ? 'Acessar' : 'Access')}</span>
          </button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-1 h-[1px] bg-stone-800"></div>
          <span className="text-[8px] font-mono mx-3 uppercase text-stone-600 tracking-widest">{lang === 'pt' ? 'Ou' : 'Or'}</span>
          <div className="flex-1 h-[1px] bg-stone-800"></div>
        </div>

        <button
          id="login-google-btn"
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3.5 bg-white hover:bg-stone-100 disabled:bg-stone-900 disabled:text-stone-600 disabled:border-stone-850 text-stone-950 font-bold uppercase tracking-[0.15em] text-[10px] transition-all rounded-xl shadow-md flex items-center justify-center space-x-2.5 active:scale-[0.98] cursor-pointer"
        >
          {loading ? (
            <svg className="animate-spin h-3.5 w-3.5 text-teal-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.68 14.9 1 12 1 7.24 1 3.2 3.73 1.24 7.72l3.75 2.91C5.92 7.15 8.71 5.04 12 5.04z" />
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.44c-.28 1.44-1.09 2.66-2.31 3.49l3.58 2.78c2.1-1.94 3.78-4.79 3.78-8.37z" />
              <path fill="#FBBC05" d="M4.99 10.63c-.24-.72-.37-1.49-.37-2.29s.13-1.57.37-2.29L1.24 3.14C.45 4.73 0 6.52 0 8.35s.45 3.61 1.24 5.21l3.75-2.93z" />
              <path fill="#34A853" d="M12 23c3.24 0 5.96-1.08 7.95-2.93l-3.58-2.78c-1 .67-2.28 1.07-4.37 1.07-3.29 0-6.08-2.11-7.07-5.59l-3.75 2.91C3.2 20.27 7.24 23 12 23z" />
            </svg>
          )}
          <span>{lang === 'pt' ? 'Entrar com Google' : 'Sign in with Google'}</span>
        </button>

        {/* Troubleshooting Guide Panel */}
        <div className="border border-stone-800/60 bg-stone-900/20 rounded-xl p-3.5 overflow-hidden transition-all duration-300">
          <button
            type="button"
            onClick={() => setShowTroubleshoot(prev => !prev)}
            className="w-full flex items-center justify-between text-left text-xs text-stone-400 hover:text-stone-200 uppercase font-mono tracking-wider"
          >
            <span>🛠️ {lang === 'pt' ? 'Como Resolver Erros de Login?' : 'How to Fix Login Errors?'}</span>
            <span className="text-[10px] font-sans font-bold">{showTroubleshoot ? '▲' : '▼'}</span>
          </button>
          
          {showTroubleshoot && (
            <div className="mt-3.5 space-y-4 text-[11px] leading-relaxed select-text border-t border-stone-900 pt-3 animate-fade-in text-stone-400">
              <div className="space-y-1.5">
                <p className="font-bold text-teal-400 text-[10px] uppercase tracking-wide">
                  1. {lang === 'pt' ? 'Ativar Provedores de Login' : '1. Enable Sign-in Providers'}
                </p>
                <p>
                  {lang === 'pt' 
                    ? 'No console do Firebase, acesse Auth > Sign-in method e certifique-se de que "E-mail/Senha" e "Google" estão ativos.' 
                    : 'In your Firebase Console, navigate to Auth > Sign-in method and make sure both "Email/Password" and "Google" are enabled.'}
                </p>
              </div>

              <div className="space-y-1.5">
                <p className="font-bold text-teal-400 text-[10px] uppercase tracking-wide">
                  2. {lang === 'pt' ? 'Domínio Autorizado' : '2. Authorized Domain'}
                </p>
                <p>
                  {lang === 'pt'
                    ? `Como você está acessando num ambiente de testes, o domínio abaixo precisa estar autorizado para efetuar login nas configurações do Firebase Authentication > Configurações > Domínios Autorizados:`
                    : `Since you are in a preview/development sandbox, the following domain must be explicitly added to your Firebase Authentication > Settings > Authorized Domains:`}
                </p>
                <div className="bg-stone-900 p-2 rounded-lg font-mono text-[10px] text-teal-300 break-all select-all border border-stone-800 flex items-center justify-between">
                  {window.location.hostname}
                </div>
              </div>

              <div className="space-y-1.5">
                <p className="font-bold text-teal-400 text-[10px] uppercase tracking-wide">
                  3. {lang === 'pt' ? 'Popups Bloqueados (Iframe)' : '3. Blocked Popups (Iframe)'}
                </p>
                <p>
                  {lang === 'pt'
                    ? 'O visualizador do AI Studio renderiza o app dentro de um iframe, bloqueando cookies de terceiros e popups de redes de login de segurança do Google. Abra o aplicativo em uma aba externa cheia para as conexões funcionarem plenamente.'
                    : 'The tool workspace viewport uses standard frames. Browser secure frameworks block cross-origin authentication scripts inside embeds. Copy the share URL and load it in a separate browser window.'}
                </p>
              </div>
            </div>
          )}
        </div>

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
