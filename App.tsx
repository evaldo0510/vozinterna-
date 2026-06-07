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

import { auth, db, OperationType, handleFirestoreError } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';

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
          description: lang === 'pt' ? `+50 XP & Calibração de Ressonância (${newResonanceScore}%) integrados ao perfil.` : `+50 XP & Resonance Calibration (${newResonanceScore}%) integrated.`
        });

        if (newLevel > oldLevel) {
          addToast({
            type: 'level',
            title: lang === 'pt' ? 'Novo Nível Alcançado! 🎉' : 'New Level Unlocked! 🎉',
            description: lang === 'pt' ? `Você evoluiu para o Nível ${newLevel}!` : `You evolved to Level ${newLevel}!`
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
    setActiveScreen('profile');
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
              badges: data.badges || []
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
                    LVL {currentUser.level || 1} • {currentUser.points || 0} XP
                  </span>
                </div>
              </div>

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
                  <AdaptiveHome 
                    user={currentUser}
                    lang={lang}
                    onNavigateToScreen={(screen) => setActiveScreen(screen)}
                    isLightTheme={isLightTheme}
                    onToggleTheme={() => setIsLightTheme(prev => !prev)}
                    onAddToast={addToast}
                    onOpenTuningPopover={() => setShowTuningPopover(true)}
                    onTextSizeChange={setTextSize}
                    onAccessibilityModeChange={setAccessibilityActive}
                  />
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

              {activeScreen === 'jornada' && (
                <motion.div
                  key="jornada"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                  className="flex-1 w-full relative"
                >
                  <TelaJornada 
                    lang={lang}
                    onBack={() => setActiveScreen('home')}
                    onNavigateToProfile={() => setActiveScreen('profile')}
                  />
                </motion.div>
              )}

              {activeScreen === 'espelho' && (
                <motion.div
                  key="espelho"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                  className="w-full flex-1"
                >
                  <EspelhoView 
                    user={currentUser}
                    lang={lang}
                    onBack={() => setActiveScreen('home')}
                    onAddToast={addToast}
                  />
                </motion.div>
              )}

              {activeScreen === 'refugio' && (
                <motion.div
                  key="refugio"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                  className="w-full flex-1"
                >
                  <TelaRefugio 
                    onClose={() => setActiveScreen('home')} 
                    lang={lang} 
                  />
                </motion.div>
              )}

              {activeScreen === 'sopro' && (
                <motion.div
                  key="sopro"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                  className="w-full flex-1"
                >
                  <SoproBalloonView 
                    onClose={() => setActiveScreen('home')} 
                    lang={lang} 
                  />
                </motion.div>
              )}

              {activeScreen === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.35, ease: [0.19, 1, 0.22, 1] }}
                  className="flex justify-center items-center min-h-full py-8 w-full"
                >
                  <UserProfileView 
                    user={currentUser} 
                    lang={lang} 
                    onNavigateToSettings={() => setActiveScreen('jornada')} 
                  />
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

          {/* New Bottom silent navigation bar - matching user requirements & mockup */}
          {!isFullyImmersive && (
            <footer className={`w-full py-4 px-6 border-t flex justify-around items-center z-45 transition-all duration-300 select-none ${
              isLightTheme 
                ? 'bg-[#FCFBF9]/95 border-stone-200/80 text-stone-700 shadow-[0_-4px_24px_rgba(0,0,0,0.015)] backdrop-blur-md' 
                : 'bg-[#080B14]/95 border-stone-900 text-stone-300 shadow-[0_-4px_24px_rgba(0,0,0,0.4)] backdrop-blur-md'
            }`}>
              
              {/* Tab 1: Portal */}
              <button 
                onClick={() => setActiveScreen('portal')}
                className={`transition-all duration-250 cursor-pointer flex items-center justify-center ${
                  activeScreen === 'portal'
                    ? isLightTheme
                      ? 'gap-1.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-[#2B6140] font-semibold scale-102 shadow-sm'
                      : 'gap-1.5 px-4 py-2 rounded-full bg-emerald-950/40 border border-emerald-900/40 text-[#4ade80] font-semibold scale-102 shadow-sm'
                    : isLightTheme
                      ? 'flex-col p-2 text-stone-400 hover:text-stone-700 bg-transparent rounded-full hover:bg-stone-100/40'
                      : 'flex-col p-2 text-stone-500 hover:text-stone-200 bg-transparent rounded-full hover:bg-stone-900/20'
                }`}
                title={lang === 'pt' ? 'Portal' : 'Portal'}
              >
                {/* Micro Flower pattern vector inside Portal */}
                <svg viewBox="0 0 100 100" fill="none" className="w-[18px] h-[18px]" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="14" stroke="currentColor" strokeWidth="3.5" strokeOpacity="0.7" fill="none" />
                  {[0, 60, 120, 180, 240, 300].map((angle) => {
                    const rad = (angle * Math.PI) / 180;
                    const cx = 50 + 17 * Math.cos(rad);
                    const cy = 50 + 17 * Math.sin(rad);
                    return (
                      <circle key={angle} cx={cx} cy={cy} r="14" stroke="currentColor" strokeWidth="3.5" strokeOpacity="0.7" fill="none" />
                    );
                  })}
                </svg>
                {activeScreen === 'portal' && (
                  <span className="text-[9px] font-mono tracking-[0.25em] uppercase leading-none font-bold">
                    {lang === 'pt' ? 'Portal' : 'Portal'}
                  </span>
                )}
              </button>

              {/* Tab 2: Santuário */}
              <button 
                onClick={() => setActiveScreen('home')}
                className={`transition-all duration-250 cursor-pointer flex items-center justify-center ${
                  activeScreen === 'home'
                    ? isLightTheme
                      ? 'gap-1.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-[#2B6140] font-semibold scale-102 shadow-sm'
                      : 'gap-1.5 px-4 py-2 rounded-full bg-emerald-950/40 border border-emerald-900/40 text-[#4ade80] font-semibold scale-102 shadow-sm'
                    : isLightTheme
                      ? 'flex-col p-2 text-stone-400 hover:text-stone-700 bg-transparent rounded-full hover:bg-stone-100/40'
                      : 'flex-col p-2 text-stone-500 hover:text-stone-200 bg-transparent rounded-full hover:bg-stone-900/20'
                }`}
                title={lang === 'pt' ? 'Santuário' : 'Sanctuary'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[18px] h-[18px]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                </svg>
                {activeScreen === 'home' && (
                  <span className="text-[9px] font-mono tracking-[0.25em] uppercase leading-none font-bold">
                    {lang === 'pt' ? 'Santuário' : 'Sanctuary'}
                  </span>
                )}
              </button>

              {/* Tab 3: Escuta */}
              <button 
                onClick={() => setActiveScreen('chat')}
                className={`transition-all duration-250 cursor-pointer flex items-center justify-center ${
                  activeScreen === 'chat'
                    ? isLightTheme
                      ? 'gap-1.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-[#2B6140] font-semibold scale-102 shadow-sm'
                      : 'gap-1.5 px-4 py-2 rounded-full bg-emerald-950/40 border border-emerald-900/40 text-[#4ade80] font-semibold scale-102 shadow-sm'
                    : isLightTheme
                      ? 'flex-col p-2 text-stone-400 hover:text-stone-700 bg-transparent rounded-full hover:bg-stone-100/40'
                      : 'flex-col p-2 text-stone-500 hover:text-stone-200 bg-transparent rounded-full hover:bg-stone-900/20'
                }`}
                title={lang === 'pt' ? 'Escuta' : 'Echo'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[18px] h-[18px]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z" />
                </svg>
                {activeScreen === 'chat' && (
                  <span className="text-[9px] font-mono tracking-[0.25em] uppercase leading-none font-bold">
                    {lang === 'pt' ? 'Escuta' : 'Listening'}
                  </span>
                )}
              </button>

              {/* Tab 4: Jornada */}
              <button 
                onClick={() => setActiveScreen('jornada')}
                className={`transition-all duration-250 cursor-pointer flex items-center justify-center ${
                  activeScreen === 'jornada'
                    ? isLightTheme
                      ? 'gap-1.5 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-[#2B6140] font-semibold scale-102 shadow-sm'
                      : 'gap-1.5 px-4 py-2 rounded-full bg-emerald-950/40 border border-emerald-900/40 text-[#4ade80] font-semibold scale-102 shadow-sm'
                    : isLightTheme
                      ? 'flex-col p-2 text-stone-400 hover:text-stone-700 bg-transparent rounded-full hover:bg-stone-100/40'
                      : 'flex-col p-2 text-stone-500 hover:text-stone-200 bg-transparent rounded-full hover:bg-stone-900/20'
                }`}
                title={lang === 'pt' ? 'Jornada' : 'Journey'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-[18px] h-[18px]">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 21l-.813-5.096L3 15l5.096-.813L9 9l.813 5.096L15 15l-5.187.904ZM18 5.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm-3 3a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
                </svg>
                {activeScreen === 'jornada' && (
                  <span className="text-[9px] font-mono tracking-[0.25em] uppercase leading-none font-bold">
                    {lang === 'pt' ? 'Jornada' : 'Journey'}
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
