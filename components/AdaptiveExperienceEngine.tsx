import React, { useEffect } from 'react';
import { User, Language } from '../types';
import { HomeNormal } from './HomeNormal';
import { HomeTDAH } from './HomeTDAH';
import { HomeAutismo } from './HomeAutismo';
import { HomeAnsiedade } from './HomeAnsiedade';
import { HomeIdoso } from './HomeIdoso';
import { HomeDislexia } from './HomeDislexia';
import { HomeTeaTdah } from './HomeTeaTdah';

interface AdaptiveExperienceEngineProps {
  user: User;
  lang: Language;
  onNavigateToScreen: (screen: 'portal' | 'home' | 'chat' | 'jornada' | 'espelho' | 'refugio' | 'sopro') => void;
  isLightTheme: boolean;
  onToggleTheme: () => void;
  onAddToast: (toast: { type: string; title: string; description: string }) => void;
  onOpenTuningPopover: () => void;
  onTextSizeChange?: (size: 'small' | 'medium' | 'large') => void;
  onAccessibilityModeChange?: (active: boolean) => void;
}

export const AdaptiveExperienceEngine: React.FC<AdaptiveExperienceEngineProps> = ({
  user,
  lang,
  onNavigateToScreen,
  isLightTheme,
  onToggleTheme,
  onAddToast,
  onOpenTuningPopover,
  onTextSizeChange,
  onAccessibilityModeChange,
}) => {
  // Normalize neuroMode selection (supports both NeuroMode and legacy NeurodivergentMode mappings)
  const getNormalizedMode = (): string => {
    const rawMode = user?.neuroMode || 'normal';
    
    // Map legacy or selected key aliases to the target 7 neuroModes requested by user
    switch (rawMode) {
      case 'natural':
      case 'normal':
        return 'normal';
      case 'adhd':
      case 'tdah':
        return 'tdah';
      case 'autism':
      case 'autismo':
        return 'autismo';
      case 'anxiety':
      case 'ansiedade':
        return 'ansiedade';
      case 'senior':
      case 'idoso':
        return 'idoso';
      case 'dyslexia':
      case 'dislexia':
        return 'dislexia';
      case 'tea_tdah':
        return 'tea_tdah';
      default:
        return 'normal';
    }
  };

  const currentMode = getNormalizedMode();

  // Dynamic style injector utility for neurodivergent accessibility profiles
  useEffect(() => {
    // Clean up any previously applied dynamic styles
    const previousStyle = document.getElementById('adaptive-neuro-styles');
    if (previousStyle) previousStyle.remove();

    // Create a new stylesheet specifically configured for the active neuroMode
    const styleEl = document.createElement('style');
    styleEl.id = 'adaptive-neuro-styles';

    let cssRules = '';

    if (currentMode === 'dislexia') {
      // Apply OpenDyslexic typeface along with balanced fallbacks and custom letter/word-spacing for enhanced readability.
      cssRules = `
        @import url('https://cdn.jsdelivr.net/npm/open-dyslexic@1.11.0/open-dyslexic.css');
        @import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&display=swap');
        
        * {
          font-family: 'OpenDyslexic', 'Comic Neue', 'Comic Sans MS', sans-serif !important;
          letter-spacing: 0.12em !important;
          word-spacing: 0.22em !important;
          line-height: 1.85 !important;
          font-weight: 500 !important;
          text-shadow: 0.3px 0.3px 0px rgba(255, 255, 255, 0.1) !important;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-weight: 700 !important;
          letter-spacing: 0.08em !important;
        }

        /* Weighted heavy bottom appearance emulation for highly comfortable scan boundaries */
        p, span, li, button, input, textarea {
          border-bottom-color: rgba(255, 255, 255, 0.05);
        }
      `;
    } else if (currentMode === 'idoso') {
      // Increased lettering offset, custom sizes, bold weights, and large targets.
      cssRules = `
        * {
          font-size: 104% !important;
          line-height: 1.7 !important;
          letter-spacing: 0.03em !important;
        }
        h1 { font-size: 2.25rem !important; }
        h2 { font-size: 1.85rem !important; }
        h3 { font-size: 1.45rem !important; }
        p, span, li { font-size: 1.05rem !important; font-weight: 500 !important; }
        button, a, input, [role="button"] {
          min-height: 48px !important;
          font-weight: bold !important;
        }
      `;
    } else if (currentMode === 'autismo') {
      // Absolute minimum sensory distraction: eliminate all custom animations, spins, pulses, and transition delays.
      cssRules = `
        *, *::before, *::after {
          animation-delay: 0s !important;
          animation-duration: 0s !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0s !important;
          scroll-behavior: auto !important;
          transform: none !important;
        }
        .animate-pulse, .animate-ping, .animate-spin {
          animation: none !important;
        }
      `;
    } else if (currentMode === 'tdah' || currentMode === 'tea_tdah') {
      // Extra high contrast focusing layout adjustments
      cssRules = `
        input:focus, textarea:focus, button:focus, [role="button"]:focus {
          outline: 3px solid #14B8A6 !important;
          outline-offset: 3px !important;
          box-shadow: 0 0 0 6px rgba(20, 184, 166, 0.2) !important;
        }
      `;
    } else if (currentMode === 'ansiedade') {
      // Soft breathing focus boundaries and relaxed font flow to combat tension
      cssRules = `
        * {
          line-height: 1.65 !important;
          letter-spacing: 0.012em !important;
        }
      `;
    }

    styleEl.innerHTML = cssRules;
    document.head.appendChild(styleEl);

    return () => {
      const activeStyle = document.getElementById('adaptive-neuro-styles');
      if (activeStyle) activeStyle.remove();
    };
  }, [currentMode]);

  // Automatic accessibility trigger based on loaded profile (specifically requested)
  useEffect(() => {
    if (!currentMode) return;
    
    // Apply visual parameters dynamically depending on mode
    if (currentMode === 'idoso') {
      if (onTextSizeChange) onTextSizeChange('large');
      if (onAccessibilityModeChange) onAccessibilityModeChange(true);
    } else if (currentMode === 'dislexia') {
      if (onTextSizeChange) onTextSizeChange('medium');
    } else if (currentMode === 'normal') {
      if (onTextSizeChange) onTextSizeChange('medium');
    }
    
    // Auto toast notification that welcomingly signals the adaptive loadout comfort
    const modeLabels: Record<string, string> = {
      normal: lang === 'pt' ? 'Mente Plena Natural 🍃' : 'Standard Natural Sanctuary 🍃',
      tdah: lang === 'pt' ? 'Foco Blindado TDAH Ativo ⚡' : 'ADHD Focus Engine Locked ⚡',
      autismo: lang === 'pt' ? 'Roteiro de Previsibilidade Autismo 🧩' : 'Symmetric Predictable Pathway 🧩',
      ansiedade: lang === 'pt' ? 'Refúgio de Co-Regulação de Ansiedade 💕' : 'Anxiety Calming Refuge Shield 💕',
      idoso: lang === 'pt' ? 'Letras Grandes e Contraste Sênior Ativos 👵👴' : 'Enlarged Accessibility Display Active 👵👴',
      dislexia: lang === 'pt' ? 'Compensador de Fonte Dislexia Carregado 📚' : 'Compensated Type Spacing Engaged 📚',
      tea_tdah: lang === 'pt' ? 'Sinergia PCH Dual TEA+TDAH Consolidada 🧩⚡' : 'ASD + ADHD Dual Symphony Configured 🧩⚡',
    };

    onAddToast({
      type: 'level',
      title: lang === 'pt' ? 'Perfil Adaptativo Carregado' : 'Adaptive Profile Engaged',
      description: modeLabels[currentMode] || modeLabels.normal
    });
  }, [currentMode, lang]);

  // Render the specific custom home screen
  switch (currentMode) {
    case 'tdah':
      return (
        <HomeTDAH
          user={user}
          lang={lang}
          onNavigateToScreen={onNavigateToScreen}
          isLightTheme={isLightTheme}
          onToggleTheme={onToggleTheme}
          onAddToast={onAddToast}
          onOpenTuningPopover={onOpenTuningPopover}
        />
      );
    case 'autismo':
      return (
        <HomeAutismo
          user={user}
          lang={lang}
          onNavigateToScreen={onNavigateToScreen}
          isLightTheme={isLightTheme}
          onToggleTheme={onToggleTheme}
          onAddToast={onAddToast}
          onOpenTuningPopover={onOpenTuningPopover}
        />
      );
    case 'ansiedade':
      return (
        <HomeAnsiedade
          user={user}
          lang={lang}
          onNavigateToScreen={onNavigateToScreen}
          isLightTheme={isLightTheme}
          onToggleTheme={onToggleTheme}
          onAddToast={onAddToast}
          onOpenTuningPopover={onOpenTuningPopover}
        />
      );
    case 'idoso':
      return (
        <HomeIdoso
          user={user}
          lang={lang}
          onNavigateToScreen={onNavigateToScreen}
          isLightTheme={isLightTheme}
          onToggleTheme={onToggleTheme}
          onAddToast={onAddToast}
          onOpenTuningPopover={onOpenTuningPopover}
        />
      );
    case 'dislexia':
      return (
        <HomeDislexia
          user={user}
          lang={lang}
          onNavigateToScreen={onNavigateToScreen}
          isLightTheme={isLightTheme}
          onToggleTheme={onToggleTheme}
          onAddToast={onAddToast}
          onOpenTuningPopover={onOpenTuningPopover}
        />
      );
    case 'tea_tdah':
      return (
        <HomeTeaTdah
          user={user}
          lang={lang}
          onNavigateToScreen={onNavigateToScreen}
          isLightTheme={isLightTheme}
          onToggleTheme={onToggleTheme}
          onAddToast={onAddToast}
          onOpenTuningPopover={onOpenTuningPopover}
        />
      );
    case 'normal':
    default:
      return (
        <HomeNormal
          user={user}
          lang={lang}
          onNavigateToScreen={onNavigateToScreen}
          isLightTheme={isLightTheme}
          onToggleTheme={onToggleTheme}
          onAddToast={onAddToast}
          onOpenTuningPopover={onOpenTuningPopover}
        />
      );
  }
};
export default AdaptiveExperienceEngine;
