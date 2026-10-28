import React from 'react';
import { Radar, Sparkles, Activity } from 'lucide-react';
import type { GuessResult, WordEntry } from '../types/game';

interface AIRadarProps {
  latestGuess?: GuessResult;
  targetWord?: WordEntry;
  lang: 'so' | 'en';
}

export const AIRadar: React.FC<AIRadarProps> = ({ latestGuess, targetWord, lang }) => {
  const affinity = latestGuess?.mlAffinity ?? 0;

  // Color mapping based on ML affinity
  const getAffinityColor = (score: number) => {
    if (score >= 80) return { text: 'text-emerald-400', bar: 'bg-emerald-500', glow: 'shadow-emerald-500/30', border: 'border-emerald-500/40' };
    if (score >= 55) return { text: 'text-amber-400', bar: 'bg-amber-500', glow: 'shadow-amber-500/30', border: 'border-amber-500/40' };
    return { text: 'text-sky-400', bar: 'bg-sky-500', glow: 'shadow-sky-500/30', border: 'border-sky-500/40' };
  };

  const colors = getAffinityColor(affinity);

  return (
    <div className="w-full max-w-xl mx-auto px-3 sm:px-0 mb-3">
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 backdrop-blur-md p-3.5 sm:p-4 shadow-xl">
        <div className="flex items-center justify-between gap-3 mb-2.5">
          {/* Header */}
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Radar className="w-4 h-4 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                  {lang === 'so' ? 'ML Radar & Sirdoonka AI' : 'ML Radar & AI Intelligence'}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono">
                  XGBoost + RF
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                {lang === 'so'
                  ? 'Cabirka u dhowaanshaha astaamaha xisaabeed ee erayga'
                  : 'Measures mathematical feature proximity to the target'}
              </p>
            </div>
          </div>

          {/* Target Tier Badge */}
          {targetWord && (
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-medium">
                {lang === 'so' ? 'Heerka Adkaanta:' : 'Target Tier:'}
              </span>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                {targetWord.tierName}
              </span>
            </div>
          )}
        </div>

        {/* Affinity Gauge Bar */}
        <div className="space-y-1.5 mb-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-slate-400" />
              {lang === 'so' ? 'U-Dhowaanshaha (Affinity Score):' : 'Lexical Affinity Score:'}
            </span>
            <span className={`font-mono font-bold text-sm ${colors.text}`}>
              {affinity > 0 ? `${affinity}%` : '--'}
            </span>
          </div>

          <div className="h-2.5 w-full bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className={`h-full rounded-full transition-all duration-700 ease-out ${colors.bar} ${colors.glow}`}
              style={{ width: `${Math.max(4, affinity)}%` }}
            />
          </div>
        </div>

        {/* AI Hint / Clue Box */}
        <div className="rounded-xl bg-slate-950/80 border border-slate-800/80 p-2.5 sm:p-3 flex items-start gap-2.5 text-left">
          <div className="mt-0.5 p-1 rounded-md bg-purple-500/10 text-purple-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs">
            <div className="text-[11px] font-semibold text-purple-300 mb-0.5 flex items-center gap-1">
              <span>{lang === 'so' ? 'Talooyinka Gargaaraha AI:' : 'AI Oracle Hint:'}</span>
            </div>
            <p className="text-slate-300 leading-relaxed font-sans">
              {latestGuess
                ? latestGuess.aiHint
                : lang === 'so'
                ? 'Geli qiyaastaada kowaad si uu Random Forest & XGBoost model-ku u bilaabo baaritaanka!'
                : 'Enter your first guess to trigger the Random Forest & XGBoost feature analysis!'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
