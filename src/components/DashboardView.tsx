import React from 'react';
import { 
  Flame, 
  Sun, 
  Snowflake, 
  CheckCircle2, 
  XCircle, 
  TrendingUp, 
  PlusCircle, 
  ArrowRight, 
  DollarSign, 
  FileText, 
  Briefcase,
  Percent,
  BarChart3,
  Kanban,
  Target,
  Award
} from 'lucide-react';
import { Proposal, Product, Emissor, ProposalStatus } from '../types';
import { formatCurrency } from '../utils/formatters';
import { ProposalCard } from './ProposalCard';

interface DashboardViewProps {
  proposals: Proposal[];
  productsMap: Map<string, Product>;
  emissores: Emissor[];
  onStatusChange: (proposal: Proposal, newStatus: ProposalStatus, reason?: string) => void;
  onGeneratePdf: (proposal: Proposal) => void;
  onShareWhatsApp: (proposal: Proposal) => void;
  onEdit: (proposal: Proposal) => void;
  onDelete: (proposalId: string) => void;
  onViewTimeline: (proposal: Proposal) => void;
  onDuplicateVersion?: (proposal: Proposal) => void;
  onNavigateToNew: () => void;
  onNavigateToProposals: (filterStatus?: string) => void;
  onNavigateToKanban?: () => void;
  onNavigateToTemplates: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
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
  onNavigateToProposals,
  onNavigateToKanban,
  onNavigateToTemplates,
}) => {
  const getStatusStats = (status: ProposalStatus) => {
    const list = proposals.filter((p) => p.status === status);
    const count = list.length;
    const mrr = list.reduce((acc, p) => acc + (p.totalMrr || 0), 0);
    const setup = list.reduce((acc, p) => acc + (p.totalSetup || 0), 0);
    return { count, mrr, setup, total: mrr + setup, list };
  };

  const stats = {
    quente: getStatusStats('quente'),
    morno: getStatusStats('morno'),
    frio: getStatusStats('frio'),
    ganho: getStatusStats('ganho'),
    perdido: getStatusStats('perdido'),
  };

  const totalProposals = proposals.length;
  const totalMrrGeral = proposals.reduce((acc, p) => acc + (p.totalMrr || 0), 0);
  const totalSetupGeral = proposals.reduce((acc, p) => acc + (p.totalSetup || 0), 0);
  const totalGanhosMrr = stats.ganho.mrr;
  const totalGanhosSetup = stats.ganho.setup;

  // Conversion Metrics
  const wonCount = stats.ganho.count;
  const lostCount = stats.perdido.count;
  const decidedCount = wonCount + lostCount;
  const conversionRate = totalProposals > 0 ? Math.round((wonCount / totalProposals) * 100) : 0;
  const decidedWinRate = decidedCount > 0 ? Math.round((wonCount / decidedCount) * 100) : 0;

  // Average Ticket Metrics
  const avgMrrWon = wonCount > 0 ? stats.ganho.mrr / wonCount : 0;
  const avgMrrPipeline = totalProposals > 0 ? totalMrrGeral / totalProposals : 0;
  const avgSetupWon = wonCount > 0 ? stats.ganho.setup / wonCount : 0;

  const statusCards = [
    {
      key: 'quente' as ProposalStatus,
      label: 'Quente',
      icon: <Flame className="w-4 h-4 text-orange-600" />,
      stats: stats.quente,
      bg: 'bg-orange-50/70 border-orange-200 dark:bg-orange-950/20 dark:border-orange-800/40',
      badge: 'text-orange-700 dark:text-orange-300',
      barColor: 'bg-orange-500',
    },
    {
      key: 'morno' as ProposalStatus,
      label: 'Morno',
      icon: <Sun className="w-4 h-4 text-amber-600" />,
      stats: stats.morno,
      bg: 'bg-amber-50/70 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/40',
      badge: 'text-amber-700 dark:text-amber-300',
      barColor: 'bg-amber-500',
    },
    {
      key: 'frio' as ProposalStatus,
      label: 'Frio',
      icon: <Snowflake className="w-4 h-4 text-sky-600" />,
      stats: stats.frio,
      bg: 'bg-sky-50/70 border-sky-200 dark:bg-sky-950/20 dark:border-sky-800/40',
      badge: 'text-sky-700 dark:text-sky-300',
      barColor: 'bg-sky-500',
    },
    {
      key: 'ganho' as ProposalStatus,
      label: 'Ganho',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
      stats: stats.ganho,
      bg: 'bg-emerald-50/80 border-emerald-300 dark:bg-emerald-950/30 dark:border-emerald-700/60 ring-1 ring-emerald-500/20',
      badge: 'text-emerald-700 dark:text-emerald-300',
      barColor: 'bg-emerald-500',
    },
    {
      key: 'perdido' as ProposalStatus,
      label: 'Perdido',
      icon: <XCircle className="w-4 h-4 text-zinc-500" />,
      stats: stats.perdido,
      bg: 'bg-zinc-50/80 border-zinc-300 dark:bg-zinc-900 dark:border-zinc-800',
      badge: 'text-zinc-600 dark:text-zinc-400',
      barColor: 'bg-zinc-400',
    },
  ];

  const recentProposals = proposals.slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#5b0250] to-[#7f0970] text-white rounded-3xl p-6 sm:p-8 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-[11px] font-bold tracking-wide uppercase">
            <span>Pipeline Comercial Krolik</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Gestão de Propostas Comerciais
          </h1>
          <p className="text-xs sm:text-sm text-pink-100/90 leading-relaxed">
            Acompanhamento de metas, indicadores executivos de conversão, ticket médio recorrente e pipeline comercial.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onNavigateToNew}
            className="px-5 py-3 rounded-2xl bg-white hover:bg-zinc-100 text-[#5b0250] font-black text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Criar Proposta</span>
          </button>

          {onNavigateToKanban && (
            <button
              type="button"
              onClick={onNavigateToKanban}
              className="px-4 py-3 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-sm transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Kanban className="w-4 h-4" />
              <span>Quadro Kanban</span>
            </button>
          )}

          <button
            type="button"
            onClick={onNavigateToTemplates}
            className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm border border-white/20 backdrop-blur-sm transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>Templates PDF</span>
          </button>
        </div>
      </div>

      {/* Indicadores Rápidos de Desempenho (Taxa de Conversão, Ticket Médio MRR & Gráfico de Volume) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* KPI 1: Taxa de Conversão */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/10 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                  Taxa de Conversão
                </span>
                <span className="text-[10px] text-zinc-400">Total do período</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 text-[11px] font-extrabold border border-emerald-200 dark:border-emerald-800/40">
              {wonCount}/{totalProposals} ganhas
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight">
                {conversionRate}%
              </span>
              <span className="text-xs font-bold text-zinc-500">
                {decidedWinRate}% das decididas
              </span>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full h-2.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(100, conversionRate)}%` }}
              />
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Volume Ganho: <b className="text-emerald-600 font-bold">{formatCurrency(totalGanhosMrr)}/mês</b></span>
            <span className="text-zinc-400">Perdidas: {lostCount}</span>
          </div>
        </div>

        {/* KPI 2: Ticket Médio de MRR por Proposta Ganha */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/10 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                  Ticket Médio MRR
                </span>
                <span className="text-[10px] text-zinc-400">Por proposta ganha</span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-[11px] font-extrabold border border-purple-200 dark:border-purple-800/40">
              Recorrência
            </span>
          </div>

          <div className="space-y-1">
            <div className="text-2xl sm:text-3xl font-black text-[#5b0250] dark:text-pink-300 tracking-tight">
              {formatCurrency(avgMrrWon)}
              <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 ml-1">/mês</span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Receita mensal média gerada por cada contrato fechado com sucesso.
            </p>
          </div>

          <div className="pt-2 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between text-[11px] text-zinc-500">
            <span>Média geral pipeline:</span>
            <span className="font-bold text-zinc-700 dark:text-zinc-300">
              {formatCurrency(avgMrrPipeline)}/mês
            </span>
          </div>
        </div>

        {/* KPI 3: Gráfico de Volume de Propostas por Status */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/10 p-5 shadow-xs flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                <BarChart3 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 block">
                  Volume por Status
                </span>
                <span className="text-[10px] text-zinc-400">Distribuição do funil</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToProposals('todas')}
              className="text-[10px] text-[#5b0250] dark:text-pink-300 font-bold hover:underline"
            >
              Ver Funil →
            </button>
          </div>

          {/* Multi-segment stacked distribution bar */}
          <div className="space-y-2">
            <div className="w-full h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden flex">
              {statusCards.map((card) => {
                const pct = totalProposals > 0 ? (card.stats.count / totalProposals) * 100 : 0;
                if (pct === 0) return null;
                return (
                  <div
                    key={card.key}
                    style={{ width: `${pct}%` }}
                    className={`${card.barColor} h-full transition-all duration-300`}
                    title={`${card.label}: ${card.stats.count} (${Math.round(pct)}%)`}
                  />
                );
              })}
            </div>

            {/* Status breakdown bars */}
            <div className="space-y-1 pt-1">
              {statusCards.map((card) => {
                const pct = totalProposals > 0 ? Math.round((card.stats.count / totalProposals) * 100) : 0;
                return (
                  <button
                    key={card.key}
                    type="button"
                    onClick={() => onNavigateToProposals(card.key)}
                    className="w-full flex items-center justify-between text-[11px] py-0.5 px-1 rounded-md hover:bg-zinc-50 dark:hover:bg-zinc-800/60 transition group cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-300 font-medium">
                      <span className={`w-2 h-2 rounded-full ${card.barColor}`} />
                      <span>{card.label}</span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-bold text-zinc-800 dark:text-zinc-200">
                        {card.stats.count} ({pct}%)
                      </span>
                      <span className="text-[10px] text-zinc-400 group-hover:text-[#5b0250] dark:group-hover:text-pink-300">
                        {formatCurrency(card.stats.mrr)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 5 Funnel Status Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {statusCards.map((card) => (
          <div
            key={card.key}
            onClick={() => onNavigateToProposals(card.key)}
            className={`rounded-2xl border p-4 shadow-2xs hover:shadow-md transition cursor-pointer flex flex-col justify-between ${card.bg}`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-xs font-black uppercase tracking-wider flex items-center gap-1.5 ${card.badge}`}>
                {card.icon}
                {card.label}
              </span>
              <span className="text-[10px] text-zinc-400 font-semibold">
                Ver todos →
              </span>
            </div>

            <div className="my-2">
              <div className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-100">
                {card.stats.count}
              </div>
              <div className="text-[11px] text-zinc-500 font-medium">
                {card.stats.count === 1 ? 'proposta' : 'propostas'}
              </div>
            </div>

            <div className="pt-2 border-t border-zinc-200/60 dark:border-white/5 text-[11px] space-y-0.5">
              <div className="flex justify-between">
                <span className="text-zinc-500">MRR:</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">
                  {formatCurrency(card.stats.mrr)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Setup:</span>
                <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                  {formatCurrency(card.stats.setup)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content: Left Recent Proposals + Right Financial Summary */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left (2 cols): Recent Proposals */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <span>Propostas Recentes</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-bold">
                  {proposals.length}
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Ações rápidas para marcar como Ganho ou Perdido e duplicar novas versões.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {onNavigateToKanban && (
                <button
                  type="button"
                  onClick={onNavigateToKanban}
                  className="text-xs font-bold text-purple-700 dark:text-purple-300 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Kanban className="w-3.5 h-3.5" />
                  <span>Ver em Kanban</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onNavigateToProposals()}
                className="text-xs font-bold text-[#5b0250] dark:text-pink-300 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Ver todas no funil</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {recentProposals.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {recentProposals.map((proposal) => {
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
                  />
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-zinc-300 dark:border-zinc-800 p-12 text-center bg-white dark:bg-zinc-900 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-[#5b0250]/10 text-[#5b0250] flex items-center justify-center mx-auto">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-zinc-800 dark:text-zinc-200">
                Nenhuma proposta cadastrada ainda
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Inicie montando uma proposta com o catálogo completo de 111 produtos de telefonia, VoIP, chat e inteligência artificial.
              </p>
              <button
                type="button"
                onClick={onNavigateToNew}
                className="px-5 py-2.5 rounded-xl bg-[#5b0250] text-white text-xs font-bold shadow-xs hover:bg-[#47013e] transition cursor-pointer"
              >
                + Criar Primeira Proposta
              </button>
            </div>
          )}
        </div>

        {/* Right (1 col): Financial Overview & Quick Stats */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/10 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#5b0250]" />
              Resumo Financeiro Consolidado
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-white/5">
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase font-semibold">Total MRR Pipeline</div>
                  <div className="text-base font-black text-[#5b0250] dark:text-pink-400">
                    {formatCurrency(totalMrrGeral)}/mês
                  </div>
                </div>
                <DollarSign className="w-5 h-5 text-zinc-300" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-white/5">
                <div>
                  <div className="text-[10px] text-zinc-400 uppercase font-semibold">Total Setup Pipeline</div>
                  <div className="text-base font-black text-zinc-800 dark:text-zinc-200">
                    {formatCurrency(totalSetupGeral)}
                  </div>
                </div>
                <Briefcase className="w-5 h-5 text-zinc-300" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                <div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold">Ganhos em MRR</div>
                  <div className="text-base font-black text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(totalGanhosMrr)}/mês
                  </div>
                </div>
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40">
                <div>
                  <div className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase font-bold">Ganhos em Setup</div>
                  <div className="text-base font-black text-emerald-700 dark:text-emerald-300">
                    {formatCurrency(totalGanhosSetup)}
                  </div>
                </div>
                <span className="text-xs font-black text-emerald-600">{conversionRate}% conversão</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={onNavigateToNew}
                className="w-full py-3 rounded-xl bg-[#5b0250] hover:bg-[#47013e] text-white font-bold text-xs shadow-md transition cursor-pointer"
              >
                + Nova Proposta Comercial
              </button>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-[#5b0250]/5 dark:bg-[#5b0250]/15 rounded-3xl p-5 border border-[#5b0250]/15 space-y-2 text-xs">
            <div className="font-bold text-[#5b0250] dark:text-pink-300 flex items-center gap-1.5">
              <span>Orientação de Auditoria & Versões</span>
            </div>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed text-[11px]">
              Ao renegociar uma proposta existente, utilize o botão de <b>Duplicar como Nova Versão (v2, v3...)</b>. O histórico anterior permanece arquivado para auditoria comercial e controle de versões do cliente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
