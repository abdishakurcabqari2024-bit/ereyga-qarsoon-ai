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
import type { WordMLDataset, WordEntry, GuessResult, GameStats, LetterStatus } from './types/game';

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

  // Statistics
  const [stats, setStats] = useState<GameStats>(() => {
    try {
      const saved = localStorage.getItem('ereyga_stats');
      return saved ? JSON.parse(saved) : INITIAL_STATS;
    } catch {
      return INITIAL_STATS;
    }
  });

  // Show Toast
  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  }, []);

  // Save Stats to LocalStorage
  const updateStats = useCallback((won: boolean, guessCount: number) => {
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
  }, []);

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
      updateStats(true, nextGuesses.length);
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
      updateStats(false, nextGuesses.length);
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
    </div>
  );
};

export default App;
