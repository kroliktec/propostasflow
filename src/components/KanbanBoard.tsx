import React, { useState } from 'react';
import { 
  Flame, 
  Sun, 
  Snowflake, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  MessageSquare, 
  Edit3, 
  Trash2, 
  History, 
  Copy, 
  ArrowRight,
  Building2,
  User,
  PlusCircle,
  MoveHorizontal
} from 'lucide-react';
import { Proposal, Product, Emissor, ProposalStatus } from '../types';
import { formatCurrency, formatDate } from '../utils/formatters';

interface KanbanBoardProps {
  proposals: Proposal[];
  productsMap: Map<string, Product>;
  emissores: Emissor[];
  onStatusChange: (proposal: Proposal, newStatus: ProposalStatus, reason?: string) => void;
  onGeneratePdf: (proposal: Proposal) => void;
  onShareWhatsApp: (proposal: Proposal) => void;
  onEdit: (proposal: Proposal) => void;
  onDelete: (proposalId: string) => void;
  onViewTimeline: (proposal: Proposal) => void;
  onDuplicateVersion: (proposal: Proposal) => void;
  onNavigateToNew?: () => void;
}

const COLUMNS: {
  status: ProposalStatus;
  label: string;
  icon: React.ReactNode;
  headerBg: string;
  borderCol: string;
  badgeCol: string;
  dotCol: string;
}[] = [
  {
    status: 'quente',
    label: 'Quente',
    icon: <Flame className="w-4 h-4 text-orange-600" />,
    headerBg: 'bg-orange-500/10 text-orange-700 dark:text-orange-300',
    borderCol: 'border-orange-200 dark:border-orange-800/40',
    badgeCol: 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300',
    dotCol: 'bg-orange-500',
  },
  {
    status: 'morno',
    label: 'Morno',
    icon: <Sun className="w-4 h-4 text-amber-600" />,
    headerBg: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
    borderCol: 'border-amber-200 dark:border-amber-800/40',
    badgeCol: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300',
    dotCol: 'bg-amber-500',
  },
  {
    status: 'frio',
    label: 'Frio',
    icon: <Snowflake className="w-4 h-4 text-sky-600" />,
    headerBg: 'bg-sky-500/10 text-sky-700 dark:text-sky-300',
    borderCol: 'border-sky-200 dark:border-sky-800/40',
    badgeCol: 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300',
    dotCol: 'bg-sky-500',
  },
  {
    status: 'ganho',
    label: 'Ganho',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
    headerBg: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    borderCol: 'border-emerald-200 dark:border-emerald-800/40',
    badgeCol: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300',
    dotCol: 'bg-emerald-500',
  },
  {
    status: 'perdido',
    label: 'Perdido',
    icon: <XCircle className="w-4 h-4 text-zinc-500" />,
    headerBg: 'bg-zinc-500/10 text-zinc-700 dark:text-zinc-300',
    borderCol: 'border-zinc-200 dark:border-zinc-800',
    badgeCol: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
    dotCol: 'bg-zinc-400',
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  proposals,
  productsMap,
  emissores,
  onStatusChange,
  onGeneratePdf,
  onShareWhatsApp,
  onEdit,
  onDelete,
  onViewTimeline,
  onDuplicateVersion,
  onNavigateToNew,
}) => {
  const [draggedProposalId, setDraggedProposalId] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<ProposalStatus | null>(null);

  const handleDragStart = (e: React.DragEvent, proposalId: string) => {
    e.dataTransfer.setData('text/plain', proposalId);
    e.dataTransfer.effectAllowed = 'move';
    setDraggedProposalId(proposalId);
  };

  const handleDragEnd = () => {
    setDraggedProposalId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, status: ProposalStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== status) {
      setDragOverColumn(status);
    }
  };

  const handleDrop = (e: React.DragEvent, targetStatus: ProposalStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedProposalId;
    if (id) {
      const prop = proposals.find((p) => p.id === id);
      if (prop && prop.status !== targetStatus) {
        onStatusChange(prop, targetStatus);
      }
    }
    setDraggedProposalId(null);
    setDragOverColumn(null);
  };

  return (
    <div className="space-y-4">
      {/* Kanban Board Container with horizontal scroll */}
      <div className="overflow-x-auto pb-4 pt-1">
        <div className="flex gap-4 min-w-[1280px]">
          {COLUMNS.map((col) => {
            const columnProposals = proposals.filter((p) => p.status === col.status);
            const totalColMrr = columnProposals.reduce((acc, p) => acc + (p.totalMrr || 0), 0);
            const totalColSetup = columnProposals.reduce((acc, p) => acc + (p.totalSetup || 0), 0);
            const isDragOver = dragOverColumn === col.status;

            return (
              <div
                key={col.status}
                onDragOver={(e) => handleDragOver(e, col.status)}
                onDragLeave={() => setDragOverColumn(null)}
                onDrop={(e) => handleDrop(e, col.status)}
                className={`flex-1 min-w-[250px] max-w-[320px] rounded-3xl flex flex-col bg-zinc-50/70 dark:bg-zinc-900/40 border transition-all duration-200 ${
                  isDragOver
                    ? 'border-[#5b0250] dark:border-pink-500 ring-2 ring-[#5b0250]/20 bg-[#5b0250]/5 dark:bg-[#5b0250]/10 scale-[1.01]'
                    : `${col.borderCol}`
                }`}
              >
                {/* Column Header */}
                <div className="p-3.5 border-b border-zinc-200/60 dark:border-white/5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${col.dotCol}`} />
                      <span className="font-extrabold text-xs text-zinc-900 dark:text-zinc-100 uppercase tracking-wide flex items-center gap-1.5">
                        {col.icon}
                        {col.label}
                      </span>
                    </div>

                    <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${col.badgeCol}`}>
                      {columnProposals.length}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
                    <span>MRR: <b className="text-zinc-800 dark:text-zinc-200">{formatCurrency(totalColMrr)}</b></span>
                    {totalColSetup > 0 && (
                      <span className="text-[10px] text-zinc-400">Setup: {formatCurrency(totalColSetup)}</span>
                    )}
                  </div>
                </div>

                {/* Cards List in Column */}
                <div className="p-2.5 flex-1 space-y-2.5 min-h-[350px]">
                  {columnProposals.length > 0 ? (
                    columnProposals.map((proposal) => {
                      const emissor = emissores.find((e) => e.id === proposal.emissorId);
                      const isDraggingThis = draggedProposalId === proposal.id;

                      return (
                        <div
                          key={proposal.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, proposal.id)}
                          onDragEnd={handleDragEnd}
                          className={`group bg-white dark:bg-zinc-900 rounded-2xl p-3.5 border border-zinc-200 dark:border-white/10 shadow-2xs hover:shadow-md transition-all duration-150 cursor-grab active:cursor-grabbing select-none ${
                            isDraggingThis ? 'opacity-40 scale-95' : 'hover:-translate-y-0.5'
                          }`}
                        >
                          {/* Card Header: Empresa + Version Badge */}
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-extrabold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 truncate">
                                  {proposal.empresa}
                                </h4>
                                {proposal.version && (
                                  <span className="px-1.5 py-0.2 rounded-md bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-extrabold text-[10px] border border-purple-200 dark:border-purple-800/40">
                                    v{proposal.version}
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-zinc-400 truncate flex items-center gap-1 mt-0.5">
                                <User className="w-3 h-3 shrink-0" />
                                <span>{proposal.contato}</span>
                              </p>
                            </div>
                          </div>

                          {/* Items summary */}
                          <div className="my-2 py-1.5 px-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 text-[11px] text-zinc-600 dark:text-zinc-400 space-y-0.5">
                            <div className="flex items-center justify-between font-semibold">
                              <span>Itens ({proposal.items?.length || 0})</span>
                              <span className="text-[10px] text-zinc-400">Validade: {proposal.validade}</span>
                            </div>
                            <div className="text-[10px] text-zinc-500 truncate">
                              {proposal.items?.slice(0, 2).map((item, idx) => {
                                const prod = productsMap.get(item.productId);
                                return prod?.name;
                              }).filter(Boolean).join(', ') || 'Nenhum item'}
                              {(proposal.items?.length || 0) > 2 ? ' ...' : ''}
                            </div>
                          </div>

                          {/* Financials highlight */}
                          <div className="flex items-center justify-between pt-1 text-xs">
                            <div>
                              <span className="text-[10px] text-zinc-400 block font-medium">MRR Mensal</span>
                              <span className="font-black text-sm text-[#5b0250] dark:text-pink-400">
                                {formatCurrency(proposal.totalMrr)}
                              </span>
                            </div>

                            {proposal.totalSetup > 0 && (
                              <div className="text-right">
                                <span className="text-[10px] text-zinc-400 block font-medium">Setup</span>
                                <span className="font-bold text-xs text-zinc-700 dark:text-zinc-300">
                                  {formatCurrency(proposal.totalSetup)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Quick Move Selector + Action Buttons */}
                          <div className="mt-3 pt-2.5 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between gap-1.5">
                            {/* Quick status selector (ideal for mobile or non-drag users) */}
                            <select
                              value={proposal.status}
                              onChange={(e) => onStatusChange(proposal, e.target.value as ProposalStatus)}
                              className="text-[10px] font-bold py-1 px-1.5 rounded-lg border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 cursor-pointer max-w-[95px]"
                              title="Alterar coluna / status"
                            >
                              <option value="quente">Quente</option>
                              <option value="morno">Morno</option>
                              <option value="frio">Frio</option>
                              <option value="ganho">Ganho</option>
                              <option value="perdido">Perdido</option>
                            </select>

                            {/* Action Icons */}
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => onGeneratePdf(proposal)}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-[#5b0250] hover:bg-[#5b0250]/10 dark:hover:text-pink-300 transition cursor-pointer"
                                title="Baixar PDF Comercial"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => onShareWhatsApp(proposal)}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition cursor-pointer"
                                title="Compartilhar no WhatsApp"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => onDuplicateVersion(proposal)}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition cursor-pointer"
                                title={`Duplicar como Nova Versão (v${(proposal.version || 1) + 1})`}
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => onViewTimeline(proposal)}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                                title="Histórico da Proposta"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => onEdit(proposal)}
                                className="p-1.5 rounded-lg text-zinc-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition cursor-pointer"
                                title="Editar Proposta"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => onDelete(proposal.id)}
                                className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition cursor-pointer"
                                title="Excluir Proposta"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="h-40 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center text-center p-4">
                      <p className="text-xs text-zinc-400 font-medium">
                        Nenhuma proposta nesta coluna
                      </p>
                      <span className="text-[10px] text-zinc-400/80 mt-1">
                        Arraste um card aqui
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
