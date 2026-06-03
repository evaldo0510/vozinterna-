import { useMemo } from 'react';
import { NeurodivergentMode } from '../types';

export interface MotorAdaptativoConfig {
  accentColor: string;
  bgColor: string;
  cardBg: string;
  textColor: string;
  textSizing: string;
  textSpacing: string;
  lineHeight: string;
  borderRadius: string;
  animationSpeed: string;
  voiceRate: number;
  voicePitch: number;
  visualAtmosphere: string;
  micSensitivityBoost: boolean;
  accessibilityOptimized: boolean;
}

/**
 * Motor Adaptativo hook that maps user preferences (neurotype and emotional state)
 * to real-time style, accessibility, typography, and vocal configuration.
 */
export function useMotorAdaptativo(
  neuroMode: NeurodivergentMode = 'natural',
  currentFeeling?: string
): MotorAdaptativoConfig {
  return useMemo(() => {
    // 1. Core default configuration
    let config: MotorAdaptativoConfig = {
      accentColor: 'teal', // tailwind key or hex prefix code
      bgColor: 'from-[#080b14] to-[#04060c]',
      cardBg: 'bg-stone-900/40 border-stone-800/65',
      textColor: 'text-stone-100',
      textSizing: 'text-sm md:text-base',
      textSpacing: 'tracking-normal',
      lineHeight: 'leading-relaxed',
      borderRadius: 'rounded-2xl',
      animationSpeed: 'duration-300',
      voiceRate: 1.0,
      voicePitch: 1.0,
      visualAtmosphere: 'cosmic',
      micSensitivityBoost: false,
      accessibilityOptimized: false,
    };

    // 2. Shape adaptation based on neurodivergence (Neurotype)
    switch (neuroMode) {
      case 'adhd':
        config.accentColor = 'emerald-indigo';
        config.cardBg = 'bg-[#091515]/50 border-emerald-900/30';
        config.textSizing = 'text-xs md:text-sm'; // keeps layout compact to retain attention
        config.animationSpeed = 'duration-150'; // snap-fast interactive feedback
        // Slightly faster pacing to avoid user tracking mind-drift
        config.voiceRate = 1.15;
        config.voicePitch = 1.05;
        config.visualAtmosphere = 'pacing-pulses';
        break;

      case 'autism':
        // Soft soothing pastels, no flickering animations, low stimulus density
        config.accentColor = 'sky-indigo';
        config.bgColor = 'from-[#0a1128] to-[#040817]';
        config.cardBg = 'bg-slate-900/30 border-blue-950/30';
        config.textColor = 'text-blue-50';
        config.animationSpeed = 'duration-500'; // extremely slow transitions
        // Steady, soft, quiet delivery to avoid processing fatigue
        config.voiceRate = 0.85;
        config.voicePitch = 0.9;
        config.visualAtmosphere = 'indigo-aurora';
        config.accessibilityOptimized = true;
        break;

      case 'dyslexia':
        // Dyslexia friendly: spacious tracking, relaxed height, pastel warm ambers
        config.accentColor = 'amber-orange';
        config.bgColor = 'from-[#140f0c] to-[#0a0705]';
        config.cardBg = 'bg-stone-900/50 border-amber-950/20';
        config.textColor = 'text-[#faf8f5]';
        config.textSpacing = 'tracking-[0.16em]'; // extra spaced tracking
        config.lineHeight = 'leading-[1.85]'; // spacious height to prevent visual crowding
        config.voiceRate = 0.95;
        config.voicePitch = 1.0;
        config.visualAtmosphere = 'ambient-ember';
        break;

      case 'anxiety':
        // Safe, cradling tones. Slow breathing loops. Cool calming greens/teals.
        config.accentColor = 'teal';
        config.bgColor = 'from-[#041215] to-[#01080a]';
        config.cardBg = 'bg-[#092224]/30 border-teal-950/30';
        config.borderRadius = 'rounded-[2rem]'; // super soft pill and rounded elements
        config.animationSpeed = 'duration-[700ms]'; // very slow, calming breathing curves
        config.voiceRate = 0.78; // meditative slower breath tempo
        config.voicePitch = 0.88; // reassuring, comforting frequencies
        config.visualAtmosphere = 'breathing-ocean';
        break;

      case 'senior':
        // High contrast yellow/amber highlights, large readability typography
        config.accentColor = 'yellow-amber';
        config.bgColor = 'from-[#000000] to-[#0c0d12]';
        config.cardBg = 'bg-stone-900/90 border-amber-500/40';
        config.textColor = 'text-white font-semibold';
        config.textSizing = 'text-sm md:text-lg'; // large fonts for legibility
        config.textSpacing = 'tracking-[0.06em]';
        config.lineHeight = 'leading-[1.75]';
        config.voiceRate = 0.82; // slow and clear enunciations
        config.voicePitch = 0.95;
        config.visualAtmosphere = 'high-contrast-stable';
        config.accessibilityOptimized = true;
        break;

      case 'child':
        // Playful brighter soft teals and dynamic shapes
        config.accentColor = 'pink-teal';
        config.bgColor = 'from-[#160a2d] to-[#060212]';
        config.cardBg = 'bg-indigo-950/25 border-pink-500/10';
        config.borderRadius = 'rounded-full'; // playful round layouts
        config.voiceRate = 1.05;
        config.voicePitch = 1.15; // slightly higher and engaging pitch
        config.visualAtmosphere = 'cosmic-sparkles';
        break;

      case 'down':
        // High-recognition clear color schemes, massive safety padding
        config.accentColor = 'teal-yellow';
        config.cardBg = 'bg-stone-900/60 border-teal-500/30';
        config.textColor = 'text-teal-50 font-medium';
        config.textSizing = 'text-sm md:text-base';
        config.voiceRate = 0.85;
        config.voicePitch = 1.0;
        config.visualAtmosphere = 'stable-pulse';
        config.accessibilityOptimized = true;
        break;

      case 'gifted':
        // Dense layout, deep cosmos slate, snappy feedback
        config.accentColor = 'fuchsia-cyan';
        config.bgColor = 'from-[#070116] to-[#020008]';
        config.cardBg = 'bg-[#0f0426]/40 border-fuchsia-950/25';
        config.textSizing = 'text-xs md:text-sm';
        config.voiceRate = 1.25; // highly efficient information pacing
        config.voicePitch = 1.02;
        config.visualAtmosphere = 'fractal-field';
        break;

      case 'burnout':
        // Cozy forest/earth tones, zero pressure, soft dark modes
        config.accentColor = 'sage-gold';
        config.bgColor = 'from-[#0b0f0b] to-[#040604]';
        config.cardBg = 'bg-stone-900/30 border-green-950/20';
        config.textColor = 'text-stone-200';
        config.borderRadius = 'rounded-[2rem]';
        config.voiceRate = 0.8; // zero urgency
        config.voicePitch = 0.9;
        config.visualAtmosphere = 'rainy-forest';
        break;

      case 'grief':
        // Cocoon amber warm glow, nurturing and holding energy
        config.accentColor = 'warm-bronze';
        config.bgColor = 'from-[#140d12] to-[#0a0508]';
        config.cardBg = 'bg-[#181116]/40 border-pink-950/20';
        config.textColor = 'text-rose-50';
        config.voiceRate = 0.75; // very patient, comforting flow
        config.voicePitch = 0.85; // deep resonance
        config.visualAtmosphere = 'cozy-candle';
        break;

      default:
        // 'natural' / 'inclusive' defaults
        config.accentColor = 'teal';
        break;
    }

    // 3. Optional refinement based on current active emotional states/feelings
    if (currentFeeling) {
      const feeling = currentFeeling.toLowerCase();
      if (feeling.includes('anx') || feeling.includes('fear') || feeling.includes('medo') || feeling.includes('pân') || feeling.includes('pan')) {
        // High Anxiety/Panic State: slowdown voice and inject deep safety teal hues
        config.voiceRate = Math.min(config.voiceRate, 0.8);
        config.voicePitch = Math.min(config.voicePitch, 0.9);
        config.visualAtmosphere = 'breathing-ocean';
      } else if (feeling.includes('sad') || feeling.includes('tris') || feeling.includes('dep') || feeling.includes('chor')) {
        // Sad State: soft cocoon warm tones
        config.voiceRate = Math.min(config.voiceRate, 0.85);
        config.borderRadius = 'rounded-[1.75rem]';
        if (neuroMode === 'natural') {
          config.accentColor = 'warm-bronze';
        }
      } else if (feeling.includes('ang') || feeling.includes('raiv') || feeling.includes('irrit')) {
        // Anger/Irritation: stabilize immediately, lower rate, deep cooling colors
        config.voiceRate = Math.min(config.voiceRate, 0.85);
        config.accentColor = 'sky-indigo';
        config.visualAtmosphere = 'indigo-aurora';
      } else if (feeling.includes('joy') || feeling.includes('fel') || feeling.includes('rad') || feeling.includes('grat')) {
        // High joy/Gratitude: elevate pacing slightly, glowing vibrant highlights
        config.voiceRate = Math.max(config.voiceRate, 1.05);
        if (config.voiceRate < 1.3) {
          config.voiceRate = 1.08;
        }
      }
    }

    return config;
  }, [neuroMode, currentFeeling]);
}
