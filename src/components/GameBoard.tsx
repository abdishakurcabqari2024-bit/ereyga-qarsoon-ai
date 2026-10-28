import React from 'react';
import type { GuessResult } from '../types/game';

interface GameBoardProps {
  wordLength: number;
  maxGuesses: number;
  guesses: GuessResult[];
  currentGuess: string;
  isShaking: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  wordLength,
  maxGuesses,
  guesses,
  currentGuess,
  isShaking,
}) => {
  const rows = Array.from({ length: maxGuesses });

  return (
    <div className="flex flex-col items-center justify-center gap-1.5 sm:gap-2 my-2 sm:my-4 select-none">
      {rows.map((_, rowIndex) => {
        const isCompletedRow = rowIndex < guesses.length;
        const isCurrentRow = rowIndex === guesses.length;
        const guessResult = guesses[rowIndex];

        return (
          <div
            key={rowIndex}
            className={`flex items-center gap-1.5 sm:gap-2 ${
              isCurrentRow && isShaking ? 'animate-shake' : ''
            }`}
          >
            {Array.from({ length: wordLength }).map((_, colIndex) => {
              let letter = '';
              let statusClass = 'border-slate-800/80 bg-slate-900/30 text-slate-200';
              let popClass = '';

              if (isCompletedRow && guessResult) {
                const evalItem = guessResult.evaluations[colIndex];
                letter = evalItem?.letter?.toUpperCase() || '';
                
                if (evalItem?.status === 'correct') {
                  statusClass = 'bg-emerald-600 border-emerald-500 text-white font-black shadow-md shadow-emerald-900/30';
                } else if (evalItem?.status === 'present') {
                  statusClass = 'bg-amber-600 border-amber-500 text-white font-black shadow-md shadow-amber-900/30';
                } else {
                  statusClass = 'bg-slate-800/90 border-slate-700/60 text-slate-400 font-semibold';
                }
                popClass = 'animate-flip';
              } else if (isCurrentRow) {
                letter = currentGuess[colIndex]?.toUpperCase() || '';
                if (letter) {
                  statusClass = 'border-sky-500/90 bg-slate-900/90 text-white font-bold ring-1 ring-sky-500/30';
                  popClass = 'animate-pop';
                }
              }

              // Dynamic tile sizing depending on word length
              const sizeClasses =
                wordLength <= 5
                  ? 'w-12 h-12 sm:w-14 sm:h-14 text-xl sm:text-2xl'
                  : wordLength === 6
                  ? 'w-10 h-10 sm:w-12 sm:h-12 text-lg sm:text-xl'
                  : 'w-9 h-9 sm:w-11 sm:h-11 text-base sm:text-lg';

              return (
                <div
                  key={colIndex}
                  style={{
                    animationDelay: isCompletedRow ? `${colIndex * 70}ms` : '0ms',
                  }}
                  className={`flex items-center justify-center rounded-xl border-2 uppercase font-mono tracking-wider transition-all duration-200 ${sizeClasses} ${statusClass} ${popClass}`}
                >
                  {letter}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
