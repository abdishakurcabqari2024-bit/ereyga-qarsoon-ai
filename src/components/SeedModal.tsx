import React, { useState } from 'react';
import { X, KeyRound, Calendar, Shuffle, Check, Sparkles, Filter } from 'lucide-react';

interface SeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentSeed: string;
  isDaily: boolean;
  wordLength: number;
  difficultyTier: number;
  onApplySettings: (seed: string, isDaily: boolean, wordLength: number, difficultyTier: number) => void;
  lang: 'so' | 'en';
}

export const SeedModal: React.FC<SeedModalProps> = ({
  isOpen,
  onClose,
  currentSeed,
  isDaily,
  wordLength,
  difficultyTier,
  onApplySettings,
  lang,
}) => {
  const [selectedDaily, setSelectedDaily] = useState(isDaily);
  const [seedInput, setSeedInput] = useState(currentSeed);
  const [selectedLen, setSelectedLen] = useState(wordLength);
  const [selectedTier, setSelectedTier] = useState(difficultyTier);

  if (!isOpen) return null;

  const handleRandomSeed = () => {
    const rand = 'seed-' + Math.random().toString(36).substring(2, 8);
    setSeedInput(rand);
    setSelectedDaily(false);
  };

  const handleApply = () => {
    onApplySettings(
      selectedDaily ? 'daily' : seedInput.trim() || 'default-seed',
      selectedDaily,
      selectedLen,
      selectedTier
    );
    onClose();
  };

  const tiers = [
    { id: -1, nameSo: 'Dhammaan (All)', nameEn: 'All Tiers' },
    { id: 0, nameSo: 'Bilow (Easy - A1)', nameEn: 'Easy (A1)' },
    { id: 1, nameSo: 'Dhexe (Medium - B1)', nameEn: 'Medium (B1)' },
    { id: 2, nameSo: 'Adag (Hard - B2)', nameEn: 'Hard (B2)' },
    { id: 3, nameSo: 'Halbowle (Expert - C1)', nameEn: 'Expert (C1)' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl relative text-slate-100 space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              {lang === 'so' ? 'Habaynta Seed-ka & Cayaarta' : 'Seed & Puzzle Settings'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'so'
                ? 'La wadaag asxaabta isla seed-ka si aad isku erey u cayaartaan'
                : 'Seed-based deterministic gameplay for fair multiplayer challenges'}
            </p>
          </div>
        </div>

        {/* Seed Type Selection (Daily vs Custom) */}
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {lang === 'so' ? 'Nooca Cayaarta:' : 'Game Mode:'}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setSelectedDaily(true)}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                selectedDaily
                  ? 'bg-sky-500/20 border-sky-500/50 text-sky-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calendar className="w-4 h-4 text-sky-400" />
              <span>{lang === 'so' ? 'Ereyga Maanta (Daily)' : 'Daily Challenge'}</span>
            </button>

            <button
              onClick={() => setSelectedDaily(false)}
              className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all text-xs font-semibold ${
                !selectedDaily
                  ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>{lang === 'so' ? 'Seed Gaar ah (Custom)' : 'Custom Seed'}</span>
            </button>
          </div>
        </div>

        {/* Custom Seed Input */}
        {!selectedDaily && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400 font-medium">
                {lang === 'so' ? 'Qor Seed-kaaga ama Koodhka:' : 'Enter Room Seed:'}
              </span>
              <button
                onClick={handleRandomSeed}
                className="text-[11px] text-sky-400 hover:underline flex items-center gap-1"
              >
                <Shuffle className="w-3 h-3" />
                <span>{lang === 'so' ? 'Seed Bakhtiyaanasiib ah' : 'Random Seed'}</span>
              </button>
            </div>
            <input
              type="text"
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value)}
              placeholder="e.g. somali-ai-2026"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 font-mono text-sm font-semibold text-white focus:outline-none focus:border-purple-500"
            />
          </div>
        )}

        {/* Word Length Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
            {lang === 'so' ? 'Tirada Xarfaha Ereyga:' : 'Word Length:'}
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[4, 5, 6, 7].map((len) => (
              <button
                key={len}
                onClick={() => setSelectedLen(len)}
                className={`py-2 rounded-xl border font-mono font-bold text-sm transition-all ${
                  selectedLen === len
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {len} {lang === 'so' ? 'Xaraf' : 'Letters'}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Tier Selector */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>{lang === 'so' ? 'Heerka Adkaanta (ML Difficulty Tier):' : 'ML Difficulty Tier:'}</span>
          </label>
          <div className="grid grid-cols-1 gap-1.5">
            {tiers.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedTier(t.id)}
                className={`px-3 py-2 rounded-xl border text-left text-xs font-medium transition-all flex items-center justify-between ${
                  selectedTier === t.id
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-bold'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{lang === 'so' ? t.nameSo : t.nameEn}</span>
                {selectedTier === t.id && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <button
          onClick={handleApply}
          className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 to-emerald-600 hover:from-sky-500 hover:to-emerald-500 text-white font-bold text-sm shadow-lg shadow-sky-950/40 transition-all active:scale-95"
        >
          {lang === 'so' ? 'Keydi & Bilow Cayaarta' : 'Apply & Start Puzzle'}
        </button>
      </div>
    </div>
  );
};
