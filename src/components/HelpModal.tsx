import React from 'react';
import { X, HelpCircle, Sparkles, CheckCircle2, Cpu, KeyRound } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: 'so' | 'en';
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, lang }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl relative text-slate-100 my-8 space-y-4 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-slate-800 pb-3">
          <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-white">
              {lang === 'so' ? 'Sida Loo Cayaaro Ereyga Qarsoon AI' : 'How to Play ML Secret Word'}
            </h3>
            <p className="text-xs text-slate-400">
              {lang === 'so' ? 'Qawaaniinta cayaarta iyo sida Machine Learning kuugu caawinayo' : 'Game rules and how Machine Learning assists your guesses'}
            </p>
          </div>
        </div>

        {/* Basic Rules */}
        <div className="space-y-2 text-xs sm:text-sm text-slate-300">
          <p>
            {lang === 'so'
              ? 'Ujeedadaadu waa inaad qiyaasto ereyga qarsoon adigoo haysta 6 fursadood.'
              : 'Your goal is to guess the secret mystery word within 6 attempts.'}
          </p>
          <p>
            {lang === 'so'
              ? 'Qiyaas kasta ka dib, midabada foornooyinka (tiles) ayaa isbadalaya si ay kuugu sheegaan sida aad ugu dhowdahay:'
              : 'After each guess, the tile colors will change to show how close your guess was:'}
          </p>
        </div>

        {/* Color Code Demonstration */}
        <div className="space-y-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono text-xs">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center font-bold text-white text-base">
              W
            </span>
            <span className="text-slate-300">
              {lang === 'so'
                ? 'CAGAAR (Sax): Xarafku wuxuu ku jiraa ereyga, waana booska saxda ah.'
                : 'GREEN (Correct): Letter is in the word and in the correct position.'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-amber-600 flex items-center justify-center font-bold text-white text-base">
              A
            </span>
            <span className="text-slate-300">
              {lang === 'so'
                ? 'HURDI (Jiro): Xarafku wuxuu ku jiraa ereyga, laakiin boos khaldan ayuu ku jiraa.'
                : 'YELLOW (Present): Letter is in the word but in the wrong position.'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-400 text-base">
              T
            </span>
            <span className="text-slate-400">
              {lang === 'so'
                ? 'CIIL/GRAY (Ma jiro): Xarafku kuma jiro ereyga qarsoon gabi ahaanba.'
                : 'GRAY (Absent): Letter is not in the secret word at all.'}
            </span>
          </div>
        </div>

        {/* ML Feature Explanation */}
        <div className="space-y-2.5 pt-2 border-t border-slate-800">
          <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
            <Cpu className="w-4 h-4" />
            <span>{lang === 'so' ? 'Awoodda Machine Learning (Random Forest & XGBoost)' : 'Machine Learning Engine'}</span>
          </div>

          <div className="grid grid-cols-1 gap-2 text-xs text-slate-300">
            <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-900/40 space-y-1">
              <div className="font-bold text-indigo-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>ML Affinity Radar (XGBoost)</span>
              </div>
              <p className="text-slate-400">
                {lang === 'so'
                  ? 'Kuma eka kaliya xarfaha Wordle; XGBoost model-ku wuxuu xisaabiyaa isu-dhowaanshaha astaamaha (Entropy, Scrabble value, Consonant clusters) si uu kuu siiyo boqolleyda (0-100%).'
                  : 'Beyond letter matches, XGBoost calculates mathematical feature distance (Shannon Entropy, Scrabble scores, consonant clusters) to provide real-time affinity %.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-900/40 space-y-1">
              <div className="font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Random Forest Oracle Clues</span>
              </div>
              <p className="text-slate-400">
                {lang === 'so'
                  ? 'Qiyaasaha 2-aad iyo 3-aad ka dib, Random Forest-ku wuxuu bixinayaa tilmaamo caqli-gal ah oo ku saabsan shaqallada, heerka adkaanta, iyo macnaha ereyga af Soomaali!'
                  : 'After a few attempts, Random Forest provides tactical clues about vowel patterns, syllable complexity, and bilingual definitions.'}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-amber-950/30 border border-amber-900/40 space-y-1">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Deterministic Seeding (Multiplayer)</span>
              </div>
              <p className="text-slate-400">
                {lang === 'so'
                  ? 'Waxaad dooran kartaa "Daily" ama waxaad qori kartaa Seed gaar ah (tusaale: "somalia-ai") si aad adiga iyo asxaabtaadu u wada heshaan isla ereyga.'
                  : 'Play the Daily Challenge or enter a custom Room Seed so you and your friends solve the exact same puzzle.'}
              </p>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-colors"
        >
          {lang === 'so' ? 'Waan Fahmay' : 'Got It'}
        </button>
      </div>
    </div>
  );
};
