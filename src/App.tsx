import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Proposal, 
  Product, 
  Emissor, 
  Cliente, 
  PdfTemplate, 
  ProposalStatus, 
  ToastNotification, 
  ConfirmDialogState 
} from './types';
import { PRODUCTS, getProductsMap } from './data/products';
import { generateId, generateWhatsAppText, formatCurrency } from './utils/formatters';
import { generateProposalPdf } from './utils/pdfGenerator';

import { Sidebar, NavTab } from './components/Sidebar';
import { LoginView } from './components/LoginView';
import { DashboardView } from './components/DashboardView';
import { ProposalsListView } from './components/ProposalsListView';
import { ProposalWizard } from './components/ProposalWizard';
import { ClientsView } from './components/ClientsView';
import { IssuersView } from './components/IssuersView';
import { TemplatesView } from './components/TemplatesView';
import { CatalogView } from './components/CatalogView';
import { ConfirmDialog } from './components/ConfirmDialog';
import { ToastContainer } from './components/ToastContainer';
import { TimelineModal } from './components/TimelineModal';

// Storage Keys
const STORAGE_KEYS = {
  PROPOSALS: 'propostasflow_proposals_v2',
  CLIENTS: 'propostasflow_clientes_v2',
  EMISSORES: 'propostasflow_emissores_v2',
  TEMPLATES: 'propostasflow_templates_v2',
  USER_EMAIL: 'propostasflow_user_email_v2',
  THEME: 'propostasflow_theme_mode',
  AUTH_STATUS: 'propostasflow_auth_status_v2',
};

// Default seed data
const DEFAULT_EMISSORES: Emissor[] = [
  {
    id: 'emi-kip-01',
    razao: 'Kip Sistemas em Nuvem LTDA',
    cnpj: '54.524.730/0001-10',
    email: 'contato@krolik.com.br',
    telefone: '(16) 4042-1700',
    endereco: 'Avenida Santa Luzia, 176, Jardim Sumaré, Ribeirão Preto - SP, CEP 14.025-090',
  },
  {
    id: 'emi-telezapy-02',
    razao: 'TELEZAPY SOLUCOES INTELIGENTES LTDA',
    cnpj: '52.318.476/0001-79',
    email: 'contato@krolik.com.br',
    telefone: '(16) 4042-1700',
    endereco: 'Avenida Santa Luzia, 176, Alto da Boa Vista, Ribeirão Preto - SP, 14025-090',
  },
];

const DEFAULT_CLIENTES: Cliente[] = [
  {
    id: 'cli-01',
    empresa: 'Logística Express do Brasil LTDA',
    cnpj: '12.345.678/0001-90',
    contato: 'Roberto Albuquerque',
    email: 'roberto@logexpress.com.br',
    telefone: '(11) 98765-4321',
  },
  {
    id: 'cli-02',
    empresa: 'Hospital São Lucas & Saúde',
    cnpj: '45.123.890/0001-12',
    contato: 'Dra. Mariana Vasconcelos',
    email: 'compras@saolucassaude.com.br',
    telefone: '(11) 97123-5588',
  },
  {
    id: 'cli-03',
    empresa: 'FinTech Metrópole S.A.',
    cnpj: '28.987.654/0001-33',
    contato: 'Carlos Mendes',
    email: 'mendes@metropolefin.com.br',
    telefone: '(11) 99888-1122',
  },
];

const DEFAULT_PROPOSALS: Proposal[] = [
  {
    id: 'prop-seed-1',
    empresa: 'Logística Express do Brasil LTDA',
    cnpj: '12.345.678/0001-90',
    contato: 'Roberto Albuquerque',
    emailContato: 'roberto@logexpress.com.br',
    telefoneContato: '(11) 98765-4321',
    validade: '15 dias',
    status: 'quente',
    emissorId: 'emi-kip-01',
    consideracoes: 'Proposta comercial com condições especiais de implantação. Suporte 24x7 incluído e SLA de 4 horas para atendimento.',
    tcvMeses: 12,
    items: [
      { productId: 'setup', qty: 1, setup: 1500, mrr: 0 },
      { productId: 'srv000100', qty: 25, setup: 0, mrr: 45 },
      { productId: 'srv000101', qty: 4, setup: 0, mrr: 180 },
      { productId: 'telezapy_bot', qty: 1, setup: 0, mrr: 350 },
    ],
    totalSetup: 1500,
    totalMrr: 1845,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    timeline: [
      { date: new Date(Date.now() - 86400000 * 2).toISOString(), action: 'Proposta Criada', notes: 'Enviada apresentação técnica e tabela de ramais.' },
      { date: new Date(Date.now() - 86400000 * 1).toISOString(), action: 'Reunião de Alinhamento', notes: 'Cliente solicitou inclusão do bot de triagem Telezapy.' },
    ],
  },
  {
    id: 'prop-seed-2',
    empresa: 'FinTech Metrópole S.A.',
    cnpj: '28.987.654/0001-33',
    contato: 'Carlos Mendes',
    emailContato: 'mendes@metropolefin.com.br',
    telefoneContato: '(11) 99888-1122',
    validade: '30 dias',
    status: 'ganho',
    emissorId: 'emi-telezapy-02',
    consideracoes: 'Contrato aprovado pelo comitê diretivo. Ativação imediata dos canais E1 / SIP Trunk e ramais softphone.',
    tcvMeses: 24,
    items: [
      { productId: 'setup', qty: 1, setup: 2000, mrr: 0 },
      { productId: 'srv000100', qty: 40, setup: 0, mrr: 42, customMrr: 40 },
      { productId: 'srv000101', qty: 8, setup: 0, mrr: 180 },
      { productId: 'kia_bot_triagem', qty: 1, setup: 0, mrr: 490 },
    ],
    totalSetup: 2000,
    totalMrr: 3530,
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    timeline: [
      { date: new Date(Date.now() - 86400000 * 7).toISOString(), action: 'Proposta Criada' },
      { date: new Date(Date.now() - 86400000 * 3).toISOString(), action: 'Negociação de Volume', notes: 'Desconto concedido no valor unitário do ramal.' },
      { date: new Date(Date.now() - 86400000 * 1).toISOString(), action: 'Marcado como Ganho', notes: 'Contrato assinado digitalmente!' },
    ],
  },
  {
    id: 'prop-seed-3',
    empresa: 'Hospital São Lucas & Saúde',
    cnpj: '45.123.890/0001-12',
    contato: 'Dra. Mariana Vasconcelos',
    emailContato: 'compras@saolucassaude.com.br',
    telefoneContato: '(11) 97123-5588',
    validade: '15 dias',
    status: 'morno',
    emissorId: 'emi-kip-01',
    consideracoes: 'Projeto de central telefônica em alta disponibilidade para agendamento de consultas e exames.',
    tcvMeses: 12,
    items: [
      { productId: 'setup', qty: 1, setup: 800, mrr: 0 },
      { productId: '0800_nacional', qty: 1, setup: 150, mrr: 99 },
      { productId: 'canal_0800_ilimitado', qty: 2, setup: 0, mrr: 280 },
      { productId: 'ramal_teletrabalho', qty: 12, setup: 0, mrr: 35 },
    ],
    totalSetup: 950,
    totalMrr: 1079,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    timeline: [
      { date: new Date(Date.now() - 86400000 * 4).toISOString(), action: 'Proposta Criada' },
    ],
  },
];

export default function App() {
  const productsMap = useMemo(() => getProductsMap(), []);

  // State Management
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [proposalsFilter, setProposalsFilter] = useState<string>('todas');
  const [editingProposal, setEditingProposal] = useState<Proposal | null>(null);

  // Core Data
  const [proposals, setProposals] = useState<Proposal[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROPOSALS);
      return saved ? JSON.parse(saved) : DEFAULT_PROPOSALS;
    } catch {
      return DEFAULT_PROPOSALS;
    }
  });

  const [clientes, setClientes] = useState<Cliente[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      return saved ? JSON.parse(saved) : DEFAULT_CLIENTES;
    } catch {
      return DEFAULT_CLIENTES;
    }
  });

  const [emissores, setEmissores] = useState<Emissor[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EMISSORES);
      if (saved) {
        const parsed: Emissor[] = JSON.parse(saved);
        const hasKip = parsed.some(e => e.cnpj.replace(/\D/g, '') === '54524730000110');
        const hasTelezapy = parsed.some(e => e.cnpj.replace(/\D/g, '') === '52318476000179');
        if (hasKip && hasTelezapy) {
          return parsed;
        }
        // Ensure both default emissores are present alongside any user-created emissores
        const merged = [...DEFAULT_EMISSORES];
        parsed.forEach(p => {
          const digits = p.cnpj.replace(/\D/g, '');
          if (digits !== '54524730000110' && digits !== '52318476000179' && p.id !== 'emi-krolik-01') {
            merged.push(p);
          }
        });
        localStorage.setItem(STORAGE_KEYS.EMISSORES, JSON.stringify(merged));
        return merged;
      }
      return DEFAULT_EMISSORES;
    } catch {
      return DEFAULT_EMISSORES;
    }
  });

  const [templates, setTemplates] = useState<PdfTemplate[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [userEmail, setUserEmail] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEYS.USER_EMAIL) || 'comercial@krolik.com.br';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AUTH_STATUS);
      return stored !== 'false';
    } catch {
      return true;
    }
  });

  // Theme Management (Light / Dark Mode)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'dark' || saved === 'light') return saved;
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } catch (e) {
      console.error('Error applying theme', e);
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => {
      const nextTheme = prev === 'dark' ? 'light' : 'dark';
      notify(`Modo ${nextTheme === 'dark' ? 'Escuro' : 'Claro'} ativado.`, 'info');
      return nextTheme;
    });
  };

  // UI Modals & Toasts
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const [confirmState, setConfirmState] = useState<ConfirmDialogState>({ open: false, title: '', desc: '' });
  const [timelineProposal, setTimelineProposal] = useState<Proposal | null>(null);

  // Sync to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.PROPOSALS, JSON.stringify(proposals));
    } catch (e) {
      console.error('Error saving proposals to localStorage', e);
    }
  }, [proposals]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clientes));
    } catch (e) {
      console.error('Error saving clientes to localStorage', e);
    }
  }, [clientes]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EMISSORES, JSON.stringify(emissores));
    } catch (e) {
      console.error('Error saving emissores to localStorage', e);
    }
  }, [emissores]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
    } catch (e) {
      console.error('Error saving templates to localStorage', e);
    }
  }, [templates]);

  // Notifications
  const notify = (msg: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Status Change Handler with Celebration
  const handleStatusChange = (proposal: Proposal, newStatus: ProposalStatus, reason?: string) => {
    const isNowWon = newStatus === 'ganho' && proposal.status !== 'ganho';
    const isNowLost = newStatus === 'perdido' && proposal.status !== 'perdido';

    let actionLabel = `Status alterado para ${newStatus.toUpperCase()}`;
    if (isNowWon) actionLabel = 'Marcado como Ganho';
    if (isNowLost) actionLabel = 'Marcado como Perdido';

    const newTimelineEvent = {
      date: new Date().toISOString(),
      action: actionLabel,
      notes: reason || (isNowWon ? 'Proposta aprovada pelo cliente!' : undefined),
    };

    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== proposal.id) return p;
        return {
          ...p,
          status: newStatus,
          timeline: [...(p.timeline || []), newTimelineEvent],
        };
      })
    );

    if (isNowWon) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#5b0250', '#10b981', '#f59e0b', '#ec4899', '#3b82f6'],
      });
      notify(`Proposta "${proposal.empresa}" marcada como Ganho com sucesso.`, 'success');
    } else if (isNowLost) {
      notify(`Proposta "${proposal.empresa}" marcada como Perdido.`, 'info');
    } else {
      notify(`Status da proposta atualizado para ${newStatus}.`, 'success');
    }
  };

  // Generate & Download PDF
  const handleGeneratePdf = async (proposal: Proposal) => {
    try {
      const currentEmissor = emissores.find((e) => e.id === proposal.emissorId) || emissores[0];
      const currentTemplate = templates[0] || null;

      const { url } = await generateProposalPdf(proposal, productsMap, currentEmissor, currentTemplate);

      const link = document.createElement('a');
      link.href = url;
      link.download = `Proposta_${proposal.empresa.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`;
      link.click();

      notify('PDF comercial gerado com sucesso!', 'success');
    } catch (err) {
      console.error(err);
      notify('Erro ao gerar o PDF da proposta.', 'error');
    }
  };

  // Share via WhatsApp
  const handleShareWhatsApp = (proposal: Proposal) => {
    const currentEmissor = emissores.find((e) => e.id === proposal.emissorId) || emissores[0];
    const text = generateWhatsAppText(proposal, productsMap, currentEmissor);

    navigator.clipboard?.writeText(text);

    // If client has phone, open wa.me
    if (proposal.telefoneContato) {
      const cleanPhone = proposal.telefoneContato.replace(/\D/g, '');
      const fullPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone;
      window.open(`https://wa.me/${fullPhone}?text=${encodeURIComponent(text)}`, '_blank');
      notify('Texto copiado e WhatsApp Web aberto!', 'success');
    } else {
      notify('Texto comercial copiado para a Área de Transferência.', 'success');
    }
  };

  // Proposal Edit & Save
  const handleEditProposal = (proposal: Proposal) => {
    setEditingProposal(proposal);
    setCurrentTab('nova');
  };

  const handleDuplicateVersion = (proposal: Proposal) => {
    const currentVersion = proposal.version || 1;
    const nextVersion = currentVersion + 1;
    const newId = generateId();

    // 1. Log version creation in original proposal's timeline for commercial audit
    setProposals((prev) =>
      prev.map((p) => {
        if (p.id !== proposal.id) return p;
        return {
          ...p,
          timeline: [
            ...(p.timeline || []),
            {
              date: new Date().toISOString(),
              action: 'Versão Derivada Criada',
              notes: `Duplicada como nova versão v${nextVersion} (#${newId.slice(0, 6)}). Registro anterior mantido para auditoria.`,
            },
          ],
        };
      })
    );

    // 2. Insert cloned proposal with incremented version
    const clonedProposal: Proposal = {
      ...proposal,
      id: newId,
      version: nextVersion,
      parentProposalId: proposal.id,
      createdAt: new Date().toISOString(),
      updatedAt: undefined,
      timeline: [
        {
          date: new Date().toISOString(),
          action: `Nova Versão Criada (v${nextVersion})`,
          notes: `Derivada da versão v${currentVersion} (#${proposal.id.slice(0, 6)}) para revisão comercial. Auditoria preservada.`,
        },
      ],
    };

    setProposals((prev) => [clonedProposal, ...prev]);
    notify(`Proposta #${proposal.id.slice(0, 6)} duplicada como Nova Versão (v${nextVersion})!`, 'success');
  };

  const handleSaveProposal = (
    proposalData: Omit<Proposal, 'id' | 'createdAt' | 'timeline'> & { id?: string },
    isNewVersion?: boolean
  ) => {
    if (proposalData.id && !isNewVersion) {
      // Direct update of existing version
      setProposals((prev) =>
        prev.map((p) => {
          if (p.id !== proposalData.id) return p;
          return {
            ...p,
            ...proposalData,
            updatedAt: new Date().toISOString(),
            timeline: [
              ...(p.timeline || []),
              {
                date: new Date().toISOString(),
                action: 'Proposta Editada',
                notes: `Valores atualizados: Setup ${formatCurrency(proposalData.totalSetup)} | MRR ${formatCurrency(proposalData.totalMrr)}`,
              },
            ],
          };
        })
      );
      notify('Proposta atualizada com sucesso!', 'success');
    } else if (proposalData.id && isNewVersion) {
      // Save changes as a new version, preserving the old version for audit!
      const original = proposals.find((p) => p.id === proposalData.id);
      const originalVersion = original?.version || 1;
      const nextVersion = originalVersion + 1;
      const newId = generateId();

      // Audit entry in original
      setProposals((prev) =>
        prev.map((p) => {
          if (p.id !== proposalData.id) return p;
          return {
            ...p,
            timeline: [
              ...(p.timeline || []),
              {
                date: new Date().toISOString(),
                action: 'Versão Derivada Criada',
                notes: `Criada nova versão (v${nextVersion} - #${newId.slice(0, 6)}) preservando registro original.`,
              },
            ],
          };
        })
      );

      // Create new proposal version
      const newProposal: Proposal = {
        ...proposalData,
        id: newId,
        version: nextVersion,
        parentProposalId: proposalData.id,
        createdAt: new Date().toISOString(),
        timeline: [
          {
            date: new Date().toISOString(),
            action: `Nova Versão Criada (v${nextVersion})`,
            notes: `Gerada a partir da versão v${originalVersion} (#${proposalData.id.slice(0, 6)}) com alterações salvas. Auditoria preservada.`,
          },
        ],
      };

      setProposals((prev) => [newProposal, ...prev]);
      notify(`Nova versão (v${nextVersion}) gerada com sucesso! A versão v${originalVersion} foi preservada no histórico.`, 'success');
    } else {
      // Create brand new proposal
      const newProposal: Proposal = {
        ...proposalData,
        id: generateId(),
        version: 1,
        createdAt: new Date().toISOString(),
        timeline: [
          {
            date: new Date().toISOString(),
            action: 'Proposta Criada',
            notes: 'Orçamento gerado e salvo no pipeline comercial.',
          },
        ],
      };
      setProposals((prev) => [newProposal, ...prev]);

      // If client not registered yet, auto-register
      const existingCli = clientes.find((c) => c.empresa.toLowerCase() === newProposal.empresa.toLowerCase());
      if (!existingCli) {
        setClientes((prev) => [
          ...prev,
          {
            id: generateId(),
            empresa: newProposal.empresa,
            cnpj: newProposal.cnpj,
            contato: newProposal.contato,
            email: newProposal.emailContato,
            telefone: newProposal.telefoneContato,
          },
        ]);
      }

      notify('Nova proposta cadastrada com sucesso.', 'success');
    }

    setEditingProposal(null);
    setCurrentTab('propostas');
  };

  // Delete Proposal
  const handleDeleteProposal = (proposalId: string) => {
    const prop = proposals.find((p) => p.id === proposalId);
    setConfirmState({
      open: true,
      title: 'Excluir Proposta Comercial',
      desc: `Tem certeza de que deseja remover a proposta de "${prop?.empresa || 'este cliente'}"? Esta ação não pode ser desfeita.`,
      confirmText: 'Excluir Proposta',
      isDestructive: true,
      onConfirm: () => {
        setProposals((prev) => prev.filter((p) => p.id !== proposalId));
        notify('Proposta excluída com sucesso.', 'info');
      },
    });
  };

  // Client actions
  const handleAddCliente = (cli: Cliente) => setClientes((prev) => [cli, ...prev]);
  const handleUpdateCliente = (cli: Cliente) => setClientes((prev) => prev.map((c) => (c.id === cli.id ? cli : c)));
  const handleDeleteCliente = (id: string) => {
    setConfirmState({
      open: true,
      title: 'Excluir Cliente',
      desc: 'Deseja remover este cliente? Propostas já associadas continuarão salvas no histórico.',
      isDestructive: true,
      onConfirm: () => {
        setClientes((prev) => prev.filter((c) => c.id !== id));
        notify('Cliente excluído.', 'info');
      },
    });
  };

  const handleCreateProposalForClient = (cliente: Cliente) => {
    setEditingProposal({
      id: '',
      empresa: cliente.empresa,
      cnpj: cliente.cnpj,
      contato: cliente.contato,
      emailContato: cliente.email,
      telefoneContato: cliente.telefone,
      validade: '15 dias',
      status: 'quente',
      emissorId: emissores[0]?.id || '',
      consideracoes: 'Proposta comercial com condições de telefonia e serviços em nuvem.',
      tcvMeses: 12,
      items: [{ productId: 'setup', qty: 1, setup: 500, mrr: 0 }],
      totalSetup: 500,
      totalMrr: 0,
      createdAt: new Date().toISOString(),
      timeline: [],
    });
    setCurrentTab('nova');
  };

  // Emissor actions
  const handleAddEmissor = (emi: Emissor) => setEmissores((prev) => [...prev, emi]);
  const handleUpdateEmissor = (emi: Emissor) => setEmissores((prev) => prev.map((e) => (e.id === emi.id ? emi : e)));
  const handleDeleteEmissor = (id: string) => {
    setConfirmState({
      open: true,
      title: 'Excluir Emissor',
      desc: 'Tem certeza de que deseja remover esta empresa emissora?',
      isDestructive: true,
      onConfirm: () => {
        setEmissores((prev) => prev.filter((e) => e.id !== id));
        notify('Emissor removido.', 'info');
      },
    });
  };

  // Template actions
  const handleAddTemplate = (tpl: PdfTemplate) => setTemplates((prev) => [tpl, ...prev]);
  const handleDeleteTemplate = (id: string) => {
    setConfirmState({
      open: true,
      title: 'Excluir Template PDF',
      desc: 'Deseja remover este template de fundo?',
      isDestructive: true,
      onConfirm: () => {
        setTemplates((prev) => prev.filter((t) => t.id !== id));
        notify('Template removido.', 'info');
      },
    });
  };

  // Start proposal from catalog
  const handleStartProposalWithProduct = (product: Product) => {
    setEditingProposal({
      id: '',
      empresa: '',
      cnpj: '',
      contato: '',
      emailContato: '',
      telefoneContato: '',
      validade: '15 dias',
      status: 'quente',
      emissorId: emissores[0]?.id || '',
      consideracoes: 'Proposta comercial personalizada.',
      tcvMeses: 12,
      items: [
        { productId: 'setup', qty: 1, setup: product.setup > 0 ? product.setup : 500, mrr: 0 },
        { productId: product.id, qty: 1, setup: product.setup, mrr: product.mrr },
      ],
      totalSetup: (product.setup > 0 ? product.setup : 500) + product.setup,
      totalMrr: product.mrr,
      createdAt: new Date().toISOString(),
      timeline: [],
    });
    setCurrentTab('nova');
  };

  // Authentication Handlers
  const handleLogout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem(STORAGE_KEYS.AUTH_STATUS, 'false');
    } catch (e) {
      console.error(e);
    }
    notify('Sessão encerrada com sucesso.', 'info');
  };

  const handleLogin = (email: string) => {
    setUserEmail(email);
    setIsAuthenticated(true);
    try {
      localStorage.setItem(STORAGE_KEYS.USER_EMAIL, email);
      localStorage.setItem(STORAGE_KEYS.AUTH_STATUS, 'true');
    } catch (e) {
      console.error(e);
    }
    notify(`Bem-vindo, ${email}`, 'success');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 font-sans">
        <LoginView
          onLogin={handleLogin}
          defaultEmail={userEmail}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf8f9] dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col lg:flex-row font-sans selection:bg-[#5b0250]/20 selection:text-[#5b0250]">
      {/* Sidebar with custom stylized scrollbar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={(tab) => {
          if (tab === 'nova') setEditingProposal(null);
          setCurrentTab(tab);
        }}
        userEmail={userEmail}
        onLogout={handleLogout}
        proposalsCount={proposals.length}
        productsCount={PRODUCTS.length}
        theme={theme}
        onToggleTheme={handleToggleTheme}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col lg:h-screen lg:overflow-y-auto">
        <main className="flex-1 max-w-[1500px] w-full mx-auto p-3 sm:p-6 lg:p-8">
          {currentTab === 'dashboard' && (
            <DashboardView
              proposals={proposals}
              productsMap={productsMap}
              emissores={emissores}
              onStatusChange={handleStatusChange}
              onGeneratePdf={handleGeneratePdf}
              onShareWhatsApp={handleShareWhatsApp}
              onEdit={handleEditProposal}
              onDelete={handleDeleteProposal}
              onViewTimeline={setTimelineProposal}
              onDuplicateVersion={handleDuplicateVersion}
              onNavigateToNew={() => {
                setEditingProposal(null);
                setCurrentTab('nova');
              }}
              onNavigateToProposals={(status) => {
                if (status) setProposalsFilter(status);
                setCurrentTab('propostas');
              }}
              onNavigateToKanban={() => {
                try {
                  localStorage.setItem('krolik_proposals_view', 'kanban');
                } catch (e) {
                  console.error(e);
                }
                setCurrentTab('propostas');
              }}
              onNavigateToTemplates={() => setCurrentTab('templates')}
            />
          )}

          {currentTab === 'nova' && (
            <ProposalWizard
              products={PRODUCTS}
              productsMap={productsMap}
              emissores={emissores}
              clientes={clientes}
              templates={templates}
              editingProposal={editingProposal}
              onSaveProposal={handleSaveProposal}
              onCancel={() => {
                setEditingProposal(null);
                setCurrentTab('dashboard');
              }}
              onNotify={notify}
            />
          )}

          {currentTab === 'propostas' && (
            <ProposalsListView
              proposals={proposals}
              productsMap={productsMap}
              emissores={emissores}
              initialFilter={proposalsFilter}
              onStatusChange={handleStatusChange}
              onGeneratePdf={handleGeneratePdf}
              onShareWhatsApp={handleShareWhatsApp}
              onEdit={handleEditProposal}
              onDelete={handleDeleteProposal}
              onViewTimeline={setTimelineProposal}
              onDuplicateVersion={handleDuplicateVersion}
              onNavigateToNew={() => {
                setEditingProposal(null);
                setCurrentTab('nova');
              }}
            />
          )}

          {currentTab === 'clientes' && (
            <ClientsView
              clientes={clientes}
              proposals={proposals}
              onAddCliente={handleAddCliente}
              onUpdateCliente={handleUpdateCliente}
              onDeleteCliente={handleDeleteCliente}
              onCreateProposalForClient={handleCreateProposalForClient}
              onNotify={notify}
            />
          )}

          {currentTab === 'emissores' && (
            <IssuersView
              emissores={emissores}
              onAddEmissor={handleAddEmissor}
              onUpdateEmissor={handleUpdateEmissor}
              onDeleteEmissor={handleDeleteEmissor}
              onNotify={notify}
            />
          )}

          {currentTab === 'templates' && (
            <TemplatesView
              templates={templates}
              onAddTemplate={handleAddTemplate}
              onDeleteTemplate={handleDeleteTemplate}
              onNotify={notify}
            />
          )}

          {currentTab === 'catalogo' && (
            <CatalogView
              products={PRODUCTS}
              onStartProposalWithProduct={handleStartProposalWithProduct}
            />
          )}
        </main>
      </div>

      {/* Global Modals & Notifications */}
      <ConfirmDialog state={confirmState} onClose={() => setConfirmState((p) => ({ ...p, open: false }))} />
      <TimelineModal proposal={timelineProposal} onClose={() => setTimelineProposal(null)} />
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
