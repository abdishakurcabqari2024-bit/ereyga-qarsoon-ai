import React, { useState } from 'react';
import { X, Trophy, Share2, Check, RefreshCw } from 'lucide-react';
import type { GameStats, GuessResult, WordEntry } from '../types/game';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: GameStats;
  gameStatus: 'IN_PROGRESS' | 'WON' | 'LOST';
  targetWord?: WordEntry;
  guesses: GuessResult[];
  maxGuesses: number;
  onPlayAgain: () => void;
  lang: 'so' | 'en';
  seed: string;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
  gameStatus,
  targetWord,
  guesses,
  maxGuesses,
  onPlayAgain,
  lang,
  seed,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const winPercentage = stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;

  const handleShare = () => {
    let text = `🧠 Ereyga Qarsoon AI (ML Word Guess)\nSeed: ${seed}\n`;
    text += `Natiijo: ${gameStatus === 'WON' ? `${guesses.length}/${maxGuesses}` : 'X'}\n\n`;

    guesses.forEach((g) => {
      const row = g.evaluations
        .map((e) => {
          if (e.status === 'correct') return '🟩';
          if (e.status === 'present') return '🟨';
          return '⬛';
        })
        .join('');
      text += `${row} (${g.mlAffinity}%)\n`;
    });

    text += `\nKu cayaar: https://ereyga-qarsoon.vercel.app`;

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl relative text-slate-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Status Announcement if Game Over */}
        {gameStatus !== 'IN_PROGRESS' && targetWord && (
          <div className="text-center mb-5 pb-5 border-b border-slate-800">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full mb-3 shadow-lg">
              {gameStatus === 'WON' ? (
                <div className="w-full h-full rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                  <Trophy className="w-6 h-6 animate-bounce" />
                </div>
              ) : (
                <div className="w-full h-full rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                  <span className="text-xl font-bold">✕</span>
                </div>
              )}
            </div>

            <h3 className="text-xl font-black mb-1">
              {gameStatus === 'WON'
                ? lang === 'so'
                  ? 'Hambalyo! Waad Guulaysatay! 🎉'
                  : 'Victory! You Solved It! 🎉'
                : lang === 'so'
                ? 'Nasiib-darro! Fursadihii way dhamaadeen.'
                : 'Game Over! Out of Guesses.'}
            </h3>

            <div className="mt-2 text-sm text-slate-300">
              {lang === 'so' ? 'Ereyga Qarsoonaa wuxuu ahaa:' : 'The Mystery Word was:'}{' '}
              <span className="font-mono font-black text-emerald-400 text-lg uppercase tracking-wider">
                {targetWord.word}
              </span>
            </div>

            {targetWord.hintSo && (
              <p className="text-xs text-slate-400 mt-1 italic">"{targetWord.hintSo}"</p>
            )}
          </div>
        )}

        {/* Stats Title */}
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 text-center">
          {lang === 'so' ? 'Tirokoobka Cayaaraha' : 'Overall Statistics'}
        </h4>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-center">
            <div className="text-xl sm:text-2xl font-black font-mono text-white">{stats.played}</div>
            <div className="text-[10px] text-slate-400 uppercase mt-0.5">{lang === 'so' ? 'Cayaaray' : 'Played'}</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-center">
            <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">{winPercentage}%</div>
            <div className="text-[10px] text-slate-400 uppercase mt-0.5">{lang === 'so' ? 'Guulaystay' : 'Win %'}</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-center">
            <div className="text-xl sm:text-2xl font-black font-mono text-sky-400">{stats.currentStreak}</div>
            <div className="text-[10px] text-slate-400 uppercase mt-0.5">{lang === 'so' ? 'Xiriir' : 'Streak'}</div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-2.5 text-center">
            <div className="text-xl sm:text-2xl font-black font-mono text-amber-400">{stats.maxStreak}</div>
            <div className="text-[10px] text-slate-400 uppercase mt-0.5">{lang === 'so' ? 'Ugu Sareeyay' : 'Best'}</div>
          </div>
        </div>

        {/* Guess Distribution */}
        <div className="mb-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            {lang === 'so' ? 'Qaybinta Qiyaasaha (Guess Distribution)' : 'Guess Distribution'}
          </div>
          <div className="space-y-1.5 font-mono text-xs">
            {Array.from({ length: maxGuesses }).map((_, i) => {
              const count = stats.distribution[i + 1] || 0;
              const maxCount = Math.max(1, ...Object.values(stats.distribution));
              const pct = (count / maxCount) * 100;
              const isCurrentWinningRow = gameStatus === 'WON' && guesses.length === i + 1;

              return (
                <div key={i} className="flex items-center gap-2">
                  <span className="w-3 text-slate-400">{i + 1}</span>
                  <div className="flex-1 bg-slate-950 rounded-md overflow-hidden h-5 p-0.5 flex">
                    <div
                      className={`h-full rounded text-[11px] font-bold flex items-center justify-end px-1.5 transition-all ${
                        isCurrentWinningRow ? 'bg-emerald-500 text-slate-950' : 'bg-slate-700 text-white'
                      }`}
                      style={{ width: `${Math.max(8, pct)}%` }}
                    >
                      {count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex items-center gap-2">
          {gameStatus !== 'IN_PROGRESS' && (
            <button
              onClick={() => {
                onClose();
                onPlayAgain();
              }}
              className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-sky-600 hover:from-emerald-500 hover:to-sky-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 transition-all active:scale-95"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{lang === 'so' ? 'Cayaar Cusub' : 'Play Again'}</span>
            </button>
          )}

          <button
            onClick={handleShare}
            className="flex-1 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-400">{lang === 'so' ? 'La Koobiyeeyay!' : 'Copied!'}</span>
              </>
            ) : (
              <>
                <Share2 className="w-4 h-4 text-sky-400" />
                <span>{lang === 'so' ? 'La Wadaag Asxaabta' : 'Share Result'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
