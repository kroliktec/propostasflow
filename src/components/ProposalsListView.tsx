import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  PlusCircle, 
  LayoutGrid, 
  List, 
  FileText, 
  ArrowUpDown,
  Flame,
  Sun,
  Snowflake,
  CheckCircle2,
  XCircle,
  Kanban
} from 'lucide-react';
import { Proposal, Product, Emissor, ProposalStatus } from '../types';
import { formatCurrency } from '../utils/formatters';
import { ProposalCard } from './ProposalCard';
import { KanbanBoard } from './KanbanBoard';

interface ProposalsListViewProps {
  proposals: Proposal[];
  productsMap: Map<string, Product>;
  emissores: Emissor[];
  initialFilter?: string;
  initialViewMode?: 'grid' | 'kanban';
  onStatusChange: (proposal: Proposal, newStatus: ProposalStatus, reason?: string) => void;
  onGeneratePdf: (proposal: Proposal) => void;
  onShareWhatsApp: (proposal: Proposal) => void;
  onEdit: (proposal: Proposal) => void;
  onDelete: (proposalId: string) => void;
  onViewTimeline: (proposal: Proposal) => void;
  onDuplicateVersion: (proposal: Proposal) => void;
  onNavigateToNew: () => void;
}

export const ProposalsListView: React.FC<ProposalsListViewProps> = ({
  proposals,
  productsMap,
  emissores,
  initialFilter = 'todas',
  initialViewMode,
  onStatusChange,
  onGeneratePdf,
  onShareWhatsApp,
  onEdit,
  onDelete,
  onViewTimeline,
  onDuplicateVersion,
  onNavigateToNew,
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'kanban'>(() => {
    if (initialViewMode) return initialViewMode;
    return (localStorage.getItem('krolik_proposals_view') as 'grid' | 'kanban') || 'grid';
  });
  const [filterStatus, setFilterStatus] = useState<string>(initialFilter);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'mrrDesc' | 'mrrAsc' | 'empresa'>('recent');

  const handleToggleViewMode = (mode: 'grid' | 'kanban') => {
    setViewMode(mode);
    localStorage.setItem('krolik_proposals_view', mode);
  };

  // Count by status
  const counts = useMemo(() => {
    return {
      todas: proposals.length,
      quente: proposals.filter((p) => p.status === 'quente').length,
      morno: proposals.filter((p) => p.status === 'morno').length,
      frio: proposals.filter((p) => p.status === 'frio').length,
      ganho: proposals.filter((p) => p.status === 'ganho').length,
      perdido: proposals.filter((p) => p.status === 'perdido').length,
    };
  }, [proposals]);

  // Filtered & Sorted proposals
  const filteredProposals = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    let list = proposals.filter((p) => {
      const matchStatus = filterStatus === 'todas' || p.status === filterStatus;
      const matchQuery =
        !q ||
        p.empresa.toLowerCase().includes(q) ||
        p.cnpj.toLowerCase().includes(q) ||
        p.contato.toLowerCase().includes(q) ||
        p.emailContato.toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });

    // Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === 'mrrDesc') return (b.totalMrr || 0) - (a.totalMrr || 0);
      if (sortBy === 'mrrAsc') return (a.totalMrr || 0) - (b.totalMrr || 0);
      if (sortBy === 'empresa') return a.empresa.localeCompare(b.empresa);
      // default: recent
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return list;
  }, [proposals, filterStatus, searchQuery, sortBy]);

  const currentSumMrr = filteredProposals.reduce((acc, p) => acc + (p.totalMrr || 0), 0);
  const currentSumSetup = filteredProposals.reduce((acc, p) => acc + (p.totalSetup || 0), 0);

  const filterTabs = [
    { key: 'todas', label: 'Todas', count: counts.todas, icon: null },
    { key: 'quente', label: 'Quente', count: counts.quente, icon: <Flame className="w-3.5 h-3.5 text-orange-500" /> },
    { key: 'morno', label: 'Morno', count: counts.morno, icon: <Sun className="w-3.5 h-3.5 text-amber-500" /> },
    { key: 'frio', label: 'Frio', count: counts.frio, icon: <Snowflake className="w-3.5 h-3.5 text-sky-500" /> },
    { key: 'ganho', label: 'Ganho', count: counts.ganho, icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> },
    { key: 'perdido', label: 'Perdido', count: counts.perdido, icon: <XCircle className="w-3.5 h-3.5 text-zinc-400" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
            Gestão do Pipeline Comercial
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Visualize, filtre e alterne o status das propostas comerciais em Lista ou Kanban.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* View mode toggle: Grid vs Kanban */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => handleToggleViewMode('grid')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-900 text-[#5b0250] dark:text-pink-300 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Lista / Grade</span>
            </button>

            <button
              type="button"
              onClick={() => handleToggleViewMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                viewMode === 'kanban'
                  ? 'bg-white dark:bg-zinc-900 text-[#5b0250] dark:text-pink-300 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Quadro Kanban</span>
            </button>
          </div>

          <button
            type="button"
            onClick={onNavigateToNew}
            className="px-4 py-2.5 rounded-xl bg-[#5b0250] hover:bg-[#47013e] text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Nova Proposta</span>
          </button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <KanbanBoard
          proposals={proposals}
          productsMap={productsMap}
          emissores={emissores}
          onStatusChange={onStatusChange}
          onGeneratePdf={onGeneratePdf}
          onShareWhatsApp={onShareWhatsApp}
          onEdit={onEdit}
          onDelete={onDelete}
          onViewTimeline={onViewTimeline}
          onDuplicateVersion={onDuplicateVersion}
          onNavigateToNew={onNavigateToNew}
        />
      ) : (
        <>
          {/* Filter Tabs & Search Row */}
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 border border-zinc-200 dark:border-white/10 shadow-xs space-y-4">
            {/* Status Filter Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
              {filterTabs.map((tab) => {
                const isActive = filterStatus === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setFilterStatus(tab.key)}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                      isActive
                        ? 'bg-[#5b0250] text-white shadow-xs'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
                        isActive ? 'bg-white/20 text-white' : 'bg-white dark:bg-zinc-900 text-zinc-500'
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Search & Sort Controls */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between pt-2 border-t border-zinc-100 dark:border-white/5">
              <div className="relative w-full sm:max-w-md">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por empresa, CNPJ ou contato..."
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-[#5b0250]/30 outline-none"
                />
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <ArrowUpDown className="w-3.5 h-3.5" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="py-1.5 px-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 cursor-pointer"
                  >
                    <option value="recent">Mais Recentes</option>
                    <option value="mrrDesc">Maior MRR</option>
                    <option value="mrrAsc">Menor MRR</option>
                    <option value="empresa">Nome da Empresa</option>
                  </select>
                </div>

                <div className="text-right text-xs font-semibold text-zinc-500 shrink-0">
                  <span>Total: </span>
                  <b className="text-[#5b0250] dark:text-pink-400">{formatCurrency(currentSumMrr)}</b>/mês
                </div>
              </div>
            </div>
          </div>

          {/* Proposals Grid */}
          {filteredProposals.length > 0 ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredProposals.map((proposal) => {
                const emissor = emissores.find((e) => e.id === proposal.emissorId);
                return (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    productsMap={productsMap}
                    emissor={emissor}
                    onStatusChange={onStatusChange}
                    onGeneratePdf={onGeneratePdf}
                    onShareWhatsApp={onShareWhatsApp}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onViewTimeline={onViewTimeline}
                    onDuplicateVersion={onDuplicateVersion}
                    defaultExpanded={false}
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center bg-white dark:bg-zinc-900 space-y-3">
              <FileText className="w-8 h-8 text-zinc-400 mx-auto" />
              <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                Nenhuma proposta encontrada neste filtro
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Tente alterar o status no menu superior ou limpar a pesquisa para encontrar o registro desejado.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFilterStatus('todas');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
