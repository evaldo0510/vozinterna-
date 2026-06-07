
export enum SessionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ENDED = 'ended',
  ERROR = 'error',
  LIMIT_REACHED = 'limit_reached'
}

export type Language = 'en' | 'pt' | 'es' | 'fr' | 'de' | 'it' | 'ja' | 'ru' | 'hi';
export type UserPlan = 'visitor' | 'member' | 'guardian';

export type NeurodivergentMode = 'natural' | 'adhd' | 'autism' | 'dyslexia' | 'anxiety' | 'inclusive' | 'down' | 'senior' | 'child' | 'gifted' | 'burnout' | 'grief';

export type NeuroMode = 'normal' | 'tdah' | 'autismo' | 'ansiedade' | 'idoso' | 'dislexia' | 'tea_tdah';

export interface GardenPlant {
  id: string;
  type: 'flower' | 'tree' | 'shrub' | 'succulent' | 'fern' | 'flower2';
  name: string;
  stage: number; // 0: Seed/Semente (🌱), 1: Sprout/Broto (🌿), 2: Plant/Planta (☘️), 3: Mature/Arvore ou Flor Completa (🌻/🌳)
  color: string;
  createdAt: string;
  lastWatered: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  plan: UserPlan;
  registeredAt: string;
  lastActive: string;
  resonanceScore: number;
  accessibilityMode: boolean; // Novo: Modo para Autismo/Down
  resonanceHistory?: { date: string; score: number }[];
  points?: number;
  level?: number;
  avatar?: string;
  communicationPreference?: 'voice' | 'text' | 'image' | 'hybrid';
  neuroMode?: NeuroMode | NeurodivergentMode;
  seekingGoal?: string;
  emotionalState?: string;
  manifestoStep?: number;
  manifestoCompleted?: boolean;
  profileCompleted?: boolean;
  hasSeenOnboarding?: boolean;
  badges?: string[];
}

export interface SessionHistoryItem {
  date: string;
  duration: number;
}

// Fix: Added missing types to resolve import errors in Visualizer, ChatArea, Modals, ConfigPanel, and GamificationLayer
export type ThemeName = 'neutral' | 'reflective' | 'heavy' | 'light';

export enum MessageRole {
  USER = 'user',
  MODEL = 'model'
}

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  imageUrl?: string;
  isError?: boolean;
}

export interface GamificationEvent {
  id: string;
  type: 'points' | 'badge' | 'mission';
  value: string | number;
}

// Inner Garden structure
export interface InnerGarden {
  id: string;
  userId: string;
  plants: GardenPlant[];
  waterPoints: number;
  lastUpdated: string;
}

// Inner Harmony Index (ISI) / Índice de Sintonia Interior
export interface InnerHarmonyIndex {
  id: string;
  userId: string;
  score: number; // 0 to 100 index
  date: string; // ISO String
  emotionalState: string;
  neurotype: NeurodivergentMode;
  resonanceMetrics: {
    attention: number;
    calm: number;
    connection: number;
  };
}

// Diary Logs / Registros de Diário
export interface DiaryLog {
  id: string;
  userId: string;
  date: string; // ISO String
  feeling: string;
  note: string;
  neuroMode: NeurodivergentMode;
  isiScore: number;
  poeticPrompt?: string;
}

// Accessibility Settings / Configurações de Acessibilidade
export interface AccessibilitySettings {
  highContrast: boolean;
  largeFont: boolean;
  simplifiedLanguage: boolean;
  screenReaderOptimized: boolean;
  subtitlesEnabled: boolean;
  inputMethod: 'voice' | 'text' | 'hybrid';
}

export type NeuroProfileType = 'normal' | 'tdah' | 'autismo' | 'ansiedade' | 'burnout' | 'idoso' | 'adolescente' | 'luto' | 'cristao';

export interface UserNeuroProfile {
  id?: string;
  userId: string;
  neuroType: NeuroProfileType;
  adaptations: {
    themeColor: string;
    fontSize: string;
    animationSpeed: 'normal' | 'slow' | 'none' | 'fast';
    languageTone: string;
    focusModePriority: boolean;
  };
  preferredLanguage: string;
  accessibilityLevel: string;
  currentJourney: string;
  currentLevel: number;
  lastInteraction: string; // ISO date-time
  evolutionHistory: Array<{
    date: string;
    pointsGained: number;
    activity: string;
    moodState?: string;
    alignmentPercent: number;
  }>;
}


