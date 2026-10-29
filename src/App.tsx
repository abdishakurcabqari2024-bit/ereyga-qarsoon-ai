import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { Navbar } from './components/Navbar';
import { GameBoard } from './components/GameBoard';
import { AIRadar } from './components/AIRadar';
import { VirtualKeyboard } from './components/VirtualKeyboard';
import { MLLaboratory } from './components/MLLaboratory';
import { StatsModal } from './components/StatsModal';
import { SeedModal } from './components/SeedModal';
import { HelpModal } from './components/HelpModal';
import { AuthModal } from './components/AuthModal';
import { ProfileModal } from './components/ProfileModal';
import { LeaderboardModal } from './components/LeaderboardModal';
import { loadWordDataset, pickTargetWord, getDailySeed, isValidWord } from './ml/dictionary';
import {
  evaluateGuessLetters,
  extractFeatures,
  calculateMLAffinity,
  generateAIHint,
} from './ml/engine';
import {
  playKeySound,
  playDeleteSound,
  playFlipSound,
  playWinSound,
  playLoseSound,
  playRadarPing,
  isSoundEnabled,
  setSoundEnabled,
} from './utils/sound';
import { getCurrentUser, logoutUser, recordGameResult } from './services/auth';
import type { WordMLDataset, WordEntry, GuessResult, GameStats, LetterStatus } from './types/game';
import type { UserProfile } from './types/auth';

const MAX_GUESSES = 6;
const DEFAULT_LENGTH = 5;

const INITIAL_STATS: GameStats = {
  played: 0,
  won: 0,
  currentStreak: 0,
  maxStreak: 0,
  distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  averageAffinity: 0,
};

export const App: React.FC = () => {
  // App Configurations & Preferences
  const [lang, setLang] = useState<'so' | 'en'>(() => {
    return (localStorage.getItem('ereyga_lang') as 'so' | 'en') || 'so';
  });
  const [soundOn, setSoundOn] = useState<boolean>(() => isSoundEnabled());
  const [activeTab, setActiveTab] = useState<'game' | 'lab'>('game');

  // Authentication State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => getCurrentUser());
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // Modals state
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSeedOpen, setIsSeedOpen] = useState(false);

  // Dataset & Word Selection
  const [dataset, setDataset] = useState<WordMLDataset | null>(null);
  const [seed, setSeed] = useState<string>(() => getDailySeed());
  const [isDaily, setIsDaily] = useState(true);
  const [wordLength, setWordLength] = useState(DEFAULT_LENGTH);
  const [difficultyTier, setDifficultyTier] = useState<number>(-1);
  const [targetWord, setTargetWord] = useState<WordEntry | null>(null);

  // Active Game State
  const [guesses, setGuesses] = useState<GuessResult[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [gameStatus, setGameStatus] = useState<'IN_PROGRESS' | 'WON' | 'LOST'>('IN_PROGRESS');
  const [isShaking, setIsShaking] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Statistics (Guest / LocalStorage fallback)
  const [stats, setStats] = useState<GameStats>(() => {
    const user = getCurrentUser();
    if (user && user.stats) return user.stats;
    try {
      const saved = localStorage.getItem('ereyga_stats');
      return saved ? JSON.parse(saved) : INITIAL_STATS;
    } catch {
      return INITIAL_STATS;
    }
  });

  // Show Toast
  const showToast = useCallback((msg: string, duration = 2800) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, duration);
  }, []);

  // Save Stats to LocalStorage and current user profile
  const updateStats = useCallback(
    (won: boolean, guessCount: number, wordTier: number, mlAffinity: number) => {
      // If user is logged in, record through Auth Service
      if (currentUser) {
        const result = recordGameResult({
          won,
          guessesCount: guessCount,
          wordTier,
          mlAffinity,
        });

        if (result.user) {
          setCurrentUser({ ...result.user });
          setStats(result.user.stats);

          if (result.leveledUp) {
            setTimeout(() => {
              showToast(
                lang === 'so'
                  ? `🎉 Hambalyo! Waxaad gaartay Heerka (Level) ${result.user?.level}! (+${result.earnedXp} XP)`
                  : `🎉 Level Up! You reached Level ${result.user?.level}! (+${result.earnedXp} XP)`,
                4000
              );
            }, 1000);
          } else if (result.earnedXp > 0) {
            setTimeout(() => {
              showToast(
                lang === 'so'
                  ? `⭐ Waxaad heshay +${result.earnedXp} XP!`
                  : `⭐ Earned +${result.earnedXp} XP!`,
                2500
              );
            }, 800);
          }

          if (result.newBadges.length > 0) {
            setTimeout(() => {
              const b = result.newBadges[0];
              showToast(
                lang === 'so'
                  ? `🏆 Koob Cusub oo la furay: ${b.icon} ${b.nameSo}!`
                  : `🏆 New Badge Unlocked: ${b.icon} ${b.nameEn}!`,
                4500
              );
            }, 2000);
          }
          return;
        }
      }

      // Guest stats fallback
      setStats((prev) => {
        const played = prev.played + 1;
        const totalWon = won ? prev.won + 1 : prev.won;
        const currentStreak = won ? prev.currentStreak + 1 : 0;
        const maxStreak = Math.max(prev.maxStreak, currentStreak);
        const distribution = { ...prev.distribution };
        if (won) {
          distribution[guessCount] = (distribution[guessCount] || 0) + 1;
        }

        const next = {
          played,
          won: totalWon,
          currentStreak,
          maxStreak,
          distribution,
          averageAffinity: prev.averageAffinity,
        };

        try {
          localStorage.setItem('ereyga_stats', JSON.stringify(next));
        } catch {
          // ignore
        }
        return next;
      });
    },
    [currentUser, lang, showToast]
  );

  // Initial Load of ML Dataset
  useEffect(() => {
    let isMounted = true;
    loadWordDataset().then((data) => {
      if (!isMounted) return;
      setDataset(data);
      const chosen = pickTargetWord(data.words, {
        wordLength,
        difficultyTier,
        seed: isDaily ? getDailySeed() : seed,
      });
      setTargetWord(chosen);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // Initialize or Reset Game
  const resetGame = useCallback(
    (newSeed = seed, newIsDaily = isDaily, newLength = wordLength, newTier = difficultyTier) => {
      if (!dataset) return;
      const effectiveSeed = newIsDaily ? getDailySeed() : newSeed;
      const chosen = pickTargetWord(dataset.words, {
        wordLength: newLength,
        difficultyTier: newTier,
        seed: effectiveSeed,
      });

      setSeed(newSeed);
      setIsDaily(newIsDaily);
      setWordLength(newLength);
      setDifficultyTier(newTier);
      setTargetWord(chosen);
      setGuesses([]);
      setCurrentGuess('');
      setGameStatus('IN_PROGRESS');
      setToastMessage(null);
    },
    [dataset, seed, isDaily, wordLength, difficultyTier]
  );

  // Toggle Language
  const handleToggleLang = () => {
    const nextLang = lang === 'so' ? 'en' : 'so';
    setLang(nextLang);
    localStorage.setItem('ereyga_lang', nextLang);
  };

  // Toggle Sound
  const handleToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
  };

  // Auth Callbacks
  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    if (user.stats && user.stats.played > 0) {
      setStats(user.stats);
    }
    showToast(
      lang === 'so'
        ? `Ku soo dhawoow, ${user.username}! 🎉`
        : `Welcome back, ${user.username}! 🎉`
    );
  };

  const handleLogout = () => {
    logoutUser();
    setCurrentUser(null);
    showToast(
      lang === 'so'
        ? 'Waad ka baxday koontadaada (Guest Mode)'
        : 'Logged out (Playing as Guest)'
    );
  };

  // Virtual & Physical Keyboard Letter Handlers
  const handleChar = useCallback(
    (char: string) => {
      if (gameStatus !== 'IN_PROGRESS') return;
      if (currentGuess.length < wordLength) {
        playKeySound();
        setCurrentGuess((prev) => prev + char.toLowerCase());
      }
    },
    [gameStatus, currentGuess.length, wordLength]
  );

  const handleDelete = useCallback(() => {
    if (gameStatus !== 'IN_PROGRESS') return;
    if (currentGuess.length > 0) {
      playDeleteSound();
      setCurrentGuess((prev) => prev.slice(0, -1));
    }
  }, [gameStatus, currentGuess.length]);

  const handleEnter = useCallback(() => {
    if (gameStatus !== 'IN_PROGRESS') return;

    if (currentGuess.length < wordLength) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
      showToast(
        lang === 'so'
          ? `Ereygu waa inuu ka koobnaadaa ${wordLength} xaraf!`
          : `Word must be ${wordLength} letters long!`
      );
      return;
    }

    if (!isValidWord(currentGuess)) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 400);
      showToast(
        lang === 'so'
          ? 'Ereygu kuma jiro qaamuuska ereyada!'
          : 'Word not recognized in dictionary!'
      );
      return;
    }

    if (!targetWord) return;

    // Evaluate Guess
    const evals = evaluateGuessLetters(currentGuess, targetWord.word);
    const guessFeats = extractFeatures(currentGuess);
    const { score: mlAffinity } = calculateMLAffinity(
      guessFeats,
      targetWord.features,
      dataset?.metadata?.rfFeatureImportance
    );

    const guessNum = guesses.length + 1;
    const aiHint = generateAIHint(guessNum, currentGuess, targetWord, mlAffinity);

    const newGuessResult: GuessResult = {
      word: currentGuess,
      evaluations: evals,
      mlAffinity,
      entropyCloseness: Math.abs(guessFeats.entropy - targetWord.features.entropy),
      aiHint,
      timestamp: Date.now(),
    };

    const nextGuesses = [...guesses, newGuessResult];
    setGuesses(nextGuesses);
    setCurrentGuess('');

    // Audio cue for tile reveal
    evals.forEach((_, idx) => {
      setTimeout(() => playFlipSound(idx), idx * 80);
    });

    // Check Win Condition
    const isWon = currentGuess.toLowerCase() === targetWord.word.toLowerCase();
    if (isWon) {
      setGameStatus('WON');
      updateStats(true, nextGuesses.length, targetWord.tier, mlAffinity);
      setTimeout(() => {
        playWinSound();
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#38bdf8', '#818cf8', '#f59e0b'],
        });
        setIsStatsOpen(true);
      }, 700);
      return;
    }

    // Check Loss Condition
    if (nextGuesses.length >= MAX_GUESSES) {
      setGameStatus('LOST');
      updateStats(false, nextGuesses.length, targetWord.tier, mlAffinity);
      setTimeout(() => {
        playLoseSound();
        setIsStatsOpen(true);
      }, 700);
      return;
    }

    // Radar ping sound on guess submission
    setTimeout(() => {
      playRadarPing();
    }, 450);
  }, [
    gameStatus,
    currentGuess,
    wordLength,
    targetWord,
    guesses,
    dataset,
    lang,
    showToast,
    updateStats,
  ]);

  // Keyboard letter color mapping
  const letterStatuses = useMemo(() => {
    const statuses: Record<string, LetterStatus> = {};
    guesses.forEach((g) => {
      g.evaluations.forEach((e) => {
        const char = e.letter.toLowerCase();
        const existing = statuses[char];

        if (e.status === 'correct') {
          statuses[char] = 'correct';
        } else if (e.status === 'present' && existing !== 'correct') {
          statuses[char] = 'present';
        } else if (e.status === 'absent' && !existing) {
          statuses[char] = 'absent';
        }
      });
    });
    return statuses;
  }, [guesses]);

  const latestGuess = guesses[guesses.length - 1];

  return (
    <div className="min-h-screen flex flex-col justify-between text-slate-100 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 border border-amber-500/50 text-amber-300 font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-xl shadow-amber-950/30 animate-pop">
          {toastMessage}
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        lang={lang}
        onToggleLang={handleToggleLang}
        soundOn={soundOn}
        onToggleSound={handleToggleSound}
        onOpenStats={() => setIsStatsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenSeed={() => setIsSeedOpen(true)}
        onResetGame={() => resetGame()}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        seed={seed}
        isDaily={isDaily}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center py-2 sm:py-4">
        {activeTab === 'game' ? (
          <div className="w-full max-w-xl flex flex-col items-center justify-center">
            {/* Machine Learning Radar Header */}
            <AIRadar
              latestGuess={latestGuess}
              targetWord={targetWord || undefined}
              lang={lang}
            />

            {/* Interactive Grid Tiles */}
            <GameBoard
              wordLength={wordLength}
              maxGuesses={MAX_GUESSES}
              guesses={guesses}
              currentGuess={currentGuess}
              isShaking={isShaking}
            />

            {/* Virtual Onscreen Keyboard */}
            <VirtualKeyboard
              onChar={handleChar}
              onEnter={handleEnter}
              onDelete={handleDelete}
              letterStatuses={letterStatuses}
              disabled={gameStatus !== 'IN_PROGRESS'}
            />
          </div>
        ) : (
          /* Machine Learning Laboratory & Inspector */
          <MLLaboratory dataset={dataset} lang={lang} />
        )}
      </main>

      {/* Footer Branding */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-2.5 px-4 text-center text-[11px] text-slate-400">
        <p>
          Powered by <span className="text-emerald-400 font-semibold">Random Forest</span> &{' '}
          <span className="text-sky-400 font-semibold">XGBoost</span> • Dataset:{' '}
          <span className="text-slate-400">Oxford 5K / Kaggle Lexical NLP</span> • Built with React & Tailwind CSS
        </p>
      </footer>

      {/* Modals */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        stats={stats}
        gameStatus={gameStatus}
        targetWord={targetWord || undefined}
        guesses={guesses}
        maxGuesses={MAX_GUESSES}
        onPlayAgain={() => resetGame()}
        lang={lang}
        seed={seed}
      />

      <SeedModal
        isOpen={isSeedOpen}
        onClose={() => setIsSeedOpen(false)}
        currentSeed={seed}
        isDaily={isDaily}
        wordLength={wordLength}
        difficultyTier={difficultyTier}
        onApplySettings={(newSeed, newIsDaily, newLen, newTier) => {
          resetGame(newSeed, newIsDaily, newLen, newTier);
        }}
        lang={lang}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        lang={lang}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onSuccess={handleAuthSuccess}
        lang={lang}
      />

      {/* User Profile Modal */}
      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        onLogout={handleLogout}
        lang={lang}
      />

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        lang={lang}
      />
    </div>
  );
};

export default App;
