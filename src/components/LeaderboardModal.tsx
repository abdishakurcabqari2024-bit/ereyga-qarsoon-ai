import React, { useMemo } from 'react';
import { X, Trophy, Crown, Flame } from 'lucide-react';
import { getLeaderboard } from '../services/auth';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'so' | 'en';
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({ isOpen, onClose, lang }) => {
  const leaderboard = useMemo(() => {
    return getLeaderboard();
  }, [isOpen]);

  if (!isOpen) return null;

  const getRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-xs font-bold shadow-sm shadow-amber-500/20">
          🥇
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-6 h-6 rounded-full bg-slate-400/20 text-slate-300 border border-slate-400/40 flex items-center justify-center text-xs font-bold">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-6 h-6 rounded-full bg-amber-700/20 text-amber-500 border border-amber-700/40 flex items-center justify-center text-xs font-bold">
          🥉
        </span>
      );
    }
    return (
      <span className="w-6 h-6 rounded-full bg-slate-900 text-slate-400 flex items-center justify-center text-xs font-mono font-semibold">
        #{rank}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl relative text-slate-100 my-6 max-h-[90vh] overflow-y-auto space-y-4">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 shadow-sm shadow-amber-500/20">
            <Trophy className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
              <span>{lang === 'so' ? 'Shaxda Guuleystayaasha (Leaderboard)' : 'Global Leaderboard'}</span>
              <Crown className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'so'
                ? 'Tartanka cayaartoyda ugu sarreysa dhanka dhibcaha XP iyo guulaha'
                : 'Top players ranked by player Level, XP points, and Win Rate'}
            </p>
          </div>
        </div>

        {/* Leaderboard Table / Cards */}
        <div className="space-y-2">
          {leaderboard.map((player) => (
            <div
              key={player.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                player.isCurrentUser
                  ? 'bg-sky-950/40 border-sky-500/50 shadow-md shadow-sky-950/30 ring-1 ring-sky-500/30'
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700/80'
              }`}
            >
              {/* Left: Rank & Avatar & Name */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="shrink-0">{getRankBadge(player.rank)}</div>
                <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-xl shrink-0">
                  {player.avatar}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white truncate">
                      {player.username}
                    </span>
                    {player.isCurrentUser && (
                      <span className="text-[10px] bg-sky-500/20 text-sky-300 px-1.5 py-0.2 rounded border border-sky-500/30 font-semibold">
                        {lang === 'so' ? 'Adiga' : 'You'}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span className="text-emerald-400 font-semibold">
                      Lvl {player.level}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-0.5">
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span>{player.wins} {lang === 'so' ? 'guul' : 'wins'}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: XP & Win Rate */}
              <div className="text-right shrink-0">
                <div className="font-mono font-bold text-amber-400 text-sm">
                  {player.xp.toLocaleString()} XP
                </div>
                <div className="text-[10px] text-slate-400">
                  {player.winRate}% {lang === 'so' ? 'guulo' : 'win rate'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
