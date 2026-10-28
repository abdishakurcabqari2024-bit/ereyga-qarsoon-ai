import React, { useEffect, useCallback } from 'react';
import { Delete, CornerDownLeft } from 'lucide-react';
import type { LetterStatus } from '../types/game';

interface VirtualKeyboardProps {
  onChar: (char: string) => void;
  onEnter: () => void;
  onDelete: () => void;
  letterStatuses: Record<string, LetterStatus>;
  disabled?: boolean;
}

const KEYBOARD_ROWS = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'backspace'],
];

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({
  onChar,
  onEnter,
  onDelete,
  letterStatuses,
  disabled = false,
}) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return;
      if (event.ctrlKey || event.metaKey || event.altKey) return;

      const key = event.key.toLowerCase();
      if (key === 'enter') {
        event.preventDefault();
        onEnter();
      } else if (key === 'backspace') {
        event.preventDefault();
        onDelete();
      } else if (/^[a-z]$/.test(key)) {
        event.preventDefault();
        onChar(key);
      }
    },
    [disabled, onEnter, onDelete, onChar]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const getKeyColor = (char: string) => {
    const status = letterStatuses[char];
    if (status === 'correct') return 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm shadow-emerald-950/40';
    if (status === 'present') return 'bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-sm shadow-amber-950/40';
    if (status === 'absent') return 'bg-slate-800/60 text-slate-500 border border-slate-800 opacity-60';
    return 'bg-slate-800 hover:bg-slate-700/80 text-slate-200 border border-slate-700/50';
  };

  return (
    <div className="w-full max-w-xl mx-auto px-1 sm:px-2 select-none">
      <div className="flex flex-col gap-1.5 sm:gap-2">
        {KEYBOARD_ROWS.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center gap-1 sm:gap-1.5 touch-manipulation">
            {row.map((key) => {
              if (key === 'enter') {
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={disabled}
                    onClick={onEnter}
                    className="flex items-center justify-center gap-1 px-2.5 sm:px-3 h-11 sm:h-12 rounded-lg bg-emerald-600/90 hover:bg-emerald-500 text-white text-[11px] sm:text-xs font-bold tracking-wider uppercase transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none shadow-md shadow-emerald-950/30"
                  >
                    <CornerDownLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    <span className="hidden sm:inline">Enter</span>
                  </button>
                );
              }

              if (key === 'backspace') {
                return (
                  <button
                    key={key}
                    type="button"
                    disabled={disabled}
                    onClick={onDelete}
                    className="flex items-center justify-center px-2.5 sm:px-3 h-11 sm:h-12 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none border border-slate-700/60"
                  >
                    <Delete className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" />
                  </button>
                );
              }

              return (
                <button
                  key={key}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChar(key)}
                  className={`flex items-center justify-center flex-1 h-11 sm:h-12 max-w-[42px] sm:max-w-[48px] rounded-lg text-sm sm:text-base font-bold uppercase transition-all active:scale-95 disabled:pointer-events-none ${getKeyColor(
                    key
                  )}`}
                >
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
