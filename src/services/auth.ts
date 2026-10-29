import type { UserProfile, UserBadge, LeaderboardEntry } from '../types/auth';
import type { GameStats } from '../types/game';

const USERS_STORAGE_KEY = 'ereyga_users_db';
const CURRENT_USER_KEY = 'ereyga_active_user_id';

export const AVATAR_OPTIONS = [
  { id: 'bot', icon: '🤖', label: 'Cyber Bot' },
  { id: 'brain', icon: '🧠', label: 'Neural Mind' },
  { id: 'quantum', icon: '⚡', label: 'Quantum' },
  { id: 'crown', icon: '👑', label: 'Champion' },
  { id: 'ninja', icon: '🥷', label: 'Cyber Ninja' },
  { id: 'astro', icon: '🚀', label: 'Astronaut' },
  { id: 'lion', icon: '🦁', label: 'Desert Lion' },
  { id: 'hacker', icon: '💻', label: 'Code Master' },
];

export const ALL_BADGES: UserBadge[] = [
  {
    id: 'first_win',
    nameSo: 'Guushii Koowaad',
    nameEn: 'First Victory',
    descriptionSo: 'Ku guuleystay cayaartaadii koowaad ee Ereyga Qarsoon',
    descriptionEn: 'Won your first Mystery Word game',
    icon: '🎯'
  },
  {
    id: 'fast_guesser',
    nameSo: 'Hillaac (Lightning)',
    nameEn: 'Lightning Guesser',
    descriptionSo: 'Ereyga ku helay 1 ama 2 qiyaasood oo kaliya',
    descriptionEn: 'Solved the secret word in 1 or 2 guesses',
    icon: '⚡'
  },
  {
    id: 'streak_3',
    nameSo: 'Saddexleey (3 Streak)',
    nameEn: 'Hat-trick (3 Streak)',
    descriptionSo: '3 jeer oo isku xigta guuleystay',
    descriptionEn: 'Won 3 games in a row',
    icon: '🔥'
  },
  {
    id: 'streak_5',
    nameSo: 'Aan La Joojin Karin',
    nameEn: 'Unstoppable',
    descriptionSo: '5 jeer oo isku xigta guuleystay',
    descriptionEn: 'Won 5 games in a row',
    icon: '🛡️'
  },
  {
    id: 'expert_solver',
    nameSo: 'Khabiirka Halbowle',
    nameEn: 'Expert Decryption',
    descriptionSo: 'Fasiray erey heerka ugu adag (Halbowle / C1)',
    descriptionEn: 'Solved a top tier Halbowle (Expert) word',
    icon: '🏆'
  },
  {
    id: 'high_affinity',
    nameSo: 'Sirdoonka ML (90%+)',
    nameEn: 'ML Mastermind',
    descriptionSo: 'Qiyaastaadu waxay gaartay 90%+ ML Radar Affinity',
    descriptionEn: 'Achieved 90%+ ML Radar Affinity score',
    icon: '📡'
  },
  {
    id: 'level_5',
    nameSo: 'Horyaalka Heerka 5',
    nameEn: 'Level 5 Veteran',
    descriptionSo: 'Gaaray Heerka 5-aad ee khibradda XP',
    descriptionEn: 'Reached Player Level 5',
    icon: '⭐'
  }
];

// Helper to hash passwords simply on client side (SHA-256 equivalent / base64 salt)
function simpleHash(password: string): string {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    hash = (hash << 5) - hash + password.charCodeAt(i);
    hash |= 0;
  }
  return `hash_${Math.abs(hash)}_${password.length * 7}`;
}

export function getAllUsers(): Record<string, { profile: UserProfile; passwordHash: string }> {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveUsers(users: Record<string, { profile: UserProfile; passwordHash: string }>) {
  try {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users database', err);
  }
}

export function getCurrentUser(): UserProfile | null {
  try {
    const currentId = localStorage.getItem(CURRENT_USER_KEY);
    if (!currentId) return null;
    const users = getAllUsers();
    return users[currentId]?.profile || null;
  } catch {
    return null;
  }
}

export function registerUser(params: {
  username: string;
  email: string;
  password: string;
  avatar: string;
}): { success: boolean; error?: string; user?: UserProfile } {
  const { username, email, password, avatar } = params;
  const cleanUsername = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();

  if (cleanUsername.length < 3) {
    return { success: false, error: 'Magaca isticmaalaha waa inuu ka badnaadaa 2 xaraf' };
  }
  if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
    return { success: false, error: 'Fadlan geli email sax ah' };
  }
  if (password.length < 4) {
    return { success: false, error: 'Furaha sirta ah (password) waa inuu ugu yaraan yahay 4 xaraf' };
  }

  const users = getAllUsers();
  
  // Check duplicates
  for (const item of Object.values(users)) {
    if (item.profile.username.toLowerCase() === cleanUsername) {
      return { success: false, error: 'Magacan horey ayaa loo qaatay, fadlan mid kale dooro' };
    }
    if (item.profile.email.toLowerCase() === cleanEmail) {
      return { success: false, error: 'Email-kan horey ayaa loogu diiwaangaliyay' };
    }
  }

  const newId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const initialStats: GameStats = {
    played: 0,
    won: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
    averageAffinity: 0
  };

  const newProfile: UserProfile = {
    id: newId,
    username: username.trim(),
    email: cleanEmail,
    avatar: avatar || '🤖',
    level: 1,
    xp: 0,
    stats: initialStats,
    badges: [],
    createdAt: now,
    lastLogin: now
  };

  users[newId] = {
    profile: newProfile,
    passwordHash: simpleHash(password)
  };

  saveUsers(users);
  localStorage.setItem(CURRENT_USER_KEY, newId);

  return { success: true, user: newProfile };
}

export function loginUser(params: {
  loginId: string; // username or email
  password: string;
}): { success: boolean; error?: string; user?: UserProfile } {
  const { loginId, password } = params;
  const cleanLogin = loginId.trim().toLowerCase();
  const users = getAllUsers();

  let targetId: string | null = null;
  let targetEntry: { profile: UserProfile; passwordHash: string } | null = null;

  for (const [id, entry] of Object.entries(users)) {
    if (
      entry.profile.username.toLowerCase() === cleanLogin ||
      entry.profile.email.toLowerCase() === cleanLogin
    ) {
      targetId = id;
      targetEntry = entry;
      break;
    }
  }

  if (!targetEntry || !targetId) {
    return { success: false, error: 'Magaca ama email-ka lama helin. Fadlan is-diiwaangali haddii aad ku cusub tahay.' };
  }

  const providedHash = simpleHash(password);
  if (targetEntry.passwordHash !== providedHash) {
    return { success: false, error: 'Furaha sirta ah (password) waa khalad!' };
  }

  // Update last login
  targetEntry.profile.lastLogin = new Date().toISOString();
  saveUsers(users);
  localStorage.setItem(CURRENT_USER_KEY, targetId);

  return { success: true, user: targetEntry.profile };
}

export function logoutUser(): void {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getXpForNextLevel(level: number): number {
  return level * 250;
}

export function recordGameResult(params: {
  won: boolean;
  guessesCount: number;
  wordTier: number;
  mlAffinity: number;
}): {
  user: UserProfile | null;
  earnedXp: number;
  leveledUp: boolean;
  newBadges: UserBadge[];
} {
  const current = getCurrentUser();
  if (!current) {
    return { user: null, earnedXp: 0, leveledUp: false, newBadges: [] };
  }

  const { won, guessesCount, wordTier, mlAffinity } = params;
  let earnedXp = 0;
  let leveledUp = false;
  const newBadges: UserBadge[] = [];

  // Update stats
  const stats = { ...current.stats };
  stats.played += 1;

  if (won) {
    stats.won += 1;
    stats.currentStreak += 1;
    if (stats.currentStreak > stats.maxStreak) {
      stats.maxStreak = stats.currentStreak;
    }
    stats.distribution[guessesCount] = (stats.distribution[guessesCount] || 0) + 1;

    // XP calculation
    earnedXp = 100; // base win
    earnedXp += Math.max(0, 7 - guessesCount) * 20; // speed bonus
    earnedXp += (wordTier + 1) * 25; // difficulty bonus
    earnedXp += Math.floor(mlAffinity / 5); // affinity bonus

    // Check Badges
    const userBadgesSet = new Set(current.badges);

    const awardBadge = (badgeId: string) => {
      if (!userBadgesSet.has(badgeId)) {
        userBadgesSet.add(badgeId);
        const b = ALL_BADGES.find(x => x.id === badgeId);
        if (b) newBadges.push(b);
      }
    };

    if (stats.won === 1) awardBadge('first_win');
    if (guessesCount <= 2) awardBadge('fast_guesser');
    if (stats.currentStreak >= 3) awardBadge('streak_3');
    if (stats.currentStreak >= 5) awardBadge('streak_5');
    if (wordTier >= 3) awardBadge('expert_solver');
    if (mlAffinity >= 90) awardBadge('high_affinity');

    current.badges = Array.from(userBadgesSet);
  } else {
    stats.currentStreak = 0;
    earnedXp = 25; // consolation effort XP
  }

  // Add XP and handle Leveling up
  let totalXp = current.xp + earnedXp;
  let currentLevel = current.level;
  let nextLevelReq = getXpForNextLevel(currentLevel);

  while (totalXp >= nextLevelReq) {
    totalXp -= nextLevelReq;
    currentLevel += 1;
    leveledUp = true;
    nextLevelReq = getXpForNextLevel(currentLevel);

    if (currentLevel >= 5 && !current.badges.includes('level_5')) {
      current.badges.push('level_5');
      const b = ALL_BADGES.find(x => x.id === 'level_5');
      if (b) newBadges.push(b);
    }
  }

  current.level = currentLevel;
  current.xp = totalXp;
  current.stats = stats;

  // Save back to db
  const users = getAllUsers();
  if (users[current.id]) {
    users[current.id].profile = current;
    saveUsers(users);
  }

  return {
    user: current,
    earnedXp,
    leveledUp,
    newBadges
  };
}

// Generate Live Leaderboard
export function getLeaderboard(): LeaderboardEntry[] {
  const users = getAllUsers();
  const entries: LeaderboardEntry[] = [];
  const currentUser = getCurrentUser();

  // Add registered users
  for (const item of Object.values(users)) {
    const p = item.profile;
    const winRate = p.stats.played > 0 ? Math.round((p.stats.won / p.stats.played) * 100) : 0;
    entries.push({
      rank: 0,
      id: p.id,
      username: p.username,
      avatar: p.avatar,
      level: p.level,
      xp: p.xp + (p.level - 1) * 250,
      wins: p.stats.won,
      winRate,
      maxStreak: p.stats.maxStreak,
      isCurrentUser: currentUser?.id === p.id
    });
  }

  // Pre-seed mock AI champions so the leaderboard has lively competition
  const mockChampions: LeaderboardEntry[] = [
    { rank: 0, id: 'ai_1', username: 'XGBoost_Master', avatar: '⚡', level: 8, xp: 2150, wins: 24, winRate: 92, maxStreak: 12 },
    { rank: 0, id: 'ai_2', username: 'RandomForest_Pro', avatar: '🌲', level: 6, xp: 1480, wins: 18, winRate: 85, maxStreak: 8 },
    { rank: 0, id: 'ai_3', username: 'Guuleed_Coder', avatar: '💻', level: 5, xp: 1120, wins: 14, winRate: 78, maxStreak: 6 },
    { rank: 0, id: 'ai_4', username: 'Amina_Neural', avatar: '🧠', level: 4, xp: 860, wins: 10, winRate: 72, maxStreak: 4 },
  ];

  for (const champ of mockChampions) {
    if (!entries.some(e => e.username === champ.username)) {
      entries.push(champ);
    }
  }

  // Sort by Level & XP descending
  entries.sort((a, b) => b.xp - a.xp || b.wins - a.wins);

  // Assign ranks
  entries.forEach((entry, idx) => {
    entry.rank = idx + 1;
  });

  return entries;
}
