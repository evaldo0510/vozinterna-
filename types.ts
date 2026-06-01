
export enum SessionStatus {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  ENDED = 'ended',
  ERROR = 'error',
  LIMIT_REACHED = 'limit_reached'
}

export type Language = 'en' | 'pt' | 'es' | 'fr' | 'de' | 'it' | 'ja' | 'ru' | 'hi';
export type UserPlan = 'visitor' | 'member' | 'guardian';

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
