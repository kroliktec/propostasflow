export interface Product {
  id: string;
  name: string;
  desc: string;
  category: string;
  setup: number;
  mrr: number;
  periodicidade: string;
  codigo: string;
}

export interface ProposalItem {
  productId: string;
  qty: number;
  setup: number;
  mrr: number;
  customSetup?: number;
  customMrr?: number;
}

export type ProposalStatus = 'quente' | 'morno' | 'frio' | 'ganho' | 'perdido';

export interface ProposalTimelineEvent {
  date: string;
  action: string;
  notes?: string;
}

export interface Proposal {
  id: string;
  empresa: string;
  cnpj: string;
  contato: string;
  emailContato: string;
  telefoneContato?: string;
  validade: string;
  consideracoes: string;
  emissorId: string;
  status: ProposalStatus;
  items: ProposalItem[];
  totalSetup: number;
  totalMrr: number;
  createdAt: string;
  updatedAt?: string;
  timeline: ProposalTimelineEvent[];
  tcvMeses?: number;
  lossReason?: string;
  version?: number;
  parentProposalId?: string;
  code?: string;
}

export interface PdfTemplate {
  id: string;
  name: string;
  pdfBase64: string;
  base64?: string;
  createdAt: string;
  sizeBytes?: number;
  pageCount?: number;
  sizeKb?: number;
  uploadedAt?: string;
}

export interface Emissor {
  id: string;
  razao: string;
  cnpj: string;
  email?: string;
  telefone?: string;
  endereco?: string;
}

export interface Cliente {
  id: string;
  empresa: string;
  cnpj: string;
  contato: string;
  email: string;
  telefone?: string;
}

export interface ToastNotification {
  id: string;
  msg: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface ConfirmDialogState {
  open: boolean;
  title: string;
  desc: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm?: () => void;
}
