import React from 'react';
import { X, LogOut, Award, Zap, Calendar } from 'lucide-react';
import { ALL_BADGES, getXpForNextLevel } from '../services/auth';
import type { UserProfile } from '../types/auth';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onLogout: () => void;
  lang: 'so' | 'en';
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  onLogout,
  lang,
}) => {
  if (!isOpen || !user) return null;

  const nextLevelXp = getXpForNextLevel(user.level);
  const xpPercent = Math.min(100, Math.round((user.xp / nextLevelXp) * 100));
  const winRate =
    user.stats.played > 0
      ? Math.round((user.stats.won / user.stats.played) * 100)
      : 0;

  const userBadgesSet = new Set(user.badges);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl relative text-slate-100 my-6 max-h-[90vh] overflow-y-auto space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Profile Card Header */}
        <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-sky-950/40 via-indigo-950/30 to-purple-950/40 border border-sky-800/30">
          <div className="w-16 h-16 rounded-2xl bg-slate-950/80 border-2 border-sky-500/40 flex items-center justify-center text-4xl shadow-lg shadow-sky-950/40 shrink-0">
            {user.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-white truncate">{user.username}</h3>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                Lvl {user.level}
              </span>
            </div>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>
                {lang === 'so' ? 'Ku biiray:' : 'Joined:'}{' '}
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Level & XP Progress */}
        <div className="bg-slate-950/70 border border-slate-800 p-3.5 rounded-xl space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-300 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>
                {lang === 'so'
                  ? `Heerka ${user.level} Progress`
                  : `Level ${user.level} Progress`}
              </span>
            </span>
            <span className="font-mono font-bold text-amber-400">
              {user.xp} / {nextLevelXp} XP ({xpPercent}%)
            </span>
          </div>
          <div className="h-2.5 w-full bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500 shadow-sm shadow-amber-500/30"
              style={{ width: `${Math.max(4, xpPercent)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-400">
            {lang === 'so'
              ? `Waxaa kuu dhiman ${nextLevelXp - user.xp} XP si aad u gaarto Heerka ${user.level + 1}`
              : `${nextLevelXp - user.xp} XP remaining to reach Level ${user.level + 1}`}
          </p>
        </div>

        {/* Career Summary Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              {lang === 'so' ? 'Guulo' : 'Wins'}
            </div>
            <div className="text-xl font-black font-mono text-emerald-400 mt-0.5">
              {user.stats.won}
            </div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              {lang === 'so' ? 'Boqolley' : 'Win %'}
            </div>
            <div className="text-xl font-black font-mono text-sky-400 mt-0.5">
              {winRate}%
            </div>
          </div>
          <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 text-center">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">
              {lang === 'so' ? 'Streak Sare' : 'Best Streak'}
            </div>
            <div className="text-xl font-black font-mono text-amber-400 mt-0.5">
              {user.stats.maxStreak}
            </div>
          </div>
        </div>

        {/* Badges / Achievements Section */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-purple-400" />
              <span>
                {lang === 'so' ? 'Koobabka & Astaamaha (Badges)' : 'Career Badges & Achievements'}
              </span>
            </h4>
            <span className="text-[11px] font-mono text-slate-400">
              {user.badges.length} / {ALL_BADGES.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {ALL_BADGES.map((b) => {
              const isUnlocked = userBadgesSet.has(b.id);
              return (
                <div
                  key={b.id}
                  className={`p-2.5 rounded-xl border flex items-start gap-2.5 transition-all ${
                    isUnlocked
                      ? 'bg-slate-950/80 border-purple-500/40 text-slate-200 shadow-sm'
                      : 'bg-slate-950/30 border-slate-800/60 text-slate-500 opacity-50'
                  }`}
                >
                  <div className="text-2xl shrink-0 p-1 rounded-lg bg-slate-900 border border-slate-800">
                    {isUnlocked ? b.icon : '🔒'}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-200">
                      {lang === 'so' ? b.nameSo : b.nameEn}
                    </div>
                    <div className="text-[10px] text-slate-400 line-clamp-2 leading-tight mt-0.5">
                      {lang === 'so' ? b.descriptionSo : b.descriptionEn}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Logout Button */}
        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{lang === 'so' ? 'Ka Bax Koontada (Logout)' : 'Sign Out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
