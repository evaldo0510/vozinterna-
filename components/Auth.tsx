
import React, { useState } from 'react';
import { supabase } from '../lib/supabase.ts';
import { LogIn, UserPlus, Mail, Lock, Loader2 } from 'lucide-react';
import Logo from './Logo.tsx';

interface AuthProps {
  onSession: (session: any) => void;
}

export const Auth: React.FC<AuthProps> = ({ onSession }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSession(data.session);
      } else {
        const { data, error } = await supabase.auth.signUp({ 
          email, 
          password,
          options: { data: { points: 0, badges: [], manifestoStep: 1 } }
        });
        if (error) throw error;
        alert('Verifique seu e-mail para confirmar o cadastro!');
        setIsLogin(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080b14] flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl animate-in zoom-in duration-500">
        <div className="flex flex-col items-center mb-8">
          <Logo size={80} className="mb-4" />
          <h2 className="text-2xl font-serif italic text-white">YARA Voz Interior</h2>
          <p className="text-white/30 text-[10px] uppercase tracking-[0.4em] mt-2">Sua jornada começa aqui</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="email" 
              placeholder="E-mail" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 transition-all"
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
            <input 
              type="password" 
              placeholder="Senha" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-indigo-500 transition-all"
              required
            />
          </div>

          {error && <p className="text-rose-400 text-[10px] text-center uppercase font-bold tracking-widest">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-white text-black font-black uppercase tracking-widest rounded-2xl active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />)}
            {isLogin ? 'Entrar' : 'Cadastrar'}
          </button>
        </form>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-6 text-[10px] text-white/20 hover:text-white/40 uppercase tracking-widest transition-all font-bold"
        >
          {isLogin ? 'Não tem conta? Crie uma agora' : 'Já tem conta? Faça login'}
        </button>
      </div>
    </div>
  );
};
