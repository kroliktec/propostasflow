import React, { useEffect } from 'react';
import { X, Clock, CheckCircle2, History } from 'lucide-react';
import { Proposal } from '../types';
import { formatDateTime } from '../utils/formatters';

interface TimelineModalProps {
  proposal: Proposal | null;
  onClose: () => void;
}

export const TimelineModal: React.FC<TimelineModalProps> = ({ proposal, onClose }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (proposal) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [proposal, onClose]);

  if (!proposal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose} 
      />
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-white/10 p-6 z-10 max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-100 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#5b0250]/10 flex items-center justify-center text-[#5b0250]">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                  Histórico e Auditoria
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold text-[11px] border border-purple-200 dark:border-purple-800/40">
                  Versão {proposal.version || 1}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                {proposal.empresa} • #{proposal.id.slice(0, 8)}
                {proposal.parentProposalId && (
                  <span className="ml-1 text-purple-600 dark:text-purple-400 font-medium">
                    (Derivada da #{proposal.parentProposalId.slice(0, 6)})
                  </span>
                )}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {proposal.timeline && proposal.timeline.length > 0 ? (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-200 dark:before:bg-zinc-800">
              {proposal.timeline.map((event, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-[#5b0250] border-2 border-white dark:border-zinc-900" />
                  <div className="bg-zinc-50 dark:bg-zinc-800/50 rounded-xl p-3 border border-zinc-100 dark:border-white/5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200">
                        {event.action}
                      </span>
                      <span className="text-[10px] text-zinc-400 font-mono">
                        {formatDateTime(event.date)}
                      </span>
                    </div>
                    {event.notes && (
                      <p className="text-xs text-zinc-500 mt-1 italic">
                        {event.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-zinc-400 text-xs">
              Nenhum evento registrado nesta proposta.
            </div>
          )}
        </div>

        <div className="pt-3 border-t border-zinc-100 dark:border-white/5 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-xs font-bold text-zinc-700 dark:text-zinc-200 transition"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
