import React from 'react';
import { Sparkles, BarChart3, HelpCircle, Volume2, VolumeX, Cpu, RefreshCw, KeyRound, Globe } from 'lucide-react';

interface NavbarProps {
  lang: 'so' | 'en';
  onToggleLang: () => void;
  soundOn: boolean;
  onToggleSound: () => void;
  onOpenStats: () => void;
  onOpenHelp: () => void;
  onOpenSeed: () => void;
  onResetGame: () => void;
  activeTab: 'game' | 'lab';
  setActiveTab: (tab: 'game' | 'lab') => void;
  seed: string;
  isDaily: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onToggleLang,
  soundOn,
  onToggleSound,
  onOpenStats,
  onOpenHelp,
  onOpenSeed,
  onResetGame,
  activeTab,
  setActiveTab,
  seed,
  isDaily,
}) => {
  return (
    <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 py-2.5">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-emerald-400 p-[1.5px] shadow-lg shadow-sky-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-emerald-300 to-indigo-300">
                EREYGA QARSOON
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Cpu className="w-3 h-3" /> RF & XGBoost
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              {lang === 'so' ? 'Cayaarta Ereyga Qarsoon oo ay Hagayso Machine Learning' : 'ML-Powered Mystery Word Puzzle'}
            </p>
          </div>
        </div>

        {/* Center Mode Switcher */}
        <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('game')}
            className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold transition-all ${
              activeTab === 'game'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {lang === 'so' ? 'Cayaarta' : 'Game'}
          </button>
          <button
            onClick={() => setActiveTab('lab')}
            className={`px-2.5 sm:px-3 py-1 rounded-md text-xs font-semibold transition-all flex items-center gap-1 ${
              activeTab === 'lab'
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>ML Lab</span>
          </button>
        </div>

        {/* Actions Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Seed indicator */}
          <button
            onClick={onOpenSeed}
            title={lang === 'so' ? 'Beddel Seed-ka / Heerka' : 'Change Seed / Difficulty'}
            className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/50 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline font-mono">
              {isDaily ? (lang === 'so' ? 'Maalinle' : 'Daily') : seed.slice(0, 7)}
            </span>
          </button>

          {/* Reset / New Game */}
          <button
            onClick={onResetGame}
            title={lang === 'so' ? 'Cayaar Cusub' : 'New Game'}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-emerald-400" />
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            title="Switch Language (Somali / English)"
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-xs font-semibold transition-colors border border-slate-700/50"
          >
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span>{lang.toUpperCase()}</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            title={soundOn ? 'Codka xir (Mute)' : 'Codka fur (Unmute)'}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition-colors"
          >
            {soundOn ? <Volume2 className="w-4 h-4 text-sky-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          </button>

          {/* Stats Button */}
          <button
            onClick={onOpenStats}
            title={lang === 'so' ? 'Natiijooyinka' : 'Statistics'}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition-colors"
          >
            <BarChart3 className="w-4 h-4 text-indigo-400" />
          </button>

          {/* Help Button */}
          <button
            onClick={onOpenHelp}
            title={lang === 'so' ? 'Sida loo cayaaro' : 'How to Play'}
            className="p-1.5 sm:p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>
    </header>
  );
};
