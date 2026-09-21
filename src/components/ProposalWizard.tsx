import React, { useState, useMemo } from 'react';
import { 
  Building2, 
  FileText, 
  Plus, 
  Minus, 
  Trash2, 
  Search, 
  Check, 
  Sparkles, 
  Download, 
  Eye, 
  Save, 
  ArrowRight, 
  ArrowLeft, 
  RotateCcw,
  CheckCircle2,
  Calendar,
  Layers,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  Copy
} from 'lucide-react';
import { Proposal, ProposalItem, Product, Emissor, Cliente, PdfTemplate, ProposalStatus } from '../types';
import { formatCurrency, maskCNPJ, maskPhone, generateWhatsAppText } from '../utils/formatters';
import { generateProposalPdf } from '../utils/pdfGenerator';

interface ProposalWizardProps {
  products: Product[];
  productsMap: Map<string, Product>;
  emissores: Emissor[];
  clientes: Cliente[];
  templates: PdfTemplate[];
  editingProposal: Proposal | null;
  onSaveProposal: (
    proposalData: Omit<Proposal, 'id' | 'createdAt' | 'timeline'> & { id?: string },
    isNewVersion?: boolean
  ) => void;
  onCancel: () => void;
  onNotify: (msg: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}

export const ProposalWizard: React.FC<ProposalWizardProps> = ({
  products,
  productsMap,
  emissores,
  clientes,
  templates,
  editingProposal,
  onSaveProposal,
  onCancel,
  onNotify
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form Fields
  const [empresa, setEmpresa] = useState(editingProposal?.empresa || '');
  const [cnpj, setCnpj] = useState(editingProposal?.cnpj || '');
  const [contato, setContato] = useState(editingProposal?.contato || '');
  const [emailContato, setEmailContato] = useState(editingProposal?.emailContato || '');
  const [telefoneContato, setTelefoneContato] = useState(editingProposal?.telefoneContato || '');
  const [validade, setValidade] = useState(editingProposal?.validade || '15 dias');
  const [status, setStatus] = useState<ProposalStatus>(editingProposal?.status || 'quente');
  const [emissorId, setEmissorId] = useState(
    editingProposal?.emissorId || (emissores.length > 0 ? emissores[0].id : '')
  );
  const [consideracoes, setConsideracoes] = useState(
    editingProposal?.consideracoes ||
    'Proposta comercial válida conforme condições acordadas. Faturamento com nota fiscal eletrônica de prestação de serviços de telecomunicações / tecnologia.'
  );
  const [tcvMeses, setTcvMeses] = useState(editingProposal?.tcvMeses || 12);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    templates.length > 0 ? templates[0].id : ''
  );

  // Selected Items in Proposal
  const [items, setItems] = useState<ProposalItem[]>(
    editingProposal?.items ? JSON.parse(JSON.stringify(editingProposal.items)) : []
  );

  // Catalog search & filter in Step 2
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');

  // PDF Preview State
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

  // Categories list
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['Todas', ...Array.from(set).sort()];
  }, [products]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return products.filter((p) => {
      const matchQuery =
        !query ||
        p.name.toLowerCase().includes(query) ||
        p.codigo.toLowerCase().includes(query) ||
        p.desc.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query);

      const matchCategory = selectedCategory === 'Todas' || p.category === selectedCategory;
      return matchQuery && matchCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  // Computed Totals
  const totals = useMemo(() => {
    let setup = 0;
    let mrr = 0;
    items.forEach((item) => {
      const uSetup = item.customSetup ?? item.setup;
      const uMrr = item.customMrr ?? item.mrr;
      setup += uSetup * item.qty;
      mrr += uMrr * item.qty;
    });
    const tcv = setup + mrr * tcvMeses;
    return { setup, mrr, tcv };
  }, [items, tcvMeses]);

  // Handle client auto-fill
  const handleSelectClient = (client: Cliente) => {
    setEmpresa(client.empresa);
    setCnpj(client.cnpj);
    setContato(client.contato);
    setEmailContato(client.email);
    if (client.telefone) setTelefoneContato(client.telefone);
    onNotify(`Dados preenchidos com o cliente: ${client.empresa}`, 'info');
  };

  // Item manipulation
  const addItem = (product: Product) => {
    if (items.some((i) => i.productId === product.id)) {
      onNotify('Este produto já foi adicionado. Ajuste a quantidade.', 'info');
      return;
    }
    const newItem: ProposalItem = {
      productId: product.id,
      qty: 1,
      setup: product.setup,
      mrr: product.mrr,
    };
    setItems((prev) => [...prev, newItem]);
    onNotify(`Adicionado: ${product.name}`, 'success');
  };

  const removeItem = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const updateItem = (productId: string, field: 'qty' | 'setup' | 'mrr', value: number) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.productId !== productId) return i;
        const copy = { ...i };
        if (field === 'qty') copy.qty = Math.max(1, value);
        if (field === 'setup') copy.customSetup = value;
        if (field === 'mrr') copy.customMrr = value;
        return copy;
      })
    );
  };

  // Step 1 Validation
  const handleNextFromStep1 = () => {
    if (!empresa.trim()) {
      onNotify('Por favor, informe a Razão Social ou Nome da Empresa.', 'error');
      return;
    }
    setStep(2);
  };

  // Step 2 Validation
  const handleNextFromStep2 = () => {
    if (items.length === 0) {
      onNotify('Adicione pelo menos 1 produto ou serviço para prosseguir.', 'warning');
      return;
    }
    setStep(3);
  };

  // Step 4: Generate PDF
  const handleGeneratePdfAction = async () => {
    setPdfGenerating(true);
    try {
      const currentEmissor = emissores.find((e) => e.id === emissorId) || emissores[0];
      const currentTemplate = templates.find((t) => t.id === selectedTemplateId) || null;

      const dummyProposal: Proposal = {
        id: editingProposal?.id || 'NOVA',
        empresa,
        cnpj,
        contato,
        emailContato,
        telefoneContato,
        validade,
        consideracoes,
        emissorId,
        status,
        items,
        totalSetup: totals.setup,
        totalMrr: totals.mrr,
        tcvMeses,
        createdAt: editingProposal?.createdAt || new Date().toISOString(),
        timeline: [],
      };

      const result = await generateProposalPdf(dummyProposal, productsMap, currentEmissor, currentTemplate);
      setPdfBlobUrl(result.url);

      // Trigger direct download
      const link = document.createElement('a');
      link.href = result.url;
      link.download = `Proposta_${empresa.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();

      onNotify('PDF comercial gerado e baixado com sucesso.', 'success');
    } catch (err) {
      console.error(err);
      onNotify('Erro ao gerar PDF. Verifique se o template é válido.', 'error');
    } finally {
      setPdfGenerating(false);
    }
  };

  // Final Save
  const handleFinalSave = () => {
    if (!empresa.trim()) {
      onNotify('Nome da empresa é obrigatório.', 'error');
      setStep(1);
      return;
    }
    if (items.length === 0) {
      onNotify('Adicione pelo menos 1 item.', 'error');
      setStep(2);
      return;
    }

    onSaveProposal({
      id: editingProposal?.id,
      empresa,
      cnpj,
      contato,
      emailContato,
      telefoneContato,
      validade,
      consideracoes,
      emissorId,
      status,
      items,
      totalSetup: totals.setup,
      totalMrr: totals.mrr,
      tcvMeses,
      version: editingProposal?.version,
    }, false);
  };

  const handleSaveAsNewVersion = () => {
    if (!empresa.trim()) {
      onNotify('Nome da empresa é obrigatório.', 'error');
      setStep(1);
      return;
    }
    if (items.length === 0) {
      onNotify('Adicione pelo menos 1 item.', 'error');
      setStep(2);
      return;
    }

    onSaveProposal({
      id: editingProposal?.id,
      empresa,
      cnpj,
      contato,
      emailContato,
      telefoneContato,
      validade,
      consideracoes,
      emissorId,
      status,
      items,
      totalSetup: totals.setup,
      totalMrr: totals.mrr,
      tcvMeses,
      version: editingProposal?.version,
    }, true);
  };

  const handleCopyWhatsApp = () => {
    const currentEmissor = emissores.find((e) => e.id === emissorId) || emissores[0];
    const dummyProposal: Proposal = {
      id: editingProposal?.id || 'NOVA',
      empresa,
      cnpj,
      contato,
      emailContato,
      telefoneContato,
      validade,
      consideracoes,
      emissorId,
      status,
      items,
      totalSetup: totals.setup,
      totalMrr: totals.mrr,
      tcvMeses,
      createdAt: editingProposal?.createdAt || new Date().toISOString(),
      timeline: [],
    };
    const text = generateWhatsAppText(dummyProposal, productsMap, currentEmissor);
    navigator.clipboard?.writeText(text);
    onNotify('Texto formatado copiado para a Área de Transferência.', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Editing Proposal Versioning Alert Banner */}
      {editingProposal && (
        <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/40 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <span className="px-2 py-0.5 rounded-md bg-purple-200 dark:bg-purple-900 text-purple-800 dark:text-purple-200 font-extrabold text-[11px]">
              v{editingProposal.version || 1}
            </span>
            <div>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                Editando Proposta: {editingProposal.empresa}
              </span>
              <span className="text-zinc-500 dark:text-zinc-400 block text-[11px]">
                Você pode atualizar esta proposta diretamente ou duplicar como Nova Versão (v{(editingProposal.version || 1) + 1}) para auditoria comercial.
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleSaveAsNewVersion}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            title={`Criar Versão ${(editingProposal.version || 1) + 1} mantendo a v${editingProposal.version || 1} intacta no histórico`}
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Duplicar como v{(editingProposal.version || 1) + 1}</span>
          </button>
        </div>
      )}

      {/* Wizard Step Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white dark:bg-zinc-900 rounded-2xl p-3 sm:p-4 border border-zinc-200 dark:border-white/10 shadow-xs">
        <div className="flex items-center gap-1.5 sm:gap-3 overflow-x-auto no-scrollbar w-full sm:w-auto pb-1 sm:pb-0">
          {[
            { num: 1, label: 'Dados do Cliente' },
            { num: 2, label: 'Catálogo de Produtos' },
            { num: 3, label: 'Resumo Financeiro' },
            { num: 4, label: 'PDF & Finalização' },
          ].map((s, idx) => {
            const isDone = step > s.num;
            const isCurrent = step === s.num;
            return (
              <React.Fragment key={s.num}>
                <button
                  type="button"
                  onClick={() => {
                    if (s.num === 1 || (s.num === 2 && empresa) || (s.num > 2 && items.length > 0)) {
                      setStep(s.num as any);
                    }
                  }}
                  className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl transition shrink-0 cursor-pointer ${
                    isCurrent
                      ? 'bg-[#5b0250] text-white shadow-xs font-bold'
                      : isDone
                      ? 'text-emerald-700 dark:text-emerald-400 font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800'
                      : 'text-zinc-400 font-medium'
                  }`}
                >
                  <span
                    className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[11px] sm:text-xs font-extrabold ${
                      isCurrent
                        ? 'bg-white text-[#5b0250]'
                        : isDone
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400'
                    }`}
                  >
                    {isDone ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" /> : s.num}
                  </span>
                  <span className="text-xs whitespace-nowrap">{s.label}</span>
                </button>
                {idx < 3 && (
                  <div
                    className={`hidden sm:block w-4 sm:w-6 h-0.5 shrink-0 ${
                      step > s.num ? 'bg-emerald-500' : 'bg-zinc-200 dark:bg-zinc-800'
                    }`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 px-3 py-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800 self-end sm:self-auto cursor-pointer"
        >
          Cancelar
        </button>
      </div>

      {/* STEP 1: DADOS */}
      {step === 1 && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/10 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100 dark:border-white/5">
            <div>
              <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                {editingProposal ? 'Editar Proposta' : 'Nova Proposta Comercial'}
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Preencha os dados cadastrais do cliente e emissor responsável.
              </p>
            </div>

            {clientes.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-medium">Cliente salvo:</span>
                <select
                  onChange={(e) => {
                    const c = clientes.find((cli) => cli.id === e.target.value);
                    if (c) handleSelectClient(c);
                  }}
                  defaultValue=""
                  className="text-xs font-semibold px-3 py-2 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 cursor-pointer"
                >
                  <option value="" disabled>Selecionar cliente existente...</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.empresa} {c.contato ? `(${c.contato})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Empresa / Razão Social *
              </label>
              <input
                type="text"
                value={empresa}
                onChange={(e) => setEmpresa(e.target.value)}
                placeholder="Ex: Prime Tech Soluções LTDA"
                className="mt-1 w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-[#5b0250]/30 outline-none"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                CNPJ do Cliente
              </label>
              <input
                type="text"
                value={cnpj}
                onChange={(e) => setCnpj(maskCNPJ(e.target.value))}
                placeholder="00.000.000/0001-00"
                className="mt-1 w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-sm font-mono focus:ring-2 focus:ring-[#5b0250]/30 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Nome do Contato / Decisor
              </label>
              <input
                type="text"
                value={contato}
                onChange={(e) => setContato(e.target.value)}
                placeholder="Ex: Carlos Eduardo"
                className="mt-1 w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-[#5b0250]/30 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Email de Envio
              </label>
              <input
                type="email"
                value={emailContato}
                onChange={(e) => setEmailContato(e.target.value)}
                placeholder="carlos@empresa.com.br"
                className="mt-1 w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-[#5b0250]/30 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Telefone / WhatsApp
              </label>
              <input
                type="tel"
                value={telefoneContato}
                onChange={(e) => setTelefoneContato(maskPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                className="mt-1 w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-sm font-mono focus:ring-2 focus:ring-[#5b0250]/30 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Emissor da Proposta (Contratada)
              </label>
              <select
                value={emissorId}
                onChange={(e) => setEmissorId(e.target.value)}
                className="mt-1 w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-sm font-medium focus:ring-2 focus:ring-[#5b0250]/30 outline-none"
              >
                {emissores.map((emi) => (
                  <option key={emi.id} value={emi.id}>
                    {emi.razao} ({emi.cnpj})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Validade Comercial
              </label>
              <div className="flex gap-2 mt-1">
                {['7 dias', '15 dias', '30 dias'].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setValidade(v)}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold transition ${
                      validade === v
                        ? 'bg-[#5b0250] text-white border-[#5b0250]'
                        : 'border-zinc-200 dark:border-white/10 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Status Inicial no Funil
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ProposalStatus)}
                className="mt-1 w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-sm font-semibold focus:ring-2 focus:ring-[#5b0250]/30 outline-none"
              >
                <option value="quente">Quente (Fase final de negociação)</option>
                <option value="morno">Morno (Interesse demonstrado)</option>
                <option value="frio">Frio (Primeiro contato / Prospecção)</option>
                <option value="ganho">Ganho (Contrato Aprovado)</option>
                <option value="perdido">Perdido (Recusado)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Considerações Comerciais & Condições de Pagamento
              </label>
              <textarea
                value={consideracoes}
                onChange={(e) => setConsideracoes(e.target.value)}
                rows={3}
                className="mt-1 w-full px-4 py-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-sm focus:ring-2 focus:ring-[#5b0250]/30 outline-none leading-relaxed"
                placeholder="Insira informações adicionais, SLA, carência ou regras de fatura..."
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-white/5">
            <button
              type="button"
              onClick={handleNextFromStep1}
              className="px-6 py-3 rounded-xl bg-[#5b0250] hover:bg-[#47013e] text-white font-bold text-sm shadow-md transition flex items-center gap-2"
            >
              <span>Avançar: Selecionar Produtos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PRODUTOS CATALOG & CONFIGURATION */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Basket summary strip */}
          <div className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-zinc-200 dark:border-white/10 shadow-xs flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#5b0250]/10 flex items-center justify-center text-[#5b0250] font-black text-sm">
                {items.length}
              </div>
              <div>
                <div className="text-xs text-zinc-400 font-semibold">Itens selecionados</div>
                <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                  {items.length === 0 ? 'Nenhum produto adicionado' : `${items.length} produtos configurados`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-semibold">Setup Total</div>
                <div className="text-sm font-black text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(totals.setup)}
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-400 uppercase font-semibold">MRR Mensal</div>
                <div className="text-base font-black text-[#5b0250] dark:text-pink-400">
                  {formatCurrency(totals.mrr)}/mês
                </div>
              </div>
              <button
                type="button"
                onClick={handleNextFromStep2}
                className="px-5 py-2.5 rounded-xl bg-[#5b0250] hover:bg-[#47013e] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
              >
                <span>Resumo Financeiro</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Search & Categories */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por código (SRV000100), nome ou serviço..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-xs focus:ring-2 focus:ring-[#5b0250]/30 outline-none"
              />
            </div>

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-900 text-xs font-semibold max-w-xs text-zinc-700 dark:text-zinc-300"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Selected Items Config Box */}
          {items.length > 0 && (
            <div className="bg-[#5b0250]/5 dark:bg-[#5b0250]/10 rounded-3xl p-5 border border-[#5b0250]/20 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-[#5b0250] dark:text-pink-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Itens Selecionados na Proposta ({items.length})
                </h3>
                <button
                  type="button"
                  onClick={() => setItems([])}
                  className="text-xs text-red-600 hover:underline font-semibold"
                >
                  Limpar todos
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {items.map((item) => {
                  const prod = productsMap.get(item.productId);
                  const isSpecialSetup = item.productId === 'setup';
                  const unitSetup = item.customSetup ?? item.setup;
                  const unitMrr = item.customMrr ?? item.mrr;
                  const isNegotiated =
                    (item.customSetup !== undefined && item.customSetup !== item.setup) ||
                    (item.customMrr !== undefined && item.customMrr !== item.mrr);

                  return (
                    <div
                      key={item.productId}
                      className="bg-white dark:bg-zinc-900 rounded-2xl p-3 border border-zinc-200 dark:border-white/10 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                            {prod?.codigo || 'SRV'}
                          </span>
                          <span className="text-xs font-extrabold text-zinc-900 dark:text-zinc-100 truncate">
                            {prod?.name || item.productId}
                          </span>
                          {isSpecialSetup && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5b0250] text-white">
                              Investimento Inicial
                            </span>
                          )}
                          {isNegotiated && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                              Negociado
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-0.5">
                          Tabela: Setup {formatCurrency(item.setup)} • MRR {formatCurrency(item.mrr)}/mês
                        </div>
                      </div>

                      {/* Controls: Qty, Custom Setup, Custom MRR */}
                      <div className="flex items-center gap-3 flex-wrap">
                        {/* Qty */}
                        <div className="flex items-center border border-zinc-200 dark:border-white/10 rounded-xl bg-zinc-50 dark:bg-zinc-800 p-0.5">
                          <button
                            type="button"
                            onClick={() => updateItem(item.productId, 'qty', item.qty - 1)}
                            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-300"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-8 text-center text-xs font-bold">{item.qty}</span>
                          <button
                            type="button"
                            onClick={() => updateItem(item.productId, 'qty', item.qty + 1)}
                            className="p-1 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-lg text-zinc-600 dark:text-zinc-300"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Setup Unit Input */}
                        <div className="w-24">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase">Setup Un.</label>
                          <input
                            type="number"
                            step="0.01"
                            value={unitSetup}
                            onChange={(e) => updateItem(item.productId, 'setup', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 rounded-lg border border-zinc-200 dark:border-white/10 text-xs font-semibold focus:ring-1 focus:ring-[#5b0250]/30 outline-none"
                          />
                        </div>

                        {/* MRR Unit Input */}
                        <div className="w-24">
                          <label className="text-[9px] font-bold text-zinc-400 uppercase">MRR Un.</label>
                          <input
                            type="number"
                            step="0.01"
                            value={unitMrr}
                            onChange={(e) => updateItem(item.productId, 'mrr', parseFloat(e.target.value) || 0)}
                            className="w-full px-2 py-1 rounded-lg border border-zinc-200 dark:border-white/10 text-xs font-semibold focus:ring-1 focus:ring-[#5b0250]/30 outline-none"
                          />
                        </div>

                        {/* Subtotal */}
                        <div className="text-right w-24">
                          <div className="text-[9px] font-bold text-zinc-400 uppercase">Total Mês</div>
                          <div className="text-xs font-black text-[#5b0250] dark:text-pink-400">
                            {formatCurrency(unitMrr * item.qty)}
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => removeItem(item.productId)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl"
                          title="Remover produto da proposta"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Product Catalog Grid (111 items) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-zinc-500 px-1">
              <span>Catálogo Geral ({filteredProducts.length} disponíveis)</span>
              <span>Clique em "+ Adicionar" para compor a proposta</span>
            </div>

            <div className="grid md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
              {filteredProducts.map((p) => {
                const isSelected = items.some((i) => i.productId === p.id);
                const isSpecialSetup = p.id === 'setup';

                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl border p-4 transition flex flex-col justify-between gap-3 ${
                      isSpecialSetup
                        ? 'bg-[#5b0250]/5 border-[#5b0250]/30 dark:bg-[#5b0250]/15'
                        : isSelected
                        ? 'bg-emerald-50/40 border-emerald-300 dark:bg-emerald-950/20'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-white/10 hover:border-zinc-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[10px] font-bold text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                              {p.codigo}
                            </span>
                            {isSpecialSetup && (
                              <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-[#5b0250] text-white">
                                INVESTIMENTO INICIAL
                              </span>
                            )}
                            <span className="text-[10px] text-zinc-400 font-medium">
                              {p.category || 'Geral'}
                            </span>
                          </div>
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 mt-1 leading-snug">
                            {p.name}
                          </h4>
                        </div>

                        {/* Price Tag */}
                        <div className="text-right shrink-0">
                          {p.mrr > 0 ? (
                            <div className="text-xs font-extrabold text-[#5b0250] dark:text-pink-400">
                              {formatCurrency(p.mrr)}
                              <span className="text-[10px] font-normal text-zinc-400">/m</span>
                            </div>
                          ) : (
                            <div className="text-xs font-bold text-zinc-400">R$ 0,00</div>
                          )}
                          {p.setup > 0 && (
                            <div className="text-[10px] font-semibold text-zinc-600 dark:text-zinc-300">
                              Setup: {formatCurrency(p.setup)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-zinc-100 dark:border-white/5 flex items-center justify-between">
                      <span className="text-[10px] text-zinc-400">
                        Periodicidade: {p.periodicidade}
                      </span>
                      {isSelected ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                          <Check className="w-4 h-4" />
                          <span>Adicionado</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => addItem(p)}
                          className="px-3 py-1.5 rounded-xl bg-[#5b0250] hover:bg-[#47013e] text-white font-bold text-xs shadow-xs transition"
                        >
                          + Adicionar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-200 dark:border-white/10">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar aos Dados</span>
            </button>
            <button
              type="button"
              onClick={handleNextFromStep2}
              className="px-6 py-2.5 rounded-xl bg-[#5b0250] hover:bg-[#47013e] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <span>Avançar para Resumo</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: RESUMO FINANCEIRO & CONDIÇÕES */}
      {step === 3 && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/10 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              Resumo Financeiro & Condições Comerciais
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Valores calculados com base nos {items.length} itens contratados para {empresa}.
            </p>
          </div>

          {/* Dual Bento Cards */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-[#f8f0f7] to-[#f4e8f3] dark:from-[#5b0250]/20 dark:to-[#5b0250]/10 rounded-2xl p-5 border border-[#5b0250]/20">
              <span className="text-xs font-bold uppercase tracking-wider text-[#5b0250] dark:text-pink-300">
                Investimento Único (Setup)
              </span>
              <div className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 mt-2">
                {formatCurrency(totals.setup)}
              </div>
              <p className="text-xs text-zinc-500 mt-1">
                Investimento pontual de implantação, ativação técnica e onboarding.
              </p>
            </div>

            <div className="bg-[#5b0250] text-white rounded-2xl p-5 shadow-lg">
              <span className="text-xs font-bold uppercase tracking-wider text-pink-200">
                Investimento Mensal (MRR)
              </span>
              <div className="text-2xl sm:text-3xl font-black mt-2">
                {formatCurrency(totals.mrr)}
                <span className="text-xs font-normal text-pink-200">/mês</span>
              </div>
              <p className="text-xs text-pink-100/80 mt-1">
                Faturamento mensal recorrente de canais, ramais e módulos.
              </p>
            </div>

            <div className="sm:col-span-2 lg:col-span-1 bg-zinc-50 dark:bg-zinc-800/60 rounded-2xl p-5 border border-zinc-200 dark:border-white/5 flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                  Vigência Contratual
                </span>
                <div className="flex gap-2 mt-2">
                  {[12, 24, 36].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTcvMeses(m)}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition ${
                        tcvMeses === m
                          ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent'
                          : 'border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300'
                      }`}
                    >
                      {m}m
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-zinc-200 dark:border-white/5">
                <div className="text-[10px] text-zinc-400 font-semibold uppercase">
                  Valor Total do Contrato (TCV)
                </div>
                <div className="text-base font-black text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(totals.tcv)}
                </div>
              </div>
            </div>
          </div>

          {/* Table Breakdown */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-zinc-600 dark:text-zinc-400">
              Detalhamento dos Itens ({items.length})
            </h4>
            <div className="border border-zinc-200 dark:border-white/10 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 dark:bg-zinc-800/60 text-zinc-500 font-bold border-b border-zinc-200 dark:border-white/10">
                  <tr>
                    <th className="py-2.5 px-4">Item</th>
                    <th className="py-2.5 px-2 text-center">Qtd</th>
                    <th className="py-2.5 px-3 text-right">Setup Un.</th>
                    <th className="py-2.5 px-3 text-right">MRR Un.</th>
                    <th className="py-2.5 px-4 text-right">Total Mês</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-white/5">
                  {items.map((item, idx) => {
                    const prod = productsMap.get(item.productId);
                    const unitSetup = item.customSetup ?? item.setup;
                    const unitMrr = item.customMrr ?? item.mrr;
                    return (
                      <tr key={item.productId} className="hover:bg-zinc-50/50 dark:hover:bg-white/5">
                        <td className="py-2 px-4">
                          <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                            {prod?.name || item.productId}
                          </div>
                          <div className="text-[10px] text-zinc-400 font-mono">
                            {prod?.codigo}
                          </div>
                        </td>
                        <td className="py-2 px-2 text-center font-bold">{item.qty}</td>
                        <td className="py-2 px-3 text-right text-zinc-500">
                          {formatCurrency(unitSetup)}
                        </td>
                        <td className="py-2 px-3 text-right text-zinc-500">
                          {formatCurrency(unitMrr)}
                        </td>
                        <td className="py-2 px-4 text-right font-bold text-[#5b0250] dark:text-pink-400">
                          {formatCurrency(unitMrr * item.qty)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-white/5">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar aos Produtos</span>
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="px-6 py-2.5 rounded-xl bg-[#5b0250] hover:bg-[#47013e] text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
            >
              <span>Avançar para PDF e Salvar</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVISÃO, MERGE COM TEMPLATE & EXPORTAÇÃO */}
      {step === 4 && (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-white/10 shadow-sm p-6 sm:p-8 space-y-6">
          <div>
            <h2 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              Exportação e Conclusão
            </h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              Gere o PDF profissional com merge de template e envie para o cliente via WhatsApp.
            </p>
          </div>

          {/* Template Selection */}
          <div className="bg-zinc-50 dark:bg-zinc-800/40 rounded-2xl p-4 border border-zinc-200 dark:border-white/5 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                Template de Fundo / Identidade Visual
              </label>
              <span className="text-[11px] text-zinc-400">
                {templates.length} template(s) cadastrado(s)
              </span>
            </div>

            {templates.length > 0 ? (
              <select
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-800 dark:text-zinc-200"
              >
                <option value="">Layout Padrão PropostasFlow (Sem template base)</option>
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
            ) : (
              <p className="text-xs text-zinc-500">
                Nenhum template PDF carregado. A proposta será gerada com o design vetorial padrão corporativo.
              </p>
            )}
          </div>

          {/* Primary Action Buttons */}
          <div className="grid sm:grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleGeneratePdfAction}
              disabled={pdfGenerating}
              className="py-4 px-6 rounded-2xl bg-[#5b0250] hover:bg-[#47013e] text-white font-black text-sm shadow-lg flex items-center justify-center gap-2.5 transition active:scale-[0.98] disabled:opacity-50"
            >
              <Download className="w-5 h-5" />
              <span>{pdfGenerating ? 'Gerando PDF...' : 'Gerar e Baixar PDF Comercial'}</span>
            </button>

            <button
              type="button"
              onClick={handleCopyWhatsApp}
              className="py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm shadow-lg flex items-center justify-center gap-2.5 transition active:scale-[0.98]"
            >
              <MessageSquare className="w-5 h-5" />
              <span>Copiar Resumo para WhatsApp</span>
            </button>
          </div>

          {/* PDF Live In-Page Preview */}
          {pdfBlobUrl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-zinc-500">
                <span>Pré-visualização do Documento PDF</span>
                <a
                  href={pdfBlobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#5b0250] dark:text-pink-300 hover:underline flex items-center gap-1"
                >
                  <span>Abrir em nova aba</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
              <div className="rounded-2xl overflow-hidden border border-zinc-200 dark:border-white/10 shadow-sm h-[480px]">
                <iframe
                  src={pdfBlobUrl}
                  title="Prévia do PDF"
                  className="w-full h-full bg-white"
                />
              </div>
            </div>
          )}

          {/* Bottom Save & Finish Toolbar */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-white/5">
            <button
              type="button"
              onClick={() => setStep(3)}
              className="px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-white/10 text-xs font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar ao Resumo</span>
            </button>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {editingProposal && (
                <button
                  type="button"
                  onClick={handleSaveAsNewVersion}
                  className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
                  title={`Salvar como Nova Versão (v${(editingProposal.version || 1) + 1}) preservando a versão anterior`}
                >
                  <Copy className="w-4 h-4" />
                  <span>Duplicar como Versão {(editingProposal.version || 1) + 1}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleFinalSave}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>{editingProposal ? 'Salvar Alterações (Atualizar)' : 'Salvar Proposta no Sistema'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
