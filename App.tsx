import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SessionManager from './components/SessionManager';
import { TRANSLATIONS } from './constants';
import { Language, UserPlan, User } from './types';
import Logo from './components/Logo';
import { JournalModal } from './components/JournalModal';
import { TelaRefugio } from './components/TelaRefugio';
import TelaJornada from './components/TelaJornada';
import { LandingModal } from './components/LandingModal';
import { DailyCheckInModal } from './components/DailyCheckInModal';

// MVP Foundation screens
import { SplashView } from './components/SplashView';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { ProfileChoiceView } from './components/ProfileChoiceView';
import { ManifestoView } from './components/ManifestoView';
import { UserProfileView } from './components/UserProfileView';
import { SettingsView } from './components/SettingsView';
import { AdminDashboardView } from './components/AdminDashboardView';
import { OnboardingGuide } from './components/OnboardingGuide';
import { NotificationToast, Toast } from './components/NotificationToast';
import { HomeView } from './components/HomeView';
import { TuningPopover } from './components/TuningPopover';
import { PortalView } from './components/PortalView';
import { EspelhoView } from './components/EspelhoView';
import { SoproBalloonView } from './components/SoproBalloonView';
import { AdaptiveHome } from './components/AdaptiveHome';

// New high-craft unified core workspaces
import { SantuarioView } from './components/SantuarioView';
import { RefletirView } from './components/RefletirView';
import { EvoluirView } from './components/EvoluirView';

import { auth, db, OperationType, handleFirestoreError } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, setDoc } from 'firebase/firestore';

// Icons using lucide-react
import { BookOpen, MessageSquare, User as UserIcon, Sliders, Shield, LogOut, HelpCircle } from 'lucide-react';

type NavigationScreen = 
  | 'splash'
  | 'login'
  | 'register'
  | 'profile_choice'
  | 'manifesto'
  | 'portal'
  | 'home'
  | 'chat'
  | 'refletir'
  | 'evoluir'
  | 'profile'
  | 'settings'
  | 'admin'
  | 'jornada'
  | 'espelho'
  | 'refugio'
  | 'sopro';

function App() {
  const [lang, setLang] = useState<Language>('pt');
  const [userPlan, setUserPlan] = useState<UserPlan>('visitor');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const [activeScreen, setActiveScreen] = useState<NavigationScreen>('splash');
  const [isLightTheme, setIsLightTheme] = useState(false);
  
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [accessibilityActive, setAccessibilityActive] = useState<boolean>(false);
  
  const [showJournal, setShowJournal] = useState(false);
  const [showConcept, setShowConcept] = useState(false);
  const [showTuningPopover, setShowTuningPopover] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const [isMinimalMode, setIsMinimalMode] = useState(false);
  const [showDailyCheckIn, setShowDailyCheckIn] = useState(false);
  const [showQuickPulse, setShowQuickPulse] = useState(false);
  
  // Immersive mode & mobile swipe gestures with debounce & velocity constraints
  const [isFullyImmersive, setIsFullyImmersive] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);
  const [touchStartTime, setTouchStartTime] = useState<number>(0);
  const [lastSwipeTime, setLastSwipeTime] = useState<number>(0);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isFullyImmersive) return; // Disable swipes inside Full Immersion to focus on content
    setTouchStartX(e.touches[0].clientX);
    setTouchStartY(e.touches[0].clientY);
    setTouchStartTime(Date.now());
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (isFullyImmersive || touchStartX === null || touchStartY === null) return;
    
    const diffX = e.changedTouches[0].clientX - touchStartX;
    const diffY = e.changedTouches[0].clientY - touchStartY;
    const duration = Date.now() - touchStartTime;
    const now = Date.now();

    // 1. Debounce check: Enforce temporal refractory period (500ms minimum between screen transitions)
    if (now - lastSwipeTime < 500) {
      setTouchStartX(null);
      setTouchStartY(null);
      return;
    }
    
    // 2. Velocity/Duration verification: High-speed gesture (<= 350ms) to discard slow scrolls
    // 3. Horizontal Aspect Ratio check: Aspect ratio of X to Y must be at least 2.2 to discard diagonal scroll-drifts
    // 4. Amplitude threshold: Swipes must exceed 75px to register
    if (duration <= 350 && Math.abs(diffX) > Math.abs(diffY) * 2.2 && Math.abs(diffX) > 75) {
      const screens: NavigationScreen[] = ['chat', 'profile', 'settings'];
      const currentIndex = screens.indexOf(activeScreen as NavigationScreen);
      
      if (currentIndex !== -1) {
        if (diffX < 0) {
          // Swiped left -> Next page: Chat -> Profile -> Settings
          if (currentIndex < screens.length - 1) {
            setActiveScreen(screens[currentIndex + 1]);
            setLastSwipeTime(now);
          }
        } else {
          // Swiped right -> Previous page: Settings -> Profile -> Chat
          if (currentIndex > 0) {
            setActiveScreen(screens[currentIndex - 1]);
            setLastSwipeTime(now);
          }
        }
      }
    }
    setTouchStartX(null);
    setTouchStartY(null);
  };

  useEffect(() => {
    if (currentUser && currentUser.profileCompleted && currentUser.manifestoCompleted) {
      const today = new Date().toISOString().split('T')[0];
      const localKey = `pch_last_check_in_date_${currentUser.id}`;
      const lastCheckIn = localStorage.getItem(localKey);
      if (lastCheckIn !== today) {
        setShowDailyCheckIn(true);
      }
    }
  }, [currentUser]);

  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id } as Toast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleSessionEnd = async () => {
    if (currentUser) {
      const oldPoints = currentUser.points || 0;
      const newPoints = oldPoints + 50; 
      const oldLevel = currentUser.level || 1;
      const newLevel = Math.floor(newPoints / 100) + 1;
      
      const newBadges = [...(currentUser.badges || [])];
      let unlockedNewBadge = false;
      let badgeName = '';

      if (newPoints >= 100 && !newBadges.includes('Sintonizador de Emoções') && !newBadges.includes('Emotion Tuner')) {
        badgeName = lang === 'pt' ? 'Sintonizador de Emoções' : 'Emotion Tuner';
        newBadges.push(badgeName);
        unlockedNewBadge = true;
      } else if (newPoints >= 250 && !newBadges.includes('Explorador da Calma') && !newBadges.includes('Calm Explorer')) {
        badgeName = lang === 'pt' ? 'Explorador da Calma' : 'Calm Explorer';
        newBadges.push(badgeName);
        unlockedNewBadge = true;
      } else if (newPoints >= 500 && !newBadges.includes('Sábio do Silêncio') && !newBadges.includes('Silence Sage')) {
        badgeName = lang === 'pt' ? 'Sábio do Silêncio' : 'Silence Sage';
        newBadges.push(badgeName);
        unlockedNewBadge = true;
      }

      // Calculate new calibrated resonance alignment score and history entries
      const oldScore = currentUser.resonanceScore || 72;
      const newResonanceScore = Math.min(100, Math.max(30, oldScore + 2 + Math.floor(Math.random() * 4)));
      const todayDateStr = new Date().toLocaleDateString(lang === 'pt' ? 'pt-BR' : 'en-US', { day: '2-digit', month: '2-digit' });
      const currentHistory = currentUser.resonanceHistory || [];
      const newHistory = [...currentHistory, { date: todayDateStr, score: newResonanceScore }];

      try {
        const docRef = doc(db, 'users', currentUser.id);
        await updateDoc(docRef, {
          points: newPoints,
          level: newLevel,
          badges: newBadges,
          resonanceScore: newResonanceScore,
          resonanceHistory: newHistory,
          lastActive: new Date().toISOString()
        });

         addToast({
           type: 'session',
           title: lang === 'pt' ? 'Sessão Concluída!' : 'Session Completed!',
           description: lang === 'pt' 
             ? `Seu crescimento foi cultivado & Calibração de Ressonância (${newResonanceScore}%) integrada ao seu perfil.` 
             : `Your growth has been nurtured & Resonance Calibration (${newResonanceScore}%) integrated.`
         });
 
         if (newLevel > oldLevel) {
           addToast({
             type: 'level',
             title: lang === 'pt' ? 'Sua Árvore Floresceu! 🌱' : 'Your Tree Unfurled! 🌱',
             description: lang === 'pt' 
               ? `Seu crescimento interno evoluiu! Seu santuário floresce com nova energia.` 
               : `Your inner growth has evolved! Your sanctuary blooms with beautiful new life.`
           });
         }

        if (unlockedNewBadge) {
          addToast({
            type: 'badge',
            title: lang === 'pt' ? 'Medalha Conquistada! 🏆' : 'Badge Earned! 🏆',
            description: badgeName
          });
        }
      } catch (err) {
        console.error('Error updating user session stats:', err);
      }
    }
    setShowQuickPulse(true);
    setActiveScreen('evoluir');
  };

  const activeScreenRef = useRef(activeScreen);
  useEffect(() => {
    activeScreenRef.current = activeScreen;
  }, [activeScreen]);

  // Sync auth state and load user profile doc live from Firestore database
  useEffect(() => {
    setIsMinimalMode(false);
  }, [activeScreen]);

  useEffect(() => {
    let unsubscribeUser = () => {};

    const unsubscribeAuth = onAuthStateChanged(auth, (authUser) => {
      setLoadingProfile(true);
      if (authUser) {
        const userDocRef = doc(db, 'users', authUser.uid);

        unsubscribeUser = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const syncedUser: User = {
              id: authUser.uid,
              name: data.name || 'Praticante',
              email: data.email || authUser.email || '',
              isAdmin: !!data.isAdmin,
              plan: (data.plan as UserPlan) || 'member',
              registeredAt: data.registeredAt || new Date().toISOString(),
              lastActive: data.lastActive || new Date().toISOString(),
              resonanceScore: typeof data.resonanceScore === 'number' ? data.resonanceScore : 0,
              accessibilityMode: !!data.accessibilityMode,
              resonanceHistory: data.resonanceHistory || [],
              
              // New Gamification & Orientation onboarding flags
              profileCompleted: !!data.profileCompleted,
              hasSeenOnboarding: !!data.hasSeenOnboarding,
              manifestoCompleted: !!data.manifestoCompleted,
              communicationPreference: data.communicationPreference,
              neuroMode: data.neuroMode,
              emotionalState: data.emotionalState,
              points: data.points || 0,
              level: data.level || 1,
              badges: data.badges || [],
              suspended: !!data.suspended
            };

            setCurrentUser(syncedUser);
            setUserPlan(syncedUser.plan);

            // Onboarding router logic based on complete profiles
            if (!syncedUser.profileCompleted) {
              setActiveScreen('profile_choice');
            } else if (!syncedUser.manifestoCompleted) {
              setActiveScreen('manifesto');
            } else {
              // If fully onboarded, only change screen to 'home' if currently on landing/login flows
              setActiveScreen((prev) => 
                ['splash', 'login', 'register', 'profile_choice', 'manifesto'].includes(prev) ? 'home' : prev
              );
            }
          } else {
            // First time profile bootstrapping or wait for RegisterView setDoc completion
            const currentActiveScreen = activeScreenRef.current;
            if (currentActiveScreen !== 'register' && currentActiveScreen !== 'login') {
              setActiveScreen('profile_choice');
            }
          }
          setIsAuthInitialized(true);
          setLoadingProfile(false);
        }, (err) => {
          console.error("Firestore loading error:", err);
          setIsAuthInitialized(true);
          setLoadingProfile(false);
        });
      } else {
        unsubscribeUser();
        setCurrentUser(null);
        setUserPlan('visitor');
        setActiveScreen('splash');
        setIsAuthInitialized(true);
        setLoadingProfile(false);
      }
    });

    return () => {
      unsubscribeAuth();
      unsubscribeUser();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setActiveScreen('splash');
    } catch (err) {
      console.error("Failed to log out", err);
    }
  };

  const getStateMetadata = (state?: string) => {
    const s = (state || 'neutral').toLowerCase();
    if (s.includes('low') || s.includes('sad') || s.includes('triste') || s.includes('melanc') || s.includes('heavy') || s.includes('pesado')) {
      return { pt: 'Sintonia Lunar ❄️', en: 'Lunar Tuning ❄️', color: 'text-blue-400 border-blue-500/20 bg-blue-500/10', pulse: 'bg-blue-400' };
    }
    if (s.includes('anx') || s.includes('accel') || s.includes('anxio') || s.includes('angr') || s.includes('raiv') || s.includes('irrit')) {
      return { pt: 'Sintonia de Calma ⚡', en: 'Calming Wave ⚡', color: 'text-orange-400 border-orange-500/20 bg-orange-500/10', pulse: 'bg-orange-400' };
    }
    if (s.includes('flow') || s.includes('peace') || s.includes('seren') || s.includes('paz') || s.includes('tranqu')) {
      return { pt: 'Sintonia Oceânica 🌊', en: 'Oceanic Wave 🌊', color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10', pulse: 'bg-cyan-400' };
    }
    if (s.includes('align') || s.includes('hope') || s.includes('conec') || s.includes('esper') || s.includes('estrel')) {
      return { pt: 'Ress. Estelar ✨', en: 'Stellar Ress. ✨', color: 'text-pink-400 border-pink-500/20 bg-pink-500/10', pulse: 'bg-pink-400' };
    }
    return { pt: 'Sintonia Estável ⛰️', en: 'Stable Grounding ⛰️', color: 'text-teal-400 border-teal-500/20 bg-teal-500/10', pulse: 'bg-teal-400' };
  };

  // Pre-authenticating loading screen
  const isCurrentlyRegisteringOrLoggingIn = ['register', 'login'].includes(activeScreen);
  if ((!isAuthInitialized || (loadingProfile && auth.currentUser)) && !isCurrentlyRegisteringOrLoggingIn) {
    return (
      <div className="h-screen w-full bg-stone-950 flex flex-col justify-center items-center font-mono space-y-4">
        <Logo className="w-16 h-16 text-teal-400 animate-spin" />
        <p className="text-[10px] uppercase tracking-[0.4em] text-stone-600">
          {lang === 'pt' ? 'Sintonizando Alma...' : 'Tuning Sanctuary...'}
        </p>
      </div>
    );
  }

  // Suspended account guard
  if (currentUser && currentUser.suspended && !currentUser.isAdmin) {
    return (
      <div className="h-screen w-full bg-[#080B14] flex flex-col justify-center items-center font-sans space-y-6 p-6 text-center select-none">
        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-450 animate-pulse">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 1 1 .518 1.397l-.041-.02-.041.02a.75.75 0 1 1-.518-1.397Zm0 3.96.041-.02a.75.75 0 1 1 .518 1.397l-.041-.02-.041.02a.75.75 0 1 1-.518-1.397Zm0-7.92.041-.02a.75.75 0 1 1 .518 1.397l-.041-.02-.041.02a.75.75 0 1 1-.518-1.397ZM12 2.25a9.75 9.75 0 1 0 0 19.5 9.75 9.75 0 0 0 0-19.5Z" />
          </svg>
        </div>
        <div className="max-w-md space-y-3">
          <h2 className="text-lg font-serif text-rose-400 uppercase tracking-widest font-black">Santuário Suspenso</h2>
          <p className="text-xs text-stone-400 leading-relaxed uppercase tracking-wider font-mono">
            {lang === 'pt' 
              ? 'Seu acesso ao ecossistema Voz Interior PCH foi temporariamente suspenso pela administração.'
              : 'Your access to the Inner Voice PCH ecosystem has been temporarily suspended by the administration.'}
          </p>
          <p className="text-[10px] text-stone-600 leading-relaxed font-mono">
            {lang === 'pt'
              ? 'Caso julgue este bloqueio incorreto, por favor entre em contato com seu terapeuta/guia.'
              : 'If you believe this action was made in error, please contact your therapist or guide.'}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="border border-stone-850 text-[10px] font-mono text-stone-400 hover:text-stone-200 hover:border-stone-750 py-3 px-7 rounded-xl uppercase tracking-widest transition-all cursor-pointer bg-stone-950/45 active:scale-95"
        >
          {lang === 'pt' ? 'Desconectar' : 'Disconnect / Logout'}
        </button>
      </div>
    );
  }

  // Visual layout selection
  return (
    <div className={`h-screen w-full transition-all duration-500 flex flex-col relative font-sans overflow-hidden select-none ${
      isLightTheme
        ? 'bg-[#FCFBF9] text-stone-800 theme-light' 
        : 'bg-[#080B14] text-stone-100 theme-dark'
    }`}>
      
      {/* 1. OFF-SESSION / UNLOGGED CHANNELS */}
      {activeScreen === 'splash' && (
        <SplashView lang={lang} onSetLang={setLang} onNavigate={setActiveScreen} />
      )}

      {activeScreen === 'login' && (
        <LoginView lang={lang} onSetLang={setLang} onNavigate={setActiveScreen} onSuccess={() => setActiveScreen('home')} />
      )}

      {activeScreen === 'register' && (
        <RegisterView lang={lang} onSetLang={setLang} onNavigate={setActiveScreen} onSuccess={() => setActiveScreen('profile_choice')} />
      )}

      {/* 2. ONBOARDING STAGES */}
      {activeScreen === 'profile_choice' && (
        <ProfileChoiceView lang={lang} currentUser={currentUser} onSuccess={() => {}} onLogout={handleLogout} />
      )}

      {activeScreen === 'manifesto' && (
        <ManifestoView lang={lang} currentUser={currentUser} onSuccess={() => {}} />
      )}

      {/* 3. LOGGED IN / FULL COMPLETED SYSTEM */}
      {!['splash', 'login', 'register', 'profile_choice', 'manifesto'].includes(activeScreen) && currentUser && (
        <div className="h-full w-full flex flex-col justify-between">
          
          {/* Main App Header with live Level indicator and Tab Switchers */}
          {!isMinimalMode && !isFullyImmersive && activeScreen !== 'home' && (
            <header className={`w-full border-b p-4 flex flex-row justify-between items-center z-50 transition-all duration-300 ${
              isLightTheme 
                ? 'bg-[#FCFBF9]/90 border-stone-200/80 text-stone-800 backdrop-blur-md' 
                : 'bg-[#080B14]/90 border-[#1B233A]/60 text-stone-100 backdrop-blur-md'
            }`}>
              <div className="flex items-center space-x-3" id="onboarding-level">
                <Logo className="w-8 h-8 rotate-6 transition-all duration-700" emotionalState={currentUser.emotionalState} />
                <div className="flex flex-col">
                  <span className={`font-serif text-[11px] font-bold tracking-[0.2em] uppercase flex items-center gap-2 ${
                    isLightTheme ? 'text-stone-800' : 'text-stone-100'
                  }`}>
                    {lang === 'pt' ? 'VOZ INTERIOR' : 'INNER VOICE'}
                    <span 
                      onClick={() => setShowTuningPopover(true)}
                      className={`px-1.5 py-0.5 rounded border text-[7px] font-mono tracking-wide flex items-center space-x-1 cursor-pointer hover:scale-105 active:scale-95 transition-all select-none ${getStateMetadata(currentUser.emotionalState).color}`}
                      title={lang === 'pt' ? 'Ver mapa de sintonias' : 'View tuning spectrum'}
                    >
                      <span className={`w-1 h-1 rounded-full animate-pulse ${getStateMetadata(currentUser.emotionalState).pulse}`} />
                      <span>{lang === 'pt' ? getStateMetadata(currentUser.emotionalState).pt : getStateMetadata(currentUser.emotionalState).en}</span>
                    </span>
                  </span>
                  <span className="text-[8px] text-stone-500 font-mono tracking-widest uppercase">
                    {lang === 'pt' ? 'Cultivo da Presença • Pequenas Conquistas' : 'Cultivating Presence • Tiny Conquests'}
                  </span>
                </div>
              </div>

              {/* Quick Pulse Feedback component */}
              {showQuickPulse && currentUser && (
                <div id="quick-pulse-feedback-container" className="mx-4 flex items-center gap-3 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full animate-fade-in text-xs select-none shadow-sm max-w-sm md:max-w-md shrink-0">
                  <span className="text-[11px] text-emerald-600 font-serif font-semibold">
                    {lang === 'pt' ? 'Como se sente após esta sessão PCH?' : 'How do you feel post-session?'}
                  </span>
                  <div className="flex gap-2">
                    {['😌', '🕊️', '🌱', '⚡', '💖'].map((emoji) => (
                      <button
                        key={emoji}
                        onClick={async () => {
                          const feedbackId = Date.now().toString();
                          try {
                            const feedbackRef = doc(db, 'users', currentUser.id, 'feedbacks', feedbackId);
                            await setDoc(feedbackRef, {
                              id: feedbackId,
                              userId: currentUser.id,
                              emoji: emoji,
                              timestamp: new Date().toISOString()
                            });
                            addToast({
                              type: 'badge',
                              title: lang === 'pt' ? 'Ressonância Guardada!' : 'Resonance Guarded!',
                              description: lang === 'pt' ? 'Seu pulso emocional pós-sessão foi registrado com sucesso.' : 'Your post-session emotional pulse was registered successfully.'
                            });
                          } catch (err) {
                            console.error('Error saving Quick Pulse feedback:', err);
                          }
                          setShowQuickPulse(false);
                        }}
                        className="hover:scale-130 active:scale-95 transition-all text-[15px] cursor-pointer filter hover:drop-shadow"
                        title={emoji}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                  <button 
                    onClick={() => setShowQuickPulse(false)} 
                    className="text-[10px] text-stone-400 hover:text-stone-600 transition-colors cursor-pointer px-1"
                    title={lang === 'pt' ? 'Fechar' : 'Close'}
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Aesthetic interactive navigation rails */}
              <nav className="flex items-center gap-0.5">
                {/* Journal launcher */}
                <button 
                  id="onboarding-journal"
                  onClick={() => setShowJournal(true)}
                  className="py-2.5 px-1.5 text-stone-400 hover:text-teal-400 rounded-xl bg-stone-900/40 border border-stone-850 hover:border-teal-500/20 transition-all cursor-pointer flex items-center justify-center"
                  title={lang === 'pt' ? 'Meu Diário' : 'My Journal'}
                >
                  <BookOpen className="w-4 h-4" />
                </button>
 
                <div className="w-[1px] h-6 bg-stone-900 mx-1" />
 
                {/* Chat view */}
                <button 
                  id="onboarding-chat"
                  onClick={() => setActiveScreen('chat')}
                  className={`py-2.5 px-1.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer border ${
                    activeScreen === 'chat' 
                      ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' 
                      : 'bg-stone-900/20 border-stone-850/50 text-stone-500 hover:text-stone-300'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-[9px] uppercase font-bold tracking-wider hidden sm:inline md:hidden">Chat</span>
                </button>
 
                {/* Profile view */}
                <button 
                  id="onboarding-profile"
                  onClick={() => setActiveScreen('profile')}
                  className={`py-2.5 px-1.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer border ${
                    activeScreen === 'profile' 
                      ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' 
                      : 'bg-stone-900/20 border-stone-850/50 text-stone-500 hover:text-stone-300'
                  }`}
                >
                  <UserIcon className="w-4 h-4" />
                  <span className="text-[9px] uppercase font-bold tracking-wider hidden sm:inline md:hidden">
                    {lang === 'pt' ? 'Perfil' : 'Profile'}
                  </span>
                </button>
 
                {/* Settings view */}
                <button 
                  id="onboarding-settings"
                  onClick={() => setActiveScreen('settings')}
                  className={`py-2.5 px-1.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer border ${
                    activeScreen === 'settings' 
                      ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' 
                      : 'bg-stone-900/20 border-stone-850/50 text-stone-500 hover:text-stone-300'
                  }`}
                >
                  <Sliders className="w-4 h-4" />
                  <span className="text-[9px] uppercase font-bold tracking-wider hidden sm:inline md:hidden">
                    {lang === 'pt' ? 'Ajustes' : 'Settings'}
                  </span>
                </button>
 
                {/* Admin Dashboard view */}
                {currentUser.isAdmin && (
                  <button 
                     onClick={() => setActiveScreen('admin')}
                    className={`py-2.5 px-1.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer border ${
                      activeScreen === 'admin' 
                        ? 'bg-red-500/10 border-red-500/30 text-red-400 font-extrabold' 
                        : 'bg-stone-900/20 border-stone-850/50 text-stone-600 hover:text-red-400'
                    }`}
                    title="Painel de Controle"
                  >
                    <Shield className="w-4 h-4" />
                    <span className="text-[9px] uppercase tracking-wider hidden sm:inline md:hidden">Admin</span>
                  </button>
                )}
              </nav>
            </header>
          )}

          {/* Main App active page container */}
          <main 
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="flex-1 overflow-y-auto w-full relative ResponsiveLayout"
          >
            <AnimatePresence mode="wait">
              {activeScreen === 'portal' && (
                <motion.div
                  key="portal"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                  className="w-full flex-1"
                >
                  <PortalView 
                    lang={lang} 
                    onEnterSanctuary={() => setActiveScreen('home')} 
                    isLightTheme={isLightTheme}
                  />
                </motion.div>
              )}

              {activeScreen === 'home' && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                  className="w-full flex-1"
                >
                  {currentUser && (
                    <SantuarioView 
                      user={currentUser}
                      lang={lang}
                      onNavigateToTab={(tab) => setActiveScreen(tab)}
                      isLightTheme={isLightTheme}
                      onToggleTheme={() => setIsLightTheme(prev => !prev)}
                      onAddToast={addToast}
                      onOpenTuningPopover={() => setShowTuningPopover(true)}
                      onTextSizeChange={setTextSize}
                      onAccessibilityModeChange={setAccessibilityActive}
                    />
                  )}
                </motion.div>
              )}

              {activeScreen === 'chat' && (
                <motion.div
                  key="chat"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                  className="w-full flex-1"
                >
                  <SessionManager 
                    onDisconnect={handleSessionEnd} 
                    lang={lang} 
                    userPlan={userPlan} 
                    onUpgrade={() => {}} 
                    currentUser={impersonatedUser || currentUser} 
                    isMinimalMode={isMinimalMode}
                    onToggleMinimalMode={() => setIsMinimalMode(!isMinimalMode)}
                    impersonatedUser={impersonatedUser}
                    onClearImpersonation={() => setImpersonatedUser(null)}
                    isFullyImmersive={isFullyImmersive}
                    onToggleFullyImmersive={() => setIsFullyImmersive(!isFullyImmersive)}
                  />
                </motion.div>
              )}

              {activeScreen === 'refletir' && (
                <motion.div
                  key="refletir"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                  className="w-full flex-1"
                >
                  {currentUser && (
                    <RefletirView 
                      user={currentUser}
                      lang={lang}
                      isLightTheme={isLightTheme}
                      onAddToast={addToast}
                    />
                  )}
                </motion.div>
              )}

              {activeScreen === 'evoluir' && (
                <motion.div
                  key="evoluir"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                  className="w-full flex-1"
                >
                  {currentUser && (
                    <EvoluirView 
                      user={currentUser}
                      lang={lang}
                      isLightTheme={isLightTheme}
                      onNavigateToSettings={() => setActiveScreen('settings')}
                    />
                  )}
                </motion.div>
              )}

              {activeScreen === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                  className="flex-1 w-full relative"
                >
                  <SettingsView 
                    user={currentUser} 
                    lang={lang} 
                    onSetLang={setLang} 
                    onLogout={handleLogout} 
                    onBack={() => setActiveScreen('home')}
                    textSize={textSize}
                    onTextSizeChange={setTextSize}
                    accessibilityMode={accessibilityActive}
                    onAccessibilityModeChange={setAccessibilityActive}
                    onToggleTheme={() => setIsLightTheme(prev => !prev)}
                    isLightTheme={isLightTheme}
                  />
                </motion.div>
              )}

              {activeScreen === 'admin' && (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                  className="flex justify-center items-start min-h-full py-8 w-full"
                >
                  <AdminDashboardView 
                    currentUser={currentUser} 
                    lang={lang} 
                    onImpersonateUser={(user) => {
                      setImpersonatedUser(user);
                      setActiveScreen('chat');
                      addToast({
                        type: 'session',
                        title: lang === 'pt' ? 'Perfil Sintonizado' : 'Profile Tuned',
                        description: lang === 'pt' 
                          ? `Conectando voz ao perfil de ${user?.name}`
                          : `Connecting voice to ${user?.name}'s profile`
                      });
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* New Bottom silent navigation bar - matching user requirements of exactly 4 areas */}
          {!isFullyImmersive && (
            <footer className={`w-full py-4 px-6 border-t flex justify-around items-center z-45 transition-all duration-300 select-none ${
              isLightTheme 
                ? 'bg-[#FCFBF9]/95 border-stone-200/80 text-stone-700 shadow-[0_-4px_24px_rgba(0,0,0,0.015)] backdrop-blur-md' 
                : 'bg-[#080B14]/95 border-stone-900 text-stone-300 shadow-[0_-4px_24px_rgba(0,0,0,0.4)] backdrop-blur-md'
            }`}>
              
              {/* Tab 1: Acolher 🏠 */}
              <button 
                onClick={() => setActiveScreen('home')}
                className={`transition-all duration-255 cursor-pointer flex items-center justify-center ${
                  activeScreen === 'home'
                    ? isLightTheme
                      ? 'gap-1.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-[#2B6140] font-semibold scale-102 shadow-sm'
                      : 'gap-1.5 px-4 py-2 rounded-full bg-emerald-950/40 border border-emerald-900/40 text-[#4ade80] font-semibold scale-102 shadow-sm'
                    : isLightTheme
                      ? 'flex-col p-2 text-stone-400 hover:text-stone-700 bg-transparent rounded-full hover:bg-stone-100/40'
                      : 'flex-col p-2 text-stone-500 hover:text-stone-200 bg-transparent rounded-full hover:bg-stone-900/20'
                }`}
                title={lang === 'pt' ? 'Acolher' : 'Welcome'}
              >
                <span className="text-[17px] mr-1">🏠</span>
                {activeScreen === 'home' && (
                  <span className="text-[9px] font-mono tracking-[0.25em] uppercase leading-none font-extrabold">
                    {lang === 'pt' ? 'Acolher' : 'Welcome'}
                  </span>
                )}
              </button>
 
              {/* Tab 2: Escutar 🎙 */}
              <button 
                onClick={() => setActiveScreen('chat')}
                className={`transition-all duration-255 cursor-pointer flex items-center justify-center ${
                  activeScreen === 'chat'
                    ? isLightTheme
                      ? 'gap-1.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-[#2B6140] font-semibold scale-102 shadow-sm'
                      : 'gap-1.5 px-4 py-2 rounded-full bg-emerald-950/40 border border-emerald-900/40 text-[#4ade80] font-semibold scale-102 shadow-sm'
                    : isLightTheme
                      ? 'flex-col p-2 text-stone-400 hover:text-stone-700 bg-transparent rounded-full hover:bg-stone-100/40'
                      : 'flex-col p-2 text-stone-500 hover:text-stone-200 bg-transparent rounded-full hover:bg-stone-900/20'
                }`}
                title={lang === 'pt' ? 'Escutar' : 'Listen'}
              >
                <span className="text-[17px] mr-1">🎙️</span>
                {activeScreen === 'chat' && (
                  <span className="text-[9px] font-mono tracking-[0.25em] uppercase leading-none font-extrabold">
                    {lang === 'pt' ? 'Escutar' : 'Listen'}
                  </span>
                )}
              </button>
 
              {/* Tab 3: Transformar 🌱 */}
              <button 
                onClick={() => setActiveScreen('refletir')}
                className={`transition-all duration-255 cursor-pointer flex items-center justify-center ${
                  activeScreen === 'refletir'
                    ? isLightTheme
                      ? 'gap-1.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-[#2B6140] font-semibold scale-102 shadow-sm'
                      : 'gap-1.5 px-4 py-2 rounded-full bg-emerald-950/40 border border-emerald-900/40 text-[#4ade80] font-semibold scale-102 shadow-sm'
                    : isLightTheme
                      ? 'flex-col p-2 text-stone-400 hover:text-stone-700 bg-transparent rounded-full hover:bg-stone-100/40'
                      : 'flex-col p-2 text-stone-500 hover:text-stone-200 bg-transparent rounded-full hover:bg-stone-900/20'
                }`}
                title={lang === 'pt' ? 'Transformar' : 'Transform'}
              >
                <span className="text-[17px] mr-1">🌱</span>
                {activeScreen === 'refletir' && (
                  <span className="text-[9px] font-mono tracking-[0.25em] uppercase leading-none font-extrabold">
                    {lang === 'pt' ? 'Transformar' : 'Transform'}
                  </span>
                )}
              </button>
 
              {/* Tab 4: Evoluir ✨ */}
              <button 
                onClick={() => setActiveScreen('evoluir')}
                className={`transition-all duration-255 cursor-pointer flex items-center justify-center ${
                  activeScreen === 'evoluir'
                    ? isLightTheme
                      ? 'gap-1.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-[#2B6140] font-semibold scale-102 shadow-sm'
                      : 'gap-1.5 px-4 py-2 rounded-full bg-emerald-950/40 border border-emerald-900/40 text-[#4ade80] font-semibold scale-102 shadow-sm'
                    : isLightTheme
                      ? 'flex-col p-2 text-stone-400 hover:text-stone-700 bg-transparent rounded-full hover:bg-stone-100/40'
                      : 'flex-col p-2 text-stone-500 hover:text-stone-200 bg-transparent rounded-full hover:bg-stone-900/20'
                }`}
                title={lang === 'pt' ? 'Evoluir' : 'Evolve'}
              >
                <span className="text-[17px] mr-1">✨</span>
                {activeScreen === 'evoluir' && (
                  <span className="text-[9px] font-mono tracking-[0.25em] uppercase leading-none font-extrabold">
                    {lang === 'pt' ? 'Evoluir' : 'Evolve'}
                  </span>
                )}
              </button>
 
            </footer>
          )}
        </div>
      )}

      {/* Concept Guide information panel overlay */}
      <LandingModal isOpen={showConcept} onClose={() => setShowConcept(false)} lang={lang} />

      {/* Tuning spectrum popover/tooltip overlay */}
      <TuningPopover
        isOpen={showTuningPopover}
        onClose={() => setShowTuningPopover(false)}
        lang={lang}
        currentTuningId={currentUser?.emotionalState}
        isLightTheme={isLightTheme}
      />

      {/* Global Modals */}
      {showJournal && (
        <TelaRefugio 
          onClose={() => setShowJournal(false)} 
          lang={lang} 
        />
      )}
      {currentUser && (
        <DailyCheckInModal
          isOpen={showDailyCheckIn}
          onClose={() => setShowDailyCheckIn(false)}
          user={currentUser}
          lang={lang}
          onAddToast={addToast}
        />
      )}
      <OnboardingGuide lang={lang} currentUser={currentUser} />
      <NotificationToast toasts={toasts} onRemove={removeToast} lang={lang} />
    </div>
  );
}

export default App;
