import React, { useState, useMemo } from 'react';
import { Cpu, Search, GitBranch, BarChart2, Layers, CheckCircle, ArrowRight } from 'lucide-react';
import type { WordMLDataset, WordFeatures } from '../types/game';
import { extractFeatures, traverseDecisionTree } from '../ml/engine';

interface MLLaboratoryProps {
  dataset: WordMLDataset | null;
  lang: 'so' | 'en';
}

export const MLLaboratory: React.FC<MLLaboratoryProps> = ({ dataset, lang }) => {
  const [inputWord, setInputWord] = useState('algorithm');
  const metadata = dataset?.metadata;

  // Compute live features for input word
  const features: WordFeatures = useMemo(() => {
    return extractFeatures(inputWord || 'test');
  }, [inputWord]);

  // Traverse sample decision tree
  const treeResult = useMemo(() => {
    if (!metadata?.sampleDecisionTree) return null;
    return traverseDecisionTree(features, metadata.sampleDecisionTree);
  }, [features, metadata]);

  const sampleWords = ['robot', 'somalia', 'galaxy', 'quantum', 'nature', 'crystal', 'future', 'peace'];

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-6">
      {/* Hero Header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-purple-950/60 border border-indigo-800/40 p-4 sm:p-6 backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <Cpu className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {lang === 'so' ? 'Qolka Baaritaanka AI & Machine Learning' : 'Machine Learning Laboratory'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300">
              {lang === 'so'
                ? 'U fiirso sida ay u shaqeeyaan Random Forest & XGBoost algorithms-ka falanqaynaya ereyada.'
                : 'Inspect how Random Forest and XGBoost evaluate lexical attributes and classify word complexity.'}
            </p>
          </div>

          {/* Quick Metrics */}
          {metadata && (
            <div className="flex items-center gap-2 text-xs">
              <div className="bg-slate-900/90 border border-slate-700/60 rounded-xl px-3 py-2 text-center">
                <div className="text-[10px] text-slate-400">Random Forest</div>
                <div className="font-mono font-bold text-emerald-400">
                  {(metadata.rfAccuracy * 100).toFixed(1)}% Acc
                </div>
              </div>
              <div className="bg-slate-900/90 border border-slate-700/60 rounded-xl px-3 py-2 text-center">
                <div className="text-[10px] text-slate-400">XGBoost</div>
                <div className="font-mono font-bold text-sky-400">
                  {(metadata.xgbAccuracy * 100).toFixed(1)}% Acc
                </div>
              </div>
              <div className="bg-slate-900/90 border border-slate-700/60 rounded-xl px-3 py-2 text-center">
                <div className="text-[10px] text-slate-400">Dataset Words</div>
                <div className="font-mono font-bold text-amber-400">
                  {metadata.totalWords.toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Interactive Word Tester */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <label className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Search className="w-4 h-4 text-sky-400" />
            <span>{lang === 'so' ? 'Tijaabi Erey Kasta (Live Inspector):' : 'Test Any Word (Live Inspector):'}</span>
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] text-slate-400 mr-1">{lang === 'so' ? 'Tusaalooyin:' : 'Examples:'}</span>
            {sampleWords.map((w) => (
              <button
                key={w}
                onClick={() => setInputWord(w)}
                className="px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-xs font-mono text-slate-300 border border-slate-700/50 transition-colors"
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <div className="relative">
          <input
            type="text"
            value={inputWord}
            onChange={(e) => setInputWord(e.target.value.toLowerCase().replace(/[^a-z]/g, ''))}
            placeholder={lang === 'so' ? 'Qor erey halkan...' : 'Type a word here...'}
            maxLength={14}
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-3 text-lg font-mono font-bold text-white tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20"
          />
        </div>

        {/* 11 Extracted Features Grid */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-indigo-400" />
            <span>{lang === 'so' ? '11 Astaamood oo Xisaabeed (Extracted Features)' : '11 Linguistic Machine Learning Features'}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 uppercase">{lang === 'so' ? 'Dhererka' : 'Length'}</div>
              <div className="text-base font-mono font-bold text-sky-400">{features.length}</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 uppercase">{lang === 'so' ? 'Shaqal' : 'Vowels'}</div>
              <div className="text-base font-mono font-bold text-emerald-400">{features.vowels}</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 uppercase">{lang === 'so' ? 'Shibane' : 'Consonants'}</div>
              <div className="text-base font-mono font-bold text-indigo-400">{features.consonants}</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 uppercase">Entropy (H)</div>
              <div className="text-base font-mono font-bold text-purple-400">{features.entropy}</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 uppercase">Scrabble Score</div>
              <div className="text-base font-mono font-bold text-amber-400">{features.scrabble_score}</div>
            </div>
            <div className="bg-slate-950/70 border border-slate-800 p-2.5 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 uppercase">{lang === 'so' ? 'Is-xiga' : 'Cons. Cluster'}</div>
              <div className="text-base font-mono font-bold text-rose-400">{features.consonant_cluster}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decision Tree Branch Explorer */}
      {treeResult && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitBranch className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-slate-200">
                {lang === 'so' ? 'Socodka Geedka Go\'aanka (Decision Tree Path):' : 'Decision Tree Traversal Trace:'}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400">{lang === 'so' ? 'Heerka la Saadaaliyay:' : 'Predicted Tier:'}</span>
              <span className="font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {treeResult.tierName}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            {treeResult.path.map((step, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono"
              >
                <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-slate-300 font-bold">
                  {idx + 1}
                </span>
                <span className="text-indigo-400 font-semibold">{step.feature}</span>
                <span className="text-slate-500">:</span>
                <span className="text-slate-300">{step.decision}</span>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 ml-auto" />
              </div>
            ))}
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-600/30 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-emerald-200">
                {lang === 'so'
                  ? `Random Forest leaf node wuxuu ku soo gabagabeeyay heerka: "${treeResult.tierName}".`
                  : `Random Forest leaf node concluded prediction: "${treeResult.tierName}".`}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Feature Importance Comparison (RF vs XGBoost) */}
      {metadata && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 sm:p-5 space-y-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-amber-400" />
            <h3 className="text-sm font-bold text-slate-200">
              {lang === 'so'
                ? 'Miisaanka Astaamaha (Feature Importances: Random Forest vs XGBoost)'
                : 'Feature Importances: Random Forest vs XGBoost'}
            </h3>
          </div>

          <div className="space-y-3">
            {Object.keys(metadata.rfFeatureImportance).map((feat) => {
              const rfVal = metadata.rfFeatureImportance[feat] || 0;
              const xgbVal = metadata.xgbFeatureImportance[feat] || 0;
              const maxVal = 0.35;

              return (
                <div key={feat} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300 font-medium">{feat}</span>
                    <span className="text-slate-400 text-[11px]">
                      RF: {(rfVal * 100).toFixed(1)}% | XGB: {(xgbVal * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="space-y-1">
                    {/* RF bar */}
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-indigo-500 rounded-full"
                        style={{ width: `${Math.min(100, (rfVal / maxVal) * 100)}%` }}
                        title={`Random Forest: ${(rfVal * 100).toFixed(1)}%`}
                      />
                    </div>
                    {/* XGBoost bar */}
                    <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden flex">
                      <div
                        className="h-full bg-sky-400 rounded-full"
                        style={{ width: `${Math.min(100, (xgbVal / maxVal) * 100)}%` }}
                        title={`XGBoost: ${(xgbVal * 100).toFixed(1)}%`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-end gap-4 text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
              <span>Random Forest</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>XGBoost</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
