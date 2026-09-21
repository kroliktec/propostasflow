import React from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { ToastNotification } from '../types';

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let icon = <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />;
        let borderClass = 'border-emerald-200 dark:border-emerald-900/50';
        let bgClass = 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100';

        if (toast.type === 'error') {
          icon = <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />;
          borderClass = 'border-red-200 dark:border-red-900/50';
        } else if (toast.type === 'info') {
          icon = <Info className="w-4 h-4 text-sky-500 shrink-0" />;
          borderClass = 'border-sky-200 dark:border-sky-900/50';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
          borderClass = 'border-amber-200 dark:border-amber-900/50';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center justify-between gap-3 px-4 py-3 rounded-2xl shadow-xl border ${borderClass} ${bgClass} backdrop-blur-md transition transform translate-y-0`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              {icon}
              <span className="text-xs font-semibold leading-snug truncate">
                {toast.msg}
              </span>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
