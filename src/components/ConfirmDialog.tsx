import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { ConfirmDialogState } from '../types';

interface ConfirmDialogProps {
  state: ConfirmDialogState;
  onClose: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ state, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (state.open) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state.open, onClose]);

  if (!state.open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-white/10 p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
            state.isDestructive ? 'bg-red-50 text-red-600 dark:bg-red-950/40' : 'bg-amber-50 text-amber-600 dark:bg-amber-950/40'
          }`}>
            {state.isDestructive ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              {state.title}
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
              {state.desc}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-end gap-2.5 mt-6 pt-4 border-t border-zinc-100 dark:border-white/5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition"
          >
            {state.cancelText || 'Cancelar'}
          </button>
          <button
            type="button"
            onClick={() => {
              state.onConfirm?.();
              onClose();
            }}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition ${
              state.isDestructive 
                ? 'bg-red-600 hover:bg-red-700 active:scale-[0.98]' 
                : 'bg-[#5b0250] hover:bg-[#47013e] active:scale-[0.98]'
            }`}
          >
            {state.confirmText || 'Confirmar'}
          </button>
        </div>
      </div>
    </div>
  );
};
