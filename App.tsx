import React, { useState, useEffect, useRef } from 'react';
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
  | 'home'
  | 'chat'
  | 'profile'
  | 'settings'
  | 'admin'
  | 'jornada';

function App() {
  const [lang, setLang] = useState<Language>('pt');
  const [userPlan, setUserPlan] = useState<UserPlan>('visitor');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [impersonatedUser, setImpersonatedUser] = useState<User | null>(null);
  const [activeScreen, setActiveScreen] = useState<NavigationScreen>('splash');
  const [isLightTheme, setIsLightTheme] = useState(false);
  
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
    <div className={`h-screen w-full transition-colors duration-705 flex flex-col relative font-sans overflow-hidden select-none ${
      isLightTheme && activeScreen === 'home'
        ? 'bg-[#F4EFE6] text-stone-800' 
        : activeScreen === 'home'
          ? 'bg-[#0B1516] text-[#E0E7E5]'
          : 'bg-stone-950 text-stone-200'
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
            <header className="w-full bg-stone-950 border-b border-stone-900 p-4 flex flex-row justify-between items-center z-50">
              <div className="flex items-center space-x-3" id="onboarding-level">
                <Logo className="w-8 h-8 rotate-6 transition-all duration-700" emotionalState={currentUser.emotionalState} />
                <div className="flex flex-col">
                  <span className="font-serif text-[11px] font-bold tracking-[0.2em] text-stone-100 uppercase flex items-center gap-2">
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
            {activeScreen === 'home' && (
              <HomeView 
                user={currentUser}
                lang={lang}
                onOpenJournal={() => setShowJournal(true)}
                onNavigateToChat={() => setActiveScreen('chat')}
                onNavigateToSettings={() => setActiveScreen('settings')}
                onNavigateToProfile={() => setActiveScreen('profile')}
                isLightTheme={isLightTheme}
                onToggleTheme={() => setIsLightTheme(prev => !prev)}
                onAddToast={addToast}
                onOpenTuningPopover={() => setShowTuningPopover(true)}
              />
            )}

            {activeScreen === 'chat' && (
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
            )}

            {activeScreen === 'jornada' && (
              <div className="flex-1 w-full relative">
                <TelaJornada 
                  lang={lang}
                  onBack={() => setActiveScreen('home')}
                  onNavigateToProfile={() => setActiveScreen('profile')}
                />
              </div>
            )}

            {activeScreen === 'profile' && (
              <div className="flex justify-center items-center min-h-full py-8">
                <UserProfileView 
                  user={currentUser} 
                  lang={lang} 
                  onNavigateToSettings={() => setActiveScreen('settings')} 
                />
              </div>
            )}

            {activeScreen === 'settings' && (
              <div className="flex justify-center items-center min-h-full py-8">
                <SettingsView 
                  user={currentUser} 
                  lang={lang} 
                  onSetLang={setLang} 
                  onLogout={handleLogout} 
                />
              </div>
            )}

            {activeScreen === 'admin' && (
              <div className="flex justify-center items-start min-h-full py-8">
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
              </div>
            )}
          </main>

          {/* New Bottom silent navigation bar - matching user requirements & mockup */}
          {!isFullyImmersive && (
            <footer className={`w-full py-3.5 px-6 border-t flex justify-around items-center z-45 backdrop-blur-md transition-all duration-500 ${
              isLightTheme && activeScreen === 'home'
                ? 'bg-[#F4EFE6]/75 border-stone-200/55' 
                : activeScreen === 'home'
                  ? 'bg-[#0B1516]/75 border-stone-900/50'
                  : 'bg-stone-950/90 border-stone-900'
            }`}>
              <button 
                onClick={() => setActiveScreen('home')}
                className={`flex flex-col items-center justify-center p-1.5 rounded-2xl transition-all cursor-pointer ${
                  activeScreen === 'home'
                    ? isLightTheme 
                      ? 'text-[#3E5F35] scale-105 font-bold' 
                      : 'text-[#82B98E] scale-105 font-bold'
                    : 'text-stone-500 hover:text-stone-300'
                }`}
                title={lang === 'pt' ? 'Início' : 'Home'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                <span className="text-[9px] tracking-widest mt-1 uppercase font-medium">{lang === 'pt' ? 'Casa' : 'Home'}</span>
              </button>

              <button 
                onClick={() => setActiveScreen('jornada')}
                className={`flex flex-col items-center justify-center p-1.5 rounded-2xl transition-all cursor-pointer ${
                  activeScreen === 'jornada'
                    ? isLightTheme && activeScreen === 'home'
                      ? 'text-[#3E5F35] scale-105 font-bold' 
                      : 'text-[#82B98E] scale-105 font-bold'
                    : 'text-stone-500 hover:text-stone-300'
                }`}
                title={lang === 'pt' ? 'Jornada' : 'Journey'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
                </svg>
                <span className="text-[9px] tracking-widest mt-1 uppercase font-medium">{lang === 'pt' ? 'Jornada' : 'Journey'}</span>
              </button>

              <button 
                onClick={() => setActiveScreen('settings')}
                className={`flex flex-col items-center justify-center p-1.5 rounded-2xl transition-all cursor-pointer ${
                  activeScreen === 'settings'
                    ? isLightTheme && activeScreen === 'home'
                      ? 'text-[#3E5F35] scale-105 font-bold' 
                      : 'text-[#82B98E] scale-105 font-bold'
                    : 'text-stone-500 hover:text-stone-300'
                }`}
                title={lang === 'pt' ? 'Ajustes' : 'Settings'}
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
                <span className="text-[9px] tracking-widest mt-1 uppercase font-medium">{lang === 'pt' ? 'Ajustes' : 'Settings'}</span>
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
