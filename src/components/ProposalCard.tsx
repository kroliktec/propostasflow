import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  FileText, 
  MessageSquare, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Building2, 
  User, 
  Calendar,
  Sparkles,
  ExternalLink,
  Copy
} from 'lucide-react';
import { Proposal, Product, Emissor, ProposalStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface ProposalCardProps {
  proposal: Proposal;
  productsMap: Map<string, Product>;
  emissor?: Emissor;
  onStatusChange: (proposal: Proposal, newStatus: ProposalStatus, reason?: string) => void;
  onGeneratePdf: (proposal: Proposal) => void;
  onShareWhatsApp: (proposal: Proposal) => void;
  onEdit: (proposal: Proposal) => void;
  onDelete: (proposalId: string) => void;
  onViewTimeline: (proposal: Proposal) => void;
  onDuplicateVersion?: (proposal: Proposal) => void;
  defaultExpanded?: boolean;
}

export const ProposalCard: React.FC<ProposalCardProps> = ({
  proposal,
  productsMap,
  emissor,
  onStatusChange,
  onGeneratePdf,
  onShareWhatsApp,
  onEdit,
  onDelete,
  onViewTimeline,
  onDuplicateVersion,
  defaultExpanded = false
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const statusStyles: Record<ProposalStatus, { label: string; badge: string; dot: string }> = {
    quente: {
      label: 'Quente',
      badge: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-300 dark:border-orange-800/50',
      dot: 'bg-orange-500'
    },
    morno: {
      label: 'Morno',
      badge: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50',
      dot: 'bg-amber-500'
    },
    frio: {
      label: 'Frio',
      badge: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-800/50',
      dot: 'bg-sky-500'
    },
    ganho: {
      label: 'Ganho',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-700 ring-1 ring-emerald-500/20',
      dot: 'bg-emerald-500'
    },
    perdido: {
      label: 'Perdido',
      badge: 'bg-zinc-100 text-zinc-600 border-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700',
      dot: 'bg-zinc-400'
    }
  };

  const isWon = proposal.status === 'ganho';
  const isLost = proposal.status === 'perdido';

  return (
    <div className={`relative bg-white dark:bg-zinc-900 rounded-2xl border transition-all duration-200 shadow-sm hover:shadow-md flex flex-col ${
      isWon 
        ? 'border-emerald-300 dark:border-emerald-800/60 ring-1 ring-emerald-500/10' 
        : isLost 
          ? 'border-zinc-200 dark:border-white/5 opacity-85 hover:opacity-100' 
          : 'border-zinc-200 dark:border-white/10'
    }`}>
      {/* Top Header */}
      <div className="p-4 sm:p-5 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-extrabold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 truncate tracking-tight">
                {proposal.empresa}
              </h3>

              {proposal.version && (
                <span className="px-1.5 py-0.5 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold text-[11px] border border-purple-200 dark:border-purple-800/40">
                  v{proposal.version}
                </span>
              )}
              
              <span className={`inline-flex items-center gap-1.5 text-[11px] px-2.5 py-0.5 rounded-full border font-bold uppercase ${statusStyles[proposal.status].badge}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${statusStyles[proposal.status].dot}`} />
                <span>{statusStyles[proposal.status].label}</span>
              </span>

              {proposal.totalSetup > 0 && (
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#5b0250]/10 text-[#5b0250] border border-[#5b0250]/20 font-bold dark:bg-[#5b0250]/20 dark:text-pink-300">
                  Setup {formatCurrency(proposal.totalSetup)}
                </span>
              )}
            </div>

            {/* Metadata Pills */}
            <div className="flex items-center gap-3 text-xs text-zinc-500 dark:text-zinc-400 flex-wrap mt-1.5">
              {proposal.cnpj && (
                <span className="inline-flex items-center gap-1 font-mono text-[11px]">
                  <Building2 className="w-3.5 h-3.5 opacity-70" />
                  {proposal.cnpj}
                </span>
              )}
              {proposal.contato && (
                <span className="inline-flex items-center gap-1">
                  <User className="w-3.5 h-3.5 opacity-70" />
                  {proposal.contato}
                </span>
              )}
              <span className="inline-flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 opacity-70" />
                {formatDate(proposal.createdAt)}
              </span>
              {emissor && (
                <span className="text-zinc-400 dark:text-zinc-500 truncate max-w-[160px]">
                  • {emissor.razao}
                </span>
              )}
            </div>
          </div>

          {/* Pricing Highlight Box */}
          <div className="text-right shrink-0 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl px-3 py-2 border border-zinc-100 dark:border-white/5">
            <div className="text-xs text-zinc-400 uppercase font-semibold tracking-wider">
              Recorrência
            </div>
            <div className="text-base sm:text-lg font-black tracking-tight text-[#5b0250] dark:text-pink-400">
              {formatCurrency(proposal.totalMrr)}
              <span className="text-xs font-normal text-zinc-400">/mês</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-0.5">
              {proposal.items.length} {proposal.items.length === 1 ? 'item' : 'itens'}
            </div>
          </div>
        </div>

        {/* Expandable items preview */}
        {expanded && (
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 px-1">
              <span>Itens Contratados</span>
              <span>Subtotal MRR</span>
            </div>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {proposal.items.map((item) => {
                const prod = productsMap.get(item.productId);
                const hasCustomPrice = (item.customSetup !== undefined && item.customSetup !== item.setup) ||
                                       (item.customMrr !== undefined && item.customMrr !== item.mrr);
                const itemTotalMrr = (item.customMrr ?? item.mrr) * item.qty;
                const itemTotalSetup = (item.customSetup ?? item.setup) * item.qty;

                return (
                  <div 
                    key={item.productId}
                    className="flex items-center justify-between text-xs bg-zinc-50/70 dark:bg-white/5 rounded-xl px-2.5 py-1.5 border border-zinc-100 dark:border-white/5"
                  >
                    <div className="min-w-0 flex-1 mr-2">
                      <div className="font-medium text-zinc-800 dark:text-zinc-200 truncate">
                        {prod?.name || item.productId}
                      </div>
                      <div className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                        <span className="font-mono">{prod?.codigo || 'SRV'}</span>
                        <span>• Qtd: {item.qty} un</span>
                        {itemTotalSetup > 0 && (
                          <span>• Setup: {formatCurrency(itemTotalSetup)}</span>
                        )}
                        {hasCustomPrice && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold text-[9px]">
                            Negociado
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="font-bold text-[#5b0250] dark:text-pink-400 text-xs shrink-0">
                      {formatCurrency(itemTotalMrr)}
                    </div>
                  </div>
                );
              })}
            </div>

            {proposal.consideracoes && (
              <div className="mt-2 text-[11px] text-zinc-500 dark:text-zinc-400 bg-zinc-50 dark:bg-zinc-800/40 rounded-xl p-2.5 italic">
                "{proposal.consideracoes}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Prominent Action Bar */}
      <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-zinc-100 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-b-2xl flex flex-col gap-2.5">
        {/* Core Ganho / Perdido buttons */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {!isWon ? (
            <button
              type="button"
              onClick={() => onStatusChange(proposal, 'ganho')}
              className="flex-1 min-w-[100px] sm:min-w-[110px] py-2.5 px-3 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white font-extrabold text-xs shadow-sm hover:shadow flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
              title="Marcar proposta como Ganho"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Marcar Ganho</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onStatusChange(proposal, 'quente')}
              className="flex-1 min-w-[100px] sm:min-w-[110px] py-2.5 px-3 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Reabrir proposta para negociação"
            >
              <span>Reabrir</span>
            </button>
          )}

          {!isLost ? (
            <button
              type="button"
              onClick={() => onStatusChange(proposal, 'perdido')}
              className="flex-1 min-w-[100px] sm:min-w-[110px] py-2.5 px-3 rounded-xl bg-zinc-600 hover:bg-zinc-700 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 transition active:scale-[0.98] cursor-pointer"
              title="Marcar proposta como Perdido"
            >
              <XCircle className="w-4 h-4" />
              <span>Marcar Perdido</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onStatusChange(proposal, 'quente')}
              className="flex-1 min-w-[100px] sm:min-w-[110px] py-2.5 px-3 rounded-xl bg-zinc-200 hover:bg-zinc-300 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
              title="Reabrir proposta para negociação"
            >
              <span>Reabrir</span>
            </button>
          )}

          {/* Quick status selector */}
          <select
            value={proposal.status}
            onChange={(e) => onStatusChange(proposal, e.target.value as ProposalStatus)}
            className="text-xs font-semibold py-2.5 px-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 cursor-pointer min-w-[90px]"
            title="Mudar status da proposta"
          >
            <option value="quente">Quente</option>
            <option value="morno">Morno</option>
            <option value="frio">Frio</option>
            <option value="ganho">Ganho</option>
            <option value="perdido">Perdido</option>
          </select>
        </div>

        {/* Secondary Tool actions: PDF, WhatsApp, Edit, Delete, Timeline, Toggle */}
        <div className="flex items-center justify-between gap-1.5 pt-1 text-xs">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => onGeneratePdf(proposal)}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-white/10 hover:bg-white dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 font-bold flex items-center gap-1 transition"
              title="Gerar e baixar PDF comercial formatado"
            >
              <FileText className="w-3.5 h-3.5 text-[#5b0250] dark:text-pink-400" />
              <span>PDF</span>
            </button>

            <button
              type="button"
              onClick={() => onShareWhatsApp(proposal)}
              className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40 font-bold flex items-center gap-1 transition"
              title="Copiar texto formatado para envio no WhatsApp"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={() => onEdit(proposal)}
              className="px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-white/10 hover:bg-white dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 font-medium flex items-center gap-1 transition"
              title="Editar proposta"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editar</span>
            </button>

            {onDuplicateVersion && (
              <button
                type="button"
                onClick={() => onDuplicateVersion(proposal)}
                className="px-2 py-1.5 rounded-xl border border-purple-200 dark:border-purple-800/40 bg-purple-50/70 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 dark:hover:bg-purple-900/60 font-semibold flex items-center gap-1 transition"
                title={`Duplicar como Nova Versão (v${(proposal.version || 1) + 1})`}
              >
                <Copy className="w-3.5 h-3.5" />
                <span className="text-[11px]">v{(proposal.version || 1) + 1}</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => onViewTimeline(proposal)}
              className="px-2 py-1.5 rounded-xl text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition"
              title="Ver histórico de interações"
            >
              <Clock className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onDelete(proposal.id)}
              className="p-1.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
              title="Excluir proposta"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="text-[11px] font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 flex items-center gap-0.5 py-1 px-1.5 rounded-lg transition"
          >
            <span>{expanded ? 'Ocultar' : 'Itens'}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
};
