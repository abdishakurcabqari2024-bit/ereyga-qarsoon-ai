import type { GameStats } from './game';

export interface UserBadge {
  id: string;
  nameSo: string;
  nameEn: string;
  descriptionSo: string;
  descriptionEn: string;
  icon: string;
  unlockedAt?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  level: number;
  xp: number;
  stats: GameStats;
  badges: string[]; // badge IDs
  createdAt: string;
  lastLogin: string;
}

export interface LeaderboardEntry {
  rank: number;
  id: string;
  username: string;
  avatar: string;
  level: number;
  xp: number;
  wins: number;
  winRate: number;
  maxStreak: number;
  isCurrentUser?: boolean;
}
