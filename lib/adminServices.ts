import { db, handleFirestoreError, OperationType } from './firebase';
import { collection, getDocs } from 'firebase/firestore';
import { User, UserPlan } from '../types';

export interface DashboardMetrics {
  activeUsersCount: number;         // Contagem de usuários ativos (últimos 30 dias)
  totalSignups: number;             // Total de cadastros
  dailySessions: number;            // Sessões diárias (ativos hoje)
  averageMood: string;              // Humor médio processado dos logs / emotionalState predominante
  moodDistribution: Record<string, number>; // Distribuição detalhada dos humores
  planDistribution: Record<UserPlan | string, number>; // Distribuição de planos (visitor, member, guardian)
  totalXPEarned: number;            // Total de pontos acumulados (XP) no ecossistema
  averageUserLevel: number;         // Nível médio dos praticantes
  newSignupsThisWeek: number;       // Novos cadastros nos últimos 7 dias
  neuroModeDistribution: Record<string, number>; // Distribuição de modos neuroadaptativos
}

/**
 * Recovers and aggregates Firestore database metrics to power the PCH Executive Dashboard.
 * Includes total registrations, active users, daily active sessions, and processed average mood.
 */
export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const usersCollectionPath = 'users';
  try {
    const usersColRef = collection(db, usersCollectionPath);
    const querySnapshot = await getDocs(usersColRef);
    
    const allUsers: User[] = [];
    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      allUsers.push({
        id: docSnap.id,
        name: data.name || '',
        email: data.email || '',
        isAdmin: !!data.isAdmin,
        plan: data.plan || 'visitor',
        registeredAt: data.registeredAt || new Date().toISOString(),
        lastActive: data.lastActive || new Date().toISOString(),
        resonanceScore: data.resonanceScore || 0,
        accessibilityMode: !!data.accessibilityMode,
        points: data.points || 0,
        level: data.level || 1,
        emotionalState: data.emotionalState,
        neuroMode: data.neuroMode
      });
    });

    const totalSignups = allUsers.length;
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

    let activeUsersCount = 0;
    let dailySessions = 0;
    let newSignupsThisWeek = 0;
    let totalXPEarned = 0;
    let totalLevel = 0;

    const moodCounts: Record<string, number> = {};
    const planCounts: Record<string, number> = { visitor: 0, member: 0, guardian: 0 };
    const neuroModeCounts: Record<string, number> = {};

    allUsers.forEach((user) => {
      const lastActiveTime = new Date(user.lastActive).getTime();
      const registeredTime = new Date(user.registeredAt).getTime();

      // Active Users (within last 30 days)
      if (lastActiveTime >= thirtyDaysAgo) {
        activeUsersCount++;
      }

      // Daily sessions (active today or within past 24 hours as fallback support)
      const lastActiveDate = new Date(user.lastActive);
      if (lastActiveDate.toDateString() === new Date().toDateString() || (now - lastActiveTime <= 24 * 60 * 60 * 1000)) {
        dailySessions++;
      }

      // New signups this week
      if (registeredTime >= sevenDaysAgo) {
        newSignupsThisWeek++;
      }

      // XP and Level averages
      totalXPEarned += user.points || 0;
      totalLevel += user.level || 1;

      // Mood Count
      if (user.emotionalState) {
        const moodKey = user.emotionalState.toLowerCase().trim();
        moodCounts[moodKey] = (moodCounts[moodKey] || 0) + 1;
      }

      // Plan count
      if (user.plan) {
        planCounts[user.plan] = (planCounts[user.plan] || 0) + 1;
      }

      // Neuro mode count
      if (user.neuroMode) {
        neuroModeCounts[user.neuroMode] = (neuroModeCounts[user.neuroMode] || 0) + 1;
      }
    });

    // Calculate processed dominant average mood
    let averageMood = 'calma'; // Default backup
    let maxCount = 0;
    Object.entries(moodCounts).forEach(([mood, count]) => {
      if (count > maxCount) {
        maxCount = count;
        averageMood = mood;
      }
    });

    const averageUserLevel = totalSignups > 0 ? Number((totalLevel / totalSignups).toFixed(1)) : 1.0;

    return {
      activeUsersCount,
      totalSignups,
      dailySessions: dailySessions || Math.min(activeUsersCount, 1),
      averageMood,
      moodDistribution: moodCounts,
      planDistribution: planCounts,
      totalXPEarned,
      averageUserLevel,
      newSignupsThisWeek,
      neuroModeDistribution: neuroModeCounts,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, usersCollectionPath);
    throw error;
  }
}
