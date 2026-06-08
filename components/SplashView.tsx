import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Logo from './Logo';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { 
  Brain, 
  Sparkles, 
  Volume2, 
  BookOpen, 
  Heart, 
  Shield, 
  CheckCircle2, 
  EyeOff, 
  Activity, 
  ChevronDown, 
  ArrowRight, 
  Star, 
  Trees, 
  Compass, 
  Flame, 
  Info,
  Clock,
  User,
  Zap
} from 'lucide-react';

interface SplashViewProps {
  lang: Language;
  onSetLang: (lang: Language) => void;
  onNavigate: (screen: 'login' | 'register') => void;
}

// State-of-the-art interactive COPY for sales-funnel
const LANDING_TEXTS = {
  pt: {
    badge: "🌱 NOVA ERA DA ACESSIBILIDADE COGNITIVA",
    heroTitle: "O primeiro guia mental que se adapta ao seu estilo de mente",
    heroSub: "Voz Interior une Programação Cognitiva Hipnótica (PCH), frequências de som binaurais e interfaces adaptativas exclusivas para mentes ADHD/TDAH, Autismo, Ansiedade, Dislexia e Seniores.",
    ctaPrimary: "Experimentar Gratuitamente",
    ctaSecondary: "Entrar na Sessão",
    scrollText: "Descubra como funciona",
    
    methodBadge: "🔬 A CIÊNCIA DA VOZ INTERIOR",
    methodTitle: "Vocalização Terapêutica & Neuro-Adaptação",
    methodText: "Diferente de aplicativos tradicionais de meditação que oferecem áudios genéricos, a Voz Interior reconfigura todo o seu design, linguagem e algoritmos com base no seu perfil cognitivo, guiado pela acolhedora voz holográfica gerada por IA do Dr. Evaldo.",
    
    pillarsTitle: "Os 4 Pilares do Santuário",
    pillarsSub: "Quatro frentes de reconexão biológica e mental unificadas em uma única jornada.",
    
    pillar1Header: "🌱 Jardim Interior",
    pillar1Desc: "Um jardim biológico simulado que floresce e ganha sementes a cada minuto de diálogo consciente. Suas palavras nutrem a vida.",
    
    pillar2Header: "🎙️ Diálogos Adaptativos",
    pillar2Desc: "Sessões interativas de biofeedback de voz com o Dr. Evaldo. A inteligência sintoniza com sua frequência emocional instantaneamente.",
    
    pillar3Header: "📖 O Diário & Refúgio",
    pillar3Desc: "Um espaço seguro para despejar sentimentos por escrito. Trânsito sutil de pensamentos ancorado por paisagens sonoras poéticas.",
    
    pillar4Header: "🎈 Sopro da Calma",
    pillar4Desc: "Exercícios guiados de respiração interativa com bio-animações que regulam os picos de adrenalina e a ansiedade física de forma síncrona.",
    
    simBadge: "🖥️ INTERATIVIDADE SENSORIAL",
    simTitle: "Experimente a Neuro-Adaptação ao Vivo",
    simSub: "Selecione um perfil de mente abaixo para testar instantaneamente como nossa interface se reconstrói em tempo real para acomodar diferentes necessidades:",
    
    simNormal: "🧘 Padrão (Natural)",
    simAdhd: "⚡ TDAH",
    simAutism: "👁️ Autismo",
    simDyslexia: "📖 Dislexia",
    simAnxiety: "⛰️ Ansiedade",
    simSenior: "👵 Sênior",
    
    simAtiva: "Filtro Adaptativo Ativo",
    
    plansTitle: "Portas Abertas Para a Calma",
    plansSub: "Escolha o nível de imersão que melhor ressoa com sua jornada diária.",
    plan1Name: "Visitante",
    plan1Price: "Grátis",
    plan1Limit: "Sessões de até 5 minutos",
    plan1Feature1: "Acesso ao Diário básico",
    plan1Feature2: "Simulação do Jardim",
    plan1Feature3: "Voz padrão do Guia",
    
    plan2Name: "Membro Guardião",
    plan2Price: "R$ 29,90/mês",
    plan2Limit: "Sessões Infinitas Sem Limites",
    plan2Feature1: "Jardim Biológico Completo",
    plan2Feature2: "5 vozes holográficas exclusivas",
    plan2Feature3: "Mapeador de Ressonância (Histórico)",
    plan2Feature4: "Modos de Neuro-Adaptação Premium",
    
    faqTitle: "Dúvidas Frequentes",
    faq1Q: "Como funciona a adaptação para TDAH, Autismo e Dislexia?",
    faq1A: "Nossa tecnologia altera instantaneamente o tamanho das fontes, as taxas de contraste, a velocidade de fala e até remove animações aceleradas, reduzindo a sobrecarga sensorial para pessoas autistas ou facilitando o acompanhamento para leitores disléxicos.",
    faq2Q: "Quem é o Dr. Evaldo?",
    faq2A: "Dr. Evaldo é o seu guia cognitivo holográfico. Ele foi modelado após anos de estudos em Programação Cognitiva Hipnótica para simular uma fala rítmica, poética e indutora de calma.",
    faq3Q: "Os meus sentimentos e falas são protegidos?",
    faq3A: "Sim, absolutamente. Seus diálogos e diários são persistidos com criptografia de ponta e nunca são compartilhados ou usados para treinar modelos abertos. Seus dados são o seu refúgio.",
    faq4Q: "Posso cancelar a assinatura quando desejar?",
    faq4A: "Sim. Nossos planos não possuem fidelidade contratual e podem ser suspensos ou alterados com apenas um clique diretamente no painel ajustável.",
    
    footerNote: "Voz Interior • Desenvolvido cientificamente para a tranquilidade cognitiva cognitiva"
  },
  en: {
    badge: "🌱 A NEW ERA OF COGNITIVE ACCESSIBILITY",
    heroTitle: "The first mental guide that adapts to your unique mind",
    heroSub: "Inner Voice unites Hypnotic Cognitive Programming (PCH), binaural audio feedback, and tailored interfaces adapted for ADHD, Autism, Sensory Overload, Dyslexia, and Seniors.",
    ctaPrimary: "Try For Free",
    ctaSecondary: "Sign In",
    scrollText: "Discover how it works",
    
    methodBadge: "🔬 THE SCIENCE OF INNER VOICE",
    methodTitle: "Vocal Feedback & Neuro-Adaptation",
    methodText: "Unlike conventional meditation applications presenting static playlists, Inner Voice reconstructs its layout, language, and pacing dynamically based on your sensory profile, guided by Dr. Evaldo's soothing voice generation.",
    
    pillarsTitle: "The Sanctuary's 4 Pillars",
    pillarsSub: "Four distinct biological and mental dimensions unified into a beautiful holistic workspace.",
    
    pillar1Header: "🌱 Core Inner Garden",
    pillar1Desc: "A natural life simulator that blossoms as you talk. Your speech sessions provide seeds and sunlight for the vegetative simulation.",
    
    pillar2Header: "🎙️ Adaptive Dialogues",
    pillar2Desc: "Interactive voice conversations fueled by Dr. Evaldo. The neural model aligns key patterns to match your emotional state seamlessly.",
    
    pillar3Header: "📖 Refúgio Diary",
    pillar3Desc: "A safe space to offload thoughts in written format. Elegant soundscapes and tranquil prompts support daily alignment.",
    
    pillar4Header: "🎈 Calming Breath",
    pillar4Desc: "Deep breathing mechanics powered by fluid canvas expansions, stabilizing adrenaline spikes and soothing heart rates in real-time.",
    
    simBadge: "🖥️ SENSORY EXPERIMENT",
    simTitle: "Test Adaptive Rendering Live",
    simSub: "Select a cognitive profile below to immediately preview how our architecture refactors itself to support different needs:",
    
    simNormal: "🧘 Default (Natural)",
    simAdhd: "⚡ ADHD",
    simAutism: "👁️ Autism",
    simDyslexia: "📖 Dyslexia",
    simAnxiety: "⛰️ Anxiety",
    simSenior: "👵 Senior",
    
    simAtiva: "Adaptive Layout Filter Active",
    
    plansTitle: "Open Invitation to Quietude",
    plansSub: "Join our digital sanctuary under a tier that aligns with your goals.",
    plan1Name: "Visitor",
    plan1Price: "Free",
    plan1Limit: "Up to 5 minutes per session",
    plan1Feature1: "Basic Journal accessibility",
    plan1Feature2: "Simulated Garden previews",
    plan1Feature3: "Standard vocal guide",
    
    plan2Name: "Guardian Member",
    plan2Price: "$ 29.90/mo",
    plan2Limit: "Infinite Immersive Sessions",
    plan2Feature1: "Full Biological Simulated Garden",
    plan2Feature2: "5 exclusive holographic vocal voices",
    plan2Feature3: "Resonance historical trackers",
    plan2Feature4: "Premium Neuro-Adaptive profiles",
    
    faqTitle: "Frequently Asked Questions",
    faq1Q: "How do ADHD, Autism, and Dyslexia profiles actually work?",
    faq1A: "The dashboard re-calculates elements, shifts line spacing, enhances readability ratios, or completely mutes animations to lower sensory input. Dyslexia mode loads the custom heavy-bottom typography with extra letter tracking.",
    faq2Q: "Who is Dr. Evaldo?",
    faq2A: "Dr. Evaldo is your AI vocal companion, trained on Hypnotic Cognitive Programming models to establish rhythmic, poetic patterns that guide you safely to calm states.",
    faq3Q: "Are my recordings and thoughts kept private?",
    faq3A: "Absolutely. All transactions are fully encrypted. Your audio streams and written text are strictly locked and are never indexed for third-party optimization modeling.",
    faq4Q: "Can I cancel my member subscription easily?",
    faq4A: "Absolutely. No hidden lock-ins. You can revert your status with a single key press in your workspace dashboard options.",
    
    footerNote: "Inner Voice • Scientifically crafted to advance cognitive tranquility"
  }
};

export const SplashView: React.FC<SplashViewProps> = ({ lang, onSetLang, onNavigate }) => {
  const l = LANDING_TEXTS[lang];
  const [activeSim, setActiveSim] = useState<'normal' | 'adhd' | 'autism' | 'dyslexia' | 'anxiety' | 'senior'>('normal');
  const [breathState, setBreathState] = useState<'Inalando' | 'Exalando' | 'Inhaling' | 'Exhaling'>('Inalando');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  // Breathing simulation loop
  useEffect(() => {
    const interval = setInterval(() => {
      setBreathState(prev => {
        if (prev === 'Inalando') return 'Exalando';
        if (prev === 'Inhaling') return 'Exhaling';
        if (prev === 'Exalando') return 'Inalando';
        return 'Inhaling';
      });
    }, 4000);
    return () => clearInterval(interval);
  }, [lang]);

  // Handle auto-label language adjustments
  useEffect(() => {
    if (lang === 'en') {
      setBreathState(active => active === 'Inalando' ? 'Inhaling' : 'Exhaling');
    } else {
      setBreathState(active => active === 'Inhaling' ? 'Inalando' : 'Exhaling');
    }
  }, [lang]);

  const toggleFaq = (index: number) => {
    setFaqOpen(prev => prev === index ? null : index);
  };

  return (
    <div className="min-h-screen w-full bg-[#05070d] text-stone-200 font-sans overflow-y-auto overflow-x-hidden relative scroll-smooth selection:bg-teal-500/30 selection:text-teal-200">
      
      {/* Absolute Ambient Background Lights */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-[40%] right-[-10%] w-[450px] h-[450px] bg-[#8b5cf6]/5 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[15%] left-[-10%] w-[400px] h-[400px] bg-emerald-500/4 rounded-full blur-[120px] pointer-events-none"></div>

      {/* 1. Header HUD */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-md bg-[#05070d]/70 border-b border-[#111827]/80 transition-all">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <Logo className="w-8 h-8 text-teal-400 drop-shadow-[0_0_15px_rgba(20,184,166,0.2)] animate-pulse" />
            <span className="text-sm font-serif font-bold uppercase tracking-[0.25em] text-stone-100">
              {lang === 'pt' ? 'Voz Interior' : 'Inner Voice'}
            </span>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-[10px] uppercase tracking-widest font-mono text-stone-400">
            <a href="#metodo" className="hover:text-teal-400 transition-colors">
              {lang === 'pt' ? 'O Método' : 'The Method'}
            </a>
            <a href="#pilares" className="hover:text-teal-400 transition-colors">
              {lang === 'pt' ? 'Pilares' : 'Pillars'}
            </a>
            <a href="#neuro-test" className="hover:text-teal-400 transition-colors text-amber-400/90 flex items-center gap-1">
              <Zap className="w-3 h-3 fill-amber-400/20" /> {lang === 'pt' ? 'Neuro-Adapt ao Vivo' : 'Live Demo'}
            </a>
            <a href="#planos" className="hover:text-teal-400 transition-colors">
              {lang === 'pt' ? 'Planos' : 'Pricing'}
            </a>
            <a href="#faq" className="hover:text-teal-400 transition-colors">
              FAQ
            </a>
          </nav>

          <div className="flex items-center space-x-4">
            {/* Lang switcher container */}
            <div className="flex bg-[#0f1422]/90 border border-[#1e2945]/40 p-1 rounded-full text-[9px] font-mono uppercase font-black tracking-widest">
              <button 
                onClick={() => onSetLang('pt')} 
                className={`py-1 px-3 rounded-full transition-colors ${lang === 'pt' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/10' : 'text-stone-500 hover:text-stone-300'}`}
              >
                PT
              </button>
              <button 
                onClick={() => onSetLang('en')} 
                className={`py-1 px-3 rounded-full transition-colors ${lang === 'en' ? 'bg-teal-500/20 text-teal-400 border border-teal-500/10' : 'text-stone-500 hover:text-stone-300'}`}
              >
                EN
              </button>
            </div>

            <button 
              onClick={() => onNavigate('login')}
              className="py-2 px-4.5 bg-teal-500 hover:bg-teal-400 hover:scale-[1.03] text-[#05070d] text-[10px] font-mono font-black uppercase tracking-widest rounded-full transition-all cursor-pointer shadow-lg shadow-teal-500/10"
            >
              {l.ctaSecondary}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Presentation Banner */}
      <section className="relative min-h-[85vh] flex flex-col justify-center items-center py-20 px-6 max-w-6xl mx-auto text-center">
        <div className="absolute top-12 left-1/2 -translate-x-1/2 flex justify-center w-full max-w-sm pointer-events-none">
          <div className="bubble-ambiance border border-teal-500/10 backdrop-blur-md rounded-full px-4 py-1.5 flex items-center space-x-2 animate-bounce">
            <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[8px] font-mono uppercase tracking-[0.25em] text-teal-300">
              {l.badge}
            </span>
          </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 15 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="space-y-6 max-w-4xl mt-10"
        >
          <h1 className="text-4xl md:text-6xl font-serif text-stone-100 font-bold leading-tight tracking-tight pt-4">
            {l.heroTitle}
          </h1>
          
          <p className="max-w-2xl mx-auto text-stone-400 text-sm md:text-base leading-relaxed font-light">
            {l.heroSub}
          </p>
        </motion.div>

        {/* Dynamic decorative visual centerizer (Hologram of a pulsating droplet) */}
        <div className="my-10 relative flex items-center justify-center">
          <div className="absolute w-44 h-44 bg-teal-500/10 rounded-full blur-[30px] animate-pulse"></div>
          <Logo className="w-24 h-24 text-teal-400 drop-shadow-[0_0_40px_rgba(20,184,166,0.35)]" />
        </div>

        {/* Landing CTAs */}
        <div className="w-full max-w-md flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => onNavigate('register')}
            className="w-full sm:w-auto py-4 px-10 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 hover:scale-[1.04] text-[#05070d] font-mono font-black uppercase tracking-[0.2em] text-[10px] transition-all rounded-full shadow-2xl hover:shadow-teal-500/20 cursor-pointer active:scale-[0.98]"
          >
            {l.ctaPrimary}
          </button>
          
          <button 
            onClick={() => onNavigate('login')}
            className="w-full sm:w-auto py-4 px-10 bg-transparent border border-stone-850 hover:bg-[#0f1422]/40 hover:border-stone-700 text-stone-300 font-mono font-bold uppercase tracking-[0.2em] text-[10px] transition-all rounded-full cursor-pointer active:scale-[0.98]"
          >
            {lang === 'pt' ? 'Membros Entrar' : 'Sign In Back'}
          </button>
        </div>

        {/* Scroll helper */}
        <a 
          href="#metodo" 
          className="absolute bottom-6 flex flex-col items-center space-y-1.5 text-[8px] font-mono text-stone-500 uppercase tracking-[0.3em] hover:text-teal-400 transition-colors"
        >
          <span>{l.scrollText}</span>
          <ChevronDown className="w-3.5 h-3.5 animate-bounce stroke-[1.5]" />
        </a>
      </section>

      {/* 3. The PCH Method section */}
      <section id="metodo" className="py-24 px-6 border-y border-[#1e2945]/15 bg-[#080c18]/40 relative">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6 text-left">
            <div className="inline-flex border border-teal-500/20 bg-teal-500/5 rounded-full px-3 py-1 items-center space-x-1.5">
              <Brain className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
              <span className="text-[8px] font-mono uppercase tracking-[0.25em] text-teal-400">
                {l.methodBadge}
              </span>
            </div>

            <h2 className="text-3xl font-serif text-stone-100 tracking-wide font-medium">
              {l.methodTitle}
            </h2>

            <p className="text-stone-400 text-xs md:text-sm leading-relaxed font-light">
              {l.methodText}
            </p>

            {/* Scientific Bullet checkmarks */}
            <div className="space-y-3.5 pt-2 text-xs text-stone-300">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>{lang === 'pt' ? 'Calibração de Respiração Coerente' : 'Coherent Breath Calibration'}:</strong> {lang === 'pt' ? 'Modula o sistema nervoso parassimpático diminuindo o cortisol cardíaco em até 30% em 5 minutos.' : 'Stimulates the parasympathetic nervous system reducing stress spikes in less than 5 minutes.'}
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>{lang === 'pt' ? 'Frequências Solfeggio Binaurais' : 'Solfeggio Binaural Resonance'}:</strong> {lang === 'pt' ? 'Injetadas nas respostas de áudio para desacelerar ondas cerebrais Beta para frequências Theta calmas.' : 'Infused behind vocoded audio guides to slide brainwaves safely from hyper-alert Beta to calming Theta.'}
                </span>
              </div>
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  <strong>{lang === 'pt' ? 'Voz Poética Baseada em Ancoragem' : 'Cognitive Anchored Dialogue'}:</strong> {lang === 'pt' ? 'Gatilhos linguísticos que treinam a mente a desviar do looping do pânico ou da distração obsessiva.' : 'Linguistic markers customized to re-anchor busy attention or pull users safely out of panic loopings.'}
                </span>
              </div>
            </div>
          </div>

          <div className="relative">
            {/* Visual representation of voice frequencies */}
            <div className="neu-card border border-stone-850/50 p-6 rounded-[2.5rem] relative overflow-hidden bg-[#060912]/80 backdrop-blur-md flex flex-col justify-between h-80 shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_var(--tw-gradient-stops))] from-teal-500/5 via-transparent to-transparent pointer-events-none" />
              
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></div>
                  <span className="text-[8px] font-mono uppercase tracking-[0.25em] text-emerald-400">Dr. Evaldo AI</span>
                </div>
                <Volume2 className="w-4 h-4 text-teal-400 animate-pulse" />
              </div>

              {/* Rhythmic frequencies visual lines */}
              <div className="flex items-end justify-center space-x-1.5 h-24 mb-4">
                {[12, 24, 45, 18, 56, 74, 32, 15, 88, 62, 28, 48, 92, 42, 19, 53, 30, 22, 11].map((val, idx) => (
                  <div 
                    key={idx} 
                    className="w-1 bg-gradient-to-t from-teal-500/20 to-teal-400 rounded-full" 
                    style={{ 
                      height: `${val}%`,
                      animation: `pulse 2s infinite ease-in-out`,
                      animationDelay: `${idx * 0.1}s`
                    }}
                  />
                ))}
              </div>

              <div className="p-3.5 bg-stone-950/80 rounded-2xl border border-stone-900/60 text-left">
                <p className="text-[9px] font-mono text-teal-400 leading-none uppercase tracking-widest font-bold">Frequência Harmônica Calibrando</p>
                <p className="text-[11px] text-stone-300 font-serif italic mt-1 leading-relaxed">
                  "{lang === 'pt' ? 'O ritmo que habita o meu peito agora abraça o seu silêncio.' : 'The rhythm that lives in my chest now embraces your surrounding silence.'}"
                </p>
              </div>
            </div>

            {/* Glowing orb decorative background */}
            <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#8b5cf6]/10 rounded-full blur-2xl pointer-events-none"></div>
          </div>

        </div>
      </section>

      {/* 4. Pillars Showcase Bento Grid */}
      <section id="pilares" className="py-24 px-6 max-w-6xl mx-auto space-y-12">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-serif text-stone-100 tracking-wide font-medium">
            {l.pillarsTitle}
          </h2>
          <p className="text-stone-500 text-xs tracking-widest uppercase font-mono">
            {l.pillarsSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6">
          
          {/* Pillar 1: Jardim */}
          <div className="md:col-span-7 bg-[#070b14]/90 border border-[#1e2a4a]/40 rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[300px] relative overflow-hidden group hover:border-teal-500/20 transition-all duration-500 shadow-xl">
            <div className="absolute top-0 right-0 w-[240px] h-[240px] bg-emerald-500/3 rounded-full blur-[80px]" />
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-full bg-emerald-400/10 flex items-center justify-center text-emerald-400">
                <Trees className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-serif text-stone-200">{l.pillar1Header}</h3>
              <p className="text-stone-400 text-xs md:text-sm font-light leading-relaxed max-w-md">
                {l.pillar1Desc}
              </p>
            </div>
            
            {/* Visual Vector Garden Preview */}
            <div className="mt-8 flex justify-center space-x-6 items-end p-4 bg-[#03050a] rounded-2xl border border-stone-900 leading-none h-24">
              <div className="flex flex-col items-center">
                <span className="text-2xl animate-pulse">🌱</span>
                <span className="text-[7.5px] font-mono text-stone-600 mt-1 uppercase tracking-widest">Semear</span>
              </div>
              <div className="text-xl animate-bounce">🌿</div>
              <div className="text-3xl">🌸</div>
              <div className="text-xl animate-pulse">🌾</div>
              <div className="flex flex-col items-center">
                <span className="text-3xl">🌳</span>
                <span className="text-[7.5px] font-mono text-emerald-400 mt-1 uppercase tracking-widest font-bold">Consolidado</span>
              </div>
            </div>
          </div>

          {/* Pillar 2: Sessão de Voz */}
          <div className="md:col-span-5 bg-[#070b14]/90 border border-[#1e2a4a]/40 rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[300px] relative overflow-hidden hover:border-[#8b5cf6]/20 transition-all duration-500 shadow-xl">
            <div className="absolute top-0 right-0 w-[180px] h-[180px] bg-[#8b5cf6]/3 rounded-full blur-[60px]" />
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-full bg-[#8b5cf6]/10 flex items-center justify-center text-[#8b5cf6]">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-serif text-stone-200">{l.pillar2Header}</h3>
              <p className="text-stone-400 text-xs md:text-sm font-light leading-relaxed">
                {l.pillar2Desc}
              </p>
            </div>

            <div className="mt-6 flex items-center justify-between p-3.5 bg-stone-950/80 rounded-2xl border border-stone-900/60 text-[10px] uppercase font-mono text-[#8b5cf6] tracking-widest">
              <span>Falar ao Microfone</span>
              <span className="flex h-1.5 w-1.5 rounded-full bg-[#8b5cf6]" />
            </div>
          </div>

          {/* Pillar 3: Diário */}
          <div className="md:col-span-5 bg-[#070b14]/90 border border-[#1e2a4a]/40 rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[300px] relative overflow-hidden hover:border-pink-500/20 transition-all duration-500 shadow-xl">
            <div className="absolute bottom-0 left-0 w-[180px] h-[180px] bg-pink-500/3 rounded-full blur-[60px]" />
            <div className="space-y-4">
              <div className="w-10 h-10 rounded-full bg-pink-400/10 flex items-center justify-center text-pink-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-serif text-stone-200">{l.pillar3Header}</h3>
              <p className="text-stone-400 text-xs md:text-sm font-light leading-relaxed font-light">
                {l.pillar3Desc}
              </p>
            </div>

            <div className="mt-6 text-stone-500 text-[11px] italic font-serif leading-none border-t border-stone-900 pt-3">
              "Escrever é permitir que o silêncio se faça visível..."
            </div>
          </div>

          {/* Pillar 4: Sopro */}
          <div className="md:col-span-7 bg-[#070b14]/90 border border-[#1e2a4a]/40 rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[300px] relative overflow-hidden hover:border-amber-500/20 transition-all duration-500 shadow-xl">
            <div className="absolute top-0 left-0 w-[300px] h-[300px] bg-amber-500/2.5 rounded-full blur-[100px]" />
            <div className="space-y-4 font-light">
              <div className="w-10 h-10 rounded-full bg-amber-400/10 flex items-center justify-center text-amber-400">
                <Heart className="w-5 h-5" />
              </div>
              <h3 className="text-xl font-serif text-stone-200">{l.pillar4Header}</h3>
              <p className="text-stone-400 text-xs md:text-sm leading-relaxed">
                {l.pillar4Desc}
              </p>
            </div>

            {/* Simulated balloon expander */}
            <div className="mt-8 flex items-center justify-center bg-stone-950 p-6 rounded-2xl border border-stone-900 relative">
              <div className="absolute top-3.5 left-4 text-[7.5px] font-mono text-stone-600 uppercase tracking-widest uppercase">Visualizador de Expansão Cardio</div>
              <motion.div 
                animate={{ scale: [1, 1.6, 1] }} 
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400/20 to-teal-400/20 border border-teal-500/20 text-center flex items-center justify-center text-[8px] font-serif"
              >
                🌬️
              </motion.div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. LIVE "Neuro-Adapt" Interactive Preview Sandbox (CROWN JEWEL) */}
      <section id="neuro-test" className="py-24 px-6 border-t border-[#111827]/80 bg-[#060912]/75 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-teal-500/3 rounded-full blur-[180px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto space-y-12 relative z-10">
          
          <div className="text-center space-y-3.5">
            <div className="inline-flex border border-amber-500/20 bg-amber-500/5 rounded-full px-3.5 py-1.5 items-center space-x-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-[8px] font-mono uppercase tracking-[0.25em] text-amber-300">
                {l.simBadge}
              </span>
            </div>

            <h2 className="text-3xl font-serif text-stone-100 tracking-wide font-medium">
              {l.simTitle}
            </h2>

            <p className="text-stone-400 max-w-2xl mx-auto text-xs md:text-sm font-light leading-relaxed">
              {l.simSub}
            </p>
          </div>

          {/* Switcher Controls Buttons */}
          <div className="flex flex-wrap justify-center gap-2 p-2 rounded-2xl bg-stone-950 border border-stone-900 max-w-md mx-auto">
            <button 
              onClick={() => setActiveSim('normal')}
              className={`py-2 px-3 rounded-xl text-[9px] uppercase font-mono font-bold tracking-wider transition-all duration-300 ${activeSim === 'normal' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/20' : 'text-stone-500 hover:text-stone-300'}`}
            >
              {l.simNormal}
            </button>
            <button 
              onClick={() => setActiveSim('adhd')}
              className={`py-2 px-3 rounded-xl text-[9px] uppercase font-mono font-bold tracking-wider transition-all duration-300 ${activeSim === 'adhd' ? 'bg-[#8b5cf6]/20 text-[#c084fc] border border-[#8b5cf6]/20' : 'text-stone-500 hover:text-[#c084fc]/80'}`}
            >
              {l.simAdhd}
            </button>
            <button 
              onClick={() => setActiveSim('autism')}
              className={`py-2 px-3 rounded-xl text-[9px] uppercase font-mono font-bold tracking-wider transition-all duration-300 ${activeSim === 'autism' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/20' : 'text-stone-500 hover:text-indigo-300/80'}`}
            >
              {l.simAutism}
            </button>
            <button 
              onClick={() => setActiveSim('dyslexia')}
              className={`py-2 px-3 rounded-xl text-[9px] uppercase font-mono font-bold tracking-wider transition-all duration-300 ${activeSim === 'dyslexia' ? 'bg-sky-500/20 text-sky-300 border border-sky-500/20' : 'text-stone-500 hover:text-sky-300/80'}`}
            >
              {l.simDyslexia}
            </button>
            <button 
              onClick={() => setActiveSim('anxiety')}
              className={`py-2 px-3 rounded-xl text-[9px] uppercase font-mono font-bold tracking-wider transition-all duration-300 ${activeSim === 'anxiety' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/20' : 'text-stone-500 hover:text-rose-300/80'}`}
            >
              {l.simAnxiety}
            </button>
            <button 
              onClick={() => setActiveSim('senior')}
              className={`py-2 px-3 rounded-xl text-[9px] uppercase font-mono font-bold tracking-wider transition-all duration-300 ${activeSim === 'senior' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/20' : 'text-stone-500 hover:text-amber-300/80'}`}
            >
              {l.simSenior}
            </button>
          </div>

          {/* Sandbox Presentation Area */}
          <div className="w-full max-w-2xl mx-auto border border-stone-850 bg-[#090d19] p-8 rounded-[2.5rem] shadow-2xl relative min-h-[300px] flex flex-col justify-between transition-all duration-500 overflow-hidden">
            
            {/* Top Indicator */}
            <div className="absolute top-4 right-6 flex items-center space-x-1.5 text-[8.5px] font-mono uppercase text-teal-400 font-bold bg-teal-500/5 px-2.5 py-1 rounded-full border border-teal-500/10">
              <span className="flex h-1.5 w-1.5 rounded-full bg-teal-400 animate-pulse" />
              <span>{l.simAtiva}: {activeSim.toUpperCase()}</span>
            </div>

            {/* Render Simulated Preview according to activeMode */}
            <div className="flex-1 flex flex-col justify-center py-6">
              
              {activeSim === 'normal' && (
                <div className="space-y-4 animate-fade-in text-left">
                  <p className="text-[10px] font-mono tracking-widest uppercase text-teal-400 font-bold leading-none">🌿 Santuário Natural</p>
                  <h4 className="font-serif text-lg text-stone-200">"Cada respiração é o silêncio se desdobrando."</h4>
                  <p className="text-stone-400 text-xs font-light leading-relaxed max-w-lg">
                    A interface padrão convida ao repouso através de layouts estelares profundos, gradientes celestes sutis, e ritmo calmo, perfeito para introspecção diária guiada.
                  </p>
                </div>
              )}

              {activeSim === 'adhd' && (
                <div className="space-y-5 animate-fade-in text-left">
                  <p className="text-[10px] font-mono tracking-widest uppercase text-[#8b5cf6] font-bold leading-none">⚡ Modo TDAH (Altamente Focado & Gamificado)</p>
                  <h4 className="font-serif text-md text-stone-200 uppercase tracking-wider font-semibold border-b border-stone-900 pb-2">MISSÃO FOCAL ATIVA:</h4>
                  
                  {/* Prioritized task layout cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 bg-stone-950/80 rounded-2xl border border-stone-900 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-[#8b5cf6]">🏁</span>
                        <span className="text-[10.5px] text-stone-300 font-mono">1. Ouvir Guia (3min)</span>
                      </div>
                      <span className="text-[8px] font-bold py-0.5 px-2 bg-[#8b5cf6]/10 text-[#c084fc] rounded-full border border-[#8b5cf6]/20">+25 XP</span>
                    </div>
                    <div className="p-3 bg-stone-950/80 rounded-2xl border border-[#8b5cf6]/20 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-emerald-400">🌱</span>
                        <span className="text-[10.5px] text-stone-300 font-mono">2. Colecionar Sementes</span>
                      </div>
                      <span className="text-[8px] font-bold py-0.5 px-2 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">+50 XP</span>
                    </div>
                  </div>
                  <p className="text-stone-500 text-[10px] leading-relaxed">
                    * Reduz descrições textuais longas, dividindo as instruções do Dr. Evaldo em objetivos lineares, recompensas de experiência de jogo (XP) imediatas e bento cards rápidos.
                  </p>
                </div>
              )}

              {activeSim === 'autism' && (
                <div className="space-y-4 animate-fade-in text-left transition-all duration-0">
                  <p className="text-[10px] font-mono tracking-widest uppercase text-indigo-400 font-bold leading-none border-b border-indigo-500/10 pb-2">👁️ Modo Autismo (Segurança e Zero Distrações)</p>
                  
                  <div className="p-4 bg-[#03050a] rounded-xl border border-stone-900 space-y-2 text-stone-400">
                    <p className="text-xs font-semibold uppercase text-stone-200">Informação Objetiva Próxima:</p>
                    <p className="text-[11px] leading-relaxed">
                      Sua sessão terá exatamente 5 minutos de duração. Não utilizaremos termos metafóricos ou de ancoragem abstrata. Os estímulos visuais permanecerão 100% estáticos para prevenir sobrecarga sensorial.
                    </p>
                  </div>
                </div>
              )}

              {activeSim === 'dyslexia' && (
                <div className="space-y-4 animate-fade-in text-left font-serif" style={{ letterSpacing: '0.12em', wordSpacing: '0.2em', lineHeight: '1.8' }}>
                  <p className="text-[9.5px] font-mono tracking-widest uppercase text-sky-450 font-bold leading-none text-sky-400" style={{ letterSpacing: '0.15em' }}>📖 Modo Leitura Acessível (OpenDyslexic)</p>
                  
                  <h4 className="text-sm font-bold text-stone-200" style={{ fontFamily: 'Georgia, serif' }}>
                    Facilitando as barreiras da linguagem escrita.
                  </h4>
                  <p className="text-[11px] text-stone-300 font-light" style={{ fontFamily: 'Georgia, serif' }}>
                    O aplicativo adapta fontes com bases mais reforçadas (evitando inversões espelhadas de letras), amplia o alinhamento de texto e abre lacunas generosas para uma navegação cognitivamente acolhedora.
                  </p>
                </div>
              )}

              {activeSim === 'anxiety' && (
                <div className="space-y-6 animate-fade-in flex flex-col sm:flex-row items-center gap-6 justify-between text-left">
                  <div className="space-y-3.5 flex-1 select-none">
                    <p className="text-[10px] font-mono tracking-widest uppercase text-rose-450 text-rose-400 font-bold leading-none">⛰️ Modo Ansiedade (Foco Cardiopulmonar)</p>
                    <p className="text-[11px] text-stone-400 font-light leading-relaxed">
                      Reduz instantaneamente o espectro de luz azul, sincroniza loops de respiração diafragmática para guiar ritmos cardíacos instáveis nos momentos de tensão psicossomática aguda.
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center p-5 bg-[#03050a] rounded-3xl border border-stone-900 shrink-0 select-none">
                    <motion.div 
                      className="w-14 h-14 rounded-full bg-gradient-to-r from-rose-500/30 to-pink-500/30 border border-rose-500/50 flex items-center justify-center text-rose-300 text-[10px] font-sans font-bold"
                      animate={{ scale: [1, 1.45, 1], rotate: [0, 90, 0] }}
                      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                    >
                      {breathState}
                    </motion.div>
                    <span className="text-[7.5px] font-mono uppercase text-stone-500 mt-2.5 tracking-widest">Siga o Círculo</span>
                  </div>
                </div>
              )}

              {activeSim === 'senior' && (
                <div className="space-y-4 animate-fade-in text-left">
                  <p className="text-[10px] font-mono tracking-widest uppercase text-amber-400 font-bold leading-none">👵 Modo Sênior (Clareza Visível e Toque Amigo)</p>
                  <h4 className="text-xl font-bold text-stone-100 font-sans">
                    Fontes ampliadas de alta legibilidade.
                  </h4>
                  <p className="text-[13px] text-stone-300 font-medium leading-relaxed font-sans">
                    Nossa plataforma duplica os pesos visuais dos botões e maximiza a clareza para facilitar o controle de idosos e pessoas com cansaço visual grave.
                  </p>
                  
                  <button className="py-3 px-8 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-widest rounded-xl transition-all border border-amber-500/30 cursor-pointer">
                    OUVIR SESSÃO AGORA
                  </button>
                </div>
              )}

            </div>

            {/* Static Action Link */}
            <div className="pt-6 border-t border-stone-900 border-dashed flex justify-between items-center text-[10px] font-mono uppercase text-teal-400">
              <span>{lang === 'pt' ? 'Teste Completo no Painel Interno' : 'Full Simulator Options Inside'}</span>
              <button 
                onClick={() => onNavigate('register')}
                className="flex items-center space-x-1 font-bold hover:underline"
              >
                <span>{lang === 'pt' ? 'Cadastrar e Ativar' : 'Sign Up to Unlock'}</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

          </div>

        </div>
      </section>

      {/* 6. Pricing Section (Tabela de Vendas) */}
      <section id="planos" className="py-24 px-6 max-w-5xl mx-auto space-y-12 select-none">
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-serif text-stone-100 tracking-wide font-medium">
            {l.plansTitle}
          </h2>
          <p className="text-stone-500 text-xs tracking-widest uppercase font-mono">
            {l.plansSub}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 max-w-3xl mx-auto">
          
          {/* Card Plan 1: Free */}
          <div className="bg-[#070b14]/90 border border-stone-900/80 rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[420px] relative overflow-hidden flex-1 shadow-md hover:border-stone-800 transition-colors">
            <div className="space-y-6">
              <div className="space-y-1 text-left">
                <span className="text-[8px] font-mono uppercase tracking-[0.25em] text-stone-500">INDIVIDUAL</span>
                <h3 className="text-xl font-serif text-stone-200 mt-1">{l.plan1Name}</h3>
                <div className="pt-2 text-2xl font-serif font-bold text-stone-300">{l.plan1Price}</div>
              </div>

              <div className="h-[1px] bg-stone-900" />

              <ul className="space-y-3.5 text-left text-xs text-stone-400">
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-stone-300 font-semibold">{l.plan1Limit}</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{l.plan1Feature1}</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{l.plan1Feature2}</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{l.plan1Feature3}</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={() => onNavigate('register')}
              className="mt-8 w-full py-3.5 bg-transparent border border-stone-800 hover:border-stone-700 hover:text-stone-100 text-stone-400 font-mono font-bold uppercase tracking-widest text-[9px] rounded-full transition-colors cursor-pointer"
            >
              {lang === 'pt' ? 'Cadastrar Grátis' : 'Register Free'}
            </button>
          </div>

          {/* Card Plan 2: Member Guardião (RECOMENDADO) */}
          <div className="bg-[#090e1a]/95 border border-teal-500/25 rounded-[2.5rem] p-8 flex flex-col justify-between min-h-[420px] relative overflow-hidden flex-1 shadow-2xl">
            <div className="absolute top-0 right-0 py-1.5 px-4 bg-teal-500 text-[#05070d] text-[7.5px] font-mono font-black uppercase tracking-[0.2em] rounded-bl-2xl">
              💥 {lang === 'pt' ? 'RECOMENDADO' : 'POPULAR'}
            </div>
            
            <div className="space-y-6">
              <div className="space-y-1 text-left">
                <span className="text-[8px] font-mono uppercase tracking-[0.25em] text-teal-400 font-bold">PROFISSIONAL / COMPLETO</span>
                <h3 className="text-xl font-serif text-teal-200 mt-1">{l.plan2Name}</h3>
                <div className="pt-2 text-2xl font-serif font-bold text-teal-400">{l.plan2Price}</div>
              </div>

              <div className="h-[1px] bg-teal-950/40" />

              <ul className="space-y-3.5 text-left text-xs text-stone-300">
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-450 text-teal-400 shrink-0" />
                  <span className="text-teal-300 font-bold">{l.plan2Limit}</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{l.plan2Feature1}</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{l.plan2Feature2}</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{l.plan2Feature3}</span>
                </li>
                <li className="flex items-center space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="text-teal-200 font-semibold">{l.plan2Feature4}</span>
                </li>
              </ul>
            </div>

            <button 
              onClick={() => onNavigate('register')}
              className="mt-8 w-full py-4 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-400 hover:to-emerald-400 text-[#05070d] font-mono font-black uppercase tracking-widest text-[9.5px] rounded-full transition-all cursor-pointer shadow-lg hover:shadow-teal-500/20 active:scale-[0.98]"
            >
              {lang === 'pt' ? 'Ativar Conexão Membro' : 'Become A Guardian'}
            </button>
          </div>

        </div>
      </section>

      {/* 7. Accordion FAQ Section */}
      <section id="faq" className="py-24 px-6 border-t border-[#111827]/80 bg-[#080c18]/20 relative">
        <div className="max-w-2xl mx-auto space-y-10">
          
          <div className="text-center space-y-2 select-none">
            <h2 className="text-2xl font-serif text-stone-100 tracking-wide">
              {l.faqTitle}
            </h2>
            <p className="text-stone-600 text-[9px] tracking-widest uppercase font-mono">
              {lang === 'pt' ? 'CONFORTO E TRANSPARENCIA' : 'COMFORT & TRUST'}
            </p>
          </div>

          <div className="space-y-4">
            
            {/* FAQ 1 */}
            <div className="bg-stone-950/40 border border-stone-900 rounded-2xl overflow-hidden transition-all duration-300">
              <button 
                onClick={() => toggleFaq(1)}
                className="w-full p-5 text-left text-xs uppercase font-mono tracking-wider font-semibold text-stone-300 flex justify-between items-center gap-4 hover:bg-stone-900/30 transition-colors"
              >
                <span>{l.faq1Q}</span>
                <span className="text-teal-400 text-[10px]">{faqOpen === 1 ? '▲' : '▼'}</span>
              </button>
              <AnimatePresence>
                {faqOpen === 1 && (
                  <motion.div 
                    initial={{ height: 0 }} 
                    animate={{ height: "auto" }} 
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="p-5 border-t border-stone-950 text-stone-400 text-xs leading-relaxed font-light select-text">
                      {l.faq1A}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* FAQ 2 */}
            <div className="bg-stone-950/40 border border-stone-900 rounded-2xl overflow-hidden transition-all duration-300">
              <button 
                onClick={() => toggleFaq(2)}
                className="w-full p-5 text-left text-xs uppercase font-mono tracking-wider font-semibold text-stone-300 flex justify-between items-center gap-4 hover:bg-stone-900/30 transition-colors"
              >
                <span>{l.faq2Q}</span>
                <span className="text-teal-400 text-[10px]">{faqOpen === 2 ? '▲' : '▼'}</span>
              </button>
              <AnimatePresence>
                {faqOpen === 2 && (
                  <motion.div 
                    initial={{ height: 0 }} 
                    animate={{ height: "auto" }} 
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="p-5 border-t border-stone-950 text-stone-400 text-xs leading-relaxed font-light select-text">
                      {l.faq2A}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* FAQ 3 */}
            <div className="bg-stone-950/40 border border-stone-900 rounded-2xl overflow-hidden transition-all duration-300">
              <button 
                onClick={() => toggleFaq(3)}
                className="w-full p-5 text-left text-xs uppercase font-mono tracking-wider font-semibold text-stone-300 flex justify-between items-center gap-4 hover:bg-stone-900/30 transition-colors"
              >
                <span>{l.faq3Q}</span>
                <span className="text-teal-400 text-[10px]">{faqOpen === 3 ? '▲' : '▼'}</span>
              </button>
              <AnimatePresence>
                {faqOpen === 3 && (
                  <motion.div 
                    initial={{ height: 0 }} 
                    animate={{ height: "auto" }} 
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="p-5 border-t border-stone-950 text-stone-400 text-xs leading-relaxed font-light select-text">
                      {l.faq3A}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* FAQ 4 */}
            <div className="bg-stone-950/40 border border-stone-900 rounded-2xl overflow-hidden transition-all duration-300">
              <button 
                onClick={() => toggleFaq(4)}
                className="w-full p-5 text-left text-xs uppercase font-mono tracking-wider font-semibold text-stone-300 flex justify-between items-center gap-4 hover:bg-stone-900/30 transition-colors"
              >
                <span>{l.faq4Q}</span>
                <span className="text-teal-400 text-[10px]">{faqOpen === 4 ? '▲' : '▼'}</span>
              </button>
              <AnimatePresence>
                {faqOpen === 4 && (
                  <motion.div 
                    initial={{ height: 0 }} 
                    animate={{ height: "auto" }} 
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="p-5 border-t border-stone-950 text-stone-400 text-xs leading-relaxed font-light select-text">
                      {l.faq4A}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>

        </div>
      </section>

      {/* 8. Footer */}
      <footer className="py-12 border-t border-stone-900 bg-[#04060a] text-center select-none text-[8.5px] tracking-[0.3em] font-mono text-stone-700 uppercase">
        <p className="leading-relaxed max-w-sm mx-auto">
          {l.footerNote} • PCH v1.0.0
        </p>
      </footer>

    </div>
  );
};
export default SplashView;
