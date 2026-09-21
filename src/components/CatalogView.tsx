import React, { useState, useMemo } from 'react';
import { Search, Boxes, Plus, Check, Tag } from 'lucide-react';
import { Product } from '../types';
import { formatCurrency } from '../utils/formatters';

interface CatalogViewProps {
  products: Product[];
  onStartProposalWithProduct: (product: Product) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  products,
  onStartProposalWithProduct,
}) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['Todas', ...Array.from(set).sort()];
  }, [products]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return products.filter((p) => {
      const matchCat = selectedCategory === 'Todas' || p.category === selectedCategory;
      const matchQuery =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.codigo.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [products, search, selectedCategory]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight flex items-center gap-2.5">
            <span>Catálogo Geral de Produtos & Serviços</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#5b0250]/10 text-[#5b0250] font-black dark:bg-[#5b0250]/20 dark:text-pink-300">
              {products.length} itens
            </span>
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Consulte códigos oficiais, descrições, investimentos de setup e valores recorrentes mensais (MRR).
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-zinc-200 dark:border-white/10 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código (SRV...), nome ou especificação..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800 text-xs focus:ring-2 focus:ring-[#5b0250]/30 outline-none"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 max-w-xs cursor-pointer"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table view */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/10 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-bold border-b border-zinc-200 dark:border-white/10">
              <tr>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Produto / Serviço</th>
                <th className="py-3 px-3">Categoria</th>
                <th className="py-3 px-3 text-right">Setup</th>
                <th className="py-3 px-3 text-right">MRR Mensal</th>
                <th className="py-3 px-4 text-center">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
              {filtered.map((p) => {
                const isSpecialSetup = p.id === 'setup';
                return (
                  <tr
                    key={p.id}
                    className={`hover:bg-zinc-50/70 dark:hover:bg-white/5 transition ${
                      isSpecialSetup ? 'bg-[#5b0250]/5 dark:bg-[#5b0250]/15 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-zinc-500">
                      {p.codigo}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">
                        {p.name}
                        {isSpecialSetup && (
                          <span className="ml-2 text-[10px] font-black px-2 py-0.2 rounded-full bg-[#5b0250] text-white">
                            Investimento Inicial
                          </span>
                        )}
                      </div>
                      {p.desc && p.desc !== p.name && (
                        <div className="text-[11px] text-zinc-400 mt-0.5 line-clamp-1">
                          {p.desc}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                        {p.category || 'Geral'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-zinc-600 dark:text-zinc-300">
                      {p.setup > 0 ? formatCurrency(p.setup) : '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-black text-[#5b0250] dark:text-pink-400">
                      {p.mrr > 0 ? `${formatCurrency(p.mrr)}/m` : 'R$ 0,00'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onStartProposalWithProduct(p)}
                        className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-[#5b0250] hover:text-white dark:bg-zinc-800 dark:hover:bg-[#5b0250] text-zinc-700 dark:text-zinc-200 text-xs font-bold transition flex items-center gap-1 mx-auto"
                        title="Iniciar nova proposta com este produto selecionado"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Usar</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
