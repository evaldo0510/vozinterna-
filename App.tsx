import React, { useState, useEffect } from 'react';
import SessionManager from './components/SessionManager';
import { TRANSLATIONS } from './constants';
import { Language, UserPlan, User } from './types';
import Logo from './components/Logo';
import { JournalModal } from './components/JournalModal';
import { LandingModal } from './components/LandingModal';

// MVP Foundation screens
import { SplashView } from './components/SplashView';
import { LoginView } from './components/LoginView';
import { RegisterView } from './components/RegisterView';
import { ProfileChoiceView } from './components/ProfileChoiceView';
import { ManifestoView } from './components/ManifestoView';
import { UserProfileView } from './components/UserProfileView';
import { SettingsView } from './components/SettingsView';
import { AdminDashboardView } from './components/AdminDashboardView';

import { auth, db, OperationType, handleFirestoreError } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

// Icons using lucide-react
import { BookOpen, MessageSquare, User as UserIcon, Sliders, Shield, LogOut, HelpCircle } from 'lucide-react';

type NavigationScreen = 
  | 'splash'
  | 'login'
  | 'register'
  | 'profile_choice'
  | 'manifesto'
  | 'chat'
  | 'profile'
  | 'settings'
  | 'admin';

function App() {
  const [lang, setLang] = useState<Language>('pt');
  const [userPlan, setUserPlan] = useState<UserPlan>('visitor');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeScreen, setActiveScreen] = useState<NavigationScreen>('splash');
  
  const [showJournal, setShowJournal] = useState(false);
  const [showConcept, setShowConcept] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);

  // Sync auth state and load user profile doc live from Firestore database
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
              manifestoCompleted: !!data.manifestoCompleted,
              communicationPreference: data.communicationPreference,
              neuroMode: data.neuroMode,
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
              // If fully onboarded, only change screen to 'chat' if currently on landing/login flows
              setActiveScreen((prev) => 
                ['splash', 'login', 'register', 'profile_choice', 'manifesto'].includes(prev) ? 'chat' : prev
              );
            }
          } else {
            // First time profile bootstrapping
            setActiveScreen('profile_choice');
          }
          setLoadingProfile(false);
        }, (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${authUser.uid}`);
          setLoadingProfile(false);
        });
      } else {
        unsubscribeUser();
        setCurrentUser(null);
        setUserPlan('visitor');
        setActiveScreen('splash');
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

  // Pre-authenticating loading screen
  if (loadingProfile && auth.currentUser) {
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
    <div className="h-screen w-full bg-stone-950 text-stone-200 flex flex-col relative font-sans overflow-hidden select-none">
      
      {/* 1. OFF-SESSION / UNLOGGED CHANNELS */}
      {activeScreen === 'splash' && (
        <SplashView lang={lang} onSetLang={setLang} onNavigate={setActiveScreen} />
      )}

      {activeScreen === 'login' && (
        <LoginView lang={lang} onSetLang={setLang} onNavigate={setActiveScreen} onSuccess={() => {}} />
      )}

      {activeScreen === 'register' && (
        <RegisterView lang={lang} onSetLang={setLang} onNavigate={setActiveScreen} onSuccess={() => {}} />
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
          <header className="w-full bg-stone-950 border-b border-stone-900 p-4 flex flex-row justify-between items-center z-50">
            <div className="flex items-center space-x-3">
              <Logo className="w-8 h-8 text-teal-400 rotate-6" />
              <div className="flex flex-col">
                <span className="font-serif text-[11px] font-bold tracking-[0.2em] text-stone-100 uppercase">
                  {lang === 'pt' ? 'VOZ INTERIOR' : 'INNER VOICE'}
                </span>
                <span className="text-[8px] text-stone-500 font-mono tracking-widest uppercase">
                  LVL {currentUser.level || 1} • {currentUser.points || 0} XP
                </span>
              </div>
            </div>

            {/* Aesthetic interactive navigation rails */}
            <nav className="flex items-center gap-2">
              {/* Journal launcher */}
              <button 
                onClick={() => setShowJournal(true)}
                className="p-2.5 text-stone-400 hover:text-teal-400 rounded-xl bg-stone-900/40 border border-stone-850 hover:border-teal-500/20 transition-all cursor-pointer flex items-center justify-center"
                title={lang === 'pt' ? 'Meu Diário' : 'My Journal'}
              >
                <BookOpen className="w-4 h-4" />
              </button>

              <div className="w-[1px] h-6 bg-stone-900 mx-1" />

              {/* Chat view */}
              <button 
                onClick={() => setActiveScreen('chat')}
                className={`p-2.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer border ${
                  activeScreen === 'chat' 
                    ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' 
                    : 'bg-stone-900/20 border-stone-850/50 text-stone-500 hover:text-stone-300'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-[9px] uppercase font-bold tracking-wider hidden sm:inline">Chat</span>
              </button>

              {/* Profile view */}
              <button 
                onClick={() => setActiveScreen('profile')}
                className={`p-2.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer border ${
                  activeScreen === 'profile' 
                    ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' 
                    : 'bg-stone-900/20 border-stone-850/50 text-stone-500 hover:text-stone-300'
                }`}
              >
                <UserIcon className="w-4 h-4" />
                <span className="text-[9px] uppercase font-bold tracking-wider hidden sm:inline">
                  {lang === 'pt' ? 'Perfil' : 'Profile'}
                </span>
              </button>

              {/* Settings view */}
              <button 
                onClick={() => setActiveScreen('settings')}
                className={`p-2.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer border ${
                  activeScreen === 'settings' 
                    ? 'bg-teal-500/10 border-teal-500/30 text-teal-400' 
                    : 'bg-stone-900/20 border-stone-850/50 text-stone-500 hover:text-stone-300'
                }`}
              >
                <Sliders className="w-4 h-4" />
                <span className="text-[9px] uppercase font-bold tracking-wider hidden sm:inline">
                  {lang === 'pt' ? 'Ajustes' : 'Ajusts'}
                </span>
              </button>

              {/* Admin Dashboard view */}
              {currentUser.isAdmin && (
                <button 
                  onClick={() => setActiveScreen('admin')}
                  className={`p-2.5 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer border ${
                    activeScreen === 'admin' 
                      ? 'bg-red-500/10 border-red-500/30 text-red-400 font-extrabold' 
                      : 'bg-stone-900/20 border-stone-850/50 text-stone-600 hover:text-red-400'
                  }`}
                  title="Painel de Controle"
                >
                  <Shield className="w-4 h-4" />
                  <span className="text-[9px] uppercase tracking-wider hidden sm:inline">Admin</span>
                </button>
              )}
            </nav>
          </header>

          {/* Main App active page container */}
          <main className="flex-1 overflow-y-auto w-full relative">
            {activeScreen === 'chat' && (
              <SessionManager 
                onDisconnect={() => setActiveScreen('profile')} 
                lang={lang} 
                userPlan={userPlan} 
                onUpgrade={() => {}} 
                currentUser={currentUser} 
              />
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
                />
              </div>
            )}
          </main>
        </div>
      )}

      {/* Concept Guide information panel overlay */}
      <LandingModal isOpen={showConcept} onClose={() => setShowConcept(false)} lang={lang} />

      {/* Global Modals */}
      <JournalModal isOpen={showJournal} onClose={() => setShowJournal(false)} lang={lang} />
    </div>
  );
}

export default App;
